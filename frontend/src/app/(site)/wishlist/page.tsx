'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import { 
    Heart, 
    MapPin, 
    Camera, 
    ArrowLeft, 
    Star,
    Loader2
} from 'lucide-react';

interface WishlistItem {
    id: number;
    name: string;
    address: string;
    thumbnail_image: string | null;
    average_rating: number;
    category: string;
    category_slug: string;
}

export default function WishlistPage() {
    const router = useRouter();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fungsi untuk memuat data wishlist
    const fetchWishlist = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('authToken');

            const response = await fetch('http://localhost:5000/api/interaction/wishlist', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            });

            if (response.status === 401) {
                router.push('/login');
                return;
            }

            const result = await response.json();

            if (result.success) {
                setWishlist(result.data);
            } else {
                setError(result.message || "Gagal memuat wishlist");
            }
        } catch (err) {
            console.error("Error fetching wishlist:", err);
            setError("Terjadi kesalahan koneksi");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWishlist();
    }, []);

    // Fungsi untuk menghapus item dari wishlist (Unlike)
    const handleRemoveFavorite = async (e: React.MouseEvent, businessId: number) => {
        e.stopPropagation(); // Mencegah klik card yang mengarah ke halaman detail
        
        // Optimistic update: Hapus sementara dari layar
        const previousWishlist = [...wishlist];
        setWishlist(wishlist.filter(item => item.id !== businessId));

        try {
            const response = await fetch('http://localhost:5000/api/interaction/toggle-like', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessId }),
                credentials: 'include'
            });

            const result = await response.json();
            
            if (!result.success) {
                // Rollback jika gagal
                setWishlist(previousWishlist);
                alert('Gagal menghapus dari wishlist. Silakan coba lagi.');
            }
        } catch (err) {
            // Rollback jika error jaringan
            setWishlist(previousWishlist);
            console.error('Error toggling like:', err);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
                <p className="text-gray-500 font-medium">Memuat wishlist Anda...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
            {/* Header */}
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-700" />
                        </button>
                        <h1 className="text-xl font-bold text-gray-800">Wishlist</h1>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6 border border-red-200">
                        {error}
                    </div>
                )}

                {wishlist.length === 0 && !error ? (
                    /* State jika Wishlist Kosong */
                    <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
                        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <Heart className="w-10 h-10 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Belum ada item yang disimpan</h2>
                        <p className="text-gray-500 mb-8 max-w-md">
                            Anda belum menambahkan destinasi, kuliner, atau akomodasi apapun ke dalam wishlist Anda.
                        </p>
                        <button 
                            onClick={() => router.push('/')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors"
                        >
                            Jelajahi Batam
                        </button>
                    </div>
                ) : (
                    /* Grid Item Wishlist */
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {wishlist.map((item) => (
                            <div 
                                key={item.id}
                                onClick={() => router.push(`/category/${item.category_slug || 'umum'}/detail/${item.id}`)}
                                className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer group border border-gray-100 relative"
                            >
                                {/* Tombol Unlike */}
                                <button 
                                    onClick={(e) => handleRemoveFavorite(e, item.id)}
                                    className="absolute top-3 right-3 z-10 p-2 bg-white/80 hover:bg-white rounded-full shadow-sm transition-transform hover:scale-110"
                                    title="Hapus dari Wishlist"
                                >
                                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                                </button>

                                {/* Gambar */}
                                <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                                    {item.thumbnail_image ? (
                                        <Image
                                            src={
                                                item.thumbnail_image.startsWith("http")
                                                    ? item.thumbnail_image
                                                    : `http://localhost:5000/uploads/${item.thumbnail_image}`
                                            }
                                            alt={item.name}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Camera className="w-8 h-8 text-gray-400" />
                                        </div>
                                    )}
                                    
                                    {/* Badge Kategori */}
                                    <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium">
                                        {item.category || 'Umum'}
                                    </div>
                                </div>

                                {/* Konten Detail */}
                                <div className="p-5">
                                    <h3 className="font-bold text-gray-800 text-lg mb-2 truncate group-hover:text-blue-600 transition-colors">
                                        {item.name}
                                    </h3>
                                    
                                    <div className="flex items-start gap-2 text-gray-500 text-sm mb-3">
                                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-2">{item.address}</span>
                                    </div>

                                    <div className="flex items-center gap-1 mt-auto">
                                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                        <span className="font-semibold text-gray-700">
                                            {Number(item.average_rating) > 0 ? Number(item.average_rating).toFixed(1) : 'Baru'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}