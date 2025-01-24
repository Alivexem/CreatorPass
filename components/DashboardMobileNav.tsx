'use client'
import Link from 'next/link';
import { GoHomeFill } from "react-icons/go";
import { RxDashboard } from "react-icons/rx";
import { FaDatabase } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";

interface DashboardMobileNavProps {
  onShowContent: () => void;
  onShowDashboard: () => void;
  onShowProfile: () => void;
  activeSection: 'dashboard' | 'content' | 'profile';
}

const DashboardMobileNav = ({ 
  onShowContent, 
  onShowDashboard, 
  onShowProfile, 
  activeSection 
}: DashboardMobileNavProps) => {
  return (
    <div className='h-[80px] pt-3 box-border flex items-center justify-evenly w-full bg-black fixed bottom-0 text-white md:hidden z-50'>
      <Link href='/welcome'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <GoHomeFill className="text-xl" />
          <p className='text-[0.8rem]'>Home</p>
        </div>
      </Link>

      <div 
        className='flex flex-col cursor-pointer items-center space-y-2'
        onClick={onShowDashboard}
      >
        <RxDashboard className={`text-xl ${activeSection === 'dashboard' ? 'text-purple-500' : ''}`} />
        <p className={`text-[0.8rem] ${activeSection === 'dashboard' ? 'text-purple-500' : ''}`}>
          Overview
        </p>
      </div>

      <div 
        className='flex flex-col cursor-pointer items-center space-y-2'
        onClick={onShowContent}
      >
        <FaDatabase className={`text-xl ${activeSection === 'content' ? 'text-purple-500' : ''}`} />
        <p className={`text-[0.8rem] ${activeSection === 'content' ? 'text-purple-500' : ''}`}>
          Content
        </p>
      </div>

      <div 
        className='flex flex-col cursor-pointer items-center space-y-2'
        onClick={onShowProfile}
      >
        <RiProfileFill className={`text-xl ${activeSection === 'profile' ? 'text-purple-500' : ''}`} />
        <p className={`text-[0.8rem] ${activeSection === 'profile' ? 'text-purple-500' : ''}`}>
          Profile
        </p>
      </div>
    </div>
  );
};

export default DashboardMobileNav; 