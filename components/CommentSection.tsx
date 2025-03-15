'use client'
import React, { useState, useRef } from 'react';
import { FaImages } from "react-icons/fa6";
import Image from 'next/image';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

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
    const [isUploading, setIsUploading] = useState(false);
    const [crop, setCrop] = useState<Crop>();
    const [showCropModal, setShowCropModal] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const imageRef = useRef<HTMLImageElement>(null);

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedImage(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
                setShowCropModal(true);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setSelectedImage(null);
        setImagePreview(null);
        setCrop(undefined);
        setShowCropModal(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() && !selectedImage) return;
        setIsUploading(true);

        let imageUrl = '';
        if (selectedImage && imageRef.current) {
            try {
                let imageData;
                if (crop) {
                    const canvas = document.createElement('canvas');
                    const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
                    const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
                    canvas.width = crop.width;
                    canvas.height = crop.height;
                    const ctx = canvas.getContext('2d');

                    if (ctx) {
                        ctx.drawImage(
                            imageRef.current,
                            crop.x * scaleX,
                            crop.y * scaleY,
                            crop.width * scaleX,
                            crop.height * scaleY,
                            0,
                            0,
                            crop.width,
                            crop.height
                        );
                        imageData = canvas.toDataURL('image/jpeg');
                    }
                } else {
                    imageData = imagePreview;
                }

                const res = await fetch('/api/imageUpload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ data: imageData }),
                });
                const data = await res.json();
                imageUrl = data.url;
            } catch (error) {
                console.error('Error uploading image:', error);
            }
        }

        await handleComment(e, imageUrl);
        removeImage();
        setIsUploading(false);
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

                {showCropModal && imagePreview && (
                    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
                        <div className="bg-[#1A1D1F] p-6 rounded-lg max-w-2xl w-full">
                            <h3 className="text-white text-lg font-semibold mb-4">Crop Image (Optional)</h3>
                            <ReactCrop
                                crop={crop}
                                onChange={c => setCrop(c)}
                                aspect={16/9}
                            >
                                <img
                                    ref={imageRef}
                                    src={imagePreview}
                                    alt="Preview"
                                    className="max-w-full h-auto"
                                />
                            </ReactCrop>
                            <div className="flex gap-3 mt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCropModal(false)}
                                    className="flex-1 bg-purple-600 text-white p-2 rounded-lg"
                                >
                                    Done
                                </button>
                                <button
                                    type="button"
                                    onClick={removeImage}
                                    className="flex-1 bg-gray-600 text-white p-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {imagePreview && !showCropModal && (
                    <div className="relative w-full max-w-[200px]">
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
                            className="absolute top-2 right-2 bg-black bg-opacity-50 text-white rounded-full p-1 hover:bg-opacity-70"
                        >
                            ×
                        </button>
                    </div>
                )}

                <button 
                    type="submit"
                    className='w-full bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50'
                    disabled={isUploading || (!newComment.trim() && !selectedImage)}
                >
                    {isUploading ? 'Uploading...' : isCommentLoading ? 'Posting...' : 'Post'}
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