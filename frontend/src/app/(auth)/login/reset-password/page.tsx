'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';

// Komponen utama yang akan di-render
function ResetPasswordComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);

  // Jika tidak ada token di URL, beri tahu pengguna
  useEffect(() => {
    if (!token) {
      setMessage({ text: 'Token tidak ditemukan atau tidak valid.', type: 'error' });
    }
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // 1. Validasi Sederhana di Frontend
    if (password !== confirmPassword) {
      setMessage({ text: 'Password tidak cocok.', type: 'error' });
      return;
    }
    if (!token) {
      setMessage({ text: 'Token reset tidak ditemukan.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 2. Kirim Permintaan ke Backend
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/password/reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const result = await response.json();

      // 3. Tampilkan Pesan Sukses atau Error
      if (response.ok) {
        setMessage({ text: result.message, type: 'success' });
        // Redirect ke halaman login setelah beberapa detik
        setTimeout(() => {
          router.push('/login');
        }, 3000);
      } else {
        setMessage({ text: result.error, type: 'error' });
      }

    } catch (error) {
      setMessage({ text: 'Terjadi kesalahan. Silakan coba lagi.', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center">Reset Password Anda</h1>
        
        {/* Form hanya ditampilkan jika ada token */}
        {token ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password">Password Baru</label>
              <input
                type="password" id="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
                required
              />
            </div>
            <div>
              <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
              <input
                type="password" id="confirmPassword" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 mt-1 border rounded-md"
                required
              />
            </div>
            {message.text && (
              <p className={`text-sm text-center ${
                  message.type === 'success' ? 'text-green-600' : 'text-red-600'
              }`}>
                {message.text}
              </p>
            )}
            <button
              type="submit" disabled={isLoading}
              className="w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400"
            >
              {isLoading ? 'Menyimpan...' : 'Reset Password'}
            </button>
          </form>
        ) : (
          // Tampilkan pesan error jika tidak ada token
          <p className="text-sm text-center text-red-600">{message.text}</p>
        )}
      </div>
    </main>
  );
}

// Suspense Boundary untuk Client Component yang menggunakan useSearchParams
export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordComponent />
        </Suspense>
    );
}