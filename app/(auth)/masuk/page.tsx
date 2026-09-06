"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { useAuthStore } from "@/stores/useAuthStore";

export default function Masuk() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { token, user } = await login({ email, password });
      setAuth(token, user);
      router.push("/dashboard/beranda");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal masuk. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen bg-[url('/bg-login.svg')] bg-cover bg-center bg-no-repeat text-[#171717]">
      <div className="relative hidden flex-1 flex-col items-center justify-center p-12 lg:flex">
        <div className="z-10 mb-8 text-center">
          <h1 className="font-serif text-[32px] leading-snug text-black xl:text-[40px]">
            <span className="uppercase tracking-wide">SELAMAT DATANG DI</span>
            <br />
            <span className="font-semibold">SmartAgriXR UNEJ</span>
          </h1>
        </div>

        <div className="relative h-[450px] w-[500px]">
          <div className="absolute left-[50%] top-0 z-10 -translate-x-1/2">
            <Image
              src="/images/landing/wheat.png"
              alt="Ilustrasi Gandum"
              width={160}
              height={160}
              className="animate-bounce object-contain"
              style={{ animationDuration: "3s" }}
            />
          </div>

          <div className="absolute left-[5%] top-[40%] z-20">
            <Image
              src="/images/landing/drone.svg"
              alt="Ilustrasi Drone"
              width={240}
              height={240}
              className="animate-bounce object-contain"
              style={{ animationDuration: "4s", animationDelay: "0.5s" }}
            />
          </div>

          <div className="absolute right-[15%] top-[55%] z-20">
            <Image
              src="/images/landing/farmer.png"
              alt="Ilustrasi Petani"
              width={150}
              height={150}
              className="animate-bounce object-contain"
              style={{ animationDuration: "3.5s", animationDelay: "1s" }}
            />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col justify-center bg-white px-8 py-12 shadow-2xl sm:px-16 lg:w-[500px] lg:rounded-l-[40px] xl:w-[600px] xl:px-24">
        <div className="mb-12 flex justify-center gap-10">
          <Link
            href="/masuk"
            className="border-b-[3px] border-[#21a447] pb-2 font-serif text-[22px] font-bold text-[#21a447]"
          >
            Masuk
          </Link>
          <Link
            href="/daftar"
            className="pb-2 font-serif text-[22px] font-semibold text-gray-400 transition-colors hover:text-gray-600"
          >
            Daftar
          </Link>
        </div>

        <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-serif text-[15px] text-black">
              E-mail atau username
            </label>
            <input
              type="text"
              placeholder="Masukkan e-mail atau username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 font-serif text-[15px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
            />
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="font-serif text-[15px] text-black">
                Kata Sandi
              </label>
              <Link
                href="#"
                className="font-serif text-[13px] text-[#2589f4] hover:underline"
              >
                Lupa Password?
              </Link>
            </div>
            <input
              type="password"
              placeholder="Masukkan kata sandi"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-gray-300 px-4 py-3.5 font-serif text-[15px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-full border border-gray-300 py-3.5 font-serif text-[16px] font-bold text-black transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Memproses..." : "Masuk"}
          </button>

          {error && (
            <p className="rounded-lg bg-red-50 px-4 py-2 text-center font-serif text-[13px] text-red-600">
              {error}
            </p>
          )}
        </form>

        <div className="my-8 flex items-center justify-center">
          <span className="font-serif text-[14px] text-black">
            Atau, masuk dengan :
          </span>
        </div>

        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => {
              window.location.href = `${process.env.NEXT_PUBLIC_API_URL}auth/google/redirect`;
            }}
            className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3.5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-1 cursor-pointer"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span className="font-serif text-[15px] text-black">
              Masuk dengan Google
            </span>
          </button>

          <button className="flex w-full items-center justify-center gap-3 rounded-full border border-gray-300 py-3.5 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-1">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-black"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <span className="font-serif text-[15px] text-black">
              Lanjutkan dengan email
            </span>
          </button>
        </div>

        <div className="mt-8 text-center">
          <Link
            href="/daftar"
            className="font-serif text-[13px] text-gray-500 transition-colors hover:text-[#21a447] hover:underline"
          >
            Daftar di sini jika belum memiliki akun
          </Link>
        </div>
      </div>
    </div>
  );
}
