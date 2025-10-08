// frontend/src/app/admin/businesses/preview/akomodasi/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter, useParams } from 'next/navigation';
import { 
    ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, Calendar, Share2, Heart, Star, 
    Camera, Play, Clock, Users, Award, Building, Utensils, Car, Briefcase, ArrowLeft, 
    ExternalLink, MessageCircle, Bookmark, MoreVertical, Wifi, Bath, Bell, Snowflake, 
    ParkingSquare, UtensilsCrossed, Dumbbell, Coffee, AirVent, Dog, Tv, BedDouble, Ruler, 
    DoorClosed, ShowerHead, Check, Loader2, Edit
} from 'lucide-react';

// --- INTERFACES SESUAI DATABASE ---
interface AmenityItem {
    facility_id: number;
    name: string;
    icon: string;
    is_available: boolean;
}

interface RoomType {
    id: number;
    name: string;
    base_price: number;
    description: string;
    size_sqm: number;
    max_occupancy: number;
    bed_type: string;
    image_url: string;
}

interface MediaItem {
    id: number;
    business_id: number;
    file_path: string; 
    file_type: 'image' | 'video'; 
}

interface BusinessDetail {
    id: number;
    name: string;
    address: string;
    description?: string;
    phone?: string; 
    email?: string;
    website?: string;
    created_at?: string;
    
    category_name?: string; 
    category_slug?: string;
    subcategory_name?: string;

    media: MediaItem[]; 
    amenities: AmenityItem[]; 
    room_types: RoomType[]; 
    thumbnail_image?: string; 
    
    average_rating: number | string; 
    total_reviews: number; 
    latitude?: number;
    longitude?: number;
}

// Map icon names ke komponen Lucide
const iconMap: { [key: string]: React.ElementType } = {
    Wifi, ParkingSquare, UtensilsCrossed, Bell, Snowflake, Dumbbell, Coffee, Dog, Tv, Bath, 
    ShowerHead, Check, Building, Utensils, Car, Briefcase, DoorClosed, Ruler, BedDouble, 
    Users, Award, MapPin, Camera, Play, Clock, AirVent
};

const getAmenityIcon = (iconName: string): React.ElementType => {
    return iconMap[iconName] || Check;
};

const getCategoryIcon = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'akomodasi': return Building;
        case 'kuliner': return Utensils;
        case 'transportasi': return Car;
        case 'bisnis': return Briefcase;
        default: return Building;
    }
};

const getCategoryColor = (category: string) => {
    switch (category?.toLowerCase()) {
        case 'akomodasi': return 'from-blue-500 to-blue-600';
        case 'kuliner': return 'from-orange-500 to-red-500';
        case 'wisata': return 'from-green-500 to-emerald-600';
        case 'hiburan': return 'from-purple-500 to-pink-500';
        case 'transportasi': return 'from-indigo-500 to-blue-500';
        case 'bisnis': return 'from-gray-600 to-gray-700';
        default: return 'from-blue-500 to-blue-600';
    }
};

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
};

const dummyRatingBreakdown = {
    kebersihan: 4.8, 
    lokasi: 4.5, 
    staf: 4.6, 
    fasilitas: 4.9,
};

export default function PreviewAccommodationPage() {
    const router = useRouter();
    const params = useParams();
    const itemId = params?.id as string;

    const [item, setItem] = useState<BusinessDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [relatedItems, setRelatedItems] = useState<BusinessDetail[]>([]);
    const [mapUrl, setMapUrl] = useState('');

    useEffect(() => {
        const fetchItemDetail = async () => {
            if (!itemId) return;
            
            try {
                setLoading(true);
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
                
                const itemRes = await fetch(`${apiUrl}/api/businesses/${itemId}`); 
                const itemJson = await itemRes.json();
                
                if (itemJson.success && itemJson.data) {
                    const data: BusinessDetail = itemJson.data;
                    setItem(data);
                    
                    if (data.latitude && data.longitude) {
                        setMapUrl(`https://maps.google.com/maps?q=${data.latitude},${data.longitude}&z=15&output=embed`);
                    }

                    if (data.category_slug) {
                        const relatedRes = await fetch(`${apiUrl}/api/businesses/related?category_slug=${data.category_slug}&limit=4&exclude=${itemId}`);
                        const relatedJson = await relatedRes.json();
                        if (relatedJson.success && Array.isArray(relatedJson.data)) {
                            setRelatedItems(relatedJson.data);
                        }
                    }
                } else {
                    setError("Item tidak ditemukan");
                }
            } catch (err) {
                console.error("Error fetching item detail:", err);
                setError("Terjadi kesalahan saat memuat data");
            } finally {
                setLoading(false);
            }
        };

        fetchItemDetail();
    }, [itemId]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const nextMedia = () => {
        if (item?.media) setCurrentMediaIndex((prev) => (prev + 1) % item.media.length);
    };

    const prevMedia = () => {
        if (item?.media) setCurrentMediaIndex((prev) => (prev - 1 + item.media.length) % item.media.length);
    };

    const handleShare = async () => {
        setShowShareModal(true);
    };

    const handleContact = () => { 
        if (item?.phone) window.open(`tel:${item.phone}`, '_self'); 
    };

    const handleEmail = () => { 
        if (item?.email) window.open(`mailto:${item.email}`, '_self'); 
    };

    const handleWebsite = () => { 
        if (item?.website) {
            const url = item.website.startsWith('http') ? item.website : `https://${item.website}`;
            window.open(url, '_blank');
        }
    };

    const handleEdit = () => {
        router.push(`/admin/businesses/edit/akomodasi/${itemId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Memuat data...</p>
                </div>
            </div>
        );
    }

    if (error || !item) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                    <p className="text-gray-600 mb-6">{error || "Item tidak ditemukan"}</p>
                    <button 
                        onClick={() => router.back()}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Kembali
                    </button>
                </div>
            </div>
        );
    }

    const CategoryIcon = getCategoryIcon(item.category_name || '');
    const isAccommodation = item.category_name?.toLowerCase() === 'akomodasi';
    const media = item.media || [];
    const displayedMedia = media[currentMediaIndex];
    const numericRating = parseFloat(item.average_rating as string) || 0;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header dengan tombol Edit */}
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
                                <h1 className="text-xl font-bold text-gray-800 truncate max-w-md">
                                    {item.name}
                                </h1>
                                <p className="text-sm text-gray-500">{item.category_name} • Preview Mode</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleEdit}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                <span className="hidden sm:inline">Edit</span>
                            </button>
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className={`p-2 rounded-full transition-colors ${
                                    isFavorite ? 'bg-red-100 text-red-600' : 'hover:bg-gray-100'
                                }`}
                            >
                                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                            </button>
                            <button
                                onClick={handleShare}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Media Gallery */}
                        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                            <div className="relative">
                                {media.length > 0 ? (
                                    <div className="relative h-96 overflow-hidden">
                                        <Image
                                            src={
                                                displayedMedia.file_path?.startsWith("http")
                                                    ? displayedMedia.file_path
                                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${displayedMedia.file_path}`
                                            }
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 66vw"
                                            className="object-cover"
                                        />
                                        
                                        {displayedMedia.file_type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                <button className="bg-white/90 hover:bg-white rounded-full p-4 transition-colors">
                                                    <Play className="w-8 h-8 text-gray-800" />
                                                </button>
                                            </div>
                                        )}

                                        {media.length > 1 && (
                                            <>
                                                <button
                                                    onClick={prevMedia}
                                                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={nextMedia}
                                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 transition-colors"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                ) : item.thumbnail_image ? (
                                    <div className="relative h-96 overflow-hidden">
                                        <Image
                                            src={
                                                item.thumbnail_image?.startsWith("http")
                                                    ? item.thumbnail_image
                                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${item.thumbnail_image}`
                                            }
                                            alt={item.name}
                                            fill
                                            sizes="(max-width: 768px) 100vw, 66vw"
                                            className="object-cover"
                                        />
                                    </div>
                                ) : (
                                    <div className="h-96 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                                        <Camera className="w-16 h-16 text-gray-400" />
                                    </div>
                                )}

                                {media.length > 0 && (
                                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                                        {currentMediaIndex + 1} / {media.length}
                                    </div>
                                )}
                            </div>

                            {/* Thumbnail Navigation */}
                            {media.length > 1 && (
                                <div className="p-4 flex gap-2 overflow-x-auto">
                                    {media.map((mediaItem, index) => (
                                        <button
                                            key={mediaItem.id}
                                            onClick={() => setCurrentMediaIndex(index)}
                                            className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                                                currentMediaIndex === index ? 'border-blue-500' : 'border-gray-200'
                                            }`}
                                        >
                                            <Image
                                                src={
                                                    mediaItem.file_path?.startsWith("http")
                                                        ? mediaItem.file_path
                                                        : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${mediaItem.file_path}`
                                                }
                                                alt={`${item.name} ${index + 1}`}
                                                fill
                                                className="object-cover"
                                            />
                                            {mediaItem.file_type === 'video' && (
                                                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                    <Play className="w-4 h-4 text-white" />
                                                </div>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        
                        {/* Details & Fasilitas */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm mb-3 bg-gradient-to-r ${getCategoryColor(item.category_name || '')}`}>
                                        <CategoryIcon className="w-4 h-4" />
                                        {item.category_name}
                                        {item.subcategory_name && <span>• {item.subcategory_name}</span>}
                                    </div>
                                    
                                    <h2 className="text-3xl font-bold text-gray-800 mb-2">{item.name}</h2>
                                    
                                    <div className="flex items-center gap-2 text-gray-600 mb-4">
                                        <MapPin className="w-5 h-5" />
                                        <p className="text-base">{item.address}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-1 bg-yellow-50 px-3 py-2 rounded-xl">
                                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                                    <span className="font-bold text-lg">
                                        {numericRating > 0 ? numericRating.toFixed(1) : 'N/A'}
                                    </span>
                                    <span className="text-gray-500 text-sm">({item.total_reviews || 0})</span>
                                </div>
                            </div>

                            <hr className="my-6"/>

                            {item.description && (
                                <div className="mb-6">
                                    <h3 className="font-bold text-gray-800 text-lg mb-3">Tentang {item.name}</h3>
                                    <p className="text-gray-600 leading-relaxed">{item.description}</p>
                                </div>
                            )}
                            
                            {item.amenities?.length > 0 && (
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg mb-4">Fasilitas</h3>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                        {item.amenities.map((amenity: AmenityItem, index: number) => {
                                            const AmenityIcon = getAmenityIcon(amenity.icon);
                                            return (
                                                <div 
                                                    key={index} 
                                                    className={`flex items-center gap-3 p-3 border rounded-lg ${
                                                        amenity.is_available 
                                                            ? 'border-blue-100 bg-blue-50' 
                                                            : 'border-gray-200 text-gray-400 line-through'
                                                    }`}
                                                >
                                                    <AmenityIcon className="w-5 h-5 flex-shrink-0" />
                                                    <span className="text-sm font-medium">{amenity.name}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                        
                        {/* Kategori Kamar */}
                        {isAccommodation && item.room_types?.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Tipe Kamar Tersedia</h3>
                                <div className="space-y-6">
                                    {item.room_types.map((room: RoomType, index: number) => (
                                        <div key={index} className="border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 transition-all">
                                            <div className="md:flex">
                                                <div className="relative w-full h-56 md:w-1/3 md:h-auto">
                                                    {room.image_url ? (
                                                        <Image 
                                                            src={
                                                                room.image_url.startsWith("http")
                                                                    ? room.image_url
                                                                    : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${room.image_url}`
                                                            }
                                                            alt={room.name} 
                                                            fill 
                                                            className="object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                            <BedDouble className="w-12 h-12 text-gray-400" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-6 flex-1 flex flex-col justify-between">
                                                    <div>
                                                        <h4 className="text-xl font-bold text-gray-800 mb-2">{room.name}</h4>
                                                        <p className="text-gray-600 text-sm mb-4">{room.description}</p>
                                                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                                <Users className="w-4 h-4 text-blue-600" /> 
                                                                <span>{room.max_occupancy} Tamu</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                                <Ruler className="w-4 h-4 text-green-600" /> 
                                                                <span>{room.size_sqm} m²</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 bg-gray-50 px-3 py-2 rounded-lg">
                                                                <BedDouble className="w-4 h-4 text-purple-600" /> 
                                                                <span className="capitalize">{room.bed_type}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6 flex items-center justify-between">
                                                        <div>
                                                            <p className="text-sm text-gray-500">Harga per malam</p>
                                                            <p className="text-2xl font-bold text-blue-600">
                                                                {formatPrice(room.base_price)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lokasi */}
                        {item.latitude && item.longitude && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-4">Lokasi</h3>
                                <div className="relative h-80 rounded-xl overflow-hidden mb-4">
                                    <iframe
                                        width="100%"
                                        height="100%"
                                        src={mapUrl}
                                        frameBorder="0"
                                        style={{ border: 0 }}
                                        allowFullScreen
                                        aria-hidden="false"
                                        tabIndex={0}
                                    ></iframe>
                                </div>
                                <p className="text-gray-600">
                                    <MapPin className="w-4 h-4 inline mr-2" />
                                    {item.address}
                                </p>
                            </div>
                        )}
                        
                        {/* Ulasan & Penilaian */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">Penilaian Tamu</h3>
                            <div className="grid grid-cols-2 gap-6">
                                {Object.entries(dummyRatingBreakdown).map(([key, value]) => (
                                    <div key={key}>
                                        <p className="text-sm font-medium text-gray-700 capitalize mb-2">{key}</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 bg-gray-200 rounded-full h-3">
                                                <div 
                                                    className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all" 
                                                    style={{ width: `${(value as number) * 20}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-base font-bold text-gray-800 min-w-[2.5rem]">{value.toFixed(1)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Related Items */}
                        {relatedItems.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-sm p-6">
                                <h3 className="text-xl font-bold text-gray-800 mb-6">Rekomendasi Lainnya</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {relatedItems.map((relatedItem) => (
                                        <div
                                            key={relatedItem.id}
                                            onClick={() => router.push(`/admin/businesses/preview/akomodasi/${relatedItem.id}`)}
                                            className="flex gap-4 p-4 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                        >
                                            <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                                                {relatedItem.thumbnail_image ? (
                                                    <Image
                                                        src={
                                                            relatedItem.thumbnail_image?.startsWith("http")
                                                                ? relatedItem.thumbnail_image
                                                                : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/uploads/${relatedItem.thumbnail_image}`
                                                        }
                                                        alt={relatedItem.name}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                                        <Camera className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-semibold text-gray-800 truncate">{relatedItem.name}</h4>
                                                <p className="text-xs text-gray-500 mt-1">{relatedItem.category_name}</p>
                                                <div className="flex items-center gap-1 mt-2">
                                                    <MapPin className="w-3 h-3 text-gray-400" />
                                                    <span className="text-xs text-gray-500 truncate">{relatedItem.address}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Contact Information */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Kontak</h3>
                            
                            <div className="space-y-3">
                                {item.phone && (
                                    <button
                                        onClick={handleContact}
                                        className="w-full flex items-center gap-3 p-4 border-2 border-blue-200 rounded-xl hover:bg-blue-50 transition-colors text-left"
                                    >
                                        <div className="bg-blue-100 p-3 rounded-lg">
                                            <Phone className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-medium">Telepon</p>
                                            <p className="font-semibold text-gray-800">{item.phone}</p>
                                        </div>
                                    </button>
                                )}

                                {item.email && (
                                    <button
                                        onClick={handleEmail}
                                        className="w-full flex items-center gap-3 p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors text-left"
                                    >
                                        <div className="bg-green-100 p-3 rounded-lg">
                                            <Mail className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-500 font-medium">Email</p>
                                            <p className="font-semibold text-gray-800 truncate">
                                                {item.email}
                                            </p>
                                        </div>
                                    </button>
                                )}

                                {item.website && (
                                    <button
                                        onClick={handleWebsite}
                                        className="w-full flex items-center gap-3 p-4 border-2 border-purple-200 rounded-xl hover:bg-purple-50 transition-colors text-left"
                                    >
                                        <div className="bg-purple-100 p-3 rounded-lg">
                                            <Globe className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-500 font-medium">Website</p>
                                            <p className="font-semibold text-gray-800 truncate">
                                                {item.website}
                                            </p>
                                        </div>
                                        <ExternalLink className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-6">
                                <button 
                                    onClick={() => {
                                        const message = `Halo! Saya tertarik dengan ${item.name}. Bisa minta info lebih lanjut?`;
                                        const phoneNumber = item.phone?.replace(/\D/g, '');
                                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                                        window.open(whatsappUrl, '_blank');
                                    }}
                                    className="bg-green-600 text-white px-4 py-3 rounded-xl hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                    WhatsApp
                                </button>
                                <button 
                                    onClick={() => setIsFavorite(!isFavorite)}
                                    className={`border-2 px-4 py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2 ${
                                        isFavorite 
                                            ? 'border-red-300 bg-red-50 text-red-600' 
                                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                    }`}
                                >
                                    <Bookmark className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                                    {isFavorite ? 'Tersimpan' : 'Simpan'}
                                </button>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Tambahan</h3>
                            
                            <div className="space-y-4">
                                {item.created_at && (
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                        <Calendar className="w-5 h-5 text-gray-400" />
                                        <div>
                                            <p className="text-sm text-gray-500">Terdaftar sejak</p>
                                            <p className="font-semibold text-gray-800">{formatDate(item.created_at)}</p>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                                    <Users className="w-5 h-5 text-gray-400" />
                                    <div>
                                        <p className="text-sm text-gray-500">Pengunjung bulan ini</p>
                                        <p className="font-semibold text-gray-800">2.3k orang</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <Award className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="text-sm text-gray-500">Status</p>
                                        <p className="font-semibold text-green-600">Terverifikasi</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Admin Actions */}
                        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl">
                            <h3 className="text-lg font-bold mb-3">Mode Preview Admin</h3>
                            <p className="text-sm opacity-90 mb-4">
                                Anda sedang melihat preview halaman ini. Untuk mengedit data, klik tombol di bawah.
                            </p>
                            <button 
                                onClick={handleEdit}
                                className="w-full bg-white text-blue-600 px-4 py-3 rounded-xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
                            >
                                <Edit className="w-5 h-5" />
                                Edit Bisnis
                            </button>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-2xl shadow-sm p-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Statistik</h3>
                            
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <Star className="w-4 h-4 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-700">Rating</span>
                                    </div>
                                    <span className="font-bold text-blue-600">
                                        {numericRating > 0 ? numericRating.toFixed(1) : 'N/A'}
                                    </span>
                                </div>
                                
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                    <div className="flex items-center gap-2">
                                        <MessageCircle className="w-4 h-4 text-green-600" />
                                        <span className="text-sm font-medium text-gray-700">Ulasan</span>
                                    </div>
                                    <span className="font-bold text-green-600">{item.total_reviews || 0}</span>
                                </div>
                                
                                {isAccommodation && item.room_types && (
                                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <BedDouble className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-gray-700">Tipe Kamar</span>
                                        </div>
                                        <span className="font-bold text-purple-600">{item.room_types.length}</span>
                                    </div>
                                )}
                                
                                {item.amenities && (
                                    <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                                        <div className="flex items-center gap-2">
                                            <Check className="w-4 h-4 text-orange-600" />
                                            <span className="text-sm font-medium text-gray-700">Fasilitas</span>
                                        </div>
                                        <span className="font-bold text-orange-600">{item.amenities.length}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Share Modal */}
            {showShareModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Bagikan</h3>
                        <div className="space-y-3">
                            <button
                                onClick={() => {
                                    navigator.clipboard.writeText(window.location.href);
                                    setShowShareModal(false);
                                    alert('Link berhasil disalin!');
                                }}
                                className="w-full flex items-center gap-3 p-4 border-2 border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                            >
                                <div className="bg-gray-100 p-3 rounded-lg">
                                    <Share2 className="w-5 h-5 text-gray-600" />
                                </div>
                                <span className="font-medium">Salin Link</span>
                            </button>
                            <button
                                onClick={() => {
                                    window.open(`https://wa.me/?text=${encodeURIComponent(`${item.name} - ${window.location.href}`)}`, '_blank');
                                    setShowShareModal(false);
                                }}
                                className="w-full flex items-center gap-3 p-4 border-2 border-green-200 rounded-xl hover:bg-green-50 transition-colors"
                            >
                                <div className="bg-green-100 p-3 rounded-lg">
                                    <MessageCircle className="w-5 h-5 text-green-600" />
                                </div>
                                <span className="font-medium">Bagikan via WhatsApp</span>
                            </button>
                        </div>
                        <button
                            onClick={() => setShowShareModal(false)}
                            className="w-full mt-4 py-3 text-gray-500 hover:text-gray-700 font-medium transition-colors"
                        >
                            Tutup
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}