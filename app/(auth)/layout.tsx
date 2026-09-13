"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);
  const router = useRouter();

  useEffect(() => {
    if (!hasHydrated) return;
    if (token) router.replace("/bahan-ajar/topics-library");
  }, [hasHydrated, token, router]);

  if (!hasHydrated) return null;
  if (token) return null;

  return <>{children}</>;
}
