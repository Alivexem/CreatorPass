'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from '../../utils/reown'
import Leftbar from './Leftside'
import Mainbar from './main'
import NavBar from '@/components/NavBar'

const Dashboard = () => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [showContent, setShowContent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!isConnected) {
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
      {/* <NavBar /> */}
      <div className='flex items-center bg-[#1A1D1F]'>
        <Leftbar onShowContent={handleShowContent} onShowDashboard={handleShowDashboard} onShowProfile={handleShowProfile} />
        <div className='w-[75%] ml-[24%] h-[100%]'>
          <Mainbar showContent={showContent} showProfile={showProfile} />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
