// src/app/(site)/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // pastikan path sesuai
import Sidebar from "@/components/Sidebar"; // 🔹 import Header

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Batam Portal",
    description: "Informasi seputar Batam",
    };

    export default function RootLayout({
    children,
    }: {
    children: React.ReactNode;
    }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <div className="flex min-h-screen bg-gray-100">
                    {/* Sidebar */}
                    <Sidebar />

                    {/* Content */}
                    <main className="flex-1 p-6">
                        {children}
                    </main>
                </div>
            </body>
        </html>
    );
}
