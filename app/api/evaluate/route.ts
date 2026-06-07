import { NextRequest, NextResponse } from 'next/server';
import {
  JsonRpcProvider,
  Wallet,
  keccak256,
  solidityPacked,
  getBytes,
  randomBytes,
  ethers,
} from 'ethers';

const AI_ORACLE_PK = process.env.AI_ORACLE_PRIVATE_KEY;
const AI_ORACLE_ADDRESS = process.env.AI_ORACLE_ADDRESS;
const ARC_RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.arc.network';
const ACTIVITY_LOOKBACK_BLOCKS = 512;
const SCORE_THRESHOLD = 60;

type WalletSignals = {
  txCount: number;
  arcTxCount: number;
  nativeBalance: number;
  walletAgeDays: number;
  activeDays: number;
};

type ScoreBreakdown = {
  arcPresence: number;
  retention: number;
  economicParticipation: number;
  alignment: number;
  qualityGuard: number;
  total: number;
  threshold: number;
  eligible: boolean;
};

function clamp(value: number, max: number) {
  return Math.min(Math.max(Math.floor(value), 0), max);
}

function scoreArcPresence(history: WalletSignals) {
  let score = 0;
  if (history.arcTxCount >= 1) score += 10;
  if (history.arcTxCount >= 5) score += 5;
  if (history.arcTxCount >= 10) score += 5;
  if (history.arcTxCount >= 20) score += 5;
  return clamp(score, 25);
}

function scoreRetention(history: WalletSignals) {
  let score = 0;
  if (history.activeDays >= 2) score += 5;
  if (history.activeDays >= 5) score += 5;
  if (history.activeDays >= 10) score += 5;
  if (history.walletAgeDays >= 30) score += 5;
  return clamp(score, 20);
}

function scoreEconomicParticipation(history: WalletSignals) {
  let score = 0;
  if (history.arcTxCount >= 1) score += 5;
  if (history.nativeBalance > 0) score += 5;
  if (history.txCount >= 5) score += 5;
  if (history.walletAgeDays >= 7) score += 5;
  if (history.walletAgeDays >= 30) score += 5;
  return clamp(score, 25);
}

function scoreAlignment(history: WalletSignals) {
  let score = 0;
  if (history.activeDays >= 5) score += 5;
  if (history.arcTxCount >= 5) score += 5;
  if (history.walletAgeDays >= 14) score += 5;
  return clamp(score, 15);
}

function scoreQualityGuard(history: WalletSignals) {
  let score = 0;
  const txPerArc = history.arcTxCount > 0 ? history.txCount / history.arcTxCount : history.txCount;

  if (history.arcTxCount > 0 && txPerArc <= 10) score += 5;
  if (history.activeDays >= 2) score += 5;
  if (history.arcTxCount >= 3 && history.nativeBalance > 0) score += 5;
  return clamp(score, 15);
}

function calculateScore(history: WalletSignals): ScoreBreakdown {
  const arcPresence = scoreArcPresence(history);
  const retention = scoreRetention(history);
  const economicParticipation = scoreEconomicParticipation(history);
  const alignment = scoreAlignment(history);
  const qualityGuard = scoreQualityGuard(history);
  const total = clamp(
    arcPresence + retention + economicParticipation + alignment + qualityGuard,
    100
  );

  return {
    arcPresence,
    retention,
    economicParticipation,
    alignment,
    qualityGuard,
    total,
    threshold: SCORE_THRESHOLD,
    eligible: total >= SCORE_THRESHOLD,
  };
}

function buildActions(history: WalletSignals, breakdown: ScoreBreakdown) {
  const actions: string[] = [];

  if (breakdown.arcPresence < 25) {
    actions.push('Make a few real Arc transactions');
  }
  if (breakdown.retention < 20) {
    actions.push('Return on more active days');
  }
  if (breakdown.economicParticipation < 25) {
    actions.push('Use more Arc ecosystem actions');
  }
  if (history.nativeBalance <= 0) {
    actions.push('Keep a small ARC balance for continued activity');
  }
  if (history.arcTxCount < 3) {
    actions.push('Bridge in and explore Arc again after a few days');
  }

  return Array.from(new Set(actions)).slice(0, 4);
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
  const activeDays = new Set<string>();

  for (let blockNumber = latestBlockNumber; blockNumber >= startBlock; blockNumber -= 1) {
    const block = await provider.send('eth_getBlockByNumber', [
      `0x${blockNumber.toString(16)}`,
      true,
    ]);
    if (!block?.transactions?.length) continue;

    const dayKey = new Date(Number(block.timestamp) * 1000).toISOString().slice(0, 10);
    let blockTouchedWallet = false;

    for (const tx of block.transactions) {
      const from = tx.from?.toLowerCase();
      const to = tx.to?.toLowerCase();

      if (from === wallet || to === wallet) {
        arcTxCount += 1;
        blockTouchedWallet = true;
        if (firstActivityTimestamp === null) {
          firstActivityTimestamp = Number(block.timestamp);
        }
      }
    }

    if (blockTouchedWallet) {
      activeDays.add(dayKey);
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
    activeDays: activeDays.size,
  };
}

export async function POST(request: NextRequest) {
  try {
    if (!AI_ORACLE_PK || !AI_ORACLE_ADDRESS || AI_ORACLE_PK === '0x...') {
      return NextResponse.json(
        { error: 'AI_ORACLE_PRIVATE_KEY or AI_ORACLE_ADDRESS not set' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const walletAddr = body?.wallet;
    const { score: bodyScore, nonce, signature } = body || {};

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
        if (recovered.toLowerCase() !== AI_ORACLE_ADDRESS.toLowerCase()) {
          return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
        }
      } catch (err: any) {
        return NextResponse.json(
          { error: 'Signature verify failed: ' + err.message },
          { status: 400 }
        );
      }

      return NextResponse.json({ score: bodyScore, nonce, signature, ok: true });
    }

    const signals = await collectWalletSignals(walletAddr);
    const breakdown = calculateScore(signals);
    const actions = buildActions(signals, breakdown);
    const missingSignals = [
      breakdown.arcPresence < 25 ? 'Arc presence' : null,
      breakdown.retention < 20 ? 'Retention over time' : null,
      breakdown.economicParticipation < 25 ? 'Economic participation' : null,
      breakdown.alignment < 15 ? 'ArcSprout alignment' : null,
      breakdown.qualityGuard < 15 ? 'Quality guard' : null,
    ].filter(Boolean) as string[];

    if (!breakdown.eligible) {
      return NextResponse.json({
        score: breakdown.total,
        threshold: breakdown.threshold,
        eligible: false,
        breakdown,
        signals,
        missingSignals,
        reason: `Score too low. Arc tx: ${signals.arcTxCount}, Total tx: ${signals.txCount}, Active days: ${signals.activeDays}, Native balance: ${signals.nativeBalance}, Age: ${signals.walletAgeDays}d`,
        actions,
      });
    }

    const signer = new Wallet(AI_ORACLE_PK);
    const newNonce = keccak256(getBytes(randomBytes(32)));
    const structHash = keccak256(
      solidityPacked(
        ['string', 'address', 'uint8', 'bytes32'],
        ['ARC_SPROUT_V1', walletAddr, breakdown.total, newNonce]
      )
    );
    const sig = await signer.signMessage(getBytes(structHash));

    return NextResponse.json({
      score: breakdown.total,
      threshold: breakdown.threshold,
      eligible: true,
      breakdown,
      nonce: newNonce,
      signature: sig,
      signals,
      missingSignals,
      actions,
    });
  } catch (err: any) {
    console.error('/evaluate error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
