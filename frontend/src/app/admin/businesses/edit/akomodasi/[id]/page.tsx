// frontend/src/app/admin/businesses/edit/akomodasi/[id]/page.tsx

'use client';

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import { 
    Building2, MapPin, Phone, Globe, Upload, Mail, AlertCircle, Loader2, X, Camera,
    Wifi, Car, Waves, Dumbbell, Coffee, Utensils, AirVent, Tv, Bath, Bed, Plus, Minus, 
    Check, Bell, Dog, ArrowLeft, Save
} from 'lucide-react';

// --- INTERFACES SESUAI DATABASE ---
interface Category {
    id: number;
    name: string;
    slug: string;
}

interface Subcategory {
    id: number;
    category_id: number;
    name: string;
    slug: string;
}

interface MediaFile {
    file: File;
    type: 'photo' | 'video';
    preview: string;
}

interface ExistingMedia {
    id: number;              // business_media.id
    file_path: string;       // business_media.file_path
    file_type: 'image' | 'video'; // business_media.file_type
}

interface Facility {
    id: string;             // Menggunakan NAME dari tabel facilities
    name: string;
    icon: React.ElementType;
    category: string;
}

// 🔥 INTERFACE SESUAI TABEL room_types
interface RoomType {
    id: string | number;    // room_types.id (number dari DB, string untuk temporary)
    name: string;           // room_types.name
    description: string;    // room_types.description
    size_sqm: number;       // room_types.size_sqm
    max_occupancy: number;  // room_types.max_occupancy
    bed_type: string;       // room_types.bed_type
    base_price: number;     // room_types.base_price
    image_url?: string;     // room_types.image_url (existing)
    
    // Frontend-only fields untuk handling upload
    photoFile: File | null;
    photoPreview: string | null;
}

interface BusinessData {
    id: number;
    name: string;
    address: string;
    description: string;
    phone: string;
    email: string;
    website: string;
    latitude: number;
    longitude: number;
    thumbnail_image: string;
    
    category_slug: string;
    subcategory_slug: string;

    media: ExistingMedia[];
    amenities: { name: string }[];
    room_types: RoomType[];
    hours: { day_of_week: number, open_time: string, close_time: string }[];
}

interface FormData {
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
    checkIn?: string;
    checkOut?: string;
}

export default function EditAccommodationForm() {
    const router = useRouter();
    const params = useParams();
    const businessId = params?.id as string;

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
    const [removedRoomIds, setRemovedRoomIds] = useState<number[]>([]); // 🔥 BARU: Track deleted rooms
    
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);

    // Static data (idealnya fetch dari API)
    const categories: Category[] = [
        { id: 1, name: 'Akomodasi', slug: 'akomodasi' },
        { id: 2, name: 'Wisata', slug: 'wisata' },
        { id: 3, name: 'Kuliner', slug: 'kuliner' },
    ];

    const subcategories: Subcategory[] = [
        { id: 1, category_id: 1, name: 'Hotel Bintang 5', slug: 'hotel-bintang-5' },
        { id: 2, category_id: 1, name: 'Hotel Bintang 4', slug: 'hotel-bintang-4' },
        { id: 3, category_id: 1, name: 'Hotel Bintang 3', slug: 'hotel-bintang-3' },
        { id: 4, category_id: 1, name: 'Villa', slug: 'villa' },
        { id: 5, category_id: 1, name: 'Homestay', slug: 'homestay' },
    ];

    // 🔥 SESUAI TABEL facilities (facilities.name sebagai ID)
    const availableFacilities: Facility[] = [
        { id: 'WiFi Gratis', name: 'WiFi Gratis', icon: Wifi, category: 'basic' },
        { id: 'Parkir Gratis', name: 'Parkir Gratis', icon: Car, category: 'basic' },
        { id: 'Kolam Renang', name: 'Kolam Renang', icon: Waves, category: 'recreation' },
        { id: 'Pusat Kebugaran', name: 'Pusat Kebugaran', icon: Dumbbell, category: 'wellness' },
        { id: 'Restoran', name: 'Restoran', icon: Utensils, category: 'dining' },
        { id: 'Sarapan Gratis', name: 'Sarapan Gratis', icon: Coffee, category: 'dining' },
        { id: 'Layanan Kamar', name: 'Layanan Kamar', icon: Bell, category: 'service' },
        { id: 'AC', name: 'AC', icon: AirVent, category: 'comfort' },
        { id: 'Televisi', name: 'Televisi', icon: Tv, category: 'room' },
        { id: 'Hewan Peliharaan Diizinkan', name: 'Hewan Peliharaan Diizinkan', icon: Dog, category: 'policy' },
        { id: 'Spa', name: 'Spa', icon: Bath, category: 'wellness' },
    ];
    
    const isAkomodasi = formData.kategori === 'akomodasi';

    const selectedCategory = categories.find(cat => cat.slug === formData.kategori);
    const filteredSubcategories = subcategories.filter(
        sub => selectedCategory ? sub.category_id === selectedCategory.id : false
    );
    
    const getMediaUrl = (path: string | undefined): string => {
        if (!path) return '';
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        return path.startsWith('http') ? path : `${apiUrl}/uploads/${path}`;
    };

    // --- FETCH DATA DARI API ---
    useEffect(() => {
        const fetchSubmission = async () => {
            if (!businessId) return;
            
            setIsLoading(true);
            try {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                const response = await fetch(`${apiUrl}/api/businesses/${businessId}`);
                
                if (!response.ok) throw new Error('Gagal memuat data bisnis');
                
                const result = await response.json();
                
                if (result.success) {
                    const business: BusinessData = result.data;

                    // Set form data
                    setFormData({
                        nama: business.name || '',
                        alamat: business.address || '',
                        kategori: business.category_slug || '', 
                        subkategori: business.subcategory_slug || '',
                        kontak: business.phone || '',
                        website: business.website || '',
                        email: business.email || '',
                        deskripsi: business.description || '',
                        logo: null,
                        latitude: business.latitude?.toString() || '',
                        longitude: business.longitude?.toString() || '',
                        checkIn: business.hours?.[0]?.open_time?.substring(0, 5) || '14:00',
                        checkOut: business.hours?.[0]?.close_time?.substring(0, 5) || '12:00'
                    });
                    
                    // Set logo preview
                    if (business.thumbnail_image) {
                        setLogoPreview(getMediaUrl(business.thumbnail_image));
                    }
                    
                    // Set existing media
                    if (business.media) setExistingMedia(business.media);

                    // Set facilities
                    if (business.amenities) {
                        setSelectedFacilities(business.amenities.map(a => a.name));
                    }
                    
                    // 🔥 Set room types dengan mapping yang benar ke interface
                    if (business.room_types && business.room_types.length > 0) {
                       setRoomTypes(business.room_types.map(room => ({
                            id: room.id,                    // Gunakan ID dari DB
                            name: room.name,
                            description: room.description || '',
                            size_sqm: room.size_sqm || 0,
                            max_occupancy: room.max_occupancy || 2,
                            bed_type: room.bed_type || '',
                            base_price: room.base_price || 0,
                            image_url: room.image_url,
                            photoFile: null,
                            photoPreview: room.image_url ? getMediaUrl(room.image_url) : null,
                        })));
                    }
                }
            } catch (error) {
                console.error('Error fetching business:', error);
                setErrors({ general: 'Gagal memuat data bisnis' });
            } finally {
                setIsLoading(false);
            }
        };

        fetchSubmission();
    }, [businessId]);

    // --- HANDLERS ---
    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        
        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, logo: "Ukuran file max 5MB" }));
            return;
        }
        
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
            if (file.size > 10 * 1024 * 1024) continue;
            
            const mediaType = file.type.startsWith('image/') ? 'photo' : 'video';
            newMediaFiles.push({ 
                file, 
                type: mediaType, 
                preview: URL.createObjectURL(file) 
            });
        }
        setNewMedia(prev => [...prev, ...newMediaFiles]);
    };

    const removeExistingMedia = (mediaId: number) => {
        setRemovedMediaIds(prev => [...prev, mediaId]);
        setExistingMedia(prev => prev.filter(m => m.id !== mediaId));
    };

    const removeNewMedia = (index: number) => {
        setNewMedia(prev => prev.filter((_, i) => i !== index));
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilities(prev => 
            prev.includes(facilityId) 
                ? prev.filter(id => id !== facilityId)
                : [...prev, facilityId]
        );
    };

    // 🔥 HANDLER FOTO KAMAR
    const handleRoomPhotoChange = (roomId: string | number, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0] || null;
        
        if (file && file.size > 5 * 1024 * 1024) {
            alert("Ukuran foto kamar maksimal 5MB");
            return;
        }
        
        setRoomTypes(prev => prev.map(room => 
            room.id === roomId 
                ? { 
                    ...room, 
                    photoFile: file, 
                    photoPreview: file ? URL.createObjectURL(file) : null 
                } 
                : room
        ));
    };

    const removeRoomPhoto = (roomId: string | number) => {
        setRoomTypes(prev => prev.map(room => 
            room.id === roomId 
                ? { 
                    ...room, 
                    photoFile: null, 
                    photoPreview: room.image_url ? getMediaUrl(room.image_url) : null
                  } 
                : room
        ));
    };

    const addRoomType = () => {
        const newRoom: RoomType = {
            id: `new_${Date.now()}`,
            name: '',
            description: '',
            size_sqm: 0,
            max_occupancy: 2,
            bed_type: '',
            base_price: 0,
            photoFile: null,
            photoPreview: null
        };
        setRoomTypes(prev => [...prev, newRoom]);
    };

    const updateRoomType = (roomId: string | number, field: keyof RoomType, value: any) => {
        setRoomTypes(prev => prev.map(room => 
            room.id === roomId ? { ...room, [field]: value } : room
        ));
    };

    const removeRoomType = (roomId: string | number) => {
        // 🔥 Jika kamar sudah ada di DB, track untuk dihapus
        if (typeof roomId === 'number') {
            setRemovedRoomIds(prev => [...prev, roomId]);
        }
        setRoomTypes(prev => prev.filter(room => room.id !== roomId));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.nama.trim()) newErrors.nama = 'Nama wajib diisi';
        if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
        if (!formData.kontak.trim()) newErrors.kontak = 'Kontak wajib diisi';
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // 🔥 SUBMIT HANDLER - SESUAIKAN DENGAN DATABASE
    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!validateForm()) return;

        setIsSaving(true);
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const data = new FormData();
        
        // 1. Append form fields (tabel businesses)
        data.append('nama', formData.nama);
        data.append('alamat', formData.alamat);
        data.append('kategori', formData.kategori);
        data.append('subkategori', formData.subkategori);
        data.append('kontak', formData.kontak);
        data.append('email', formData.email);
        data.append('website', formData.website);
        data.append('deskripsi', formData.deskripsi);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        
        if (formData.checkIn) data.append('checkIn', formData.checkIn);
        if (formData.checkOut) data.append('checkOut', formData.checkOut);
        
        // 2. Append logo (thumbnail_image)
        if (formData.logo) {
            data.append('thumbnail_picture', formData.logo);
        }
        
        // 3. Append media files (business_media)
        newMedia.forEach(media => {
            data.append('media_files', media.file);
        });
        
        if (removedMediaIds.length > 0) {
            data.append('removed_media_ids', JSON.stringify(removedMediaIds));
        }
        
        // 4. Append facilities (business_facilities junction table)
        if (isAkomodasi) {
            data.append('selectedFacilities', JSON.stringify(selectedFacilities));
        }
        
        // 5. 🔥 Append room types data (tabel room_types)
        if (isAkomodasi && roomTypes.length > 0) {
            const processedRooms = roomTypes.map(room => ({
                id: typeof room.id === 'number' ? room.id : undefined, // ID existing room atau undefined untuk room baru
                name: room.name,
                description: room.description,
                size_sqm: room.size_sqm,
                max_occupancy: room.max_occupancy,
                bed_type: room.bed_type,
                base_price: room.base_price,
                // Pertahankan image_url existing jika tidak ada file baru
                image_url: !room.photoFile && room.image_url ? room.image_url : undefined
            }));
            
            data.append('roomTypes', JSON.stringify(processedRooms));
            
            // 🔥 Append foto kamar (room_types.image_url)
            roomTypes.forEach((room, index) => {
                if (room.photoFile) {
                    data.append(`room_photo_${index}`, room.photoFile);
                    // Kirim ID room agar backend tahu kamar mana yang diupdate
                    if (typeof room.id === 'number') {
                        data.append(`room_photo_id_${index}`, room.id.toString());
                    }
                }
            });
            
            // 🔥 Kirim daftar ID room yang dihapus
            if (removedRoomIds.length > 0) {
                data.append('removed_room_ids', JSON.stringify(removedRoomIds));
            }
        }

        try {
            const response = await fetch(`${apiUrl}/api/businesses/${businessId}`, {
                method: 'PUT',
                body: data,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Gagal memperbarui data');
            }

            setShowSuccess(true);
            setErrors({});
        } catch (error) {
            console.error('Error updating business:', error);
            setErrors({ general: (error as Error).message });
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Memuat data bisnis...</p>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Diperbarui!</h2>
                    <p className="text-gray-600 mb-6">Data bisnis telah berhasil diperbarui.</p>
                    <div className="space-y-3">
                        {/* <button 
                            onClick={() => router.push(`/businesses/${businessId}`)}
                            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                        >
                            Lihat Detail Bisnis
                        </button> */}
                        <button 
                            onClick={() => router.push('/admin/businesses')}
                            className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                        >
                            Selesai
                        </button>
                    </div>
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
                                onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Edit: {formData.nama}</h1>
                                <p className="text-sm text-gray-500">ID: {businessId}</p>
                            </div>
                        </div>
                        <Building2 className="w-8 h-8 text-blue-600" />
                    </div>
                </div>
            </div>

            {/* Error Alert */}
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
                                    />
                                    {errors.nama && <p className="text-sm text-red-600 mt-1 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.nama}</p>}
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Kategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.kategori}
                                        onChange={(e) => handleInputChange('kategori', e.target.value)}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    >
                                        <option value="">Pilih Kategori</option>
                                        {categories.map(cat => <option key={cat.id} value={cat.slug}>{cat.name}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Subkategori <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={formData.subkategori}
                                        onChange={(e) => handleInputChange('subkategori', e.target.value)}
                                        disabled={!formData.kategori}
                                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none disabled:bg-gray-100"
                                    >
                                        <option value="">Pilih Subkategori</option>
                                        {filteredSubcategories.map(sub => <option key={sub.id} value={sub.slug}>{sub.name}</option>)}
                                    </select>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Alamat <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        value={formData.alamat}
                                        onChange={(e) => handleInputChange('alamat', e.target.value)}
                                        rows={3}
                                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${errors.alamat ? 'border-red-300' : 'border-gray-300'}`}
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi</label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                                    rows={4}
                                    className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kontak */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Kontak</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Telepon <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="tel" value={formData.kontak} onChange={(e) => handleInputChange('kontak', e.target.value)} className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.kontak ? 'border-red-300' : 'border-gray-300'}`} />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
                            </div>
                            
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Website</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="url" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
                                </div>
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

                    {/* Logo & Galeri */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Logo/Thumbnail</h2>
                            
                            {logoPreview ? (
                                <div className="relative">
                                    <Image src={logoPreview} alt="Logo" width={300} height={128} className="w-full h-32 object-contain border rounded-xl p-4" />
                                    <button type="button" onClick={() => {setFormData(prev => ({ ...prev, logo: null })); setLogoPreview(null);}} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 transition-colors">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-gray-400 transition-colors">
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload" />
                                    <label htmlFor="logo-upload" className="cursor-pointer">
                                        <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Logo</h3>
                                        <p className="text-gray-500">PNG, JPG max 5MB</p>
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Galeri ({existingMedia.length + newMedia.length})</h2>
                            
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center mb-4 hover:border-gray-400 transition-colors">
                                <input type="file" accept="image/*,video/*" multiple onChange={handleGalleryUpload} className="hidden" id="gallery-upload" />
                                <label htmlFor="gallery-upload" className="cursor-pointer">
                                    <Camera className="w-8 h-8 text-gray-400 mx-auto mb-3" />
                                    <h4 className="font-medium text-gray-900 mb-1">Tambah Foto/Video</h4>
                                    <p className="text-xs text-blue-600">Max 10MB per file</p>
                                </label>
                            </div>

                            {(existingMedia.length > 0 || newMedia.length > 0) && (
                                <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                                    {existingMedia.map((media) => (
                                        <div key={media.id} className="relative group">
                                            <Image src={getMediaUrl(media.file_path)} alt="" width={64} height={64} className="w-full h-16 object-cover rounded-lg" />
                                            <button type="button" onClick={() => removeExistingMedia(media.id)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {newMedia.map((media, idx) => (
                                        <div key={idx} className="relative group">
                                            <Image src={media.preview} alt="" width={64} height={64} className="w-full h-16 object-cover rounded-lg" />
                                            <button type="button" onClick={() => removeNewMedia(idx)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Fasilitas - Only for Akomodasi */}
                    {isAkomodasi && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fasilitas Hotel</h2>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {availableFacilities.map(facility => {
                                    const Icon = facility.icon;
                                    const isSelected = selectedFacilities.includes(facility.id);
                                    return (
                                        <button 
                                            key={facility.id} 
                                            type="button" 
                                            onClick={() => toggleFacility(facility.id)} 
                                            className={`p-4 border-2 rounded-xl transition-colors ${isSelected ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 hover:border-blue-300 text-gray-600'}`}
                                        >
                                            <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-500'}`} />
                                            <span className="text-sm font-medium">{facility.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            
                            {selectedFacilities.length > 0 && (
                                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                    <p className="font-medium text-blue-900">
                                        Terpilih: {selectedFacilities.length} fasilitas
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Tipe Kamar - Only for Akomodasi */}
                    {isAkomodasi && (
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-800">Tipe Kamar</h2>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {roomTypes.length} kamar terdaftar
                                        {removedRoomIds.length > 0 && ` (${removedRoomIds.length} akan dihapus)`}
                                    </p>
                                </div>
                                <button type="button" onClick={addRoomType} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                    <Plus className="w-4 h-4" />Tambah Kamar
                                </button>
                            </div>

                            {roomTypes.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                                    <Bed className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-600 mb-2">Belum ada tipe kamar</h3>
                                    <button type="button" onClick={addRoomType} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                                        Tambah Kamar Pertama
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {roomTypes.map((room, index) => (
                                        <div key={room.id} className="border border-gray-200 rounded-xl p-5 space-y-4">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                        <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-800">
                                                            {room.name || 'Kamar Baru'}
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            {typeof room.id === 'number' ? `ID: ${room.id}` : 'Belum disimpan'}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button 
                                                    type="button" 
                                                    onClick={() => removeRoomType(room.id)} 
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <X className="w-5 h-5" />
                                                </button>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Nama Kamar <span className="text-red-500">*</span>
                                                    </label>
                                                    <input 
                                                        type="text" 
                                                        value={room.name} 
                                                        onChange={(e) => updateRoomType(room.id, 'name', e.target.value)} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                        placeholder="Superior Room" 
                                                    />
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Ukuran (m²)
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        value={room.size_sqm} 
                                                        onChange={(e) => updateRoomType(room.id, 'size_sqm', parseInt(e.target.value) || 0)} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                        placeholder="25" 
                                                    />
                                                </div>
                                                
                                                {/* 🔥 Input Foto Kamar */}
                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Foto Kamar
                                                    </label>
                                                    {room.photoPreview ? (
                                                        <div className="relative border-2 border-gray-200 rounded-xl p-3 bg-gray-50">
                                                            <Image 
                                                                src={room.photoPreview} 
                                                                alt={`${room.name} Preview`} 
                                                                width={400} height={160}
                                                                className="w-full h-40 object-cover rounded-lg mb-3" 
                                                            />
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-sm text-gray-600">
                                                                    {room.photoFile ? '✓ Foto baru dipilih' : '✓ Foto tersimpan'}
                                                                </span>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeRoomPhoto(room.id)}
                                                                    className="px-3 py-1.5 text-sm bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-1"
                                                                >
                                                                    <X className="w-4 h-4" /> Hapus
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer">
                                                            <input
                                                                type="file"
                                                                accept="image/jpeg,image/jpg,image/png,image/webp"
                                                                onChange={(e) => handleRoomPhotoChange(room.id, e)}
                                                                className="hidden"
                                                                id={`room-photo-${room.id}`}
                                                            />
                                                            <label htmlFor={`room-photo-${room.id}`} className="cursor-pointer">
                                                                <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                                                <p className="text-sm font-medium text-gray-700">Upload Foto Kamar</p>
                                                                <p className="text-xs text-gray-500 mt-1">PNG, JPG max 5MB</p>
                                                            </label>
                                                        </div>
                                                    )}
                                                </div>
                                                {/* Akhir Input Foto Kamar */}
                                                
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Kapasitas Tamu
                                                    </label>
                                                    <div className="flex items-center gap-3">
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateRoomType(room.id, 'max_occupancy', Math.max(1, room.max_occupancy - 1))} 
                                                            className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Minus className="w-5 h-5" />
                                                        </button>
                                                        <div className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg text-center font-medium">
                                                            {room.max_occupancy} tamu
                                                        </div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => updateRoomType(room.id, 'max_occupancy', room.max_occupancy + 1)} 
                                                            className="p-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                                        >
                                                            <Plus className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Tipe Kasur
                                                    </label>
                                                    <select 
                                                        value={room.bed_type} 
                                                        onChange={(e) => updateRoomType(room.id, 'bed_type', e.target.value)} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Harga per Malam (IDR)
                                                    </label>
                                                    <input 
                                                        type="number" 
                                                        value={room.base_price} 
                                                        onChange={(e) => updateRoomType(room.id, 'base_price', parseFloat(e.target.value) || 0)} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                                        placeholder="500000" 
                                                    />
                                                </div>

                                                <div className="md:col-span-2">
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Deskripsi Kamar
                                                    </label>
                                                    <textarea 
                                                        value={room.description} 
                                                        onChange={(e) => updateRoomType(room.id, 'description', e.target.value)} 
                                                        rows={3} 
                                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" 
                                                        placeholder="Deskripsi singkat tentang kamar ini..." 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Lokasi GPS */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Lokasi (Koordinat GPS)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Latitude
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.latitude} 
                                    onChange={(e) => handleInputChange('latitude', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="1.1304753" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    <MapPin className="w-4 h-4 inline mr-1" />
                                    Longitude
                                </label>
                                <input 
                                    type="text" 
                                    value={formData.longitude} 
                                    onChange={(e) => handleInputChange('longitude', e.target.value)} 
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                                    placeholder="104.0524807" 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 sticky bottom-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-700">
                                    {errors.general ? (
                                        <span className="text-red-600 flex items-center gap-1">
                                            <AlertCircle className="w-4 h-4" />
                                            {errors.general}
                                        </span>
                                    ) : (
                                        'Pastikan semua data sudah benar sebelum menyimpan'
                                    )}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {removedMediaIds.length > 0 && `${removedMediaIds.length} media akan dihapus • `}
                                    {removedRoomIds.length > 0 && `${removedRoomIds.length} kamar akan dihapus • `}
                                    {newMedia.length > 0 && `${newMedia.length} media baru akan ditambahkan`}
                                </p>
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isSaving} 
                                className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-5 h-5" />
                                        Simpan Perubahan
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