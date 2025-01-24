'use client'
import React, { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { RiNftFill } from "react-icons/ri";

interface Profile {
  address: string;
  username: string;
  about: string;
  profileImage: string;
}

const PassesPage = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentMobileIndex, setCurrentMobileIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const cardsPerPage = 3;

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
  }, []);

  const handleNext = () => {
    if (window.innerWidth >= 768) {
      const totalPages = Math.ceil(profiles.length / cardsPerPage);
      setCurrentPage((prev) => (prev + 1) % totalPages);
    } else {
      setCurrentMobileIndex((prev) => (prev + 1) % profiles.length);
    }
  };

  const handlePrevious = () => {
    if (window.innerWidth >= 768) {
      const totalPages = Math.ceil(profiles.length / cardsPerPage);
      setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
    } else {
      setCurrentMobileIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
    }
  };

  const getCurrentPageProfiles = () => {
    const startIndex = currentPage * cardsPerPage;
    return profiles.slice(startIndex, startIndex + cardsPerPage);
  };

  const currentMobileProfile = profiles[currentMobileIndex];

  return (
    <div className='min-h-screen bg-gradient-to-b from-[#1A1D1F] to-[#2A2D2F]'>
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
              className='text-white/50 hover:text-white transition-colors'
              disabled={profiles.length <= (window.innerWidth >= 768 ? cardsPerPage : 1)}
            >
              <FaArrowAltCircleLeft className='text-3xl' />
            </button>

            {/* Mobile View */}
            <div className='md:hidden'>
              {currentMobileProfile && (
                <div className='transform hover:scale-105 transition-all duration-300'>
                  <AccessCard
                    image={currentMobileProfile.profileImage || '/smile.jpg'}
                    name={currentMobileProfile.username}
                    className="bg-gradient-to-r from-blue-500 to-purple-600"
                  />
                </div>
              )}
            </div>

            {/* Desktop View */}
            <div className='hidden md:flex gap-6'>
              {getCurrentPageProfiles().map((profile, index) => (
                <div 
                  key={index}
                  className={`transform transition-all duration-300 ${
                    index === 1 ? 'scale-105 hover:scale-110 z-10' : 'hover:scale-105'
                  }`}
                >
                  <AccessCard
                    image={profile.profileImage || '/smile.jpg'}
                    name={profile.username}
                    className={index === 1 
                      ? "bg-gradient-to-r from-blue-500 to-purple-600"
                      : "bg-gradient-to-r from-blue-400 to-purple-500"
                    }
                  />
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className='text-white/50 hover:text-white transition-colors'
              disabled={profiles.length <= (window.innerWidth >= 768 ? cardsPerPage : 1)}
            >
              <FaArrowAltCircleRight className='text-3xl' />
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

const AccessCard = ({ image, name, className }: { image: string, name: string, className: string }) => (
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
      <button disabled className='w-full bg-gray-700/50 text-gray-300 py-3 rounded-xl font-medium flex items-center justify-center gap-2 cursor-not-allowed'>
        <RiNftFill className="text-xl" />
        Mint NFT
      </button>
    </div>
  </div>
)

export default PassesPage
