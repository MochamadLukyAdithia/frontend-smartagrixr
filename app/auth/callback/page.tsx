"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const role = searchParams.get("role");
    const isUnej = searchParams.get("is_unej");

    if (token) {
      setAuth(token, { role, isUnej });

      router.push("/dashboard/beranda");
    } else {
      router.push("/masuk");
    }
  }, [searchParams, router, setAuth]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center">
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
