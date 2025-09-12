// src/components/Header.tsx
'use client'

import React from 'react';
import { User, LogIn, LogOut } from 'lucide-react'; // Removed unused icons
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

const Header = () => {
  const { user, logout } = useAuth();

  // 1. Buat fungsi handler baru untuk logout
  const handleLogout = () => {
    // 2. Tampilkan dialog konfirmasi dari browser
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      // 3. Jika pengguna menekan "OK", jalankan fungsi logout
      logout();
    }
  };

  return (
    <div className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">BatamPortal</h1>
        
        <div className="flex items-center gap-4">
          {user ? (
            // TAMPILAN JIKA SUDAH LOGIN
            <>
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-medium text-gray-800">Selamat Datang</span>
                  <span className="text-xs text-gray-500">{user.email}</span>
                </div>
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>
              {/* 4. Panggil fungsi handler baru di tombol logout */}
              <button onClick={handleLogout} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full">
                <LogOut className="w-6 h-6" />
              </button>
            </>
          ) : (
            // TAMPILAN JIKA BELUM LOGIN
            <Link href="/login" className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600">
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;