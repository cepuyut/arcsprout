import { NextRequest, NextResponse } from 'next/server';
import { JsonRpcProvider, Wallet, keccak256, solidityPacked, getBytes, randomBytes, ethers } from 'ethers';

const AI_ORACLE_PK = process.env.AI_ORACLE_PRIVATE_KEY;
const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS;
const ARC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.arc.network';
const ACTIVITY_LOOKBACK_BLOCKS = 512;

type WalletSignals = {
  txCount: number;
  arcTxCount: number;
  nativeBalance: number;
  walletAgeDays: number;
};

function calculateScore(history: WalletSignals) {
  let score = 0;
  score += history.arcTxCount > 0 ? 25 : 0;
  score += Math.min(history.arcTxCount || 0, 20);
  score += (history.nativeBalance || 0) > 0 ? 20 : 0;
  score += Math.min(history.txCount || 0, 100) / 5;
  score += Math.floor(Math.min(history.walletAgeDays || 0, 365) * 100 / 365);
  return Math.min(Math.floor(score), 100);
}

async function collectWalletSignals(walletAddr: string): Promise<WalletSignals> {
  const provider = new JsonRpcProvider(ARC_RPC_URL);
  const wallet = walletAddr.toLowerCase();

  const [balanceWei, txCount, latestBlockNumber] = await Promise.all([
    provider.getBalance(walletAddr),
    provider.getTransactionCount(walletAddr),
    provider.getBlockNumber(),
  ]);

  const latestBlockHex = `0x${latestBlockNumber.toString(16)}`;
  const latestBlock = await provider.send('eth_getBlockByNumber', [
    latestBlockHex,
    true,
  ]);
  const latestTimestamp = latestBlock?.timestamp
    ? Number(latestBlock.timestamp)
    : Math.floor(Date.now() / 1000);
  const startBlock = Math.max(0, latestBlockNumber - ACTIVITY_LOOKBACK_BLOCKS);

  let arcTxCount = 0;
  let firstActivityTimestamp: number | null = null;

  for (let blockNumber = latestBlockNumber; blockNumber >= startBlock; blockNumber--) {
    const block = await provider.send('eth_getBlockByNumber', [
      `0x${blockNumber.toString(16)}`,
      true,
    ]);
    if (!block?.transactions?.length) continue;

    for (const tx of block.transactions) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();

      if (from === wallet || to === wallet) {
        arcTxCount += 1;
        if (firstActivityTimestamp === null) {
          firstActivityTimestamp = Number(block.timestamp);
        }
      }
    }

    if (arcTxCount >= 20) {
      break;
    }
  }

  const walletAgeDays = firstActivityTimestamp
    ? Math.max(0, Math.floor((latestTimestamp - firstActivityTimestamp) / 86_400))
    : 0;

  return {
    txCount,
    arcTxCount,
    nativeBalance: Number(ethers.formatEther(balanceWei)),
    walletAgeDays,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!AI_ORACLE_PK || !AI_ORACLE_ADDRESS || AI_ORACLE_PK === '0x...') {
      return NextResponse.json({ error: 'AI_ORACLE_PRIVATE_KEY or AI_ORACLE_ADDRESS not set' }, { status: 500 });
    }

    const body = await request.json();
    const walletAddr = body?.wallet;
    const { score: bodyScore, nonce, signature } = body || {};

    // prepare evaluation from history OR accepted signed payload
    if (!walletAddr) {
      return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
    }

    if (bodyScore && nonce && signature) {
      const expectedHash = keccak256(
        solidityPacked(
          ['string', 'address', 'uint8', 'bytes32'],
          ['ARC_SPROUT_V1', walletAddr, bodyScore, nonce]
        )
      );

      try {
        const recovered = ethers.verifyMessage(getBytes(expectedHash), signature);
        if (recovered.toLowerCase() !== AI_ORACLE_ADDRESS?.toLowerCase()) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json({ error: 'Signature verify failed: ' + err.message }, { status: 400 });
      }

      // The contract requires `msg.sender === walletAddr`, so the frontend
      // must submit the mint transaction from the connected wallet.
      return NextResponse.json({ score: bodyScore, nonce, signature, ok: true });
    }

    const history = await collectWalletSignals(walletAddr);

    const score = calculateScore(history);

    if (score < 60) {
      return NextResponse.json({
        score,
        signals: history,
        reason: `Score too low. Arc tx: ${history.arcTxCount}, Total tx: ${history.txCount}, Native balance: ${history.nativeBalance}, Age: ${history.walletAgeDays}d`,
        actions: ['Make a small Arc Testnet transaction', 'Return after more wallet activity', 'Keep building recent onchain history']
      });
    }

    const signer = new Wallet(AI_ORACLE_PK);
    const newNonce = keccak256(getBytes(randomBytes(32)));
    const structHash = keccak256(
      solidityPacked(
        ['string', 'address', 'uint8', 'bytes32'],
        ['ARC_SPROUT_V1', walletAddr, score, newNonce]
      )
    );
    const sig = await signer.signMessage(getBytes(structHash));

    return NextResponse.json({ score, nonce: newNonce, signature: sig, signals: history });
  } catch (err: any) {
    console.error('/evaluate error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
