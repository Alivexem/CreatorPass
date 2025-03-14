'use client'
import React, { useState, useEffect, TouchEvent, useRef } from 'react'
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
import { useRouter } from 'next/navigation';

interface Profile {
  address: string;
  username: string;
  about: string;
  profileImage: string;
  isAdultContent?: boolean;
  country?: string;
}

const CreatorsPage = () => {
  const creatorCardRef = useRef<HTMLDivElement>(null);
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
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [contentFilter, setContentFilter] = useState<'all' | '18+' | 'normal'>('all');
  const router = useRouter();

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/profiles', {
          cache: 'no-store'
        });
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
  }, []);

  useEffect(() => {
    const filtered = profiles.filter(profile => {
      const matchesSearch = profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.about.toLowerCase().includes(searchTerm.toLowerCase());
      
      switch (contentFilter) {
        case '18+':
          return matchesSearch && profile.isAdultContent;
        case 'normal':
          return matchesSearch && !profile.isAdultContent;
        default:
          return matchesSearch;
      }
    });
    setFilteredProfiles(filtered);
  }, [searchTerm, profiles, contentFilter]);

  const fetchUserProfile = async (address: string) => {
    try {
      const res = await fetch(`/api/profile?address=${address}`, {
        cache: 'no-store'
      });
      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
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
      const profileRes = await fetch(`/api/profile?address=${address}`, {
        cache: 'no-store'
      });
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

  const handleCreatorSelect = (index: number) => {
    setCurrentIndex(index);
    // Check if on mobile and scroll to card
    if (window.innerWidth <= 768 && creatorCardRef.current) {
      setTimeout(() => {
        creatorCardRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 100);
    }
  };

  const currentProfile = profiles[currentIndex];

  // Add highlight effect to the creator card if it matches the highlighted address
  const isHighlighted = currentProfile && currentProfile.address === highlightedCreator;

  return (
    <div className='min-h-screen bg-black'>
      <NavBar />

      <div className='container mx-auto px-4 pt-20'>
        <motion.div
          className='md:max-w-6xl mx-auto'
          animate={{
            x: selectedChat ? -100 : 0
          }}
          transition={{ duration: 0.5 }}
        >
          <div className='flex flex-col md:flex-row gap-8 items-start justify-center'>
            {/* Search and Filter Box */}
             <div className='w-[85vw] md:w-[500px] bg-[#080e0e] rounded-xl p-4 border border-gray-800 relative md:sticky top-[25%] mt-10 md:mt-0 mb-10'>
              <h1 className='text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text mb-4'>
                Find Creators
              </h1>
              <input
                type="text"
                placeholder="Search creators..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-900 text-white px-4 py-2 rounded-lg mb-4"
              />
              <div className="mb-4">
                <label className="text-white mb-2 block">Content Filter</label>
                <select 
                  value={contentFilter}
                  onChange={(e) => setContentFilter(e.target.value as 'all' | '18+' | 'normal')}
                  className="w-full bg-gray-900 pr-2 text-white px-4 py-2 rounded-lg"
                >
                  <option value="all">All Content</option>
                  <option value="18+">18+ Only</option>
                  <option value="normal">Normal Only</option>
                </select>
              </div>
              <div className="md:h-[150px] h-[200px] overflow-y-auto">
                {filteredProfiles.map((profile, index) => (
                  <div
                    key={profile.address}
                    onClick={() => handleCreatorSelect(index)}
                    className="flex items-center gap-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer"
                  >
                    <Image
                      src={profile.profileImage || '/empProfile.png'}
                      alt={profile.username}
                      width={40}
                      height={40}
                      className="rounded-[50%] object-fit"
                    />
                    <div className="text-left">
                      <p className="text-white font-semibold">{profile.username}</p>
                      <p className="text-gray-400 text-sm truncate w-[200px]">
                        {profile.about}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div> 

            {/* Creator Card */}
            <div className='flex justify-center items-center w-full' ref={creatorCardRef}>
              {loading ? (
                <div className='flex justify-center items-center h-[500px]'>
                  <p className='text-white text-2xl animate-pulse'>Loading creators...</p>
                </div>
              ) : (
                <div className='relative md:max-w-6xl px-4 pb-20 md:pt-20'>
                  <div className='flex items-center justify-center gap-8'>
                    <button
                      onClick={handlePrevious}
                      className='text-white/50 hover:text-white z-50 -mr-[40px] md:-mr-30 md:-mr-0 transition-colors'
                      disabled={profiles.length <= 1}
                    >
                      <FaArrowAltCircleLeft className='text-3xl' />
                    </button>

                    {currentProfile && (
                      <motion.div
                        className="flex flex-col justify-center items-center"
                        animate={{
                          x: selectedChat ? -100 : 0
                        }}
                        transition={{ duration: 0.5 }}
                       >
                        <div
                          onTouchStart={handleTouchStart}
                          onTouchMove={handleTouchMove}
                          onTouchEnd={handleTouchEnd}
                          className={`w-[78vw] md:w-[500px] rounded-2xl overflow-hidden shadow-2xl 
                            bg-gradient-to-r from-blue-500 to-purple-600 
                            transform hover:scale-105 transition-all duration-300
                            ${isHighlighted ? 'ring-4 ring-yellow-400 animate-pulse' : ''}`}
                        >
                          <div className='bg-[#080e0e] p-6 space-y-4'>
                            <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
                            <Image
                              src={currentProfile.profileImage || '/empProfile.png'}
                              className='rounded-lg w-full h-60 object-cover'
                              height={70}
                              width={150}
                              alt='profile'
                            />
                            <div className='flex flex-col items-start justify-start gap-3'>
                              <div className='flex items-center justify-between w-full'>
                                <div className='flex items-center gap-3'>
                                  <RiHeart2Line className='text-white' />
                                  <p className='font-mono text-[0.7rem] md:text-[1rem] text-white font-bold'>
                                    {currentProfile.username}
                                  </p>
                                  <RiHeart2Line className='text-white' />
                                </div>
                                {currentProfile.isAdultContent && (
                                  <div className="bg-red-600 text-white px-2 py-1 rounded-md text-sm font-bold animate-pulse">
                                    18+
                                  </div>
                                )}
                              </div>
                              {currentProfile.country && (
                                <p className="text-gray-400 text-sm flex items-center gap-2">
                                  <span>📍</span> {currentProfile.country}
                                </p>
                              )}
                              <p className='text-gray-300 text-left text-sm'>{currentProfile.about}</p>
                            </div>
                            <div className="space-y-2 pt-4">
                              <button
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleChatClick(currentProfile.address);
                                }}
                                className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                              >
                                <IoChatbubbleEllipsesOutline className="text-xl" />
                                <span>Chat {currentProfile.username}</span>
                              </button>
                              
                              <Link href={`/creator/${currentProfile.address}`} className="block">
                                <button className="w-full bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition-colors flex items-center justify-center gap-2">
                                  <RiGalleryFill className="text-xl" />
                                  <span>View Posts</span>
                                </button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <button
                      onClick={handleNext}
                      className='text-white/50 hover:text-white z-50 -ml-[40px] md:-ml-0 transition-colors'
                      disabled={profiles.length <= 1}
                    >
                      <FaArrowAltCircleRight className='text-3xl' />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

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
