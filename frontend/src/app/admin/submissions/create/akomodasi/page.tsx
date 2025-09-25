'use client'

import React, { useState } from 'react';
import { 
    ArrowLeft,
    Building2, 
    MapPin, 
    Phone, 
    Globe, 
    Upload, 
    Mail,
    CheckCircle,
    AlertCircle,
    Loader2,
    X,
    ChevronDown,
    Camera,
    Wifi,
    Car,
    Waves,
    Dumbbell,
    Coffee,
    Utensils,
    AirVent,
    Tv,
    Bath,
    Bed,
    Users,
    Plus,
    Minus,
    Star,
    Check
} from 'lucide-react';

interface HotelFormData {
  nama: string;
  alamat: string;
  kategori: string;
  subkategori: string;
  kontak: string;
  website: string;
  email: string;
  deskripsi: string;
  logo: File | null;
  latitude: string;
  longitude: string;
  checkIn: string;
  checkOut: string;
}

interface MediaFile {
  file: File;
  type: 'photo' | 'video';
  preview: string;
  category: string;
}

interface Facility {
  id: string;
  name: string;
  icon: React.ElementType;
  category: string;
}

interface RoomType {
  id: string;
  name: string;
  description: string;
  size: string;
  capacity: number;
  bedType: string;
  price: number;
}

export default function HotelFullForm() {
  const [formData, setFormData] = useState<HotelFormData>({
    nama: '',
    alamat: '',
    kategori: 'akomodasi',
    subkategori: '',
    kontak: '',
    website: '',
    email: '',
    deskripsi: '',
    logo: null,
    latitude: '',
    longitude: '',
    checkIn: '14:00',
    checkOut: '12:00'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showSuccess, setShowSuccess] = useState(false);

  const subcategories = [
    { id: 1, nama: 'Hotel Bintang 5', slug: 'hotel-bintang-5' },
    { id: 2, nama: 'Hotel Bintang 4', slug: 'hotel-bintang-4' },
    { id: 3, nama: 'Hotel Bintang 3', slug: 'hotel-bintang-3' },
    { id: 4, nama: 'Guest House', slug: 'guest-house' },
    { id: 5, nama: 'Homestay', slug: 'homestay' },
    { id: 6, nama: 'Villa', slug: 'villa' },
    { id: 7, nama: 'Resort', slug: 'resort' },
    { id: 8, nama: 'Apartment', slug: 'apartment' }
  ];

  const availableFacilities: Facility[] = [
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

  const handleInputChange = (field: keyof HotelFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

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

  const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const newMedia: MediaFile[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > 10 * 1024 * 1024) continue;
      
      let mediaType: 'photo' | 'video';
      if (file.type.startsWith('image/')) {
        mediaType = 'photo';
      } else if (file.type.startsWith('video/')) {
        mediaType = 'video';
      } else {
        continue;
      }
      
      const previewUrl = URL.createObjectURL(file);
      newMedia.push({ file, type: mediaType, preview: previewUrl, category: 'general' });
    }

    setMediaFiles(prev => [...prev, ...newMedia]);
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleFacility = (facilityId: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facilityId) 
        ? prev.filter(id => id !== facilityId)
        : [...prev, facilityId]
    );
  };

  const addRoomType = () => {
    const newRoom: RoomType = {
      id: `room_${Date.now()}`,
      name: '',
      description: '',
      size: '',
      capacity: 2,
      bedType: '',
      price: 0
    };
    setRoomTypes(prev => [...prev, newRoom]);
  };

  const updateRoomType = (roomId: string, field: keyof RoomType, value: any) => {
    setRoomTypes(prev => prev.map(room => 
      room.id === roomId ? { ...room, [field]: value } : room
    ));
  };

  const removeRoomType = (roomId: string) => {
    setRoomTypes(prev => prev.filter(room => room.id !== roomId));
  };

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
    }, 2000);
  };

  if (showSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Didaftarkan!</h2>
          <p className="text-gray-600 mb-6">
            Hotel Anda telah berhasil didaftarkan dan akan diverifikasi dalam 1-2 hari kerja.
          </p>
          <button 
            onClick={() => window.history.back()}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Kembali ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
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
                <h1 className="text-xl font-bold text-gray-800">Daftarkan Hotel/Akomodasi</h1>
                <p className="text-sm text-gray-500">Lengkapi semua informasi hotel Anda</p>
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

      <div className="max-w-6xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Informasi Dasar */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Dasar Hotel</h2>
            
            <div className="space-y-6">
              {/* Nama & Jenis */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nama Hotel/Akomodasi <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.nama}
                    onChange={(e) => handleInputChange('nama', e.target.value)}
                    placeholder="Contoh: Hotel Grand Batam"
                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.nama ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.nama && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.nama}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Jenis Akomodasi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.subkategori}
                    onChange={(e) => handleInputChange('subkategori', e.target.value)}
                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                      errors.subkategori ? 'border-red-300' : 'border-gray-300'
                    }`}
                  >
                    <option value="">Pilih Jenis Akomodasi</option>
                    {subcategories.map((sub) => (
                      <option key={sub.id} value={sub.slug}>
                        {sub.nama}
                      </option>
                    ))}
                  </select>
                  {errors.subkategori && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.subkategori}
                    </p>
                  )}
                </div>
              </div>

              {/* Alamat */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Alamat Lengkap <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  placeholder="Jl. Hang Tuah No. 123, Batam Center, Kota Batam"
                  rows={3}
                  className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none ${
                    errors.alamat ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.alamat && (
                  <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.alamat}
                  </p>
                )}
              </div>

              {/* Deskripsi */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Deskripsi Hotel
                </label>
                <textarea
                  value={formData.deskripsi}
                  onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                  placeholder="Ceritakan tentang hotel Anda, fasilitas yang tersedia, keunggulan, dan hal menarik lainnya..."
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>

          {/* Kontak & Operasional */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kontak & Jam Operasional</h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nomor Telepon <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.kontak}
                      onChange={(e) => handleInputChange('kontak', e.target.value)}
                      placeholder="0778-123456"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.kontak ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.kontak && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.kontak}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="info@hotel.com"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.email ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.email}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      placeholder="https://www.hotel.com"
                      className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none ${
                        errors.website ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                  </div>
                  {errors.website && (
                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {errors.website}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-in
                    </label>
                    <input
                      type="time"
                      value={formData.checkIn}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Check-out
                    </label>
                    <input
                      type="time"
                      value={formData.checkOut}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logo & Galeri */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Logo Upload */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Logo Hotel</h2>
              
              {!logoPreview ? (
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleLogoChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label htmlFor="logo-upload" className="cursor-pointer">
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Logo</h3>
                    <p className="text-gray-500">PNG, JPG hingga 5MB</p>
                  </label>
                </div>
              ) : (
                <div className="relative">
                  <img 
                    src={logoPreview} 
                    alt="Logo Preview" 
                    className="w-full h-32 object-contain border rounded-xl p-4"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, logo: null }));
                      setLogoPreview(null);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Galeri Upload */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Galeri Foto Hotel</h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4">
                <input
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  onChange={handleGalleryUpload}
                  className="hidden"
                  id="gallery-upload"
                />
                <label htmlFor="gallery-upload" className="cursor-pointer">
                  <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                  <h4 className="font-medium text-gray-900 mb-1">Upload Foto & Video</h4>
                  <p className="text-xs text-blue-600">Klik untuk upload</p>
                </label>
              </div>

              {mediaFiles.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {mediaFiles.slice(0, 6).map((media, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={media.preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-16 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeMedia(index)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {mediaFiles.length > 6 && (
                <p className="text-sm text-gray-500 mt-2">+{mediaFiles.length - 6} foto lainnya</p>
              )}
            </div>
          </div>

          {/* Fasilitas */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fasilitas Hotel</h2>
            <p className="text-gray-600 mb-6">Pilih fasilitas yang tersedia di hotel Anda</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {availableFacilities.map(facility => {
                const Icon = facility.icon;
                const isSelected = selectedFacilities.includes(facility.id);
                return (
                  <button
                    key={facility.id}
                    type="button"
                    onClick={() => toggleFacility(facility.id)}
                    className={`p-4 border-2 rounded-xl transition-colors ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-blue-300 text-gray-600'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                    <span className="text-sm font-medium">{facility.name}</span>
                  </button>
                );
              })}
            </div>

            {selectedFacilities.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="font-medium text-blue-900">
                  Fasilitas Terpilih ({selectedFacilities.length})
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  {selectedFacilities.map(id => 
                    availableFacilities.find(f => f.id === id)?.name
                  ).join(', ')}
                </p>
              </div>
            )}
          </div>

          {/* Tipe Kamar */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Tipe Kamar</h2>
                <p className="text-gray-600">Tambahkan jenis kamar yang tersedia (opsional)</p>
              </div>
              <button
                type="button"
                onClick={addRoomType}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Tambah Kamar
              </button>
            </div>

            {roomTypes.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada tipe kamar</h3>
                <p className="text-sm text-gray-500 mb-4">Tambahkan tipe kamar yang tersedia</p>
                <button
                  type="button"
                  onClick={addRoomType}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Tambah Kamar Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {roomTypes.map((room, index) => (
                  <div key={room.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
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
                          placeholder="Superior Room"
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
                          placeholder="25 m²"
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
                          <span className="px-4 py-2 border border-gray-300 rounded-lg text-center min-w-0">
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

                      <div>
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

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Deskripsi Kamar
                        </label>
                        <textarea
                          value={room.description}
                          onChange={(e) => updateRoomType(room.id, 'description', e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          placeholder="Deskripsi singkat tentang kamar ini..."
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Lokasi */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Lokasi Hotel (Opsional)</h2>
            <p className="text-gray-600 mb-6">Tentukan koordinat lokasi hotel untuk memudahkan tamu menemukan</p>
            
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
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2">Preview Peta</p>
                  <p className="text-sm">Masukkan koordinat untuk melihat lokasi</p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                <p>Pastikan semua informasi sudah benar sebelum mendaftar</p>
                <p className="mt-1">
                  Form yang sudah diisi: 
                  <span className="font-medium text-blue-600 ml-1">
                    {formData.nama && 'Info Dasar'}
                    {formData.kontak && ', Kontak'}
                    {formData.logo && ', Logo'}
                    {mediaFiles.length > 0 && ', Galeri'}
                    {selectedFacilities.length > 0 && ', Fasilitas'}
                    {roomTypes.length > 0 && ', Kamar'}
                    {(formData.latitude && formData.longitude) && ', Lokasi'}
                  </span>
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
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
          </div>
        </form>
      </div>
    </div>
  );
}