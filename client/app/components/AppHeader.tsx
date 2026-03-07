"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBagIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/stores/cartStore";

export default function AppHeader() {
    const itemCount = useCartStore((s) => s.getItemCount());
    const openCart = useCartStore((s) => s.openCart);
    const pathname = usePathname();
    const [shopOpen, setShopOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Prevent hydration mismatch: cart badge only renders after client mount
    useEffect(() => { setMounted(true); }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setShopOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, []);

    const isShopActive = pathname.startsWith("/shop");

    return (
        <motion.header
            initial={{ y: -60 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed left-0 right-0 top-0 z-60 border-b border-white/6 bg-[#0a0a0a]/95 backdrop-blur-2xl"
        >
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 sm:h-[72px] sm:px-10 lg:px-16">
                {/* Logo */}
                <Link href="/" className="flex items-baseline gap-2">
                    <span className="font-(family-name:--font-playfair)text-xl font-bold tracking-tight text-white sm:text-2xl">
                        Sampoornam
                    </span>
                    <span className="bg-linear-to-r from-brand-gold to-[#F5E6A3] bg-clip-text font-(family-name:--font-playfair) text-base font-bold tracking-tight text-transparent sm:text-lg">
                        Foods
                    </span>
                </Link>

                {/* Desktop Nav — hidden on mobile */}
                <nav className="hidden items-center gap-8 md:flex">
                    <Link
                        href="/"
                        className={`text-[13px] font-medium tracking-wide transition-colors hover:text-brand-gold ${pathname === "/" ? "text-brand-gold" : "text-white/60"
                            }`}
                    >
                        Home
                    </Link>

                    {/* Shop dropdown */}
                    <div ref={dropdownRef} className="relative">
                        <button
                            onClick={() => setShopOpen(!shopOpen)}
                            className={`flex items-center gap-1 text-[13px] font-medium tracking-wide transition-colors hover:text-brand-gold ${isShopActive ? "text-brand-gold" : "text-white/60"
                                }`}
                        >
                            Shop
                            <ChevronDownIcon
                                className={`h-3 w-3 transition-transform ${shopOpen ? "rotate-180" : ""}`}
                            />
                        </button>

                        <AnimatePresence>
                            {shopOpen && (
                                <motion.div
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 8 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute left-1/2 top-full mt-2 w-44 -translate-x-1/2 overflow-hidden rounded-xl border border-white/6 bg-[#141414] shadow-2xl"
                                >
                                    <Link
                                        href="/shop?category=sweets"
                                        onClick={() => setShopOpen(false)}
                                        className="block px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/4 hover:text-brand-gold"
                                    >
                                        🍬 Sweets
                                    </Link>
                                    <Link
                                        href="/shop?category=namkeens"
                                        onClick={() => setShopOpen(false)}
                                        className="block px-4 py-3 text-sm text-white/70 transition-colors hover:bg-white/4 hover:text-brand-gold"
                                    >
                                        🥨 Namkeens
                                    </Link>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <Link
                        href="/orders"
                        className={`text-[13px] font-medium tracking-wide transition-colors hover:text-brand-gold ${pathname === "/orders" ? "text-brand-gold" : "text-white/60"
                            }`}
                    >
                        Orders
                    </Link>
                </nav>

                {/* Cart */}
                <button
                    onClick={openCart}
                    className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-white/6 text-white/70 transition-colors hover:bg-white/8 hover:text-brand-gold"
                >
                    <ShoppingBagIcon className="h-5 w-5" />
                    {mounted && itemCount > 0 && (
                        <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-brand-gold text-[10px] font-bold text-[#0a0a0a]">
                            {itemCount > 9 ? "9+" : itemCount}
                        </span>
                    )}
                </button>
            </div>
        </motion.header>
    );
}
