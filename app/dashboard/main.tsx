'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRegCheckCircle } from "react-icons/fa";
import { SiThefinals } from "react-icons/si";
import { SiSolana } from "react-icons/si";
import { FaDatabase } from "react-icons/fa";
import { MdDeleteForever } from "react-icons/md";
import { RiHeart2Line } from "react-icons/ri";
import { FaClock } from "react-icons/fa6";
import { FaImages } from "react-icons/fa6";
import Content from './Content';
import { TiRefresh } from "react-icons/ti";
import ProfileUpdate from './ProfileUpdate'; // Import ProfileUpdate

interface MainbarProps {
  showContent: boolean;
  showProfile: boolean;
  setToast: (toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

interface Profile {
  username: string;
  profileImage: string;
  address: string;
}

const Mainbar = ({ showContent, showProfile, setToast }: MainbarProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const address = localStorage.getItem('address');
        if (!address) return;

        const res = await fetch(`/api/profile?address=${address}`);
        const data = await res.json();
        
        if (data.profile) {
          setProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  return (
    <div className='bg-[#1A1D1F] w-[100%] h-auto overflow-hidden flex justify-start items-center flex-col'>
      <div className='text-center font-bold pt-[30px] mb-[45px] flex justify-center items-center flex-col'>
        <div className='flex items-center text-[2.8rem] text-purple-500'>
          <p>Manage Contents </p> <FaDatabase className='mx-3' /> <p>and NFTs</p>
        </div>
      </div>

      {!showContent && !showProfile && (
        <>
          <div className='flex gap-x-10 items-center'>
            <div className='w-[237px] bg-[#272B30] h-[200px] rounded-[25px] flex justify-center items-center'>
              <div className='flex justify-center items-center flex-col text-white gap-y-2'>
                <SiSolana className='text-[1.7rem]' />
                <p className='text-[1.3rem]'>Total passes sold</p>
                <p className='text-[16px] font-medium'>36</p>
              </div>
            </div>
            <div className='w-[237px] bg-[#272B30] h-[200px] rounded-[25px] flex justify-center items-center'>
              <div className='flex justify-center items-center flex-col text-white gap-y-2'>
                <SiSolana className='text-[1.7rem]' />
                <p className='text-[1.3rem]'>Revenue Generated</p>
                <p className='text-[16px] font-medium'>$70,000</p>
              </div>
            </div>
            <div className='w-[237px] bg-[#272B30] h-[200px] rounded-[25px] flex justify-center items-center'>
              <div className='flex justify-center items-center flex-col text-white gap-y-2'>
                <SiSolana className='text-[1.7rem]' />
                <p className='text-[1.3rem]'>Top selling pass</p>
                <p className='text-[16px] font-medium'>Gold</p>
              </div>
            </div>
          </div>
          <div className='my-[20px] h-auto w-[100%] p-2 flex justify-evenly items-center'>
            <div className='w-[237px] h-[80px] gap-x-2 bg-gray-200 rounded-2xl shadow-md p-3 flex items-center'>
              <div className='bg-green-200 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                <SiThefinals size={22} className='text-green-800' />
              </div>
              <div>
                <p className='text-[0.8rem] font-thin text-black'>Total Followers</p>
                <p className='font-bold text-black'>73</p>
              </div>
            </div>
            <div className='w-[237px] h-[80px] gap-x-2 bg-gray-200 rounded-2xl shadow-md p-3 flex items-center'>
              <div className='bg-yellow-300 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                <FaClock size={22} className='text-yellow-600' />
              </div>
              <div>
                <p className='text-[0.8rem] font-thin text-black'>Last posted</p>
                <p className='font-bold text-black'>4 days ago</p>
              </div>
            </div>
            <div className='w-[237px] h-[80px] gap-x-2 bg-gray-200 rounded-2xl shadow-md p-3 flex items-center'>
              <div className='bg-green-400 h-[40px] w-[40px] rounded-full flex justify-center items-center'>
                <FaRegCheckCircle size={22} className='text-green-600' />
              </div>
              <div>
                <p className='text-[0.8rem] font-thin text-black'>Passes owned</p>
                <p className='font-bold text-black'>49</p>
              </div>
            </div>
          </div>
          <div className='flex items-center justify-center gap-x-10'>
            <div className='flex flex-col justify-center items-center my-10'>
              <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[250px] h-[350px]'>
                <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
                  <div className='relative w-[30px] h-[30px]'>
                    <Image src='/sol.png' alt='sol' fill style={{objectFit: 'contain'}} />
                  </div>
                  <p className='bg-slate-800 p-2 rounded-xl text-white text-[1.2rem] font-bold mt-4'>Access Card</p>
                </div>
                <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
                  <div className='relative w-[70px] h-[10px] mb-2'>
                    <Image src='/whiteLogo.png' alt='logo' fill style={{objectFit: 'contain'}} />
                  </div>
                  <div className='relative w-[180px] h-[80px]'>
                    <Image 
                      src={profile?.profileImage || '/smile.jpg'} 
                      className='rounded-md'
                      fill
                      style={{objectFit: 'cover'}}
                      alt='profile' 
                    />
                  </div>
                  <div className='flex items-center gap-x-4'>
                    <RiHeart2Line className='text-white' />
                    <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>
                      {profile?.username || 'Anonymous'}
                    </p>
                    <RiHeart2Line className='text-white' />
                  </div>
                </div>
              </div>
              <button className='bg-gray-500 text-[0.8rem] cursor-not-allowed flex items-center gap-x-3 font-bold border-black border-[1px] text-white px-4 py-2 mt-4'>
                <MdDeleteForever size={25} />Delete Pass
              </button>
            </div>
          </div>
          <div className='flex justify-center items-center my-7 mb-[40px]'>
            <button className='bg-gray-600 font-bold cursor-not-allowed text-white h-[55px] w-[200px] rounded-[15px]'>Create new pass</button>
          </div>
        </>
      )}

      {showContent && <Content setToast={setToast} />}
      {showProfile && <ProfileUpdate setToast={setToast} />}
    </div>
  );
};

export default Mainbar;
