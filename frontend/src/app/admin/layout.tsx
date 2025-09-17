// src/app/(site)/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar"; // 🔹 import Header


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
        <div className="flex min-h-screen bg-gray-100">
            <AuthProvider>
            {/* Semua komponen di sini bisa pakai useAuth */}
                <Sidebar />
                <main className="flex-1 p-6">
                    {children}
                </main>
            </AuthProvider>
        </div>
    );
}
