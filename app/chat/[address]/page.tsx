'use client'
import { useEffect, useState } from 'react';
import CreatorChat from '@/components/CreatorChat';
import { useRouter } from 'next/navigation';

interface Profile {
  address: string;
  username: string;
  about: string;
  profileImage: string;
}

const ChatPage = ({ params }: { params: { address: string } }) => {
  const router = useRouter();
  const [userAddress, setUserAddress] = useState<string>('');
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const address = localStorage.getItem('address');
    if (!address) {
      router.push('/');
      return;
    }
    setUserAddress(address);
    fetchUserProfile(address);

    // Fetch creator profile
    const fetchCreatorProfile = async () => {
      try {
        const res = await fetch(`/api/profile?address=${params.address}`);
        const data = await res.json();
        if (data.profile) {
          setCreatorProfile(data.profile);
        }
      } catch (error) {
        console.error('Error fetching creator profile:', error);
      }
    };

    fetchCreatorProfile();
  }, [params.address, router]);

  const fetchUserProfile = async (address: string) => {
    try {
      const res = await fetch(`/api/profile?address=${address}`);
      const data = await res.json();
      if (data.profile) {
        setUserProfile(data.profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  if (!creatorProfile || !userProfile || !userProfile.username) {
    return <div className='flex justify-center items-center h-[100vh] w-[100vw] bg-gray-900'><p className='text-white text-2xl font-bold animate-pulse'>Loading chat</p></div>;
  }

  return (
    <div className="h-full w-full bg-black">
      <CreatorChat
        creatorAddress={params.address}
        userAddress={userAddress}
        creatorProfile={creatorProfile}
        userProfile={{
          username: userProfile.username,
          profileImage: userProfile.profileImage
        }}
        onClose={() => router.back()}
      />
    </div>
  );
};

export default ChatPage;
