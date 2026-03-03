"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    PlusIcon,
    PencilSquareIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";
import { useAdminStore } from "@/stores/adminStore";
import {
    adminGetProducts,
    adminCreateProduct,
    adminUpdateProduct,
    adminDeleteProduct,
    Product,
} from "@/lib/api";

type ProductFormData = {
    name: string;
    slug: string;
    category: "sweets" | "namkeens";
    description: string;
    imgURL: string;
    pricingType: "weight" | "piece";
    variants: { label: string; price: number; weight: number }[];
    tags: string[];
    isAvailable: boolean;
    isFeatured: boolean;
    sortOrder: number;
};

const EMPTY_FORM: ProductFormData = {
    name: "",
    slug: "",
    category: "sweets",
    description: "",
    imgURL: "",
    pricingType: "weight",
    variants: [{ label: "", price: 0, weight: 0 }],
    tags: [],
    isAvailable: true,
    isFeatured: false,
    sortOrder: 0,
};

type CategoryFilter = "all" | "sweets" | "namkeens";

const CATEGORY_TABS: { key: CategoryFilter; label: string; emoji: string }[] = [
    { key: "all", label: "All", emoji: "✨" },
    { key: "sweets", label: "Sweets", emoji: "🍬" },
    { key: "namkeens", label: "Namkeens", emoji: "🥨" },
];

export default function AdminProductsPage() {
    const { getToken } = useAdminStore();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductFormData>(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [tagsInput, setTagsInput] = useState("");
    const [category, setCategory] = useState<CategoryFilter>("all");

    const filteredProducts = category === "all"
        ? products
        : products.filter((p) => p.category === category);

    const fetchProducts = useCallback(async () => {
        const token = getToken();
        if (!token) return;

        try {
            const result = await adminGetProducts(token);
            setProducts(result.data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to load products");
        } finally {
            setLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setTagsInput("");
        setShowForm(true);
    };

    const openEdit = (product: Product) => {
        setEditingId(product._id);
        setForm({
            name: product.name,
            slug: product.slug,
            category: product.category,
            description: product.description,
            imgURL: product.imgURL,
            pricingType: product.pricingType,
            variants: product.variants.map((v) => ({ ...v })),
            tags: [...product.tags],
            isAvailable: product.isAvailable,
            isFeatured: product.isFeatured,
            sortOrder: product.sortOrder,
        });
        setTagsInput(product.tags.join(", "));
        setShowForm(true);
    };

    const handleSubmit = async () => {
        const token = getToken();
        if (!token) return;

        setSubmitting(true);
        setError("");

        const payload = {
            ...form,
            tags: tagsInput
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean),
        };

        try {
            if (editingId) {
                await adminUpdateProduct(token, editingId, payload);
            } else {
                await adminCreateProduct(token, payload);
            }
            setShowForm(false);
            setLoading(true);
            fetchProducts();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : "Failed to save product");
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
        const token = getToken();
        if (!token) return;

        try {
            await adminDeleteProduct(token, id);
            setProducts((prev) => prev.filter((p) => p._id !== id));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Failed to delete");
        }
    };

    const toggleAvailability = async (product: Product) => {
        const token = getToken();
        if (!token) return;

        try {
            const result = await adminUpdateProduct(token, product._id, {
                isAvailable: !product.isAvailable,
            });
            setProducts((prev) => prev.map((p) => (p._id === product._id ? result.data : p)));
        } catch (err: unknown) {
            alert(err instanceof Error ? err.message : "Failed to update");
        }
    };

    const addVariant = () => {
        setForm((prev) => ({
            ...prev,
            variants: [...prev.variants, { label: "", price: 0, weight: 0 }],
        }));
    };

    const removeVariant = (index: number) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.filter((_, i) => i !== index),
        }));
    };

    const updateVariant = (index: number, field: string, value: string | number) => {
        setForm((prev) => ({
            ...prev,
            variants: prev.variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
        }));
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="font-[family-name:var(--font-playfair)] text-2xl font-bold text-white sm:text-3xl">
                        Products
                    </h1>
                    <p className="mt-1 text-sm text-white/40">
                        Manage your product catalog.
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 rounded-xl bg-[#D4AF37] px-4 py-2.5 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-[#F5E6A3] active:scale-95"
                >
                    <PlusIcon className="h-4 w-4" />
                    Add Product
                </button>
            </div>

            {/* Category Filter Tabs */}
            <div className="mb-6 flex flex-wrap gap-2">
                {CATEGORY_TABS.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setCategory(tab.key)}
                        className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${category === tab.key
                                ? "bg-[#D4AF37] text-[#0a0a0a]"
                                : "border border-white/10 text-white/50 hover:border-white/20 hover:text-white/80"
                            }`}
                    >
                        {tab.emoji} {tab.label}
                    </button>
                ))}
            </div>

            {error && !showForm && (
                <p className="mb-6 rounded-xl bg-red-500/10 px-4 py-3 text-sm text-red-400">{error}</p>
            )}

            {/* Product Form Modal */}
            <AnimatePresence>
                {showForm && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowForm(false)}
                            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-4 z-50 mx-auto max-w-lg overflow-y-auto rounded-2xl border border-white/[0.08] bg-[#111] p-6 shadow-2xl sm:inset-y-8"
                        >
                            <div className="mb-5 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-white">
                                    {editingId ? "Edit Product" : "New Product"}
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg text-white/40 hover:bg-white/5 hover:text-white"
                                >
                                    <XMarkIcon className="h-5 w-5" />
                                </button>
                            </div>

                            {error && (
                                <p className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
                            )}

                            <div className="flex flex-col gap-4">
                                {/* Name */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-white/50">Name</label>
                                    <input
                                        value={form.name}
                                        onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="e.g. Kaju Barfi"
                                    />
                                </div>

                                {/* Slug */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-white/50">Slug</label>
                                    <input
                                        value={form.slug}
                                        onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="e.g. kaju-barfi"
                                    />
                                </div>

                                {/* Category & Pricing Type */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">Category</label>
                                        <select
                                            value={form.category}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    category: e.target.value as "sweets" | "namkeens",
                                                }))
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                        >
                                            <option value="sweets" className="bg-[#1a1a1a]">Sweets</option>
                                            <option value="namkeens" className="bg-[#1a1a1a]">Namkeens</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="mb-1 block text-xs font-medium text-white/50">Pricing Type</label>
                                        <select
                                            value={form.pricingType}
                                            onChange={(e) =>
                                                setForm((p) => ({
                                                    ...p,
                                                    pricingType: e.target.value as "weight" | "piece",
                                                }))
                                            }
                                            className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                        >
                                            <option value="weight" className="bg-[#1a1a1a]">By Weight</option>
                                            <option value="piece" className="bg-[#1a1a1a]">By Piece</option>
                                        </select>
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-white/50">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                                        rows={2}
                                        className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="Short description"
                                    />
                                </div>

                                {/* Image URL */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-white/50">Image URL</label>
                                    <input
                                        value={form.imgURL}
                                        onChange={(e) => setForm((p) => ({ ...p, imgURL: e.target.value }))}
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="https://..."
                                    />
                                </div>

                                {/* Variants */}
                                <div>
                                    <div className="mb-2 flex items-center justify-between">
                                        <label className="text-xs font-medium text-white/50">Variants</label>
                                        <button
                                            type="button"
                                            onClick={addVariant}
                                            className="text-xs font-medium text-[#D4AF37] hover:text-[#F5E6A3]"
                                        >
                                            + Add Variant
                                        </button>
                                    </div>
                                    {form.variants.map((v, i) => (
                                        <div key={i} className="mb-2 flex items-center gap-2">
                                            <input
                                                value={v.label}
                                                onChange={(e) => updateVariant(i, "label", e.target.value)}
                                                placeholder="e.g. 250g"
                                                className="flex-1 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                value={v.price || ""}
                                                onChange={(e) => updateVariant(i, "price", Number(e.target.value))}
                                                placeholder="₹ Price"
                                                className="w-24 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                            />
                                            <input
                                                type="number"
                                                value={v.weight || ""}
                                                onChange={(e) => updateVariant(i, "weight", Number(e.target.value))}
                                                placeholder="Wt (g)"
                                                className="w-24 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                            />
                                            {form.variants.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(i)}
                                                    className="text-red-400/60 hover:text-red-400"
                                                >
                                                    <TrashIcon className="h-4 w-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Tags */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-white/50">
                                        Tags (comma separated)
                                    </label>
                                    <input
                                        value={tagsInput}
                                        onChange={(e) => setTagsInput(e.target.value)}
                                        className="w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#D4AF37] focus:outline-none"
                                        placeholder="e.g. bestseller, festive, premium"
                                    />
                                </div>

                                {/* Toggles */}
                                <div className="flex gap-6">
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
                                        <input
                                            type="checkbox"
                                            checked={form.isAvailable}
                                            onChange={(e) => setForm((p) => ({ ...p, isAvailable: e.target.checked }))}
                                            className="accent-[#D4AF37]"
                                        />
                                        Available
                                    </label>
                                    <label className="flex cursor-pointer items-center gap-2 text-sm text-white/60">
                                        <input
                                            type="checkbox"
                                            checked={form.isFeatured}
                                            onChange={(e) => setForm((p) => ({ ...p, isFeatured: e.target.checked }))}
                                            className="accent-[#D4AF37]"
                                        />
                                        Featured
                                    </label>
                                </div>

                                {/* Sort Order */}
                                <div>
                                    <label className="mb-1 block text-xs font-medium text-white/50">Sort Order</label>
                                    <input
                                        type="number"
                                        value={form.sortOrder}
                                        onChange={(e) => setForm((p) => ({ ...p, sortOrder: Number(e.target.value) }))}
                                        className="w-24 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white focus:border-[#D4AF37] focus:outline-none"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => setShowForm(false)}
                                        className="flex-1 rounded-xl border border-white/15 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/5"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={submitting}
                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#D4AF37] py-3 text-sm font-bold text-[#0a0a0a] transition-all hover:bg-[#F5E6A3] disabled:opacity-50"
                                    >
                                        <CheckIcon className="h-4 w-4" />
                                        {submitting ? "Saving..." : editingId ? "Update" : "Create"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Products Grid */}
            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/[0.03]" />
                    ))}
                </div>
            ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <p className="text-lg font-medium text-white/30">
                        {products.length === 0 ? "No products yet" : `No ${category} found`}
                    </p>
                    <p className="mt-1 text-sm text-white/20">
                        {products.length === 0 ? 'Click "Add Product" to get started.' : "Try a different category."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredProducts.map((product, index) => (
                        <motion.div
                            key={product._id}
                            initial={{ opacity: 0, y: 12 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4"
                        >
                            {/* Availability Badge */}
                            <div className="mb-3 flex items-center justify-between">
                                <span
                                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${product.isAvailable
                                        ? "bg-green-500/10 text-green-400"
                                        : "bg-red-500/10 text-red-400"
                                        }`}
                                >
                                    {product.isAvailable ? "Available" : "Unavailable"}
                                </span>
                                {product.isFeatured && (
                                    <span className="rounded-full bg-[#D4AF37]/10 px-2.5 py-0.5 text-[10px] font-bold tracking-wider text-[#D4AF37] uppercase">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Product Info */}
                            <h3 className="text-sm font-bold text-white">{product.name}</h3>
                            <p className="mt-0.5 text-xs text-white/40">
                                {product.category} · {product.pricingType}
                            </p>
                            <p className="mt-2 text-xs text-white/30 line-clamp-2">
                                {product.description}
                            </p>

                            {/* Variants */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                                {product.variants.map((v) => (
                                    <span
                                        key={v.label}
                                        className="rounded-md bg-white/[0.04] px-2 py-0.5 text-[10px] text-white/50"
                                    >
                                        {v.label}: ₹{v.price}
                                    </span>
                                ))}
                            </div>

                            {/* Actions */}
                            <div className="mt-4 flex gap-2">
                                <button
                                    onClick={() => toggleAvailability(product)}
                                    className={`flex-1 rounded-lg py-2 text-xs font-medium transition-colors ${product.isAvailable
                                        ? "bg-red-500/10 text-red-400 hover:bg-red-500/20"
                                        : "bg-green-500/10 text-green-400 hover:bg-green-500/20"
                                        }`}
                                >
                                    {product.isAvailable ? "Disable" : "Enable"}
                                </button>
                                <button
                                    onClick={() => openEdit(product)}
                                    className="flex items-center justify-center gap-1 rounded-lg bg-white/[0.04] px-3 py-2 text-xs font-medium text-white/60 transition-colors hover:bg-white/10 hover:text-white"
                                >
                                    <PencilSquareIcon className="h-3.5 w-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(product._id, product.name)}
                                    className="flex items-center justify-center rounded-lg px-2 py-2 text-red-400/60 transition-colors hover:bg-red-400/10 hover:text-red-400"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
