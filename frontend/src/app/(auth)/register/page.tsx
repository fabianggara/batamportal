// src/app/register/page.tsx
'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Check } from 'lucide-react';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const router = useRouter();

    const checkPasswordStrength = (password: string) => {
        let strength = 0;
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        return strength;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        if (name === 'password') {
        setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) {
        setMessage('Nama lengkap harus diisi');
        return false;
        }
        if (!formData.email.trim()) {
        setMessage('Email harus diisi');
        return false;
        }
        if (formData.password.length < 6) {
        setMessage('Password minimal 6 karakter');
        return false;
        }
        if (formData.password !== formData.confirmPassword) {
        setMessage('Konfirmasi password tidak cocok');
        return false;
        }
        return true;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        setIsLoading(true);
        setMessage('');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const endpoint = `${apiUrl}/api/signup`;

        try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
            name: formData.name,
            email: formData.email,
            password: formData.password
            }),
        });

        const result = await response.json();

        if (response.ok) {
            setMessage('Pendaftaran berhasil! Silakan login.');
            setTimeout(() => {
            router.push('/login');
            }, 2000);
        } else {
            setMessage(`Error: ${result.error || 'Gagal mendaftar'}`);
        }
        } catch (error) {
        setMessage('Terjadi kesalahan. Silakan coba lagi.');
        console.error('Fetch error:', error);
        } finally {
        setIsLoading(false);
        }
    };

    const getPasswordStrengthColor = () => {
        switch (passwordStrength) {
        case 0:
        case 1:
            return 'bg-red-500';
        case 2:
            return 'bg-yellow-500';
        case 3:
            return 'bg-orange-500';
        case 4:
        case 5:
            return 'bg-green-500';
        default:
            return 'bg-gray-300';
        }
    };

    const getPasswordStrengthText = () => {
        switch (passwordStrength) {
        case 0:
        case 1:
            return 'Lemah';
        case 2:
            return 'Sedang';
        case 3:
            return 'Cukup Kuat';
        case 4:
        case 5:
            return 'Kuat';
        default:
            return '';
        }
    };

    return (
        <div className="min-h-screen flex">
        {/* Left Side - Registration Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
            <div className="w-full max-w-md space-y-8">
            {/* Header */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Buat Akun Baru</h2>
                <p className="text-gray-600">Bergabunglah dengan komunitas BatamPortal</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Nama Lengkap
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Masukkan nama lengkap"
                    required
                    />
                </div>
                </div>

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
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Buat password"
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
                
                {/* Password Strength Indicator */}
                {formData.password && (
                    <div className="space-y-2">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((level) => (
                        <div
                            key={level}
                            className={`h-2 flex-1 rounded ${
                            level <= passwordStrength ? getPasswordStrengthColor() : 'bg-gray-200'
                            } transition-colors`}
                        />
                        ))}
                    </div>
                    <p className={`text-sm ${
                        passwordStrength >= 3 ? 'text-green-600' : 
                        passwordStrength >= 2 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                        Kekuatan Password: {getPasswordStrengthText()}
                    </p>
                    </div>
                )}
                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                    Konfirmasi Password
                </label>
                <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Ulangi password"
                    required
                    />
                    <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    {formData.confirmPassword && formData.password === formData.confirmPassword && (
                    <Check className="absolute right-10 top-1/2 transform -translate-y-1/2 text-green-500 w-5 h-5" />
                    )}
                </div>
                </div>

                {/* Terms Agreement */}
                <div className="flex items-start gap-3">
                <input
                    type="checkbox"
                    id="terms"
                    className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                    Saya setuju dengan{' '}
                    <Link href="/terms" className="text-blue-600 hover:text-blue-500">
                    Syarat & Ketentuan
                    </Link>{' '}
                    dan{' '}
                    <Link href="/privacy" className="text-blue-600 hover:text-blue-500">
                    Kebijakan Privasi
                    </Link>
                </label>
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
                    Sedang Mendaftar...
                    </>
                ) : (
                    <>
                    Daftar Sekarang
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

            {/* Login Link */}
            <div className="text-center pt-6 border-t border-gray-200">
                <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link 
                    href="/login" 
                    className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                    Masuk di sini
                </Link>
                </p>
            </div>
            </div>
        </div>

        {/* Right Side - Welcome Section */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-700 to-pink-800 p-12 items-center justify-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
            <div className="absolute top-16 right-20 w-40 h-40 bg-white rounded-full"></div>
            <div className="absolute bottom-20 left-16 w-32 h-32 bg-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white rounded-full"></div>
            </div>
            
            <div className="relative z-10 text-center text-white max-w-md">
            <h1 className="text-5xl font-bold mb-6">Bergabung Bersama Kami!</h1>
            <p className="text-xl opacity-90 mb-8">
                Daftar sekarang dan nikmati pengalaman menjelajahi Batam yang tak terlupakan
            </p>
            <div className="space-y-4">
                <div className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-green-300" />
                <span>Akses ke semua fitur</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-green-300" />
                <span>Rekomendasi personal</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-green-300" />
                <span>Komunitas traveler</span>
                </div>
                <div className="flex items-center gap-3 text-lg">
                <Check className="w-6 h-6 text-green-300" />
                <span>100% gratis</span>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}