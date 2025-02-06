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
} from '@solana/spl-token';
import { PROGRAM_ID as TOKEN_METADATA_PROGRAM_ID } from '@metaplex-foundation/mpl-token-metadata';
import { createCreateMetadataAccountV3Instruction } from '@metaplex-foundation/mpl-token-metadata';
import { Keypair, Signer } from '@solana/web3.js';

interface Profile {
  address: string;
  username: string;
  about: string;
  profileImage: string;
}

const PassesPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
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

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/profiles');
        const data = await res.json();
        if (data.profiles) {
          setProfiles(data.profiles);
          // Initialize minting states for all profiles
          const states = data.profiles.reduce((acc: any, profile: Profile) => {
            acc[profile.address] = false;
            return acc;
          }, {});
          setMintingStates(states);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();

    // Show swipe modal on mobile devices
    if (window.innerWidth <= 768) {
      setShowSwipeModal(true);
    }
  }, []);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? profiles.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === profiles.length - 1 ? 0 : prev + 1));
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

  const currentProfile = profiles[currentIndex];

  const getVisibleProfiles = () => {
    if (profiles.length <= 3) return profiles;
    
    let visibleProfiles = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % profiles.length;
      visibleProfiles.push(profiles[index]);
    }
    return visibleProfiles;
  };

  const mintNFT = async (profile: Profile) => {
    if (!cardRef.current || !connection || !walletProvider) return;
    setIsMinting(true);
    
    try {
        setMintingStates(prev => ({...prev, [profile.address]: true}));

        // Convert card to PNG and upload to IPFS
        const dataUrl = await toPng(cardRef.current);
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], 'card.png', { type: 'image/png' });
        const imageUrl = await uploadToIPFS(file);
        const metadataUrl = await uploadMetadataToIPFS(imageUrl, profile.username);

        const walletAddress = localStorage.getItem('address');
        if (!walletAddress) throw new Error('No wallet address found');
        const walletPubkey = new PublicKey(walletAddress);

        // Create mint account
        const mintKeypair = Keypair.generate();
        const lamports = await getMinimumBalanceForRentExemptMint(connection);
        
        // Get the token account address
        const [associatedTokenAddress] = await PublicKey.findProgramAddress(
            [
                walletPubkey.toBuffer(),
                TOKEN_PROGRAM_ID.toBuffer(),
                mintKeypair.publicKey.toBuffer(),
            ],
            TOKEN_PROGRAM_ID
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

        // Create all instructions
        const instructions = [
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
                mintKeypair.publicKey
            ),
            createMintToInstruction(
                mintKeypair.publicKey,
                associatedTokenAddress,
                walletPubkey,
                1,
                [],
            ),
            createCreateMetadataAccountV3Instruction({
                metadata: metadataAddress,
                mint: mintKeypair.publicKey,
                mintAuthority: walletPubkey,
                payer: walletPubkey,
                updateAuthority: walletPubkey,
            }, {
                createMetadataAccountArgsV3: {
                    data: {
                        name: `${profile.username} Access Card`,
                        symbol: 'PASS',
                        uri: metadataUrl,
                        sellerFeeBasisPoints: 0,
                        creators: null,
                        collection: null,
                        uses: null,
                    },
                    isMutable: true,
                    collectionDetails: null,
                },
            })
        ];

        const transaction = new Transaction();
        instructions.forEach(instruction => transaction.add(instruction));

        const latestBlockhash = await connection.getLatestBlockhash('confirmed');
        transaction.recentBlockhash = latestBlockhash.blockhash;
        transaction.feePayer = walletPubkey;

        // Sign with mint keypair first
        transaction.partialSign(mintKeypair);

        // Send transaction through wallet
        const signature = await walletProvider.sendTransaction(transaction, connection, {
            signers: [mintKeypair]
        });
        
        // Wait for confirmation
        const confirmation = await connection.confirmTransaction({
            signature,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
        });

        if (confirmation.value.err) {
            throw new Error('Transaction failed');
        }

        setToast({
            show: true,
            message: 'NFT minted successfully!',
            type: 'success'
        });

        setTimeout(() => {
            setToast({show: false, message: '', type: 'success'});
        }, 3000);

    } catch (err) {
        console.error('Error minting NFT:', err);
        setToast({
            show: true,
            message: 'Minting process terminated unexpectedly. Please try again later',
            type: 'error'
        });

        setTimeout(() => {
            setToast({show: false, message: '', type: 'error'});
        }, 3000);
    } finally {
        setIsMinting(false);
        setMintingStates(prev => ({...prev, [profile.address]: false}));
    }
};

  return (
    <div className='min-h-screen pb-[120px] md:pb-0 bg-gradient-to-b from-[#1A1D1F] to-[#2A2D2F]'>
      <NavBar />
      
      {/* Hero Section */}
      <div className='container mx-auto px-4 pt-20 pb-32'>
        <div className='max-w-4xl mx-auto text-center space-y-6'>
          <h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'>
            Exclusive Creator Passes
          </h1>
          <p className='text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto'>
            Get unlimited access to premium content and unique experiences from your favorite creators.
          </p>
          <div className='bg-green-500/20 text-green-400 px-6 py-3 rounded-xl inline-block'>
            All passes are free during initial release
          </div>
        </div>
      </div>

      {/* Cards Section */}
      <div className='relative max-w-6xl mx-auto px-4 -mt-20 mb-20'>
        {loading ? (
          <div className='flex justify-center items-center py-20'>
            <div className='text-white text-xl animate-pulse'>Loading passes...</div>
          </div>
        ) : profiles.length === 0 ? (
          <div className='text-white text-xl text-center py-20'>No passes available</div>
        ) : (
          <div className='flex items-center justify-center gap-6'>
            <button
              onClick={handlePrevious}
              className='hidden md:block text-white/50 hover:text-white transition-colors'
              disabled={profiles.length <= 1}
            >
              <FaArrowAltCircleLeft className='text-3xl' />
            </button>

            {/* Desktop View */}
            <div className='hidden md:flex gap-6'>
              {getVisibleProfiles().map((profile, index) => (
                <div 
                  key={index}
                  className={`transform transition-all duration-300 ${
                    index === 1 ? 'scale-105 hover:scale-110 z-10' : 'hover:scale-105'
                  }`}
                  onClick={() => setShowPopup(true)}
                >
                  <AccessCard
                    image={profile.profileImage || '/empProfile.png'}
                    name={profile.username}
                    className={index === 1 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gradient-to-r from-blue-400 to-purple-500"
                    }
                    onMint={() => mintNFT(profile)}
                    isMinting={mintingStates[profile.address]}
                  />
                </div>
              ))}
            </div>

            {/* Mobile View */}
            <div 
              className='md:hidden w-full'
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
            >
              <div className='flex justify-center'>
                <AccessCard
                  image={currentProfile?.profileImage || '/empProfile.png'}
                  name={currentProfile?.username}
                  className="bg-gradient-to-r from-blue-500 to-purple-600"
                  onMint={() => mintNFT(currentProfile)}
                  isMinting={mintingStates[currentProfile?.address || '']}
                />
              </div>
            </div>

            <button
              onClick={handleNext}
              className='hidden md:block text-white/50 hover:text-white transition-colors'
              disabled={profiles.length <= 1}
            >
              <FaArrowAltCircleRight className='text-3xl' />
            </button>
          </div>
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

      {/* Swipe Modal */}
      <AnimatePresence>
        {showSwipeModal && (
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
              className="bg-gray-900 p-8 rounded-xl relative max-w-md mx-4"
            >
              <button 
                onClick={() => setShowSwipeModal(false)}
                className="absolute top-2 right-2 text-gray-300 hover:text-white"
              >
                <IoMdClose size={15} />
              </button>
              <p className="text-purple-400 text-center text-lg">
                Please swipe to see more passes
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden card template for conversion */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div ref={cardRef}>
          <AccessCardTemplate 
            image={currentProfile?.profileImage || '/empProfile.png'} 
            name={currentProfile?.username || ''} 
          />
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

const AccessCard = ({ image, name, className, onMint, isMinting }: { 
  image: string, 
  name: string, 
  className: string,
  onMint: () => void,
  isMinting: boolean 
}) => (
  <div className={`w-[300px] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
    <div className='p-6 text-center'>
      <Image height={45} width={45} src='/sol.png' alt='sol' className='mx-auto' />
      <p className='font-cursive text-2xl text-white font-bold mt-4'>Access Card</p>
    </div>
    <div className='bg-slate-800 p-6 space-y-4'>
      <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
      <Image src={image} className='rounded-lg w-full h-48 object-cover' height={70} width={150} alt='profile' />
      <div className='flex items-center justify-center gap-3'>
        <RiHeart2Line className='text-white' />
        <p className='font-mono text-[0.7rem] md:text-[1rem] text-white font-bold'>{name}</p>
        <RiHeart2Line className='text-white' />
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
           onMint();
        }}
        disabled={isMinting}
        className='w-full bg-blue-700 hover:bg-blue-400 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity'
      >
        <RiNftFill className="text-xl" />
        {isMinting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  </div>
)

export default PassesPage
