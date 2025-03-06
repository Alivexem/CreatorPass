'use client'
import React, { useState } from 'react';
import NavBar from '@/components/NavBar';
// import { Pass, PassRules } from '@/types/pass';

interface PassRule {
  canComment: boolean;
  canLike: boolean;
  canDownload: boolean;
  canChat: boolean;
  canViewExclusive: boolean;
  canGift: boolean;
}

const PassesPage = () => {
  const [passRules, setPassRules] = useState<PassRule>({
    canComment: false,
    canLike: false,
    canDownload: false,
    canChat: false,
    canViewExclusive: false,
    canGift: false,
  });

  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<'Bronze' | 'Silver' | 'Gold'>('Bronze');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Add your pass creation logic here
  };

  return (
    <div className="min-h-screen bg-black">
      <NavBar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-white mb-8">Create New Pass</h1>
        
        <form onSubmit={handleSubmit} className="max-w-2xl">
          {/* Pass Details */}
          <div className="bg-gray-800 p-6 rounded-lg mb-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as 'Bronze' | 'Silver' | 'Gold')}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                >
                  <option value="Bronze">Bronze</option>
                  <option value="Silver">Silver</option>
                  <option value="Gold">Gold</option>
                </select>
              </div>
              
              <div>
                <label className="block text-white mb-2">Price (SOL)</label>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded px-3 py-2"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Pass Rules */}
          <div className="space-y-4 mt-4 p-4 bg-gray-800 rounded-lg">
            <h3 className="text-white font-semibold mb-2">Pass Rules</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passRules.canComment}
                  onChange={(e) => setPassRules(prev => ({...prev, canComment: e.target.checked}))}
                  className="form-checkbox text-purple-600"
                />
                <span className="text-gray-300">Can Comment</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passRules.canLike}
                  onChange={(e) => setPassRules(prev => ({...prev, canLike: e.target.checked}))}
                  className="form-checkbox text-purple-600"
                />
                <span className="text-gray-300">Can Like</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passRules.canDownload}
                  onChange={(e) => setPassRules(prev => ({...prev, canDownload: e.target.checked}))}
                  className="form-checkbox text-purple-600"
                />
                <span className="text-gray-300">Can Download</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passRules.canChat}
                  onChange={(e) => setPassRules(prev => ({...prev, canChat: e.target.checked}))}
                  className="form-checkbox text-purple-600"
                />
                <span className="text-gray-300">Can Chat</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passRules.canViewExclusive}
                  onChange={(e) => setPassRules(prev => ({...prev, canViewExclusive: e.target.checked}))}
                  className="form-checkbox text-purple-600"
                />
                <span className="text-gray-300">View Exclusive Content</span>
              </label>
              
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={passRules.canGift}
                  onChange={(e) => setPassRules(prev => ({...prev, canGift: e.target.checked}))}
                  className="form-checkbox text-purple-600"
                />
                <span className="text-gray-300">Can Gift</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating Pass...' : 'Create Pass'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PassesPage; 