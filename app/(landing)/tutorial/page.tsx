"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { BookOpen, PenTool } from "lucide-react";

// --- MOCK DATA ---
const TUTORIAL_DATA = {
  ajar: [
    {
      id: "alat-peraga",
      title: "Alat peraga",
      description:
        "Objek 3D dan simulasi interaktif yang dapat diperbesar, diputar, dan dibedah setiap bagiannya.",
      items: [
        {
          id: 1,
          title: "Anatomi Tumbuhan",
          image: "/images/dashboard/beranda/1.png",
        },
        {
          id: 2,
          title: "Sistem Irigasi Pintar",
          image: "/images/dashboard/beranda/2.png",
        },
        {
          id: 3,
          title: "Geometri Lahan (X,Y,Z)",
          image: "/images/dashboard/beranda/3.png",
        },
        {
          id: 4,
          title: "Siklus Pertanian",
          image: "/images/dashboard/beranda/4.png",
        },
      ],
    },
    {
      id: "topik",
      title: "Topik",
      description:
        "Rencana pembelajaran lengkap dengan strategi mengajar dan materi 3D interaktif.",
      items: [
        {
          id: 5,
          title: "Fotosintesis",
          image: "/images/dashboard/beranda/1.png",
        },
        {
          id: 6,
          title: "Struktur Tanah",
          image: "/images/dashboard/beranda/2.png",
        },
        {
          id: 7,
          title: "Ekosistem Sawah",
          image: "/images/dashboard/beranda/3.png",
        },
        {
          id: 8,
          title: "Budaya Agraris",
          image: "/images/dashboard/beranda/4.png",
        },
      ],
    },
    {
      id: "printables",
      title: "Printables",
      description:
        "Lembar kerja dan materi pembelajaran yang diperkaya dengan AR.",
      items: [
        {
          id: 9,
          title: "Diorama AR: Pertumbuhan",
          image: "/images/dashboard/beranda/1.png",
        },
        {
          id: 10,
          title: "Poster AR: Alat Panen",
          image: "/images/dashboard/beranda/2.png",
        },
        {
          id: 11,
          title: "Spinner AR: Jenis Pupuk",
          image: "/images/dashboard/beranda/3.png",
        },
        {
          id: 12,
          title: "LKPD AR: Sel Tumbuhan",
          image: "/images/dashboard/beranda/4.png",
        },
      ],
    },
  ],
  buat: [
    {
      id: "buat-project",
      title: "Membuat Project",
      description:
        "Langkah-langkah membuat konten Augmented Reality interaktif dari nol.",
      items: [
        {
          id: 13,
          title: "Pengenalan Editor",
          image: "/images/dashboard/beranda/2.png",
        },
        {
          id: 14,
          title: "Menambahkan Objek 3D",
          image: "/images/dashboard/beranda/3.png",
        },
        {
          id: 15,
          title: "Mengatur Interaktivitas",
          image: "/images/dashboard/beranda/4.png",
        },
        {
          id: 16,
          title: "Export dan Publish",
          image: "/images/dashboard/beranda/1.png",
        },
      ],
    },
  ],
};

export default function TutorialPage() {
  const [activeMode, setActiveMode] = useState<"ajar" | "buat">("ajar");

  const currentData = TUTORIAL_DATA[activeMode];

  return (
    <div className="min-h-screen  bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      {/* Background biru muda yang lembut seperti di referensi */}
      <section className="pb-16 pt-[140px] text-center">
        <div className="container mx-auto px-6">
          <h1 className="mx-auto max-w-2xl font-serif text-[32px] font-bold leading-tight text-[#171717] sm:text-[40px]">
            Pelajari cara menggunakan <br className="hidden sm:block" />
            aktivitas siap pakai bersama siswa
          </h1>

          {/* Toggle Button */}
          <div className="mx-auto mt-8 flex w-max items-center rounded-full bg-white p-1.5 shadow-sm border border-gray-200">
            <button
              onClick={() => setActiveMode("ajar")}
              className={`flex items-center gap-2 rounded-full px-6 py-2 font-serif text-[14px] font-semibold transition-all ${
                activeMode === "ajar"
                  ? "bg-[#21a447] text-white shadow-md"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BookOpen size={16} />
              Ajar
            </button>
            <button
              onClick={() => setActiveMode("buat")}
              className={`flex items-center gap-2 rounded-full px-6 py-2 font-serif text-[14px] font-semibold transition-all ${
                activeMode === "buat"
                  ? "bg-[#21a447] text-white shadow-md"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <PenTool size={16} />
              Buat
            </button>
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-6 pb-24 pt-12">
        <div className="flex flex-col gap-16">
          {currentData.map((category) => (
            <div key={category.id} className="flex flex-col gap-6">
              {/* Category Header */}
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#171717]">
                  {category.title}
                </h2>
                <p className="mt-1 font-serif text-[14px] text-gray-500">
                  {category.description}
                </p>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {category.items.map((item) => (
                  <div
                    key={item.id}
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md hover:border-[#21a447]/30"
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                      <Image
                        src={item.image}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-serif text-[14px] font-semibold text-[#171717] group-hover:text-[#21a447] transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </main>
    </div>
  );
}
