// src/app/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// TIPE DATA PENGGUNA YANG DISESUAIKAN DENGAN SKEMA BARU
export interface User {
    id: number; // PRIMARY KEY
    email: string;
    role: 'ADMIN' | 'USER'; // Sesuai dengan CHECK (role IN (...))
    name: string | null;
    profile_picture: string | null;
    bio: string | null;
    subscription_status: 'NONE' | 'BASIC' | 'PREMIUM'; // Sesuai dengan ENUM
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean; // Tambahan untuk mempermudah pengecekan
    login: (userData: User) => void;
    logout: () => void;
    // Fungsi bantuan: memeriksa role pengguna
    isAdmin: () => boolean; 
    // Fungsi bantuan: memeriksa status langganan
    isSubscribed: () => boolean;
}

// Tambahkan isAuthenticated ke tipe konteks
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // Di inisialisasi sebagai null, akan diisi oleh fetch /me saat mount
    const [user, setUser] = useState<User | null>(null); 
    const [loading, setLoading] = useState(true); // Tambahkan state loading
    const router = useRouter();

    // Fungsi untuk memuat data pengguna saat aplikasi dimuat (menggunakan cookie/session)
    useEffect(() => {
        const checkAuthStatus = async () => {
            setLoading(true);
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const endpoint = `${apiUrl}/api/me`; 
            
            try {
                const response = await fetch(endpoint, {
                    method: 'GET',
                    credentials: 'include',
                });

                if (response.ok) {
                    const result = await response.json();
                    
                    // PERBAIKAN UTAMA: ENDPOINT /me MENGEMBALIKAN OBJEK USER LANGSUNG
                    // user = { id: 1, name: 'Saidi', ... }
                    setUser(result as User); // <-- Langsung set hasil JSON sebagai user
                    
                } else {
                    // Jika respons 401/404, artinya user tidak terautentikasi
                    setUser(null);
                }
            } catch (error) {
                // ... (error handling)
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);
    // CATATAN: Dengan penambahan useEffect ini, kita telah menambahkan fungsi auto-login melalui endpoint /me.
    // Ini adalah praktik umum untuk Next.js/React yang menggunakan cookies.

    const login = (userData: User) => {
        setUser(userData);
    };

    const logout = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            await fetch(`${apiUrl}/api/logout`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (error) {
            console.error('Failed to logout on server', error);
            // Tetap lanjutkan logout meskipun server gagal
        } finally {
            setUser(null);
            router.push('/login');
        }
    };

    // Fungsi bantuan untuk pengecekan role
    const isAdmin = () => {
        return user?.role === 'ADMIN';
    };

    // Fungsi bantuan untuk pengecekan status langganan (BASIC atau PREMIUM dianggap subscribed)
    const isSubscribed = () => {
        return user?.subscription_status === 'BASIC' || user?.subscription_status === 'PREMIUM';
    };

    // Objek value yang akan disediakan oleh Context
    const contextValue: AuthContextType = {
        user,
        isAuthenticated: !!user, // Menjadi true jika user tidak null
        login,
        logout,
        isAdmin,
        isSubscribed,
    };

    if (loading) {
        // Tampilkan Loading State atau spinner saat proses checkAuthStatus berjalan
        return <div>Loading Authentication...</div>;
        // ATAU return <LoadingScreen />;
    }

    return (
        <AuthContext.Provider value={contextValue}>
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