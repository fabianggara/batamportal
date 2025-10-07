// src/app/admin/create/akomodasi/page.tsx
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Utensils, 
  Camera, 
  Car, 
  Heart, 
  GraduationCap, 
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  ChevronRight,
  Users,
  Star,
  TrendingUp
} from 'lucide-react';

// Types untuk kategori
type Category = {
  id: string;
  name: string;
  slug: string;
  icon: React.ElementType;
  color: string;
  gradient: string;
  description: string;
  features: string[];
  count: number;
  trending?: boolean;
};

export default function CreateSubmissionPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // Kategori yang tersedia
  const categories: Category[] = [
    {
      id: '1',
      name: 'Akomodasi',
      slug: 'akomodasi',
      icon: Building2,
      color: '#3B82F6',
      gradient: 'from-blue-500 to-blue-600',
      description: 'Hotel, Villa, Homestay, Guest House',
      features: ['Galeri foto', 'Tipe kamar', 'Fasilitas', 'Lokasi GPS'],
      count: 156,
      trending: true
    },
    {
      id: '2', 
      name: 'Wisata',
      slug: 'wisata',
      icon: MapPin,
      color: '#10B981',
      gradient: 'from-green-500 to-emerald-600',
      description: 'Pantai, Taman, Museum, Tempat Bersejarah',
      features: ['Jam operasional', 'Tiket masuk', 'Fasilitas', 'Galeri'],
      count: 89,
      trending: true
    },
    {
      id: '3',
      name: 'Kuliner', 
      slug: 'kuliner',
      icon: Utensils,
      color: '#F59E0B',
      gradient: 'from-orange-500 to-red-500',
      description: 'Restoran, Kafe, Warung, Street Food',
      features: ['Menu makanan', 'Harga', 'Jam buka', 'Delivery'],
      count: 234
    },
    {
      id: '4',
      name: 'Hiburan',
      slug: 'hiburan', 
      icon: Camera,
      color: '#8B5CF6',
      gradient: 'from-purple-500 to-pink-500',
      description: 'Karaoke, Bioskop, Club, Arcade, Event',
      features: ['Jam operasional', 'Harga tiket', 'Fasilitas', 'Event'],
      count: 67
    },
    {
      id: '5',
      name: 'Transportasi',
      slug: 'transportasi',
      icon: Car, 
      color: '#EF4444',
      gradient: 'from-red-500 to-pink-500',
      description: 'Taksi, Travel, Rental, Ferry',
      features: ['Tarif', 'Rute', 'Jadwal', 'Kontak driver'],
      count: 45
    },
    {
      id: '6',
      name: 'Kesehatan',
      slug: 'kesehatan',
      icon: Heart,
      color: '#06B6D4', 
      gradient: 'from-cyan-500 to-blue-500',
      description: 'Rumah Sakit, Klinik, Apotek',
      features: ['Dokter', 'Jadwal praktek', 'Fasilitas', 'BPJS'],
      count: 78
    },
    {
      id: '7',
      name: 'Pendidikan',
      slug: 'pendidikan',
      icon: GraduationCap,
      color: '#84CC16',
      gradient: 'from-lime-500 to-green-500', 
      description: 'Sekolah, Universitas, Kursus',
      features: ['Program studi', 'Biaya', 'Fasilitas', 'Akreditasi'],
      count: 123
    },
    {
      id: '8',
      name: 'Belanja',
      slug: 'belanja',
      icon: ShoppingBag,
      color: '#F97316',
      gradient: 'from-orange-500 to-amber-500',
      description: 'Mall, Toko, Pasar, Supermarket', 
      features: ['Produk', 'Harga', 'Jam buka', 'Promo'],
      count: 189
    }
  ];

  // Handle category selection
  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category.slug);
    // Redirect ke form spesifik kategori
    router.push(`/admin/businesses/create/${category.slug}`);
  };

  // Stats data
  const totalBusinesses = categories.reduce((sum, cat) => sum + cat.count, 0);
  const trendingCategories = categories.filter(cat => cat.trending);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="max-w-6xl flex items-center">
          <div className='gap-3'>
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </div>
          <div className='text-center mb-12 ms-40'>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Daftarkan Bisnis Anda
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
              Pilih kategori bisnis yang sesuai untuk mendapatkan form pendaftaran yang optimal
            </p>
            {/* Stats */}
            <div className="flex items-center justify-center gap-8 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalBusinesses.toLocaleString()} bisnis terdaftar</span>
              </div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                <span>{trendingCategories.length} kategori trending</span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <div
                key={category.id}
                onClick={() => handleCategorySelect(category)}
                className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
              >
                {/* Card */}
                <div className="bg-white rounded-2xl shadow-md group-hover:shadow-xl transition-all duration-300 overflow-hidden border-2 border-transparent group-hover:border-blue-200">
                  {/* Header with gradient */}
                  <div className={`bg-gradient-to-br ${category.gradient} p-6 text-white relative overflow-hidden`}>
                    <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-8 translate-x-8"></div>
                    <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-8 -translate-x-8"></div>
                    
                    <div className="relative z-10">
                      <Icon className="w-10 h-10 mb-3" />
                      <h3 className="text-xl font-bold mb-2">{category.name}</h3>
                      <div className="flex items-center justify-between">
                        <span className="text-sm opacity-90">{category.count} bisnis</span>
                        <ArrowRight className="w-4 h-4 opacity-75 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <p className="text-gray-600 mb-4 text-sm">
                      {category.description}
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                        <Star className="w-3 h-3" />
                        Form Khusus Tersedia:
                      </h4>
                      <ul className="space-y-1">
                        {category.features.map((feature, index) => (
                          <li key={index} className="text-xs text-gray-500 flex items-center gap-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Action hint */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center justify-between text-xs text-gray-400 group-hover:text-blue-600 transition-colors">
                        <span>Klik untuk lanjut</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Mengapa Pilih BatamPortal?
            </h2>
            <p className="text-gray-600">
              Platform terpercaya untuk mengembangkan bisnis Anda di Batam
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Jangkauan Luas
              </h3>
              <p className="text-sm text-gray-600">
                Ribuan pengguna aktif setiap hari mencari layanan di Batam
              </p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Form Optimal
              </h3>
              <p className="text-sm text-gray-600">
                Setiap kategori memiliki form khusus yang disesuaikan dengan kebutuhan
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Mudah & Gratis
              </h3>
              <p className="text-sm text-gray-600">
                Pendaftaran mudah, gratis, dan bisnis Anda langsung online
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-12">
          <p className="text-sm text-gray-500">
            Butuh bantuan? Hubungi tim support kami di{' '}
            <a href="mailto:support@batamportal.com" className="text-blue-600 hover:text-blue-700">
              support@batamportal.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}