'use client'
import React, { useState, useEffect } from 'react'
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
    setCurrentIndex((prev) => (prev + 1) % profiles.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + profiles.length) % profiles.length);
  };

  const currentProfile = profiles[currentIndex];

  return (
    <div className='bg-[#1A1D1F]'>
      <NavBar />
      <div className='flex justify-center items-center mt-10'>
      <div className='flex justify-center items-center mt-10'>
      <div className='flex items-center font-bold my-5 text-[2.8rem] text-gray-200'>
          <p>Meet Your Favourite Creators</p>
        </div>
      </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-[500px]'>
          <p className='text-white text-2xl animate-pulse'>Loading creators...</p>
        </div>
      ) : (
        <div className='flex justify-center gap-x-10 items-center my-10 mt-14'>
          <button 
            onClick={handlePrevious}
            className='hover:scale-110 transition-transform'
            disabled={profiles.length <= 1}
          >
            <FaArrowAltCircleLeft className='text-[2.5rem] mb-4 text-white' />
          </button>

          {currentProfile && (
            <Link href={`/creator/${currentProfile.address}`}>
              <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#e7f0f5] via-[#dfeef7] to-[#e7f0f5] w-[350px] h-[500px]'>
                <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
                  <Image src='/whiteLogo.png' alt='logo' height={10} width={100} />
                  <div className='relative w-[250px] h-[120px]'>
                    <Image 
                      src={currentProfile.profileImage || '/smile.jpg'} 
                      className='rounded-md'
                      fill
                      style={{objectFit: 'cover'}}
                      alt='profile' 
                    />
                  </div>
                  <div className='flex items-center gap-x-4'>
                    <RiHeart2Line className='text-white' />
                    <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>
                      {currentProfile.username}
                    </p>
                    <RiHeart2Line className='text-white' />
                  </div>
                </div>
                <div className='h-[30%] flex-col w-[100%] bg-gray-800 mt-4 rounded-lg flex justify-center items-center text-white'>
                  <FaFire />
                  <p className='text-center text-[0.9rem] p-3'>{currentProfile.about}</p>
                </div>
              </div>
            </Link>
          )}

          <button 
            onClick={handleNext}
            className='hover:scale-110 transition-transform'
            disabled={profiles.length <= 1}
          >
            <FaArrowAltCircleRight className='text-[2.5rem] mt-4 text-white' />
          </button>
        </div>
      )}

      <div className='flex justify-evenly items-center text-white text-[1.4rem]'>
              <div className='bg-[#272B30] border-[4px] border-[#823ac5] h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
                <FaUnlockKeyhole />
                <p className='text-center'>Access Fun Creators
                </p>
              </div>
              <div className='bg-[#272B30] border-[4px] border-[#823ac5] h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
                <FaBridgeCircleCheck />
                <p className='text-center'>
                  View Exclusive Contents
                </p>
              </div>
              <div className='bg-[#272B30] border-[4px] border-[#823ac5] h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
                 <SiFueler />
                <p className='text-center'>
                  Mint NFT Passes
                </p>
              </div>
              <div className='bg-[#272B30] border-[4px] border-[#823ac5] h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
                <RiVipCrown2Fill />
                <p className='text-center'>
                  Engage and have fun     
                </p>
              </div>
            </div>

      <Footer />
    </div>
  );
};

export default CreatorsPage;
