'use client'
import React, { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Post, Profile } from '@/types/creator';
import CreatorPost from '@/components/creator/CreatorPost';
import { CommentModal } from '@/components/CommentModal';
import Image from 'next/image';
import { IoMdClose } from "react-icons/io";
import GiftModal from '@/components/creator/GiftModal';
import { useAppKit } from '@/utils/reown';

const FeedPage = () => {
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [likes, setLikes] = useState<{ [key: string]: number }>({});
    const [hasLiked, setHasLiked] = useState<{ [key: string]: boolean }>({});
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [downloadedStates, setDownloadedStates] = useState<{ [key: string]: boolean }>({});
    const [copiedStates, setCopiedStates] = useState<{ [key: string]: boolean }>({});
    const [toast, setToast] = useState<{ show: boolean, message: string, type: 'success' | 'error' }>({
        show: false,
        message: '',
        type: 'success'
    });
    const [creatorProfiles, setCreatorProfiles] = useState<{ [key: string]: Profile }>({});
    const [showGiftModal, setShowGiftModal] = useState(false);
    const [selectedCreator, setSelectedCreator] = useState<{ id: string; profile: Profile | null }>({ id: '', profile: null });
    const { open } = useAppKit();

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const postsRes = await fetch('/api');
                const postsData = await postsRes.json();

                // Filter only free posts with proper typing
                const freePosts = (postsData.creator as Post[])
                    .filter((post) => post.tier === 'Free')
                    .sort((a, b) => {
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    });

                // Get unique creator addresses with proper typing
                const creatorAddresses = [...new Set(freePosts.map(post => post.username))] as string[];

                // Fetch all creator profiles in parallel
                const profilePromises = creatorAddresses.map((address) =>
                    fetch(`/api/profile?address=${address}`)
                        .then(res => res.json())
                        .then(data => ({ [address]: data.profile }))
                );

                const profiles = await Promise.all(profilePromises);
                const profileMap = Object.assign({}, ...profiles);
                setCreatorProfiles(profileMap);

                const myAddress = localStorage.getItem('address');
                if (myAddress) {
                    const userProfileRes = await fetch(`/api/profile?address=${myAddress}`);
                    const userProfileData = await userProfileRes.json();
                    setUserProfile(userProfileData.profile);
                }

                // Initialize likes states
                const initialLikes: { [key: string]: number } = {};
                const initialHasLiked: { [key: string]: boolean } = {};

                freePosts.forEach((post: Post) => {
                    initialLikes[post._id] = post.likeCount || 0;
                    initialHasLiked[post._id] = myAddress ? (post.likes?.includes(myAddress) || false) : false;
                });

                setPosts(freePosts);
                setLikes(initialLikes);
                setHasLiked(initialHasLiked);
            } catch (error) {
                console.error('Error fetching posts:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPosts();
    }, []);

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

            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'comment',
                    address,
                    comment: comment.trim(),
                    imageUrl,
                    username: userProfile.username,
                    profileImage: userProfile.profileImage
                })
            });

            if (!res.ok) throw new Error('Failed to add comment');
            const data = await res.json();

            setPosts(prevPosts =>
                prevPosts.map(post =>
                    post._id === postId
                        ? { ...post, comments: data.comments }
                        : post
                )
            );

            if (selectedPost && selectedPost._id === postId) {
                setSelectedPost(prev => prev ? { ...prev, comments: data.comments } : null);
            }

        } catch (error) {
            console.error('Error adding comment:', error);
            setToast({
                show: true,
                message: 'Failed to add comment. Please try again.',
                type: 'error'
            });
        }
    };

    const handleCommentClick = async (post: Post) => {
        try {
            setSelectedPost({ ...post });
            setShowCommentModal(true);

            const res = await fetch(`/api/posts/${post._id}/comments`);
            if (!res.ok) throw new Error('Failed to fetch comments');
            const data = await res.json();

            if (!showCommentModal) return;

            setSelectedPost(prev => prev && prev._id === post._id ? { ...prev, comments: data.comments } : prev);
            setPosts(prevPosts =>
                prevPosts.map(p => p._id === post._id ? { ...p, comments: data.comments } : p)
            );
        } catch (error) {
            console.error('Error fetching comments:', error);
            // setToast({
            //     show: true,
            //     message: 'Failed to load comments. Please try again.',
            //     type: 'error'
            // });
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

    const handleSendTx = async (amount: number, receiver: string) => {
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

            // Rest of the transaction logic will be handled by the GiftModal component
            setToast({
                show: true,
                message: 'Gift sent successfully!',
                type: 'success'
            });

            setTimeout(() => {
                setToast({ show: false, message: '', type: 'success' });
            }, 3000);

        } catch (error) {
            console.error('Error sending gift:', error);
            setToast({
                show: true,
                message: 'Failed to send gift',
                type: 'error'
            });
        }
    };

    const handleGift = () => {
        open();
        setShowGiftModal(false);
    };

    const AdsBanner = () => (
        <div className="w-full h-[80px] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold text-center">
            <div className="py-4">
                PLACE ADS
            </div>
        </div>
    );

    const AdsSidebar = () => (
        <div className="hidden md:block w-[350px] bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold">
            <div className="h-screen sticky flex items-center justify-center">
                PLACE ADS
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className='bg-black min-h-screen flex flex-col'>
                <div className='p-0 m-0 hidden md:block'>
                    <NavBar />
                </div>
                <div className='flex-1 flex justify-center items-center'>
                    <p className='text-white text-2xl animate-pulse'>Loading posts...</p>
                </div>
            </div>
        );
    }

    return (
        <div className='bg-black min-h-screen pb-[80px] md:pb-0'>
            <div className='p-0 m-0 hidden md:block'>
                <NavBar />
            </div>

            {/* Mobile Ads Banner */}
            <div className="md:hidden sticky top-0 z-10">
                <AdsBanner />
            </div>

            <div className='pt-[100px]'></div>

            <div className='flex md:justify-start justify-center w-full'>
                {/* Main Content */}
                <AdsSidebar />
                <div className='flex md:ml-[200px] flex-col space-y-10 items-center pb-[60px] w-full md:w-auto'>
                    {posts.map((post) => (
                        <CreatorPost
                            key={post._id}
                            post={post}
                            profile={creatorProfiles[post.username]}
                            hasLiked={hasLiked[post._id]}
                            likes={likes[post._id]}
                            onLike={() => handleLike(post._id)}
                            onComment={() => handleCommentClick(post)}
                            onGift={() => {
                                setSelectedCreator({ 
                                    id: post.username, 
                                    profile: creatorProfiles[post.username] 
                                });
                                setShowGiftModal(true);
                            }}
                            onImageClick={setSelectedImage}
                            onCopy={handleCopy}
                            onDownload={handleDownload}
                            downloadedStates={downloadedStates}
                            copiedStates={copiedStates}
                            date={post.createdAt}
                            disabled={{
                                like: false,
                                comment: false,
                                download: false,
                                copy: false,
                                gift: false
                            }}
                        />
                    ))}
                </div>

                {/* Desktop Ads Sidebar */}
                {/* <AdsSidebar /> */}
            </div>

            {/* Image Preview Modal */}
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

            {/* Comment Modal */}
            {showCommentModal && selectedPost && userProfile && (
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
                    userProfile={userProfile}
                />
            )}

            {/* Gift Modal */}
            {showGiftModal && (
                <GiftModal
                    profile={selectedCreator.profile}
                    creatorId={selectedCreator.id}
                    onClose={() => setShowGiftModal(false)}
                    onSendTx={handleSendTx}
                    onBuySol={handleGift}
                />
            )}

            {/* Toast Notifications */}
            {toast.show && (
                <div className={`fixed bottom-4 right-4 p-4 rounded-lg text-white ${toast.type === 'error' ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                    {toast.message}
                </div>
            )}

            {/* <Footer /> */}
        </div>
    );
};

export default FeedPage;
