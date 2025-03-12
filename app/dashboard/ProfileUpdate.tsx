'use client'
import React, { useState, useEffect, useRef } from 'react';
import { FaImages, FaUser, FaGlobe, FaPen } from "react-icons/fa";
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
  const [isAdultContent, setIsAdultContent] = useState(false);
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
          profileImage,
          isAdultContent
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
          setIsAdultContent(data.profile.isAdultContent || false);
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
            setProfileImage(data.url);
            setSelectedImagePreview(URL.createObjectURL(file));
        } catch (error: any) {
            console.error('Error uploading image:', error);
            setToast({
                show: true,
                message: 'Failed to upload image. Please try again.',
                type: 'error'
            });
            setSelectedImagePreview('');
        } finally {
            setLoading(false);
        }
    };

    reader.onerror = () => {
        setToast({
            show: true,
            message: 'Error reading file. Please try again.',
            type: 'error'
        });
        setLoading(false);
    };
  };

  useEffect(() => {
    return () => {
        if (selectedImagePreview) {
            URL.revokeObjectURL(selectedImagePreview);
        }
    };
  }, [selectedImagePreview]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-[#272B30] rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-white mb-8 flex items-center gap-3">
          Profile Settings
          <FaUser className="text-purple-500" />
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Profile Image Section */}
            <div className="w-full md:w-1/3">
              <div 
                className="relative group cursor-pointer rounded-xl overflow-hidden bg-gradient-to-r from-purple-500/20 to-blue-500/20 aspect-square"
                onClick={() => fileInputRef.current?.click()}
              >
                {selectedImagePreview || profileImage ? (
                  <Image 
                    src={selectedImagePreview || profileImage} 
                    alt="Profile" 
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center">
                    <FaImages className="text-4xl text-gray-400" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <TiRefresh className="text-3xl text-white" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              {errors.image && <p className="text-red-400 text-sm mt-2">{errors.image}</p>}
            </div>

            {/* Form Fields */}
            <div className="flex-1 space-y-6 w-full">
              <div>
                <label className="block text-gray-400 mb-2">Username</label>
                <div className="relative">
                  <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className={`w-full bg-[#1A1D1F] text-white pl-10 pr-4 py-3 rounded-lg border ${errors.username ? 'border-red-500' : 'border-gray-700'} focus:border-purple-500 focus:outline-none`}
                    placeholder="Enter your username" 
                  />
                </div>
                {errors.username && <p className="text-red-400 text-sm mt-1">{errors.username}</p>}
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Country</label>
                <div className="relative">
                  <FaGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text" 
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className={`w-full bg-[#1A1D1F] text-white pl-10 pr-4 py-3 rounded-lg border ${errors.country ? 'border-red-500' : 'border-gray-700'} focus:border-purple-500 focus:outline-none`}
                    placeholder="Enter your country" 
                  />
                </div>
                {errors.country && <p className="text-red-400 text-sm mt-1">{errors.country}</p>}
              </div>

              <div>
                <label className="block text-gray-400 mb-2">About</label>
                <div className="relative">
                  <FaPen className="absolute left-3 top-3 text-gray-400" />
                  <textarea 
                    value={about}
                    onChange={(e) => setAbout(e.target.value)}
                    className={`w-full bg-[#1A1D1F] text-white pl-10 pr-4 py-3 rounded-lg border ${errors.about ? 'border-red-500' : 'border-gray-700'} focus:border-purple-500 focus:outline-none`}
                    placeholder="Tell other creators about yourself" 
                    rows={4}
                  />
                </div>
                {errors.about && <p className="text-red-400 text-sm mt-1">{errors.about}</p>}
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 bg-[#1A1D1F] p-4 rounded-lg border border-gray-700">
            <input
              type="checkbox"
              id="adultContent"
              checked={isAdultContent}
              onChange={(e) => setIsAdultContent(e.target.checked)}
              className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
            />
            <label htmlFor="adultContent" className="text-gray-300">
              I create and upload 18+ content
            </label>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileUpdate;
