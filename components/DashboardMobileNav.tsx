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
    <div className='fixed right-4 bottom-10 flex flex-col gap-4 md:hidden z-50'>
      <Link href='/welcome'>
        <button
          className={`p-3 rounded-full bg-gray-700 text-gray-200 shadow-lg hover:scale-110 transition-all border-gray-300 border`}
        >
          <GoHomeFill className="text-xl" />
        </button>
      </Link>


      <button
        onClick={onShowDashboard}
        className={`p-3 rounded-full shadow-lg ${activeSection === 'dashboard'
          ? 'bg-purple-500 text-white'
          : 'bg-gray-700 text-gray-300'
          } hover:scale-110 transition-all border-gray-300 border`}
      >
        <RxDashboard className="text-xl" />
      </button>

    


      <button
        onClick={onShowContent}
        className={`p-3 rounded-full shadow-lg ${activeSection === 'content'
          ? 'bg-purple-500 text-white'
          : 'bg-gray-700 text-gray-300'
          } hover:scale-110 transition-all border-gray-300 border`}
      >
        <FaDatabase className="text-xl" />
      </button>

      <button
        onClick={onShowProfile}
        className={`p-3 rounded-full shadow-lg ${activeSection === 'profile'
          ? 'bg-purple-500 text-white'
          : 'bg-gray-700 text-gray-300'
          } hover:scale-110 transition-all border-gray-300 border`}
      >
        <RiProfileFill className="text-xl" />
      </button>

      <button
      onClick={handleDisconnect}
        className='p-3 rounded-full bg-gray-700 text-gray-300 shadow-lg hover:scale-110 transition-all border-gray-300 border'
      >
        <MdLogout className="text-xl" />
      </button>
    </div>
  );
};

export default DashboardMobileNav; 