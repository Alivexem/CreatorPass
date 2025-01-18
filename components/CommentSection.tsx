'use client'
import React from 'react';

interface CommentSectionProps {
    post: any;
    handleComment: (e: React.FormEvent) => void;
    newComment: string;
    setNewComment: (value: string) => void;
    isCommentLoading: boolean;
    censorAddress: (address: string) => string;
}

const CommentSection = ({
    post,
    handleComment,
    newComment,
    setNewComment,
    isCommentLoading,
    censorAddress
}: CommentSectionProps) => {
    return (
        <div className='px-10 py-5 border-t border-gray-700 transition-all duration-300'>
            <form onSubmit={handleComment} className='mb-4'>
                <input
                    type="text"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    className='w-full bg-[#272B30] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
                    disabled={isCommentLoading}
                />
                <button 
                    type="submit"
                    className='w-full mt-2 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50'
                    disabled={isCommentLoading}
                >
                    {isCommentLoading ? 'Adding comment...' : 'Comment'}
                </button>
            </form>

            <div className='max-h-[200px] overflow-y-auto space-y-3'>
                {post.comments?.slice()
                    .sort((a: { timestamp: Date }, b: { timestamp: Date }) => 
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                    .map((comment: any, idx: number) => (
                        <div key={idx} className='bg-[#272B30] p-3 rounded-lg'>
                            <p className='text-gray-400 text-sm font-mono mb-1'>
                                {censorAddress(comment.address)}
                            </p>
                            <p className='text-white text-sm'>{comment.comment}</p>
                        </div>
                    ))}
                {(!post.comments || post.comments.length === 0) && (
                    <p className='text-gray-500 text-center py-2'>No comments yet</p>
                )}
            </div>
        </div>
    );
};

export default CommentSection; 