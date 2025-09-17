// src/app/login/page.tsx
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const endpoint = `${apiUrl}/api/login`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Login berhasil! Mengalihkan...');
        const loggedInUser = result.user;

        if (!loggedInUser) {
          setMessage('Error: Data pengguna tidak ditemukan setelah login.');
          setIsLoading(false);
          return;
        }

        login(loggedInUser);

        if (loggedInUser.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        setMessage(`Error: ${result.error || 'Gagal memproses permintaan'}`);
      }
    } catch (error) {
      setMessage('Terjadi kesalahan. Silakan coba lagi.');
      console.error('Fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Welcome Section */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 p-12 items-center justify-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full"></div>
          <div className="absolute bottom-32 right-16 w-24 h-24 bg-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-white rounded-full"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-md">
          <h1 className="text-5xl font-bold mb-6">Selamat Datang!</h1>
          <p className="text-xl opacity-90 mb-8">
            Masuk ke BatamPortal dan temukan berbagai tempat menarik di Kota Batam
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Jelajahi destinasi wisata</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Temukan kuliner lezat</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Dapatkan rekomendasi terbaik</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md space-y-8">
          {/* Header */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Masuk ke Akun</h2>
            <p className="text-gray-600">Masukkan email dan password Anda</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg text-shadow-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="nama@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded- text-shadow-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Masukkan password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link 
                href="/login/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Lupa Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sedang Masuk...
                </>
              ) : (
                <>
                  Masuk
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          {/* Message */}
          {message && (
            <div className={`p-4 rounded-lg text-center text-sm ${
              message.includes('berhasil') 
                ? 'bg-green-50 text-green-700 border border-green-200' 
                : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message}
            </div>
          )}

          {/* Sign Up Link */}
          <div className="text-center pt-6 border-t border-gray-200">
            <p className="text-gray-600">
              Belum punya akun?{' '}
              <Link 
                href="/register" 
                className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>

          {/* Mobile Header for small screens */}
          <div className="lg:hidden text-center pt-8">
            <h1 className="text-2xl font-bold text-gray-900">BatamPortal</h1>
            <p className="text-gray-600 mt-2">Jelajahi keindahan Kota Batam</p>
          </div>
        </div>
      </div>
    </div>
  );
}