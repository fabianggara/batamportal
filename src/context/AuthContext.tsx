// src/context/AuthContext.tsx
'use client';

import React, { createContext, useState, useContext, ReactNode } from 'react';

// Tipe untuk data pengguna
interface User {
  email: string;
}

// Tipe untuk nilai context
interface AuthContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
}

// Membuat Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Membuat Provider (komponen yang akan membungkus aplikasi)
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook untuk mempermudah penggunaan context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};