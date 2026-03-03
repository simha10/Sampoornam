"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useAdminStore } from "@/stores/adminStore";
import { adminLogin } from "@/lib/api";

export default function AdminLoginPage() {
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { setToken } = useAdminStore();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!phone.trim() || !password.trim()) {
            setError("Phone number and password are required");
            return;
        }

        setLoading(true);
        try {
            const result = await adminLogin(phone.trim(), password);
            setToken(result.token);
            router.push("/admin");
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Login failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-sm"
            >
                {/* Logo / Header */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/10 text-2xl">
                        🔐
                    </div>
                    <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white">
                        Admin Panel
                    </h1>
                    <p className="mt-1 text-sm text-white/40">
                        Sampoornam Foods — Management Console
                    </p>
                </div>

                {/* Login Form */}
                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                    {error && (
                        <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl bg-red-500/10 px-4 py-3 text-center text-sm text-red-400"
                        >
                            {error}
                        </motion.p>
                    )}

                    <div>
                        <label className="mb-1.5 block text-xs font-medium tracking-wider text-white/50 uppercase">
                            Phone Number
                        </label>
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="Enter admin phone number"
                            maxLength={10}
                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-[#D4AF37] focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-xs font-medium tracking-wider text-white/50 uppercase">
                            Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3.5 text-sm text-white placeholder:text-white/25 transition-colors focus:border-[#D4AF37] focus:outline-none"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-2 w-full rounded-xl bg-[#D4AF37] py-3.5 text-sm font-bold tracking-wider text-[#0a0a0a] uppercase transition-all hover:bg-[#F5E6A3] active:scale-[0.98] disabled:opacity-50"
                    >
                        {loading ? "Signing in..." : "Sign In"}
                    </button>
                </form>

                <p className="mt-8 text-center text-xs text-white/20">
                    This area is restricted to authorized personnel only.
                </p>
            </motion.div>
        </div>
    );
}
