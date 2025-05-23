'use client'
import React, { useState } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { MdInsertComment } from "react-icons/md";
import { MdDeleteForever } from "react-icons/md";
import { MdContentCopy } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import { Post, Profile } from '@/types/interfaces';
import { linkifyText } from '@/utils/linkify';

interface PostCardProps {
    post: Post & {
        mediaType?: 'image' | 'video' | 'audio';
        video?: string;
    };
    userProfile: Profile;
    hasLiked: boolean;
    likes: number;
    showComments: boolean;
    onLike: () => void;
    onDelete: () => void;
    handleComment: (e: React.FormEvent) => void;
    newComment: string;
    setNewComment: (value: string) => void;
    isCommentLoading: boolean;
    censorAddress: (address: string) => string;
    onImageClick: (imageUrl: string) => void;
    onComment: () => void; // Make sure this prop exists
}

const PostCard: React.FC<PostCardProps> = ({ post, ...props }) => {
    const [showFullText, setShowFullText] = useState(false);

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'VIP': return 'text-yellow-500';
            case 'Special': return 'text-purple-500';
            case 'Regular': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const renderPostText = () => {
        const text = post.note;
        const urlRegex = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g;
        
        const content = text.length <= 300 || showFullText
            ? text
            : text.slice(0, 300) + '... ' +
              (showFullText ? '' : '<button class="text-blue-500 hover:text-blue-600">See more</button>');

        const linkifiedContent = content.split(urlRegex).map((part, i) => {
            if (part.match(urlRegex)) {
                return `<a href="${part}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${part}</a>`;
            }
            return part;
        }).join('');

        return (
            <div 
                className="whitespace-pre-wrap break-words"
                dangerouslySetInnerHTML={{ __html: linkifiedContent }}
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.tagName === 'BUTTON') {
                        e.preventDefault();
                        setShowFullText(true);
                    }
                }}
            />
        );
    };

    return (
        <div className='md:w-[50vw] w-[100%] flex flex-col rounded-xl bg-[#111315] shadow-lg'>
            {/* Header */}
            <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-[#1A1D1F]'>
                <div className='flex items-center gap-x-3'>
                    <div className='relative h-[50px] w-[50px]'>
                        <Image
                            src={props.userProfile?.profileImage || '/empProfile.png'} // Use optional chaining and provide default
                            fill
                            style={{ objectFit: 'cover' }}
                            alt='profile'
                            className='rounded-lg'
                        />
                    </div>
                    <p className='text-[1.1rem] font-medium'>{props.userProfile?.username || 'Anonymous'}</p>
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
                <div className="whitespace-pre-wrap break-words">
                    {renderPostText()}
                </div>
            </div>

            {/* Media Content */}
            {(post.image || post.video || post.mediaType === 'audio') && (
                <div className='flex justify-center w-[100%] items-center'>
                    <div 
                        className='relative md:h-[350px] h-[300px] w-[95%] mt-7 cursor-pointer hover:opacity-90 transition-opacity'
                        onClick={() => {
                            if (post.image && !post.video) {
                                props.onImageClick(post.image);
                            }
                        }}
                    >
                        {post.video ? (
                            <video
                                src={post.video}
                                className='w-full h-full rounded-lg object-contain'
                                controls
                                autoPlay
                                muted
                                controlsList='nodownload'
                            />
                        ) : post.image ? (
                            <Image
                                src={post.image}
                                fill
                                style={{ objectFit: 'cover' }}
                                className='rounded-lg shadow-md'
                                alt='post media'
                            />
                        ) : post.audio && (
                            <>
                                <Image
                                    src='/audio.jpg' // Placeholder image for audio files
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className='rounded-lg shadow-md'
                                    alt='audio placeholder'
                                />
                                <audio
                                    src={post.audio}
                                    controls
                                    className='w-full mt-[40%]'
                                >
                                    Your browser does not support the audio element.
                                </audio>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className='mt-10 space-x-3 w-[100%] flex text-[0.8rem] md:[1rem] mb-5 px-10 justify-between items-center'>
                <button
                    onClick={props.onLike}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors'
                >
                    <IoHeartHalf
                        className={`text-[1rem] md:text-[1.7rem] transition-colors ${props.hasLiked ? 'text-purple-500' : ''}`}
                    />
                    <p className='text-gray-300 text-[0.7rem]'>{props.likes} likes</p>
                </button>
                <button
                    onClick={props.onComment}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors'
                >
                    <MdInsertComment className='text-[1rem] md:text-[1.7rem]' />
                    <p className='text-gray-300 text-[0.7rem]'>{post.comments?.length || 0} comments</p>
                </button>
                <button
                    onClick={props.onDelete}
                    className='flex flex-col md:flex-row items-center gap-x-3 text-red-500 hover:text-red-400 transition-colors'
                >
                    <MdDeleteForever className='text-[1.1rem] md:text-[1.7rem]' />
                    <p className='hidden md:block'>Delete</p>
                </button>
            </div>

            {/* Comments Section */}
            {props.showComments && (
                <div className='px-10 py-5 border-t border-gray-800'>
                    <form onSubmit={props.handleComment} className='flex gap-x-2'>
                        <input
                            type='text'
                            value={props.newComment}
                            onChange={(e) => props.setNewComment(e.target.value)}
                            placeholder='Add a comment...'
                            className='flex-1 bg-[#1A1D1F] text-white rounded-lg px-4 py-2'
                        />
                        <button
                            type='submit'
                            disabled={props.isCommentLoading}
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