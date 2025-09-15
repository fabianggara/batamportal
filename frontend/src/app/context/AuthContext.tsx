// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Untuk redirect yang lebih baik

// Perbarui tipe User untuk menyertakan id dan role
interface User {
    id: number; // atau string, sesuaikan dengan tipe data di DB Anda
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Fungsi login sekarang menerima objek User yang lengkap
    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
        // Panggil API logout di backend dengan URL absolut
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        await fetch(`${apiUrl}/api/logout`, {
            method: 'POST',
            credentials: 'include', // Jika menggunakan cookie
        });
        } catch (error) {
        console.error('Failed to logout on server', error);
        // Tetap lanjutkan logout meskipun server gagal
        } finally {
        // Hapus state pengguna dari aplikasi
        setUser(null);
        // Arahkan ke halaman login dengan Next.js router
        router.push('/login');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
        {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};