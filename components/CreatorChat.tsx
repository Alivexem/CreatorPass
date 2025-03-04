'use client'
import React, { useState, useEffect, useRef } from 'react';
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

interface MessageData {
  text: string;
  timestamp: number;
  read?: boolean;
  sender: {
    address: string;
    username: string;
    profileImage: string;
  };
}

interface Message extends MessageData {
  id: string;
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

const CreatorChat = ({ creatorAddress, userAddress, creatorProfile, userProfile, onClose }: CreatorChatProps) => {
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
    const chatId = [creatorAddress, userAddress].sort().join('-');
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const messagesQuery = query(messagesRef, orderByChild('timestamp'));

    const unsubscribe = onValue(messagesQuery, (snapshot) => {
      const messagesData = snapshot.val();
      if (messagesData) {
        const messagesList = Object.entries(messagesData).map(([id, data]) => ({
          id,
          ...(data as MessageData),
          read: (data as MessageData).read || false
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
  }, [creatorAddress, userAddress]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      const handleResize = () => {
        if (chatContainerRef.current && window.visualViewport) {
          chatContainerRef.current.style.height = `${window.visualViewport.height}px`;
        }
      };

      window.visualViewport.addEventListener('resize', handleResize);
      return () => window.visualViewport?.removeEventListener('resize', handleResize);
    }
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

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
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
                    {message.text}
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
        <form onSubmit={sendMessage} className="p-4 bg-[#232629]">
          <div className="flex gap-2 items-center">
            <button
              ref={emojiButtonRef}
              type="button"
              onClick={() => setShowEmoji(!showEmoji)}
              className="text-gray-400 hover:text-white"
            >
              <BsEmojiSmile size={20} />
            </button>
            
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="w-full bg-white/10 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-white/50 placeholder-white/50"
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
      </motion.div>
    </>
  );
};

export default CreatorChat;