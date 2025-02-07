'use client'
import React, { useState, useEffect, useRef } from 'react';
import { getDatabase, ref, push, onValue, query, orderByChild, update } from 'firebase/database';
import { app } from '@/utils/firebase';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { IoSend } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";
import { BsEmojiSmile, BsReply } from 'react-icons/bs';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
  replyTo?: {
    id: string;
    text: string;
    sender: string;
  };
}

interface CreatorChatProps {
  creatorAddress: string;
  userAddress: string;
  creatorProfile: {
    username: string;
    profileImage: string;
  };
  onClose: () => void;
}

// Initialize database
const database = getDatabase(app);

const CreatorChat = ({ creatorAddress, userAddress, creatorProfile, onClose }: CreatorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const [showEmoji, setShowEmoji] = useState(false);
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [hoveredMessage, setHoveredMessage] = useState<string | null>(null);
  const [showOptions, setShowOptions] = useState<string | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
      }
    });

    return () => unsubscribe();
  }, [creatorAddress, userAddress]);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
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
      if (!showOptions) {
        setShowOptions(null);
      }
    }, 2000);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    const chatId = [creatorAddress, userAddress].sort().join('-');
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    const messageData = {
      text: newMessage,
      sender: userAddress,
      timestamp: Date.now(),
      ...(replyingTo && {
        replyTo: {
          id: replyingTo.id,
          text: replyingTo.text,
          sender: replyingTo.sender
        }
      })
    };

    await push(messagesRef, messageData);

    // Create notification for the recipient
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientAddress: creatorAddress,
          senderAddress: userAddress,
          senderName: 'You have a new message',
          message: newMessage,
          type: 'message'
        })
      });
    } catch (error) {
      console.error('Failed to create notification:', error);
    }

    setNewMessage('');
    setReplyingTo(null);
  };

  const onEmojiSelect = (emoji: any) => {
    setNewMessage(prev => prev + emoji.native);
    setShowEmoji(false);
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed right-0 top-0 md:top-[50px] md:h-[80vh] h-[85vh] w-full md:w-[400px] bg-[#1A1D1F] shadow-xl flex flex-col z-50"
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
            className={`flex ${message.sender === userAddress ? 'justify-end' : 'justify-start'}`}
          >
            <div className="relative">
              <button
                onClick={() => setReplyingTo(message)}
                className="absolute -top-8 right-0 p-1 bg-gray-700 rounded hover:bg-gray-600 opacity-0 group-hover:opacity-100"
              >
                <BsReply className="text-white" />
              </button>

              {message.replyTo && (
                <div className="text-sm text-gray-400 mb-1">
                  Replying to: {message.replyTo.text.substring(0, 30)}...
                </div>
              )}

              <div className={`max-w-[80%] p-5 rounded-md ${
                message.sender === userAddress
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-white rounded-bl-none'
              }`}>
                <p>{message.text}</p>
                <p className="text-xs opacity-70 mt-1">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-[#232629]">
        {replyingTo && (
          <div className="mb-2 p-2 bg-gray-700 rounded-lg flex justify-between items-center">
            <p className="text-sm text-gray-300">
              Replying to: {replyingTo.text.substring(0, 30)}...
            </p>
            <button
              onClick={() => setReplyingTo(null)}
              className="text-gray-400 hover:text-white"
            >
              <IoMdClose size={16} />
            </button>
          </div>
        )}
        
        <div className="flex gap-2 items-center">
          <button
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
          <div className="absolute bottom-20 right-4">
            <Picker
              data={data}
              onEmojiSelect={onEmojiSelect}
              theme="dark"
            />
          </div>
        )}
      </form>
    </motion.div>
  );
};

export default CreatorChat;