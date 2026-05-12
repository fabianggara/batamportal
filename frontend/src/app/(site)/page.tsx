'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation'; 
import Link from "next/link";
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';
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
  Star,
  Users,
  Award,
  Filter,
  ArrowRight,
  Zap,
  Sun,
  Moon
} from 'lucide-react';

// === INTERFACES & TYPES ===
interface RecommendationItem {
  id: number;
  name: string;
  thumbnail_image?: string;
  address: string;
  category?: string;
  type: string;
  latitude?: number;
  longitude?: number;
}

interface PopularData {
  id: number;
  name: string;
  thumbnail_image: string;
  category: string;
  slug: string; // <-- TAMBAHKAN INI
  rating: number;
}

type ButtonPropType = {
  enabled: boolean;
  onClick: () => void;
};

interface HomepageData {
  akomodasi: RecommendationItem[];
  kuliner: RecommendationItem[];
  wisata: RecommendationItem[];
}

// === BUTTON COMPONENTS ===
const PrevButton: React.FC<ButtonPropType> = ({ enabled, onClick }) => (
  <button
    className="absolute top-1/2 left-2 sm:left-4 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={!enabled}
    aria-label="Previous slide"
  >
    <ChevronLeft className="w-6 h-6 text-gray-800" />
  </button>
);

const NextButton: React.FC<ButtonPropType> = ({ enabled, onClick }) => (
  <button
    className="absolute top-1/2 right-2 sm:right-4 -translate-y-1/2 z-10 bg-white/70 hover:bg-white rounded-full p-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
    onClick={onClick}
    disabled={!enabled}
    aria-label="Next slide"
  >
    <ChevronRight className="w-6 h-6 text-gray-800" />
  </button>
);


// === MAIN COMPONENT ===
const HomePage = () => {
  const router = useRouter();

  // === STATES ===
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [statsVisible, setStatsVisible] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<'morning' | 'afternoon' | 'evening'>('morning');
  const [recommendations, setRecommendations] = useState<HomepageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [popularData, setPopularData] = useState<any[]>([]); // Untuk data slider
  const [carouselLoading, setCarouselLoading] = useState(true); // Untuk status loading slider
  const [personalRecommendations, setPersonalRecommendations] = useState<RecommendationItem[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);

  // === EMBLA CAROUSEL LOGIC ===
  const autoplay = Autoplay({ delay: 5000, stopOnInteraction: false });
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true }, [autoplay]);
  const [prevBtnEnabled, setPrevBtnEnabled] = useState(false);
  const [nextBtnEnabled, setNextBtnEnabled] = useState(false);

  const scrollPrev = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollPrev();
      autoplay.reset();
    }
  }, [emblaApi, autoplay]);

  const scrollNext = useCallback(() => {
    if (emblaApi) {
      emblaApi.scrollNext();
      autoplay.reset();
    }
  }, [emblaApi, autoplay]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setPrevBtnEnabled(emblaApi.canScrollPrev());
    setNextBtnEnabled(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  // Ambil lokasi pengguna saat halaman dimuat
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => console.error("Gagal mengambil lokasi:", error)
      );
    }
  }, []);

  // Fungsi Haversine untuk hitung jarak
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; // Jari-jari Bumi dalam km

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 1 
      ? `${(distance * 1000).toFixed(0)} m` 
      : `${distance.toFixed(1)} km`;
  };

  // === DATA FETCHING & SIDE EFFECTS ===
  useEffect(() => {
    const fetchHomepageData = async () => {
      try {
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

useEffect(() => {
  const fetchPopularData = async () => {
    setCarouselLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/recommendations/popular");
      const json = await res.json();
      
      if (json.success) {
        // FILTER DATA DI SINI
        const filteredData = json.data.filter((item: any) => {
          // Kita ubah ke lowercase agar pengecekan tidak sensitif huruf besar/kecil
          const category = item.category?.toLowerCase();
          return category === 'kuliner' || category === 'akomodasi';
        });
        
        setPopularData(filteredData); 
      }
    } catch (err) {
      console.error("Error fetching popular recommendations:", err);
    } finally {
      setCarouselLoading(false);
    }
  };
  fetchPopularData();
}, []);

  useEffect(() => {
  const fetchPersonalRecommendations = async () => {
    try {
      // Ambil token dari localStorage seperti yang Anda lakukan di bagian lain
      const token = localStorage.getItem('authToken');
      
      const res = await fetch('http://localhost:5000/api/recommendations/for-me', {
        headers: {
          // Tambahkan baris ini agar backend mengenali siapa Anda
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        credentials: 'include' 
      });

      if (!res.ok) {
        throw new Error('User not logged in or no personal data');
      }

      const json = await res.json();

      if (json.success && json.data.length > 0) {
        setPersonalRecommendations(json.data);
      } else {
        // Jika data kosong, pastikan state juga kosong agar section tersembunyi
        setPersonalRecommendations([]);
      }
    } catch (error) {
      console.log('Tidak ada rekomendasi personal:', (error as Error).message);
      setPersonalRecommendations([]); 
    }
  };

  fetchPersonalRecommendations();
}, []);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setTimeOfDay('morning');
    else if (hour < 18) setTimeOfDay('afternoon');
    else setTimeOfDay('evening');
    
    const timer = setTimeout(() => setStatsVisible(true), 1000);
    const heroSliderTimer = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % slides.length);
    }, 5000);

    return () => {
        clearTimeout(timer);
        clearInterval(heroSliderTimer);
    };
  }, []);


  // === STATIC DATA & CONFIGS ===
const categories = [
    { icon: Building, label: "Akomodasi", status: null, color: "from-blue-500 to-blue-600", count: "120+", link: "/category/akomodasi" },
    { icon: Utensils, label: "Kuliner", status: null, color: "from-orange-500 to-red-500", count: "85+", link: "/category/kuliner" },
    // Wisata sekarang di-set menjadi Coming Soon dan berwarna abu-abu
    { icon: MapPin, label: "Wisata", status: "Coming Soon", color: "from-gray-400 to-gray-500", count: "0+", link: "#" },  
    { icon: Camera, label: "Hiburan", status: "Coming Soon", color: "from-gray-400 to-gray-500", count: "0+", link: "#" },
    { icon: Car, label: "Transportasi", status: "Coming Soon", color: "from-gray-400 to-gray-500", count: "0+", link: "#" },
    { icon: Briefcase, label: "Bisnis", status: "Coming Soon", color: "from-gray-400 to-gray-500", count: "0+", link: "#" },
  ];

  const slides = [
    { id: 1, title: timeOfDay === 'morning' ? "SELAMAT PAGI BATAM!" : timeOfDay === 'afternoon' ? "SELAMAT SIANG BATAM!" : "SELAMAT MALAM BATAM!", subtitle: "Temukan Pengalaman Tak Terlupakan", cta: "Jelajahi Sekarang" },
    { id: 2, title: "KULINER TERBAIK", subtitle: "Nikmati Cita Rasa Khas Batam", cta: "Coba Sekarang", link: "/category/kuliner" },
    { id: 3, title: "DESTINASI WISATA", subtitle: "Keindahan Alam Yang Memukau", cta: "Kunjungi", link: "/category/wisata" }
  ];

  const stats = [
    { icon: Building, label: "Total Bisnis", value: 375, suffix: "+" },
    { icon: Users, label: "Pengguna Aktif", value: 12500, suffix: "+" },
    { icon: Star, label: "Rating Rata-rata", value: 4.8, suffix: "/5" },
    { icon: Award, label: "Partner Terpercaya", value: 50, suffix: "+" }
  ];


  // === HANDLER FUNCTIONS ===
  const handleSearch = () => {
    if (searchQuery.trim() !== '') {
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
  
  const heroPrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const heroNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
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
              {/* {getTimeIcon()} */}
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                BatamPortal
              </h1>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Platform terpercaya untuk menemukan bisnis dan destinasi terbaik di Kota Batam
            </p>
          </div>

          {/* Enhanced Search Bar - GANTI BAGIAN INI */}
<div className="relative max-w-2xl mx-auto">
  <div className="relative transition-all duration-300">
    <input
      type="text"
      placeholder="Cari hotel, restoran, wisata, atau layanan lainnya..."
      // HUBUNGKAN STATE & HANDLER DI SINI
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      onKeyDown={handleKeyDown}
      className="w-full px-6 py-4 pr-20 text-lg border-2 border-gray-200 rounded-full focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-lg"
    />
    <div className="absolute right-2 top-2 flex gap-2">
      <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
        <Filter className="w-5 h-5" />
      </button>
      <button 
        // HUBUNGKAN FUNGSI SEARCH DI SINI
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
                { label: 'Hotel Murah', link: '/category/akomodasi' },
                { label: 'Kuliner Khas', link: '/category/kuliner' },
                { label: 'Pantai Indah', link: '/category/wisata' },
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
        
        {/* Embla Carousel Section */}
        <section className="mt-12">
  <div className="flex items-center justify-between mb-6">
    <div>
      <h2 className="text-3xl font-bold text-gray-800">Rekomendasi Terpopuler 🔥</h2>
      <p className="text-gray-600">Pilihan terbaik yang sering dikunjungi di Batam</p>
    </div>
  </div>

  <div className="relative">
    {/* Tampilkan Skeleton Loader saat loading */}
    {carouselLoading ? (
      /* Pastikan aspect-ratio di sini (2.3/1) sama dengan konten asli */
      <div className="w-full aspect-video sm:aspect-[2.3/1] rounded-xl bg-gray-200 animate-pulse"></div>
    ) : (
      <>
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex">
            {popularData.map((item: any) => (
              <div key={item.id} className="relative flex-grow-0 flex-shrink-0 w-full basis-full min-w-0 pr-1">
                {/* Tambahkan scroll={true} untuk memaksa browser ke atas saat pindah rute */}
                <Link 
                  href={`/category/${item.slug}/detail/${item.id}`} 
                  scroll={true}
                  className="relative block group aspect-video sm:aspect-[2.3/1] rounded-xl overflow-hidden shadow-md"
                >
                  <img 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    src={`http://localhost:5000/uploads/${item.thumbnail_image || item.image}`}
                    alt={item.name} 
                    loading="lazy"
                  />
                  
                  {/* Overlay Gradasi agar teks terbaca jelas */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  <div className="absolute bottom-0 left-0 p-5 sm:p-8 text-white w-full">
                    <span className="inline-block text-xs font-bold bg-blue-600 px-3 py-1 rounded-md uppercase tracking-wider mb-3 shadow-lg">
                      {item.category}
                    </span>
                    <h3 className="text-xl sm:text-3xl font-bold drop-shadow-xl leading-tight">
                      {item.name}
                    </h3>
                    
                    {item.rating && (
                      <div className="flex items-center mt-3 bg-black/20 backdrop-blur-sm w-fit px-3 py-1 rounded-full border border-white/20">
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star 
                              key={i} 
                              className={`w-3.5 h-3.5 ${i < Math.floor(item.rating) ? 'text-yellow-400 fill-current' : 'text-gray-400'}`} 
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm font-bold">{item.rating}</span>
                      </div>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
        
        {/* Navigasi Carousel */}
        {popularData.length > 1 && (
          <div className="hidden sm:block">
            <PrevButton onClick={scrollPrev} enabled={prevBtnEnabled} />
            <NextButton onClick={scrollNext} enabled={nextBtnEnabled} />
          </div>
        )}
      </>
    )}
  </div>
</section>

{/* BAGIAN REKOMENDASI PERSONAL (HANYA MUNCUL JIKA ADA DATA) */}
{personalRecommendations.length > 0 && (
  <section>
    <div className="flex items-center justify-between mb-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Rekomendasi Untuk Anda</h2>
        <p className="text-gray-600">Berdasarkan tempat yang Anda sukai dan kunjungi</p>
      </div>
    
    {/* --- TOMBOL NAVIGASI DITAMBAHKAN DI SINI --- */}
      <Link 
        href="/recommendations" 
        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors group"
      >
        Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* PENAMBAHAN .slice(0, 4) AGAR HANYA TAMPIL 4 KOTAK SAJA */}
      {personalRecommendations.slice(0, 4).map((item: any) => (
        <div 
          key={`personal-${item.id}`} 
          className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
        >
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
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{item.address}</span>
              </div>
              
              {/* Info Jarak GPS - Muncul jika lokasi user & data bisnis ada */}
              {userLocation && item.latitude && item.longitude && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                  {calculateDistance(userLocation.lat, userLocation.lon, Number(item.latitude), Number(item.longitude))}
                </span>
              )}
            </div>
            <button 
                className="w-full mt-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white py-2 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-700 transition-all shadow-md active:scale-95"
                onClick={() => router.push(`/category/${item.type}/detail/${item.id}`)}
              >
                Lihat Detail
            </button>
          </div>
        </div>
      ))}
    </div>
  </section>
)}

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
                  href={category.status ? "#" : category.link} // Mencegah pindah halaman jika statusnya Coming Soon
                  onClick={(e) => {
                    if (category.status) {
                      e.preventDefault(); // Mencegah scroll ke atas jika klik kategori Coming Soon
                    } else {
                      handleCategoryClick(index);
                    }
                  }}
                  className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 min-h-[140px] flex flex-col justify-center ${
                    category.status 
                      ? 'cursor-not-allowed opacity-80' 
                      : 'cursor-pointer hover:shadow-xl'
                  } ${
                    activeCategory === index 
                      ? 'shadow-2xl ring-2 ring-inset ring-blue-500' 
                      : 'shadow-lg'
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
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-white transition-colors flex flex-col items-center leading-tight">
                    <span>{category.label}</span>
                    {category.status && (
                      <span className="text-[10px] opacity-80 mt-1 font-normal italic">
                        ({category.status})
                      </span>
                    )}
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
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-700">Akomodasi Pilihan</h3>
                  <Link 
                    href="/category/akomodasi" 
                    className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors group text-sm sm:text-base"
                  >
                    Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
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
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1 text-sm text-gray-500 truncate">
                            <MapPin className="w-3 h-3 flex-shrink-0" />
                            <span className="truncate">{item.address}</span>
                          </div>
                          
                          {/* Info Jarak GPS - Muncul jika lokasi user & data bisnis ada */}
                          {userLocation && item.latitude && item.longitude && (
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                              {calculateDistance(userLocation.lat, userLocation.lon, Number(item.latitude), Number(item.longitude))}
                            </span>
                          )}
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

{/* --- KULINER PILIHAN --- */}
{recommendations.kuliner && recommendations.kuliner.length > 0 && (
  <div className="mt-12">
    <div className="flex items-center justify-between mb-6">
      <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
        <Utensils className="w-5 h-5 text-orange-500" /> Kuliner Pilihan
      </h3>
      <Link 
        href="/category/kuliner" 
        className="text-blue-600 hover:text-blue-700 flex items-center gap-2 font-medium transition-colors group"
      >
        Lihat Semua <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </Link>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {recommendations.kuliner.map((item: any) => (
        <div key={`kuliner-${item.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col">
          <div className="relative overflow-hidden h-48">
            {item.thumbnail_image ? (
              <img
                src={`http://localhost:5000/uploads/${item.thumbnail_image.trim()}`}
                alt={item.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
            ) : (
              <div className="bg-gray-200 h-full flex items-center justify-center text-gray-500">
                <Camera className="w-12 h-12" />
              </div>
            )}
            <div className="absolute top-3 right-3 bg-orange-600 text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase">
              {item.category}
            </div>
          </div>
          <div className="p-4 flex flex-col flex-1">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">{item.name}</h3>
            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex items-center gap-1 text-sm text-gray-500 truncate flex-1">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{item.address}</span>
              </div>
              {userLocation && item.latitude && (
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded whitespace-nowrap">
                  {calculateDistance(userLocation.lat, userLocation.lon, Number(item.latitude), Number(item.longitude))}
                </span>
              )}
            </div>
            <Link 
              href={`/category/kuliner/detail/${item.id}`}
              scroll={true}
              className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 text-white py-2 rounded-lg font-semibold text-center block shadow-md active:scale-95"
            >
              Lihat Detail
            </Link>
          </div>
        </div>
      ))}
    </div>
  </div>
)}
        
    </div>
        )}
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