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
  const [shouldRedirect, setShouldRedirect] = useState(false);
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

    // Start the 5-second timer only if not connected
    if (!isConnected && !shouldRedirect) {
      redirectTimer = setTimeout(() => {
        // Only redirect if still not connected after 5 seconds
        if (!isConnected) {
          setShouldRedirect(true);
        }
      }, 5000);
    } else if (isConnected) {
      // If connected, check profile and clear redirect flag
      checkProfile();
      setShouldRedirect(false);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isConnected]);

  // Handle the actual redirect
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
  }, [shouldRedirect, router]);

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
    <div className='bg-black'>
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