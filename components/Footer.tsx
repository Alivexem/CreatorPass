import React from 'react'
import Image from 'next/image'
import { FaFire } from "react-icons/fa6";
const Footer = () => {
    return (
        <div className='mt-[100px] bg-[#15171a] flex-col w-[100%] h-[200px] text-white hidden md:flex justify-center items-center p-3'>
            <div className='flex justify-center items-center flex-col space-y-5'>
                <div className='flex items-center gap-x-2'>
                    <Image src='/whiteLogo.png' alt='logo' height={30} width={150} />
                    <p className='font-bold text-[1.4rem] font-mono'> Designed and Developed by Athkins</p>
                </div>
                <div className='flex items-center gap-x-2 mb-[50px]'>
                    <FaFire />
                    <p className='font-mono text-[1rem]'>During the 20 days Bounty Task using Reown AppKit</p>
                    <FaFire />
                </div>
            </div>

        </div>
    )
}

export default Footer
