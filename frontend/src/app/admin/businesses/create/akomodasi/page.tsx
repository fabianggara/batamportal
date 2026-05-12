'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop';
import { 
    ArrowLeft, Building2, MapPin, Phone, Globe, Upload, Mail, AlertCircle,
    Loader2, X, Camera, Wifi, Car, Waves, Dumbbell, Utensils, AirVent, Tv,
    Check, Star, Dog, Activity, Save, Banknote, Gem, // <-- Ikon Gem, Banknote, dan Save sudah ditambahkan
    Coffee, Accessibility, Shirt, Briefcase, BellRing, Baby, Bus, Flower2, Wine, Ban 
} from 'lucide-react';

// --- INTERFACES ---
interface Tag {
    id: number;
    name: string;
    type: string;
}

interface HotelFormData {
    nama: string;
    alamat: string;
    subkategori: string; // <-- Kerangka subkategori sudah ditambahkan agar TS tidak error
    kontak: string;
    website: string;
    email: string;
    deskripsi: string;
    logo: File | null;
    latitude: string;
    longitude: string;
    price: string; 
    star_rating: string; 
}

interface MediaFile {
    file: File;
    type: 'photo' | 'video';
    preview: string;
    category: string;
}


const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
        const image = new Image();
        image.addEventListener('load', () => resolve(image));
        image.addEventListener('error', (error) => reject(error));
        image.src = url;
    });

const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<File> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) throw new Error('No 2d context');

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            const file = new File([blob], `cropped_${Date.now()}.jpg`, { type: 'image/jpeg' });
            resolve(file);
        }, 'image/jpeg', 0.9);
    });
};

// FUNGSI PINTAR UNTUK MENDETEKSI IKON
const getIconForTag = (name: string, type: string) => {
    const lower = name.toLowerCase();
    
    if (lower.includes('wifi')) return Wifi;
    if (lower.includes('sarapan') || lower.includes('breakfast')) return Coffee;
    if (lower.includes('parkir') || lower.includes('parking')) return Car;
    if (lower.includes('akses') || lower.includes('accessible') || lower.includes('difabel')) return Accessibility;
    if (lower.includes('kolam') || lower.includes('renang') || lower.includes('pool')) return Waves;
    if (lower.includes('ac') || lower.includes('pendingin') || lower.includes('air-conditioned')) return AirVent;
    if (lower.includes('laundry') || lower.includes('cuci')) return Shirt;
    if (lower.includes('bisnis') || lower.includes('business')) return Briefcase;
    if (lower.includes('hewan') || lower.includes('pet')) return Dog;
    if (lower.includes('layanan kamar') || lower.includes('room service')) return BellRing;
    if (lower.includes('anak') || lower.includes('kid') || lower.includes('keluarga')) return Baby;
    if (lower.includes('restoran') || lower.includes('makan') || lower.includes('restaurant')) return Utensils;
    if (lower.includes('bandara') || lower.includes('shuttle') || lower.includes('antar')) return Bus;
    if (lower.includes('spa') || lower.includes('pijat')) return Flower2;
    if (lower.includes('gym') || lower.includes('bugar') || lower.includes('fitness')) return Dumbbell;
    if (lower.includes('bar') || lower.includes('minum')) return Wine;
    if (lower.includes('bebas asap') || lower.includes('smoke-free') || lower.includes('rokok')) return Ban;
    if (lower.includes('tv') || lower.includes('televisi')) return Tv;
    if (type === 'Area') return MapPin;
    if (type === 'Aktivitas') return Activity;
    
    return Check; 
};

export default function HotelFullForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<HotelFormData>({
        nama: '', alamat: '', subkategori: '', kontak: '', website: '', email: '',
        deskripsi: '', logo: null, latitude: '', longitude: '', price: '', star_rating: ''
    });

    const subcategories = [
        { name: 'Hotel', slug: 'hotel' },
        { name: 'Resort', slug: 'resort' },
        { name: 'Villa', slug: 'villa' },
        { name: 'Guesthouse', slug: 'guesthouse' },
        { name: 'Apartemen', slug: 'apartemen' }
    ];

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [tempLogoUrl, setTempLogoUrl] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [selectedTags, setSelectedTags] = useState<string[]>([]); 
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showSuccess, setShowSuccess] = useState(false);
    const [availableFasilitas, setAvailableFasilitas] = useState<Tag[]>([]);
    const [availableAktivitas, setAvailableAktivitas] = useState<Tag[]>([]);
    const [availableArea, setAvailableArea] = useState<Tag[]>([]);

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        
        const fetchData = async () => {
            try {
                const [fasilitasRes, kulinerRes, aktivitasRes, areaRes] = await Promise.all([
                    fetch(`${API_URL}/api/tags?type=Fasilitas`),
                    fetch(`${API_URL}/api/tags?type=Jenis Kuliner`),
                    fetch(`${API_URL}/api/tags?type=Aktivitas`),
                    fetch(`${API_URL}/api/tags?type=Area`)
                ]);

                let fasData = [], kulData = [], aktData = [], areaData = [];
                
                if (fasilitasRes.ok) fasData = (await fasilitasRes.json()).data || [];
                if (kulinerRes.ok) kulData = (await kulinerRes.json()).data || [];
                if (aktivitasRes.ok) aktData = (await aktivitasRes.json()).data || [];
                if (areaRes.ok) areaData = (await areaRes.json()).data || [];

                const filteredRestoran = kulData.filter((item: Tag) => 
                    item.name.toLowerCase() === 'restoran'
                );

                setAvailableFasilitas([...fasData, ...filteredRestoran]);
                setAvailableAktivitas(aktData);
                setAvailableArea(areaData);
            } catch (err) {
                console.error("Gagal memuat tags:", err);
            }
        };
        fetchData();
    }, []);

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

        const reader = new FileReader();
        reader.onload = (e) => {
            setTempLogoUrl(e.target?.result as string);
            setIsCropModalOpen(true); // Buka modal crop
            setZoom(1);
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset input
    };

    const handleCropComplete = async () => {
        if (!tempLogoUrl || !croppedAreaPixels) return;
        try {
            const croppedFile = await getCroppedImg(tempLogoUrl, croppedAreaPixels);
            setFormData(prev => ({ ...prev, logo: croppedFile }));
            setLogoPreview(URL.createObjectURL(croppedFile));
            setIsCropModalOpen(false);
            setErrors(prev => ({ ...prev, logo: "" }));
        } catch (e) {
            console.error(e);
            alert("Gagal memotong gambar!");
        }
    };

    const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const newMedia: MediaFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) continue;
            
            let mediaType: 'photo' | 'video';
            if (file.type.startsWith('image/')) mediaType = 'photo';
            else if (file.type.startsWith('video/')) mediaType = 'video';
            else continue;
            
            const previewUrl = URL.createObjectURL(file);
            newMedia.push({ file, type: mediaType, preview: previewUrl, category: 'general' }); 
        }
        setMediaFiles(prev => [...prev, ...newMedia]);
    };

    const removeMedia = (index: number) => {
        setMediaFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Logika Eksklusif Label Harga & Batasan Maks 3 Aktivitas
    const toggleTagByName = (tagName: string) => {
        setSelectedTags(prev => {
            let nextTags = [...prev];

            // Logika Hotel Mahal vs Hotel Murah
            if (tagName === 'Mewah / Mahal') {
                nextTags = nextTags.filter(t => t !== 'Budget / Murah');
            } else if (tagName === 'Budget / Murah') {
                nextTags = nextTags.filter(t => t !== 'Mewah / Mahal');
            }

            if (nextTags.includes(tagName)) {
                return nextTags.filter(t => t !== tagName);
            } else {
                const isAktivitas = availableAktivitas.some(a => a.name === tagName);
                if (isAktivitas) {
                    const currentAktivitasCount = nextTags.filter(t => 
                        availableAktivitas.some(a => a.name === t)
                    ).length;
                    
                    if (currentAktivitasCount >= 3) {
                        // HAPUS ALERT: Cukup kembalikan array prev tanpa menambah tag baru
                        return nextTags;
                    }
                }
                return [...nextTags, tagName];
            }
        });
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.nama.trim()) newErrors.nama = 'Nama hotel wajib diisi';
        if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
        if (!formData.kontak.trim()) newErrors.kontak = 'Kontak wajib diisi';
        if (!formData.subkategori) newErrors.subkategori = 'Subkategori wajib dipilih';
        
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
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }

        setIsLoading(true);
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const SUBMIT_URL = `${API_URL}/api/businesses`; 

        const data = new FormData();
        
        data.append('nama', formData.nama);            
        data.append('alamat', formData.alamat);        
        data.append('kontak', formData.kontak);        
        data.append('deskripsi', formData.deskripsi);  
        data.append('subkategori', formData.subkategori); 
        
        data.append('category_id', '1'); 
        data.append('email', formData.email);
        data.append('website', formData.website);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        data.append('price', formData.price);
        data.append('star_rating', formData.star_rating);
        data.append('status', 'approved');

        data.append('selectedFacilities', JSON.stringify(selectedTags)); 

        if (formData.logo) {
            data.append('thumbnail_picture', formData.logo); 
        }
        mediaFiles.forEach((media) => {
            data.append('media_files', media.file);
        });

        try {
            const response = await fetch(SUBMIT_URL, {
                method: 'POST',
                body: data, 
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || 'Gagal menyimpan data ke database.');
            }

            setShowSuccess(true);
            setErrors({});

        } catch (error) {
            console.error("Submission failed:", error);
            setErrors({ general: (error as Error).message || 'Gagal terhubung ke server. Coba lagi.' });
        } finally {
            setIsLoading(false);
        }
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
                        Akomodasi Anda telah berhasil disimpan dan langsung berstatus Aktif.
                    </p>
                    <button 
                        onClick={() => router.push('/admin/businesses')}
                        className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition-colors"
                    >
                        Kembali ke Kelola Destinasi
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-12">
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
                                <h1 className="text-xl font-bold text-gray-800">Tambah Data Akomodasi</h1>
                                <p className="text-sm text-gray-500">Lengkapi form sesuai dengan format database</p>
                            </div>
                        </div>
                        <div className="bg-blue-100 p-2 rounded-lg">
                            <Building2 className="w-5 h-5 text-blue-600" />
                        </div>
                    </div>
                </div>
            </div>

            {errors.general && (
                <div className="max-w-6xl mx-auto px-4 mt-6">
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">{errors.general}</span>
                    </div>
                </div>
            )}

            <div className="max-w-6xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Informasi Dasar */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                            Informasi Dasar
                        </h2>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Destinasi <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.nama}
                                    onChange={(e) => handleInputChange('nama', e.target.value)}
                                    placeholder="Contoh: Hotel Grand Batam"
                                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${
                                        errors.nama ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                />
                                {errors.nama && <p className="text-sm text-red-600 mt-1">{errors.nama}</p>}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Akomodasi <span className="text-red-500">*</span></label>
                                    <select 
                                        value={formData.subkategori} 
                                        onChange={(e) => {
                                            handleInputChange('subkategori', e.target.value);
                                            // Reset bintang jika bukan hotel/resort
                                            if (e.target.value !== 'hotel' && e.target.value !== 'resort') {
                                                handleInputChange('star_rating', ''); 
                                            }
                                        }} 
                                        className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white ${errors.subkategori ? 'border-red-300' : 'border-gray-200'}`}
                                    >
                                        <option value="">Pilih Tipe...</option>
                                        {subcategories.map(sub => (<option key={sub.slug} value={sub.slug}>{sub.name}</option>))}
                                    </select>
                                    {errors.subkategori && <p className="text-sm text-red-600 mt-1">{errors.subkategori}</p>}
                                </div>

                               <div>
                                    <label className={`text-sm font-semibold mb-2 flex items-center gap-1 ${
                                        (formData.subkategori === 'hotel' || formData.subkategori === 'resort') ? 'text-gray-700' : 'text-gray-400'
                                    }`}>
                                        <Star className={`w-4 h-4 ${
                                            (formData.subkategori === 'hotel' || formData.subkategori === 'resort') ? 'text-yellow-500' : 'text-gray-300'
                                        }`} /> Klasifikasi Bintang
                                    </label>
                                    <select
                                        value={formData.star_rating}
                                        onChange={(e) => handleInputChange('star_rating', e.target.value)}
                                        disabled={!(formData.subkategori === 'hotel' || formData.subkategori === 'resort')}
                                        className={`w-full p-3.5 border rounded-xl outline-none transition-colors ${
                                            (formData.subkategori === 'hotel' || formData.subkategori === 'resort')
                                            ? 'border-gray-200 focus:ring-2 focus:ring-blue-500 bg-white'
                                            : 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        <option value="">Tidak ada klasifikasi (Kosong)</option>
                                        <option value="1">1 Bintang</option>
                                        <option value="2">2 Bintang</option>
                                        <option value="3">3 Bintang</option>
                                        <option value="4">4 Bintang</option>
                                        <option value="5">5 Bintang</option>
                                    </select>
                                    {/* Keterangan muncul saat dropdown terkunci */}
                                    {!(formData.subkategori === 'hotel' || formData.subkategori === 'resort') && formData.subkategori !== '' && (
                                        <p className="text-xs text-gray-400 mt-1">Hanya berlaku untuk Hotel & Resort</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Harga Rata-Rata / Mulai Dari (Rp)
                                    </label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => handleInputChange('price', e.target.value)}
                                        placeholder="Contoh: 500000"
                                        className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alamat Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.alamat}
                                    onChange={(e) => handleInputChange('alamat', e.target.value)}
                                    placeholder="Alamat detail..."
                                    rows={2}
                                    className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none ${
                                        errors.alamat ? 'border-red-300' : 'border-gray-200'
                                    }`}
                                />
                                {errors.alamat && <p className="text-sm text-red-600 mt-1">{errors.alamat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Deskripsi Panjang
                                </label>
                                <textarea
                                    value={formData.deskripsi}
                                    onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                                    placeholder="Ceritakan tentang akomodasi ini..."
                                    rows={4}
                                    className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Kontak */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Kontak Bisnis</h2>
                        
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    No. Telepon <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="tel"
                                        value={formData.kontak}
                                        onChange={(e) => handleInputChange('kontak', e.target.value)}
                                        placeholder="0778-123456"
                                        className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none ${errors.kontak ? 'border-red-300' : 'border-gray-200'}`}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleInputChange('email', e.target.value)}
                                        placeholder="info@hotel.com"
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Website (Opsional)</label>
                                <div className="relative">
                                    <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="url"
                                        value={formData.website}
                                        onChange={(e) => handleInputChange('website', e.target.value)}
                                        placeholder="https://..."
                                        className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Logo & Galeri */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Gambar Utama (Thumbnail)</h2>
                            {!logoPreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                                    <input type="file" accept="image/*" onChange={handleLogoChange} className="hidden" id="logo-upload"/>
                                    <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                        <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <h3 className="text-sm font-semibold text-gray-700">Pilih Gambar Utama</h3>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative border rounded-xl overflow-hidden h-48 bg-gray-50">
                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => { setFormData(prev => ({ ...prev, logo: null })); setLogoPreview(null); }}
                                        className="absolute top-2 right-2 bg-red-500/80 text-white rounded-lg p-1.5 hover:bg-red-600"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Galeri Album (Carousel)</h2>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors mb-4 flex flex-col items-center justify-center">
                                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" id="gallery-upload" />
                                <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                    <Upload className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                    <h3 className="text-sm font-semibold text-gray-700">Upload Banyak Gambar</h3>
                                </label>
                            </div>

                            {mediaFiles.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {mediaFiles.slice(0, 8).map((media, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img src={media.preview} alt="Galeri" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => removeMedia(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* =========================================
                        BAGIAN TAGS (FASILITAS, AKTIVITAS, AREA) 
                    ========================================= */}
                    
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-sm p-6 border border-blue-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Label & Kelas Harga</h2>
                        <p className="text-sm text-gray-600 mb-4">Tambahkan tag untuk mempermudah pencarian pengunjung berdasarkan *budget* mereka.</p>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => toggleTagByName('Mewah / Mahal')}
                                className={`p-4 border-2 rounded-xl transition-all flex items-center gap-3 ${
                                    selectedTags.includes('Mewah / Mahal') 
                                    ? 'border-indigo-500 bg-indigo-100 text-indigo-800 shadow-md' 
                                    : 'border-white bg-white text-gray-600 hover:border-indigo-200'
                                }`}
                            >
                                <Gem className={`w-6 h-6 ${selectedTags.includes('Mewah / Mahal') ? 'text-indigo-600' : 'text-gray-400'}`} />
                                <div className="text-left">
                                    <h3 className="font-bold">Kelas Mewah / Mahal</h3>
                                    <p className="text-xs opacity-80">Rekomendasi untuk fasilitas mewah dan premium.</p>
                                </div>
                            </button>
                            
                            <button
                                type="button"
                                onClick={() => toggleTagByName('Budget / Murah')}
                                className={`p-4 border-2 rounded-xl transition-all flex items-center gap-3 ${
                                    selectedTags.includes('Budget / Murah') 
                                    ? 'border-emerald-500 bg-emerald-100 text-emerald-800 shadow-md' 
                                    : 'border-white bg-white text-gray-600 hover:border-emerald-200'
                                }`}
                            >
                                <Banknote className={`w-6 h-6 ${selectedTags.includes('Budget / Murah') ? 'text-emerald-600' : 'text-gray-400'}`} />
                                <div className="text-left">
                                    <h3 className="font-bold">Kelas Budget / Murah</h3>
                                    <p className="text-xs opacity-80">Rekomendasi untuk backpacker dan budget hemat.</p>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* 1. Fasilitas & Restoran */}
                    {availableFasilitas.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Fasilitas & Restoran</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {availableFasilitas.map((tag) => {
                                    const Icon = getIconForTag(tag.name, tag.type);
                                    const isSelected = selectedTags.includes(tag.name); 
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTagByName(tag.name)}
                                            className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                                                isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className="text-xs font-medium text-center">{tag.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {(() => {
                        // Hitung jumlah aktivitas yang sudah dipilih
                        const currentAktivitasCount = selectedTags.filter(t => 
                            availableAktivitas.some(a => a.name === t)
                        ).length;
                        
                        // Cek apakah sudah mencapai batas maksimal (3)
                        const isAktivitasMaxed = currentAktivitasCount >= 3;

                        return availableAktivitas.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-gray-800">Aktivitas di Sekitar</h2>
                                    
                                    {/* Pesan Peringatan Merah (Muncul jika max) */}
                                    {isAktivitasMaxed && (
                                        <span className="text-sm font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full animate-pulse">
                                            Maksimal 3 aktivitas terpilih
                                        </span>
                                    )}
                                </div>
                                
                                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                    {availableAktivitas.map((tag) => {
                                        const Icon = getIconForTag(tag.name, tag.type);
                                        const isSelected = selectedTags.includes(tag.name); 
                                        
                                        // Tombol dinonaktifkan jika kuota penuh DAN tombol ini belum dipilih
                                        const isDisabled = isAktivitasMaxed && !isSelected;

                                        return (
                                            <button
                                                key={tag.id}
                                                type="button"
                                                onClick={() => toggleTagByName(tag.name)}
                                                disabled={isDisabled}
                                                className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                                                    isSelected 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' 
                                                    : isDisabled
                                                        ? 'border-gray-100 bg-gray-50 text-gray-300 opacity-60 cursor-not-allowed'
                                                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : isDisabled ? 'text-gray-300' : 'text-gray-400'}`} />
                                                <span className="text-xs font-medium text-center">{tag.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })()}

                    {/* 3. Area / Lokasi */}
                    {availableArea.length > 0 && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Area & Lokasi</h2>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                {availableArea.map((tag) => {
                                    const Icon = getIconForTag(tag.name, tag.type);
                                    const isSelected = selectedTags.includes(tag.name); 
                                    return (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            onClick={() => toggleTagByName(tag.name)}
                                            className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${
                                                isSelected ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Icon className={`w-5 h-5 ${isSelected ? 'text-blue-600' : 'text-gray-400'}`} />
                                            <span className="text-xs font-medium text-center">{tag.name}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Lokasi Peta */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Koordinat Peta (GPS)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input
                                        type="text"
                                        value={formData.latitude}
                                        onChange={(e) => handleInputChange('latitude', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                        placeholder="1.1304753"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input
                                        type="text"
                                        value={formData.longitude}
                                        onChange={(e) => handleInputChange('longitude', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-500 text-sm"
                                        placeholder="104.0524807"
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2 bg-gray-100 rounded-xl overflow-hidden h-48 border border-gray-200 relative">
                                {formData.latitude && formData.longitude ? (
                                    <iframe
                                        width="100%" height="100%" frameBorder="0" scrolling="no"
                                        src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude)-0.005}%2C${parseFloat(formData.latitude)-0.005}%2C${parseFloat(formData.longitude)+0.005}%2C${parseFloat(formData.latitude)+0.005}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}
                                    ></iframe>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                        <MapPin className="w-8 h-8 mb-2 opacity-50" />
                                        <p className="text-xs">Preview peta akan muncul setelah koordinat diisi</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex items-center justify-end pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-8 py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            {isLoading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Menyimpan Data...</>
                            ) : (
                                <><Check className="w-5 h-5" /> Simpan & Aktifkan Destinasi</>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL CROP GAMBAR (TEMA BIRU) */}
            {isCropModalOpen && tempLogoUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Sesuaikan Gambar Thumbnail</h3>
                            <button onClick={() => setIsCropModalOpen(false)} className="p-1.5 hover:bg-red-50 rounded-full group transition-colors">
                                <X className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                            </button>
                        </div>
                        
                        <div className="relative h-[300px] w-full bg-gray-900">
                            <Cropper
                                image={tempLogoUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9} // Rasio persegi panjang 16:9
                                onCropChange={setCrop}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels as any)}
                                onZoomChange={setZoom}
                            />
                        </div>
                        
                        <div className="p-5 bg-gray-50 flex flex-col gap-6">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 mb-3 block uppercase tracking-wider">Zoom Level</label>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="w-full accent-blue-600 cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCropModalOpen(false)} className="px-5 py-2.5 font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                                    Batal
                                </button>
                                <button type="button" onClick={handleCropComplete} className="px-5 py-2.5 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors flex items-center gap-2 shadow-md">
                                    <Check className="w-4 h-4" /> Terapkan & Potong
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}