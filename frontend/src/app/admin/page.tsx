import Link from "next/link";

export default function AdminPage() {
    return (
        <div>
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
    );
}
