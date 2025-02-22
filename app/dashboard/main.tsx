'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRegCheckCircle, FaDatabase, FaClock } from "react-icons/fa";
import { SiThefinals, SiSolana } from "react-icons/si";
import { MdDeleteForever } from "react-icons/md";
import { RiHeart2Line } from "react-icons/ri";
import { IoTicketSharp } from "react-icons/io5";
import Content from './Content';
import ProfileUpdate from './ProfileUpdate';

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
  const [showNftToast, setShowNftToast] = useState(false);

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

  const handleNftClick = () => {
    setShowNftToast(true);
    setTimeout(() => setShowNftToast(false), 3000);
  };

  return (
    <div className='bg-black min-h-screen pb-[100px] md:pb-4'>
      {/* NFT Toast */}
      {showNftToast && (
        <div className='fixed top-5 right-5 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'>
          <p>Premium Class NFT passes will be available on next update after MVP! 🚀</p>
        </div>
      )}

      {/* Show Content when showContent is true */}
      {showContent && <Content setToast={setToast} />}
      
      {/* Show Profile when showProfile is true */}
      {showProfile && <ProfileUpdate setToast={setToast} />}
      
      {/* Show Dashboard when neither Content nor Profile is showing */}
      {!showContent && !showProfile && (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
          {/* Header */}
          <div className='mb-10'>
            <h1 className='text-4xl font-bold text-purple-500 flex items-center gap-3'>
              Creator Dashboard
              <FaDatabase />
            </h1>
            <p className='text-gray-400 mt-2'>Manage your content and NFT passes</p>
          </div>

          <div className='grid lg:grid-cols-12 gap-8'>
            {/* Left Column - Creator Card */}
            <div className='lg:col-span-4 space-y-6'>
              {/* Creator Pass Preview */}
              <div className='md:bg-gradient-to-r from-[#75bde7] via-[#22a1eb] to-[#75bde7] bg-gray-500 p-6 rounded-2xl shadow-xl'>
                <div className='bg-slate-800 rounded-xl p-4'>
                  <div className='flex justify-between items-center mb-4'>
                    <Image src='/sol.png' alt='sol' width={24} height={24} />
                    <p className='text-white font-bold'>Access Card</p>
                  </div>
                  <div className='relative h-48 w-full mb-4'>
                    <Image
                      src={profile?.profileImage || '/emptProfile.jpg'}
                      fill
                      className='rounded-lg object-cover'
                      alt='profile'
                    />
                  </div>
                  <div className='flex items-center justify-between'>
                    <Image src='/whiteLogo.png' alt='logo' width={60} height={20} />
                    <p className='text-white font-mono'>{profile?.username || 'Anonymous'}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className='flex gap-4'>
                <button
                  onClick={handleNftClick}
                  className='flex-1 bg-purple-600 hover:bg-purple-700 transition-all py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2'
                >
                  <IoTicketSharp size={20} />
                  Create Pass
                </button>
                <button
                  className='flex-1 bg-gray-700 py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2 cursor-not-allowed opacity-60'
                >
                  <MdDeleteForever size={20} />
                  Delete Pass
                </button>
              </div>
            </div>

            {/* Right Column - Stats */}
            <div className='lg:col-span-8 space-y-6'>
              {/* Main Stats */}
              <div className='grid md:grid-cols-3 gap-6'>
                {[
                  {
                    title: 'Total Passes',
                    description: 'Track your NFT pass sales',
                    icon: <SiSolana className='text-purple-500 text-2xl' />,
                    bgColor: 'bg-purple-500/20'
                  },
                  {
                    title: 'Revenue',
                    description: 'Monitor your earnings',
                    icon: <SiSolana className='text-green-500 text-2xl' />,
                    bgColor: 'bg-green-500/20'
                  },
                  {
                    title: 'Top Pass',
                    description: 'Your best performing pass',
                    icon: <SiSolana className='text-blue-500 text-2xl' />,
                    bgColor: 'bg-blue-800/20'
                  }
                ].map((stat, index) => (
                  <div key={index} className='bg-[#272B30] p-6 rounded-xl'>
                    <div className='flex justify-between items-center mb-4'>
                      <div className={`${stat.bgColor} p-3 rounded-lg`}>
                        {stat.icon}
                      </div>
                      <span className='text-gray-400 text-sm'>Coming Soon</span>
                    </div>
                    <h3 className='text-white text-lg font-semibold'>{stat.title}</h3>
                    <p className='text-gray-400 text-sm mt-2'>{stat.description}</p>
                  </div>
                ))}
              </div>

              {/* Quick Stats */}
              <div className='grid md:grid-cols-3 gap-6'>
                {[
                  {
                    title: 'Total Followers',
                    icon: <SiThefinals className='text-green-800' />,
                    bgColor: 'bg-green-200',
                    iconBg: 'bg-green-400'
                  },
                  {
                    title: 'Last Posted',
                    icon: <FaClock className='text-yellow-600' />,
                    bgColor: 'bg-yellow-100',
                    iconBg: 'bg-yellow-300'
                  },
                  {
                    title: 'Passes Owned',
                    icon: <FaRegCheckCircle className='text-green-600' />,
                    bgColor: 'bg-green-100',
                    iconBg: 'bg-green-400'
                  }
                ].map((stat, index) => (
                  <div key={index} 
                    className={`${stat.bgColor} rounded-xl p-4 flex items-center gap-4`}
                  >
                    <div className={`${stat.iconBg} h-12 w-12 rounded-full flex items-center justify-center`}>
                      {stat.icon}
                    </div>
                    <div>
                      <p className='text-sm text-gray-600'>{stat.title}</p>
                      <p className='font-bold text-gray-900'>coming soon</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mainbar;
