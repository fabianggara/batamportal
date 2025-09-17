// src/app/admin/submissions/page.tsx
'use client';

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  Calendar,
  MapPin,
  Phone,
  Globe,
  ChevronDown,
  X,
  FileText,
  Users
} from "lucide-react";

// Define a type for our submission data for better type safety
type Submission = {
  id: number;
  nama: string;
  alamat: string;
  kategori: string;
  subkategori: string;
  kontak: string;
  website: string;
  logo_path: string | null;
  created_at: string;
};

// Mock data - replace with your actual API call
const mockSubmissions: Submission[] = [
  {
    id: 1,
    nama: "Hotel Grand Batam",
    alamat: "Jl. Hang Tuah No. 123, Batam Center",
    kategori: "Akomodasi",
    subkategori: "Hotel Bintang 5",
    kontak: "0778-123456",
    website: "https://hotelgrand.com",
    logo_path: "/api/placeholder/50/50",
    created_at: "2024-01-15T10:30:00Z"
  },
  {
    id: 2,
    nama: "Pantai Melur Resort",
    alamat: "Pantai Melur, Galang",
    kategori: "Wisata",
    subkategori: "Pantai",
    kontak: "0778-987654",
    website: "https://pantaimelur.com",
    logo_path: "/api/placeholder/50/50",
    created_at: "2024-01-14T14:20:00Z"
  },
  {
    id: 3,
    nama: "Rumah Makan Sederhana",
    alamat: "Jl. Ahmad Yani No. 45",
    kategori: "Kuliner",
    subkategori: "Restoran Tradisional",
    kontak: "0778-456789",
    website: "",
    logo_path: null,
    created_at: "2024-01-13T09:15:00Z"
  },
  {
    id: 4,
    nama: "Batam Mini Golf",
    alamat: "Kompleks Nagoya Hill",
    kategori: "Hiburan",
    subkategori: "Olahraga & Rekreasi",
    kontak: "0778-321654",
    website: "https://batammini.golf",
    logo_path: "/api/placeholder/50/50",
    created_at: "2024-01-12T16:45:00Z"
  },
  {
    id: 5,
    nama: "Penginapan Murah Meriah",
    alamat: "Jl. Sudirman No. 78",
    kategori: "Akomodasi",
    subkategori: "Guest House",
    kontak: "0778-654321",
    website: "",
    logo_path: null,
    created_at: "2024-01-11T11:30:00Z"
  },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>(mockSubmissions);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [selectedSubkategori, setSelectedSubkategori] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'kategori'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const cats = [...new Set(submissions.map(sub => sub.kategori))];
    return cats.sort();
  }, [submissions]);

  const subcategories = useMemo(() => {
    if (selectedKategori === 'all') {
      return [...new Set(submissions.map(sub => sub.subkategori))].sort();
    }
    return [...new Set(
      submissions
        .filter(sub => sub.kategori === selectedKategori)
        .map(sub => sub.subkategori)
    )].sort();
  }, [submissions, selectedKategori]);

  // Filter and search submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.alamat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.kategori.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.subkategori.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedKategori !== 'all') {
      filtered = filtered.filter(sub => sub.kategori === selectedKategori);
    }

    // Filter by subcategory
    if (selectedSubkategori !== 'all') {
      filtered = filtered.filter(sub => sub.subkategori === selectedSubkategori);
    }

    // Sort submissions
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.nama.localeCompare(b.nama);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'kategori':
          comparison = a.kategori.localeCompare(b.kategori);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [submissions, searchTerm, selectedKategori, selectedSubkategori, sortBy, sortOrder]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedKategori("all");
    setSelectedSubkategori("all");
  };

  const getCategoryColor = (kategori: string) => {
    const colors: { [key: string]: string } = {
      'Akomodasi': 'bg-blue-100 text-blue-800',
      'Wisata': 'bg-green-100 text-green-800',
      'Kuliner': 'bg-orange-100 text-orange-800',
      'Hiburan': 'bg-purple-100 text-purple-800',
    };
    return colors[kategori] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Data Submissions</h1>
            <p className="text-gray-600 mt-2">
              Kelola semua submission yang masuk dari pengguna
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Filters and Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          
          {/* Search Bar */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Cari nama, alamat, kategori, atau subkategori..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <select
              value={selectedKategori}
              onChange={(e) => {
                setSelectedKategori(e.target.value);
                setSelectedSubkategori("all");
              }}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            >
              <option value="all">Semua Kategori</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Subcategory Filter */}
          <div className="relative">
            <select
              value={selectedSubkategori}
              onChange={(e) => setSelectedSubkategori(e.target.value)}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
            >
              <option value="all">Semua Subkategori</option>
              {subcategories.map(subcat => (
                <option key={subcat} value={subcat}>{subcat}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {(searchTerm || selectedKategori !== 'all' || selectedSubkategori !== 'all') && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>

        {/* Active Filters Display */}
        <div className="flex flex-wrap gap-2 mt-4">
          {searchTerm && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {/* Search: "{searchTerm}" */}
              <button onClick={() => setSearchTerm("")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedKategori !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Kategori: {selectedKategori}
              <button onClick={() => setSelectedKategori("all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {selectedSubkategori !== 'all' && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
              Subkategori: {selectedSubkategori}
              <button onClick={() => setSelectedSubkategori("all")}>
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-6 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              Total: {submissions.length} submissions
            </span>
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Filtered: {filteredSubmissions.length} items
            </span>
          </div>
          
          {/* Sort Options */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-');
                setSortBy(field as 'name' | 'date' | 'kategori');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="kategori-asc">Category A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Business
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kontak
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-12 w-12">
                        {submission.logo_path ? (
                          <Image
                            src={submission.logo_path}
                            alt={`Logo ${submission.nama}`}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 font-bold text-lg">
                              {submission.nama.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.nama}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {submission.alamat}
                        </div>
                        {submission.website && (
                          <div className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800">
                            <Globe className="w-3 h-3" />
                            <a href={submission.website} target="_blank" rel="noopener noreferrer">
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(submission.kategori)}`}>
                        {submission.kategori}
                      </span>
                      <div className="text-sm text-gray-600">
                        {submission.subkategori}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-900">
                      <Phone className="w-4 h-4 text-gray-400" />
                      {submission.kontak}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="w-4 h-4" />
                      {new Date(submission.created_at).toLocaleDateString("id-ID", {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end gap-2">
                      <button className="text-blue-600 hover:text-blue-900 p-1 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="text-green-600 hover:text-green-900 p-1 rounded">
                        <Edit className="w-4 h-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900 p-1 rounded">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSubmissions.length === 0 && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Tidak ada data ditemukan</div>
              <p className="text-gray-500">Coba ubah filter atau kata kunci pencarian Anda</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}