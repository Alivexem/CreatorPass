'use client'
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RxDashboard } from "react-icons/rx";
import { FaDatabase } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";
import { IoSettingsOutline } from "react-icons/io5";

const DashboardMobileNav = () => {
  const pathname = usePathname();
  const isDashboardSection = (section: string) => pathname.includes(section);

  return (
    <div className='h-[80px] pt-3 box-border flex items-center justify-evenly w-full bg-slate-700 fixed bottom-0 text-white md:hidden z-50'>
      <Link href='/dashboard'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <RxDashboard className={`text-xl ${!isDashboardSection('profile') && !isDashboardSection('content') ? 'text-purple-500' : ''}`} />
          <p className={`text-[0.8rem] ${!isDashboardSection('profile') && !isDashboardSection('content') ? 'text-purple-500' : ''}`}>
            Overview
          </p>
        </div>
      </Link>

      <Link href='/dashboard/content'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <FaDatabase className={`text-xl ${isDashboardSection('content') ? 'text-purple-500' : ''}`} />
          <p className={`text-[0.8rem] ${isDashboardSection('content') ? 'text-purple-500' : ''}`}>
            Content
          </p>
        </div>
      </Link>

      <Link href='/dashboard/profile'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <RiProfileFill className={`text-xl ${isDashboardSection('profile') ? 'text-purple-500' : ''}`} />
          <p className={`text-[0.8rem] ${isDashboardSection('profile') ? 'text-purple-500' : ''}`}>
            Profile
          </p>
        </div>
      </Link>

      <Link href='/dashboard/settings'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <IoSettingsOutline className={`text-xl ${isDashboardSection('settings') ? 'text-purple-500' : ''}`} />
          <p className={`text-[0.8rem] ${isDashboardSection('settings') ? 'text-purple-500' : ''}`}>
            Settings
          </p>
        </div>
      </Link>
    </div>
  );
};

export default DashboardMobileNav; 