import Link from "next/link";
import { 
    BarChart3, 
    Users, 
    Building2, 
    Plus, 
    TrendingUp, 
    Eye, 
    Star,
    MapPin,
    Calendar,
    Activity,
    ArrowUpRight,
    ArrowDownRight,
    MoreVertical,
    Bell,
    Search
    } from "lucide-react";

    export default function AdminPage() {
    // Sample data untuk dashboard
    const stats = [
        {
        title: "Total Users",
        value: "2,847",
        change: "+12.5%",
        trend: "up",
        icon: Users,
        color: "bg-blue-500",
        bgColor: "bg-blue-50",
        textColor: "text-blue-600"
        },
        {
        title: "Total Wisata",
        value: "156",
        change: "+8.2%",
        trend: "up", 
        icon: MapPin,
        color: "bg-green-500",
        bgColor: "bg-green-50",
        textColor: "text-green-600"
        },
        {
        title: "Total Hotel",
        value: "89",
        change: "+5.4%",
        trend: "up",
        icon: Building2,
        color: "bg-purple-500",
        bgColor: "bg-purple-50",
        textColor: "text-purple-600"
        },
        {
        title: "Total Reviews",
        value: "1,247",
        change: "-2.1%",
        trend: "down",
        icon: Star,
        color: "bg-orange-500",
        bgColor: "bg-orange-50",
        textColor: "text-orange-600"
        }
    ];

    const recentActivities = [
        {
        id: 1,
        action: "User baru mendaftar",
        user: "John Doe",
        time: "2 menit lalu",
        type: "user"
        },
        {
        id: 2,
        action: "Review baru ditambahkan",
        user: "Jane Smith",
        time: "15 menit lalu",
        type: "review"
        },
        {
        id: 3,
        action: "Tempat wisata diupdate",
        user: "Admin",
        time: "1 jam lalu",
        type: "update"
        },
        {
        id: 4,
        action: "Hotel baru ditambahkan",
        user: "Admin",
        time: "2 jam lalu",
        type: "hotel"
        }
    ];

    const quickActions = [
        {
        title: "Tambah Wisata",
        description: "Tambahkan tempat wisata baru",
        href: "/admin/add-wisata",
        icon: MapPin,
        color: "bg-blue-500 hover:bg-blue-600",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
        },
        {
        title: "Tambah Hotel",
        description: "Tambahkan hotel baru",
        href: "/admin/add-hotel", 
        icon: Building2,
        color: "bg-green-500 hover:bg-green-600",
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
        },
        {
        title: "Kelola Users",
        description: "Manage pengguna sistem",
        href: "/admin/users",
        icon: Users,
        color: "bg-purple-500 hover:bg-purple-600",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600"
        },
        {
        title: "Lihat Laporan",
        description: "Analytics dan statistik",
        href: "/admin/reports",
        icon: BarChart3,
        color: "bg-orange-500 hover:bg-orange-600",
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
                Selamat datang kembali! Kelola BatamPortal dengan mudah.
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Cari..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                />
                </div>
                
                {/* Notifications */}
                <button className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Bell className="w-6 h-6" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    3
                </span>
                </button>
                
                {/* Quick Action Button */}
                {/* <Link
                href="/form"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
                >
                <Plus className="w-5 h-5" />
                <span>Tambah Data</span>
                </Link> */}
            </div>
            </div>

            {/* Stats Cards */}
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
                        <span className={`text-sm font-medium ${
                        stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
                        }`}>
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
            
            {/* Quick Actions */}
            <div className="lg:col-span-2 space-y-6">
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

                {/* Chart Section */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Analytics Overview</h2>
                    <div className="flex items-center gap-2">
                    <select className="text-sm border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option>7 hari terakhir</option>
                        <option>30 hari terakhir</option>
                        <option>3 bulan terakhir</option>
                    </select>
                    </div>
                </div>
                
                {/* Placeholder untuk chart */}
                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-blue-400 mx-auto mb-3" />
                    <p className="text-gray-600">Chart Analytics</p>
                    <p className="text-sm text-gray-500">Data visualization akan ditampilkan di sini</p>
                    </div>
                </div>
                </div>
            </div>

            {/* Recent Activity Sidebar */}
            <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Recent Activity</h2>
                    <Activity className="w-5 h-5 text-gray-400" />
                </div>
                
                <div className="space-y-4">
                    {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                        activity.type === 'user' ? 'bg-blue-500' :
                        activity.type === 'review' ? 'bg-green-500' :
                        activity.type === 'update' ? 'bg-orange-500' :
                        'bg-purple-500'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{activity.action}</p>
                        <p className="text-xs text-gray-500">oleh {activity.user}</p>
                        <p className="text-xs text-gray-400">{activity.time}</p>
                        </div>
                    </div>
                    ))}
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <Link href="/admin/activity" className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    Lihat semua aktivitas →
                    </Link>
                </div>
                </div>

                {/* System Status */}
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
                    <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Storage</span>
                    <span className="text-sm font-medium text-orange-600">75% Used</span>
                    </div>
                    <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Last Backup</span>
                    <span className="text-sm font-medium text-gray-900">2 jam lalu</span>
                    </div>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}