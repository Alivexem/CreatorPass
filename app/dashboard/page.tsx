'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppKitAccount } from '../../utils/reown'
import Leftbar from './Leftside'
import Mainbar from './main'
import NavBar from '@/components/NavBar'
import Toast from '@/components/Toast'
import Link from 'next/link'
import { GoHomeFill } from "react-icons/go";
import { MdDashboardCustomize } from "react-icons/md";
import { IoTicketSharp } from "react-icons/io5";
import { FaDatabase } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";

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

  return (
    <div className='bg-[#1A1D1F]'>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <div className='flex items-center' >
        <div className='hidden md:block'>
          <Leftbar onShowContent={handleShowContent} onShowDashboard={handleShowDashboard} onShowProfile={handleShowProfile} />
        </div>
        <div className='w-[100%] md:w-[75%] md:ml-[24%] h-[100%]'>
          <Mainbar showContent={showContent} showProfile={showProfile} setToast={setToast} />
          <div className='h-[80px] box-border pt-3 flex items-center justify-evenly z-50 w-full bg-black fixed bottom-0 text-white md:hidden'>
            <Link href='/welcome'>
              <div className='flex flex-col cursor-pointer items-center space-y-2'>
                <GoHomeFill />
                <p className='text-[0.8rem]'>Home</p>
              </div>
            </Link>

            <div
              onClick={handleShowDashboard}
              className={`flex flex-col cursor-pointer items-center space-y-2 ${showDashboard ? 'text-purple-500' : ''}`}
            >
              <MdDashboardCustomize />
              <p className='text-[0.8rem]'>Dashboard</p>
            </div>

            <div
              onClick={handleShowProfile}
              className={`flex flex-col cursor-pointer items-center space-y-2 ${showProfile ? 'text-purple-500' : ''}`}
            >
              <RiProfileFill />
              <p className='text-[0.8rem]'>Profile</p>
            </div>

            <div
              onClick={handleShowContent}
              className={`flex flex-col cursor-pointer items-center space-y-2 ${showContent ? 'text-purple-500' : ''}`}
            >
              <FaDatabase />
              <p className='text-[0.8rem]'>Content</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard