"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    HomeIcon,
    ClipboardDocumentListIcon,
    ClipboardDocumentCheckIcon,
    CubeIcon,
    UserGroupIcon,
    ArrowRightStartOnRectangleIcon,
    Bars3Icon,
    XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAdminStore } from "@/stores/adminStore";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/admin", icon: HomeIcon },
    { label: "Orders", href: "/admin/orders", icon: ClipboardDocumentListIcon },
    { label: "Delivery Target", href: "/admin/requirements", icon: ClipboardDocumentCheckIcon },
    { label: "Products", href: "/admin/products", icon: CubeIcon },
    { label: "Clients", href: "/admin/clients", icon: UserGroupIcon },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const { isAuthenticated, logout } = useAdminStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (mounted && !isAuthenticated() && pathname !== "/admin/login") {
            router.replace("/admin/login");
        }
    }, [mounted, pathname, isAuthenticated, router]);

    // Don't render layout for login page
    if (pathname === "/admin/login") {
        return <>{children}</>;
    }

    // Show nothing until mounted (avoid hydration mismatch)
    if (!mounted || !isAuthenticated()) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand-gold border-t-transparent" />
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        router.replace("/admin/login");
    };

    return (
        <div className="flex min-h-screen bg-[#0a0a0a]">
            {/* Mobile sidebar backdrop */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setSidebarOpen(false)}
                        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/6 bg-[#0e0e0e] transition-transform duration-300 lg:static lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
                    }`}
            >
                {/* Sidebar Header */}
                <div className="flex items-center justify-between border-b border-white/6 px-5 py-5">
                    <div>
                        <h2 className="font-(family-name:--font-playfair) text-lg font-bold text-white">
                            Sampoornam Foods
                        </h2>
                        <p className="text-[11px] font-medium tracking-widest text-brand-gold uppercase">
                            Admin Panel
                        </p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white lg:hidden"
                    >
                        <XMarkIcon className="h-5 w-5" />
                    </button>
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-3 py-4">
                    <ul className="flex flex-col gap-1">
                        {NAV_ITEMS.map((item) => {
                            const isActive =
                                item.href === "/admin"
                                    ? pathname === "/admin"
                                    : pathname.startsWith(item.href);

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setSidebarOpen(false)}
                                        className={`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${isActive
                                            ? "bg-brand-gold/10 text-brand-gold"
                                            : "text-white/50 hover:bg-white/4 hover:text-white/80"
                                            }`}
                                    >
                                        <item.icon
                                            className={`h-5 w-5 transition-colors ${isActive ? "text-brand-gold" : "text-white/30 group-hover:text-white/60"
                                                }`}
                                        />
                                        {item.label}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout */}
                <div className="border-t border-white/6 px-3 py-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-red-400/70 transition-all hover:bg-red-400/5 hover:text-red-400"
                    >
                        <ArrowRightStartOnRectangleIcon className="h-5 w-5" />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col">
                {/* Top Bar (mobile only) */}
                <header className="sticky top-0 z-30 flex items-center gap-4 border-b border-white/6 bg-[#0a0a0a]/90 px-4 py-3 backdrop-blur-xl lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/4 text-white/60 hover:bg-white/10"
                    >
                        <Bars3Icon className="h-5 w-5" />
                    </button>
                    <h1 className="font-(family-name:--font-playfair) text-base font-bold text-white">
                        Admin
                    </h1>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
