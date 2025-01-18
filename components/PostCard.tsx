'use client'
import React from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import CommentSection from './CommentSection';

interface PostCardProps {
    post: any;
    userProfile: any;
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
    censorAddress
}: PostCardProps) => {
    return (
        <div className='w-[95%] min-h-[200px] rounded-xl bg-transparent border-[1px] border-gray-200'>
            <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-green-700'>
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
            {post.image && (
                <div className='flex justify-center w-[100%] items-center'>
                    <Image 
                        src={post.image} 
                        height={1000} 
                        width={1000} 
                        className='h-[55%] mt-7 w-[80%] rounded-lg border-[1px] border-gray-400 px-5' 
                        alt='post image' 
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className='mt-10 w-[100%] flex mb-5 px-10 justify-between items-center flex-wrap gap-y-4'>
                <button 
                    onClick={onLike}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-white hover:opacity-80 transition-opacity'
                >
                    <IoHeartHalf 
                        className={`text-[1.7rem] transition-colors ${
                            hasLiked ? 'text-purple-500' : 'text-white'
                        }`} 
                    />
                    <p>{likes} likes</p>
                </button>
                <button 
                    onClick={onToggleComments}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-white hover:opacity-80 transition-opacity'
                >
                    <FaCommentMedical className='text-[1.7rem]' />
                    <p>{post.comments?.length || 0} comments</p>
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