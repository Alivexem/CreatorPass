# CreatorPass

**Live Demo**: [CreatorPass.vercel.app](https://CreatorPass.vercel.app/)

---


## Overview

> Development_Began: Jan 9th, 2025.

CreatorPass is a decentralized social platform designed to empower creators and their fans through blockchain technology. Creators can mint NFT-based passes, allowing fans to access premium content, receive gifted crypto in-app, and update their wallet balance seamlessly. It’s more than just a platform, it’s a gateway to deeper creator-fan connections and sustainable monetization.

Artists can now price their craft, and content creators can thrive in Web3 without relying on centralized platforms. CreatorPass is built for everyone.

While some platforms explore NFT-based access passes, such as Unlock Protocol, no other live platform is currently focused on CreatorPass’s unique blend of social engagement, direct creator monetization, and Web3-native experiences.


---

## Why CreatorPass?


**1. Unfair Monetization & High Fees**

Traditional platforms take large cuts, and payment gateways charge high transaction fees, reducing creators' earnings.



**2. Lack of Ownership & Control**

Centralized platforms dictate content, revenue, and audience access, with no true ownership for creators or fans.



**3. Inefficient Exclusivity & Access**

Providing exclusive content is costly and fragmented, forcing fans to juggle multiple services.



**4. Limited Global & Cross-Platform Reach**

Payment and platform restrictions prevent seamless access, limiting opportunities for creators and fans worldwide due to regional restrictions from Fiat payment.


---
---

### Current App Features 

- **Seamless onboarding**: Easily get onboarded to CreatorPass through socials (Google) or wallet using Reown AppKit.
- **Gift creators**: Gift your favourite creators SOL using reown Appkit SDK in-app without having to leave the application.
- **Crypto Purchase**: You can purchase crypto using reown Appkit SDK in-app without having to leave the application.
- **Manage Content**: Upload and delete exlusive contents from a personalized Admin Dashboard.  
- **Engage with contents**: Users can like, comment and engage with posts.
-  **Mint NFT Passes**: Create tiered passes e.g. Bronze, Silver, Gold for premium content (Still in development - Check issues to contribute).
-  **In-App chat**: Users will be able to have a personal chat with creators (Still in development - Check issues to contribute).
- **A.I Integration**: A.I recommendation for content creation and Fans pass purchase, A.I powered NFT management system (Still in development -  Check issues to contribute).

- 📊 On the bright side of it: Remember, for every pass a creator mints or a fan purchases/renews. CreatorPass makes profit

---

## Technologies Used

- **Frontend and Backend**: [Next.js](https://nextjs.org/)  
- **Web3 Integration**: [Reown AppKit & Solana web3 JS](https://reown.io/)  
- **Media Storage**: [Cloudinary](https://cloudinary.com/)  
- **Database**: [MongoDB](https://www.mongodb.com/)  

---

## Installation and Setup

### Requirements
- **Node.js**: Latest version (v18 or higher recommended).  
- **MongoDB**: Local or cloud instance.  

### Steps

To run this project locally, follow these steps:

*CLONE REPO*
```
git clone https://github.com/alivexem/CreatorPass.git
```

*Step 1: Clone the Repository*
```
cd CreatorPass
```

*Step 2: Install Dependencies*
```
npm install
```

*Step 3: Install Dependencies*
```
npm install @metaplex-foundation/mpl-token-metadata @reown/appkit @reown/appkit-adapter-solana @solana/spl-token @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/web3.js @walletconnect/client @walletconnect/web3-provider axios cloudinary echarts-for-react form-data framer-motion html-to-image html2canvas install mongoose next pinata react react-dom react-icons
```


*Step 4: Install dev Dependencies*
```
npm install -D @types/node @types/react @types/react-dom postcss tailwindcss typescript
```

*Step 5: Generate Tailwind CSS Config (if not already generated)*
```
npx tailwindcss init
```

*Step 6: Environment Variables*:

```
NEXT_PUBLIC_BUNDLR_NODE=your_bunblr_node_api

NEXT_PUBLIC_SOLANA_RPC_URL=your_solana_rpc_url

NEXT_PUBLIC_PINATA_SECRET_API_KEY=your_pinata_secret_key

NEXT_PUBLIC_PINATA_API_KEY=your_pinata_api_key

NEXT_PUBLIC_SHYFT_KEY=your_shyft_api_key

MONGODB_URI=your_mongodb_uri_for_vs_code_environment

NODE_NO_WARNINGS=1

CLOUDINARY_API_SECRET=your_cloudinary_secret_key

CLOUDINARY_API_KEY=your_cloudinary_api_key

CLOUDINARY_NAME=your_cloudinary_name

NEXT_PUBLIC_REOWN_API_KEY=your_reown_api_key
```



*Step 7: Start the Development Server*
```
npm run dev
```

### CONCLUSION

CreatorPass was built during Reown bounty timeline, being an idea i've had for a long time, it isn’t just a bounty submission. I needed a spark and hope for support, it’s a blueprint for the future of content monetization around the world. With good support, this project will be scaled into a full-fledged startup, leveraging Solana and Reown AppKit for a range of Web3 features.

The goal is to onboard a new wave of users (both web2 and non-solana crypto native users) to Solana and web3 through a seamless, user-friendly platform. CreatorPass is the first of it's kind in the web3 ecosystem and an early advantage.


---

### The Obvious

I'll like to take account for my numerous commits to this project in a short timeline. Due to hardware limitations, my laptop struggled to build the project's Next.js server locally because of it's size. To ensure smooth development, I relied on Vercel’s CI/CD pipeline for builds and debugging. After every push, Vercel automatically compiles the project, and I review the build logs to fix any errors. This approach ensured continuous progress despite local limitations. Balancing design and development within 20 days as a solo developer was no easy task, but the challenge made the entire development great.

**Live Demo**: [CreatorPass.vercel.app](https://CreatorPass.vercel.app/)
