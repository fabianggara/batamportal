// src/app/(site)/layout.tsx
import type { Metadata } from "next";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";


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
        <AuthProvider>
        {/* Semua komponen di sini bisa pakai useAuth */}
            <Header />
            <main>
                {children}
            </main>
        </AuthProvider>
    );
}
