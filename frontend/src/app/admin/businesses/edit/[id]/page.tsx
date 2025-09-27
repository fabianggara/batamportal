// src/app/admin/submissions/edit/[id]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from "next/navigation";
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
    ArrowLeft,
    Save
    } from 'lucide-react';

    // Types
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

    type SubmissionMedia = {
    file: File;
    type: 'photo' | 'video';
    preview: string;
    };

    type ExistingMedia = {
    id: number;
    media_path: string;
    media_type: 'photo' | 'video';
    };

    export default function ModernEditSubmissionPage() {
    const router = useRouter();
    const params = useParams();
    const submissionId = params?.id as string;

    // Form state
    const [formData, setFormData] = useState({
        place_name: '',
        address: '',
        category: '',
        subcategory: '',
        contact: '',
        website: '',
        email: '',
        description: '',
        thumbnail_picture: null as File | null,
    });

    // Media states
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
    const [newMedia, setNewMedia] = useState<SubmissionMedia[]>([]);
    const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);

    // UI states
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
    const [statusMessage, setStatusMessage] = useState('');
    
    // Categories and subcategories data
    const [categories] = useState<Category[]>([
        { id: 1, nama: 'Akomodasi', slug: 'akomodasi', color: '#3B82F6', icon: 'building' },
        { id: 2, nama: 'Wisata', slug: 'wisata', color: '#10B981', icon: 'map-pin' },
        { id: 3, nama: 'Kuliner', slug: 'kuliner', color: '#F59E0B', icon: 'utensils' },
        { id: 4, nama: 'Hiburan', slug: 'hiburan', color: '#8B5CF6', icon: 'music' },
        { id: 5, nama: 'Transportasi', slug: 'transportasi', color: '#EF4444', icon: 'car' },
        { id: 6, nama: 'Kesehatan', slug: 'kesehatan', color: '#06B6D4', icon: 'heart' },
        { id: 7, nama: 'Pendidikan', slug: 'pendidikan', color: '#84CC16', icon: 'book' },
        { id: 8, nama: 'Belanja', slug: 'belanja', color: '#F97316', icon: 'shopping-bag' }
    ]);
    
    const [subcategories] = useState<Subcategory[]>([
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

    // Get selected category and filtered subcategories
    const selectedCategory = categories.find(cat => cat.slug === formData.category);
    const filteredSubcategories = subcategories.filter(
        sub => selectedCategory ? sub.kategori_id === selectedCategory.id : false
    );

    // Load existing submission data
    useEffect(() => {
        const fetchSubmission = async () => {
        if (!submissionId) return;
        
        setIsLoading(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
            const response = await fetch(`${apiUrl}/api/submissions/${submissionId}`);
            
            if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            if (result.success) {
            const submission = result.data;
            
            // Map database fields to form fields
            setFormData({
                place_name: submission.place_name || '',
                address: submission.address || '',
                category: submission.category || '',
                subcategory: submission.subcategory || '',
                contact: submission.contact || '',
                website: submission.website || '',
                email: submission.email || '',
                description: submission.description || '',
                thumbnail_picture: null,
            });
            
            // Set logo preview if exists
            if (submission.thumbnail_picture) {
                const imageUrl = submission.thumbnail_picture.startsWith('http') 
                ? submission.thumbnail_picture 
                : `http://localhost:5000/uploads/${submission.thumbnail_picture}`;
                setLogoPreview(imageUrl);
            }

            // Load existing media if available
            try {
                const mediaResponse = await fetch(`${apiUrl}/api/submissions/${submissionId}/media`);
                const mediaResult = await mediaResponse.json();
                if (mediaResult.success && mediaResult.data) {
                setExistingMedia(mediaResult.data);
                }
            } catch (mediaError) {
                console.log('No existing media found:', mediaError);
            }
            } else {
            throw new Error(result.error || 'Failed to fetch submission');
            }
        } catch (error) {
            console.error('Error fetching submission:', error);
            setSubmitStatus('error');
            setStatusMessage('Gagal memuat data submission');
        } finally {
            setIsLoading(false);
        }
        };

        fetchSubmission();
    }, [submissionId]);

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
        }
        
        if (field === 'category' && value !== formData.category) {
        setFormData(prev => ({ ...prev, subcategory: '' }));
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

        setFormData(prev => ({ ...prev, thumbnail_picture: file }));
        setErrors(prev => ({ ...prev, logo: "" }));

        const reader = new FileReader();
        reader.onload = (e) => {
        setLogoPreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    // Handle new media upload
    const handleNewMediaChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newMediaFiles: SubmissionMedia[] = [];
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
        newMediaFiles.push({ file, type: mediaType, preview: previewUrl });
        }

        if (fileErrors.length > 0) {
        setErrors(prev => ({ ...prev, media: fileErrors.join(' ') }));
        return;
        }

        setNewMedia(prev => [...prev, ...newMediaFiles]);
        setErrors(prev => ({ ...prev, media: "" }));
    };

    // Remove logo
    const removeLogo = () => {
        setFormData(prev => ({ ...prev, thumbnail_picture: null }));
        setLogoPreview(null);
        setErrors(prev => ({ ...prev, logo: '' }));
    };

    // Remove new media
    const removeNewMedia = (index: number) => {
        setNewMedia(prev => prev.filter((_, i) => i !== index));
    };

    // Remove existing media
    const removeExistingMedia = (mediaId: number) => {
        setRemovedMediaIds(prev => [...prev, mediaId]);
        setExistingMedia(prev => prev.filter(media => media.id !== mediaId));
    };

    // Form validation
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.place_name.trim()) newErrors.place_name = 'Nama tempat wajib diisi';
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.category) newErrors.category = 'Kategori wajib dipilih';
        if (!formData.subcategory) newErrors.subcategory = 'Subkategori wajib dipilih';
        if (!formData.contact.trim()) newErrors.contact = 'Kontak wajib diisi';
        
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

        setIsSaving(true);
        setSubmitStatus("idle");
        setStatusMessage("Menyimpan perubahan...");

        const submitData = new FormData();

        // Add form data
        Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && key !== 'thumbnail_picture') {
            submitData.append(key, String(value));
        }
        });

        // Add logo if changed
        if (formData.thumbnail_picture) {
        submitData.append('thumbnail_picture', formData.thumbnail_picture);
        }

        // Add new media files
        newMedia.forEach((media) => {
        submitData.append('media_files', media.file);
        });

        // Add removed media IDs
        if (removedMediaIds.length > 0) {
        submitData.append('removed_media_ids', JSON.stringify(removedMediaIds));
        }

        try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const response = await fetch(`${apiUrl}/api/submissions/${submissionId}`, {
            method: "PUT",
            body: submitData,
        });

        const result = await response.json();

        if (response.ok && result.success) {
            setSubmitStatus("success");
            setStatusMessage("Submission berhasil diperbarui!");
            
            setTimeout(() => {
            router.push('/admin/submissions');
            }, 2000);
        } else {
            setSubmitStatus("error");
            setStatusMessage(result.message || "Gagal memperbarui submission. Silakan coba lagi.");
        }
        } catch (error) {
        console.error("Update error:", error);
        setSubmitStatus("error");
        setStatusMessage("Terjadi kesalahan koneksi. Silakan coba lagi.");
        } finally {
        setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Memuat data submission...</p>
            </div>
        </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
                {/* <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                >
                <ArrowLeft className="w-6 h-6 text-gray-600" />
                </button> */}
                <div>
                <h1 className="text-3xl font-bold text-gray-900">
                    Edit Submission
                </h1>
                <p className="text-lg text-gray-600">
                    Perbarui informasi bisnis Anda
                </p>
                </div>
            </div>
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
                <label htmlFor="place_name" className="block text-sm font-medium text-gray-700">
                    Nama Tempat/Bisnis *
                </label>
                <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                    type="text"
                    id="place_name"
                    value={formData.place_name}
                    onChange={(e) => handleInputChange('place_name', e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.place_name ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Contoh: Hotel Grand Batam"
                    />
                </div>
                {errors.place_name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.place_name}
                    </p>
                )}
                </div>

                {/* Alamat */}
                <div className="space-y-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                    Alamat Lengkap *
                </label>
                <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <textarea
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    rows={3}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                        errors.address ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                    }`}
                    placeholder="Jl. Hang Tuah No. 123, Batam Center, Kota Batam"
                    />
                </div>
                {errors.address && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.address}
                    </p>
                )}
                </div>

                {/* Kategori */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                    Kategori *
                    </label>
                    <div className="relative">
                    <select
                        id="category"
                        value={formData.category}
                        onChange={(e) => handleInputChange('category', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none ${
                        errors.category ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
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
                    {errors.category && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.category}
                    </p>
                    )}
                </div>

                {/* Subkategori */}
                <div className="space-y-2">
                    <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
                    Subkategori *
                    </label>
                    <div className="relative">
                    <select
                        id="subcategory"
                        value={formData.subcategory}
                        onChange={(e) => handleInputChange('subcategory', e.target.value)}
                        disabled={!formData.category}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none disabled:bg-gray-100 disabled:text-gray-400 ${
                        errors.subcategory ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                    >
                        <option value="">
                        {formData.category ? 'Pilih Subkategori' : 'Pilih kategori terlebih dahulu'}
                        </option>
                        {filteredSubcategories.map((sub) => (
                        <option key={sub.id} value={sub.slug}>
                            {sub.nama}
                        </option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.subcategory && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.subcategory}
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
                        {formData.subcategory && (
                        <p className="text-sm text-gray-600">
                            {filteredSubcategories.find(sub => sub.slug === formData.subcategory)?.nama}
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
                    <label htmlFor="contact" className="block text-sm font-medium text-gray-700">
                    Nomor Telepon *
                    </label>
                    <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                        type="tel"
                        id="contact"
                        value={formData.contact}
                        onChange={(e) => handleInputChange('contact', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        errors.contact ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'
                        }`}
                        placeholder="0778-123456"
                    />
                    </div>
                    {errors.contact && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {errors.contact}
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
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                    Deskripsi Bisnis (Opsional)
                </label>
                <textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    placeholder="Ceritakan tentang bisnis Anda, fasilitas yang tersedia, keunggulan, dan hal menarik lainnya..."
                />
                <p className="text-xs text-gray-500">
                    {formData.description.length}/500 karakter
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
                        <img 
                        src={logoPreview} 
                        alt="Preview" 
                        className="w-16 h-16 object-contain rounded-lg"
                        />
                        <div className="flex-1">
                        <p className="font-medium text-gray-900">
                            {formData.thumbnail_picture?.name || "Current Image"}
                        </p>
                        <p className="text-sm text-gray-500">
                            {formData.thumbnail_picture && (formData.thumbnail_picture.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        <input
                            type="file"
                            accept="image/jpeg,image/jpg,image/png,image/webp"
                            onChange={handleLogoChange}
                            className="hidden"
                            id="logo-change"
                        />
                        <label htmlFor="logo-change" className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                            Ganti gambar
                        </label>
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

                {/* Media Tambahan */}
                <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                    Foto & Video Lainnya (Opsional)
                </label>

                {/* Existing Media - dengan preview yang lebih baik */}
                {existingMedia.length > 0 && (
                    <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Media Saat Ini ({existingMedia.length} file)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                        {existingMedia.map((media) => (
                        <div key={media.id} className="relative group rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-300 transition-colors">
                            {media.media_type === 'photo' ? (
                            <div className="aspect-square relative">
                                <img
                                src={media.media_path.startsWith('http') 
                                    ? media.media_path 
                                    : `http://localhost:5000/uploads/${media.media_path}`
                                }
                                alt={`Media ${media.id}`}
                                className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                Foto
                                </div>
                            </div>
                            ) : (
                            <div className="aspect-square relative bg-gray-900">
                                <video
                                src={media.media_path.startsWith('http') 
                                    ? media.media_path 
                                    : `http://localhost:5000/uploads/${media.media_path}`
                                }
                                className="w-full h-full object-cover"
                                preload="metadata"
                                />
                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <VideoIcon className="w-12 h-12 text-white opacity-80" />
                                </div>
                                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                                Video
                                </div>
                            </div>
                            )}
                            <button
                            type="button"
                            onClick={() => removeExistingMedia(media.id)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                            title="Hapus media ini"
                            >
                            <X className="w-4 h-4" />
                            </button>
                            {/* Overlay untuk menunjukkan akan dihapus */}
                            <div className="absolute inset-0 bg-red-500/20 opacity-0 group-hover:opacity-0 transition-opacity" />
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* New Media Upload Area */}
                <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    Upload Media Baru
                    </h4>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-colors">
                    <input
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        onChange={handleNewMediaChange}
                        className="hidden"
                        id="media-upload"
                    />
                    <label htmlFor="media-upload" className="cursor-pointer">
                        <div className="flex flex-col items-center">
                        <div className="bg-blue-100 p-3 rounded-full mb-3">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <p className="text-gray-700 mb-2">
                            <span className="font-medium text-blue-600">Klik untuk upload</span> atau drag & drop file
                        </p>
                        <p className="text-sm text-gray-500 mb-2">
                            Mendukung: JPG, PNG, WebP, MP4, MOV
                        </p>
                        <p className="text-xs text-gray-400">
                            Maksimal 10MB per file
                        </p>
                        </div>
                    </label>
                    </div>
                </div>

                {/* New Media Preview - dengan tombol hapus */}
                {newMedia.length > 0 && (
                    <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Media Baru akan Ditambahkan ({newMedia.length} file)
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {newMedia.map((media, index) => (
                        <div key={index} className="relative group rounded-lg overflow-hidden border-2 border-green-200 hover:border-green-300 transition-colors">
                            {media.type === 'photo' ? (
                            <div className="aspect-square relative">
                                <img
                                src={media.preview}
                                alt={`New Media ${index + 1}`}
                                className="w-full h-full object-cover"
                                />
                                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                                Foto Baru
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
                                <VideoIcon className="w-12 h-12 text-white opacity-80" />
                                </div>
                                <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 rounded text-xs">
                                Video Baru
                                </div>
                            </div>
                            )}
                            <button
                            type="button"
                            onClick={() => removeNewMedia(index)}
                            className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                            title="Batalkan upload file ini"
                            >
                            <X className="w-4 h-4" />
                            </button>
                            {/* File info overlay */}
                            <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2">
                            <p className="text-xs truncate">
                                {media.file.name}
                            </p>
                            <p className="text-xs text-gray-300">
                                {(media.file.size / (1024 * 1024)).toFixed(1)} MB
                            </p>
                            </div>
                        </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Summary info */}
                {(existingMedia.length > 0 || newMedia.length > 0) && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                    <div className="flex items-start gap-3">
                        <div className="bg-blue-100 p-1 rounded">
                        <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="text-sm">
                        <p className="font-medium text-blue-900 mb-1">Ringkasan Media:</p>
                        <ul className="space-y-1 text-blue-700">
                            {existingMedia.length > 0 && (
                            <li>• Media saat ini: {existingMedia.length} file</li>
                            )}
                            {newMedia.length > 0 && (
                            <li>• Media baru akan ditambahkan: {newMedia.length} file</li>
                            )}
                            {removedMediaIds.length > 0 && (
                            <li>• Media akan dihapus: {removedMediaIds.length} file</li>
                            )}
                        </ul>
                        </div>
                    </div>
                    </div>
                )}

                {errors.media && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-600 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {errors.media}
                    </p>
                    </div>
                )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-6 border-t border-gray-200">
                <div className="flex gap-4">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex-1 py-4 px-6 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={isSaving}
                    className={`flex-1 py-4 px-6 rounded-lg font-medium transition-colors ${
                    isSaving 
                        ? 'bg-blue-400 cursor-not-allowed' 
                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
                    } text-white`}
                >
                    {isSaving ? (
                    <span className="flex items-center justify-center gap-2">
                        <Loader2 className="animate-spin" size={20} />
                        Menyimpan...
                    </span>
                    ) : (
                    <span className="flex items-center justify-center gap-2">
                        <Save className="w-5 h-5" />
                        Simpan Perubahan
                    </span>
                    )}
                </button>
                </div>
            </div>

            {/* Status Message */}
            {submitStatus !== 'idle' && (
                <div 
                className={`p-4 rounded-lg flex items-center gap-3 transition-opacity duration-300 ${
                    submitStatus === 'success' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
                >
                {submitStatus === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                <p className="text-sm font-medium">{statusMessage}</p>
                </div>
            )}
            </form>
        </div>
        </div>
    );
}