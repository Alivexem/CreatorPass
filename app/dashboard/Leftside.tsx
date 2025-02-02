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
import { useAppKitAccount } from '../../utils/reown';

const Leftbar = ({ onShowContent, onShowDashboard, onShowProfile }: { onShowContent: () => void, onShowDashboard: () => void, onShowProfile: () => void }) => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null); // Track the active item

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  const handleToggle = () => {
    setIsOpen(prev => !prev);
  };

  const handleClick = (item: string) => {
    setActiveItem(item); // Set the clicked item as active
    if (item === 'contents') {
      onShowContent();
    } else if (item === 'dashboard') {
      onShowDashboard();
    } else if (item === 'profile') {
      onShowProfile();
    }
  };

  const isActive = (item: string) => activeItem === item ? 'text-blue-300' : 'text-gray-200';

  return (
    <div className='border-gray-600 fixed border-2 bg-[#1A1D1F] w-[23%] top-0 h-[100vh] p-0 flex justify-start flex-col items-start pl-20'>
      <Image src='/whiteLogo.png' height={40} width={200} alt='Iwang Logo' className='-ml-7 mt-5' />
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
            <p>Dashboard</p>
          </div>
        </Link>

        <div
          onClick={() => handleClick('profile')}
          className={`flex items-center gap-x-1 cursor-pointer ${isActive('profile')} hover:text-blue-500`}
        >
          <RiProfileFill />
          <p>Profile</p>
        </div>

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

      {/* <button className='flex items-center hover:bg-blue-700 justify-center bg-purple-800 text-[0.8rem] w-[180px] h-[40px] px-4 py-2 gap-x-3 mt-10 text-white rounded-md'>
        <MdLogout />Logout
      </button> */}
    </div>
  );
};

export default Leftbar;
