import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { FaImages } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import PostCard from '@/components/PostCard';
import { IoMdClose } from "react-icons/io";

interface ContentProps {
  setToast: (toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

interface Post {
    _id: string;
    username: string;
    note: string;
    category: string;
    mediaType: 'none' | 'image' | 'video';
    mediaUrl?: string;
    comments?: Array<{
        address: string;
        text: string;
        timestamp: Date;
    }>;
    likes: string[];
    likeCount?: number;
    tier: 'Free' | 'Bronze' | 'Silver' | 'Gold';
}

interface PostData {
  note: string;
  mediaType: 'none' | 'image' | 'video';
  mediaUrl?: string;
  tier: 'Free' | 'Bronze' | 'Silver' | 'Gold';
}

const Content = ({ setToast }: ContentProps) => {
    const [showUploader, setShowUploader] = useState(false);
    const [note, setNote] = useState('');
    const [image, setimage] = useState('');
    const [loading, setLoading] = useState(false);
    const [postText, setPostText] = useState('Post');
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
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
    const [passTier, setPassTier] = useState<'Free' | 'Bronze' | 'Silver' | 'Gold'>('Free');
    const [userAddress, setUserAddress] = useState('');
    const [showCommentModal, setShowCommentModal] = useState<string | null>(null);
    const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

    const fetchPosts = async () => {
        setIsLoadingPosts(true);
        try {
            const myAddress = localStorage.getItem('address');
            if (!myAddress) {
                setToast({
                    show: true,
                    message: 'Please connect your wallet first',
                    type: 'warning'
                });
                return;
            }

            const res = await fetch(`/api/posts/user/${myAddress}`);
            if (!res.ok) {
                throw new Error('Failed to fetch posts');
            }
            
            const data = await res.json();
            setPosts(data.posts);

            // First get user profile
            const profileRes = await fetch(`/api/profile?address=${myAddress}`);
            const profileData = await profileRes.json();

            if (!profileData.profile) {
                setToast({
                    show: true,
                    message: 'Please set up your profile first',
                    type: 'warning'
                });
                return;
            }

            setUserProfile({
                username: profileData.profile.username || 'Anonymous',
                address: profileData.profile.address,
                profilePic: profileData.profile.profileImage || '/empProfile.png'
            });

            const initialLikes: { [key: string]: number } = {};
            const initialHasLiked: { [key: string]: boolean } = {};

            data.posts.forEach((post: Post) => {
                initialLikes[post._id] = post.likeCount || 0;
                initialHasLiked[post._id] = post.likes?.includes(myAddress) || false;
            });

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

    useEffect(() => {
        fetchPosts();
    }, []);

    const handleDelete = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}`, {
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
        }
    };

    const handleMediaChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isVideo = file.type.startsWith('video/');
        const reader = new FileReader();
        reader.readAsDataURL(file);
        setLoading(true);

        reader.onloadend = async () => {
            const base64data = reader.result;

            try {
                const res = await fetch(isVideo ? "/api/videoApi" : "/api/imageApi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ data: base64data }),
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.status}`);
                }

                const data = await res.json();
                setimage(data.url);
                setSelectedImage(URL.createObjectURL(file));
                setMediaType(isVideo ? 'video' : 'image');
            } catch (error) {
                console.error('Error uploading media:', error);
                setToast({
                    show: true,
                    message: 'Failed to upload media. Please try again.',
                    type: 'error'
                });
            } finally {
                setLoading(false);
            }
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim()) return;

        setLoading(true);
        setPostText('Processing...');

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

            const postData = {
                note,
                mediaType: mediaType,
                mediaUrl: image,
                address,
                tier: passTier,
                username: userProfile?.username,
                category: 'post'
            };

            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            if (!res.ok) throw new Error('Failed to create post');

            // Reset form and fetch updated posts
            setNote('');
            setimage('');
            setSelectedImage('');
            setShowUploader(false);
            setPassTier('Free');
            await fetchPosts();
            
            setToast({
                show: true,
                message: 'Post created successfully!',
                type: 'success'
            });
        } catch (error) {
            console.error('Error creating post:', error);
            setToast({
                show: true,
                message: 'Failed to create post',
                type: 'error'
            });
        } finally {
            setLoading(false);
            setPostText('Post');
        }
    };

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
            setHasLiked(prev => ({ ...prev, [postId]: data.hasLiked }));
            
        } catch (error) {
            console.error('Error updating like:', error);
            setToast({
                show: true,
                message: 'Failed to update like',
                type: 'error'
            });
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!newComment[postId]?.trim()) return;

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

            setIsCommentLoading(prev => ({ ...prev, [postId]: true }));

            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    address, 
                    comment: newComment[postId].trim() 
                })
            });

            if (!res.ok) {
                throw new Error('Failed to add comment');
            }

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
            setToast({
                show: true,
                message: 'Failed to add comment',
                type: 'error'
            });
        } finally {
            setIsCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const typing = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        if (newValue.length <= 150) {
            setNote(newValue);
        } else {
            setToast({
                show: true,
                message: 'Post cannot exceed 150 characters',
                type: 'warning'
            });
        }
    };

    const censorAddress = (address: string) => {
        if (!address) return '';
        const start = address.slice(0, 4);
        const end = address.slice(-4);
        return `${start}xxxxxxxx${end}`;
    };

    useEffect(() => {
        return () => {
            if (selectedImage) {
                URL.revokeObjectURL(selectedImage);
            }
        };
    }, [selectedImage]);

    return (
        <div className='min-h-screen bg-black px-4 py-8'>
            <div className='max-w-4xl mx-auto'>
                {/* Header Section */}
                <div className='mb-10'>
                    <button
                        onClick={() => setShowUploader(true)}
                        className='w-full max-w-md mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-xl shadow-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300'
                    >
                        <MdAddCircle className="text-2xl" />
                        <span className="font-medium text-lg">Create New Post</span>
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
                                userAddress={userAddress}
                                userProfile={userProfile}
                                hasLiked={hasLiked[post._id]}
                                likes={likes[post._id] || post.likeCount || 0}
                                showComments={showComments[post._id]}
                                onLike={() => handleLike(post._id)}
                                onDelete={() => handleDelete(post._id)}
                                onToggleComments={() => setShowCommentModal(post._id)}
                                onComment={(e: React.FormEvent) => handleComment(e, post._id)}
                                newComment={newComment[post._id] || ''}
                                setNewComment={(value: string) => setNewComment(prev => ({
                                    ...prev,
                                    [post._id]: value
                                }))}
                                isCommentLoading={!!isCommentLoading[post._id]}
                                censorAddress={censorAddress}
                                onImageClick={(imageUrl) => {
                                    setModalImage(imageUrl);
                                    setShowImageModal(true);
                                }}
                            />
                        ))}
                    </div>
                )}

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
                        <div className='bg-[#2A2D2F] p-8 rounded-xl max-w-md w-full mx-4'>
                            <h3 className='text-xl text-white font-semibold mb-4'>Delete Post</h3>
                            <p className='text-gray-300 mb-6'>Are you sure you want to delete this post? This action cannot be undone.</p>
                            <div className='flex gap-4'>
                                <button
                                    onClick={() => handleDelete(postToDelete!)}
                                    className='flex-1 bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition-colors'
                                >
                                    Delete
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPostToDelete(null);
                                    }}
                                    className='flex-1 bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors'
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
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4'>
                        <div className='bg-[#2A2D2F] rounded-xl max-w-xl w-full'>
                            <form onSubmit={handleSubmit} className='p-6'>
                                <div className='flex flex-col gap-6'>
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

                                    <div 
                                        className='relative group cursor-pointer rounded-xl overflow-hidden h-[200px]'
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const files = Array.from(e.dataTransfer.files);
                                            if (files[0]) {
                                                const input = document.createElement('input');
                                                input.type = 'file';
                                                input.files = e.dataTransfer.files;
                                                handleMediaChange({ target: input } as React.ChangeEvent<HTMLInputElement>);
                                            }
                                        }}
                                    >
                                        {selectedImage ? (
                                            <div className='relative h-full'>
                                                <Image 
                                                    src={selectedImage}
                                                    alt="Preview"
                                                    fill
                                                    style={{ objectFit: 'cover' }}
                                                    className='rounded-xl'
                                                />
                                                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedImage('');
                                                            const input = document.getElementById('media-upload') as HTMLInputElement;
                                                            if (input) {
                                                                input.value = '';
                                                                input.click();
                                                            }
                                                        }}
                                                        className='bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors'
                                                    >
                                                        Change Media
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label htmlFor="media-upload" className='block h-full'>
                                                <div className='h-full border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors'>
                                                    <FaImages className="text-4xl text-gray-400" />
                                                    <p className='text-gray-400 text-center'>Click or drag media to upload</p>
                                                </div>
                                                <input 
                                                    type="file"
                                                    id="media-upload"
                                                    className='hidden'
                                                    accept="image/*,video/*"
                                                    onChange={handleMediaChange}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {loading && (
                                        <div className='text-green-500 flex items-center gap-2'>
                                            <div className='animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full'></div>
                                            Processing media...
                                        </div>
                                    )}

                                    <div className="mb-4">
                                        <label className="block text-gray-300 mb-2">Post Tier</label>
                                        <select 
                                            value={passTier}
                                            onChange={(e) => setPassTier(e.target.value as 'Free' | 'Bronze' | 'Silver' | 'Gold')}
                                            className="w-full bg-gray-700 rounded-lg p-3 text-white"
                                        >
                                            <option value="Free">Free</option>
                                            <option value="Bronze">Bronze Pass</option>
                                            <option value="Silver">Silver Pass</option>
                                            <option value="Gold">Gold Pass</option>
                                        </select>
                                    </div>

                                    <textarea 
                                        value={note}
                                        onChange={typing}
                                        placeholder='Express yourself...' 
                                        className='w-full bg-[#1A1D1F] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none resize-none'
                                        rows={4}
                                        maxLength={150}
                                    />

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className='w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
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

                {/* Comment Modal */}
                {showCommentModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
                        <div className='bg-[#2A2D2F] p-6 rounded-xl max-w-lg w-full mx-4'>
                            <div className='flex justify-between items-center mb-4'>
                                <h3 className='text-xl text-white font-semibold'>Comments</h3>
                                <button 
                                    onClick={() => setShowCommentModal(null)}
                                    className='text-gray-400 hover:text-white'
                                >
                                    <IoMdClose size={24} />
                                </button>
                            </div>
                            
                            <div className='max-h-[60vh] overflow-y-auto mb-4'>
                                {posts.find(p => p._id === showCommentModal)?.comments?.map((comment, index) => (
                                    <div key={index} className='bg-gray-800 rounded-lg p-3 mb-2'>
                                        <p className='text-gray-400 text-sm'>{censorAddress(comment.address)}</p>
                                        <p className='text-white'>{comment.text}</p>
                                    </div>
                                ))}
                            </div>

                            <form onSubmit={(e) => {
                                e.preventDefault();
                                handleComment(e, showCommentModal);
                            }} className='flex gap-2'>
                                <input
                                    type='text'
                                    value={newComment[showCommentModal] || ''}
                                    onChange={(e) => setNewComment(prev => ({
                                        ...prev,
                                        [showCommentModal]: e.target.value
                                    }))}
                                    placeholder='Add a comment...'
                                    className='flex-1 bg-gray-800 text-white rounded-lg px-4 py-2'
                                />
                                <button 
                                    type='submit'
                                    className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700'
                                    disabled={isCommentLoading[showCommentModal]}
                                >
                                    {isCommentLoading[showCommentModal] ? 'Sending...' : 'Send'}
                                </button>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Content;