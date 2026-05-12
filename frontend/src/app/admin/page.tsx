import Link from "next/link";
// Import koneksi database yang tadi dibuat
import pool from "@/lib/db"; 
import { 
    BarChart3, 
    Users, 
    Building2, 
    MapPin,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Bell,
    Search,
    Star,
    Heart,
    Utensils,
    Activity,
    MousePointerClick
} from "lucide-react";

// FIX NEXT.JS 15: searchParams harus berupa Promise
export default async function AdminDashboard({ searchParams }: { searchParams: Promise<{ days?: string }> }) {
    // Tunggu (await) parameter dari URL untuk mengatasi error
    const resolvedParams = await searchParams;

    // 1. QUERY KE DATABASE MYSQL
    // Mengambil total counts dari masing-masing tabel
    const [userCountRows]: any = await pool.query('SELECT COUNT(*) as count FROM users');
    const [wisataCountRows]: any = await pool.query('SELECT COUNT(*) as count FROM businesses WHERE category_id = 3');
    const [hotelCountRows]: any = await pool.query('SELECT COUNT(*) as count FROM businesses WHERE category_id = 1');
    const [reviewCountRows]: any = await pool.query('SELECT COUNT(*) as count FROM reviews');

    // Mengambil aktivitas terbaru
    const [recentActivitiesData]: any = await pool.query(`
        SELECT ui.id, u.name as user, b.name as action, ui.interaction_type, ui.created_at as time
        FROM user_interactions ui
        JOIN users u ON ui.user_id = u.id
        JOIN businesses b ON ui.business_id = b.id
        ORDER BY ui.created_at DESC
        LIMIT 4
    `);

    const [realNotificationsData]: any = await pool.query(`
        SELECT * FROM (
            SELECT ui.id, u.name as user_name, b.name as target_name, ui.interaction_type as type, ui.created_at as time
            FROM user_interactions ui JOIN users u ON ui.user_id = u.id JOIN businesses b ON ui.business_id = b.id
            
            UNION ALL
            
            SELECT r.id, u.name as user_name, b.name as target_name, 'review' as type, r.created_at as time
            FROM reviews r JOIN users u ON r.user_id = u.id JOIN businesses b ON r.business_id = b.id
            
            UNION ALL
            
            SELECT b.id, 'Sistem' as user_name, b.name as target_name, 'pending' as type, b.created_at as time
            FROM businesses b WHERE b.status = 'pending'
        ) AS combined_notifs
        ORDER BY time DESC
        LIMIT 5
    `);

    // Format data notifikasi agar siap ditampilkan
    const realNotifications = realNotificationsData.map((notif: any, index: number) => {
        let text = "";
        let colorClass = "";
        let IconComponent = Activity;

        if (notif.type === 'like') { 
            text = `${notif.user_name} menyukai ${notif.target_name}`;
            colorClass = "bg-red-100 text-red-600";
            IconComponent = Heart;
        } else if (notif.type === 'visit') { 
            text = `${notif.user_name} mengunjungi ${notif.target_name}`;
            colorClass = "bg-blue-100 text-blue-600";
            IconComponent = MapPin;
        } else if (notif.type === 'review') { 
            text = `${notif.user_name} memberikan ulasan untuk ${notif.target_name}`;
            colorClass = "bg-yellow-100 text-yellow-600";
            IconComponent = Star;
        } else if (notif.type === 'pending') { 
            text = `Bisnis baru "${notif.target_name}" menunggu persetujuan.`;
            colorClass = "bg-orange-100 text-orange-600";
            IconComponent = Building2;
        }

        const dateObj = new Date(notif.time);
        const timeStr = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';

        return { id: `${notif.type}-${notif.id}-${index}`, text, time: timeStr, colorClass, Icon: IconComponent };
    });

    // 1. QUERY KE DATABASE MYSQL DENGAN PERBANDINGAN BULANAN
    const [userStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as current_month,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as previous_month
        FROM users
    `);

    const [akomodasiStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as current_month,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as previous_month
        FROM businesses 
        WHERE category_id = 1
    `);

    const [kulinerStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as current_month,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as previous_month
        FROM businesses 
        WHERE category_id = 2
    `);

    const [reviewStats]: any = await pool.query(`
        SELECT 
            COUNT(*) as total,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) AND YEAR(created_at) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END) as current_month,
            SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE() - INTERVAL 1 MONTH) AND YEAR(created_at) = YEAR(CURRENT_DATE() - INTERVAL 1 MONTH) THEN 1 ELSE 0 END) as previous_month
        FROM reviews
    `);

    // FUNGSI PINTAR MENGHITUNG SELISIH ANGKA
    const calculateTrend = (curr: number, prev: number) => {
        const current = Number(curr) || 0;
        const previous = Number(prev) || 0;
        const diff = current - previous;
        const isUp = diff >= 0;
        
        return { 
            change: `${isUp ? '+' : ''}${diff}`, 
            trend: isUp ? "up" : "down" 
        };
    };

    // Susun Data Stats untuk UI
    const stats = [
        {
            title: "Total Users",
            value: (userStats[0]?.total || 0).toString(),
            change: calculateTrend(userStats[0]?.current_month, userStats[0]?.previous_month).change,
            trend: calculateTrend(userStats[0]?.current_month, userStats[0]?.previous_month).trend,
            icon: Users,
            color: "bg-blue-500",
            bgColor: "bg-blue-50",
            textColor: "text-blue-600"
        },
        {
            title: "Total Akomodasi",
            value: (akomodasiStats[0]?.total || 0).toString(),
            change: calculateTrend(akomodasiStats[0]?.current_month, akomodasiStats[0]?.previous_month).change,
            trend: calculateTrend(akomodasiStats[0]?.current_month, akomodasiStats[0]?.previous_month).trend,
            icon: Building2,
            color: "bg-green-500",
            bgColor: "bg-green-50",
            textColor: "text-green-600"
        },
        {
            title: "Total Kuliner",
            value: (kulinerStats[0]?.total || 0).toString(),
            change: calculateTrend(kulinerStats[0]?.current_month, kulinerStats[0]?.previous_month).change,
            trend: calculateTrend(kulinerStats[0]?.current_month, kulinerStats[0]?.previous_month).trend, 
            icon: Utensils, 
            color: "bg-purple-500",
            bgColor: "bg-purple-50",
            textColor: "text-purple-600"
        },
        {
            title: "Total Reviews",
            value: (reviewStats[0]?.total || 0).toString(),
            change: calculateTrend(reviewStats[0]?.current_month, reviewStats[0]?.previous_month).change,
            trend: calculateTrend(reviewStats[0]?.current_month, reviewStats[0]?.previous_month).trend,
            icon: Star,
            color: "bg-orange-500",
            bgColor: "bg-orange-50",
            textColor: "text-orange-600"
        }
    ];

    // ==========================================
    // LOGIKA CHART MINI UNTUK DASHBOARD UTAMA
    // ==========================================
    const filterDays = parseInt(resolvedParams?.days || "7");
    const safeDays = [7, 14, 30].includes(filterDays) ? filterDays : 7;

    const getDailyData = async (table: string, dateCol = 'created_at', extraWhere = '') => {
        const [rows]: any = await pool.query(`
            SELECT DATE_FORMAT(${dateCol}, '%Y-%m-%d') as dateStr, COUNT(*) as count
            FROM ${table}
            WHERE ${dateCol} >= DATE_SUB(CURRENT_DATE(), INTERVAL ? DAY) ${extraWhere}
            GROUP BY dateStr
        `, [safeDays - 1]);
        return rows;
    };

    // TAMBAHAN: Ambil juga data harian untuk Kuliner (category_id = 2)
    const [usersDaily, hotelsDaily, kulinerDaily, reviewsDaily, visitsDaily] = await Promise.all([
        getDailyData('users'),
        getDailyData('businesses', 'created_at', 'AND category_id = 1'),
        getDailyData('businesses', 'created_at', 'AND category_id = 2'), // <--- Data Kuliner
        getDailyData('reviews'),
        getDailyData('user_interactions', 'created_at', "AND interaction_type = 'visit'")
    ]);

    const chartData = [];
    
    for (let i = safeDays - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

        const uCount = usersDaily.find((r: any) => r.dateStr === dateStr)?.count || 0;
        const hCount = hotelsDaily.find((r: any) => r.dateStr === dateStr)?.count || 0;
        const kCount = kulinerDaily.find((r: any) => r.dateStr === dateStr)?.count || 0; // <--- Data Kuliner
        const rCount = reviewsDaily.find((r: any) => r.dateStr === dateStr)?.count || 0;
        const vCount = visitsDaily.find((r: any) => r.dateStr === dateStr)?.count || 0;

        chartData.push({ 
            date: dateStr, 
            displayDate, 
            users: uCount, 
            hotels: hCount, 
            culinary: kCount, // <--- Dimasukkan ke chartData
            reviews: rCount, 
            visits: vCount 
        });
    }

    // Format data aktivitas terbaru
    const recentActivities = recentActivitiesData.map((activity: any) => {
        const date = new Date(activity.time);
        const formattedTime = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

        let actionText = "";
        let typeColor = "";

        if(activity.interaction_type === 'visit') {
            actionText = `Mengunjungi ${activity.action}`;
            typeColor = 'bg-blue-500';
        } else if (activity.interaction_type === 'like') {
            actionText = `Menyukai ${activity.action}`;
            typeColor = 'bg-red-500';
        }

        return {
            id: activity.id,
            action: actionText,
            user: activity.user,
            time: formattedTime,
            color: typeColor
        };
    });

    const quickActions = [
        {
            title: "Data Destinasi",
            description: "Kelola seluruh data tempat",
            icon: MapPin, 
            href: "admin/businesses",
            iconBg: "bg-blue-100",
            iconColor: "text-blue-600"
        },
        {
            title: "Lihat Reviews",
            description: "Pantau ulasan dari pengguna",
            icon: Star,
            href: "admin/reviews",
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600"
        },
        {
            title: "Kelola Users",
            description: "Manage pengguna sistem",
            icon: Users,
            href: "admin/usersTable",
            iconBg: "bg-purple-100",
            iconColor: "text-purple-600"
        },
        {
            title: "Lihat Laporan",
            description: "Analytics dan statistik",
            icon: BarChart3,
            href: "admin/analytics",
            iconBg: "bg-orange-100",
            iconColor: "text-orange-600"
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                            Dashboard Admin
                        </h1>
                        <p className="text-gray-600 mt-2">
                            Selamat datang kembali! Kelola Batam Portal dengan mudah.
                        </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        
                        {/* Search Bar */}
                        <form action="/admin/destinations" method="GET" className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                name="search"
                                placeholder="Cari... (Tekan Enter)"
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64 text-sm bg-white"
                            />
                        </form>
                        
                        {/* NOTIFICATIONS & DROPDOWN */}
                        <div className="relative group">
                            
                            {/* FIX 1: type diubah jadi "radio" agar tidak bisa di-uncheck */}
                            <input type="radio" name="notif-read" id="read-notif" className="peer hidden" />
                            
                            <label htmlFor="read-notif" className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer block">
                                <Bell className="w-6 h-6" />
                            </label>

                            {/* Badge Merah */}
                            {realNotifications.length > 0 && (
                                <div className="absolute -top-1 -right-1 pointer-events-none peer-checked:hidden transition-all duration-300">
                                    <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-sm">
                                        {realNotifications.length}
                                    </span>
                                </div>
                            )}

                            {/* Dropdown Notifikasi */}
                            <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
                                    <h3 className="font-semibold text-gray-800 text-sm">Notifikasi Terbaru</h3>
                                    <span className="text-[10px] text-gray-400">Klik lonceng tandai dibaca</span>
                                </div>
                                
                                <div className="max-h-80 overflow-y-auto">
                                    {realNotifications.length > 0 ? (
                                        realNotifications.map((notif: any) => {
                                            const Icon = notif.Icon;
                                            return (
                                                <div key={notif.id} className="p-4 border-b border-gray-50 flex gap-3 hover:bg-gray-50 transition-colors cursor-default">
                                                    <div className={`mt-0.5 p-2 rounded-full flex-shrink-0 h-fit ${notif.colorClass}`}>
                                                        <Icon className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-800 leading-snug">{notif.text}</p>
                                                        <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    ) : (
                                        <div className="p-6 text-center text-gray-500 text-sm">
                                            Tidak ada notifikasi baru.
                                        </div>
                                    )}
                                </div>
                                
                                <div className="p-3 text-center border-t border-gray-100 bg-gray-50">
                                    <Link href="/admin/activity" className="text-sm text-blue-600 font-medium hover:text-blue-800">
                                        Lihat Semua Aktivitas
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards Dinamis */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                                        <Icon className={`w-6 h-6 ${stat.textColor}`} />
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <div className="space-y-2">
                                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                    <p className="text-sm text-gray-600">{stat.title}</p>
                                    
                                    <div className="flex items-center gap-1">
                                        {stat.trend === 'up' ? (
                                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`text-sm font-medium ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                                            {stat.change}
                                        </span>
                                        <span className="text-sm text-gray-500">dari bulan lalu</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* BAGIAN KIRI (Span 2) */}
                    <div className="lg:col-span-2 space-y-6">
                        
                        {/* Quick Actions */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
                                <Link href="/admin/all-actions" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    Lihat Semua
                                </Link>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {quickActions.map((action, index) => {
                                    const Icon = action.icon;
                                    return (
                                        <Link
                                            key={index}
                                            href={action.href}
                                            className="group p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all duration-200"
                                        >
                                            <div className="flex items-start gap-4">
                                                <div className={`p-2 rounded-lg ${action.iconBg} group-hover:scale-110 transition-transform`}>
                                                    <Icon className={`w-5 h-5 ${action.iconColor}`} />
                                                </div>
                                                <div className="flex-1">
                                                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {action.title}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 mt-1">
                                                        {action.description}
                                                    </p>
                                                </div>
                                                <ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>

                        {/* FIX 2: CHART MINI YANG BERFUNGSI (HORIZONTAL) DENGAN KULINER */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 border-b border-gray-100 pb-4 gap-4">
                                <div>
                                    <h2 className="text-xl font-semibold text-gray-900">Rasio Pertumbuhan</h2>
                                    <p className="text-xs text-gray-500 mt-1">Dalam {safeDays} hari terakhir</p>
                                </div>
                                
                                <div className="flex bg-gray-50 border border-gray-200 rounded-lg p-1">
                                    <Link href="?days=7" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${safeDays === 7 ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>7 Hari</Link>
                                    <Link href="?days=14" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${safeDays === 14 ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>14 Hari</Link>
                                    <Link href="?days=30" className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${safeDays === 30 ? 'bg-white shadow text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}>30 Hari</Link>
                                </div>
                            </div>
                            
                            <div className="space-y-6">
                                {(() => {
                                    // Hitung total periode
                                    const periodVisits = chartData.reduce((sum, d) => sum + d.visits, 0);
                                    const periodUsers = chartData.reduce((sum, d) => sum + d.users, 0);
                                    const periodHotels = chartData.reduce((sum, d) => sum + d.hotels, 0);
                                    const periodCulinary = chartData.reduce((sum, d) => sum + d.culinary, 0); // <--- Data Kuliner
                                    const periodReviews = chartData.reduce((sum, d) => sum + d.reviews, 0);

                                    const miniMetrics = [
                                        { title: "Total Pengunjung Baru", count: periodVisits, color: "bg-blue-600", textCol: "text-blue-600", icon: MousePointerClick },
                                        { title: "Akun Pengguna Baru", count: periodUsers, color: "bg-purple-600", textCol: "text-purple-600", icon: Users },
                                        { title: "Hotel Terdaftar Baru", count: periodHotels, color: "bg-green-600", textCol: "text-green-600", icon: Building2 },
                                        { title: "Kuliner Terdaftar Baru", count: periodCulinary, color: "bg-pink-500", textCol: "text-pink-600", icon: Utensils }, // <--- Baris Kuliner
                                        { title: "Ulasan Diberikan Baru", count: periodReviews, color: "bg-yellow-500", textCol: "text-yellow-600", icon: Star }
                                    ];

                                    const maxCount = Math.max(...miniMetrics.map(m => m.count), 1);

                                    return miniMetrics.map((metric, idx) => {
                                        const barWidth = Math.round((metric.count / maxCount) * 100);
                                        return (
                                            <div key={idx} className="space-y-2">
                                                <div className="flex justify-between text-sm font-medium">
                                                    <span className="text-gray-700 flex items-center gap-2">
                                                        <metric.icon className={`w-4 h-4 ${metric.textCol}`} />
                                                        {metric.title}
                                                    </span>
                                                    <span className="text-gray-900 font-bold">{metric.count} data</span>
                                                </div>
                                                <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden border border-gray-200">
                                                    <div 
                                                        className={`h-full rounded-full transition-all duration-1000 ${metric.color}`}
                                                        style={{ width: `${barWidth}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        </div>

                    </div> 
                    {/* AKHIR BAGIAN KIRI */}

                    {/* BAGIAN KANAN (Span 1) */}
                    <div className="space-y-6">
                        
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                                <Activity className="w-5 h-5 text-gray-400" />
                            </div>
                            
                            <div className="space-y-4">
                                {recentActivities.length > 0 ? recentActivities.map((activity: any) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                                        <div className={`w-2 h-2 rounded-full mt-2 ${activity.color}`}></div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-gray-900 truncate">{activity.action}</p>
                                            <p className="text-xs text-gray-500">oleh {activity.user}</p>
                                            <p className="text-xs text-gray-400">{activity.time}</p>
                                        </div>
                                    </div>
                                )) : (
                                    <p className="text-sm text-gray-500 text-center py-4">Belum ada aktivitas.</p>
                                )}
                            </div>
                            
                            <div className="mt-4 pt-4 border-t border-gray-200">
                                <Link href="/admin/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                                    Lihat semua aktivitas →
                                </Link>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-semibold text-gray-900">System Status</h2>
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Server Status</span>
                                    <span className="text-sm font-medium text-green-600">Online</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Database</span>
                                    <span className="text-sm font-medium text-green-600">Connected</span>
                                </div>
                            </div>
                        </div>

                    </div>
                    {/* AKHIR BAGIAN KANAN */}

                </div>
            </div>
        </div>
    );
}