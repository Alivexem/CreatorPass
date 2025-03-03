'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRegCheckCircle, FaDatabase, FaClock } from "react-icons/fa";
import { SiThefinals, SiSolana } from "react-icons/si";
import { MdDeleteForever } from "react-icons/md";
import { RiHeart2Line } from "react-icons/ri";
import { IoTicketSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Content from './Content';
import ProfileUpdate from './ProfileUpdate';
import { Switch } from '@headlessui/react';
import { AnimatePresence, motion } from 'framer-motion';

interface MainbarProps {
  showContent: boolean;
  showProfile: boolean;
  setToast: (toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

interface Profile {
  username: string;
  profileImage: string;
  address: string;
  about: string;
  totalPasses: number;
  totalRevenue: number;
  topPass?: {
    category: 'Bronze' | 'Silver' | 'Gold';
    mintCount: number;
  };
}

interface Pass {
  _id: string;
  category: 'Bronze' | 'Silver' | 'Gold' | 'Free';
  price: number;
  expirationDays: number | null;
  imageUrl: string;
  mintCount: number;
  createdAt: string;
  address: string;
  ownerUsername: string;
  ownerImage: string;
}

interface PassFormData {
  category: 'Bronze' | 'Silver' | 'Gold';
  price: number;
  cardTag: string;
}

const CreatePassModal = ({ isOpen, onClose, onSubmit }: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: PassFormData) => void;
}) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PassFormData>({
    category: 'Bronze',
    price: 0,
    cardTag: '',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div 
            className="bg-[#1A1D1F] p-6 rounded-xl w-full max-w-md mx-4 relative"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <IoMdClose size={24} />
            </button>

            {step === 1 ? (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white">Select Pass Category</h3>
                <div className="grid grid-cols-3 gap-4">
                  {['Bronze', 'Silver', 'Gold'].map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setFormData(prev => ({ ...prev, category: category as 'Bronze' | 'Silver' | 'Gold' }));
                        setStep(2);
                      }}
                      className={`p-4 rounded-lg ${
                        formData.category === category 
                          ? 'bg-purple-600' 
                          : 'bg-gray-700 hover:bg-gray-600'
                      } text-white`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white">Configure Pass Details</h3>
                
                <div>
                  <label className="text-gray-300 block mb-2">Price (SOL)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                    className="w-full bg-gray-700 rounded-lg p-3 text-white"
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-2">Card Tag (max 20 words)</label>
                  <textarea
                    value={formData.cardTag}
                    onChange={(e) => {
                      const words = e.target.value.trim().split(/\s+/);
                      if (words.length <= 20) {
                        setFormData(prev => ({ ...prev, cardTag: e.target.value }));
                      }
                    }}
                    placeholder="Add a message for your fans (e.g., 'Exclusive access to weekly live sessions and premium content')"
                    className="w-full bg-gray-700 rounded-lg p-3 text-white h-24 resize-none"
                  />
                  <p className="text-sm text-gray-400 mt-1">
                    {formData.cardTag.trim().split(/\s+/).length}/20 words
                  </p>
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => onSubmit(formData)}
                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg"
                  >
                    Create Pass
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Mainbar = ({ showContent, showProfile, setToast }: MainbarProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showNftToast, setShowNftToast] = useState(false);
  const [showCreatePass, setShowCreatePass] = useState(false);
  const [passes, setPasses] = useState<Pass[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const address = localStorage.getItem('address');
        if (!address) return;

        const profileRes = await fetch(`/api/profile?address=${address}`);
        const { profile } = await profileRes.json();
        
        if (profile) {
          setProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const fetchPasses = async () => {
      try {
        const address = localStorage.getItem('address');
        if (!address) return;

        const res = await fetch(`/api/passes?address=${address}`);
        const data = await res.json();
        setPasses(data.passes || []);
      } catch (error) {
        console.error('Error fetching passes:', error);
      }
    };

    fetchPasses();
  }, []);

  const handleNftClick = () => {
    setShowNftToast(true);
    setTimeout(() => setShowNftToast(false), 3000);
  };

  const handleCreatePass = async (formData: PassFormData) => {
    try {
      const address = localStorage.getItem('address');
      if (!profile) throw new Error('Profile not found');
      
      // Check if user already has this category of pass
      const existingPass = passes.find(p => p.category === formData.category);
      if (existingPass) {
        setToast({
          show: true,
          message: `You already have a ${formData.category} pass`,
          type: 'error',
        });
        return;
      }

      const res = await fetch('/api/passes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          address,
          ownerUsername: profile.username,
          ownerImage: profile.profileImage,
          imageUrl: profile.profileImage,
        }),
      });

      if (!res.ok) throw new Error('Failed to create pass');
      
      // Refresh passes
      const newRes = await fetch(`/api/passes?address=${address}`);
      const data = await newRes.json();
      setPasses(data.passes || []);
      setShowCreatePass(false);
    } catch (error) {
      console.error('Error creating pass:', error);
      setToast({
        show: true,
        message: 'Failed to create pass',
        type: 'error'
      });
    }
  };

  const handleDeletePass = async (passId: string) => {
    try {
      const res = await fetch(`/api/passes/${passId}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete pass');

      setPasses(prev => prev.filter(pass => pass._id !== passId));
      setToast({
        show: true,
        message: 'Pass deleted successfully!',
        type: 'success',
      });
    } catch (error) {
      setToast({
        show: true,
        message: 'Failed to delete pass',
        type: 'error',
      });
    }
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
                  onClick={() => setShowCreatePass(true)}
                  disabled={passes.length >= 3}
                  className='flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 transition-all py-3 px-4 rounded-xl text-white font-semibold flex items-center justify-center gap-2'
                >
                  <IoTicketSharp size={20} />
                  {passes.length >= 3 ? 'Max Passes (3)' : 'Create Pass'}
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
                    value: profile?.totalPasses || 0,
                    description: 'Track your NFT pass sales',
                    icon: <SiSolana className='text-purple-500 text-2xl' />,
                    bgColor: 'bg-purple-500/20'
                  },
                  {
                    title: 'Revenue',
                    value: `${profile?.totalRevenue || 0} SOL`,
                    description: 'Monitor your earnings',
                    icon: <SiSolana className='text-green-500 text-2xl' />,
                    bgColor: 'bg-green-500/20'
                  },
                  {
                    title: 'Top Pass',
                    value: profile?.topPass ? `${profile.topPass.category} (${profile.topPass.mintCount})` : 'None',
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

          {/* Passes Grid */}
          <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
            {passes.map((pass) => (
              <div key={pass._id} className='bg-gray-800 rounded-xl p-4'>
                <div className='relative h-32 w-full mb-4'>
                  <Image
                    src={pass.imageUrl}
                    fill
                    className='rounded-lg object-cover'
                    alt='pass'
                  />
                </div>
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <span className='text-white font-bold'>{pass.category}</span>
                    <span className='text-purple-400'>{pass.price} SOL</span>
                  </div>
                  <div className='flex justify-between items-center text-sm text-gray-400'>
                    <span>Mints: {pass.mintCount}</span>
                    {pass.expirationDays && (
                      <span>Expires: {pass.expirationDays} days</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeletePass(pass._id)}
                    className='w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg mt-4'
                  >
                    Delete Pass
                  </button>
                </div>
              </div>
            ))}
          </div>

          <CreatePassModal
            isOpen={showCreatePass}
            onClose={() => setShowCreatePass(false)}
            onSubmit={handleCreatePass}
          />
        </div>
      )}
    </div>
  );
};

export default Mainbar;
