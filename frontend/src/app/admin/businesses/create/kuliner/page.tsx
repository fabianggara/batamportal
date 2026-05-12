'use client'

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cropper from 'react-easy-crop'; // <-- IMPORT LIBRARY CROP
import { 
    ArrowLeft, MapPin, Phone, Globe, Upload, Mail, AlertCircle,
    Loader2, X, Camera, Wifi, Car, Utensils, Tv, Check, Star, 
    Save, Coffee, Accessibility, Music, Wind, Clock, Plus, Trash2, 
    Store, Pizza, IceCream, ChefHat, Activity, Ban
} from 'lucide-react';

// --- INTERFACES ---
interface Tag {
    id: number;
    name: string;
    type: string;
}

interface CulinaryFormData {
    nama: string;
    alamat: string;
    subkategori: string;
    kontak: string;
    website: string;
    email: string;
    deskripsi: string;
    logo: File | null;
    latitude: string;
    longitude: string;
    price: string; 
    open_time: string;
    close_time: string;
    is_24_hours: boolean; 
}

interface MediaFile {
    file: File;
    type: 'photo' | 'video';
    preview: string;
}

interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: string;
    is_signature: boolean;
}

// --- FUNGSI HELPER UNTUK PROSES CROP GAMBAR ---
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

// --- FUNGSI PINTAR UNTUK MENDETEKSI IKON ---
const getIconForTag = (name: string, type: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('wifi')) return Wifi;
    if (lower.includes('parkir') || lower.includes('parking')) return Car;
    if (lower.includes('akses') || lower.includes('difabel')) return Accessibility;
    if (lower.includes('ac') || lower.includes('pendingin')) return Wind;
    if (lower.includes('musik') || lower.includes('music') || lower.includes('live')) return Music;
    if (lower.includes('kopi') || lower.includes('coffee') || lower.includes('kafe')) return Coffee;
    if (lower.includes('seafood') || lower.includes('makanan laut')) return Pizza;
    if (lower.includes('dessert') || lower.includes('manis')) return IceCream;
    if (lower.includes('halal')) return ChefHat;
    if (lower.includes('tv') || lower.includes('televisi')) return Tv;
    if (lower.includes('bebas asap') || lower.includes('smoke-free') || lower.includes('rokok')) return Ban;

    if (type === 'Aktivitas') return Activity;
    if (type === 'Area') return MapPin;
    return Check; 
};

export default function CulinaryFullForm() {
    const router = useRouter();
    
    const [formData, setFormData] = useState<CulinaryFormData>({
        nama: '', alamat: '', subkategori: '', kontak: '', website: '', email: '',
        deskripsi: '', logo: null, latitude: '', longitude: '', price: '', open_time: '10:00', close_time: '22:00', is_24_hours: false
    });

    const kulinerSubcategories = [
        { name: 'Restoran', slug: 'restoran' },
        { name: 'Kafe / Coffee Shop', slug: 'kafe' },
        { name: 'Kopitiam', slug: 'kopitiam' }, // <--- TAMBAHAN BARU
        { name: 'Makanan Lokal / Warung', slug: 'makanan-lokal' },
        { name: 'Kaki Lima / Street Food', slug: 'street-food' },
        { name: 'Toko Kue / Dessert', slug: 'bakery' } // <--- TAMBAHAN BARU
    ];

    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([]);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    
    // State untuk Cropping Gambar
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
    const [availableSuasana, setAvailableSuasana] = useState<Tag[]>([]);
    const [availableArea, setAvailableArea] = useState<Tag[]>([]);
    const [availableJenisKuliner, setAvailableJenisKuliner] = useState<Tag[]>([]);
    const [availableAktivitas, setAvailableAktivitas] = useState<Tag[]>([]); 

    useEffect(() => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const fetchData = async () => {
            try {
                const [fasilitasRes, suasanaRes, areaRes, jenisRes, aktivitasRes] = await Promise.all([
                    fetch(`${API_URL}/api/tags?type=Fasilitas`),
                    fetch(`${API_URL}/api/tags?type=Suasana`),
                    fetch(`${API_URL}/api/tags?type=Area`),
                    fetch(`${API_URL}/api/tags?type=Jenis Kuliner`),
                    fetch(`${API_URL}/api/tags?type=Aktivitas`) 
                ]);

                if (fasilitasRes.ok) setAvailableFasilitas((await fasilitasRes.json()).data || []);
                if (suasanaRes.ok) setAvailableSuasana((await suasanaRes.json()).data || []);
                if (areaRes.ok) setAvailableArea((await areaRes.json()).data || []);
                if (jenisRes.ok) setAvailableJenisKuliner((await jenisRes.json()).data || []);
                if (aktivitasRes.ok) setAvailableAktivitas((await aktivitasRes.json()).data || []);
            } catch (err) { console.error("Gagal memuat tags:", err); }
        };
        fetchData();
    }, []);

    const handleInputChange = (field: keyof CulinaryFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: '' }));
    };

    // --- LOGIKA UPLOAD THUMBNAIL (MASUK KE CROP MODAL) ---
    const handleLogoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setErrors(prev => ({ ...prev, logo: "Ukuran file tidak boleh melebihi 5MB" }));
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            setTempLogoUrl(e.target?.result as string);
            setIsCropModalOpen(true); // Buka modal crop
            setZoom(1);
        };
        reader.readAsDataURL(file);
        event.target.value = ''; // Reset input agar bisa pilih foto yg sama lagi
    };

    const handleCropComplete = async () => {
        if (!tempLogoUrl || !croppedAreaPixels) return;
        try {
            // Proses gambar menjadi file baru yang sudah dipotong
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

    // --- LOGIKA GALERI & MENU ---
    const handleGalleryUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;
        const newMedia: MediaFile[] = [];
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.size > 10 * 1024 * 1024) continue;
            const previewUrl = URL.createObjectURL(file);
            newMedia.push({ file, type: 'photo', preview: previewUrl }); 
        }
        setMediaFiles(prev => [...prev, ...newMedia]);
    };
    const removeMedia = (index: number) => setMediaFiles(prev => prev.filter((_, i) => i !== index));
    const addMenuItem = () => setMenuItems(prev => [...prev, { id: `menu_${Date.now()}`, name: '', description: '', price: '', is_signature: false }]);
    const updateMenuItem = (id: string, field: keyof MenuItem, value: any) => setMenuItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
    const removeMenuItem = (id: string) => setMenuItems(prev => prev.filter(item => item.id !== id));
    const toggleTagByName = (tagName: string) => setSelectedTags(prev => prev.includes(tagName) ? prev.filter(t => t !== tagName) : [...prev, tagName]);

    // --- VALIDASI & SUBMIT ---
    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!formData.nama.trim()) newErrors.nama = 'Nama tempat wajib diisi';
        if (!formData.alamat.trim()) newErrors.alamat = 'Alamat wajib diisi';
        if (!formData.subkategori) newErrors.subkategori = 'Jenis kuliner wajib dipilih';
        setErrors(newErrors);
        
        if (Object.keys(newErrors).length > 0) {
            alert("Pendaftaran Gagal!\n\nMohon lengkapi kolom wajib yang belum diisi (Nama, Alamat, atau Jenis Kuliner).");
            setErrors(prev => ({ ...prev, general: 'Mohon lengkapi semua kolom yang bertanda bintang merah (*)' }));
            return false;
        }
        return true;
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
        data.append('kategori_id', '2'); // 2 = Kuliner
        data.append('email', formData.email);
        data.append('website', formData.website);
        data.append('latitude', formData.latitude);
        data.append('longitude', formData.longitude);
        data.append('price', formData.price);
        data.append('checkIn', formData.open_time);   
        data.append('checkOut', formData.close_time); 
        data.append('status', 'approved');
        data.append('selectedFacilities', JSON.stringify(selectedTags)); 
        data.append('menuItems', JSON.stringify(menuItems)); 

        if (formData.logo) data.append('thumbnail_picture', formData.logo); 
        mediaFiles.forEach((media) => data.append('media_files', media.file));

        try {
            const response = await fetch(SUBMIT_URL, { method: 'POST', body: data });
            const result = await response.json();
            if (!response.ok) throw new Error(result.error || result.message || 'Gagal menyimpan data.');
            setShowSuccess(true);
        } catch (error) {
            setErrors({ general: (error as Error).message || 'Gagal terhubung ke server.' });
        } finally {
            setIsLoading(false);
        }
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center border-t-4 border-orange-500">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Utensils className="w-8 h-8 text-orange-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Didaftarkan!</h2>
                    <p className="text-gray-600 mb-6">Bisnis Kuliner Anda telah berhasil disimpan dan aktif.</p>
                    <button onClick={() => router.push('/admin/businesses')} className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors">
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
                            <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Tambah Data Kuliner</h1>
                                <p className="text-sm text-gray-500">Daftarkan restoran, kafe, atau warung makan</p>
                            </div>
                        </div>
                        <div className="bg-orange-100 p-2 rounded-lg">
                            <Store className="w-5 h-5 text-orange-600" />
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
                        <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">Informasi Dasar</h2>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Nama Bisnis Kuliner <span className="text-red-500">*</span></label>
                                <input type="text" value={formData.nama} onChange={(e) => handleInputChange('nama', e.target.value)} placeholder="Contoh: Kafe Senja, Seafood Makmur" className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none ${errors.nama ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.nama && <p className="text-sm text-red-600 mt-1">{errors.nama}</p>}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Tipe Kuliner <span className="text-red-500">*</span></label>
                                    <select value={formData.subkategori} onChange={(e) => handleInputChange('subkategori', e.target.value)} className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none bg-white ${errors.subkategori ? 'border-red-300' : 'border-gray-200'}`}>
                                        <option value="">Pilih Tipe...</option>
                                        {/* Gunakan daftar manual seperti di halaman Edit */}
                                        {kulinerSubcategories.map(sub => (<option key={sub.slug} value={sub.slug}>{sub.name}</option>))}
                                    </select>
                                    {errors.subkategori && <p className="text-sm text-red-600 mt-1">{errors.subkategori}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Estimasi Harga per Orang (Rp)</label>
                                    <input type="number" value={formData.price} onChange={(e) => handleInputChange('price', e.target.value)} placeholder="Contoh: 50000" className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Alamat Lengkap <span className="text-red-500">*</span></label>
                                <textarea value={formData.alamat} onChange={(e) => handleInputChange('alamat', e.target.value)} placeholder="Alamat detail..." rows={2} className={`w-full p-3.5 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none ${errors.alamat ? 'border-red-300' : 'border-gray-200'}`} />
                                {errors.alamat && <p className="text-sm text-red-600 mt-1">{errors.alamat}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Deskripsi Tempat & Makanan</label>
                                <textarea value={formData.deskripsi} onChange={(e) => handleInputChange('deskripsi', e.target.value)} placeholder="Ceritakan tentang suasana, menu andalan, dan keunikan tempat Anda..." rows={4} className="w-full p-3.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none" />
                            </div>
                        </div>
                    </div>

                    {/* Kontak & Operasional */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Kontak & Jam Operasional</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">No. Telepon / WhatsApp (Opsional)</label>
                                <div className="relative"><Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input type="tel" value={formData.kontak} onChange={(e) => handleInputChange('kontak', e.target.value)} placeholder="08xx-xxxx-xxxx" className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-orange-500 outline-none ${errors.kontak ? 'border-red-300' : 'border-gray-200'}`} />
                                </div>
                            </div>
                            <div className="lg:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram / Website</label>
                                <div className="relative"><Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" /><input type="text" value={formData.website} onChange={(e) => handleInputChange('website', e.target.value)} placeholder="@instagram_anda" className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" /></div>
                            </div>
                            
                            {/* Jam Operasional */}
                            <div className="lg:col-span-2 flex flex-col gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                <div className="flex items-center justify-between mb-2">
                                    <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Jam Operasional</label>
                                    <label className="flex items-center gap-2 cursor-pointer group">
                                        <input 
                                            type="checkbox" 
                                            checked={formData.is_24_hours}
                                            onChange={(e) => {
                                                const checked = e.target.checked;
                                                setFormData(prev => ({
                                                    ...prev, 
                                                    is_24_hours: checked,
                                                    open_time: checked ? '00:00' : '10:00',
                                                    close_time: checked ? '23:59' : '22:00'
                                                }));
                                            }}
                                            className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500"
                                        />
                                        <span className={`text-sm font-bold ${formData.is_24_hours ? 'text-orange-600' : 'text-gray-500'}`}>Buka 24 Jam</span>
                                    </label>
                                </div>
                                
                                <div className={`flex gap-4 transition-opacity ${formData.is_24_hours ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                                    <div className="w-full">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Jam Buka</label>
                                        <div className="relative"><Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="time" value={formData.open_time} onChange={(e) => handleInputChange('open_time', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white" /></div>
                                    </div>
                                    <div className="w-full">
                                        <label className="block text-xs font-semibold text-gray-500 mb-1 uppercase tracking-wider">Jam Tutup</label>
                                        <div className="relative"><Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" /><input type="time" value={formData.close_time} onChange={(e) => handleInputChange('close_time', e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none bg-white" /></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Menu Unggulan */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-bold text-gray-800">Menu Unggulan</h2>
                                <p className="text-sm text-gray-500">Tambahkan daftar menu makanan & minuman andalan Anda.</p>
                            </div>
                            <button type="button" onClick={addMenuItem} className="flex items-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 rounded-xl hover:bg-orange-200 font-semibold transition-colors">
                                <Plus className="w-4 h-4" /> Tambah Menu
                            </button>
                        </div>

                        {menuItems.length === 0 ? (
                            <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                                <Utensils className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-sm text-gray-500">Belum ada menu yang ditambahkan.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {menuItems.map((item, index) => (
                                    <div key={item.id} className="relative flex flex-col md:flex-row gap-4 p-4 border border-gray-200 rounded-xl bg-gray-50/50 group">
                                        <div className="flex-1">
                                            <input type="text" value={item.name} onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)} placeholder="Nama Menu (Contoh: Nasi Goreng Spesial)" className="w-full font-bold px-3 py-2 bg-transparent border-b border-gray-300 focus:border-orange-500 outline-none mb-2" />
                                            <input type="text" value={item.description} onChange={(e) => updateMenuItem(item.id, 'description', e.target.value)} placeholder="Deskripsi ringkas bahan atau rasa..." className="w-full text-sm px-3 py-1 bg-transparent border-b border-gray-200 focus:border-orange-500 outline-none text-gray-600" />
                                        </div>
                                        <div className="md:w-48 flex flex-col justify-between">
                                            <input type="number" value={item.price} onChange={(e) => updateMenuItem(item.id, 'price', e.target.value)} placeholder="Harga (Rp)" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none mb-2" />
                                            <label className="flex items-center gap-2 cursor-pointer bg-white border border-gray-200 px-3 py-1.5 rounded-lg select-none">
                                                <input type="checkbox" checked={item.is_signature} onChange={(e) => updateMenuItem(item.id, 'is_signature', e.target.checked)} className="w-4 h-4 text-orange-600 rounded focus:ring-orange-500" />
                                                <Star className={`w-4 h-4 ${item.is_signature ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                                                <span className="text-xs font-semibold text-gray-700">Signature</span>
                                            </label>
                                        </div>
                                        <button type="button" onClick={() => removeMenuItem(item.id)} className="absolute -top-3 -right-3 bg-red-100 text-red-600 p-2 rounded-full hover:bg-red-200 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Logo & Galeri */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Gambar Utama (Thumbnail)</h2>
                            {!logoPreview ? (
                                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors flex flex-col items-center justify-center">
                                    <input type="file" accept="image/*" onChange={handleLogoSelect} className="hidden" id="logo-upload"/>
                                    <label htmlFor="logo-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                        <Camera className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                                        <h3 className="text-sm font-semibold text-gray-700">Pilih Gambar Utama</h3>
                                        <p className="text-xs text-gray-400 mt-1">Anda bisa menyesuaikan (crop) gambar setelah dipilih</p>
                                    </label>
                                </div>
                            ) : (
                                <div className="relative border rounded-xl overflow-hidden h-48 bg-gray-50">
                                    <img src={logoPreview} alt="Preview" className="w-full h-full object-cover" />
                                    <button type="button" onClick={() => { setFormData(prev => ({ ...prev, logo: null })); setLogoPreview(null); }} className="absolute top-2 right-2 bg-red-500/90 text-white rounded-lg p-1.5 hover:bg-red-600 shadow"><X className="w-4 h-4" /></button>
                                </div>
                            )}
                        </div>

                        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-800 mb-4">Galeri Tempat & Menu</h2>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors mb-4 flex flex-col items-center justify-center">
                                <input type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" id="gallery-upload" />
                                <label htmlFor="gallery-upload" className="cursor-pointer flex flex-col items-center justify-center">
                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <h3 className="text-sm font-semibold text-gray-700">Upload Banyak Gambar</h3>
                                </label>
                            </div>

                            {mediaFiles.length > 0 && (
                                <div className="grid grid-cols-4 gap-2">
                                    {mediaFiles.slice(0, 8).map((media, index) => (
                                        <div key={index} className="relative group aspect-square">
                                            <img src={media.preview} alt="Galeri" className="w-full h-full object-cover rounded-lg border border-gray-200" />
                                            <button type="button" onClick={() => removeMedia(index)} className="absolute top-1 right-1 bg-red-500 text-white rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-3 h-3" /></button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Tags (Suasana, Fasilitas, Area) */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-6">Klasifikasi & Fasilitas Tempat</h2>
                        <div className="space-y-8">
                            
                            {/* Jenis Kuliner (Makanan/Minuman Spesifik) */}
                            {availableJenisKuliner.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Kategori & Menu Spesifik (Bisa pilih banyak)</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableJenisKuliner.map(tag => (
                                            <button key={tag.id} type="button" onClick={() => toggleTagByName(tag.name)} className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-colors ${selectedTags.includes(tag.name) ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Suasana */}
                            {availableSuasana.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Vibe & Suasana</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {availableSuasana.map(tag => (
                                            <button key={tag.id} type="button" onClick={() => toggleTagByName(tag.name)} className={`px-4 py-2 border-2 rounded-xl text-sm font-semibold transition-colors ${selectedTags.includes(tag.name) ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:border-orange-300'}`}>
                                                {tag.name}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Fasilitas */}
                            {availableFasilitas.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Fasilitas Tersedia</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {availableFasilitas.map((tag) => {
                                            const Icon = getIconForTag(tag.name, tag.type);
                                            const isSelected = selectedTags.includes(tag.name); 
                                            return (
                                                <button key={tag.id} type="button" onClick={() => toggleTagByName(tag.name)} className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${isSelected ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-gray-400'}`} />
                                                    <span className="text-xs font-medium text-center">{tag.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Area (Dibuat kotak berikon seperti fasilitas) */}
                            {availableArea.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Area Pemandangan</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {availableArea.map((tag) => {
                                            const Icon = getIconForTag(tag.name, tag.type);
                                            const isSelected = selectedTags.includes(tag.name); 
                                            return (
                                                <button key={tag.id} type="button" onClick={() => toggleTagByName(tag.name)} className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${isSelected ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-gray-400'}`} />
                                                    <span className="text-xs font-medium text-center">{tag.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Aktivitas di Sekitar */}
                            {availableAktivitas.length > 0 && (
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Aktivitas di Sekitar</h3>
                                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {availableAktivitas.map((tag) => {
                                            const Icon = getIconForTag(tag.name, tag.type);
                                            const isSelected = selectedTags.includes(tag.name); 
                                            return (
                                                <button key={tag.id} type="button" onClick={() => toggleTagByName(tag.name)} className={`p-3 border rounded-xl transition-all flex flex-col items-center justify-center gap-2 ${isSelected ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-sm' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                                                    <Icon className={`w-5 h-5 ${isSelected ? 'text-orange-600' : 'text-gray-400'}`} />
                                                    <span className="text-xs font-medium text-center">{tag.name}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                        </div>
                    </div>

                    {/* Lokasi Peta */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-800 mb-4">Koordinat Peta (GPS)</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input type="text" value={formData.latitude} onChange={(e) => handleInputChange('latitude', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500 text-sm" placeholder="1.1304753" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input type="text" value={formData.longitude} onChange={(e) => handleInputChange('longitude', e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-orange-500 text-sm" placeholder="104.0524807" />
                                </div>
                            </div>
                            <div className="md:col-span-2 bg-gray-100 rounded-xl overflow-hidden h-48 border border-gray-200 relative">
                                {formData.latitude && formData.longitude ? (
                                    <iframe width="100%" height="100%" frameBorder="0" scrolling="no" src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(formData.longitude)-0.005}%2C${parseFloat(formData.latitude)-0.005}%2C${parseFloat(formData.longitude)+0.005}%2C${parseFloat(formData.latitude)+0.005}&layer=mapnik&marker=${formData.latitude}%2C${formData.longitude}`}></iframe>
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
                        <button type="submit" disabled={isLoading} className="px-8 py-3.5 bg-orange-600 text-white rounded-xl font-bold hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 shadow-lg shadow-orange-200">
                            {isLoading ? (<><Loader2 className="w-5 h-5 animate-spin" /> Mendaftarkan...</>) : (<><Save className="w-5 h-5" /> Daftarkan Bisnis Kuliner</>)}
                        </button>
                    </div>
                </form>
            </div>

            {/* MODAL CROP GAMBAR */}
            {isCropModalOpen && tempLogoUrl && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                            <h3 className="font-bold text-gray-800">Sesuaikan Gambar Thumbnail</h3>
                            <button onClick={() => setIsCropModalOpen(false)} className="p-1.5 hover:bg-red-50 rounded-full group transition-colors">
                                <X className="w-5 h-5 text-gray-500 group-hover:text-red-500" />
                            </button>
                        </div>
                        
                        {/* Area Cropper */}
                        <div className="relative h-[300px] w-full bg-gray-900">
                            <Cropper
                                image={tempLogoUrl}
                                crop={crop}
                                zoom={zoom}
                                aspect={16 / 9} // Rasio persegi panjang standar (ubah ke 1 untuk kotak)
                                onCropChange={setCrop}
                                onCropComplete={(_, croppedAreaPixels) => setCroppedAreaPixels(croppedAreaPixels as any)}
                                onZoomChange={setZoom}
                            />
                        </div>
                        
                        {/* Kontrol Zoom & Tombol */}
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
                                    className="w-full accent-orange-600 cursor-pointer"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <button type="button" onClick={() => setIsCropModalOpen(false)} className="px-5 py-2.5 font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-colors">
                                    Batal
                                </button>
                                <button type="button" onClick={handleCropComplete} className="px-5 py-2.5 font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl transition-colors flex items-center gap-2 shadow-md">
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