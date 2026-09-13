"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Plus, Search } from "lucide-react";
import Footer from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { link } from "fs";

// Mock data materi berdasarkan gambar referensi
const MOCK_MATERI = [
  {
    id: 1,
    title: "Budidaya Tanaman Modern",
    categoryTitle: "Budidaya Tanaman Modern",
    gradient: "from-[#2b4c2b] to-[#4c7c34]",
    image: "/images/landing/wheat.png",
    link: "/bahan-ajar/topics-library/1",
  },
  {
    id: 2,
    title: "Smart Farming (IoT)",
    categoryTitle: "Smart Farming (IoT)",
    gradient: "from-[#112d4e] to-[#3f72af]",
    image: "/images/landing/drone.svg",
    link: "/bahan-ajar/topics-library/2",
  },
  {
    id: 3,
    title: "Rantai Pasok Agroindustri",
    categoryTitle: "Perencanaan dan Pengelolaan",
    gradient: "from-[#795548] to-[#d7ccc8]",
    link: "/bahan-ajar/topics-library/3",
  },
  {
    id: 4,
    title: "Perencanaan dan Pengelolaan",
    categoryTitle: "Rantai Pasok Agroindustri",
    gradient: "from-[#311b92] to-[#7e57c2]",
    link: "/bahan-ajar/topics-library/4",
  },
  {
    id: 5,
    title: "Teknologi Pasca Panen",
    categoryTitle: "Pengolahan Hasil",
    gradient: "from-[#e65100] to-[#ff9800]",
    link: "/bahan-ajar/topics-library/5",
  },
];

export default function SemuaMateriPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Filter materi berdasarkan pencarian
  const filteredMateri = MOCK_MATERI.filter((materi) =>
    materi.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen pb-[100px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />
      <div className="mt-20 bg-[#f8faf9] p-6 md:p-10">
        <div className="container">
          {/* Header & Navigasi */}
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <Link
                href="/dashboard/beranda"
                className="mb-4 inline-flex items-center gap-2 font-serif text-[13px] text-gray-500 transition-colors hover:text-[#21a447]"
              >
                <ArrowLeft size={16} />
                Kembali ke Beranda
              </Link>
              <h1 className="font-serif text-[28px] font-bold leading-tight text-[#171717] md:text-[32px]">
                Semua Materi Pembelajaran
              </h1>
              <p className="mt-1 font-serif text-[14px] text-gray-500">
                Eksplorasi seluruh modul dan materi agrikultur digital yang
                tersedia.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-80">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari materi..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-200 bg-white py-2.5 pl-10 pr-4 font-serif text-[13px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
              />
            </div>
          </div>

          {/* Grid Materi */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {/* Card: Materi Tersedia */}
            {filteredMateri.map((materi) => (
              <Link
                key={materi.id}
                href={`/bahan-ajar/topics-library/${materi.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md border border-gray-100"
              >
                <div
                  className={`relative h-[140px] w-full bg-gradient-to-br ${materi.gradient} p-4 flex items-center justify-between overflow-hidden`}
                >
                  {/* Ilustrasi 3D (Kiri) */}
                  <div className="relative z-10 h-24 w-24 flex-shrink-0 transition-transform duration-500 group-hover:scale-110">
                    <Image
                      src={materi.image || "/images/landing/wheat.png"}
                      alt={materi.title}
                      fill
                      className="object-contain"
                    />
                  </div>

                  {/* Teks Kategori (Kanan) */}
                  <div className="relative z-10 w-1/2 text-right">
                    <h3 className="font-serif text-[15px] font-bold leading-tight text-white drop-shadow-md">
                      {materi.categoryTitle}
                    </h3>
                  </div>

                  {/* Overlay efek glow */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Bagian Bawah: Info & Action */}
                <div className="flex flex-1 flex-col justify-between bg-white p-5">
                  <h4 className="font-serif text-[15px] font-bold text-[#171717] line-clamp-2">
                    {materi.title}
                  </h4>

                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="font-serif text-[12px] font-medium text-gray-500 transition-colors group-hover:text-[#21a447]">
                      Jelajahi Materi
                    </span>
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#21a447] text-white transition-transform group-hover:translate-x-1">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}

            {/* Card: Buat Materi Baru (Hanya muncul jika hasil pencarian tidak kosong, atau ditaruh statis) */}
            <button className="group flex min-h-[250px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-transparent p-6 transition-all hover:border-[#21a447] hover:bg-green-50/50">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-[#21a447] text-white shadow-sm transition-transform group-hover:scale-110">
                <Plus size={24} />
              </div>
              <span className="font-serif text-[15px] font-bold text-[#171717]">
                Buat Materi Baru
              </span>
            </button>
          </div>

          {/* Empty State Pencarian */}
          {filteredMateri.length === 0 && (
            <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                <Search size={32} />
              </div>
              <h3 className="font-serif text-[18px] font-bold text-[#171717]">
                Materi tidak ditemukan
              </h3>
              <p className="mt-2 font-serif text-[14px] text-gray-500">
                Pencarian untuk "{searchQuery}" tidak membuahkan hasil.
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
