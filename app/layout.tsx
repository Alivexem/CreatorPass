import type { Metadata } from "next";
import { Kanit } from "next/font/google";
import "./globals.css";
import ContextProvider from './context'

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["latin"],
  weight: ["400", "700"], // Specify the weights you want to use
});

export const metadata: Metadata = {
  title: "CreatorPass",
  description: "A decentralized social platform that connects content creators to fans effortlessly",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${kanit.variable} antialiased`}>
        <ContextProvider>{children}</ContextProvider>
      </body>
    </html>
  );
}
