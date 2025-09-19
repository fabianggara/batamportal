// frontend/src/app/admin/users/page.tsx
'use client';

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { 
    Search, 
    Filter, 
    Download, 
    Eye, 
    Edit, 
    Trash2, 
    Calendar,
    Mail,
    Shield,
    User,
    Crown,
    Star,
    ChevronDown,
    X,
    UserPlus,
    Loader2,
    RefreshCw,
    MoreVertical
    } from "lucide-react";

    // Type definition sesuai dengan struktur database
    type User = {
    id: number;
    email: string;
    name: string;
    profile_picture?: string | null;
    bio?: string | null;
    password: string; // Tidak akan ditampilkan
    created_at: string;
    updated_at: string;
    role: string;
    reset_token?: string | null;
    reset_token_expiry?: string | null;
    is_active: boolean;
    };

    // User categories
    type UserCategory = 'all' | 'admin' | 'subscriber' | 'user';

    export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<UserCategory>("all");
    const [sortBy, setSortBy] = useState<'name' | 'email' | 'created_at' | 'role'>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    // Mock data - replace with your actual API call
    const mockUsers: User[] = [
        {
        id: 1,
        email: "admin@batamportal.com",
        name: "Super Admin",
        profile_picture: null,
        bio: "System administrator",
        password: "hashed_password",
        created_at: "2024-01-15T10:30:00Z",
        updated_at: "2024-01-15T10:30:00Z",
        role: "ADMIN",
        reset_token: null,
        reset_token_expiry: null,
        is_active: true
        },
        {
        id: 2,
        email: "john.doe@gmail.com",
        name: "John Doe",
        profile_picture: "/api/placeholder/50/50",
        bio: "Travel enthusiast from Batam",
        password: "hashed_password",
        created_at: "2024-01-14T14:20:00Z",
        updated_at: "2024-01-16T09:15:00Z",
        role: "SUBSCRIBER",
        reset_token: null,
        reset_token_expiry: null,
        is_active: true
        },
        {
        id: 3,
        email: "jane.smith@yahoo.com",
        name: "Jane Smith",
        profile_picture: null,
        bio: null,
        password: "hashed_password",
        created_at: "2024-01-13T09:15:00Z",
        updated_at: "2024-01-13T09:15:00Z",
        role: "USER",
        reset_token: null,
        reset_token_expiry: null,
        is_active: true
        },
        {
        id: 4,
        email: "bob.wilson@hotmail.com",
        name: "Bob Wilson",
        profile_picture: "/api/placeholder/50/50",
        bio: "Local business owner",
        password: "hashed_password",
        created_at: "2024-01-12T16:45:00Z",
        updated_at: "2024-01-14T11:30:00Z",
        role: "SUBSCRIBER",
        reset_token: null,
        reset_token_expiry: null,
        is_active: false
        },
        {
        id: 5,
        email: "alice.brown@gmail.com",
        name: "Alice Brown",
        profile_picture: null,
        bio: "Food blogger",
        password: "hashed_password",
        created_at: "2024-01-11T11:30:00Z",
        updated_at: "2024-01-11T11:30:00Z",
        role: "USER",
        reset_token: null,
        reset_token_expiry: null,
        is_active: true
        }
    ];

    // Simulate data fetching
    useEffect(() => {
        const fetchUsers = async () => {
        setIsLoading(true);
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setUsers(mockUsers);
        } catch (error) {
            setError('Failed to fetch users');
        } finally {
            setIsLoading(false);
        }
        };

        fetchUsers();
    }, []);

    // Filter users by category and search term
    const filteredUsers = useMemo(() => {
        let filtered = users;

        // Filter by category
        if (selectedCategory !== 'all') {
        const roleMap = {
            admin: 'ADMIN',
            subscriber: 'SUBSCRIBER', 
            user: 'USER'
        };
        filtered = filtered.filter(user => user.role === roleMap[selectedCategory]);
        }

        // Filter by search term
        if (searchTerm) {
        filtered = filtered.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (user.bio && user.bio.toLowerCase().includes(searchTerm.toLowerCase()))
        );
        }

        // Sort users
        filtered = [...filtered].sort((a, b) => {
        let comparison = 0;
        switch (sortBy) {
            case 'name':
            comparison = a.name.localeCompare(b.name);
            break;
            case 'email':
            comparison = a.email.localeCompare(b.email);
            break;
            case 'created_at':
            comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
            break;
            case 'role':
            comparison = a.role.localeCompare(b.role);
            break;
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
        case 'ADMIN':
            return 'bg-red-100 text-red-800';
        case 'SUBSCRIBER':
            return 'bg-blue-100 text-blue-800';
        case 'USER':
            return 'bg-green-100 text-green-800';
        default:
            return 'bg-gray-100 text-gray-800';
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
        case 'ADMIN':
            return <Crown className="w-4 h-4" />;
        case 'SUBSCRIBER':
            return <Star className="w-4 h-4" />;
        case 'USER':
            return <User className="w-4 h-4" />;
        default:
            return <User className="w-4 h-4" />;
        }
    };

    const getStatsByCategory = () => {
        const stats = {
        all: users.length,
        admin: users.filter(u => u.role === 'ADMIN').length,
        subscriber: users.filter(u => u.role === 'SUBSCRIBER').length,
        user: users.filter(u => u.role === 'USER').length,
        active: users.filter(u => u.is_active).length,
        inactive: users.filter(u => !u.is_active).length
        };
        return stats;
    };

    const stats = getStatsByCategory();

    if (isLoading) {
        return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                <p className="text-gray-600">Loading users...</p>
                </div>
            </div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="p-6 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col items-center justify-center py-12">
                <div className="text-center max-w-md">
                <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <X className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to Load Users</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button 
                    onClick={() => window.location.reload()}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
                >
                    <RefreshCw className="w-4 h-4" />
                    Retry
                </button>
                </div>
            </div>
            </div>
        </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
                <p className="text-gray-600 mt-2">
                Manage all users, administrators, and subscribers
                </p>
            </div>
            
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="w-4 h-4" />
                Refresh
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Download className="w-4 h-4" />
                Export CSV
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                <UserPlus className="w-4 h-4" />
                Add User
                </button>
            </div>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <div>
                <p className="text-2xl font-bold text-gray-900">{stats.all}</p>
                <p className="text-sm text-gray-600">Total Users</p>
                </div>
            </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-red-500" />
                <div>
                <p className="text-2xl font-bold text-gray-900">{stats.admin}</p>
                <p className="text-sm text-gray-600">Admins</p>
                </div>
            </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-blue-500" />
                <div>
                <p className="text-2xl font-bold text-gray-900">{stats.subscriber}</p>
                <p className="text-sm text-gray-600">Subscribers</p>
                </div>
            </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-green-500" />
                <div>
                <p className="text-2xl font-bold text-gray-900">{stats.user}</p>
                <p className="text-sm text-gray-600">Regular Users</p>
                </div>
            </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div>
                <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
                <p className="text-sm text-gray-600">Active</p>
                </div>
            </div>
            </div>
            
            <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <div>
                <p className="text-2xl font-bold text-gray-900">{stats.inactive}</p>
                <p className="text-sm text-gray-600">Inactive</p>
                </div>
            </div>
            </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
            
            {/* Search Bar */}
            <div className="flex-1">
                <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                    type="text"
                    placeholder="Search by name, email, or bio..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                </div>
            </div>

            {/* Category Filter */}
            <div className="relative">
                <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as UserCategory)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                >
                <option value="all">All Users ({stats.all})</option>
                <option value="admin">Admins ({stats.admin})</option>
                <option value="subscriber">Subscribers ({stats.subscriber})</option>
                <option value="user">Regular Users ({stats.user})</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
            </div>

            {/* Clear Filters */}
            {(searchTerm || selectedCategory !== 'all') && (
                <button
                onClick={clearFilters}
                className="flex items-center gap-2 px-4 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                >
                <X className="w-4 h-4" />
                Clear
                </button>
            )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="text-sm text-gray-600">
                Showing {filteredUsers.length} of {users.length} users
            </div>
            
            <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                    const [field, order] = e.target.value.split('-');
                    setSortBy(field as 'name' | 'email' | 'created_at' | 'role');
                    setSortOrder(order as 'asc' | 'desc');
                }}
                className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                <option value="created_at-desc">Newest First</option>
                <option value="created_at-asc">Oldest First</option>
                <option value="name-asc">Name A-Z</option>
                <option value="name-desc">Name Z-A</option>
                <option value="email-asc">Email A-Z</option>
                <option value="role-asc">Role A-Z</option>
                </select>
            </div>
            </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role & Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bio
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined Date
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Updated
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                    </th>
                </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                            {user.profile_picture ? (
                            <Image
                                src={user.profile_picture}
                                alt={`${user.name}'s avatar`}
                                width={48}
                                height={48}
                                className="h-12 w-12 rounded-full object-cover border-2 border-gray-200"
                            />
                            ) : (
                            <div className="h-12 w-12 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center">
                                <span className="text-gray-500 font-bold text-lg">
                                {user.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            )}
                        </div>
                        <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                            {user.name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {user.email}
                            </div>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-2">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            {user.role}
                        </span>
                        <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span className={`text-xs font-medium ${user.is_active ? 'text-green-600' : 'text-red-600'}`}>
                            {user.is_active ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                        </div>
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                        {user.bio || '-'}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        {new Date(user.created_at).toLocaleDateString("id-ID", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                        {new Date(user.updated_at).toLocaleDateString("id-ID", {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                        })}
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                        <button className="text-blue-600 hover:text-blue-900 p-1 rounded transition-colors" title="View Details">
                            <Eye className="w-4 h-4" />
                        </button>
                        <button className="text-green-600 hover:text-green-900 p-1 rounded transition-colors" title="Edit User">
                            <Edit className="w-4 h-4" />
                        </button>
                        <button className="text-gray-600 hover:text-gray-900 p-1 rounded transition-colors" title="More Actions">
                            <MoreVertical className="w-4 h-4" />
                        </button>
                        {user.role !== 'ADMIN' && (
                            <button className="text-red-600 hover:text-red-900 p-1 rounded transition-colors" title="Delete User">
                            <Trash2 className="w-4 h-4" />
                            </button>
                        )}
                        </div>
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            
            {filteredUsers.length === 0 && (
                <div className="text-center py-12">
                <div className="text-gray-400 text-lg mb-2">No users found</div>
                <p className="text-gray-500">
                    {users.length === 0 
                    ? 'No users available' 
                    : 'Try adjusting your search or filter criteria'
                    }
                </p>
                </div>
            )}
            </div>
        </div>
        </div>
    );
}