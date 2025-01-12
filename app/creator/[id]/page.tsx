import React from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { FaGift } from "react-icons/fa6";
const Content = () => {
    return (
      <div className='bg-[#1A1D1F]'>
        <NavBar />
        <div className='mt-[80px]'></div>
        <div className='flex flex-col space-y-10 justify-center items-center mb-20'>
            <div className='w-[65vw] min-h-[600px] rounded-xl h-auto flex flex-col bg-transparent border-[1px] border-gray-200'>
                <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-green-700'>
                    <div className='flex items-center gap-x-3'>
                        <Image src='/smile.jpg' height={50} width={50} alt='profile' className='rounded-lg' />
                        <p className='text-[1.1rem]'>Justina Kate</p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                        <Image src='/sol.png' height={20} width={20} alt='profile' className='rounded-lg' />
                        <p>3v7rE4xxxxxxX6Ev</p>
                    </div>
                </div>
                <div className='flex-start px-10 mt-5 text-white'>
                    <p className='text-left'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Autem eius quod officiis animi, illum amet perspiciatis cum, rem cupiditate porro ipsum et ipsa fugiat culpa officia assumenda nemo hic sapiente eligendi excepturi quos aut ducimus ex! Cupiditate animi quod, libero voluptatibus tempora impedit assumenda...</p>
                </div>
                <div className='flex justify-center w-[100%] items-center'>
                    <Image src='/one.jpeg' height={1000} width={1000} className='h-[350px] mt-7 w-[60%] rounded-lg border-[1px] border-gray-200 px-5' alt='pic' />
                </div>
                <div className='mt-10 w-[100%] flex mb-5 px-10 justify-between items-center'>
                    <div className='flex items-center gap-x-3 text-white'>
                        <IoHeartHalf className='text-white text-[1.7rem]' />
                        <p>0 likes</p>
                    </div>
                    <div className='flex items-center gap-x-3 text-white'>
                        <FaCommentMedical className='text-white text-[1.7rem]' />
                        <p>0 comments</p>
                    </div>
                    <button className='bg-blue-700 text-[1rem] h-[40px] w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'><FaGift className='text-[1.7rem]' />Gift</button>
                </div>
            </div>

            <div className='w-[65vw] min-h-[600px] rounded-xl h-auto flex flex-col bg-transparent border-[1px] border-gray-200'>
                <div className='w-[100%] h-[80px] flex justify-between rounded-t-xl px-7 items-center box-border text-white bg-green-700'>
                    <div className='flex items-center gap-x-3'>
                        <Image src='/smile.jpg' height={50} width={50} alt='profile' className='rounded-lg' />
                        <p className='text-[1.1rem]'>Justina Kate</p>
                    </div>
                    <div className='flex items-center gap-x-2'>
                        <Image src='/sol.png' height={20} width={20} alt='profile' className='rounded-lg' />
                        <p>3v7rE4xxxxxxX6Ev</p>
                    </div>
                </div>
                <div className='flex-start px-10 mt-5 text-white'>
                    <p className='text-left'>Lorem ipsum dolor sit amet consectetur, adipisicing elit. Autem eius quod officiis animi, illum amet perspiciatis</p>
                </div>
                <div className='flex justify-center w-[100%] items-center'>
                    <Image src='/two.jpeg' height={1000} width={1000} className='h-[350px] mt-7 w-[60%] rounded-lg border-[1px] border-gray-200 px-5' alt='pic' />
                </div>
                <div className='mt-10 w-[100%] flex mb-5 px-10 justify-between items-center'>
                    <div className='flex items-center gap-x-3 text-white'>
                        <IoHeartHalf className='text-white text-[1.7rem]' />
                        <p>0 likes</p>
                    </div>
                    <div className='flex items-center gap-x-3 text-white'>
                        <FaCommentMedical className='text-white text-[1.7rem]' />
                        <p>0 comments</p>
                    </div>
                    <button className='bg-blue-700 text-[1rem] h-[40px] w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'><FaGift className='text-[1.7rem]' />Gift</button>
                </div>
            </div>
        </div>
        <Footer />
        </div>
    );
};

export default Content;
