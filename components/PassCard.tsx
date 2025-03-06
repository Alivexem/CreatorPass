import React from 'react';
import { PassInfo } from './PassInfo';
import Image from 'next/image';
import { Pass } from '@/types/pass';

interface PassCardProps {
  pass: Pass;
  onMint?: () => void;
  loading?: boolean;
}

export const PassCard = ({ pass, onMint, loading }: PassCardProps) => {
  return (
    <div className="relative bg-gray-800 rounded-xl p-6 shadow-xl">
      <PassInfo rules={pass.rules} tier={pass.category} />
      
      {/* Pass Image */}
      <div className="relative h-48 w-full mb-4">
        <Image
          src={pass.imageUrl || '/default-pass.png'}
          alt={`${pass.category} Pass`}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      {/* Pass Details */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-white">
            {pass.category} Pass
          </h3>
          <span className="text-purple-400 font-mono">
            {pass.price} SOL
          </span>
        </div>

        {/* Creator Info */}
        <div className="flex items-center space-x-3">
          <Image
            src={pass.ownerImage || '/empProfile.png'}
            alt="Creator"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-gray-300 text-sm">
            {pass.ownerUsername}
          </span>
        </div>

        {/* Pass Stats */}
        <div className="flex justify-between text-sm text-gray-400">
          <span>{pass.mintCount} minted</span>
          {pass.expirationDays && (
            <span>Expires in {pass.expirationDays} days</span>
          )}
        </div>

        {/* Mint Button */}
        {onMint && (
          <button
            onClick={onMint}
            disabled={loading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Minting...' : 'Mint Pass'}
          </button>
        )}

        {/* Pass Tag */}
        {pass.cardTag && (
          <div className="absolute top-4 right-4 bg-purple-600 text-white px-3 py-1 rounded-full text-sm">
            {pass.cardTag}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassCard; 