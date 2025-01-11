'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiSearch } from "react-icons/fi";
import { GoHome } from "react-icons/go";
import Link from 'next/link';

const NavBar = () => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

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
      <Image src='/whiteLogo.png' alt='logo' height={50} width={230} />

      <div className='h-14 lg:w-[450px] md:w-[300px] p-2 bg-gray-200 rounded-[40px] flex items-center'>
        <div className='h-[100%] w-[15%] rounded-tl-[40px] rounded-bl-[40px] bg-gray-800 text-white flex justify-center items-center'>
          <FiSearch />
        </div>
        <input className='ml-3 bg-transparent pr-5 h-full w-full outline-none border-none' placeholder='search CreatorPass' type='text' />
      </div>
      <div className='flex items-center gap-x-6 text-white text-[1rem] mr-3'>
        <Link href='/creators'><p className='cursor-pointer hover:text-[#00C7A3]'>Creators</p></Link>
        <Link href='/dashboard'><p className='hover:text-[#00C7A3] cursor-pointer'>Dashboard</p></Link>
        <Link href='/passes'><p className='cursor-pointer hover:text-[#00C7A3]'>Passes</p></Link>
        <Link href='/'>
        <div className='bg-gray-800 h-8 w-auto  rounded-lg p-2 flex justify-center items-center'>
        <p className='cursor-pointer hover:text-[#00C7A3] text-white'>Sign out</p>
        </div>
        </Link>
   
        <div className='bg-gray-200 h-8 w-auto  rounded-lg p-2 flex justify-center items-center'>
        <p className='cursor-pointer hover:text-[#00C7A3] text-[#682E9E]'>Connect wallet</p>
        </div>
      
        {/* <Image ref={imageRef} src='/profile.jpg' height={50} width={50} className='border-[1px] rounded-sm cursor-pointer' alt='profile-pic' onClick={toggleMenu} /> */}
      </div>

      {isMenuVisible && (
        <div ref={menuRef} onClick={(e) => e.stopPropagation()} className='bg-[#682E9E] mydiv z-10 space-y-7 box-border p-4 flex flex-col justify-center items-center rounded-bl-xl text-white w-[300px] top-[120px] absolute right-0 h-[200px]'>
          <p className='hover:text-[#00C7A3] cursor-pointer'>Connect wallet</p>
          <Link href='/'><button className='text-[#682E9E] hover:bg-[#00C7A3] bg-white h-[40px] w-[120px] rounded-[40px]'>Logout</button></Link>
        </div>
      )}
    </div>
  );
};

export default NavBar;
