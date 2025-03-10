'use client'
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoHeart, IoHeartOutline } from "react-icons/io5";
import { Comment, Profile } from '@/types/interfaces';

interface CommentItemProps {
    comment: Comment;
    onLike: (postId: string, commentId: string) => Promise<void>;
    onReply: (comment: Comment) => void;
    postId: string;
    userProfile: Profile | null;
    isReply?: boolean;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment, onLike, onReply, postId, userProfile, isReply = false }) => {
    const [showReplies, setShowReplies] = useState(false);
    const [commentProfile, setCommentProfile] = useState<Profile | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await fetch(`/api/profile?address=${comment.address}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.profile) {
                        setCommentProfile(data.profile);
                    }
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
            }
        };

        if (comment.address) {
            fetchUserProfile();
        }
    }, [comment.address]);

    const formatTimestamp = (timestamp: Date | undefined) => {
        if (!timestamp) return 'Just now';
        const date = new Date(timestamp);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    return (
        <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
            <div className="flex gap-3">
                <div className="relative h-8 w-8 flex-shrink-0">
                    <Image
                        src={commentProfile?.profileImage || '/empProfile.png'}
                        alt={commentProfile?.username || 'Anonymous'}
                        fill
                        className="rounded-full object-cover"
                        sizes="32px"
                    />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="bg-[#111315] p-3 rounded-lg">
                        <div className="flex justify-between items-start gap-2">
                            <div className="flex flex-col">
                                <span className="text-gray-300 text-[0.9rem] font-medium truncate">
                                    {commentProfile?.username || '...'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {formatTimestamp(comment.timestamp)}
                                </span>
                            </div>
                            {userProfile && comment.address === userProfile.address && (
                                <span className="text-xs text-blue-400">Me</span>
                            )}
                        </div>
                        <p className="text-white mt-1 break-words">{comment.comment}</p>
                    </div>
                    {/* <div className="flex gap-4 mt-2 text-sm">
                        <button
                            onClick={() => onLike(postId, comment._id)}
                            className="text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            {userProfile && comment.likes?.includes(userProfile.address) ? (
                                <IoHeart className="text-purple-500" />
                            ) : (
                                <IoHeartOutline />
                            )}
                            <span>{comment.likeCount || 0}</span>
                        </button>
                        {userProfile && (
                            <button
                                onClick={() => onReply(comment)}
                                className="text-gray-400 hover:text-white"
                            >
                                Reply
                            </button>
                        )}
                    </div> */}
                    
                    {comment.hasReplies && !isReply && (
                        <button
                            onClick={() => setShowReplies(!showReplies)}
                            className="text-sm text-blue-400 hover:text-blue-300 mt-2"
                        >
                            {showReplies ? 'Hide replies' : 'View replies'}
                        </button>
                    )}
                </div>
            </div>
            {showReplies && comment.replies && comment.replies.length > 0 && (
                <div className="space-y-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply._id}
                            comment={reply}
                            onLike={onLike}
                            onReply={onReply}
                            postId={postId}
                            userProfile={userProfile}
                            isReply={true}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
