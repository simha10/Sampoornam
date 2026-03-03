"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    PhoneIcon,
    MapPinIcon,
    ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";
import { useAdminStore } from "@/stores/adminStore";
import { adminGetOrders, adminUpdateOrderStatus, Order } from "@/lib/api";

const ALL_STATUSES = ["ordered", "confirmed", "preparing", "out-for-delivery", "delivered", "cancelled"] as const;

const STATUS_STYLE: Record<string, { bg: string; text: string; badge: string }> = {
    ordered: { bg: "bg-blue-500/10", text: "text-blue-400", badge: "border-blue-500/30" },
    confirmed: { bg: "bg-indigo-500/10", text: "text-indigo-400", badge: "border-indigo-500/30" },
    preparing: { bg: "bg-yellow-500/10", text: "text-yellow-400", badge: "border-yellow-500/30" },
    "out-for-delivery": { bg: "bg-orange-500/10", text: "text-orange-400", badge: "border-orange-500/30" },
    delivered: { bg: "bg-green-500/10", text: "text-green-400", badge: "border-green-500/30" },
    cancelled: { bg: "bg-red-500/10", text: "text-red-400", badge: "border-red-500/30" },
};

const FILTER_TABS = [
    { key: "", label: "All" },
    { key: "ordered", label: "Ordered" },
    { key: "confirmed", label: "Confirmed" },
    { key: "preparing", label: "Preparing" },
    { key: "out-for-delivery", label: "Out for Delivery" },
    { key: "delivered", label: "Delivered" },
    { key: "cancelled", label: "Cancelled" },
];

export default function AdminOrdersPage() {
    const { getToken } = useAdminStore();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [filter, setFilter] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const fetchOrders = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const result = await adminGetOrders(token, filter || undefined);
            setOrders(result.data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load orders");
        } finally {
            setLoading(false);
        }
    }, [getToken, filter]);

    useEffect(() => {
        setLoading(true);
        fetchOrders();
    }, [fetchOrders]);

    const handleStatusChange = async (orderId: string, newStatus: string) => {
        const token = getToken();
        if (!token) return;

        setUpdatingId(orderId);
        try {
            const result = await adminUpdateOrderStatus(token, orderId, newStatus);
            // Update in local state
            setOrders((prev) =>
                prev.map((o) => (o._id === orderId ? result.data : o))
            );
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Failed to update status");
        } finally {
            setUpdatingId(null);
        }
    };

    const toggleExpand = (id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl">
                    Orders
                </h1>
                <p className="mt-1 text-sm text-white/40">
                    Manage and update order statuses.
                </p>
            </div>

            {/* Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {FILTER_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key)}
                        className={`rounded-full px-4 py-2 text-xs font-medium transition-all ${filter === tab.key
                            ? "bg-[#D4AF37] text-[#0a0a0a]"
                            : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {error && (
                <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            {/* Orders List */}
            {loading ? (
                <div className="flex flex-col gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/[0.03]" />
                    ))}
                </div>
            ) : orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-lg font-medium text-white/30">No orders found</p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {orders.map((order) => {
                        const style = STATUS_STYLE[order.status] || STATUS_STYLE.ordered;
                        const isExpanded = expandedId === order._id;
                        const isUpdating = updatingId === order._id;

                        return (
                            <motion.div
                                key={order._id}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02]"
                            >
                                {/* Order Header Row */}
                                <div
                                    onClick={() => toggleExpand(order._id)}
                                    className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.02]"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-white">
                                                {order.orderNumber}
                                            </span>
                                            <span
                                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${style.bg} ${style.text} ${style.badge}`}
                                            >
                                                {order.status.replace("-", " ")}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-white/40">
                                            {order.customerName} · ₹{order.subtotal.toLocaleString("en-IN")} ·{" "}
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>

                                    {/* Status Dropdown (click stops propagation) */}
                                    <div onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.status}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                            disabled={isUpdating}
                                            className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-white focus:border-[#D4AF37] focus:outline-none disabled:opacity-40"
                                        >
                                            {ALL_STATUSES.map((s) => (
                                                <option key={s} value={s} className="bg-[#1a1a1a] text-white">
                                                    {s.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {isExpanded ? (
                                        <ChevronUpIcon className="h-4 w-4 shrink-0 text-white/30" />
                                    ) : (
                                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-white/30" />
                                    )}
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {isExpanded && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.25 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="border-t border-white/[0.04] px-5 py-4">
                                                {/* Contact Info */}
                                                <div className="mb-4 flex flex-col gap-2">
                                                    <div className="flex items-center gap-2 text-xs text-white/50">
                                                        <PhoneIcon className="h-3.5 w-3.5" />
                                                        <span>{order.customerPhone}</span>
                                                    </div>
                                                    <div className="flex items-start gap-2 text-xs text-white/50">
                                                        <MapPinIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                        <span>{order.deliveryAddress}</span>
                                                    </div>
                                                    {order.notes && (
                                                        <div className="flex items-start gap-2 text-xs text-white/50">
                                                            <ChatBubbleLeftEllipsisIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                            <span>{order.notes}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Items */}
                                                <div className="rounded-xl border border-white/[0.04] bg-white/[0.01]">
                                                    <div className="border-b border-white/[0.04] px-4 py-2">
                                                        <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                                                            Items
                                                        </p>
                                                    </div>
                                                    {order.items.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between px-4 py-2.5 text-sm ${idx < order.items.length - 1
                                                                ? "border-b border-white/[0.03]"
                                                                : ""
                                                                }`}
                                                        >
                                                            <span className="text-white/70">
                                                                {item.productName}{" "}
                                                                <span className="text-white/30">
                                                                    ({item.variant} × {item.quantity})
                                                                </span>
                                                            </span>
                                                            <span className="font-medium text-white/80">
                                                                ₹{item.lineTotal.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-2.5">
                                                        <span className="text-sm font-bold text-white">Total</span>
                                                        <span className="text-sm font-bold text-[#D4AF37]">
                                                            ₹{order.subtotal.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {order.cancelledBy && (
                                                    <p className="mt-3 text-xs text-red-400/60">
                                                        Cancelled by: {order.cancelledBy}
                                                    </p>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
