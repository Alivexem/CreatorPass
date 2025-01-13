import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
  onError: (error) => {
    console.error('Solana adapter error:', error);
    // Handle error appropriately
  },
  onDisconnect: () => {
    // Optional: Add any cleanup logic here
    alert('Wallet disconnected');
  },
  defaultProvider: 'phantom', 
});

// 1. Get projectId from https://cloud.reown.com

// 2. Create a metadata object - optional
const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'https://example.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
};

// 3. Create modal
const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId: process.env.NEXT_PUBLIC_REOWN_API_KEY,
  networks: [solanaTestnet, solana],
  metadata,
  features: {
    email: true,
    socials: ['google'],
    emailShowWallets: true,
  },
  allWallets: 'SHOW',
  onError: (error) => {
    console.error('AppKit error:', error);
    // Handle error appropriately
  }
});


export { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect };
