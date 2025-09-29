// frontend/src/app/admin/businesses/edit/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import NextImage from "next/image";
import { useRouter, useParams } from "next/navigation";
import { 
    Building2, MapPin, Phone, Globe, Upload, Mail, AlertCircle, Loader2, X, Camera,
    Wifi, Car, Waves, Dumbbell, Coffee, Utensils, AirVent, Tv, Bath, Bed, Plus, Minus, 
    Check, Bell, Dog, ArrowLeft, Save, Users as UsersIcon, Ruler, BedDouble
} from 'lucide-react';

// --- INTERFACE BACKEND RESPONSE & STATE ---
interface Category {
    id: number;
    name: string; // Menggantikan nama
    slug: string;
}

interface Subcategory {
    id: number;
    category_id: number; // Menggantikan kategori_id
    name: string; // Menggantikan nama
    slug: string;
}

interface MediaFile {
    file: File;
    type: 'photo' | 'video';
    preview: string; // Blob URL di frontend
}

interface ExistingMedia {
    id: number; // business_media.id
    file_path: string; // business_media.file_path (URL/Path)
    file_type: 'image' | 'video'; // Menggantikan media_type
}

interface Facility {
    id: string; // Menggunakan NAME string sebagai ID untuk frontend toggle
    name: string; 
    icon: React.ElementType;
}

interface RoomType {
    // Note: ID RoomType dari DB adalah number, tapi di state kita gunakan string untuk yang baru dibuat
    id: string | number; 
    name: string;
    description: string;
    size_sqm: number; // Disesuaikan dengan DB
    max_occupancy: number; // Disesuaikan dengan DB
    bed_type: string;
    base_price: number;
    image_url?: string;
}

interface BusinessData {
    // Data utama dari tabel businesses
    id: number;
    name: string; // businesses.name
    address: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    latitude: number;
    longitude: number;
    thumbnail_image: string; // businesses.thumbnail_image
    
    // Data ter-join (ID diganti slug/nama untuk form)
    category_slug: string; 
    subcategory_slug: string; 

    // Data Relasional
    media: ExistingMedia[]; // business_media
    amenities: { name: string, icon: string }[]; // business_facilities JOIN facilities
    room_types: RoomType[]; // room_types
    // Asumsi jam operasional di-join di hours array (business_hours)
    hours: { day_of_week: number, open_time: string, close_time: string }[];
}

interface FormData {
    nama: string;
    alamat: string;
    kategori: string; // slug kategori
    subkategori: string; // slug subkategori
    kontak: string;
    website: string;
    email: string;
    deskripsi: string;
    logo: File | null;
    latitude: string;
    longitude: string;
    checkIn?: string;
    checkOut?: string;
}

export default function EditSubmissionForm() {
    const router = useRouter();
    const params = useParams();
    const businessId = params?.id as string; // Menggunakan businessId

    const [formData, setFormData] = useState<FormData>({
        nama: '', alamat: '', kategori: '', subkategori: '', kontak: '', website: '', 
        email: '', deskripsi: '', logo: null, latitude: '', longitude: '', 
        checkIn: '14:00', checkOut: '12:00'
    });

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [existingMedia, setExistingMedia] = useState<ExistingMedia[]>([]);
    const [newMedia, setNewMedia] = useState<MediaFile[]>([]);
    const [removedMediaIds, setRemovedMediaIds] = useState<number[]>([]);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Data statis/default kategori (IDEALNYA DI-FETCH DARI /api/categories)
    const categories: Category[] = [
        { id: 1, nama: 'Akomodasi', slug: 'akomodasi' },
        { id: 2, nama: 'Wisata', slug: 'wisata' },
        { id: 3, nama: 'Kuliner', slug: 'kuliner' },
    ];

    // Data subkategori (IDEALNYA DI-FETCH DARI /api/subcategories)
    const subcategories: Subcategory[] = [
        { id: 1, category_id: 1, nama: 'Hotel Bintang 5', slug: 'hotel-bintang-5' },
        { id: 2, category_id: 1, nama: 'Hotel Bintang 4', slug: 'hotel-bintang-4' },
        { id: 3, category_id: 1, nama: 'Hotel Bintang 3', slug: 'hotel-bintang-3' },
        { id: 11, category_id: 3, nama: 'Restoran', slug: 'restoran' },
        { id: 12, category_id: 3, nama: 'Kafe', slug: 'kafe' },
    ];

    // Data fasilitas (ID string harus sesuai dengan kolom 'name' di tabel FACILITIES)
    const availableFacilities: Facility[] = [
        { id: 'WiFi Gratis', name: 'Wi-Fi Gratis', icon: Wifi },
        { id: 'Parkir Gratis', name: 'Parkir Gratis', icon: Car },
        { id: 'Kolam Renang', name: 'Kolam Renang', icon: Waves },
        { id: 'Pusat Kebugaran', name: 'Pusat Kebugaran', icon: Dumbbell },
        { id: 'Restoran', name: 'Restoran', icon: Utensils },
        { id: 'Sarapan Gratis', name: 'Sarapan Gratis', icon: Coffee },
        { id: 'Layanan Kamar', name: 'Layanan Kamar', icon: Bell },
        { id: 'AC', name: 'AC', icon: AirVent },
        { id: 'Televisi', name: 'Televisi', icon: Tv },
        { id: 'Hewan Peliharaan Diizinkan', name: 'Hewan Peliharaan Diizinkan', icon: Dog },
        { id: 'Spa', name: 'Spa', icon: Bath },
    ];
    
    // Helper untuk menentukan apakah bisnis saat ini adalah Akomodasi
    const isAkomodasi = formData.kategori === 'akomodasi';

    // Filter subkategori berdasarkan kategori yang dipilih
    const selectedCategory = categories.find(cat => cat.slug === formData.kategori);
    const filteredSubcategories = subcategories.filter(
        sub => selectedCategory ? sub.category_id === selectedCategory.id : false
    );
    
    // Helper untuk membuat URL penuh untuk gambar
    const getMediaUrl = (path: string | undefined): string => {
        if (!path) return '';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        return path.startsWith('http') ? path : `${apiUrl}/uploads/${path}`;
    };

    // --- FETCH DATA SAAT MEMUAT ---
    useEffect(() => {
        const fetchSubmission = async () => {
            if (!businessId) return;
            
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                // Gunakan endpoint yang sudah kita buat: GET /api/businesses/:id
                const response = await fetch(`${apiUrl}/api/businesses/${businessId}`);
                
                if (!response.ok) throw new Error('Gagal memuat data bisnis. Periksa ID.');
                
                const result = await response.json();
                
                if (result.success) {
                    const business: BusinessData = result.data;

                    // 1. Set Form Data Utama (Mapping dari DB ke Form State)
                    setFormData({
                        nama: business.name || '',
                        alamat: business.address || '',
                        // Mapping slug kategori dari DB ke state form
                        kategori: business.category_slug || '', 
                        subkategori: business.subcategory_slug || '',
                        kontak: business.phone || '',
                        website: business.website || '',
                        email: business.email || '',
                        deskripsi: business.description || '',
                        logo: null, // Logo file harus di-upload ulang, jadi di-set null
                        latitude: business.latitude?.toString() || '',
                        longitude: business.longitude?.toString() || '',
                        // Asumsi jam operasional di-join di business.hours
                        checkIn: business.hours?.[0]?.open_time?.substring(0, 5) || '14:00',
                        checkOut: business.hours?.[0]?.close_time?.substring(0, 5) || '12:00'
                    });
                    
                    // 2. Set Media
                    if (business.thumbnail_image) {
                        setLogoPreview(getMediaUrl(business.thumbnail_image));
                    }
                    if (business.media) setExistingMedia(business.media.map(m => ({
                        id: m.id, media_path: getMediaUrl(m.file_path), media_type: m.file_type
                    })));

                    // 3. Set Facilities
                    if (business.amenities) {
                        // Mengambil NAME dari fasilitas yang tersedia (dari JOIN)
                        const selectedNames = business.amenities.map(a => a.name);
                        setSelectedFacilities(selectedNames);
                    }
                    
                    // 4. Set Room Types
                    if (business.room_types) {
                         setRoomTypes(business.room_types.map(room => ({
                            // Mengonversi ID DB (number) ke string untuk kompatibilitas state ID
                            id: room.id.toString(), 
                            name: room.name,
                            description: room.description,
                            size: `${room.size_sqm} m²`, // Format kembali ke string yang diharapkan form
                            capacity: room.max_occupancy,
                            bedType: room.bed_type,
                            price: room.base_price,
                        })));
                    }
                }
            } catch (error) {
                console.error('Error:', error);
                setErrors({ general: 'Gagal memuat data' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmission();
    }, [businessId]);
    // --- AKHIR FETCH DATA ---


    // --- HANDLERS (Umum) ---
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
        
        // Reset subkategori/relasi jika kategori berubah
        if (field === 'kategori' && value !== formData.kategori) {
            setFormData(prev => ({ ...prev, subkategori: '' }));
            setSelectedFacilities([]);
            setRoomTypes([]);
        }
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        // ... (Validasi file) ...
        setFormData(prev => ({ ...prev, logo: file }));
        setLogoPreview(URL.createObjectURL(file));
        setErrors(prev => ({ ...prev, logo: "" }));
    };

    const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files) return;
        
        const newMediaFiles: MediaFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';
            newMediaFiles.push({ file, type: mediaType, preview: URL.createObjectURL(file) });
        }
        setNewMedia(prev => [...prev, ...newMediaFiles]);
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilities(prev => 
            prev.includes(facilityId) 
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId]
        );
    };

    const addRoomType = () => {
        setRoomTypes(prev => [...prev, {
            id: `new_room_${Date.now()}`, // Gunakan string ID sementara
            name: '', description: '', size: '', capacity: 2, bedType: '', price: 0,
            size_sqm: 0, max_occupancy: 0, base_price: 0, image_url: '', bed_type: ''
        }]);
    };

    const updateRoomType = (roomId: string | number, field: keyof RoomType, value: any) => {
        setRoomTypes(prev => prev.map(room => 
            room.id === roomId ? { ...room, [field]: value } : room
        ));
    };

    const removeRoomType = (roomId: string | number) => {
        setRoomTypes(prev => prev.filter(room => room.id !== roomId));
        // NOTE: Untuk PUT, Anda mungkin perlu logic untuk menandai kamar lama yang dihapus jika room.id adalah number
        // Saat ini, kita asumsikan backend akan menghapus semua room_types yang tidak dikirim dan membuat yang baru.
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
        // ... [LOGIC VALIDASI LAINNYA] ...
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };


    // --- FUNGSI SUBMIT UNTUK UPDATE DATA (PUT) ---
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const data = new FormData();
        
        // 1. Append Form Data
        Object.keys(formData).forEach(key => {
            const value = formData[key as keyof FormData];
            if (typeof value === 'string' && key !== 'logo') data.append(key, value);
        });
        
        // 2. Append Relational Data (Facilities & Rooms)
        if (isAkomodasi) {
            data.append('selectedFacilities', JSON.stringify(selectedFacilities));
            // Map roomTypes ke format yang diterima backend:
            const processedRooms = roomTypes.map(room => ({
                // Hanya kirim kolom DB yang diperlukan
                id: typeof room.id === 'number' ? room.id : undefined,
                name: room.name,
                description: room.description,
                size_sqm: parseInt(room.size.replace(/\D/g, '') || '0'), 
                max_occupancy: room.capacity,
                bed_type: room.bedType,
                base_price: room.price,
            }));
            data.append('roomTypes', JSON.stringify(processedRooms));
        }

        // 3. Append Media (New & Removed)
        if (formData.logo) data.append('thumbnail_picture', formData.logo);
        newMedia.forEach(media => data.append('media_files', media.file));
        if (removedMediaIds.length > 0) data.append('removed_media_ids', JSON.stringify(removedMediaIds));

        try {
            const response = await fetch(`${apiUrl}/api/businesses/${businessId}`, {
                method: 'PUT',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) throw new Error(result.error || 'Gagal update');

            setShowSuccess(true);
        } catch (error) {
            console.error('Error:', error);
            setErrors({ general: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };
    // -----------------------------------------------------------


    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        // ... (Success state JSX) ...
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-blue-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Diperbarui!</h2>
                    <p className="text-gray-600 mb-6">Data bisnis telah berhasil diperbarui.</p>
                    <button 
                        onClick={() => router.push('/admin/businesses')}
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
            <div className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-6xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Edit Bisnis: {formData.nama}</h1>
                                <p className="text-sm text-gray-500">Perbarui informasi bisnis Anda (ID: {businessId})</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {errors.general && (
                <div className="max-w-6xl mx-auto px-4 mt-4">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span><strong>Error!</strong> {errors.general}</span>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Informasi Dasar */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Dasar</h2>
                        
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nama Bisnis <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.nama}
                                        onChange={(e) => handleInputChange('nama', e.target.value)}
                                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.nama ? 'border-red-300' : 'border-gray-300'}`}
                                        placeholder="Nama Bisnis"
                                    />
                                    {errors.nama && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.nama}</p>)}
                                </div>
                                
                                {/* Kategori */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.kategori}
                                        onChange={(e) => handleInputChange('kategori', e.target.value)}
                                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.kategori ? 'border-red-300' : 'border-gray-300'}`}
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => (<option key={cat.id} value={cat.slug}>{cat.nama}</option>))}
                                    </select>
                                    {errors.kategori && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.kategori}</p>)}
                                </div>
                            </div>

                            {/* Subkategori & Alamat */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subkategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.subkategori}
                                        onChange={(e) => handleInputChange('subkategori', e.target.value)}
                                        disabled={!formData.kategori}
                                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.subkategori ? 'border-red-300' : 'border-gray-300'} disabled:bg-gray-100 disabled:cursor-not-allowed`}
                                    >
                                        <option value="">
                                            {formData.kategori ? 'Pilih Subkategori' : 'Pilih kategori terlebih dahulu'}
                                        </option>
                                        {filteredSubcategories.map(sub => (<option key={sub.id} value={sub.slug}>{sub.nama}</option>))}
                                    </select>
                                    {errors.subkategori && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.subkategori}</p>)}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap <span className="text-red-500">*</span></label>
                                    <textarea
                                        value={formData.alamat}
                                        onChange={(e) => handleInputChange('alamat', e.target.value)}
                                        rows={1}
                                        placeholder="Jl. Hang Tuah No. 123, Batam Center"
                                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.alamat ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                    {errors.alamat && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.alamat}</p>)}
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                                    rows={4}
                                    placeholder="Ceritakan tentang bisnis Anda..."
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kontak & Operasional */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kontak & Operasional</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {/* Kontak */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Nomor Telepon <span className="text-red-500">*</span></label>
                                    <div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="tel" value={formData.kontak} onChange={(e) => handleInputChange('kontak', e.target.value)} placeholder="0778-123456" className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.kontak ? 'border-red-300' : 'border-gray-300'}`} /></div>
                                    {errors.kontak && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.kontak}</p>)}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                    <div className="relative"><Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} placeholder="info@bisnis.com" className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.email ? 'border-red-300' : 'border-gray-300'}`} /></div>
                                    {errors.email && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.email}</p>)}
                                </div>
                            </div>
                            
                            {/* Website & Jam */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                    <div className="relative"><Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="https://www.bisnis.com" className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.website ? 'border-red-300' : 'border-gray-300'}`} /></div>
                                    {errors.website && (<p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.website}</p>)}
                                </div>
                                
                                {isAkomodasi && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Check-in</label>
                                            <input type="time" value={formData.checkIn} onChange={(e) => handleInputChange('checkIn', e.target.value)} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Check-out</label>
                                            <input type="time" value={formData.checkOut} onChange={(e) => handleInputChange('checkOut', e.target.value)} className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Media & Gallery */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Logo & Thumbnail</h2>
                            
                            {!logoPreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                                    <label htmlFor="logo-upload" className="cursor-pointer"><Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Ganti Logo</h3>
                                    <p className="text-gray-500">PNG, JPG hingga 5MB</p></label>
                                </div>
                            ) : (
                                <div className="relative">
                                    <NextImage src={logoPreview} alt="Logo" width={300} height={100} className="w-full h-32 object-contain border rounded-xl p-4" />
                                    <button type="button" onClick={() => {setFormData(prev => ({ ...prev, logo: null })); setLogoPreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                            {errors.logo && (<p className="text-sm text-red-600 mt-2 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.logo}</p>)}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Galeri ({existingMedia.length + newMedia.length} total)</h2>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4 hover:border-gray-400 transition-colors">
                                <input type="file" accept="image/*,video/*" multiple onChange={handleGalleryUpload} className="hidden" id="gallery-upload" />
                                <label htmlFor="gallery-upload" className="cursor-pointer"><Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                <h4 className="font-medium text-gray-900 mb-1">Tambah Foto/Video Baru</h4>
                                <p className="text-xs text-blue-600">Max 10MB per file</p></label>
                            </div>

                            {(existingMedia.length > 0 || newMedia.length > 0) && (
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                    {/* Media Existing */}
                                    {existingMedia.map((media) => (
                                        <div key={media.id} className="relative group">
                                            <NextImage src={media.media_path} alt="" width={64} height={64} className="w-full h-16 object-cover rounded-lg" />
                                            <button type="button" onClick={() => {setRemovedMediaIds(prev => [...prev, media.id]); setExistingMedia(prev => prev.filter(m => m.id !== media.id));}} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                    {/* Media Baru */}
                                    {newMedia.map((media, idx) => (
                                        <div key={idx} className="relative group">
                                            <NextImage src={media.preview} alt="" width={64} height={64} className="w-full h-16 object-cover rounded-lg" />
                                            <button type="button" onClick={() => setNewMedia(prev => prev.filter((_, i) => i !== idx))} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {removedMediaIds.length > 0 && (<p className="text-xs text-red-500 mt-2">*{removedMediaIds.length} file lama akan dihapus saat disimpan.</p>)}
                        </div>
                    </div>

                    {/* Fasilitas - Only for Akomodasi */}
                    {isAkomodasi && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fasilitas</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {availableFacilities.map(facility => {
                                    const Icon = facility.icon;
                                    const isSelected = selectedFacilities.includes(facility.id);
                                    return (
                                        <button key={facility.id} type="button" onClick={() => toggleFacility(facility.id)} className={`p-4 border-2 rounded-xl transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}>
                                            <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                            <span className="text-sm font-medium">{facility.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Tipe Kamar - Only for Akomodasi */}
                    {isAkomodasi && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-800">Tipe Kamar</h2>
                                <button type="button" onClick={addRoomType} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />Tambah Kamar
                                </button>
                            </div>

                            {roomTypes.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl"><Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada tipe kamar</h3>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {roomTypes.map((room, index) => (
                                        <div key={room.id} className="border border-gray-200 rounded-xl p-4 space-y-3">
                                            <div className="flex items-center justify-between"><h3 className="text-lg font-medium text-gray-800">Kamar #{index + 1}</h3>
                                            <button type="button" onClick={() => removeRoomType(room.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><X className="w-4 h-4" /></button></div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Nama Kamar *</label>
                                                <input type="text" value={room.name} onChange={(e) => updateRoomType(room.id, 'name', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Superior Room" /></div>
                                                
                                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Ukuran Kamar</label>
                                                <input type="text" value={room.size} onChange={(e) => updateRoomType(room.id, 'size', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="25 m²" /></div>

                                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas Tamu</label>
                                                <div className="flex items-center gap-2">
                                                    <button type="button" onClick={() => updateRoomType(room.id, 'capacity', Math.max(1, room.capacity - 1))} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Minus className="w-4 h-4" /></button>
                                                    <span className="px-4 py-2 border border-gray-300 rounded-lg text-center min-w-[100px]">{room.capacity} tamu</span>
                                                    <button type="button" onClick={() => updateRoomType(room.id, 'capacity', room.capacity + 1)} className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"><Plus className="w-4 h-4" /></button>
                                                </div></div>

                                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Tipe Kasur</label>
                                                <select value={room.bedType} onChange={(e) => updateRoomType(room.id, 'bedType', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                                                    <option value="">Pilih Tipe Kasur</option><option value="single">Single Bed</option><option value="twin">Twin Bed</option><option value="double">Double Bed</option><option value="queen">Queen Bed</option><option value="king">King Bed</option>
                                                </select></div>

                                                <div><label className="block text-sm font-medium text-gray-700 mb-1">Harga per Malam (IDR)</label>
                                                <input type="number" value={room.price} onChange={(e) => updateRoomType(room.id, 'price', parseFloat(e.target.value) || 0)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="500000" /></div>

                                                <div className="md:col-span-2"><label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Kamar</label>
                                                <textarea value={room.description} onChange={(e) => updateRoomType(room.id, 'description', e.target.value)} rows={2} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="Deskripsi singkat tentang kamar ini..." /></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Lokasi */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lokasi (GPS)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                            <input type="text" value={formData.latitude} onChange={(e) => handleInputChange('latitude', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="1.1304753" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                            <input type="text" value={formData.longitude} onChange={(e) => handleInputChange('longitude', e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="104.0524807" /></div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-gray-600">{errors.general ? errors.general : 'Tekan Simpan untuk menerapkan semua perubahan.'}</p>
                            <button type="submit" disabled={isSaving} className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2">
                                {isSaving ? (<><Loader2 className="w-5 h-5 animate-spin" />Menyimpan...</>) : (<><Save className="w-5 h-5" />Simpan Perubahan</>)}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}