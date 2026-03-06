"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
    ShoppingBagIcon,
    ClockIcon,
    CheckCircleIcon,
    XCircleIcon,
    CubeIcon,
    UserGroupIcon,
    CurrencyRupeeIcon,
} from "@heroicons/react/24/outline";
import { useAdminStore } from "@/stores/adminStore";
import { adminGetStats, AdminStats } from "@/lib/api";

const STAT_CARDS = [
    { key: "totalOrders" as const, label: "Total Orders", icon: ShoppingBagIcon, color: "text-blue-400", bg: "bg-blue-400/10" },
    { key: "activeOrders" as const, label: "Active Orders", icon: ClockIcon, color: "text-yellow-400", bg: "bg-yellow-400/10" },
    { key: "deliveredOrders" as const, label: "Delivered", icon: CheckCircleIcon, color: "text-green-400", bg: "bg-green-400/10" },
    { key: "cancelledOrders" as const, label: "Cancelled", icon: XCircleIcon, color: "text-red-400", bg: "bg-red-400/10" },
    { key: "totalProducts" as const, label: "Products", icon: CubeIcon, color: "text-purple-400", bg: "bg-purple-400/10" },
    { key: "totalClients" as const, label: "Clients", icon: UserGroupIcon, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { key: "totalRevenue" as const, label: "Revenue", icon: CurrencyRupeeIcon, color: "text-[#D4AF37]", bg: "bg-[#D4AF37]/10" },
];

export default function AdminDashboardPage() {
    const { getToken } = useAdminStore();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchStats = async () => {
            const token = getToken();
            if (!token) return;

            try {
                const result = await adminGetStats(token);
                setStats(result.data);
            } catch (err: unknown) {
                setError(err instanceof Error ? err.message : "Failed to load stats");
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [getToken]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="font-(family-name:--font-playfair) text-2xl font-bold text-white sm:text-3xl">
                    Dashboard
                </h1>
                <p className="mt-1 text-sm text-white/40">
                    Overview of your business at a glance.
                </p>
            </div>

            {error && (
                <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
                {STAT_CARDS.map((card, index) => (
                    <motion.div
                        key={card.key}
                        initial={{ opacity: 0, y: 16 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.08 }}
                        className="rounded-2xl border border-white/6 bg-white/2 p-5"
                    >
                        <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${card.bg}`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <p className="text-xs font-medium tracking-wider text-white/40 uppercase">
                            {card.label}
                        </p>
                        {loading ? (
                            <div className="mt-1 h-8 w-20 animate-pulse rounded-lg bg-white/6" />
                        ) : (
                            <p className="mt-1 text-2xl font-bold text-white">
                                {card.key === "totalRevenue"
                                    ? `₹${(stats?.[card.key] ?? 0).toLocaleString("en-IN")}`
                                    : stats?.[card.key] ?? 0}
                            </p>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
