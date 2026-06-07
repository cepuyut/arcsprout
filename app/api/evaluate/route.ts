import { NextRequest, NextResponse } from 'next/server';
import { Wallet, keccak256, solidityPacked, getBytes, randomBytes, JsonRpcProvider, ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '@/lib/contract';

const AI_ORACLE_PK = process.env.AI_ORACLE_PRIVATE_KEY;
const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS;
const ARC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.arc.network';

function calculateScore(history: any) {
  let score = 0;
  score += history.arcTxCount > 0 ? 25 : 0;
  score += Math.min(history.arcTxCount || 0, 20);
  score += (history.usdcBalance || 0) > 0 ? 20 : 0;
  score += Math.min(history.txCount || 0, 100) / 5;
  score += Math.floor(Math.min(history.walletAgeDays || 0, 365) * 100 / 365);
  return Math.min(Math.floor(score), 100);
}

export async function POST(request: NextRequest) {
  try {
    if (!AI_ORACLE_PK || !AI_ORACLE_ADDRESS || AI_ORACLE_PK === '0x...') {
      return NextResponse.json({ error: 'AI_ORACLE_PRIVATE_KEY or AI_ORACLE_ADDRESS not set' }, { status: 500 });
    }

    const body = await request.json();
    const walletAddr = body?.wallet;
    const history = body?.history;
    const { score: bodyScore, nonce, signature } = body || {};

    // prepare evaluation from history OR accepted signed payload
    if (!walletAddr) {
      return NextResponse.json({ error: 'Missing wallet' }, { status: 400 });
    }

    if (bodyScore && nonce && signature) {
      const signer = new Wallet(AI_ORACLE_PK);
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

      const provider = new JsonRpcProvider(ARC_RPC_URL);
      const oracleWallet = new Wallet(AI_ORACLE_PK, provider);

      const mintData = new ethers.Interface(CONTRACT_ABI).encodeFunctionData('mintSeed', [
        walletAddr,
        bodyScore,
        nonce,
        signature,
      ]);

      const mintTx = await oracleWallet.sendTransaction({
        to: CONTRACT_ADDRESS,
        data: mintData,
        gasLimit: 300_000,
      });

      const receipt = await mintTx.wait();
      return NextResponse.json({ score: bodyScore, nonce, signature, txHash: receipt?.hash || mintTx.hash, ok: true });
    }

    if (!history) {
      return NextResponse.json({ error: 'Missing history' }, { status: 400 });
    }

    const score = calculateScore(history);

    if (score < 40) {
      return NextResponse.json({
        score,
        reason: `Score too low. Arc tx: ${history.arcTxCount}, Total tx: ${history.txCount}, USDC: ${history.usdcBalance}, Age: ${history.walletAgeDays}d`,
        actions: ['Swap 10 USDC on ArcSwap', 'Bridge from Sepolia', 'Wait for wallet to age']
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

    return NextResponse.json({ score, nonce: newNonce, signature: sig });
  } catch (err: any) {
    console.error('/evaluate error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
