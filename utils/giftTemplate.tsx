import React from 'react';
import Image from 'next/image';

interface GiftCardTemplateProps {
  amount: string;
  sender: string;
  recipient: string;
}

export const GiftCardTemplate: React.FC<GiftCardTemplateProps> = ({
  amount,
  sender,
  recipient
}) => {
  return (
    <div className="w-[400px] h-[200px] bg-gradient-to-r from-purple-600 to-pink-600 p-6 flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-white text-2xl font-bold">Gift Card</h3>
          <p className="text-white/80">From: {sender}</p>
          <p className="text-white/80">To: {recipient}</p>
        </div>
        <Image
          src="/sol.png"
          alt="SOL"
          width={40}
          height={40}
          className="rounded-full"
        />
      </div>
      <div className="text-center">
        <p className="text-white text-4xl font-bold">{amount} SOL</p>
      </div>
      <div className="text-white/60 text-sm text-right">
        {new Date().toLocaleDateString()}
      </div>
    </div>
  );
};
