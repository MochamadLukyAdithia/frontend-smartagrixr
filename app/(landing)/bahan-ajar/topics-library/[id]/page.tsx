"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";

// --- DATA KATEGORI SIDEBAR ---
const KATEGORI_MODUL = [
  { id: "semua", label: "Semua", icon: "⊞" },
  { id: "budidaya", label: "Budidaya Tanaman Modern", icon: "🌱" },
  { id: "iot", label: "Smart Farming (IoT)", icon: "📡" },
  { id: "rantai_pasok", label: "Rantai Pasok Agroindustri", icon: "🔗" },
  { id: "perencanaan", label: "Perencanaan dan Pengelolaan", icon: "📅" },
  { id: "mekanisasi", label: "Mekanisasi Pertanian", icon: "🚜" },
];

const TINGKAT_AKSES = [
  { id: "gratis", label: "Gratis", icon: "FREE" },
  { id: "premium", label: "Premium", icon: "💎" },
];

// --- DATABASE DUMMY UNTUK KARTU (Dinamis Berdasarkan Kategori) ---
const DATABASE_MODUL: Record<string, any[]> = {
  budidaya: [
    {
      id: 1,
      title: "Pengenalan Budidaya Tanaman Modern",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 2,
      title: "Pemilihan Komoditas dan Benih Unggul",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 3,
      title: "Persiapan Media dan Lahan Tanam",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 4,
      title: "Teknik Penanaman Modern",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 5,
      title: "Pemupukan dan Manajemen Nutrisi Tanaman",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 6,
      title: "Pengendalian Hama dan Penyakit Tanaman",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 7,
      title: "Monitoring Pertumbuhan dan Kondisi Tanaman",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
    {
      id: 8,
      title: "Panen dan Evaluasi Hasil Budidaya",
      img: "/images/placeholder-modul.png",
      tag: "Agriculture Technology",
      isNew: true,
    },
  ],
  iot: [
    {
      id: 1,
      title: "Pengenalan Smart Farming dan IoT Pertanian",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 2,
      title: "Pengenalan Sensor dan Perangkat IoT",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 3,
      title: "Monitoring Suhu dan Kelembapan Lingkungan",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 4,
      title: "Monitoring Kondisi Tanah dan Tanaman",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 5,
      title: "Sistem Irigasi Cerdas Berbasis IoT",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 6,
      title: "Pengelolaan Data Monitoring IoT secara Real-time",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 7,
      title: "Dashboard dan Analisis Data Pertanian",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
    {
      id: 8,
      title: "Penerapan Sistem Smart Farming Terintegrasi",
      img: "/images/placeholder-modul-iot.png",
      tag: "Drones in Agriculture",
      isNew: true,
    },
  ],
  rantai_pasok: [
    {
      id: 1,
      title: "Dasar Perencanaan Produksi Pertanian",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 2,
      title: "Analisis Kebutuhan Bahan Baku",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 3,
      title: "Perencanaan Kapasitas dan Jadwal Produksi",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 4,
      title: "Perencanaan Biaya Produksi",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 5,
      title: "Pengenalan Proses Pengolahan Hasil Pertanian",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 6,
      title: "Teknik Pengolahan dan Pengendalian Proses",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 7,
      title: "Pengendalian Mutu Produk Hasil Pertanian",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
    {
      id: 8,
      title: "Evaluasi Efisiensi Produksi dan Pengolahan",
      img: "/images/placeholder-modul-supply.png",
      tag: "Rantai Pasok",
      isNew: true,
    },
  ],
  perencanaan: [
    {
      id: 1,
      title: "Pengenalan Rantai Pasok Agroindustri",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 2,
      title: "Pelaku dan Alur dalam Rantai Pasok",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 3,
      title: "Pengadaan Bahan Baku Pertanian",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 4,
      title: "Penyimpanan dan Pengelolaan Persediaan",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 5,
      title: "Pengelolaan dan Pengemasan Produk",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 6,
      title: "Distribusi dan Transportasi Produk",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 7,
      title: "Pemasaran hingga Konsumen Akhir",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
    {
      id: 8,
      title: "Evaluasi dan Optimalisasi Rantai Pasok",
      img: "/images/placeholder-modul-plan.png",
      tag: "Perencanaan",
      isNew: true,
    },
  ],
};

const DetailModul = () => {
  const [activeKategori, setActiveKategori] = useState("budidaya");
  const [activeAkses, setActiveAkses] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // State untuk Interaktivitas Modal/Pop-up
  const [selectedModul, setSelectedModul] = useState<any | null>(null);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isShareLinkOpen, setIsShareLinkOpen] = useState(false);

  // Ambil data kartu berdasarkan kategori yang aktif di sidebar
  const currentDaftarModul =
    DATABASE_MODUL[activeKategori] || DATABASE_MODUL["budidaya"];

  // Fungsi menutup modal
  const closeModal = () => {
    setSelectedModul(null);
    setIsShareMenuOpen(false);
    setIsShareLinkOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#EBECEE] pb-20 font-serif text-[#171717]">
      {/* --- HEADER --- */}
      <div className="pt-8 px-6 lg:px-12 max-w-[1600px] mx-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/beranda"
            className="flex h-12 w-12 items-center justify-center rounded-full border border-gray-400 bg-transparent transition-colors hover:bg-white"
          >
            <span className="text-xl font-sans text-black">X</span>
          </Link>
          <div className="flex items-center gap-2">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="#21a447"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M21 4H3C2.44772 4 2 4.44772 2 5V19C2 19.5523 2.44772 20 3 20H21C21.5523 20 22 19.5523 22 19V5C22 4.44772 21.5523 4 21 4Z"
                stroke="#21a447"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 4V20"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="border-b-[3px] border-[#21a447] text-[20px] font-bold text-[#21a447]">
              Modul
            </span>
          </div>
        </div>

        {/* --- SEARCH BAR --- */}
        <div className="mt-8 flex justify-center">
          <div className="relative w-full max-w-[1000px]">
            <span className="absolute inset-y-0 left-5 flex items-center text-gray-500">
              <svg
                width="22"
                height="22"
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
              placeholder="Apa yang ingin kamu pelajari hari ini?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border-none bg-white py-4 pl-14 pr-6 font-serif text-[16px] shadow-sm outline-none transition-all focus:ring-2 focus:ring-[#21a447]"
            />
          </div>
        </div>
      </div>

      {/* --- MAIN LAYOUT (SIDEBAR & GRID KONTEN) --- */}
      <main className="mx-auto mt-10 flex max-w-[1600px] flex-col gap-8 px-6 lg:flex-row lg:px-12 relative z-0">
        {/* SIDEBAR KIRI */}
        <aside className="w-full shrink-0 lg:w-[280px]">
          <div className="mb-6">
            <h3 className="mb-4 font-serif text-[18px] font-bold text-[#171717]">
              Modul Pembelajaran
            </h3>
            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
              {KATEGORI_MODUL.map((kat) => (
                <button
                  key={kat.id}
                  onClick={() => setActiveKategori(kat.id)}
                  className={`flex items-center gap-4 px-5 py-3.5 text-left font-serif text-[15px] transition-colors ${
                    activeKategori === kat.id
                      ? "bg-[#9bc54b] font-semibold text-[#171717]"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className={`text-[18px] ${activeKategori === kat.id ? "text-black" : "text-gray-600"}`}
                  >
                    {kat.icon}
                  </span>
                  {kat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-4 font-serif text-[18px] font-bold text-[#171717]">
              Tingkat Akses
            </h3>
            <div className="flex flex-col overflow-hidden rounded-xl bg-white shadow-sm">
              {TINGKAT_AKSES.map((akses) => (
                <button
                  key={akses.id}
                  onClick={() => setActiveAkses(akses.id)}
                  className={`flex items-center gap-4 px-5 py-3.5 text-left font-serif text-[15px] transition-colors ${
                    activeAkses === akses.id
                      ? "bg-gray-100 font-semibold text-black"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-[16px] font-sans font-bold text-gray-800">
                    {akses.icon}
                  </span>
                  {akses.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* KONTEN KANAN (DAFTAR KARTU) */}
        <section className="flex-1">
          <div className="mb-6">
            <p className="font-serif text-[16px] text-gray-700">
              Menampilkan{" "}
              <span className="font-bold text-black">
                {currentDaftarModul.length}
              </span>{" "}
              hasil pencarian
            </p>
          </div>

          {/* Grid Modul Dinamis */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {currentDaftarModul.map((modul, index) => (
              <div
                key={modul.id}
                onClick={() =>
                  setSelectedModul({ ...modul, number: index + 1 })
                }
                className="group flex flex-col overflow-hidden rounded-[20px] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
              >
                <div className="relative h-[160px] w-full bg-[#e8f1e0] p-4">
                  {modul.isNew && (
                    <div className="absolute right-3 top-3 z-10 rounded-full bg-[#21a447] px-3 py-1 font-sans text-[11px] font-bold tracking-wide text-white">
                      Baru
                    </div>
                  )}
                  <div className="absolute inset-0 overflow-hidden">
                    {/* Hapus src default jika Anda sudah punya gambar asli yang relevan dengan id kategori */}
                    <div className="h-full w-full bg-[#a3c968]/30"></div>
                    <div className="absolute left-4 top-4">
                      <p className="font-serif text-[16px] font-bold text-[#145a2b] leading-tight">
                        {modul.tag.split(" ").map((word: string, i: number) => (
                          <React.Fragment key={i}>
                            {word}
                            <br />
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-1 items-start justify-between gap-4 p-5">
                  <h4 className="font-serif text-[15px] font-semibold leading-snug text-[#171717] group-hover:text-[#21a447] transition-colors">
                    {modul.title}
                  </h4>
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#21a447] text-[12px] font-bold text-white">
                    {index + 1}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* =========================================================================
          MODAL POP-UP DETAIL MODUL (Ketika Kartu Diklik)
          ========================================================================= */}
      {selectedModul && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
          <div className="relative w-full max-w-[1000px] flex max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
            {/* Header Modal */}
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={closeModal}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                >
                  ←
                </button>
                <h2 className="font-serif text-[18px] font-bold text-[#171717]">
                  {selectedModul.number}. {selectedModul.title}
                </h2>
              </div>

              {/* Ikon Bagikan (Share) */}
              <div className="relative">
                <button
                  onClick={() => setIsShareMenuOpen(!isShareMenuOpen)}
                  className="flex h-10 w-10 items-center justify-center rounded-md hover:bg-gray-100 transition-colors"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                    <polyline points="16 6 12 2 8 6" />
                    <line x1="12" y1="2" x2="12" y2="15" />
                  </svg>
                </button>

                {/* Pop-up Menu Bagikan */}
                {isShareMenuOpen && (
                  <div className="absolute right-0 top-12 z-50 w-[350px] rounded-xl border border-gray-200 bg-white p-2 shadow-xl">
                    <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
                      <h4 className="font-serif font-bold text-gray-800">
                        Bagikan Project
                      </h4>
                      <button
                        onClick={() => {
                          setIsShareMenuOpen(false);
                          setIsShareLinkOpen(false);
                        }}
                        className="text-gray-400 hover:text-gray-700"
                      >
                        ✕
                      </button>
                    </div>

                    <div className="p-2">
                      <button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-gray-50 transition-colors">
                        <span className="text-gray-500">🎓</span>
                        <span className="font-serif text-[14px] text-gray-700">
                          Bagikan Project di Kelas Anda
                        </span>
                      </button>

                      <button
                        onClick={() => setIsShareLinkOpen(!isShareLinkOpen)}
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="text-gray-500">🔗</span>
                        <span className="font-serif text-[14px] text-gray-700">
                          Bagikan Tautan
                        </span>
                      </button>

                      {/* Sub-menu Bagikan Tautan (Minta Salin URL) */}
                      {isShareLinkOpen && (
                        <div className="mt-2 px-3 pb-3">
                          <p className="font-serif text-[13px] text-gray-500 mb-2">
                            Bagikan kepada orang-orang supaya mereka tahu
                            project Anda
                          </p>
                          <label className="font-serif text-[12px] font-bold text-gray-700">
                            Salin URL berikut
                          </label>
                          <div className="mt-1 flex items-center overflow-hidden rounded-md border border-gray-300">
                            <input
                              type="text"
                              readOnly
                              value={`https://smartagrixr.unej/modul/${selectedModul.id}`}
                              className="w-full bg-gray-50 px-3 py-2 font-sans text-[12px] text-gray-600 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Isi/Body Modal */}
            <div className="flex-1 overflow-y-auto p-6 sm:p-10">
              {/* Gambar / Ilustrasi Utama Modul */}
              <div className="mx-auto flex aspect-[16/9] w-full max-w-[700px] flex-col justify-between overflow-hidden rounded-2xl bg-[#a3c968] p-6 sm:p-10 shadow-inner relative">
                <div className="relative z-10 flex gap-10">
                  <h1 className="font-serif text-[32px] sm:text-[40px] font-bold text-[#145a2b] leading-tight">
                    {selectedModul.tag
                      .split(" ")
                      .map((w: string, i: number) => (
                        <React.Fragment key={i}>
                          {w}
                          <br />
                        </React.Fragment>
                      ))}
                  </h1>
                  <div className="flex-1 pt-2">
                    <h5 className="font-bold text-gray-800 text-[12px] mb-1">
                      Lorem ipsum dolor sit
                    </h5>
                    <p className="text-[10px] text-gray-700 leading-relaxed">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                      ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                </div>
                {/* Footer Navigasi Gambar Modul */}
                <div className="relative z-10 mt-auto flex items-center justify-between text-white font-bold text-[14px]">
                  <span>← 1/10 →</span>
                  <span className="flex gap-1">
                    <div className="h-2 w-2 bg-white rounded-full"></div>
                    <div className="h-2 w-2 bg-white/50 rounded-full"></div>
                  </span>
                </div>
                {/* Dekorasi Traktor/Sawah (Placeholder CSS) */}
                <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[#145a2b] to-transparent mix-blend-overlay"></div>
              </div>

              {/* Teks Resume / Deskripsi Lengkap Bawah */}
              <div className="mx-auto mt-10 w-full max-w-[700px]">
                <h4 className="font-serif text-[16px] font-bold text-[#171717] mb-2">
                  Resume :
                </h4>
                <p className="font-serif text-[15px] leading-relaxed text-gray-600 text-justify">
                  Materi ini mengajak mahasiswa mengenal konsep{" "}
                  {selectedModul.title.toLowerCase()} serta perbedaannya dengan
                  metode budidaya konvensional. Mahasiswa akan mempelajari
                  bagaimana teknologi, pengelolaan lingkungan, dan penggunaan
                  sumber daya yang efisien dapat mendukung proses produksi
                  tanaman. Melalui materi ini, mahasiswa diharapkan memahami
                  dasar penerapan teknologi cerdas untuk meningkatkan
                  produktivitas sekaligus mendukung pertanian berkelanjutan.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailModul;
