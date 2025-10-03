// frontend/src/app/(site)/page.tsx
'use client'

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from "next/link";
import { useRouter } from 'next/navigation'; 
import Image from 'next/image'; // Menggunakan Image bawaan Next.js
import { 
    ChevronLeft, ChevronRight, Building, Search, MapPin, Utensils, Camera, Car, Briefcase, Heart, 
    Star, Eye, TrendingUp, Clock, Users, Award, Filter, ArrowRight, Play, Zap, Sun, Moon 
} from 'lucide-react';
interface RecommendationItem {
  id: number;
  name: string;
  thumbnail_image?: string;
  address: string;
  category?: string;
  type: string; // 'hotel', 'wisata', dll.
}

interface HomepageData {
  akomodasi: RecommendationItem[];
  wisata: RecommendationItem[];
  kuliner: RecommendationItem[];
}

interface CategoryData {
    id: number;
    name: string;
    slug: string;
    icon: string; 
    color_from: string; 
    color_to: string;   
    count: string; 
    is_featured: boolean;
}

// Map string icon name ke komponen Lucide React
const iconMap: { [key: string]: React.ElementType } = {
    Building: Building, Utensils: Utensils, MapPin: MapPin, Camera: Camera, Car: Car, Briefcase: Briefcase, 
    Heart: Heart, Users: Users, Star: Star, Award: Award, Sun: Sun, Moon: Moon, Zap: Zap
};

// --- DATA DUMMY STATIS UNTUK JELAJAHI KATEGORI (Sesuai Desain) ---
const staticCategories: CategoryData[] = [
    { id: 1, icon: 'Building', name: "Akomodasi", color_from: "blue-500", color_to: "blue-600", count: "120+", slug: "akomodasi", is_featured: true },
    { id: 2, icon: 'Utensils', name: "Kuliner", color_from: "orange-500", color_to: "red-500", count: "85+", slug: "kuliner", is_featured: true },
    { id: 3, icon: 'MapPin', name: "Wisata", color_from: "green-500", color_to: "emerald-600", count: "67+", slug: "wisata", is_featured: true },
    { id: 4, icon: 'Camera', name: "Hiburan", color_from: "purple-500", color_to: "pink-500", count: "45+", slug: "hiburan", is_featured: true },
    { id: 5, icon: 'Car', name: "Transportasi", color_from: "indigo-500", color_to: "blue-500", count: "30+", slug: "transportasi", is_featured: true },
    { id: 6, icon: 'Briefcase', name: "Bisnis", color_from: "gray-600", color_to: "gray-700", count: "28+", slug: "bisnis", is_featured: true },
];

// --- KOMPONEN HOMEPAGE ---
const HomePage = () => {
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [recommendations, setRecommendations] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
const fetchHomepageData = async () => {
    try {
      // Panggil endpoint baru untuk data homepage yang dikelompokkan
      const res = await fetch("http://localhost:5000/api/homepage-recommendations");
      const json = await res.json();
      if (json.success) {
        setRecommendations(json.data);
      }
    } catch (err) {
      console.error("Error fetching homepage data:", err);
    } finally {
      setLoading(false);
    }
  };
  fetchHomepageData();
}, []);

    // Data Dinamis
    const [recommendations, setRecommendations] = useState<Business[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState([
        { icon: Building, label: "Total Bisnis", value: 375, suffix: "+" },
        { icon: Users, label: "Pengguna Aktif", value: 12500, suffix: "+" },
        { icon: Star, label: "Rating Rata-rata", value: 4.8, suffix: "/5" },
        { icon: Award, label: "Partner Terpercaya", value: 50, suffix: "+" }
    ]);

  // Enhanced categories dengan routing yang konsisten
  const categories = [
    { 
      icon: Building, 
      label: "Akomodasi", 
      color: "from-blue-500 to-blue-600", 
      count: "120+",
      link: "/category/akomodasi",
      slug: "akomodasi"
    },
    { 
      icon: Utensils, 
      label: "Kuliner", 
      color: "from-orange-500 to-red-500", 
      count: "85+",
      link: "/category/kuliner",
      slug: "kuliner"
    },
    { 
      icon: MapPin, 
      label: "Wisata", 
      color: "from-green-500 to-emerald-600", 
      count: "67+",
      link: "/category/wisata",
      slug: "wisata"
    },
    { 
      icon: Camera, 
      label: "Hiburan", 
      color: "from-purple-500 to-pink-500", 
      count: "45+",
      link: "/category/hiburan",
      slug: "hiburan"
    },
    { 
      icon: Car, 
      label: "Transportasi", 
      color: "from-indigo-500 to-blue-500", 
      count: "30+",
      link: "/category/transportasi",
      slug: "transportasi"
    },
    { 
      icon: Briefcase, 
      label: "Bisnis", 
      color: "from-gray-600 to-gray-700", 
      count: "28+",
      link: "/category/bisnis",
      slug: "bisnis"
    },
  ];

  // Dynamic slides with time-based content
  const slides = [
    {
      id: 1,
      title: timeOfDay === 'morning' ? "SELAMAT PAGI BATAM!" : timeOfDay === 'afternoon' ? "SELAMAT SIANG BATAM!" : "SELAMAT MALAM BATAM!",
      subtitle: "Temukan Pengalaman Tak Terlupakan",
      image: "/api/placeholder/1200/400",
      cta: "Jelajahi Sekarang"
    },
    {
      id: 2,
      title: "KULINER TERBAIK",
      subtitle: "Nikmati Cita Rasa Khas Batam",
      image: "/api/placeholder/1200/400",
      cta: "Coba Sekarang",
      link: "/kategori/kuliner"
    },
    {
      id: 3,
      title: "DESTINASI WISATA",
      subtitle: "Keindahan Alam Yang Memukau",
      image: "/api/placeholder/1200/400", 
      cta: "Kunjungi",
      link: "/kategori/wisata"
    }
  ];

  // Statistics counter
  const stats = [
    { icon: Building, label: "Total Bisnis", value: 375, suffix: "+" },
    { icon: Users, label: "Pengguna Aktif", value: 12500, suffix: "+" },
    { icon: Star, label: "Rating Rata-rata", value: 4.8, suffix: "/5" },
    { icon: Award, label: "Partner Terpercaya", value: 50, suffix: "+" }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto slide
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'afternoon': return <Sun className="w-5 h-5 text-orange-500" />;
      case 'evening': return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

   const handleSearch = () => {
  // Hanya jalankan jika ada isi pencarian
  if (searchQuery.trim() !== '') {
    // Arahkan ke halaman hasil pencarian dengan query
    router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  }
};

const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
};

  const handleCategoryClick = (index: number) => {
    setActiveCategory(index);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Enhanced Search */}
      <div className="bg-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-green-500 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-500 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              {getTimeIcon()}
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BatamPortal
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platform terpercaya untuk menemukan bisnis dan destinasi terbaik di Kota Batam
            </p>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative max-w-2xl mx-auto">
    <div className={`relative transition-all duration-300 ${searchFocused ? 'transform scale-105' : ''}`}>
      <input
        type="text"
        placeholder="Cari hotel, restoran, wisata, atau layanan lainnya..."
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setSearchFocused(false)}
        // === TAMBAHAN BARU: Hubungkan input dengan state ===
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown} // Menangani saat tombol Enter ditekan
        className="w-full px-6 py-4 pr-20 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
      />
      <div className="absolute right-2 top-2 flex gap-2">
        <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
          <Filter className="w-5 h-5" />
        </button>
        <button 
          // === TAMBAHAN BARU: Tambahkan event onClick ===
          onClick={handleSearch}
          className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>
    </div>
            
            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {[
                { label: 'Hotel Murah', link: '/kategori/akomodasi' },
                { label: 'Kuliner Khas', link: '/kategori/kuliner' },
                { label: 'Pantai Indah', link: '/kategori/wisata' },
                { label: 'Spa & Massage', link: '/kategori/hiburan' }
              ].map((suggestion, index) => (
                <Link 
                  key={index}
                  href={suggestion.link}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full text-sm transition-colors cursor-pointer"
                >
                  {suggestion.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-12">
        
        {/* Enhanced Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Jelajahi Kategori</h2>
              <p className="text-gray-600">Temukan berbagai pilihan menarik di Batam</p>
            </div>
            <Link 
              href="/category" 
              className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors group"
            >
              Lihat Semua 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <Link
                  key={index}
                  href={category.link}
                  onClick={() => handleCategoryClick(index)}
                  className={`group relative overflow-hidden rounded-2xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                    activeCategory === index 
                      ? 'shadow-2xl ring-2 ring-blue-500 ring-offset-2' 
                      : 'shadow-lg hover:shadow-xl'
                  }`}
                >
                  {/* Background Gradient */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-all duration-300`}></div>
                  
                  {/* Decorative Elements */}
                  <div className="absolute -top-4 -right-4 w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
                  <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-white bg-opacity-10 rounded-full"></div>
                  
                  {/* Content */}
                  <div className="relative z-10 text-center text-white">
                    <div className="mb-4">
                      <Icon className="w-8 h-8 mx-auto mb-3 group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-white transition-colors">
                      {category.label}
                    </h3>
                    <p className="text-xs opacity-90 group-hover:opacity-100 transition-opacity">
                      {category.count} tempat
                    </p>
                  </div>
                  
                  {/* Sparkle Effect */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
                  </div>
                  
                  {/* Hover Shine Effect */}
                  <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300 transform -skew-x-12 -translate-x-full group-hover:translate-x-full"></div>
                </Link>
              );
            })}
          </div>
        </section>



        {/* Stats Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold mb-2">Dipercaya Ribuan Pengguna</h2>
            <p className="opacity-90">Platform #1 untuk menemukan bisnis terbaik di Batam</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div 
                  key={index} 
                  className="text-center transform transition-all duration-300 hover:scale-110"
                >
                  <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-3">
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className={`text-2xl font-bold mb-1 ${statsVisible ? 'animate-bounce' : ''}`}>
                    {stat.value.toLocaleString()}{stat.suffix}
                  </div>
                  <div className="text-sm opacity-90">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </section>

         {/* Enhanced Recommendations Section */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Rekomendasi Terpopuler</h2>
            <p className="text-gray-600">Pilihan terbaik berdasarkan review pengguna</p>
          </div>
        </div>

        {/* Tampilkan loading jika data belum siap */}
        {loading && (
          <p className="text-center text-gray-500">Loading data...</p>
        )}

        {/* Tampilkan rekomendasi setelah loading selesai dan data ada */}
        {!loading && recommendations && (
          <div className="space-y-12">
            {/* --- REKOMENDASI AKOMODASI --- */}
            {recommendations.akomodasi && recommendations.akomodasi.length > 0 && (
              <div>
                <h3 className="text-xl font-bold text-gray-700 mb-4">Akomodasi Pilihan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {recommendations.akomodasi.map((item: RecommendationItem) => (
                    // Ini adalah komponen kartu Anda
                    <div key={`${item.type}-${item.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                      <div className="relative overflow-hidden">
                        {item.thumbnail_image ? (
                          <img
                            src={`http://localhost:5000/uploads/${item.thumbnail_image.trim()}`}
                            alt={item.name}
                            className="w-full h-48 object-cover"
                          />
                        ) : (
                          <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center text-gray-500">
                            <Camera className="w-12 h-12" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                          {item.category}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate">{item.address}</span>
                        </div>
                        <button 
                          className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                          onClick={() => router.push(`/category/${item.type}/detail/${item.id}`)}
                        >
                          Lihat Detail
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* --- REKOMENDASI WISATA (SUDAH DILENGKAPI) --- */}
      {recommendations.wisata && recommendations.wisata.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">Kuliner Pilihan</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.wisata.map((item: RecommendationItem) => (
              // Kode kartu disalin-tempel ke sini
              <div key={`${item.type}-${item.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  {item.thumbnail_image ? (
                    <img
                      src={`http://localhost:5000/uploads/${item.thumbnail_image.trim()}`}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center text-gray-500">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{item.address}</span>
                  </div>
                  <button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    onClick={() => router.push(`/category/${item.type}/detail/${item.id}`)}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
            
            {/* --- REKOMENDASI KULINER (SUDAH DILENGKAPI) --- */}
      {recommendations.kuliner && recommendations.kuliner.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-700 mb-4">Destinasi Wisata Populer</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.kuliner.map((item: RecommendationItem) => (
              <div key={`${item.type}-${item.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                <div className="relative overflow-hidden">
                  {item.thumbnail_image ? (
                    <img
                      src={`http://localhost:5000/uploads/${item.thumbnail_image.trim()}`}
                      alt={item.name}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center text-gray-500">
                      <Camera className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
                    {item.name}
                  </h3>
                  <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span className="truncate">{item.address}</span>
                  </div>
                  <button 
                    className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all"
                    onClick={() => router.push(`/category/${item.type}/detail/${item.id}`)}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
        )}
      </section>



        {/* Enhanced Carousel Section */}
        <section className="relative">
          <div className="relative overflow-hidden rounded-2xl shadow-2xl">
            <div 
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${currentSlide * 100}%)` }}
            >
              {slides.map((slide, index) => (
                <div key={slide.id} className="w-full flex-shrink-0 relative">
                  <div className="h-80 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full animate-ping"></div>
                      <div className="absolute bottom-20 right-20 w-24 h-24 bg-white rounded-full animate-pulse delay-1000"></div>
                      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-white rounded-full animate-bounce delay-500"></div>
                    </div>
                    <div className="relative z-10 text-center text-white max-w-4xl px-8">
                      <h2 className="text-4xl md:text-6xl font-bold mb-4 animate-fade-in">
                        {slide.title}
                      </h2>
                      <p className="text-xl md:text-2xl mb-8 opacity-90">
                        {slide.subtitle}
                      </p>
                      <Link 
                        href={slide.link || '/kategori'}
                        className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105"
                      >
                        {slide.cta}
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={prevSlide}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 text-white transition-all backdrop-blur-sm"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 bg-white/30 hover:bg-white/50 rounded-full p-3 text-white transition-all backdrop-blur-sm"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    currentSlide === index ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-green-500 to-teal-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Punya Bisnis di Batam?</h2>
          <p className="text-xl mb-6 opacity-90">
            Daftarkan bisnis Anda dan jangkau ribuan pelanggan potensial!
          </p>
          <Link
            href="/submission"
            className="inline-block bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105"
          >
            Daftar Sekarang - GRATIS!
          </Link>
        </section>
      </div>
    </div>
  );
};

export default HomePage;