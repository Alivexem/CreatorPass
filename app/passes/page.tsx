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
    // Set minting state for specific profile
    setMintingStates(prev => ({...prev, [profile.address]: true}));

      // Convert card to PNG
      const dataUrl = await toPng(cardRef.current);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const file = new File([blob], 'card.png', { type: 'image/png' });

      // Upload image to IPFS
      const imageUrl = await uploadToIPFS(file);
      
      // Upload metadata to IPFS
      const metadataUrl = await uploadMetadataToIPFS(imageUrl, profile.username);

      const walletAddress = localStorage.getItem('address');
      if (!walletAddress) throw new Error('No wallet address found');

      const latestBlockhash = await connection.getLatestBlockhash('finalized');

      // Create transaction
      const transaction = new Transaction({
        feePayer: new PublicKey(walletAddress),
        recentBlockhash: latestBlockhash?.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(walletAddress),
          toPubkey: new PublicKey(profile.address),
          lamports: 10000000, // 0.01 SOL as minting fee
        })
      );

      const signature = await walletProvider.sendTransaction(transaction, connection);
      console.log('NFT minted:', signature);
      
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
      let errorMessage = 'Failed to mint NFT. Please try again.';
      
      if (err instanceof Error) {
        if (err.message.includes('Blockhash not found')) {
          errorMessage = 'Transaction expired. Please try again.';
        }
      }
      
      setToast({
        show: true,
        message: errorMessage,
        type: 'error'
      });

      setTimeout(() => {
        setToast({show: false, message: '', type: 'error'});
      }, 3000);
    } finally {
      setIsMinting(false);
    // Reset minting state for specific profile regardless of success/failure
    setMintingStates(prev => ({...prev, [profile.address]: false}));
    }
  };

  return (
    <div className='min-h-screen pb-[60px] md:pb-0 bg-gradient-to-b from-[#1A1D1F] to-[#2A2D2F]'>
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
      <div className='relative max-w-6xl mx-auto px-4 -mt-20'>
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

            {/* Mobile View */}
            <div 
              className='md:hidden w-full max-w-[300px] mb-[60px]'
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={() => setShowPopup(true)}
            >
              <div className='bg-gradient-to-r from-[#75bde7] via-[#22a1eb] to-[#75bde7] p-6 rounded-2xl'>
                <div className='bg-[#1A1D1F] rounded-xl p-6 space-y-6'>
                  <div className='text-center'>
                    <p className='text-3xl font-bold text-white mb-2'>{currentProfile.username}</p>
                    <p className='text-gray-400'>Access Card</p>
                  </div>
                  <Image src={currentProfile.profileImage || '/smile.jpg'} className='rounded-lg w-full h-48 object-cover' height={70} width={150} alt='profile' />
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      mintNFT(currentProfile);
                    }}
                    disabled={mintingStates[currentProfile.address]}
                    className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity'
                  >
                    <RiNftFill className="text-xl" />
                    {mintingStates[currentProfile.address] ? 'Minting...' : 'Mint NFT'}
                  </button>
                </div>
              </div>
            </div>

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
                    image={profile.profileImage || '/smile.jpg'}
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
      {showPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D1F] p-8 rounded-xl relative max-w-md mx-4">
            <button 
              onClick={() => setShowPopup(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <IoMdClose size={24} />
            </button>
            <p className="text-white text-center text-lg">
              HEY! searching for contents? you can access `CREATORS` in navigation section
            </p>
          </div>
        </div>
      )}

      {/* Swipe Modal */}
      {showSwipeModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#1A1D1F] p-8 rounded-xl relative max-w-md mx-4">
            <button 
              onClick={() => setShowSwipeModal(false)}
              className="absolute top-2 right-2 text-gray-400 hover:text-white"
            >
              <IoMdClose size={24} />
            </button>
            <p className="text-white text-center text-lg">
              Please swipe to see more passes
            </p>
          </div>
        </div>
      )}

      {/* Hidden card template for conversion */}
      <div style={{ position: 'absolute', left: '-9999px' }}>
        <div ref={cardRef}>
          <AccessCardTemplate 
            image={currentProfile?.profileImage || '/smile.jpg'} 
            name={currentProfile?.username || ''} 
          />
        </div>
      </div>

      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg ${
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
        <p className='font-mono text-white font-bold'>{name}</p>
        <RiHeart2Line className='text-white' />
      </div>
      <button 
        onClick={(e) => {
          e.stopPropagation();
          onMint();
        }}
        disabled={isMinting}
        className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity'
      >
        <RiNftFill className="text-xl" />
        {isMinting ? 'Minting...' : 'Mint NFT'}
      </button>
    </div>
  </div>
)

export default PassesPage
