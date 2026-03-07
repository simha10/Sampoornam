"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { CalendarDaysIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { useAdminStore } from "@/stores/adminStore";
import { adminGetRequirements, RequirementByVariant, RequirementByProduct } from "@/lib/api";

type ViewMode = "variant" | "weight";

function defaultDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

function formatWeight(grams: number): string {
    if (grams >= 1000) {
        const kg = grams / 1000;
        return `${kg % 1 === 0 ? kg : kg.toFixed(2)} kg`;
    }
    return `${grams} g`;
}

export default function AdminRequirementsPage() {
    const { getToken } = useAdminStore();
    const [date, setDate] = useState(defaultDate());
    const [view, setView] = useState<ViewMode>("variant");
    const [byVariant, setByVariant] = useState<RequirementByVariant[]>([]);
    const [byProduct, setByProduct] = useState<RequirementByProduct[]>([]);
    const [totalOrders, setTotalOrders] = useState(0);
    const [toPrepareOrders, setToPrepareOrders] = useState(0);
    const [dispatchedOrders, setDispatchedOrders] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchRequirements = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        setLoading(true);
        setError("");
        try {
            const result = await adminGetRequirements(token, date);
            setByVariant(result.data.byVariant);
            setByProduct(result.data.byProduct);
            setTotalOrders(result.data.totalOrders);
            setToPrepareOrders(result.data.toPrepareOrders ?? 0);
            setDispatchedOrders(result.data.dispatchedOrders ?? 0);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load requirements");
        } finally {
            setLoading(false);
        }
    }, [getToken, date]);

    useEffect(() => {
        fetchRequirements();
    }, [fetchRequirements]);

    const exportCSV = () => {
        let csvContent = "";

        if (view === "variant") {
            csvContent = "Product,Variant,Requirement,Delivered,Total\n";
            byVariant.forEach((r) => {
                csvContent += `"${r.productName}","${r.variant}",${r.requirementQty},${r.deliveredQty},${r.totalQty}\n`;
            });
        } else {
            csvContent = "Product,Requirement Weight,Delivered Weight,Total Weight,Requirement Qty,Delivered Qty,Total Qty\n";
            byProduct.forEach((r) => {
                csvContent += `"${r.productName}","${formatWeight(r.requirementWeight)}","${formatWeight(r.deliveredWeight)}","${formatWeight(r.totalWeight)}",${r.requirementQty},${r.deliveredQty},${r.totalQty}\n`;
            });
        }

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `requirements-${date}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

    const data = view === "variant" ? byVariant : byProduct;
    const hasData = data.length > 0;

    return (
        <div>
            {/* Header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="font-(family-name:--font-playfair) text-2xl font-bold text-white sm:text-3xl">
                        Delivery Target
                    </h1>
                    <p className="mt-1 text-sm text-white/40">
                        Daily delivery target based on delivery schedule.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Date Picker */}
                    <div className="relative">
                        <CalendarDaysIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="rounded-xl border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-white focus:border-brand-gold focus:outline-none scheme-dark"
                        />
                    </div>

                    {/* Export CSV */}
                    {hasData && (
                        <button
                            onClick={exportCSV}
                            className="flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-white/60 transition-colors hover:bg-white/5 hover:text-white"
                        >
                            <ArrowDownTrayIcon className="h-4 w-4" />
                            CSV
                        </button>
                    )}
                </div>
            </div>

            {/* View Toggle */}
            <div className="mb-6 flex gap-2">
                <button
                    onClick={() => setView("variant")}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                        view === "variant"
                            ? "bg-brand-gold text-[#0a0a0a]"
                            : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                >
                    📦 By Variant
                </button>
                <button
                    onClick={() => setView("weight")}
                    className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
                        view === "weight"
                            ? "bg-brand-gold text-[#0a0a0a]"
                            : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                    }`}
                >
                    ⚖️ By Product Weight
                </button>
            </div>

            {/* Summary Bar */}
            {!loading && hasData && (
                <div className="mb-6 flex gap-4">
                    <div className="flex-1 rounded-2xl border border-white/6 bg-white/2 p-4 text-center">
                        <p className="text-xs font-medium text-white/40">Orders</p>
                        <p className="mt-1 text-2xl font-bold text-white">{totalOrders}</p>
                    </div>
                    <div className="flex-1 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 text-center">
                        <p className="text-xs font-medium text-amber-400/60">To Prepare</p>
                        <p className="mt-1 text-2xl font-bold text-amber-400">
                            {toPrepareOrders}
                        </p>
                        <p className="text-[10px] text-amber-400/40">orders</p>
                    </div>
                    <div className="flex-1 rounded-2xl border border-green-500/20 bg-green-500/5 p-4 text-center">
                        <p className="text-xs font-medium text-green-400/60">Dispatched</p>
                        <p className="mt-1 text-2xl font-bold text-green-400">
                            {dispatchedOrders}
                        </p>
                        <p className="text-[10px] text-green-400/40">orders</p>
                    </div>
                </div>
            )}

            {error && (
                <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            {/* Loading */}
            {loading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="h-16 animate-pulse rounded-2xl bg-white/3" />
                    ))}
                </div>
            ) : !hasData ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-lg font-medium text-white/30">No orders for this date</p>
                    <p className="mt-1 text-sm text-white/20">Try selecting a different date.</p>
                </div>
            ) : view === "variant" ? (
                /* === BY VARIANT TABLE === */
                <div className="overflow-hidden rounded-2xl border border-white/6">
                    {/* Table header */}
                    <div className="grid grid-cols-5 gap-2 border-b border-white/6 bg-white/2 px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        <span className="col-span-2">Product</span>
                        <span className="text-center text-amber-400">Requirement</span>
                        <span className="text-center text-green-400">Delivered</span>
                        <span className="text-center">Total</span>
                    </div>
                    {byVariant.map((row, idx) => (
                        <motion.div
                            key={`${row.productName}-${row.variant}`}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`grid grid-cols-5 gap-2 px-5 py-3.5 ${
                                idx < byVariant.length - 1 ? "border-b border-white/3" : ""
                            }`}
                        >
                            <div className="col-span-2">
                                <p className="text-sm font-medium text-white">{row.productName}</p>
                                <p className="text-xs text-white/40">{row.variant}</p>
                            </div>
                            <span className={`text-center text-sm font-bold ${row.requirementQty > 0 ? "text-amber-400" : "text-white/20"}`}>
                                {row.requirementQty}
                            </span>
                            <span className={`text-center text-sm font-bold ${row.deliveredQty > 0 ? "text-green-400" : "text-white/20"}`}>
                                {row.deliveredQty}
                            </span>
                            <span className="text-center text-sm font-bold text-white">
                                {row.totalQty}
                            </span>
                        </motion.div>
                    ))}
                </div>
            ) : (
                /* === BY PRODUCT WEIGHT TABLE === */
                <div className="overflow-hidden rounded-2xl border border-white/6">
                    <div className="grid grid-cols-4 gap-2 border-b border-white/6 bg-white/2 px-5 py-3 text-xs font-semibold text-white/40 uppercase tracking-wider">
                        <span>Product</span>
                        <span className="text-center text-amber-400">Requirement</span>
                        <span className="text-center text-green-400">Delivered</span>
                        <span className="text-center">Total</span>
                    </div>
                    {byProduct.map((row, idx) => (
                        <motion.div
                            key={row.productName}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.03 }}
                            className={`grid grid-cols-4 gap-2 px-5 py-4 ${
                                idx < byProduct.length - 1 ? "border-b border-white/3" : ""
                            }`}
                        >
                            <div>
                                <p className="text-sm font-medium text-white">{row.productName}</p>
                                <p className="text-xs text-white/30">{row.totalQty} units</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-bold ${row.requirementWeight > 0 ? "text-amber-400" : "text-white/20"}`}>
                                    {formatWeight(row.requirementWeight)}
                                </p>
                                <p className="text-xs text-white/25">{row.requirementQty} units</p>
                            </div>
                            <div className="text-center">
                                <p className={`text-sm font-bold ${row.deliveredWeight > 0 ? "text-green-400" : "text-white/20"}`}>
                                    {formatWeight(row.deliveredWeight)}
                                </p>
                                <p className="text-xs text-white/25">{row.deliveredQty} units</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-bold text-white">
                                    {formatWeight(row.totalWeight)}
                                </p>
                                <p className="text-xs text-white/25">{row.totalQty} units</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Legend */}
            {!loading && hasData && (
                <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/30">
                    <span>🟡 <b className="text-amber-400">Requirement</b> = Ordered + Confirmed + Preparing</span>
                    <span>🟢 <b className="text-green-400">Delivered</b> = Out for Delivery + Delivered</span>
                </div>
            )}
        </div>
    );
}
