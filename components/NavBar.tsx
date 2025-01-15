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

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setConnectValue('Connect Wallet');
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
      // Optionally show an error message to the user
    }
  };

  const handleConnect = async () => {
    try {
      await open();
    } catch (error) {
      console.error('Connect error:', error);
      // Optionally show an error message to the user
    }
  };

  return (
    <div style={{ background: 'radial-gradient(circle, #8748c2 0%, #682E9E 98.22%)' }} className='p-3 z-50 flex justify-between items-center'>
      <Image src='/whiteLogo.png' alt='logo' height={40} width={200} />

      <div className='h-14 lg:w-[450px] md:w-[300px] p-2 bg-gray-200 rounded-[40px] flex items-center'>
        <div className='h-[100%] w-[15%] rounded-tl-[40px] rounded-bl-[40px] bg-gray-800 text-white flex justify-center items-center'>
          <FiSearch />
        </div>
        <input className='ml-3 bg-transparent pr-5 h-full w-full outline-none border-none' placeholder='Search CreatorPass' type='text' />
      </div>
      <div className='flex items-center gap-x-6 text-white text-[1rem] mr-3'>
        <Link href='/welcome'>
          <p className={`cursor-pointer ${pathname === '/welcome' ? 'bg-gray-400' : ''} p-2 rounded-lg`}>Home</p>
        </Link>
        <Link href='/dashboard'>
          <p className={`cursor-pointer ${pathname === '/dashboard' ? 'bg-gray-400' : ''} p-2 rounded-lg`}>Dashboard</p>
        </Link>
        <Link href='/passes'>
          <p className={`cursor-pointer ${pathname === '/passes' ? 'bg-gray-400' : ''} p-2 rounded-lg`}>Passes</p>
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
  );
};

export default NavBar;
