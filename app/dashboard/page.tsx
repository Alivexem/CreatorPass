'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from '../../utils/reown'
import Leftbar from './Leftside'
import Mainbar from './main'
import Toast from '@/components/Toast'
import DashboardMobileNav from '@/components/DashboardMobileNav'

const Dashboard = () => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [showContent, setShowContent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showDashboard, setShowDashboard] = useState(true);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

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
      // Wait 5 seconds before redirecting
      redirectTimer = setTimeout(() => {
        router.push('/');
      }, 5000);
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [isConnected, router]);

  const handleShowContent = () => {
    setShowContent(true);
    setShowProfile(false);
    setShowDashboard(false);
  };

  const handleShowDashboard = () => {
    setShowContent(false);
    setShowProfile(false);
    setShowDashboard(true);
  };

  const handleShowProfile = () => {
    setShowProfile(true);
    setShowContent(false);
    setShowDashboard(false);
  };

  const activeSection = showContent ? 'content' : showProfile ? 'profile' : 'dashboard';

  return (
    <div className='bg-[#1A1D1F]'>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className='flex items-center'>
        <div className='hidden md:block'>
          <Leftbar 
            onShowContent={handleShowContent} 
            onShowDashboard={handleShowDashboard} 
            onShowProfile={handleShowProfile} 
          />
        </div>
        <div className='w-[100%] md:w-[75%] md:ml-[24%] h-[100%]'>
          <Mainbar 
            showContent={showContent} 
            showProfile={showProfile} 
            setToast={setToast} 
          />
        </div>
      </div>
      <DashboardMobileNav
        onShowContent={handleShowContent}
        onShowDashboard={handleShowDashboard}
        onShowProfile={handleShowProfile}
        activeSection={activeSection}
      />
    </div>
  )
}

export default Dashboard