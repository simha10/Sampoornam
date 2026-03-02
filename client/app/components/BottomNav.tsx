"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    HomeIcon,
    ShoppingCartIcon,
    ClipboardDocumentListIcon,
    BuildingStorefrontIcon,
} from "@heroicons/react/24/outline";
import {
    HomeIcon as HomeSolid,
    ShoppingCartIcon as CartSolid,
    ClipboardDocumentListIcon as OrdersSolid,
    BuildingStorefrontIcon as ShopSolid,
} from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";
import { useCartStore } from "@/stores/cartStore";

export default function BottomNav() {
    const pathname = usePathname();
    const openCart = useCartStore((s) => s.openCart);
    const itemCount = useCartStore((s) => s.getItemCount());
    const [shopMenuOpen, setShopMenuOpen] = useState(false);

    const getActiveTab = () => {
        if (pathname === "/") return "home";
        if (pathname.startsWith("/shop")) return "shop";
        if (pathname.startsWith("/orders")) return "orders";
        return "home";
    };

    const activeTab = getActiveTab();

    return (
        <>
            {/* Shop slide-up overlay */}
            <AnimatePresence>
                {shopMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShopMenuOpen(false)}
                            className="fixed inset-0 z-[55] bg-black/40 md:hidden"
                        />
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 300 }}
                            className="fixed inset-x-0 bottom-16 z-[56] mx-4 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#141414] shadow-2xl md:hidden"
                        >
                            <div className="p-2">
                                <Link
                                    href="/shop?category=sweets"
                                    onClick={() => setShopMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.04] hover:text-[#D4AF37]"
                                >
                                    <span className="text-lg">🍬</span>
                                    Sweets
                                </Link>
                                <Link
                                    href="/shop?category=namkeens"
                                    onClick={() => setShopMenuOpen(false)}
                                    className="flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-white/80 transition-colors hover:bg-white/[0.04] hover:text-[#D4AF37]"
                                >
                                    <span className="text-lg">🥨</span>
                                    Namkeens
                                </Link>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Bottom Navigation Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] border-t border-white/[0.04] bg-[#0a0a0a]/95 pb-safe backdrop-blur-xl md:hidden">
                <div className="flex h-16 items-center justify-around px-2">
                    {/* Home */}
                    <Link href="/" className="relative flex h-full w-16 flex-col items-center justify-center gap-1">
                        {activeTab === "home" ? (
                            <HomeSolid className="h-6 w-6 text-[#D4AF37]" />
                        ) : (
                            <HomeIcon className="h-6 w-6 text-white/40" />
                        )}
                        <span className={`text-[10px] font-medium ${activeTab === "home" ? "text-[#D4AF37]" : "text-white/40"}`}>
                            Home
                        </span>
                        {activeTab === "home" && (
                            <motion.div layoutId="bottom-nav-indicator" className="absolute -top-[1px] h-[2px] w-8 rounded-b bg-[#D4AF37]" />
                        )}
                    </Link>

                    {/* Shop */}
                    <button
                        onClick={() => setShopMenuOpen(!shopMenuOpen)}
                        className="relative flex h-full w-16 flex-col items-center justify-center gap-1"
                    >
                        {activeTab === "shop" ? (
                            <ShopSolid className="h-6 w-6 text-[#D4AF37]" />
                        ) : (
                            <BuildingStorefrontIcon className="h-6 w-6 text-white/40" />
                        )}
                        <span className={`text-[10px] font-medium ${activeTab === "shop" ? "text-[#D4AF37]" : "text-white/40"}`}>
                            Shop
                        </span>
                        {activeTab === "shop" && (
                            <motion.div layoutId="bottom-nav-indicator" className="absolute -top-[1px] h-[2px] w-8 rounded-b bg-[#D4AF37]" />
                        )}
                    </button>

                    {/* Cart */}
                    <button
                        onClick={openCart}
                        className="relative flex h-full w-16 flex-col items-center justify-center gap-1"
                    >
                        <div className="relative">
                            <ShoppingCartIcon className="h-6 w-6 text-white/40" />
                            {itemCount > 0 && (
                                <span className="absolute -right-2 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#D4AF37] text-[8px] font-bold text-[#0a0a0a]">
                                    {itemCount > 9 ? "9+" : itemCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium text-white/40">Cart</span>
                    </button>

                    {/* Orders */}
                    <Link href="/orders" className="relative flex h-full w-16 flex-col items-center justify-center gap-1">
                        {activeTab === "orders" ? (
                            <OrdersSolid className="h-6 w-6 text-[#D4AF37]" />
                        ) : (
                            <ClipboardDocumentListIcon className="h-6 w-6 text-white/40" />
                        )}
                        <span className={`text-[10px] font-medium ${activeTab === "orders" ? "text-[#D4AF37]" : "text-white/40"}`}>
                            Orders
                        </span>
                        {activeTab === "orders" && (
                            <motion.div layoutId="bottom-nav-indicator" className="absolute -top-[1px] h-[2px] w-8 rounded-b bg-[#D4AF37]" />
                        )}
                    </Link>
                </div>
            </div>
        </>
    );
}
