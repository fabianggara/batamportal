// frontend/src/app/(site)/category/[categoriesName]/detail/itemDetail/[id]/page.tsx

'use client'

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
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
        TrendingUp,
        ChevronDown,
        ArrowRight,
        Loader2, 
        Send,
        Trash2,
        Accessibility, 
        Shirt, 
        Baby, 
        Bus, 
        Flower2, 
        Wine, 
        Ban, 
        Activity, 
        Waves, 
        BellRing,
        X,
        Banknote
        } from 'lucide-react';

        interface Tag {
        id: number;
        name: string;
        type: string;
        }

        interface MenuItem {
        id: number;
        name: string;
        description: string;
        price: number;
        is_signature: boolean;
        }

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
        latitude: number | null;
        longitude: number | null;
        tags?: Tag[];
        price?: number;
        max_price?: number;
        menus?: MenuItem[];
        hours?: { open_time: string; close_time: string; }[];
        }

        interface MediaItem {
        id: number;
        media_path: string;
        media_type: 'photo' | 'video';
        }

        interface ReviewItem {
            id: number;
            user_id: number;
            user_name: string;
            user_profile_picture: string | null;
            rating: number;
            comment: string;
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

const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(price);
};

const LocationMap = ({ lat, lng, name }: { lat: number; lng: number; name: string }) => {
    const customIcon = new L.Icon({
        iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
    });

    return (
        <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} style={{ height: '250px', width: '100%', borderRadius: '1rem', zIndex: 0 }}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={customIcon}>
                <Popup>{name}</Popup>
            </Marker>
        </MapContainer>
    );
};

const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius bumi dalam KM
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

const formatPriceRange = (min?: number, max?: number) => {
    const format = (num: number) => new Intl.NumberFormat('id-ID').format(num);
    if (!min && !max) return "Harga tidak tersedia";
    if (!max || min === max) return `Rp ${format(min!)}`;
    return `Rp ${format(min!)}–${format(max)}`;
};

export default function ItemDetailPage() {
    const router = useRouter();
    const params = useParams();
    const itemId = params?.id;
    const { user } = useAuth(); 

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
    const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
    
    // Booking states
    const [checkInDate, setCheckInDate] = useState('2025-09-28');
    const [checkOutDate, setCheckOutDate] = useState('2025-09-29');
    const [guests, setGuests] = useState(2);
    const [rooms, setRooms] = useState(1);
    const [reviews, setReviews] = useState<ReviewItem[]>([]);
    const [newRating, setNewRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewText, setReviewText] = useState('');
    const [reviewImage, setReviewImage] = useState<File | null>(null);
    const [reviewImagePreview, setReviewImagePreview] = useState<string | null>(null);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    const handleRemoveReviewImage = () => {
        setReviewImage(null);
        setReviewImagePreview(null);
    };

    const fetchReviews = async () => {
        try {
            const res = await fetch(`http://localhost:5000/api/businesses/${itemId}/reviews`);
            const json = await res.json();
            if (json.success) setReviews(json.data);
        } catch (err) {
            console.error("Gagal mengambil ulasan:", err);
        }
    };

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newRating === 0) return alert('Silakan pilih rating (bintang) terlebih dahulu!');
        if (!reviewText.trim()) return alert('Komentar tidak boleh kosong!');
        
        setIsSubmittingReview(true);
        try {
            const token = localStorage.getItem('authToken');
            
            // UBAHAN KUNCI: Gunakan FormData karena ada file gambar
            const formData = new FormData();
            formData.append('rating', newRating.toString());
            formData.append('comment', reviewText);
            if (reviewImage) {
                formData.append('image', reviewImage);
            }

            const response = await fetch(`http://localhost:5000/api/businesses/${itemId}/reviews`, {
                method: 'POST',
                headers: { 
                    'Authorization': `Bearer ${token}`
                    // HAPUS 'Content-Type': 'application/json' jika pakai FormData
                },
                body: formData,
                credentials: 'include'
            });

            const result = await response.json();
            if (result.success) {
                alert('Ulasan berhasil dikirim!');
                // Reset form setelah sukses
                setNewRating(0);
                setReviewText('');
                handleRemoveReviewImage(); 
                fetchReviews(); // Refresh daftar ulasan
                
                // Update skor langsung di UI
                setItem(prev => {
                    if (!prev) return null;
                    const newTotal = prev.total_reviews + 1;
                    const newAvg = ((prev.average_rating * prev.total_reviews) + newRating) / newTotal;
                    return {
                        ...prev,
                        total_reviews: newTotal,
                        average_rating: Number(newAvg.toFixed(2)) 
                    };
                });
            } else {
                alert(result.message || 'Gagal mengirim ulasan');
            }
        } catch (err) {
            alert('Terjadi kesalahan. Coba lagi nanti.');
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDeleteReview = async (reviewId: number) => {
        if (!window.confirm('Yakin ingin menghapus ulasan Anda?')) return;
        
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:5000/api/businesses/${itemId}/reviews/${reviewId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` },
                credentials: 'include'
            });

            const result = await response.json();
            if (result.success) {
                alert('Ulasan dihapus!');
                fetchReviews(); // Refresh data ulasan dari server
                
                // Update skor sementara di layar
                setItem(prev => {
                    if (!prev) return null;
                    const deletedReview = reviews.find(r => r.id === reviewId);
                    if (!deletedReview) return prev;
                    
                    const newTotal = Math.max(0, prev.total_reviews - 1);
                    let newAvg = 0;
                    if (newTotal > 0) {
                        newAvg = ((prev.average_rating * prev.total_reviews) - deletedReview.rating) / newTotal;
                    }
                    
                    return {
                        ...prev,
                        total_reviews: newTotal,
                        average_rating: Number(newAvg.toFixed(2))
                    };
                });
            } else {
                alert(result.message || 'Gagal menghapus ulasan');
            }
        } catch (err) {
            alert('Terjadi kesalahan. Coba lagi nanti.');
        }
    };

    // Variabel pendeteksi: Apakah user ini sudah pernah memberi review?
    const hasReviewed = user ? reviews.some(r => r.user_id === user.id) : false;

    const handleFavoriteToggle = async () => {
    if (!item) return;

    // 1. Optimistic UI Update
    const newFavoriteStatus = !isFavorite;
    setIsFavorite(newFavoriteStatus);

    try {
        // 2. Kirim permintaan ke backend (dengan /api)
        const response = await fetch('http://localhost:5000/api/interaction/toggle-like', {
            method: 'POST',
            headers: {
                // HAPUS 'Authorization' header
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ businessId: item.id }),
            credentials: 'include' // <-- TAMBAHKAN INI. Ini akan mengirim cookie.
        });

        const result = await response.json();
        
        // 3. Rollback jika gagal
        if (!result.success) {
            setIsFavorite(!newFavoriteStatus); 
            
            // Cek jika errornya adalah 401 (dari authMiddleware)
            if (response.status === 401) {
                alert('Sesi Anda telah berakhir. Silakan login kembali.');
                router.push('/login'); // Arahkan ke login
            } else {
                alert('Gagal menyimpan status. Silakan coba lagi.');
            }
        }
    } catch (err) {
        // 4. Rollback jika ada error koneksi
        setIsFavorite(!newFavoriteStatus); 
        console.error('Error toggling like:', err);
        alert('Terjadi kesalahan. Silakan coba lagi.');
    }
};

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

            // 1. Fetch Detail Bisnis Utama
            const itemRes = await fetch(`http://localhost:5000/api/businesses/${itemId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const itemJson = await itemRes.json();

            if (itemJson.success) {
                const currentItemData = itemJson.data;
                setItem(currentItemData);
                
                // LANGSUNG SET MEDIA DARI RESPONSE UTAMA
                if (currentItemData.media && Array.isArray(currentItemData.media)) {
                    setMedia(currentItemData.media);
                } else {
                    setMedia([]);
                }

                // --- 2. LOGIKA REKOMENDASI (PERSONAL & POPULER) ---
                // Kita buat fungsi helper kecil agar kode tidak berulang
                const processRecommendations = (data: any[]) => {
                    return data.filter((resItem: any) => Number(resItem.id) !== Number(itemId));
                };

                try {
                    // Coba ambil personal dulu
                    const relatedRes = await fetch(`http://localhost:5000/api/recommendations/for-me`, {
                        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
                        credentials: 'include'
                    });

                    const relatedJson = await relatedRes.json();

                    if (relatedRes.ok && relatedJson.success && relatedJson.data.length > 0) {
                        // JIKA BERHASIL PERSONAL
                        setRelatedItems(processRecommendations(relatedJson.data));
                    } else {
                        // JIKA PERSONAL KOSONG/GAGAL -> AMBIL POPULER
                        throw new Error('Fallback to popular');
                    }
                } catch (relatedErr) {
                    // FALLBACK KE POPULER
                    const popularRes = await fetch(`http://localhost:5000/api/recommendations/popular`);
                    const popularJson = await popularRes.json();
                    if (popularJson.success) {
                        setRelatedItems(processRecommendations(popularJson.data));
                    }
                }

                // --- 3. LOGIKA INTERAKSI (LIKE & VISIT) ---
                // Cek status Like
                fetch(`http://localhost:5000/api/interaction/status?businessId=${itemId}`, {
                    credentials: 'include'
                })
                .then(res => res.json())
                .then(statusJson => {
                    if (statusJson.success) setIsFavorite(statusJson.isFavorite);
                })
                .catch(err => console.error("Gagal cek status like:", err));

                // Catat Kunjungan
                fetch('http://localhost:5000/api/interaction/visit', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ businessId: itemId }),
                    credentials: 'include'
                }).catch(err => console.error("Gagal catat visit:", err));

                
                fetchReviews();

                try {
                        const allRes = await fetch(`http://localhost:5000/api/businesses`);
                        const allJson = await allRes.json();
                        if (allJson.success) {
                            const currentLat = parseFloat(currentItemData.latitude);
                            const currentLon = parseFloat(currentItemData.longitude);

                            if (!isNaN(currentLat) && !isNaN(currentLon)) {
                                const calculatedPlaces = allJson.data
                                    // Singkirkan item yang sedang dibuka & pastikan ada koordinatnya
                                    .filter((b: any) => b.id !== currentItemData.id && b.latitude && b.longitude)
                                    // Hitung jaraknya
                                    .map((b: any) => ({
                                        ...b,
                                        distance: getDistanceFromLatLonInKm(currentLat, currentLon, parseFloat(b.latitude), parseFloat(b.longitude))
                                    }))
                                    // Ambil yang jaraknya di bawah 15 KM saja
                                    .filter((b: any) => b.distance <= 15)
                                    // Urutkan dari yang paling dekat
                                    .sort((a: any, b: any) => a.distance - b.distance)
                                    // Tampilkan maksimal 5 tempat
                                    .slice(0, 5); 

                                setNearbyPlaces(calculatedPlaces);
                            }
                        }
                    } catch (err) {
                        console.error("Gagal memuat tempat terdekat:", err);
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
        setCurrentMediaIndex((prev) => (prev + 1) % media.length);
    };

    const prevMedia = () => {
        setCurrentMediaIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
    };

    // --- FITUR AUTO SLIDE CAROUSEL (5 DETIK) ---
    useEffect(() => {
        // Hitung total gambar yang ada di carousel (1 Thumbnail + jumlah Galeri)
        const totalItems = (item?.thumbnail_image ? 1 : 0) + (media?.length || 0);

        // Jika gambar hanya 1 atau kosong, hentikan fungsi (tidak perlu auto-slide)
        if (totalItems <= 1) return;

        // Buat timer untuk menggeser gambar setiap 5000 milidetik (5 detik)
        const slideInterval = setInterval(() => {
            setCurrentMediaIndex((prevIndex) => (prevIndex + 1) % totalItems);
        }, 5000);

        // Bersihkan timer saat halaman ditutup agar memori browser tidak bocor
        return () => clearInterval(slideInterval);
    }, [item, media]);

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

    const CategoryIcon = getCategoryIcon(categoriesName || '');

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
                </button>
                <div>
                    <h1 className="text-xl font-bold text-gray-800 truncate max-w-md">
                    {item.name}
                    </h1>
                    <p className="text-sm text-gray-500 capitalize">{categoriesName}</p>
                </div>
                </div>
                
                <div className="flex items-center gap-2">
                <button
                    onClick={handleFavoriteToggle}
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
        {item.category?.toLowerCase() === 'akomodasi' && (
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
                {/* Media Gallery (CAROUSEL SLIDER) */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {(() => {
                        // GABUNGKAN THUMBNAIL & GALERI MENJADI 1 ARRAY
                        const carouselItems: any[] = [];
                        
                        // 1. Masukkan Thumbnail sebagai slide pertama
                        if (item?.thumbnail_image) {
                            carouselItems.push({
                                id: 'thumbnail',
                                media_path: item.thumbnail_image,
                                media_type: 'image'
                            });
                        }
                        
                        // 2. Masukkan foto Galeri Tambahan (Di-map agar file_path terbaca)
                        if (media && media.length > 0) {
                            media.forEach((m: any) => {
                                carouselItems.push({
                                    id: m.id,
                                    // KUNCI PERBAIKAN: Ambil dari file_path (database) ke media_path (carousel)
                                    media_path: m.file_path || m.media_path, 
                                    media_type: m.file_type || m.media_type || 'image'
                                });
                            });
                        }

                        return (
                            <>
                                <div className="relative h-96 overflow-hidden group"> 
                                    {/* 1. TRACK CAROUSEL (Wadah yang Bergeser) */}
                                    <div 
                                        className="flex h-full w-full transition-transform duration-500 ease-out"
                                        style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
                                    >
                                        {carouselItems.length > 0 ? (
                                            carouselItems.map((mediaItem, idx) => (
                                                <div key={mediaItem.id} className="relative h-full w-full flex-shrink-0 bg-gray-100">
                                                    <Image
                                                        src={mediaItem.media_path?.startsWith("http") ? mediaItem.media_path : `http://localhost:5000/uploads/${mediaItem.media_path}`}
                                                        alt={`${item?.name} - Slide ${idx + 1}`}
                                                        fill
                                                        className="object-cover"
                                                        priority={idx === 0}
                                                    />
                                                    {mediaItem.media_type === 'video' && (
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                                            <button className="bg-white/90 hover:bg-white rounded-full p-4 transition-transform hover:scale-110 shadow-lg">
                                                                <Play className="w-8 h-8 text-blue-600" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="h-full w-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center flex-shrink-0">
                                                <Camera className="w-16 h-16 text-gray-400" />
                                            </div>
                                        )}
                                    </div>

                                    {/* 2. TOMBOL NAVIGASI & DOTS (Hanya muncul jika gambar > 1) */}
                                    {carouselItems.length > 1 && (
                                        <>
                                            {/* Tombol Kiri */}
                                            <button
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setCurrentMediaIndex(prev => (prev - 1 + carouselItems.length) % carouselItems.length); 
                                                }}
                                                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 transition-all shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                                            >
                                                <ChevronLeft className="w-6 h-6" />
                                            </button>
                                            
                                            {/* Tombol Kanan */}
                                            <button
                                                onClick={(e) => { 
                                                    e.stopPropagation(); 
                                                    setCurrentMediaIndex(prev => (prev + 1) % carouselItems.length); 
                                                }}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 transition-all shadow-md opacity-0 group-hover:opacity-100 hover:scale-110 z-10"
                                            >
                                                <ChevronRight className="w-6 h-6" />
                                            </button>

                                            {/* Titik Indikator (Dots) */}
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                                                {carouselItems.map((_, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => setCurrentMediaIndex(idx)}
                                                        className={`h-2.5 rounded-full transition-all ${
                                                            currentMediaIndex === idx 
                                                            ? 'bg-white w-8 shadow-sm' 
                                                            : 'bg-white/60 hover:bg-white/90 w-2.5'
                                                        }`}
                                                    />
                                                ))}
                                            </div>

                                            {/* Penghitung Gambar (Misal: 1 / 4) */}
                                            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1.5 rounded-lg text-sm font-medium z-10">
                                                {currentMediaIndex + 1} / {carouselItems.length}
                                            </div>
                                        </>
                                    )}
                                </div>

                                {/* 3. THUMBNAIL LIST DI BAWAH CAROUSEL */}
                                {carouselItems.length > 1 && (
                                    <div className="p-4 bg-white border-t border-gray-100">
                                        <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar snap-x">
                                            {carouselItems.map((mediaItem, index) => (
                                                <button
                                                    key={mediaItem.id}
                                                    onClick={() => setCurrentMediaIndex(index)}
                                                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden transition-all snap-center ${
                                                        currentMediaIndex === index 
                                                        ? 'border-2 border-blue-600 ring-2 ring-blue-100 scale-100 opacity-100' 
                                                        : 'border-2 border-transparent opacity-50 hover:opacity-100'
                                                    }`}
                                                >
                                                    <Image
                                                        src={mediaItem.media_path?.startsWith("http") ? mediaItem.media_path : `http://localhost:5000/uploads/${mediaItem.media_path}`}
                                                        alt={`Thumbnail ${index + 1}`}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                    {mediaItem.media_type === 'video' && (
                                                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                            <Play className="w-5 h-5 text-white" />
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        );
                    })()}
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
                    {/* INFO KHUSUS KULINER: Harga & Jam Operasional */}
                    {categoriesName?.toLowerCase() === 'kuliner' && (
                        <div className="flex flex-col gap-3 mt-4 mb-6 bg-orange-50/50 p-5 rounded-xl border border-orange-100">
                            <div className="flex items-start gap-3">
                                <div className="bg-teal-100/50 p-2 rounded-lg">
                                    <Banknote className="w-5 h-5 text-teal-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">
                                        {formatPriceRange(item.price, item.max_price)} <span className="text-gray-500 font-normal text-sm">/ orang</span>
                                    </p>
                                    <p className="text-xs text-gray-400">Berdasarkan info tempat</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-3">
                                <div className="bg-orange-100/50 p-2 rounded-lg">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                </div>
                                <div>
                                    <p className="font-bold text-gray-800">
                                        {item.hours && item.hours[0]?.open_time === '00:00:00' && item.hours[0]?.close_time === '23:59:00' 
                                            ? 'Buka 24 Jam' 
                                            : `${item.hours?.[0]?.open_time?.substring(0,5) || '-'} - ${item.hours?.[0]?.close_time?.substring(0,5) || '-'}`
                                        }
                                    </p>
                                    <p className="text-xs text-gray-400">Jam operasional lokal</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {item.description && (
                        <div className="pt-4">
                        <h3 className="font-bold text-gray-800 text-lg mb-2">Deskripsi</h3>
                        <p className="text-gray-600 leading-relaxed text-sm">{item.description}</p>
                        </div>
                    )}

                    {/* DAFTAR MENU UNGGULAN (KHUSUS KULINER) */}
                    {categoriesName?.toLowerCase() === 'kuliner' && item.menus && item.menus.length > 0 && (
                        <div className="mt-8 border-t border-gray-100 pt-8">
                            <h3 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
                                <Utensils className="w-5 h-5 text-orange-500" /> Menu Unggulan
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {item.menus.map((menu) => (
                                    <div key={menu.id} className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                                        {/* Label Signature (Bintang) */}
                                        {menu.is_signature ? (
                                            <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-current" /> SIGNATURE
                                            </div>
                                        ) : null}
                                        
                                        <div className="flex justify-between items-start mt-1">
                                            <div className="pr-8">
                                                <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors">{menu.name}</h4>
                                                {menu.description && (
                                                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{menu.description}</p>
                                                )}
                                            </div>
                                            <p className="font-bold text-orange-600 whitespace-nowrap">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(menu.price)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                   
                    {/* FASILITAS & RESTORAN (DINAMIS DARI DATABASE) */}
                    {item.tags && item.tags.filter(t => t.type === 'Fasilitas' || t.type === 'Jenis Kuliner').length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Fasilitas & Restoran</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {item.tags.filter(t => t.type === 'Fasilitas' || t.type === 'Jenis Kuliner').map((tag, index) => {
                                    const TagIcon = getIconForTag(tag.name, tag.type);
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-blue-50 transition-colors">
                                            <TagIcon className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-700">{tag.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* AKTIVITAS (DINAMIS DARI DATABASE) */}
                    {item.tags && item.tags.filter(t => t.type === 'Aktivitas').length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Aktivitas di Sekitar</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                {item.tags.filter(t => t.type === 'Aktivitas').map((tag, index) => {
                                    const TagIcon = getIconForTag(tag.name, tag.type);
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 bg-green-50/50 rounded-xl border border-green-100 hover:bg-green-50 transition-colors">
                                            <TagIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                                            <span className="text-sm font-medium text-gray-700">{tag.name}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* AREA / LOKASI TERDEKAT (DINAMIS DARI DATABASE) */}
                    {item.tags && item.tags.filter(t => t.type === 'Area').length > 0 && (
                        <div className="mt-8">
                            <h3 className="font-bold text-gray-800 text-lg mb-4">Area & Lingkungan</h3>
                            <div className="flex flex-wrap gap-2">
                                {item.tags.filter(t => t.type === 'Area').map((tag, index) => {
                                    const TagIcon = getIconForTag(tag.name, tag.type);
                                    return (
                                        <span key={index} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium border border-purple-100 shadow-sm">
                                            <TagIcon className="w-4 h-4" />
                                            {tag.name}
                                        </span>
                                    );
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
                        {item.name} berlokasi di {item.address}
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
                <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-6">Ulasan & Penilaian</h3>
                    
                    {/* Form Input Ulasan */}
                    {user ? (
                        hasReviewed ? (
                            <div className="bg-green-50 border border-green-100 text-green-800 rounded-xl p-5 mb-8 text-center shadow-sm">
                                <p className="font-semibold text-lg mb-1">Terima Kasih!</p>
                                <p className="text-sm">Anda sudah membagikan ulasan untuk tempat ini.</p>
                            </div>
                        ) : (
                            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-8">
                                <h4 className="font-semibold text-gray-800 mb-3">Tulis pengalaman Anda</h4>
                                <form onSubmit={handleSubmitReview}>
                                    <div className="flex items-center gap-1 mb-4">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <button
                                                key={star} type="button"
                                                onMouseEnter={() => setHoverRating(star)}
                                                onMouseLeave={() => setHoverRating(0)}
                                                onClick={() => setNewRating(star)}
                                                className="focus:outline-none transition-transform hover:scale-110"
                                            >
                                                <Star className={`w-8 h-8 ${(hoverRating || newRating) >= star ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                            </button>
                                        ))}
                                        <span className="ml-3 text-sm font-medium text-gray-500">
                                            {newRating > 0 ? `${newRating} Bintang` : 'Pilih rating'}
                                        </span>
                                    </div>
                                    
                                    <textarea
                                        value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                                        placeholder="Ceritakan pengalaman Anda saat mengunjungi tempat ini..."
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none mb-3"
                                        rows={3} required
                                    ></textarea>

                                    {/* AREA PREVIEW GAMBAR JIKA ADA */}
                                    {reviewImagePreview && (
                                        <div className="relative inline-block mb-3">
                                            <img src={reviewImagePreview} alt="Preview" className="h-24 w-24 object-cover rounded-lg border border-gray-300" />
                                            <button 
                                                type="button" 
                                                onClick={handleRemoveReviewImage}
                                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow hover:bg-red-600"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </div>
                                    )}

                                    <div className="flex justify-between items-center">
                                        {/* TOMBOL UPLOAD GAMBAR */}
                                        <div className="relative">
                                            <input 
                                                type="file" 
                                                id="review-image"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) {
                                                        if (file.size > 5 * 1024 * 1024) {
                                                            alert("Maksimal ukuran gambar adalah 5MB");
                                                            return;
                                                        }
                                                        setReviewImage(file);
                                                        setReviewImagePreview(URL.createObjectURL(file));
                                                    }
                                                }}
                                            />
                                            <label 
                                                htmlFor="review-image" 
                                                className="flex items-center gap-2 cursor-pointer text-gray-500 hover:text-blue-600 font-medium text-sm transition-colors p-2 rounded-lg hover:bg-blue-50"
                                            >
                                                <Camera className="w-5 h-5" />
                                                <span>{reviewImage ? 'Ganti Foto' : 'Tambahkan Foto'}</span>
                                            </label>
                                        </div>

                                        {/* TOMBOL KIRIM */}
                                        <button 
                                            type="submit" disabled={isSubmittingReview || newRating === 0}
                                            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2"
                                        >
                                            {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                            Kirim Ulasan
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )
                    ) : (
                        <div className="bg-blue-50 text-blue-800 rounded-xl p-5 mb-8 flex items-center justify-between">
                            <div>
                                <p className="font-semibold mb-1">Punya pengalaman di tempat ini?</p>
                                <p className="text-sm">Silakan login untuk membagikan ulasan Anda kepada orang lain.</p>
                            </div>
                            <button onClick={() => router.push('/login')} className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-sm">
                                Login
                            </button>
                        </div>
                    )}

                    {/* List Daftar Ulasan */}
                    <div className="space-y-6">
                        <h4 className="font-semibold text-gray-800 border-b pb-2">Ulasan Pengunjung ({reviews.length})</h4>
                        {reviews.length > 0 ? (
                            reviews.map((review) => (
                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden relative">
                                                {review.user_profile_picture ? (
                                                    <Image 
                                                        src={review.user_profile_picture.startsWith('http') ? review.user_profile_picture : `http://localhost:5000/uploads/${review.user_profile_picture}`} 
                                                        alt={review.user_name} fill className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-600 font-bold">{review.user_name.charAt(0).toUpperCase()}</div>
                                                )}
                                            </div>
                                            <div>
                                                <h5 className="font-semibold text-gray-800 text-sm">{review.user_name}</h5>
                                                <p className="text-xs text-gray-500">{new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            {/* TOMBOL HAPUS (Hanya tampil di ulasan milik user itu sendiri) */}
                                            {user && user.id === review.user_id && (
                                                <button 
                                                    onClick={() => handleDeleteReview(review.id)}
                                                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                                    title="Hapus Ulasan"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm leading-relaxed md:pl-13">"{review.comment}"</p>
                                {review.image_url && (
                                        <div className="mt-3 md:pl-13">
                                            <img 
                                                src={review.image_url.startsWith('http') ? review.image_url : `http://localhost:5000/uploads/${review.image_url}`} 
                                                alt="Foto Ulasan" 
                                                className="rounded-lg h-32 w-auto object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                                onClick={() => window.open(review.image_url.startsWith('http') ? review.image_url : `http://localhost:5000/uploads/${review.image_url}`, '_blank')}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Belum ada ulasan. Jadilah yang pertama memberikan penilaian!</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
                {/* Booking Summary for Accommodation */}
                {item.category?.toLowerCase() === 'akomodasi' && (
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
    {/* Tombol Telepon */}
    <button
      onClick={() => item.phone && handlePhone()}
      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left ${
        item.phone ? 'border-blue-200 hover:bg-blue-50 cursor-pointer' : 'border-gray-100 cursor-default'
      }`}
    >
      <div className={`${item.phone ? 'bg-blue-100' : 'bg-gray-100'} p-2 rounded-lg`}>
        <Phone className={`w-4 h-4 ${item.phone ? 'text-blue-600' : 'text-gray-400'}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">Telepon</p>
        <p className={`font-semibold ${item.phone ? 'text-gray-800' : 'text-gray-400'}`}>
          {item.phone || '-'}
        </p>
      </div>
    </button>

    {/* Tombol Email */}
    <button
      onClick={() => item.email && handleEmail()}
      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left ${
        item.email ? 'border-green-200 hover:bg-green-50 cursor-pointer' : 'border-gray-100 cursor-default'
      }`}
    >
      <div className={`${item.email ? 'bg-green-100' : 'bg-gray-100'} p-2 rounded-lg`}>
        <Mail className={`w-4 h-4 ${item.email ? 'text-green-600' : 'text-gray-400'}`} />
      </div>
      <div>
        <p className="text-sm text-gray-500">Email</p>
        <p className={`font-semibold ${item.email ? 'text-gray-800' : 'text-gray-400'}`}>
          {item.email 
            ? (item.email.length > 25 ? `${item.email.substring(0, 25)}...` : item.email) 
            : '-'}
        </p>
      </div>
    </button>

    {/* Tombol Website */}
    <button
      onClick={() => item.website && handleWebsite()}
      className={`w-full flex items-center gap-3 p-3 border rounded-lg transition-colors text-left ${
        item.website ? 'border-purple-200 hover:bg-purple-50 cursor-pointer' : 'border-gray-100 cursor-default'
      }`}
    >
      <div className={`${item.website ? 'bg-purple-100' : 'bg-gray-100'} p-2 rounded-lg`}>
        <Globe className={`w-4 h-4 ${item.website ? 'text-purple-600' : 'text-gray-400'}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-500">Website</p>
        <p className={`font-semibold truncate ${item.website ? 'text-gray-800' : 'text-gray-400'}`}>
          {item.website 
            ? (item.website.length > 25 ? `${item.website.substring(0, 25)}...` : item.website) 
            : '-'}
        </p>
      </div>
      {item.website && <ExternalLink className="w-4 h-4 text-gray-400" />}
    </button>
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

               {/* LOKASI PETA & TEMPAT TERDEKAT */}
                        {item.latitude && item.longitude && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 mt-6">
                                <h3 className="text-lg font-bold text-gray-800 mb-4">Lokasi & Sekitarnya</h3>
                                
                                {/* Peta */}
                                <LocationMap lat={item.latitude} lng={item.longitude} name={item.name} />
                                
                                <div className="flex items-start gap-3 mt-4 mb-6">
                                    <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                                    <p className="text-sm font-medium text-gray-700">{item.address}</p>
                                </div>

                                {/* Daftar Tempat Terdekat */}
                                {nearbyPlaces.length > 0 && (
                                    <div className="mt-6 border-t border-gray-100 pt-6">
                                        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-blue-600" />
                                            Destinasi Terdekat
                                        </h4>
                                        
                                        <div className="space-y-3">
                                            {nearbyPlaces.map((place: any, index: number) => (
                                                <div 
                                                    key={index} 
                                                    onClick={() => router.push(`/category/${place.category_name?.toLowerCase() || 'umum'}/detail/itemDetail/${place.id}`)}
                                                    className="flex justify-between items-center group cursor-pointer hover:bg-blue-50 p-2 -mx-2 rounded-xl transition-colors"
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-12 h-12 rounded-lg overflow-hidden relative bg-gray-200 flex-shrink-0 border border-gray-100">
                                                            {place.thumbnail_image ? (
                                                                <Image src={place.thumbnail_image.startsWith('http') ? place.thumbnail_image : `http://localhost:5000/uploads/${place.thumbnail_image}`} alt={place.name} fill className="object-cover" />
                                                            ) : (
                                                                <Building className="w-5 h-5 m-auto mt-3.5 text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors line-clamp-1">{place.name}</p>
                                                            <p className="text-xs text-gray-500 mt-0.5">{place.category_name || 'Destinasi'}</p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex-shrink-0 ml-2">
                                                        <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1.5 rounded-lg border border-blue-200 shadow-sm">
                                                            {place.distance < 1 ? `${Math.round(place.distance * 1000)} m` : `${place.distance.toFixed(1)} km`}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
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