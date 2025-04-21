import { Post, Profile } from '@/types/creator';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical, FaGift } from "react-icons/fa6";
import { MdContentCopy } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import { formatDistanceToNow } from 'date-fns';
import { useState } from 'react';
import { MdInsertComment } from "react-icons/md";

interface CreatorPostProps {
    post: Post & {
        mediaType?: 'image' | 'video' | 'audio';
        video?: string;
        audio?: string; // Add audio URL property
    };
    profile: Profile | null;
    hasLiked: boolean;
    likes: number;
    onLike: () => void;
    onComment: () => void;
    onGift: () => void;
    onImageClick: (image: string) => void;
    onCopy: (text: string, postId: string) => void;
    onDownload: (imageUrl: string, postId: string) => void;
    downloadedStates: { [key: string]: boolean };
    copiedStates: { [key: string]: boolean };
    date?: string;
    disabled: {
        like: boolean;
        comment: boolean;
        download: boolean;
        copy: boolean;
        gift: boolean;
    };
    onProfileClick?: () => void;
    hasProfile?: boolean;
}

const CreatorPost = ({
    post,
    profile,
    hasLiked,
    likes,
    onLike,
    onComment,
    onGift,
    onImageClick,
    onCopy,
    onDownload,
    downloadedStates,
    copiedStates,
    date,
    disabled,
    onProfileClick,
    hasProfile = false, // Add this with default value
}: CreatorPostProps) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString?: string) => {
        if (!dateString) return '';
        
        const postDate = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - postDate.getTime());
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) {
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            if (diffHours === 0) {
                const diffMinutes = Math.floor(diffTime / (1000 * 60));
                return `${diffMinutes}m ago`;
            }
            return `${diffHours}h ago`;
        } else if (diffDays < 7) {
            return `${diffDays}d ago`;
        } else {
            return postDate.toLocaleDateString();
        }
    };

    const getTierColor = (tier: string) => {
        switch(tier) {
            case 'VIP': return 'text-yellow-500';
            case 'Special': return 'text-purple-500';
            case 'Regular': return 'text-blue-500';
            default: return 'text-gray-500';
        }
    };

    const createMarkup = (text: string) => {
        const processedText = text.replace(
            /(https?:\/\/[^\s]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">$1</a>'
        );
        
        if (!isExpanded && processedText.length > 350) {
            return {
                __html: processedText.slice(0, 350) + '...'
            };
        }
        
        return { __html: processedText };
    };
    
    return (
        <div className='md:w-[50vw] w-[95%] flex flex-col rounded-xl bg-[#111315] shadow-lg'>
            {/* Header */}
            <div className='w-[100%] h-[80px] rounded-t-xl flex justify-between px-7 items-center box-border text-white bg-[#1A1D1F]'>
                <div className='flex items-center gap-x-3'>
                    <div className='relative h-[50px] w-[50px]'>
                        <Image
                            src={profile?.profileImage || '/empProfile.png'}
                            fill
                            style={{ objectFit: 'cover' }}
                            alt='profile'
                            className='rounded-lg cursor-pointer hover:opacity-80 transition-opacity'
                            onClick={onProfileClick}
                        />
                    </div>
                    <p className='text-[1rem] font-medium'>{profile?.username || 'Anonymous'}</p>
                </div>
                <div className='flex items-center gap-x-2'>
                <div className='flex items-center gap-x-2'>
                    <Image src='/sol.png' height={20} width={20} alt='solana' className='rounded-lg' />
                    <div className='flex flex-col items-end'>
                        <span className={`text-[0.7rem] ${getTierColor(post.tier)}`}>
                            {post.tier} Post
                        </span>
                    </div>
                </div>
                {date && <span className="text-sm text-gray-400">{formatDate(date)}</span>}
                </div>
            </div>

            {/* Content */}
            <div className='px-10 mt-5 text-gray-200'>
                <div 
                    className='text-left'
                    dangerouslySetInnerHTML={createMarkup(post.note)}
                />
                {post.note.length > 350 && (
                    <button 
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-purple-500 hover:text-purple-400 transition-colors mt-2 text-sm"
                    >
                        {isExpanded ? 'Show Less' : 'Read More'}
                    </button>
                )}
            </div>

            {/* Media Content */}
            {(post.image || post.video || post.mediaType === 'audio') && (
                <div className='flex justify-center w-[100%] items-center'>
                    <div 
                        className='relative md:h-[350px] h-[300px] w-[95%] mt-7'
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
                                onClick={() => onImageClick(post.image || '')}
                            />
                            
                        ) : post.mediaType === 'audio' && post.audio && (
                            <div className="relative w-full h-full">
                                <Image
                                    src='/audio.jpg'
                                    fill
                                    style={{ objectFit: 'cover' }}
                                    className='rounded-lg shadow-md'
                                    alt='audio placeholder'
                                />
                                
                                
                                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-4">
                                    <audio
                                        src={post.audio}
                                        controls
                                        className='w-full'
                                    >
                                        Your browser does not support the audio element.
                                    </audio>
                                    
                                </div>
                                
                            </div>
                        )}
                        
                    </div>
                </div>
            )}

            {/* Actions */}
            <div className='mt-10 space-x-3 w-[100%] flex text-[0.8rem] md:[1rem] mb-5 px-10 justify-between items-center'>
                <button
                    onClick={() => !disabled.like && onLike()}
                    className={`flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors ${
                        post.tier !== 'Free' && disabled.like ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    <IoHeartHalf
                        className={`text-[1rem] md:text-[1.7rem] transition-colors ${hasLiked ? 'text-purple-500' : ''}`}
                    />
                    <p className='text-[0.8rem]'>{likes} likes</p>
                </button>
                <button
                    onClick={() => !disabled.comment && hasProfile && onComment()}
                    className={`flex flex-col md:flex-row items-center gap-x-3 text-gray-300 hover:text-white transition-colors relative ${
                        (post.tier !== 'Free' && disabled.comment) || !hasProfile ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm bg-gray-800 px-2 py-1 rounded transition-opacity whitespace-nowrap">
                        {!hasProfile && 'Create profile to comment'}
                    </div>
                    <MdInsertComment  className='text-[1rem] md:text-[1.7rem]' />
                    <p className='text-[0.8rem]'>{post.comments?.length || 0} comments</p>
                </button>
                <button
                    onClick={onGift}
                    className={`text-white flex items-center justify-center gap-x-3 hover:opacity-90 transition-opacity ${
                        post.tier !== 'Free' && disabled.gift ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    disabled={post.tier !== 'Free' && disabled.gift}
                >
                    <FaGift className='text-[1rem] md:text-[1.7rem]' /><p className='hidden md:block'>Gift</p>
                </button>
                <button
                    onClick={() => onCopy(post.note || '', post._id)}
                    className={`text-white flex items-center justify-center gap-x-3 hover:opacity-90 transition-opacity relative ${
                        post.tier !== 'Free' && disabled.copy ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    disabled={post.tier !== 'Free' && disabled.copy}
                >
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm bg-gray-800 px-2 py-1 rounded transition-opacity">
                        <p className='whitespace-nowrap'>{copiedStates[post._id] && 'Text Copied!'}</p>
                    </div>
                    <MdContentCopy className='text-[1rem] md:text-[1.7rem]' />
                    <p className='hidden md:block'>Copy</p>
                </button>
                {post.image && (
                    <button
                        onClick={() => typeof post.image === 'string' && onDownload(post.image, post._id)}
                        className={`text-white flex items-center justify-center gap-x-3 hover:opacity-90 transition-opacity relative ${
                            post.tier !== 'Free' && disabled.download ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                        }`}
                        disabled={post.tier !== 'Free' && disabled.download}
                    >
                        <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm bg-gray-800 px-2 py-1 rounded transition-opacity">
                            {downloadedStates[post._id] && 'Downloading!'}
                        </div>
                        <IoMdDownload className='text-[1rem] md:text-[1.7rem]' />
                        <p className='hidden md:block'>Download</p>
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreatorPost;