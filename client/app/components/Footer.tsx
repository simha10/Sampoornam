"use client";
import Link from "next/link";
import NotFound from "./NotFound";
const contactPhone = process.env.NEXT_PUBLIC_CONTACT_PHONE;

export default function Footer() {
    return (
        <footer className="w-full border-t border-white/[0.04] bg-[#060606]">
            <div className="mx-auto max-w-[1400px] px-6 pt-16 pb-28 sm:px-10 sm:pb-16 lg:px-16 xl:px-20">
                <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
                    {/* Brand */}
                    <div className="flex flex-col">
                        <span className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
                            Sampoornam{" "}
                            <span className="text-[#D4AF37]">Foods</span>
                        </span>
                        <p className="mt-4 max-w-xs text-sm leading-relaxed text-white/50">
                            Premium South Indian sweets & namkeens, freshly handcrafted with
                            100% pure desi ghee. Delivered to your doorstep in Lucknow.
                        </p>
                        <div className="mt-6 flex flex-wrap items-center gap-2">
                            <span className="rounded-full border border-[#D4AF37]/30 bg-[#D4AF37]/10 px-3 py-1 text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">
                                Est. 2024
                            </span>
                            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] font-bold tracking-widest text-white/50 uppercase">
                                FSSAI Certified
                            </span>
                        </div>
                    </div>

                    {/* Shop Links */}
                    <div>
                        <h4 className="mb-6 text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
                            Shop by Category
                        </h4>
                        <ul className="flex flex-col gap-3.5 text-sm text-white/60">
                            <li>
                                <Link href="/shop?category=sweets" className="transition-colors hover:text-[#D4AF37]">
                                    Luxury Sweets
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=namkeens" className="transition-colors hover:text-[#D4AF37]">
                                    Crispy Namkeens
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=gift-boxes" className="transition-colors hover:text-[#D4AF37]">
                                    Festival Gift Boxes
                                </Link>
                            </li>
                            <li>
                                <Link href="/shop?category=corporate-gifting" className="transition-colors hover:text-[#D4AF37]">
                                    Corporate Gifting
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Customer Care */}
                    <div>
                        <h4 className="mb-6 text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
                            Customer Care
                        </h4>
                        <ul className="flex flex-col gap-3.5 text-sm text-white/60">
                            <li>
                                <Link href="/orders" className="transition-colors hover:text-[#D4AF37]">
                                    Track Order
                                </Link>
                            </li>
                            <li>
                                <Link href="/bulk-orders" className="transition-colors hover:text-[#D4AF37]">
                                    Bulk Orders
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="mb-6 text-[11px] font-bold tracking-[0.2em] text-white/40 uppercase">
                            Get in Touch
                        </h4>
                        <div className="flex flex-col gap-5 text-sm text-white/60">
                            <div className="flex gap-3">
                                <svg
                                    className="mt-0.5 h-5 w-5 shrink-0 text-[#D4AF37]"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    strokeWidth={1.5}
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                                    />
                                </svg>
                                <span>
                                    D2/530, Sector-F, Jankipuram
                                    <br />
                                    Lucknow — 226021
                                </span>
                            </div>

                            <a
                                href={`tel:${process.env.NEXT_PUBLIC_CONTACT_PHONE || "+917007066735"}`}
                                className="group rounded-2xl border border-[#D4AF37]/20 bg-[#D4AF37]/5 p-5 transition-all hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/10"
                            >
                                <span className="block text-[10px] font-bold tracking-[0.15em] text-[#D4AF37] uppercase">
                                    Order via Phone
                                </span>
                                <span className="mt-1 block text-xl font-bold text-white transition-colors group-hover:text-[#D4AF37]">
                                    {contactPhone}
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-white/[0.04] pt-8 text-xs text-white/40 sm:flex-row">
                    <p>© {new Date().getFullYear()} Sampoornam Foods. Crafted with ❤️</p>
                    <div className="flex gap-6">
                        <a
                            href="#"
                            className="transition-colors hover:text-white"
                        >
                            Privacy Policy
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-white"
                        >
                            Terms of Service
                        </a>
                        <a
                            href="#"
                            className="transition-colors hover:text-white"
                        >
                            Refund Policy
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
