'use client'
import { useEffect, useState } from 'react';
import CreatorChat from '@/components/CreatorChat';
import { useRouter } from 'next/navigation';

const ChatPage = ({ params }: { params: { address: string } }) => {
  const router = useRouter();
  const [userAddress, setUserAddress] = useState<string>('');
  const [creatorProfile, setCreatorProfile] = useState<any>(null);

  useEffect(() => {
    const address = localStorage.getItem('address');
    if (!address) {
      router.push('/');
      return;
    }
    setUserAddress(address);

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

  if (!creatorProfile) {
    return <div className='flex justify-center items-center h-[100vh] w-[100vw] bg-gray-900'><p className='text-white text-2xl font-bold animate-pulse'>Loading chat</p></div>;
  }



  return (
    <div className="h-full w-full bg-[#1A1D1F]">
      <CreatorChat
        creatorAddress={params.address}
        userAddress={userAddress}
        creatorProfile={creatorProfile}
        onClose={() => router.back()}
      />
    </div>
  );
};

export default ChatPage; 
