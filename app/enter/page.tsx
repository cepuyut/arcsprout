'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from 'wagmi';
import { CONTRACT_ABI, CONTRACT_ADDRESS, CHAIN_ID } from '@/lib/contract';
import { enterTrustChecklist, postMintSteps } from '@/lib/content';

type EvaluationResult = {
  score: number;
  threshold?: number;
  eligible?: boolean;
  nonce?: `0x${string}`;
  signature?: `0x${string}`;
  reason?: string;
  actions?: string[];
  missingSignals?: string[];
  breakdown?: {
    arcPresence: number;
    retention: number;
    economicParticipation: number;
    alignment: number;
    qualityGuard: number;
    total: number;
    threshold: number;
    eligible: boolean;
  };
  signals?: {
    txCount: number;
    arcTxCount: number;
    nativeBalance: number;
    walletAgeDays: number;
    activeDays: number;
  };
};

type TxStep = 'idle' | 'awaiting-confirmation' | 'minting';

type FlowStage =
  | 'visitor'
  | 'wallet-connected'
  | 'wrong-network'
  | 'evaluating'
  | 'eligible'
  | 'awaiting-confirmation'
  | 'minting'
  | 'mint-success'
  | 'not-eligible'
  | 'error';

function classifyError(message: string) {
  const lower = message.toLowerCase();

  if (
    lower.includes('user rejected') ||
    lower.includes('user denied') ||
    lower.includes('rejected the request')
  ) {
    return {
      title: 'Wallet confirmation was cancelled',
      body: 'No transaction was sent. Review the flow and try again when you are ready.',
    };
  }

  if (lower.includes('switch to arc testnet') || lower.includes('chain')) {
    return {
      title: 'Network needs attention',
      body: 'Switch to Arc Testnet so the wallet and contract stay aligned before retrying.',
    };
  }

  if (lower.includes('insufficient funds') || lower.includes('balance')) {
    return {
      title: 'Wallet needs gas funds',
      body: 'Add a small Arc Testnet balance, then retry the mint transaction.',
    };
  }

  if (lower.includes('already minted') || lower.includes('already owns')) {
    return {
      title: 'This wallet already has a passport seed',
      body: 'ArcSprout detected an existing seed, so the mint path is intentionally blocked for this wallet.',
    };
  }

  if (lower.includes('nonce') && lower.includes('too low')) {
    return {
      title: 'Wallet nonce is out of sync',
      body: 'Refresh the wallet, then retry so the next transaction uses the correct nonce.',
    };
  }

  if (lower.includes('wallet client is not ready')) {
    return {
      title: 'Wallet session is still warming up',
      body: 'Reconnect the wallet or wait for the provider to finish initializing, then try again.',
    };
  }

  return {
    title: 'The flow needs another pass',
    body: message,
  };
}

function getFlowStage(params: {
  isConnected: boolean;
  wrongChain: boolean;
  hasMinted: boolean;
  evaluating: boolean;
  txStep: TxStep;
  txHash: string;
  result: EvaluationResult | null;
  error: string;
}): FlowStage {
  const {
    isConnected,
    wrongChain,
    hasMinted,
    evaluating,
    txStep,
    txHash,
    result,
    error,
  } = params;

  if (!isConnected) return 'visitor';
  if (hasMinted || txHash) return 'mint-success';
  if (wrongChain) return 'wrong-network';
  if (error) return 'error';
  if (evaluating) return 'evaluating';
  if (txStep === 'awaiting-confirmation') return 'awaiting-confirmation';
  if (txStep === 'minting') return 'minting';
  if (!result) return 'wallet-connected';
  if (result.signature) return 'eligible';
  return 'not-eligible';
}

export default function EnterPage() {
  const { address, isConnected, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();

  const [evaluating, setEvaluating] = useState(false);
  const [txStep, setTxStep] = useState<TxStep>('idle');
  const [result, setResult] = useState<EvaluationResult | null>(null);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState<string>('');
  const [submittedTxHash, setSubmittedTxHash] = useState<string>('');

  const { data: hasMinted } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'walletToTokenId',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const wrongChain = isConnected && chainId !== CHAIN_ID;
  const tokenId = Number(hasMinted || 0);
  const hasMintedSeed = tokenId > 0;

  const flowStage = getFlowStage({
    isConnected,
    wrongChain,
    hasMinted: hasMintedSeed,
    evaluating,
    txStep,
    txHash,
    result,
    error,
  });

  const errorCopy = useMemo(
    () => (error ? classifyError(error) : null),
    [error]
  );

  useEffect(() => {
    setEvaluating(false);
    setTxStep('idle');
    setResult(null);
    setError('');
    setTxHash('');
    setSubmittedTxHash('');
  }, [address, chainId]);

  async function evaluateWallet() {
    if (!address || wrongChain) return;

    setEvaluating(true);
    setTxStep('idle');
    setError('');
    setResult(null);
    setTxHash('');
    setSubmittedTxHash('');

    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address }),
      });

      const data = (await res.json()) as EvaluationResult & { error?: string };
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');

      setResult(data);

      if (data.signature && data.nonce) {
        setTxStep('awaiting-confirmation');

        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS as `0x${string}`,
          abi: CONTRACT_ABI,
          functionName: 'mintSprout',
          args: [address, data.score, data.nonce, data.signature],
        });

        if (!publicClient) {
          throw new Error('Wallet client is not ready');
        }

        setSubmittedTxHash(hash);
        setTxStep('minting');
        await publicClient.waitForTransactionReceipt({ hash });
        setTxHash(hash);
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error');
    } finally {
      setEvaluating(false);
      setTxStep('idle');
    }
  }

  const stageMap: Record<
    FlowStage,
    { label: string; title: string; body: string; tone: string }
  > = {
    visitor: {
      label: 'Visitor',
      title: 'Connect a wallet to start the readiness check.',
      body: 'ArcSprout evaluates real Arc activity before a community passport is minted.',
      tone: 'neutral',
    },
    'wallet-connected': {
      label: 'Ready',
      title: 'Wallet connected. Run the eligibility check when you are ready.',
      body: 'This stage prepares the signed result that decides whether the base passport can be minted.',
      tone: 'neutral',
    },
    'wrong-network': {
      label: 'Wrong network',
      title: 'Switch to Arc Testnet before continuing.',
      body: 'The wallet is connected, but the contract lives on Arc Testnet.',
      tone: 'warning',
    },
    evaluating: {
      label: 'Evaluating',
      title: 'Reading trust signals from this wallet.',
      body: 'The oracle is checking participation, retention, and Arc-native activity before scoring the wallet.',
      tone: 'neutral',
    },
    eligible: {
      label: 'Eligible',
      title: 'The base passport is ready to mint.',
      body: 'The signed result has been created. Confirm the wallet action to complete the mint.',
      tone: 'success',
    },
    'awaiting-confirmation': {
      label: 'Awaiting confirmation',
      title: 'Confirm the transaction in your wallet.',
      body: 'Nothing is onchain yet. This is the last wallet approval before minting the base passport.',
      tone: 'warning',
    },
    minting: {
      label: 'Minting',
      title: 'The transaction is on its way through Arc.',
      body: 'ArcSprout is converting the signed eligibility proof into a live passport seed.',
      tone: 'neutral',
    },
    'mint-success': {
      label: 'Minted',
      title: 'The ArcSprout passport seed is now live.',
      body: 'The first identity layer is complete. Future levels, roles, and perks can grow from here.',
      tone: 'success',
    },
    'not-eligible': {
      label: 'Not eligible yet',
      title: 'This wallet needs a stronger Arc trail first.',
      body: 'ArcSprout keeps the gate meaningful. Build a better activity record and come back for another pass.',
      tone: 'warning',
    },
    error: {
      label: 'Needs attention',
      title: errorCopy?.title || 'The flow was interrupted.',
      body: errorCopy?.body || 'Retry the flow when you are ready.',
      tone: 'danger',
    },
  };

  const activeStage = stageMap[flowStage];
  const breakdown = result?.breakdown;
  const displayScore = result?.score ?? (hasMintedSeed || txHash ? 82 : 58);
  const eligibilityLabel =
    result?.eligible === true
      ? 'Eligible'
      : result?.eligible === false
        ? 'Grinding needed'
        : hasMintedSeed || txHash
          ? 'Minted'
          : 'Pending';

  const statusStripItems = [
    { label: 'Network', value: 'Arc Testnet' },
    { label: 'Threshold', value: 'Score >= 60' },
    { label: 'Passport', value: 'Seed layer' },
    { label: 'Status', value: activeStage.label },
  ];

  return (
    <main className="page-shell" id="main-content">
      <a href="#wallet-details" className="skip-link">
        Skip to wallet details
      </a>
      <header className="topbar">
        <Link href="/" className="brand-lockup" aria-label="ArcSprout">
          <div className="brand-mark">A</div>
          <div className="brand-copy">
            <strong>ArcSprout</strong>
            <span>Arc community passport</span>
          </div>
        </Link>

        <nav className="topnav" aria-label="Primary">
          <Link href="/#overview">Overview</Link>
          <Link href="/#how-it-works">Flow</Link>
          <Link href="/#progression">Progression</Link>
          <Link href="/#entry-path">Eligibility</Link>
        </nav>

        <div className="topbar-actions">
          <Link href="/" className="btn btn-secondary compact-btn">
            Back to overview
          </Link>
        </div>
      </header>

      <section className="enter-shell">
        <div className="enter-main glass-card">
          <div className={`status-badge tone-${activeStage.tone}`}>
            {activeStage.label}
          </div>
          <div className="eyebrow">ArcSprout entry</div>
          <h1 className="enter-title">Check if this wallet is ready for its first Arc passport.</h1>
          <p className="hero-body enter-body">
            ArcSprout reads real Arc activity, creates a signed eligibility
            result, and lets the connected wallet mint the base seed if the
            threshold is met.
          </p>

          <div className="hero-actions">
            <button
              className="btn btn-primary"
              onClick={evaluateWallet}
              disabled={
                !isConnected ||
                wrongChain ||
                evaluating ||
                txStep !== 'idle' ||
                hasMintedSeed ||
                !!txHash
              }
            >
              {hasMintedSeed || txHash
                ? 'Passport already minted'
                : evaluating
                  ? 'Evaluating wallet...'
                  : txStep === 'awaiting-confirmation'
                    ? 'Waiting for wallet...'
                    : txStep === 'minting'
                      ? 'Minting on Arc...'
                      : 'Run wallet check'}
            </button>
            <a href="#wallet-details" className="btn btn-secondary">
              View wallet details
            </a>
          </div>

          <div className="enter-copy-block">
            <h2>{activeStage.title}</h2>
            <p>{activeStage.body}</p>
          </div>

          <div className="trust-row">
            {enterTrustChecklist.map((item) => (
              <div key={item} className="trust-chip">
                <span className="trust-chip-dot" aria-hidden="true" />
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="enter-side glass-card">
          <div className="hero-side-top">
            <span className="figure-chip">Arc Testnet</span>
            <span className="mini-note">Wallet-native mint</span>
          </div>

          <div className="enter-score-shell">
            <div className="arc-score-ring arc-score-ring-large">
              <div className="arc-score-core">
                <span>Score</span>
                <strong>{displayScore}</strong>
              </div>
            </div>
          </div>

          <div className="rail-grid">
            <div className="rail-row">
              <span>Connected wallet</span>
              <strong>
                {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}
              </strong>
            </div>
            <div className="rail-row">
              <span>Current stage</span>
              <strong>{activeStage.label}</strong>
            </div>
            <div className="rail-row">
              <span>Eligibility</span>
              <strong>{eligibilityLabel}</strong>
            </div>
          </div>

          <div className="connect-shell">
            <ConnectButton />
          </div>

          <div className="status-rows">
            <div className="status-row-card">
              <span>Chain</span>
              <strong>{isConnected ? chainId || 'Unknown' : 'Pending'}</strong>
            </div>
            <div className="status-row-card">
              <span>Passport score</span>
              <strong>
                {result?.score !== undefined
                  ? `${result.score}/${result.threshold || 100}`
                  : 'Not scored yet'}
              </strong>
            </div>
            <div className="status-row-card">
              <span>Explorer</span>
              <strong>
                {txHash || submittedTxHash ? (
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash || submittedTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View transaction
                  </a>
                ) : (
                  'No transaction yet'
                )}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="status-band glass-card">
        {statusStripItems.map((item) => (
          <div key={item.label} className="status-band-item">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
          </div>
        ))}
      </section>

      <section className="detail-grid" id="wallet-details">
        <div className="glass-card">
          <div className="eyebrow">Wallet trust model</div>
          <h2>Every important state stays visible to the user.</h2>
          <div className="stage-grid">
            {[
              'visitor',
              'wallet connected',
              'wrong network',
              'evaluating',
              'eligible',
              'awaiting confirmation',
              'minting',
              'mint success',
              'not eligible',
              'error / retry',
            ].map((step) => (
              <div key={step} className="stage-chip">
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="eyebrow">After mint</div>
          <h2>Make the first seed feel like the start of something larger.</h2>
          <div className="stack-list">
            {postMintSteps.map((step) => (
              <div key={step} className="slot-card glass-card subtle-card">
                {step}
              </div>
            ))}
          </div>
        </div>
      </section>

      {tokenId > 0 && (
        <section className="glass-card success-panel">
          <div className="eyebrow">Existing passport</div>
          <h2>This wallet already holds an ArcSprout seed.</h2>
          <p>
            Token ID <strong>{tokenId}</strong> is active, so this wallet has
            already passed the first entry gate.
          </p>
        </section>
      )}

      {result && flowStage === 'not-eligible' && (
        <section className="glass-card warning-panel">
          <div className="eyebrow">Eligibility guidance</div>
          <h2>Build a stronger Arc trail, then try again.</h2>
          <p>{result.reason}</p>

          {result.missingSignals && result.missingSignals.length > 0 && (
            <div className="stack-list">
              {result.missingSignals.map((signal) => (
                <div key={signal} className="slot-card glass-card subtle-card">
                  Missing signal: {signal}
                </div>
              ))}
            </div>
          )}

          {result.actions && result.actions.length > 0 && (
            <div className="stack-list">
              {result.actions.map((action) => (
                <div key={action} className="slot-card glass-card subtle-card">
                  {action}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {result?.signals && (
        <section className="glass-card">
          <div className="eyebrow">Score breakdown</div>
          <h2>How this wallet reached its current result.</h2>

          {breakdown && (
            <div className="metrics-grid">
              <article className="metric-card">
                <span>Arc presence</span>
                <strong>{breakdown.arcPresence}/25</strong>
                <p>Basic Arc usage and visible onchain presence.</p>
              </article>
              <article className="metric-card">
                <span>Retention</span>
                <strong>{breakdown.retention}/20</strong>
                <p>Whether the wallet comes back over time.</p>
              </article>
              <article className="metric-card">
                <span>Economic participation</span>
                <strong>{breakdown.economicParticipation}/20</strong>
                <p>Useful wallet actions instead of empty movement.</p>
              </article>
              <article className="metric-card">
                <span>Alignment</span>
                <strong>{breakdown.alignment}/20</strong>
                <p>How closely the wallet reflects ArcSprout-ready behavior.</p>
              </article>
              <article className="metric-card">
                <span>Quality guard</span>
                <strong>{breakdown.qualityGuard}/15</strong>
                <p>Extra filtering to keep the gate meaningful.</p>
              </article>
              <article className="metric-card metric-card-strong">
                <span>Total</span>
                <strong>
                  {breakdown.total}/{breakdown.threshold}
                </strong>
                <p>
                  {breakdown.eligible
                    ? 'This wallet is ready for the first passport layer.'
                    : 'This wallet still needs more meaningful signal.'}
                </p>
              </article>
            </div>
          )}

          <div className="signal-grid">
            <div className="signal-card">
              <span>Total transactions</span>
              <strong>{result.signals.txCount}</strong>
            </div>
            <div className="signal-card">
              <span>Arc transactions</span>
              <strong>{result.signals.arcTxCount}</strong>
            </div>
            <div className="signal-card">
              <span>Native balance</span>
              <strong>{result.signals.nativeBalance.toFixed(4)}</strong>
            </div>
            <div className="signal-card">
              <span>Wallet age</span>
              <strong>{result.signals.walletAgeDays} days</strong>
            </div>
            <div className="signal-card">
              <span>Active days</span>
              <strong>{result.signals.activeDays}</strong>
            </div>
          </div>
        </section>
      )}

      {error && flowStage === 'error' && (
        <section className="glass-card error-panel">
          <div className="eyebrow">Flow recovery</div>
          <h2>{errorCopy?.title}</h2>
          <p>{errorCopy?.body}</p>
        </section>
      )}
    </main>
  );
}
