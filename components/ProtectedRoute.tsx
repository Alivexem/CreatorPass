'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '../utils/reown';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    if (!isConnected) {
      // Wait 5 seconds before setting shouldRedirect to true
      redirectTimer = setTimeout(() => {
        setShouldRedirect(true);
      }, 5000);
    }

    return () => {
      if (redirectTimer) {
        clearTimeout(redirectTimer);
      }
    };
  }, [isConnected]);

  useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
  }, [shouldRedirect, router]);

  if (!isConnected) {
    return <div>Loading...</div>; // or a loading spinner
  }

  return <>{children}</>;
};

export default ProtectedRoute; 