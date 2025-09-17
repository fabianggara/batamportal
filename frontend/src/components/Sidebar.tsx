'use client'

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { 
    Home, 
    // Building2, 
    Users, 
    FileText, 
    Settings, 
    ChevronLeft, 
    ChevronRight,
    BarChart3,
    // MapPin,
    Star,
    // Bell,
    LogOut,
    User,
    Menu,
    X
    } from "lucide-react";

    export default function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const menuItems = [
        {
        title: "Dashboard",
        href: "/admin",
        icon: Home,
        badge: null,
        description: "Overview & Analytics"
        },
        {
        title: "Users",
        href: "/admin/users",
        icon: Users,
        badge: null,
        description: "User Management"
        },
        {
        title: "Reviews",
        href: "/admin/reviews",
        icon: Star,
        badge: null,
        description: "User Reviews"
        },
        {
        title: "Submissions",
        href: "/admin/submissions",
        icon: FileText,
        badge: "100",
        description: "Form Submissions"
        },
        {
        title: "Analytics",
        href: "/admin/analytics",
        icon: BarChart3,
        badge: null,
        description: "Reports & Stats"
        },
        {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
        badge: null,
        description: "System Config"
        }
    ];

    const isActive = (href: string) => {
        if (href === '/admin') {
        return pathname === '/admin';
        }
        return pathname.startsWith(href);
    };

    return (
        <>
        {/* Mobile Menu Button */}
        <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
        >
            {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Overlay */}
        {isMobileOpen && (
            <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileOpen(false)}
            />
        )}

        {/* Sidebar */}
        <aside className={`
            ${isCollapsed ? 'w-20' : 'w-72'} 
            ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            fixed lg:sticky top-0 left-0 h-screen
            bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 
            text-white transition-all duration-300 ease-in-out z-40
            border-r border-gray-700 shadow-2xl
        `}>
            
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-700">
            <div className="flex items-center justify-between">
                {!isCollapsed && (
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-lg font-bold">B</span>
                    </div>
                    <div>
                    <h2 className="text-lg font-bold">Batam Portal</h2>
                    <p className="text-xs text-gray-400">Admin Panel</p>
                    </div>
                </div>
                )}
                
                {/* Collapse Button - Desktop Only */}
                <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="hidden lg:flex p-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                {isCollapsed ? (
                    <ChevronRight className="w-5 h-5" />
                ) : (
                    <ChevronLeft className="w-5 h-5" />
                )}
                </button>
            </div>
            </div>

            {/* Admin Profile */}
            <div className="px-4 py-2 border-b border-gray-700">
            <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
                </div>
                {!isCollapsed && (
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">Admin User</p>
                    <p className="text-xs text-gray-400 truncate">admin@batamportal.com</p>
                    <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-400">Online</span>
                    </div>
                </div>
                )}
            </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2">
            {!isCollapsed && (
                <div className="mb-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2">
                    Main Menu
                </p>
                </div>
            )}
            
            {menuItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                
                return (
                <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`
                    group relative flex items-center gap-3 p-3 rounded-xl transition-all duration-200
                    ${active 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25' 
                        : 'hover:bg-gray-700/50 text-gray-300 hover:text-white'
                    }
                    ${isCollapsed ? 'justify-center' : ''}
                    `}
                >
                    {/* Active Indicator */}
                    {active && (
                    <div className="absolute -left-4 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                    )}
                    
                    {/* Icon */}
                    <div className={`relative ${isCollapsed ? '' : 'flex-shrink-0'}`}>
                    <Icon className="w-5 h-5" />
                    {item.badge && !isCollapsed && 
                    (
                        <span className="absolute -top-1 -right-1 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {/* {parseInt(item.badge) > 99 ? '99+' : item.badge} */}
                        </span>
                    )
                    }
                    </div>
                    
                    {/* Text Content */}
                    {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                        <span className="text-sm font-medium truncate">{item.title}</span>
                        {item.badge && (
                            <span className={`
                            px-2 py-1 text-xs rounded-full font-medium
                            ${active 
                                ? 'bg-white/20 text-white' 
                                : 'bg-red-500 text-white'
                            }
                            `}>
                            {parseInt(item.badge) > 99 ? '99+' : item.badge}
                            </span>
                        )}
                        </div>
                        <p className="text-xs text-gray-400 truncate mt-0.5">
                        {item.description}
                        </p>
                    </div>
                    )}

                    {/* Tooltip for collapsed state */}
                    {isCollapsed && (
                    <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50 shadow-lg">
                        <div className="flex flex-col">
                        <span className="font-medium">{item.title}</span>
                        <span className="text-xs text-gray-400">{item.description}</span>
                        </div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-2 h-2 bg-gray-800 rotate-45"></div>
                    </div>
                    )}
                </Link>
                );
            })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-gray-700">
            <button
                className={`
                w-full flex items-center gap-3 p-3 text-gray-400 hover:text-red-400 hover:bg-gray-700/50 rounded-xl transition-all duration-200
                ${isCollapsed ? 'justify-center' : ''}
                `}
            >
                <LogOut className="w-5 h-5" />
                {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
            </button>

            {!isCollapsed && (
                <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-medium text-blue-400">System Status</span>
                </div>
                <p className="text-xs text-gray-400">All systems operational</p>
                </div>
            )}
            </div>
        </aside>
        </>
    );
}