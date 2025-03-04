import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa';

interface PassGateCheckProps {
  creatorAddress: string;
  userAddress: string;
  onAccessGranted: () => void;
}

export const PassGateCheck = ({ creatorAddress, userAddress, onAccessGranted }: PassGateCheckProps) => {
  const [loading, setLoading] = useState(true);
  const [accessStatus, setAccessStatus] = useState<{
    hasPass: boolean;
    passCategories: string[];
    hasFreeContent: boolean;
  }>({ hasPass: false, passCategories: [], hasFreeContent: false });

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/passes/check?creator=${creatorAddress}&user=${userAddress}`);
        const data = await res.json();
        setAccessStatus(data);
        if (data.hasPass) {
          onAccessGranted();
        }
      } catch (error) {
        console.error('Error checking access:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [creatorAddress, userAddress]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl p-6 text-center"
    >
      <div className="mb-6">
        <FaLock className="text-4xl text-purple-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Content Locked</h2>
        <p className="text-gray-300">
          {accessStatus.hasFreeContent 
            ? "This creator has some free content available!"
            : "You need a pass to view this content"}
        </p>
      </div>

      <div className="space-y-4">
        {accessStatus.hasFreeContent && (
          <button
            onClick={onAccessGranted}
            className="w-full bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            View Free Content
          </button>
        )}

        <Link href={`/passes?creator=${creatorAddress}`}>
          <button className="w-full bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors">
            Get Creator Pass
          </button>
        </Link>
      </div>
    </motion.div>
  );
}; 