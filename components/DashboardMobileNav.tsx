'use client'
import { RxDashboard } from "react-icons/rx";
import { FaDatabase } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";
import { GoHomeFill } from "react-icons/go";
import Link from "next/link";
import { MdLogout } from "react-icons/md";
// import { FaCircleDollarToSlot } from "react-icons/fa6";
import { useAppKit, useAppKitAccount, useDisconnect } from '../utils/reown';
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
    <div className='h-[80px] px-4 border-purple-600 border-t pt-3 box-border flex items-center justify-between w-full bg-black fixed bottom-0 text-white md:hidden z-50'>
      <Link href='/welcome'>
        <div className='flex flex-col cursor-pointer items-center space-y-2'>
          <GoHomeFill className="text-xl" />
          <p className='text-[0.7rem]'>Home</p>
        </div>
      </Link>

      <button
        onClick={onShowDashboard}
        className='flex flex-col items-center space-y-2'
      >
        <RxDashboard className={`text-xl ${activeSection === 'dashboard' ? 'text-purple-500' : ''}`} />
        <p className={`text-[0.7rem] ${activeSection === 'dashboard' ? 'text-purple-500' : ''}`}>Dashboard</p>
      </button>

      <button
        onClick={onShowContent}
        className='flex flex-col items-center space-y-2'
      >
        <FaDatabase className={`text-xl ${activeSection === 'content' ? 'text-purple-500' : ''}`} />
        <p className={`text-[0.7rem] ${activeSection === 'content' ? 'text-purple-500' : ''}`}>Content</p>
      </button>

      <button
        onClick={onShowProfile}
        className='flex flex-col items-center space-y-2'
      >
        <RiProfileFill className={`text-xl ${activeSection === 'profile' ? 'text-purple-500' : ''}`} />
        <p className={`text-[0.7rem] ${activeSection === 'profile' ? 'text-purple-500' : ''}`}>Profile</p>
      </button>

      <button
        onClick={handleDisconnect}
        className='flex flex-col items-center space-y-2'
      >
        <MdLogout className="text-xl" />
        <p className='text-[0.7rem]'>Logout</p>
      </button>
    </div>
  );
};

export default DashboardMobileNav; 