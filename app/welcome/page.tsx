'use client'
import React, { useEffect, useState, useRef } from 'react'
import NavBar from '@/components/NavBar'
import { useRouter } from 'next/navigation';
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
import { getDatabase, ref, push, onValue, query, orderByChild } from 'firebase/database';
import { app } from '@/utils/firebase';
import { BiLoaderAlt } from "react-icons/bi";

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
    id: string; // Add this
    address: string;
    message: string;
    profileImage: string;
    timestamp: number; // Change to number
    country?: string;
    username?: string; // Add username to interface
}

interface Profile {
    address: string;
    username: string;
    profileImage: string;
    about?: string;
}

interface Message {
    text: string;
    sender: string;
    timestamp: number;
}

interface ChatHistoryItem {
    id: string;
    recipientAddress: string;
    username: string;
    profileImage: string;
    lastMessage: string;
    timestamp: number;
}

const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const messageDate = new Date(Number(timestamp));
    const diffInMinutes = Math.floor((now.getTime() - messageDate.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return messageDate.toLocaleDateString();
};

const Page = () => {
    const [chats, setChats] = useState<WorldChat[]>([]);
    const [message, setMessage] = useState('');
    const [hotCreators, setHotCreators] = useState<Profile[]>([]);
    const chatRef = useRef<HTMLDivElement>(null);
    const [userAddress, setUserAddress] = useState<string | null>(null);
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning';
    }>({ show: false, message: '', type: 'info' });
    const [personalChats, setPersonalChats] = useState<ChatHistoryItem[]>([]);
    const [isLoadingPersonalChats, setIsLoadingPersonalChats] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string>(''); // Add error message state
    const [isLoadingWorldChat, setIsLoadingWorldChat] = useState(true);

    const router = useRouter();
    
    // Update the useEffect that fetches data
    useEffect(() => {
        const address = localStorage.getItem('address');
        setUserAddress(address);

        let isSubscribed = true;

        const fetchData = async () => {
            try {
                const creatorsRes = await fetch('/api/profiles');
                const creatorsData = await creatorsRes.json();

                if (!isSubscribed) return;

                setHotCreators(creatorsData.profiles.slice(0, 1));
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchData();

        // Initialize Firebase listeners
        const database = getDatabase(app);
        
        // World Chat listener
        const worldChatRef = ref(database, 'worldChat');
        const chatQuery = query(worldChatRef, orderByChild('timestamp'));

        setIsLoadingWorldChat(true);
        const worldChatUnsubscribe = onValue(chatQuery, (snapshot) => {
            const messages: WorldChat[] = [];
            snapshot.forEach((childSnapshot) => {
                messages.push({
                    id: childSnapshot.key as string,
                    ...childSnapshot.val()
                });
            });
            const sortedMessages = messages.sort((a, b) => a.timestamp - b.timestamp);
            setChats(sortedMessages);
            setIsLoadingWorldChat(false);

            // Scroll to bottom after new messages are added
            setTimeout(() => {
                if (chatRef.current) {
                    chatRef.current.scrollTo({
                        top: chatRef.current.scrollHeight,
                        behavior: 'smooth'
                    });
                }
            }, 100);
        });

        // Personal Chats listener
        if (address) {
            const chatHistoryRef = ref(database, 'chatHistory');
            setIsLoadingPersonalChats(true);

            const personalChatsUnsubscribe = onValue(chatHistoryRef, (snapshot) => {
                const chatHistory = snapshot.val();
                if (chatHistory) {
                    const personalChatsArray = Object.entries(chatHistory)
                        .filter(([chatId]) => {
                            const [addr1, addr2] = chatId.split('-');
                            return addr1 === address || addr2 === address;
                        })
                        .map(([chatId, data]: [string, any]) => {
                            const [addr1, addr2] = chatId.split('-');
                            const isUser1 = addr1 === address;
                            return {
                                id: chatId,
                                recipientAddress: isUser1 ? addr2 : addr1,
                                username: data.username || 'Anonymous',
                                profileImage: data.profileImage || '/empProfile.png',
                                lastMessage: data.lastMessage || '',
                                timestamp: data.timestamp || Date.now()
                            };
                        })
                        .sort((a, b) => b.timestamp - a.timestamp);

                    setPersonalChats(personalChatsArray);
                }
                setIsLoadingPersonalChats(false);
            });

            return () => {
                isSubscribed = false;
                worldChatUnsubscribe();
                personalChatsUnsubscribe();
            };
        }

        return () => {
            isSubscribed = false;
            worldChatUnsubscribe();
        };
    }, []); // Empty dependency array since we only want this to run once

    useEffect(() => {
        if (chatRef.current) {
            // Ensure scroll to bottom happens after content is rendered
            setTimeout(() => {
                chatRef.current?.scrollTo({
                    top: chatRef.current.scrollHeight,
                    behavior: 'smooth'
                });
            }, 100);
        }
    }, [chats]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        try {
            const address = localStorage.getItem('address');
            if (!address) {
                setErrorMessage('Please connect your wallet first');
                return;
            }

            // Check if user has profile
            const profileRes = await fetch(`/api/profile?address=${address}`);
            const profileData = await profileRes.json();

            if (!profileData.profile) {
                setErrorMessage('Please create a profile in Dashboard before chatting');
                return;
            }

            const database = getDatabase(app);
            const worldChatRef = ref(database, 'worldChat');

            // Use the profile data from the API
            const messageData = {
                message: message.trim(),
                address,
                username: profileData.profile.username,
                profileImage: profileData.profile.profileImage || '/empProfile.png',
                timestamp: Date.now()
            };

            await push(worldChatRef, messageData);
            setMessage('');
            setErrorMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
            setErrorMessage('Failed to send message');
        }
    };

    const handleProfileClick = (address: string) => {
        router.push(`/creators?highlight=${address}`);
    };

    const formatUserInfo = (username: string = 'Anonymous', country?: string) => {
        if (country) {
            return `${username} (${country.slice(0, 3).toUpperCase()})`;
        }
        return username;
    };

    const formatDate = (timestamp: string) => {
        const date = new Date(timestamp);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today's chat";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday's chat";
        } else {
            return date.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });
        }
    };

    const renderChatMessage = (message: string) => {
        const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
        const linkifiedContent = message.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${part}</a>`;
            }
            return part;
        }).join('');

        return (
            <div 
                className="text-white text-[0.8rem] md:-[0.9rem] break-words"
                dangerouslySetInnerHTML={{ __html: linkifiedContent }}
            />
        );
    };

    // Update renderMessages to include click handler
    const renderMessages = () => (
        <div
            ref={chatRef}
            className='h-[400px] overflow-y-auto mb-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent'
        >
            {isLoadingWorldChat ? (
                <div className="flex justify-center items-center h-full">
                    <BiLoaderAlt className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            ) : chats.length > 0 ? (
                chats.map((chat) => (
                    <div key={chat.id} className='flex items-start gap-3'>
                        <Image
                            src={chat.profileImage || '/empProfile.png'}
                            alt='Profile'
                            width={35}
                            height={35}
                            className='rounded-full object-cover w-[40px] h-[40px] cursor-pointer hover:opacity-80 transition-opacity'
                            onClick={() => handleProfileClick(chat.address)}
                        />
                        <div>
                            <p className='text-purple-100 text-sm'>
                                {chat.username || 'Anonymous'}
                            </p>
                            {renderChatMessage(chat.message)}
                            <p className='text-gray-500 text-[0.7rem] mt-1'>
                                {new Date(chat.timestamp).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex justify-center items-center h-full text-gray-400">
                    No messages yet. Be the first to chat!
                </div>
            )}
        </div>
    );

    return (
        <div className='min-h-screen bg-black'>
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
                className='container mx-auto px-4 md:mt-[10px] w-full min-h-[500px] flex pt-20 pb-32'
            >
                <div className='max-w-4xl flex items-start flex-col mx-auto text-center space-y-6'>
                    <motion.h1
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className='text-3xl md:text-7xl mt-[50px] md:mt-[80px] text-start font-bold bg-gradient-to-r from-blue-400 to-purple-500 text-transparent bg-clip-text'
                    >
                        Empowering Creators & Rewarding Fans
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1, delay: 0.4 }}
                        className='text-md md:text-2xl text-gray-300 text-start max-w-2xl'
                    >
                        Join the next generation of content creators and viewers. Access exclusive posts, videos, and experiences from your favorite creators. Create magic in your dashboard!
                    </motion.p>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, delay: 0.6 }}
                        className='flex items-center gap-x-8'
                    >
                        <Link href='/passes'>
                            <button className="mt-8 text-[15px] px-4 md:px-8 py-3 md:py-4 rounded-xl md:mb-[50px] text-white text-lg font-medium transform hover:scale-105 transition-all duration-200 
  shadow-sm bg-transparent whitespace-nowrap border md:border-[2px] border-blue-600">
                                Check Passes
                            </button>

                        </Link>

                        <Link href='/feed'>
                            <button className="mt-8 px-4 md:px-8 py-3 md:py-4 rounded-xl md:mb-[50px] text-white text-lg font-medium transform hover:scale-105 transition-all duration-200 
  shadow-sm bg-transparent border whitespace-nowrap md:border-[2px] text-[15px] border-purple-600">
                                Explore Feed
                            </button>

                        </Link>
                    </motion.div>
                </div>


                <div className='h-[400px] hidden mt-[8%] min-w-[30%] max-w-[30%] items-center md:flex flex-col p-4 bg-[#1A1D1F] backdrop-blur-md rounded-[12px] text-white border-dashed border-[3px] border-blue-600'>
                    <div className='w-full flex justify-between items-center mb-4'>
                        <p className='text-[1.6rem] font-bold'>Messages</p>
                        <span className='text-sm text-gray-400'>{personalChats.length} chats</span>
                    </div>
                    <div className='border-gray-500/30 border-t w-full flex flex-col space-y-2 overflow-auto h-full px-2'>
                        {isLoadingPersonalChats ? (
                            <div className="flex justify-center items-center h-full">
                                <BiLoaderAlt className="w-8 h-8 text-purple-500 animate-spin" />
                            </div>
                        ) : personalChats.length > 0 ? (
                            personalChats.map((chat) => (
                                <Link
                                    key={chat.id}
                                    href={`/creators?highlight=${chat.recipientAddress}`}
                                    className='flex items-center gap-x-3 cursor-pointer hover:bg-purple-900/20 p-3 rounded-lg transition-all'
                                >
                                    <div className='relative'>
                                        <Image
                                            width={45}
                                            height={45}
                                            alt='profilePic'
                                            src={chat.profileImage}
                                            className='rounded-full h-[45px] w-[45px] object-cover'
                                        />
                                        {/* <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1D1F]'></div> */}
                                    </div>
                                    <div className='flex-1 min-w-0'>
                                        <div className='flex justify-between items-start'>
                                            <p className='font-semibold truncate'>{chat.username}</p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                                {new Date(chat.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                        <p className='text-sm text-gray-400 truncate'>
                                            {chat.lastMessage}
                                        </p>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-4">
                                <p className='text-center text-gray-400'>No messages yet</p>
                                <Link
                                    href="/creators"
                                    className="text-purple-500 hover:text-purple-400 text-sm flex items-center gap-2"
                                >
                                    <span>Find creators to chat with</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>


            {/* Cards Section */}
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className='relative max-w-6xl mx-auto px-4 -mt-20'
            >
                <div className='flex flex-col md:flex-row mt-[60px] items-center justify-center gap-6 md:gap-4'>
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
                            className="bg-gradient-to-r from-blue-500 to-purple-600 hidden md:block"
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
            <div className='container -mt-10 md:mt-10 mx-auto px-4 md:py-20'>
                <div className='flex flex-col md:flex-row gap-8 max-w-7xl mx-auto'>
                    {/* World Chat */}
                    <div className='w-full md:w-2/3 bg-[#252729] rounded-xl p-6'>
                        <div className='flex items-center flex-col'>
                            <div className='flex items-center gap-2'>
                                <h2 className='text-xl md:text-4xl font-bold text-white mb-6'>Creators World Chat</h2>
                                <TbWorldCheck size={30} className='text-white' />
                            </div>
                            {/* <p className='text-gray-400 text-sm'>All Countries</p> */}
                        </div>

                        {renderMessages()}

                        <form onSubmit={handleSendMessage} className='flex flex-col gap-2'>
                            <div className='flex gap-2'>
                                <input
                                    type='text'
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder='Type your message...'
                                    className='flex-1 bg-[#292e31] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                />
                                <button
                                    type='submit'
                                    className='bg-purple-600 text-white p-2 rounded-lg transition-colors hover:bg-purple-700'
                                >
                                    <IoSend size={20} />
                                </button>
                            </div>
                            {errorMessage && (
                                <p className="text-red-500 font-bold text-sm">{errorMessage}</p>
                            )}
                        </form>
                    </div>

                    {/* Hot Creators */}
                    <div className='w-full md:w-1/3'>
                        <h2 className='text-2xl font-bold text-white mb-6 flex items-center gap-2'>
                            WELCOME <FaFire className="text-orange-500" />
                        </h2>
                        <div className='flex justify-center items-center w-full mb-[60px]'>
                            <div className='space-y-4 -mb-[150px] md:mb-0'>
                                {hotCreators.map((creator, index) => (
                                    <div key={index} className='transform transition-all duration-300 hover:scale-105'>
                                        <AccessCard
                                            image={creator.profileImage || '/empProfile.png'}
                                            name={creator.username}
                                            className="bg-gradient-to-r from-blue-400 to-purple-500"
                                        />
                                    </div>
                                ))}
                            </div>
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
                    className='grid grid-cols-2 lg:grid-cols-4 gap-8'
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
        <div className='bg-[#080e0e] p-6 space-y-4'>
            <Image src='/whiteLogo.png' alt='logo' height={10} width={60} className='w-24 mx-auto' />
            <Image src={image} className='rounded-lg w-full h-48 object-cover' height={70} width={150} alt='profile' />
            <div className='flex items-center justify-center gap-3'>
                <RiHeart2Line className='text-white' />
                <p className='font-mono md:text-[1rem] text-[0.8rem] text-white font-bold'>{name}</p>
                <RiHeart2Line className='text-white' />
            </div>
        </div>
    </div>
)

const FeatureCard = ({ icon, title, description }: FeatureCardProps) => (
    <div className='bg-[#232629] box-border h-auto border border-blue-500/30 p-8 rounded-xl hover:border-blue-500 transition-colors duration-300'>
        <div className='text-blue-400 mb-4'>{icon}</div>
        <h3 className='text-lg md:text-xl font-bold text-white mb-2'>{title}</h3>
        <p className='text-gray-300 text-[0.8rem] md:text-[0.9rem]'>{description}</p>
    </div>
)

export default Page
