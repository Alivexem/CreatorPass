'use client'
import { useState } from 'react';
import { IoMdClose } from "react-icons/io";
import { FaInfoCircle, FaImage, FaRegStar } from "react-icons/fa";
import { RiVipCrownLine } from "react-icons/ri";
import { BsTicketPerforated } from "react-icons/bs";
import { Switch } from '@headlessui/react';
import Image from 'next/image';

interface PassCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (passData: any) => void;
  profileImage: string;
  ownedPasses: ("Regular" | "Special" | "VIP")[]; // Add this line
}

interface PassRules {
  funForumAccess: boolean;
  likeCommentAccess: boolean;
  downloadAccess: boolean;
  giftAccess: boolean;
}

const defaultRules: PassRules = {
  funForumAccess: true,
  likeCommentAccess: true,
  downloadAccess: true,
  giftAccess: true
};

const PassCreateModal = ({ isOpen, onClose, onCreate, profileImage, ownedPasses }: PassCreateModalProps) => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [price, setPrice] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [useDefaultRules, setUseDefaultRules] = useState(true);
  const [rules, setRules] = useState<PassRules>(defaultRules);
  const [useProfileImage, setUseProfileImage] = useState(true);
  const [customImage, setCustomImage] = useState<string>('');
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    setUploading(true);

    reader.onloadend = async () => {
      const base64data = reader.result;

      try {
        const res = await fetch("/api/imageApi", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ data: base64data }),
        });

        if (!res.ok) {
          throw new Error(`Upload failed: ${res.status}`);
        }

        const data = await res.json();
        setCustomImage(data.url);
        setUseProfileImage(false);
      } catch (error) {
        console.error('Error uploading image:', error);
      } finally {
        setUploading(false);
      }
    };
  };

  const handleCreate = () => {
    if (!selectedType || !price || !message) return;
    
    onCreate({
      type: selectedType,
      price: parseFloat(price),
      message,
      rules: useDefaultRules ? defaultRules : rules,
      image: useProfileImage ? profileImage : customImage,
      createdAt: Date.now()
    });
    
    // Reset form
    setSelectedType(null);
    setPrice('');
    setMessage('');
    setUseDefaultRules(true);
    setRules(defaultRules);
    setCustomImage('');
    setUseProfileImage(true);
    onClose();
  };

  const isPassTypeOwned = (type: "Regular" | "Special" | "VIP") => {
    return ownedPasses.includes(type);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1A1D1F] -mt-[60px] md:-mt-[10px] rounded-xl w-full max-w-2xl md:max-h-[90vh] max-h-[80vh] flex flex-col relative">
        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Pass card creation</h2>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <IoMdClose size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleCreate} className="space-y-6">
            {!selectedType ? (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-white mb-6">Select Pass Type</h2>
                {["Regular", "Special", "VIP"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    disabled={isPassTypeOwned(type as "Regular" | "Special" | "VIP")}
                    className={`w-full p-4 border border-purple-600 rounded-lg bg-[#2A2D31] hover:bg-[#32363B] text-white transition-all flex items-center justify-center gap-3 ${
                      isPassTypeOwned(type as "Regular" | "Special" | "VIP") 
                        ? 'bg-gray-600 cursor-not-allowed opacity-50' 
                        : 'bg-purple-600 hover:bg-purple-700'
                    }`}
                  >
                    {type === "Regular" && <BsTicketPerforated size={20} />}
                    {type === "Special" && <FaRegStar size={20} />}
                    {type === "VIP" && <RiVipCrownLine size={20} />}
                    {type}
                    {isPassTypeOwned(type as "Regular" | "Special" | "VIP") && (
                      <span className="ml-2">⛔</span>
                    )}
                  </button>
                ))}

                <p className='text-white text-[0.8rem]'>A 20% platform-maintenance fee is deducted on every pass sale and the remaining 80% is sent to your wallet instantly.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-white">{selectedType} Pass</h2>
                
                {/* Image Selection */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Use Profile Image</span>
                    <Switch
                      checked={useProfileImage}
                      onChange={setUseProfileImage}
                      className={`${
                        useProfileImage ? 'bg-purple-600' : 'bg-gray-600'
                      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                    >
                      <span className={`${
                        useProfileImage ? 'translate-x-6' : 'translate-x-1'
                      } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                    </Switch>
                  </div>

                  {!useProfileImage && (
                    <div className="space-y-2">
                      <label className="text-gray-300 block">Custom Pass Image</label>
                      <div className="relative">
                        {customImage ? (
                          <div className="relative h-48 w-full mb-2">
                            <Image
                              src={customImage}
                              alt="Custom pass image"
                              fill
                              className="rounded-lg object-cover"
                            />
                          </div>
                        ) : null}
                        <label className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            className="hidden"
                          />
                          <FaImage className="text-gray-400 mr-2" />
                          <span className="text-gray-400">
                            {uploading ? 'Uploading...' : 'Upload Image'}
                          </span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-gray-300 block mb-2">Price (SOL)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-3 rounded-lg bg-[#2A2D2F] text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter price in SOL"
                  />
                </div>

                <div>
                  <label className="text-gray-300 block mb-2">Pass Message</label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    maxLength={30}
                    rows={2}
                    className="w-full p-3 rounded-lg bg-[#2A2D2F] text-white border border-gray-600 focus:border-purple-500 focus:outline-none"
                    placeholder="Enter pass message (max 30 words)"
                  />
                </div>

                {/* Rules Section */}
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Use Default Rules</span>
                  <Switch
                    checked={useDefaultRules}
                    onChange={setUseDefaultRules}
                    className={`${
                      useDefaultRules ? 'bg-purple-600' : 'bg-gray-600'
                    } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                  >
                    <span className={`${
                      useDefaultRules ? 'translate-x-6' : 'translate-x-1'
                    } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                  </Switch>
                </div>

                {!useDefaultRules && (
                  <div className="space-y-4">
                    <h3 className="text-white font-semibold">Custom Rules</h3>
                    {Object.entries(rules).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <span className="text-gray-300">
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </span>
                        <Switch
                          checked={value}
                          onChange={(checked) => setRules(prev => ({ ...prev, [key]: checked }))}
                          className={`${
                            value ? 'bg-purple-600' : 'bg-gray-600'
                          } relative inline-flex h-6 w-11 items-center rounded-full transition-colors`}
                        >
                          <span className={`${
                            value ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}/>
                        </Switch>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-800 flex justify-between items-center">
          <button
            type="button"
            onClick={selectedType ? () => setSelectedType(null) : onClose}
            className="px-4 py-2 text-gray-400 hover:text-white"
          >
            {selectedType ? 'Back' : 'Cancel'}
          </button>
          {selectedType && (
            <button
              onClick={handleCreate}
              disabled={!price || !message}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white rounded-lg hover:from-purple-700 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Pass
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PassCreateModal;