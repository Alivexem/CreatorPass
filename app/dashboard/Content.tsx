import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { FaImages } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import PostCard from '@/components/PostCard';
import { CommentModal } from '@/components/CommentModal';
import { CommentItem } from '@/components/CommentItem';
import { Post, Comment, Profile } from '@/types/interfaces';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { BsEmojiSmile } from 'react-icons/bs';

interface ContentProps {
  setToast: (toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

interface PassTier {
    name: 'Free' | 'Regular' | 'Special' | 'VIP';
    available: boolean;
}

interface Pass {
    _id: string;
    type: 'Regular' | 'Special' | 'VIP';
    creatorAddress: string;
}

// Update the interface to add videoThumbnail
interface PostData {
    // ...existing code...
    videoThumbnail?: string;
}

const Content = ({ setToast }: ContentProps) => {
    const [showUploader, setShowUploader] = useState(false);
    const [note, setNote] = useState('');
    const [image, setimage] = useState('');
    const [loading, setLoading] = useState(false);
    const [postText, setPostText] = useState('Post');
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<Profile | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
    const [likes, setLikes] = useState<{ [key: string]: number }>({});
    const [hasLiked, setHasLiked] = useState<{ [key: string]: boolean }>({});
    const [isCommentLoading, setIsCommentLoading] = useState<{ [key: string]: boolean }>({});
    const [showImageModal, setShowImageModal] = useState(false);
    const [modalImage, setModalImage] = useState('');
    const [selectedTier, setSelectedTier] = useState<string>('Free');
    const [availableTiers, setAvailableTiers] = useState<PassTier[]>([
        { name: 'Free', available: true },
        { name: 'Regular', available: false },
        { name: 'Special', available: false },
        { name: 'VIP', available: false },
    ]);
    const [selectedPost, setSelectedPost] = useState<Post | null>(null);
    const [showCommentModal, setShowCommentModal] = useState(false);
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showEmoji, setShowEmoji] = useState(false);
    const emojiRef = useRef<HTMLDivElement>(null);
    const emojiButtonRef = useRef<HTMLButtonElement>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageUrl, setImageUrl] = useState<string>('');

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                emojiRef.current && 
                !emojiRef.current.contains(event.target as Node) &&
                emojiButtonRef.current &&
                !emojiButtonRef.current.contains(event.target as Node)
            ) {
                setShowEmoji(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const onEmojiSelect = (emoji: any) => {
        setNote(prev => prev + emoji.native);
    };

    const fetchPosts = async () => {
        setIsLoadingPosts(true);
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

            // First fetch profile
            const profileRes = await fetch(`/api/profile?address=${address}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const profileData = await profileRes.json();

            if (!profileData.profile) {
                setToast({
                    show: true,
                    message: 'Please set up your profile first',
                    type: 'warning'
                });
                return;
            }

            // Set user profile first
            setUserProfile({
                username: profileData.profile.username || 'Anonymous',
                address: profileData.profile.address,
                profileImage: profileData.profile.profileImage || '/empProfile.png'
            });

            // Modified to fetch posts by address
            const postsRes = await fetch(`/api?address=${address}`);
            const { creator } = await postsRes.json();

            // Process only posts that match the address
            const processedPosts = creator
                .filter((post: Post) => post.username === address)
                .map((post: Post) => ({
                    ...post,
                    tier: post.tier || 'Free',
                    profileImage: profileData.profile.profileImage || '/empProfile.png',
                    comments: post.comments || [],
                    likes: post.likes || [],
                    likeCount: post.likeCount || 0
                }));

            // Initialize likes and hasLiked states
            const initialLikes: { [key: string]: number } = {};
            const initialHasLiked: { [key: string]: boolean } = {};

            processedPosts.forEach((post: Post) => {
                initialLikes[post._id] = post.likeCount || 0;
                initialHasLiked[post._id] = post.likes?.includes(address) || false;
            });

            setPosts(processedPosts);
            setLikes(initialLikes);
            setHasLiked(initialHasLiked);

        } catch (error) {
            console.error('Error fetching posts:', error);
            setToast({
                show: true,
                message: 'Failed to fetch posts',
                type: 'error'
            });
        } finally {
            setIsLoadingPosts(false);
        }
    };

    const fetchUserPasses = async () => {
        try {
            const address = localStorage.getItem('address');
            if (!address) return;

            const response = await fetch(`/api/passes?address=${address}`);
            const data = await response.json();
            
            const userPasses: Pass[] = data.passes || [];
            
            setAvailableTiers(prev => prev.map(tier => ({
                ...tier,
                available: tier.name === 'Free' || userPasses.some((pass: Pass) => pass.type === tier.name)
            })));
        } catch (error) {
            console.error('Error fetching passes:', error);
        }
    };

    useEffect(() => {
        fetchPosts();
        fetchUserPasses();
    }, []);

    const handleDelete = async (postId: string) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            setIsDeleting(true);
            const res = await fetch(`/api/${postToDelete}`, {
                method: 'DELETE'
            });

            if (!res.ok) {
                throw new Error('Failed to delete post');
            }

            await fetchPosts();
            setShowDeleteModal(false);
            setPostToDelete(null);
            setToast({
                show: true,
                message: 'Post deleted successfully!',
                type: 'success'
            });
        } catch (error) {
            console.error('Error deleting post:', error);
            setToast({
                show: true,
                message: 'Failed to delete post. Please try again.',
                type: 'error'
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
    
        // Check file size (80MB limit)
        if (file.size > 80 * 1024 * 1024) {
            setToast({
                show: true,
                message: 'File size must be less than 80MB',
                type: 'error'
            });
            return;
        }
    
        // Set preview and media type
        setSelectedImage(URL.createObjectURL(file));
        const type = file.type.startsWith('video/') ? 'video' : 'image';
        setMediaType(type);
    
        // Automatically start upload
        await handleUploadMedia(file);
    };

    const handleUploadMedia = async (file: File) => {
        setLoading(true);
        setUploadProgress(0);
        const type = file.type.startsWith('video/') ? 'video' : 'image';

        try {
            let uploadedUrl: string;

            if (type === 'video') {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('upload_preset', 'ifndk7tr');
                formData.append('resource_type', 'video');

                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'https://api.cloudinary.com/v1_1/dh5vxmfvp/video/upload');

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const progress = Math.round((event.loaded / event.total) * 100);
                        setUploadProgress(progress);
                    }
                };

                uploadedUrl = await new Promise<string>((resolve, reject) => {
                    xhr.onload = () => {
                        if (xhr.status === 200) {
                            const response = JSON.parse(xhr.responseText);
                            resolve(response.secure_url);
                        } else {
                            reject(new Error('Upload failed'));
                        }
                    };
                    xhr.onerror = () => reject(new Error('Upload failed'));
                    xhr.send(formData);
                });
            } else {
                const reader = new FileReader();
                reader.readAsDataURL(file);

                uploadedUrl = await new Promise<string>((resolve, reject) => {
                    reader.onloadend = async () => {
                        try {
                            const res = await fetch("/api/imageApi", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ 
                                    data: reader.result,
                                    mediaType: 'image'
                                }),
                            });

                            if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
                            const data = await res.json();
                            resolve(data.url);
                        } catch (error) {
                            reject(error);
                        }
                    };
                });
            }

            setimage(uploadedUrl);
            setUploadProgress(100);
        } catch (error) {
            console.error('Error uploading media:', error);
            setToast({
                show: true,
                message: 'Failed to upload media. Please try again.',
                type: 'error'
            });
            setUploadProgress(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note && !image) {
            setToast({
                show: true,
                message: 'Please add some content (text or media) before submitting!',
                type: 'warning'
            });
            return;
        }

        if (!userProfile) {
            setToast({
                show: true,
                message: 'Please set up your profile first',
                type: 'warning'
            });
            return;
        }

        setPostText('Loading...');
        const myAddress = localStorage.getItem('address');
        if (!myAddress) return;

        try {
            const profileRes = await fetch(`/api/profile?address=${myAddress}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            const profileData = await profileRes.json();

            if (!profileData.profile) {
                throw new Error('Profile not found, setup your profile');
            }

            console.log('Frontend - Selected tier before creating postData:', selectedTier);

            const postData = {
                username: myAddress,
                note: note.trim(),
                image: mediaType === 'image' ? image : '',
                video: mediaType === 'video' ? image : '', // Using separate field for video
                tier: selectedTier, // Make sure tier is explicitly included
                createdAt: new Date().toISOString(),
                comments: [],
                likes: [],
                likeCount: 0,
                creatorAddress: myAddress,
                mediaType,
            };

            console.log('Frontend - Complete postData being sent:', JSON.stringify(postData, null, 2));

            const res = await fetch('/api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                },
                body: JSON.stringify(postData)
            });

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }

            const data = await res.json();
            console.log('Frontend - Response from server:', JSON.stringify(data, null, 2));

            if (data.message === 'Post uploaded') {
                setToast({
                    show: true,
                    message: 'Posted successfully!',
                    type: 'success'
                });
                setNote('');
                setimage('');
                setSelectedImage('');
                setShowUploader(false);
                fetchPosts();
            } else {
                throw new Error(data.message || 'Failed to upload post');
            }
        } catch (error: any) {
            console.error('Submission error:', error);
            setToast({
                show: true,
                message: error.message || 'Failed to upload post, please try again',
                type: 'error'
            });
        } finally {
            setPostText('Post');
        }
    };

    // Update handleLike to include proper UI feedback
    const handleLike = async (postId: string) => {
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

            setHasLiked(prev => ({ ...prev, [postId]: !prev[postId] })); // Optimistic update
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) {
                setHasLiked(prev => ({ ...prev, [postId]: !prev[postId] })); // Revert if failed
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
        if ((!comment.trim() && !imageUrl) || !userProfile) {
            setToast({
                show: true,
                message: 'Please connect your wallet and create a profile first',
                type: 'error'
            });
            return;
        }
    
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
    
            const res = await fetch(`/api/posts/${postId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'comment',
                    address,
                    comment: comment.trim(),
                    imageUrl, // Include imageUrl in the request
                    username: userProfile.username,
                    profileImage: userProfile.profileImage
                })
            });
    
            if (!res.ok) throw new Error('Failed to add comment');
            const data = await res.json();
    
            // Update posts with new comments
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
    
        } catch (error) {
            console.error('Error adding comment:', error);
            setToast({
                show: true,
                message: 'Failed to add comment. Please try again.',
                type: 'error'
            });
        }
    };

    // const handleReply = async (postId: string, comment: string, replyToId: string): Promise<void> => {
    //     await handleComment(postId, comment, replyToId);
    // };

    // const fetchPostComments = async (postId: string) => {
    //     try {
    //         const res = await fetch(`/api/posts/${postId}/comments`);
    //         if (!res.ok) throw new Error('Failed to fetch comments');
    //         const data = await res.json();
    //         return data.comments || [];
    //     } catch (error) {
    //         console.error('Error fetching comments:', error);
    //         return [];
    //     }
    // };

    // const updatePostComments = async (postId: string) => {
    //     const comments = await fetchPostComments(postId);
    //     setPosts(prevPosts =>
    //         prevPosts.map(post =>
    //             post._id === postId
    //                 ? { ...post, comments }
    //                 : post
    //         )
    //     );
    //     if (selectedPost?._id === postId) {
    //         setSelectedPost(prev => prev ? { ...prev, comments } : null);
    //     }
    // };

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

    const handleCommentClick = async (post: Post) => {
        try {
            setSelectedPost({...post});
            setShowCommentModal(true);
            
            const comments = await fetchPostComments(post._id);
            if (!showCommentModal) return;

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
            if (!address) {
                setToast({
                    show: true,
                    message: 'Please connect your wallet first',
                    type: 'warning'
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

    const typing = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= 650) {  // Changed from 150 to 650
            setNote(newValue);
        } else {
            setToast({
                show: true,
                message: 'Post cannot exceed 650 characters',  // Changed from 150 to 650
                type: 'warning'
            });
        }
    };

    const censorAddress = (address: string) => {
        if (!address) return '';
        const start = address.slice(0, 4);
        const end = address.slice(-4);
        return `${start}*****${end}`;
    };

    useEffect(() => {
        return () => {
            if (selectedImage) {
                URL.revokeObjectURL(selectedImage);
            }
        };
    }, [selectedImage]);

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'VIP': return 'text-yellow-500';
            case 'Special': return 'text-purple-500';
            case 'Regular': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className='min-h-screen bg-black px-4 py-8'>
            <div className='max-w-4xl mx-auto'>
                {/* Header Section */}
                <div className='mb-10'>
                    <button
                        onClick={() => setShowUploader(true)}
                        className='w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300'
                    >
                        <MdAddCircle className="text-2xl" />
                        <span className="font-medium text-md">Create New Post</span>
                    </button>
                </div>

                {/* Posts Section */}
                {isLoadingPosts ? (
                    <div className='flex justify-center items-center py-20'>
                        <div className='text-white text-xl animate-pulse flex items-center gap-3'>
                            <div className='w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin'></div>
                            Loading posts...
                        </div>
                    </div>
                ) : posts.length === 0 ? (
                    <div className='text-center text-gray-400 py-20'>
                        <p>No post yet</p>
                    </div>
                ) : (
                    <div className='flex flex-col gap-y-8 w-full items-center'>
                        {posts.map((post: Post) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                userProfile={{
                                    username: userProfile!.username,
                                    address: userProfile!.address,
                                    profileImage: post.profileImage || '/empProfile.png' // Provide default value
                                }}
                                hasLiked={hasLiked[post._id]}
                                likes={likes[post._id] || post.likeCount || 0}
                                showComments={showComments[post._id]}
                                onLike={() => handleLike(post._id)}
                                onDelete={() => handleDelete(post._id)}
                                onComment={() => handleCommentClick(post)}
                                handleComment={(e: React.FormEvent) => {
                                    e.preventDefault();
                                    const form = e.target as HTMLFormElement;
                                    const formData = new FormData(form);
                                    const comment = formData.get('comment') as string;
                                    if (comment.trim()) {
                                        handleComment(post._id, comment);
                                        form.reset();
                                    }
                                }}
                                newComment={newComment[post._id] || ''}
                                setNewComment={(value) => setNewComment(prev => ({
                                    ...prev,
                                    [post._id]: value
                                }))}
                                isCommentLoading={isCommentLoading[post._id]}
                                censorAddress={censorAddress}
                                onImageClick={(imageUrl) => {
                                    setModalImage(imageUrl);
                                    setShowImageModal(true);
                                }}
                            />
                        ))}
                    </div>
                )}
                {/* //     </div> */}
                {/* // )} */}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
                        <div className='bg-[#2A2D2F] p-8 rounded-xl max-w-md w-full mx-4'>
                            <h3 className='text-xl text-white font-semibold mb-4'>Delete Post</h3>
                            <p className='text-gray-300 mb-6'>Are you sure you want to delete this post? This action cannot be undone.</p>
                            <div className='flex gap-4'>
                                <button
                                    onClick={confirmDelete}
                                    disabled={isDeleting}
                                    className='flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2'
                                >
                                    {isDeleting ? (
                                        <>
                                            <div className='w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                                            <span>Deleting...</span>
                                        </>
                                    ) : (
                                        'Delete'
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPostToDelete(null);
                                    }}
                                    disabled={isDeleting}
                                    className='flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Image Modal */}
                {showImageModal && (
                    <div className='fixed inset-0 bg-black flex justify-center items-center z-50'>
                        <div className='relative max-w-[95vw] max-h-[95vh]'>
                            <button 
                                className='absolute -top-12 right-0 text-white hover:text-red-500 transition-colors'
                                onClick={() => setShowImageModal(false)}
                            >
                                <MdCancel className="text-4xl" />
                            </button>
                            <Image
                                src={modalImage}
                                alt="Full size image"
                                width={1200}
                                height={800}
                                className='object-contain max-h-[90vh] rounded-lg'
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                {/* Upload Modal */}
                {showUploader && (
                    <div className='fixed inset-0 bg-black md:bg-opacity-75 flex justify-center items-center z-50 p-4'>
                        <div className='bg-[#2A2D2F] overflow-y-auto md:-mt-0 h-[80vh] md:h-[95vh] rounded-xl max-w-xl w-full'>
                            <form onSubmit={handleSubmit} className='p-6'>
                                <div className='flex flex-col overflow-y-auto gap-6'>
                                    <div className='flex justify-between items-center'>
                                        <h3 className='text-xl text-white font-semibold'>Create New Post</h3>
                                        <button 
                                            type="button"
                                            onClick={() => setShowUploader(false)}
                                            className='text-gray-400 hover:text-red-500 transition-colors'
                                        >
                                            <MdCancel className="text-2xl" />
                                        </button>
                                    </div>

                                    <div className='flex flex-col gap-4'>
                                        <div className='relative rounded-xl overflow-hidden'>
                                            {selectedImage && (
                                                <div className='relative h-[300px]'>
                                                    {mediaType === 'video' ? (
                                                        <video 
                                                            src={selectedImage}
                                                            className='w-full h-full object-contain bg-black'
                                                            controls
                                                        />
                                                    ) : (
                                                        <Image 
                                                            src={selectedImage}
                                                            alt="Preview"
                                                            fill
                                                            style={{ objectFit: 'contain' }}
                                                            className='bg-black'
                                                        />
                                                    )}
                                                </div>
                                            )}
                                            
                                            {!selectedImage && (
                                                <label htmlFor="media-upload" className='block cursor-pointer'>
                                                    <div className='h-[200px] border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors'>
                                                        <FaImages className="text-4xl text-gray-400" />
                                                        <p className='text-gray-400 text-center'>Click or drag image/video to upload</p>
                                                        <p className='text-gray-500 text-sm'>Max size: 80MB</p>
                                                    </div>
                                                </label>
                                            )}
                                        </div>

                                        {loading && (
                                            <div className='w-full bg-gray-700 rounded-full h-2 overflow-hidden'>
                                                <div 
                                                    className='h-full bg-green-500 transition-all duration-300'
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        )}

                                        <div className='flex gap-4 justify-end'>
                                            <input 
                                                type="file"
                                                id="media-upload"
                                                className='hidden'
                                                accept="image/*,video/*"
                                                onChange={handleMediaChange}
                                            />
                                            {selectedImage && !loading && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedImage('');
                                                            setimage('');
                                                            const input = document.getElementById('media-upload') as HTMLInputElement;
                                                            if (input) input.value = '';
                                                        }}
                                                        className='px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors'
                                                    >
                                                        Remove
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <select
                                            value={selectedTier}
                                            onChange={(e) => setSelectedTier(e.target.value)}
                                            className="w-full bg-[#1A1D1F] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer"
                                         >
                                            {availableTiers.map((tier) => (
                                                <option
                                                    key={tier.name}
                                                    value={tier.name}
                                                    disabled={!tier.available}
                                                    className={!tier.available ? 'text-gray-500' : ''}
                                                >
                                                    {tier.name} {!tier.available && '(Create this pass first)'}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>

                                    <div className="relative">
                                        <div className="flex items-center gap-2 mb-2">
                                            <button
                                                ref={emojiButtonRef}
                                                type="button"
                                                onClick={() => setShowEmoji(!showEmoji)}
                                                className="text-gray-400 hover:text-white p-2 rounded transition-colors"
                                            >
                                                <BsEmojiSmile size={20} />
                                            </button>
                                        </div>
                                        <textarea 
                                            value={note}
                                            onChange={typing}
                                            placeholder='Express yourself...' 
                                            className='w-full bg-[#1A1D1F] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none resize-none'
                                            rows={4}
                                            maxLength={650}
                                        />
                                        {showEmoji && (
                                            <div ref={emojiRef} className="absolute bottom-full left-0 mb-2">
                                                <Picker
                                                    data={data}
                                                    onEmojiSelect={onEmojiSelect}
                                                    theme="dark"
                                                />
                                            </div>
                                        )}
                                        <div className="text-right text-gray-400 text-sm">
                                            {note.length}/650 characters
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                                    >
                                        {loading ? (
                                            <>
                                                <div className='animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full'></div>
                                                Processing...
                                            </>
                                        ) : postText}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
            {showCommentModal && selectedPost && userProfile && (
                <CommentModal 
                    post={{
                        ...selectedPost,
                        comments: selectedPost.comments?.map(comment => ({
                            ...comment,
                            username: comment.username || 'Anonymous',
                            profileImage: comment.profileImage || '/default-avatar.png'
                        })) || []
                    }}
                    onClose={() => {
                        setShowCommentModal(false);
                        setTimeout(() => {
                            setSelectedPost(null);
                        }, 200);
                    }}
                    onComment={handleComment}
                    onLike={handleCommentLike}
                    // onReply={handleReply}
                    userProfile={userProfile}
                />
            )}
        </div>
    );
};

export default Content;