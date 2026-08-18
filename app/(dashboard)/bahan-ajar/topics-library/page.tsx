"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";

const SUBJECTS = [
  { name: "Literasi", icon: "📖" },
  { name: "Sains", icon: "🧬" },
  { name: "Matematika", icon: "√" },
  { name: "Pendidikan Pancasila", icon: "🦅" },
  { name: "Umum", icon: "⊞" },
];

const GRADES = [
  "Prasekolah",
  "TK A",
  "TK B",
  "SD",
  "Kelas 1",
  "Kelas 2",
  "Kelas 3",
  "Kelas 4",
  "Kelas 5",
  "Kelas 6",
  "SMP",
  "7",
];

const RECOMMENDATIONS = [
  {
    id: 1,
    title: "Dampak Pembakaran pada Hidrokarbon",
    image: "/images/topics/topic-1.jpg",
    grade: "11",
  },
  {
    id: 2,
    title: "Isomer pada Hidrokarbon",
    image: "/images/topics/topic-2.jpg",
    grade: "11",
  },
  {
    id: 3,
    title: "Alkena dan Alkuna",
    image: "/images/topics/topic-3.jpg",
    grade: "11",
  },
  {
    id: 4,
    title: "Sifat Fisis dan Kimia Hidrokarbon",
    image: "/images/topics/topic-4.jpg",
    grade: "11",
  },
  { id: 5, title: "Alkana", image: "/images/topics/topic-5.jpg", grade: "11" },
  {
    id: 6,
    title: "Kekhasan Atom Karbon",
    image: "/images/topics/topic-6.jpg",
    grade: "11",
  },
  {
    id: 7,
    title: "Persen Hasil dan Kemurnian",
    image: "/images/topics/topic-7.jpg",
    grade: "11",
  },
  {
    id: 8,
    title: "Pereaksi Pembatas",
    image: "/images/topics/topic-8.jpg",
    grade: "11",
  },
  {
    id: 9,
    title: "3.4 Iritabilitas pada Tumbuhan",
    image: "/images/topics/topic-9.jpg",
    grade: "11",
  },
  {
    id: 10,
    title: "3.3 Reproduksi pada Tumbuhan",
    image: "/images/topics/topic-10.jpg",
    grade: "11",
  },
];

export default function TopicsLibrary() {
  return (
    <div className="min-h-screen pb-[200px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="mx-auto mt-28 max-w-[1320px] px-5 sm:px-8">
        {/* --- 1. HERO SECTION (Berdasarkan banner kuning di Gambar 1, diadaptasi ke gaya hijau) --- */}
        <section className="relative flex flex-col items-center justify-between overflow-hidden rounded-[32px] bg-gradient-to-r from-[#eaf6ed] to-[#f4fbf5] p-8 shadow-sm md:flex-row lg:p-14">
          <div className="z-10 w-full md:w-3/5">
            {/* Tags */}
            <div className="mb-6 flex gap-3">
              <span className="rounded-full bg-white/60 px-4 py-2 font-serif text-[14px] font-semibold text-[#4a4a4a] backdrop-blur-sm">
                Alat Peraga Digital
              </span>
              <span className="rounded-full bg-white px-4 py-2 font-serif text-[14px] font-bold text-[#21a447] shadow-sm">
                Slide Interaktif
              </span>
            </div>

            {/* Headline */}
            <h1 className="font-serif text-[32px] font-bold leading-[1.2] text-black sm:text-[40px] lg:text-[46px]">
              Hemat waktu dengan <br className="hidden lg:block" />
              <span className="text-[#21a447]">Slide Learning</span> Interaktif
              siap pakai
            </h1>
          </div>

          {/* Hero Image (Ganti src dengan gambar ilustrasi maskot/3D Anda) */}
          <div className="relative mt-8 h-[200px] w-[280px] md:mt-0 md:h-[280px] md:w-[350px] lg:h-[320px] lg:w-[400px]">
            {/* Menggunakan div abu-abu sebagai placeholder, ganti dengan Image nanti */}
            <div className="absolute inset-0 rounded-2xl bg-gray-200/50 flex items-center justify-center border-2 border-dashed border-gray-300">
              <span className="text-gray-500 font-serif">
                Ilustrasi Hero 3D
              </span>
            </div>
            {/* 
            <Image
              src="/images/topics/hero-illustration.png"
              alt="Ilustrasi Slide Learning"
              fill
              className="object-contain"
            /> 
            */}
          </div>
        </section>

        {/* --- 2. KATEGORI MATA PELAJARAN --- */}
        <section className="mt-16">
          <h2 className="font-serif text-[20px] font-bold text-[#21a447] sm:text-[22px]">
            Jelajahi berdasarkan Mata Pelajaran
          </h2>

          {/* Scrollable Container (Sembunyikan scrollbar) */}
          <div className="mt-5 flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {SUBJECTS.map((subject, index) => (
              <button
                key={index}
                className="flex min-w-[200px] flex-shrink-0 items-center gap-4 rounded-2xl border border-gray-100 bg-white px-6 py-4 shadow-[0_5px_15px_rgba(0,0,0,0.04)] transition-transform hover:-translate-y-1 hover:border-[#21a447]/30 hover:shadow-[0_10px_20px_rgba(33,164,71,0.1)] focus:outline-none"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f0f9f2] text-[24px] font-bold text-[#21a447]">
                  {subject.icon}
                </div>
                <span className="font-serif text-[16px] font-semibold text-[#171717]">
                  {subject.name}
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* --- 3. KATEGORI KELAS --- */}
        <section className="mt-10">
          <h2 className="font-serif text-[18px] font-semibold text-[#21a447]">
            Atau berdasarkan Kelas
          </h2>

          <div className="mt-5 flex gap-3 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {GRADES.map((grade, index) => (
              <button
                key={index}
                className="flex flex-shrink-0 items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 shadow-sm transition-colors hover:border-[#21a447] hover:bg-[#f0f9f2] hover:text-[#21a447]"
              >
                {/* Ikon bulat kecil untuk avatar/tingkatan (opsional) */}
                <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500">
                  {grade.charAt(0)}
                </div>
                <span className="font-serif text-[15px] font-medium text-[#4a4a4a]">
                  {grade}
                </span>
              </button>
            ))}

            {/* Tombol Panah Next ala Gambar 1 */}
            <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-[#21a447] shadow-sm hover:bg-[#f0f9f2]">
              →
            </button>
          </div>
        </section>

        {/* --- 4. REKOMENDASI UNTUK ANDA (GRID KARTU MATERI) --- */}
        <section className="mt-14">
          <h2 className="font-serif text-[22px] font-bold text-[#21a447] sm:text-[24px]">
            Rekomendasi untuk Anda
          </h2>

          {/* Grid Layout: 1 kolom di HP, 2 di tablet, 4 di Laptop, 5 di Layar Lebar */}
          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {RECOMMENDATIONS.map((item) => (
              <Link
                href={`/bahan-ajar/topics-library/${item.id}`}
                key={item.id}
              >
                <div className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-[0_5px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(0,0,0,0.08)]">
                  {/* Thumbnail Gambar */}
                  <div className="relative w-full bg-gray-50 aspect-[4/3] overflow-hidden">
                    {/* Placeholder jika belum ada gambar. Ganti dengan <Image> nanti */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 text-gray-400 text-sm font-serif">
                      Thumbnail Materi
                    </div>
                    {/* 
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    /> 
                    */}
                  </div>

                  {/* Konten Text Bawah */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <h3 className="line-clamp-2 font-serif text-[15px] font-semibold leading-snug text-[#171717] group-hover:text-[#21a447]">
                      {item.title}
                    </h3>

                    {/* Lingkaran Indikator Kelas (Angka 11 biru di desain asli, saya ubah menyesuaikan tema hijau/teal) */}
                    <div className="mt-4 flex justify-end">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1da1f2]/10 text-[13px] font-bold text-[#1da1f2]">
                        {item.grade}
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
