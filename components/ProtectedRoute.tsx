'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppKitAccount } from '../utils/reown';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const { isConnected } = useAppKitAccount();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    let redirectTimer: NodeJS.Timeout;

    // Start the 5-second timer only if not connected
    if (!isConnected && !shouldRedirect) {
      redirectTimer = setTimeout(() => {
        // Only redirect if still not connected after 5 seconds
        if (!isConnected) {
          setShouldRedirect(true);
        }
      }, 5000);
    }

    // Clear checking state after a brief moment
    const checkingTimer = setTimeout(() => {
      setIsChecking(false);
    }, 1000);

    // If connected, make sure we don't redirect
    if (isConnected) {
      setShouldRedirect(false);
    }

    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
      clearTimeout(checkingTimer);
    };
  }, [isConnected]);

  // Handle the actual redirect
  useEffect(() => {
    if (shouldRedirect) {
      router.push('/');
    }
  }, [shouldRedirect, router]);

  // Show initial loading state
  if (isChecking) {
    return <div>Loading...</div>;
  }

  // Show connecting message while waiting
  if (!isConnected && !shouldRedirect) {
    return <div>Connecting to wallet...</div>;
  }

  // If connected or still within grace period, show the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 