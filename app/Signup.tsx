'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';

import { useAppKit, useAppKitAccount } from '../utils/reown';

const App = () => {
    const [showToaster, setShowToaster] = useState(false);
    const [buttonText, setButtonText] = useState('Get started')
    const router = useRouter();
    const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount();
    const { open } = useAppKit();
    
    useEffect(() => {
        if (isConnected) {
            setShowToaster(true);
            const timer = setTimeout(() => {
                setShowToaster(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isConnected]);
    
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
        <div className='flex min-h-screen md:-mt-[70px] w-full items-center justify-center bg-[#1A1D1F] text-white px-[20px] lg:px-[40px] lg:ml-10'>
            {showToaster && (
                <div className='absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded'>
                    Authentication Succesfull
                </div>
            )}
            <div className='flex flex-col items-center lg:items-start max-w-[600px] w-full'>
                <div className='my-14'>
                    <Image 
                        src='/aiwoman.jpeg' 
                        className='rounded-lg lg:hidden' 
                        alt='aiwoman' 
                        height={250} 
                        width={250}
                        style={{
                            animation: 'lightPulse 3s infinite'
                        }}
                    />
                    <style jsx global>{`
                        @keyframes lightPulse {
                            0% {
                                opacity: 1;
                            }
                            50% {
                                opacity: 0.7;
                            }
                            100% {
                                opacity: 1;
                            }
                        }
                    `}</style>
                </div>
                <div className='text-[2.5rem] md:text-[30px] text-white font-bold w-full text-center lg:text-left mb-4'>
                    <p>CreatorPass</p>
                </div>
                <p className='text-center lg:text-left mb-5'>
                    CreatorPass connects creators and fans through unique NFT passes. Creators can easily mint digital passes to share premium content, while fans unlock exclusive videos, events, and more with their passes.</p>
                <div className='text-[2.5rem] md:text-[30px] text-white font-bold w-full text-center lg:text-left mb-5 mt-5'>
                    <p className='leading-none'>For creators</p>
                </div>
                <p className='text-center lg:text-left mb-5'>Monetize content, manage fans, and offer special experiences.</p>
                <div className='text-[2.5rem] md:text-[30px] text-white font-bold w-full text-center lg:text-left mb-5 mt-5'>
                    <p className='leading-none'>For fans</p>
                </div>
                <p className='text-center lg:text-left mb-5'>Get exclusive access to the content you love and connect deeper with creators.</p>
                <div style={{backgroundColor: isConnected ? '#34c759' : '#7c3aed'}} className='w-full flex justify-center mb-14 md:mb-0 mt-6'>
                    <button onClick={() => openModal()} className='w-full max-w-[300px] rounded-lg flex items-center justify-center gap-x-2 h-[50px] text-white'>
                        <Image src='/sol.png' alt='sol' height={20} width={20} /> {isConnected ? 'Go in' : 'Get started'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App;
