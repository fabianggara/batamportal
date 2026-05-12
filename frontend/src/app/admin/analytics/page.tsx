import pool from "@/lib/db";
import Link from "next/link";
import { 
    ArrowLeft, 
    BarChart3, 
    Users, 
    Building2, 
    Star, 
    MousePointerClick,
    TrendingUp,
    Calendar,
    Filter,
    Utensils // <--- Tambahan ikon Utensils untuk Kuliner
} from "lucide-react";

export default async function AnalyticsPage({
    searchParams,
}: {
    searchParams: Promise<{ days?: string }>; // FIX NEXT.JS 15: searchParams Promise
}) {
    // 1. TANGKAP FILTER WAKTU DARI URL (Default: 7 Hari)
    const resolvedParams = await searchParams;
    const filterDays = parseInt(resolvedParams?.days || "7");
    // Pastikan angka valid agar tidak error
    const safeDays = [7, 14, 30].includes(filterDays) ? filterDays : 7;

    // ============================================================================
    // 2. KUMPULAN KUERI SQL (MENGAMBIL TOTAL & DATA BERDASARKAN FILTER HARI)
    // ============================================================================
    
    // Data Akun Baru (Users)
    const [userStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) THEN 1 ELSE 0 END) as period_count
        FROM users
    `, [safeDays]);

    // Data Hotel/Akomodasi (Businesses category_id = 1)
    const [hotelStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) THEN 1 ELSE 0 END) as period_count
        FROM businesses 
        WHERE category_id = 1
    `, [safeDays]);

    // Data Kuliner (Businesses category_id = 2)
    const [kulinerStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) THEN 1 ELSE 0 END) as period_count
        FROM businesses 
        WHERE category_id = 2
    `, [safeDays]);

    // Data Review
    const [reviewStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) THEN 1 ELSE 0 END) as period_count
        FROM reviews
    `, [safeDays]);

    // Data Pengunjung (Interaksi tipe 'visit')
    const [visitStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN created_at >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) THEN 1 ELSE 0 END) as period_count
        FROM user_interactions 
        WHERE interaction_type = 'visit'
    `, [safeDays]);

    // ============================================================================
    // 3. PERSIAPAN DATA UNTUK UI
    // ============================================================================
    
    const metrics = [
        {
            title: "Total Pengunjung",
            total: visitStats[0]?.total || 0,
            periodCount: visitStats[0]?.period_count || 0,
            icon: MousePointerClick,
            color: "text-blue-600",
            barColor: "bg-blue-600", 
            bg: "bg-blue-100",
            border: "border-blue-200"
        },
        {
            title: "Akun Pengguna Baru",
            total: userStats[0]?.total || 0,
            periodCount: userStats[0]?.period_count || 0,
            icon: Users,
            color: "text-purple-600",
            barColor: "bg-purple-600",
            bg: "bg-purple-100",
            border: "border-purple-200"
        },
        {
            title: "Hotel Terdaftar",
            total: hotelStats[0]?.total || 0,
            periodCount: hotelStats[0]?.period_count || 0,
            icon: Building2,
            color: "text-green-600",
            barColor: "bg-green-600", 
            bg: "bg-green-100",
            border: "border-green-200"
        },
        {
            title: "Kuliner Terdaftar",
            total: kulinerStats[0]?.total || 0,
            periodCount: kulinerStats[0]?.period_count || 0,
            icon: Utensils,
            color: "text-pink-600",
            barColor: "bg-pink-600", 
            bg: "bg-pink-100",
            border: "border-pink-200"
        },
        {
            title: "Ulasan Diberikan",
            total: reviewStats[0]?.total || 0,
            periodCount: reviewStats[0]?.period_count || 0,
            icon: Star,
            color: "text-yellow-600",
            barColor: "bg-yellow-600", 
            bg: "bg-yellow-100",
            border: "border-yellow-200"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 pb-12">
            <div className="max-w-6xl mx-auto space-y-8">
                
                {/* --- HEADER & FILTER --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin" 
                            className="p-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <BarChart3 className="w-6 h-6 text-blue-600" />
                                Laporan & Analitik
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                Pantau pertumbuhan data platform Batam Portal.
                            </p>
                        </div>
                    </div>
                    
                    {/* TOMBOL FILTER HARI */}
                    <div className="flex items-center bg-gray-100 p-1 rounded-lg border border-gray-200">
                        <Link 
                            href="?days=7" 
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${safeDays === 7 ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            7 Hari
                        </Link>
                        <Link 
                            href="?days=14" 
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${safeDays === 14 ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            14 Hari
                        </Link>
                        <Link 
                            href="?days=30" 
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${safeDays === 30 ? 'bg-white shadow text-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                        >
                            30 Hari
                        </Link>
                    </div>
                </div>

                {/* --- KARTU METRIK UTAMA --- */}
                {/* Diubah ke lg:grid-cols-5 agar 5 kotak berjejer rapi */}
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                    {metrics.map((metric, index) => {
                        const Icon = metric.icon;
                        const percentage = metric.total > 0 
                            ? Math.round((metric.periodCount / metric.total) * 100) 
                            : 0;

                        return (
                            <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-xl ${metric.bg} ${metric.color}`}>
                                        <Icon className="w-6 h-6" />
                                    </div>
                                </div>
                                
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">{metric.title}</p>
                                    <h3 className="text-3xl font-bold text-gray-900">{metric.total.toLocaleString('id-ID')}</h3>
                                </div>

                                <div className={`mt-4 pt-4 border-t ${metric.border} flex items-center justify-between`}>
                                    <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                                        <TrendingUp className="w-4 h-4 text-green-500" />
                                        <span>+{metric.periodCount} baru</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded-md">
                                        {percentage}% dari total
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* --- VISUALISASI DATA (CSS BAR CHART HORIZONTAL) --- */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                        <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-blue-500" />
                            Rasio Pertumbuhan
                        </h2>
                        <span className="text-xs font-medium bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                            Dalam {safeDays} hari terakhir
                        </span>
                    </div>
                    
                    <div className="space-y-6">
                        {metrics.map((metric, index) => {
                            const maxPeriodCount = Math.max(...metrics.map(m => Number(m.periodCount) || 0), 1);
                            const barWidth = Math.round((metric.periodCount / maxPeriodCount) * 100);

                            return (
                                <div key={index} className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium">
                                        <span className="text-gray-700 flex items-center gap-2">
                                            <metric.icon className={`w-4 h-4 ${metric.color}`} />
                                            {metric.title} Baru
                                        </span>
                                        <span className="text-gray-900 font-bold">{metric.periodCount} data</span>
                                    </div>
                                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-100">
                                        <div 
                                            className={`h-full rounded-full transition-all duration-1000 ${metric.barColor}`} 
                                            style={{ width: `${barWidth}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

            </div>
        </div>
    );
}