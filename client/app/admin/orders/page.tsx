"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    PhoneIcon,
    MapPinIcon,
    ChatBubbleLeftEllipsisIcon,
    CalendarDaysIcon,
    PrinterIcon,
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

    const handlePrint = (order: Order) => {
        const w = window.open("", "_blank", "width=420,height=600");
        if (!w) return;

        const deliveryDateStr = order.deliveryDate
            ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                  day: "numeric", month: "short", year: "numeric",
              })
            : "N/A";

        const itemsHtml = order.items
            .map(
                (item) =>
                    `<tr><td style="padding:6px 0">${item.productName} (${item.variant} × ${item.quantity})</td><td style="text-align:right;padding:6px 0">₹${item.lineTotal.toLocaleString("en-IN")}</td></tr>`
            )
            .join("");

        w.document.write(`<!DOCTYPE html><html><head><title>Invoice - ${order.orderNumber}</title>
<style>body{font-family:system-ui,sans-serif;max-width:380px;margin:20px auto;color:#222}h2{margin:0}table{width:100%;border-collapse:collapse}hr{border:0;border-top:1px solid #ddd;margin:12px 0}.label{color:#888;font-size:12px}.total{font-size:16px;font-weight:700}</style></head><body>
<h2>Sampoornam Foods</h2><p class="label">Invoice</p>
<hr/>
<p><b>${order.orderNumber}</b></p>
<p class="label">Customer</p><p>${order.customerName}<br/>${order.customerPhone}</p>
<p class="label">Delivery</p><p>${order.deliveryAddress}<br/>${deliveryDateStr} | ${order.deliveryTimeSlot || "N/A"}</p>
<hr/>
<table>${itemsHtml}<tr style="border-top:1px solid #ddd"><td style="padding:8px 0" class="total">Total</td><td style="text-align:right;padding:8px 0" class="total">₹${order.subtotal.toLocaleString("en-IN")}</td></tr></table>
${order.notes ? `<hr/><p class="label">Notes: ${order.notes}</p>` : ""}
<hr/><p class="label" style="text-align:center">Thank you for ordering!</p>
</body></html>`);
        w.document.close();
        w.focus();
        w.print();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-(family-name:--font-playfair) text-2xl font-bold text-white sm:text-3xl">
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
                            ? "bg-brand-gold text-[#0a0a0a]"
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
                        <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/3" />
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
                                className="overflow-hidden rounded-2xl border border-white/6 bg-white/2"
                            >
                                {/* Order Header Row */}
                                <div
                                    onClick={() => toggleExpand(order._id)}
                                    className="flex cursor-pointer items-center gap-4 px-5 py-4 transition-colors hover:bg-white/2"
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
                                            className="rounded-lg border border-white/10 bg-white/4 px-3 py-1.5 text-xs font-medium text-white focus:border-brand-gold focus:outline-none disabled:opacity-40"
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
                                            <div className="border-t border-white/4 px-5 py-4">
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
                                                <div className="rounded-xl border border-white/4 bg-white/1">
                                                    <div className="border-b border-white/4 px-4 py-2">
                                                        <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                                                            Items
                                                        </p>
                                                    </div>
                                                    {order.items.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className={`flex items-center justify-between px-4 py-2.5 text-sm ${idx < order.items.length - 1
                                                                ? "border-b border-white/3"
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
                                                    <div className="flex items-center justify-between border-t border-white/6 px-4 py-2.5">
                                                        <span className="text-sm font-bold text-white">Total</span>
                                                        <span className="text-sm font-bold text-brand-gold">
                                                            ₹{order.subtotal.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {order.cancelledBy && (
                                                    <p className="mt-3 text-xs text-red-400/60">
                                                        Cancelled by: {order.cancelledBy}
                                                    </p>
                                                )}

                                                {/* Delivery Schedule */}
                                                {(order.deliveryDate || order.deliveryTimeSlot) && (
                                                    <div className="mt-4 flex items-center gap-2 text-xs text-white/50">
                                                        <CalendarDaysIcon className="h-3.5 w-3.5" />
                                                        <span>
                                                            Delivery:{" "}
                                                            {order.deliveryDate
                                                                ? new Date(order.deliveryDate).toLocaleDateString("en-IN", {
                                                                      weekday: "short", day: "numeric", month: "short",
                                                                  })
                                                                : "N/A"}
                                                            {order.deliveryTimeSlot && ` | ${order.deliveryTimeSlot}`}
                                                        </span>
                                                    </div>
                                                )}

                                                {/* Status Timeline */}
                                                {order.statusHistory && order.statusHistory.length > 0 && (
                                                    <div className="mt-4">
                                                        <p className="mb-2 text-[10px] font-bold tracking-wider text-white/30 uppercase">
                                                            Status Timeline
                                                        </p>
                                                        <div className="relative ml-2 border-l border-white/10 pl-4">
                                                            {order.statusHistory.map((entry, idx) => {
                                                                const entryStyle = STATUS_STYLE[entry.status] || STATUS_STYLE.ordered;
                                                                return (
                                                                    <div key={idx} className="relative mb-3 last:mb-0">
                                                                        <div
                                                                            className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 ${entryStyle.bg} ${entryStyle.badge}`}
                                                                        />
                                                                        <p className={`text-xs font-semibold ${entryStyle.text}`}>
                                                                            {entry.status.replace("-", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                                                                        </p>
                                                                        <p className="text-[10px] text-white/25">
                                                                            {new Date(entry.changedAt).toLocaleDateString("en-IN", {
                                                                                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                                                                            })}
                                                                            {" · by "}
                                                                            {entry.changedBy}
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Print Invoice */}
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        onClick={() => handlePrint(order)}
                                                        className="flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-xs font-medium text-white/50 transition-colors hover:bg-white/5 hover:text-white"
                                                    >
                                                        <PrinterIcon className="h-3.5 w-3.5" />
                                                        Print Invoice
                                                    </button>
                                                </div>
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
