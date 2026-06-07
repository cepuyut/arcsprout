export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const RPC_URL = process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.arc.network';
export const CHAIN_ID = 5042002;

export const CONTRACT_ABI = [
  {
    "inputs": [{ "internalType": "address", "name": "_aiOracle", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_wallet", "type": "address" },
               { "internalType": "uint8", "name": "_aiScore", "type": "uint8" },
               { "internalType": "bytes32", "name": "_aiNonce", "type": "bytes32" },
               { "internalType": "bytes", "name": "_aiSignature", "type": "bytes" }],
    "name": "mintSeed",
    "outputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "name": "walletToTokenId",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mintCount",
    "outputs": [{ "internalType": "uint64", "name": "", "type": "uint64" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "aiOracle",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "seeds",
    "outputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "address", "name": "wallet", "type": "address" },
      { "internalType": "uint8", "name": "aiScore", "type": "uint8" },
      { "internalType": "uint40", "name": "mintedAt", "type": "uint40" },
      { "internalType": "uint8", "name": "currentLevel", "type": "uint8" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "_owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "wallet", "type": "address" },
      { "indexed": false, "internalType": "uint8", "name": "aiScore", "type": "uint8" },
      { "indexed": false, "internalType": "uint40", "name": "mintedAt", "type": "uint40" }
    ],
    "name": "SeedMinted",
    "type": "event"
  }
];
