"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

export default function SignatureCollections() {
    return (
        <section className="w-full bg-[#0a0a0a]">
            <div className="mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:px-16 lg:py-24">
                {/* Section Header */}
                <div className="mb-10 md:mb-14">
                    <h2 className="font-[family-name:var(--font-playfair)] text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
                        Our Signature Collections
                    </h2>
                    <div className="mt-3 h-1 w-16 rounded-full bg-gradient-to-r from-[#D4AF37] to-[#D4AF37]/0" />
                    <p className="mt-4 max-w-lg text-base text-white/50">
                        Handcrafted with love and tradition. Every sweet tells a story, every
                        namkeen carries the warmth of South Indian kitchens.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
                    {/* Sweets Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6 }}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-white/[0.06] bg-[#111111] shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-[#D4AF37]/20 hover:shadow-[0_8px_40px_rgba(212,175,55,0.08)]"
                    >
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                            <Image
                                src="/Sweets.png"
                                alt="Luxury Sweets Collection"
                                fill
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 lg:p-10">
                            <div>
                                <span className="mb-2 inline-block text-[10px] font-bold tracking-[0.2em] text-[#D4AF37] uppercase">
                                    Premium Range
                                </span>
                                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl">
                                    Luxury Sweets
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-white/50">
                                    Handcrafted with pure desi ghee for the perfect festive treat.
                                    Experience authentic South Indian flavours in every bite.
                                </p>
                            </div>

                            <Link
                                href="/shop?category=sweets"
                                className="mt-8 flex w-fit items-center gap-2.5 rounded-full bg-[#D4AF37]/10 px-6 py-3 text-xs font-bold tracking-wider text-[#D4AF37] uppercase transition-all duration-300 hover:bg-[#D4AF37] hover:text-[#0a0a0a]"
                            >
                                View Collection
                                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>

                    {/* Namkeens Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-80px" }}
                        transition={{ duration: 0.6, delay: 0.15 }}
                        className="group flex flex-col overflow-hidden rounded-3xl border border-[#F3CA52]/[0.08] bg-[#111111] shadow-2xl transition-all duration-500 hover:-translate-y-1 hover:border-[#F3CA52]/20 hover:shadow-[0_8px_40px_rgba(243,202,82,0.08)]"
                    >
                        <div className="relative aspect-[16/10] w-full overflow-hidden">
                            <Image
                                src="/Namkeens.png"
                                alt="Crispy Namkeens Collection"
                                fill
                                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                                sizes="(max-width: 640px) 100vw, 50vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-[#111111]/20 to-transparent" />
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-6 sm:p-8 lg:p-10">
                            <div>
                                <span className="mb-2 inline-block text-[10px] font-bold tracking-[0.2em] text-[#F3CA52] uppercase">
                                    Authentic Savouries
                                </span>
                                <h3 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-[#F3CA52] sm:text-3xl">
                                    Crispy Namkeens
                                </h3>
                                <p className="mt-3 text-sm leading-relaxed text-white/50">
                                    Crunchy perfection crafted with hand-ground spices for every
                                    craving. Traditional recipes passed down through generations.
                                </p>
                            </div>

                            <Link
                                href="/shop?category=namkeens"
                                className="mt-8 flex w-fit items-center gap-2.5 rounded-full bg-[#F3CA52]/10 px-6 py-3 text-xs font-bold tracking-wider text-[#F3CA52] uppercase transition-all duration-300 hover:bg-[#F3CA52] hover:text-[#0a0a0a]"
                            >
                                View Collection
                                <ArrowRightIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
