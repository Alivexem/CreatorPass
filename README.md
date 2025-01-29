# CreatorPass

**Live Demo**: [CreatorPass.vercel.app](https://CreatorPass.vercel.app/)

---


## Overview

CreatorPass is a decentralized social platform designed to empower creators and their fans through blockchain technology. Creators can mint NFT-based passes that fans can purchase to access premium content, get Gifted crypto in-app and also update wallet balance in-app. It’s more than just a platform, it’s a gateway to fostering deeper connections and monetizing creativity. Artists can now price their craft, content-creators can move into the Web3 ecosystem and thrive, CreatorPass is infact for everyone.

This project commenced on **January 9, 2025** but the idea have long been in my heart. CreatorPass highlights the potential of Web3 by leveraging Solana and Reown AppKit for seamless integration. By bringing creators and fans to the blockchain, CreatorPass is helping onboard more users to the web3 ecosystem.

With things in place, this project could be scaled into a full-fledged startup, leveraging Solana and Reown AppKit for a range of Web3 features.

---

## Why CreatorPass?

**1. Limited Monetization Options for Creators**

- Traditional platforms take significant cuts from creators' earnings.
- Monetization methods like ads and subscriptions often lack transparency and flexibility for creators.

**2. Centralized Platform Dependence**

- Creators rely on centralized platforms that control their content, revenue, and audience access.
- Platforms can de-platform creators without notice, affecting income and audience reach.



**3. Exclusivity Challenges**

- Providing exclusive content to fans often requires third-party services, which can be costly and inefficient.
- Fans lack a seamless way to access exclusive creator content without juggling multiple apps.


**4. High Fees for Fans and Creators**
- Payment gateways charge high transaction fees for fans to access content, reducing creators' earnings.



**5. Ownership and Licensing Issues**

- Creators often lack control over the intellectual property (IP) of their content on traditional platforms.
- Fans have no real ownership of purchased content or benefits.

**6. Lack of Incentive for Fans**

- Fans who support creators don't receive tangible benefits or rewards in most cases.
- No system exists to build stronger connections between fans and creators beyond financial support.

**7. Lack of Interoperability**

- Fans and creators are restricted to specific platforms, making it hard to transfer benefits, memberships, or digital content across platforms.

**8. Global Accessibility Barriers**

- Payment systems often limit access to global creators and fans due to regional restrictions or currency issues.


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

CreatorPass was built during Reown bounty timeline, being an idea i've had for a long time - it isn’t just a bounty submission. I needed a spark and hope for support, it’s a blueprint for the future of content monetization around the world. The goal is to onboard a new wave of users (both web2 and non-solana crypto native users) to Solana and web3 through a seamless, user-friendly platform.

---

### The Obvious

I'll like to take account for my numerous commits to this project in a short timeline. Due to hardware limitations, my laptop struggled to build the project's Next.js server locally because of it's size. To ensure smooth development, I relied on Vercel’s CI/CD pipeline for builds and debugging. After every push, Vercel automatically compiles the project, and I review the build logs to fix any errors. This approach ensured continuous progress despite local limitations. Balancing design and development within 20 days as a solo developer was no easy task, but the challenge made the project a worthwhile experience.

**Live Demo**: [CreatorPass.vercel.app](https://CreatorPass.vercel.app/)
