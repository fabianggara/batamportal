// frontend/src/app/category/[categoriesName]/page.tsx

'use client'

import React, { useState, useEffect, useMemo } from 'react';
import Image from "next/image";
import { useParams, useRouter } from 'next/navigation';
import {
    MapPin,
    Star,
    ChevronDown,
    Search,
    Filter,
    ArrowLeft,
    X,
    TrendingUp,
    StarHalf,
    Award
} from 'lucide-react';

// Interface untuk item
interface Item {
    id: string;
    name: string;
    address: string;
    rating: number;
    ratingLabel: string;
    price: number;
    thumbnail: string;
    description: string;
    starRating?: number; // Untuk hotel
    category?: string;
}

// Interface untuk filter
interface Filters {
    starRating: string[];
    reviewScore: string[];
    priceRange: string[];
}

// Data dummy untuk semua kategori
const dummyItems: Record<string, Item[]> = {
    akomodasi: [
        {
            id: 'akomodasi-1',
            name: 'Yello Hotel Harbour Bay',
            address: 'Jln. Duyung, Batu Ampar',
            rating: 8.9,
            ratingLabel: 'Wonderful',
            price: 780000,
            thumbnail: 'https://images.unsplash.com/photo-1596436889106-be35e84e97d0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Berlokasi di pusat bisnis Nagoya. Menawarkan kamar yang nyaman dan dekat dengan pusat perbelanjaan.',
            starRating: 4,
            category: 'hotel-bintang-4'
        },
        {
            id: 'akomodasi-2',
            name: 'HARRIS Hotel & Suites Nagoya Batam',
            address: 'Jalan Raja Ali Haji, Nagoya',
            rating: 9.0,
            ratingLabel: 'Wonderful',
            price: 888000,
            thumbnail: 'https://images.unsplash.com/photo-1596394516047-41065147171d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Hotel modern dengan fasilitas lengkap, kolam renang, dan akses mudah ke Nagoya Hill Mall.',
            starRating: 4,
            category: 'hotel-bintang-4'
        },
        {
            id: 'akomodasi-3',
            name: 'Hotel O Solo Baru Homestay Syariah',
            address: 'Jl. R. E. Martadinata, Nagoya',
            rating: 9.6,
            ratingLabel: 'Exceptional',
            price: 69996,
            thumbnail: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2849&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Penginapan syariah yang bersih dan tenang, cocok untuk wisatawan dengan budget terbatas.',
            starRating: 2,
            category: 'homestay'
        },
        {
            id: 'akomodasi-4',
            name: 'Aston Batam Hotel & Residence',
            address: 'Jalan Sudirman No. 1, Baloi',
            rating: 8.4,
            ratingLabel: 'Very Good',
            price: 1304009,
            thumbnail: 'https://images.unsplash.com/photo-1549294413-26f195200c37?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Kamar-kamar luas dengan pemandangan kota. Cocok untuk liburan keluarga.',
            starRating: 5,
            category: 'hotel-bintang-5'
        },
        {
            id: 'akomodasi-5',
            name: 'HARRIS Hotel Batam Center',
            address: 'Jalan Engku Putri, Batam Center',
            rating: 8.1,
            ratingLabel: 'Very Good',
            price: 818000,
            thumbnail: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Berada di lokasi strategis dekat pelabuhan feri dan pusat pemerintahan. Ideal untuk bisnis dan rekreasi.',
            starRating: 4,
            category: 'hotel-bintang-4'
        },
        {
            id: 'akomodasi-6',
            name: 'Planet Holiday Hotel & Residence',
            address: 'Jl. Raja Ali Haji No. 2, Nagoya',
            rating: 8.2,
            ratingLabel: 'Very Good',
            price: 667359,
            thumbnail: 'https://images.unsplash.com/photo-1596386866114-1d6da177e0be?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Menawarkan berbagai fasilitas rekreasi dan kenyamanan untuk para tamu, termasuk kolam renang dan spa.',
            starRating: 4,
            category: 'hotel-bintang-4'
        },
        {
            id: 'akomodasi-7',
            name: 'Ando Hotel Batam',
            address: 'Jl. Imam Bonjol, Nagoya',
            rating: 8.6,
            ratingLabel: 'Excellent',
            price: 490000,
            thumbnail: 'https://images.unsplash.com/photo-1571896349842-33c89406eb73?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Penginapan terjangkau dengan kamar yang bersih dan staf yang ramah, berlokasi di pusat kota.',
            starRating: 3,
            category: 'hotel-bintang-3'
        },
        {
            id: 'akomodasi-8',
            name: 'Woda Villa & Spa',
            address: 'Nongsa, Batam',
            rating: 9.1,
            ratingLabel: 'Excellent',
            price: 1047140,
            thumbnail: 'https://images.unsplash.com/photo-1571746686127-142f1f008271?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Vila pribadi dengan pemandangan laut dan fasilitas spa, menawarkan pengalaman liburan yang mewah.',
            starRating: 5,
            category: 'villa'
        },
        {
            id: 'akomodasi-9',
            name: 'Hotel Santika Batam',
            address: 'Jalan Engku Putri, Batam Center',
            rating: 8.5,
            ratingLabel: 'Very Good',
            price: 828000,
            thumbnail: 'https://images.unsplash.com/photo-1582234796328-912b32230a10?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Hotel bintang 4 dengan kolam renang outdoor dan pilihan makanan yang beragam.',
            starRating: 4,
            category: 'hotel-bintang-4'
        },
        {
            id: 'akomodasi-10',
            name: 'ARTOTEL Batam',
            address: 'Jalan Pembangunan No.1, Baloi',
            rating: 8.3,
            ratingLabel: 'Very Good',
            price: 1035000,
            thumbnail: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2849&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Hotel butik dengan desain artistik yang unik, terletak di pusat kota.',
            starRating: 4,
            category: 'hotel-bintang-4'
        },
    ],
    kuliner: [
        {
            id: 'kuliner-1',
            name: 'Mie Tarempa',
            address: 'Komplek Penuin Centre',
            rating: 9.5,
            ratingLabel: 'Exceptional',
            price: 35000,
            thumbnail: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Restoran legendaris dengan menu khas mie tarempa yang lezat.',
            category: 'makanan-lokal'
        },
        {
            id: 'kuliner-2',
            name: 'Seafood 212',
            address: 'Jalan Imam Bonjol, Nagoya',
            rating: 8.8,
            ratingLabel: 'Excellent',
            price: 125000,
            thumbnail: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Restoran seafood segar dengan berbagai olahan ikan dan udang khas Batam.',
            category: 'restoran'
        },
        {
            id: 'kuliner-3',
            name: 'Kafe Kolong',
            address: 'Jalan Engku Putri, Batam Center',
            rating: 8.5,
            ratingLabel: 'Very Good',
            price: 45000,
            thumbnail: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Kafe cozy dengan menu kopi specialty dan makanan ringan yang Instagram-able.',
            category: 'kafe'
        },
    ],
    wisata: [
        {
            id: 'wisata-1',
            name: 'Jembatan Barelang',
            address: 'Jalan Trans Barelang',
            rating: 9.8,
            ratingLabel: 'Excellent',
            price: 0,
            thumbnail: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Ikon kota Batam dengan pemandangan matahari terbenam yang memukau.',
            category: 'jembatan'
        },
        {
            id: 'wisata-2',
            name: 'Pantai Melur',
            address: 'Galang, Batam',
            rating: 8.5,
            ratingLabel: 'Very Good',
            price: 10000,
            thumbnail: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Pantai dengan pasir putih dan air laut jernih, cocok untuk berenang dan bersantai.',
            category: 'pantai'
        },
        {
            id: 'wisata-3',
            name: 'Taman Mubeng',
            address: 'Batu Aji, Batam',
            rating: 8.2,
            ratingLabel: 'Very Good',
            price: 5000,
            thumbnail: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Taman rekreasi keluarga dengan berbagai permainan dan spot foto menarik.',
            category: 'taman'
        },
    ],
    hiburan: [
        {
            id: 'hiburan-1',
            name: 'BCS Mall Cinema',
            address: 'BCS Mall, Batam Center',
            rating: 8.3,
            ratingLabel: 'Very Good',
            price: 40000,
            thumbnail: 'https://images.unsplash.com/photo-1489185078819-c0b30e7449e6?q=80&w=2942&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Bioskop modern dengan teknologi terbaru dan kenyamanan terbaik.',
            category: 'bioskop'
        },
        {
            id: 'hiburan-2',
            name: 'KTV Nongsa',
            address: 'Nongsa Point Marina',
            rating: 8.1,
            ratingLabel: 'Very Good',
            price: 120000,
            thumbnail: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Karaoke premium dengan sound system berkualitas tinggi dan ruangan yang nyaman.',
            category: 'karaoke'
        },
    ],
    transportasi: [
        {
            id: 'transportasi-1',
            name: 'Batam Car Rental',
            address: 'Jalan Ahmad Yani, Batam Center',
            rating: 8.7,
            ratingLabel: 'Excellent',
            price: 250000,
            thumbnail: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Layanan rental mobil dengan armada terawat dan harga terjangkau.',
            category: 'rental-mobil'
        },
        {
            id: 'transportasi-2',
            name: 'Batam Fast Ferry',
            address: 'Pelabuhan Sekupang',
            rating: 8.5,
            ratingLabel: 'Very Good',
            price: 180000,
            thumbnail: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Layanan ferry cepat dan nyaman ke Singapura dan Malaysia.',
            category: 'ferry'
        },
    ],
    bisnis: [
        {
            id: 'bisnis-1',
            name: 'Coworking Batam Center',
            address: 'Menara BRI, Batam Center',
            rating: 8.6,
            ratingLabel: 'Excellent',
            price: 150000,
            thumbnail: 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Ruang kerja bersama modern dengan fasilitas lengkap dan internet cepat.',
            category: 'coworking'
        },
        {
            id: 'bisnis-2',
            name: 'Meeting Room Nagoya',
            address: 'Nagoya Hill Mall, Lantai 3',
            rating: 8.3,
            ratingLabel: 'Very Good',
            price: 300000,
            thumbnail: 'https://images.unsplash.com/photo-1431540015161-0bf868a2d407?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
            description: 'Ruang meeting profesional dengan kapasitas hingga 20 orang dan peralatan presentasi lengkap.',
            category: 'meeting-room'
        },
    ]
};

const subcategories: Record<string, { value: string; label: string }[]> = {
    akomodasi: [
        { value: 'hotel-bintang-5', label: 'Hotel Bintang 5' },
        { value: 'hotel-bintang-4', label: 'Hotel Bintang 4' },
        { value: 'hotel-bintang-3', label: 'Hotel Bintang 3' },
        { value: 'villa', label: 'Villa' },
        { value: 'homestay', label: 'Homestay' },
    ],
    kuliner: [
        { value: 'restoran', label: 'Restoran' },
        { value: 'kafe', label: 'Kafe' },
        { value: 'makanan-lokal', label: 'Makanan Lokal' },
    ],
    wisata: [
        { value: 'pantai', label: 'Pantai' },
        { value: 'taman', label: 'Taman' },
        { value: 'museum', label: 'Museum' },
        { value: 'jembatan', label: 'Jembatan' },
    ],
    hiburan: [
        { value: 'bioskop', label: 'Bioskop' },
        { value: 'karaoke', label: 'Karaoke' },
        { value: 'game-center', label: 'Game Center' },
        { value: 'klub-malam', label: 'Klub Malam' },
    ],
    transportasi: [
        { value: 'rental-mobil', label: 'Rental Mobil' },
        { value: 'ojek-online', label: 'Ojek Online' },
        { value: 'bus', label: 'Bus' },
        { value: 'ferry', label: 'Ferry' },
    ],
    bisnis: [
        { value: 'coworking', label: 'Coworking Space' },
        { value: 'meeting-room', label: 'Meeting Room' },
        { value: 'office-space', label: 'Office Space' },
        { value: 'business-center', label: 'Business Center' },
    ]
};

const categoryTitles: Record<string, string> = {
    akomodasi: 'Akomodasi',
    kuliner: 'Kuliner', 
    wisata: 'Wisata',
    hiburan: 'Hiburan',
    transportasi: 'Transportasi',
    bisnis: 'Bisnis'
};

export default function CategoryListPage() {
    const params = useParams();
    const router = useRouter();
    const categoryName = params.categoriesName as string;

    const [items, setItems] = useState<Item[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSubcategory, setSelectedSubcategory] = useState('all');
    const [sortOption, setSortOption] = useState('terbaru');
    const [filters, setFilters] = useState<Filters>({
        starRating: [],
        reviewScore: [],
        priceRange: []
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const data = dummyItems[categoryName?.toLowerCase()] || [];
        setItems(data);
        setIsLoading(false);
    }, [categoryName]);

    const formatPrice = (price: number) => {
        if (price === 0) return 'Gratis';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
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

    const getRatingCategory = (rating: number): string => {
        if (rating >= 9.0) return 'Exceptional';
        if (rating >= 8.5) return 'Excellent';
        if (rating >= 8.0) return 'Very Good';
        if (rating >= 7.0) return 'Good';
        if (rating >= 6.0) return 'Fair';
        return 'Poor';
    };

    const renderStars = (starRating?: number) => {
        if (!starRating) return null;
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

    const handleItemClick = (item: any) => {
        // Navigate to: /category/[categoriesName]/detail/[id]
        router.push(`/category/${categoryName}/detail/${item.id}`);
    };

    // Fungsi filtering dan sorting dengan useMemo untuk optimasi
    const filteredAndSortedItems = useMemo(() => {
        let filtered = [...items];

        // Filter berdasarkan search term
        if (searchTerm.trim()) {
            filtered = filtered.filter(item =>
                item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Filter berdasarkan subkategori
        if (selectedSubcategory !== 'all') {
            filtered = filtered.filter(item => item.category === selectedSubcategory);
        }

        // Filter berdasarkan star rating
        if (filters.starRating.length > 0) {
            filtered = filtered.filter(item =>
                item.starRating && filters.starRating.includes(item.starRating.toString())
            );
        }

        // Filter berdasarkan review score
        if (filters.reviewScore.length > 0) {
            filtered = filtered.filter(item =>
                filters.reviewScore.includes(getRatingCategory(item.rating))
            );
        }

        // Sorting
        filtered.sort((a, b) => {
            switch (sortOption) {
                case 'harga-terendah':
                    return a.price - b.price;
                case 'harga-tertinggi':
                    return b.price - a.price;
                case 'rating':
                    return b.rating - a.rating;
                case 'terpopuler':
                    return b.rating - a.rating; // Menggunakan rating sebagai proxy popularitas
                case 'terbaru':
                default:
                    return 0; // Urutan asli
            }
        });

        return filtered;
    }, [items, searchTerm, selectedSubcategory, filters, sortOption]);

    if (isLoading) {
        return (
            <div className="bg-gray-50 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

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
                        <span>{categoryTitles[categoryName] || categoryName}</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        {categoryTitles[categoryName] || categoryName} di Batam
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
                                    {subcategories[categoryName?.toLowerCase()]?.map(sub => (
                                        <option key={sub.value} value={sub.value}>{sub.label}</option>
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
                <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-sm h-fit">
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
                        {categoryName === 'akomodasi' && (
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
                                {['Exceptional', 'Excellent', 'Very Good', 'Good', 'Fair'].map(score => (
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
                                    <option value="terbaru">Terbaru</option>
                                    <option value="terpopuler">Terpopuler</option>
                                    <option value="harga-terendah">Harga Terendah</option>
                                    <option value="harga-tertinggi">Harga Tertinggi</option>
                                    <option value="rating">Rating Tertinggi</option>
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
                        {filteredAndSortedItems.map(item => (
                            <div
                                key={item.id}
                                className="bg-white rounded-2xl shadow-sm overflow-hidden flex flex-col lg:flex-row transition-all duration-200 ease-in-out hover:shadow-lg group-hover:-translate-y-1 group"
                                onClick={() => handleItemClick(item)}
                            >
                                <div className="relative w-full lg:w-48 h-48 lg:h-auto flex-shrink-0">
                                    <Image
                                        src={item.thumbnail}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                    {item.starRating && (
                                        <div className="absolute top-2 left-2 bg-white bg-opacity-90 px-2 py-1 rounded-lg backdrop-blur-sm">
                                            {renderStars(item.starRating)}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 p-6 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-bold text-lg text-gray-800 group-hover:text-blue-600 transition-colors">
                                                {item.name}
                                            </h3>
                                            <div className="flex items-center gap-2 ml-4">
                                                <div className="flex items-center gap-1 bg-green-100 px-2 py-1 rounded-lg">
                                                    <Star className="w-4 h-4 text-green-600 fill-current" />
                                                    <span className="font-bold text-green-600">{item.rating.toFixed(1)}</span>
                                                </div>
                                                <span className="text-sm text-gray-500 whitespace-nowrap">
                                                    {item.ratingLabel}
                                                </span>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                                            <MapPin className="w-4 h-4 flex-shrink-0" />
                                            <span>{item.address}</span>
                                        </div>
                                        
                                        <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
                                            {item.description}
                                        </p>
                                    </div>
                                    
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            {item.rating >= 9.0 && (
                                                <div className="flex items-center gap-1 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                                                    <Award className="w-3 h-3" />
                                                    <span>Top Rated</span>
                                                </div>
                                            )}
                                            {item.rating >= 8.5 && item.rating < 9.0 && (
                                                <div className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    <TrendingUp className="w-3 h-3" />
                                                    <span>Popular</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500 mb-1">
                                                {item.price === 0 ? 'Masuk' : 'Mulai dari'}
                                            </div>
                                            <div className="font-bold text-lg text-blue-600">
                                                {formatPrice(item.price)}
                                            </div>
                                            <button className="mt-2 bg-blue-600 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors group-hover:bg-blue-700">
                                                {categoryName === 'akomodasi' ? 'Cek Ketersediaan' : 'Lihat Detail'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
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