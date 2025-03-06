'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import NavBar from '@/components/NavBar';
import { useRouter } from 'next/navigation';
import PostCard from '@/components/PostCard';
import Toast from '@/components/Toast';
import { IoFlash, IoClose } from "react-icons/io5";
import { FaGift, FaCopy, FaDownload, FaCar, FaLaptopHouse } from "react-icons/fa";
import { GiFlowerPot } from "react-icons/gi";
import { useAppKit, useAppKitProvider, PublicKey, Transaction, SystemProgram, Provider } from '../../../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';

interface Post {
    _id: string;
    username: string;
    note: string;
    image: string;
    createdAt: string;
    category: string;
    tier: 'Free' | 'Bronze' | 'Silver' | 'Gold';
    mediaType: 'none' | 'image' | 'video';
    mediaUrl?: string;
    comments?: Comment[];
    likes: string[];
    likeCount?: number;
    gifts?: Array<{
        from: string;
        amount: number;
        timestamp: Date;
    }>;
}

interface Comment {
    address: string;
    username: string;
    profileImage?: string;
    text: string;
    timestamp: Date;
}

interface Profile {
    username: string;
    profileImage: string;
    address: string;
}

interface FunChat {
    address: string;
    message: string;
    profileImage: string;
    timestamp: string;
}

interface PageProps {
    params: {
        id: string
    }
}

const CreatorPage = ({ params }: PageProps) => {
    const { id } = params;
    const router = useRouter();
    const [posts, setPosts] = useState<Post[]>([]);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
    const [isCommenting, setIsCommenting] = useState<{ [key: string]: boolean }>({});
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [userAddress, setUserAddress] = useState<string>('');
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'warning'
    }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showFunChat, setShowFunChat] = useState(false);
    const [funChats, setFunChats] = useState<FunChat[]>([]);
    const [funChatMessage, setFunChatMessage] = useState('');
    const [giftAmount, setGiftAmount] = useState(0);
    const chatRef = useRef<HTMLDivElement>(null);
    const { open } = useAppKit();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');
    const [selectedGift, setSelectedGift] = useState({
        flower: 20000000,
        car: 100000000,
        house: 1000000000
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const address = localStorage.getItem('address');
                if (!address) {
                    router.push('/');
                    return;
                }
                setUserAddress(address);

                // Fetch profiles and posts in parallel
                const [profileRes, userProfileRes, postsRes] = await Promise.all([
                    fetch(`/api/profile?address=${id}`),
                    fetch(`/api/profile?address=${address}`),
                    fetch('/api/posts')
                ]);

                const [profileData, userProfileData, postsData] = await Promise.all([
                    profileRes.json(),
                    userProfileRes.json(),
                    postsRes.json()
                ]);

                if (profileData.profile) setProfile(profileData.profile);
                if (userProfileData.profile) setUserProfile(userProfileData.profile);

                // Filter posts for this creator
                const creatorPosts = postsData.posts.filter((post: Post) => 
                    post.username === id
                );
                setPosts(creatorPosts);

            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, router]);

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address: userAddress })
            });

            if (!res.ok) throw new Error('Failed to update like');

            const data = await res.json();
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, likes: data.likes, likeCount: data.likeCount }
                        : post
                )
            );
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!newComment[postId]?.trim()) return;

        try {
            if (!userProfile?.username) {
                setToast({
                    show: true,
                    message: 'Please create a profile first',
                    type: 'warning'
                });
                return;
            }

            setIsCommenting(prev => ({ ...prev, [postId]: true }));

            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: userAddress,
                    username: userProfile.username,
                    profileImage: userProfile.profileImage,
                    text: newComment[postId].trim()
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

    const handleSendTx = async (amount: number, receiver: string) => {
        try {
            const lamports = amount;
            const latestBlockhash = connection ? await connection.getLatestBlockhash() : null;
            const walletAddress = localStorage.getItem('address') || '';

            const transaction = new Transaction({
                feePayer: new PublicKey(walletAddress),
                recentBlockhash: latestBlockhash?.blockhash,
            }).add(
                SystemProgram.transfer({
                    fromPubkey: new PublicKey(walletAddress),
                    toPubkey: new PublicKey(receiver),
                    lamports: lamports,
                })
            );

            const signature = connection ? await walletProvider.sendTransaction(transaction, connection) : null;
            
            setToast({
                show: true,
                message: 'Gift sent successfully!',
                type: 'success'
            });
        } catch (error) {
            console.error('Transaction failed:', error);
            setToast({
                show: true,
                message: 'Failed to send gift',
                type: 'error'
            });
        }
    };

    const handleSendFunChat = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!funChatMessage.trim()) return;

        try {
            const res = await fetch(`/api/creator/${id}/funchat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address: userAddress,
                    message: funChatMessage.trim()
                })
            });

            const data = await res.json();
            setFunChats([...data.chats].reverse());
            setFunChatMessage('');
            
            if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDownload = async (mediaUrl: string) => {
        try {
            const response = await fetch(mediaUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `post-media${mediaUrl.endsWith('.mp4') ? '.mp4' : '.jpg'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setToast({
                show: true,
                message: 'Failed to download media',
                type: 'error'
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <NavBar />
                <div className="flex justify-center items-center h-[80vh]">
                    <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <NavBar />
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8">
                    {posts.map((post) => (
                        <div key={post._id} className="relative">
                            <PostCard
                                post={post}
                                userAddress={userAddress}
                                userProfile={userProfile}
                                hasLiked={post.likes.includes(userAddress)}
                                likes={post.likes.length}
                                showComments={!!showComments[post._id]}
                                onLike={() => handleLike(post._id)}
                                onComment={(e: React.FormEvent) => handleComment(e, post._id)}
                                newComment={newComment[post._id] || ''}
                                setNewComment={(value: string) => setNewComment(prev => ({
                                    ...prev,
                                    [post._id]: value
                                }))}
                                isCommentLoading={!!isCommenting[post._id]}
                                censorAddress={censorAddress}
                                onToggleComments={() => setShowComments(prev => ({
                                    ...prev,
                                    [post._id]: !prev[post._id]
                                }))}
                                onDownload={() => post.mediaUrl && handleDownload(post.mediaUrl)}
                                onGift={() => setShowGiftModal(true)}
                            >
                                {post.comments?.slice()
                                    .sort((a, b) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime())
                                    .map((comment, idx) => (
                                        <div key={idx} className='bg-[#1A1D1F] p-3 rounded-lg'>
                                            <div className="flex items-center gap-2 mb-1">
                                                <Image
                                                    src={comment.profileImage || '/empProfile.png'}
                                                    alt="Profile"
                                                    width={24}
                                                    height={24}
                                                    className="rounded-full"
                                                />
                                                <p className='text-gray-400'>{comment.username}</p>
                                            </div>
                                            <p className='text-gray-200'>{comment.text}</p>
                                        </div>
                                    ))}
                            </PostCard>
                        </div>
                    ))}
                </div>
            </div>

            {showGiftModal && (
                <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
                    <div className='bg-[#1A1D1F] rounded-lg p-6 md:w-[400px] w-[95%] relative shadow-xl'>
                        <button
                            onClick={() => setShowGiftModal(false)}
                            className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
                        >
                            <IoClose size={24} />
                        </button>

                        <h2 className='text-white text-xl font-bold mb-6'>Gift {profile?.username}</h2>

                        <div className='space-y-4'>
                            <div className='flex flex-col gap-y-2'>
                                <p className='text-gray-400 text-sm'>This creator address can receive SOL:</p>
                                <div className='flex items-center gap-x-2'>
                                    <p className='text-gray-200 font-mono bg-[#111315] p-2 rounded flex-1 overflow-x-auto'>
                                        {id}
                                    </p>
                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(id);
                                            setToast({
                                                show: true,
                                                message: 'Address copied!',
                                                type: 'success'
                                            });
                                        }}
                                        className='bg-blue-600 p-2 rounded hover:opacity-90 transition-opacity'
                                    >
                                        <FaCopy className='text-white' />
                                    </button>
                                </div>
                            </div>
                           
                            <div className='text-center text-gray-400 text-sm'>Send SOL directly to this creator</div>
                            <div className='flex my-2 items-center justify-center gap-x-8'>
                                <button 
                                    onClick={() => handleSendTx(selectedGift.flower, id)}
                                    className='flex items-center shadow-lg justify-evenly flex-col gap-y-2 text-white p-3 rounded-lg bg-blue-700 hover:opacity-90 transition-opacity'
                                >
                                    <p className='text-[0.8rem]'>{selectedGift.flower / 1000000000} SOL</p>
                                    <GiFlowerPot className='text-[1.5rem]' />
                                    <p className='text-[0.8rem]'>Send flower</p>
                                </button>

                                <button 
                                    onClick={() => handleSendTx(selectedGift.car, id)}
                                    className='flex items-center shadow-lg justify-center flex-col gap-y-2 text-white p-3 rounded-lg bg-blue-700 hover:opacity-90 transition-opacity'
                                >
                                    <p className='text-[0.8rem]'>{selectedGift.car / 1000000000} SOL</p>
                                    <FaCar className='text-[1.5rem]' />
                                    <p className='text-[0.8rem]'>Send car</p>
                                </button>

                                <button 
                                    onClick={() => handleSendTx(selectedGift.house, id)}
                                    className='flex shadow-lg items-center justify-center flex-col gap-y-2 text-white p-3 rounded-lg bg-blue-700 hover:opacity-90 transition-opacity'
                                >
                                    <p className='text-[0.8rem]'>{selectedGift.house / 1000000000} SOL</p>
                                    <FaLaptopHouse className='text-[1.5rem]' />
                                    <p className='text-[0.8rem]'>Send house</p>
                                </button>
                            </div>

                            <div className='text-center text-gray-400 text-sm'>Easily upgrade SOL balance if low</div>
                            <button
                                onClick={() => {
                                    open();
                                    setShowGiftModal(false);
                                }}
                                className='bg-blue-600 text-white px-4 py-2 rounded-lg w-full hover:opacity-90 transition-opacity'
                            >
                                BUY SOL
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {!showFunChat && (
                <div className="md:hidden fixed left-4 bottom-[10vh] transform -translate-y-1/2 z-40">
                    <button
                        onClick={() => setShowFunChat(true)}
                        className="bg-indigo-600 p-3 rounded-full shadow-lg"
                    >
                        <IoFlash className="text-white text-2xl" />
                    </button>
                </div>
            )}

            <div className={`fixed md:absolute top-1/2 md:top-[65vh] transform -translate-y-1/2 left-0 md:left-10 h-[65vh] md:h-[70vh] md:w-[400px] w-full 
                bg-gradient-to-b from-gray-600 to-gray-800
                ${showFunChat ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} 
                transition-transform duration-300 z-30 shadow-xl rounded-r-lg`}
            >
                <div className="p-4 h-full flex flex-col bg-black/30 md:bg-transparent">
                    <button
                        onClick={() => setShowFunChat(false)}
                        className="md:hidden absolute top-4 right-4 text-white"
                    >
                        <IoClose size={24} />
                    </button>

                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-white">
                            {profile?.username}'s Fun Talk
                        </h2>
                        <IoFlash className="text-white text-xl" />
                    </div>

                    <div
                        ref={chatRef}
                        className="flex-1 overflow-y-auto space-y-4 mb-4 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent pr-2"
                    >
                        {funChats.map((chat, index) => (
                            <div key={index} className="flex items-start gap-2 bg-white/5 p-2 rounded-lg">
                                <Image
                                    src={chat.profileImage || '/empProfile.png'}
                                    alt="Profile"
                                    width={32}
                                    height={32}
                                    className="rounded-full h-[40px] w-[40px] object-cover"
                                />
                                <div>
                                    <p className="text-blue-200 text-xs">
                                        {censorAddress(chat.address)}
                                    </p>
                                    <p className="text-white text-sm">{chat.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <form onSubmit={handleSendFunChat} className="mt-auto">
                        <input
                            type="text"
                            value={funChatMessage}
                            onChange={(e) => setFunChatMessage(e.target.value)}
                            placeholder="Type your message..."
                            className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
                        />
                    </form>
                </div>
            </div>
        </div>
    );
};

const censorAddress = (address: string) => {
    if (!address) return '';
    const start = address.slice(0, 6);
    const end = address.slice(-4);
    return `${start}...${end}`;
};

export default CreatorPage;
