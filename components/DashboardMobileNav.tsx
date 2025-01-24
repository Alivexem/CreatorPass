'use client'
import { RxDashboard } from "react-icons/rx";
import { FaDatabase } from "react-icons/fa";
import { RiProfileFill } from "react-icons/ri";
import { GoHomeFill } from "react-icons/go";
import Link from "next/link";
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
    <div className='fixed right-4 bottom-20 flex flex-col gap-4 md:hidden z-50'>
      <Link href='/welcome'>
      <button  
        className={`p-3 rounded-full shadow-lg hover:scale-110 transition-all`}
      >
        <GoHomeFill className="text-xl" />
      </button>
      </Link>


      <button
        onClick={onShowDashboard}
        className={`p-3 rounded-full shadow-lg ${
          activeSection === 'dashboard' 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-800 text-gray-300'
        } hover:scale-110 transition-all`}
      >
        <RxDashboard className="text-xl" />
      </button>

      <button
        onClick={onShowContent}
        className={`p-3 rounded-full shadow-lg ${
          activeSection === 'content' 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-800 text-gray-300'
        } hover:scale-110 transition-all`}
      >
        <FaDatabase className="text-xl" />
      </button>

      <button
        onClick={onShowProfile}
        className={`p-3 rounded-full shadow-lg ${
          activeSection === 'profile' 
            ? 'bg-purple-500 text-white' 
            : 'bg-gray-800 text-gray-300'
        } hover:scale-110 transition-all`}
      >
        <RiProfileFill className="text-xl" />
      </button>
    </div>
  );
};

export default DashboardMobileNav; 