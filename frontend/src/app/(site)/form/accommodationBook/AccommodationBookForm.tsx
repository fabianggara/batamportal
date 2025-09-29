'use client'

import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { useRouter, useParams } from 'next/navigation';
import {
    MapPin,
    Calendar,
    User,
    ChevronDown,
    Award,
    Star,
    Check,
    X,
    MessageCircle,
    BedDouble,
    ArrowRight,
    ArrowLeft,
    Clock,
    Shield,
    Wifi,
    Car,
    Coffee,
    Gift,
    CreditCard,
    Users,
    Phone,
    Mail,
    Globe,
    AlertCircle,
    Info,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Heart,
    Sparkles,
    Zap
} from 'lucide-react';

// Data dummy untuk ringkasan pemesanan
const dummyBookingDetails = {
    itemName: "ASTON BATAM Hotel & Residences",
    itemRating: 8.6,
    itemRatingLabel: "Luar biasa",
    roomType: "1 x Suite Junior (Junior Suite)",
    roomDetails: "Ukuran: 45 m²\nMaks 2 tamu\n1 kasur double",
    checkIn: "Min, 28 Sep",
    checkOut: "Sen, 29 Sep",
    location: "Jalan Simpang No.1, Batam, Riau, Nagoya, Pulau Batam, Indonesia",
    amenities: [
        { name: "Termasuk layanan pembatalan bagasi", icon: Shield, positive: true },
        { name: "Check-in 24 jam", icon: Clock, positive: true },
        { name: "Termasuk sarapan", icon: Coffee, positive: true },
        { name: "Pajak dan biaya termasuk", icon: Check, positive: true },
        { name: "Pembatasan kamar dengan harga ini terbatas - pesan sekarang!", icon: AlertCircle, positive: false },
        { name: "Check-in ekspress", icon: CheckCircle, positive: true },
        { name: "WiFi Gratis", icon: Wifi, positive: true },
        { name: "Gratis parkir", icon: Car, positive: true },
    ],
    originalPrice: 1699394,
    discount: 96930,
    taxPrice: 294361,
    totalPrice: 1696082,
    nights: 1,
    policies: [
        { text: "Pilihan tepat - tamu beri nilai rata-rata 8,6", type: "success" },
        { text: "Persediaan kami dengan harga ini terbatas - pesan sekarang!", type: "warning" },
        { text: "Tinggal 2 hari sebelum tanggal check-in Anda. Harga mungkin naik kalau tidak dipesan sekarang.", type: "warning" }
    ]
};

const steps = [
    { id: 1, title: "Informasi pengguna", subtitle: "Detail tamu", icon: User },
    { id: 2, title: "Pembayaran", subtitle: "Metode bayar", icon: CreditCard },
    { id: 3, title: "Pesanan dikonfirmasi", subtitle: "Selesai", icon: CheckCircle }
];

const AccommodationBookForm = () => {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [timeLeft, setTimeLeft] = useState(19 * 60 + 41); // 19:41 in seconds
    
    // Form data
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [country, setCountry] = useState('Indonesia');
    const [specialRequests, setSpecialRequests] = useState('');
    const [roomPreference, setRoomPreference] = useState('');
    const [bedConfiguration, setBedConfiguration] = useState<string[]>([]);
    const [couponCode, setCouponCode] = useState('');

    const [isProcessing, setIsProcessing] = useState(false);
    const [hoveredCard, setHoveredCard] = useState<string | null>(null);

    // Timer countdown
    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNext = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handlePrev = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (currentStep === 2) {
            setIsProcessing(true);
            setTimeout(() => {
                setIsProcessing(false);
                setCurrentStep(3);
            }, 2000);
        }
    };

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0
        }).format(price);
    };

    const renderStepIndicator = () => (
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-8 mb-8 shadow-lg">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between relative">
                    {steps.map((step, index) => (
                        <React.Fragment key={step.id}>
                            <div className="flex flex-col items-center relative z-10">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center font-bold text-lg transition-all duration-500 transform ${
                                    currentStep >= step.id 
                                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-110' 
                                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                                } ${currentStep === step.id ? 'ring-4 ring-blue-200 animate-pulse' : ''}`}>
                                    {currentStep > step.id ? (
                                        <Check className="w-8 h-8" />
                                    ) : (
                                        <step.icon className="w-8 h-8" />
                                    )}
                                </div>
                                <div className="mt-4 text-center">
                                    <div className={`text-lg font-bold transition-colors duration-300 ${
                                        currentStep >= step.id ? 'text-blue-600' : 'text-gray-500'
                                    }`}>
                                        {step.title}
                                    </div>
                                    <div className="text-sm text-gray-400">{step.subtitle}</div>
                                </div>
                            </div>
                            {index < steps.length - 1 && (
                                <div key={`line-${step.id}`} className={`flex-1 h-1 mx-8 rounded-full transition-all duration-500 ${
                                    currentStep > step.id ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'
                                }`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep1 = () => (
        <>
            {/* Timer Header */}
            <div 
                className="bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl shadow-2xl p-6 text-white mb-10 transform transition-all duration-300 hover:scale-[1.02]"
                onMouseEnter={() => setHoveredCard('timer')}
                onMouseLeave={() => setHoveredCard(null)}
            >
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2 flex items-center gap-3">
                            <Zap className="w-8 h-8 animate-pulse" />
                            🎯 Kami Mengamankan Harga Anda...
                        </h1>
                        <p className="text-red-100">
                            Kami menahan harga ini selama 20 menit agar Anda dapat menyelesaikan pemesanan.
                        </p>
                    </div>
                    <div className="text-center">
                        <div className="bg-white/20 backdrop-blur-sm rounded-3xl px-8 py-6">
                            <Clock className="w-10 h-10 mx-auto mb-3 animate-pulse" />
                            <div className="text-4xl font-bold font-mono">
                                {formatTime(timeLeft)}
                            </div>
                            <div className="text-sm text-red-100">Tersisa</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Guest Form */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-8 mb-10 border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg">
                        <User className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Siapa tamu utamanya?</h2>
                        <p className="text-gray-500 mt-1">*Sesuai di kartu identitas</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Nama depan *</label>
                        <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                        />
                    </div>
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Nama belakang *</label>
                        <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                        />
                    </div>
                </div>

                <div className="group">
                    <label className="text-sm font-semibold text-gray-700 mb-2 block">Email *</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                        Harap berikan alamat email Anda sudah benar, dari sini kami akan mengirimkan konfirmasi pesanan dan petunjuk untuk membantu Anda menyelesaikan perjalanan Anda.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Nomor telepon (opsional)</label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                        />
                    </div>
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-700 mb-2 block">Negara/kawasan domisili *</label>
                        <div className="relative">
                            <select
                                value={country}
                                onChange={(e) => setCountry(e.target.value)}
                                className="w-full appearance-none bg-white/80 border-2 border-gray-200 px-4 py-4 pr-12 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 group-hover:border-gray-300"
                            >
                                <option value="Indonesia">Indonesia</option>
                                <option value="Singapore">Singapore</option>
                                <option value="Malaysia">Malaysia</option>
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 transition-transform duration-300 group-focus-within:rotate-180" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Special Requests */}
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 space-y-6 mb-10 border border-gray-200">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-teal-600 rounded-3xl flex items-center justify-center shadow-lg">
                        <MessageCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Permintaan khusus</h2>
                        <p className="text-gray-500 mt-1">Beri kami tahu yang lebih Anda sukai. Tergantung ketersediaan.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                        <h4 className="font-bold text-gray-800 text-lg mb-4">Pilih preferensi kamar Anda:</h4>
                        <div className="space-y-3">
                            <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="roomPref" 
                                    value="non-smoking"
                                    onChange={(e) => setRoomPreference(e.target.value)}
                                    className="w-5 h-5 text-blue-600" 
                                />
                                <BedDouble className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <span className="text-gray-700 font-medium">Kamar bebas asap rokok</span>
                            </label>
                            <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 cursor-pointer group">
                                <input 
                                    type="radio" 
                                    name="roomPref" 
                                    value="smoking"
                                    onChange={(e) => setRoomPreference(e.target.value)}
                                    className="w-5 h-5 text-blue-600" 
                                />
                                <BedDouble className="w-6 h-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
                                <span className="text-gray-700 font-medium">Kamar boleh merokok</span>
                            </label>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-bold text-gray-800 text-lg mb-4">Pilih konfigurasi tempat tidur Anda:</h4>
                        <div className="space-y-3">
                            <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    value="king"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setBedConfiguration([...bedConfiguration, e.target.value]);
                                        } else {
                                            setBedConfiguration(bedConfiguration.filter(item => item !== e.target.value));
                                        }
                                    }}
                                    className="w-5 h-5 text-green-600 rounded" 
                                />
                                <BedDouble className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                                <span className="text-gray-700 font-medium">Saya ingin tempat tidur besar</span>
                            </label>
                            <label className="flex items-center gap-4 p-4 border-2 border-gray-200 rounded-2xl hover:border-green-300 hover:bg-green-50 transition-all duration-300 cursor-pointer group">
                                <input 
                                    type="checkbox" 
                                    value="twin"
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setBedConfiguration([...bedConfiguration, e.target.value]);
                                        } else {
                                            setBedConfiguration(bedConfiguration.filter(item => item !== e.target.value));
                                        }
                                    }}
                                    className="w-5 h-5 text-green-600 rounded" 
                                />
                                <BedDouble className="w-6 h-6 text-gray-400 group-hover:text-green-500 transition-colors" />
                                <span className="text-gray-700 font-medium">Saya ingin tempat tidur twin</span>
                            </label>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="font-bold text-gray-800 text-lg mb-4">Permintaan tambahan lainnya</h3>
                    <textarea
                        value={specialRequests}
                        onChange={(e) => setSpecialRequests(e.target.value)}
                        placeholder="Masukkan permintaan khusus Anda di sini..."
                        className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-blue-500 transition-all duration-300 resize-none bg-white/80"
                        rows={4}
                    />
                </div>
            </div>

            {/* Room Upgrade */}
            <div className="bg-gradient-to-r from-green-100 to-emerald-50 rounded-3xl shadow-xl p-8 mb-10 border-2 border-green-200">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center shadow-lg">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-gray-800">Penawaran upgrade kamar</h3>
                        <p className="text-gray-600">Tambahan untuk perjalanan Anda</p>
                    </div>
                </div>
                
                <div className="flex items-center gap-6 p-6 bg-white/80 backdrop-blur-sm border-2 border-green-300 rounded-2xl">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                        <Coffee className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800 text-lg">Sarapan Premium</h4>
                        <p className="text-gray-600">Sarapan termasuk dalam harga kamar Anda, tanpa biaya tambahan</p>
                    </div>
                    <div className="text-green-600 font-bold text-2xl">GRATIS</div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={handleNext}
                    disabled={!firstName || !lastName || !email}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-3 text-lg"
                >
                    Lanjut ke detail pembayaran
                    <ArrowRight className="w-6 h-6" />
                </button>
            </div>
        </>
    );

    const renderStep2 = () => (
        <div className="space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-gray-200">
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-3xl flex items-center justify-center shadow-lg">
                        <CreditCard className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold text-gray-800">Pembayaran</h2>
                        <p className="text-gray-500 mt-1">Masukkan detail kartu Anda</p>
                    </div>
                </div>
                
                <div className="space-y-6">
                    <div className="p-6 border-2 border-purple-200 rounded-2xl bg-purple-50">
                        <div className="flex items-center gap-4">
                            <CreditCard className="w-6 h-6 text-purple-600" />
                            <span className="font-bold text-lg text-gray-800">Kartu Kredit/Debit</span>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="md:col-span-2 group">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Nomor Kartu *</label>
                            <input
                                type="text"
                                placeholder="1234 5678 9012 3456"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                            />
                        </div>
                        <div className="group">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Nama di Kartu *</label>
                            <input
                                type="text"
                                value={`${firstName} ${lastName}`}
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                            />
                        </div>
                        <div className="group">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">Tanggal Kadaluarsa *</label>
                            <input
                                type="text"
                                placeholder="MM/YY"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                            />
                        </div>
                        <div className="group">
                            <label className="text-sm font-semibold text-gray-700 mb-2 block">CVV *</label>
                            <input
                                type="text"
                                placeholder="123"
                                className="w-full px-4 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-0 focus:border-purple-500 transition-all duration-300 group-hover:border-gray-300 bg-white/80"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between">
                <button
                    onClick={handlePrev}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 flex items-center gap-3 text-lg"
                >
                    <ChevronLeft className="w-5 h-5" />
                    Kembali
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isProcessing}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:transform-none flex items-center gap-3 text-lg"
                >
                    {isProcessing ? (
                        <>
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                            Memproses...
                        </>
                    ) : (
                        <>
                            Konfirmasi Pembayaran
                            <Check className="w-6 h-6" />
                        </>
                    )}
                </button>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="text-center space-y-8">
            <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl p-12 border border-gray-200">
                <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                    <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-4">🎉 Pemesanan Berhasil!</h2>
                <p className="text-xl text-gray-600 mb-8">
                    Terima kasih atas pemesanan Anda. Konfirmasi telah dikirim ke email <span className="font-semibold text-blue-600">{email}</span>
                </p>
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-8 text-left max-w-2xl mx-auto">
                    <h3 className="font-bold text-gray-800 mb-4 text-xl text-center">📋 Detail Pemesanan:</h3>
                    <div className="space-y-3 text-lg text-gray-700">
                        <div className="flex justify-between">
                            <span>🏨 Hotel:</span>
                            <span className="font-semibold">{dummyBookingDetails.itemName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>👤 Tamu:</span>
                            <span className="font-semibold">{firstName} {lastName}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>📅 Check-in:</span>
                            <span className="font-semibold">{dummyBookingDetails.checkIn}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>📅 Check-out:</span>
                            <span className="font-semibold">{dummyBookingDetails.checkOut}</span>
                        </div>
                        <div className="flex justify-between border-t pt-3 mt-3">
                            <span>💰 Total:</span>
                            <span className="font-bold text-2xl text-green-600">{formatPrice(dummyBookingDetails.totalPrice)}</span>
                        </div>
                    </div>
                </div>
                <div className="mt-8">
                    <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-lg">
                        📧 Lihat Detail Lengkap
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <button
                onClick={() => router.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
            </button>
            {renderStepIndicator()}

            <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2">
                    {currentStep === 1 && renderStep1()}
                    {currentStep === 2 && renderStep2()}
                    {currentStep === 3 && renderStep3()}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-1">
                    <div className="sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-6 max-w ">
                        {/* Hotel Info */}
                        <div 
                            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200 transform transition-all duration-300 hover:scale-[1.02]"
                            onMouseEnter={() => setHoveredCard('hotel')}
                            onMouseLeave={() => setHoveredCard(null)}
                        >
                            <div className="flex items-start gap-3 mb-6">
                                <div className="bg-blue-50 p-3 rounded-xl">
                                    <span className="text-xs font-semibold text-blue-600">Check-in</span>
                                    <div className="font-bold text-lg">{dummyBookingDetails.checkIn}</div>
                                </div>
                                <ArrowRight className="w-5 h-5 text-gray-400 mt-4" />
                                <div className="bg-purple-50 p-3 rounded-xl">
                                    <span className="text-xs font-semibold text-purple-600">Check-out</span>
                                    <div className="font-bold text-lg">{dummyBookingDetails.checkOut}</div>
                                </div>
                                <div className="bg-green-50 p-3 rounded-xl ml-auto">
                                    <span className="text-xs font-semibold text-green-600">Malam</span>
                                    <div className="font-bold text-lg text-center">{dummyBookingDetails.nights}</div>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="relative w-24 h-20 flex-shrink-0 rounded-2xl overflow-hidden shadow-lg">
                                    <Image
                                        src="https://images.unsplash.com/photo-1549294413-26f195200c37?q=80&w=2940&auto=format&fit=crop"
                                        alt="Hotel"
                                        fill
                                        className="object-cover transition-transform duration-500 hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-800 text-lg leading-tight">{dummyBookingDetails.itemName}</h3>
                                    <div className="flex items-center gap-1 my-2">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                        ))}
                                    </div>
                                    <div className="flex items-center gap-3 text-sm">
                                        <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full font-bold">
                                            {dummyBookingDetails.itemRating}
                                        </span>
                                        <span className="text-gray-600 font-medium">{dummyBookingDetails.itemRatingLabel}</span>
                                        <span className="text-blue-600 font-medium">947 ulasan</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 flex items-start gap-1">
                                        <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-red-500" />
                                        <span>Jalan Simpang No.1, Batam, Riau, Nagoya, Pulau Batam. Ada spa di dalam hotel.</span>
                                    </div>
                                    <div className="text-xs text-blue-600 mt-2 font-semibold">💎 Harga masih bisa naik nanti!</div>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl border border-gray-200">
                                <div className="flex gap-3">
                                    <BedDouble className="w-5 h-5 text-blue-500 mt-0.5" />
                                    <div>
                                        <div className="font-bold text-gray-800">{dummyBookingDetails.roomType}</div>
                                        <div className="text-sm text-gray-600 mt-1">
                                            Ukuran: 45 m² • Maks 2 tamu • 1 kasur double
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 space-y-3">
                                {dummyBookingDetails.amenities.map((amenity, index) => {
                                    const IconComponent = amenity.icon;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                amenity.positive ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'
                                            }`}>
                                                <IconComponent className="w-4 h-4" />
                                            </div>
                                            <span className={`text-sm font-medium ${
                                                amenity.positive ? 'text-gray-700' : 'text-orange-600'
                                            }`}>
                                                {amenity.name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-200">
                                <div className="grid grid-cols-2 gap-3">
                                    <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-4 rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105">
                                        ✨ Sekarang Gratis!
                                    </button>
                                    <button className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded-xl text-sm font-bold transition-all duration-300 transform hover:scale-105">
                                        🗺️ Peta
                                    </button>
                                </div>
                                <div className="text-xs text-gray-500 mt-3 text-center">🏷️ 1 tersedia</div>
                            </div>

                            {/* Policy Alerts */}
                            <div className="mt-6 space-y-3">
                                {dummyBookingDetails.policies.map((policy, index) => (
                                    <div key={index} className={`p-4 rounded-2xl text-sm flex items-start gap-3 border-2 ${
                                        policy.type === 'success' ? 'bg-green-50 border-green-200' :
                                        policy.type === 'warning' ? 'bg-orange-50 border-orange-200' :
                                        'bg-blue-50 border-blue-200'
                                    }`}>
                                        {policy.type === 'success' ? 
                                            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" /> :
                                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5 flex-shrink-0" />
                                        }
                                        <span className={`font-medium ${
                                            policy.type === 'success' ? 'text-green-700' :
                                            policy.type === 'warning' ? 'text-orange-700' :
                                            'text-blue-700'
                                        }`}>
                                            {policy.text}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="bg-gradient-to-r from-orange-400 to-pink-500 rounded-3xl shadow-xl p-6 text-white">
                            <div className="flex items-center gap-3 mb-4">
                                <Gift className="w-8 h-8" />
                                <h4 className="font-bold text-xl">🎁 Kupon Spesial</h4>
                            </div>
                            <div className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Dalam Promosi"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value)}
                                    className="flex-1 px-4 py-3 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                                <button className="bg-white text-orange-500 px-6 py-3 rounded-xl font-bold hover:bg-gray-100 transition-colors transform hover:scale-105 duration-200">
                                    Terapkan
                                </button>
                            </div>
                            <div className="mt-4 p-4 bg-white/20 backdrop-blur-sm rounded-2xl">
                                <div className="text-sm">💰 Dalam promosi - {formatPrice(dummyBookingDetails.discount)}</div>
                                <div className="text-sm mt-2 font-semibold">
                                    🎉 Harga termasuk: Termasuk pajak lebih murah, dan kami akan memberikan kepastian terbaiknya kepada Anda!
                                </div>
                                <div className="text-sm mt-1 font-bold">
                                    ✨ Anda hemat! {formatPrice(dummyBookingDetails.discount)} untuk pesanan ini
                                </div>
                            </div>
                        </div>

                        {/* Price Summary */}
                        <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 border border-gray-200">
                            <div className="bg-gradient-to-r from-red-500 to-pink-600 text-white text-center py-3 rounded-2xl mb-6 font-bold text-lg shadow-lg">
                                🔥 DISKON 10% HARI INI
                            </div>
                            
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Harga awal (1 Kamar x 1 Malam)</span>
                                    <span className="font-semibold">{formatPrice(dummyBookingDetails.originalPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Harga kamar</span>
                                    <span className="font-semibold">{formatPrice(1409651)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-green-600 font-medium">Potongan dari Kupon</span>
                                    <span className="text-green-600 font-bold">-{formatPrice(dummyBookingDetails.discount)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Harga kamar (1 Kamar x 1 Malam)</span>
                                    <span className="font-semibold">{formatPrice(1401721)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-gray-600">Pajak dan biaya lainnya</span>
                                    <span className="font-semibold">{formatPrice(dummyBookingDetails.taxPrice)}</span>
                                </div>
                                <div className="flex justify-between items-center py-2">
                                    <span className="text-green-600 font-medium">Biaya pemesanan</span>
                                    <span className="text-green-600 font-bold">GRATIS</span>
                                </div>
                                <div className="border-t-2 border-dashed border-gray-200 pt-4 mt-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-2xl font-bold text-gray-800">💰 Harga Total</span>
                                        <span className="text-3xl font-bold text-blue-600">{formatPrice(dummyBookingDetails.totalPrice)}</span>
                                    </div>
                                    <div className="text-xs text-gray-500 mt-2 text-center">
                                        Termasuk di dalam harga Pajak 10%, Biaya layanan 10%
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Trust Badges */}
                        <div className="grid grid-cols-1 gap-6">
                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 text-center border border-gray-200 transform transition-all duration-300 hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Shield className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">🛡️ 103 Juta+ Ulasan Terverifikasi</h4>
                                <p className="text-sm text-gray-600">
                                    Ulasan terpercaya dari tamu asli akan membantu Anda menemukan akomodasi impian.
                                </p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 text-center border border-gray-200 transform transition-all duration-300 hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Award className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">🏆 JAMINAN HARGA TERBAIK</h4>
                                <p className="text-sm text-gray-600">
                                    Kami pastikan Anda mendapatkan harga terbaik, jika ada yang lebih murah di situs lain, kami kembalikan selisihnya.
                                </p>
                            </div>

                            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-xl p-6 text-center border border-gray-200 transform transition-all duration-300 hover:scale-105">
                                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <Clock className="w-8 h-8 text-white" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">⏰ LAYANAN 24/7 GRATIS</h4>
                                <p className="text-sm text-gray-600">
                                    Tersedia dalam 17 bahasa. Kapan pun, di mana pun kami siap membantu Anda.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccommodationBookForm;