// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar'; // <-- 1. Impor komponen Navbar di sini

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Batam Portal',
  description: 'Informasi seputar Batam',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> {/* <-- 2. Letakkan komponen Navbar di sini */}
        <main>{children}</main>
      </body>
    </html>
  );
}