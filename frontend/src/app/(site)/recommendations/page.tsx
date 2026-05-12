'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Camera, Loader2, Search, Heart, 
  Sparkles, Star, AlertCircle, ChevronLeft, ChevronRight, RefreshCcw
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function PersonalRecommendationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [likedItems, setLikedItems] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lon: number} | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  // Ref untuk slider Wishlist
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 6371; 
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance < 1 ? `${(distance * 1000).toFixed(0)} m` : `${distance.toFixed(1)} km`;
  };

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({ lat: position.coords.latitude, lon: position.coords.longitude }),
        () => {}
      );
    }
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setErrorMsg(null);
        
        const token = localStorage.getItem('token') || localStorage.getItem('authToken');
        
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        // Fetch Recommendations
        const recRes = await fetch('http://localhost:5000/api/recommendations/for-me', { headers, credentials: 'include' });
        
        if (recRes.status === 401 || recRes.status === 403) {
           setErrorMsg("Sesi login Anda tidak valid. Silakan Logout dan Login kembali.");
           setLoading(false);
           return;
        }

        const recJson = await recRes.json();
        if (recJson.success) {
          setRecommendations(recJson.data || []);
        } else {
          setErrorMsg(recJson.error || "Gagal mengambil data rekomendasi.");
        }

        // Fetch Wishlist
        const likeRes = await fetch('http://localhost:5000/api/interaction/wishlist', { headers, credentials: 'include' });
        const likeJson = await likeRes.json();
        if (likeJson.success) {
          setLikedItems(likeJson.data || []);
        }

      } catch (error: any) {
        setErrorMsg(error.message || "Terjadi kesalahan jaringan.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const isPageCompletelyEmpty = recommendations.length === 0 && likedItems.length === 0;

  const handleReset = async () => {
    const confirmReset = window.confirm('Apakah Anda yakin ingin mengatur ulang AI dan menghapus riwayat minat Anda?');
    if (!confirmReset) return;

    setIsResetting(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('authToken');
      
      const res = await fetch('http://localhost:5000/api/recommendations/reset', {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        credentials: 'include' // <--- INI KUNCI YANG HILANG
      });
      
      const json = await res.json();
      if (res.ok && json.success) {
        // Segarkan halaman agar AI mengambil ulang data dari nol
        window.location.reload();
      } else {
        alert(json.message || json.error || 'Gagal mereset data. Akses ditolak.');
      }
    } catch (error) {
      console.error(error);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-12 relative">
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                Rekomendasi Personal <Sparkles className="w-5 h-5 text-yellow-500 fill-current" />
              </h1>
              <p className="text-sm text-gray-500 hidden sm:block">Disesuaikan berdasarkan preferensi dan kunjungan Anda</p>
            </div>
          </div>

          {/* TOMBOL RESET */}
          <button 
            onClick={handleReset}
            disabled={isResetting}
            className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-medium text-sm transition-colors border border-red-100 disabled:opacity-50"
          >
            {isResetting ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCcw className="w-4 h-4" />}
            <span className="hidden sm:inline">{isResetting ? 'Mereset...' : 'Reset Preferensi'}</span>
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-500 font-medium">Menganalisis selera Anda...</p>
          </div>
        ) : errorMsg ? (
          <div className="bg-red-50 rounded-2xl border border-red-200 p-8 flex flex-col items-center text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <h2 className="text-xl font-bold text-red-700 mb-2">Pemberitahuan</h2>
            <p className="text-red-600 mb-4">{errorMsg}</p>
          </div>
        ) : isPageCompletelyEmpty ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
              <Search className="w-10 h-10 text-blue-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Sistem AI Sedang Mempelajari Selera Anda</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              Kami butuh lebih banyak informasi tentang minat Anda. Mulailah menjelajahi tempat di Batam!
            </p>
            <button onClick={() => router.push('/')} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-colors">
              Mulai Eksplorasi
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* WISHLIST SECTION DENGAN SLIDER */}
            {likedItems.length > 0 && (
              <div className="relative">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500 fill-current" />
                    Karena Anda menyukai tempat-tempat ini:
                  </h2>
                  
                  {/* Tampilkan Tombol Navigasi hanya jika item lebih dari 4 */}
                  {likedItems.length > 4 && (
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => scroll('left')} 
                        className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 transition-all"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => scroll('right')} 
                        className="p-1.5 rounded-full bg-white border border-gray-200 shadow-sm hover:bg-gray-50 text-gray-600 transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                <div 
                  ref={scrollRef} 
                  className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-smooth"
                >
                  {likedItems.map((liked) => (
                    <div 
                      key={`liked-${liked.id}`}
                      onClick={() => router.push(`/category/${liked.category_slug || liked.type || 'umum'}/detail/${liked.id}`)}
                      className="flex-shrink-0 w-64 bg-white rounded-xl shadow-sm border border-gray-100 p-3 flex gap-3 cursor-pointer hover:bg-gray-50 transition-colors snap-start"
                    >
                      <div className="w-16 h-16 rounded-lg bg-gray-200 overflow-hidden relative flex-shrink-0">
                        {liked.thumbnail_image ? (
                          <img src={liked.thumbnail_image.startsWith("http") ? liked.thumbnail_image : `http://localhost:5000/uploads/${liked.thumbnail_image.trim()}`} alt={liked.name} className="w-full h-full object-cover" />
                        ) : (
                          <Camera className="w-6 h-6 text-gray-400 m-auto mt-5" />
                        )}
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <h4 className="font-semibold text-sm text-gray-800 truncate">{liked.name}</h4>
                        <span className="text-xs text-gray-500 mt-1">{liked.category}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <hr className="border-gray-200" />

            {/* RECOMMENDATIONS SECTION (UNLIMITED) */}
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">Kami Merekomendasikan</h2>
              {recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {recommendations.map((item: any) => (
                    <div key={`rec-${item.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 flex flex-col border border-blue-50">
                      <div className="relative overflow-hidden h-48">
                        {item.thumbnail_image ? (
                          <img src={item.thumbnail_image.startsWith("http") ? item.thumbnail_image : `http://localhost:5000/uploads/${item.thumbnail_image.trim()}`} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                        ) : (
                          <div className="bg-gradient-to-br from-gray-200 to-gray-300 w-full h-full flex items-center justify-center text-gray-500">
                            <Camera className="w-10 h-10" />
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full font-medium">{item.category || 'Umum'}</div>
                        <div className="absolute bottom-3 left-3 bg-blue-600/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded flex items-center gap-1 shadow-sm">
                          <Sparkles className="w-3 h-3" /> Cocok dengan minat Anda
                        </div>
                      </div>

                      <div className="p-5 flex flex-col flex-1">
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition-colors truncate">{item.name}</h3>
                        <div className="flex items-center gap-1 mt-1 mb-3">
                          <Star className="w-4 h-4 text-yellow-400 fill-current" />
                          <span className="font-medium text-sm text-gray-700">{Number(item.average_rating || 0).toFixed(1)}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-sm text-gray-500 flex-1 min-w-0">
                          <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{item.address}</span>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                          {userLocation && item.latitude && item.longitude ? (
                            <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md whitespace-nowrap">
                              {calculateDistance(userLocation.lat, userLocation.lon, Number(item.latitude), Number(item.longitude))}
                            </span>
                          ) : (
                            <span className="text-[11px] text-gray-400 font-medium">Lokasi tidak tersedia</span>
                          )}
                          <button 
                            className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-1.5 px-4 rounded-lg font-medium transition-colors"
                            onClick={() => router.push(`/category/${item.type || item.category?.toLowerCase() || 'umum'}/detail/${item.id}`)}
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 text-center">
                  <p className="text-blue-800">Sistem AI kami masih mencari tempat baru yang cocok dengan selera Anda.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}