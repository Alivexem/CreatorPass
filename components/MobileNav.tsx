'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GoHomeFill } from "react-icons/go";
import { MdDashboardCustomize } from "react-icons/md";
import { IoTicketSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { useState, useRef, useEffect } from 'react';
import { IoMdMail } from "react-icons/io";
import Image from 'next/image';
import { ChatHistoryItem } from '@/types/chat'; // Add this type to your project if not exists

const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [personalChats, setPersonalChats] = useState<ChatHistoryItem[]>([]);
  const [isLoadingPersonalChats, setIsLoadingPersonalChats] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const searchRef = useRef<HTMLDivElement>(null);
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
      if (messagesRef.current && !messagesRef.current.contains(event.target as Node)) {
        setShowMessages(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchPersonalChats = async () => {
      const address = localStorage.getItem('address');
      if (!address) return;

      setIsLoadingPersonalChats(true);
      try {
        const res = await fetch(`/api/chat-history?address=${address}`);
        const data = await res.json();
        if (data.chatHistory) {
          setPersonalChats(data.chatHistory);
        }
      } catch (error) {
        console.error('Error fetching chats:', error);
      } finally {
        setIsLoadingPersonalChats(false);
      }
    };

    fetchPersonalChats();
  }, []);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => {
        setToast({ show: false, message: '' });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!searchTerm.trim()) return;

    try {
      const res = await fetch('/api/profiles');
      const data = await res.json();

      const foundUser = data.profiles.find((profile: any) =>
        profile.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.address.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (foundUser) {
        router.push(`/creators?highlight=${foundUser.address}`);
        setShowMobileSearch(false);
        setSearchTerm('');
      } else {
        setToast({ show: true, message: 'User not found' });
      }
    } catch (error) {
      console.error('Search error:', error);
      setToast({ show: true, message: 'Search failed' });
    }
  };

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

        <Link href='/dashboard'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <MdDashboardCustomize className={pathname === '/dashboard' ? 'text-purple-500' : ''} />
            <p className={`text-[0.7rem] ${pathname === '/dashboard' ? 'text-purple-500' : ''}`}>Dashboard</p>
          </div>
        </Link>

        <div className='flex cursor-pointer flex-col items-center space-y-2 relative' onClick={() => setShowMobileSearch(prev => !prev)}>
          <FiSearch className='text-xl' />
          <p className='text-[0.7rem]'>Search</p>
          {showMobileSearch && (
            <div ref={searchRef} className='absolute bottom-[80px] right-[5vw] bg-white p-4 rounded-lg items-center shadow-lg w-[300px] flex gap-2' onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search creators..."
                className="flex-1 p-2 border rounded-lg text-black"
              />
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleSearch();
                }}
                className="bg-purple-600 mr-[7vw] text-white px-4 py-2 rounded-lg"
              >
                <FiSearch />
              </button>
            </div>
          )}
        </div>

        {showMessages && (
          <div 
            ref={messagesRef}
            className='fixed bottom-[80px] left-0 right-0 mx-4 bg-[#1A1D1F] backdrop-blur-md rounded-[12px] text-white shadow-lg border-[3px] border-gray-400 max-h-[70vh] flex flex-col'
          >
            <div className='w-full flex justify-between items-center p-4'>
              <p className='text-[1.2rem] font-bold'>Messages</p>
              <span className='text-sm text-gray-400'>{personalChats.length} chats</span>
            </div>
            <div className='border-gray-500/30 border-t w-full flex flex-col space-y-2 overflow-auto max-h-[calc(70vh-80px)] p-4'>
              {isLoadingPersonalChats ? (
                <div className="flex justify-center items-center h-full">
                  <p className="text-gray-400 animate-pulse">Loading chats...</p>
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