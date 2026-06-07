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
  nonce?: `0x${string}`;
  signature?: `0x${string}`;
  reason?: string;
  actions?: string[];
  signals?: {
    txCount: number;
    arcTxCount: number;
    nativeBalance: number;
    walletAgeDays: number;
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
      body: 'No transaction was sent. You can review the flow and try again whenever you are ready.',
    };
  }

  if (lower.includes('switch to arc testnet') || lower.includes('chain')) {
    return {
      title: 'Network needs attention',
      body: 'Switch to Arc Testnet before retrying so the wallet and contract stay aligned.',
    };
  }

  if (lower.includes('insufficient funds') || lower.includes('balance')) {
    return {
      title: 'Wallet needs gas funds',
      body: 'Add a little Arc Testnet balance, then try again so the mint transaction can be submitted.',
    };
  }

  if (lower.includes('already minted') || lower.includes('already owns')) {
    return {
      title: 'This wallet already has a seed',
      body: 'ArcSprout detected an existing passport seed for this wallet, so the mint step is intentionally blocked.',
    };
  }

  if (lower.includes('nonce') && lower.includes('too low')) {
    return {
      title: 'Wallet transaction nonce is out of sync',
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
    title: 'Mint flow needs another pass',
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
      title: 'Connect a wallet to open your passport check.',
      body: 'ArcSprout evaluates a wallet before it becomes a community passport. Start by connecting on Arc Testnet.',
      tone: 'neutral',
    },
    'wallet-connected': {
      label: 'Ready',
      title: 'Wallet connected. You can run the eligibility check.',
      body: 'This stage prepares the first trust pass before a passport seed can be minted.',
      tone: 'neutral',
    },
    'wrong-network': {
      label: 'Wrong network',
      title: 'Switch to Arc Testnet before you continue.',
      body: 'The wallet is connected, but the mint contract lives on Arc Testnet. Align the network first.',
      tone: 'warning',
    },
    evaluating: {
      label: 'Evaluating',
      title: 'Reading trust signals and generating your result.',
      body: 'The oracle is checking whether this wallet deserves the first passport layer.',
      tone: 'neutral',
    },
    eligible: {
      label: 'Eligible',
      title: 'Your passport seed is approved.',
      body: 'The eligibility proof is ready. Confirm the wallet action to complete the mint.',
      tone: 'success',
    },
    'awaiting-confirmation': {
      label: 'Awaiting confirmation',
      title: 'Confirm the transaction in your wallet.',
      body: 'Nothing is onchain yet. This is the final wallet approval before the passport seed is sent.',
      tone: 'warning',
    },
    minting: {
      label: 'Minting',
      title: 'Transaction submitted. Waiting for the network.',
      body: 'ArcSprout is turning your eligibility proof into a live passport seed on Arc Testnet.',
      tone: 'neutral',
    },
    'mint-success': {
      label: 'Minted',
      title: 'Your ArcSprout passport seed is live.',
      body: 'You have completed the first identity layer. Future levels, quests, and perks can grow from here.',
      tone: 'success',
    },
    'not-eligible': {
      label: 'Not eligible yet',
      title: 'This wallet needs more signal before minting.',
      body: 'ArcSprout keeps the gate meaningful. Improve the wallet history, then return for another pass.',
      tone: 'warning',
    },
    error: {
      label: 'Needs attention',
      title: errorCopy?.title || 'Something interrupted the flow.',
      body: errorCopy?.body || 'Please retry the flow.',
      tone: 'danger',
    },
  };

  const activeStage = stageMap[flowStage];

  return (
    <main className="page-shell">
      <section className="hero-grid enter-hero">
        <div className="glass-card aurora-panel">
          <div className="eyebrow">Mint Flow Panel</div>
          <h1 className="hero-title">Earn the first ArcSprout passport seed.</h1>
          <p className="hero-body">
            This flow is designed as the first layer of a modular identity
            product. Today it mints a seed. Tomorrow it can unlock levels,
            quests, and member access.
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
                    : 'Run Passport Check'}
            </button>
            <Link href="/" className="btn btn-secondary">
              Back to Overview
            </Link>
          </div>
        </div>

        <aside className="glass-card status-shell">
          <div className={`status-badge tone-${activeStage.tone}`}>
            {activeStage.label}
          </div>
          <h2>{activeStage.title}</h2>
          <p>{activeStage.body}</p>

          <div className="status-meta">
            <div className="status-meta-row">
              <span>Connected wallet</span>
              <strong>{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'Not connected'}</strong>
            </div>
            <div className="status-meta-row">
              <span>Chain</span>
              <strong>{isConnected ? chainId || 'Unknown' : 'Pending'}</strong>
            </div>
            <div className="status-meta-row">
              <span>Passport score</span>
              <strong>
                {result?.score !== undefined ? `${result.score}/100` : 'Not scored yet'}
              </strong>
            </div>
            <div className="status-meta-row">
              <span>Last tx</span>
              <strong>
                {txHash || submittedTxHash ? (
                  <a
                    href={`https://testnet.arcscan.app/tx/${txHash || submittedTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on explorer
                  </a>
                ) : (
                  'No transaction yet'
                )}
              </strong>
            </div>
          </div>
        </aside>
      </section>

      <section className="section-grid dual-column">
        <div className="glass-card">
          <div className="eyebrow">Wallet entry</div>
          <h2>Connect and align before minting.</h2>
          <div className="connect-shell">
            <ConnectButton />
          </div>

          <div className="slot-list compact-list">
            {enterTrustChecklist.map((item) => (
              <div key={item} className="slot-card">
                {item}
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <div className="eyebrow">Product state machine</div>
          <h2>Every step stays visible to the user.</h2>
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
      </section>

      {tokenId > 0 && (
        <section className="glass-card success-panel">
          <div className="eyebrow">Existing passport</div>
          <h2>This wallet already holds an ArcSprout seed.</h2>
          <p>
            Token ID <strong>{tokenId}</strong> is already active, so this wallet
            has passed the first entry gate.
          </p>
        </section>
      )}

      {result && flowStage === 'not-eligible' && (
        <section className="glass-card warning-panel">
          <div className="eyebrow">Eligibility guidance</div>
          <h2>Improve the wallet signal, then return.</h2>
          <p>{result.reason}</p>
          {result.actions && (
            <div className="slot-list compact-list">
              {result.actions.map((action) => (
                <div key={action} className="slot-card">
                  {action}
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {result?.signals && (
        <section className="glass-card">
          <div className="eyebrow">Live signals</div>
          <h2>Oracle input from the connected wallet.</h2>
          <div className="status-meta">
            <div className="status-meta-row">
              <span>Arc activity</span>
              <strong>{result.signals.arcTxCount}</strong>
            </div>
            <div className="status-meta-row">
              <span>Total nonce count</span>
              <strong>{result.signals.txCount}</strong>
            </div>
            <div className="status-meta-row">
              <span>Native balance</span>
              <strong>{result.signals.nativeBalance.toFixed(4)} ARC</strong>
            </div>
            <div className="status-meta-row">
              <span>Wallet age proxy</span>
              <strong>{result.signals.walletAgeDays} days</strong>
            </div>
          </div>
        </section>
      )}

      {flowStage === 'mint-success' && (
        <section className="glass-card success-panel">
          <div className="eyebrow">Post-mint state</div>
          <h2>Your entry is complete. Here is what comes next.</h2>
          <div className="slot-list compact-list">
            {postMintSteps.map((step) => (
              <div key={step} className="slot-card">
                {step}
              </div>
            ))}
          </div>

          {(txHash || submittedTxHash) && (
            <div className="hero-actions">
              <a
                href={`https://testnet.arcscan.app/tx/${txHash || submittedTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                View Transaction
              </a>
            </div>
          )}
        </section>
      )}

      {flowStage === 'error' && errorCopy && (
        <section className="glass-card error-panel">
          <div className="eyebrow">Retry path</div>
          <h2>{errorCopy.title}</h2>
          <p>{errorCopy.body}</p>
          {(txHash || submittedTxHash) && (
            <div className="hero-actions">
              <a
                href={`https://testnet.arcscan.app/tx/${txHash || submittedTxHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Inspect Transaction
              </a>
            </div>
          )}
          {error && <pre>{error}</pre>}
        </section>
      )}

      <section className="glass-card">
        <div className="eyebrow">Future passport modules</div>
        <h2>This screen is designed to expand without a rewrite.</h2>
        <div className="feature-grid">
          <article className="feature-card">
            <h3>Level card slot</h3>
            <p>Reserved for seed, sprout, and deeper status layers.</p>
          </article>
          <article className="feature-card">
            <h3>Quest panel slot</h3>
            <p>Ready for missions that help members improve score and access.</p>
          </article>
          <article className="feature-card">
            <h3>Perk panel slot</h3>
            <p>Ready for gated drops, channels, benefits, and campaign modules.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
