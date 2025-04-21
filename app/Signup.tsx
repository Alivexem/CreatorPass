'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TiWarningOutline } from "react-icons/ti";
import { useAppKit, useAppKitAccount } from '../utils/reown';
import { FcLinux } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
const App = () => {
    const [showToaster, setShowToaster] = useState(false);
    const [buttonText, setButtonText] = useState('Connect wallet')
    const router = useRouter();
    const { address, isConnected, caipAddress, status, embeddedWalletInfo } = useAppKitAccount();
    const { open } = useAppKit();

    const trackUserAuth = async (userAddress: string) => {
        try {
            const response = await fetch('/api/users/auth', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ address: userAddress }),
            });
            const data = await response.json();
            if (data.success && data.isNewUser) {
                console.log('New user authenticated');
            }
        } catch (error) {
            console.error('Error tracking user:', error);
        }
    };

    useEffect(() => {
        if (isConnected && address) {
            trackUserAuth(address);
            setShowToaster(true);
            const timer = setTimeout(() => {
                setShowToaster(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isConnected, address]);

    const openModal = async () => {
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
        <div className='flex min-h-screen m-0 p-0 w-full items-center justify-center text-white'>
            {showToaster && (
                <div className='absolute top-5 right-5 bg-blue-500 text-white px-4 py-2 rounded'>
                    Authentication Succesfull
                </div>
            )}
            <div className='flex flex-col p-2 md:p-0 items-center lg:items-start max-w-[600px] w-full'>
                <div style={{
                    backgroundImage: 'url(/gifimage.gif)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    width: '100%'
                }} className='mb-14 h-[480px] flex justify-center items-center md:hidden'>
                    <div className='absolute top-5 left-3 md:hidden'>
                        <Image style={{borderRadius: '50%'}} className='rounded-full' src='/clogo.jpg' alt='logo' height={50} width={50} />
                    </div>
                    {/* <div className='absolute top-6 right-4 md:hidden'>
                        <Image src='/sol.png' height={45} width={45} alt='profile' className='rounded-lg' />
                    </div>  */}
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
                <div className='hidden md:block'>
                    <div className='text-[2.5rem] mt-[500px] md:mt-0 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-4 pl-4'>
                        <p>CreatorPass</p>
                    </div>
                    <p className='text-left lg:text-left mb-5 pl-4 text-gray-300'>
                        CreatorPass connects creators and fans through unique NFT passes. Creators can easily mint digital passes to share premium content, while fans unlock exclusive videos, events, and more with their passes. Earn CRTP points that will later be converted into Tradable tokens when you engage with posts and mint NFT passes</p>
                    <div className='text-[2.5rem] flex items-center gap-x-2 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-5 mt-5 pl-4'>
                        {/* <FcLinux /> */}
                        <p className='leading-none'>For creators</p>
                    </div>
                    <p className='text-left lg:text-left mb-5 pl-4 text-gray-300'>Monetize content, manage fans, and offer special experiences.</p>
                    <div className='text-[2.5rem] flex items-center gap-x-2 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-5 mt-5 pl-4'>
                        {/* <FcLike /> */}
                        <p className='leading-none'>For fans</p>
                    </div>
                    <p className='text-left lg:text-left mb-5 pl-4 text-gray-300'>Get exclusive access to the content you love and connect deeper with creators. Gift creators directly and buy crypto effortlessly in-app to top-up balance</p>

                </div>

                <div className='md:hidden p-2 mt-[500px] bg-black'>
                    <div className='flex flex-col justify-center items-center border border-purple-500 rounded-xl bg-transparent p-4'>
                        <div className='text-[2.5rem] md:mt-0 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-4 pl-4'>
                            <p className='text-white text-center'>CreatorPass</p>
                        </div>
                        <p className='text-left lg:text-left mb-5 pl-4 text-gray-300'>
                            CreatorPass connects creators and fans through unique NFT passes. Creators can easily mint digital passes to share premium content, while fans unlock exclusive videos, events, and more with their passes. Earn CRTP points that will later be converted into Tradable tokens when you engage with posts and mint NFT passes</p>
                    </div>

                    {/*<div className='flex flex-col justify-center items-center border border-purple-500 rounded-xl bg-transparent p-4 mt-7'>
                     <div className='text-[2.5rem] flex items-center gap-x-2 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-5 mt-5 pl-4'>
                    
                        <p className='leading-none'>For creators</p>
                    </div>
                        <p className='text-left lg:text-left mb-5 pl-4 text-gray-300'>Monetize content, manage fans, and offer special experiences. </p>
                    </div>
                    <div className='flex flex-col justify-center items-center border border-purple-500 rounded-xl bg-transparent p-4 mt-7'>
                    <div className='text-[2.5rem] flex items-center gap-x-2 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-5 mt-5 pl-4'>
                    
                        <p className='leading-none'>For fans</p>
                    </div>
                        <p className='text-left lg:text-left mb-5 pl-4 text-gray-300'>Get exclusive access to the content you love and connect deeper with creators. Gift creators directly and buy crypto effortlessly in-app to top-up balance.</p>
                    </div> */}
                </div>
                <div onClick={() => openModal()} style={{ backgroundColor: isConnected ? '#34c759' : '#7c3aed' }} className='w-full rounded-lg cursor-pointer p-2 md:p-0 md:ml-4 flex justify-center mb-14 md:mb-0 mt-6'>
                    <button className='w-full md:max-w-[250px] lg:max-w-[300px] flex items-center justify-center gap-x-2 h-[50px] text-white'>
                        <Image src='/sol.png' alt='sol' height={20} width={20} /> {isConnected ? 'Go in' : 'Connect wallet'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App;
