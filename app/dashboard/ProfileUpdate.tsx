'use client'
import React, { useState, useEffect, useRef } from 'react';
import { FaImages } from "react-icons/fa6";
import { TiRefresh } from "react-icons/ti";
import Image from 'next/image';

const ProfileUpdate = () => {
  const [username, setUsername] = useState('');
  const [country, setCountry] = useState('');
  const [about, setAbout] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [selectedImagePreview, setSelectedImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const address = localStorage.getItem('address');
      if (!address) {
        alert('Please connect your wallet first');
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
        alert('Profile updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to update profile');
      }
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className='flex flex-col mb-[40px] space-y-5 justify-center items-center'>
      <p className='text-white text-[2rem] font-bold mt-10'>Please update profile</p>
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
      </div>
      <input 
        type="text" 
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className='h-[50px] p-5 rounded-lg w-[500px]' 
        placeholder='Username' 
      />
      <input 
        type="text" 
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        className='h-[50px] p-5 rounded-lg w-[500px]' 
        placeholder='Country of origin' 
      />
      <textarea 
        value={about}
        onChange={(e) => setAbout(e.target.value)}
        name="about" 
        placeholder='Tell other Creators about you' 
        className='p-5 rounded-lg' 
        cols={50} 
        rows={8}
      />
      <button 
        type="submit"
        disabled={loading}
        className='h-[40px] w-[150px] bg-green-500 text-white rounded-lg mt-5 disabled:bg-gray-400'
      >
        {loading ? 'Saving...' : 'Save'}
      </button>
    </form>
  );
};

export default ProfileUpdate;
