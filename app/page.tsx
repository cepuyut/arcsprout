import Link from 'next/link';

export default function Home() {
  return (
    <main className="container">
      <div className="card text-center mt-4">
        <h1 className="mb-2">🌱 ArcSprout</h1>
        <p className="mb-4">
          AI-gated community entry. Prove your wallet deserves a Seed.
        </p>
        <div className="gap-2">
          <Link href="/enter" className="btn">
            Enter Community
          </Link>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-2">How It Works</h2>
        <ol style= paddingLeft: '1.2rem', lineHeight: '1.8' >
          <li>Connect your wallet (Arc Testnet)</li>
          <li>AI Oracle evaluates your wallet history</li>
          <li>Score ≥ 60? Sign and mint your Seed NFT</li>
          <li>Score &lt; 60? Get guidance on how to qualify</li>
        </ol>
      </div>

      <div className="card">
        <h2 className="mb-2">Specs</h2>
        <table style= width: '100%', borderCollapse: 'collapse' >
          <tbody>
            <tr><td style= padding: '0.4rem 0', borderBottom: '1px solid #222' >Network</td><td style= textAlign: 'right' >Arc Testnet (Chain ID 5042002)</td></tr>
            <tr><td style= padding: '0.4rem 0', borderBottom: '1px solid #222' >Contract</td><td style= textAlign: 'right' >0x1146e20874b90F6c37f938dee7b8AF0b8522D218</td></tr>
            <tr><td style= padding: '0.4rem 0', borderBottom: '1px solid #222' >Max Supply</td><td style= textAlign: 'right' >10,000 Seeds</td></tr>
            <tr><td style= padding: '0.4rem 0', borderBottom: '1px solid #222' >Score Threshold</td><td style= textAlign: 'right' >60 / 100</td></tr>
            <tr><td style= padding: '0.4rem 0' >Signature Prefix</td><td style= textAlign: 'right' >ARC_SPROUT_V1</td></tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
