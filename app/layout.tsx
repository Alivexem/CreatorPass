import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ContextProvider from './context'
import NavigationProvider from '@/components/NavigationProvider';

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the weights you want to use
});

export const metadata: Metadata = {
  title: "CreatorPass",
  description: "A decentralized social platform that connects content creators to fans effortlessly",
  icons: {
    icon: '/purpleLogo.png',
    apple: '/purpleLogo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta 
          name="viewport" 
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" 
        />
      </head>
      <body className={`${kanit.variable} antialiased`}>
        <ContextProvider>
          <NavigationProvider>
            {children}
          </NavigationProvider>
        </ContextProvider>
      </body>
    </html>
  );
}
