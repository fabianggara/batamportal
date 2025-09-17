'use client'

import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Building, 
  Search, 
  MapPin,
  Utensils,
  Camera,
  Car,
  Briefcase,
  Heart,
  Star,
  Eye,
  TrendingUp,
  Clock,
  Users,
  Award,
  Filter,
  ArrowRight,
  Play,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

const HomePage = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');

  // Set time-based greeting
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');

    // Auto-scroll stats when they come into view
    const timer = setTimeout(() => setStatsVisible(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced categories with real icons and colors
  const categories = [
    { icon: Building, label: "Akomodasi", color: "from-blue-500 to-blue-600", count: "120+" },
    { icon: Utensils, label: "Kuliner", color: "from-orange-500 to-red-500", count: "85+" },
    { icon: MapPin, label: "Wisata", color: "from-green-500 to-emerald-600", count: "67+" },
    { icon: Camera, label: "Hiburan", color: "from-purple-500 to-pink-500", count: "45+" },
    { icon: Car, label: "Transportasi", color: "from-indigo-500 to-blue-500", count: "30+" },
    { icon: Briefcase, label: "Bisnis", color: "from-gray-600 to-gray-700", count: "28+" },
  ];

  // Enhanced recommendations with more realistic data
  const recommendations = [
    {
      id: 1,
      name: "Harris Hotel Batam Center",
      description: "Hotel mewah dengan fasilitas lengkap di jantung kota Batam",
      image: "/api/placeholder/300/200",
      tag: "Hot Deal",
      rating: 4.8,
      price: "Rp 750.000",
      location: "Batam Center",
      category: "Akomodasi"
    },
    {
      id: 2,
      name: "Pantai Melur",
      description: "Pantai indah dengan pasir putih dan air jernih yang memukau",
      image: "/api/placeholder/300/200", 
      tag: "Trending",
      rating: 4.6,
      visitors: "2.3k",
      location: "Galang",
      category: "Wisata"
    },
    {
      id: 3,
      name: "Rumah Makan Sederhana",
      description: "Kuliner khas Batam dengan cita rasa autentik dan harga terjangkau",
      image: "/api/placeholder/300/200",
      tag: "Local Favorite", 
      rating: 4.7,
      price: "Rp 50.000",
      location: "Nagoya",
      category: "Kuliner"
    },
    {
      id: 4,
      name: "Batam Mini Golf",
      description: "Arena mini golf outdoor dengan pemandangan kota yang menakjubkan",
      image: "/api/placeholder/300/200",
      tag: "Family Fun",
      rating: 4.5,
      visitors: "1.8k",
      location: "Nagoya Hill",
      category: "Hiburan"
    }
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
      cta: "Coba Sekarang"
    },
    {
      id: 3,
      title: "DESTINASI WISATA",
      subtitle: "Keindahan Alam Yang Memukau",
      image: "/api/placeholder/1200/400", 
      cta: "Kunjungi"
    }
  ];

  // Statistics counter
  const stats = [
    { icon: Building, label: "Total Bisnis", value: 350, suffix: "+" },
    { icon: Users, label: "Pengguna Aktif", value: 12500, suffix: "+" },
    { icon: Star, label: "Rating Rata-rata", value: 4.7, suffix: "/5" },
    { icon: Award, label: "Tahun Berpengalaman", value: 5, suffix: "" }
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

  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'Hot Deal': return 'bg-red-500';
      case 'Trending': return 'bg-blue-500';
      case 'Local Favorite': return 'bg-green-500';
      case 'Family Fun': return 'bg-purple-500';
      default: return 'bg-orange-500';
    }
  };

  const getTimeIcon = () => {
    switch (timeOfDay) {
      case 'morning': return <Sun className="w-5 h-5 text-yellow-500" />;
      case 'afternoon': return <Sun className="w-5 h-5 text-orange-500" />;
      case 'evening': return <Moon className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Enhanced Search */}
      <div className="bg-white shadow-lg relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-20 w-16 h-16 bg-green-500 rounded-full animate-bounce delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-purple-500 rounded-full animate-pulse delay-500"></div>
        </div>
        
        <div className="relative max-w-6xl mx-auto px-4 py-8">
          {/* Time-based Greeting */}
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
                className="w-full px-6 py-4 pr-20 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
              />
              <div className="absolute right-2 top-2 flex gap-2">
                <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                  <Filter className="w-5 h-5" />
                </button>
                <button className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors">
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            {/* Quick Search Suggestions */}
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {['Hotel Murah', 'Kuliner Khas', 'Pantai Indah', 'Spa & Massage'].map((suggestion, index) => (
                <button 
                  key={index}
                  className="px-4 py-2 bg-gray-100 hover:bg-blue-100 hover:text-blue-600 rounded-full text-sm transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-4 space-y-12">
        
        {/* Enhanced Categories Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Jelajahi Kategori</h2>
            <button className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Lihat Semua <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <div
                  key={index}
                  onClick={() => setActiveCategory(index)}
                  className={`group relative overflow-hidden rounded-xl p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 hover:shadow-lg ${
                    activeCategory === index 
                      ? 'shadow-xl ring-2 ring-blue-500' 
                      : 'shadow-md'
                  }`}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-90 group-hover:opacity-100 transition-opacity`}></div>
                  <div className="relative z-10 text-center text-white">
                    <Icon className="w-8 h-8 mx-auto mb-3 group-hover:animate-bounce" />
                    <h3 className="font-semibold text-sm mb-1">{category.label}</h3>
                    <p className="text-xs opacity-90">{category.count}</p>
                  </div>
                  
                  {/* Sparkle effect */}
                  <div className="absolute top-2 right-2">
                    <Zap className="w-3 h-3 text-yellow-300 animate-pulse" />
                  </div>
                </div>
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
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors">
                <TrendingUp className="w-4 h-4 inline mr-1" /> Trending
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Clock className="w-4 h-4 inline mr-1" /> Terbaru
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <div 
                key={item.id} 
                className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="relative overflow-hidden">
                  <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center text-gray-500 relative">
                    <Camera className="w-12 h-12" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                  
                  {/* Tag Badge */}
                  <div className={`absolute top-3 left-3 ${getTagColor(item.tag)} text-white text-xs px-2 py-1 rounded-full font-medium`}>
                    {item.tag}
                  </div>
                  
                  {/* Category Badge */}
                  <div className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                    {item.category}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-4 h-4 fill-current" />
                      <span className="text-sm font-medium text-gray-700">{item.rating}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {item.location}
                    </div>
                    {item.price && (
                      <div className="font-semibold text-blue-600">{item.price}</div>
                    )}
                    {item.visitors && (
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {item.visitors}
                      </div>
                    )}
                  </div>
                  
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform group-hover:scale-105">
                    Lihat Detail
                  </button>
                </div>
              </div>
            ))}
          </div>
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
                    {/* Animated Background Pattern */}
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
                      <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors transform hover:scale-105">
                        {slide.cta}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Enhanced Navigation */}
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
            
            {/* Slide Indicators */}
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
          <button className="bg-white text-green-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-all transform hover:scale-105">
            Daftar Sekarang - GRATIS!
          </button>
        </section>
      </div>
    </div>
  );
};

export default HomePage;