'use client'
import React, { useState, useEffect, TouchEvent, useRef } from 'react'
import NavBar from '@/components/NavBar'
import Image from 'next/image';
import { RiNftFill } from "react-icons/ri";
import Footer from '@/components/Footer';
import { FaArrowAltCircleLeft, FaArrowAltCircleRight } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { toPng } from 'html-to-image';
import { uploadToIPFS, uploadMetadataToIPFS } from '@/utils/ipfsService';
import { AccessCardTemplate } from '@/utils/cardTemplate';
import { useAppKit, useAppKitProvider, useAppKitAccount, Transaction, SystemProgram, PublicKey, Provider } from '../../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
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
  category: 'Bronze' | 'Silver' | 'Gold';
  price: number;
  expirationDays: number | null;
  imageUrl: string;
  mintCount: number;
  createdAt: string;
  address: string;
  ownerUsername: string;
  ownerImage: string;
}

const PassesPage = () => {
  const [passes, setPasses] = useState<Pass[]>([]);
  const [loading, setLoading] = useState(true);
  const [mintingStates, setMintingStates] = useState<{[key: string]: boolean}>({});
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);
  const [showMintModal, setShowMintModal] = useState(false);
  const [isMinting, setIsMinting] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(0);
  const [showSwipeToast, setShowSwipeToast] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
    show: false,
    message: '',
    type: 'success'
  });
  const [isConfirming, setIsConfirming] = useState(false);
  const [mintStatus, setMintStatus] = useState<{
    message: string;
    type: 'error' | 'success' | null;
  }>({
    message: '',
    type: null
  });
  const [platformFee, setPlatformFee] = useState<string>('');

  const { connection } = useAppKitConnection();
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { address } = useAppKitAccount();

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const res = await fetch('/api/passes');
        const data = await res.json();
        if (data.passes) {
          setPasses(data.passes);
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
      setShowSwipeToast(true);
      setTimeout(() => setShowSwipeToast(false), 3000);
    }
  }, []);

  useEffect(() => {
    const fetchPlatformAddress = async () => {
      try {
        const res = await fetch('/api/monetization');
        const data = await res.json();
        setPlatformFee(data.account);
      } catch (error) {
        console.error('Error fetching platform fee address:', error);
      }
    };
    fetchPlatformAddress();
  }, []);

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 50 && currentIndex < passes.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTouchStart(0);
    } else if (diff < -50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTouchStart(0);
    }
  };

  const mintNFT = async (pass: Pass) => {
    if (!cardRef.current || !connection || !walletProvider || !address) return;
    setIsConfirming(true);
    setMintStatus({ message: '', type: null });
    setIsMinting(true);
    
    try {
        const latestBlockhash = await connection.getLatestBlockhash();
        setMintingStates(prev => ({...prev, [pass._id]: true}));

        const hiddenCard = cardRef.current;
        const profileImage = hiddenCard.querySelector('img[alt="profile"]') as HTMLImageElement;
        const username = hiddenCard.querySelector('p.font-mono') as HTMLElement;
        
        if (profileImage && username) {
            profileImage.src = pass.imageUrl || '/empProfile.png';
            username.textContent = pass.ownerUsername;
            
            await new Promise((resolve) => {
                if (profileImage.complete) resolve(null);
                else {
                    profileImage.onload = () => resolve(null);
                    profileImage.onerror = () => resolve(null);
                }
            });
            
            await new Promise(resolve => setTimeout(resolve, 100));
            
            const dataUrl = await toPng(hiddenCard);
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            const file = new File([blob], 'card.png', { type: 'image/png' });
            const imageUrl = await uploadToIPFS(file);
            const metadataUrl = await uploadMetadataToIPFS(imageUrl, pass.ownerUsername);
            
            const walletPubkey = new PublicKey(address);

            // Check wallet balance
            const balance = await connection.getBalance(walletPubkey);
            const rentExempt = await getMinimumBalanceForRentExemptMint(connection);
            const estimatedCost = rentExempt + (0.05 * LAMPORTS_PER_SOL);

            if (balance < estimatedCost) {
                throw new Error(`Insufficient SOL balance. Need at least ${(estimatedCost / LAMPORTS_PER_SOL).toFixed(4)} SOL`);
            }

            // Calculate fees
            const totalAmount = pass.price * LAMPORTS_PER_SOL;
            const creatorAmount = totalAmount * 0.8; // 80% to creator
            const platformAmount = totalAmount * 0.2; // 20% to platform

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

            const createMintAccountIx = SystemProgram.createAccount({
                fromPubkey: walletPubkey,
                newAccountPubkey: mintKeypair.publicKey,
                space: MINT_SIZE,
                lamports,
                programId: TOKEN_PROGRAM_ID,
            });

            const initializeMintIx = createInitializeMintInstruction(
                mintKeypair.publicKey,
                0,
                walletPubkey,
                walletPubkey,
            );

            const createAssociatedTokenAccountIx = createAssociatedTokenAccountInstruction(
                walletPubkey,
                associatedTokenAddress,
                walletPubkey,
                mintKeypair.publicKey,
            );

            const mintToIx = createMintToInstruction(
                mintKeypair.publicKey,
                associatedTokenAddress,
                walletPubkey,
                1,
            );

            const createMetadataIx = createCreateMetadataAccountV3Instruction(
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
                            name: `${pass.ownerUsername} Access Card`,
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
            );

            const transferToCreatorIx = SystemProgram.transfer({
                fromPubkey: walletPubkey,
                toPubkey: new PublicKey(pass.address),
                lamports: creatorAmount,
            });

            const transferToPlatformIx = SystemProgram.transfer({
                fromPubkey: walletPubkey,
                toPubkey: new PublicKey(platformFee),
                lamports: platformAmount,
            });

            const transaction = new Transaction({
                feePayer: walletPubkey,
                recentBlockhash: latestBlockhash.blockhash,
            });

            transaction.add(
                createMintAccountIx,
                initializeMintIx,
                createAssociatedTokenAccountIx,
                mintToIx,
                createMetadataIx,
                transferToCreatorIx,
                transferToPlatformIx,
            );

            transaction.sign(mintKeypair);

            const signature = await walletProvider.sendTransaction(transaction, connection);
            await connection.confirmTransaction(signature);

            // Update pass mint count
            await fetch(`/api/passes/${pass._id}/mint`, { method: 'POST' });

            setMintStatus({
                message: 'NFT minted successfully!',
                type: 'success'
            });
        }
    } catch (err) {
        console.error('Error minting NFT:', err);
        const errorMessage = err instanceof Error ? err.message : 'Failed to mint NFT';
        setMintStatus({
            message: errorMessage,
            type: 'error'
        });
    } finally {
        setIsConfirming(false);
        setIsMinting(false);
        setMintingStates(prev => ({...prev, [pass._id]: false}));
        
        // Only close modal on success
        if (mintStatus.type === 'success') {
            setTimeout(() => {
                setShowMintModal(false);
                setMintStatus({ message: '', type: null }); // Reset status
            }, 2000);
        }
    }
  };

  const handleMintClick = (pass: Pass) => {
    setSelectedPass(pass);
    setShowMintModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
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
            All passes are free during initial release
          </div>
        </div>
      </div>

      {/* Mobile Swipe Toast */}
      <AnimatePresence>
        {showSwipeToast && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white px-4 py-2 rounded-lg shadow-lg md:hidden"
          >
            Swipe to view more passes
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pass Cards with Navigation */}
      <div className="relative pb-[200px] md:pb-0">
        <div 
          className="flex overflow-x-hidden md:grid md:grid-cols-3 gap-8"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
        >
          {passes.map((pass, index) => (
            <div
              key={pass._id}
              className={`w-full px-10 flex-shrink-0 transition-transform duration-300 ${
                index === currentIndex ? 'block' : 'hidden md:block'
              }`}
            >
              <AccessCard
                pass={pass}
                onMint={() => handleMintClick(pass)}
                isMinting={mintingStates[pass._id]}
              />
            </div>
          ))}
        </div>

        {/* Navigation Arrows (Mobile Only) */}
        <div className="md:hidden">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white disabled:opacity-30"
            disabled={currentIndex === 0}
          >
            <FaArrowAltCircleLeft size={32} />
          </button>
          <button
            onClick={() => setCurrentIndex(Math.min(passes.length - 1, currentIndex + 1))}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white disabled:opacity-30"
            disabled={currentIndex === passes.length - 1}
          >
            <FaArrowAltCircleRight size={32} />
          </button>
        </div>
      </div>

      {/* Hidden template for NFT generation */}
      <div ref={cardRef} className="hidden">
        <AccessCardTemplate 
          image={selectedPass?.imageUrl || '/empProfile.png'} 
          name={selectedPass?.ownerUsername || ''} 
        />
      </div>

      {/* Mint Modal */}
      <AnimatePresence>
        {showMintModal && selectedPass && (
          <motion.div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div 
              className="bg-[#1A1D1F] p-6 rounded-xl w-full max-w-md mx-4"
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">Confirm Purchase</h3>
                <button 
                  onClick={() => {
                      setShowMintModal(false);
                      setMintStatus({ message: '', type: null }); // Reset status when manually closing
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  <IoMdClose size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400">Creator</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Image 
                      src={selectedPass.ownerImage || '/empProfile.png'} 
                      width={24} 
                      height={24} 
                      className="rounded-full"
                      alt="creator" 
                    />
                    <p className="text-white">{selectedPass.ownerUsername}</p>
                  </div>
                </div>
                <div className="bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-400">Pass Details</p>
                  <p className="text-white mt-2">{selectedPass.category} - {selectedPass.price} SOL</p>
                  {selectedPass.expirationDays && (
                    <p className="text-gray-400 text-sm mt-1">Expires after {selectedPass.expirationDays} days</p>
                  )}
                </div>
                
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => setShowMintModal(false)}
                    disabled={isConfirming}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg hover:bg-gray-600 disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => mintNFT(selectedPass)}
                    disabled={isConfirming}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50 relative"
                  >
                    {isConfirming ? (
                        <>
                            <span className="opacity-0">Confirm Purchase</span>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            </div>
                        </>
                    ) : (
                        'Confirm Purchase'
                    )}
                  </button>
                </div>
              </div>

              {/* Status Message */}
              {mintStatus.message && (
                  <div className={`mt-4 p-3 rounded-lg text-white text-center ${
                      mintStatus.type === 'error' ? 'bg-red-600' : 'bg-green-600'
                  }`}>
                      {mintStatus.message}
                  </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
};

const AccessCard = ({ pass, onMint, isMinting }: { 
  pass: Pass;
  onMint: () => void;
  isMinting: boolean;
}) => (
  <div className='w-full bg-gray-700 rounded-2xl overflow-hidden shadow-2xl'>
    <div className='p-6'>
      <div className='flex justify-between items-center mb-4'>
        <Image src='/sol.png' alt='sol' width={24} height={24} />
        <div className='text-right'>
          <p className='text-white font-bold'>{pass.category} Pass</p>
          <p className='text-white/70 text-sm'>{pass.price} SOL</p>
        </div>
      </div>
      {pass.expirationDays && (
        <p className='text-sm text-white/70 mb-2'>Expires after {pass.expirationDays} days</p>
      )}
      <div className='flex items-center gap-2 mb-4'>
        <Image 
          src={pass.ownerImage || '/empProfile.png'} 
          width={30} 
          height={30} 
          className='rounded-full'
          alt='creator' 
        />
        <p className='text-white text-sm'>Created by {pass.ownerUsername}</p>
      </div>
      <div className='relative h-48 w-full mb-4'>
        <Image 
          src={pass.imageUrl || '/empProfile.png'} 
          fill
          className='rounded-lg object-cover' 
          alt='pass' 
        />
      </div>
      <div className='flex items-center justify-between'>
        <Image src='/whiteLogo.png' alt='logo' width={60} height={20} />
        <div className='text-right'>
          <p className='text-white/70 text-sm'>Mints: {pass.mintCount}</p>
        </div>
      </div>
    </div>
    <button 
      onClick={onMint}
      disabled={isMinting}
      className='w-full bg-purple-700 hover:bg-green-600 disabled:bg-gray-700 text-white py-3 font-medium flex items-center justify-center gap-2'
    >
      <RiNftFill className="text-xl" />
      {isMinting ? 'Minting...' : 'Mint NFT'}
    </button>
  </div>
);

export default PassesPage;
