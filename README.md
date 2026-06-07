# ArcSprout Vercel Edition

Frontend + Oracle API in one Next.js app, deployed to Vercel.

## Architecture

```
[Vercel]
├── /api/evaluate  → AI Oracle (serverless, signs with AI_ORACLE_PRIVATE_KEY)
├── /api/health    → Health check
├── /              → Landing page
├── /enter         → Connect wallet → Evaluate → Mint
```

**No separate server needed.** Oracle runs as Vercel Serverless Function.

## Setup

### 1. Clone & Install

```bash
git clone https://github.com/cepuyut/arc-node-concierge.git
# OR create new repo from this folder
cd arc-node-concierge-vercel
npm install
```

### 2. Environment Variables

Create `.env.local` (NEVER commit):

```env
AI_ORACLE_PRIVATE_KEY=0x...your_private_key...
AI_ORACLE_ADDRESS=0x3847186F8ff9c6938CeD35ff8693e67675857303

NEXT_PUBLIC_CONTRACT_ADDRESS=0x1146e20874b90F6c37f938dee7b8AF0b8522D218
NEXT_PUBLIC_RPC_URL=https://rpc.testnet.arc.network
```

**IMPORTANT:** `AI_ORACLE_PRIVATE_KEY` is server-side only. Never prefix with `NEXT_PUBLIC_`.

### 3. WalletConnect Project ID (free)

1. Go to https://cloud.walletconnect.com
2. Create project → copy Project ID
3. Replace `YOUR_WALLETCONNECT_PROJECT_ID` in `lib/wagmi.ts`

### 4. Run Dev

```bash
npm run dev
# Open http://localhost:3000
```

### 5. Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login & deploy
vercel login
vercel --prod
```

**Or use GitHub integration:**
1. Push repo to GitHub
2. Import repo at https://vercel.com/new
3. Add environment variables in Vercel Dashboard
4. Deploy

## Environment Variables in Vercel Dashboard

Go to Project → Settings → Environment Variables:

| Name | Value | Type |
|---|---|---|
| `AI_ORACLE_PRIVATE_KEY` | `0x...` | Encrypted (server only) |
| `AI_ORACLE_ADDRESS` | `0x3847...` | Encrypted (server only) |
| `NEXT_PUBLIC_CONTRACT_ADDRESS` | `0x1146...` | Public (client accessible) |
| `NEXT_PUBLIC_RPC_URL` | `https://rpc.testnet.arc.network` | Public |

## API Endpoints

### POST /api/evaluate

Request:
```json
{
  "wallet": "0x...",
  "history": {
    "txCount": 42,
    "arcTxCount": 5,
    "usdcBalance": 10.5,
    "walletAgeDays": 120
  }
}
```

Response (qualified):
```json
{
  "score": 73,
  "nonce": "0x...",
  "signature": "0x..."
}
```

Response (not qualified):
```json
{
  "score": 45,
  "reason": "Score too low...",
  "actions": ["Swap 10 USDC on ArcSwap", "Bridge from Sepolia"]
}
```

### GET /api/health

```json
{
  "status": "ok",
  "oracle": "0x3847186F8ff9c6938CeD35ff8693e67675857303"
}
```

## Contract

- **Address:** `0x1146e20874b90F6c37f938dee7b8AF0b8522D218`
- **Network:** Arc Testnet (Chain ID 5042002)
- **Explorer:** https://testnet.arcscan.app/address/0x1146e20874b90F6c37f938dee7b8AF0b8522D218

## Stack

- Next.js 14 (App Router)
- TypeScript
- RainbowKit (wallet connect)
- Wagmi (contract interactions)
- Ethers v6 (oracle signing)
- Vercel (hosting + serverless functions)

## Security Notes

- `AI_ORACLE_PRIVATE_KEY` lives in Vercel serverless environment only. Never exposed to client.
- API route `/api/evaluate` runs server-side. Private key is safe.
- Contract address and RPC are public — prefixed with `NEXT_PUBLIC_`.
