'use client';

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useReadContract } from 'wagmi';
import { CONTRACT_ADDRESS, CONTRACT_ABI, CHAIN_ID } from '@/lib/contract';
import Link from 'next/link';

export default function EnterPage() {
  const { address, isConnected, chainId } = useAccount();
  const [evaluating, setEvaluating] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [minting, setMinting] = useState(false);
  const [txHash, setTxHash] = useState('');

  const { writeContractAsync } = useWriteContract();

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

    try {
      // Build wallet history (mock for now — fetch from RPC in production)
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setEvaluating(false);
    }
  }

  async function mint() {
    if (!result?.signature) return;
    setMinting(true);
    setError('');

    try {
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CONTRACT_ABI,
        functionName: 'mintSeed',
        args: [address, result.score, result.nonce, result.signature],
      });
      setTxHash(hash);
    } catch (err: any) {
      setError(err?.shortMessage || err?.message || 'Mint failed');
    } finally {
      setMinting(false);
    }
  }

  return (
    <main className="container">
      <div className="card text-center">
        <h1 className="mb-2">🌱 Enter ArcSprout</h1>
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
              <button
                className="btn"
                onClick={evaluateWallet}
                disabled={evaluating}
              >
                {evaluating ? 'Evaluating...' : 'Evaluate My Wallet'}
              </button>
            </div>
          )}

          {result && !txHash && (
            <div className="card">
              <h3 className="mb-2">AI Score: {result.score}/100</h3>
              {result.signature ? (
                <>
                  <p className="success mb-2">✅ Qualified! Ready to mint.</p>
                  <button
                    className="btn"
                    onClick={mint}
                    disabled={minting}
                  >
                    {minting ? 'Minting...' : 'Mint Seed NFT'}
                  </button>
                </>
              ) : (
                <>
                  <p className="error mb-2">❌ Score too low ({result.score}/100). Need ≥60.</p>
                  <p>{result.reason}</p>
                  {result.actions && (
                    <ul style= marginTop: '1rem' >
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
                  style= color: '#22c55e' 
                >
                  View on Arcscan
                </a>
              </p>
            </div>
          )}
        </>
      )}

      {error && (
        <div className="card error">
          <pre>{error}</pre>
        </div>
      )}

      <div className="text-center mt-4">
        <Link href="/" style= color: '#888' >← Back home</Link>
      </div>
    </main>
  );
}
