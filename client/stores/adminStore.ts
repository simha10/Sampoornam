"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type AdminState = {
    token: string | null;

    // Actions
    setToken: (token: string) => void;
    logout: () => void;
    isAuthenticated: () => boolean;
    getToken: () => string | null;
};

export const useAdminStore = create<AdminState>()(
    persist(
        (set, get) => ({
            token: null,

            setToken: (token) => set({ token }),

            logout: () => set({ token: null }),

            isAuthenticated: () => {
                const token = get().token;
                if (!token) return false;

                // Check if token is expired by decoding the payload
                try {
                    const payload = JSON.parse(atob(token.split(".")[1]));
                    return payload.exp * 1000 > Date.now();
                } catch {
                    return false;
                }
            },

            getToken: () => get().token,
        }),
        {
            name: "sampoornam-admin",
            partialize: (state) => ({ token: state.token }),
        }
    )
);
