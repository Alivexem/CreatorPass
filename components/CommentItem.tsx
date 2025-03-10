'use client'
import React, { useState } from 'react';
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
    
    return (
        <div className={`${isReply ? 'ml-8 mt-2' : ''}`}>
            <div className="flex gap-3">
                <div className="relative h-8 w-8">
                    <Image
                        src={comment.profileImage || '/empProfile.png'}
                        alt={comment.username || 'Anonymous'}
                        fill
                        className="rounded-full object-cover"
                        sizes="32px"
                    />
                </div>
                <div className="flex-1">
                    <div className="bg-[#111315] p-3 rounded-lg">
                        <div className="flex justify-between items-start">
                            <span className="text-white font-medium">{comment.username || 'Anonymous'}</span>
                            <span className="text-xs text-gray-400">
                                {comment.timestamp ? new Date(comment.timestamp).toLocaleDateString() : 'Unknown date'}
                            </span>
                        </div>
                        <p className="text-gray-300 mt-1">{comment.comment}</p>
                    </div>
                    <div className="flex gap-4 mt-2 text-sm">
                        <button
                            onClick={() => onLike(postId, comment._id)}
                            className="text-gray-400 hover:text-white flex items-center gap-1"
                        >
                            {userProfile && comment.likes?.includes(userProfile.address) ? (
                                <IoHeart className="text-red-500" />
                            ) : (
                                <IoHeartOutline />
                            )}
                            <span>{comment.likeCount || 0}</span>
                        </button>
                        <button
                            onClick={() => onReply(comment)}
                            className="text-gray-400 hover:text-white"
                        >
                            Reply
                        </button>
                    </div>
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
