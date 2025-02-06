'use client'
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { GoHomeFill } from "react-icons/go";
import { MdDashboardCustomize } from "react-icons/md";
import { IoTicketSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";
import { useState, useRef, useEffect } from 'react';

const MobileNav = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      
      <div className='h-[80px] pt-3 box-border flex items-center justify-evenly w-full bg-black fixed bottom-0 text-white md:hidden z-50'>
        <Link href='/welcome'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <GoHomeFill className={pathname === '/welcome' ? 'text-purple-500' : ''} />
            <p className={`text-[0.8rem] ${pathname === '/welcome' ? 'text-purple-500' : ''}`}>Home</p>
          </div>
        </Link>

        <Link href='/creators'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <IoTicketSharp className={pathname === '/creators' ? 'text-purple-500' : ''} />
            <p className={`text-[0.8rem] ${pathname === '/creators' ? 'text-purple-500' : ''}`}>Creators</p>
          </div>
        </Link>

        <Link href='/dashboard'>
          <div className='flex flex-col cursor-pointer items-center space-y-2'>
            <MdDashboardCustomize className={pathname === '/dashboard' ? 'text-purple-500' : ''} />
            <p className={`text-[0.8rem] ${pathname === '/dashboard' ? 'text-purple-500' : ''}`}>Dashboard</p>
          </div>
        </Link>

        <div className='flex cursor-pointer flex-col items-center space-y-2 relative' onClick={() => setShowMobileSearch(prev => !prev)}>
          <FiSearch className='text-xl' />
          <p className='text-[0.8rem]'>Search</p>
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
      </div>
    </>
  );
};

export default MobileNav; 