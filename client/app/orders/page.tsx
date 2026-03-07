"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronDownIcon,
    ChevronUpIcon,
    MapPinIcon,
    CalendarDaysIcon,
} from "@heroicons/react/24/outline";
import { getOrdersByPhone, getOrder, cancelOrder, Order } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import CartDrawer from "../components/CartDrawer";

const STATUS_COLORS: Record<string, { bg: string; text: string; badge: string }> = {
    ordered: { bg: "bg-blue-500/15", text: "text-blue-400", badge: "border-blue-500/30" },
    confirmed: { bg: "bg-indigo-500/15", text: "text-indigo-400", badge: "border-indigo-500/30" },
    preparing: { bg: "bg-yellow-500/15", text: "text-yellow-400", badge: "border-yellow-500/30" },
    "out-for-delivery": { bg: "bg-orange-500/15", text: "text-orange-400", badge: "border-orange-500/30" },
    delivered: { bg: "bg-green-500/15", text: "text-green-400", badge: "border-green-500/30" },
    cancelled: { bg: "bg-red-500/15", text: "text-red-400", badge: "border-red-500/30" },
};

export default function OrdersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const isOrderNumber = (input: string) => /[a-zA-Z\-]/.test(input.trim());

    const handleSearch = async () => {
        const trimmed = searchInput.trim();
        if (!trimmed) {
            setError("Please enter an order number or phone number");
            return;
        }

        setLoading(true);
        setError("");
        setSearched(true);
        try {
            if (isOrderNumber(trimmed)) {
                // Search by order number — returns a single order
                const result = await getOrder(trimmed);
                setOrders([result.data]);
            } else {
                // Search by phone number
                const clean = trimmed.replace(/\D/g, "");
                if (clean.length < 10) {
                    setError("Please enter a valid 10-digit phone number");
                    setLoading(false);
                    return;
                }
                const result = await getOrdersByPhone(clean);
                setOrders(result.data);
            }
        } catch (err) {
            setError(isOrderNumber(trimmed)
                ? "Order not found. Please check the order number."
                : "Failed to load orders. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderNumber: string) => {
        if (!confirm(`Cancel order ${orderNumber}?`)) return;
        try {
            await cancelOrder(orderNumber);
            // Refresh using same search method
            const trimmed = searchInput.trim();
            if (isOrderNumber(trimmed)) {
                const result = await getOrder(trimmed);
                setOrders([result.data]);
            } else {
                const result = await getOrdersByPhone(trimmed.replace(/\D/g, ""));
                setOrders(result.data);
            }
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Failed to cancel");
        }
    };

    const handleReorder = (order: Order) => {
        const { clearCart, addItem, updateQuantity: setQty, openCart } = useCartStore.getState();
        clearCart();
        order.items.forEach((item) => {
            addItem({
                productId: item.product,
                productName: item.productName,
                variant: item.variant,
                unitPrice: item.unitPrice,
            });
            // addItem sets qty=1, so update to desired quantity
            if (item.quantity > 1) {
                setQty(item.product, item.variant, item.quantity);
            }
        });
        openCart();
    };

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            <AppHeader />
            <CartDrawer />

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 sm:px-10 sm:pt-28 lg:px-16">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="font-(family-name:--font-playfair) text-3xl font-bold text-white sm:text-4xl">
                        My Orders
                    </h1>
                    <p className="mt-2 text-sm text-white/50">
                        Track your orders by entering your Order ID or Order Number.
                    </p>
                </div>

                {/* Phone Search */}
                <div className="mb-8 flex gap-3">
                    <input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Order number (SF-...) or phone number"
                        className="flex-1 rounded-xl border border-white/10 bg-white/3 px-5 py-3.5 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                    />
                    <button
                        onClick={handleSearch}
                        disabled={loading}
                        className="rounded-xl bg-brand-gold px-6 py-3.5 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-brand-gold/80 disabled:opacity-50"
                    >
                        {loading ? "..." : "Search"}
                    </button>
                </div>

                {error && (
                    <p className="mb-6 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
                )}

                {/* Orders List */}
                {searched && !loading && orders.length === 0 && !error && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <p className="text-lg font-medium text-white/40">No orders found</p>
                        <p className="mt-1 text-sm text-white/25">
                            Orders placed with this number will appear here.
                        </p>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                        const statusStyle = STATUS_COLORS[order.status] || STATUS_COLORS.ordered;
                        const canCancel = !["delivered", "cancelled"].includes(order.status);
                        const isExpanded = expandedId === order._id;

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                layout
                                className="overflow-hidden rounded-2xl border border-white/4 bg-white/2"
                            >
                                {/* Order Header — Clickable */}
                                <div
                                    onClick={() => setExpandedId(isExpanded ? null : order._id)}
                                    className="flex cursor-pointer flex-wrap items-center justify-between gap-3 px-5 py-4 transition-colors hover:bg-white/2"
                                >
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="text-sm font-bold text-white">{order.orderNumber}</span>
                                            <span
                                                className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text} ${statusStyle.badge}`}
                                            >
                                                {order.status.replace("-", " ")}
                                            </span>
                                        </div>
                                        <p className="mt-1 text-xs text-white/30">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                            {" · "}
                                            {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                                            {" · ₹"}{order.subtotal.toLocaleString("en-IN")}
                                        </p>
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
                                                {/* Items */}
                                                <div className="mb-4">
                                                    {order.items.map((item, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="flex items-center justify-between py-1.5 text-sm"
                                                        >
                                                            <span className="text-white/70">
                                                                {item.productName}{" "}
                                                                <span className="text-white/30">({item.variant} × {item.quantity})</span>
                                                            </span>
                                                            <span className="font-medium text-white/80">
                                                                ₹{item.lineTotal.toLocaleString("en-IN")}
                                                            </span>
                                                        </div>
                                                    ))}
                                                    <div className="mt-2 flex items-center justify-between border-t border-white/6 pt-2">
                                                        <span className="text-sm font-bold text-white">Total</span>
                                                        <span className="text-sm font-bold text-brand-gold">
                                                            ₹{order.subtotal.toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Delivery Info */}
                                                {(order.deliveryDate || order.deliveryTimeSlot) && (
                                                    <div className="mb-4 flex flex-col gap-1.5">
                                                        <div className="flex items-center gap-2 text-xs text-white/50">
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
                                                        <div className="flex items-start gap-2 text-xs text-white/50">
                                                            <MapPinIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                                            <span>{order.deliveryAddress}</span>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Status Timeline */}
                                                {order.statusHistory && order.statusHistory.length > 0 && (
                                                    <div className="mb-4">
                                                        <p className="mb-2 text-[10px] font-bold tracking-wider text-white/30 uppercase">
                                                            Order Timeline
                                                        </p>
                                                        <div className="relative ml-2 border-l border-white/10 pl-4">
                                                            {order.statusHistory.map((entry, idx) => {
                                                                const entryStyle = STATUS_COLORS[entry.status] || STATUS_COLORS.ordered;
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
                                                                        </p>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Actions */}
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleReorder(order)}
                                                        className="rounded-lg bg-brand-gold/10 px-4 py-1.5 text-xs font-medium text-brand-gold transition-colors hover:bg-brand-gold/20"
                                                    >
                                                        🔄 Reorder
                                                    </button>
                                                    {canCancel && (
                                                        <button
                                                            onClick={() => handleCancel(order.orderNumber)}
                                                            className="rounded-lg px-4 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-400/10"
                                                        >
                                                            Cancel Order
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
