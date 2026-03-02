"use client";

import { CheckBadgeIcon, TruckIcon, SparklesIcon } from "@heroicons/react/24/outline";

const features = [
    {
        name: "100% Pure Desi Ghee",
        description: "Every recipe crafted with authentic, unadulterated desi ghee.",
        icon: SparklesIcon,
    },
    {
        name: "FSSAI Certified",
        description: "Meeting the highest standards of food safety and hygiene.",
        icon: CheckBadgeIcon,
    },
    {
        name: "Lucknow Delivery",
        description: "Fast, fresh, and secure delivery right to your doorstep.",
        icon: TruckIcon,
    },
];

export default function TrustBadges() {
    return (
        <section className="w-full border-y border-white/[0.04] bg-[#0e0e0e]">
            <div className="mx-auto max-w-[1400px] px-6 py-10 sm:px-10 sm:py-12 lg:px-16 xl:px-20">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 sm:gap-6 lg:gap-12">
                    {features.map((feature) => (
                        <div
                            key={feature.name}
                            className="flex items-start gap-4 sm:flex-col sm:items-center sm:text-center lg:flex-row lg:items-start lg:text-left"
                        >
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-[#D4AF37]">
                                <feature.icon className="h-6 w-6" aria-hidden="true" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-white">{feature.name}</h3>
                                <p className="mt-1 text-[13px] leading-relaxed text-white/50">
                                    {feature.description}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
