'use client'
import React, { useState } from 'react'
import '../globals.css'
import { PiEyeClosedThin } from "react-icons/pi";
import { GoEye } from "react-icons/go";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const App = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleLoginClick = (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate an API call
        setTimeout(() => {
            setIsLoading(false);
            router.push('/welcome');
        }, 1000);
    };

    return (
        <div className='lg:ml-10 mt-24 lg:mt-10 bg-[#1A1D1F] md:w-[90%] w-[95vw] text-white px-[40px] flex flex-col justify-center items-center lg:items-start'>
            <div className='md:text-[30px] text-[26px] text-white font-bold w-full text-center lg:text-left'>
                <p className='leading-none'> Welcome back!</p>
            </div>
            <p className='text-[14px] mt-[15px] text-[#94a3b8] w-full text-center lg:text-left'>
                Don&#39;t have an account? <Link href='/'><span className='text-[#1ab479]'>Signup</span></Link>
            </p>

            <form className='mt-[30px] flex flex-col items-center lg:items-start space-y-[16px] p-2 md:w-full w-full'>
                <input placeholder='Email' type="text" className='border rounded-md px-[24px] py-[16px] border-[#cbd5e1] bg-transparent text-[#94a3b8] w-full lg:w-[100%] xl:w-[600px] h-[53px] box-border' />
                <div className='relative w-full lg:w-[100%] xl:w-[600px]'>
                    <input placeholder='Enter your password' type={showPassword ? "text" : "password"} className='border bg-transparent rounded-md px-[24px] py-[16px] border-[#cbd5e1] text-[#94a3b8] w-full h-[56px] box-border' />
                    {showPassword ? (
                        <GoEye onClick={togglePasswordVisibility} className='absolute right-4 top-4 cursor-pointer' />
                    ) : (
                        <PiEyeClosedThin onClick={togglePasswordVisibility} className='absolute right-4 top-4 cursor-pointer' />
                    )}
                </div>
                <button
                    className='bg-[#682E9E] text-white p-3 h-[50px] rounded-lg lg:w-[100%] xl:w-[600px]'
                    type="submit"
                    disabled={isLoading}
                    onClick={handleLoginClick}
                >
                    {isLoading ? (
                        <div className='flex items-center justify-center'>
                            <div className="loader"></div>
                        </div>
                    ) : (
                        'Login'
                    )}
                </button>
                <p className='text-white text-[0.9rem]'>Forgot password?</p>

            </form>
            <div className='mt-[10px] w-full flex items-center justify-center gap-x-2'>
                <div className='md:w-[30%] w-[20%] h-[1px] bg-[#cbd5e1]'></div>
                <p className='text-[#94a3b8] text-[0.8rem] lg:text-[1rem]'>or login with</p>
                <div className='md:w-[30%] w-[20%] h-[1px] bg-[#cbd5e1]'></div>
            </div>

            <div className='my-[24px] mt-[10px] flex flex-col lg:flex-row justify-center lg:justify-center space-y-4 lg:space-y-0 lg:space-x-4 items-center w-full p-2'>
                <button className='w-[70%] lg:w-[200px] rounded-lg flex items-center justify-center gap-x-2 h-[50px] border border-[#cbd5e1] bg-transparent'><Image src='/Symbol.png' alt='google' height={20} width={20} /> Google</button>

                <button className='w-[70%] lg:w-[200px] rounded-lg flex items-center justify-center gap-x-2 h-[50px] border border-[#cbd5e1] bg-transparent'><Image src='/sol.png' alt='google' height={20} width={20} /> Solana</button>
            </div>
        </div>
    )
}

export default App