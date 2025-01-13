'use client'
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '../utils/reown';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();

  useEffect(() => {
    if (!isConnected) {
      router.push('/');
    }
  }, [isConnected, router]);

  if (!isConnected) {
    return null; // or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute; 