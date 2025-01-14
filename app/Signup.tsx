'use client'
import React, { useState } from 'react'
// import { PiEyeClosedThin } from "react-icons/pi";
// import { GoEye } from "react-icons/go";
import Image from 'next/image';
// import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { useAppKit, useAppKitAccount } from '../utils/reown';

const App = () => {
    const [showToaster, setShowToaster] = useState(false);
    const [buttonText, setButtonText] = useState('Get started')
    const router = useRouter();
    const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount();
    const { open } = useAppKit();
    // alert(isConnected)
    
    const openModal = async() => {
        try {
            
            if (isConnected) {
                localStorage.setItem('address', address as string);
                router.push('/welcome');
                return
            }
            await open();
            

            
          } catch (error) {
            console.error('Modal error:', error);
            // Handle error appropriately
          }
        
      };
    return (
        <div className='relative lg:ml-10 mt-24 lg:mt-[80px] bg-[#1A1D1F] text-white px-[40px] flex flex-col justify-center items-center lg:items-start'>
            {showToaster && (
                <div className='absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded'>
                    Account created successfully
                </div>
            )}
            <div className='md:text-[30px] text-[3rem] text-white font-bold w-full text-center lg:text-left mb-4'>
                <p> CreatorPass</p>
            </div>
            <p className='mb-5'>
                CreatorPass connects creators and fans through unique NFT passes. Creators can easily mint digital passes to share premium content, while fans unlock exclusive videos, events, and more with their passes. </p>
             <div className='md:text-[30px] text-[3rem] text-white font-bold w-full text-center lg:text-left mb-5 mt-5'>
                <p className='leading-none'>  For creators</p>
            </div>
             <p className='mb-5'>Monetize content, manage fans, and offer special experiences. </p>
              <div className='md:text-[30px] text-[3rem] text-white font-bold w-full text-center lg:text-left mb-5 mt-5'>
                <p className='leading-none'>  For fans</p>
            </div>
            <p className='mb-5'> Get exclusive access to the content you love and connect deeper with creators. </p>
            <div style={{backgroundColor: isConnected ? '#34c759' : '#7c3aed'}} className='my-[24px] mt-[10px] flex flex-col lg:flex-row cursor-pointer justify-center lg:justify-center space-y-4 lg:space-y-0 lg:space-x-4 items-center w-full p-2'>
                <button onClick={() => openModal()} className='w-[70%] lg:w-[300px] rounded-lg flex items-center justify-center gap-x-2 h-[50px] text-white'><Image src='/sol.png' alt='google' height={20} width={20} /> {isConnected ? 'Proceed to creatorPass' : 'Get started'}</button>
            </div>
        </div>
    )
}

export default App;
