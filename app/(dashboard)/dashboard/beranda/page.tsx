"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

const LEARNING_MODULES = [
  {
    id: 1,
    title: "Budidaya Tanaman Modern",
    desc: "Teknologi penanaman hidroponik dan vertikultur berbasis sensor otomatis.",
    tag: "Tanaman Budidaya",
    image: "/images/dashboard/beranda/1.png",
  },
  {
    id: 2,
    title: "Smart Farming (IoT)",
    desc: "Implementasi Internet of Things untuk monitoring iklim mikro lahan secara real-time.",
    tag: "Sensor IoT",
    image: "/images/dashboard/beranda/2.png",
  },
  {
    id: 3,
    title: "Rantai Pasok Agroindustri",
    desc: "Simulasi logistik dan distribusi hasil panen dari petani hingga ke konsumen akhir.",
    tag: "Sistem Pascapanen",
    image: "/images/dashboard/beranda/3.png",
  },
  {
    id: 4,
    title: "Perencanaan dan Pengelolaan",
    desc: "Strategi bisnis agribisnis digital dan manajemen sumber daya pertanian modern.",
    tag: "Manajemen",
    image: "/images/dashboard/beranda/4.png",
  },
];
// --- DATA ASSET 3D ---
const ASSET_CATEGORIES = [
  "Semua",
  "Tanaman Budidaya",
  "Rumah Kaca",
  "Sistem Irigasi Cerdas",
  "Drone Pertanian",
  "Mesin dan Alat Pertanian",
  "Sistem Pascapanen",
  "Sensor IoT",
];

const ASSETS_3D = [
  { id: 1, title: "Tanaman Budidaya", category: "Tanaman Budidaya" },
  { id: 2, title: "Tanaman Budidaya", category: "Tanaman Budidaya" },
  { id: 3, title: "Rumah Kaca", category: "Rumah Kaca" },
  { id: 4, title: "Tanaman Budidaya", category: "Tanaman Budidaya" },
  { id: 5, title: "Tanaman Budidaya", category: "Tanaman Budidaya" },
  {
    id: 6,
    title: "Mesin dan Alat Pertanian",
    category: "Mesin dan Alat Pertanian",
  },
  { id: 7, title: "Tanaman Budidaya", category: "Tanaman Budidaya" },
  { id: 8, title: "Rumah Kaca", category: "Rumah Kaca" },
  { id: 9, title: "Tanaman Budidaya", category: "Tanaman Budidaya" },
];

export default function DashboardBeranda() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = ASSETS_3D.filter((asset) => {
    if (activeCategory === "Semua") return true;
    return asset.category === activeCategory;
  });

  return (
    <div className="min-h-screen pb-[200px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="mx-auto mt-28 max-w-[1320px] px-5 sm:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <span className="font-serif text-[14px] font-semibold text-[#21a447]">
              Dashboard Utama ✨
            </span>
            <h1 className="font-serif text-[28px] font-bold text-black sm:text-[34px]">
              Halo, Selamat Datang Kembali! 👋
            </h1>
            <p className="font-serif text-[15px] text-gray-500">
              Eksplorasi modul pembelajaran imersif dan aset 3D pertanian cerdas
              hari ini.
            </p>
          </div>
        </div>

        <section className="rounded-[28px] border border-gray-200/80 bg-white/90 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)] backdrop-blur-md sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="font-serif text-[22px] font-bold text-black sm:text-[24px]">
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
                className="w-full rounded-full border border-gray-200 bg-gray-50/50 py-3 pl-11 pr-4 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:bg-white focus:ring-1 focus:ring-[#21a447]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_MODULES.map((modul) => (
              <div
                key={modul.id}
                className="group flex flex-col justify-between overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-[#21a447]/30"
              >
                <div
                  className="relative h-[160px] w-full bg-cover bg-center p-5 flex flex-col justify-end overflow-hidden"
                  style={{ backgroundImage: `url(${modul.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>

                  <span className="relative z-10 font-serif text-[12px] font-medium text-white/90 uppercase tracking-wider">
                    {modul.tag}
                  </span>
                  <h3 className="relative z-10 font-serif text-[18px] font-bold leading-snug text-white">
                    {modul.title}
                  </h3>
                </div>

                <div className="flex flex-1 flex-col justify-between p-5">
                  <p className="line-clamp-2 font-serif text-[13px] text-gray-500 mb-6">
                    {modul.desc}
                  </p>

                  <Link
                    href={`/bahan-ajar/topics-library`}
                    className="flex items-center justify-between font-serif text-[14px] font-bold text-[#21a447] transition-colors group-hover:text-[#198b3a]"
                  >
                    <span>Jelajahi Materi</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f0f9f2] transition-transform group-hover:translate-x-1">
                      →
                    </span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-16">
          <div className="mb-6">
            <h2 className="font-serif text-[24px] font-bold text-black sm:text-[26px]">
              Asset 3d
            </h2>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {ASSET_CATEGORIES.map((category, idx) => (
              <button
                key={idx}
                onClick={() => setActiveCategory(category)}
                className={`whitespace-nowrap rounded-full px-5 py-2.5 font-serif text-[14px] font-semibold transition-all shadow-sm ${
                  activeCategory === category
                    ? "bg-[#21a447] text-white shadow-md shadow-[#21a447]/20"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#21a447] hover:text-[#21a447]"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-5">
            {filteredAssets.map((asset, index) => (
              <div
                key={index}
                className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#21a447]/40"
              >
                <div className="relative aspect-square w-full rounded-xl bg-gray-900/5 flex items-center justify-center overflow-hidden border border-gray-100">
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400 font-serif text-sm">
                    Preview 3D
                  </div>
                  <div className="absolute top-3 left-3 rounded-md bg-white/80 px-2 py-0.5 font-serif text-[10px] font-bold text-gray-600 backdrop-blur-sm">
                    3D Model
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between px-1">
                  <span className="font-serif text-[13px] font-semibold text-gray-700 truncate">
                    {asset.title}
                  </span>
                  <span className="rounded-full bg-[#f0f9f2] p-1.5 text-[#21a447] transition-transform group-hover:rotate-45">
                    ✨
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
