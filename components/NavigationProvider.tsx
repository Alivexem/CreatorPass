'use client'
import { usePathname } from 'next/navigation';
import MobileNav from './MobileNav';
import DashboardMobileNav from './DashboardMobileNav';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const hideNav = pathname === '/signup' || pathname === '/';

  return (
    <>
      {children}
      {!hideNav && (isDashboard ? <DashboardMobileNav /> : <MobileNav />)}
    </>
  );
} 