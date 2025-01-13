'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname
import { FiSearch } from "react-icons/fi";
// import { GoHome } from "react-icons/go";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppKit, useAppKitAccount, useDisconnect } from '../utils/reown';
// import type { Provider } from '@reown/appkit-adapter-solana'

const NavBar = () => {
  const pathname = usePathname(); // Initialize usePathname
  const { isConnected } = useAppKitAccount()
  const router = useRouter();
  // const { walletProvider } = useAppKitProvider<Provider>('solana');
  const [connectValue, setConnectValue] = useState('Connect Wallet');
  // alert(isConnected)
  if (isConnected) {
    setConnectValue('Connected');
  }
  // const { disconnect } = useDisconnect();
  const { open } = useAppKit();

  return (
    <div style={{
      background: 'linear-gradient(93.1deg, #6d2baa 0%, #682E9E 98.22%)'
    }} className='p-3 z-50 flex justify-between items-center'>
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
        <Link href='/creators'>
          <p className={`cursor-pointer ${pathname === '/creators' ? 'bg-gray-400' : ''} p-2 rounded-lg`}>Creators</p>
        </Link>
        <Link href='/dashboard'>
          <p className={`cursor-pointer ${pathname === '/dashboard' ? 'bg-gray-400' : ''} p-2 rounded-lg`}>Dashboard</p>
        </Link>
        <Link href='/passes'>
          <p className={`cursor-pointer ${pathname === '/passes' ? 'bg-gray-400' : ''} p-2 rounded-lg`}>Passes</p>
        </Link>
      
        <div onClick={async() => {
          //  await disconnect();
            router.push('/');
           }} className='bg-gray-800 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]'>
          <p className='text-white'>Sign out</p>
        </div>
       
        <div className='bg-gray-200 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]' onClick={() => open()}>
          <p className='text-[#682E9E]'>{connectValue}</p>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
