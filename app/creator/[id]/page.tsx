'use client'
import React, { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { FaGift } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAppKit, useAppKitAccount } from '../../../utils/reown';

interface Post {
  _id: string;
  username: string;
  note: string;
  image: string;
  createdAt: string;
}

interface Profile {
  username: string;
  profileImage: string;
  address: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

const CreatorPage = ({ params }: PageProps) => {
    const { id } = use(params);
    const [posts, setPosts] = useState<Post[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);
    const { open } = useAppKit();

    useEffect(() => {
        const fetchCreatorData = async () => {
            try {
                // Fetch creator's profile
                const profileRes = await fetch(`/api/profile?address=${id}`);
                const profileData = await profileRes.json();
                
                if (profileData.profile) {
                    setProfile(profileData.profile);
                }

                // Fetch all posts
                const postsRes = await fetch('/api');
                const postsData = await postsRes.json();
                
                // Filter posts for this creator
                const creatorPosts = postsData.creator.filter((post: Post) => 
                    post.username === id
                );
                
                setPosts(creatorPosts);
            } catch (error) {
                console.error('Error fetching creator data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreatorData();
    }, [id]);

    const censorAddress = (address: string) => {
        if (!address) return '';
        const start = address.slice(0, 6);
        const end = address.slice(-4);
        return `${start}...${end}`;
    };

    const handleCopyAddress = async () => {
        try {
            await navigator.clipboard.writeText(id);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy address:', err);
        }
    };

    const handleGift = () => {
        open();
        setShowGiftModal(false);
    };

    if (loading) {
        return (
            <div className='bg-[#1A1D1F] min-h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <p className='text-white text-2xl animate-pulse'>Loading creator content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-[#1A1D1F]'>
            <NavBar />
            <div className='mt-[80px]'></div>
            <div className='flex flex-col space-y-10 justify-center items-center mb-20'>
                {posts.map((post) => (
                    <div key={post._id} className='w-[65vw] min-h-[600px] rounded-xl h-auto flex flex-col bg-transparent border-[1px] border-gray-200'>
                        <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-green-700'>
                            <div className='flex items-center gap-x-3'>
                                <Image 
                                    src={profile?.profileImage || '/smile.jpg'} 
                                    height={50} 
                                    width={50} 
                                    alt='profile' 
                                    className='rounded-lg' 
                                />
                                <p className='text-[1.1rem]'>{profile?.username || 'Anonymous'}</p>
                            </div>
                            <div className='flex items-center gap-x-2'>
                                <Image src='/sol.png' height={20} width={20} alt='profile' className='rounded-lg' />
                                <p>{censorAddress(post.username)}</p>
                            </div>
                        </div>
                        <div className='flex-start px-10 mt-5 text-white'>
                            <p className='text-left'>{post.note}</p>
                        </div>
                        {post.image && (
                            <div className='flex justify-center w-[100%] items-center'>
                                <Image 
                                    src={post.image} 
                                    height={1000} 
                                    width={1000} 
                                    className='h-[350px] mt-7 w-[60%] rounded-lg border-[1px] border-gray-200 px-5' 
                                    alt='post image' 
                                />
                            </div>
                        )}
                        <div className='mt-10 w-[100%] flex mb-5 px-10 justify-between items-center'>
                            <div className='flex items-center gap-x-3 text-white'>
                                <IoHeartHalf className='text-white text-[1.7rem]' />
                                <p>0 likes</p>
                            </div>
                            <div className='flex items-center gap-x-3 text-white'>
                                <FaCommentMedical className='text-white text-[1.7rem]' />
                                <p>0 comments</p>
                            </div>
                            <button 
                                onClick={() => setShowGiftModal(true)}
                                className='bg-blue-700 text-[1rem] h-[40px] w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'
                            >
                                <FaGift className='text-[1.7rem]' />Gift
                            </button>
                        </div>
                    </div>
                ))}

                {posts.length === 0 && (
                    <div className='text-white text-xl text-center py-20'>
                        This creator hasn't posted anything yet.
                    </div>
                )}
            </div>
            <Footer />

            {/* Gift Modal */}
            {showGiftModal && (
                <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                    <div className='bg-[#272B30] rounded-lg p-6 w-[400px] relative'>
                        <button 
                            onClick={() => setShowGiftModal(false)}
                            className='absolute top-4 right-4 text-white hover:text-gray-300'
                        >
                            <IoMdClose size={24} />
                        </button>

                        <h2 className='text-white text-xl font-bold mb-6'>Gift {profile?.username}</h2>
                        
                        <div className='space-y-4'>
                            <div className='flex flex-col gap-y-2'>
                            <p className='text-gray-300 text-md'>Gift sol to the wallet below</p>
                                <p className='text-gray-300 text-sm'>Creator's Address:</p>
                                <div className='flex items-center gap-x-2'>
                                    <p className='text-white font-mono bg-[#1A1D1F] p-2 rounded flex-1 overflow-x-auto'>
                                        {id}
                                    </p>
                                    <button 
                                        onClick={handleCopyAddress}
                                        className='bg-blue-600 p-2 rounded hover:bg-blue-700 transition-colors'
                                    >
                                        <FaCopy className='text-white' />
                                    </button>
                                </div>
                                {copySuccess && (
                                    <p className='text-green-500 text-sm'>Address copied!</p>
                                )}
                            </div>

                            {/* <button
                                onClick={handleGift}
                                className='w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-x-2'
                            >
                                <FaGift /> Send Gift
                            </button> */}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreatorPage;
