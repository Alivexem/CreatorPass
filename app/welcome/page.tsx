import React from 'react'
import NavBar from '@/components/NavBar'
import { Gi3dGlasses } from "react-icons/gi";
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import Link from 'next/link'
import { FaUnlockKeyhole } from "react-icons/fa6";
import { FaBridgeCircleCheck } from "react-icons/fa6";
import { SiFueler } from "react-icons/si";
import { RiVipCrown2Fill } from "react-icons/ri";
import { FaFire } from "react-icons/fa6";
const page = () => {
  return (
    <div className='bg-[#1A1D1F] pb-[100px] lg:pb-0'>
      <NavBar />
      <div className='text-center font-bold mt-20 flex justify-center items-center flex-col'>
        <div className='flex flex-col md:flex-row items-center text-[2.8rem] text-gray-200'>
          <p>Empowering Creators </p> <Gi3dGlasses className='mx-3' /> <p>Rewarding Fans</p>
        </div>
        <p className='text-[1.2rem] font-bold text-gray-400'>Access exclusive posts, videos, and more from your favorite creators.</p>
      </div>

      <div className='flex justify-center items-center my-10 mt-24 relative'>
        {/* Left card */}
        <div className='hidden md:flex border-[1px] relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-none from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[350px] rotate-[-15deg] h-[500px] -mr-40'>
          <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
            <Image height={25} width={25} src='/sol.png' alt='sol' />
            <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.7rem] font-bold mt-4'>Access card</p>
          </div>
          <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
            <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-[100px]' />
            <Image src='/two.jpeg' className='rounded-md' height={70} width={150} alt='profile' />
            <div className='flex items-center gap-x-4'>
              <RiHeart2Line className='text-white text-base' />
              <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4 text-base'>Josh Daniel</p>
              <RiHeart2Line className='text-white text-base' />
            </div>
          </div>
        </div>

        {/* Center card */}
        <div className='flex border-[1px] rotate-[5deg] md:rotate-0 relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-none from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[350px] z-10 h-[500px]'>
          <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
            <Image height={25} width={25} src='/sol.png' alt='sol' />
            <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.7rem] font-bold mt-4'>Access card</p>
          </div>
          <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
            <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-[100px]' />
            <Image src='/smile.jpg' className='rounded-md' height={70} width={150} alt='profile' />
            <div className='flex items-center gap-x-4'>
              <RiHeart2Line className='text-white text-base' />
              <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4 text-base'>Justina Kate</p>
              <RiHeart2Line className='text-white text-base' />
            </div>
          </div>
        </div>

        {/* Right card */}
        <div className='hidden md:flex border-[1px] relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-none from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[350px] rotate-[15deg] h-[500px] -ml-40'>
          <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
            <Image height={25} width={25} src='/sol.png' alt='sol' />
            <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.7rem] font-bold mt-4'>Access card</p>
          </div>
          <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
            <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-[100px]' />
            <Image src='/three.jpeg' className='rounded-md' height={70} width={150} alt='profile' />
            <div className='flex items-center gap-x-4'>
              <RiHeart2Line className='text-white text-base' />
              <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4 text-base'>Kelvin Jones</p>
              <RiHeart2Line className='text-white text-base' />
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-center items-center gap-x-8 mb-14 mt-20'>

        <Link href='/creators'>
          <button className='h-[55px] w-[300px] text-[1.2rem] p-3 bg-purple-600 hover:bg-purple-700 text-white'>Explore Creators</button>
        </Link>
      </div>

      <div className='flex flex-col md:flex-row space-y-4 justify-evenly mt-[70px] items-center text-white text-[1.4rem]'>

        <div className='bg-[#272B30] border-[2px] p-3 w-[90%] border-blue-500 h-[250px] md:w-[250px] lg:w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <FaUnlockKeyhole />
          <p className='text-center'>Unlocking the Future of Content Creation
          </p>
        </div>
        <div className='bg-[#272B30] border-[2px] p-3 w-[90%] border-blue-500 h-[250px] md:w-[250px] lg:w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <FaBridgeCircleCheck />
          <p className='text-center'>
            Bridging Creators and Fans with Innovation
          </p>
        </div>
        <div className='bg-[#272B30] border-[2px] p-3 w-[90%] border-blue-500 h-[250px] md:w-[250px] lg:w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <SiFueler />
          <p className='text-center'>
            Fueling Creativity, Building Connections
          </p>
        </div>
        <div className='bg-[#272B30] p-3 w-[90%] md:hidden lg:flex border-[2px] border-blue-500 h-[250px] md:w-[250px] lg:w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <RiVipCrown2Fill />
          <p className='text-center'>
            The Future of Content, Powered by You
          </p>
        </div>
      </div>

      <div className='flex md:hidden items-center justify-center mt-5 gap-x-2'>
        <Image src='/whiteLogo.png' alt='logo' height={30} width={150} />
        <p className='text-[0.8rem] text-white font-mono'> Designed and developed by Athkins</p>
      </div>
      <div className='flex md:hidden justify-center text-white items-center'>

        <div className='flex items-center justify-center gap-x-2 mb-[50px]'>
       
          <p className='font-mono text-[0.8rem] text-center'>During the 20 days Bounty Task using Reown AppKit</p>
    
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default page
