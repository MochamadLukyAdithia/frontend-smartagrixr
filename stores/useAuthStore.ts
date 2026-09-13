"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/lib/api";

export type UserRole = "dosen" | "mahasiswa" | "umum";

interface AuthState {
  token: string | null;
  user: User | null;
  role: UserRole | null;
  is_unej: boolean;
  _hasHydrated: boolean;
  setAuth: (
    token: string,
    user: User,
    role?: UserRole | null,
    is_unej?: boolean
  ) => void;
  logout: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      is_unej: false,
      _hasHydrated: false,
      setAuth: (token, user, role = null, is_unej = false) =>
        set({ token, user, role, is_unej }),
      logout: () =>
        set({ token: null, user: null, role: null, is_unej: false }),
      setHydrated: (hydrated) => set({ _hasHydrated: hydrated }),
    }),
    {
      name: "smartagri-auth",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        role: state.role,
        is_unej: state.is_unej,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);