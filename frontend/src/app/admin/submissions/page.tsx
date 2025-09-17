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
  Users,
  Mail,
  Loader2,
  RefreshCw
} from "lucide-react";

// Type definition sesuai dengan struktur database
type Submission = {
  id: number;
  place_name: string;
  address: string;
  category: string | null;
  subcategory: string | null;
  description: string | null;
  contact: string | null;
  email: string | null;
  website: string | null;
  thumbnail_picture: string | null;
  created_at: string;
};

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [selectedSubkategori, setSelectedSubkategori] = useState("all");
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Fetch submissions from database
  const fetchSubmissions = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/submissions`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        setSubmissions(result.data || []);
      } else {
        throw new Error(result.error || 'Failed to fetch submissions');
      }
    } catch (error) {
      console.error('Error fetching submissions:', error);
      setError(error instanceof Error ? error.message : 'Failed to load submissions');
    } finally {
      setIsLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Get unique categories and subcategories
  const categories = useMemo(() => {
    const cats = [...new Set(submissions
      .map(sub => sub.category)
      .filter(cat => cat !== null && cat !== undefined)
    )] as string[];
    return cats.sort();
  }, [submissions]);

  const subcategories = useMemo(() => {
    if (selectedKategori === 'all') {
      const subcats = [...new Set(submissions
        .map(sub => sub.subcategory)
        .filter(subcat => subcat !== null && subcat !== undefined)
      )] as string[];
      return subcats.sort();
    }
    const subcats = [...new Set(
      submissions
        .filter(sub => sub.category === selectedKategori)
        .map(sub => sub.subcategory)
        .filter(subcat => subcat !== null && subcat !== undefined)
    )] as string[];
    return subcats.sort();
  }, [submissions, selectedKategori]);

  // Filter and search submissions
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.category && sub.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.subcategory && sub.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by category
    if (selectedKategori !== 'all') {
      filtered = filtered.filter(sub => sub.category === selectedKategori);
    }

    // Filter by subcategory
    if (selectedSubkategori !== 'all') {
      filtered = filtered.filter(sub => sub.subcategory === selectedSubkategori);
    }

    // Sort submissions
    filtered = [...filtered].sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'name':
          comparison = a.place_name.localeCompare(b.place_name);
          break;
        case 'date':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
          break;
        case 'category':
          comparison = (a.category || '').localeCompare(b.category || '');
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

  const getCategoryColor = (kategori: string | null) => {
    if (!kategori) return 'bg-gray-100 text-gray-800';
    
    const colors: { [key: string]: string } = {
      'Akomodasi': 'bg-blue-100 text-blue-800',
      'Wisata': 'bg-green-100 text-green-800',
      'Kuliner': 'bg-orange-100 text-orange-800',
      'Hiburan': 'bg-purple-100 text-purple-800',
      'Transportasi': 'bg-red-100 text-red-800',
      'Kesehatan': 'bg-cyan-100 text-cyan-800',
      'Pendidikan': 'bg-lime-100 text-lime-800',
      'Belanja': 'bg-amber-100 text-amber-800',
    };
    return colors[kategori] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data submissions...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-center max-w-md">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <X className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gagal Memuat Data</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={fetchSubmissions}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
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
                placeholder="Cari nama tempat, alamat, kategori, atau deskripsi..."
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
              Search: {searchTerm}
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
                setSortBy(field as 'name' | 'date' | 'category');
                setSortOrder(order as 'asc' | 'desc');
              }}
              className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="name-asc">Name A-Z</option>
              <option value="name-desc">Name Z-A</option>
              <option value="category-asc">Category A-Z</option>
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
                        {submission.thumbnail_picture ? (
                          <Image
                            src={submission.thumbnail_picture}
                            alt={`Logo ${submission.place_name}`}
                            width={48}
                            height={48}
                            className="h-12 w-12 rounded-lg object-cover border-2 border-gray-200"
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 font-bold text-lg">
                              {submission.place_name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {submission.place_name}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-xs">{submission.address}</span>
                        </div>
                        {submission.website && (
                          <div className="text-sm text-blue-600 flex items-center gap-1 hover:text-blue-800">
                            <Globe className="w-3 h-3" />
                            <a 
                              href={submission.website.startsWith('http') ? submission.website : `https://${submission.website}`}
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="truncate max-w-xs"
                            >
                              Website
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-2">
                      {submission.category ? (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(submission.category)}`}>
                          {submission.category}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded-full">
                          No Category
                        </span>
                      )}
                      <div className="text-sm text-gray-600">
                        {submission.subcategory || 'No Subcategory'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="space-y-1">
                      {submission.contact && (
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {submission.contact}
                        </div>
                      )}
                      {submission.email && (
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="truncate max-w-xs">{submission.email}</span>
                        </div>
                      )}
                      {!submission.contact && !submission.email && (
                        <span className="text-sm text-gray-400">No Contact</span>
                      )}
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
                      <button 
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button 
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {filteredSubmissions.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">Tidak ada data ditemukan</div>
              <p className="text-gray-500">
                {submissions.length === 0 
                  ? 'Belum ada submission yang masuk' 
                  : 'Coba ubah filter atau kata kunci pencarian Anda'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}