// app/category/page.tsx

'use client'

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building,
  Utensils,
  MapPin,
  Camera,
  Car,
  Briefcase,
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  Star
} from 'lucide-react';

// Data kategori lengkap
const allCategories = [
  {
    icon: Building,
    label: "Akomodasi",
    description: "Hotel, villa, homestay, dan penginapan terbaik",
    color: "from-blue-500 to-blue-600",
    count: "120+",
    link: "/category/akomodasi",
    slug: "akomodasi",
    featured: true,
    subcategories: ["Hotel Bintang 5", "Hotel Bintang 4", "Villa", "Homestay"]
  },
  {
    icon: Utensils,
    label: "Kuliner",
    description: "Restoran, kafe, dan makanan khas Batam",
    color: "from-orange-500 to-red-500",
    count: "85+",
    link: "/category/kuliner",
    slug: "kuliner",
    featured: true,
    subcategories: ["Restoran", "Kafe", "Makanan Lokal", "Street Food"]
  },
  {
    icon: MapPin,
    label: "Wisata",
    description: "Tempat wisata, pantai, dan destinasi menarik",
    color: "from-green-500 to-emerald-600",
    count: "67+",
    link: "/category/wisata",
    slug: "wisata",
    featured: true,
    subcategories: ["Pantai", "Taman", "Museum", "Wisata Alam"]
  },
  {
    icon: Camera,
    label: "Hiburan",
    description: "Tempat hiburan, bioskop, dan aktivitas seru",
    color: "from-purple-500 to-pink-500",
    count: "45+",
    link: "/category/hiburan",
    slug: "hiburan",
    featured: false,
    subcategories: ["Bioskop", "Karaoke", "Game Center", "Klub Malam"]
  },
  {
    icon: Car,
    label: "Transportasi",
    description: "Rental mobil, ojek online, dan transportasi umum",
    color: "from-indigo-500 to-blue-500",
    count: "30+",
    link: "/category/transportasi",
    slug: "transportasi",
    featured: false,
    subcategories: ["Rental Mobil", "Ojek Online", "Bus", "Ferry"]
  },
  {
    icon: Briefcase,
    label: "Bisnis",
    description: "Coworking space, meeting room, dan layanan bisnis",
    color: "from-gray-600 to-gray-700",
    count: "28+",
    link: "/category/bisnis",
    slug: "bisnis",
    featured: false,
    subcategories: ["Coworking", "Meeting Room", "Office Space", "Business Center"]
  },
];

export default function AllCategoriesPage() {
  const router = useRouter();
  
  const featuredCategories = allCategories.filter(cat => cat.featured);
  const otherCategories = allCategories.filter(cat => !cat.featured);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-4 mb-4">
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Jelajahi Semua Kategori
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Temukan berbagai pilihan terbaik di Batam, dari akomodasi nyaman hingga kuliner lezat
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12 space-y-16">
        {/* Featured Categories */}
        <section>
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
              <h2 className="text-3xl font-bold text-gray-800">Kategori Populer</h2>
              <Star className="w-6 h-6 text-yellow-500 fill-current" />
            </div>
            <p className="text-gray-600">Kategori yang paling banyak dicari pengunjung</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {featuredCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href={category.link}
                  className="group bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:scale-105"
                >
                  {/* Header with gradient */}
                  <div className={`relative h-32 bg-gradient-to-br ${category.color} overflow-hidden`}>
                    {/* Decorative circles */}
                    <div className="absolute -top-4 -right-4 w-24 h-24 bg-white bg-opacity-20 rounded-full"></div>
                    <div className="absolute -bottom-2 -left-2 w-16 h-16 bg-white bg-opacity-10 rounded-full"></div>
                    
                    <div className="relative z-10 h-full flex items-center justify-center">
                      <Icon className="w-12 h-12 text-white group-hover:scale-110 transition-transform duration-300" />
                    </div>

                    {/* Trending badge */}
                    <div className="absolute top-4 right-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-full px-3 py-1">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-green-600" />
                        <span className="text-xs font-medium text-gray-700">Popular</span>
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                        {category.label}
                      </h3>
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">
                        {category.count}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    {/* Subcategories */}
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-2">
                        {category.subcategories.slice(0, 3).map((sub, subIndex) => (
                          <span
                            key={subIndex}
                            className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg text-xs"
                          >
                            {sub}
                          </span>
                        ))}
                        {category.subcategories.length > 3 && (
                          <span className="bg-gray-50 text-gray-600 px-2 py-1 rounded-lg text-xs">
                            +{category.subcategories.length - 3} lainnya
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Lihat semua pilihan</span>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Other Categories */}
        <section>
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Kategori Lainnya</h2>
            <p className="text-gray-600">Eksplorasi lebih banyak pilihan menarik</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {otherCategories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href={category.link}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-lg overflow-hidden transition-all duration-300 border border-gray-100 hover:border-gray-200"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`p-3 rounded-2xl bg-gradient-to-br ${category.color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
                        <Icon className={`w-6 h-6 text-gray-700 group-hover:scale-110 transition-transform`} />
                      </div>
                      <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-medium">
                        {category.count}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-800 mb-2 group-hover:text-blue-600 transition-colors">
                      {category.label}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                      {category.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Eksplorasi sekarang</span>
                      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Statistics */}
        <section className="bg-white rounded-3xl p-8 shadow-lg">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Statistik Platform</h2>
            <p className="text-gray-600">Data terkini dari ekosistem Batam</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">375+</div>
              <div className="text-sm text-gray-600">Total Tempat</div>
              <div className="text-xs text-gray-500 mt-1">Terverifikasi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">4.8</div>
              <div className="text-sm text-gray-600">Rating Rata-rata</div>
              <div className="text-xs text-gray-500 mt-1">Dari 12K+ review</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">6</div>
              <div className="text-sm text-gray-600">Kategori Utama</div>
              <div className="text-xs text-gray-500 mt-1">Lengkap & Terupdate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">50+</div>
              <div className="text-sm text-gray-600">Partner Terpercaya</div>
              <div className="text-xs text-gray-500 mt-1">Bisnis lokal</div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}