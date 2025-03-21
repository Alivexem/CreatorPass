'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GoHomeFill } from "react-icons/go";
import { MdDashboardCustomize } from "react-icons/md";
import { IoTicketSharp } from "react-icons/io5";
import { useState, useRef, useEffect } from 'react';
import { IoMdMail } from "react-icons/io";
import Image from 'next/image';
import { IoIosCompass } from "react-icons/io";
import { ChatHistoryItem } from '@/types/chat'; // Add this type to your project if not exists
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '../utils/firebase'; // Make sure to import your Firebase app
import { BiLoaderAlt } from "react-icons/bi"; // Add this import

const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [showMessages, setShowMessages] = useState(false);
  const [personalChats, setPersonalChats] = useState<ChatHistoryItem[]>([]);
  const [isLoadingPersonalChats, setIsLoadingPersonalChats] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const messagesRef = useRef<HTMLDivElement>(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {

      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const address = localStorage.getItem('address');
    if (!address) return;

    const db = getDatabase(app);
    const chatHistoryRef = ref(db, 'chatHistory');

    setIsLoadingMessages(true);
    const unsubscribe = onValue(chatHistoryRef, (snapshot) => {
        const chatHistory = snapshot.val();
        if (chatHistory) {
            const personalChatsArray = Object.entries(chatHistory)
                .filter(([chatId]) => {
                    const [addr1, addr2] = chatId.split('-');
                    return addr1 === address || addr2 === address;
                })
                .map(([chatId, data]: [string, any]) => {
                    const [addr1, addr2] = chatId.split('-');
                    const isUser1 = addr1 === address;
                    return {
                        id: chatId,
                        recipientAddress: isUser1 ? addr2 : addr1,
                        username: data.username || 'Anonymous',
                        profileImage: data.profileImage || '/empProfile.png',
                        lastMessage: data.lastMessage || '',
                        timestamp: data.timestamp || Date.now()
                    };
                })
                .sort((a, b) => b.timestamp - a.timestamp);

            setPersonalChats(personalChatsArray);
        }
        setIsLoadingMessages(false);
    });

    return () => unsubscribe();
}, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  return (
    <>
      {toast.show && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg z-50 animate-fade-in-out">
          {toast.message}
        </div>
      )}

      <div className='h-[80px] px-4 border-purple-600 border-t pt-3 box-border flex items-center justify-between w-full bg-black fixed bottom-0 text-white md:hidden z-50'>
        <Link href='/welcome'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <GoHomeFill className={pathname === '/welcome' ? 'text-purple-500' : ''} />
            <p className={`text-[0.7rem] ${pathname === '/welcome' ? 'text-purple-500' : ''}`}>Home</p>
          </div>
        </Link>

        <Link href='/creators'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <IoTicketSharp className={pathname === '/creators' ? 'text-purple-500' : ''} />
            <p className={`text-[0.7rem] ${pathname === '/creators' ? 'text-purple-500' : ''}`}>Creators</p>
          </div>
        </Link>

        <div className='flex flex-col cursor-pointer items-center space-y-2' onClick={() => setShowMessages(prev => !prev)}>
          <IoMdMail className={showMessages ? 'text-purple-500' : ''} />
          <p className={`text-[0.7rem] ${showMessages ? 'text-purple-500' : ''}`}>Messages</p>
        </div>

        <Link href='/feed' className={pathname === '/feed' ? 'text-purple-500' : ''}>
          <div className='flex cursor-pointer flex-col items-center space-y-2 relative'>
            <IoIosCompass className='text-xl' />
            <p className={`text-[0.7rem] ${pathname === '/feed' ? 'text-purple-500' : ''}`}>Feed</p>
          </div>
        </Link>

        <Link href='/dashboard'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <MdDashboardCustomize className={pathname === '/dashboard' ? 'text-purple-500' : ''} />
            <p className={`text-[0.7rem] ${pathname === '/dashboard' ? 'text-purple-500' : ''}`}>Dashboard</p>
          </div>
        </Link>

        {showMessages && (
          <div
            ref={messagesRef}
            className='fixed bottom-[80px] left-0 right-0 mx-4 bg-[#1A1D1F] backdrop-blur-md rounded-tr-[12px] rounded-tl-[12px] text-white shadow-lg border-t border-l border-r border-purple-600 max-h-[70vh] flex flex-col'
          >
            <div className='w-full flex justify-between items-center p-4'>
              <p className='text-[1.2rem] font-bold'>Messages</p>
              <span className='text-sm text-gray-400'>{personalChats.length} chats</span>
            </div>
            <div className='border-gray-500/30 border-t w-full flex flex-col space-y-2 overflow-auto max-h-[calc(70vh-80px)] p-4'>
              {isLoadingMessages ? (
                <div className="flex justify-center items-center py-8">
                  <BiLoaderAlt className="w-8 h-8 text-purple-500 animate-spin" />
                </div>
              ) : personalChats.length > 0 ? (
                personalChats.map((chat) => (
                  <Link
                    key={chat.id}
                    href={`/creators?highlight=${chat.recipientAddress}`}
                    className='flex items-center gap-x-3 cursor-pointer hover:bg-purple-900/20 p-3 rounded-lg transition-all'
                    onClick={() => setShowMessages(false)}
                  >
                    <div className='relative'>
                      <Image
                        width={45}
                        height={45}
                        alt='profilePic'
                        src={chat.profileImage}
                        className='rounded-full h-[45px] w-[45px] object-cover'
                      />
                      <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#1A1D1F]'></div>
                    </div>
                    <div className='flex-1 min-w-0'>
                      <div className='flex justify-between items-start'>
                        <p className='font-semibold truncate'>{chat.username}</p>
                        <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                          {new Date(chat.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className='text-sm text-gray-400 truncate'>
                        {chat.lastMessage}
                      </p>
                    </div>
                  </Link>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full space-y-4 py-8">
                  <p className='text-center text-gray-400'>No messages yet</p>
                  <Link
                    href="/creators"
                    className="text-purple-500 hover:text-purple-400 text-sm flex items-center gap-2"
                    onClick={() => setShowMessages(false)}
                  >
                    <span>Find creators to chat with</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MobileNav;