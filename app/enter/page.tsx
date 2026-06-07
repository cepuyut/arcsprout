'use client';

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID } from '@/lib/contract';
import Link from 'next/link';

export default function EnterPage() {
  const { address, isConnected, chainId } = useAccount();
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState<string>('');

  const { data: hasMinted } = useReadContract({
    address: CONTRACT_ADDRESS as `0x${string}`,
    abi: CONTRACT_ABI,
    functionName: 'walletToTokenId',
    args: address ? [address] : undefined,
    query: { enabled: !!address },
  });

  const wrongChain = isConnected && chainId !== CHAIN_ID;

  async function evaluateWallet() {
    if (!address) return;
    setEvaluating(true);
    setError('');
    setResult(null);
    setTxHash('');

    try {
      const history = {
        txCount: 42,
        arcTxCount: 5,
        usdcBalance: 10.5,
        walletAgeDays: 120,
      };

      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet: address, history }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Evaluation failed');
      setResult(data);

      // automatic mint if qualified in backend
      if (data.signature) {
        const mintRes = await fetch('/api/evaluate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wallet: address,
            score: data.score,
            nonce: data.nonce,
            signature: data.signature,
          }),
        });

        const mintJson = await mintRes.json();
        if (!mintRes.ok) throw new Error(mintJson.error || 'Mint failed');
        setTxHash(mintJson.txHash);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  }

  return (
    <main className="container">
      <div className="card text-center">
        <h1 className="mb-2">🌟 Enter ArcSprout</h1>
        <p className="mb-4">Connect wallet → AI evaluation → Mint Seed</p>
        <ConnectButton />
      </div>

      {wrongChain && (
        <div className="card error">
          Wrong network. Switch to Arc Testnet (Chain ID {CHAIN_ID}).
        </div>
      )}

      {isConnected && !wrongChain && (
        <>
          {hasMinted && Number(hasMinted) > 0 ? (
            <div className="card success text-center">
              <h2>You already have a Seed!</h2>
              <p>Token ID: {Number(hasMinted)}</p>
            </div>
          ) : (
            <div className="card text-center">
              <button className="btn" onClick={evaluateWallet} disabled={evaluating}>
                {evaluating ? 'Evaluating...' : 'Evaluate My Wallet'}
              </button>
            </div>
          )}

          {result && !txHash && !evaluating && (
            <div className="card">
              <h3 className="mb-2">AI Score: {result.score}/100</h3>
              {result.signature ? (
                <>
                  <p className="success mb-2">✅ Qualified! Minting now...</p>
                  <p className="mb-2">Please wait a few seconds.</p>
                </>
              ) : (
                <>
                  <p className="error mb-2">❌ Score too low ({result.score}/100). Need ≥40.</p>
                  <p>{result.reason}</p>
                  {result.actions && (
                    <ul style={{ marginTop: '1rem' }}>
                      {result.actions.map((a: string, i: number) => (
                        <li key={i}>{a}</li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </div>
          )}

          {txHash && (
            <div className="card success text-center">
              <h3>🎉 Seed Minted!</h3>
              <p className="mb-2">
                <a
                  href={`https://testnet.arcscan.app/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#22c55e' }}
                >
                  View on Arcscan
                </a>
              </p>
            </div>
          )}

          {error && (
            <div className="card error">
              <pre>{error}</pre>
            </div>
          )}
        </>
      )}

      <div className="text-center mt-4">
        <Link href="/" style={{ color: '#888' }}>← Back home</Link>
      </div>
    </main>
  );
}
