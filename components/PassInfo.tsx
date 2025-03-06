import React, { useState } from 'react';
import { FaInfoCircle } from "react-icons/fa";
import { Pass } from "@/types/pass";

interface PassInfoProps {
  rules: PassRule;
  tier: string;
}

export const PassInfo = ({ rules, tier }: PassInfoProps) => {
  const [showInfo, setShowInfo] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowInfo(true)}
        className="absolute top-4 right-16 text-white/70 hover:text-white"
      >
        <FaInfoCircle size={20} />
      </button>

      {showInfo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              {tier} Pass Rules
            </h3>
            <ul className="space-y-2 text-gray-300">
              {rules.canComment && <li>✓ Can comment on posts</li>}
              {rules.canLike && <li>✓ Can like posts</li>}
              {rules.canDownload && <li>✓ Can download content</li>}
              {rules.canChat && <li>✓ Can access private chat</li>}
              {rules.canViewExclusive && <li>✓ Can view exclusive content</li>}
              {rules.canGift && <li>✓ Can send gifts</li>}
            </ul>
            <button
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full bg-purple-600 text-white py-2 rounded-lg"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}; 