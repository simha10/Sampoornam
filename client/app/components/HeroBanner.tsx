"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function HeroBanner() {
    return (
        <section className="relative w-full pt-16 sm:pt-[72px]">
            {/* === MOBILE HERO: Full brand showcase using portrait MUI.png === */}
            <div className="relative block sm:hidden">
                <div className="relative w-full" style={{ aspectRatio: "9/16" }}>
                    <Image
                        src="/MUI.png"
                        alt="Sampoornam Foods"
                        fill
                        className="object-cover object-center"
                        priority
                        sizes="100vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/40 to-transparent" />
                </div>

                {/* Mobile CTA overlay */}
                <div className="absolute inset-x-0 bottom-0 px-6 pb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <span className="mb-3 inline-block rounded-full border border-[#D4AF37]/30 bg-[#0a0a0a]/60 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase backdrop-blur-md">
                            Signature Collection
                        </span>

                        <h1 className="font-[family-name:var(--font-playfair)] text-3xl font-bold leading-[1.15] text-white">
                            A Feast for the{" "}
                            <span className="text-gradient-gold">Senses</span>
                        </h1>

                        <p className="mt-3 text-sm leading-relaxed text-white/80">
                            Authentic South Indian flavours crafted to perfection.
                        </p>

                        <div className="mt-6 flex gap-3">
                            <Link
                                href="/shop"
                                className="flex flex-1 items-center justify-center rounded-full bg-[#D4AF37] py-3.5 text-sm font-bold tracking-wider text-[#0a0a0a] uppercase shadow-[0_0_25px_rgba(212,175,55,0.25)] transition-all active:scale-95"
                            >
                                Order Now
                            </Link>
                            <Link
                                href="/shop"
                                className="flex flex-1 items-center justify-center rounded-full border border-white/20 bg-white/[0.05] py-3.5 text-sm font-bold tracking-wider text-white uppercase backdrop-blur-md transition-all active:scale-95"
                            >
                                View Menu
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* === DESKTOP HERO: Full-bleed landscape === */}
            <div className="relative hidden sm:block">
                <div className="relative h-[75vh] min-h-[700px] w-full overflow-hidden">
                    <Image
                        src="/main.png"
                        alt="Sampoornam Foods — A Feast for the Senses"
                        fill
                        className="object-cover object-center"
                        priority
                        sizes="100vw"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]/20" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/70 via-transparent to-transparent" />

                    <div className="absolute inset-0 flex items-end">
                        <div className="mx-auto w-full max-w-7xl px-8 pb-16 lg:px-16 xl:px-20">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3 }}
                                className="max-w-lg"
                            >
                                <span className="mb-3 inline-block rounded-full border border-[#D4AF37]/30 bg-[#0a0a0a]/60 px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase backdrop-blur-md">
                                    Signature Collection
                                </span>

                                <h1 className="font-[family-name:var(--font-playfair)] text-5xl font-bold leading-[1.1] text-white lg:text-6xl">
                                    A Feast for the{" "}
                                    <span className="text-gradient-gold">Senses</span>
                                </h1>

                                <p className="mt-4 max-w-md text-lg leading-relaxed text-white/80">
                                    Authentic South Indian flavours crafted to perfection.
                                    Discover our premium range of sweets and namkeens.
                                </p>

                                <div className="mt-8 flex flex-wrap items-center gap-4">
                                    <Link
                                        href="/shop"
                                        className="rounded-full bg-[#D4AF37] px-8 py-4 text-sm font-bold tracking-wider text-[#0a0a0a] uppercase shadow-[0_0_30px_rgba(212,175,55,0.3)] transition-all duration-300 hover:scale-[1.03] hover:bg-[#F5E6A3] active:scale-95"
                                    >
                                        Order Now
                                    </Link>
                                    <Link
                                        href="/shop"
                                        className="rounded-full border border-white/20 bg-white/[0.04] px-8 py-4 text-sm font-bold tracking-wider text-white uppercase backdrop-blur-md transition-all hover:border-white/40 hover:bg-white/10"
                                    >
                                        View Menu
                                    </Link>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
