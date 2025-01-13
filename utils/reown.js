import { createAppKit, useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect } from '@reown/appkit/react';
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react';
import { solana, solanaTestnet, solanaDevnet } from '@reown/appkit/networks';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';

const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()]
});

// 1. Get projectId from https://cloud.reown.com
const projectId = process.env.NEXT_PUBLIC_REOWN_API_KEY;

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
  projectId,
  networks: [solanaTestnet, solana],
  metadata,
  features: {
    email: true, // default to true
    socials: ['google'],
    emailShowWallets: true, // default to true    
  },
  allWallets: 'SHOW', // default to SHOW
});

const openModal = (open, isConnected, router) => {
  open();
  // if (isConnected) {
  //   router.push('/welcome');
  // }
};

export { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect, openModal };
