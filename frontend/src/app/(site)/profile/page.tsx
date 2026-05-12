'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import { 
    User, 
    Camera, 
    ArrowLeft, 
    Save, 
    Loader2, 
    X, 
    Check 
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

// --- FUNGSI HELPER UNTUK CROP GAMBAR ---
const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new window.Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File> {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height,
        0, 0, pixelCrop.width, pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) return reject('Canvas is empty');
            // Ubah blob menjadi File agar bisa dikirim via FormData
            const file = new File([blob], 'cropped-profile.jpg', { type: 'image/jpeg' });
            resolve(file);
        }, 'image/jpeg');
    });
}
// ----------------------------------------

export default function ProfilePage() {
    const router = useRouter();
    const { user } = useAuth(); 
    
    const [name, setName] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    
    // State Utama untuk Foto
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // State untuk Modal Cropper
    const [imageToCrop, setImageToCrop] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

    // Mengisi data awal saat komponen dimuat
    useEffect(() => {
        if (user) {
            setName(user.name || '');
            if (user.profile_picture) {
                const imgUrl = user.profile_picture.startsWith('http') 
                    ? user.profile_picture 
                    : `http://localhost:5000/uploads/${user.profile_picture}`;
                setPreviewUrl(imgUrl);
            }
        } else {
            const timer = setTimeout(() => { router.push('/login'); }, 500);
            return () => clearTimeout(timer);
        }
    }, [user, router]);

    // 1. Saat user memilih file dari komputer
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Jangan langsung set selectedFile, tapi buka modal cropper
            const objectUrl = URL.createObjectURL(file);
            setImageToCrop(objectUrl);
        }
        // Reset input agar user bisa memilih file yang sama lagi jika batal
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    // 2. Saat user menekan tombol "Terapkan" di Modal Crop
    const handleCropConfirm = async () => {
        if (!imageToCrop || !croppedAreaPixels) return;
        try {
            // Potong gambar menggunakan helper
            const croppedFile = await getCroppedImg(imageToCrop, croppedAreaPixels);
            
            // Simpan hasil potongan ke state untuk dikirim ke backend
            setSelectedFile(croppedFile);
            setPreviewUrl(URL.createObjectURL(croppedFile)); // Tampilkan di UI
            setImageToCrop(null); // Tutup modal cropper
        } catch (e) {
            console.error('Error cropping image:', e);
            alert('Gagal memotong gambar.');
        }
    };

    // 3. Saat user menyimpan profil
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        try {
            const token = localStorage.getItem('authToken');
            const formData = new FormData();
            formData.append('name', name);
            if (selectedFile) {
                formData.append('profile_picture', selectedFile);
            }

            const response = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                credentials: 'include', // PENTING: Mencegah error 401
                body: formData
            });

            const result = await response.json();

            if (result.success) {
                alert('Profil berhasil diperbarui!');
                window.location.reload(); 
            } else {
                alert(result.message || 'Gagal memperbarui profil');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Terjadi kesalahan pada server');
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header Profil */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Profil Saya</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-6 md:p-8">
                    <form onSubmit={handleSubmit} className="space-y-8">
                        
                        {/* Area Foto Profil */}
                        <div className="flex flex-col items-center">
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg bg-gray-100 flex items-center justify-center relative">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt="Profile Preview"
                                            fill
                                            sizes="128px"
                                            priority
                                            className="object-cover"
                                        />
                                    ) : (
                                        <User className="w-12 h-12 text-gray-400" />
                                    )}
                                    
                                    <div 
                                        onClick={() => fileInputRef.current?.click()}
                                        className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center cursor-pointer transition-all"
                                    >
                                        <Camera className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <button 
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-blue-600 p-2.5 rounded-full text-white shadow-md hover:bg-blue-700 transition-colors border-2 border-white"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                                <input 
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept="image/*"
                                    className="hidden"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-3">Klik gambar untuk mengubah foto profil</p>
                        </div>

                        {/* Input Nama & Email */}
                        <div className="space-y-5">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                                    placeholder="Masukkan nama Anda"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">
                                    Email <span className="text-gray-400 font-normal">(Tidak dapat diubah)</span>
                                </label>
                                <input
                                    type="email" value={user.email} disabled
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                        </div>

                        <hr className="border-gray-200" />

                        {/* Tombol Batal & Simpan */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button" onClick={() => router.back()}
                                className="px-6 py-3 rounded-xl font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Batal
                            </button>
                            <button
                                type="submit"
                                disabled={isSaving || (!selectedFile && name === user.name)}
                                className="px-6 py-3 rounded-xl font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors shadow-sm"
                            >
                                {isSaving ? (
                                    <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan...</>
                                ) : (
                                    <><Save className="w-5 h-5" /> Simpan Perubahan</>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            {/* ========================================= */}
            {/* MODAL CROPPER GAMBAR (Hanya muncul jika ada foto yang dipilih) */}
            {/* ========================================= */}
            {imageToCrop && (
                <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center p-4">
                    <div className="relative w-full max-w-lg h-[60vh] bg-gray-900 rounded-2xl overflow-hidden shadow-2xl">
                        <Cropper
                            image={imageToCrop}
                            crop={crop}
                            zoom={zoom}
                            aspect={1} // Memaksa rasio 1:1 (Persegi/Bulat)
                            cropShape="round" // Menampilkan area crop berbentuk bulat
                            showGrid={false}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                        />
                    </div>
                    
                    {/* Kontrol Zoom & Tombol */}
                    <div className="w-full max-w-lg bg-white p-5 rounded-b-2xl flex flex-col gap-5 shadow-2xl">
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-semibold text-gray-700">Zoom</span>
                            <input
                                type="range"
                                value={zoom}
                                min={1} max={3} step={0.05}
                                onChange={(e) => setZoom(Number(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => { setImageToCrop(null); setSelectedFile(null); }} 
                                className="px-5 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center gap-2 font-medium transition-colors"
                            >
                                <X className="w-4 h-4" /> Batal
                            </button>
                            <button 
                                onClick={handleCropConfirm} 
                                className="px-5 py-2.5 text-white bg-blue-600 hover:bg-blue-700 rounded-xl flex items-center gap-2 font-medium transition-colors"
                            >
                                <Check className="w-4 h-4" /> Terapkan Foto
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}