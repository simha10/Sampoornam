"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
    productId: string;
    productName: string;
    variant: string;
    unitPrice: number;
    quantity: number;
};

type CartState = {
    items: CartItem[];
    isOpen: boolean;

    // Actions
    addItem: (item: Omit<CartItem, "quantity">) => void;
    removeItem: (productId: string, variant: string) => void;
    updateQuantity: (productId: string, variant: string, quantity: number) => void;
    clearCart: () => void;
    toggleCart: () => void;
    openCart: () => void;
    closeCart: () => void;

    // Computed
    getTotal: () => number;
    getItemCount: () => number;
};

export const useCartStore = create<CartState>()(
    persist(
        (set, get) => ({
            items: [],
            isOpen: false,

            addItem: (item) => {
                set((state) => {
                    const existingIndex = state.items.findIndex(
                        (i) => i.productId === item.productId && i.variant === item.variant
                    );

                    if (existingIndex >= 0) {
                        // Item with same variant exists — increment quantity
                        const updatedItems = [...state.items];
                        updatedItems[existingIndex] = {
                            ...updatedItems[existingIndex],
                            quantity: updatedItems[existingIndex].quantity + 1,
                        };
                        return { items: updatedItems, isOpen: true };
                    }

                    // New item
                    return {
                        items: [...state.items, { ...item, quantity: 1 }],
                        isOpen: true,
                    };
                });
            },

            removeItem: (productId, variant) => {
                set((state) => ({
                    items: state.items.filter(
                        (i) => !(i.productId === productId && i.variant === variant)
                    ),
                }));
            },

            updateQuantity: (productId, variant, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId, variant);
                    return;
                }
                set((state) => ({
                    items: state.items.map((i) =>
                        i.productId === productId && i.variant === variant
                            ? { ...i, quantity }
                            : i
                    ),
                }));
            },

            clearCart: () => set({ items: [] }),
            toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
            openCart: () => set({ isOpen: true }),
            closeCart: () => set({ isOpen: false }),

            getTotal: () => {
                return get().items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
            },

            getItemCount: () => {
                return get().items.reduce((sum, item) => sum + item.quantity, 0);
            },
        }),
        {
            name: "sampoornam-cart",
            partialize: (state) => ({ items: state.items }), // Only persist items, not UI state
        }
    )
);
