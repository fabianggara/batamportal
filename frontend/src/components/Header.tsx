'use client'

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Settings, User, LogIn, LogOut, ChevronDown, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Image from "next/image";

const Header = () => {
  const { user, logout } = useAuth();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      logout();
      setShowProfileDropdown(false);
    }
  };

  const handleNotificationClick = () => {
    console.log('Notifications clicked');
    setNotificationCount(0);
  };

  return (
    <div className="bg-white shadow-sm p-4 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Logo/Brand */}
        <Link href="/" className="flex items-center hover:opacity-80 transition-opacity">
          <h1 className="text-2xl font-bold text-gray-800">BatamPortal</h1>
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            // ================= TAMPILAN JIKA SUDAH LOGIN =================
            <>
              {/* Notifications */}
              <button 
                onClick={handleNotificationClick}
                className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Notifikasi"
              >
                <Bell className="w-6 h-6" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 animate-pulse">
                    {notificationCount > 99 ? '99+' : notificationCount}
                  </span>
                )}
              </button>

              {/* Settings */}
              <Link
                href="/settings"
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                title="Pengaturan"
              >
                <Settings className="w-6 h-6" />
              </Link>

              {/* Profile Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                  className="flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                >
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-medium text-gray-800">
                      {user.name || 'User'}
                    </span>
                    <span className="text-xs text-gray-500">{user.email}</span>
                  </div>
                  
                  {/* Avatar */}
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                    {user.profile_picture ? (
                      <Image 
                        src={user?.profile_picture || "/default-avatar.png"} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-white" />
                    )}
                  </div>
                  
                  <ChevronDown 
                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                      showProfileDropdown ? 'rotate-180' : ''
                    }`} 
                  />
                </button>

                {/* Dropdown Menu */}
                {showProfileDropdown && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                          {user.profile_picture ? (
                            <Image 
                              src={user?.profile_picture || "/default-avatar.png"} 
                              alt="Avatar" 
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <User className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-800">{user.name || 'User'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          <div className="text-xs text-green-600 font-medium">● Online</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Menu Items */}
                    <div className="py-2">
                      <Link 
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <User className="w-5 h-5 text-gray-500" />
                        <span>Profil Saya</span>
                      </Link>
                      
                      <Link 
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <Settings className="w-5 h-5 text-gray-500" />
                        <span>Pengaturan</span>
                      </Link>
                      
                      <Link 
                        href="/notifications"
                        className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 text-gray-700 transition-colors"
                        onClick={() => setShowProfileDropdown(false)}
                      >
                        <Bell className="w-5 h-5 text-gray-500" />
                        <span>Notifikasi</span>
                        {notificationCount > 0 && (
                          <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1">
                            {notificationCount}
                          </span>
                        )}
                      </Link>
                    </div>
                    
                    <hr className="my-2 border-gray-100" />
                    
                    {/* Logout */}
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 text-red-600 transition-colors"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            // ================= TAMPILAN JIKA BELUM LOGIN =================
            <div className="flex items-center gap-3">
              {/* Register Button */}
              <Link
                href="/register"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar</span>
              </Link>

              {/* Login Button */}
              <Link
                href="/login"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 shadow-md hover:shadow-lg transition-all duration-200"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Backdrop for dropdown */}
      {showProfileDropdown && (
        <div 
          className="fixed inset-0 z-40 bg-black/5"
          onClick={() => setShowProfileDropdown(false)}
        />
      )}
    </div>
  );
};

export default Header;