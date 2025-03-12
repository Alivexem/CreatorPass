'use client'
import React from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";

interface PostCardProps {
    post: any;
    userProfile: {
        username: string;
        address: string;
        profileImage?: string; // Make profileImage optional
    };
    hasLiked: boolean;
    likes: number;
    showComments: boolean;
    onLike: () => void;
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
    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'VIP': return 'text-yellow-500';
            case 'Special': return 'text-purple-500';
            case 'Regular': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    return (
        <div className='md:w-[50vw] w-[95%] flex flex-col rounded-xl bg-[#111315] shadow-lg'>
            {/* Header */}
            <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-[#1A1D1F]'>
                <div className='flex items-center gap-x-3'>
                    <div className='relative h-[50px] w-[50px]'>
                        <Image
                            src={userProfile?.profileImage || '/empProfile.png'} // Use optional chaining and provide default
                            fill
                            style={{ objectFit: 'cover' }}
                            alt='profile'
                            className='rounded-lg'
                        />
                    </div>
                    <p className='text-[1.1rem] font-medium'>{userProfile?.username || 'Anonymous'}</p>
                </div>
                <div className='flex items-center gap-x-2'>
                    <Image src='/sol.png' height={20} width={20} alt='solana' className='rounded-lg' />
                    <div className='flex flex-col items-end'>
                        <span className={`text-[0.7rem] ${getTierColor(post.tier || 'Free')}`}>
                            {post.tier || 'Free'} Post
                        </span>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className='px-10 mt-5 text-gray-200'>
                <p className='text-left'>{post.note}</p>
            </div>

            {/* Image */}
            {post.image && (
                <div className='flex justify-center w-[100%] items-center'>
                    <div 
                        className='relative md:h-[350px] h-[300px] w-[95%] mt-7 cursor-pointer hover:opacity-90 transition-opacity'
                        onClick={() => onImageClick(post.image)}
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

            {/* Actions */}
            <div className='mt-10 space-x-3 w-[100%] flex text-[0.8rem] md:[1rem] mb-5 px-10 justify-between items-center'>
                <button
                    onClick={onLike}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors'
                >
                    <IoHeartHalf
                        className={`text-[1.1rem] md:text-[1.7rem] transition-colors ${hasLiked ? 'text-purple-500' : ''}`}
                    />
                    <p>{likes} likes</p>
                </button>
                <button
                    onClick={onToggleComments}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors'
                >
                    <FaCommentMedical className='text-[1.1rem] md:text-[1.7rem]' />
                    <p>{post.comments?.length || 0} comments</p>
                </button>
                <button
                    onClick={onDelete}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-red-500 hover:text-red-400 transition-colors'
                >
                    <MdDeleteForever className='text-[1.1rem] md:text-[1.7rem]' />
                    <p className='hidden md:block'>Delete</p>
                </button>
            </div>

            {/* Comments Section */}
            {showComments && (
                <div className='px-10 py-5 border-t border-gray-800'>
                    <form onSubmit={handleComment} className='flex gap-x-2'>
                        <input
                            type='text'
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder='Add a comment...'
                            className='flex-1 bg-[#1A1D1F] text-white rounded-lg px-4 py-2'
                        />
                        <button
                            type='submit'
                            disabled={isCommentLoading}
                            className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50'
                        >
                            Post
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default PostCard;