"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchMe } from "@/lib/api";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      router.replace("/masuk");
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const user = await fetchMe(token);
        if (!cancelled) {
          setAuth(token, user);
          router.replace("/dashboard/beranda");
        }
      } catch {
        if (!cancelled) router.replace("/masuk");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-[#21a447]" />
        <h2 className="font-serif text-xl font-bold text-[#21a447]">
          Autentikasi Google Berhasil!
        </h2>
        <p className="font-serif text-sm text-gray-500 mt-2">
          Sedang menyiapkan sesi Anda...
        </p>
      </div>
    </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center font-serif">
          Memuat...
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
