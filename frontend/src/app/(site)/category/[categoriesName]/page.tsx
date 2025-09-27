// frontend/src/app/category/[categoriesName]/page.tsx
'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin, Star, ChevronDown, Search, Filter, ArrowLeft, X, TrendingUp, StarHalf, Award
} from 'lucide-react';

// --- INTERFACE (Disesuaikan dengan View business_with_category) ---

interface Business {
    id: number;
    name: string; // Dari businesses.name
    address: string;
    // Dari cache rating di tabel businesses
    average_rating: number | string | null; 
    total_reviews: number | null; 
    // Dari View
    category_name: string | null; 
    subcategory_name: string | null; 
    // Dari businesses
    thumbnail_image: string | null; 
    description: string | null;
    base_price: number | null; // Asumsi harga termurah dari subquery/cache/room_types
    // Asumsi: Kita hanya menggunakan starRating untuk filter, tidak di DB.
}

interface Filters {
    starRating: string[];
    reviewScore: string[];
    priceRange: string[];
}

// Data Dummy Subkategori (IDEALNYA DIAMBIL DARI /api/subcategories?slug=X)
const DUMMY_SUB_CATEGORIES: Record<string, { value: string; label: string }[]> = {
    akomodasi: [
        { value: 'hotel-bintang-5', label: 'Hotel Bintang 5' },
        { value: 'hotel-bintang-4', label: 'Hotel Bintang 4' },
        { value: 'villa', label: 'Villa' },
        { value: 'homestay', label: 'Homestay' },
    ],
    kuliner: [
        { value: 'restoran', label: 'Restoran' },
        { value: 'kafe', label: 'Kafe' },
        { value: 'makanan-lokal', label: 'Makanan Lokal' },
    ],
    // Tambahkan kategori lain sesuai seed data Anda
};

const categoryTitles: Record<string, string> = {
    akomodasi: 'Akomodasi', kuliner: 'Kuliner', wisata: 'Wisata',
    hiburan: 'Hiburan', transportasi: 'Transportasi', bisnis: 'Bisnis'
};
// -------------------------------------------------------------------

export default function CategoryListPage() {
    const params = useParams();
    const router = useRouter();
    const categorySlug = params.categoriesName as string;

    const [items, setItems] = useState<Business[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');
    const [sortOption, setSortOption] = useState('rating'); // Default sort: rating tertinggi
    const [filters, setFilters] = useState<Filters>({
        starRating: [],
        reviewScore: [],
        priceRange: []
    });
    const [isLoading, setIsLoading] = useState(true);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const currentCategoryTitle = categoryTitles[categorySlug] || categorySlug;

    // --- FETCH DATA DARI BACKEND ---
    useEffect(() => {
        const fetchItems = async () => {
            if (!categorySlug) return;

            setIsLoading(true);
            try {
                // Endpoint untuk mengambil semua bisnis di kategori ini
                // Asumsi backend memiliki endpoint: GET /api/businesses?category_slug=akomodasi
                const response = await fetch(`${API_URL}/api/businesses?category_slug=${categorySlug}`);
                
                if (!response.ok) {
                    throw new Error(`Failed to fetch ${categorySlug} data.`);
                }
                
                const result = await response.json();
                
                if (result.success && Array.isArray(result.data)) {
                    setItems(result.data as Business[]);
                } else {
                    setItems([]);
                }
            } catch (error) {
                console.error('Error fetching items:', error);
                setItems([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [categorySlug]);
    // --------------------------------

    const formatPrice = (price: number | null | undefined) => {
        if (!price || price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const getRatingCategory = (rating: number): string => {
        if (rating >= 9.0) return 'Exceptional';
        if (rating >= 8.5) return 'Excellent';
        if (rating >= 8.0) return 'Very Good';
        if (rating >= 7.0) return 'Good';
        return 'Fair';
    };
    
    // Konversi numeric rating (misal: 4.5) ke label (misal: Excellent)
    const getRatingLabel = (rating: number | string | null): string => {
        const num = parseFloat(rating as string) || 0;
        if (num === 0) return 'N/A';
        if (num >= 9.0) return 'Exceptional';
        if (num >= 8.5) return 'Excellent';
        if (num >= 8.0) return 'Very Good';
        if (num >= 7.0) return 'Very Good';
        return 'Good';
    };

    const renderStars = (starRating: number) => {
        return (
            <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < starRating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                ))}
            </div>
        );
    };

    const handleFilterChange = (type: keyof Filters, value: string) => {
        setFilters(prevFilters => {
            const newFilters = { ...prevFilters };
            if (newFilters[type].includes(value)) {
                newFilters[type] = newFilters[type].filter(item => item !== value);
            } else {
                newFilters[type] = [...newFilters[type], value];
            }
            return newFilters;
        });
    };

    const handleClearFilters = () => {
        setFilters({ starRating: [], reviewScore: [], priceRange: [] });
        setSelectedSubcategory('all');
        setSearchTerm('');
    };

    const handleItemClick = (item: Business) => {
        // Navigate to: /category/[categoriesName]/detail/[id]
        router.push(`/category/${categorySlug}/detail/${item.id}`);
    };

    // Fungsi filtering dan sorting dengan useMemo untuk optimasi
    const filteredAndSortedItems = useMemo(() => {
        let filtered = [...items];

        // 1. Filter berdasarkan search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        // 2. Filter berdasarkan subkategori
        if (selectedSubcategory !== 'all') {
            filtered = filtered.filter(item => item.subcategory_name === selectedSubcategory);
        }

        // 3. Filter berdasarkan star rating (asumsi rating 1-5 ada di data item/metadata)
        if (filters.starRating.length > 0) {
            filtered = filtered.filter(item => {
                // Di sini Anda perlu logic untuk mengkonversi category_name menjadi star rating (e.g. "Hotel Bintang 5" -> 5)
                const itemStarRating = item.category_name?.match(/\d+/)?.[0];
                return itemStarRating && filters.starRating.includes(itemStarRating);
            });
        }
        
        // 4. Filter berdasarkan review score
        if (filters.reviewScore.length > 0) {
            filtered = filtered.filter(item => {
                const ratingNum = parseFloat(item.average_rating as string) || 0;
                return filters.reviewScore.includes(getRatingCategory(ratingNum));
            });
        }
        
        // 5. Sorting
        filtered.sort((a, b) => {
            const ratingA = parseFloat(a.average_rating as string) || 0;
            const ratingB = parseFloat(b.average_rating as string) || 0;
            const priceA = a.base_price || 0;
            const priceB = b.base_price || 0;

            switch (sortOption) {
                case 'harga-terendah':
                    return priceA - priceB;
                case 'harga-tertinggi':
                    return priceB - priceA;
                case 'rating':
                    return ratingB - ratingA;
                case 'terpopuler':
                    // Asumsi popularitas = rating + review count
                    const popA = ratingA * (a.total_reviews || 1);
                    const popB = ratingB * (b.total_reviews || 1);
                    return popB - popA;
                case 'terbaru':
                default:
                    // Karena DB sort by created_at DESC, return 0 untuk mempertahankan urutan API
                    return 0; 
            }
        });

        return filtered;
    }, [items, searchTerm, selectedSubcategory, filters, sortOption]);

    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Memuat {currentCategoryTitle}...</p>
                </div>
            </div>
        );
    }

    // Mendapatkan Subkategori yang tersedia untuk ditampilkan di filter (menggunakan data dummy)
    const availableSubcategories = DUMMY_SUB_CATEGORIES[categorySlug] || [];


    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header dengan breadcrumb */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                        <button 
                            onClick={() => router.push(`/category/`)}
                            className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Kembali
                        </button>
                        <span>•</span>
                        <span>{currentCategoryTitle}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {currentCategoryTitle} di Batam
                    </h1>
                </div>
            </div>

            {/* Header Pencarian */}
            <div className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Cari nama tempat, alamat, atau deskripsi..."
                                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <select
                                    className="block appearance-none w-full bg-white border border-gray-300 py-3 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500"
                                    value={selectedSubcategory}
                                    onChange={(e) => setSelectedSubcategory(e.target.value)}
                                >
                                    <option value="all">Semua Subkategori</option>
                                    {availableSubcategories.map(sub => (
                                        <option key={sub.value} value={sub.label}>{sub.label}</option>
                                    ))}
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="w-4 h-4" />
                                </div>
                            </div>
                            <button
                                className="p-3 border rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                                onClick={handleClearFilters}
                                title="Clear all filters"
                            >
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Konten Utama */}
            <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Filter Sidebar */}
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit sticky top-24">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Filter</h2>
                        <button 
                            onClick={handleClearFilters} 
                            className="text-sm text-blue-600 hover:text-blue-800 transition-colors"
                        >
                            Clear All
                        </button>
                    </div>
                    <hr className="my-4" />
                    
                    <div className="space-y-6">
                        {/* Rating Bintang - hanya untuk akomodasi */}
                        {categorySlug === 'akomodasi' && (
                            <div>
                                <h3 className="font-semibold text-gray-800 mb-3">Rating Bintang</h3>
                                <div className="space-y-2">
                                    {['5', '4', '3', '2', '1'].map(star => (
                                        <label key={star} className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                                checked={filters.starRating.includes(star)}
                                                onChange={() => handleFilterChange('starRating', star)}
                                            />
                                            <div className="flex items-center gap-2">
                                                {[...Array(parseInt(star))].map((_, i) => (
                                                    <Star key={i} className="w-4 h-4 text-yellow-400 fill-current" />
                                                ))}
                                                <span>{star} Bintang</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Review Score */}
                        <div>
                            <h3 className="font-semibold text-gray-800 mb-3">Review Score</h3>
                            <div className="space-y-2">
                                {['Exceptional', 'Excellent', 'Very Good', 'Good'].map(score => (
                                    <label key={score} className="flex items-center gap-2 cursor-pointer text-gray-600 hover:text-gray-800 transition-colors">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                            checked={filters.reviewScore.includes(score)}
                                            onChange={() => handleFilterChange('reviewScore', score)}
                                        />
                                        <span>{score}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Daftar Item */}
                <div className="lg:col-span-3">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
                        <div className="text-sm text-gray-600">
                            Menampilkan <strong>{filteredAndSortedItems.length}</strong> dari <strong>{items.length}</strong> hasil
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Urutkan:</span>
                            <div className="relative">
                                <select
                                    className="block appearance-none w-full bg-white border border-gray-300 py-2 pl-3 pr-8 rounded-lg leading-tight focus:outline-none focus:bg-white focus:border-blue-500 text-sm"
                                    value={sortOption}
                                    onChange={(e) => setSortOption(e.target.value)}
                                >
                                    <option value="rating">Rating Tertinggi</option>
                                    <option value="terbaru">Terbaru</option>
                                    <option value="terpopuler">Terpopuler</option>
                                    <option value="harga-terendah">Harga Terendah</option>
                                    <option value="harga-tertinggi">Harga Tertinggi</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                    <ChevronDown className="w-3 h-3" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* No results message */}
                    {filteredAndSortedItems.length === 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                            <div className="text-gray-400 mb-4">
                                <Search className="w-16 h-16 mx-auto" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-600 mb-2">
                                Tidak ada hasil ditemukan
                            </h3>
                            <p className="text-gray-500 mb-4">
                                Coba ubah kata kunci pencarian atau filter yang dipilih
                            </p>
                            <button
                                onClick={handleClearFilters}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Reset Filter
                            </button>
                        </div>
                    )}

                    {/* Item List */}
                    <div className="space-y-4">
                        {filteredAndSortedItems.map(item => {
                            const numericRating = parseFloat(item.average_rating as string) || 0;
                            const ratingLabel = getRatingLabel(numericRating);

                            return (
                                <div
                                    key={item.id}
                                    className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all duration-200 ease-in-out hover:shadow-lg group-hover:-translate-y-1 group cursor-pointer"
                                    onClick={() => handleItemClick(item)}
                                >
                                    <div className="relative w-full lg:w-48 h-48 lg:h-auto flex-shrink-0">
                                        {item.thumbnail_image && (
                                            <Image
                                                src={
                                                    item.thumbnail_image.startsWith("http")
                                                        ? item.thumbnail_image
                                                        : `${API_URL}/uploads/${item.thumbnail_image}`
                                                }
                                                alt={item.name}
                                                fill
                                                sizes="(max-width: 1024px) 100vw, 192px"
                                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                        )}
                                        {categorySlug === 'akomodasi' && (
                                            <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded-lg backdrop-blur-sm">
                                                {renderStars(parseInt(item.category_name?.match(/\d+/)?.[0] || '0'))}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 p-6 flex flex-col justify-between">
                                        <div>
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                                    {item.name}
                                                </h3>
                                                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                                                    <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                                                        <Star className="w-4 h-4 text-green-600 fill-current" />
                                                        <span className="font-bold text-green-600">
                                                            {numericRating.toFixed(1)}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm text-gray-500 whitespace-nowrap">
                                                        {ratingLabel}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                <span>{item.address}</span>
                                            </div>
                                            
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                                {item.description || "Deskripsi belum tersedia."}
                                            </p>
                                        </div>
                                        
                                        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                {numericRating >= 9.0 && (
                                                    <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                        <Award className="w-3 h-3" />
                                                        <span>Top Rated</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="text-right">
                                                <div className="text-xs text-gray-500 mb-1">
                                                    {item.base_price === 0 ? 'Masuk' : 'Mulai dari'}
                                                </div>
                                                <div className="font-bold text-lg text-blue-600">
                                                    {formatPrice(item.base_price)}
                                                </div>
                                                <button className="mt-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                                                    {categorySlug === 'akomodasi' ? 'Cek Ketersediaan' : 'Lihat Detail'}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Load More Button - untuk implementasi pagination nantinya */}
                    {filteredAndSortedItems.length > 0 && filteredAndSortedItems.length >= 10 && (
                        <div className="text-center mt-8">
                            <button className="bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors">
                                Muat Lebih Banyak
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}