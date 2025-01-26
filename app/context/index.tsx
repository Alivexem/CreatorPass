'use client';

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

// import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
// import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
// import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
// import type { Provider } from '@reown/appkit-adapter-solana/react';

import React, { ReactNode } from 'react';

// Retrieve the project ID from environment variables
const projectId = process.env.NEXT_PUBLIC_PROJECT_ID || '2927c2ac9dcae72c2006b80e814ac6e4';

if (!projectId) {
  throw new Error('Project ID is not defined.');
}

// Set up Solana adapter with wallet adapters
const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Define metadata for your application
const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'https://creatorpass.vercel.app', // Ensure this matches your app's URL
  icons: ['https://avatars.githubusercontent.com/u/179229932'],
};
// Initialize AppKit with the Solana adapter and network configurations
export const modal = createAppKit({
  adapters: [solanaAdapter],
  projectId,

  networks: [ solanaTestnet, solanaDevnet],
  metadata,
  features: {
    email: true,
    socials: ['google'],
    emailShowWallets: true,
    swaps: true, 
    onramp: true,
  },
  allWallets: 'SHOW',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-color-mix': '#4F6E85',
    '--w3m-color-mix-strength': 30
  }
});

// Context provider component
const ContextProvider = ({ children }: { children: ReactNode }) => {
  return children;
};

export default ContextProvider;
