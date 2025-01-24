'use client'
import { usePathname } from 'next/navigation';
import MobileNav from './MobileNav';

export default function NavigationProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const hideNav = pathname === '/signup' || pathname === '/' || pathname.startsWith('/dashboard');

  return (
    <>
      {children}
      {!hideNav && <MobileNav />}
    </>
  );
} 