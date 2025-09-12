import { ReactNode } from "react";
import Link from "next/link";
import { Home, Building2, Users, FileText, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <div className="bg-gray-100 flex">
        {/* Sidebar Admin */}
        <aside className="w-64 bg-gray-900 text-white h-screen p-4 pt-10 space-y-6">
            {/* <h2 className="text-lg font-bold">Batam Portal Admin</h2> */}
            <nav className="space-y-2">
            <Link href="/admin" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Home size={18} /> Dashboard
            </Link>
            <Link href="/admin/#" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Building2 size={18} /> Data Hotel
            </Link>
            <Link href="/admin/#" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Users size={18} /> Users
            </Link>
            <Link href="/admin/submissions" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <FileText size={18} /> Submissions
            </Link>
            <Link href="/admin/#" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded">
                <Settings size={18} /> Settings
            </Link>
            </nav>
        </aside>

        {/* Konten Admin */}
        <main className="flex-1 p-6">{children}</main>
        </div>
    );
}
