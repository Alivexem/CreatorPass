import React from 'react'
import NavBar from '@/components/NavBar'
import { Gi3dGlasses } from "react-icons/gi";
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import Link from 'next/link'
import { FaArrowAltCircleLeft } from "react-icons/fa";
import { FaArrowAltCircleRight } from "react-icons/fa";

const page = () => {
  return (
    <div>
      <NavBar />
      <div className='flex justify-center items-center mt-10'>
        <Image src='/privex.png' height={50} width={500} alt='mint' />
      </div>

      <div className='flex items-center justify-center gap-x-10'>
        <div className='flex flex-col justify-center items-center my-10'>

          <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[250px] h-[350px]'>
            <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
              <Image height={30} width={30} src='/sol.png' alt='sol' />
              <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.2rem] font-bold mt-4'>Bronze Access</p>
            </div>
            <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
              <Image src='/whiteLogo.png' alt='logo' height={10} width={70} />
              <Image src='/smile.jpg' className='rounded-md' height={80} width={180} alt='profile' />
              <div className='flex items-center gap-x-4'>
                <RiHeart2Line className='text-white' />
                <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>Justina Kate</p>
                <RiHeart2Line className='text-white' />
              </div>
            </div>
          </div>
          <div>
            <button className='bg-red-500 text-[0.8rem] font-bold border-black border-[1px] text-white px-4 py-2 mt-4'>Delete NFT</button>

          </div>
        </div>

        <div className='flex flex-col justify-center items-center my-10'>
          <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#e3e649] via-[#ebee2d] to-[#e3e649] w-[250px] h-[350px]'>
            <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
              <Image height={30} width={30} src='/sol.png' alt='sol' />
              <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.2rem] font-bold mt-4'>Gold Access</p>
            </div>
            <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
              <Image src='/whiteLogo.png' alt='logo' height={10} width={70} />
              <Image src='/smile.jpg' className='rounded-md' height={80} width={180} alt='profile' />
              <div className='flex items-center gap-x-4'>
                <RiHeart2Line className='text-white' />
                <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>Justina Kate</p>
                <RiHeart2Line className='text-white' />
              </div>
            </div>
          </div>
          <button className='bg-red-500 border-black text-[0.8rem] font-bold border-[1px] text-white px-4 py-2 mt-4'>Delete NFT</button>
        </div>

        <div className='flex flex-col justify-center items-center my-10'>
          <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#f1f3e0] via-[#e8ebcd] to-[#f1f3e0] w-[250px] h-[350px]'>
            <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
              <Image height={30} width={30} src='/sol.png' alt='sol' />
              <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.2rem] font-bold mt-4'>Silver Access</p>
            </div>
            <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
              <Image src='/whiteLogo.png' alt='logo' height={10} width={70} />
              <Image src='/smile.jpg' className='rounded-md' height={80} width={180} alt='profile' />
              <div className='flex items-center gap-x-4'>
                <RiHeart2Line className='text-white' />
                <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>Justina Kate</p>
                <RiHeart2Line className='text-white' />
              </div>
            </div>
          </div>
          <button className='bg-red-500 border-black text-[0.8rem] font-bold border-[1px] text-white px-4 py-2 mt-4'>Delete NFT</button>
        </div>

      </div>

      <div className='flex justify-center items-center mt-14'>
        <button className='bg-gray-500 font-bold text-white h-[50px] w-[200px] rounded-[40px]'>Create new pass</button>
      </div>
      <Footer />
    </div>
  )
}

export default page
