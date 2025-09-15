// src/app/login/page.tsx
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function LoginPage() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();
  const { login } = useAuth();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage('');

    if (!isLoginView && password !== confirmPassword) {
      setMessage('Error: Passwords do not match.');
      setIsLoading(false);
      return;
    }

    // Gunakan environment variable untuk endpoint backend
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const endpoint = isLoginView ? `${apiUrl}/api/login` : `${apiUrl}/api/signup`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) { // Periksa status HTTP 200-299
        if (isLoginView) {
          setMessage('Login successful! Redirecting...');
          const loggedInUser = result.user;

          if (!loggedInUser) {
            setMessage('Error: User data not found after login.');
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
          setMessage('Sign up successful! Please log in.');
          setIsLoginView(true);
        }
      } else {
        setMessage(`Error: ${result.error || 'Failed to process request'}`);
      }
    } catch (error) {
      setMessage('An error occurred. Please try again. Check your network or server.');
      console.error('Fetch error:', error); // Untuk debug
    } finally {
      setIsLoading(false); // Pastikan loading selalu berhenti
    }
  };

  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-lg p-10 space-y-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center text-gray-800">
          {isLoginView ? 'Login' : 'Sign Up'}
        </h1>
        
        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label htmlFor="email" className="block mb-2 text-lg font-semibold text-gray-700">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block mb-2 text-lg font-semibold text-gray-700">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          {isLoginView && (
            <div className="text-right">
              <Link href="/login/forgot-password" className="text-sm font-medium text-blue-500 hover:underline">
                Lupa Password?
              </Link>
            </div>
          )}

          {!isLoginView && (
            <div>
              <label htmlFor="confirmPassword" className="block mb-2 text-lg font-semibold text-gray-700">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-6 py-4 text-lg font-semibold text-white bg-blue-500 rounded-lg shadow-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isLoading ? 'Loading...' : isLoginView ? 'Login' : 'Sign Up'}
          </button>
        </form>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
        <p className="text-lg text-center text-gray-600">
          {isLoginView ? "Don't have an account?" : "Already have an account?"}
          <button
            type="button"
            onClick={() => { setIsLoginView(!isLoginView); setMessage(''); }}
            className="ml-2 font-semibold text-blue-500 hover:underline"
          >
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </main>
  );
}