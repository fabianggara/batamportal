'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
    ArrowLeft,
    MapPin,
    Camera,
    Upload,
    Phone,
    Mail,
    Globe,
    Clock,
    Users,
    Star,
    DollarSign,
    Info,
    Plus,
    X,
    Check,
    AlertCircle,
    Mountain,
    TreePine,
    Waves,
    Building2,
    Camera as CameraIcon,
    Wifi,
    Car,
    CreditCard,
    ShoppingBag
} from 'lucide-react';

interface FormData {
    place_name: string;
    address: string;
    subcategory: string;
    description: string;
    contact: string;
    email: string;
    website: string;
    jam_operasional: string;
    harga_tiket: string;
    fasilitas: string[];
    galeri: File[];
}

export default function TourismForm() {
    const router = useRouter();
    const [formData, setFormData] = useState<FormData>({
        place_name: '',
        address: '',
        subcategory: '',
        description: '',
        contact: '',
        email: '',
        website: '',
        jam_operasional: '',
        harga_tiket: '',
        fasilitas: [],
        galeri: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const subcategories = [
        { value: 'pantai', label: 'Pantai', icon: Waves },
        { value: 'taman', label: 'Taman', icon: TreePine },
        { value: 'museum', label: 'Museum', icon: Building2 },
        { value: 'tempat-bersejarah', label: 'Tempat Bersejarah', icon: Mountain }
    ];

    const fasilitasOptions = [
        'Toilet',
        'Parkir',
        'Restoran',
        'Souvenir Shop',
        'Pemandu Wisata',
        'Spot Foto',
        'Area Bermain',
        'Mushola',
        'WiFi Gratis',
        'ATM Center',
        'Area Piknik'
    ];

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        // Reset error jika pengguna mulai mengetik
        setErrors(prev => ({ ...prev, [field]: '' }));
    };

    const handleFasilitasToggle = (fasilitas: string) => {
        setFormData(prev => ({
            ...prev,
            fasilitas: prev.fasilitas.includes(fasilitas)
                ? prev.fasilitas.filter(f => f !== fasilitas)
                : [...prev.fasilitas, fasilitas]
        }));
    };

    const handleFileUpload = (files: FileList | null) => {
        if (files) {
            const newFiles = Array.from(files);
            setFormData(prev => ({
                ...prev,
                galeri: [...prev.galeri, ...newFiles].slice(0, 10) // Max 10 images
            }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
            ...prev,
            galeri: prev.galeri.filter((_, i) => i !== index)
        }));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.place_name.trim()) newErrors.place_name = 'Nama tempat wajib diisi';
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.subcategory) newErrors.subcategory = 'Kategori wisata wajib dipilih';
        if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
        if (!formData.contact.trim()) newErrors.contact = 'Kontak wajib diisi';
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Format email tidak valid';
        }
        
        // Contoh validasi tambahan
        if (formData.galeri.length === 0) newErrors.galeri = 'Minimal satu foto galeri harus diunggah';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            return;
        }

        setIsSubmitting(true);

        // Contoh: Simulasi panggilan API
        setTimeout(() => {
            setIsSubmitting(false);
            setShowSuccess(true);
        }, 2000);
    };

    if (showSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Check className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Didaftarkan!</h2>
                    <p className="text-gray-600 mb-6">
                        Tempat wisata Anda telah berhasil didaftarkan dan akan diverifikasi dalam 1-2 hari kerja.
                    </p>
                    <button 
                        onClick={() => router.push('/admin/submissions')}
                        className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-colors"
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
                            <button onClick={() => router.back()}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-bold text-gray-800">Daftarkan Tempat Wisata</h1>
                                <p className="text-sm text-gray-500">Lengkapi semua informasi tempat wisata Anda</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="bg-green-100 p-2 rounded-lg">
                                <MapPin className="w-5 h-5 text-green-600" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                    
                    {/* Bagian Informasi Dasar */}
                    <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Dasar Tempat Wisata</h2>
                        
                        <div className="space-y-6">
                            {/* Nama Tempat Wisata */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Nama Tempat Wisata <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={formData.place_name}
                                    onChange={(e) => handleInputChange('place_name', e.target.value)}
                                    placeholder="Contoh: Pantai Nongsa, Taman Mini Batam"
                                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                                        errors.place_name ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.place_name && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.place_name}
                                    </p>
                                )}
                            </div>

                            {/* Kategori Wisata */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-3">
                                    Kategori Wisata <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {subcategories.map((sub) => {
                                        const Icon = sub.icon;
                                        return (
                                            <button
                                                key={sub.value}
                                                type="button"
                                                onClick={() => handleInputChange('subcategory', sub.value)}
                                                className={`p-4 border-2 rounded-xl text-center transition-colors ${
                                                    formData.subcategory === sub.value
                                                        ? 'border-green-500 bg-green-50 text-green-700'
                                                        : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                                }`}
                                            >
                                                <Icon className="w-8 h-8 mx-auto mb-2" />
                                                <div className="font-semibold text-sm">{sub.label}</div>
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.subcategory && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.subcategory}
                                    </p>
                                )}
                            </div>

                            {/* Alamat */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Alamat Lengkap <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    placeholder="Masukkan alamat lengkap tempat wisata"
                                    rows={3}
                                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none ${
                                        errors.address ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.address && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.address}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bagian Detail & Informasi Kontak */}
                    <div className="bg-white rounded-2xl shadow-sm p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Detail & Informasi Kontak</h2>
                        
                        <div className="space-y-6">
                            {/* Deskripsi */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Deskripsi Tempat Wisata <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    placeholder="Ceritakan tentang tempat wisata Anda, apa yang menarik, aktivitas yang bisa dilakukan, dll."
                                    rows={4}
                                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none resize-none ${
                                        errors.description ? 'border-red-300' : 'border-gray-300'
                                    }`}
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        {errors.description}
                                    </p>
                                )}
                            </div>

                            {/* Jam Operasional */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Jam Operasional
                                </label>
                                <div className="relative">
                                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.jam_operasional}
                                        onChange={(e) => handleInputChange('jam_operasional', e.target.value)}
                                        placeholder="Contoh: Setiap Hari 08:00 - 18:00"
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Harga Tiket */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Harga Tiket Masuk
                                </label>
                                <div className="relative">
                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={formData.harga_tiket}
                                        onChange={(e) => handleInputChange('harga_tiket', e.target.value)}
                                        placeholder="Contoh: Rp 10.000 (Dewasa), Rp 5.000 (Anak-anak) atau Gratis"
                                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Contact Info Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Nomor Telepon <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="tel"
                                            value={formData.contact}
                                            onChange={(e) => handleInputChange('contact', e.target.value)}
                                            placeholder="08xxxxxxxxxx"
                                            className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                                                errors.contact ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.contact && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.contact}
                                            </p>
                                        )}
                                    </div>
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
                                            placeholder="info@tempat-wisata.com"
                                            className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none ${
                                                errors.email ? 'border-red-300' : 'border-gray-300'
                                            }`}
                                        />
                                        {errors.email && (
                                            <p className="text-sm text-red-600 mt-1 flex items-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {errors.email}
                                            </p>
                                        )}
                                    </div>
                                </div>

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
                                            placeholder="www.tempat-wisata.com"
                                            className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bagian Fasilitas & Media */}
                    <div className="space-y-6">
                        {/* Fasilitas */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Fasilitas Tersedia</h2>
                            <p className="text-gray-600 mb-6">Pilih fasilitas yang tersedia di tempat wisata Anda</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                {fasilitasOptions.map((fasilitas) => (
                                    <button
                                        key={fasilitas}
                                        type="button"
                                        onClick={() => handleFasilitasToggle(fasilitas)}
                                        className={`p-3 border-2 rounded-xl text-sm font-medium transition-colors ${
                                            formData.fasilitas.includes(fasilitas)
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                        }`}
                                    >
                                        {fasilitas}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Upload Galeri */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">Galeri Foto</h2>
                            <p className="text-gray-600 mb-6">Upload foto-foto menarik dari tempat wisata Anda (maksimal 10 foto)</p>
                            
                            {/* Upload Area */}
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-4">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={(e) => handleFileUpload(e.target.files)}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer">
                                    <CameraIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Foto</h3>
                                    <p className="text-gray-500">Klik untuk memilih foto atau drag & drop</p>
                                </label>
                            </div>

                            {/* Preview Images */}
                            {formData.galeri.length > 0 && (
                                <div>
                                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Preview ({formData.galeri.length} foto)</h4>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {formData.galeri.map((file, index) => (
                                            <div key={index} className="relative group">
                                                <img
                                                    src={URL.createObjectURL(file)}
                                                    alt={`Preview ${index + 1}`}
                                                    className="w-full h-24 object-cover rounded-lg"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => removeImage(index)}
                                                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-center pt-6">
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`px-8 py-3 rounded-xl font-semibold transition-colors w-full sm:w-auto ${
                                isSubmitting ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Tempat Wisata'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}