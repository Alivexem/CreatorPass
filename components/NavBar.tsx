'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiSearch } from "react-icons/fi";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount, useDisconnect } from '../utils/reown';
import { useAppKitProvider } from '@reown/appkit/react'
import type { Provider } from '@reown/appkit-adapter-solana'
import { GoHomeFill } from "react-icons/go";
import { MdDashboardCustomize } from "react-icons/md";
import { IoTicketSharp } from "react-icons/io5";
import { BiWallet } from "react-icons/bi";
import NotificationDropdown from './NotificationDropdown';

const NavBar = () => {
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const pathname = usePathname();
  const { isConnected, address } = useAppKitAccount();
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const [connectValue, setConnectValue] = useState('Connect Wallet');
  const { open } = useAppKit();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const searchRef = useRef<HTMLDivElement>(null);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    if (!isConnected && !shouldRedirect) {
      redirectTimer = setTimeout(() => {
        if (!isConnected) {
          setShouldRedirect(true);
        }
      }, 5000);
    }

    if (isConnected) {
      setShouldRedirect(false);
      setConnectValue('Wallet');
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isConnected]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
  }, [shouldRedirect, router]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleDisconnect = async () => {
    try {
      await disconnect();
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleConnect = async () => {
    try {
      setConnectValue('Establishing...');
      await open();
      setConnectValue('Wallet');
    } catch (error) {
      console.error('Connect error:', error);
      setConnectValue('Connect Wallet');
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!searchTerm.trim()) return;

    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();

      const foundUser = data.profiles.find((profile: any) =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (foundUser) {
        router.push(`/creators?highlight=${foundUser.address}`);
        setShowMobileSearch(false);
        setSearchTerm('');
      } else {
        setToast({ show: true, message: 'User not found' });
      }
    } catch (error) {
      console.error('Search error:', error);
      setToast({ show: true, message: 'Search failed' });
    }
  };

  return (
    <>
      {toast.show && (
        <div className="md:fixed absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          {toast.message}
        </div>
      )}
      <div className='w-full flex justify-center items-center'>
        <div
          style={{

            backdropFilter: 'blur(10px)', // This applies the blur effect to the background
          }}
          className="p-3 z-50 flex shadow-[#682E9E] justify-between relative -mb-14 md:-mb-0 md:fixed top-4 md:top-0 items-center md:w-[95%] w-full md:rounded-[30px] px-[30px] shadow-sm bg-opacity-50">
          <Image
            src='/crtp.jpg'
            alt='logo'
            height={50}
            width={50}
            className='hidden rounded-full md:block -ml-4'
          />

          <Image
            src='/crtp.jpg'
            alt='logo'
            height={40}
            width={40}
            className='md:hidden rounded-full block -ml-4'
          />

          <form onSubmit={handleSearch} className='lg:h-14 hidden md:flex md:h-14 lg:w-[400px] md:w-[40%] p-2 bg-gray-200 rounded-[40px] items-center'>
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className='ml-3 bg-transparent text-black pr-5 h-full w-full outline-none border-none'
              placeholder='Find a creator'
              type='text'
            />
            <button type="submit" className='h-[100%] lg:w-[15%] md:w-[30%] rounded-full bg-gray-900 hover:bg-gray-500 text-white flex justify-center items-center'>
              <FiSearch />
            </button>
          </form>

          <div className='flex items-center gap-x-2 md:gap-x-5 text-white text-[1rem]'>
            <div className="hidden md:block">
              <NotificationDropdown />
            </div>

            <Link href='/welcome' className='hidden md:block'>
              <p className={`cursor-pointer ${pathname === '/welcome' ? 'bg-gray-800' : 'hover:text-purple-500'} p-2`}>Home</p>
            </Link>
            <Link href='/creators' className='hidden md:block'>
              <p className={`cursor-pointer ${pathname === '/creators' ? 'bg-gray-800' : 'hover:text-purple-500'} p-2`}>Creators</p>
            </Link>
            <Link href='/dashboard' className='hidden md:block'>
              <p className={`cursor-pointer ${pathname === '/dashboard' ? 'bg-gray-800' : 'hover:text-purple-500'} p-2`}>Dashboard</p>
            </Link>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="md:hidden">
                <NotificationDropdown />
              </div>
              <div
                className='bg-gray-200 h-[70%] md:h-8 px-4 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-purlpe-300'
                onClick={handleConnect}
              >
                <BiWallet className="text-black mr-2" />
                <p className='text-black text-[1rem] whitespace-nowrap'>{connectValue}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className='h-[80px] pt-3 box-border flex items-center justify-evenly z-50 w-full bg-slate-700 fixed bottom-0 text-white md:hidden'>
          <Link href='/welcome'>
            <div className='flex flex-col cursor-pointer items-center space-y-2'>
              <GoHomeFill className={pathname === '/welcome' ? 'text-purple-500' : ''} />
              <p className={`text-[0.8rem] ${pathname === '/welcome' ? 'text-purple-500' : ''}`}>Home</p>
            </div>
          </Link>

          <Link href='/creators'>
            <div className='flex flex-col cursor-pointer items-center space-y-2'>
              <IoTicketSharp className={pathname === '/creators' ? 'text-purple-500' : ''} />
              <p className={`text-[0.8rem] ${pathname === '/creators' ? 'text-purple-500' : ''}`}>Creators</p>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NavBar;