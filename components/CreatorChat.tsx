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

    // Check if user has a profile
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

    // Store complete user info with the message
    const messageData = {
      text: newMessage,
      sender: {
        address: userAddress,
        username: userProfile.username,
        profileImage: userProfile.profileImage || '/empProfile.png'
      },
      timestamp: Date.now()
    };

    try {
      await push(messagesRef, messageData);

      // Create notification for the recipient
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientAddress: creatorAddress,
          senderAddress: userAddress,
          senderName: userProfile.username,
          senderImage: userProfile.profileImage,
          message: newMessage,
          type: 'message'
        })
      });

      setNewMessage('');
    } catch (error) {
      console.error('Failed to send message or create notification:', error);
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

    setIsUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onloadend = async () => {
      try {
        const base64data = reader.result;
        const res = await fetch("/api/imageApi", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ data: base64data }),
        });

        if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
        const data = await res.json();
        
        // Send image message
        const messageData = {
          text: '',
          type: 'image',
          imageUrl: data.url,
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
        
        // Send gift message
        const messageData = {
          text: `Sent ${giftAmount} SOL`,
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
        className="md:fixed md:right-0 md:top-0 h-[89vh] w-full md:w-[500px] bg-[#1A1D1F] shadow-xl flex flex-col z-50"
        style={{
          height: isKeyboardVisible ? `calc(100vh - ${keyboardHeight}px)` : '89vh'
        }}
      >
        {/* Header */}
        <div className="bg-purple-900 p-4 mb-5 flex items-center justify-between">
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
                    src={message.sender.profileImage || '/empProfile.png'}
                    alt={message.sender.username}
                    width={24}
                    height={24}
                    className="rounded-full h-[24px] w-[24px] object-cover"
                  />
                  <span className="text-xs text-gray-400">{message.sender.username}</span>
                </div>
                <div className={`rounded-2xl px-4 py-2 ${
                  message.sender.address === userAddress
                    ? 'bg-blue-600 rounded-tr-none'
                    : 'bg-gray-700 rounded-tl-none'
                }`}>
                  <p className="text-white text-sm whitespace-pre-wrap break-words">
                    <span dangerouslySetInnerHTML={{ __html: wrapUrlsInLinks(message.text) }} />
                  </p>
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
          className={`p-4 bg-[#232629] transition-all duration-300 ${
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
              <h3 className="text-white text-xl font-bold mb-4">Send Gift</h3>
              <input
                type="number"
                value={giftAmount}
                onChange={(e) => setGiftAmount(e.target.value)}
                className="w-full bg-[#2A2D2F] text-white p-3 rounded-lg mb-4"
                placeholder="Amount in SOL"
                step="0.01"
                min="0"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleGift}
                  className="flex-1 bg-purple-600 text-white p-3 rounded-lg"
                >
                  Send Gift
                </button>
                <button
                  onClick={() => setShowGiftModal(false)}
                  className="flex-1 bg-gray-600 text-white p-3 rounded-lg"
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
      </motion.div>
    </>
  );
};

export default CreatorChat;