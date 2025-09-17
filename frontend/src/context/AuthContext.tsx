// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';

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
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // API URL ambil dari .env atau fallback ke localhost
  const API = process.env.NEXT_PUBLIC_API_URL;

  // refresh session (cek apakah masih login)
  const refresh = async () => {
    try {
      const res = await fetch(`${API}/api/auth/me`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setUser(data || null);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Failed to refresh session", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

    useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // login ke backend
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // penting untuk cookie
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        await refresh(); // ambil ulang user setelah login
        return { success: true };
      }
      return { success: false, error: data?.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  };

  // logout user
  const logout = async () => {
    try {
      await fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (error) {
      console.error("Failed to logout on server", error);
    } finally {
      setUser(null);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refresh }}>
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