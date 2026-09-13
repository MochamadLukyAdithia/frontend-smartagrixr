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
  setAuth: (
    token: string,
    user: User,
    role?: UserRole | null,
    is_unej?: boolean
  ) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      is_unej: false,
      setAuth: (token, user, role = null, is_unej = false) =>
        set({ token, user, role, is_unej }),
      logout: () =>
        set({ token: null, user: null, role: null, is_unej: false }),
    }),
    { name: "smartagri-auth" }
  )
);