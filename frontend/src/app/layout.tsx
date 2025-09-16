// src/app/layout.tsx

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from './context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Batam Portal',
    description: 'Informasi seputar Batam',
    };

    export default function SiteLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
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