import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ContextProvider from './context'
import MobileNav from '@/components/MobileNav';
import DashboardMobileNav from '@/components/DashboardMobileNav';
import { usePathname } from 'next/navigation';

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the weights you want to use
});

export const metadata: Metadata = {
  title: "CreatorPass",
  description: "A decentralized social platform that connects content creators to fans effortlessly",
};

function NavigationWrapper({ children }: { children: React.ReactNode }) {
  'use client'
  const pathname = usePathname();
  const isDashboard = pathname.startsWith('/dashboard');

  return (
    <>
      {children}
      {isDashboard ? <DashboardMobileNav /> : <MobileNav />}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} antialiased pb-[80px] md:pb-0`}>
        <ContextProvider>
          <NavigationWrapper>
            {children}
          </NavigationWrapper>
        </ContextProvider>
      </body>
    </html>
  );
}
