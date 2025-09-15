'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function ResetPasswordForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (password !== confirmPassword) {
        setMessage('Password tidak cocok.');
        return;
        }
        if (!token) {
        setMessage('Token reset tidak ditemukan.');
        return;
        }

        setIsLoading(true);
        setMessage('');

        try {
        const response = await fetch('/api/password/reset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, password }),
        });

        const result = await response.json();
        setMessage(result.message || result.error);

        if (result.success) {
            setTimeout(() => router.push('/login'), 2000); // Arahkan ke login setelah 2 detik
        }
        } catch (error) {
        setMessage('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
        setIsLoading(false);
        }
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-center">Reset Password Anda</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label htmlFor="password">Password Baru</label>
                <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
            </div>
            <div>
                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                <input type="password" id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 mt-1 border rounded-md" />
            </div>
            {message && <p className="text-sm text-center text-green-600">{message}</p>}
            <button type="submit" disabled={isLoading} className="w-full px-4 py-2 font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:bg-blue-400">
                {isLoading ? 'Menyimpan...' : 'Simpan Password Baru'}
            </button>
            </form>
        </div>
        </main>
    );
    }

    // Gunakan Suspense untuk memastikan useSearchParams bekerja dengan benar
    export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
        </Suspense>
    );
}