"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { getOrdersByPhone, getOrder, cancelOrder, Order } from "@/lib/api";
import { useCartStore } from "@/stores/cartStore";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import CartDrawer from "../components/CartDrawer";

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    ordered: { bg: "bg-blue-500/15", text: "text-blue-400" },
    confirmed: { bg: "bg-indigo-500/15", text: "text-indigo-400" },
    preparing: { bg: "bg-yellow-500/15", text: "text-yellow-400" },
    "out-for-delivery": { bg: "bg-orange-500/15", text: "text-orange-400" },
    delivered: { bg: "bg-green-500/15", text: "text-green-400" },
    cancelled: { bg: "bg-red-500/15", text: "text-red-400" },
};

export default function OrdersPage() {
    const [searchInput, setSearchInput] = useState("");
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [error, setError] = useState("");

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

                        return (
                            <motion.div
                                key={order._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="overflow-hidden rounded-2xl border border-white/4 bg-white/2"
                            >
                                {/* Order Header */}
                                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/4 px-5 py-4">
                                    <div>
                                        <span className="text-sm font-bold text-white">{order.orderNumber}</span>
                                        <span className="ml-3 text-xs text-white/30">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </span>
                                    </div>
                                    <span
                                        className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider ${statusStyle.bg} ${statusStyle.text}`}
                                    >
                                        {order.status.replace("-", " ")}
                                    </span>
                                </div>

                                {/* Items */}
                                <div className="px-5 py-3">
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
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between border-t border-white/4 px-5 py-3">
                                    <span className="text-base font-bold text-white">
                                        Total: ₹{order.subtotal.toLocaleString("en-IN")}
                                    </span>
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
                        );
                    })}
                </div>
            </div>

            <BottomNav />
        </main>
    );
}
