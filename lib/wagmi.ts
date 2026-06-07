import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { arc } from 'wagmi/chains';

// Arc Testnet custom chain
export const arcTestnet = {
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: {
    decimals: 18,
    name: 'Arc',
    symbol: 'ARC',
  },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
    public: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'Arcscan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
};

export const config = getDefaultConfig({
  appName: 'ArcSprout',
  projectId: 'f1d172cb155659be29fdd1e6d4638ba8',
  chains: [arcTestnet],
  ssr: true,
});
