'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from '../../utils/reown'
import Leftbar from './Leftside'
import Mainbar from './main'
import NavBar from '@/components/NavBar'
import Toast from '@/components/Toast'

const Dashboard = () => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [showContent, setShowContent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const address = localStorage.getItem('address');
        if (!address) return;

        const res = await fetch(`/api/profile?address=${address}`);
        const data = await res.json();

        if (!data.profile || !data.profile.username || !data.profile.profileImage) {
          setShowProfile(true);
          setToast({
            show: true,
            message: 'Please complete your profile to continue',
            type: 'info'
          });
        }
      } catch (error) {
        console.error('Error checking profile:', error);
      }
    };

    if (isConnected) {
      checkProfile();
    } else {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleShowContent = () => {
    setShowContent(true);
    setShowProfile(false);
  };

  const handleShowDashboard = () => {
    setShowContent(false);
    setShowProfile(false);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowContent(false);
  };

  return (
    <div>
      {toast.show && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast({ ...toast, show: false })} 
        />
      )}
      <div className='flex items-center bg-[#1A1D1F]'>
        <Leftbar onShowContent={handleShowContent} onShowDashboard={handleShowDashboard} onShowProfile={handleShowProfile} />
        <div className='w-[75%] ml-[24%] h-[100%]'>
          <Mainbar showContent={showContent} showProfile={showProfile} setToast={setToast} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
