'use client'
import React, { useState, useEffect } from 'react'
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TiWarningOutline } from "react-icons/ti";
import { useAppKit, useAppKitAccount } from '../utils/reown';
import { FcLinux } from "react-icons/fc";
import { FcLike } from "react-icons/fc";
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdClose } from "react-icons/io";

const App = () => {
    const [showToaster, setShowToaster] = useState(false);
    const [showVpnModal, setShowVpnModal] = useState(false);
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
            setShowVpnModal(false); // Ensure VPN modal is hidden after successful authentication
            const timer = setTimeout(() => {
                setShowToaster(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [isConnected, address]);

    const handleConnectClick = () => {
        if (!isConnected) {
            setShowVpnModal(true);
        } else {
            setShowVpnModal(false);
            router.push('/welcome');
        }
    };

    const handleProceed = async () => {
        setShowVpnModal(false);
        await openModal();
    };

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

            <AnimatePresence>
                {showVpnModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-[#1a1a1a] rounded-xl p-6 max-w-md w-full shadow-xl border border-purple-500/20"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-2">
                                    <TiWarningOutline className="text-yellow-500 text-2xl" />
                                    <h2 className="text-xl font-semibold text-white">VPN Notice</h2>
                                </div>
                                <button
                                    onClick={() => setShowVpnModal(false)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <IoMdClose size={24} />
                                </button>
                            </div>
                            
                            <p className="text-gray-300 mb-6">
                                If you're in a crypto-restricted region, please ensure your VPN is enabled before proceeding with email or social sign-in.
                            </p>
                            
                            <div className="flex gap-4 justify-end">
                                <button
                                    onClick={() => setShowVpnModal(false)}
                                    className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleProceed}
                                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors text-white"
                                >
                                    Proceed
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

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
                        <p>CreatorPass Network</p>
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
                        <div className='text-[1.8rem] md:mt-0 md:text-[30px] text-white font-bold w-full text-left lg:text-left mb-4 pl-4'>
                            <p className='text-white text-center whitespace-nowrap'>CreatorPass Network</p>
                        </div>
                        <p className='text-center lg:text-left mb-5 pl-4 text-gray-300'>
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
                <div onClick={handleConnectClick} style={{ backgroundColor: isConnected ? '#34c759' : '#7c3aed' }} className='w-full rounded-lg cursor-pointer p-2 md:p-0 md:ml-4 flex justify-center mb-14 md:mb-0 mt-6'>
                    <button className='w-full md:max-w-[250px] lg:max-w-[300px] flex items-center justify-center gap-x-2 h-[50px] text-white'>
                        <Image src='/sol.png' alt='sol' height={20} width={20} /> {isConnected ? 'Go in' : 'Connect wallet'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default App;
