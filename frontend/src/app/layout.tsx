import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/app/context/AuthContext"; // ✅ path sesuai

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
                {/* ✅ Semua route (site, auth, admin) dapat akses useAuth */}
                <AuthProvider>
                {children}
                </AuthProvider>
            </body>
        </html>
    );
}
