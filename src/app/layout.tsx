import type { Metadata } from 'next';
// 1. Impor font 'Inter' dari next/font/google
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

// 2. Inisialisasi font dan muat subset yang dibutuhkan
const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Batam Portal',
  description: 'Informasi seputar Batam',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}