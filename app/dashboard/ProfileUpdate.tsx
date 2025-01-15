'use client'
import React, { useState, useEffect, useRef } from 'react';
import { FaImages } from "react-icons/fa6";
import { TiRefresh } from "react-icons/ti";
import Image from 'next/image';

interface ProfileUpdateProps {
  setToast: (toast: { 
    show: boolean; 
    message: string; 
    type: 'success' | 'error' | 'info' | 'warning' 
  }) => void;
}

const ProfileUpdate = ({ setToast }: ProfileUpdateProps) => {
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [about, setAbout] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!username.trim()) newErrors.username = 'Username is required';
    if (!country.trim()) newErrors.country = 'Country is required';
    if (!about.trim()) newErrors.about = 'About section is required';
    if (!profileImage && !selectedImagePreview) newErrors.image = 'Profile image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setToast({
        show: true,
        message: 'Please fill in all required fields',
        type: 'error'
      });
      return;
    }

    setLoading(true);

    try {
      const address = localStorage.getItem('address');
      if (!address) {
        setToast({
          show: true,
          message: 'Please connect your wallet first',
          type: 'error'
        });
        return;
      }

      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address,
          username,
          country,
          about,
          profileImage
        }),
      });

      const data = await res.json();
      
      if (res.ok) {
        setToast({
          show: true,
          message: 'Profile updated successfully!',
          type: 'success'
        });
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setToast({
        show: true,
        message: error.message || 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch existing profile data
    const fetchProfile = async () => {
      const address = localStorage.getItem('address');
      if (!address) return;

      try {
        const res = await fetch(`/api/profile?address=${address}`);
        const data = await res.json();
        if (data.profile) {
          setUsername(data.profile.username || '');
          setCountry(data.profile.country || '');
          setAbout(data.profile.about || '');
          setProfileImage(data.profile.profileImage || '');
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview URL for immediate display
    setSelectedImagePreview(URL.createObjectURL(file));
    setLoading(true);

    try {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
            method: 'POST',
            body: formData
        });

        if (!res.ok) {
            throw new Error(`Upload failed: ${res.status}`);
        }

        const data = await res.json();
        setProfileImage(data.imageUrl);
    } catch (error: any) {
        console.error('Error uploading image:', error);
        alert(error.message || 'Failed to upload image');
        setSelectedImagePreview('');
    } finally {
        setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col mb-[40px] space-y-5 justify-center items-center'>
     <div className='flex justify-start items-start'>
     <p className='text-white text-[2rem] font-bold mt-0'>Update profile</p>
     </div>
      <div className='flex items-center gap-x-4'>
        <div 
          className='h-[300px] w-[350px] bg-gray-600 rounded-lg flex justify-center items-center cursor-pointer'
          onClick={() => fileInputRef.current?.click()}
        >
          {selectedImagePreview || profileImage ? (
            <Image src={selectedImagePreview || profileImage} alt="Profile" width={300} height={250} className="rounded-lg" />
          ) : (
            <div className='border-dashed h-[250px] w-[300px] border-[1px] border-gray-200 rounded-lg flex text-white justify-center items-center'>
              <FaImages size={30} />
            </div>
          )}
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button 
          type="button" 
          onClick={() => fileInputRef.current?.click()}
          className='bg-orange-500 flex items-center gap-x-2 text-white py-3 mt-5 rounded-lg px-3'
        >
          <TiRefresh size={20} />Edit image
        </button>
        {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
      </div>
      <div className="w-[500px] space-y-4">
        <div>
          <input 
            type="text" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`h-[50px] p-5 rounded-lg w-full ${errors.username ? 'border-red-500' : ''}`}
            placeholder='Username *' 
          />
          {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
        </div>

        <div>
          <input 
            type="text" 
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className={`h-[50px] p-5 rounded-lg w-full ${errors.country ? 'border-red-500' : ''}`}
            placeholder='Country of origin *' 
          />
          {errors.country && <p className="text-red-500 text-sm">{errors.country}</p>}
        </div>

        <div>
          <textarea 
            value={about}
            onChange={(e) => setAbout(e.target.value)}
            className={`p-5 rounded-lg w-full ${errors.about ? 'border-red-500' : ''}`}
            placeholder='Tell other Creators about you *' 
            rows={8}
          />
          {errors.about && <p className="text-red-500 text-sm">{errors.about}</p>}
        </div>
      </div>

      <button 
        type="submit"
        disabled={loading}
        className='h-[40px] w-[150px] bg-green-500 text-white rounded-lg mt-5 disabled:bg-gray-400 hover:bg-green-600 transition-colors'
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default ProfileUpdate;
