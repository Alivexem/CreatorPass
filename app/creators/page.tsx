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

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const res = await fetch('/api/profiles');
        const data = await res.json();
        if (data.profiles) {
          setProfiles(data.profiles);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();

    // Show modal on mobile devices
    if (window.innerWidth <= 768) {
      setShowSwipeModal(true);
    }
  }, []);

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

  const currentProfile = profiles[currentIndex];

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#1A1D1F] to-[#2A2D2F]'>
      <NavBar />
      
      <div className='container mx-auto px-4 pt-20'>
        <div className='max-w-4xl mx-auto text-center space-y-6'>
          <h1 className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'>
            Meet Your Favourite Creators
          </h1>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-[500px]'>
          <p className='text-white text-2xl animate-pulse'>Loading creators...</p>
        </div>
      ) : (
        <div className='relative max-w-6xl mx-auto px-4 py-20'>
          <div className='flex items-center justify-center gap-8'>
            <button 
              onClick={handlePrevious}
              className='hidden md:block text-white/50 hover:text-white transition-colors'
              disabled={profiles.length <= 1}
            >
              <FaArrowAltCircleLeft className='text-3xl' />
            </button>

            {currentProfile && (
              <Link href={`/creator/${currentProfile.address}`}>
                <div 
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className='w-[300px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600 transform hover:scale-105 transition-all duration-300'
                >
                  <div className='p-6 text-center'>
                    <Image height={45} width={45} src='/sol.png' alt='sol' className='mx-auto' />
                    <p className='font-cursive text-2xl text-white font-bold mt-4'>Creator Card</p>
                  </div>
                  <div className='bg-slate-800 p-6 space-y-4'>
                    <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
                    <Image 
                      src={currentProfile.profileImage || '/smile.jpg'} 
                      className='rounded-lg w-full h-48 object-cover' 
                      height={70} 
                      width={150} 
                      alt='profile' 
                    />
                    <div className='flex items-center justify-center gap-3'>
                      <RiHeart2Line className='text-white' />
                      <p className='font-mono text-white font-bold'>{currentProfile.username}</p>
                      <RiHeart2Line className='text-white' />
                    </div>
                    <p className='text-gray-300 text-center text-sm'>{currentProfile.about}</p>
                  </div>
                </div>
              </Link>
            )}

            <button 
              onClick={handleNext}
              className='hidden md:block text-white/50 hover:text-white transition-colors'
              disabled={profiles.length <= 1}
            >
              <FaArrowAltCircleRight className='text-3xl' />
            </button>
          </div>
        </div>
      )}

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
              Please swipe to see more creators
            </p>
          </div>
        </div>
      )}

      <div className='container mx-auto px-4 pb-32'>
        <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'>
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
