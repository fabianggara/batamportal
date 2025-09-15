<<<<<<< HEAD:frontend/src/app/admin/page.tsx
import Link from "next/link";
=======
// app/(admin)/page.tsx

import Link from 'next/link'; // <-- 1. Impor komponen Link
>>>>>>> 84f8530d5fcaa8cf9cc39269389f2d0655192415:src/app/admin/page.tsx

export default function AdminPage() {
    return (
        <div>
<<<<<<< HEAD:frontend/src/app/admin/page.tsx
            <h1 className="text-3xl font-bold text-gray-800 mb-6">
                Dashboard Admin
            </h1>

            {/* Tombol Form */}
            <div className="mb-6">
                <Link
                href="/form"
                className="inline-block px-6 py-3 font-semibold text-white bg-green-500 rounded-lg shadow hover:bg-green-600 transition"
                >
                Pergi ke Halaman Form
                </Link>
            </div>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                📊 <span className="ml-2 font-medium text-gray-700">Statistik</span>
                </div>
                <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                🏨 <span className="ml-2 font-medium text-gray-700">Data Hotel</span>
                </div>
                <div className="p-6 bg-white rounded-xl shadow hover:shadow-md transition">
                👥 <span className="ml-2 font-medium text-gray-700">Users</span>
                </div>
            </div>
        </div>
=======
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
        
>>>>>>> 84f8530d5fcaa8cf9cc39269389f2d0655192415:src/app/admin/page.tsx
    );
}
