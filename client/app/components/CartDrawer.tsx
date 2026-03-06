"use client";

import { Fragment, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { XMarkIcon, PlusIcon, MinusIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { createOrder, getClientByPhone } from "@/lib/api";

const TIME_SLOTS = [
    "9 AM - 11 AM",
    "11 AM - 1 PM",
    "1 PM - 3 PM",
    "3 PM - 5 PM",
    "5 PM - 7 PM",
];

function getTomorrowDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
}

export default function CartDrawer() {
    const { items, isOpen, closeCart, updateQuantity, removeItem, clearCart, getTotal, getItemCount } =
        useCartStore();

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [deliveryAddress, setDeliveryAddress] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");
    const [deliveryTimeSlot, setDeliveryTimeSlot] = useState("");
    const [notes, setNotes] = useState("");
    const [isCheckout, setIsCheckout] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [clientLoading, setClientLoading] = useState(false);
    const [clientFound, setClientFound] = useState(false);

    const total = getTotal();
    const itemCount = getItemCount();

    // Auto-fill client details when phone number reaches 10 digits
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
                // Client not found — that's fine, user fills manually
            } finally {
                setClientLoading(false);
            }
        }
    }, []);

    const handlePlaceOrder = async () => {
        setError("");

        if (!customerName.trim()) return setError("Please enter your name");
        if (!customerPhone.trim() || customerPhone.replace(/\D/g, "").length < 10)
            return setError("Please enter a valid 10-digit phone number");
        if (!deliveryAddress.trim()) return setError("Please enter delivery address");
        if (!deliveryDate) return setError("Please select a delivery date");
        if (!deliveryTimeSlot) return setError("Please select a delivery time slot");

        setIsSubmitting(true);
        try {
            const payload = {
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                deliveryAddress: deliveryAddress.trim(),
                deliveryDate,
                deliveryTimeSlot,
                notes: notes.trim(),
                items: items.map((item) => ({
                    productId: item.productId,
                    variant: item.variant,
                    quantity: item.quantity,
                })),
            };

            const result = await createOrder(payload);

            // Open WhatsApp with the order message
            window.open(result.data.whatsappUrl, "_blank");

            // Clear cart and reset form
            clearCart();
            setCustomerName("");
            setCustomerPhone("");
            setDeliveryAddress("");
            setDeliveryDate("");
            setDeliveryTimeSlot("");
            setNotes("");
            setIsCheckout(false);
            setClientFound(false);
            closeCart();

            alert(`Order ${result.data.order.orderNumber} placed successfully! Check WhatsApp.`);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to place order. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeCart}
                        className="fixed inset-0 z-70 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed bottom-0 right-0 top-0 z-80 flex w-full max-w-md flex-col bg-[#0e0e0e] shadow-2xl"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-white/6 px-6 py-4">
                            <h2 className="text-lg font-bold text-white">
                                Your Cart {itemCount > 0 && `(${itemCount})`}
                            </h2>
                            <button
                                onClick={closeCart}
                                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/4 text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                            >
                                <XMarkIcon className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto px-6 py-4">
                            {items.length === 0 ? (
                                <div className="flex h-full flex-col items-center justify-center text-center">
                                    <p className="text-lg font-medium text-white/40">Your cart is empty</p>
                                    <p className="mt-2 text-sm text-white/25">
                                        Add delicious sweets & namkeens to get started!
                                    </p>
                                </div>
                            ) : isCheckout ? (
                                /* Checkout Form */
                                <div className="flex flex-col gap-4">
                                    <h3 className="text-sm font-bold tracking-wider text-brand-gold uppercase">
                                        Delivery Details
                                    </h3>

                                    {error && (
                                        <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                                            {error}
                                        </p>
                                    )}

                                    {/* Phone Number (first, for auto-fill) */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">
                                            Mobile Number
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="tel"
                                                value={customerPhone}
                                                onChange={(e) => handlePhoneChange(e.target.value)}
                                                placeholder="10-digit mobile number"
                                                maxLength={10}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
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
                                        <label className="mb-1 block text-xs font-medium text-white/50">Your Name</label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="Enter your full name"
                                            className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
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
                                            className="w-full resize-none rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                        />
                                    </div>

                                    {/* Delivery Date & Time Slot */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-white/50">
                                                Delivery Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={deliveryDate}
                                                onChange={(e) => setDeliveryDate(e.target.value)}
                                                min={getTomorrowDate()}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none scheme-dark"
                                            />
                                        </div>
                                        <div>
                                            <label className="mb-1 block text-xs font-medium text-white/50">
                                                Time Slot *
                                            </label>
                                            <select
                                                value={deliveryTimeSlot}
                                                onChange={(e) => setDeliveryTimeSlot(e.target.value)}
                                                className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white focus:border-brand-gold focus:outline-none"
                                            >
                                                <option value="" className="bg-[#1a1a1a]">Select</option>
                                                {TIME_SLOTS.map((slot) => (
                                                    <option key={slot} value={slot} className="bg-[#1a1a1a]">
                                                        {slot}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Notes */}
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">
                                            Notes (optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={notes}
                                            onChange={(e) => setNotes(e.target.value)}
                                            placeholder="Any special instructions"
                                            className="w-full rounded-xl border border-white/10 bg-white/3 px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-brand-gold focus:outline-none"
                                        />
                                    </div>
                                </div>
                            ) : (
                                /* Item List */
                                <div className="flex flex-col gap-4">
                                    {items.map((item) => (
                                        <CartItemRow
                                            key={`${item.productId}-${item.variant}`}
                                            item={item}
                                            onUpdateQuantity={updateQuantity}
                                            onRemove={removeItem}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="border-t border-white/6 px-6 py-4">
                                <div className="mb-4 flex items-center justify-between">
                                    <span className="text-sm text-white/50">Total</span>
                                    <span className="text-xl font-bold text-white">
                                        ₹{total.toLocaleString("en-IN")}
                                    </span>
                                </div>

                                {isCheckout ? (
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => setIsCheckout(false)}
                                            className="flex-1 rounded-full border border-white/15 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                                        >
                                            Back
                                        </button>
                                        <button
                                            onClick={handlePlaceOrder}
                                            disabled={isSubmitting}
                                            className="flex-1 rounded-full bg-[#25D366] py-3.5 text-sm font-bold text-white transition-all hover:bg-[#20BD5A] disabled:opacity-50"
                                        >
                                            {isSubmitting ? "Placing..." : "Place Order via WhatsApp"}
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsCheckout(true)}
                                        className="w-full rounded-full bg-brand-gold py-3.5 text-sm font-bold tracking-wider text-[#0a0a0a] uppercase transition-all hover:bg-[#F5E6A3] active:scale-[0.98]"
                                    >
                                        Proceed to Checkout
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ============ Cart Item Row ============

function CartItemRow({
    item,
    onUpdateQuantity,
    onRemove,
}: {
    item: CartItem;
    onUpdateQuantity: (id: string, variant: string, qty: number) => void;
    onRemove: (id: string, variant: string) => void;
}) {
    const lineTotal = item.unitPrice * item.quantity;

    return (
        <div className="flex items-start gap-4 rounded-2xl border border-white/4 bg-white/3 p-4">
            <div className="flex-1">
                <h4 className="text-sm font-semibold text-white">{item.productName}</h4>
                <p className="mt-0.5 text-xs text-white/40">
                    {item.variant} · ₹{item.unitPrice.toLocaleString("en-IN")} each
                </p>

                <div className="mt-3 flex items-center gap-3">
                    <button
                        onClick={() => onUpdateQuantity(item.productId, item.variant, item.quantity - 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/3 text-white/60 transition-colors hover:bg-white/10"
                    >
                        <MinusIcon className="h-3.5 w-3.5" />
                    </button>
                    <span className="min-w-[20px] text-center text-sm font-semibold text-white">
                        {item.quantity}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.productId, item.variant, item.quantity + 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/3 text-white/60 transition-colors hover:bg-white/10"
                    >
                        <PlusIcon className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>

            <div className="flex flex-col items-end gap-2">
                <span className="text-sm font-bold text-brand-gold">
                    ₹{lineTotal.toLocaleString("en-IN")}
                </span>
                <button
                    onClick={() => onRemove(item.productId, item.variant)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
                >
                    <TrashIcon className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}
