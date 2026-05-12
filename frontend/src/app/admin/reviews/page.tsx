import pool from "@/lib/db";
import { 
    Star, 
    MessageSquare, 
    Calendar, 
    ArrowLeft,
    User,
    MapPin
} from "lucide-react";
import Link from "next/link";

export default async function AdminReviewsPage() {
    // Mengambil data ulasan beserta info user dan bisnis
    // Catatan: Pastikan nama kolom foto profil di tabel users Anda sesuai. 
    // Di sini saya asumsikan namanya 'profile_picture'. Ubah jika namanya 'avatar' atau 'photo'.
    const [reviewsData]: any = await pool.query(`
        SELECT 
            r.id, 
            r.rating, 
            r.comment, 
            r.created_at, 
            u.name as user_name, 
            u.email as user_email,
            u.profile_picture as user_photo, 
            b.name as business_name,
            c.name as category_name
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        JOIN businesses b ON r.business_id = b.id
        LEFT JOIN categories c ON b.category_id = c.id
        ORDER BY r.created_at DESC
        LIMIT 100
    `);

    // Fungsi kecil untuk memastikan URL foto profil benar (apakah dari Google atau Upload Lokal)
    const getAvatarUrl = (photoUrl: string) => {
        if (!photoUrl) return null;
        if (photoUrl.startsWith('http')) return photoUrl; // Jika dari Google OAuth
        return `http://localhost:5000/uploads/${photoUrl}`; // Jika upload manual ke server
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* Header Section */}
                <div className="flex items-center gap-4 mb-8">
                    <Link 
                        href="/admin" 
                        className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                    >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <MessageSquare className="w-6 h-6 text-yellow-500" />
                            Kelola Ulasan Pengguna
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Pantau semua ulasan, rating bintang, dan komentar dari pengguna.
                        </p>
                    </div>
                </div>

                {/* Grid Ulasan */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {reviewsData.length > 0 ? (
                        reviewsData.map((review: any) => {
                            // Format Tanggal
                            const dateObj = new Date(review.created_at);
                            const dateFormatted = dateObj.toLocaleDateString('id-ID', { 
                                day: 'numeric', month: 'long', year: 'numeric' 
                            });

                            const avatarUrl = getAvatarUrl(review.user_photo);

                            return (
                                <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                                    
                                    {/* Bagian Atas: Profil User & Waktu */}
                                    <div className="p-5 border-b border-gray-50 flex justify-between items-start bg-gray-50/50">
                                        <div className="flex items-center gap-3">
                                            {/* Foto Profil */}
                                            {avatarUrl ? (
                                                <img 
                                                    src={avatarUrl} 
                                                    alt={review.user_name} 
                                                    className="w-10 h-10 rounded-full object-cover border border-gray-200"
                                                />
                                            ) : (
                                                <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200">
                                                    <User className="w-5 h-5" />
                                                </div>
                                            )}
                                            
                                            <div>
                                                <h3 className="font-bold text-gray-800 text-sm">{review.user_name}</h3>
                                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                                    <Calendar className="w-3 h-3" />
                                                    {dateFormatted}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bagian Tengah: Rating & Komentar */}
                                    <div className="p-5 flex-1 flex flex-col">
                                        {/* Bintang */}
                                        <div className="flex items-center gap-1 mb-3">
                                            {[...Array(5)].map((_, i) => (
                                                <Star 
                                                    key={i} 
                                                    className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                                                />
                                            ))}
                                            <span className="text-xs font-bold text-gray-700 ml-2 bg-yellow-100 px-2 py-0.5 rounded">
                                                {review.rating.toFixed(1)}
                                            </span>
                                        </div>

                                        {/* Teks Komentar */}
                                        <p className="text-gray-700 text-sm leading-relaxed mb-4 italic">
                                            "{review.comment}"
                                        </p>
                                    </div>

                                    {/* Bagian Bawah: Destinasi yang Diulas */}
                                    <div className="px-5 py-3 bg-blue-50/50 border-t border-blue-100 mt-auto flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0" />
                                        <div className="min-w-0">
                                            <p className="text-xs text-blue-800 font-semibold truncate">
                                                {review.business_name}
                                            </p>
                                            <p className="text-[10px] text-blue-600 uppercase tracking-wider font-bold">
                                                {review.category_name || 'Umum'}
                                            </p>
                                        </div>
                                    </div>

                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full bg-white p-12 rounded-xl border border-gray-200 text-center flex flex-col items-center shadow-sm">
                            <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
                            <h3 className="text-lg font-bold text-gray-700 mb-2">Belum Ada Ulasan</h3>
                            <p className="text-gray-500">Saat ini belum ada pengguna yang memberikan ulasan untuk destinasi manapun.</p>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}