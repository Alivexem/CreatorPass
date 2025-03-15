'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { FaRegCheckCircle, FaDatabase, FaClock, FaInfoCircle } from "react-icons/fa";
import { SiThefinals, SiSolana } from "react-icons/si";
import { MdDeleteForever } from "react-icons/md";
import { RiHeart2Line } from "react-icons/ri";
import { IoTicketSharp } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import Content from './Content';
import ProfileUpdate from './ProfileUpdate';
import PassCreateModal from '@/components/NFTMintModal';

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

interface Pass {
  _id: string;
  creatorAddress: string;
  creatorName: string;
  type: 'Regular' | 'Special' | 'VIP';
  price: number;
  message: string;
  rules: {
    funForumAccess: boolean;
    likeCommentAccess: boolean;
    downloadAccess: boolean;
    giftAccess: boolean;
  };
  image: string;
  holders: string[]; // Add this line
  ownedPasses?: string[]; // Add this
}

const Mainbar = ({ showContent, showProfile, setToast }: MainbarProps) => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPassToast, setShowPassToast] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passes, setPasses] = useState<Pass[]>([]);
  const [selectedPassInfo, setSelectedPassInfo] = useState<Pass | null>(null);
  const [deletePassId, setDeletePassId] = useState<string | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add new state for metrics
  const [metrics, setMetrics] = useState({
    passesOwned: 0,
    revenueGenerated: 0,
    crtpPoints: 0,
    totalPasses: 0
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const address = localStorage.getItem('address');
        if (!address) return;

        const res = await fetch(`/api/profile?address=${address}`);
        const data = await res.json();

        if (data.profile) {
          setProfile(data.profile);
          // Set metrics from profile data
          setMetrics(data.profile.metrics || {
            passesOwned: 0,
            revenueGenerated: 0,
            crtpPoints: 0,
            totalPasses: 0
          });
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    // Fetch existing passes
    const fetchPasses = async () => {
      try {
        const address = localStorage.getItem('address');
        const response = await fetch(`/api/passes?address=${address}`);
        const data = await response.json();
        setPasses(data.passes || []);
      } catch (error) {
        console.error('Error fetching passes:', error);
      }
    };

    fetchPasses();
  }, []);

  const handleCreatePass = async (passData: Pass) => {
    try {
      const address = localStorage.getItem('address');
      const { creatorName, ...restPassData } = passData; // Destructure to remove creatorName
      const response = await fetch('/api/passes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          creatorName: profile?.username || 'Anonymous',
          ...restPassData,
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Refresh passes list
        const updatedPassesRes = await fetch(`/api/passes?address=${address}`);
        const updatedPassesData = await updatedPassesRes.json();
        setPasses(updatedPassesData.passes || []);
        
        setToast({
          show: true,
          message: 'Pass created successfully!',
          type: 'success'
        });
      }
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
    if (deleteConfirmText !== 'I want to delete this pass') {
      setToast({
        show: true,
        message: 'Please type the confirmation text correctly',
        type: 'error'
      });
      return;
    }

    setIsDeleting(true);
    try {
      const address = localStorage.getItem('address');
      console.log('Deleting pass:', passId); // Debug log

      const response = await fetch(`/api/passes/${passId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });

      const data = await response.json();
      console.log('Delete response:', data); // Debug log

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete pass');
      }

      const updatedPassesRes = await fetch(`/api/passes?address=${address}`);
      const updatedPassesData = await updatedPassesRes.json();
      setPasses(updatedPassesData.passes || []);

      setToast({
        show: true,
        message: 'Pass deleted successfully',
        type: 'success'
      });
      setShowDeleteModal(false);
      setDeletePassId(null);
      setDeleteConfirmText('');
    } catch (error: any) {
      console.error('Error deleting pass:', error);
      setToast({
        show: true,
        message: error.message || 'Failed to delete pass',
        type: 'error'
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const canCreateMorePasses = () => {
    return passes.length < 3;
  };

  const handleCreatePassClick = () => {
    if (!canCreateMorePasses()) {
      setToast({
        show: true,
        message: 'You have reached the maximum number of passes (3)',
        type: 'warning'
      });
      return;
    }
    setShowPassModal(true);
  };

  const formatSOL = (lamports: number) => {
    return (lamports / 1000000000).toFixed(2);
  };

  return (
    <div className='bg-black min-h-screen pb-[100px] md:pb-4'>
      {/* NFT Toast */}
      {showPassToast && (
        <div className='fixed top-5 right-5 bg-purple-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-fade-in'>
          <p>Premium Class NFT passes will be available on next update after MVP! 🚀</p>
        </div>
      )}

      {/* Show Content when showContent is true */}
      {showContent && <Content setToast={setToast} />}
      
      {/* Show Profile when showProfile is true */}
      {showProfile && <ProfileUpdate setToast={setToast} />}
      
      {/* Show Dashboard with Passes only when neither Content nor Profile is showing */}
      {!showContent && !showProfile && (
        <>
          <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
            {/* Header */}
            <div className='mb-10'>
              <h1 className='md:text-4xl text-3xl font-bold text-purple-500 flex items-center gap-3'>
                Creator Dashboard
                <FaDatabase />
              </h1>
              <p className='text-gray-400 mt-2'>Manage your content and NFT passes</p>
            </div>

            <div className='grid lg:grid-cols-12 gap-8'>
              {/* Left Column - Creator Card */}
              <div className='lg:col-span-4 space-y-6'>

                {/* <div className='bg-gray-600 p-6 rounded-xl md:rounded-2xl shadow-xl'>
                  <div className='bg-slate-800 rounded-xl p-4'>
                    <div className='flex justify-between items-center mb-4'>
                      <Image src='/sol.png' alt='sol' width={24} height={24} />
                      <p className='text-white font-bold'>Access Card</p>
                    </div>
                    <div className='relative h-60 md:h-48 w-full mb-4'>
                      <Image
                        src={profile?.profileImage || '/emptProfile.jpg'}
                        fill
                        alt='profile'
                        className='rounded-lg object-cover'
                      />
                    </div>
                    <div className='flex items-center justify-between'>
                      <Image src='/whiteLogo.png' alt='logo' width={60} height={20} />
                      <p className='text-white font-mono'>{profile?.username || 'Anonymous'}</p>
                    </div>
                  </div>
                </div> */}

                {/* Action Buttons */}
                <div className='flex gap-4'>
                  <button
                    onClick={handleCreatePassClick}
                    disabled={!canCreateMorePasses()}
                    className='flex-1 mb-[30px] text-[1.1rem] md:mb-0 mt-5 bg-green-600 md:bg-purple-600 hover:bg-purple-700 h-[60px] transition-all py-3 px-4 rounded-xl md:rounded-md text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'
                   >
                    <IoTicketSharp size={20} />
                    {canCreateMorePasses() ? 'Create Pass' : 'Max Passes Created'}
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
                      value: metrics.totalPasses,
                      icon: <SiSolana className='text-purple-500 text-2xl' />,
                      bgColor: 'bg-purple-500/20'
                    },
                    {
                      title: 'Revenue',
                      description: 'Monitor your earnings',
                      value: `${formatSOL(metrics.revenueGenerated)} SOL`,
                      icon: <SiSolana className='text-green-500 text-2xl' />,
                      bgColor: 'bg-green-500/20'
                    },
                    {
                      title: 'Total CRTP',
                      description: 'Your Creator Reputation Points',
                      value: metrics.crtpPoints,
                      icon: <SiSolana className='text-blue-500 text-2xl' />,
                      bgColor: 'bg-blue-800/20'
                    }
                  ].map((stat, index) => (
                    <div key={index} className='bg-[#272B30] p-6 rounded-xl'>
                      <div className='flex justify-between items-center mb-4'>
                        <div className={`${stat.bgColor} p-3 rounded-lg`}>
                          {stat.icon}
                        </div>
                        <span className='text-gray-400 text-sm'>{stat.value}</span>
                      </div>
                      <h3 className='text-white text-lg font-semibold'>{stat.title}</h3>
                      <p className='text-gray-400 text-sm mt-2'>{stat.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Passes Display Section */}
          <div className="mt-8 max-w-7xl mx-auto px-4">
            <div className="relative overflow-x-auto">
              <div className="flex gap-4 md:grid md:grid-cols-3 snap-x snap-mandatory">
                {passes.map((pass, index) => (
                  <div 
                    key={index}
                    className="min-w-[280px] md:min-w-0 snap-center bg-[#1A1D1F] rounded-xl p-4 relative hover:bg-[#22262A] transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <button
                        onClick={() => setSelectedPassInfo(pass)}
                        className="text-gray-400 hover:text-white"
                      >
                        <FaInfoCircle size={20} />
                      </button>
                      <span className="text-gray-400">{profile?.username || 'Anonymous'}</span>
                      <button
                        onClick={() => {
                          setDeletePassId(pass._id);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-400"
                      >
                        <MdDeleteForever size={24} />
                      </button>
                    </div>
                    <div className="relative h-48 w-full mb-4">
                      <Image
                        src={pass.image}
                        alt={`${pass.type} pass`}
                        fill
                        className="rounded-lg object-cover"
                      />
                    </div>
                    <div className={`
                      ${pass.type === 'Regular' ? 'bg-gradient-to-r from-gray-600 to-gray-700' : 
                        pass.type === 'Special' ? 'bg-gradient-to-r from-purple-600 to-blue-500' :
                        'bg-gradient-to-r from-yellow-500 to-purple-600'}
                      rounded-lg p-3 mb-3
                    `}>
                      <h3 className="text-xl font-bold text-white">{pass.type}</h3>
                    </div>
                    <p className="text-white mt-2">{pass.price} SOL</p>
                    <p className="text-gray-400 text-sm mt-2">{pass.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pass Create Modal */}
          <PassCreateModal
            isOpen={showPassModal}
            onClose={() => setShowPassModal(false)}
            onCreate={handleCreatePass}
            profileImage={profile?.profileImage || '/emptProfile.jpg'}
            ownedPasses={passes.map(p => p.type)} // Add this line
          />

          {/* Pass Info Modal */}
          {selectedPassInfo && (
            <div className="fixed inset-0 bg-black md:bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1A1D1F] rounded-xl w-full max-w-md p-6 relative">
                <button 
                  onClick={() => setSelectedPassInfo(null)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-white"
                >
                  <IoMdClose size={24} />
                </button>
                <h2 className="text-2xl font-bold text-white mb-4">{selectedPassInfo.type} Pass Info</h2>
                <p className="text-gray-300 mb-4">{selectedPassInfo.message}</p>
                <div className="space-y-2">
                  <h3 className="text-white font-semibold">Pass Rules:</h3>
                  <ul className="text-gray-300 space-y-2">
                    {Object.entries(selectedPassInfo.rules).map(([key, value]) => (
                      <li key={key} className="flex items-center gap-2">
                        <span className={value ? 'text-green-500' : 'text-red-500'}>
                          {value ? '✓' : '✗'}
                        </span>
                        {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black md:bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-[#1A1D1F] rounded-xl w-full max-w-md p-6 relative">
                <h2 className="text-xl font-bold text-red-500 mb-4">Delete Pass</h2>
                <p className="text-gray-300 mb-4">
                  Warning: Deleting this pass will remove access for all fans who purchased it.
                  They will no longer be able to view your exclusive content.
                </p>
                <p className="text-gray-400 mb-2">Type 'I want to delete this pass' to confirm:</p>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className="w-full bg-[#2A2D31] text-white p-2 rounded-lg mb-4"
                  placeholder="Type confirmation text"
                  disabled={isDeleting}
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    className="px-4 py-2 text-gray-400 hover:text-white"
                    disabled={isDeleting}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => deletePassId && handleDeletePass(deletePassId)}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 flex items-center gap-2"
                    disabled={deleteConfirmText !== 'I want to delete this pass' || isDeleting}
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Deleting...</span>
                      </>
                    ) : (
                      'Delete Pass'
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Mainbar;