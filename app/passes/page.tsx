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
  holders: string[]; // Add this line
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
  const [platformAddress, setPlatformAddress] = useState<string | null>(null);
  const [highlightedCreatorPasses, setHighlightedCreatorPasses] = useState<Pass[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPasses, setFilteredPasses] = useState<Pass[]>([]);
  const [ownedPasses, setOwnedPasses] = useState<Set<string>>(new Set());

  const PASSES_PER_PAGE = 3;

  const sortAndFilterPasses = async (passes: Pass[], highlightedCreator: string | null) => {
    // Get all creator posts to check pass usage
    const usedPasses = new Set<string>();

    // Check each pass
    for (const pass of passes) {
      // Fetch creator's posts
      const res = await fetch(`/api/posts/user/${pass.creatorAddress}`);
      if (!res.ok) continue;
      
      const data = await res.json();
      const creatorPosts = data.posts || [];

      // Check if the pass type is used in any posts
      const isPassUsed = creatorPosts.some((post: any) => post.tier === pass.type);
      
      if (isPassUsed) {
        usedPasses.add(pass._id);
      }
    }

    // Filter out unused passes and sort by highlighted creator
    return passes
      .filter(pass => usedPasses.has(pass._id))
      .sort((a, b) => {
        if (highlightedCreator) {
          if (a.creatorAddress === highlightedCreator && b.creatorAddress !== highlightedCreator) return -1;
          if (b.creatorAddress === highlightedCreator && a.creatorAddress !== highlightedCreator) return 1;
        }
        return 0;
      });
  };

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const highlightedCreator = sessionStorage.getItem('highlightCreator');
        const res = await fetch('/api/passes');
        const data = await res.json();
        
        if (data.passes) {
          // Filter and sort passes based on usage
          const filteredAndSortedPasses = await sortAndFilterPasses(data.passes, highlightedCreator);
          setPasses(filteredAndSortedPasses);

          // Initialize minting states for filtered passes
          const states = filteredAndSortedPasses.reduce((acc: any, pass: Pass) => {
            acc[pass._id] = false;
            return acc;
          }, {});
          setMintingStates(states);
        }

        sessionStorage.removeItem('highlightCreator');
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

  useEffect(() => {
    const fetchPlatformAddress = async () => {
      try {
        const res = await fetch('/api/monetization');
        const data = await res.json();
        if (data.address) {
          setPlatformAddress(data.address);
          console.log('Platform address fetched successfully:', data.address); // Debug log
        } else {
          console.error('Platform address not found in response:', data); // Debug log
        }
      } catch (error) {
        console.error('Error fetching platform address:', error);
      }
    };

    fetchPlatformAddress();
  }, []);

  useEffect(() => {
    const filtered = passes.filter(pass =>
      pass.creatorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pass.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPasses(filtered);
  }, [searchTerm, passes]);

  useEffect(() => {
    const checkOwnedPasses = async () => {
      const address = localStorage.getItem('address');
      if (!address) return;

      try {
        const res = await fetch(`/api/passholders/check/${address}`);
        const data = await res.json();
        if (data.passes) {
          setOwnedPasses(new Set(data.passes.map((pass: Pass) => pass._id)));
        }
      } catch (error) {
        console.error('Error checking owned passes:', error);
      }
    };

    checkOwnedPasses();
  }, []);

  const totalPasses = passes.length;
  const totalPages = Math.ceil(totalPasses / PASSES_PER_PAGE);
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

  const handlePassSelect = (index: number) => {
    setCurrentPage(Math.ceil((index + 1) / PASSES_PER_PAGE));
    // Scroll to the selected pass
    const passElements = document.querySelectorAll('.pass-card');
    if (passElements[index]) {
      passElements[index].scrollIntoView({ behavior: 'smooth' });
    }
  };

  const mintNFT = async (pass: Pass) => {
    console.log('Starting mint process for pass:', pass);

    if (!isConnected) {
        console.log('Wallet not connected');
        setToast({
            show: true,
            message: 'Please connect your wallet first',
            type: 'error'
        });
        return;
    }

    if (!cardRef.current || !connection || !walletProvider) {
        console.error('Missing dependencies:', {
            hasCardRef: !!cardRef.current,
            hasConnection: !!connection,
            hasWalletProvider: !!walletProvider
        });
        return;
    }

    try {
        setMintingStates(prev => ({...prev, [pass._id]: true}));
        setIsMinting(true);
        
        console.log('Generating card image...');
        const hiddenCard = cardRef.current;
        if (!hiddenCard) {
            throw new Error('Card template not found');
        }

        // Pre-load the pass image using the native Image constructor
        console.log('Pre-loading pass image...');
        const preloadImage = new window.Image();
        await new Promise((resolve, reject) => {
            preloadImage.onload = resolve;
            preloadImage.onerror = reject;
            preloadImage.src = pass.image;
        });

        // Update template elements
        const profileImage = hiddenCard.querySelector('img[alt="profile"]') as HTMLImageElement;
        const username = hiddenCard.querySelector('p.font-mono') as HTMLElement;
        
        if (!profileImage || !username) {
            throw new Error('Card template elements not found');
        }

        // Update template with pass data
        profileImage.src = pass.image;
        username.textContent = pass.creatorName;
        
        // Wait for browser to paint updates
        await new Promise(resolve => setTimeout(resolve, 100));
        
        console.log('Generating card PNG...');
        const dataUrl = await toPng(hiddenCard, {
            quality: 0.95,
            pixelRatio: 2,
            cacheBust: true
        });

        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `${pass.creatorName.replace(/\s+/g, '_')}_access_card.png`, { type: 'image/png' });
        
        console.log('Uploading image to IPFS...');
        const imageUrl = await uploadToIPFS(file);
        if (!imageUrl) {
            console.error('IPFS image upload failed');
            throw new Error('Failed to upload image to IPFS');
        }
        console.log('Image uploaded:', imageUrl);
        
        console.log('Preparing metadata...');
        const metadata = {
            name: `${pass.creatorName} Access Card`,
            symbol: 'CARD',
            description: pass.message,
            image: imageUrl,
            price: pass.price, // Added price to metadata
            attributes: [
                { trait_type: 'Type', value: pass.type },
                { trait_type: 'Creator', value: pass.creatorName },
                { trait_type: 'Price', value: pass.price }, // Added price as attribute
                { trait_type: 'Fun Forum Access', value: pass.rules.funForumAccess },
                { trait_type: 'Like Comment Access', value: pass.rules.likeCommentAccess },
                { trait_type: 'Download Access', value: pass.rules.downloadAccess },
                { trait_type: 'Gift Access', value: pass.rules.giftAccess }
            ]
        };
        
        console.log('Uploading metadata to IPFS...');
        const metadataUrl = await uploadMetadataToIPFS(imageUrl, metadata);
        if (!metadataUrl) {
            console.error('IPFS metadata upload failed');
            throw new Error('Failed to upload metadata to IPFS');
        }
        console.log('Metadata uploaded:', metadataUrl);

        console.log('Getting wallet address...');
        const walletAddress = localStorage.getItem('address');
        if (!walletAddress) {
            console.error('No wallet address found in localStorage');
            throw new Error('No wallet address found');
        }
        
        const walletPubkey = new PublicKey(walletAddress);
        console.log('Using wallet:', walletPubkey.toString());
        
        // Create mint account
        console.log('Creating mint account...');
        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);

        // Get token account and metadata addresses
        console.log('Deriving token addresses...');
        const [associatedTokenAddress] = await PublicKey.findProgramAddress(
            [
                walletPubkey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            ASSOCIATED_TOKEN_PROGRAM_ID
        );

        const [metadataAddress] = PublicKey.findProgramAddressSync(
            [
                Buffer.from('metadata'),
                TOKEN_METADATA_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            TOKEN_METADATA_PROGRAM_ID
        );

        console.log('Creating transaction...');
        const transaction = new Transaction();
        const blockHash = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockHash.blockhash;
        transaction.feePayer = walletPubkey;

        // Calculate payment splits
        const totalPayment = Math.floor(pass.price * LAMPORTS_PER_SOL);
        const platformPayment = Math.floor(totalPayment * 0.2); // 20%
        const creatorPayment = totalPayment - platformPayment; // 80%

        if (!platformAddress) {
            throw new Error('Platform address not available');
        }

        // Add this validation after getting platformAddress
        console.log('Current platform address:', platformAddress); // Debug log

        let validPlatformAddress;
        try {
          // Validate and clean up platform address - it seems to be duplicated
          const cleanPlatformAddress = platformAddress?.substring(0, 44); // Take first 44 chars
          validPlatformAddress = new PublicKey(cleanPlatformAddress);
          console.log('Validated platform address:', validPlatformAddress.toString()); // Debug log
        } catch (error) {
          console.error('Invalid platform address:', error);
          setToast({
            show: true,
            message: 'Invalid platform address configuration',
            type: 'error'
          });
          return;
        }

        // Replace the single payment instruction with split payments
        const creatorPaymentInstruction = SystemProgram.transfer({
            fromPubkey: walletPubkey,
            toPubkey: new PublicKey(pass.creatorAddress),
            lamports: creatorPayment,
        });

        // Replace the platform payment instruction with validated address
        const platformPaymentInstruction = SystemProgram.transfer({
            fromPubkey: walletPubkey,
            toPubkey: validPlatformAddress, // Use validated address
            lamports: platformPayment,
        });

        transaction.add(creatorPaymentInstruction, platformPaymentInstruction);

        // Add the rest of the minting instructions
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
                            name: metadata.name,
                            symbol: metadata.symbol,
                            uri: metadataUrl,
                            sellerFeeBasisPoints: 0,
                            creators: [{
                                address: walletPubkey,
                                verified: true,
                                share: 100
                            }],
                            collection: null,
                            uses: null,
                        },
                        isMutable: true,
                        collectionDetails: null,
                    },
                },
            )
        );

        console.log('Signing transaction with mint keypair...');
        transaction.sign(mintKeypair);
        
        console.log('Sending transaction...');
        const signature = await walletProvider.sendTransaction(transaction, connection);
        console.log('Transaction sent:', signature);
        
        // Start a timer for success case - reduced to 5 seconds
        const successTimer = setTimeout(() => {
            console.log('No error after 5 seconds, assuming success');
            setToast({
                show: true,
                message: 'Transaction sent! Check your wallet for the NFT',
                type: 'success'
            });
            setIsMinting(false);
            setMintingStates(prev => ({...prev, [pass._id]: false}));
        }, 5000); // 5 seconds

        try {
            console.log('Confirming transaction...');
            const confirmation = await connection.confirmTransaction(signature, 'processed');
            console.log('Transaction confirmed:', confirmation);
            
            // Clear the success timer
            clearTimeout(successTimer);
            
            // After successful transaction, update profiles
            try {
                // Update creator's revenue in SOL (80% of total payment)
                await fetch('/api/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        address: pass.creatorAddress,
                        metricType: 'revenue',
                        value: pass.price * 0.8 // Pass the actual SOL amount, not lamports
                    })
                });

                // Update buyer's passes owned count
                const userAddress = localStorage.getItem('address');
                if (userAddress) {
                    await fetch('/api/profile', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            address: userAddress,
                            metricType: 'passesOwned',
                            value: 1
                        })
                    });
                }

                // Only show confirmation message if we haven't shown success message yet
                if (mintingStates[pass._id]) {
                    setToast({
                        show: true,
                        message: 'Access Card minted successfully!',
                        type: 'success'
                    });
                }
            } catch (profileError) {
                console.error('Error updating profiles:', profileError);
            }

            // After successful transaction confirmation, update the pass holders
            try {
              const response = await fetch(`/api/passholders/${pass._id}`, { // Updated endpoint
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  holderAddress: walletAddress
                }),
              });
          
              if (!response.ok) {
                console.warn('Failed to update pass holders:', await response.text());
              }
            } catch (error) {
              console.warn('Error updating pass holders:', error);
            }

        } catch (confirmError) {
            // Clear the success timer if we get a confirmation error
            clearTimeout(successTimer);
            
            // Don't throw the confirmation error, just log it
            console.warn('Confirmation status unknown:', confirmError);
            
            // If we're still minting, show a more user-friendly message
            if (mintingStates[pass._id]) {
                setToast({
                    show: true,
                    message: 'Transaction sent! Check your wallet for the NFT',
                    type: 'success'
                });
            }
        }

    } catch (err) {
        console.error('Transaction error:', err);
        setToast({
            show: true,
            message: err instanceof Error ? err.message : 'Failed to mint Access Card',
            type: 'error'
        });
    } finally {
        setIsMinting(false);
        setMintingStates(prev => ({...prev, [pass._id]: false}));
        // Increase toast display time to 5 seconds
        setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 5000);
    }
};

  const renderPassButton = (pass: Pass) => {
    const isOwned = ownedPasses.has(pass._id);
    
    return (
      <button 
        onClick={() => !isOwned && mintNFT(pass)}
        disabled={mintingStates[pass._id] || isOwned}
        className={`w-full py-3 rounded-[40px] font-medium flex items-center justify-center gap-2 transition-all duration-200 
          ${isOwned 
            ? 'bg-gray-600 text-gray-300' 
            : 'bg-gradient-to-r from-yellow-500 to-purple-600 hover:from-yellow-600 hover:to-purple-700 text-white'
          } disabled:opacity-50`}
      >
        {mintingStates[pass._id] ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Minting...</span>
          </>
        ) : isOwned ? (
          <>
            <span>Owned</span>
          </>
        ) : (
          <>
            <RiNftFill className="text-xl" />
            <span>Mint NFT</span>
          </>
        )}
      </button>
    );
  };

  return (
    <div className='min-h-screen pb-[120px] md:pb-0 bg-black'>
      <NavBar />
      
      {/* Hero Section */}
      <div className='container mx-auto mt-14 mb-10 px-4 pt-20'>
        <div className='max-w-4xl mx-auto text-center space-y-6'>
          <div className='md:w-[350px] w-[90vw] mx-auto bg-[#080e0e] rounded-xl p-4 border border-gray-800'>
            <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-4'>
              Available Passes
            </h1>
            <input
              type="text"
              placeholder="Search passes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg mb-4"
            />
            <div className="h-[300px] overflow-y-auto">
              {filteredPasses.map((pass, index) => (
                <div
                  key={pass._id}
                  onClick={() => handlePassSelect(index)}
                  className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                >
                  <Image
                    src={pass.image}
                    alt={pass.creatorName}
                    width={40}
                    height={40}
                    className="rounded-lg"
                  />
                  <div className="text-left">
                    <p className="text-white font-semibold">{pass.type} - {pass.creatorName}</p>
                    <p className="text-gray-400 text-sm truncate w-[200px]">
                      {pass.message}
                    </p>
                    <p className="text-blue-400 text-sm">{pass.price} SOL</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Highlighted Creator Passes */}
      {highlightedCreatorPasses.length > 0 && (
        <div className='max-w-7xl mx-auto px-4 mb-12'>
          <h2 className='text-2xl font-bold text-white mb-6'>
            Available Creator Passes
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {highlightedCreatorPasses.map((pass, index) => (
              // Render pass card with highlighted styling
              <div key={index} className="bg-[#1A1D1F] rounded-xl p-4 relative hover:bg-[#22262A] transition-colors border-2 border-purple-500">
                {/* ...existing pass card content... */}
              </div>
            ))}
          </div>
        </div>
      )}

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
            <div className="relative overflow-x-auto mt-36">
              <div className="flex gap-8 md:grid md:grid-cols-3 md:gap-8 snap-x snap-mandatory">
                {(window.innerWidth <= 768 ? passes : paginatedPasses).map((pass, index) => {
                  const highlightedCreator = sessionStorage.getItem('highlightCreator');
                  const isHighlighted = highlightedCreator && pass.creatorAddress === highlightedCreator;
                  
                  return (
                    <div 
                      key={index}
                      className={`min-w-[280px] md:min-w-0 snap-center bg-[#1A1D1F] rounded-xl p-4 relative hover:bg-[#22262A] transition-colors ${
                        isHighlighted ? 'border-2 border-purple-500' : ''
                      }`}
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
                      {renderPassButton(pass)} {/* Replace the old button with this line */}
                    </div>
                  );
                })}
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
      {/* {showSwipeModal && (
        <div className="fixed top-2 right-2 md:hidden bg-orange-500 text-white p-4 rounded-md shadow-lg z-50">
          <p className="text-sm">Swipe left to see more passes</p>
        </div>
      )} */}

      {/* Hidden card template for conversion - Simplified version */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div ref={cardRef}>
          <div className="w-[300px] h-[450px] rounded-2xl overflow-hidden shadow-2xl bg-[#080e0e] p-6">
            <Image 
              src='/sol.png'
              alt="sol"
              width={45}
              height={45}
              className='mx-auto mb-4'
              priority
            />
            <div className="relative w-full h-48 mb-4">
              <Image 
                src="/empProfile.png"
                alt="profile"
                fill
                className='rounded-lg object-cover'
                priority
              />
            </div>
            <div className='flex items-center justify-center gap-3'>
              <p className='font-mono text-white font-bold text-xl'></p>
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