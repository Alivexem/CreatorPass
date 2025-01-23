'use client'
import React, { use, useState, useEffect } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { FaGift } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { GiFlowerPot, GiRing } from "react-icons/gi";
import { FaLaptopHouse } from "react-icons/fa";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect, PublicKey, Transaction, SystemProgram, Provider } from '../../../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { FaCar } from "react-icons/fa";




// import { PublicKey, Transaction, SystemProgram } from "@solana/web3.js";
// import { useAppKitAccount, useAppKitProvider } from '@reown/appkit/react';
// import type { Provider } from '@reown/appkit-adapter-solana/react';



interface Post {
    _id: string;
    username: string;
    note: string;
    image: string;
    createdAt: string;
    comments?: Array<{
        address: string;
        comment: string;
        timestamp?: Date;
    }>;
    likes?: string[];
    likeCount?: number;
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
    const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
    const [likes, setLikes] = useState<{ [key: string]: number }>({});
    const [hasLiked, setHasLiked] = useState<{ [key: string]: boolean }>({});
    const [isCommenting, setIsCommenting] = useState<{ [key: string]: boolean }>({});


    const { isConnected, address } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');


    // function to send a TX
    const handleSendTx = async (amount: number, receiver: string) => {
        const latestBlockhash = connection ? await connection.getLatestBlockhash() : null;
        const walletAddress = localStorage.getItem('address') || '';

        const transaction = new Transaction({
            feePayer: new PublicKey(walletAddress),
            recentBlockhash: latestBlockhash?.blockhash,
        }).add(
            SystemProgram.transfer({
                fromPubkey: new PublicKey(walletAddress),
                toPubkey: new PublicKey(receiver),
                lamports: amount,
            })
        );

        const signature = connection ? await walletProvider.sendTransaction(transaction, connection) : null;
        console.log(signature);
    }

    useEffect(() => {
        const fetchCreatorData = async () => {
            try {
                const myAddress = localStorage.getItem('address') || '';

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

                // Initialize likes state for each post
                const initialLikes: { [key: string]: number } = {};
                const initialHasLiked: { [key: string]: boolean } = {};

                creatorPosts.forEach((post: Post) => {
                    initialLikes[post._id] = post.likeCount || 0;
                    initialHasLiked[post._id] = post.likes?.includes(myAddress) || false;
                });

                setPosts(creatorPosts);
                setLikes(initialLikes);
                setHasLiked(initialHasLiked);
            } catch (error) {
                console.error('Error fetching creator data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreatorData();
    }, [id]);

    const handleLike = async (postId: string) => {
        try {
            const address = localStorage.getItem('address');
            if (!address) return;

            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) {
                throw new Error('Failed to update like');
            }

            const data = await res.json();

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, likeCount: data.likeCount }
                        : post
                )
            );

            setLikes(prev => ({ ...prev, [postId]: data.likeCount }));
            setHasLiked(prev => ({ ...prev, [postId]: data.hasLiked }));

        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!newComment[postId]?.trim()) return;

        setIsCommenting(prev => ({ ...prev, [postId]: true }));

        try {
            const address = localStorage.getItem('address');
            if (!address) return;

            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    comment: newComment[postId].trim()
                })
            });

            const data = await res.json();
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: data.comments }
                        : post
                )
            );

            setNewComment(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsCommenting(prev => ({ ...prev, [postId]: false }));
        }
    };

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
            <div className='bg-[#1A1D1F] pb-[100px] md:pb-0 min-h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <p className='text-white text-2xl animate-pulse'>Loading creator content...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-[#1A1D1F] pb-[80px] md:pb-0'>
            <NavBar />
            <div className='mt-[80px]'></div>
            <div className='flex flex-col space-y-10 justify-center items-center mb-20'>
                {posts.map((post) => (
                    <div key={post._id} className='md:w-[50vw] w-[95%] min-h-[200px] rounded-xl bg-transparent border-[1px] border-gray-200'>
                        <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-[#26355D]'>
                            <div className='flex items-center gap-x-3'>
                                <div className='relative h-[50px] w-[50px]'>
                                    <Image
                                        src={profile?.profileImage || '/smile.jpg'}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        alt='profile'
                                        className='rounded-lg'
                                    />
                                </div>
                                <p className='text-[1.1rem]'>{profile?.username || 'Anonymous'}</p>
                            </div>
                            <div className='flex items-center gap-x-2'>
                                <Image src='/sol.png' height={20} width={20} alt='profile' className='rounded-lg' />
                                <p className='hidden md:block'>{censorAddress(post.username)}</p>
                            </div>
                        </div>
                        <div className='flex-start px-10 mt-5 text-white'>
                            <p className='text-left'>{post.note}</p>
                        </div>
                        {post.image && (
                            <div className='flex justify-center w-[100%] items-center'>
                                <div className='relative md:h-[350px] h-[300px] w-[95%] mt-7'>
                                    <Image
                                        src={post.image}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className='rounded-lg border-[1px] border-gray-400'
                                        alt='post image'
                                    />
                                </div>
                            </div>
                        )}
                        <div className='mt-10 space-x-3 w-[100%] flex text-[0.8rem] md:[1rem] mb-5 px-10 justify-between items-center'>
                            <button
                                onClick={() => handleLike(post._id)}
                                className='flex flex-col md:flex-row items-center gap-x-3 text-white hover:opacity-80 transition-opacity'
                            >
                                <IoHeartHalf
                                    className={`text-[1.7rem] transition-colors ${hasLiked[post._id] ? 'text-purple-500' : 'text-white'}`}
                                />
                                <p>{likes[post._id] || post.likeCount || 0} likes</p>
                            </button>
                            <button
                                onClick={() => setShowComments(prev => ({
                                    ...prev,
                                    [post._id]: !prev[post._id]
                                }))}
                                className='flex flex-col md:flex-row items-center gap-x-3 text-white hover:opacity-80 transition-opacity'
                            >
                                <FaCommentMedical className='text-[1.7rem]' />
                                <p>{post.comments?.length || 0} comments</p>
                            </button>
                            <button
                                onClick={() => setShowGiftModal(true)}
                                className='bg-blue-700 text-[1rem] h-[40px] w-auto p-3 md:w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'
                            >
                                <FaGift className='text-[1.7rem]' /><p className='hidden md:block'>Gift</p>
                            </button>
                        </div>
                        {showComments[post._id] && (
                            <div className='px-10 py-5 border-t border-gray-700 transition-all duration-300'>
                                <form onSubmit={(e) => handleComment(e, post._id)} className='mb-4'>
                                    <input
                                        type="text"
                                        value={newComment[post._id] || ''}
                                        onChange={(e) => setNewComment(prev => ({
                                            ...prev,
                                            [post._id]: e.target.value
                                        }))}
                                        placeholder="Add a comment..."
                                        className='w-full bg-[#272B30] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                    />
                                    <button
                                        type="submit"
                                        className='w-full mt-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors'
                                        disabled={isCommenting[post._id]}
                                    >
                                        {isCommenting[post._id] ? 'Posting comment...' : 'Comment'}
                                    </button>
                                </form>

                                <div className='max-h-[200px] overflow-y-auto space-y-3'>
                                    {post.comments?.slice()
                                        .sort((a, b) =>
                                            new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime()
                                        )
                                        .map((comment, idx) => (
                                            <div key={idx} className='bg-[#272B30] p-3 rounded-lg'>
                                                <p className='text-gray-400'>{censorAddress(comment.address)}</p>
                                                <p className='text-white'>{comment.comment}</p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {showGiftModal && (
                            <div className='fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50'>
                                <div className='bg-[#272B30] rounded-lg p-6 md:w-[400px] w-[95%] relative'>
                                    <button
                                        onClick={() => setShowGiftModal(false)}
                                        className='absolute top-4 right-4 text-white hover:text-gray-300'
                                    >
                                        <IoMdClose size={24} />
                                    </button>

                                    <h2 className='text-white text-xl font-bold mb-6'>Gift {profile?.username}</h2>

                                    <div className='space-y-4'>
                                        <div className='flex flex-col gap-y-2'>
                                            <p className='text-gray-300 text-sm'>This creator address can receive SOL:</p>
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
                                       
                                        <div className='text-center text-gray-400 text-sm'>Send SOL directly to this address</div>
                                       <div className='flex my-2 items-center justify-center gap-x-5'>
                                       <button onClick={() => handleSendTx(20000000, id)} className='flex items-center justify-evenly flex-col gap-y-2 text-white p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors'>
                                             <p className='text-[0.8rem]'>0.02 SOL</p>
                                            <GiFlowerPot className='text-[1rem]' />
                                            <p className='text-[0.8rem]'>Send Gift</p>

                                        </button>
                                        

                                        <button onClick={() => handleSendTx(100000000, id)} className='flex items-center justify-center flex-col gap-y-2 text-white p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors'>
                                             <p className='text-[0.8rem]'>0.1 SOL</p>
                                            <FaCar className='text-[1rem]' />
                                            <p className='text-[0.8rem]'>Send Gift</p>

                                        </button>

                                        <button onClick={() => handleSendTx(1000000000, id)} className='flex items-center justify-center flex-col gap-y-2 text-white p-2 rounded-lg bg-purple-600 hover:bg-purple-700 transition-colors'>
                                             <p className='text-[0.8rem]'>1 SOL</p>
                                            <FaLaptopHouse className='text-[1rem]' />
                                            <p className='text-[0.8rem]'>Send Gift</p>

                                        </button>
                                     
                                       </div>
                                        

                                        <div className='text-center text-gray-400 text-sm'>Easily upgrade SOL balance if low</div>
                                        <button
                                            onClick={handleGift}
                                            className='bg-blue-600 text-white px-4 py-2 rounded-lg w-full'
                                        >
                                            BUY SOL
                                        </button>


                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default CreatorPage;
