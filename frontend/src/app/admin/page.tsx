// app/(admin)/page.tsx

import Link from 'next/link'; // <-- 1. Impor komponen Link

export default function AdminPage() {
    return (
        <div>
            <h1 className="text-2xl text-blue-950 font-bold mb-4">Dashboard Admin</h1>
            <div className='mb-5'>
                {/* Tambahkan tombol Link di sini */}
                <Link
                    href="/form"
                    className="inline-block px-6 py-3 mt-4 font-semibold text-white bg-green-500 rounded-lg shadow-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                    Pergi ke Halaman Form
                </Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div className="p-6 bg-white text-black rounded-xl shadow">📊 Statistik</div>
                <div className="p-6 bg-white text-black rounded-xl shadow">🏨 Data Hotel</div>
                <div className="p-6 bg-white text-black rounded-xl shadow">👥 Users</div>
            </div>

        </div>
        
    );
}
