'use client'
import React, { useEffect, useState, useRef } from 'react'
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
import { FaFire } from "react-icons/fa6";
import { motion } from "framer-motion";
import { IoSend } from "react-icons/io5";
import { TbWorldCheck } from "react-icons/tb";
import Toast from '@/components/Toast';

interface AccessCardProps {
  image: string;
  name: string;
  className: string;
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

interface WorldChat {
    address: string;
    message: string;
    profileImage: string;
    timestamp: string;
    country?: string;
}

interface Profile {
  address: string;
  username: string;
  profileImage: string;
  about?: string;
}

const Page = () => {
    const [chats, setChats] = useState<WorldChat[]>([]);
    const [message, setMessage] = useState('');
    const [hotCreators, setHotCreators] = useState<Profile[]>([]);
    const chatRef = useRef<HTMLDivElement>(null);
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>({ show: false, message: '', type: 'info' });

    useEffect(() => {
        fetchChats();
        fetchHotCreators();
    }, []);

    const fetchChats = async () => {
        try {
            const res = await fetch('/api/worldchat');
            const data = await res.json();
            setChats(data.chats);
            if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        } catch (error) {
            console.error('Error fetching chats:', error);
        }
    };

    const fetchHotCreators = async () => {
        try {
            const res = await fetch('/api/profiles');
            const data = await res.json();
            setHotCreators(data.profiles.slice(0, 1)); // Only get first creator
        } catch (error) {
            console.error('Error fetching creators:', error);
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            const address = localStorage.getItem('address');
            if (!address) {
                setToast({
                    show: true,
                    message: 'Please connect your wallet first',
                    type: 'warning'
                });
                return;
            }

            const response = await fetch('/api/worldchat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address, message: message.trim() })
            });

            const data = await response.json();

            if (!response.ok) {
                setToast({
                    show: true,
                    message: data.error,
                    type: 'warning'
                });
                return;
            }

            setMessage('');
            fetchChats();
        } catch (error) {
            console.error('Error sending message:', error);
            setToast({
                show: true,
                message: 'Failed to send message',
                type: 'error'
            });
        }
    };

    const formatUserInfo = (address: string, country?: string) => {
        const shortAddress = `${address.slice(0, 4)}...${address.slice(-4)}`;
        if (country) {
            return `${shortAddress} (${country.slice(0, 3).toUpperCase()})`;
        }
        return shortAddress;
    };

    return (
        <div className='min-h-screen bg-gradient-to-b from-[#1A1D1F] to-[#2A2D2F]'>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <NavBar />
            
            {/* Hero Section */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className='container mx-auto px-4 pt-20 pb-32'
            >
                <div className='max-w-4xl mx-auto text-center space-y-6'>
                    <motion.h1 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className='text-5xl md:text-7xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'
                    >
                        Empowering Creators & Rewarding Fans
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className='text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto'
                    >
                        Join the next generation of content creation. Access exclusive posts, videos, and experiences from your favorite creators.
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                    >
                        <Link href='/passes'>
                            <button className='mt-8 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-lg font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg'>
                                Explore Passes
                            </button>
                        </Link>
                    </motion.div>
                </div>
            </motion.div>


            {/* Cards Section */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className='relative max-w-6xl mx-auto px-4 -mt-20'
            >
                <div className='flex flex-col md:flex-row items-center justify-center gap-6 md:gap-4'>
                    {/* Card 1 */}
                    <motion.div 
                        initial={{ opacity: 0, x: -100, rotate: -12 }}
                        animate={{ opacity: 1, x: 0, rotate: -12 }}
                        whileHover={{ rotate: 0, scale: 1.05, x: -10 }}
                        transition={{ duration: 0.3 }}
                        className='hidden md:block'
                    >
                        <AccessCard
                            image="/two.jpeg"
                            name="Josh Daniel"
                            className="bg-gradient-to-r from-blue-400 to-purple-500"
                        />
                    </motion.div>

                    {/* Main Card */}
                    <motion.div 
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0, scale: 1.05 }}
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.3 }}
                        className='z-10'
                    >
                        <AccessCard
                            image="/smile.jpg"
                            name="Justina Kate"
                            className="bg-gradient-to-r from-blue-500 to-purple-600"
                        />
                    </motion.div>

                    {/* Card 3 */}
                    <motion.div 
                        initial={{ opacity: 0, x: 100, rotate: 12 }}
                        animate={{ opacity: 1, x: 0, rotate: 12 }}
                        whileHover={{ rotate: 0, scale: 1.05, x: 10 }}
                        transition={{ duration: 0.3 }}
                        className='hidden md:block'
                    >
                        <AccessCard
                            image="/three.jpeg"
                            name="Kelvin Jones"
                            className="bg-gradient-to-r from-blue-400 to-purple-500"
                        />
                    </motion.div>
                </div>
            </motion.div>

            {/* Community Section */}
            <div className='container mt-10 mx-auto px-4 py-20'>
                <div className='flex flex-col md:flex-row gap-8 max-w-7xl mx-auto'>
                    {/* World Chat */}
                    <div className='w-full md:w-2/3 bg-[#393e42] rounded-xl p-6'>
                        <div className='flex items-center gap-2'>
                        <h2 className='text-4xl font-bold text-white mb-6'>Creators World Chat</h2>
                        <TbWorldCheck size={30} className='text-white' />
                        </div>
                        
                        <div 
                            ref={chatRef}
                            className='h-[400px] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'
                        >
                            {chats.map((chat, index) => (
                                <div key={index} className='flex items-start gap-3'>
                                    <Image
                                        src={chat.profileImage}
                                        alt='Profile'
                                        width={40}
                                        height={40}
                                        className='rounded-full'
                                    />
                                    <div>
                                        <p className='text-gray-400 text-sm'>
                                            {formatUserInfo(chat.address, chat.country)}
                                        </p>
                                        <p className='text-white'>{chat.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <form onSubmit={handleSendMessage} className='flex gap-2'>
                            <input
                                type='text'
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder='Type your message...'
                                className='flex-1 bg-[#1A1D1F] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
                            />
                            <button
                                type='submit'
                                className='bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors'
                            >
                                <IoSend size={24} />
                            </button>
                        </form>
                    </div>

                    {/* Hot Creators */}
                    <div className='w-full md:w-1/3'>
                        <h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-2'>
                            HOT <FaFire className="text-orange-500" />
                        </h2>
                        <div className='space-y-4'>
                            {hotCreators.map((creator, index) => (
                                <div key={index} className='transform transition-all duration-300 hover:scale-105'>
                                    <AccessCard
                                        image={creator.profileImage || '/smile.jpg'}
                                        name={creator.username}
                                        className="bg-gradient-to-r from-blue-400 to-purple-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            

            {/* Features Section */}
            <div className='container mx-auto px-4 py-32'>
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    className='grid md:grid-cols-2 lg:grid-cols-4 gap-8'
                >
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>
                        <FeatureCard
                            icon={<FaUnlockKeyhole className="text-4xl" />}
                            title="Unlock the Future"
                            description="Revolutionary content creation and sharing platform"
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}>
                        <FeatureCard
                            icon={<FaBridgeCircleCheck className="text-4xl" />}
                            title="Bridge Connections"
                            description="Direct creator-to-fan relationships and experiences"
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>
                        <FeatureCard
                            icon={<SiFueler className="text-4xl" />}
                            title="Fuel Creativity"
                            description="Innovative tools for content creators to thrive"
                        />
                    </motion.div>
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}>
                        <FeatureCard
                            icon={<RiVipCrown2Fill className="text-4xl" />}
                            title="Premium Experience"
                            description="Exclusive content and unique fan experiences"
                        />
                    </motion.div>
                </motion.div>
            </div>

            <Footer />
        </div>
    )
}

const AccessCard = ({ image, name, className }: AccessCardProps) => (
  <div className={`w-[300px] rounded-2xl overflow-hidden shadow-2xl ${className}`}>
    <div className='p-6 text-center'>
      <Image height={45} width={45} src='/sol.png' alt='sol' className='mx-auto' />
      <p className='font-cursive text-2xl text-white font-bold mt-4'>Access Card</p>
    </div>
    <div className='bg-slate-800 p-6 space-y-4'>
      <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
      <Image src={image} className='rounded-lg w-full h-48 object-cover' height={70} width={150} alt='profile' />
      <div className='flex items-center justify-center gap-3'>
        <RiHeart2Line className='text-white' />
        <p className='font-mono text-white font-bold'>{name}</p>
        <RiHeart2Line className='text-white' />
      </div>
    </div>
  </div>
)

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
  <div className='bg-[#232629] border border-blue-500/30 p-8 rounded-xl hover:border-blue-500 transition-colors duration-300'>
    <div className='text-blue-400 mb-4'>{icon}</div>
    <h3 className='text-xl font-bold text-white mb-2'>{title}</h3>
    <p className='text-gray-300'>{description}</p>
  </div>
)

export default Page
