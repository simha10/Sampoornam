"use client";

import { useState } from "react";
import Image from "next/image";
import { PlusIcon, MinusIcon } from "@heroicons/react/24/outline";
import { useCartStore } from "@/stores/cartStore";
import type { Product } from "@/lib/api";

export default function ProductCard({ product }: { product: Product }) {
    const addItem = useCartStore((s) => s.addItem);
    const [selectedVariant, setSelectedVariant] = useState(0);
    const [added, setAdded] = useState(false);

    const variant = product.variants[selectedVariant];

    const handleAddToCart = () => {
        addItem({
            productId: product._id,
            productName: product.name,
            variant: variant.label,
            unitPrice: variant.price,
        });
        setAdded(true);
        setTimeout(() => setAdded(false), 1500);
    };

    const isPureGhee = product.tags.includes("pure-ghee");

    return (
        <div className="group flex flex-col overflow-hidden rounded-2xl border border-white/[0.04] bg-white/[0.02] transition-all hover:border-white/[0.08] hover:bg-white/[0.04]">
            {/* Product Image */}
            <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-[#1a1510] to-[#0e0e0e] sm:h-48">
                {product.imgURL ? (
                    <Image
                        src={product.imgURL}
                        alt={product.name}
                        fill
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 50vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <span className="text-4xl">
                            {product.category === "sweets" ? "🍬" : "🥨"}
                        </span>
                    </div>
                )}
                {isPureGhee && (
                    <span className="absolute right-3 top-3 rounded-full bg-[#D4AF37]/20 px-2 py-0.5 text-[9px] font-bold tracking-wider text-[#D4AF37] uppercase backdrop-blur-md">
                        Pure Ghee
                    </span>
                )}
                {product.isFeatured && (
                    <span className="absolute left-3 top-3 rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-bold tracking-wider text-white/70 uppercase backdrop-blur-md">
                        Bestseller
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4">
                <h3 className="text-sm font-semibold text-white sm:text-base">{product.name}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/40 line-clamp-2">
                    {product.description}
                </p>

                {/* Variant Selector */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {product.variants.map((v, idx) => (
                        <button
                            key={v.label}
                            onClick={() => setSelectedVariant(idx)}
                            className={`rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${idx === selectedVariant
                                ? "bg-[#D4AF37] text-[#0a0a0a]"
                                : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/70"
                                }`}
                        >
                            {v.label}
                        </button>
                    ))}
                </div>

                {/* Price + Add to Cart */}
                <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="text-lg font-bold text-white">
                        ₹{variant.price.toLocaleString("en-IN")}
                    </span>
                    <button
                        onClick={handleAddToCart}
                        className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all active:scale-95 ${added
                            ? "bg-green-500/20 text-green-400"
                            : "bg-[#D4AF37] text-[#0a0a0a] hover:bg-[#F5E6A3]"
                            }`}
                    >
                        {added ? (
                            "Added ✓"
                        ) : (
                            <>
                                <PlusIcon className="h-3.5 w-3.5" />
                                Add
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
