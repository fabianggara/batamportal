// src/app/(site)/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css"; // pastikan path sesuai
import { AuthProvider } from "@/app/context/AuthContext"; // pastikan path sesuai
import Header from "@/components/Header"; // 🔹 import Header

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
        {/* 🔹 Header global untuk site */}
        <Header />

        <main>{children}</main>
      </body>
    </html>
  );
}
