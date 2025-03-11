'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { FaGift } from "react-icons/fa6";
import { FaCopy } from "react-icons/fa";
import { IoMdClose } from "react-icons/io";
import { GiFlowerPot, GiRing } from "react-icons/gi";
import { FaLaptopHouse } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect, PublicKey, Transaction, SystemProgram, Provider } from '../../../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { FaCar } from "react-icons/fa";
import { useRouter } from 'next/navigation';
import { IoFlash } from "react-icons/io5";
import { IoSend } from "react-icons/io5";
import { IoMdDownload } from "react-icons/io"; // Add this import
import { MdContentCopy } from "react-icons/md"; // Add this import
import { IoHeart, IoHeartOutline } from "react-icons/io5"; // Add this import

import { CommentModal } from '@/components/CommentModal';
import { CommentItem } from '@/components/CommentItem';

interface Comment {
    _id: string;
    address: string;
    username: string;
    comment: string;
    timestamp?: Date;
    likes?: string[];
    likeCount?: number;
    replies?: Comment[];
    profileImage?: string;
    hasReplies?: boolean;  // Add this property
}

interface Post {
    _id: string;
    username: string;
    note: string;
    image: string;
    tier: 'Free' | 'Regular' | 'Special' | 'VIP';
    createdAt: string;
    comments?: Comment[];
    likes?: string[];
    likeCount?: number;
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
    username?: string; // Add username to interface
}

interface PageProps {
    params: {
        id: string
    }
}

interface CommentHandlers {
    handleComment: (postId: string, comment: string, replyToId?: string) => Promise<void>;
    handleCommentLike: (postId: string, commentId: string) => Promise<void>;
}

const CreatorPage = ({ params }: PageProps) => {
    const { id } = params;
    const router = useRouter();
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
    const [giftAmount, setGiftAmount] = useState(0);
    const [selectedGift, setSelectedGift] = useState({
        flower: 20000000,
        car: 100000000,
        house: 1000000000
    });
    const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error'}>({
        show: false,
        message: '',
        type: 'success'
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showFunChat, setShowFunChat] = useState(false);
    const [funChats, setFunChats] = useState<FunChat[]>([]);
    const [funChatMessage, setFunChatMessage] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [commentLikes, setCommentLikes] = useState<{[key: string]: boolean}>({});
    const [isLoading, setIsLoading] = useState(true);
    const [loadedPosts, setLoadedPosts] = useState(false);
    const [downloadedStates, setDownloadedStates] = useState<{ [key: string]: boolean }>({});
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});

    const { isConnected, address } = useAppKitAccount();
    const { connection } = useAppKitConnection();
    const { walletProvider } = useAppKitProvider<Provider>('solana');

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
            console.log(signature);
            
            setToast({
                show: true,
                message: 'Gift sent successfully!',
                type: 'success'
            });

            setTimeout(() => {
                setToast({show: false, message: '', type: 'success'});
            }, 3000);

        } catch (error) {
            console.error('Transaction failed:', error);
            setToast({
                show: true,
                message: 'Failed to send gift. Please try again.',
                type: 'error'
            });

            setTimeout(() => {
                setToast({show: false, message: '', type: 'error'});
            }, 3000);
        }
    };

    const [isProfileFetched, setIsProfileFetched] = useState(false);

    // Consolidate profile fetching into a single useEffect
    useEffect(() => {
        const fetchCreatorData = async () => {
            if (isProfileFetched) return; // Prevent duplicate fetches
            
            try {
                setLoading(true);
                const myAddress = localStorage.getItem('address') || '';

                // Fetch profiles in parallel
                const [profileRes, userProfileRes] = await Promise.all([
                    fetch(`/api/profile?address=${id}`),
                    myAddress ? fetch(`/api/profile?address=${myAddress}`) : Promise.resolve(null)
                ]);

                const profileData = await profileRes.json();

                if (profileData.profile) {
                    setProfile(profileData.profile);
                }

                // Only fetch user profile if we have an address
                if (userProfileRes) {
                    const userProfileData = await userProfileRes.json();
                    if (userProfileData.profile) {
                        setUserProfile(userProfileData.profile);
                    }
                }

                setIsProfileFetched(true);
            } catch (error) {
                console.error('Error fetching creator data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCreatorData();
    }, [id]); // Only depend on id

    // Separate useEffect for posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsRes = await fetch('/api');
                const postsData = await postsRes.json();

                const creatorPosts = postsData.creator.filter((post: Post) =>
                    post.username === id
                );

                const myAddress = localStorage.getItem('address') || '';
                const initialLikes: { [key: string]: number } = {};
                const initialHasLiked: { [key: string]: boolean } = {};

                creatorPosts.forEach((post: Post) => {
                    initialLikes[post._id] = post.likeCount || 0;
                    initialHasLiked[post._id] = post.likes?.includes(myAddress) || false;
                });

                setPosts(creatorPosts);
                setLikes(initialLikes);
                setHasLiked(initialHasLiked);
                setLoadedPosts(true);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setIsLoading(false);
            }
        };

        if (isProfileFetched) {
            fetchPosts();
        }
    }, [id, isProfileFetched]);

    const fetchPostComments = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/comments`);
            if (!res.ok) throw new Error('Failed to fetch comments');
            const data = await res.json();
            return data.comments || [];
        } catch (error) {
            console.error('Error fetching comments:', error);
            return [];
        }
    };

    const updatePostComments = async (postId: string) => {
        const comments = await fetchPostComments(postId);
        
        // Update selected post if it matches
        setSelectedPost(prev => 
            prev && prev._id === postId
                ? { ...prev, comments }
                : prev
        );

        // Update posts list
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post._id === postId
                    ? { ...post, comments }
                    : post
            )
        );
    };

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
                        ? { ...post, likeCount: data.likeCount, likes: data.likes }
                        : post
                )
            );

            setLikes(prev => ({ ...prev, [postId]: data.likeCount }));
            setHasLiked(prev => ({ ...prev, [postId]: !prev[postId] }));

        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleComment = async (postId: string, comment: string, replyToId?: string): Promise<void> => {
        if (!comment.trim()) return;

        try {
            const address = localStorage.getItem('address');
            if (!address || !userProfile) {
                setToast({
                    show: true,
                    message: 'Please connect your wallet and create a profile first',
                    type: 'error'
                });
                return;
            }

            setIsCommenting(prev => ({ ...prev, [postId]: true }));

            // Update to match the API route - use PUT with action
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'comment',
                    address,
                    comment: comment.trim(),
                    replyToId,
                    username: userProfile.username,
                    profileImage: userProfile.profileImage
                })
            });

            if (!res.ok) throw new Error('Failed to add comment');
            const data = await res.json();

            // Update the posts state with the new comments
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: data.comments }
                        : post
                )
            );

            // Update selected post if modal is open
            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prev => prev ? { ...prev, comments: data.comments } : null);
            }

            // Reset states
            setNewComment(prev => ({ ...prev, [postId]: '' }));
            if (replyToId) {
                setReplyTo(null);
            }

        } catch (error) {
            console.error('Error adding comment:', error);
            setToast({
                show: true,
                message: 'Failed to add comment. Please try again.',
                type: 'error'
            });
        } finally {
            setIsCommenting(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleCommentClick = async (post: Post) => {
        try {
            setSelectedPost({...post}); // Create a copy of the post
            setShowCommentModal(true);
            
            const comments = await fetchPostComments(post._id);
            if (!showCommentModal) return; // Don't update if modal was closed

            // Update both states atomically
            setSelectedPost(prev => prev && prev._id === post._id ? { ...prev, comments } : prev);
            setPosts(prevPosts =>
                prevPosts.map(p => p._id === post._id ? { ...p, comments } : p)
            );
        } catch (error) {
            console.error('Error fetching comments:', error);
            setToast({
                show: true,
                message: 'Failed to load comments. Please try again.',
                type: 'error'
            });
        }
    };

    const handleCommentLike = async (postId: string, commentId: string) => {
        try {
            const address = localStorage.getItem('address');
            if (!address || !userProfile) {
                setToast({
                    show: true,
                    message: 'Please connect your wallet and create a profile first',
                    type: 'error'
                });
                return;
            }

            const res = await fetch(`/api/userpost/${postId}/comments/${commentId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) throw new Error('Failed to like comment');

            // Update comments immediately after liking
            await updatePostComments(postId);

        } catch (error) {
            console.error('Error liking comment:', error);
            setToast({
                show: true,
                message: 'Failed to like comment. Please try again.',
                type: 'error'
            });
        }
    };

    const handleReply = async (postId: string, comment: string, replyToId: string) => {
        if (!replyToId) {
            console.error('No reply target specified');
            return;
        }
        await handleComment(postId, comment, replyToId);
    };

    const updateComments = (comments: Comment[], targetCommentId: string, likeData: { likeCount: number, likes: string[] }): Comment[] => {
        return comments.map(c => {
            if (c._id === targetCommentId) {
                return { ...c, likeCount: likeData.likeCount, likes: likeData.likes };
            }
            if (c.replies) {
                return { ...c, replies: updateComments(c.replies, targetCommentId, likeData) };
            }
            return c;
        });
    };

    const formatUserInfo = (username: string = 'Anonymous') => {
        return username;
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

    const handleSendFunChat = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!funChatMessage.trim()) return;

        try {
            const address = localStorage.getItem('address');
            if (!address) {
                setToast({
                    show: true,
                    message: 'Please connect your wallet first',
                    type: 'error'
                });
                return;
            }

            // Remove profile check since we already have userProfile state
            const res = await fetch(`/api/creator/${id}/funchat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address,
                    message: funChatMessage.trim()
                })
            });

            const data = await res.json();
            
            if (data.error) {
                setToast({
                    show: true,
                    message: data.error,
                    type: 'error'
                });
                return;
            }

            // Reverse the order of chats so recent ones appear at bottom
            setFunChats([...data.chats].reverse());
            setFunChatMessage('');
            
            if (chatRef.current) {
                chatRef.current.scrollTop = chatRef.current.scrollHeight;
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleDownload = async (imageUrl: string, postId: string) => {
        try {
            const response = await fetch(imageUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            setDownloadedStates(prev => ({ ...prev, [postId]: true }));
            setTimeout(() => {
                setDownloadedStates(prev => ({ ...prev, [postId]: false }));
            }, 2000);
        } catch (error) {
            console.error('Error downloading image:', error);
        }
    };

    const handleCopy = (text: string, postId: string) => {
        navigator.clipboard.writeText(text);
        setCopiedStates(prev => ({ ...prev, [postId]: true }));
        setTimeout(() => {
            setCopiedStates(prev => ({ ...prev, [postId]: false }));
        }, 2000);
    };

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'VIP': return 'text-yellow-500';
            case 'Special': return 'text-purple-500';
            case 'Regular': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    if (isLoading) {
        return (
            <div className='bg-black pb-[100px] md:pb-0 min-h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <p className='text-white text-2xl animate-pulse'>Loading creator content...</p>
                </div>
            </div>
        );
    }

    if (loadedPosts && posts.length === 0) {
        return (
            <div className='bg-black pb-[100px] md:pb-0 min-h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <p className='text-white text-2xl'>This creator haven't posted yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-black pb-[80px] md:pb-0'>
            <NavBar />
            {/* <button 
                onClick={() => router.push('/creators')}
                className='absolute top-40 left-4 md:left-14 h-[50px] w-[50px] bg-transparent z-50 text-white hover:text-gray-600 transition-colors'
            >
                <IoArrowBack size={24} />
            </button> */}
            {toast.show && (
                <div 
                    className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg ${
                        toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white transition-opacity duration-300`}
                >
                    {toast.message}
                </div>
            )}
            <div className='pt-[100px] md:pt-[200px]'></div>
            <div className='flex flex-col space-y-10 justify-center items-center pb-[60px] md:pb-0 mb-20 md:mb-64 md:ml-[300px]'>
                {posts.map((post) => (
                    <div key={post._id} className='md:w-[50vw] w-[95%] min-h-[200px] rounded-xl bg-[#111315] shadow-lg'>
                        <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-[#1A1D1F]'>
                            <div className='flex items-center gap-x-3'>
                                <div className='relative h-[50px] w-[50px]'>
                                    <Image
                                        src={profile?.profileImage || '/empProfile.png'}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        alt='profile'
                                        className='rounded-lg'
                                    />
                                </div>
                                <p className='text-[1.1rem] font-medium'>{profile?.username || 'Anonymous'}</p>
                            </div>
                            <div className='flex items-center gap-x-2'>
                                <Image src='/sol.png' height={20} width={20} alt='solana' className='rounded-lg' />
                                <div className='flex flex-col items-end'>
                                    {/* <p className='text-gray-400'>{formatUserInfo(post.username)}</p> */}
                                    <span className={`text-[0.7rem] ${getTierColor(post.tier)}`}>
                                        {post.tier} Post
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='px-10 mt-5 text-gray-200'>
                            <p className='text-left'>{post.note}</p>
                        </div>
                        {post.image && (
                            <div className='flex justify-center w-[100%] items-center'>
                                <div 
                                    className='relative md:h-[350px] h-[300px] w-[95%] mt-7 cursor-pointer hover:opacity-90 transition-opacity'
                                    onClick={() => setSelectedImage(post.image)}
                                >
                                    <Image
                                        src={post.image}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className='rounded-lg shadow-md'
                                        alt='post image'
                                    />
                                </div>
                            </div>
                        )}
                        <div className='mt-10 space-x-3 w-[100%] flex text-[0.8rem] md:[1rem] mb-5 px-10 justify-between items-center'>
                            <button
                                onClick={() => handleLike(post._id)}
                                className='flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors'
                            >
                                <IoHeartHalf
                                    className={`text-[1.1rem] md:text-[1.7rem] transition-colors ${hasLiked[post._id] ? 'text-purple-500' : ''}`}
                                />
                                <p>{likes[post._id] || post.likeCount || 0} likes</p>
                            </button>
                            <button
                                onClick={() => handleCommentClick(post)}
                                className='flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors'
                            >
                                <FaCommentMedical className='text-[1.1rem] md:text-[1.7rem]' />
                                <p>{post.comments?.length || 0} comments</p>
                            </button>
                            <button
                                onClick={() => setShowGiftModal(true)}
                                className='text-white flex items-center justify-center gap-x-3 hover:opacity-90 transition-opacity'
                            >
                                <FaGift className='text-[1.1rem] md:text-[1.7rem]' /><p className='hidden md:block'>Gift</p>
                            </button>
                            {/* Add these new buttons */}
                            <button
                                onClick={() => handleCopy(post.note, post._id)}
                                className='text-white flex items-center justify-center gap-x-3 hover:opacity-90 transition-opacity relative'
                            >
                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm bg-gray-800 px-2 py-1 rounded transition-opacity">
                                   <p className='whitespace-nowrap'> {copiedStates[post._id] && 'Text Copied!'} </p>
                                </div>
                                <MdContentCopy className='text-[1.1rem] md:text-[1.7rem]' />
                                <p className='hidden md:block'>Copy</p>
                            </button>
                            {post.image && (
                                <button
                                    onClick={() => handleDownload(post.image, post._id)}
                                    className='text-white flex items-center justify-center gap-x-3 hover:opacity-90 transition-opacity relative'
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm bg-gray-800 px-2 py-1 rounded transition-opacity">
                                        {downloadedStates[post._id] && 'Downloading!'}
                                    </div>
                                    <IoMdDownload className='text-[1.1rem] md:text-[1.7rem]' />
                                    <p className='hidden md:block'>Download</p>
                                </button>
                            )}
                        </div>
                        {showComments[post._id] && (
                            <div className='px-10 py-5 border-t border-gray-800 transition-all duration-300'>
                                <form onSubmit={(e: React.FormEvent<HTMLFormElement>) => {
                                    e.preventDefault();
                                    handleComment(post._id, newComment[post._id] || '');
                                }} className='mb-4'>
                                    <input
                                        type="text"
                                        value={newComment[post._id] || ''}
                                        onChange={(e) => setNewComment(prev => ({
                                            ...prev,
                                            [post._id]: e.target.value
                                        }))}
                                        placeholder="Add a comment..."
                                        className='w-full bg-[#1A1D1F] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
                                    />
                                    <button
                                        type="submit"
                                        className='w-full mt-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-opacity'
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
                                            <div key={idx} className='bg-[#1A1D1F] p-3 rounded-lg'>
                                                <p className='text-gray-400'>{formatUserInfo(comment.address)}</p>
                                                <p className='text-gray-200'>{comment.comment}</p>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        )}

                        {showGiftModal && (
                            <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
                                <div className='bg-[#1A1D1F] rounded-lg p-6 md:w-[400px] w-[95%] relative shadow-xl'>
                                    <button
                                        onClick={() => setShowGiftModal(false)}
                                        className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
                                    >
                                        <IoMdClose size={24} />
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
                                                    onClick={handleCopyAddress}
                                                    className='bg-blue-600 p-2 rounded hover:opacity-90 transition-opacity'
                                                >
                                                    <FaCopy className='text-white' />
                                                </button>
                                            </div>
                                            {copySuccess && (
                                                <p className='text-green-500 text-sm'>Address copied!</p>
                                            )}
                                        </div>
                                       
                                        <div className='text-center text-gray-400 text-sm'>Send SOL directly to this creator</div>
                                        <div className='flex my-2 items-center justify-center gap-x-8'>
                                            <button 
                                                onClick={() => {
                                                    setGiftAmount(selectedGift.flower);
                                                    handleSendTx(selectedGift.flower, id);
                                                }} 
                                                className='flex items-center shadow-lg justify-evenly flex-col gap-y-2 text-white p-3 rounded-lg bg-black hover:opacity-90 transition-opacity'
                                            >
                                                <p className='text-[0.8rem]'>{selectedGift.flower / 1000000000} SOL</p>
                                                <GiFlowerPot className='text-[1.5rem]' />
                                                <p className='text-[0.8rem]'>Send flower</p>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setGiftAmount(selectedGift.car);
                                                    handleSendTx(selectedGift.car, id);
                                                }} 
                                                className='flex items-center shadow-lg justify-center flex-col gap-y-2 text-white p-3 rounded-lg bg-black hover:opacity-90 transition-opacity'
                                            >
                                                <p className='text-[0.8rem]'>{selectedGift.car / 1000000000} SOL</p>
                                                <FaCar className='text-[1.5rem]' />
                                                <p className='text-[0.8rem]'>Send car</p>
                                            </button>

                                            <button 
                                                onClick={() => {
                                                    setGiftAmount(selectedGift.house);
                                                    handleSendTx(selectedGift.house, id);
                                                }} 
                                                className='flex shadow-lg items-center justify-center flex-col gap-y-2 text-white p-3 rounded-lg bg-black hover:opacity-90 transition-opacity'
                                            >
                                                <p className='text-[0.8rem]'>{selectedGift.house / 1000000000} SOL</p>
                                                <FaLaptopHouse className='text-[1.5rem]' />
                                                <p className='text-[0.8rem]'>Send house</p>
                                            </button>
                                        </div>

                                        <div className='text-center text-gray-400 text-sm'>Easily upgrade SOL balance if low</div>
                                        <button
                                            onClick={handleGift}
                                            className='bg-black text-white px-4 py-2 rounded-lg w-full hover:opacity-90 transition-opacity'
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

            {selectedImage && (
                <div className='fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center z-50'>
                    <button
                        onClick={() => setSelectedImage(null)}
                        className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
                    >
                        <IoMdClose size={30} />
                    </button>
                    <div className='relative w-[90vw] h-[90vh]'>
                        <Image
                            src={selectedImage}
                            fill
                            style={{ objectFit: 'contain' }}
                            alt='full size image'
                        />
                    </div>
                </div>
            )}

            {/* Mobile Fun Chat Toggle */}
            {!showFunChat && (
                <div className="md:hidden fixed left-4 bottom-[10vh] transform -translate-y-1/2 z-40">
                    <button
                        onClick={() => setShowFunChat(true)}
                        className="bg-indigo-600 animate bounce p-3 rounded-full shadow-lg"
                    >
                        <IoFlash className="text-white text-xl" />
                    </button>
                </div>
            )}

            {/* Fun Chat Section */}
            <div className={`fixed md:absolute top-1/2 md:top-[65vh] transform -translate-y-1/2 left-0 md:left-10 h-[65vh] md:h-[70vh] md:w-[400px] w-full 
                bg-gradient-to-b from-gray-600 to-gray-800
                ${showFunChat ? 'translate-x-0' : 'md:translate-x-0 -translate-x-full'} 
                transition-transform duration-300 z-30 shadow-xl rounded-r-lg`}
            >
                <div className="p-4 h-full flex flex-col bg-black/30 md:bg-transparent">
                    {/* Mobile Close Button */}
                    <button
                        onClick={() => setShowFunChat(false)}
                        className="md:hidden absolute top-4 right-4 text-white"
                    >
                        <IoMdClose size={24} />
                    </button>

                    {/* Chat Header */}
                    <div className="flex items-center gap-2 mb-4">
                        <h2 className="text-xl font-bold text-white">
                            {profile?.username}'s Fun Talk
                        </h2>
                        <IoFlash className="text-white text-xl" />
                    </div>

                    {/* Chat Messages */}
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
                                        {chat.username || 'Anonymous'}
                                    </p>
                                    <p className="text-white text-sm">{chat.message}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Chat Input */}
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

            {/* Profile Required Modal */}
            {showProfileModal && (
                <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
                    <div className="bg-[#1A1D1F] rounded-lg p-6 md:w-[400px] w-[95%] relative">
                        <button
                            onClick={() => setShowProfileModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <IoMdClose size={24} />
                        </button>
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-4">Profile Required</h3>
                            <p className="text-gray-300 mb-6">You need to create a profile before you can chat</p>
                            <button
                                onClick={() => router.push('/dashboard')}
                                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity"
                            >
                                Create Profile
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCommentModal && selectedPost && (
                <CommentModal 
                    post={selectedPost}
                    onClose={() => {
                        setShowCommentModal(false);
                        setTimeout(() => {
                            setSelectedPost(null);
                        }, 200);
                    }}
                    onComment={handleComment}
                    onLike={handleCommentLike}
                    onReply={handleComment}
                    userProfile={userProfile || null}
                />
            )}

            <Footer />
        </div>
    );
};

export default CreatorPage;
