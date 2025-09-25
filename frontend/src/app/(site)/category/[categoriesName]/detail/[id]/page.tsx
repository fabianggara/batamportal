// frontend/src/app/(site)/itemDetail/[id]/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter, useParams } from 'next/navigation';
import { 
        ChevronLeft, 
        ChevronRight, 
        MapPin,
        Phone,
        Mail,
        Globe,
        Calendar,
        Share2,
        Heart,
        Star,
        Camera,
        Play,
        Clock,
        Users,
        Award,
        Building,
        Utensils,
        Car,
        Briefcase,
        ArrowLeft,
        ExternalLink,
        MessageCircle,
        Bookmark,
        MoreVertical,
        Wifi,
        Bath,
        Bell,
        Snowflake,
        ParkingSquare,
        UtensilsCrossed,
        Dumbbell,
        // SwimmingPool,
        Coffee,
        AirVent,
        Dog,
        Tv,
        BedDouble,
        Ruler,
        DoorClosed,
        ShowerHead,
        CreditCard,
        Check,
        TrendingUp
        } from 'lucide-react';

        interface Submission {
        id: number;
        place_name: string;
        thumbnail_picture?: string;
        email?: string;
        address: string;
        category?: string;
        subcategory?: string;
        description?: string;
        contact?: string;
        website?: string;
        created_at?: string;
        updated_at?: string;
        }

        interface MediaItem {
        id: number;
        submission_id: number;
        media_path: string;
        media_type: 'photo' | 'video';
        created_at: string;
        }

// Dummy Data
const dummyData = {
    'akomodasi-1234': {
        ratings: {
            overall: 4.8,
            count: 256,
            breakdown: {
                kebersihan: 5.0,
                lokasi: 4.9,
                staf: 4.8,
                fasilitas: 4.7,
                kenyamanan: 4.8,
            }
        },
        amenities: [
            { name: 'WiFi Gratis', icon: Wifi, isAvailable: true },
            { name: 'Kolam Renang', icon: Bath, isAvailable: true },
            { name: 'Parkir Gratis', icon: ParkingSquare, isAvailable: true },
            { name: 'Restoran', icon: UtensilsCrossed, isAvailable: true },
            { name: 'Layanan Kamar', icon: Bell, isAvailable: true },
            { name: 'AC', icon: Snowflake, isAvailable: true },
            { name: 'Pusat Kebugaran', icon: Dumbbell, isAvailable: true },
            { name: 'Sarapan Gratis', icon: Coffee, isAvailable: true },
            { name: 'Hewan Peliharaan Diizinkan', icon: Dog, isAvailable: false },
            { name: 'Televisi', icon: Tv, isAvailable: true },
        ],
        roomCategories: [
            { 
                name: 'Standard Twin Room', 
                price: 450000, 
                description: 'Kamar nyaman dengan dua tempat tidur single.',
                size: '20 m²',
                occupants: 2,
                image: 'https://images.unsplash.com/photo-1596436889106-be35e84e97d0?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
            },
            { 
                name: 'Deluxe Double Room', 
                price: 680000, 
                description: 'Kamar luas dengan pemandangan kota dan satu tempat tidur double.',
                size: '28 m²',
                occupants: 2,
                image: 'https://images.unsplash.com/photo-1596394516047-41065147171d?q=80&w=2940&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
            },
            { 
                name: 'Family Suite', 
                price: 950000, 
                description: 'Suite mewah dengan dua kamar tidur terpisah, cocok untuk keluarga.',
                size: '50 m²',
                occupants: 4,
                image: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=2849&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' 
            },
        ],
        locationInfo: {
            lat: 1.142679401310126,
            lng: 104.02058485335047,
            mapQuery: 'Nagoya, Batam, Riau Islands, Indonesia',
            nearby: [
                { name: 'Nagoya Hill Shopping Mall', distance: '1.2 km' },
                { name: 'Pelabuhan Feri Batam Center', distance: '5.5 km' },
                { name: 'Bandara Internasional Hang Nadim', distance: '18 km' },
            ]
        }
    },
    // Bisa tambahkan data dummy untuk kategori lain di sini
    'kuliner-5678': {
        ratings: {
            overall: 4.5,
            count: 128,
            breakdown: {
                kebersihan: 4.8,
                lokasi: 4.5,
                pelayanan: 4.6,
                kualitas_makanan: 4.9,
            }
        },
        amenities: [],
        roomCategories: [],
        locationInfo: {
            lat: -0.900987,
            lng: 104.450321,
            mapQuery: 'Nagoya, Batam, Riau Islands, Indonesia',
            nearby: []
        }
    },
    'transportasi-9012': {
        ratings: {
            overall: 4.2,
            count: 55,
            breakdown: {
                kebersihan: 4.0,
                lokasi: 4.5,
                pelayanan: 4.3,
                harga: 4.1,
            }
        },
        amenities: [],
        roomCategories: [],
        locationInfo: {
            lat: -0.900987,
            lng: 104.450321,
            mapQuery: 'Nagoya, Batam, Riau Islands, Indonesia',
            nearby: []
        }
    },
};

const getAmenityIcon = (name: string) => {
    switch (name) {
        case 'WiFi Gratis': return Wifi;
        case 'Kolam Renang': return Bath;
        case 'Parkir Gratis': return ParkingSquare;
        case 'Restoran': return UtensilsCrossed;
        case 'Layanan Kamar': return DoorClosed;
        case 'AC': return Snowflake;
        case 'Pusat Kebugaran': return Dumbbell;
        case 'Sarapan Gratis': return Coffee;
        case 'Hewan Peliharaan Diizinkan': return Dog;
        case 'Televisi': return Tv;
        case 'Kamar Mandi Pribadi': return Bath;
        default: return Check;
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
    const itemId = params?.id;

    const [item, setItem] = useState<Submission | null>(null);
    const [media, setMedia] = useState<MediaItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [isFavorite, setIsFavorite] = useState(false);
    const [showShareModal, setShowShareModal] = useState(false);
    const [relatedItems, setRelatedItems] = useState<Submission[]>([]);
    const [dummyAccommodationData, setDummyAccommodationData] = useState<any>(null);
    const [mapUrl, setMapUrl] = useState('');

    useEffect(() => {
        const fetchItemDetail = async () => {
        if (!itemId) return;
        
        try {
            setLoading(true);
            
            const itemRes = await fetch(`http://localhost:5000/api/submissions/${itemId}`);
            const itemJson = await itemRes.json();
            
            if (itemJson.success) {
                setItem(itemJson.data);
                
                // Fetch media
                try {
                    const mediaRes = await fetch(`http://localhost:5000/api/submissions/${itemId}/media`);
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
                        const relatedRes = await fetch(`http://localhost:5000/api/submissions/category/${encodeURIComponent(itemJson.data.category)}?limit=4&exclude=${itemId}`);
                        const relatedJson = await relatedRes.json();
                        if (relatedJson.success) {
                            setRelatedItems(relatedJson.data);
                        }
                    } catch (relatedErr) {
                        console.log("No related items found");
                        setRelatedItems([]);
                    }
                }

                // Get dummy data if category is 'akomodasi'
                if (itemJson.data.category?.toLowerCase() === 'akomodasi') {
                    const data = dummyData['akomodasi-1234'];
                    setDummyAccommodationData(data);
                    if (data.locationInfo) {
                        const { lat, lng } = data.locationInfo;
                        setMapUrl(`https://maps.google.com/maps?q=${lat},${lng}&z=15&output=embed`);
                    }
                } else {
                    // Get dummy data for other categories if needed
                    setDummyAccommodationData(null);
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

    const formatDate = (dateString: string) => {
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
            title: item.place_name,
            text: item.description,
            url: window.location.href
            });
        } catch (err) {
            console.log('Error sharing:', err);
        }
        } else {
        setShowShareModal(true);
        }
    };

    const handleContact = () => {
        if (item?.contact) {
        window.open(`tel:${item.contact}`, '_self');
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
        setCurrentMediaIndex((prev) => (prev + 1) % media.length);
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prev) => (prev - 1 + media.length) % media.length);
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

    const CategoryIcon = getCategoryIcon(item.category || '');

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
                    <h1 className="text-xl font-bold text-gray-800 truncate max-w-md">
                    {item.place_name}
                    </h1>
                    <p className="text-sm text-gray-500">{item.category}</p>
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
                            media[currentMediaIndex]?.media_path?.startsWith("http")
                            ? media[currentMediaIndex].media_path
                            : `http://localhost:5000/uploads/${media[currentMediaIndex]?.media_path}`
                        }
                        alt={item.place_name}
                        fill
                        className="object-cover"
                        />
                        
                        {media[currentMediaIndex]?.media_type === 'video' && (
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
                    ) : item.thumbnail_picture ? (
                    <div className="relative h-80 overflow-hidden">
                        <Image
                        src={
                            item.thumbnail_picture?.startsWith("http")
                            ? item.thumbnail_picture
                            : `http://localhost:5000/uploads/${item.thumbnail_picture}`
                        }
                        alt={item.place_name}
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
                    {media.length > 1 && (
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
                        className={`relative flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                            currentMediaIndex === index ? 'border-blue-500' : 'border-gray-200'
                        }`}
                        >
                        <Image
                            src={
                            mediaItem.media_path?.startsWith("http")
                                ? mediaItem.media_path
                                : `http://localhost:5000/uploads/${mediaItem.media_path}`
                            }
                            alt={`${item.place_name} ${index + 1}`}
                            fill
                            className="object-cover"
                        />
                        {mediaItem.media_type === 'video' && (
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
                        <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-white text-sm mb-3 bg-gradient-to-r ${getCategoryColor(item.category || '')}`}>
                            <CategoryIcon className="w-4 h-4" />
                            {item.category}
                            {item.subcategory && <span>• {item.subcategory}</span>}
                        </div>
                        
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">{item.place_name}</h2>
                        
                        <div className="flex items-center gap-2 text-gray-600 mb-4">
                            <MapPin className="w-4 h-4" />
                            <p className="text-sm">{item.address}</p>
                        </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <span className="font-semibold">{dummyAccommodationData?.ratings?.overall || 'N/A'}</span>
                            <span className="text-gray-500 text-sm">({dummyAccommodationData?.ratings?.count || 0})</span>
                        </div>
                    </div>

                    <hr className="my-4"/>

                    {item.description && (
                        <div className="pt-4">
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Deskripsi</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                        </div>
                    )}
                    
                    {dummyAccommodationData?.amenities && (
                        <div className="mt-6">
                        <h3 className="font-bold text-gray-800 text-lg mb-4">Fasilitas</h3>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {dummyAccommodationData.amenities.map((amenity: any, index: number) => {
                                const AmenityIcon = getAmenityIcon(amenity.name);
                                return (
                                    <div key={index} className={`flex items-center gap-2 ${!amenity.isAvailable && 'text-gray-400 line-through'}`}>
                                    <AmenityIcon className="w-5 h-5 flex-shrink-0" />
                                    <span className="text-sm">{amenity.name}</span>
                                    </div>
                                )
                            })}
                        </div>
                        </div>
                    )}
                </div>
                
                {/* Kategori Kamar */}
                {dummyAccommodationData?.roomCategories && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Kategori Kamar</h3>
                    <div className="space-y-4">
                        {dummyAccommodationData.roomCategories.map((room: any, index: number) => (
                            <div key={index} className="border rounded-lg overflow-hidden md:flex">
                                <div className="relative w-full h-40 md:w-1/3 md:h-auto">
                                    <Image src={room.image} alt={room.name} fill className="object-cover" />
                                </div>
                                <div className="p-4 flex flex-col justify-between w-full">
                                    <div>
                                        <h4 className="font-semibold text-gray-800">{room.name}</h4>
                                        <p className="text-sm text-gray-500 mt-1">{room.description}</p>
                                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" /> <span>{room.occupants} Tamu</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Ruler className="w-4 h-4" /> <span>{room.size}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-4 md:mt-0 md:pl-4 md:border-l">
                                        <p className="text-sm text-gray-500">Mulai dari</p>
                                        <p className="text-xl font-bold text-blue-600">
                                            {formatPrice(room.price)}
                                        </p>
                                        <button className="mt-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm">
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
                {dummyAccommodationData?.locationInfo && (
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
                        {item.place_name} berlokasi di {item.address}
                    </p>
                    <h4 className="font-semibold text-gray-800 mb-2">Tempat terdekat:</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                        {dummyAccommodationData.locationInfo.nearby.map((place: any, index: number) => (
                            <div key={index} className="flex justify-between items-center">
                                <span>{place.name}</span>
                                <span className="text-gray-400">{place.distance}</span>
                            </div>
                        ))}
                    </div>
                    </div>
                )}
                
                {/* Ulasan & Penilaian */}
                {dummyAccommodationData?.ratings?.breakdown && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Ulasan & Penilaian</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {Object.entries(dummyAccommodationData.ratings.breakdown).map(([key, value]) => (
                            <div key={key}>
                                <p className="text-sm text-gray-500 capitalize">{key}</p>
                                <div className="flex items-center gap-2">
                                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                                        <div className="bg-yellow-400 h-2.5 rounded-full" style={{ width: `${(value as number) * 20}%` }}></div>
                                    </div>
                                    <span className="text-sm font-semibold">{value.toFixed(1)}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    </div>
                )}

                {/* Related Items */}
                {relatedItems.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">Rekomendasi Lainnya</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {relatedItems.map((relatedItem) => (
                        <div
                        key={relatedItem.id}
                        onClick={() => router.push(`/itemDetail/${relatedItem.id}`)}
                        className="flex gap-3 p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                        >
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                            {relatedItem.thumbnail_picture ? (
                            <Image
                                src={
                                relatedItem.thumbnail_picture?.startsWith("http")
                                    ? relatedItem.thumbnail_picture
                                    : `http://localhost:5000/uploads/${relatedItem.thumbnail_picture}`
                                }
                                alt={relatedItem.place_name}
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
                            <h4 className="font-semibold text-gray-800 text-sm truncate">{relatedItem.place_name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{relatedItem.category}</p>
                            <div className="flex items-center gap-1 mt-1">
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
                    {item.contact && (
                    <button
                        onClick={handleContact}
                        className="w-full flex items-center gap-3 p-3 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-left"
                    >
                        <div className="bg-blue-100 p-2 rounded-lg">
                        <Phone className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                        <p className="text-sm text-gray-500">Telepon</p>
                        <p className="font-semibold text-gray-800">{item.contact}</p>
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
                        const message = `Halo! Saya tertarik dengan ${item.place_name}. Bisa minta info lebih lanjut?`;
                        const phoneNumber = item.contact?.replace(/\D/g, '');
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
                    window.open(`https://wa.me/?text=${encodeURIComponent(`${item.place_name} - ${window.location.href}`)}`, '_blank');
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