'use client'
import React, { useState, useEffect, useRef } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaImages } from "react-icons/fa6";
import { CommentItem } from './CommentItem';
import { Post, Profile, Comment } from '@/types/interfaces';
import Image from 'next/image';

interface CommentModalProps {
    post: Post;
    onClose: () => void;
    onComment: (postId: string, comment: string, imageUrl?: string) => Promise<void>;
    onLike: (postId: string, commentId: string) => Promise<void>;
    userProfile: Profile | null;
}

export const CommentModal: React.FC<CommentModalProps> = ({ post, onClose, onComment, onLike, userProfile }) => {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedImage, setSelectedImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onloadend = async () => {
            const base64data = reader.result;

            try {
                const res = await fetch("/api/imageApi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ data: base64data }),
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.status}`);
                }

                const data = await res.json();
                setSelectedImage(file);
                setImagePreview(URL.createObjectURL(file));
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
            }
        };
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!newComment.trim() && !selectedImage) || isSubmitting) return;

        setIsSubmitting(true);
        try {
            let imageUrl = '';
            if (selectedImage) {
                const reader = new FileReader();
                reader.readAsDataURL(selectedImage);
                
                const base64data = await new Promise((resolve) => {
                    reader.onloadend = () => resolve(reader.result);
                });

                const res = await fetch("/api/imageApi", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ data: base64data }),
                });

                if (!res.ok) {
                    throw new Error(`Upload failed: ${res.status}`);
                }

                const data = await res.json();
                imageUrl = data.url;
            }

            await onComment(post._id, newComment.trim(), imageUrl);
            
            setNewComment('');
            removeImage();
        } catch (error) {
            console.error('Error submitting comment:', error);
            alert('Failed to submit comment. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setNewComment('');
        };
    }, []);

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
                    {imagePreview && (
                        <div className="relative w-full max-w-[200px] mb-3">
                            <div className="relative w-[200px] h-[200px]">
                                <Image
                                    src={imagePreview}
                                    alt="Preview"
                                    fill
                                    className="rounded-lg object-cover"
                                />
                            </div>
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 font-bold w-6 h-6 flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>
                    )}

                    {post.comments && post.comments.length > 0 ? (
                        post.comments.map((comment) => (
                            <CommentItem 
                                key={comment._id}
                                comment={comment}
                                onLike={onLike}
                                postId={post._id}
                                userProfile={userProfile}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-400 py-4">
                            No comments yet. Be the first to comment!
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-800">
                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a comment..."
                                className="flex-1 bg-[#111315] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                disabled={isSubmitting}
                            />
                            <label className="flex items-center justify-center w-10 h-10 bg-[#111315] rounded-lg cursor-pointer hover:bg-[#1A1D1F]">
                                <FaImages className="text-gray-400 hover:text-white" size={20} />
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                    disabled={isSubmitting}
                                />
                            </label>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            disabled={isSubmitting || (!newComment.trim() && !selectedImage)}
                        >
                            {isSubmitting ? 'Posting...' : 'Post'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
