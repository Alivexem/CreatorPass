'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { RxDashboard } from "react-icons/rx";
import { BiCandles } from "react-icons/bi";
import { GoHomeFill } from "react-icons/go";
import { IoBagOutline } from "react-icons/io5";
import { IoSettingsOutline } from "react-icons/io5";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";
import { MdLogout } from "react-icons/md";
import Link from 'next/link';
import { RiProfileFill } from "react-icons/ri";
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount, useDisconnect } from '../../utils/reown';
import { FaMoneyCheckAlt } from "react-icons/fa";
import { FaCircleDollarToSlot } from "react-icons/fa6";
const Leftbar = ({ onShowContent, onShowDashboard, onShowProfile }: { onShowContent: () => void, onShowDashboard: () => void, onShowProfile: () => void }) => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { disconnect } = useDisconnect();

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    // Start the 5-second timer only if not connected
    if (!isConnected && !shouldRedirect) {
      redirectTimer = setTimeout(() => {
        // Only redirect if still not connected after 5 seconds
        if (!isConnected) {
          setShouldRedirect(true);
        }
      }, 5000);
    }

    // If connected, make sure we don't redirect
    if (isConnected) {
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

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleClick = (item: string) => {
    setActiveItem(item);
    if (item === 'contents') {
      onShowContent();
    } else if (item === 'dashboard') {
      onShowDashboard();
    } else if (item === 'profile') {
      onShowProfile();
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const isActive = (item: string) => activeItem === item ? 'text-blue-300' : 'text-gray-200';

  return (
    <div className='border-gray-600 fixed border-2 bg-black w-[23%] top-0 h-[100vh] p-0 flex justify-start flex-col items-start pl-20'>
      <Image src='/ctrpNo.jpg' height={60} width={60} alt='logo' className='-ml-7 mt-5 object-cover rounded-full' />
      <div className='flex flex-col gap-y-[30px] text-md font-[700] justify-start mt-[48px]'>

        <Link href='/welcome'>
          <div
            onClick={() => handleClick('home')}
            className={`flex items-center gap-x-1 cursor-pointer ${isActive('home')} hover:text-blue-500`}
          >
            <GoHomeFill />
            <p>Home</p>
          </div>
        </Link>

        <Link href='/dashboard'>
          <div
            onClick={() => handleClick('dashboard')}
            className={`flex items-center gap-x-1 cursor-pointer ${isActive('dashboard')} hover:text-blue-500`}
          >
            <RxDashboard />
            <p>NFT Pass Management</p>
          </div>
        </Link>

        <div
          onClick={() => handleClick('profile')}
          className={`flex items-center gap-x-1 cursor-pointer ${isActive('profile')} hover:text-blue-500`}
        >
          <RiProfileFill />
          <p>Profile</p>
        </div>


        {/* <div
          onClick={() => handleClick('contents')}
          className={`flex items-center gap-x-1 cursor-pointer ${isActive('contents')} hover:text-blue-500`}
        >
          <div onClick={handleToggle} className='flex items-center gap-x-1'>
            <FaCircleDollarToSlot  />
            <p>Payout</p>
          </div>
        </div> */}

        <div
          onClick={() => handleClick('contents')}
          className={`flex items-center gap-x-1 cursor-pointer ${isActive('contents')} hover:text-blue-500`}
        >
          <div onClick={handleToggle} className='flex items-center gap-x-1'>
            <BiCandles />
            <p>Contents</p>
          </div>
        </div>
      </div>

      <button 
        onClick={handleDisconnect}
        className='flex items-center hover:bg-blue-700 justify-center bg-purple-800 text-[0.8rem] w-[180px] h-[40px] px-4 py-2 gap-x-3 mt-10 text-white rounded-md'
      >
        <MdLogout />Logout
      </button>
    </div>
  );
};

export default Leftbar;
