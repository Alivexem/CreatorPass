import React from 'react'
import Image from 'next/image'
import { FiSearch } from "react-icons/fi";
import { GoHome } from "react-icons/go";
const NavBar = () => {
  return (
    <div className='p-3 flex justify-between items-center bg-[#682E9E]'>
      <Image src='/whiteLogo.png' alt='logo' height={50} width={230} />

      <div className='h-14 lg:w-[450px] md:w-[300px] p-2 bg-white rounded-[40px] flex items-center'>
        <div className='h-[100%] w-[10%] rounded-tl-[40px] rounded-bl-[40px] bg-gray-800 text-white flex justify-center items-center'>
            <FiSearch />
        </div>
        <input className='ml-3 bg-transparent pr-5 h-full w-full outline-none border-none' placeholder='search' type='text' />
      </div>
      <div className='flex items-center gap-x-6 text-white text-[1rem] mr-3'>
        <p className='cursor-pointer hover:text-[#00C7A3]'>Home</p>
        <p className='cursor-pointer hover:text-[#00C7A3]'>Creators</p>
        <p className='cursor-pointer hover:text-[#00C7A3]'>Passes</p>
        <p className='cursor-pointer hover:text-[#00C7A3]'>About</p>
        <Image src='/profile.jpg' height={50} width={50} className='border-[1px] rounded-sm' alt='profile-pic' />
      </div>
    </div>
  )
}

export default NavBar;
