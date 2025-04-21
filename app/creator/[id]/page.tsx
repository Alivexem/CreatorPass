'use client'
import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

import { IoMdClose } from "react-icons/io";
import { BiLoaderAlt } from "react-icons/bi";
import NavBar from '@/components/NavBar';

import { useAppKit, useAppKitAccount, useAppKitProvider, useDisconnect, PublicKey, Transaction, SystemProgram, Provider } from '../../../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react'
import { useRouter } from 'next/navigation';
import { IoFlash } from "react-icons/io5";


import { CommentModal } from '@/components/CommentModal';
import { CommentItem } from '@/components/CommentItem';
import { RiErrorWarningLine } from "react-icons/ri";
import CreatorPost from '@/components/creator/CreatorPost';
import GiftModal from '@/components/creator/GiftModal';
import { Post, Profile, Comment, Pass, FunChat } from '@/types/creator';
import CreatorFunChat from '@/components/creator/CreatorFunChat';
import AccessNotification from '@/components/creator/AccessNotification';

interface PageProps {
    params: {
        id: string
    }
}

interface CommentHandlers {
    handleComment: (postId: string, comment: string, replyToId?: string) => Promise<void>;
    handleCommentLike: (postId: string, commentId: string) => Promise<void>;
}

interface AccessNotification {
  show: boolean;
  message: string;
  availableTiers: string[];
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
    const [userPasses, setUserPasses] = useState<Pass[]>([]);
    const [accessNotification, setAccessNotification] = useState<AccessNotification>({
        show: false,
        message: '',
        availableTiers: []
    });
    const [userPermissions, setUserPermissions] = useState({
        funForumAccess: false,
        likeCommentAccess: false,
        downloadAccess: false,
        giftAccess: false
    });

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
            if (!id || isProfileFetched) return; // Add id check
            
            try {
                setLoading(true);
                const myAddress = localStorage.getItem('address') || '';

                // Ensure id is properly passed as the address parameter
                const [profileRes, userProfileRes, passesRes] = await Promise.all([
                    fetch(`/api/profile?address=${encodeURIComponent(id)}`),
                    myAddress ? fetch(`/api/profile?address=${encodeURIComponent(myAddress)}`) : Promise.resolve(null),
                    fetch(`/api/passes?address=${encodeURIComponent(id)}`)
                ]);

                if (!profileRes.ok) {
                    throw new Error('Failed to fetch creator profile');
                }

                const profileData = await profileRes.json();
                const passesData = await passesRes.json();

                if (profileData.profile) {
                    setProfile(profileData.profile);
                }

                // Check user's passes
                if (myAddress) {
                    const userPassesRes = await fetch(`/api/passholders/check/${id}?address=${myAddress}`);
                    const userPassesData = await userPassesRes.json();
                    setUserPasses(userPassesData.passes || []);
                }

                // Handle passes data
                if (passesData.passes) {
                    const availableTiers = passesData.passes.map((pass: Pass) => pass.type);
                    setAccessNotification(prev => ({
                        ...prev,
                        availableTiers
                    }));
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
    }, [id, isProfileFetched]); // Add id to dependencies

    // Separate useEffect for posts
    useEffect(() => {
        const fetchPosts = async () => {
            if (!id || !isProfileFetched) return; // Add id check
            
            try {
                const postsRes = await fetch('/api');
                const postsData = await postsRes.json();
                const myAddress = localStorage.getItem('address') || '';

                // Filter posts by creator username and map to include required fields
                const creatorPosts = postsData.creator
                
                    .filter((post: Post) => post.username === id)
                    .map((post: Post) => ({
                        _id: post._id,
                        username: post.username,
                        note: post.note,
                        image: post.image || '',
                        video: post.video || '',
                        audio: post.audio || '', // Add this comma
                        mediaType: post.video ? 'video' : (post.image ? 'image' : (post.audio ? 'audio' : undefined)), // Ensure audio mediaType is handled
                        tier: post.tier || 'Free',
                        comments: post.comments || [],
                        likes: post.likes || [],
                        likeCount: post.likeCount || 0,
                        createdAt: post.createdAt,
                        __v: post.__v
                    }));
                    

                // Check if viewer is the post owner
                const isOwner = id === myAddress;

                // If owner, show all posts. Otherwise, filter by access
                let accessiblePosts;
                if (isOwner) {
                    accessiblePosts = creatorPosts;
                } else {
                    const userTiers = new Set(['Free', ...userPasses.map(pass => pass.type)]);
                    accessiblePosts = creatorPosts.filter((post: Post) => userTiers.has(post.tier));

                    // Handle access notification for inaccessible tiers only for non-owners
                    const inaccessibleTiers = new Set<string>(
                        creatorPosts
                            .filter((post: Post) => !userTiers.has(post.tier))
                            .map((post: Post) => post.tier)
                    );

                    if (inaccessibleTiers.size > 0) {
                        setAccessNotification({
                            show: true,
                            message: `${profile?.username || 'Anonymous'} has ${Array.from(inaccessibleTiers).join(', ')} tier post(s), gain access here!`,
                            availableTiers: Array.from(inaccessibleTiers) as string[]
                        });
                    }
                }

                // Initialize states for accessible posts
                const initialLikes: { [key: string]: number } = {};
                const initialHasLiked: { [key: string]: boolean } = {};

                accessiblePosts.forEach((post: Post) => {
                    initialLikes[post._id] = post.likeCount || 0;
                    initialHasLiked[post._id] = post.likes?.includes(myAddress) || false;
                });

                setPosts(accessiblePosts);
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
    }, [id, isProfileFetched, profile?.username, userPasses]);

    useEffect(() => {
        // Combine permissions from all passes the user holds
        const combinedPermissions = userPasses.reduce((acc, pass) => ({
            funForumAccess: acc.funForumAccess || pass.rules.funForumAccess,
            likeCommentAccess: acc.likeCommentAccess || pass.rules.likeCommentAccess,
            downloadAccess: acc.downloadAccess || pass.rules.downloadAccess,
            giftAccess: acc.giftAccess || pass.rules.giftAccess
        }), {
            funForumAccess: false,
            likeCommentAccess: false,
            downloadAccess: false,
            giftAccess: false
        });

        setUserPermissions(combinedPermissions);
    }, [userPasses]);

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

    // const updatePostComments = async (postId: string) => {
    //     const comments = await fetchPostComments(postId);
        
    //     // Update selected post if it matches
    //     setSelectedPost(prev => 
    //         prev && prev._id === postId
    //             ? { ...prev, comments }
    //             : prev
    //     );

    //     // Update posts list
    //     setPosts(prevPosts =>
    //         prevPosts.map(post =>
    //             post._id === postId
    //                 ? { ...post, comments }
    //                 : post
    //         )
    //     );
    // };

    const handleLike = async (postId: string) => {
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

            // Optimistic update
            setHasLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
            setLikes(prev => ({
                ...prev,
                [postId]: prev[postId] + (hasLiked[postId] ? -1 : 1)
            }));

            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) {
                // Revert optimistic update if request fails
                setHasLiked(prev => ({ ...prev, [postId]: !prev[postId] }));
                setLikes(prev => ({
                    ...prev,
                    [postId]: prev[postId] + (hasLiked[postId] ? 1 : -1)
                }));
                throw new Error('Failed to update like');
            }

            const data = await res.json();

            // Update with actual server data
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, likeCount: data.likeCount, likes: data.likes }
                        : post
                )
            );
            setLikes(prev => ({ ...prev, [postId]: data.likeCount }));

        } catch (error) {
            console.error('Error updating like:', error);
            setToast({
                show: true,
                message: 'Failed to update like',
                type: 'error'
            });
        }
    };

    const handleComment = async (postId: string, comment: string, imageUrl?: string): Promise<void> => {
        if (!comment.trim() && !imageUrl) return;
    
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
    
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'comment',
                    address,
                    comment: comment.trim(),
                    imageUrl, // Include the imageUrl in the request
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
            if (replyTo) {
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

            const res = await fetch(`/api/posts/${postId}/comments/${commentId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) throw new Error('Failed to like comment');
            
            const data = await res.json();

            // Update the comments in both posts and selectedPost states
            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId ? {
                        ...post,
                        comments: post.comments?.map(comment =>
                            comment._id === commentId ? {
                                ...comment,
                                likeCount: data.likeCount,
                                likes: data.liked ? 
                                    [...(comment.likes || []), address] :
                                    (comment.likes || []).filter(like => like !== address)
                            } : comment
                        )
                    } : post
                )
            );

            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prev => prev ? {
                    ...prev,
                    comments: prev.comments?.map(comment =>
                        comment._id === commentId ? {
                            ...comment,
                            likeCount: data.likeCount,
                            likes: data.liked ? 
                                [...(comment.likes || []), address] :
                                (comment.likes || []).filter(like => like !== address)
                        } : comment
                    )
                } : null);
            }

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
        if (!userPermissions.giftAccess) {
            setToast({
                show: true,
                message: 'Sorry, you don\'t have permission to send gifts',
                type: 'error'
            });
            return;
        }
        open();
        setShowGiftModal(false);
    };

    const handleSendFunChat = async (message: string) => {
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

            // Only check permission when sending, not for viewing
            if (!userPermissions.funForumAccess) {
                setToast({
                    show: true,
                    message: 'Group chat is for only tier pass holders',
                    type: 'error'
                });
                return;
            }

            const newChat = {
                message,
                username: userProfile.username,
                profileImage: userProfile.profileImage,
                timestamp: new Date().toISOString(),
                address
            };

            // Optimistically update UI
            setFunChats(prev => [newChat, ...prev]);

            const res = await fetch(`/api/creator/${id}/funchat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    address,
                    message,
                    username: userProfile.username,
                    profileImage: userProfile.profileImage,
                    timestamp: new Date().toISOString()
                })
            });

            if (!res.ok) {
                // If request fails, revert the optimistic update
                setFunChats(prev => prev.filter(chat => chat !== newChat));
                throw new Error('Failed to send fun chat');
            }

            // Fetch fresh data after successful post
            const getRes = await fetch(`/api/creator/${id}/funchat`);
            if (getRes.ok) {
                const data = await getRes.json();
                setFunChats([...data.chats].reverse());
            }

        } catch (error) {
            console.error('Error sending message:', error);
            setToast({
                show: true,
                message: 'Failed to send message',
                type: 'error'
            });
        }
    };

    const handleDownload = async (imageUrl: string, postId: string) => {
        const post = posts.find(p => p._id === postId);
        if (post?.tier !== 'Free' && !userPermissions.downloadAccess) {
            setToast({
                show: true,
                message: 'Sorry, you don\'t have permission to download',
                type: 'error'
            });
            return;
        }
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
        const post = posts.find(p => p._id === postId);
        if (post?.tier !== 'Free' && !userPermissions.downloadAccess) {
            setToast({
                show: true,
                message: 'Sorry, you don\'t have permission to copy',
                type: 'error'
            });
            return;
        }
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

    const handleNotificationClick = () => {
        // Store creator ID in session storage to highlight their passes
        sessionStorage.setItem('highlightCreator', id);
        router.push('/passes');
    };

    if (isLoading || !loadedPosts) {
        return (
            <div className='bg-black pb-[100px] md:pb-0 min-h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <BiLoaderAlt className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
            </div>
        );
    }

    if (posts.length === 0) {
        return (
            <div className='bg-black pb-[100px] md:pb-0 min-h-screen flex flex-col'>
                <NavBar />
                <div className='flex-1 flex justify-center items-center'>
                    <p className='text-white text-2xl'>This creator hasn&apos;t posted yet</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-black pb-[80px] md:pb-0'>
            <NavBar />
            
            <AccessNotification 
                show={accessNotification.show && !showFunChat}
                message={accessNotification.message}
                onClick={handleNotificationClick}
            />

            <div className={`${accessNotification.show ? 'pt-[200px]' : 'pt-[100px]'}  md:pt-[200px]`}></div>
            <div className='flex flex-col space-y-10 justify-center items-center pb-[60px] mb-20 md:mb-0 md:ml-[300px]'>
                {posts.map((post) => (
                    <CreatorPost
                        key={post._id}
                        post={post}
                        profile={profile}
                        hasLiked={hasLiked[post._id]}
                        likes={likes[post._id]}
                        onLike={() => handleLike(post._id)}
                        onComment={() => handleCommentClick(post)}
                        onGift={() => setShowGiftModal(true)}
                        onImageClick={setSelectedImage}
                        onCopy={handleCopy}
                        onDownload={handleDownload}
                        downloadedStates={downloadedStates}
                        copiedStates={copiedStates}
                        date={post.createdAt}
                        disabled={{
                            // Free tier posts are always accessible
                            // For other tiers, check user permissions
                            like: post.tier !== 'Free' && !userPermissions.likeCommentAccess,
                            comment: post.tier !== 'Free' && !userPermissions.likeCommentAccess,
                            download: post.tier !== 'Free' && !userPermissions.downloadAccess,
                            copy: post.tier !== 'Free' && !userPermissions.downloadAccess,
                            gift: post.tier !== 'Free' && !userPermissions.giftAccess
                        }}
                        hasProfile={!!userProfile} // Add this line
                    />
                ))}
            </div>

            {showGiftModal && (
                <GiftModal
                    profile={profile}
                    creatorId={id}
                    onClose={() => setShowGiftModal(false)}
                    onSendTx={handleSendTx}
                    onBuySol={handleGift}
                />
            )}

            {selectedImage && (
                <div className='fixed inset-0 bg-black md:bg-opacity-90 flex justify-center items-center z-50'>
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
                <div className="md:hidden fixed left-4 bottom-[11vh] transform -translate-y-1/2 z-40">
                    <button
                        onClick={() => setShowFunChat(true)}
                        className="bg-indigo-600 animate bounce p-3 rounded-full shadow-lg"
                    >
                        <IoFlash className="text-white text-xl" />
                    </button>
                </div>
            )}

            {/* Always show Fun Chat */}
            <CreatorFunChat 
                showFunChat={showFunChat}
                setShowFunChat={setShowFunChat}
                funChats={funChats}
                onSendChat={handleSendFunChat}
                profileUsername={profile?.username}
                creatorId={id}
                disabled={!userPermissions.funForumAccess}
                restrictionMessage={!userPermissions.funForumAccess ? "Group chat is for only tier pass holders" : ""}
                userProfile={userProfile || undefined}
                userAddress={localStorage.getItem('address') || ''}
            />

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
                    // onReply={handleComment}
                    userProfile={userProfile || null}
                />
            )}

            {/* <Footer /> */}
        </div>
    );
};

export default CreatorPage;
