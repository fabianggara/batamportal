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
  Image as ImageIcon,
  Video as VideoIcon,
  Camera,
  Map,
  Wifi,
  Car,
  Waves,
  Dumbbell,
  Coffee,
  Utensils,
  ArrowLeft,
  AirVent,
  Tv,
  Bath,
  Bed,
  Users,
  Plus,
  Minus,
  Star,
  Calendar,
  Clock
} from 'lucide-react';

// Types untuk hotel detail
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

type MediaFile = {
  file: File;
  type: 'photo' | 'video';
  preview: string;
  category: 'exterior' | 'interior' | 'room' | 'facility' | 'dining' | 'other';
};

type Facility = {
  id: string;
  name: string;
  icon: React.ElementType;
  category: 'general' | 'room' | 'dining' | 'business' | 'wellness' | 'transport';
};

type RoomType = {
  id: string;
  name: string;
  description: string;
  size: string;
  capacity: number;
  bedType: string;
  price: number;
  images: File[];
  facilities: string[];
};

export default function HotelDetailForm() {
  // Form state untuk informasi dasar
  const [formData, setFormData] = useState({
    nama: '',
    alamat: '',
    kategori: 'akomodasi', // Default ke akomodasi
    subkategori: '',
    kontak: '',
    website: '',
    email: '',
    deskripsi: '',
    logo: null as File | null,
    latitude: '',
    longitude: '',
    checkIn: '14:00',
    checkOut: '12:00',
    rating: 0,
    totalReviews: 0
  });

  // Media states
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  
  // Hotel specific states
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'basic' | 'gallery' | 'facilities' | 'rooms' | 'map'>('basic');

  // Data untuk kategori (fokus akomodasi)
  const [categories] = useState<Category[]>([
    { id: 1, nama: 'Akomodasi', slug: 'akomodasi', color: '#3B82F6', icon: 'building' }
  ]);
  
  const [subcategories] = useState<Subcategory[]>([
    { id: 1, kategori_id: 1, nama: 'Hotel Bintang 5', slug: 'hotel-bintang-5' },
    { id: 2, kategori_id: 1, nama: 'Hotel Bintang 4', slug: 'hotel-bintang-4' },
    { id: 3, kategori_id: 1, nama: 'Hotel Bintang 3', slug: 'hotel-bintang-3' },
    { id: 4, kategori_id: 1, nama: 'Guest House', slug: 'guest-house' },
    { id: 5, kategori_id: 1, nama: 'Homestay', slug: 'homestay' },
    { id: 6, kategori_id: 1, nama: 'Villa', slug: 'villa' },
    { id: 7, kategori_id: 1, nama: 'Resort', slug: 'resort' },
    { id: 8, kategori_id: 1, nama: 'Apartment', slug: 'apartment' }
  ]);

  // Fasilitas yang tersedia
  const availableFacilities: Facility[] = [
    // General
    { id: 'wifi', name: 'Wi-Fi Gratis', icon: Wifi, category: 'general' },
    { id: 'parking', name: 'Parkir Gratis', icon: Car, category: 'general' },
    { id: 'pool', name: 'Kolam Renang', icon: Waves, category: 'general' },
    { id: 'gym', name: 'Fitness Center', icon: Dumbbell, category: 'wellness' },
    { id: 'spa', name: 'Spa', icon: Bath, category: 'wellness' },
    { id: 'restaurant', name: 'Restoran', icon: Utensils, category: 'dining' },
    { id: 'cafe', name: 'Kafe', icon: Coffee, category: 'dining' },
    { id: 'breakfast', name: 'Sarapan', icon: Coffee, category: 'dining' },
    { id: 'roomservice', name: 'Room Service', icon: Utensils, category: 'dining' },
    { id: 'ac', name: 'AC', icon: AirVent, category: 'room' },
    { id: 'tv', name: 'TV', icon: Tv, category: 'room' },
    { id: 'minibar', name: 'Minibar', icon: Coffee, category: 'room' },
    { id: 'laundry', name: 'Laundry', icon: Bath, category: 'general' },
    { id: 'concierge', name: 'Concierge', icon: Users, category: 'general' },
    { id: 'businesscenter', name: 'Business Center', icon: Building2, category: 'business' },
    { id: 'meetingroom', name: 'Meeting Room', icon: Building2, category: 'business' }
  ];

  // Group facilities by category
  const facilitiesByCategory = availableFacilities.reduce((acc, facility) => {
    if (!acc[facility.category]) {
      acc[facility.category] = [];
    }
    acc[facility.category].push(facility);
    return acc;
  }, {} as Record<string, Facility[]>);

  // Handle input changes
  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Handle logo upload
  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrors(prev => ({ ...prev, logo: "Ukuran file tidak boleh melebihi 5MB" }));
      return;
    }

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/)) {
      setErrors(prev => ({ ...prev, logo: "Format file harus JPG, PNG, atau WebP" }));
      return;
    }

    setFormData(prev => ({ ...prev, logo: file }));
    setErrors(prev => ({ ...prev, logo: "" }));

    const reader = new FileReader();
    reader.onload = (e) => {
      setLogoPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Handle gallery media upload
  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>, category: MediaFile['category']) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newMedia: MediaFile[] = [];
    const fileErrors: string[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const mimeType = file.type;
      
      if (file.size > 10 * 1024 * 1024) {
        fileErrors.push(`Ukuran file "${file.name}" tidak boleh melebihi 10MB.`);
        continue;
      }

      let mediaType: 'photo' | 'video';
      if (mimeType.startsWith('image/')) {
        mediaType = 'photo';
      } else if (mimeType.startsWith('video/')) {
        mediaType = 'video';
      } else {
        fileErrors.push(`Format file "${file.name}" tidak didukung.`);
        continue;
      }
      
      const previewUrl = URL.createObjectURL(file);
      newMedia.push({ file, type: mediaType, preview: previewUrl, category });
    }

    if (fileErrors.length > 0) {
      setErrors(prev => ({ ...prev, gallery: fileErrors.join(' ') }));
      return;
    }

    setMediaFiles(prev => [...prev, ...newMedia]);
    setErrors(prev => ({ ...prev, gallery: "" }));
  };

  // Remove media
  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Handle facility toggle
  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId) 
        ? prev.filter(id => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  // Add new room type
  const addRoomType = () => {
    const newRoom: RoomType = {
      id: `room_${Date.now()}`,
      name: '',
      description: '',
      size: '',
      capacity: 2,
      bedType: '',
      price: 0,
      images: [],
      facilities: []
    };
    setRoomTypes(prev => [...prev, newRoom]);
  };

  // Update room type
  const updateRoomType = (roomId: string, field: keyof RoomType, value: any) => {
    setRoomTypes(prev => prev.map(room => 
      room.id === roomId ? { ...room, [field]: value } : room
    ));
  };

  // Remove room type
  const removeRoomType = (roomId: string) => {
    setRoomTypes(prev => prev.filter(room => room.id !== roomId));
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nama.trim()) newErrors.nama = 'Nama hotel wajib diisi';
    if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
    if (!formData.subkategori) newErrors.subkategori = 'Jenis akomodasi wajib dipilih';
    if (!formData.kontak.trim()) newErrors.kontak = 'Kontak wajib diisi';
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Format email tidak valid';
    }

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
      setStatusMessage("Mohon periksa kembali form Anda");
      setSubmitStatus("error");
      return;
    }

    setIsLoading(true);
    setSubmitStatus("idle");
    setStatusMessage("Mengirim data...");

    const submitData = new FormData();

    // Add basic form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && key !== 'logo') {
        submitData.append(key, String(value));
      }
    });

    // Add logo
    if (formData.logo) {
      submitData.append('thumbnail_picture', formData.logo);
    }

    // Add gallery media
    mediaFiles.forEach((media, index) => {
      submitData.append('gallery_files', media.file);
      submitData.append(`gallery_categories[${index}]`, media.category);
    });

    // Add facilities
    submitData.append('facilities', JSON.stringify(selectedFacilities));

    // Add room types
    submitData.append('room_types', JSON.stringify(roomTypes));

    try {
      const response = await fetch("http://localhost:5000/api/hotels", {
        method: "POST",
        body: submitData,
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSubmitStatus("success");
        setStatusMessage("Hotel berhasil didaftarkan!");
        // Reset form
        setFormData({
          nama: "",
          alamat: "",
          kategori: "akomodasi",
          subkategori: "",
          kontak: "",
          website: "",
          email: "",
          deskripsi: "",
          logo: null,
          latitude: "",
          longitude: "",
          checkIn: "14:00",
          checkOut: "12:00",
          rating: 0,
          totalReviews: 0
        });
        setLogoPreview(null);
        setMediaFiles([]);
        setSelectedFacilities([]);
        setRoomTypes([]);
      } else {
        setSubmitStatus("error");
        setStatusMessage(result.message || "Gagal mendaftarkan hotel. Silakan coba lagi.");
      }
    } catch (error) {
      console.error("Submit error:", error);
      setSubmitStatus("error");
      setStatusMessage("Terjadi kesalahan koneksi. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Daftarkan Akomodasi</h1>
                <p className="text-sm text-gray-500">Langkah dari 4</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
          <div className="flex overflow-x-auto">
            {[
              { key: 'basic', label: 'Informasi Dasar', icon: Building2 },
              { key: 'gallery', label: 'Galeri Foto', icon: Camera },
              { key: 'facilities', label: 'Fasilitas', icon: Star },
              { key: 'rooms', label: 'Tipe Kamar', icon: Bed },
              { key: 'map', label: 'Lokasi', icon: Map }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 min-w-0 px-4 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Basic Information Tab */}
          {activeTab === 'basic' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Informasi Dasar
                </h2>
                <p className="text-sm text-gray-500 mt-1">Data utama hotel/akomodasi Anda</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  {/* Nama Hotel */}
                  <div className="space-y-2">
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700">
                      Nama Hotel/Akomodasi *
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
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

                  {/* Jenis Akomodasi */}
                  <div className="space-y-2">
                    <label htmlFor="subkategori" className="block text-sm font-medium text-gray-700">
                      Jenis Akomodasi *
                    </label>
                    <div className="relative">
                      <select
                        id="subkategori"
                        value={formData.subkategori}
                        onChange={(e) => handleInputChange('subkategori', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                          errors.subkategori ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Pilih Jenis Akomodasi</option>
                        {subcategories.map((sub) => (
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
                </div>

                <div className="space-y-6">
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
                      Email
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
                        placeholder="info@hotel.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.email}
                      </p>
                    )}
                  </div>

                  {/* Website */}
                  <div className="space-y-2">
                    <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                      Website
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
                        placeholder="https://www.hotel.com"
                      />
                    </div>
                    {errors.website && (
                      <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.website}
                      </p>
                    )}
                  </div>

                  {/* Logo Upload */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Logo Hotel
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
                            <span className="font-medium text-blue-600">Upload logo</span>
                          </p>
                          <p className="text-sm text-gray-500">PNG, JPG hingga 5MB</p>
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <div className="border border-gray-300 rounded-lg p-4 flex items-center gap-4">
                          <img 
                            src={logoPreview} 
                            alt="Preview" 
                            className="w-16 h-16 object-contain rounded-lg"
                          />
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{formData.logo?.name}</p>
                            <p className="text-sm text-gray-500">
                              {formData.logo && (formData.logo.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, logo: null }));
                              setLogoPreview(null);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Deskripsi */}
              <div className="space-y-2">
                <label htmlFor="deskripsi" className="block text-sm font-medium text-gray-700">
                  Deskripsi Hotel
                </label>
                <textarea
                  id="deskripsi"
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder="Ceritakan tentang hotel Anda, fasilitas yang tersedia, keunggulan, dan hal menarik lainnya..."
                />
                <p className="text-xs text-gray-500">
                  {formData.deskripsi.length}/1000 karakter
                </p>
              </div>
            </div>
          )}

          {/* Gallery Tab */}
          {activeTab === 'gallery' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Camera className="w-5 h-5 text-purple-600" />
                  Galeri Foto & Video
                </h2>
                <p className="text-sm text-gray-500 mt-1">Upload foto dan video hotel untuk menarik tamu</p>
              </div>

              {/* Upload Categories */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { key: 'exterior', label: 'Eksterior Hotel', desc: 'Tampilan luar hotel' },
                  { key: 'interior', label: 'Interior Lobby', desc: 'Area lobby dan common area' },
                  { key: 'room', label: 'Kamar', desc: 'Foto kamar dan suitenya' },
                  { key: 'facility', label: 'Fasilitas', desc: 'Pool, gym, spa, dll' },
                  { key: 'dining', label: 'Restaurant & Bar', desc: 'Area makan dan bar' },
                  { key: 'other', label: 'Lainnya', desc: 'Foto tambahan lainnya' }
                ].map(category => (
                  <div key={category.key} className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                    <input
                      type="file"
                      accept="image/*,video/*"
                      multiple
                      onChange={(e) => handleGalleryUpload(e, category.key as MediaFile['category'])}
                      className="hidden"
                      id={`gallery-${category.key}`}
                    />
                    <label htmlFor={`gallery-${category.key}`} className="cursor-pointer">
                      <div className="flex flex-col items-center">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                          <ImageIcon className="w-6 h-6 text-blue-600" />
                        </div>
                        <h3 className="font-medium text-gray-900 mb-1">{category.label}</h3>
                        <p className="text-sm text-gray-500 mb-3">{category.desc}</p>
                        <p className="text-xs text-blue-600">Klik untuk upload</p>
                      </div>
                    </label>
                  </div>
                ))}
              </div>

              {/* Preview Gallery */}
              {mediaFiles.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview Galeri ({mediaFiles.length} file)</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {mediaFiles.map((media, index) => (
                      <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                        {media.type === 'photo' ? (
                          <div className="aspect-square relative">
                            <img
                              src={media.preview}
                              alt={`Gallery ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                              {media.category}
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-square relative bg-gray-900">
                            <video
                              src={media.preview}
                              className="w-full h-full object-cover"
                              preload="metadata"
                            />
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                              <VideoIcon className="w-8 h-8 text-white opacity-80" />
                            </div>
                            <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                              Video
                            </div>
                          </div>
                        )}
                        <button
                          type="button"
                          onClick={() => removeMedia(index)}
                          className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                          title="Hapus media"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {errors.gallery && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-600 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {errors.gallery}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Facilities Tab */}
          {activeTab === 'facilities' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  Fasilitas Hotel
                </h2>
                <p className="text-sm text-gray-500 mt-1">Pilih fasilitas yang tersedia di hotel Anda</p>
              </div>

              {Object.entries(facilitiesByCategory).map(([categoryName, facilities]) => (
                <div key={categoryName} className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-800 capitalize border-l-4 border-blue-500 pl-3">
                    {categoryName === 'general' ? 'Umum' :
                     categoryName === 'room' ? 'Kamar' :
                     categoryName === 'dining' ? 'Makanan & Minuman' :
                     categoryName === 'business' ? 'Bisnis' :
                     categoryName === 'wellness' ? 'Kesehatan & Spa' :
                     categoryName === 'transport' ? 'Transportasi' : categoryName}
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {facilities.map(facility => {
                      const Icon = facility.icon;
                      const isSelected = selectedFacilities.includes(facility.id);
                      return (
                        <button
                          key={facility.id}
                          type="button"
                          onClick={() => toggleFacility(facility.id)}
                          className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                            isSelected
                              ? 'border-blue-500 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                        >
                          <div className="flex flex-col items-center text-center">
                            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                            <span className="text-sm font-medium">{facility.name}</span>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-600 mt-1" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {selectedFacilities.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-blue-900">Fasilitas Terpilih ({selectedFacilities.length})</p>
                      <p className="text-sm text-blue-700 mt-1">
                        {selectedFacilities.map(id => 
                          availableFacilities.find(f => f.id === id)?.name
                        ).join(', ')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Room Types Tab */}
          {activeTab === 'rooms' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
              <div className="border-b border-gray-200 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Bed className="w-5 h-5 text-green-600" />
                    Tipe Kamar
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Tambahkan jenis kamar yang tersedia</p>
                </div>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Tambah Kamar
                </button>
              </div>

              {roomTypes.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                  <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada tipe kamar</h3>
                  <p className="text-sm text-gray-500 mb-4">Tambahkan minimal satu tipe kamar untuk hotel Anda</p>
                  <button
                    type="button"
                    onClick={addRoomType}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Tambah Kamar Pertama
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {roomTypes.map((room, index) => (
                    <div key={room.id} className="border border-gray-200 rounded-lg p-6 space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-800">Kamar #{index + 1}</h3>
                        <button
                          type="button"
                          onClick={() => removeRoomType(room.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nama Kamar *
                          </label>
                          <input
                            type="text"
                            value={room.name}
                            onChange={(e) => updateRoomType(room.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: Superior Room"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Ukuran Kamar
                          </label>
                          <input
                            type="text"
                            value={room.size}
                            onChange={(e) => updateRoomType(room.id, 'size', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Contoh: 25 m²"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kapasitas Tamu
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => updateRoomType(room.id, 'capacity', Math.max(1, room.capacity - 1))}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="px-4 py-2 border border-gray-300 rounded-lg min-w-0 text-center">
                              {room.capacity} tamu
                            </span>
                            <button
                              type="button"
                              onClick={() => updateRoomType(room.id, 'capacity', room.capacity + 1)}
                              className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tipe Kasur
                          </label>
                          <select
                            value={room.bedType}
                            onChange={(e) => updateRoomType(room.id, 'bedType', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Pilih Tipe Kasur</option>
                            <option value="single">Single Bed</option>
                            <option value="twin">Twin Bed</option>
                            <option value="double">Double Bed</option>
                            <option value="queen">Queen Bed</option>
                            <option value="king">King Bed</option>
                          </select>
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Harga per Malam (IDR)
                          </label>
                          <input
                            type="number"
                            value={room.price}
                            onChange={(e) => updateRoomType(room.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="500000"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi Kamar
                        </label>
                        <textarea
                          value={room.description}
                          onChange={(e) => updateRoomType(room.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Deskripsi singkat tentang kamar ini..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Map Tab */}
          {activeTab === 'map' && (
            <div className="bg-white rounded-2xl shadow-xl p-8 space-y-8">
              <div className="border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Map className="w-5 h-5 text-red-600" />
                  Lokasi Hotel
                </h2>
                <p className="text-sm text-gray-500 mt-1">Tentukan lokasi hotel untuk memudahkan tamu menemukan</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => handleInputChange('latitude', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 1.1304753"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => handleInputChange('longitude', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Contoh: 104.0524807"
                    />
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-2">Cara mendapatkan koordinat:</h4>
                    <ol className="text-sm text-blue-800 space-y-1">
                      <li>1. Buka Google Maps</li>
                      <li>2. Cari lokasi hotel Anda</li>
                      <li>3. Klik kanan pada lokasi</li>
                      <li>4. Pilih koordinat yang muncul</li>
                      <li>5. Copy dan paste di form ini</li>
                    </ol>
                  </div>
                </div>
                <div className="bg-gray-100 rounded-lg p-8 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Map className="w-16 h-16 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Preview Peta</p>
                    <p className="text-sm">Masukkan koordinat untuk melihat lokasi</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>Pastikan semua informasi sudah benar sebelum submit</p>
                <p className="mt-1">Tab yang sudah diisi: 
                  <span className="font-medium text-blue-600 ml-1">
                    Informasi Dasar{mediaFiles.length > 0 && ', Galeri'}{selectedFacilities.length > 0 && ', Fasilitas'}{roomTypes.length > 0 && ', Kamar'}{(formData.latitude && formData.longitude) && ', Lokasi'}
                  </span>
                </p>
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Mendaftarkan...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Daftarkan Hotel
                  </>
                )}
              </button>
            </div>

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
      </div>
    </div>
  );
}