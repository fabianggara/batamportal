'use client';

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { 
    Search, 
    Download, 
    Eye, 
    Edit, 
    Trash2, 
    Calendar,
    Mail,
    User,
    Crown,
    Star,
    ChevronDown,
    X,
    UserPlus,
    Loader2,
    RefreshCw
} from "lucide-react";

// Type definition sesuai dengan struktur database
type UserType = {
    id: number;
    email: string;
    name: string;
    profile_picture?: string | null;
    bio?: string | null;
    created_at: string;
    updated_at: string;
    role: string;
    is_active: boolean;
};

type UserCategory = 'all' | 'admin' | 'subscriber' | 'user';

export default function UsersPage() {
    const [users, setUsers] = useState<UserType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<UserCategory>("all");
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'role'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // State untuk Modals (Read & Edit)
    const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // State untuk Form Edit
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        role: '',
        is_active: false
    });

    // Helper untuk memformat URL Foto Profil
    const getProfileImageUrl = (pic: string | null | undefined) => {
        if (!pic) return '';
        return pic.startsWith('http') ? pic : `http://localhost:5000/uploads/${pic}`;
    };

    // --- FETCH DATA ---
    const fetchUsers = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/users');
            if (!response.ok) throw new Error('Gagal mengambil data dari server');
            
            const data = await response.json();
            const formattedData = data.map((u: any) => ({
                ...u,
                is_active: u.is_active === 1 || u.is_active === true,
                role: u.role ? u.role.toUpperCase() : 'USER'
            }));
            setUsers(formattedData);
        } catch (error: any) {
            console.error(error);
            setError(error.message || 'Gagal memuat pengguna');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    // --- HANDLERS UNTUK ACTIONS ---

    // 1. READ (VIEW)
    const handleView = (user: UserType) => {
        setSelectedUser(user);
        setIsViewModalOpen(true);
    };

    // 2. EDIT
    const handleEditClick = (user: UserType) => {
        setSelectedUser(user);
        setEditForm({
            name: user.name || '',
            bio: user.bio || '',
            role: user.role,
            is_active: user.is_active
        });
        setIsEditModalOpen(true);
    };

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser) return;
        setIsSaving(true);
        
        try {
            const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editForm)
            });

            if (!response.ok) throw new Error('Gagal mengupdate user');
            
            // Refresh data setelah berhasil update
            await fetchUsers();
            setIsEditModalOpen(false);
            alert("User berhasil diupdate!");
        } catch (error: any) {
            alert(error.message);
        } finally {
            setIsSaving(false);
        }
    };

    // 3. DELETE
    const handleDelete = async (id: number, name: string) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus user ${name}? Tindakan ini tidak dapat dibatalkan.`)) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/${id}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Gagal menghapus user');
            
            setUsers(users.filter(user => user.id !== id));
            alert("User berhasil dihapus!");
        } catch (error: any) {
            alert(error.message);
        }
    };

    // --- FILTER & SORT LOGIC ---
    const filteredUsers = useMemo(() => {
        let filtered = users;
        
        if (selectedCategory !== 'all') {
            const roleMap = { admin: 'ADMIN', subscriber: 'SUBSCRIBER', user: 'USER' };
            filtered = filtered.filter(user => user.role === roleMap[selectedCategory]);
        }

        if (searchTerm) {
            filtered = filtered.filter(user =>
                user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
            );
        }

        filtered = [...filtered].sort((a, b) => {
            if (selectedCategory === 'all') {
                if (a.role === 'ADMIN' && b.role !== 'ADMIN') return -1;
                if (a.role !== 'ADMIN' && b.role === 'ADMIN') return 1;
            }

            let comparison = 0;
            switch (sortBy) {
                case 'name': comparison = (a.name || '').localeCompare(b.name || ''); break;
                case 'email': comparison = (a.email || '').localeCompare(b.email || ''); break;
                case 'created_at': comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime(); break;
                case 'role': comparison = (a.role || '').localeCompare(b.role || ''); break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [users, selectedCategory, searchTerm, sortBy, sortOrder]);

    const clearFilters = () => {
        setSearchTerm("");
        setSelectedCategory("all");
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800';
            case 'SUBSCRIBER': return 'bg-blue-100 text-blue-800';
            case 'USER': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'ADMIN': return <Crown className="w-4 h-4" />;
            case 'SUBSCRIBER': return <Star className="w-4 h-4" />;
            case 'USER': return <User className="w-4 h-4" />;
            default: return <User className="w-4 h-4" />;
        }
    };

    const stats = {
        all: users.length,
        admin: users.filter(u => u.role === 'ADMIN').length,
        subscriber: users.filter(u => u.role === 'SUBSCRIBER').length,
        user: users.filter(u => u.role === 'USER').length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length
    };

    if (isLoading) {
        return (
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                            <p className="text-gray-600">Loading users data...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col items-center justify-center py-12">
                    <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                        <X className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Users</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                        <RefreshCw className="w-4 h-4" /> Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6 relative">
            {/* Header Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Pengguna</h1>
                        <p className="text-gray-600 mt-2">Manage all users, administrators, and subscribers</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={fetchUsers} className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                            <RefreshCw className="w-4 h-4" /> Refresh
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Download className="w-4 h-4" /> Export CSV
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            <UserPlus className="w-4 h-4" /> Add User
                        </button>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {[
                    { label: "Total Users", value: stats.all, icon: <User className="w-5 h-5 text-gray-500" /> },
                    { label: "Admins", value: stats.admin, icon: <Crown className="w-5 h-5 text-red-500" /> },
                    { label: "Subscribers", value: stats.subscriber, icon: <Star className="w-5 h-5 text-blue-500" /> },
                    { label: "Users", value: stats.user, icon: <User className="w-5 h-5 text-green-500" /> },
                    { label: "Active", value: stats.active, icon: <div className="w-2 h-2 bg-green-500 rounded-full"></div> },
                    { label: "Inactive", value: stats.inactive, icon: <div className="w-2 h-2 bg-red-500 rounded-full"></div> }
                ].map((stat, idx) => (
                    <div key={idx} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                        <div className="flex items-center gap-2">
                            {stat.icon}
                            <div>
                                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                                <p className="text-sm text-gray-600">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search by name, email, or bio..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value as UserCategory)}
                            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-blue-500 min-w-[200px]"
                        >
                            <option value="all">All Users ({stats.all})</option>
                            <option value="admin">Admins ({stats.admin})</option>
                            <option value="user">Users ({stats.user})</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                    </div>
                    {(searchTerm || selectedCategory !== 'all') && (
                        <button onClick={clearFilters} className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:bg-gray-100 rounded-lg">
                            <X className="w-4 h-4" /> Clear
                        </button>
                    )}
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role & Status</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bio</th>
                                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined Date</th>
                                <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            {/* BAGIAN FOTO PROFIL DIUBAH DI SINI */}
                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold relative overflow-hidden shadow-sm">
                                                {user.profile_picture ? (
                                                    <Image
                                                        src={getProfileImageUrl(user.profile_picture)}
                                                        alt={user.name}
                                                        fill
                                                        sizes="40px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    user.name?.charAt(0).toUpperCase()
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500 flex items-center gap-1">
                                                    <Mail className="w-3 h-3" /> {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap space-y-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                                            {getRoleIcon(user.role)} {user.role}
                                        </span>
                                        <div className="flex items-center gap-1">
                                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className={`text-xs font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                                {user.is_active ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4"><div className="text-sm text-gray-900 max-w-xs truncate">{user.bio || '-'}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {new Date(user.created_at).toLocaleDateString("id-ID")}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <div className="flex items-center justify-end gap-2">
                                            <button onClick={() => handleView(user)} className="text-blue-600 hover:text-blue-900 p-1 bg-blue-50 rounded" title="View Details">
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEditClick(user)} className="text-green-600 hover:text-green-900 p-1 bg-green-50 rounded" title="Edit User">
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            {user.role !== 'ADMIN' && (
                                                <button onClick={() => handleDelete(user.id, user.name)} className="text-red-600 hover:text-red-900 p-1 bg-red-50 rounded" title="Delete User">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* MODAL VIEW DETAILS */}
            {isViewModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={() => setIsViewModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        
                        <h2 className="text-xl font-bold mb-6 border-b pb-2">User Details</h2>
                        
                        {/* FOTO PROFIL DI DALAM MODAL VIEW */}
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl relative overflow-hidden shadow-sm">
                                {selectedUser.profile_picture ? (
                                    <Image
                                        src={getProfileImageUrl(selectedUser.profile_picture)}
                                        alt={selectedUser.name}
                                        fill
                                        sizes="64px"
                                        className="object-cover"
                                    />
                                ) : (
                                    selectedUser.name?.charAt(0).toUpperCase()
                                )}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">{selectedUser.name}</h3>
                                <p className="text-sm text-gray-500">{selectedUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Role</label>
                                <div className="mt-1">
                                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(selectedUser.role)}`}>
                                        {getRoleIcon(selectedUser.role)} {selectedUser.role}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Status</label>
                                <div className="mt-1 flex items-center gap-1.5">
                                    <div className={`w-2 h-2 rounded-full ${selectedUser.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                    <span className={`text-sm font-medium ${selectedUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                                        {selectedUser.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Bio</label>
                                <p className="font-medium text-gray-800 bg-gray-50 p-3 rounded-lg mt-1 text-sm">
                                    {selectedUser.bio || 'Tidak ada bio'}
                                </p>
                            </div>
                            <div>
                                <label className="text-xs text-gray-500 uppercase font-semibold">Joined Date</label>
                                <p className="font-medium text-gray-800 mt-1 text-sm">
                                    {new Date(selectedUser.created_at).toLocaleDateString("id-ID", {
                                        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* MODAL EDIT USER */}
            {isEditModalOpen && selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 relative">
                        <button onClick={() => setIsEditModalOpen(false)} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-full p-1 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold mb-4">Edit User</h2>
                        
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input 
                                    type="text" required
                                    value={editForm.name} 
                                    onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email (Read Only)</label>
                                <input type="email" value={selectedUser.email} disabled className="w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-500" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select 
                                    value={editForm.role}
                                    onChange={(e) => setEditForm({...editForm, role: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="USER">USER</option>
                                    <option value="SUBSCRIBER">SUBSCRIBER</option>
                                    <option value="ADMIN">ADMIN</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                                <textarea 
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                    className="w-full px-3 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500"
                                    rows={3}
                                ></textarea>
                            </div>
                            <div className="flex items-center gap-2">
                                <input 
                                    type="checkbox" 
                                    id="status"
                                    checked={editForm.is_active}
                                    onChange={(e) => setEditForm({...editForm, is_active: e.target.checked})}
                                    className="w-4 h-4 text-blue-600 rounded"
                                />
                                <label htmlFor="status" className="text-sm font-medium text-gray-700">Akun Aktif</label>
                            </div>

                            <div className="pt-4 flex justify-end gap-2 border-t">
                                <button type="button" onClick={() => setIsEditModalOpen(false)} className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg">Batal</button>
                                <button type="submit" disabled={isSaving} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit className="w-4 h-4" />}
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}