import { NextRequest, NextResponse } from 'next/server';
import { Wallet, keccak256, solidityPacked, getBytes, randomBytes } from 'ethers';

const AI_ORACLE_PK = process.env.AI_ORACLE_PRIVATE_KEY;
const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS;

function calculateScore(history: any) {
  let score = 0;
  score += history.arcTxCount > 0 ? 20 : 0;
  score += Math.min(history.arcTxCount || 0, 20);
  score += (history.usdcBalance || 0) > 0 ? 20 : 0;
  score += Math.min(history.txCount || 0, 150) / 10;
  score += Math.floor(Math.min(history.walletAgeDays || 0, 365) * 100 / 2430);
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

    if (!walletAddr || !history) {
      return NextResponse.json({ error: 'Missing wallet or history' }, { status: 400 });
    }

    const score = calculateScore(history);

    if (score < 60) {
      return NextResponse.json({
        score,
        reason: `Score too low. Arc tx: ${history.arcTxCount}, Total tx: ${history.txCount}, USDC: ${history.usdcBalance}, Age: ${history.walletAgeDays}d`,
        actions: ['Swap 10 USDC on ArcSwap', 'Bridge from Sepolia', 'Wait for wallet to age']
      });
    }

    const signer = new Wallet(AI_ORACLE_PK);
    const nonce = keccak256(getBytes(randomBytes(32)));
    const structHash = keccak256(
      solidityPacked(
        ['string', 'address', 'uint8', 'bytes32'],
        ['ARC_SPROUT_V1', walletAddr, score, nonce]
      )
    );
    const sig = await signer.signMessage(getBytes(structHash));

    return NextResponse.json({ score, nonce, signature: sig });
  } catch (err: any) {
    console.error('/evaluate error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
