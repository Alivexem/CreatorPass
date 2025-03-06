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
        tier: 'Free' | 'Bronze' | 'Silver' | 'Gold';
        likes: string[];
        comments?: Array<{
            address: string;
            text: string;
            timestamp: Date;
        }>;
        gifts?: Array<{
            from: string;
            amount: number;
            timestamp: Date;
        }>;
    };
    userAddress: string;
    userProfile: any;
    hasLiked: boolean;
    likes: number;
    showComments: boolean;
    onLike: () => void;
    onComment: (e: React.FormEvent) => void;
    newComment: string;
    setNewComment: (value: string) => void;
    isCommentLoading: boolean;
    censorAddress?: (address: string) => string;
    onImageClick?: (imageUrl: string) => void;
    onDelete?: () => void;
    onToggleComments?: () => void;
    onDownload?: () => void;
    onGift?: () => void;
    children?: React.ReactNode;
}

// Or alternatively, create a ToastType type
type ToastType = 'success' | 'error' | 'info' | 'warning';

const PostCard: React.FC<PostCardProps> = ({
    post,
    userProfile,
    userAddress,
    hasLiked,
    likes,
    showComments,
    onLike,
    onComment,
    newComment,
    setNewComment,
    isCommentLoading,
    censorAddress,
    onImageClick,
    onDelete,
    onToggleComments,
    onDownload,
    onGift,
    children
}) => {
    const [toast, setToast] = useState<{
        show: boolean;
        message: string;
        type: ToastType;
    }>({ show: false, message: '', type: 'info' });

    const commentText = newComment || '';
    const isLoading = isCommentLoading;

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
        <div className="bg-gray-800 rounded-lg overflow-hidden">
            {/* Post Header */}
            <div className="p-4 flex justify-between items-center">
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
                    <p className='hidden md:block'>
                        {censorAddress ? censorAddress(post.username) : post.username}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-sm ${
                        post.tier === 'Free' ? 'bg-green-600' :
                        post.tier === 'Bronze' ? 'bg-yellow-700' :
                        post.tier === 'Silver' ? 'bg-gray-400' :
                        'bg-yellow-500'
                    }`}>
                        {post.tier}
                    </span>
                </div>
            </div>

            {/* Post Content */}
            <div className="p-4">
                <p className="text-white mb-4">{post.note}</p>
                
                {post.mediaUrl && (
                    <div className="relative aspect-video rounded-lg overflow-hidden">
                        {post.mediaType === 'video' ? (
                            <video
                                src={post.mediaUrl}
                                controls
                                className="w-full h-full object-contain bg-black"
                            />
                        ) : (
                            <Image
                                src={post.mediaUrl}
                                alt="Post media"
                                fill
                                className="object-contain"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Interaction Buttons */}
            <div className="p-4 border-t border-gray-700 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => onLike()}
                        className={`flex items-center gap-2 ${
                            hasLiked ? 'text-purple-500' : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        {hasLiked ? <FaHeart /> : <FaRegHeart />}
                        <span>{likes} likes</span>
                    </button>
                    
                    <button
                        onClick={() => onToggleComments?.()}
                        className="flex items-center gap-2 text-gray-400 hover:text-white"
                    >
                        <FaComment />
                        <span>{post.comments?.length || 0} comments</span>
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    {post.mediaUrl && (
                        <button
                            className="text-gray-400 hover:text-white"
                            title="Download media"
                        >
                            <FaDownload />
                        </button>
                    )}
                    <button
                        className="text-gray-400 hover:text-white"
                        title="Send gift"
                    >
                        <FaGift />
                    </button>
                </div>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className="p-4 border-t border-gray-700">
                    <form onSubmit={onComment} className="mb-4">
                        <input
                            type="text"
                            value={commentText}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="w-full bg-gray-700 text-white rounded px-4 py-2"
                        />
                    </form>

                    <div className="space-y-2">
                        {post.comments?.map((comment, index) => (
                            <div key={index} className="bg-gray-700 rounded p-2">
                                <p className="text-sm text-gray-400">
                                    {censorAddress?.(comment.address)}
                                </p>
                                <p className="text-white">{comment.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PostCard; 