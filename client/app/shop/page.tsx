"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getProducts, Product } from "@/lib/api";
import ProductCard from "../components/ProductCard";
import AppHeader from "../components/AppHeader";
import BottomNav from "../components/BottomNav";
import CartDrawer from "../components/CartDrawer";

type Category = "all" | "sweets" | "namkeens";

export default function ShopPage() {
    const searchParams = useSearchParams();
    const initialCategory = (searchParams.get("category") as Category) || "all";

    const [category, setCategory] = useState<Category>(initialCategory);
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Sync URL param with state
    useEffect(() => {
        const urlCategory = searchParams.get("category") as Category;
        if (urlCategory && ["sweets", "namkeens"].includes(urlCategory)) {
            setCategory(urlCategory);
        }
    }, [searchParams]);

    // Fetch products
    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError("");
            try {
                const params = category !== "all" ? { category } : {};
                const result = await getProducts(params);
                setProducts(result.data);
            } catch (err) {
                setError("Failed to load products. Make sure the server is running.");
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [category]);

    const tabs: { key: Category; label: string; emoji: string }[] = [
        { key: "all", label: "All", emoji: "✨" },
        { key: "sweets", label: "Sweets", emoji: "🍬" },
        { key: "namkeens", label: "Namkeens", emoji: "🥨" },
    ];

    return (
        <main className="min-h-screen bg-[#0a0a0a]">
            <AppHeader />
            <CartDrawer />

            <div className="mx-auto max-w-7xl px-6 pb-24 pt-24 sm:px-10 sm:pt-28 lg:px-16">
                {/* Page Header */}
                <div className="mb-8">
                    <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white sm:text-4xl">
                        Our Menu
                    </h1>
                    <p className="mt-2 text-sm text-white/50">
                        Freshly handcrafted with 100% pure desi ghee. Delivered to your doorstep in Lucknow.
                    </p>
                </div>

                {/* Category Tabs */}
                <div className="mb-8 flex gap-2">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setCategory(tab.key)}
                            className={`relative rounded-full px-5 py-2.5 text-sm font-medium transition-all ${category === tab.key
                                ? "bg-[#D4AF37] text-[#0a0a0a]"
                                : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white/80"
                                }`}
                        >
                            {tab.emoji} {tab.label}
                        </button>
                    ))}
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {Array.from({ length: 8 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-72 animate-pulse rounded-2xl bg-white/[0.03]"
                            />
                        ))}
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg font-medium text-red-400">{error}</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="mt-4 rounded-full bg-white/10 px-6 py-2 text-sm text-white transition-colors hover:bg-white/15"
                        >
                            Retry
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-lg font-medium text-white/40">No products found</p>
                    </div>
                ) : (
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
                    >
                        {products.map((product) => (
                            <ProductCard key={product._id} product={product} />
                        ))}
                    </motion.div>
                )}

                {/* Product count */}
                {!loading && !error && products.length > 0 && (
                    <p className="mt-6 text-center text-xs text-white/30">
                        Showing {products.length} {category === "all" ? "products" : category}
                    </p>
                )}
            </div>

            <BottomNav />
        </main>
    );
}
