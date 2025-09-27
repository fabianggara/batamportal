// src/app/admin/submissions/page.tsx
'use client';

import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
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
  RefreshCw,
  Plus,
  AlertTriangle,
  Check
} from "lucide-react";

// Tipe data untuk objek submission
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

// ---

// Komponen Modal untuk konfirmasi penghapusan
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  submissionName,
  isDeleting
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  submissionName: string;
  isDeleting: boolean;
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-red-100 rounded-full p-2">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">Hapus Submission</h3>
        </div>

        <p className="text-gray-600 mb-6">
          Apakah Anda yakin ingin menghapus submission <strong>{submissionName}</strong>?
          Tindakan ini tidak dapat dibatalkan.
        </p>

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Menghapus...
              </>
            ) : (
              'Hapus'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// ---

// Komponen notifikasi toast
const Toast = ({
  message,
  type,
  isVisible,
  onClose
}: {
  message: string;
  type: 'success' | 'error';
  isVisible: boolean;
  onClose: () => void;
}) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className={`rounded-lg p-4 shadow-lg border max-w-md ${
        type === 'success'
          ? 'bg-green-50 border-green-200 text-green-800'
          : 'bg-red-50 border-red-200 text-red-800'
      }`}>
        <div className="flex items-center gap-3">
          {type === 'success' ? (
            <Check className="w-5 h-5 text-green-600" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-red-600" />
          )}
          <p className="font-medium">{message}</p>
          <button
            onClick={onClose}
            className="ml-auto text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ---

export default function SubmissionsPage() {
  const router = useRouter();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategori, setSelectedKategori] = useState("all");
  const [selectedSubkategori, setSelectedSubkategori] = useState("all");
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'category'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // CRUD states
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; submission: Submission | null }>({
    isOpen: false,
    submission: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false
  });

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, isVisible: true });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  // Mengambil data submissions dari database
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

  // Fungsi untuk menghapus submission
  const deleteSubmission = async (id: number) => {
    setIsDeleting(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const response = await fetch(`${apiUrl}/api/submissions/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmissions(prev => prev.filter(sub => sub.id !== id));
        showToast('Submission berhasil dihapus', 'success');
      } else {
        throw new Error(result.error || 'Failed to delete submission');
      }
    } catch (error) {
      console.error('Error deleting submission:', error);
      showToast(
        error instanceof Error ? error.message : 'Gagal menghapus submission',
        'error'
      );
    } finally {
      setIsDeleting(false);
      setDeleteModal({ isOpen: false, submission: null });
    }
  };

  // Navigasi ke halaman detail submission
  const handleViewSubmission = (id: number) => {
    router.push(`/itemDetail/${id}`);
  };

  // Navigasi ke halaman edit submission
  const handleEditSubmission = (id: number) => {
    router.push(`/admin/submissions/edit/${id}`);
  };

  // Membuka modal konfirmasi delete
  const handleDeleteClick = (submission: Submission) => {
    setDeleteModal({ isOpen: true, submission });
  };

  // Konfirmasi dan eksekusi penghapusan
  const confirmDelete = () => {
    if (deleteModal.submission) {
      deleteSubmission(deleteModal.submission.id);
    }
  };

  // Fungsi untuk ekspor data ke CSV
  const exportToCSV = () => {
    const headers = [
      'ID',
      'Nama Tempat',
      'Alamat',
      'Kategori',
      'Sub Kategori',
      'Deskripsi',
      'Kontak',
      'Email',
      'Website',
      'Tanggal Dibuat'
    ];

    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(sub => [
        sub.id,
        `"${sub.place_name}"`,
        `"${sub.address}"`,
        `"${sub.category || ''}"`,
        `"${sub.subcategory || ''}"`,
        `"${(sub.description || '').replace(/"/g, '""')}"`,
        `"${sub.contact || ''}"`,
        `"${sub.email || ''}"`,
        `"${sub.website || ''}"`,
        `"${new Date(sub.created_at).toLocaleDateString('id-ID')}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `submissions_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Data berhasil diekspor ke CSV', 'success');
  };

  // Mengambil data saat komponen pertama kali dimuat
  useEffect(() => {
    fetchSubmissions();
  }, []);

  // Mengambil daftar kategori unik menggunakan useMemo
  const categories = useMemo(() => {
    const cats = [...new Set(submissions
      .map(sub => sub.category)
      .filter(cat => cat !== null && cat !== undefined)
    )] as string[];
    return cats.sort();
  }, [submissions]);

  // Mengambil daftar subkategori unik berdasarkan kategori yang dipilih
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

  // Filtering, searching, dan sorting data submissions menggunakan useMemo
  const filteredSubmissions = useMemo(() => {
    let filtered = submissions;

    // Filter berdasarkan search term
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.place_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (sub.category && sub.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.subcategory && sub.subcategory.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (sub.description && sub.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter berdasarkan kategori
    if (selectedKategori !== 'all') {
      filtered = filtered.filter(sub => sub.category === selectedKategori);
    }

    // Filter berdasarkan subkategori
    if (selectedSubkategori !== 'all') {
      filtered = filtered.filter(sub => sub.subcategory === selectedSubkategori);
    }

    // Sorting
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

  // Mereset semua filter
  const clearFilters = () => {
    setSearchTerm("");
    setSelectedKategori("all");
    setSelectedSubkategori("all");
  };

  // Menentukan warna tag kategori
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

  // Tampilan saat loading
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

  // Tampilan saat terjadi error
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

  // ---

  // Tampilan utama halaman
  return (
    <div className="p-6 space-y-6">
      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, submission: null })}
        onConfirm={confirmDelete}
        submissionName={deleteModal.submission?.place_name || ''}
        isDeleting={isDeleting}
      />

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
              onClick={() => router.push('/admin/submissions/create')}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Tambah Baru
            </button>
            <button
              onClick={fetchSubmissions}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
            <button
              onClick={exportToCSV}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
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

        {/* Stats and Sort Options */}
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
                            src={submission.thumbnail_picture.startsWith('http')
                              ? submission.thumbnail_picture
                              : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${submission.thumbnail_picture}`
                            }
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
                        onClick={() => handleViewSubmission(submission.id)}
                        className="text-blue-600 hover:text-blue-900 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                        title="Lihat Detail"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditSubmission(submission.id)}
                        className="text-green-600 hover:text-green-900 p-2 rounded-lg hover:bg-green-50 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(submission)}
                        className="text-red-600 hover:text-red-900 p-2 rounded-lg hover:bg-red-50 transition-colors"
                        title="Hapus"
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

      {/* Style untuk animasi */}
      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}