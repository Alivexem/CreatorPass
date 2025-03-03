'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical, FaHeart, FaRegHeart, FaComment, FaCopy, FaDownload, FaGift } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import CommentSection from './CommentSection';
import Toast from './Toast';

interface PostCardProps {
    post: {
        _id: string;
        username: string;
        note: string;
        category: string;
        mediaType: 'none' | 'image' | 'video';
        mediaUrl?: string;
        likes: string[];
    };
    userProfile: any;
    userAddress: string;
    hasLiked: boolean;
    likes: number;
    showComments: boolean;
    onLike: (postId: string) => void;
    onDelete: () => void;
    onToggleComments: () => void;
    handleComment: (e: React.FormEvent) => void;
    newComment: string;
    setNewComment: (value: string) => void;
    isCommentLoading: boolean;
    censorAddress: (address: string) => string;
    onImageClick: (imageUrl: string) => void;
}

const PostCard = ({
    post,
    userProfile,
    userAddress,
    hasLiked,
    likes,
    showComments,
    onLike,
    onDelete,
    onToggleComments,
    handleComment,
    newComment,
    setNewComment,
    isCommentLoading,
    censorAddress,
    onImageClick
}: PostCardProps) => {
    const [toast, setToast] = useState({ show: false, message: '', type: 'info' as const });

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(post.note);
            setToast({ show: true, message: 'Text copied to clipboard!', type: 'success' });
        } catch (err) {
            setToast({ show: true, message: 'Failed to copy text', type: 'error' });
        }
    };

    const handleDownload = async () => {
        if (!post.mediaUrl) return;
        
        try {
            const response = await fetch(post.mediaUrl);
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `post-media-${post._id}${post.mediaType === 'video' ? '.mp4' : '.jpg'}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err) {
            setToast({ show: true, message: 'Failed to download media', type: 'error' });
        }
    };

    return (
        <div className='w-[95%] min-h-[200px] rounded-xl bg-transparent border-[1px] border-gray-200'>
            {toast.show && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast({ ...toast, show: false })}
                />
            )}
            <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-[#26355D]'>
                {/* Profile Section */}
                <div className='flex items-center gap-x-3'>
                    <div className='h-[60px] w-[60px] relative'>
                        <Image 
                            src={userProfile?.profilePic} 
                            fill
                            alt='profile' 
                            className='rounded-lg object-cover'
                            sizes="60px"
                        />
                    </div>
                    <p className='text-[1.1rem]'>{userProfile?.username}</p>
                </div>
                <div className='flex items-center gap-x-2'>
                    <Image src='/sol.png' height={20} width={20} alt='profile' className='rounded-lg' />
                    <p className='hidden md:block'>{censorAddress(post.username)}</p>
                </div>
            </div>

            {/* Post Content */}
            <div className='flex-start px-10 mt-5 text-white'>
                <p className='text-left'>{post.note}</p>
            </div>

            {/* Post Image */}
            {post.mediaUrl && (
                <div className="relative w-full h-64 mb-4">
                    {post.mediaType === 'video' ? (
                        <video
                            src={post.mediaUrl}
                            controls
                            className="w-full h-full rounded-lg object-cover"
                        />
                    ) : (
                        <Image
                            src={post.mediaUrl}
                            fill
                            className="rounded-lg object-cover"
                            alt="Post media"
                        />
                    )}
                </div>
            )}

            {/* Action Buttons */}
            <div className='mt-10 w-[100%] flex mb-5 px-10 justify-between items-center flex-wrap gap-y-4'>
                <button 
                    onClick={() => onLike(post._id)}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-white hover:opacity-80 transition-opacity'
                >
                    {post.likes.includes(userAddress) ? (
                        <FaHeart className="text-red-500" />
                    ) : (
                        <FaRegHeart />
                    )}
                    <p>{likes} likes</p>
                </button>
                <button 
                    onClick={onToggleComments}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-white hover:opacity-80 transition-opacity'
                >
                    <FaComment />
                    <p>{post.comments?.length || 0} comments</p>
                </button>
                <button 
                    onClick={handleCopy}
                    className='text-white hover:text-green-500 transition-colors'
                >
                    <FaCopy />
                </button>
                {post.mediaUrl && (
                    <button
                        onClick={handleDownload}
                        className='text-white hover:text-yellow-500 transition-colors'
                    >
                        <FaDownload />
                    </button>
                )}
                <button className="text-white hover:text-purple-500 transition-colors">
                    <FaGift />
                </button>
                <button 
                    onClick={onDelete}
                    className='bg-red-700 text-[1rem] h-[40px] w-auto p-2 md:w-[150px] text-white rounded-lg flex items-center justify-center gap-x-3'
                >
                    <MdDeleteForever className='text-[1.7rem]' />
                    <p className='hidden md:block'>Delete</p>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <CommentSection 
                    post={post}
                    handleComment={handleComment}
                    newComment={newComment}
                    setNewComment={setNewComment}
                    isCommentLoading={isCommentLoading}
                    censorAddress={censorAddress}
                />
            )}
        </div>
    );
};

export default PostCard; 