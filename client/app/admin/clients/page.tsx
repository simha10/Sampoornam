"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDownIcon, PhoneIcon, MapPinIcon } from "@heroicons/react/24/outline";
import { useAdminStore } from "@/stores/adminStore";
import { adminGetClients, adminGetClientOrders, Client, Order } from "@/lib/api";

export default function AdminClientsPage() {
    const { getToken } = useAdminStore();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [expandedPhone, setExpandedPhone] = useState<string | null>(null);
    const [clientOrders, setClientOrders] = useState<Record<string, Order[]>>({});
    const [loadingOrders, setLoadingOrders] = useState<string | null>(null);
    const [search, setSearch] = useState("");

    const fetchClients = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const result = await adminGetClients(token);
            setClients(result.data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load clients");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchClients();
    }, [fetchClients]);

    const toggleExpand = async (phone: string) => {
        if (expandedPhone === phone) {
            setExpandedPhone(null);
            return;
        }

        setExpandedPhone(phone);

        // Fetch orders if not cached
        if (!clientOrders[phone]) {
            const token = getToken();
            if (!token) return;

            setLoadingOrders(phone);
            try {
                const result = await adminGetClientOrders(token, phone);
                setClientOrders((prev) => ({ ...prev, [phone]: result.data }));
            } catch {
                // fail silently
            } finally {
                setLoadingOrders(null);
            }
        }
    };

    const filtered = search.trim()
        ? clients.filter(
              (c) =>
                  c.name.toLowerCase().includes(search.toLowerCase()) ||
                  c.phone.includes(search)
          )
        : clients;

    const statusColor: Record<string, string> = {
        ordered: "bg-blue-500/10 text-blue-400",
        confirmed: "bg-purple-500/10 text-purple-400",
        preparing: "bg-amber-500/10 text-amber-400",
        "out-for-delivery": "bg-cyan-500/10 text-cyan-400",
        delivered: "bg-green-500/10 text-green-400",
        cancelled: "bg-red-500/10 text-red-400",
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="font-(family-name:--font-playfair) text-2xl font-bold text-white sm:text-3xl">
                    Clients
                </h1>
                <p className="mt-1 text-sm text-white/40">
                    Your customer database with order history.
                </p>
            </div>

            {/* Search */}
            <div className="mb-6">
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full max-w-sm rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                />
            </div>

            {error && (
                <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-20 animate-pulse rounded-2xl bg-white/3" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-lg font-medium text-white/30">
                        {clients.length === 0 ? "No clients yet" : "No matching clients"}
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map((client, index) => (
                        <motion.div
                            key={client._id}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            className="overflow-hidden rounded-2xl border border-white/6 bg-white/2"
                        >
                            {/* Client Row */}
                            <button
                                onClick={() => toggleExpand(client.phone)}
                                className="flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-white/2"
                            >
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <h3 className="text-sm font-bold text-white">{client.name}</h3>
                                        <span className="rounded-full bg-brand-gold/10 px-2 py-0.5 text-[10px] font-bold text-brand-gold">
                                            {client.orderCount} orders
                                        </span>
                                    </div>
                                    <div className="mt-1 flex items-center gap-4 text-xs text-white/40">
                                        <span className="flex items-center gap-1">
                                            <PhoneIcon className="h-3 w-3" />
                                            {client.phone}
                                        </span>
                                        {client.defaultAddress && (
                                            <span className="flex items-center gap-1 truncate max-w-[200px]">
                                                <MapPinIcon className="h-3 w-3 shrink-0" />
                                                {client.defaultAddress}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-bold text-brand-gold">
                                        ₹{client.totalSpent.toLocaleString("en-IN")}
                                    </span>
                                    <ChevronDownIcon
                                        className={`h-4 w-4 text-white/30 transition-transform ${
                                            expandedPhone === client.phone ? "rotate-180" : ""
                                        }`}
                                    />
                                </div>
                            </button>

                            {/* Expanded: Order History */}
                            <AnimatePresence>
                                {expandedPhone === client.phone && (
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: "auto" }}
                                        exit={{ height: 0 }}
                                        className="overflow-hidden border-t border-white/4"
                                    >
                                        <div className="bg-white/1 px-5 py-4">
                                            {loadingOrders === client.phone ? (
                                                <p className="text-xs text-white/30">Loading orders...</p>
                                            ) : !clientOrders[client.phone]?.length ? (
                                                <p className="text-xs text-white/30">No orders yet</p>
                                            ) : (
                                                <div className="space-y-2">
                                                    <p className="mb-3 text-xs font-semibold tracking-wider text-white/30 uppercase">
                                                        Order History
                                                    </p>
                                                    {clientOrders[client.phone].map((order) => (
                                                        <div
                                                            key={order._id}
                                                            className="flex items-center justify-between rounded-xl bg-white/2 px-4 py-3"
                                                        >
                                                            <div>
                                                                <p className="text-xs font-bold text-white">
                                                                    {order.orderNumber}
                                                                </p>
                                                                <p className="text-[10px] text-white/30">
                                                                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                                        day: "numeric",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    })}
                                                                    {" · "}
                                                                    {order.items.length} item{order.items.length > 1 ? "s" : ""}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-xs font-bold text-white">
                                                                    ₹{order.subtotal.toLocaleString("en-IN")}
                                                                </span>
                                                                <span
                                                                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold uppercase ${
                                                                        statusColor[order.status] || "bg-white/5 text-white/40"
                                                                    }`}
                                                                >
                                                                    {order.status}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
