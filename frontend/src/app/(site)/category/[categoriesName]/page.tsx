// frontend/src/app/category/[categoriesName]/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin, Star, ChevronDown, Search, Filter, ArrowLeft, X,
    TrendingUp, Award
} from 'lucide-react';

// --- Tipe Data Baru (sesuai database Anda) ---
interface BusinessItem {
    id: number;
    name: string;
    address: string;
    average_rating: number;
    total_reviews: number;
    star_rating: number;
    thumbnail_image: string;
    description: string;
    subcategory_slug?: string;
    price: number; // Pastikan API mengirimkan ini
}

interface Subcategory {
    slug: string;
    name: string;
}
// --- Akhir Tipe Data ---

export default function CategoryListPage() {
    const params = useParams();
    const router = useRouter();
    const categorySlug = params.categoriesName as string;

    // --- State Management ---
    const [items, setItems] = useState<BusinessItem[]>([]);
    const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
    const [categoryTitle, setCategoryTitle] = useState(categoryName);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // State untuk filter & sort
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');
    const [sortOption, setSortOption] = useState('terbaru');
    const [filters, setFilters] = useState({
        starRating: [] as string[], // Ganti nama ini
        reviewScore: [] as string[],
    });

    // --- Pengambilan Data dari API ---
    useEffect(() => {
        if (!categoryName) return;

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const res = await fetch(`http://localhost:5000/api/businesses/category/${categoryName}`);
                if (!res.ok) throw new Error('Gagal mengambil data dari server');
                
                const response = await res.json();
                if (response.success) {
                    setItems(response.data.items || []);
                    setSubcategories(response.data.subcategories || []);
                    setCategoryTitle(response.data.category_title || categoryName);
                } else {
                    throw new Error(response.message || 'Gagal memuat data kategori');
                }
            } catch (err: any) {
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [categoryName]);

    // --- Helper Functions (Lengkap dari kode lama Anda) ---
    const formatPrice = (price: number) => {
        if (price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency', currency: 'IDR', minimumFractionDigits: 0
        }).format(price);
    };

    const getRatingCategory = (rating: number): string => {
        if (rating >= 9.0) return 'Exceptional';
        if (rating >= 8.5) return 'Excellent';
        if (rating >= 8.0) return 'Very Good';
        if (rating >= 7.0) return 'Good';
        return 'Fair';
    };

    const renderStars = (averageRating?: number) => {
        if (!averageRating) return null;
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < averageRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                ))}
            </div>
        );
    };

    // --- Fungsi Handler (Lengkap dari kode lama Anda) ---
    const handleFilterChange = (type: keyof typeof filters, value: string) => {
        setFilters(prev => ({
            ...prev,
            [type]: prev[type].includes(value)
                ? prev[type].filter(item => item !== value)
                : [...prev[type], value]
        }));
    };

    const handleClearFilters = () => {
        setFilters({ starRating: [], reviewScore: [] });
        setSelectedSubcategory('all');
        setSearchTerm('');
    };
    
    // --- Logika Filter & Sort ---
    const filteredAndSortedItems = useMemo(() => {
        let filtered = [...items];

        if (searchTerm.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.address.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (selectedSubcategory !== 'all') {
            filtered = filtered.filter(item => item.subcategory_slug === selectedSubcategory);
        }

        if (filters.starRating.length > 0) {
            filtered = filtered.filter(item =>
                // Gunakan 'star_rating' dari database
                item.star_rating && filters.starRating.includes(item.star_rating.toString())
            );
        }

        if (filters.reviewScore.length > 0) {
            filtered = filtered.filter(item =>
            filters.reviewScore.includes(getRatingCategory(item.average_rating))
            );
        }       

        filtered.sort((a, b) => {
            const ratingA = parseFloat(a.average_rating as string) || 0;
            const ratingB = parseFloat(b.average_rating as string) || 0;
            const priceA = a.base_price || 0;
            const priceB = b.base_price || 0;

            switch (sortOption) {
                case 'harga-terendah': return (a.price || 0) - (b.price || 0);
                case 'harga-tertinggi': return (b.price || 0) - (a.price || 0);
                case 'rating': return b.average_rating - a.average_rating;
                default: return 0;
            }
        });

        return filtered;
    }, [items, searchTerm, selectedSubcategory, filters, sortOption]);


    // --- Tampilan Loading & Error ---
    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center text-center"><div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div><p className="mt-4">Loading...</p></div>;
    }

    if (error) {
        return <div className="min-h-screen flex items-center justify-center text-center"><p>Error: {error}</p></div>;
    }

    // --- Tampilan Utama (JSX Lengkap) ---
    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <Link href="/category" className="flex items-center gap-1 hover:text-blue-600">
                            <ArrowLeft className="w-4 h-4" /> Kembali
                        </Link>
                        <span>•</span>
                        <span>{categoryTitle}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">{categoryTitle} di Batam</h1>
                </div>
            </div>

            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder={`Cari ${categoryTitle}...`}
                                className="w-full pl-10 pr-4 py-3 border rounded-lg"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <select
                                className="block appearance-none w-full bg-white border border-gray-300 py-3 px-4 pr-8 rounded-lg"
                                value={selectedSubcategory}
                                onChange={(e) => setSelectedSubcategory(e.target.value)}
                            >
                                <option value="all">Semua Subkategori</option>
                                {subcategories.map(sub => (
                                    <option key={sub.slug} value={sub.slug}>{sub.name}</option>
                                ))}
                            </select>
                            <button onClick={handleClearFilters} title="Clear all filters" className="p-3 border rounded-lg bg-gray-100 hover:bg-gray-200">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                <aside className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Filter</h2>
                        <button onClick={handleClearFilters} className="text-sm text-blue-600 hover:text-blue-800">Clear All</button>
                    </div>
                    <hr className="my-4" />
                    <div className="space-y-6">
                        {categoryName === 'akomodasi' && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Rating Bintang</h3>
                                <div className="space-y-2">
                                    {['5', '4', '3', '2', '1'].map(star => (
                                        <label key={star} className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox"
                                                checked={filters.starRating.includes(star)}
                                                onChange={() => handleFilterChange('starRating', star)}
                                            />
                                            {renderStars(parseInt(star))}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3">Review Score</h3>
                            <div className="space-y-2">
                                {['Exceptional', 'Excellent', 'Very Good', 'Good'].map(score => (
                                    <label key={score} className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="w-4 h-4 text-blue-600"
                                            // BENAR: Gunakan state filter 'reviewScore' dan variabel 'score'
                                            checked={filters.reviewScore.includes(score)}
                                            // BENAR: Panggil handler untuk 'reviewScore' dengan variabel 'score'
                                            onChange={() => handleFilterChange('reviewScore', score)}
                                        />
                                        <span>{score}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>

                <main className="lg:col-span-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <p className="text-sm text-gray-600">Menampilkan <strong>{filteredAndSortedItems.length}</strong> dari <strong>{items.length}</strong> hasil</p>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Urutkan:</span>
                            <select
                                className="block appearance-none bg-white border border-gray-300 py-2 pl-3 pr-8 rounded-lg text-sm"
                                value={sortOption}
                                onChange={(e) => setSortOption(e.target.value)}
                            >
                                <option value="terbaru">Terbaru</option>
                                <option value="rating">Rating Tertinggi</option>
                                <option value="harga-terendah">Harga Terendah</option>
                                <option value="harga-tertinggi">Harga Tertinggi</option>
                            </select>
                        </div>
                    </div>

                    {filteredAndSortedItems.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                             <h3 className="text-xl font-semibold text-gray-600">Tidak ada hasil ditemukan</h3>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredAndSortedItems.map(item => (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-sm flex flex-col lg:flex-row transition-shadow hover:shadow-lg cursor-pointer"
                                    onClick={() => router.push(`/category/${categoryName}/detail/${item.id}`)}
                                >
                                    <div className="relative w-full lg:w-48 h-48 lg:h-auto flex-shrink-0">
                                        <Image
                                            src={item.thumbnail_image.startsWith('http') ? item.thumbnail_image : `http://localhost:5000/uploads/${item.thumbnail_image}`}
                                            alt={item.name}
                                            fill
                                            className="object-cover rounded-t-2xl lg:rounded-l-2xl lg:rounded-t-none"
                                            sizes="(max-width: 1024px) 100vw, 12rem"
                                        />
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-lg text-gray-800">{item.name}</h3>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                                                        <Star className="w-4 h-4 text-green-600 fill-current" />
                                                        <span className="font-bold text-green-600">{item.average_rating.toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span>{item.address}</span>
                                            </div>
                                            <p className="text-sm text-gray-500 line-clamp-2">{item.description}</p>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            {renderStars(item.star_rating)} 
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500">Mulai dari</div>
                                                <div className="font-bold text-lg text-blue-600">{formatPrice(item.price)}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}