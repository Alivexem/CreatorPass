'use client'
import React, { useState, useEffect, useRef, ReactNode } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild, update } from 'firebase/database';
import { app } from '@/utils/firebase';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { IoSend } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BsEmojiSmile } from 'react-icons/bs';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import Toast from '@/components/Toast';
import { useRouter } from 'next/navigation';
import { FaImages } from "react-icons/fa6";
import { FaGift } from "react-icons/fa";
import { toPng } from 'html-to-image';
import { GiftCardTemplate } from '@/utils/giftTemplate'; // We'll create this next
import { useAppKit, useAppKitProvider, useAppKitAccount, Transaction, SystemProgram, PublicKey, Provider } from '../utils/reown';
import { useAppKitConnection } from '@reown/appkit-adapter-solana/react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

interface Profile {
  username: string;
  profileImage: string;
  address: string;
}

interface Message {
  id: string;
  text: string;
  sender: {
    address: string;
    username: string;
    profileImage: string;
  };
  timestamp: number;
  type?: 'text' | 'image' | 'gift';
  giftAmount?: number;
  imageUrl?: string;
}

interface CreatorChatProps {
  creatorAddress: string;
  userAddress: string;
  creatorProfile: {
    username: string;
    profileImage: string;
  };
  userProfile?: {
    username: string;
    profileImage: string;
  };
  onClose: () => void;
}

// Initialize database
const database = getDatabase(app);

const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;

const wrapUrlsInLinks = (text: string) => {
  return text.replace(urlPattern, (url) => {
    const href = url.startsWith('www.') ? `https://${url}` : url;
    return `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:underline">${url}</a>`;
  });
};

const CreatorChat = ({ creatorAddress, userAddress, creatorProfile, userProfile, onClose }: CreatorChatProps) => {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
  }>({ show: false, message: '', type: 'info' });
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showGiftModal, setShowGiftModal] = useState(false);
  const [giftAmount, setGiftAmount] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const giftCardRef = useRef<HTMLDivElement>(null);
  const { walletProvider } = useAppKitProvider<Provider>('solana');
  const { connection } = useAppKitConnection();
  const { isConnected } = useAppKitAccount();
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [showImagePreview, setShowImagePreview] = useState(false);
  const imageRef = useRef<HTMLImageElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [userProfiles, setUserProfiles] = useState<{[key: string]: Profile}>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiRef.current && 
        !emojiRef.current.contains(event.target as Node) &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node)
      ) {
        setShowEmoji(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    // Validate user profile immediately when component mounts
    if (!userProfile || !userProfile?.username || userProfile?.username === '') {
      setToast({
        show: true,
        message: 'Please create a profile first',
        type: 'warning'
      });
      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 2000);
      return;
    }

    const chatId = [creatorAddress, userAddress].sort().join('-');
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, data]: [string, any]) => ({
          id,
          ...data,
        }));
        setMessages(messagesList);

        // Store notifications in Firebase for unread messages
        const notificationsRef = ref(database, `notifications/${creatorAddress}`);
        messagesList.forEach(async (message) => {
          if (message.sender.address !== creatorAddress && !message.read) {
            await push(notificationsRef, {
              type: 'message',
              senderAddress: message.sender.address,
              message: message.text,
              timestamp: message.timestamp,
              read: false
            });
          }
        });
      }
    });

    return () => unsubscribe();
  }, [creatorAddress, userAddress, userProfile, router]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    // Detect keyboard visibility changes
    const initialHeight = window.innerHeight;
    
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      if (initialHeight > currentHeight) {
        // Keyboard is shown
        const difference = initialHeight - currentHeight;
        setKeyboardHeight(difference);
        setIsKeyboardVisible(true);
      } else {
        // Keyboard is hidden
        setKeyboardHeight(0);
        setIsKeyboardVisible(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchProfile = async (address: string) => {
      try {
        const res = await fetch(`/api/profile?address=${address}`);
        const data = await res.json();
        if (data.profile) {
          setUserProfiles(prev => ({
            ...prev,
            [address]: data.profile
          }));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    // Fetch profiles for all unique addresses in messages
    const uniqueAddresses = new Set(messages.map(msg => msg.sender.address));
    uniqueAddresses.forEach(address => {
      if (!userProfiles[address]) {
        fetchProfile(address);
      }
    });
  }, [messages]);

  const handleMouseEnter = (messageId: string) => {
    setHoveredMessage(messageId);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredMessage(null);
    }, 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    if (!userProfile?.username) {
        setToast({
            show: true,
            message: 'Please create a profile first',
            type: 'warning'
        });
        return;
    }

    const chatId = [creatorAddress, userAddress].sort().join('-');
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const chatHistoryRef = ref(database, `chatHistory`);

    const messageData = {
        text: newMessage,
        sender: {
            address: userAddress,
            username: userProfile.username,
            profileImage: userProfile.profileImage || '/empProfile.png'
        },
        participants: [userAddress, creatorAddress],
        timestamp: Date.now()
    };

    try {
        await push(messagesRef, messageData);

        const chatHistoryData = {
            lastMessage: newMessage,
            timestamp: Date.now(),
            participants: [userAddress, creatorAddress]
        };

        // Update chat history for both participants
        await update(ref(database, `chatHistory/${chatId}`), {
            ...chatHistoryData,
            recipientAddress: creatorAddress,
            username: creatorProfile.username,
            profileImage: creatorProfile.profileImage || '/empProfile.png'
        });

        setNewMessage('');
    } catch (error) {
        console.error('Failed to send message:', error);
        setToast({
            show: true,
            message: 'Failed to send message',
            type: 'error'
        });
    }
};

  const onEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
  };

  const linkifyText = (text: string): ReactNode[] => {
    const urlPattern = /(https?:\/\/[^\s]+)|(www\.[^\s]+)/g;
    const parts = text.split(urlPattern);
    
    return parts.map((part, i) => {
      if (part?.match(urlPattern)) {
        const url = part.startsWith('www.') ? `https://${part}` : part;
        return (
          <a 
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
            onClick={(e) => e.stopPropagation()}
          >
            {part}
          </a>
        );
      }
      return part;
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setImageSrc(reader.result as string);
      setShowImagePreview(true);
    };
    reader.readAsDataURL(file);
  };

  const sendImage = async () => {
    if (!imageSrc || !imageRef.current) return;

    setIsUploading(true);
    
    try {
      let base64data;
      
      if (crop) {
        // Create canvas for cropped image
        const canvas = document.createElement('canvas');
        const scaleX = imageRef.current.naturalWidth / imageRef.current.width;
        const scaleY = imageRef.current.naturalHeight / imageRef.current.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        if (!ctx) throw new Error('No 2d context');

        ctx.drawImage(
          imageRef.current,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
        base64data = canvas.toDataURL('image/jpeg');
      } else {
        // Use full image if no crop
        const canvas = document.createElement('canvas');
        canvas.width = imageRef.current.naturalWidth;
        canvas.height = imageRef.current.naturalHeight;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) throw new Error('No 2d context');
        
        ctx.drawImage(imageRef.current, 0, 0);
        base64data = canvas.toDataURL('image/jpeg');
      }

      const res = await fetch("/api/imageApi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: base64data }),
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      
      // Send image message with receiver info
      const messageData = {
        text: '',
        type: 'image',
        imageUrl: data.url,
        sender: {
          address: userAddress,
          username: userProfile?.username || 'Anonymous',
          profileImage: userProfile?.profileImage || '/empProfile.png'
        },
        receiver: {
          address: creatorAddress,
          username: creatorProfile.username,
          profileImage: creatorProfile.profileImage || '/empProfile.png'
        },
        participants: [userAddress, creatorAddress],
        timestamp: Date.now()
      };

      const chatId = [creatorAddress, userAddress].sort().join('-');
      const messagesRef = ref(database, `chats/${chatId}/messages`);
      await push(messagesRef, messageData);

      // Update chat history for both users
      const userChatHistoryRef = ref(database, `chatHistory/${userAddress}`);
      const creatorChatHistoryRef = ref(database, `chatHistory/${creatorAddress}`);

      const chatHistoryData = {
        lastMessage: 'Sent an image',
        timestamp: Date.now(),
        participants: [userAddress, creatorAddress]
      };

      // For user's chat history
      await update(userChatHistoryRef, {
        [chatId]: {
          ...chatHistoryData,
          recipientAddress: creatorAddress,
          username: creatorProfile.username,
          profileImage: creatorProfile.profileImage || '/empProfile.png'
        }
      });

      // For creator's chat history
      await update(creatorChatHistoryRef, {
        [chatId]: {
          ...chatHistoryData,
          recipientAddress: userAddress,
          username: userProfile?.username || 'Anonymous',
          profileImage: userProfile?.profileImage || '/empProfile.png'
        }
      });

      setShowImagePreview(false);
      setImageSrc(null);
      setCrop(undefined);
    } catch (error) {
      console.error('Error uploading image:', error);
      setToast({
        show: true,
        message: 'Failed to upload image',
        type: 'error'
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleGift = async () => {
    if (!giftAmount || parseFloat(giftAmount) <= 0) {
      setToast({
        show: true,
        message: 'Please enter a valid amount',
        type: 'error'
      });
      return;
    }

    try {
      if (!isConnected || !connection || !walletProvider) {
        throw new Error('Wallet not connected');
      }

      const lamports = Math.floor(parseFloat(giftAmount) * LAMPORTS_PER_SOL);
      const latestBlockhash = await connection.getLatestBlockhash();

      const transaction = new Transaction({
        feePayer: new PublicKey(userAddress),
        recentBlockhash: latestBlockhash.blockhash,
      }).add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(userAddress),
          toPubkey: new PublicKey(creatorAddress),
          lamports,
        })
      );

      const signature = await walletProvider.sendTransaction(transaction, connection);
      
      // Generate gift card image
      if (giftCardRef.current) {
        const giftImage = await toPng(giftCardRef.current);
        
        // Send gift message with updated text format
        const messageData = {
          text: `${userProfile?.username || 'Anonymous'} sent ${giftAmount} SOL`,
          type: 'gift',
          giftAmount: parseFloat(giftAmount),
          imageUrl: giftImage,
          sender: {
            address: userAddress,
            username: userProfile?.username || 'Anonymous',
            profileImage: userProfile?.profileImage || '/empProfile.png'
          },
          timestamp: Date.now()
        };

        const chatId = [creatorAddress, userAddress].sort().join('-');
        const messagesRef = ref(database, `chats/${chatId}/messages`);
        await push(messagesRef, messageData);
      }

      setGiftAmount('');
      setShowGiftModal(false);
      setToast({
        show: true,
        message: 'Gift sent successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Gift transaction failed:', error);
      setToast({
        show: true,
        message: error instanceof Error ? error.message : 'Failed to send gift',
        type: 'error'
      });
    }
  };

  return (
    <>
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ ...toast, show: false })}
        />
      )}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        className="md:fixed md:rounded-bl-xl md:right-0 md:top-0 h-[89vh] w-full md:w-[500px] bg-[#1A1D1F] shadow-xl flex flex-col z-50"
        style={{
          height: isKeyboardVisible ? `calc(100vh - ${keyboardHeight}px)` : '89vh'
        }}
      >
        {/* Header */}
        <div className="md:bg-purple-900 bg-gray-800 p-4 mb-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={creatorProfile.profileImage || '/empProfile.png'}
              alt="Creator"
              width={40}
              height={40}
              className="rounded-full h-[40px] w-[40px] object-cover"
            />
            <h3 className="text-white font-bold">{creatorProfile.username}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white"
          >
            <IoMdClose size={24} />
          </button>
        </div>

        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          style={{
            height: isKeyboardVisible ? `calc(100% - ${keyboardHeight}px)` : 'auto'
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              onMouseEnter={() => handleMouseEnter(message.id)}
              onMouseLeave={handleMouseLeave}
              className={`flex ${message.sender.address === userAddress ? 'justify-end' : 'justify-start'} group`}
            >
              <div className={`max-w-[70%] break-words ${
                message.sender.address === userAddress ? 'items-end' : 'items-start'
              }`}>
                <div className="flex items-center gap-2 mb-1">
                  <Image
                    src={userProfiles[message.sender.address]?.profileImage || '/empProfile.png'}
                    alt={userProfiles[message.sender.address]?.username || 'Anonymous'}
                    width={24}
                    height={24}
                    className="rounded-full h-[24px] w-[24px] object-cover"
                  />
                  <span className="text-xs text-gray-400">
                    {userProfiles[message.sender.address]?.username || 'Anonymous'}
                  </span>
                </div>
                <div className={`${
                  message.type === 'gift' 
                    ? 'bg-purple-700 bg-opacity-90 rounded-2xl px-4 py-2' 
                    : message.type === 'image'
                      ? 'p-0'
                      : message.sender.address === userAddress
                        ? 'bg-blue-600 rounded-2xl rounded-tr-none px-4 py-2'
                        : 'bg-gray-700 rounded-2xl rounded-tl-none px-4 py-2'
                }`}>
                  {message.type === 'image' ? (
                    <Image
                      src={message.imageUrl || ''}
                      alt="Shared image"
                      width={300}
                      height={200}
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() => setSelectedImage(message.imageUrl || '')}
                    />
                  ) : message.type === 'gift' ? (
                    <div className="flex flex-col items-center gap-2 py-2">
                      <FaGift className="text-purple-300" size={24} />
                      <p className="text-purple-200 text-lg font-semibold text-center">
                        {message.text}
                      </p>
                      {message.imageUrl && (
                        <Image
                          src={message.imageUrl}
                          alt="Gift card"
                          width={200}
                          height={100}
                          className="rounded-lg mt-2"
                        />
                      )}
                    </div>
                  ) : (
                    <p className="text-white text-sm whitespace-pre-wrap break-words">
                      <span dangerouslySetInnerHTML={{ __html: wrapUrlsInLinks(message.text) }} />
                    </p>
                  )}
                </div>
                <span className={`text-xs text-gray-400 mt-1 block ${
                  message.sender.address === userAddress ? 'text-right' : 'text-left'
                }`}>
                  {new Date(message.timestamp).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <form 
          ref={formRef}
          onSubmit={sendMessage} 
          className={`p-4 bg-[#232629] md:rounded-bl-xl transition-all duration-300 ${
            isKeyboardVisible ? 'fixed bottom-0 left-0 right-0 md:relative z-50' : ''
          }`}
          style={{
            transform: isKeyboardVisible ? `translateY(-${keyboardHeight}px)` : 'none'
          }}
        >
          <div className="flex gap-2 items-center">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="text-gray-400 hover:text-white"
            >
              <BsEmojiSmile size={20} />
            </button>

            <label className="text-gray-400 hover:text-white cursor-pointer">
              <FaImages size={20} />
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isUploading}
              />
            </label>

            <button
              type="button"
              onClick={() => setShowGiftModal(true)}
              className="text-gray-400 hover:text-white"
            >
              <FaGift size={20} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Type a message..."
            />
            
            <button
              type="submit"
              className="bg-purple-600 text-white p-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              <IoSend size={20} />
            </button>
          </div>

          {showEmoji && (
            <div ref={emojiRef} className="absolute bottom-20 right-4">
              <Picker
                data={data}
                onEmojiSelect={onEmojiSelect}
                theme="dark"
              />
            </div>
          )}
        </form>

        {/* Gift Modal */}
        {showGiftModal && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-[#1A1D1F] p-6 rounded-lg w-[90%] max-w-md">
              <h3 className="text-white text-xl font-bold mb-3">Send Gift</h3>
              <input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                className="w-full bg-[#2A2D2F] text-white p-2 rounded-lg mb-3"
                placeholder="Amount in SOL"
                step="0.01"
                min="0"
                disabled={isUploading}
              />
              <div className="flex gap-3">
                <button
                  onClick={handleGift}
                  disabled={isUploading || !giftAmount}
                  className="flex-1 bg-purple-600 text-white p-2 rounded-lg disabled:opacity-50"
                >
                  {isUploading ? 'Sending Gift...' : 'Send Gift'}
                </button>
                <button
                  onClick={() => setShowGiftModal(false)}
                  disabled={isUploading}
                  className="flex-1 bg-gray-600 text-white p-2 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden gift card template */}
        <div style={{ position: 'absolute', left: '-9999px' }} ref={giftCardRef}>
          <GiftCardTemplate
            amount={giftAmount}
            sender={userProfile?.username || 'Anonymous'}
            recipient={creatorProfile.username}
          />
        </div>

        {/* Image Preview Modal */}
        {showImagePreview && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50">
            <div className="bg-[#1A1D1F] p-6 rounded-lg w-[90%] max-w-2xl">
              <h3 className="text-white text-xl font-bold mb-4">Crop Image (Optional)</h3>
              <ReactCrop
                crop={crop}
                onChange={c => setCrop(c)}
                aspect={16/9}
              >
                <img
                  ref={imageRef}
                  src={imageSrc || ''}
                  alt="Preview"
                  className="max-w-full h-auto"
                />
              </ReactCrop>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={sendImage}
                  disabled={isUploading || !imageSrc}
                  className="flex-1 bg-purple-600 text-white p-3 rounded-lg disabled:opacity-50"
                >
                  {isUploading ? 'Uploading Image...' : 'Send'}
                </button>
                <button
                  onClick={() => {
                    setShowImagePreview(false);
                    setImageSrc(null);
                    setCrop(undefined);
                  }}
                  disabled={isUploading}
                  className="flex-1 bg-gray-600 text-white p-3 rounded-lg disabled:opacity-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Image Modal */}
        {selectedImage && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage}
                alt="Full size image"
                layout="contain"
                objectFit="contain"
                className="rounded-lg"
                onClick={(e) => e.stopPropagation()}
                width={1200}
                height={800}
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 text-white hover:text-gray-300"
              >
                <IoMdClose size={24} />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </>
  );
};

export default CreatorChat;