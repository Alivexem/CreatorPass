'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GoHomeFill } from "react-icons/go";
import { MdDashboardCustomize } from "react-icons/md";
import { IoTicketSharp } from "react-icons/io5";
import { FiSearch } from "react-icons/fi";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <div className='h-[80px] pt-3 box-border flex items-center justify-evenly w-full bg-slate-700 fixed bottom-0 text-white md:hidden z-50'>
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
    </div>
  );
};

export default MobileNav; 