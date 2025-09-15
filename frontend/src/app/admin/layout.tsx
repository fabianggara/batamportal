<<<<<<< HEAD:frontend/src/app/admin/layout.tsx
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
=======
import { ReactNode } from "react";
import Link from "next/link";
import { Home, Building2, Users, FileText, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-gray-100 flex">
        {/* Sidebar Admin */}
        <aside className="w-64 bg-gray-900 text-white h-screen p-4 pt-10 space-y-6">
            {/* <h2 className="text-lg font-bold">Batam Portal Admin</h2> */}
            <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Home size={18} /> Dashboard
            </Link>
            <Link href="/admin/#" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Building2 size={18} /> Data Hotel
            </Link>
            <Link href="/admin/#" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Users size={18} /> Users
            </Link>
            <Link href="/admin/submissions" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <FileText size={18} /> Submissions
            </Link>
            <Link href="/admin/#" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Settings size={18} /> Settings
            </Link>
            </nav>
        </aside>

        {/* Konten Admin */}
        <main className="flex-1 p-6">{children}</main>
        </div>
>>>>>>> 84f8530d5fcaa8cf9cc39269389f2d0655192415:src/app/admin/layout.tsx
    );
}
