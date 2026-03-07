"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    XMarkIcon,
    PlusIcon,
    MinusIcon,
    TrashIcon,
    MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import {
    adminGetProducts,
    adminCreateOrder,
    getClientByPhone,
    Product,
    AdminCreateOrderPayload,
} from "@/lib/api";
import { useAdminStore } from "@/stores/adminStore";

const TIME_SLOTS = [
    "9 AM - 11 AM",
    "11 AM - 1 PM",
    "1 PM - 3 PM",
    "3 PM - 5 PM",
    "5 PM - 7 PM",
];

const STATUS_OPTIONS = [
    { value: "ordered", label: "Ordered" },
    { value: "confirmed", label: "Confirmed" },
    { value: "preparing", label: "Preparing" },
    { value: "out-for-delivery", label: "Out for Delivery" },
    { value: "delivered", label: "Delivered" },
];

type SelectedItem = {
    productId: string;
    productName: string;
    variant: string;
    unitPrice: number;
    quantity: number;
};

function getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

export default function OfflineOrderModal({
    isOpen,
    onClose,
    onOrderCreated,
}: {
    isOpen: boolean;
    onClose: () => void;
    onOrderCreated: () => void;
}) {
    const { getToken } = useAdminStore();

    // Form state
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryDate, setDeliveryDate] = useState(getTomorrowDate());
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [status, setStatus] = useState("confirmed");
    const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

    // Products
    const [products, setProducts] = useState<Product[]>([]);
    const [productSearch, setProductSearch] = useState("");
    const [productsLoading, setProductsLoading] = useState(false);

    // Client auto-fill
    const [clientLoading, setClientLoading] = useState(false);
    const [clientFound, setClientFound] = useState(false);

    // Submit
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");

    // Fetch products on open
    useEffect(() => {
        if (!isOpen) return;
        const token = getToken();
        if (!token) return;

        setProductsLoading(true);
        adminGetProducts(token)
            .then((res) => setProducts(res.data.filter((p) => p.isAvailable)))
            .catch(() => {})
            .finally(() => setProductsLoading(false));
    }, [isOpen, getToken]);

    // Auto-fill client
    const handlePhoneChange = useCallback(async (value: string) => {
        setCustomerPhone(value);
        setClientFound(false);
        const clean = value.replace(/\D/g, "");
        if (clean.length === 10) {
            setClientLoading(true);
            try {
                const result = await getClientByPhone(clean);
                if (result.data) {
                    setCustomerName(result.data.name || "");
                    setDeliveryAddress(result.data.defaultAddress || "");
                    setClientFound(true);
                }
            } catch {
                // not found
            } finally {
                setClientLoading(false);
            }
        }
    }, []);

    const addItem = (product: Product, variant: { label: string; price: number }) => {
        const existing = selectedItems.find(
            (i) => i.productId === product._id && i.variant === variant.label
        );
        if (existing) {
            setSelectedItems((prev) =>
                prev.map((i) =>
                    i.productId === product._id && i.variant === variant.label
                        ? { ...i, quantity: i.quantity + 1 }
                        : i
                )
            );
        } else {
            setSelectedItems((prev) => [
                ...prev,
                {
                    productId: product._id,
                    productName: product.name,
                    variant: variant.label,
                    unitPrice: variant.price,
                    quantity: 1,
                },
            ]);
        }
    };

    const updateItemQty = (productId: string, variant: string, qty: number) => {
        if (qty <= 0) {
            setSelectedItems((prev) =>
                prev.filter((i) => !(i.productId === productId && i.variant === variant))
            );
        } else {
            setSelectedItems((prev) =>
                prev.map((i) =>
                    i.productId === productId && i.variant === variant
                        ? { ...i, quantity: qty }
                        : i
                )
            );
        }
    };

    const removeItem = (productId: string, variant: string) => {
        setSelectedItems((prev) =>
            prev.filter((i) => !(i.productId === productId && i.variant === variant))
        );
    };

    const subtotal = selectedItems.reduce((s, i) => s + i.unitPrice * i.quantity, 0);

    const handleSubmit = async () => {
        setError("");
        if (!customerName.trim()) return setError("Customer name is required");
        if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10)
            return setError("Valid 10-digit phone number required");
        if (!deliveryAddress.trim()) return setError("Delivery address is required");
        if (!deliveryDate) return setError("Delivery date is required");
        if (!deliveryTimeSlot) return setError("Delivery time slot is required");
        if (selectedItems.length === 0) return setError("Add at least one item");

        const token = getToken();
        if (!token) return;

        setIsSubmitting(true);
        try {
            const payload: AdminCreateOrderPayload = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                deliveryAddress: deliveryAddress.trim(),
                deliveryDate,
                deliveryTimeSlot,
                notes: notes.trim(),
                status,
                items: selectedItems.map((i) => ({
                    productId: i.productId,
                    variant: i.variant,
                    quantity: i.quantity,
                })),
            };

            await adminCreateOrder(token, payload);
            resetForm();
            onOrderCreated();
            onClose();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to create order");
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setCustomerName("");
        setCustomerPhone("");
        setDeliveryAddress("");
        setDeliveryDate(getTomorrowDate());
        setDeliveryTimeSlot("");
        setNotes("");
        setStatus("confirmed");
        setSelectedItems([]);
        setProductSearch("");
        setError("");
        setClientFound(false);
    };

    const filteredProducts = productSearch.trim()
        ? products.filter((p) =>
              p.name.toLowerCase().includes(productSearch.toLowerCase())
          )
        : products;

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-4 z-50 mx-auto flex max-h-[90vh] max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/8 bg-[#0e0e0e] shadow-2xl sm:inset-8"
                    >
                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
                            <div>
                                <h2 className="text-lg font-bold text-white">
                                    Add Offline Order
                                </h2>
                                <p className="text-xs text-white/40">
                                    Create order for phone/walk-in customers
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/4 text-white/60 hover:bg-white/10 hover:text-white"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Modal Body — Scrollable */}
                        <div className="flex-1 overflow-y-auto px-6 py-5">
                            {error && (
                                <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                                    {error}
                                </p>
                            )}

                            <div className="grid gap-6 lg:grid-cols-2">
                                {/* LEFT: Customer Details */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold tracking-wider text-brand-gold uppercase">
                                        Customer Details
                                    </h3>

                                    {/* Phone */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">
                                            Mobile Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                                placeholder="10-digit mobile"
                                                maxLength={10}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                            />
                                            {clientLoading && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/30">
                                                    Loading...
                                                </span>
                                            )}
                                            {clientFound && (
                                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-400">
                                                    ✓ Found
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">
                                            Customer Name
                                        </label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Full name"
                                            className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">
                                            Delivery Address
                                        </label>
                                        <textarea
                                            value={deliveryAddress}
                                            onChange={(e) => setDeliveryAddress(e.target.value)}
                                            placeholder="Full delivery address"
                                            rows={2}
                                            className="w-full resize-none rounded-xl border border-white/10 bg-white/3 px-4 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                        />
                                    </div>

                                    {/* Date & Time */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-white/50">
                                                Delivery Date
                                            </label>
                                            <input
                                                type="date"
                                                value={deliveryDate}
                                                onChange={(e) => setDeliveryDate(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none scheme-dark"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-white/50">
                                                Time Slot
                                            </label>
                                            <select
                                                value={deliveryTimeSlot}
                                                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                                            >
                                                <option value="" className="bg-[#1a1a1a]">
                                                    Select
                                                </option>
                                                {TIME_SLOTS.map((slot) => (
                                                    <option
                                                        key={slot}
                                                        value={slot}
                                                        className="bg-[#1a1a1a]"
                                                    >
                                                        {slot}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Status & Notes */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-white/50">
                                                Order Status
                                            </label>
                                            <select
                                                value={status}
                                                onChange={(e) => setStatus(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white focus:border-brand-gold focus:outline-none"
                                            >
                                                {STATUS_OPTIONS.map((opt) => (
                                                    <option
                                                        key={opt.value}
                                                        value={opt.value}
                                                        className="bg-[#1a1a1a]"
                                                    >
                                                        {opt.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-white/50">
                                                Notes
                                            </label>
                                            <input
                                                type="text"
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                placeholder="Optional"
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-3 py-2.5 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT: Product Picker */}
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-xs font-bold tracking-wider text-brand-gold uppercase">
                                        Select Items
                                    </h3>

                                    {/* Search */}
                                    <div className="relative">
                                        <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
                                        <input
                                            type="text"
                                            value={productSearch}
                                            onChange={(e) => setProductSearch(e.target.value)}
                                            placeholder="Search products..."
                                            className="w-full rounded-xl border border-white/10 bg-white/3 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                        />
                                    </div>

                                    {/* Products List */}
                                    <div className="max-h-[260px] space-y-2 overflow-y-auto rounded-xl border border-white/6 bg-white/1 p-3">
                                        {productsLoading ? (
                                            <p className="py-4 text-center text-xs text-white/30">
                                                Loading products...
                                            </p>
                                        ) : filteredProducts.length === 0 ? (
                                            <p className="py-4 text-center text-xs text-white/30">
                                                No products found
                                            </p>
                                        ) : (
                                            filteredProducts.map((product) => (
                                                <div
                                                    key={product._id}
                                                    className="rounded-xl border border-white/4 bg-white/2 p-3"
                                                >
                                                    <p className="mb-2 text-sm font-semibold text-white">
                                                        {product.name}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {product.variants.map((v) => (
                                                            <button
                                                                key={v.label}
                                                                onClick={() =>
                                                                    addItem(product, v)
                                                                }
                                                                className="flex items-center gap-1.5 rounded-lg border border-white/10 px-2.5 py-1.5 text-xs text-white/70 transition-colors hover:border-brand-gold hover:text-brand-gold"
                                                            >
                                                                <PlusIcon className="h-3 w-3" />
                                                                {v.label} · ₹
                                                                {v.price.toLocaleString("en-IN")}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>

                                    {/* Selected Items */}
                                    {selectedItems.length > 0 && (
                                        <div className="rounded-xl border border-white/6 bg-white/2">
                                            <div className="border-b border-white/4 px-4 py-2">
                                                <p className="text-[10px] font-bold tracking-wider text-white/30 uppercase">
                                                    Order Items ({selectedItems.length})
                                                </p>
                                            </div>
                                            <div className="max-h-[180px] overflow-y-auto">
                                                {selectedItems.map((item) => (
                                                    <div
                                                        key={`${item.productId}-${item.variant}`}
                                                        className="flex items-center justify-between border-b border-white/3 px-4 py-2.5 last:border-0"
                                                    >
                                                        <div className="flex-1 min-w-0">
                                                            <p className="truncate text-sm font-medium text-white">
                                                                {item.productName}
                                                            </p>
                                                            <p className="text-xs text-white/40">
                                                                {item.variant} · ₹
                                                                {item.unitPrice.toLocaleString(
                                                                    "en-IN"
                                                                )}
                                                            </p>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() =>
                                                                    updateItemQty(
                                                                        item.productId,
                                                                        item.variant,
                                                                        item.quantity - 1
                                                                    )
                                                                }
                                                                className="flex h-6 w-6 items-center justify-center rounded-md bg-white/4 text-white/60 hover:bg-white/10"
                                                            >
                                                                <MinusIcon className="h-3 w-3" />
                                                            </button>
                                                            <span className="min-w-[16px] text-center text-sm font-semibold text-white">
                                                                {item.quantity}
                                                            </span>
                                                            <button
                                                                onClick={() =>
                                                                    updateItemQty(
                                                                        item.productId,
                                                                        item.variant,
                                                                        item.quantity + 1
                                                                    )
                                                                }
                                                                className="flex h-6 w-6 items-center justify-center rounded-md bg-white/4 text-white/60 hover:bg-white/10"
                                                            >
                                                                <PlusIcon className="h-3 w-3" />
                                                            </button>
                                                            <button
                                                                onClick={() =>
                                                                    removeItem(
                                                                        item.productId,
                                                                        item.variant
                                                                    )
                                                                }
                                                                className="ml-1 flex h-6 w-6 items-center justify-center rounded-md text-red-400/60 hover:bg-red-400/10 hover:text-red-400"
                                                            >
                                                                <TrashIcon className="h-3.5 w-3.5" />
                                                            </button>
                                                        </div>
                                                        <span className="ml-3 text-sm font-bold text-brand-gold">
                                                            ₹
                                                            {(
                                                                item.unitPrice * item.quantity
                                                            ).toLocaleString("en-IN")}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="flex items-center justify-between border-t border-white/6 px-6 py-4">
                            <div>
                                {selectedItems.length > 0 && (
                                    <p className="text-sm text-white/50">
                                        Total:{" "}
                                        <span className="text-lg font-bold text-white">
                                            ₹{subtotal.toLocaleString("en-IN")}
                                        </span>
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="rounded-xl border border-white/15 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/5"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || selectedItems.length === 0}
                                    className="rounded-xl bg-brand-gold px-6 py-2.5 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-[#F5E6A3] disabled:opacity-50"
                                >
                                    {isSubmitting
                                        ? "Creating..."
                                        : `Create Order · ₹${subtotal.toLocaleString("en-IN")}`}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
