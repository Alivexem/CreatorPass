import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { FaImages } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import PostCard from '@/components/PostCard';

interface ContentProps {
  setToast: (toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

interface Post {
    _id: string;
    username: string;
    note: string;
    image?: string;
    comments?: Array<{
        address: string;
        comment: string;
        timestamp?: Date;
    }>;
    likes?: string[];
    likeCount?: number;
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

    const handleDelete = async (postId: string) => {
        setPostToDelete(postId);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!postToDelete) return;
        
        try {
            const res = await fetch(`/api/${postToDelete}`, {
                method: 'DELETE'
            });
            
            if (res.ok) {
                setPosts(posts.filter(post => post._id !== postToDelete));
                setToast({
                    show: true,
                    message: 'Post deleted successfully',
                    type: 'success'
                });
            }
        } catch (error) {
            setToast({
                show: true,
                message: 'Failed to delete post',
                type: 'error'
            });
        } finally {
            setShowDeleteModal(false);
            setPostToDelete(null);
        }
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setSelectedImage(URL.createObjectURL(file));
        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!res.ok) throw new Error('Upload failed');

            const data = await res.json();
            setimage(data.imageUrl);
        } catch (error) {
            console.error('Error uploading image:', error);
            setToast({
                show: true,
                message: 'Failed to upload image',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleLike = async (postId: string) => {
        try {
            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'POST'
            });
            if (res.ok) {
                setHasLiked(prev => ({
                    ...prev,
                    [postId]: !prev[postId]
                }));
                setLikes(prev => ({
                    ...prev,
                    [postId]: prev[postId] ? prev[postId] - 1 : prev[postId] + 1
                }));
            }
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!newComment[postId]?.trim()) return;

        setIsCommentLoading(prev => ({ ...prev, [postId]: true }));

        try {
            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ comment: newComment[postId] })
            });

            if (res.ok) {
                const updatedPost = await res.json();
                setPosts(prev => prev.map(post => 
                    post._id === postId ? updatedPost : post
                ));
                setNewComment(prev => ({ ...prev, [postId]: '' }));
            }
        } catch (error) {
            console.error('Error posting comment:', error);
        } finally {
            setIsCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!note.trim() || loading) return;

        setLoading(true);
        try {
            const res = await fetch('/api/posts', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ note, image })
            });

            if (res.ok) {
                const newPost = await res.json();
                setPosts(prev => [newPost, ...prev]);
                setNote('');
                setimage('');
                setSelectedImage('');
                setShowUploader(false);
            }
        } catch (error) {
            console.error('Error creating post:', error);
        } finally {
            setLoading(false);
        }
    };

    const censorAddress = (address: string) => {
        if (!address) return '';
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const typing = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value);
    };

    return (
        <div className='min-h-screen bg-[#1A1D1F] px-4 py-8'>
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
                ) : (
                    <div className='flex flex-col gap-y-8 w-full items-center'>
                        {posts && posts.map((post: any) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                userProfile={userProfile}
                                hasLiked={hasLiked[post._id]}
                                likes={likes[post._id] || post.likeCount || 0}
                                showComments={showComments[post._id]}
                                onLike={() => handleLike(post._id)}
                                onDelete={() => handleDelete(post._id)}
                                onToggleComments={() => setShowComments(prev => ({ 
                                    ...prev, 
                                    [post._id]: !prev[post._id] 
                                }))}
                                handleComment={(e) => handleComment(e, post._id)}
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

                {/* Delete Modal */}
                {showDeleteModal && (
                    <div className='fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50'>
                        <div className='bg-[#2A2D2F] p-8 rounded-xl max-w-md w-full mx-4'>
                            <h3 className='text-xl text-white font-semibold mb-4'>Delete Post</h3>
                            <p className='text-gray-300 mb-6'>Are you sure you want to delete this post? This action cannot be undone.</p>
                            <div className='flex gap-4'>
                                <button
                                    onClick={confirmDelete}
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
                    <div className='fixed inset-0 bg-black bg-opacity-95 flex justify-center items-center z-50'>
                        <div className='relative max-w-[95vw] max-h-[95vh]'>
                            <button 
                                className='absolute -top-12 right-0 text-white hover:text-red-500 transition-colors'
                                onClick={() => setShowImageModal(false)}
                            >
                                <MdCancel className="text-3xl" />
                            </button>
                            <Image
                                src={modalImage}
                                alt="Full size image"
                                width={1200}
                                height={800}
                                className='object-contain max-h-[90vh] rounded-lg'
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
                                        className='relative group cursor-pointer rounded-xl overflow-hidden'
                                        onDragOver={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                        }}
                                        onDrop={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            const files = Array.from(e.dataTransfer.files);
                                            if (files[0]) {
                                                const fakeEvent = {
                                                    target: { files: [files[0]] },
                                                    preventDefault: () => {},
                                                    currentTarget: e.currentTarget,
                                                } as unknown as React.ChangeEvent<HTMLInputElement>;
                                                handleImageChange(fakeEvent);
                                            }
                                        }}
                                    >
                                        {selectedImage ? (
                                            <div className='relative'>
                                                <Image 
                                                    src={selectedImage}
                                                    alt="Preview"
                                                    width={500}
                                                    height={300}
                                                    className='w-full h-[200px] object-cover rounded-xl'
                                                />
                                                <div className='absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedImage('');
                                                            const input = document.getElementById('image-upload') as HTMLInputElement;
                                                            if (input) {
                                                                input.value = '';
                                                                input.click();
                                                            }
                                                        }}
                                                        className='bg-white text-black px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors'
                                                    >
                                                        Change Image
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <label htmlFor="image-upload" className='block'>
                                                <div className='h-[200px] border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center gap-4 hover:border-blue-500 transition-colors'>
                                                    <FaImages className="text-4xl text-gray-400" />
                                                    <p className='text-gray-400 text-center'>Click or drag image to upload</p>
                                                </div>
                                                <input 
                                                    type="file"
                                                    id="image-upload"
                                                    className='hidden'
                                                    accept="image/*"
                                                    onChange={handleImageChange}
                                                />
                                            </label>
                                        )}
                                    </div>

                                    {loading && (
                                        <div className='text-green-500 flex items-center gap-2'>
                                            <div className='animate-spin h-4 w-4 border-2 border-green-500 border-t-transparent rounded-full'></div>
                                            Processing image...
                                        </div>
                                    )}

                                    <textarea 
                                        value={note}
                                        onChange={typing}
                                        placeholder='Express yourself...' 
                                        className='w-full bg-[#1A1D1F] text-white p-4 rounded-xl border border-gray-700 focus:border-blue-500 focus:outline-none resize-none'
                                        rows={4}
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
            </div>
        </div>
    );
};

export default Content;