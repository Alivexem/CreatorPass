'use client'
import React, { useState, useEffect, TouchEvent } from 'react'
import NavBar from '@/components/NavBar'
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import Link from 'next/link'
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaBridgeCircleCheck } from "react-icons/fa6";
import { SiFueler } from "react-icons/si";
import { RiVipCrown2Fill } from "react-icons/ri";
import { IoMdClose } from "react-icons/io";
import { motion, AnimatePresence } from "framer-motion";
import { IoChatbubbleEllipsesOutline } from "react-icons/io5";
import { RiGalleryFill } from "react-icons/ri";
import CreatorChat from '@/components/CreatorChat';
import { useRouter, usePathname } from 'next/navigation';
import { SwipeableCard } from '@/components/SwipeableCard';

interface Profile {
  address: string;
  username: string;
  about: string;
  profileImage: string;
}

const CreatorsPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSwipeModal, setShowSwipeModal] = useState(false);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [userAddress, setUserAddress] = useState<string>('');
  const [highlightedCreator, setHighlightedCreator] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);
  const [toast, setToast] = useState<{ show: boolean; message: string; type: string }>({ show: false, message: '', type: '' });
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/profiles');
        const data = await res.json();
        if (data.profiles) {
          // Get the highlight parameter from URL
          const params = new URLSearchParams(window.location.search);
          const highlightAddress = params.get('highlight');

          if (highlightAddress) {
            // Find the highlighted creator
            const highlightedProfile = data.profiles.find(
              (profile: Profile) => profile.address === highlightAddress
            );

            if (highlightedProfile) {
              // Set the current index to show the highlighted creator
              const index = data.profiles.findIndex(
                (profile: Profile) => profile.address === highlightAddress
              );
              setCurrentIndex(index >= 0 ? index : 0);
              setHighlightedCreator(highlightAddress);
            }
          }

          setProfiles(data.profiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();

    // Show swipe toast on mobile devices
    if (window.innerWidth <= 768) {
      setShowSwipeModal(true);
      setTimeout(() => {
        setShowSwipeModal(false);
      }, 8000);
    }

    const address = localStorage.getItem('address');
    if (address) {
      setUserAddress(address);
      // Fetch user profile when address is available
      fetchUserProfile(address);
    }
  }, [pathname]);

  const fetchUserProfile = async (address: string) => {
    try {
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'left' && currentIndex < profiles.length - 1) {
      setCurrentIndex(prev => prev + 1);
      // Reset states for new creator
      setSelectedChat(null);
    } else if (direction === 'right' && currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      // Reset states for new creator
      setSelectedChat(null);
    }
  };

  const handleChatClick = async (creatorAddress: string) => {
    try {
      const address = localStorage.getItem('address');
      if (!address) {
        setToast({
          show: true,
          message: 'Please connect your wallet first',
          type: 'warning'
        });
        return;
      }

      // Check if user has a profile
      const profileRes = await fetch(`/api/profile?address=${address}`);
      const profileData = await profileRes.json();

      if (!profileData.profile || !profileData.profile.username) {
        setToast({
          show: true,
          message: 'Please create a profile first',
          type: 'warning'
        });
        router.push('/dashboard');
        return;
      }

      // Set user profile if not already set
      if (!userProfile) {
        setUserProfile(profileData.profile);
      }

      if (window.innerWidth <= 768) {
        router.push(`/chat/${creatorAddress}`);
      } else {
        setSelectedChat(creatorAddress);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      setToast({
        show: true,
        message: 'Error starting chat',
        type: 'error'
      });
    }
  };

  const currentProfile = profiles[currentIndex];

  // Add highlight effect to the creator card if it matches the highlighted address
  const isHighlighted = currentProfile && currentProfile.address === highlightedCreator;

  const handleTouchStart = (e: TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!touchStart) return;

    const currentTouch = e.touches[0].clientX;
    const diff = touchStart - currentTouch;

    if (diff > 50 && currentIndex < profiles.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setTouchStart(0);
    } else if (diff < -50 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setTouchStart(0);
    }
  };

  const handleTouchEnd = () => {
    setTouchStart(0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black">
        <NavBar />
        <div className="flex justify-center items-center h-[80vh]">
          <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className='min-h-screen bg-black'>
      <NavBar />

      <div className='container mx-auto px-4 pt-20'>
        <motion.div
          className='max-w-4xl mx-auto text-center space-y-6'
          animate={{
            x: selectedChat ? -100 : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <div className='container mx-auto px-4 pt-20'>
            <div className='max-w-4xl mx-auto text-center space-y-6'>
              <h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'>
                Find Creators
              </h1>
              <p className='text-lg md:text-2xl text-gray-300 max-w-2xl mx-auto'>
                Chat creators, view their posts where you have access to like, comment, gift and interact in their private rooms.
              </p>
              <div className='bg-purple-500/20 text-purple-400 px-6 py-3 rounded-xl inline-block'>
                Access your favourite creators
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {profiles.length > 0 && (
        <div className="relative pb-[100px] mt-14 md:pb-0">
          <div 
            className="flex overflow-x-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {profiles.map((profile, index) => (
              <div
                key={profile.address}
                className={`w-full px-4 md:px-10 flex-shrink-0 transition-transform duration-300 ${
                  index === currentIndex ? 'block' : 'hidden md:block'
                }`}
              >
                <div className="max-w-[500px] mx-auto">
                  <SwipeableCard
                    onSwipe={handleSwipe}
                    isMobile={isMobile}
                  >
                    <div className="w-full bg-gray-800 rounded-xl p-6 shadow-xl relative">
                      <div className="relative h-72 w-full mb-4">
                        <Image
                          src={profile.profileImage || '/empProfile.png'}
                          fill
                          className="rounded-xl object-cover"
                          alt={profile.username}
                        />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{profile.username}</h2>
                      <p className="text-gray-300 mb-4">{profile.about}</p>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleChatClick(profile.address);
                        }}
                        className="mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2 w-full justify-center z-20 relative"
                      >
                        <IoChatbubbleEllipsesOutline className="text-xl" />
                        <span>Chat {profile.username}</span>
                      </button>
                      <Link href={`/creator/${profile.address}`} className="block relative z-20">
                        <button className="mt-2 bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors w-full flex items-center justify-center gap-2">
                          <RiGalleryFill className="text-xl" />
                          <span>View Posts</span>
                        </button>
                      </Link>
                    </div>
                  </SwipeableCard>
                </div>
              </div>
            ))}
          </div>

          {/* Update navigation arrows to work on all devices */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex === 0) {
                setCurrentIndex(profiles.length - 1);
              } else {
                setCurrentIndex(currentIndex - 1);
              }
            }}
            className="absolute left-2 md:left-10 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors z-30"
          >
            <FaArrowAltCircleLeft size={32} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (currentIndex === profiles.length - 1) {
                setCurrentIndex(0);
              } else {
                setCurrentIndex(currentIndex + 1);
              }
            }}
            className="absolute right-2 md:right-10 top-1/2 transform -translate-y-1/2 text-white/50 hover:text-white transition-colors z-30"
          >
            <FaArrowAltCircleRight size={32} />
          </button>
        </div>
      )}

      <div className='container mx-auto px-4 pb-32'>
        <div className='hidden md:grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
          <FeatureCard
            icon={<FaUnlockKeyhole className="text-4xl" />}
            title="Access Fun Creators"
            description="Connect with your favorite content creators"
          />
          <FeatureCard
            icon={<FaBridgeCircleCheck className="text-4xl" />}
            title="View Exclusive Content"
            description="Get access to unique and exclusive content"
          />
          <FeatureCard
            icon={<SiFueler className="text-4xl" />}
            title="Mint NFT Passes"
            description="Collect unique NFT passes from creators"
          />
          <FeatureCard
            icon={<RiVipCrown2Fill className="text-4xl" />}
            title="Engage and Have Fun"
            description="Interact and enjoy special experiences"
          />
        </div>
      </div>

      <AnimatePresence>
        {selectedChat && (
          <CreatorChat
            creatorAddress={selectedChat}
            userAddress={userAddress}
            creatorProfile={{
              username: profiles.find(p => p.address === selectedChat)?.username || 'Unknown',
              profileImage: profiles.find(p => p.address === selectedChat)?.profileImage || '/empProfile.png'
            }}
            userProfile={userProfile ? {
              username: userProfile.username,
              profileImage: userProfile.profileImage
            } : undefined}
            onClose={() => setSelectedChat(null)}
          />
        )}
      </AnimatePresence>

      {toast.show && (
        <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${toast.type === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
          }`}>
          {toast.message}
        </div>
      )}

      <Footer />
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className='bg-[#232629] border border-blue-500/30 p-8 rounded-xl hover:border-blue-500 transition-colors duration-300'>
    <div className='text-blue-400 mb-4'>{icon}</div>
    <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
    <p className='text-gray-300'>{description}</p>
  </div>
)

export default CreatorsPage;
