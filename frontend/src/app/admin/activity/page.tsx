import pool from "@/lib/db";
import { 
    Activity, 
    Calendar, 
    Clock, 
    MapPin, 
    Heart,
    User,
    ArrowLeft,
    MessageSquare // <-- Tambahkan ikon komentar/ulasan
} from "lucide-react";
import Link from "next/link";

export default async function ActivityPage() {
    // MENGGUNAKAN UNION ALL UNTUK MENGGABUNGKAN INTERAKSI & ULASAN
    const [activitiesData]: any = await pool.query(`
        SELECT * FROM (
            -- 1. Ambil data dari tabel user_interactions (Visit & Like)
            SELECT 
                ui.id, 
                u.name as user_name, 
                u.email as user_email, 
                b.name as business_name, 
                ui.interaction_type, 
                ui.created_at as time
            FROM user_interactions ui
            JOIN users u ON ui.user_id = u.id
            JOIN businesses b ON ui.business_id = b.id

            UNION ALL

            -- 2. Ambil data dari tabel reviews (Ulasan)
            -- Kita buat interaction_type manual bernama 'review'
            SELECT 
                r.id, 
                u.name as user_name, 
                u.email as user_email, 
                b.name as business_name, 
                'review' as interaction_type, 
                r.created_at as time
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            JOIN businesses b ON r.business_id = b.id
        ) AS combined_activities
        ORDER BY time DESC
        LIMIT 100
    `);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-5xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/admin" 
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Activity className="w-6 h-6 text-blue-500" />
                            Log Aktivitas Pengguna
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Pantau riwayat interaksi dan ulasan pengguna pada destinasi.
                        </p>
                    </div>
                </div>

                {/* List Aktivitas */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                        <h2 className="font-semibold text-gray-800">100 Aktivitas Terbaru</h2>
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                            Real-time
                        </span>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {activitiesData.length > 0 ? (
                            activitiesData.map((activity: any, index: number) => {
                                // Format Waktu
                                const dateObj = new Date(activity.time);
                                const dateFormatted = dateObj.toLocaleDateString('id-ID', { 
                                    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
                                });
                                const timeFormatted = dateObj.toLocaleTimeString('id-ID', { 
                                    hour: '2-digit', minute: '2-digit' 
                                });

                                // Logika penentuan tipe interaksi
                                const isLike = activity.interaction_type === 'like';
                                const isReview = activity.interaction_type === 'review';
                                const isVisit = activity.interaction_type === 'visit';

                                // Tentukan warna dan ikon berdasarkan tipe
                                let iconBgColor = 'bg-blue-100 text-blue-500';
                                let IconComponent = MapPin;
                                let actionText = 'mengunjungi halaman';

                                if (isLike) {
                                    iconBgColor = 'bg-red-100 text-red-500';
                                    IconComponent = Heart;
                                    actionText = 'menyukai destinasi';
                                } else if (isReview) {
                                    iconBgColor = 'bg-yellow-100 text-yellow-600';
                                    IconComponent = MessageSquare;
                                    actionText = 'memberikan ulasan di';
                                }

                                return (
                                    // Gunakan kombinasi index dan id untuk key agar aman setelah UNION
                                    <div key={`${activity.interaction_type}-${activity.id}-${index}`} className="p-4 hover:bg-gray-50 transition-colors flex items-start gap-4">
                                        
                                        {/* Ikon Aktivitas */}
                                        <div className={`p-3 rounded-full flex-shrink-0 mt-1 ${iconBgColor}`}>
                                            <IconComponent className={`w-5 h-5 ${isLike ? 'fill-current' : ''}`} />
                                        </div>

                                        {/* Detail Aktivitas */}
                                        <div className="flex-1">
                                            <p className="text-gray-800">
                                                <span className="font-semibold text-gray-900">{activity.user_name}</span> 
                                                <span className="text-gray-500 mx-1">
                                                    {actionText}
                                                </span> 
                                                <span className="font-semibold text-gray-900">{activity.business_name}</span>
                                            </p>
                                            
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <User className="w-3 h-3" />
                                                    {activity.user_email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {dateFormatted}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-3 h-3" />
                                                    {timeFormatted} WIB
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
                                <Activity className="w-12 h-12 text-gray-300 mb-3" />
                                <p>Belum ada aktivitas yang terekam.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}