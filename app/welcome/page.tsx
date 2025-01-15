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
const page = () => {
  return (
    <div className='bg-[#1A1D1F]'>
      <NavBar />
      <div className='text-center font-bold mt-20 flex justify-center items-center flex-col'>
        <div className='flex items-center text-[2.8rem] text-gray-200'>
          <p>Empowering Creators </p> <Gi3dGlasses className='mx-3' /> <p>Rewarding Fans</p>
        </div>
        <p className='text-[1.2rem] font-bold text-gray-400'>Access exclusive posts, videos, and more from your favorite creators.</p>
      </div>

      <div className='flex justify-center items-center my-10 mt-24'>

        <div className='flex relative flex-col justify-center items-center p-5 rounded-2xl shadow-2xl bg-gradient-to-r border-[1px] border-gray-800 from-[#75bde7] via-[#22a1eb] to-[#75bde7] w-[350px] rotate-[7deg] h-[500px]'>
          <div className='w-full h-[30%] rounded-t-[20px] bg-transparent flex justify-center items-center flex-col'>
            <Image height={40} width={40} src='/sol.png' alt='sol' />
            <p style={{ fontFamily: 'cursive' }} className='bg-slate-800 p-2 rounded-xl text-white text-[1.7rem] font-bold mt-4'>Bronze Access</p>
            {/* <p className='mt-4 bg-gray-800 rounded-lg text-white p-2 text-[0.6rem]'>3v7rE4hWTKi8vswPg8VbjGLJt9DeNNDG15dMuSHTX6Ev</p> */}
          </div>
          <div className='w-full h-[65%] rounded-[20px] bg-slate-800 mt-3 flex justify-center items-center flex-col'>
            <Image src='/whiteLogo.png' alt='logo' height={10} width={100} />

            <Image src='/smile.jpg' className='rounded-md' height={120} width={250} alt='profile' />
            <div className='flex items-center gap-x-4'>
              <RiHeart2Line className='text-white' />
              <p style={{ fontFamily: 'monospace' }} className='text-white mt-5 font-bold mb-4'>Justina Kate</p>
              <RiHeart2Line className='text-white' />
            </div>
          </div>
        </div>
      </div>

      <div className='flex justify-center items-center gap-x-8 mb-14 mt-20'>
      
        <Link href='/creators'>
          <button className='h-[55px] w-[250px] text-[1.2rem] p-3 rounded-[15px] bg-[#28b834] hover:bg-[#1f6625] text-white'>Explore Creators</button>
        </Link>
      </div>

      <div className='flex justify-evenly items-center text-white text-[1.4rem]'>

        <div className='bg-[#272B30] border-[2px] border-blue-500 h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <FaUnlockKeyhole />
          <p className='text-center'>Unlocking the Future of Content Creation
          </p>
        </div>
        <div className='bg-[#272B30] border-[2px] border-blue-500 h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <FaBridgeCircleCheck />
          <p className='text-center'>
            Bridging Creators and Fans with Innovation
          </p>
        </div>
        <div className='bg-[#272B30] border-[2px] border-blue-500 h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
           <SiFueler />
          <p className='text-center'>
            Fueling Creativity, Building Connections
          </p>
        </div>
        <div className='bg-[#272B30] border-[2px] border-blue-500 h-[250px] w-[300px] gap-y-4 rounded-xl flex justify-center items-center flex-col'>
          <RiVipCrown2Fill />
          <p className='text-center'>
            The Future of Content, Powered by You
          </p>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default page
