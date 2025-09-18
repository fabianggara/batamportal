// frontend/src/context/AuthContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

// Definisikan tipe untuk objek user
interface User {
    id: number;
    email: string;
    name?: string; // name bisa jadi tidak ada
    role: string;
    profile_picture?: string;
}

interface AuthContextType {
    user: User | null;
    login: (userData: User) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Fungsi login: simpan data user ke state
    const login = (userData: User) => {
        setUser(userData);
    };

    // Fungsi logout: panggil API logout, hapus state, lalu redirect
    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL;
            await fetch(`${apiUrl}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            setUser(null); // Hapus data user dari state
            router.push('/login'); // Arahkan ke halaman login
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