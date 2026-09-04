"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import {
  ArrowLeft,
  MoreHorizontal,
  Share2,
  Link as LinkIcon,
  Box,
  Star,
} from "lucide-react";

interface MateriItem {
  id: string;
  title: string;
  badge: string;
  image: string;
  resume: string;
}

export const DetailKelas = () => {
  const [activeTab, setActiveTab] = useState<"beranda" | "materi" | "anggota">(
    "beranda",
  );
  const [selectedMateri, setSelectedMateri] = useState<MateriItem | null>(null);
  const [commentText, setCommentText] = useState("");

  const materiList: MateriItem[] = [
    {
      id: "1",
      title: "Pengenalan Mekanisasi Pertanian",
      badge: "Guru",
      image:
        "https://images.unsplash.com/photo-1586771107445-d3ca888129ff?q=80&w=800&auto=format&fit=crop",
      resume:
        "Materi ini membahas prinsip dasar mekanisasi pertanian, penggunaan alat dan mesin modern untuk meningkatkan efisiensi serta produktivitas lahan.",
    },
    {
      id: "2",
      title: "Pelaku dan Alur dalam Rantai Pasok",
      badge: "Guru",
      image:
        "https://images.unsplash.com/photo-1595974482597-4b8da8879bc5?q=80&w=800&auto=format&fit=crop",
      resume:
        "Memahami ekosistem rantai pasok agribisnis dari petani, distributor, hingga konsumen akhir serta tantangan logistik pertanian.",
    },
    {
      id: "3",
      title: "Pengenalan Budidaya Tanaman Modern",
      badge: "Guru",
      image:
        "https://images.unsplash.com/photo-1530836369250-ef72a3f5cda8?q=80&w=800&auto=format&fit=crop",
      resume:
        "Materi ini mengajak mahasiswa mengenal konsep budidaya tanaman modern serta perbedaannya dengan metode budidaya konvensional. Mahasiswa akan mempelajari bagaimana teknologi, pengelolaan lingkungan, dan penggunaan sumber daya yang efisien dapat mendukung proses produksi tanaman. Melalui materi ini, mahasiswa diharapkan memahami dasar penerapan budidaya modern untuk meningkatkan produktivitas sekaligus mendukung pertanian berkelanjutan.",
    },
  ];

  const students = [
    {
      id: "1",
      name: "Ahmad Rafi",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Andini Sayna",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: "3",
      name: "Salma Hanin Adawiyah",
      avatar:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: "4",
      name: "Muhammad Agus Salim",
      avatar:
        "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: "5",
      name: "Kevin Putra Wijaya",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop",
    },
  ];

  const comments = [
    {
      id: "1",
      name: "Andini Sayna",
      rating: "4.5",
      text: "Kelasnya seru banget, jadi bisa praktek 3D dengan interaktif.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop",
    },
    {
      id: "2",
      name: "Ahmad Rafi",
      rating: "5",
      text: "Kelasnya seru banget, jadi bisa praktek 3D dengan interaktif. Membantu saya memahami materi lebih dalam.",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop",
    },
  ];

  return (
    <div className="relative min-h-screen flex flex-col bg-[url('/bg.svg')] text-[#171717] overflow-hidden">
      <Navbar />

      <div className="absolute top-0 right-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/4 right-[-10%] w-[80%] h-[800px] bg-[#eef6f0] rotate-[-15deg] transform origin-top-right rounded-[100px]"></div>
      </div>

      <main className="relative z-10 flex w-full container mx-auto flex-col flex-1 px-6 pb-32 pt-32 sm:px-10">
        <div className="relative h-[180px] sm:h-[240px] w-full overflow-hidden rounded-2xl shadow-sm">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1600&auto=format&fit=crop"
            alt="Banner Pertanian Industrial"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-black/20" />

          <Link
            href="/dashboard/kelas"
            className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow transition hover:bg-white cursor-pointer"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <button
            type="button"
            className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow transition hover:bg-white cursor-pointer"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>

          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-white drop-shadow-md">
              Pertanian Industrial
            </h1>
          </div>
        </div>

        <div className="mt-6 border-b border-gray-200">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab("beranda")}
              className={`pb-3 font-serif text-base font-semibold transition-colors relative cursor-pointer ${
                activeTab === "beranda"
                  ? "text-[#145a2b]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Beranda
              {activeTab === "beranda" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#145a2b]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("materi")}
              className={`pb-3 font-serif text-base font-semibold transition-colors relative cursor-pointer ${
                activeTab === "materi"
                  ? "text-[#145a2b]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Materi
              {activeTab === "materi" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#145a2b]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("anggota")}
              className={`pb-3 font-serif text-base font-semibold transition-colors relative cursor-pointer ${
                activeTab === "anggota"
                  ? "text-[#145a2b]"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Anggota
              {activeTab === "anggota" && (
                <span className="absolute bottom-0 left-0 h-[2px] w-full bg-[#145a2b]" />
              )}
            </button>
          </nav>
        </div>

        {activeTab === "beranda" && (
          <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Ketik komentar anda disini"
                  className="w-full resize-none rounded-lg bg-[#f3f4f6] p-4 font-serif text-sm text-gray-800 outline-none placeholder:text-gray-400 min-h-[100px]"
                />
                <div className="mt-3 flex items-center gap-4">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#21a447] cursor-pointer"
                  >
                    <Box className="h-4 w-4" />
                    Project Assemblr
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-[#21a447] cursor-pointer"
                  >
                    <LinkIcon className="h-4 w-4" />
                    Tautan
                  </button>
                </div>
              </div>

              <div>
                <h3 className="font-serif text-sm font-semibold text-gray-800 mb-3">
                  Komentar
                </h3>
                <div className="space-y-3">
                  {comments.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 rounded-lg bg-white p-3 border border-gray-100 shadow-2xs"
                    >
                      <img
                        src={item.avatar}
                        alt={item.name}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-serif text-sm font-bold text-gray-900">
                            {item.name}
                          </span>
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500 bg-amber-50 px-1.5 py-0.5 rounded">
                            {item.rating}{" "}
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          </span>
                        </div>
                        <p className="mt-1 font-serif text-xs text-gray-600 leading-relaxed">
                          {item.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="font-serif text-sm font-bold text-gray-900 mb-3">
                  Materi Kelas
                </h3>
                <div
                  onClick={() => setSelectedMateri(materiList[0])}
                  className="cursor-pointer group overflow-hidden rounded-lg border border-gray-100 bg-white transition hover:shadow-md"
                >
                  <div className="relative h-28 w-full">
                    <img
                      src={materiList[0].image}
                      alt={materiList[0].title}
                      className="h-full w-full object-cover"
                    />
                    <span className="absolute top-2 right-2 rounded-full bg-[#21a447] px-2 py-0.5 text-[10px] font-semibold text-white">
                      {materiList[0].badge}
                    </span>
                  </div>
                  <div className="p-3 flex items-center justify-between">
                    <span className="font-serif text-xs font-medium text-gray-800 line-clamp-1">
                      {materiList[0].title}
                    </span>
                    <span className="h-2.5 w-2.5 rounded-full bg-[#21a447] shrink-0 ml-2" />
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <h3 className="font-serif text-sm font-bold text-gray-900 mb-4">
                  5 Siswa + 1 Guru
                </h3>
                <div className="flex -space-x-2 overflow-hidden mb-4">
                  {students.map((st) => (
                    <img
                      key={st.id}
                      src={st.avatar}
                      alt={st.name}
                      className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                    />
                  ))}
                  <img
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
                    alt="Guru"
                    className="inline-block h-9 w-9 rounded-full ring-2 ring-white object-cover"
                  />
                </div>
                <button
                  onClick={() => setActiveTab("anggota")}
                  className="font-serif text-xs font-semibold text-sky-600 underline hover:text-sky-700 cursor-pointer"
                >
                  Lihat Semua
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "materi" && (
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {materiList.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedMateri(item)}
                className="cursor-pointer group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md"
              >
                <div className="relative h-40 w-full overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <span className="absolute top-3 right-3 rounded-full bg-[#21a447] px-2.5 py-0.5 text-[11px] font-semibold text-white shadow-xs">
                    {item.badge}
                  </span>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <span className="font-serif text-xs font-bold text-gray-800 line-clamp-2">
                    {item.title}
                  </span>
                  <span className="h-3 w-3 rounded-full bg-[#21a447] shrink-0 ml-2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "anggota" && (
          <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Mahasiswa
                </h3>
                <span className="font-serif text-xs font-semibold text-gray-500">
                  Total : {students.length}
                </span>
              </div>
              <div className="space-y-3">
                {students.map((st) => (
                  <div key={st.id} className="flex items-center gap-3">
                    <img
                      src={st.avatar}
                      alt={st.name}
                      className="h-8 w-8 rounded-full object-cover"
                    />
                    <span className="font-serif text-xs font-medium text-gray-800">
                      {st.name}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm h-fit">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                <h3 className="font-serif text-base font-bold text-gray-900">
                  Guru
                </h3>
                <span className="font-serif text-xs font-semibold text-gray-500">
                  Total : 1
                </span>
              </div>
              <div className="flex items-center gap-4">
                <img
                  src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop"
                  alt="Lilik Indahtatik"
                  className="h-12 w-12 rounded-full object-cover"
                />
                <span className="font-serif text-base font-bold text-gray-900">
                  Lilik Indahtatik
                </span>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="z-[200] mt-2">
        <Footer />
      </div>

      {selectedMateri && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="relative w-full max-w-[850px] overflow-hidden rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedMateri(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4 text-gray-700" />
                </button>
                <h2 className="font-serif text-sm sm:text-base font-bold text-gray-900">
                  {selectedMateri.id}. {selectedMateri.title}
                </h2>
              </div>
              <button className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer">
                <Share2 className="h-4 w-4 text-gray-700" />
              </button>
            </div>

            <div className="relative h-[220px] sm:h-[300px] w-full overflow-hidden rounded-xl bg-gray-100 mb-5">
              <img
                src={selectedMateri.image}
                alt={selectedMateri.title}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-serif text-xs font-bold text-gray-800">
                Resume :
              </h4>
              <p className="font-serif text-xs text-gray-600 leading-relaxed text-justify">
                {selectedMateri.resume}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetailKelas;
