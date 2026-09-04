"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

// --- TABS UTAMA ---
const EDITOR_TABS = ["Project", "Marker Kustom", "Objek 3D", "Gambar 2D"];

// --- FILTER STATUS ---
const STATUS_FILTERS = [
  "Semua",
  "Terpublikasi",
  "Pribadi",
  "Draf",
  "Tidak Dapat Diduplikasi",
];

// --- TEMPLATE PILIHAN PROJEK BARU ---
const PROJECT_TEMPLATES = [
  {
    id: 1,
    title: "Gambar yang di-scan dengan AR",
    desc: "Tampilkan objek 3D di atas marker gambar datar secara langsung.",
    badge: "Marker AR",
  },
  {
    id: 2,
    title: "Visualisasi AR seperti Dunia Nyata",
    desc: "Letakkan dan sesuaikan model 3D di permukaan nyata secara presisi.",
    badge: "World Tracking",
  },
  {
    id: 3,
    title: "Konten 3D & AR Interaktif",
    desc: "Bangun kuis, tombol aksi, dan alur simulasi edukatif.",
    badge: "Interaktif",
  },
  {
    id: 4,
    title: "Sematkan Project 3D di Situs Web",
    desc: "Bagikan pengalaman XR interaktif langsung ke platform web Anda.",
    badge: "Web Embed",
  },
];

export default function DashboardEditor() {
  const [activeTab, setActiveTab] = useState("Project");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [hasProjects, setHasProjects] = useState(false); // Ubah ke true jika ingin melihat list proyek

  return (
    <div className="min-h-screen pb-[200px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="mx-auto mt-28 max-w-[1320px] px-5 sm:px-8">
        <div className="flex gap-2.5 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
          {EDITOR_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-xl px-6 py-2.5 font-serif text-[15px] font-semibold transition-all ${
                activeTab === tab
                  ? "bg-[#21a447] text-white shadow-md shadow-[#21a447]/20"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#21a447] hover:text-[#21a447]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "Project" && (
          <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
            <div className="lg:col-span-3 flex flex-col gap-8">
              <section className="rounded-[32px] border border-[#21a447]/20 bg-gradient-to-r from-[#eaf6ed] to-[#f4fbf5] p-6 sm:p-8 shadow-sm">
                <h2 className="mb-6 font-serif text-[18px] font-bold text-[#171717] sm:text-[20px]">
                  Project AR apa yang ingin Anda buat kali ini?
                </h2>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {PROJECT_TEMPLATES.map((tpl) => (
                    <div
                      key={tpl.id}
                      className="group flex flex-col justify-between rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#21a447]/40 hover:shadow-lg cursor-pointer"
                    >
                      <div>
                        <span className="inline-block rounded-md bg-[#f0f9f2] px-2.5 py-1 font-serif text-[11px] font-bold text-[#21a447] mb-3">
                          {tpl.badge}
                        </span>
                        <h3 className="font-serif text-[15px] font-bold text-[#171717] group-hover:text-[#21a447] transition-colors">
                          {tpl.title}
                        </h3>
                        <p className="mt-2 font-serif text-[13px] text-gray-500 line-clamp-3">
                          {tpl.desc}
                        </p>
                      </div>

                      <div className="mt-6 flex items-center justify-end">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f9f2] font-bold text-[#21a447] transition-transform group-hover:translate-x-1">
                          +
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="mt-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden">
                    {STATUS_FILTERS.map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setActiveFilter(filter)}
                        className={`whitespace-nowrap rounded-full px-4 py-2 font-serif text-[14px] transition-all ${
                          activeFilter === filter
                            ? "bg-[#171717] text-white font-medium"
                            : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {!hasProjects && (
                  <div className="mt-12 flex flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-200 bg-white/50 p-12 text-center">
                    <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#f0f9f2] text-4xl shadow-inner">
                      🌱
                    </div>
                    <h3 className="font-serif text-[20px] font-bold text-black">
                      Belum ada project yang dibuat
                    </h3>
                    <p className="mt-2 max-w-md font-serif text-[14px] text-gray-500">
                      Buat project 3D & AR dalam sekejap dan buat teman-temanmu
                      kagum dengan eksplorasi pertanian cerdas!
                    </p>
                    <button
                      onClick={() => setHasProjects(true)}
                      className="mt-6 rounded-full bg-[#21a447] px-8 py-3.5 font-serif text-[15px] font-bold text-white shadow-lg shadow-[#21a447]/20 transition-all hover:bg-[#198b3a]"
                    >
                      + Buat project pertamamu
                    </button>
                  </div>
                )}
              </section>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm">
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🪙</span>
                      <span className="font-serif text-[14px] font-semibold text-gray-700">
                        0 BLR Coins
                      </span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                      +
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">📍</span>
                      <span className="font-serif text-[14px] font-semibold text-gray-700">
                        0/1 Marker Kustom
                      </span>
                    </div>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-600">
                      +
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">💾</span>
                      <div>
                        <p className="font-serif text-[13px] font-semibold text-gray-700">
                          0 Byte / 30 MB
                        </p>
                        <p className="font-serif text-[11px] text-gray-400">
                          Penyimpanan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="py-6">
                  <p className="mb-4 font-serif text-[12px] font-bold uppercase tracking-wider text-gray-400">
                    Fitur Lainnya
                  </p>

                  <ul className="flex flex-col gap-3 font-serif text-[14px] text-gray-600">
                    <li className="flex items-center justify-between">
                      <span>3D Library Pro</span>
                      <span className="text-red-500 font-bold">✕</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Proyek Pribadi</span>
                      <span className="text-red-500 font-bold">✕</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Unggah Audio</span>
                      <span className="text-red-500 font-bold">✕</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Opsi embed lanjutan</span>
                      <span className="text-red-500 font-bold">✕</span>
                    </li>
                    <li className="flex items-center justify-between">
                      <span>Font 3D premium</span>
                      <span className="text-red-500 font-bold">✕</span>
                    </li>
                  </ul>
                </div>

                <button className="w-full rounded-full bg-gradient-to-r from-[#1b5e20] to-[#21a447] py-3.5 font-serif text-[15px] font-bold text-white shadow-md transition-all hover:opacity-95">
                  Upgrade 👑
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "Project" && (
          <div className="mt-12 flex flex-col items-center justify-center rounded-[32px] border border-dashed border-gray-200 bg-white/50 p-16 text-center">
            <h3 className="font-serif text-[22px] font-bold text-black">
              Kelola {activeTab} Anda di sini
            </h3>
            <p className="mt-2 font-serif text-[15px] text-gray-500">
              Fitur pengelolaan khusus untuk {activeTab.toLowerCase()} akan
              segera ditampilkan secara interaktif.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
