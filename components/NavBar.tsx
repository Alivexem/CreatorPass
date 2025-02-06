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
    if (!isConnected) {
      router.push('/');
    }

    if (isConnected && address) {
      setConnectValue('Connected');
    } else {
      setConnectValue('Connect Wallet');
    }
  }, [isConnected, address, router]);

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
      setConnectValue('Connect Wallet');
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Connect error:', error);
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
        setSearchTerm('');
      } else {
        setToast({ show: true, message: 'User not found' });
      }
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  return (
    <>
      {toast.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          {toast.message}
        </div>
      )}
      {/* style={{ background: 'radial-gradient(circle, #8748c2 0%, #682E9E 98.22%)' }} */}
      <div className='p-3 z-50 flex bg-black justify-between position-fixed top-0 items-center border-b border-white'>
        <Image src='/whiteLogo.png' alt='logo' height={40} width={200} />

        <form onSubmit={handleSearch} className='lg:h-14 hidden md:flex md:h-14 lg:w-[400px] md:w-[40%] p-2 bg-gray-200 rounded-[40px] items-center'>

          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='ml-3 bg-transparent text-black pr-5 h-full w-full outline-none border-none'
            placeholder='Search CreatorPass'
            type='text'
          />
          <button type="submit" className='h-[100%] lg:w-[15%] md:w-[30%] rounded-full bg-gray-900 hover:bg-gray-500 text-white flex justify-center items-center'>
            <FiSearch />
          </button>
        </form>
        <div className='flex items-center gap-x-5 text-white text-[1rem]'>
          <div className="hidden md:block">
            <NotificationDropdown />
          </div>
          <Link href='/welcome' className='hidden md:block'>
            <p className={`cursor-pointer font-mono md:ml-5 lg:ml-0 ${pathname === '/welcome' ? 'bg-gray-300 text-black' : 'hover:text-purple-500'} p-2`}>Home</p>
          </Link>
          <Link href='/creators' className='hidden md:block'>
            <p className={`cursor-pointer font-mono ${pathname === '/creators' ? 'bg-gray-300 text-black' : 'hover:text-purple-500'} p-2`}>Creators</p>
          </Link>
          <Link href='/dashboard' className='hidden md:block'>
            <p className={`cursor-pointer font-mono ${pathname === '/dashboard' ? 'bg-gray-300 text-black' : 'hover:text-purple-500'} p-2`}>Dashboard</p>
          </Link>
          

          {/* <div
            onClick={handleDisconnect}
            className='bg-gray-800 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]'
          >
            <p className='text-white'>Sign out</p>
          </div> */}

          <div className="flex items-center gap-2">
            <div className="md:hidden">
              <NotificationDropdown />
            </div>
            <div
              className='bg-gray-200 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]'
              onClick={handleConnect}
            >
              <p className='text-[#682E9E] font-mono'>{connectValue}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom nav below */}
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

        <Link href='/dashboard'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <MdDashboardCustomize className={pathname === '/dashboard' ? 'text-purple-500' : ''} />
            <p className={`text-[0.8rem] ${pathname === '/dashboard' ? 'text-purple-500' : ''}`}>Dashboard</p>
          </div>
        </Link>

        <div className='flex cursor-pointer flex-col items-center space-y-2 relative' onClick={() => setShowMobileSearch(prev => !prev)}>
          <FiSearch />
          <p className='text-[0.8rem]'>Search</p>
          {showMobileSearch && (
            <div ref={searchRef} className='absolute bottom-[80px] right-[2px] bg-white p-4 rounded-lg shadow-lg w-[300px] flex gap-2' onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search creators..."
                className="flex-1 p-2 border rounded-lg text-black"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearch();
                }}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg"
              >
                <FiSearch />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default NavBar;
