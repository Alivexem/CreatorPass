'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FiSearch } from "react-icons/fi";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount, useDisconnect } from '../utils/reown';
import { useAppKitProvider } from '@reown/appkit/react'
import type { Provider } from '@reown/appkit-adapter-solana'

const NavBar = () => {
  const { walletProvider } = useAppKitProvider<Provider>('solana')
  const pathname = usePathname();
  const { isConnected, address } = useAppKitAccount();
  const router = useRouter();
  const { disconnect } = useDisconnect();
  const [connectValue, setConnectValue] = useState('Connect Wallet');
  const { open } = useAppKit();
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState({ show: false, message: '' });

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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();
      
      const foundUser = data.profiles.find((profile: any) => 
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (foundUser) {
        router.push(`/creator/${foundUser.address}`);
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
      <div style={{ background: 'radial-gradient(circle, #8748c2 0%, #682E9E 98.22%)' }} className='p-3 z-50 flex justify-between items-center'>
        <Image src='/whiteLogo.png' alt='logo' height={40} width={200} />

        <form onSubmit={handleSearch} className='h-14 lg:w-[450px] md:w-[300px] p-2 bg-gray-200 rounded-[40px] flex items-center'>
          
          <input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='ml-3 bg-transparent text-black pr-5 h-full w-full outline-none border-none' 
            placeholder='Search CreatorPass' 
            type='text' 
          />
          <button type="submit" className='h-[100%] w-[15%] rounded-tr-[40px] rounded-br-[40px] bg-gray-800 hover:bg-gray-500 text-white flex justify-center items-center'>
            <FiSearch />
          </button>
        </form>
        <div className='flex items-center gap-x-6 text-white text-[1rem] mr-3'>
          <Link href='/welcome'>
            <p className={`cursor-pointer ${pathname === '/welcome' ? 'bg-gray-400' : 'hover:text-purple-500'} p-2 rounded-lg`}>Home</p>
          </Link>
          <Link href='/dashboard'>
            <p className={`cursor-pointer ${pathname === '/dashboard' ? 'bg-gray-400' : 'hover:text-purple-500'} p-2 rounded-lg`}>Dashboard</p>
          </Link>
          <Link href='/passes'>
            <p className={`cursor-pointer ${pathname === '/passes' ? 'bg-gray-400' : 'hover:text-purple-500'} p-2 rounded-lg`}>Passes</p>
          </Link>

          {/* <div
            onClick={handleDisconnect}
            className='bg-gray-800 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]'
          >
            <p className='text-white'>Sign out</p>
          </div> */}

          <div
            className='bg-gray-200 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]'
            onClick={handleConnect}
          >
            <p className='text-[#682E9E]'>{connectValue}</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default NavBar;
