'use client';

import { createAppKit } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solanaTestnet, solanaDevnet, solana } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import React, { ReactNode } from 'react';

const projectId = process.env.NEXT_PUBLIC_PROJECT_ID!;
if (!projectId) throw new Error('Project ID is not defined.');

const solanaAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

export const modal = createAppKit({
  adapters: [solanaAdapter],
  projectId,
  networks: [solana, solanaTestnet],
  metadata: {
    name: 'AppKit',
    description: 'AppKit Solana Example',
    url: 'https://creatorpass.vercel.app',
    icons: ['https://avatars.githubusercontent.com/u/179229932'],
  },
  features: {
    email: true,
    socials: ['google','x','github','discord','apple','facebook'],  // enable social logins :contentReference[oaicite:2]{index=2}
    emailShowWallets: false,
    swaps: true,
    onramp: true,
  },
  allWallets: 'SHOW',
  themeMode: 'dark',
  themeVariables: {
    '--w3m-accent': '#6A0DAD',
    '--w3m-color-mix': '#6A0DAD',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '12px',
  },
});

const ContextProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

export default ContextProvider;
