'use client'
import React, { useState, useRef } from 'react';
import { FaImages } from "react-icons/fa6";
import Image from 'next/image';

interface CommentSectionProps {
    post: any;
    handleComment: (e: React.FormEvent, imageUrl?: string) => void;
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
        if (!newComment.trim() && !selectedImage) return;

        let imageUrl = '';
        if (selectedImage) {
            const reader = new FileReader();
            reader.readAsDataURL(selectedImage);
            
            const base64data = await new Promise((resolve) => {
                reader.onloadend = () => resolve(reader.result);
            });

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
                imageUrl = data.url;
            } catch (error) {
                console.error('Error uploading image:', error);
                alert('Failed to upload image. Please try again.');
                return;
            }
        }

        await handleComment(e, imageUrl);
        removeImage();
    };

    return (
        <div className='px-10 py-5 border-t border-gray-700 transition-all duration-300'>
            <form onSubmit={handleSubmit} className='mb-4 space-y-3'>
                <div className='flex gap-2'>
                    <input
                        type="text"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className='flex-1 bg-[#272B30] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500'
                        disabled={isCommentLoading}
                    />
                    <label className="flex items-center justify-center w-10 h-10 bg-[#272B30] rounded-lg cursor-pointer hover:bg-[#323438]">
                        <FaImages className="text-gray-400 hover:text-white" size={20} />
                        <input
                            ref={fileInputRef}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleImageSelect}
                            disabled={isCommentLoading}
                        />
                    </label>
                </div>

                <button 
                    type="submit"
                    className='w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50'
                    disabled={isCommentLoading || (!newComment.trim() && !selectedImage)}
                >
                    {isCommentLoading ? 'Posting...' : 'Post'}
                </button>
            </form>

            <div className='max-h-[200px] overflow-y-auto space-y-3'>
                {imagePreview && (
                    <div className="relative w-full max-w-[200px] mb-3">
                        <Image
                            src={imagePreview}
                            alt="Preview"
                            width={200}
                            height={200}
                            className="rounded-lg object-cover"
                        />
                        <button
                            type="button"
                            onClick={removeImage}
                            className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700 font-bold w-6 h-6 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>
                )}
                
                {post.comments?.slice()
                    .sort((a: { timestamp: Date }, b: { timestamp: Date }) => 
                        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    )
                    .map((comment: any, idx: number) => (
                        <div key={idx} className='bg-[#272B30] p-3 rounded-lg'>
                            <p className='text-gray-400 text-sm font-mono mb-1'>
                                {censorAddress(comment.address)}
                            </p>
                            {comment.imageUrl && (
                                <div className="mb-2">
                                    <Image
                                        src={comment.imageUrl}
                                        alt="Comment image"
                                        width={300}
                                        height={200}
                                        className="rounded-lg object-cover"
                                    />
                                </div>
                            )}
                            {comment.comment && (
                                <p className='text-white text-sm'>{comment.comment}</p>
                            )}
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