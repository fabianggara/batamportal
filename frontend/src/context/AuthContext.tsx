// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Perbarui tipe User untuk menyertakan id dan role
interface User {
  id: number; // atau string, sesuaikan dengan tipe data di DB Anda
  email: string;
  role: string;
  name: string;                // nama user
  profile_picture?: string;    // foto profil (nullable)
  bio?: string;                // bio (opsional)
}

interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  // Fungsi login sekarang menerima objek User yang lengkap
  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = async () => {
    try {
      // Panggil API untuk menghapus cookie di server
      await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
      console.error("Failed to logout on server", error);
    } finally {
      // Hapus state pengguna dari aplikasi dan arahkan ke halaman utama
      setUser(null);
      // Arahkan pengguna ke halaman utama atau login setelah logout
      window.location.href = '/login'; 
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