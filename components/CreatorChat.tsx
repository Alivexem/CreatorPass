'use client'
import React, { useState, useEffect, useRef } from 'react';
import { database, ref, push, onValue, query, orderByChild } from '@/utils/firebase';
import Image from 'next/image';
import { motion, AnimatePresence } from "framer-motion";
import { IoSend } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

interface Message {
  id: string;
  text: string;
  sender: string;
  timestamp: number;
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

const CreatorChat = ({ creatorAddress, userAddress, creatorProfile, onClose }: CreatorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const chatContainerRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const chatId = [creatorAddress, userAddress].sort().join('-');
    const messagesRef = ref(database, `chats/${chatId}/messages`);

    await push(messagesRef, {
      text: newMessage,
      sender: userAddress,
      timestamp: Date.now(),
    });

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
  };

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      className="fixed right-0 top-[100px] md:top-[250px] h-[80vh] w-full md:w-[400px] bg-[#1A1D1F] shadow-xl flex flex-col z-50"
    >
      {/* Header */}
      <div className="bg-purple-900 p-4 flex items-center justify-between">
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
            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === userAddress
                  ? 'bg-purple-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-white rounded-bl-none'
              }`}
            >
              <p>{message.text}</p>
              <p className="text-xs opacity-70 mt-1">
                {new Date(message.timestamp).toLocaleTimeString()}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <form onSubmit={sendMessage} className="p-4 bg-[#232629]">
        <div className="flex gap-2">
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
      </form>
    </motion.div>
  );
};

export default CreatorChat; 