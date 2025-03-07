'use client'
import React, { useState, useEffect, TouchEvent, useRef } from 'react'
import NavBar from '@/components/NavBar'
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { RiNftFill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { toPng } from 'html-to-image';
import { uploadToIPFS, uploadMetadataToIPFS } from '@/utils/ipfsService';
import { AccessCardTemplate } from '@/utils/cardTemplate';
import { useAppKit, useAppKitProvider, useAppKitAccount, Transaction, SystemProgram, PublicKey, Provider } from '../../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { motion, AnimatePresence } from "framer-motion";



import { 
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { Keypair, Signer, LAMPORTS_PER_SOL } from '@solana/web3.js';

interface Pass {
  _id: string;
  creatorAddress: string;
  creatorName: string;
  type: 'Regular' | 'Special' | 'VIP';
  price: number;
  message: string;
  rules: {
    funForumAccess: boolean;
    likeCommentAccess: boolean;
    downloadAccess: boolean;
    giftAccess: boolean;
  };
  image: string;
}

const PassesPage = () => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [showSwipeModal, setShowSwipeModal] = useState(false);
  const [mintingStates, setMintingStates] = useState<{[key: string]: boolean}>({});
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { connection } = useAppKitConnection();
  const { isConnected, address } = useAppKitAccount();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMinting, setIsMinting] = useState(false);

  const PASSES_PER_PAGE = 6;

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const res = await fetch('/api/passes');
        const data = await res.json();
        if (data.passes) {
          setPasses(data.passes);
          // Initialize minting states for all passes
          const states = data.passes.reduce((acc: any, pass: Pass) => {
            acc[pass._id] = false;
            return acc;
          }, {});
          setMintingStates(states);
        }
      } catch (error) {
        console.error('Error fetching passes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPasses();

    // Show swipe toast on mobile devices
    if (window.innerWidth <= 768) {
      setShowSwipeModal(true);
      setTimeout(() => {
        setShowSwipeModal(false);
      }, 8000);
    }
  }, []);

  const totalPages = Math.ceil(passes.length / PASSES_PER_PAGE);
  const paginatedPasses = passes.slice(
    (currentPage - 1) * PASSES_PER_PAGE,
    currentPage * PASSES_PER_PAGE
  );

  const handlePrevious = () => {
    setCurrentPage((prev) => (prev === 1 ? totalPages : prev - 1));
  };

  const handleNext = () => {
    setCurrentPage((prev) => (prev === totalPages ? 1 : prev + 1));
  };

  const handleTouchStart = (e: TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const minSwipeDistance = 50;

    if (Math.abs(distance) < minSwipeDistance) return;

    if (distance > 0) {
      // Swiped left
      handleNext();
    } else {
      // Swiped right
      handlePrevious();
    }
  };

  const mintNFT = async (pass: Pass) => {
    if (!cardRef.current || !connection || !walletProvider) {
        console.error('Required dependencies not initialized');
        return;
    }

    try {
        setMintingStates(prev => ({...prev, [pass._id]: true}));
        
        // Step 1: Generate and upload image first
        const cardElement = cardRef.current.querySelector('div');
        if (!cardElement) throw new Error('Card template not found');

        // Get wallet address first to fail early if not available
        const walletAddress = localStorage.getItem('address');
        if (!walletAddress) throw new Error('No wallet address found');
        const walletPubkey = new PublicKey(walletAddress);

        // Update the hidden template with the correct profile data
        const hiddenCard = cardRef.current;
        const profileImage = hiddenCard.querySelector('img[alt="profile"]') as HTMLImageElement;
        const username = hiddenCard.querySelector('p.font-mono') as HTMLElement;
        
        if (!profileImage || !username) throw new Error('Card template elements not found');

        // Update the hidden template
        profileImage.src = pass.image;
        username.textContent = pass.creatorName;
        
        // Wait for image loading
        await new Promise((resolve) => {
            if (profileImage.complete) resolve(null);
            else {
                profileImage.onload = () => resolve(null);
                profileImage.onerror = () => resolve(null);
            }
        });
        
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Generate and upload image
        const dataUrl = await toPng(hiddenCard);
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'card.png', { type: 'image/png' });
        
        const imageUrl = await uploadToIPFS(file);
        if (!imageUrl) throw new Error('Failed to upload image to IPFS');
        
        const metadataUrl = await uploadMetadataToIPFS(imageUrl, pass.creatorName);
        if (!metadataUrl) throw new Error('Failed to upload metadata to IPFS');

        // Step 2: Prepare transaction
        const latestBlockhash = await connection.getLatestBlockhash();
        
        // Check balance
        const balance = await connection.getBalance(walletPubkey);
        const rentExempt = await getMinimumBalanceForRentExemptMint(connection);
        const passPriceInLamports = pass.price * LAMPORTS_PER_SOL;
        const estimatedCost = rentExempt + passPriceInLamports + (0.05 * LAMPORTS_PER_SOL);

        if (balance < estimatedCost) {
            throw new Error(`Insufficient SOL balance. Need at least ${(estimatedCost / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
        }

        // Create mint account
        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);

        // Get token account address
        const [associatedTokenAddress] = await PublicKey.findProgramAddress(
            [
                walletPubkey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        // Get metadata address
        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        // Create transaction
        const transaction = new Transaction({
            feePayer: walletPubkey,
            recentBlockhash: latestBlockhash.blockhash,
        });

        // Add instructions
        transaction.add(
            SystemProgram.createAccount({
                fromPubkey: walletPubkey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            }),
            createInitializeMintInstruction(
                mintKeypair.publicKey,
                0,
                walletPubkey,
                walletPubkey,
            ),
            createAssociatedTokenAccountInstruction(
                walletPubkey,
                associatedTokenAddress,
                walletPubkey,
                mintKeypair.publicKey,
            ),
            createMintToInstruction(
                mintKeypair.publicKey,
                associatedTokenAddress,
                walletPubkey,
                1,
            ),
            createCreateMetadataAccountV3Instruction(
                {
                    metadata: metadataAddress,
                    mint: mintKeypair.publicKey,
                    mintAuthority: walletPubkey,
                    payer: walletPubkey,
                    updateAuthority: walletPubkey,
                },
                {
                    createMetadataAccountArgsV3: {
                        data: {
                            name: `${pass.creatorName} Access Card`,
                            symbol: 'CARD',
                            uri: metadataUrl,
                            sellerFeeBasisPoints: 0,
                            creators: null,
                            collection: null,
                            uses: null,
                        },
                        isMutable: true,
                        collectionDetails: null,
                    },
                },
            )
        );

        // Sign with mint keypair
        transaction.sign(mintKeypair);

        // Send transaction using wallet provider
        const signature = await walletProvider.sendTransaction(transaction, connection);
        await connection.confirmTransaction(signature);

        setToast({
            show: true,
            message: 'NFT minted successfully!',
            type: 'success'
        });

        setTimeout(() => {
            setToast({
                show: false,
                message: '',
                type: 'success'
            });
        }, 3000);

    } catch (err) {
        console.error('Error minting NFT:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to mint NFT';
        setToast({
            show: true,
            message: errorMessage,
            type: 'error'
        });
        setTimeout(() => {
            setToast({
                show: false,
                message: '',
                type: 'error'
            });
        }, 3000);
    } finally {
        setIsMinting(false);
        setMintingStates(prev => ({...prev, [pass._id]: false}));
    }
};
  return (
    <div className='min-h-screen pb-[120px] md:pb-0 bg-black'>
      <NavBar />
      
      {/* Hero Section */}
      <div className='container mx-auto px-4 pt-20 pb-32'>
        <div className='max-w-4xl mx-auto text-center space-y-6'>
          <h1 className='text-4xl md:text-7xl mt-[100px] font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'>
            Exclusive Creator Passes
          </h1>
          <p className='text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto'>
            Get unlimited access to premium content and unique experiences from your favorite creators.
          </p>
          <div className='bg-green-500/20 text-green-400 px-6 py-3 rounded-xl inline-block'>
            All creators passes are available here
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className='max-w-7xl mx-auto px-4 -mt-20 mb-20'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <div className='text-white text-xl animate-pulse'>Loading passes...</div>
          </div>
        ) : passes.length === 0 ? (
          <div className='text-white text-xl text-center py-20'>No passes available</div>
        ) : (
          <>
            <div className="relative overflow-x-auto">
              <div className="flex gap-8 md:grid md:grid-cols-3 md:gap-8 snap-x snap-mandatory">
                {(window.innerWidth <= 768 ? passes : paginatedPasses).map((pass, index) => (
                  <div 
                    key={index}
                    className="min-w-[280px] md:min-w-0 snap-center bg-[#1A1D1F] rounded-xl p-4 relative hover:bg-[#22262A] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-gray-400">{pass.creatorName}</span>
                    </div>
                    <div className="relative h-48 w-full mb-4">
                      <Image
                        src={pass.image}
                        alt={pass.creatorName}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className={`
                      bg-gradient-to-r from-gray-600 to-gray-700 p-3 mb-3
                    `}>
                      <h3 className="text-xl font-bold text-white">{pass.type}</h3>
                    </div>
                    <p className="text-white mb-2">{pass.price} SOL</p>
                    <p className="text-gray-400 text-sm mb-4">{pass.message}</p>
                    <div className="space-y-2 mb-4">
                      <h4 className="text-white font-semibold">Pass Rules:</h4>
                      <ul className="text-gray-300 space-y-1 text-sm">
                        {Object.entries(pass.rules).map(([key, value]) => (
                          <li key={key} className="flex items-center gap-2">
                            <span className={value ? 'text-green-500' : 'text-red-500'}>
                              {value ? '✓' : '✗'}
                            </span>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <button 
                      onClick={() => mintNFT(pass)}
                      disabled={mintingStates[pass._id]}
                      className='w-full bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white py-3 rounded-[40px] font-medium flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-50'
                    >
                      {mintingStates[pass._id] ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Minting...</span>
                        </>
                      ) : (
                        <>
                          <RiNftFill className="text-xl" />
                          <span>Mint NFT</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Pagination Controls - Only show on tablet and above */}
            {window.innerWidth > 768 && totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="text-white">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-blue-700 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 20 }}
              className="bg-[#1A1D1F] p-8 rounded-xl relative max-w-md mx-4"
            >
              <button 
                onClick={() => setShowPopup(false)}
                className="absolute top-2 right-2 text-gray-400 hover:text-white"
              >
                <IoMdClose size={18} />
              </button>
              <p className="text-purple-500 text-center text-lg">
                HEY! You might be looking for my contents? Please access [CREATORS] in navigation section
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Remove the old Swipe Modal and replace with Toast */}
      {showSwipeModal && (
        <div className="fixed top-2 right-2 md:hidden bg-orange-500 text-white p-4 rounded-md shadow-lg z-50">
          <p className="text-sm">Swipe left to see more passes</p>
        </div>
      )}

      {/* Hidden card template for conversion - Simplified version */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div ref={cardRef}>
            <div className="w-[300px] rounded-2xl overflow-hidden shadow-2xl bg-[#080e0e] p-6">
                <Image 
                    src='/sol.png'
                    alt="sol"
                    height={45}
                    width={45}
                    className='mx-auto'
                />
                <Image 
                    src="/empProfile.png"
                    alt="profile"
                    height={150}
                    width={150}
                    className='rounded-lg w-full h-48 object-cover my-4'
                />
                <div className='flex items-center justify-center gap-3'>
                    <p className='font-mono text-white font-bold'></p>
                </div>
            </div>
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed md:bottom-4 bottom-20 right-4 p-4 rounded-lg ${
          toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        } text-white`}>
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  )
}

export default PassesPage