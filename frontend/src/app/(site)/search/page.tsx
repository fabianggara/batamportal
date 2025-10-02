'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Camera, MapPin, Search } from 'lucide-react';

interface SearchResult {
  id: number;
  name: string;
  address: string;
  thumbnail_image: string | null; // Bisa string atau null
  type: string; // 'hotel', 'wisata', dll.
}

// Komponen utama dipisahkan agar bisa menggunakan Suspense
const SearchPage = () => {
  return (
    <Suspense fallback={<div className="text-center p-8">Memuat Halaman...</div>}>
      <SearchResults />
    </Suspense>
  );
};

const SearchResults = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        setError(null);
        try {
          const res = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
          if (!res.ok) throw new Error('Gagal mengambil data');
          
          const json = await res.json();
          if (json.success) {
            setResults(json.data);
          } else {
            setResults([]);
          }
        } catch (err: any) {
          setError(err.message || 'Terjadi kesalahan');
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    } else {
      setLoading(false);
      setResults([]);
    }
  }, [query]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Hasil Pencarian untuk:
          </h1>
          <p className="text-xl text-blue-600 font-semibold">"{query}"</p>
        </div>

        {loading && <p className="text-center text-gray-500">Mencari...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}

        {!loading && !error && results.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-semibold text-gray-700">Tidak ada hasil ditemukan</h2>
            <p className="text-gray-500">Coba gunakan kata kunci lain.</p>
          </div>
        )}

        {!loading && !error && results.length > 0 && (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {results.map((item) => { // <-- Perhatikan penambahan kurung kurawal ini
      
      // === TAMBAHKAN KODE DEBUGGING DI SINI ===
      console.log('Data Item yang Diterima:', item);
      const finalImageUrl = item.thumbnail_image 
        ? (item.thumbnail_image.trim().startsWith("http")
          ? item.thumbnail_image.trim()
          : `http://localhost:5000/uploads/${item.thumbnail_image.trim()}`)
        : null;
      console.log('URL Gambar Final yang Dibuat:', finalImageUrl);
      // =======================================

      return ( // <-- Tambahkan return di sini
        <Link href={`/itemDetail/${item.type}/${item.id}`} key={`${item.type}-${item.id}`} className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
          
          {/* FOKUS UTAMA: Menampilkan Thumbnail */}
          <div className="relative overflow-hidden">
            {item.thumbnail_image ? (
              <img
                src={finalImageUrl || ''} // Gunakan URL yang sudah kita proses
                alt={item.name}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="bg-gradient-to-br from-gray-200 to-gray-300 h-48 flex items-center justify-center text-gray-500">
                <Camera className="w-12 h-12" />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors truncate">
              {item.name}
            </h3>
            <div className="flex items-center gap-1 text-sm text-gray-500 truncate mt-2">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {item.address}
            </div>
          </div>
        </Link>
      );
    })}
  </div>
)}
      </div>
    </div>
  );
};

export default SearchPage;