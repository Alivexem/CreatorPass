import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import React, { ReactNode } from 'react';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '2927c2ac9dcae72c2006b80e814ac6e4';

if (!projectId) {
  throw new Error('Project ID is not defined.');
}

const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'https://creatorpass.vercel.app',
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};

export const modal = createAppKit({
  adapters: [solanaAdapter],
  projectId,
  networks: [solanaTestnet, solanaDevnet],
  metadata,
  features: {
    email: false, // Disable email login
    socials: false, // Disable social logins
    emailShowWallets: false,
    swaps: true,
    onramp: true,
  },
  allWallets: 'SHOW',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#4F6E85',
    '--w3m-color-mix-strength': 30,
  },
});

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return children;
};

export default ContextProvider;