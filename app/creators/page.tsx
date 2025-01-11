import React from 'react'
import NavBar from '@/components/NavBar'
import { Gi3dGlasses } from "react-icons/gi";
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import Link from 'next/link'
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";
import { FaFire } from "react-icons/fa6";
const page = () => {
  return (
    <div className='bg-[#1A1D1F]'>
      <NavBar />
      <div className='flex justify-center items-center mt-10'>
        <Image src='/meet.png' height={50} width={500} alt='mint' />
      </div>

      <div className='flex justify-center gap-x-10 items-center my-10 mt-14'>
        <FaArrowAltCircleLeft className='text-[2.5rem] mb-4 text-white' />

        <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#e7f0f5] via-[#dfeef7] to-[#e7f0f5] w-[350px] h-[500px]'>
          <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
            <Image src='/whiteLogo.png' alt='logo' height={10} width={100} />

            <Image src='/smile.jpg' className='rounded-md' height={120} width={250} alt='profile' />
            <div className='flex items-center gap-x-4'>
              <RiHeart2Line className='text-white' />
              <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>Justina Kate</p>
              <RiHeart2Line className='text-white' />
            </div>
          </div>
          <div className='h-[30%] flex-col w-[100%] bg-gray-800 mt-4 rounded-lg flex justify-center items-center text-white'>
             <FaFire />
            <p className='text-center text-[0.9rem] p-3'>Fun to be with, zesty, choleric and just an overall nice person</p>
          </div>
        </div>
        <FaArrowAltCircleRight className='text-[2.5rem] mt-4 text-white' />
      </div>

      <Footer />
    </div>
  )
}

export default page
