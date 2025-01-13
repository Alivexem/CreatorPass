'use client'

import { createAppKit } from '@reown/appkit/react'
import { SolanaAdapter } from '@reown/appkit-adapter-solana/react'
import { solana, solanaTestnet } from '@reown/appkit/networks'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import React, { type ReactNode } from 'react'

// Set up Solana adapter
const solanaWeb3JsAdapter = new SolanaAdapter({
  wallets: [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
});

// Set up metadata
const metadata = {
  name: 'AppKit',
  description: 'AppKit Solana Example',
  url: 'https://creatorpass.vercel.app', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
export const modal = createAppKit({
  adapters: [solanaWeb3JsAdapter],
  projectId: process.env.NEXT_PUBLIC_REOWN_API_KEY || "2927c2ac9dcae72c2006b80e814ac6e4",
  networks: [solanaTestnet, solana ],
  metadata,
  features: {
    email: true,
    socials: ['google'],
    emailShowWallets: true,
  },
  allWallets: 'SHOW',
});

function ContextProvider({ children }: { children: ReactNode }) {
  return (
    <>{children}</>
  )
}

export default ContextProvider