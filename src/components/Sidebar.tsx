// src/components/Sidebar.tsx
import Link from "next/link";

export default function Sidebar() {
    return (
    <aside className="w-64 bg-gray-900 text-white p-4">
        <h2 className="text-lg font-bold mb-6">Batam Portal Admin</h2>
        <nav className="space-y-3">
            <Link href="/admin" className="block p-2 rounded hover:bg-gray-700">
            🏠 Dashboard
            </Link>
            <Link href="/admin/hotel" className="block p-2 rounded hover:bg-gray-700">
            🏨 Data Hotel
            </Link>
            <Link href="/admin/users" className="block p-2 rounded hover:bg-gray-700">
            👤 Users
            </Link>
            <Link href="/admin/submissions" className="block p-2 rounded hover:bg-gray-700">
            📄 Submissions
            </Link>
            <Link href="/admin/settings" className="block p-2 rounded hover:bg-gray-700">
            ⚙️ Settings
            </Link>
        </nav>
        </aside>
    );
}
