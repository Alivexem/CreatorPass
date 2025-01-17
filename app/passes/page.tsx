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
  const [loading, setLoading] = useState(true);
  const cardsPerPage = 4;

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
    const totalPages = Math.ceil(profiles.length / cardsPerPage);
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const handlePrevious = () => {
    const totalPages = Math.ceil(profiles.length / cardsPerPage);
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  const getCurrentPageProfiles = () => {
    const startIndex = currentPage * cardsPerPage;
    return profiles.slice(startIndex, startIndex + cardsPerPage);
  };

  return (
    <div className='bg-[#1A1D1F] relative'>
      <div className='absolute top-[170px] right-4'>
        <div className='bg-green-500 text-white px-6 py-2 rounded-lg text-sm'>
          All passes are free on this first release
        </div>
      </div>
      <NavBar />
      <div className='flex justify-center items-center mt-10'>
      <div className='flex items-center font-bold my-5 text-[2.8rem] text-gray-200'>
          <p>Mint Exclusive Passes</p>
        </div>
      </div>

      <div className='flex items-center justify-center my-14 gap-x-10'>
        {loading ? (
          <div className="text-white text-xl">Loading passes...</div>
        ) : profiles.length === 0 ? (
          <div className="text-white text-xl">No passes available</div>
        ) : (
          <>
            <button
              onClick={handlePrevious}
              className='hover:scale-110 transition-transform'
              disabled={profiles.length <= cardsPerPage}
            >
              <FaArrowAltCircleLeft className='text-[2.5rem] mb-4 text-white' />
            </button>

            <div className='flex gap-x-8'>
              {getCurrentPageProfiles().map((profile, index) => (
                <div key={index} className='flex flex-col justify-center items-center my-10'>
                  <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[250px] h-[350px]'>
                    <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
                      <Image height={30} width={30} src='/sol.png' alt='sol' />
                      <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.2rem] font-bold mt-4'>Access Card</p>
                    </div>
                    <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
                      <Image src='/whiteLogo.png' alt='logo' height={10} width={70} />
                      <div className='w-[180px] h-[80px] relative'>
                        <Image 
                          src={profile.profileImage || '/smile.jpg'} 
                          className='rounded-md'
                          fill
                          style={{objectFit: 'cover'}}
                          alt='profile'
                        />
                      </div>
                      <div className='flex items-center gap-x-4'>
                        <RiHeart2Line className='text-white' />
                        <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>{profile.username}</p>
                        <RiHeart2Line className='text-white' />
                      </div>
                    </div>
                  </div>
                  <button disabled className='bg-gray-500 cursor-not-allowed flex items-center gap-x-4 text-[0.8rem] font-bold border-black border-[1px] text-white px-4 py-2 mt-4'><RiNftFill size={25} />Mint NFT</button>
                </div>
              ))}
            </div>

            <button
              onClick={handleNext}
              className='hover:scale-110 transition-transform'
              disabled={profiles.length <= cardsPerPage}
            >
              <FaArrowAltCircleRight className='text-[2.5rem] mt-4 text-white' />
            </button>
          </>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default PassesPage
