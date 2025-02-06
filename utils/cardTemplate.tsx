import React from 'react';
import Image from 'next/image';
import { RiHeart2Line, RiNftFill } from "react-icons/ri";

export const AccessCardTemplate = ({ image, name }: { image: string, name: string }) => (
  <div className="w-[300px] rounded-2xl overflow-hidden shadow-2xl bg-gradient-to-r from-blue-500 to-purple-600">
    <div className='p-6 text-center'>
      <Image height={45} width={45} src='/sol.png' alt='sol' className='mx-auto' />
      <p className='font-cursive text-2xl text-white font-bold mt-4'>Access Card</p>
    </div>
    <div className='bg-slate-800 p-6 space-y-4'>
      <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
      <Image src={image} className='rounded-lg w-full h-48 object-cover' height={70} width={150} alt='profile' />
      <div className='flex items-center justify-center gap-3'>
        <RiHeart2Line className='text-white' />
        <p className='font-mono text-[0.7rem] md:text-[1rem] text-white font-bold'>{name}</p>
        <RiHeart2Line className='text-white' />
      </div>
    </div>
  </div>
); 
