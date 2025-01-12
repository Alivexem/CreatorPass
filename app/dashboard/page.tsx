'use client'
import React, { useState } from 'react'
import Leftbar from './Leftside'
import Mainbar from './main'
import NavBar from '@/components/NavBar'

const layout = () => {
  const [showContent, setShowContent] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

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

export default layout
