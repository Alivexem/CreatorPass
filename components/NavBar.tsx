'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation'; // Import usePathname
import { FiSearch } from "react-icons/fi";
import { GoHome } from "react-icons/go";
import Link from 'next/link';

const NavBar = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const pathname = usePathname(); // Initialize usePathname

  const toggleMenu = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsMenuVisible((prev) => !prev);
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (
      menuRef.current &&
      !menuRef.current.contains(event.target as Node) &&
      imageRef.current &&
      !imageRef.current.contains(event.target as Node)
    ) {
      setIsMenuVisible(false);
    }
  };

  const handleConnectWallet = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
        <Link href='/'>
          <div className='bg-gray-800 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]'>
            <p className='text-white'>Sign out</p>
          </div>
        </Link>
        <div className='bg-gray-200 h-8 w-auto rounded-lg p-2 flex justify-center items-center cursor-pointer hover:bg-[#00C7A3]' onClick={handleConnectWallet}>
          <p className='text-[#682E9E]'>Connect wallet</p>
        </div>
      </div>

      {isMenuVisible && (
        <div ref={menuRef} onClick={(e) => e.stopPropagation()} className='bg-[#682E9E] mydiv z-10 space-y-7 box-border p-4 flex flex-col justify-center items-center rounded-bl-xl text-white w-[300px] top-[120px] absolute right-0 h-[200px]'>
          <p className='hover:text-[#00C7A3] cursor-pointer'>Connect wallet</p>
          <Link href='/'><button className='text-[#682E9E] hover:bg-[#00C7A3] bg-white h-[40px] w-[120px] rounded-[40px]'>Logout</button></Link>
        </div>
      )}

      {isModalVisible && (
        <div className='fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center z-50'>
          <div className='bg-white p-6 rounded-lg shadow-lg w-[600px]'>
            <h2 className='text-2xl font-bold mb-4'>Connect Wallet</h2>
            <p className='mb-4'>Please connect your wallet to proceed.</p>
            <div>
              <div className='flex border hover:bg-gray-300 cursor-pointer p-2 rounded-lg items-center space-y-4 mt-6 gap-x-5'>
                <Image src='/phantom.png' className='rounded-xl' height={30} width={60} alt='phantom' />
                <p className='text-[1.1rem]'>Phantom Wallet</p>
              </div>
              <div className='flex border hover:bg-gray-300 cursor-pointer p-2 rounded-lg items-center mt-6 gap-x-5'>
                <Image src='/solflare.jfif' className='rounded-xl' height={10} width={60} alt='phantom' />
                <p className='text-[1.1rem]'>Solflare Wallet</p>
              </div>
              <div className='flex border hover:bg-gray-300 cursor-pointer p-2 rounded-lg items-center mt-6 gap-x-5'>
                <Image src='/sollet.png' className='rounded-xl' height={10} width={60} alt='sollet' />
                <p className='text-[1.1rem]'>Sollet Wallet</p>
              </div>
            </div>
            <div className='flex justify-end items-end'>
              <button className='bg-red-500 text-white px-4 mt-10 py-2 rounded' onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NavBar;
