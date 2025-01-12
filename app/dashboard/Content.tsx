import React, { useState } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { FaImages } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
const Content = () => {
    const [showUploader, setShowUploader] = useState(false);

    return (
        <div className='flex flex-col justify-center items-center mb-20'>
            <div className='flex flex-col justify-center items-center mb-20 gap-y-7'>
                <div
                    className='flex hover:bg-blue-700 cursor-pointer items-center gap-x-3 h-[50px] w-[200px] rounded-lg justify-center text-white bg-blue-500 text-[1.3rem]'
                    onClick={() => setShowUploader(true)}
                >
                    <MdAddCircle />
                    <p>Add content</p>
                </div>
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
                        <button className='bg-red-700 text-[1rem] h-[40px] w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'><MdDeleteForever className='text-[1.7rem]' />Delete</button>
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
                        <button className='bg-red-700 text-[1rem] h-[40px] w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'><MdDeleteForever className='text-[1.7rem]' />Delete</button>
                    </div>
                </div>

                {showUploader && (
                    <div className='fixed inset-0 bg-gray-700 bg-opacity-85 flex justify-center items-center'>
                        <div className='flex h-auto w-[400px] flex-col mb-[40px] space-y-5 justify-center items-center bg-white p-5 rounded-lg'>
                            <p className='text-black text-[1.3rem] font-bold'>What do you have for your viewers?</p>
                            <div className='flex items-center gap-x-4'>
                                <div className='h-[150px] w-[200px] bg-gray-600 rounded-lg flex justify-center items-center'>
                                    <div className='border-dashed h-[100px] w-[150px] border-[1px] border-gray-200 rounded-lg flex text-white justify-center items-center'>
                                        <FaImages size={30} />
                                    </div>
                                </div>
                            </div>
                            <textarea name="about" placeholder='Express yourself' id="" className='p-5 rounded-lg border-[1px] border-black' cols={30} rows={2}></textarea>
                            <button className='h-[40px] w-[150px] bg-green-500 text-white rounded-lg mt-5'>Post</button>
                            <div
                                className='text-red-500 text-[2rem] rounded-lg mt-5 cursor-pointer'
                                onClick={() => setShowUploader(false)}
                            >
                                <MdCancel />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Content;
