import React from 'react'
import NavBar from '@/components/NavBar'
import { Gi3dGlasses } from "react-icons/gi";
import Image from 'next/image';
import { RiHeart2Line } from "react-icons/ri";
import Footer from '@/components/Footer';
import Link from 'next/link'
const page = () => {
  return (
    <div>
      <NavBar />
      <div className='text-center font-bold mt-20 flex justify-center items-center flex-col'>
        <div className='flex -z-50 items-center text-[2.8rem] text-[#00C7A3]'>
          <p>Empowering Creators </p> <Gi3dGlasses className='mx-3' /> <p>Rewarding Fans</p>
        </div>
        <p className='text-[1.2rem] -z-50 font-bold text-gray-500'>Access exclusive posts, videos, and more from your favorite creators.</p>
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
        <button className='h-[50px] w-[250px] text-[1.2rem] p-3 rounded-[45px] bg-[#8A2BE2] hover:bg-[#562781] text-white'>Continue as viewer</button>
        <Link href='/mypass'>
          <button className='h-[50px] w-[250px] text-[1.2rem] p-3 rounded-[45px] bg-[#28b834] hover:bg-[#1f6625] text-white'>Create your pass</button>
        </Link>
      </div>
      <Footer />
    </div>
  )
}

export default page
