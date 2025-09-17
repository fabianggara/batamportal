// src/app/form/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  MapPin, 
  Phone, 
  Globe, 
  Upload, 
  FileText, 
  Mail,
  User,
  CheckCircle,
  AlertCircle,
  Loader2,
  X,
  ChevronDown,
  Image as ImageIcon
} from 'lucide-react';

// Types matching our database structure
type Category = {
  id: number;
  nama: string;
  slug: string;
  color: string;
  icon: string;
};

type Subcategory = {
  id: number;
  kategori_id: number;
  nama: string;
  slug: string;
};

export default function ModernSubmissionForm() {
  // Form state matching database fields
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    kategori: '', // Menggunakan slug kategori
    subkategori: '', // Menggunakan slug subkategori
    kontak: '',
    website: '',
    email: '',
    deskripsi: ''
  });

  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  // Data states - these would come from API in real app
  const [categories, setCategories] = useState<Category[]>([
    { id: 1, nama: 'Akomodasi', slug: 'akomodasi', color: '#3B82F6', icon: 'building' },
    { id: 2, nama: 'Wisata', slug: 'wisata', color: '#10B981', icon: 'map-pin' },
    { id: 3, nama: 'Kuliner', slug: 'kuliner', color: '#F59E0B', icon: 'utensils' },
    { id: 4, nama: 'Hiburan', slug: 'hiburan', color: '#8B5CF6', icon: 'music' },
    { id: 5, nama: 'Transportasi', slug: 'transportasi', color: '#EF4444', icon: 'car' },
    { id: 6, nama: 'Kesehatan', slug: 'kesehatan', color: '#06B6D4', icon: 'heart' },
    { id: 7, nama: 'Pendidikan', slug: 'pendidikan', color: '#84CC16', icon: 'book' },
    { id: 8, nama: 'Belanja', slug: 'belanja', color: '#F97316', icon: 'shopping-bag' }
  ]);
  
  const [subcategories, setSubcategories] = useState<Subcategory[]>([
    // Akomodasi
    { id: 1, kategori_id: 1, nama: 'Hotel Bintang 5', slug: 'hotel-bintang-5' },
    { id: 2, kategori_id: 1, nama: 'Hotel Bintang 4', slug: 'hotel-bintang-4' },
    { id: 3, kategori_id: 1, nama: 'Hotel Bintang 3', slug: 'hotel-bintang-3' },
    { id: 4, kategori_id: 1, nama: 'Guest House', slug: 'guest-house' },
    { id: 5, kategori_id: 1, nama: 'Homestay', slug: 'homestay' },
    { id: 6, kategori_id: 1, nama: 'Villa', slug: 'villa' },
    
    // Wisata  
    { id: 7, kategori_id: 2, nama: 'Pantai', slug: 'pantai' },
    { id: 8, kategori_id: 2, nama: 'Gunung', slug: 'gunung' },
    { id: 9, kategori_id: 2, nama: 'Taman', slug: 'taman' },
    { id: 10, kategori_id: 2, nama: 'Museum', slug: 'museum' },
    { id: 11, kategori_id: 2, nama: 'Tempat Bersejarah', slug: 'tempat-bersejarah' },
    { id: 12, kategori_id: 2, nama: 'Wisata Religi', slug: 'wisata-religi' },
    
    // Kuliner
    { id: 13, kategori_id: 3, nama: 'Restoran Tradisional', slug: 'restoran-tradisional' },
    { id: 14, kategori_id: 3, nama: 'Restoran Modern', slug: 'restoran-modern' },
    { id: 15, kategori_id: 3, nama: 'Kafe', slug: 'kafe' },
    { id: 16, kategori_id: 3, nama: 'Street Food', slug: 'street-food' },
    { id: 17, kategori_id: 3, nama: 'Bakery', slug: 'bakery' },
    
    // Hiburan
    { id: 18, kategori_id: 4, nama: 'Karaoke', slug: 'karaoke' },
    { id: 19, kategori_id: 4, nama: 'Cinema', slug: 'cinema' },
    { id: 20, kategori_id: 4, nama: 'Pub & Bar', slug: 'pub-bar' },
    { id: 21, kategori_id: 4, nama: 'Olahraga & Rekreasi', slug: 'olahraga-rekreasi' },
    { id: 22, kategori_id: 4, nama: 'Spa & Massage', slug: 'spa-massage' },

    // Transportasi
    { id: 23, kategori_id: 5, nama: 'Taksi', slug: 'taksi' },
    { id: 24, kategori_id: 5, nama: 'Bus Umum', slug: 'bus-umum' },
    { id: 25, kategori_id: 5, nama: 'Travel & Shuttle', slug: 'travel-shuttle' },
    { id: 26, kategori_id: 5, nama: 'Penyewaan Mobil', slug: 'rental-mobil' },
    { id: 27, kategori_id: 5, nama: 'Penyewaan Motor', slug: 'rental-motor' },
    { id: 28, kategori_id: 5, nama: 'Pelabuhan & Ferry', slug: 'pelabuhan-ferry' },
    { id: 29, kategori_id: 5, nama: 'Bandara', slug: 'bandara' },

    // Kesehatan
    { id: 30, kategori_id: 6, nama: 'Rumah Sakit', slug: 'rumah-sakit' },
    { id: 31, kategori_id: 6, nama: 'Klinik', slug: 'klinik' },
    { id: 32, kategori_id: 6, nama: 'Apotek', slug: 'apotek' },
    { id: 33, kategori_id: 6, nama: 'Laboratorium Medis', slug: 'laboratorium-medis' },
    { id: 34, kategori_id: 6, nama: 'Puskesmas', slug: 'puskesmas' },
    { id: 35, kategori_id: 6, nama: 'Dokter Praktek', slug: 'dokter-praktek' },

    // Pendidikan
    { id: 36, kategori_id: 7, nama: 'Sekolah Dasar', slug: 'sekolah-dasar' },
    { id: 37, kategori_id: 7, nama: 'Sekolah Menengah', slug: 'sekolah-menengah' },
    { id: 38, kategori_id: 7, nama: 'Perguruan Tinggi', slug: 'perguruan-tinggi' },
    { id: 39, kategori_id: 7, nama: 'Lembaga Kursus', slug: 'lembaga-kursus' },
    { id: 40, kategori_id: 7, nama: 'Bimbingan Belajar', slug: 'bimbingan-belajar' },
    { id: 41, kategori_id: 7, nama: 'Pesantren', slug: 'pesantren' },
    
    // Belanja
    { id: 42, kategori_id: 8, nama: 'Mall', slug: 'mall' },
    { id: 43, kategori_id: 8, nama: 'Pasar Tradisional', slug: 'pasar-tradisional' },
    { id: 44, kategori_id: 8, nama: 'Minimarket', slug: 'minimarket' },
    { id: 45, kategori_id: 8, nama: 'Supermarket', slug: 'supermarket' },
    { id: 46, kategori_id: 8, nama: 'Toko Pakaian', slug: 'toko-pakaian' },
    { id: 47, kategori_id: 8, nama: 'Toko Elektronik', slug: 'toko-elektronik' },
    { id: 48, kategori_id: 8, nama: 'Toko Buku', slug: 'toko-buku' }
  ]);

  // Cari kategori yang dipilih berdasarkan slug di formData
  const selectedCategory = categories.find(cat => cat.slug === formData.kategori);
  
  // Filter subkategori berdasarkan ID dari kategori yang dipilih
  const filteredSubcategories = subcategories.filter(
    sub => selectedCategory ? sub.kategori_id === selectedCategory.id : false
  );

  // Handle input changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear specific error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    
    // Reset subcategory when category changes
    if (field === 'kategori' && value !== formData.kategori) {
      setFormData(prev => ({ ...prev, subkategori: '' }));
    }
  };

  // Handle logo file upload
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: 'Ukuran file tidak boleh melebihi 5MB' }));
      return;
    }

    // Validate file type
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setErrors(prev => ({ ...prev, logo: 'Format file harus JPG, PNG, atau WebP' }));
      return;
    }

    setLogo(file);
    setErrors(prev => ({ ...prev, logo: '' }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Remove logo
  const removeLogo = () => {
    setLogo(null);
    setLogoPreview(null);
    setErrors(prev => ({ ...prev, logo: '' }));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) newErrors.nama = 'Nama tempat wajib diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!formData.kategori) newErrors.kategori = 'Kategori wajib dipilih';
    if (!formData.subkategori) newErrors.subkategori = 'Subkategori wajib dipilih';
    if (!formData.kontak.trim()) newErrors.kontak = 'Kontak wajib diisi';
    
    // Email validation if provided
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

    // Website validation if provided
    if (formData.website && !formData.website.match(/^https?:\/\/.+/)) {
      newErrors.website = 'Website harus dimulai dengan http:// atau https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      setStatusMessage('Mohon periksa kembali form Anda');
      setSubmitStatus('error');
      return;
    }

    setIsLoading(true);
    setSubmitStatus('idle');
    setStatusMessage('Mengirim data...');

    const submitData = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value);
    });
    
    if (logo) {
      submitData.append('logo', logo);
    }

    try {
      // Mengirim data form dalam bentuk JSON
      const response = await fetch('http://localhost:5000/api/submissions', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      
      if (response.ok && result.success) {
        setSubmitStatus('success');
        setStatusMessage('Formulir berhasil dikirim! Tim kami akan meninjau submission Anda.');
        
        // Reset form
        setFormData({
          nama: '',
          alamat: '',
          kategori: '',
          subkategori: '',
          kontak: '',
          website: '',
          email: '',
          deskripsi: ''
        });
        setLogo(null);
        setLogoPreview(null);
      } else {
        setSubmitStatus('error');
        setStatusMessage(result.message || 'Gagal mengirim formulir. Silakan coba lagi.');
      }
    } catch (error) {
      console.error('Submit error:', error);
      setSubmitStatus('error');
      setStatusMessage('Terjadi kesalahan koneksi. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Daftarkan Bisnis Anda
          </h1>
          <p className="text-lg text-gray-600">
            Bergabunglah dengan BatamPortal dan jangkau lebih banyak pelanggan
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
          
          {/* Basic Information Section */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                Informasi Dasar
              </h2>
              <p className="text-sm text-gray-500 mt-1">Data utama bisnis Anda</p>
            </div>

            {/* Nama Tempat */}
            <div className="space-y-2">
              <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                Nama Tempat/Bisnis *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.nama ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Contoh: Hotel Grand Batam"
                />
              </div>
              {errors.nama && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.nama}
                </p>
              )}
            </div>

            {/* Alamat */}
            <div className="space-y-2">
              <label htmlFor="alamat" className="block text-sm font-medium text-gray-700">
                Alamat Lengkap *
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  rows={3}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                    errors.alamat ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Jl. Hang Tuah No. 123, Batam Center, Kota Batam"
                />
              </div>
              {errors.alamat && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.alamat}
                </p>
              )}
            </div>

            {/* Kategori */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="kategori" className="block text-sm font-medium text-gray-700">
                  Kategori *
                </label>
                <div className="relative">
                  <select
                    id="kategori"
                    value={formData.kategori}
                    onChange={(e) => handleInputChange('kategori', e.target.value)}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                      errors.kategori ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Kategori</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.slug}>
                        {cat.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.kategori && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.kategori}
                  </p>
                )}
              </div>

              {/* Subkategori */}
              <div className="space-y-2">
                <label htmlFor="subkategori" className="block text-sm font-medium text-gray-700">
                  Subkategori *
                </label>
                <div className="relative">
                  <select
                    id="subkategori"
                    value={formData.subkategori}
                    onChange={(e) => handleInputChange('subkategori', e.target.value)}
                    disabled={!formData.kategori}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-100 disabled:text-gray-400 ${
                      errors.subkategori ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                  >
                    <option value="">
                      {formData.kategori ? 'Pilih Subkategori' : 'Pilih kategori terlebih dahulu'}
                    </option>
                    {filteredSubcategories.map((sub) => (
                      <option key={sub.id} value={sub.slug}>
                        {sub.nama}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
                {errors.subkategori && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.subkategori}
                  </p>
                )}
              </div>
            </div>

            {/* Category Preview */}
            {selectedCategory && (
              <div 
                className="p-4 rounded-lg border-l-4 bg-gray-50"
                style={{ borderLeftColor: selectedCategory.color }}
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                    style={{ backgroundColor: selectedCategory.color }}
                  >
                    {selectedCategory.nama.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{selectedCategory.nama}</p>
                    {formData.subkategori && (
                      <p className="text-sm text-gray-600">
                        {filteredSubcategories.find(sub => sub.slug === formData.subkategori)?.nama}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <Phone className="w-5 h-5 text-green-600" />
                Informasi Kontak
              </h2>
              <p className="text-sm text-gray-500 mt-1">Cara pelanggan dapat menghubungi Anda</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kontak */}
              <div className="space-y-2">
                <label htmlFor="kontak" className="block text-sm font-medium text-gray-700">
                  Nomor Telepon *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="kontak"
                    value={formData.kontak}
                    onChange={(e) => handleInputChange('kontak', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.kontak ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0778-123456"
                  />
                </div>
                {errors.kontak && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.kontak}
                  </p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email (Opsional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.email ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="info@bisnis.com"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            {/* Website */}
            <div className="space-y-2">
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website (Opsional)
              </label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.website ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="https://www.bisnis.com"
                />
              </div>
              {errors.website && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.website}
                </p>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Informasi Tambahan
              </h2>
              <p className="text-sm text-gray-500 mt-1">Detail dan media untuk memperkuat profil bisnis</p>
            </div>

            {/* Deskripsi */}
            <div className="space-y-2">
              <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                Deskripsi Bisnis (Opsional)
              </label>
              <textarea
                id="deskripsi"
                value={formData.deskripsi}
                onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Ceritakan tentang bisnis Anda, fasilitas yang tersedia, keunggulan, dan hal menarik lainnya..."
              />
              <p className="text-xs text-gray-500">
                {formData.deskripsi.length}/500 karakter
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Logo/Foto Bisnis (Opsional)
              </label>
              
              {!logoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">
                      <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-sm text-gray-500">PNG, JPG, WebP hingga 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <div className="border border-gray-300 rounded-lg p-4 flex items-center gap-4">
                    {/* <img 
                      src={logoPreview} 
                      alt="Preview" 
                      className="w-16 h-16 object-cover rounded-lg"
                    /> */}
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{logo?.name}</p>
                      <p className="text-sm text-gray-500">
                        {logo && (logo.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={removeLogo}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              )}
              
              {errors.logo && (
                <p className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.logo}
                </p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Mengirim Data...
                </>
              ) : (
                <>
                  <Upload className="w-5 h-5" />
                  Kirim Pendaftaran
                </>
              )}
            </button>

            {/* Status Message */}
            {statusMessage && (
              <div className={`mt-4 p-4 rounded-lg flex items-center gap-3 ${
                submitStatus === 'success' 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : submitStatus === 'error'
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : 'bg-blue-50 text-blue-700 border border-blue-200'
              }`}>
                {submitStatus === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
                {submitStatus === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                <p className="text-sm font-medium">{statusMessage}</p>
              </div>
            )}
          </div>
        </form>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Dengan mengirim formulir ini, Anda menyetujui{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-700">Syarat & Ketentuan</a>
            {' '}dan{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-700">Kebijakan Privasi</a> kami.
          </p>
        </div>
      </div>
    </div>
  );
}