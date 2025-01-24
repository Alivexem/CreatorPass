'use client'
import { usePathname } from 'next/navigation';
import MobileNav from './MobileNav';
import DashboardMobileNav from './DashboardMobileNav';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const isSignup = pathname === '/signup';

  return (
    <>
      {children}
      {!isSignup && (isDashboard ? <DashboardMobileNav /> : <MobileNav />)}
    </>
  );
} 