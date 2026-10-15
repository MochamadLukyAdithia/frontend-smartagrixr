"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Lock, LogIn, Loader2, UserPlus } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuthStore } from "@/stores/useAuthStore";

interface AuthGateProps {
  children: ReactNode;
  title?: string;
  description?: string;
}

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}

export function AuthGate({
  children,
  title = "Masuk untuk Melanjutkan",
  description = "Halaman ini khusus untuk pengguna yang sudah masuk. Silakan masuk atau daftar terlebih dahulu untuk menjelajahi bahan ajar imersif.",
}: AuthGateProps) {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s._hasHydrated);

  if (!hasHydrated) {
    return (
      <PageShell>
        <main className="container flex flex-1 items-center justify-center px-5 py-32 sm:px-8">
          <Loader2 className="h-10 w-10 animate-spin text-[#21a447]" />
        </main>
      </PageShell>
    );
  }

  if (!token) {
    return (
      <PageShell>
        <main className="container flex flex-1 items-center justify-center px-5 py-32 sm:px-8">
          <div className="w-full max-w-[440px] rounded-3xl border border-gray-100 bg-white p-8 text-center shadow-xl sm:p-10">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#21a447]/10">
              <Lock className="h-8 w-8 text-[#21a447]" />
            </div>
            <h1 className="font-serif text-[24px] font-bold text-[#171717] sm:text-[26px]">
              {title}
            </h1>
            <p className="mt-3 font-serif text-[14px] leading-relaxed text-gray-500">
              {description}
            </p>
            <div className="mt-8 flex flex-col gap-3">
              <Link
                href="/masuk"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#21a447] py-3.5 font-serif text-[15px] font-semibold text-white shadow-lg shadow-[#21a447]/20 transition hover:bg-[#1b8b3b] hover:scale-[1.01] active:scale-[0.99]"
              >
                <LogIn className="h-5 w-5" />
                Masuk
              </Link>
              <Link
                href="/daftar"
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 font-serif text-[15px] font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <UserPlus className="h-5 w-5" />
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        </main>
      </PageShell>
    );
  }

  return <>{children}</>;
}
