'use client'
import React, { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { CommentItem } from './CommentItem';
import { Post, Profile, Comment } from '@/types/interfaces';

interface CommentModalProps {
    post: Post;
    onClose: () => void;
    onComment: (postId: string, comment: string, replyToId?: string) => Promise<void>;
    onLike: (postId: string, commentId: string) => Promise<void>;
    onReply: (postId: string, comment: string, replyToId: string) => Promise<void>;
    userProfile: Profile | null;
}

export const CommentModal: React.FC<CommentModalProps> = ({ post, onClose, onComment, onLike, onReply, userProfile }) => {
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<Comment | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        if (replyTo && replyTo._id) {
            await onReply(post._id, newComment, replyTo._id);
        } else {
            await onComment(post._id, newComment);
        }
        setNewComment('');
        setReplyTo(null);
    };

    return (
        <div className="fixed inset-0 bg-black/75 flex items-center justify-center z-50">
            <div className="bg-[#1A1D1F] w-[95%] md:w-[600px] h-[75vh] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-gray-800 flex justify-between items-center">
                    <h3 className="text-white text-lg font-semibold">Comments</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <IoMdClose size={24} />
                    </button>
                </div>

                <div className="h-[calc(75vh-180px)] overflow-y-auto p-4 space-y-4">
                    {post.comments?.map((comment) => (
                        <CommentItem 
                            key={comment._id}
                            comment={comment}
                            onLike={onLike}
                            onReply={(c) => setReplyTo(c)}
                            postId={post._id}
                            userProfile={userProfile}
                        />
                    ))}
                </div>

                <div className="p-4 border-t border-gray-800">
                    {replyTo && (
                        <div className="text-sm text-gray-400 mb-2 flex justify-between">
                            <span>Replying to {replyTo.username}</span>
                            <button 
                                onClick={() => setReplyTo(null)}
                                className="text-gray-500 hover:text-white"
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                    <form onSubmit={handleSubmit} className="flex gap-2">
                        <input
                            type="text"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="Add a comment..."
                            className="flex-1 bg-[#111315] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <button
                            type="submit"
                            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700"
                        >
                            Post
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
