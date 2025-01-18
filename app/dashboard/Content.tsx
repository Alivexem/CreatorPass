import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { IoHeartHalf } from "react-icons/io5";
import { FaCommentMedical } from "react-icons/fa6";
import { MdDeleteForever } from "react-icons/md";
import { MdAddCircle } from "react-icons/md";
import { FaImages } from "react-icons/fa6";
import { MdCancel } from "react-icons/md";
import PostCard from '@/components/PostCard';

interface ContentProps {
  setToast: (toast: { show: boolean; message: string; type: 'success' | 'error' | 'info' | 'warning' }) => void;
}

interface Post {
    _id: string;
    username: string;
    note: string;
    image?: string;
    comments?: Array<{
        address: string;
        comment: string;
        timestamp?: Date;
    }>;
    likes?: string[];
    likeCount?: number;
}

const Content = ({ setToast }: ContentProps) => {
    const [showUploader, setShowUploader] = useState(false);
    const [note, setNote] = useState('');
    const [image, setimage] = useState('');
    const [loading, setLoading] = useState(false);
    const [postText, setPostText] = useState('post');
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [posts, setPosts] = useState<Post[]>([]);
    const [userProfile, setUserProfile] = useState<any>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<string | null>(null);
    const [isLoadingPosts, setIsLoadingPosts] = useState(true);
    const [showComments, setShowComments] = useState<{ [key: string]: boolean }>({});
    const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
    const [likes, setLikes] = useState<{ [key: string]: number }>({});
    const [hasLiked, setHasLiked] = useState<{ [key: string]: boolean }>({});
    const [isCommentLoading, setIsCommentLoading] = useState<{ [key: string]: boolean }>({});
  
    const fetchPosts = async () => {
      setIsLoadingPosts(true);
      try {
        const myAddress = localStorage.getItem('address') || '';
        
        // First get the user's profile
        const profileResponse = await fetch(`/api/profile?address=${myAddress}`);
        const profileData = await profileResponse.json();
        
        // Then fetch posts
        const postsResponse = await fetch('/api');
        const postsData = await postsResponse.json();
        
        // Filter posts to match the profile's address
        const userPosts = postsData.creator.filter((post: any) => {
          return post.username === profileData.profile?.address;
        });
        
        // Initialize likes state for each post
        const initialLikes: { [key: string]: number } = {};
        const initialHasLiked: { [key: string]: boolean } = {};
        
        userPosts.forEach((post: Post) => {
          initialLikes[post._id] = post.likeCount || 0;
          initialHasLiked[post._id] = post.likes?.includes(myAddress) || false;
        });

        setPosts(userPosts);
        setLikes(initialLikes);
        setHasLiked(initialHasLiked);
        
        setUserProfile({
          username: profileData.profile?.username || 'Anonymous',
          address: profileData.profile?.address,
          profilePic: profileData.profile?.profileImage || '/smile.jpg'
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setIsLoadingPosts(false);
      }
    };

    useEffect(() => {
      fetchPosts();
    }, []);

    const typing = (e:any) => {
      setNote(e.target.value);
    };

    const handleDelete = async (postId: string) => {
      setPostToDelete(postId);
      setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
      try {
        const res = await fetch(`/api/${postToDelete}`, {
          method: 'DELETE',
        });

        if (!res.ok) {
          throw new Error('Failed to delete post');
        }

        // Refresh posts after deletion
        await fetchPosts();
        setShowDeleteModal(false);
        setPostToDelete(null);
        setToast({
          show: true,
          message: 'Post deleted successfully!',
          type: 'success'
        });
      } catch (error) {
        console.error('Error deleting post:', error);
        setToast({
          show: true,
          message: 'Failed to delete post. Please try again.',
          type: 'error'
        });
      }
    };
  
    const handleImageChange = async (e:any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.readAsDataURL(file); 
      setLoading(true);
    
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
            setimage(data.url);
          setSelectedImage(URL.createObjectURL(file));
        } catch (error) {
          console.error('Error uploading image:', error);
          setToast({
            show: true,
            message: 'Failed to upload image. Please try again.',
            type: 'error'
          });
        } finally {
          setLoading(false);
        }
      };
    
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        setToast({
          show: true,
          message: 'Error reading file. Please try again.',
          type: 'error'
        });
        setLoading(false);
      };
    };
    
    const handleSubmit = async (e:any) => {
      e.preventDefault();
      if (!note) {
        setToast({
          show: true,
          message: 'Type a post before submitting!',
          type: 'warning'
        });
        return;
      }
      
      if (note.length > 300) {
        setToast({
          show: true,
          message: 'Thread too long, make it concise! (300 letters maximum)',
          type: 'warning'
        });
        return;
      }

      setPostText('Loading...');
      const myAddress = localStorage.getItem('address');
      
      try {
        // Get profile data first
        const profileRes = await fetch(`/api/profile?address=${myAddress}`);
        const profileData = await profileRes.json();
        
        if (!profileData.profile) {
          throw new Error('Profile not found, setup your profile');
        }

        const fullData = {
          username: profileData.profile.address,
          note: note.trim(),
          image: image || ''
        };
        
        console.log('Sending data:', fullData);
        
        const res = await fetch('/api', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(fullData)
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log('Response:', data);

        if (data.message === 'Post uploaded') {
          setToast({
            show: true,
            message: 'Posted successfully!',
            type: 'success'
          });
          setNote('');
          setimage('');
          setSelectedImage('');
          setShowUploader(false);
          
          // Refresh posts
          fetchPosts();
        } else {
          throw new Error(data.message || 'Failed to upload post');
        }
      } catch (error: any) {
        console.error('Submission error:', error);
        setToast({
          show: true,
          message: error.message || 'Failed to upload post, please try again',
          type: 'error'
        });
      } finally {
        setPostText('post');
      }
    };
    
    useEffect(() => {
      // Cleanup function to revoke the object URL when component unmounts
      // or when selectedImage changes
      return () => {
        if (selectedImage) {
          URL.revokeObjectURL(selectedImage);
        }
      };
    }, [selectedImage]);

    const censorAddress = (address: string) => {
      if (!address) return '';
      const start = address.slice(0, 4);
      const end = address.slice(-4);
      return `${start}xxxxxxxx${end}`;
    };
    
    const handleLike = async (postId: string) => {
        try {
            const address = localStorage.getItem('address');
            if (!address) return;

            const res = await fetch(`/api/posts/${postId}/like`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ address })
            });

            if (!res.ok) {
                throw new Error('Failed to update like');
            }

            const data = await res.json();
            
            // Update the posts state to reflect the new like count
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? { ...post, likeCount: data.likeCount }
                        : post
                )
            );

            // Update likes count and hasLiked status using the new API response format
            setLikes(prev => ({ ...prev, [postId]: data.likeCount }));
            setHasLiked(prev => ({ ...prev, [postId]: data.hasLiked }));
            
        } catch (error) {
            console.error('Error updating like:', error);
        }
    };

    const handleComment = async (e: React.FormEvent, postId: string) => {
        e.preventDefault();
        if (!newComment[postId]?.trim()) return;

        try {
            const address = localStorage.getItem('address');
            if (!address) return;

            // Set loading state for this specific comment
            setIsCommentLoading(prev => ({ ...prev, [postId]: true }));

            const res = await fetch(`/api/posts/${postId}/comment`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    address, 
                    comment: newComment[postId].trim() 
                })
            });

            const data = await res.json();
            setPosts(prevPosts => 
                prevPosts.map(post => 
                    post._id === postId 
                        ? { ...post, comments: data.comments }
                        : post
                )
            );
            
            setNewComment(prev => ({ ...prev, [postId]: '' }));
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            // Clear loading state
            setIsCommentLoading(prev => ({ ...prev, [postId]: false }));
        }
    };
    
    return (
        <div className='flex flex-col justify-center items-center mb-20 min-h-[100vh] bg-[#1A1D1F]'>
            <div className='flex flex-col justify-center items-center mb-20 gap-y-7'>
                <div
                    className='flex hover:bg-blue-700 cursor-pointer items-center gap-x-3 h-[50px] w-[200px] rounded-lg justify-center text-white bg-blue-500 text-[1.3rem]'
                    onClick={() => setShowUploader(true)}
                >
                    <MdAddCircle />
                    <p>Add content</p>
                </div>

                {isLoadingPosts ? (
                    <div className='text-white text-xl animate-pulse'>
                        Loading posts...
                    </div>
                ) : (
                    <div className='flex flex-col gap-y-8 w-full items-center'>
                        {posts && posts.map((post: any) => (
                            <PostCard
                                key={post._id}
                                post={post}
                                userProfile={userProfile}
                                hasLiked={hasLiked[post._id]}
                                likes={likes[post._id] || post.likeCount || 0}
                                showComments={showComments[post._id]}
                                onLike={() => handleLike(post._id)}
                                onDelete={() => handleDelete(post._id)}
                                onToggleComments={() => setShowComments(prev => ({ 
                                    ...prev, 
                                    [post._id]: !prev[post._id] 
                                }))}
                                handleComment={(e) => handleComment(e, post._id)}
                                newComment={newComment[post._id] || ''}
                                setNewComment={(value) => setNewComment(prev => ({
                                    ...prev,
                                    [post._id]: value
                                }))}
                                isCommentLoading={isCommentLoading[post._id]}
                                censorAddress={censorAddress}
                            />
                        ))}
                    </div>
                )}

                {showDeleteModal && (
                    <div className='fixed inset-0 bg-gray-700 bg-opacity-85 flex justify-center items-center'>
                        <div className='bg-white p-6 rounded-lg flex flex-col items-center gap-y-4'>
                            <p className='text-lg text-black font-semibold'>Are you sure you want to delete this post?</p>
                            <div className='flex gap-x-4'>
                                <button
                                    onClick={confirmDelete}
                                    className='bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700'
                                >
                                    Yes, delete
                                </button>
                                <button
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setPostToDelete(null);
                                    }}
                                    className='bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600'
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {showUploader && (
                    <div className='fixed inset-0 bg-gray-700 bg-opacity-85 flex justify-center items-center'>
                        <form onSubmit={handleSubmit}>
                        <div className='flex h-auto w-[400px] flex-col mb-[40px] space-y-5 justify-center items-center bg-white p-5 rounded-lg'>
                            <p className='text-black text-[1.3rem] font-bold'>What do you have for your viewers?</p>
                            <div className='flex items-center gap-x-4'>
                                <div 
                                    className='h-[150px] w-[200px] text-black bg-gray-600 rounded-lg flex justify-center items-center'
                                    onDragOver={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        const files = e.dataTransfer.files;
                                        if (files && files[0]) {
                                            handleImageChange({ target: { files: [files[0]] } });
                                        }
                                    }}
                                >
                                    {selectedImage ? (
                                        <>
                                            <Image 
                                                src={selectedImage}
                                                alt="Preview"
                                                width={200}
                                                height={150}
                                                className='h-full w-full text-black object-cover rounded-lg'
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedImage('');
                                                    const input = document.getElementById('image-upload') as HTMLInputElement;
                                                    if (input) {
                                                        input.value = '';
                                                        input.click();
                                                    }
                                                }}
                                                className='absolute mt-[160px] bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600'
                                            >
                                                Change Image
                                            </button>
                                        </>
                                    ) : (
                                        <label htmlFor="image-upload" className='cursor-pointer text-black w-full h-full'>
                                            <div className='border-dashed h-full w-full border-[1px] border-gray-200 rounded-lg flex flex-col text-white justify-center items-center gap-2'>
                                        <FaImages size={30} />
                                                <p className='text-sm text-black text-center'>Click or drag image to upload</p>
                                    </div>
                                            <input 
                                                type="file"
                                                id="image-upload"
                                                className='hidden'
                                                accept="image/*"
                                                onChange={handleImageChange}
                                            />
                                        </label>
                                    )}
                                </div>
                            </div>
                            {loading && <p className='mt-3 ml-2' style={{color:'lime'}}>Processing image please wait...</p>}
                                     <br />
                            <textarea 
                                value={note}
                                onChange={typing} 
                                name="about" 
                                placeholder='Express yourself' 
                                className='p-5 rounded-lg text-black border-[1px] border-black' 
                                cols={30} 
                                rows={2}
                            />
                            <button
                            style={{ pointerEvents: loading ? 'none' : 'auto' }}
                            disabled={loading}
                            className={`${loading ? 'cursor-not-allowed' : 'cursor-pointer'} h-[40px] w-[150px] bg-green-500 text-white rounded-lg mt-5`}>{postText}</button>
                            <div
                                className='text-red-500 text-[2rem] rounded-lg mt-5 cursor-pointer'
                                onClick={() => setShowUploader(false)}
                            >
                                <MdCancel />
                            </div>
                        </div>
                        </form>
                    </div>
                    
                )}
            </div>
        </div>
    );
};

export default Content;