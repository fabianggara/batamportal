import pool from "@/lib/db";
import { revalidatePath } from "next/cache"; // <--- TAMBAHKAN INI
import { 
    MapPin, Search, Plus, Building2, Utensils, 
    Star, Edit, Trash2, ArrowLeft
} from "lucide-react";
import Link from "next/link";

export default async function DestinationsPage({
    searchParams,
}: {
    searchParams: { search?: string };
}) {
    // --- SERVER ACTION UNTUK HAPUS DATA ---
    async function deleteDestination(formData: FormData) {
        "use server";
        const id = formData.get("id");
        if (id) {
            try {
                // Hapus data dari database
                await pool.query("DELETE FROM businesses WHERE id = ?", [id]);
                // Refresh halaman secara otomatis agar data yang dihapus hilang dari tabel
                revalidatePath("/admin/destinations"); 
            } catch (error) {
                console.error("Gagal menghapus data:", error);
            }
        }
    }

    // Tangkap kata kunci dari URL (?search=...)
    const searchQuery = searchParams?.search || "";

    // Siapkan Kueri Database
    // Kita tetap mengunci pencarian HANYA untuk kategori 1 (Akomodasi) dan 2 (Kuliner)
    let sqlQuery = `
        SELECT 
            b.id, 
            b.name, 
            b.address, 
            b.status, 
            COALESCE(b.average_rating, 0) as rating, 
            b.category_id,
            c.name as category_name
        FROM businesses b
        LEFT JOIN categories c ON b.category_id = c.id
        WHERE b.category_id IN (1, 2)
    `;

    const queryParams: any[] = [];

    // Jika admin sedang mencari sesuatu, tambahkan filter LIKE
    if (searchQuery) {
        sqlQuery += ` AND (b.name LIKE ? OR b.address LIKE ?)`;
        queryParams.push(`%${searchQuery}%`, `%${searchQuery}%`);
    }

    sqlQuery += ` ORDER BY b.created_at DESC LIMIT 100`;

    // Eksekusi Kueri
    const [destinations]: any = await pool.query(sqlQuery, queryParams);

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">
                
                {/* --- HEADER SECTION --- */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        <Link 
                            href="/admin" 
                            className="p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors shadow-sm"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <MapPin className="w-6 h-6 text-blue-500" />
                                Kelola Destinasi
                            </h1>
                            <p className="text-sm text-gray-600 mt-1">
                                {searchQuery 
                                    ? `Menampilkan hasil pencarian untuk: "${searchQuery}"` 
                                    : "Kelola semua data akomodasi dan kuliner di sistem."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Tombol Tambah Destinasi */}
                        {/* Sesuaikan '/admin/businesses/create' jika folder Anda tidak ada di dalam folder admin */}
                        <Link 
                            href="/admin/businesses/create" 
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-sm"
                        >
                            <Plus className="w-4 h-4" /> Tambah Baru
                        </Link>
                    </div>
                </div>

                {/* --- PENCARIAN & FILTER DALAM HALAMAN --- */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center gap-4">
                    <form action="/admin/destinations" method="GET" className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            name="search"
                            defaultValue={searchQuery}
                            placeholder="Cari nama tempat atau alamat..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        />
                    </form>
                    
                    {/* Tombol Reset muncul jika sedang mencari */}
                    {searchQuery && (
                        <Link 
                            href="/admin/destinations" 
                            className="text-sm text-red-500 hover:text-red-700 font-medium px-3 py-2 bg-red-50 rounded-lg transition-colors"
                        >
                            Clear Pencarian
                        </Link>
                    )}
                </div>

                {/* --- TABEL DATA DESTINASI --- */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-600">
                            <thead className="bg-gray-50 border-b border-gray-200 text-gray-800 font-semibold">
                                <tr>
                                    <th className="px-6 py-4">Nama Destinasi</th>
                                    <th className="px-6 py-4">Kategori</th>
                                    <th className="px-6 py-4">Rating</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {destinations.length > 0 ? (
                                    destinations.map((item: any) => (
                                        <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                            
                                            <td className="px-6 py-4">
                                                <div className="font-semibold text-gray-900">{item.name}</div>
                                                <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">{item.address}</div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    {item.category_id === 1 ? (
                                                        <div className="p-1.5 bg-blue-100 text-blue-600 rounded"><Building2 className="w-4 h-4"/></div>
                                                    ) : (
                                                        <div className="p-1.5 bg-orange-100 text-orange-600 rounded"><Utensils className="w-4 h-4"/></div>
                                                    )}
                                                    <span className="font-medium">{item.category_name}</span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-1 font-semibold text-gray-800">
                                                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                                    {Number(item.rating).toFixed(1)}
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                    item.status === 'approved' 
                                                    ? 'bg-green-100 text-green-700' 
                                                    : item.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                                }`}>
                                                    {item.status.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    
                                                    <Link 
                                                        href={`/admin/businesses/edit/${item.id}`} 
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" 
                                                        title="Edit"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Link>

                                                    <a 
                                                        href={`#delete-modal-${item.id}`}
                                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors" 
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </a>

                                                    <div 
                                                        id={`delete-modal-${item.id}`} 
                                                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 opacity-0 pointer-events-none target:opacity-100 target:pointer-events-auto transition-all duration-200 text-left"
                                                    >
                                                        <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm mx-4">
                                                            <h3 className="text-lg font-bold text-gray-900 mb-2">Konfirmasi Hapus</h3>
                                                            <p className="text-gray-600 text-sm mb-6 whitespace-normal leading-relaxed">
                                                                Apakah Anda yakin ingin menghapus destinasi <strong>{item.name}</strong>? Data yang telah dihapus tidak dapat dikembalikan.
                                                            </p>
                                                            <div className="flex items-center justify-end gap-3">
                                                                <a 
                                                                    href="#!" 
                                                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                                                                >
                                                                    Batal
                                                                </a>
                                                                <form action={deleteDestination}>
                                                                    <input type="hidden" name="id" value={item.id} />
                                                                    <button 
                                                                        type="submit"
                                                                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                                                                    >
                                                                        Ya, Hapus
                                                                    </button>
                                                                </form>
                                                            </div>
                                                        </div>
                                                    </div>

                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Search className="w-12 h-12 text-gray-300 mb-3" />
                                                <p className="text-lg font-medium text-gray-800">Destinasi tidak ditemukan</p>
                                                <p className="text-sm mt-1">Kami tidak dapat menemukan data yang cocok dengan "{searchQuery}".</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
}