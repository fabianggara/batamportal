// frontend/src/app/(site)/category/[categoriesName]/detail/[id]/page.tsx
'use client'

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter, useParams } from 'next/navigation';
import { 
    ChevronLeft, ChevronRight, MapPin, Phone, Mail, Globe, Calendar, Share2, Heart, Star, Camera, Play, Clock, Users, Award, Building, Utensils, Car, Briefcase, ArrowLeft, ExternalLink, MessageCircle, Bookmark, MoreVertical,
    Wifi, Bath, Bell, Snowflake, ParkingSquare, UtensilsCrossed, Dumbbell, Coffee, AirVent, Dog, Tv, BedDouble, Ruler, DoorClosed, ShowerHead, CreditCard, Check, TrendingUp, ChevronDown, ArrowRight,
    Utensils as UtensilsIcon // Mengganti UtensilsCrossed agar tidak konflik
} from 'lucide-react';

        interface Item {
        id: number;
        name: string; 
        slug: string;
        description: string | null;
        address: string;
        phone: string | null;
        email: string | null;
        website: string | null;
        category: string | null;
        subcategory: string | null;
        thumbnail_image: string | null;
        average_rating: number; 
        total_reviews: number;  
        created_at: string;
        updated_at?: string;
        }

        interface MediaItem {
        id: number;
        media_path: string;
        media_type: 'photo' | 'video';
        }

    // Akomodasi/Fitur Spesifik
    amenities: AmenityItem[]; // Dari join business_amenities & amenities
    room_types: RoomType[]; // Dari tabel room_types
    latitude?: number;
    longitude?: number;

    // Rating (dari cache di tabel businesses)
    average_rating: number; 
    total_reviews: number; 
    // Asumsi: Breakdown rating harus di-fetch dari /reviews endpoint jika ada
}

interface MediaItem {
    id: number;
    business_id: number;
    file_path: string; // Menggantikan media_path
    file_type: 'image' | 'video'; // Menggantikan media_type
}

interface AmenityItem {
    id: number;
    name: string; // Nama fasilitas (WiFi Gratis)
    icon: string; // Icon Lucide (string)
    is_available: boolean; // Dari business_amenities
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
// -----------------------------------------------------

// Map string icon name (dari tabel amenities) ke komponen Lucide React
const iconMap: { [key: string]: React.ElementType } = {
    Wifi, ParkingSquare, UtensilsCrossed: UtensilsIcon, Bell, Snowflake, Dumbbell, 
    Coffee, Dog, Tv, Bath, ShowerHead, Check, Utensils: Utensils, // Tambahkan semua icon dari amenities
    DoorClosed: DoorClosed,
    Ruler: Ruler,
    // ...
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

export default function ItemDetailPage() {
    const router = useRouter();
    const params = useParams();
    const itemId = params?.id as string;
    const categoriesName = params?.categoriesName as string;

    const [item, setItem] = useState<Item | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [relatedItems, setRelatedItems] = useState<Item[]>([]);
    const [dummyAccommodationData, setDummyAccommodationData] = useState<any>(null);
    const [mapUrl, setMapUrl] = useState('');
    
    // Booking states
    const [checkInDate, setCheckInDate] = useState('2025-09-28');
    const [checkOutDate, setCheckOutDate] = useState('2025-09-29');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);

    // Get both categoriesName and id from params
    const categoriesName = params?.categoriesName as string;

    // Helper functions for booking
    const formatDateDisplay = (dateString: string) => {
        const date = new Date(dateString);
        const days = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
        
        return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]}`;
    };

    const calculateNights = () => {
        const checkIn = new Date(checkInDate);
        const checkOut = new Date(checkOutDate);
        const timeDiff = checkOut.getTime() - checkIn.getTime();
        return Math.ceil(timeDiff / (1000 * 3600 * 24));
    };

    useEffect(() => {
        const fetchItemDetail = async () => {
        if (!itemId) return;
        
        try {
            setLoading(true);

            const token = localStorage.getItem('authToken'); 
            
            const itemRes = await fetch(`http://localhost:5000/api/businesses/${itemId}`, {
                headers: {
                    'Authorization': `Bearer ${token}` // <-- Tambahkan baris ini
                }
                });
            const itemJson = await itemRes.json();
            
            if (itemJson.success) {
                setItem(itemJson.data);
                
                // Fetch media
                try {
                    const mediaRes = await fetch(`http://localhost:5000/api/businesses/${itemId}/media`);
                    const mediaJson = await mediaRes.json();
                    if (mediaJson.success) {
                        setMedia(mediaJson.data);
                    }
                } catch (mediaErr) {
                    console.log("No media found for this item");
                    setMedia([]);
                }

                // Fetch related items
                if (itemJson.data.category) {
                    try {
                        const relatedRes = await fetch(`http://localhost:5000/api/businesses/category/${encodeURIComponent(itemJson.data.category)}?limit=4&exclude=${itemId}`);
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
    }, [itemId, categoriesName]);

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleShare = async () => {
        if (navigator.share && item) {
        try {
            await navigator.share({
            title: item.name,
            text: item.description || '',
            url: window.location.href
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
        } else {
            setShowShareModal(true);
        }
    };

    const handlePhone = () => {
        if (item?.phone) {
        window.open(`tel:${item.phone}`, '_self');
        }
    };

    const handleEmail = () => {
        if (item?.email) {
        window.open(`mailto:${item.email}`, '_self');
        }
    };

    const handleWebsite = () => {
        if (item?.website) {
            const url = item.website.startsWith('http') ? item.website : `https://${item.website}`;
            window.open(url, '_blank');
        }
    };

    const nextMedia = () => {
        if (item?.media) setCurrentMediaIndex((prev) => (prev + 1) % item.media.length);
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
    };

    // const handleBooking = () => {
    //     // Redirect to booking form with booking data
    //     const bookingParams = new URLSearchParams({
    //         itemId: item?.id?.toString() || '',
    //         hotelName: item?.place_name || '',
    //         checkIn: checkInDate,
    //         checkOut: checkOutDate,
    //         guests: guests.toString(),
    //         rooms: rooms.toString()
    //     });
        
    //     router.push(`/form/accommodationBook?${bookingParams.toString()}`);
    // };

    const handleBooking = () => {
        const bookingParams = new URLSearchParams({
            itemId: item?.id?.toString() || '',
            hotelName: item?.name || '',
            categoryName: categoriesName,
            checkIn: checkInDate,
            checkOut: checkOutDate,
            guests: guests.toString(),
            rooms: rooms.toString()
        });
        
        router.push(`/form/accommodationBook?${bookingParams.toString()}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
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

    return (
        <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                <button
                    onClick={() => router.push(`/category/${categoriesName}`)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali ke {categoriesName}
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 truncate max-w-md">
                    {item.name}
                    </h1>
                    <p className="text-sm text-gray-500">{item.category_name}</p>
                </div>
                </div>
                
                <div className="flex items-center gap-2">
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
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <MoreVertical className="w-5 h-5" />
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Booking Bar for Accommodation */}
        {isAccommodation && (
                <div className="bg-white border-b border-gray-200 py-4">
                    <div className="max-w-6xl mx-auto px-4">
                        <div className="bg-blue-50 rounded-2xl p-6 border border-blue-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                {/* Check-in Date */}
                                <div>
                                    <label className="text-sm font-semibold text-blue-700 mb-2 block">Check-in</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                        <input
                                            type="date"
                                            value={checkInDate}
                                            onChange={(e) => setCheckInDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Check-out Date */}
                                <div>
                                    <label className="text-sm font-semibold text-blue-700 mb-2 block">Check-out</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                        <input
                                            type="date"
                                            value={checkOutDate}
                                            onChange={(e) => setCheckOutDate(e.target.value)}
                                            className="w-full pl-10 pr-4 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                                        />
                                    </div>
                                </div>

                                {/* Guests & Rooms */}
                                <div>
                                    <label className="text-sm font-semibold text-blue-700 mb-2 block">Tamu & Kamar</label>
                                    <div className="relative">
                                        <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                        <select
                                            value={`${guests}-${rooms}`}
                                            onChange={(e) => {
                                                const [g, r] = e.target.value.split('-').map(Number);
                                                setGuests(g);
                                                setRooms(r);
                                            }}
                                            className="w-full pl-10 pr-10 py-3 border border-blue-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white appearance-none"
                                        >
                                            <option value="1-1">1 tamu, 1 kamar</option>
                                            <option value="2-1">2 tamu, 1 kamar</option>
                                            <option value="3-1">3 tamu, 1 kamar</option>
                                            <option value="4-1">4 tamu, 1 kamar</option>
                                            <option value="2-2">2 tamu, 2 kamar</option>
                                            <option value="4-2">4 tamu, 2 kamar</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500" />
                                    </div>
                                </div>

                                {/* Search Button */}
                                <div className="flex items-end">
                                    <button 
                                        onClick={handleBooking}
                                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
                                    >
                                        Konfirm Pencarian
                                    </button>
                                </div>
                            </div>
                            
                            <div className="mt-4 flex items-center gap-4 text-sm text-blue-700">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span>{calculateNights()} malam</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{guests} tamu dalam {rooms} kamar</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
                {/* Media Gallery */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="relative">
                    {media.length > 0 ? (
                    <div className="relative h-80 overflow-hidden">
                        <Image
                        src={
                            media[currentMediaIndex]?.file_path?.startsWith("http")
                            ? media[currentMediaIndex].file_path
                            : `http://localhost:5000/uploads/${media[currentMediaIndex]?.file_path}`
                        }
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 66vw"
                        className="object-cover"
                        />
                        
                        {media[currentMediaIndex]?.file_type === 'video' && (
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
                    <div className="relative h-80 overflow-hidden">
                        <Image
                            src={
                            item.thumbnail_image?.startsWith("http")
                                ? item.thumbnail_image
                                : `http://localhost:5000/uploads/${item.thumbnail_image}`
                            }
                            alt={item.name || `Gambar untuk ${item.id}`} 
                            fill
                            className="object-cover"
                        />
                        </div>
                    ) : (
                    <div className="h-80 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Camera className="w-16 h-16 text-gray-400" />
                    </div>
                    )}

                    {/* Media Counter */}
                    {(media.length > 1 || item.thumbnail_image) && (
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                        {currentMediaIndex + 1} / {media.length || 1}
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
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            currentMediaIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        >
                        <Image
                            src={
                            mediaItem.file_path?.startsWith("http")
                                ? mediaItem.file_path
                                : `http://localhost:5000/uploads/${mediaItem.file_path}`
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
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.name}</h2>
                        
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <p className="text-sm">{item.address}</p>
                        </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="font-semibold">{item?.average_rating || 'N/A'}</span>
                            <span className="text-gray-500 text-sm">({item?.total_reviews || 0} ulasan)</span>
                        </div>
                    </div>

                    <hr className="my-4"/>

                    {item.description && (
                        <div className="pt-4">
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Deskripsi</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                        </div>
                    )}
                    
                    {item.amenities?.length > 0 && (
                        <div className="mt-6">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Fasilitas</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {item.amenities.map((amenity: AmenityItem, index: number) => {
                                    const AmenityIcon = getAmenityIcon(amenity.icon);
                                    return (
                                        <div key={index} className={`flex items-center gap-2 ${!amenity.is_available && 'text-gray-400 line-through'}`}>
                                        <AmenityIcon className="w-5 h-5 flex-shrink-0" />
                                        <span className="text-sm">{amenity.name}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
                
                {/* Kategori Kamar (Hanya untuk Akomodasi) */}
                {isAccommodation && item.room_types?.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Kategori Kamar</h3>
                    <div className="space-y-4">
                        {item.room_types.map((room: RoomType, index: number) => (
                            <div key={index} className="border rounded-lg overflow-hidden md:flex">
                                <div className="relative w-full h-40 md:w-1/3 md:h-auto">
                                    {room.image_url && (
                                        <Image src={room.image_url} alt={room.name} fill className="object-cover" />
                                    )}
                                </div>
                                <div className="p-4 flex flex-col justify-between w-full">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{room.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" /> <span>{room.max_occupancy} Tamu</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Ruler className="w-4 h-4" /> <span>{room.size_sqm} m²</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <BedDouble className="w-4 h-4" /> <span>{room.bed_type}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:pl-4 md:border-l">
                                        <p className="text-sm text-gray-500">Mulai dari</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {formatPrice(room.base_price)}
                                        </p>
                                        <button
                                            onClick={handleBooking}
                                            className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
                                            Pesan Sekarang
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Lokasi & Lingkungan Sekitar */}
                {item.latitude && item.longitude && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Lokasi & Lingkungan Sekitar</h3>
                    <div className="relative h-64 rounded-lg overflow-hidden mb-4">
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
                    <p className="text-sm text-gray-600 mb-4">
                        {item.name} berlokasi di {item.address}
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Tempat terdekat:</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        {dummyAccommodationData.locationInfo.nearby.map((place: any, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                                <span>{place.name}</span>
                                <span className="text-gray-400">{place.distance}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span>Pelabuhan Feri Batam Center</span>
                                <span className="text-gray-400">5.5 km</span>
                            </div>
                        </div>
                    </div>
                )}
                
                {/* Ulasan & Penilaian */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Ulasan & Penilaian</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(ratingBreakdown).map(([key, value]) => (
                            <div key={key}>
                                <p className="text-sm text-gray-500 capitalize">{key}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(value as number) * 20}%` }}></div>
                                    </div>
                                    <span className="text-sm font-semibold">{(value as number).toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Related Items */}
                {relatedItems.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Rekomendasi Lainnya</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedItems.map((relatedItem) => (
                        <div
                        key={relatedItem.id}
                        onClick={() => router.push(`/category/${relatedItem.category}/detail/itemDetail/${relatedItem.id}`)}
                        className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {relatedItem.thumbnail_image ? (
                            <Image
                                src={
                                relatedItem.thumbnail_image?.startsWith("http")
                                    ? relatedItem.thumbnail_image
                                    : `http://localhost:5000/uploads/${relatedItem.thumbnail_image}`
                                }
                                alt={relatedItem.name}
                                fill
                                className="object-cover"
                            />
                            ) : (
                            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                                <Camera className="w-6 h-6 text-gray-400" />
                            </div>
                        ))}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{relatedItem.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{relatedItem.category}</p>
                            <div className="flex items-center gap-1 mt-1">
                            <MapPin className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500 truncate">{relatedItem.address}</span>
                            </div>
                        </div>
                        </div>
                    ))}
                    </div>
                )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Booking Summary for Accommodation */}
                {isAccommodation && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 border-2 border-blue-200">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Ringkasan Pemesanan</h3>
                        
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium">Check-in</span>
                                </div>
                                <span className="font-bold text-blue-800">{formatDateDisplay(checkInDate)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium">Check-out</span>
                                </div>
                                <span className="font-bold text-blue-800">{formatDateDisplay(checkOutDate)}</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Clock className="w-4 h-4 text-green-600" />
                                    <span className="text-sm font-medium">Durasi</span>
                                </div>
                                <span className="font-bold text-green-800">{calculateNights()} malam</span>
                            </div>
                            
                            <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4 text-purple-600" />
                                    <span className="text-sm font-medium">Tamu & Kamar</span>
                                </div>
                                <span className="font-bold text-purple-800">{guests} tamu, {rooms} kamar</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={handleBooking}
                            className="w-full mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-2"
                        >
                            <span>Lanjut ke Pemesanan</span>
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Contact Information */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Kontak</h3>
                
                <div className="space-y-3">
                    {item.phone && (
                    <button
                        onClick={handlePhone}
                        className="w-full flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                        <div className="bg-blue-100 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Telepon</p>
                        <p className="font-semibold text-gray-800">{item.phone}</p>
                        </div>
                    </button>
                    )}

                    {item.email && (
                    <button
                        onClick={handleEmail}
                        className="w-full flex items-center gap-3 p-3 border border-green-200 rounded-lg hover:bg-green-50 transition-colors text-left"
                    >
                        <div className="bg-green-100 p-2 rounded-lg">
                        <Mail className="w-4 h-4 text-green-600" />
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-semibold text-gray-800">
                            {item.email.length > 25 
                                ? `${item.email.substring(0, 25)}...` 
                                : item.email
                            }
                        </p>
                        </div>
                    </button>
                    )}

                    {item.website && (
                    <button
                        onClick={handleWebsite}
                        className="w-full flex items-center gap-3 p-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors text-left"
                    >
                        <div className="bg-purple-100 p-2 rounded-lg">
                        <Globe className="w-4 h-4 text-purple-600" />
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Website</p>
                        <p className="font-semibold text-gray-800 truncate">
                            {item.website.length > 25 
                                ? `${item.website.substring(0, 25)}...` 
                                : item.website
                            }
                        </p>
                        </div>
                        <ExternalLink className="w-4 h-4 text-gray-400" />
                    </button>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                    onClick={() => {
                        const message = `Halo! Saya tertarik dengan ${item.name}. Bisa minta info lebih lanjut?`;
                        const phoneNumber = item.phone?.replace(/\D/g, '');
                        const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
                        window.open(whatsappUrl, '_blank');
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors font-semibold flex items-center justify-center gap-2"
                    >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                    </button>
                    <button 
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`border px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2 ${
                        isFavorite 
                        ? 'border-red-300 bg-red-50 text-red-600' 
                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                    >
                    <Bookmark className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Tersimpan' : 'Simpan'}
                    </button>
                </div>
                </div>

                {/* Additional Info */}
                <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Informasi Tambahan</h3>
                
                <div className="space-y-3">
                    {item.created_at && (
                    <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                        <p className="text-sm text-gray-500">Terdaftar sejak</p>
                        <p className="font-medium">{formatDate(item.created_at)}</p>
                        </div>
                    </div>
                    )}
                    
                    <div className="flex items-center gap-3">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Pengunjung bulan ini</p>
                        <p className="font-medium">2.3k orang</p>
                    </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                    <Award className="w-4 h-4 text-gray-400" />
                    <div>
                        <p className="text-sm text-gray-500">Status</p>
                        <p className="font-medium text-green-600">Terverifikasi</p>
                    </div>
                    </div>
                </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white">
                <h3 className="text-lg font-bold mb-3">Ada pertanyaan?</h3>
                <p className="text-sm opacity-90 mb-4">
                    Hubungi tim support kami untuk bantuan lebih lanjut
                </p>
                <button className="w-full bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                    Hubungi Support
                </button>
                </div>
            </div>
            </div>
        </div>

        {/* Share Modal */}
        {showShareModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
                <h3 className="text-lg font-bold mb-4">Bagikan Item</h3>
                <div className="space-y-3">
                <button
                    onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    setShowShareModal(false);
                    alert('Link berhasil disalin!');
                    }}
                    className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                    <div className="bg-gray-100 p-2 rounded-lg">
                    <Share2 className="w-4 h-4" />
                    </div>
                    Salin Link
                </button>
                <button
                    onClick={() => {
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${item.name} - ${window.location.href}`)}`, '_blank');
                    setShowShareModal(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                >
                    <div className="bg-green-100 p-2 rounded-lg">
                    <MessageCircle className="w-4 h-4 text-green-600" />
                    </div>
                    WhatsApp
                </button>
                </div>
                <button
                onClick={() => setShowShareModal(false)}
                className="w-full mt-4 py-2 text-gray-500 hover:text-gray-700"
                >
                Tutup
                </button>
            </div>
            </div>
        )}
        </div>
    );
}