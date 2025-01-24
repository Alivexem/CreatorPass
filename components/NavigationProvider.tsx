'use client'
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import MobileNav from './MobileNav';
import DashboardMobileNav from './DashboardMobileNav';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');
  const hideNav = pathname === '/signup' || pathname === '/';
  const [activeSection, setActiveSection] = useState<'dashboard' | 'content' | 'profile'>('dashboard');

  const handleShowContent = () => setActiveSection('content');
  const handleShowDashboard = () => setActiveSection('dashboard');
  const handleShowProfile = () => setActiveSection('profile');

  return (
    <>
      {children}
      {!hideNav && (isDashboard ? (
        <DashboardMobileNav 
          onShowContent={handleShowContent}
          onShowDashboard={handleShowDashboard}
          onShowProfile={handleShowProfile}
          activeSection={activeSection}
        />
      ) : (
        <MobileNav />
      ))}
    </>
  );
} 