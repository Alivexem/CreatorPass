'use client'
import { RxDashboard } from "react-icons/rx";
import { FaPlus } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";
import { GoHomeFill } from "react-icons/go";
import Link from "next/link";
import { MdLogout } from "react-icons/md";
import { useDisconnect } from '../utils/reown';
import { useRouter } from 'next/navigation';

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
  const { disconnect } = useDisconnect();
  const router = useRouter();
  const handleDisconnect = async () => {
    try {
      await disconnect();
      router.push('/');
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  return (
    <div className='h-[80px] px-4 border-purple-600 border-t pt-3 box-border flex items-center justify-between w-full bg-black pb-3 fixed bottom-0 text-white md:hidden z-50'>
      <Link href='/welcome'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <GoHomeFill className="text-gray-300" />
          <p className='text-[0.7rem]'>Home</p>
        </div>
      </Link>

      <div onClick={onShowDashboard} className='flex flex-col cursor-pointer items-center space-y-2'>
        <RxDashboard className={`${activeSection === 'dashboard' ? 'text-purple-500' : 'text-gray-300'}`} />
        <p className={`text-[0.7rem] ${activeSection === 'dashboard' ? 'text-purple-500' : ''}`}>NFT</p>
      </div>

      <div onClick={onShowContent} className='flex flex-col cursor-pointer items-center space-y-2'>
        <FaPlus className={`${activeSection === 'content' ? 'text-purple-500' : 'text-gray-300'}text-[1.3rem] `} />
        <p className={`text-[0.7rem] ${activeSection === 'content' ? 'text-purple-500' : ''}`}>Content</p>
      </div>

      <div onClick={onShowProfile} className='flex flex-col cursor-pointer items-center space-y-2'>
        <RiProfileFill className={`${activeSection === 'profile' ? 'text-purple-500' : 'text-gray-300'}`} />
        <p className={`text-[0.7rem] ${activeSection === 'profile' ? 'text-purple-500' : ''}`}>Profile</p>
      </div>

      <div onClick={handleDisconnect} className='flex flex-col cursor-pointer items-center space-y-2'>
        <MdLogout className="text-gray-300" />
        <p className='text-[0.7rem]'>Logout</p>
      </div>
    </div>
  );
};

export default DashboardMobileNav; 