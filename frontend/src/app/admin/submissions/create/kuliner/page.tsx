// frontend/src/app/admin/submissions/create/kuliner/page.tsx

'use client'

import React, { useState } from 'react';
import { 
    ArrowLeft,
    MapPin,
    Camera,
    Phone,
    Mail,
    Globe,
    Clock,
    Users,
    DollarSign,
    Plus,
    X,
    Check,
    AlertCircle,
    Utensils,
    Coffee,
    ChefHat,
    Pizza,
    IceCream,
    Soup,
    Sandwich,
    Cookie,
    Star,
    Wifi,
    Car,
    CreditCard,
    ShoppingBag,
    Music,
    AirVent,
    Tv,
    Baby,
    Upload,
    ImageIcon,
    Loader2
} from 'lucide-react';

interface CulinaryFormData {
    place_name: string;
    address: string;
    subcategory: string;
    description: string;
    contact: string;
    email: string;
    website: string;
    jam_operasional: string;
    harga_rata: string;
    speciality: string[];
    galeri: File[];
    }

    interface MenuItem {
    id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    is_signature: boolean;
    }

    export default function CulinaryFullForm() {
    const [formData, setFormData] = useState<CulinaryFormData>({
        place_name: '',
        address: '',
        subcategory: '',
        description: '',
        contact: '',
        email: '',
        website: '',
        jam_operasional: '',
        harga_rata: '',
        speciality: [],
        galeri: []
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [selectedFacilities, setSelectedFacilities] = useState<string[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const subcategories = [
        { value: 'restoran', label: 'Restoran', icon: Utensils },
        { value: 'kafe', label: 'Kafe', icon: Coffee },
        { value: 'warung', label: 'Warung', icon: ChefHat },
        { value: 'street-food', label: 'Street Food', icon: Pizza },
        { value: 'bakery', label: 'Bakery', icon: Cookie },
        { value: 'fast-food', label: 'Fast Food', icon: Sandwich },
        { value: 'dessert', label: 'Dessert', icon: IceCream },
        { value: 'catering', label: 'Catering', icon: Soup }
    ];

    const specialityOptions = [
        'Menu makanan',
        'Menu minuman', 
        'Jam buka',
        'Delivery',
        'Seafood',
        'Ayam',
        'Sapi',
        'Vegetarian',
        'Halal',
        'Chinese Food',
        'Western Food',
        'Indonesian Food',
        'Japanese Food',
        'Korean Food',
        'Italian Food',
        'Spicy Food',
        'Dessert',
        'Coffee',
        'Juice',
        'Bubble Tea'
    ];

    const facilities = [
        { id: 'wifi', name: 'WiFi Gratis', icon: Wifi },
        { id: 'parking', name: 'Area Parkir', icon: Car },
        { id: 'ac', name: 'AC', icon: AirVent },
        { id: 'tv', name: 'TV/Entertainment', icon: Tv },
        { id: 'music', name: 'Live Music', icon: Music },
        { id: 'delivery', name: 'Delivery', icon: ShoppingBag },
        { id: 'cashless', name: 'Pembayaran Digital', icon: CreditCard },
        { id: 'outdoor', name: 'Outdoor Seating', icon: Users },
        { id: 'smoking', name: 'Smoking Area', icon: Coffee },
        { id: 'family', name: 'Family Friendly', icon: Baby },
        { id: 'takeaway', name: 'Take Away', icon: ShoppingBag },
        { id: 'reservation', name: 'Reservasi', icon: Phone }
    ];

    const priceRanges = [
        'Di bawah Rp 25.000',
        'Rp 25.000 - Rp 50.000', 
        'Rp 50.000 - Rp 100.000',
        'Rp 100.000 - Rp 200.000',
        'Di atas Rp 200.000'
    ];

    const handleInputChange = (field: keyof CulinaryFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
        setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSpecialityToggle = (speciality: string) => {
        setFormData(prev => ({
        ...prev,
        speciality: prev.speciality.includes(speciality)
            ? prev.speciality.filter(s => s !== speciality)
            : [...prev.speciality, speciality]
        }));
    };

    const handleFacilityToggle = (facilityId: string) => {
        setSelectedFacilities(prev => 
        prev.includes(facilityId) 
            ? prev.filter(id => id !== facilityId)
            : [...prev, facilityId]
        );
    };

    const handleFileUpload = (files: FileList | null) => {
        if (files) {
        const newFiles = Array.from(files);
        setFormData(prev => ({
            ...prev,
            galeri: [...prev.galeri, ...newFiles].slice(0, 10)
        }));
        }
    };

    const removeImage = (index: number) => {
        setFormData(prev => ({
        ...prev,
        galeri: prev.galeri.filter((_, i) => i !== index)
        }));
    };

    const addMenuItem = () => {
        const newItem: MenuItem = {
        id: `item_${Date.now()}`,
        name: '',
        description: '',
        price: 0,
        category: 'main',
        is_signature: false
        };
        setMenuItems(prev => [...prev, newItem]);
    };

    const updateMenuItem = (itemId: string, field: keyof MenuItem, value: any) => {
        setMenuItems(prev => prev.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
        ));
    };

    const removeMenuItem = (itemId: string) => {
        setMenuItems(prev => prev.filter(item => item.id !== itemId));
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.place_name.trim()) newErrors.place_name = 'Nama bisnis wajib diisi';
        if (!formData.address.trim()) newErrors.address = 'Alamat wajib diisi';
        if (!formData.subcategory) newErrors.subcategory = 'Kategori kuliner wajib dipilih';
        if (!formData.contact.trim()) newErrors.contact = 'Kontak wajib diisi';
        if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
        
        if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Format email tidak valid';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
        return;
        }

        setIsSubmitting(true);

        // Simulate API call
        setTimeout(() => {
        setIsSubmitting(false);
        setShowSuccess(true);
        }, 2000);
    };

    if (showSuccess) {
        return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Berhasil Didaftarkan!</h2>
            <p className="text-gray-600 mb-6">
                Bisnis kuliner Anda telah berhasil didaftarkan dan akan diverifikasi dalam 1-2 hari kerja.
            </p>
            <button 
                onClick={() => window.history.back()}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-semibold hover:bg-orange-700 transition-colors"
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
                    <h1 className="text-xl font-bold text-gray-800">Daftarkan Bisnis Kuliner</h1>
                    <p className="text-sm text-gray-500">Lengkapi semua informasi bisnis kuliner Anda</p>
                </div>
                </div>
                <div className="flex items-center gap-2">
                <div className="bg-orange-100 p-2 rounded-lg">
                    <Utensils className="w-5 h-5 text-orange-600" />
                </div>
                </div>
            </div>
            </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8">
            <form onSubmit={handleSubmit} className="space-y-8">
            
            {/* Informasi Dasar */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Informasi Dasar</h2>
                
                <div className="space-y-6">
                {/* Nama & Kategori */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Nama Bisnis Kuliner <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.place_name}
                        onChange={(e) => handleInputChange('place_name', e.target.value)}
                        placeholder="Contoh: Warung Mak Beng, Cafe Latte"
                        className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                        errors.place_name ? 'border-red-300' : 'border-gray-300'
                        }`}
                    />
                    {errors.place_name && (
                        <p className="text-sm text-red-600 mt-1">{errors.place_name}</p>
                    )}
                    </div>

                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Range Harga per Porsi
                    </label>
                    <select
                        value={formData.harga_rata}
                        onChange={(e) => handleInputChange('harga_rata', e.target.value)}
                        className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                    >
                        <option value="">Pilih Range Harga</option>
                        {priceRanges.map((range) => (
                        <option key={range} value={range}>{range}</option>
                        ))}
                    </select>
                    </div>
                </div>

                {/* Kategori Kuliner */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Kategori Kuliner <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {subcategories.map((sub) => (
                        <button
                        key={sub.value}
                        type="button"
                        onClick={() => handleInputChange('subcategory', sub.value)}
                        className={`p-4 border-2 rounded-xl text-center transition-colors ${
                            formData.subcategory === sub.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                        >
                        <sub.icon className="w-8 h-8 mx-auto mb-2" />
                        <div className="font-semibold text-sm">{sub.label}</div>
                        </button>
                    ))}
                    </div>
                    {errors.subcategory && (
                    <p className="text-sm text-red-600 mt-1">{errors.subcategory}</p>
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
                    placeholder="Masukkan alamat lengkap tempat usaha"
                    rows={3}
                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none ${
                        errors.address ? 'border-red-300' : 'border-gray-300'
                    }`}
                    />
                    {errors.address && (
                    <p className="text-sm text-red-600 mt-1">{errors.address}</p>
                    )}
                </div>

                {/* Deskripsi */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Deskripsi Bisnis <span className="text-red-500">*</span>
                    </label>
                    <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Ceritakan tentang bisnis kuliner Anda, specialty makanan, suasana, keunggulan, dll."
                    rows={4}
                    className={`w-full p-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none ${
                        errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    />
                    {errors.description && (
                    <p className="text-sm text-red-600 mt-1">{errors.description}</p>
                    )}
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
                        value={formData.contact}
                        onChange={(e) => handleInputChange('contact', e.target.value)}
                        placeholder="08xxxxxxxxxx"
                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                            errors.contact ? 'border-red-300' : 'border-gray-300'
                        }`}
                        />
                    </div>
                    {errors.contact && (
                        <p className="text-sm text-red-600 mt-1">{errors.contact}</p>
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
                        placeholder="info@restaurant.com"
                        className={`w-full pl-12 pr-4 py-4 border rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                        }`}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-sm text-red-600 mt-1">{errors.email}</p>
                    )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Website/Social Media
                    </label>
                    <div className="relative">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                        type="url"
                        value={formData.website}
                        onChange={(e) => handleInputChange('website', e.target.value)}
                        placeholder="@instagram atau www.restaurant.com"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    </div>

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
                        placeholder="Contoh: Setiap Hari 10:00 - 22:00"
                        className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                        />
                    </div>
                    </div>
                </div>
                </div>
            </div>

            {/* Speciality & Menu */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Speciality */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Speciality & Keunggulan</h2>
                <p className="text-gray-600 mb-6">Pilih specialty yang sesuai dengan bisnis Anda</p>
                
                <div className="grid grid-cols-2 gap-3">
                    {specialityOptions.map((speciality) => (
                    <button
                        key={speciality}
                        type="button"
                        onClick={() => handleSpecialityToggle(speciality)}
                        className={`p-3 border-2 rounded-xl text-sm font-medium transition-colors ${
                        formData.speciality.includes(speciality)
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-600'
                        }`}
                    >
                        {speciality}
                    </button>
                    ))}
                </div>

                {formData.speciality.length > 0 && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <p className="text-sm text-orange-800">
                        <strong>{formData.speciality.length}</strong> speciality dipilih
                    </p>
                    </div>
                )}
                </div>

                {/* Menu Unggulan */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                    <div>
                    <h2 className="text-xl font-bold text-gray-800">Menu Unggulan</h2>
                    <p className="text-gray-600">Tambahkan menu andalan (opsional)</p>
                    </div>
                    <button
                    type="button"
                    onClick={addMenuItem}
                    className="flex items-center gap-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                    <Plus className="w-4 h-4" />
                    Menu
                    </button>
                </div>

                {menuItems.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <Utensils className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 mb-3">Belum ada menu unggulan</p>
                    <button
                        type="button"
                        onClick={addMenuItem}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                    >
                        + Tambah Menu
                    </button>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                    {menuItems.map((item, index) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-700">Menu #{index + 1}</span>
                            <button
                            type="button"
                            onClick={() => removeMenuItem(item.id)}
                            className="text-red-500 hover:text-red-700"
                            >
                            <X className="w-4 h-4" />
                            </button>
                        </div>
                        
                        <div className="space-y-2">
                            <input
                            type="text"
                            value={item.name}
                            onChange={(e) => updateMenuItem(item.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            placeholder="Nama menu"
                            />
                            
                            <div className="grid grid-cols-2 gap-2">
                            <input
                                type="number"
                                value={item.price}
                                onChange={(e) => updateMenuItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                                placeholder="Harga"
                            />
                            <label className="flex items-center gap-2">
                                <input
                                type="checkbox"
                                checked={item.is_signature}
                                onChange={(e) => updateMenuItem(item.id, 'is_signature', e.target.checked)}
                                className="rounded border-gray-300 text-orange-600 focus:ring-orange-500"
                                />
                                <Star className="w-4 h-4 text-yellow-400" />
                                <span className="text-xs">Signature</span>
                            </label>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
                </div>
            </div>

            {/* Fasilitas */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Fasilitas Tersedia</h2>
                <p className="text-gray-600 mb-6">Pilih fasilitas yang tersedia di tempat Anda</p>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {facilities.map(facility => {
                    const Icon = facility.icon;
                    const isSelected = selectedFacilities.includes(facility.id);
                    return (
                    <button
                        key={facility.id}
                        type="button"
                        onClick={() => handleFacilityToggle(facility.id)}
                        className={`p-4 border-2 rounded-xl transition-colors ${
                        isSelected
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-orange-300 text-gray-600'
                        }`}
                    >
                        <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-orange-600' : 'text-gray-500'}`} />
                        <span className="text-sm font-medium">{facility.name}</span>
                    </button>
                    );
                })}
                </div>

                {selectedFacilities.length > 0 && (
                <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="font-medium text-orange-900">
                    Fasilitas Terpilih ({selectedFacilities.length})
                    </p>
                    <p className="text-sm text-orange-700 mt-1">
                    {selectedFacilities.map(id => 
                        facilities.find(f => f.id === id)?.name
                    ).join(', ')}
                    </p>
                </div>
                )}
            </div>

            {/* Upload Galeri */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Galeri Foto</h2>
                <p className="text-gray-600 mb-6">Upload foto-foto menarik dari tempat usaha dan makanan Anda (maksimal 10 foto)</p>
                
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
                    <Camera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Foto</h3>
                    <p className="text-gray-500">Klik untuk memilih foto atau drag & drop</p>
                </label>
                </div>

                {/* Preview Images */}
                {formData.galeri.length > 0 && (
                <div>
                    <h4 className="text-lg font-semibold text-gray-800 mb-4">Preview ({formData.galeri.length} foto)</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
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

            {/* Submit Button */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    <p>Pastikan semua informasi sudah benar sebelum mendaftar</p>
                    <p className="mt-1">
                    Form yang sudah diisi: 
                    <span className="font-medium text-orange-600 ml-1">
                        {formData.place_name && 'Info Dasar'}
                        {formData.contact && ', Kontak'}
                        {formData.speciality.length > 0 && ', Speciality'}
                        {menuItems.length > 0 && ', Menu'}
                        {selectedFacilities.length > 0 && ', Fasilitas'}
                        {formData.galeri.length > 0 && ', Galeri'}
                    </span>
                    </p>
                </div>
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-orange-600 text-white rounded-xl font-semibold hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                >
                    {isSubmitting ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Mendaftarkan...
                    </>
                    ) : (
                    <>
                        <Upload className="w-5 h-5" />
                        Daftarkan Bisnis Kuliner
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