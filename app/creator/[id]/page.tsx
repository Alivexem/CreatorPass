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
import { PostCard } from '@/components/PostCard';
import { PassGateCheck } from '@/components/PassGateCheck';
import Toast from '@/components/Toast';

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
    category: string;
    mediaType: 'none' | 'image' | 'video';
    mediaUrl?: string;
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
    const [toast, setToast] = useState<{show: boolean, message: string, type: 'success' | 'error' | 'info'}>({
        show: false,
        message: '',
        type: 'info'
    });
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [showFunChat, setShowFunChat] = useState(false);
    const [funChats, setFunChats] = useState<FunChat[]>([]);
    const [funChatMessage, setFunChatMessage] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [userAddress, setUserAddress] = useState('');
    const [hasAccess, setHasAccess] = useState(false);

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
                const res = await fetch(`/api/posts/creator/${id}`);
                const data = await res.json();
                if (data.posts) {
                    // Filter posts based on access level
                    const filteredPosts = data.posts.filter((post: Post) => 
                        post.category === 'free' || hasAccess
                    );
                    setPosts(filteredPosts);
                }
            } catch (error) {
                console.error('Error fetching posts:', error);
                setToast({
                    show: true,
                    message: 'Failed to load posts',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };

        if (isProfileFetched) {
            fetchPosts();
        }
    }, [id, isProfileFetched, hasAccess]);

    useEffect(() => {
        const address = localStorage.getItem('address');
        if (address) {
            setUserAddress(address);
        }
    }, []);

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

    const handleSendFunChat = async (e: React.FormEvent) => {
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

    if (!userAddress) {
        return (
            <div className="min-h-screen bg-black">
                <NavBar />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-red-600 text-white p-4 rounded-lg">
                        Please connect your wallet to view this content
                    </div>
                </div>
            </div>
        );
    }

    if (!hasAccess) {
        return (
            <div className="min-h-screen bg-black">
                <NavBar />
                <div className="container mx-auto px-4 py-8">
                    <PassGateCheck
                        creatorAddress={id}
                        userAddress={userAddress}
                        onAccessGranted={() => setHasAccess(true)}
                    />
                </div>
            </div>
        );
    }

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
            <div className="container mx-auto px-4 py-8">
                <div className="grid gap-8">
                    {posts.map((post) => (
                        <PostCard
                            key={post._id}
                            post={post}
                            userAddress={userAddress}
                            onLike={() => handleLike(post._id)}
                            onComment={(e) => handleComment(e, post._id)}
                        />
                    ))}
                </div>
            </div>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
        </div>
    );
};

export default CreatorPage;
