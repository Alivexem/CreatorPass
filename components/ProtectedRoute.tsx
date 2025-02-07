'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '../utils/reown';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    let loadingTimer: NodeJS.Timeout;

    // Start a timer to set loading to false after a short delay
    loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    // Only start redirect timer if not connected
    if (!isConnected) {
      redirectTimer = setTimeout(() => {
        // Double check that we're still not connected before redirecting
        if (!isConnected) {
          router.push('/');
        }
      }, 5000);
    }

    // Clear both timers on cleanup or if isConnected changes
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      if (loadingTimer) clearTimeout(loadingTimer);
    };
  }, [isConnected, router]);

  // Show loading state briefly while checking connection
  if (isLoading) {
    return <div>Loading...</div>;
  }

  // If connected, render children immediately
  if (isConnected) {
    return <>{children}</>;
  }

  // If not connected but within 5 second window, show connecting message
  return <div>Connecting to wallet...</div>;
};

export default ProtectedRoute; 