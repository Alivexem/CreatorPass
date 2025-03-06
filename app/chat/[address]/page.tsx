'use client'
import { useEffect, useState } from 'react';
import CreatorChat from '@/components/CreatorChat';
import { useRouter } from 'next/navigation';
import Toast from '@/components/Toast';

const ChatPage = ({ params }: { params: { address: string } }) => {
  const router = useRouter();
  const [userAddress, setUserAddress] = useState<string>('');
  const [creatorProfile, setCreatorProfile] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'error' as const });

  useEffect(() => {
    const address = localStorage.getItem('address');
    if (!address) {
      router.push('/');
      return;
    }
    setUserAddress(address);

    // Fetch both creator and user profiles
    const fetchProfiles = async () => {
      try {
        // Fetch creator profile
        const creatorRes = await fetch(`/api/profile?address=${params.address}`);
        const creatorData = await creatorRes.json();
        
        // Fetch user profile
        const userRes = await fetch(`/api/profile?address=${address}`);
        const userData = await userRes.json();

        if (!userData.profile || !userData.profile.username) {
          setToast({
            show: true,
            message: 'Please create a profile first',
            type: 'error'
          });
          router.push('/dashboard');
          return;
        }

        if (creatorData.profile) {
          setCreatorProfile(creatorData.profile);
        }
        if (userData.profile) {
          setUserProfile(userData.profile);
        }
      } catch (error) {
        console.error('Error fetching profiles:', error);
      }
    };

    fetchProfiles();
  }, [params.address, router]);

  if (!creatorProfile || !userProfile) {
    return <div className='flex justify-center items-center h-[100vh] w-[100vw] bg-gray-900'>
      <p className='text-white text-2xl font-bold animate-pulse'>Loading chat</p>
    </div>;
  }

  return (
    <div className="h-screen w-full bg-black flex flex-col">
      <div className="flex-1 overflow-hidden relative">
        <CreatorChat
          creatorAddress={params.address}
          userAddress={userAddress}
          creatorProfile={creatorProfile}
          userProfile={userProfile}
          onClose={() => router.back()}
          className="pb-[100px] md:pb-0"
        />
      </div>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
    </div>
  );
};

export default ChatPage; 
