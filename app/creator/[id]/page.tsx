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
import PostCard from '@/components/PostCard';
import { PassGateCheck } from '@/components/PassGateCheck';
import Toast from '@/components/Toast';
import { Pass } from "@/types/pass";

interface Post {
    _id: string;
    username: string;
    note: string;
    image: string;
    createdAt: string;
    comments: Array<{
        address: string;
        text: string;
        timestamp: Date;
    }>;
    likes: string[];
    likeCount?: number;
    category: string;
    mediaType: 'none' | 'image' | 'video';
    mediaUrl?: string;
    gifts: Array<{
        from: string;
        amount: number;
        timestamp: Date;
    }>;
    tier: 'Free' | 'Bronze' | 'Silver' | 'Gold';
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

const PassModal = ({ onClose, creatorAddress }: { onClose: () => void, creatorAddress: string }) => {
    const router = useRouter();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
                <h3 className="text-xl font-bold text-white mb-4">Premium Content</h3>
                <p className="text-gray-300 mb-6">
                    This creator has premium content available. Mint a pass to access exclusive posts and features.
                </p>
                <div className="space-y-4">
                    <button
                        onClick={() => router.push(`/passes?creator=${creatorAddress}`)}
                        className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700"
                    >
                        View Available Passes
                    </button>
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600"
                    >
                        View Free Content
                    </button>
                </div>
            </div>
        </div>
    );
};

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
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: 'success' | 'error' | 'info' | 'warning'
    }>({
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
    const [userAddress, setUserAddress] = useState<string>('');
    const [hasAccess, setHasAccess] = useState(false);
    const [freePosts, setFreePosts] = useState<Post[]>([]);
    const [paidPosts, setPaidPosts] = useState<Post[]>([]);
    const [hasFreePosts, setHasFreePosts] = useState<boolean | null>(null);
    const [userPasses, setUserPasses] = useState<Pass[]>([]);
    const [showPassModal, setShowPassModal] = useState(false);

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

    // Modify the useEffect that fetches posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const [postsRes, passesRes] = await Promise.all([
                    fetch(`/api/posts/creator/${id}`),
                    fetch(`/api/passes/creator/${id}`)
                ]);

                const [postsData, passesData] = await Promise.all([
                    postsRes.json(),
                    passesRes.json()
                ]);

                // Split posts by tier
                const free = postsData.posts.filter((post: Post) => post.tier === 'Free');
                const paid = postsData.posts.filter((post: Post) => post.tier !== 'Free');

                setFreePosts(free);
                setPaidPosts(paid);

                // Check user's passes
                const address = localStorage.getItem('address');
                if (address) {
                    const userPassesRes = await fetch(`/api/passes/user/${address}`);
                    const userPassesData = await userPassesRes.json();
                    setUserPasses(userPassesData.passes);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };

        fetchPosts();
    }, [id]);

    useEffect(() => {
        const address = localStorage.getItem('address');
        if (address) {
            setUserAddress(address);
        }
    }, []);

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/interactions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'like',
                    userAddress
                })
            });

            if (!res.ok) throw new Error('Failed to like post');

            const data = await res.json();
            setPosts(prev => 
                prev.map(post => 
                    post._id === postId ? data.post : post
                )
            );
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to like post',
                type: 'error'
            });
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!newComment[postId]?.trim()) return;

        setIsCommenting(prev => ({ ...prev, [postId]: true }));

        try {
            const res = await fetch(`/api/posts/${postId}/interactions`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'comment',
                    userAddress,
                    data: {
                        text: newComment[postId].trim()
                    }
                })
            });

            if (!res.ok) throw new Error('Failed to add comment');

            const data = await res.json();
            setPosts(prev => 
                prev.map(post => 
                    post._id === postId ? data.post : post
                )
            );
            setNewComment({ ...newComment, [postId]: '' });
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to add comment',
                type: 'error'
            });
        } finally {
            setIsCommenting(prev => ({ ...prev, [postId]: false }));
        }
    };

    const censorAddress = (address: string): string => {
        if (!address) return '';
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
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

    const checkPassAccess = (requiredTier: string) => {
        return userPasses.some(pass => 
            ['Gold', 'Silver', 'Bronze'].indexOf(pass.category) >= 
            ['Gold', 'Silver', 'Bronze'].indexOf(requiredTier)
        );
    };

    const canChat = checkPassAccess('Silver');
    const canInteract = checkPassAccess('Bronze');
    const canDownload = checkPassAccess('Bronze');

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

    if (!hasAccess && hasFreePosts === false) {
        return (
            <div className="min-h-screen bg-black">
                <NavBar />
                <div className="container mx-auto px-4 py-8">
                    <div className="bg-gray-800 p-6 rounded-lg text-center">
                        <h2 className="text-2xl font-bold text-white mb-4">Content Locked</h2>
                        <p className="text-gray-300 mb-6">
                            This creator doesn't have any free content available. 
                            Mint a pass to access their premium content.
                        </p>
                        <PassGateCheck
                            creatorAddress={id}
                            userAddress={userAddress}
                            onAccessGranted={() => setHasAccess(true)}
                        />
                    </div>
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
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className="container mx-auto px-4 py-8">
                {/* Show pass modal if there's premium content and user has no access */}
                {!hasAccess && paidPosts.length > 0 && showPassModal && (
                    <PassModal 
                        onClose={() => setShowPassModal(false)}
                        creatorAddress={id}
                    />
                )}

                <div className="grid gap-8">
                    {(hasAccess ? [...freePosts, ...paidPosts] : freePosts).map((post) => (
                        <div key={post._id} className="relative">
                            {/* Tier Badge */}
                            <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-sm font-medium z-10
                                ${post.tier === 'Free' ? 'bg-green-600' :
                                  post.tier === 'Bronze' ? 'bg-yellow-700' :
                                  post.tier === 'Silver' ? 'bg-gray-400' :
                                  'bg-yellow-500'} text-white`}>
                                {post.tier}
                            </div>
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
                            />
                        </div>
                    ))}
                </div>

                {/* Show CTA if there's premium content */}
                {!hasAccess && paidPosts.length > 0 && (
                    <div className="mt-8 bg-gray-800 p-6 rounded-lg text-center">
                        <h3 className="text-xl font-bold text-white mb-2">
                            Want to see more?
                        </h3>
                        <p className="text-gray-300">
                            You're currently viewing free content. Mint a pass to access premium content.
                        </p>
                        <button 
                            onClick={() => setShowPassModal(true)}
                            className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
                        >
                            View Passes
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CreatorPage;
