"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";

// --- DATA MODUL PEMBELAJARAN ---
const LEARNING_MODULES = [
  {
    id: 1,
    title: "Budidaya Tanaman Modern",
    image: "/images/dashboard/beranda/1.png",
  },
  {
    id: 2,
    title: "Smart Farming (IoT)",
    image: "/images/dashboard/beranda/2.png",
  },
  {
    id: 3,
    title: "Rantai Pasok Agroindustri",
    image: "/images/dashboard/beranda/3.png",
  },
  {
    id: 4,
    title: "Perencanaan dan Pengelolaan",
    image: "/images/dashboard/beranda/4.png",
  },
  {
    id: 5,
    title: "Mekanisasi Pertanian",
    image: "/images/dashboard/beranda/1.png",
  },
];

// --- DATA ASSET 3D & KATEGORI FILTER ---
const ASSET_CATEGORIES = [
  {
    id: "Semua",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
        <path d="M3 3h8v8H3zm10 0h8v8h-8zM3 13h8v8H3zm10 0h8v8h-8z" />
      </svg>
    ),
  },
  { id: "Tanaman Budidaya", icon: "🌱" },
  { id: "Rumah Kaca", icon: "🏠" },
  { id: "Sistem Irigasi Cerdas", icon: "💧" },
  { id: "Drone Pertanian", icon: "🚁" },
  { id: "Mesin dan Alat Pertanian", icon: "🚜" },
  { id: "Sistem Pascapanen", icon: "📦" },
  { id: "Sensor IoT", icon: "📡" },
];

// Simulasi 9 item agar penuh seperti di gambar referensi
const ASSETS_3D = [
  {
    id: 1,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-1.png",
  },
  {
    id: 2,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-2.png",
  },
  {
    id: 3,
    title: "Rumah Kaca",
    category: "Rumah Kaca",
    image: "/images/dashboard/beranda/asset-3.png",
  },
  {
    id: 4,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-1.png",
  },
  {
    id: 5,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-2.png",
  },
  {
    id: 6,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-1.png",
  },
  {
    id: 7,
    title: "Rumah Kaca",
    category: "Rumah Kaca",
    image: "/images/dashboard/beranda/asset-3.png",
  },
  {
    id: 8,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-2.png",
  },
  {
    id: 9,
    title: "Tanaman Budidaya",
    category: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/asset-1.png",
  },
];

export default function DashboardBeranda() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = ASSETS_3D.filter((asset) => {
    if (activeCategory === "Semua") return true;
    return asset.category === activeCategory;
  });

  return (
    <div className="min-h-screen pb-[100px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="container mt-28  px-5 sm:px-8">
        {/* --- 1. SAPAAN PENGGUNA --- */}
        <div className="mb-6">
          <h1 className="font-serif text-[24px] font-bold text-[#171717] sm:text-[28px]">
            Selamat Datang, Andini!
          </h1>
        </div>

        {/* --- 2. MODUL PEMBELAJARAN --- */}
        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="font-serif text-[20px] font-bold text-black sm:text-[22px]">
              Modul Pembelajaran Pertanian Imersif
            </h2>

            <div className="relative w-full lg:w-[380px]">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Cari modul pembelajaran yang ingin dipelajari..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {LEARNING_MODULES.map((modul) => (
              <Link
                key={modul.id}
                href={`/bahan-ajar/topics-library/${modul.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#21a447]/50"
              >
                <div className="relative h-[150px] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={modul.image}
                    alt={modul.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="border-b border-gray-100 p-4 pb-5">
                  <h3 className="font-serif text-[15px] font-bold text-[#171717] leading-snug">
                    {modul.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between p-4 bg-white">
                  <span className="font-serif text-[13px] font-medium text-[#21a447]">
                    Jelajahi Materi
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#21a447] transition-transform group-hover:translate-x-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* --- 3. KELAS ANDA --- */}
        <section className="mt-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-[22px] font-bold text-black">
              Kelas Anda
            </h2>
            <Link
              href="#"
              className="font-serif text-[14px] font-medium text-[#21a447] hover:underline"
            >
              Lihat Semua Kelas
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            <div className="group relative h-[180px] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition-all hover:shadow-md">
              <Image
                src="/images/dashboard/beranda/1.png"
                alt="Pertanian Industrial"
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
                <h3 className="font-serif text-[16px] font-bold text-white">
                  Pertanian Industrial
                </h3>
              </div>
            </div>
            <div className="flex h-[180px] w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-colors hover:bg-gray-100 hover:border-gray-400">
              <div className="flex flex-col items-center justify-center rounded-xl bg-[#21a447] px-6 py-4 text-white shadow-sm transition-transform hover:scale-105">
                <span className="text-2xl leading-none">+</span>
                <span className="mt-2 font-serif text-[12px] font-medium tracking-wide">
                  Buat Kelas Baru
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* --- 4. ASSET 3D (DESAIN REVISI SESUAI GAMBAR) --- */}
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="font-serif text-[22px] font-bold text-black">
              Asset 3d
            </h2>
          </div>

          {/* Filter Chips (Bentuk Kapsul / Pill) */}
          <div className="flex gap-2.5 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {ASSET_CATEGORIES.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 font-serif text-[13px] font-medium transition-all border ${
                    isActive
                      ? "border-[#21a447] bg-[#21a447] text-white"
                      : "border-[#21a447]/50 bg-white text-gray-600 hover:border-[#21a447] hover:bg-[#21a447]/5"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center ${isActive ? "text-white" : "text-[#21a447]"}`}
                  >
                    {category.icon}
                  </span>
                  {category.id}
                </button>
              );
            })}
          </div>

          {/* Grid Aset 3D (Rapat, Portrait, Border Hijau Sekeliling Card) */}
          <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
            {filteredAssets.map((asset, index) => (
              <div
                key={index}
                className="group flex flex-col overflow-hidden rounded-md border border-[#21a447]/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                {/* Kotak Gambar - Aspect Ratio Portrait (Lebih tinggi dari lebar), TANPA padding */}
                <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={asset.image}
                    alt={asset.title}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Label Kategori Bawah - Dipisah dengan border atas hijau */}
                <div className="border-t border-[#21a447]/60 p-2 flex items-center justify-center gap-1.5 bg-white">
                  <span className="text-[12px] text-[#21a447] flex items-center justify-center">
                    {ASSET_CATEGORIES.find((c) => c.id === asset.category)
                      ?.icon || "🌱"}
                  </span>
                  <span className="font-serif text-[10px] font-medium text-[#21a447] truncate">
                    {asset.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
