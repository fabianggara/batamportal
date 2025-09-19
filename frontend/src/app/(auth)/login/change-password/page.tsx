'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Tipe untuk state pesan
type MessageState = {
  text: string;
  type: 'success' | 'error' | '';
};

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<MessageState>({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Password baru tidak cocok.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API_URL}/api/password/change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // PERBAIKAN 1: Kirim cookie untuk autentikasi
        credentials: 'include',
        // PERBAIKAN 2: Ganti nama properti menjadi 'oldPassword'
        body: JSON.stringify({ oldPassword: currentPassword, newPassword }),
      });

      const result = await response.json();
      
      // PERBAIKAN 3: Tampilkan pesan berdasarkan status respons
      if (response.ok) {
        setMessage({ text: result.message || 'Password berhasil diubah.', type: 'success' });
        setTimeout(() => router.push('/'), 2000); // Arahkan ke dashboard setelah berhasil
      } else {
        setMessage({ text: result.error || 'Gagal mengubah password.', type: 'error' });
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
        <h1 className="text-2xl font-bold text-center">Ubah Password</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="currentPassword">Password Saat Ini</label>
            <input type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
          </div>
          <div>
            <label htmlFor="newPassword">Password Baru</label>
            <input type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
          </div>
          <div>
            <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
            <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
          </div>

          {message.text && (
            <p className={`text-sm text-center ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
          
          <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
            {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </form>
      </div>
    </main>
  );
}