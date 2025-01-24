'use client'
import { usePathname } from 'next/navigation';
import MobileNav from './MobileNav';
import DashboardMobileNav from './DashboardMobileNav';

export default function NavigationProvider({ 
  children, 
  onShowContent,
  onShowDashboard,
  onShowProfile,
  activeSection
}: { 
  children: React.ReactNode;
  onShowContent?: () => void;
  onShowDashboard?: () => void;
  onShowProfile?: () => void;
  activeSection?: 'dashboard' | 'content' | 'profile';
}) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const hideNav = pathname === '/signup' || pathname === '/';

  return (
    <>
      {children}
      {!hideNav && (isDashboard ? (
        <DashboardMobileNav 
          onShowContent={onShowContent!}
          onShowDashboard={onShowDashboard!}
          onShowProfile={onShowProfile!}
          activeSection={activeSection || 'dashboard'}
        />
      ) : (
        <MobileNav />
      ))}
    </>
  );
} 