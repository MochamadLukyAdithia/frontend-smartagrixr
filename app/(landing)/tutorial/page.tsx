"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { BookOpen, PenTool } from "lucide-react";
import {
  TutorialDetailModal,
  type TutorialItem,
  type TutorialSection,
} from "./components/tutorial-detail-modal";

// --- MOCK DATA ---
const TUTORIAL_DATA: Record<"ajar" | "buat", TutorialSection[]> = {
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
          description:
            "Panduan menjelajahi bagian-bagian tumbuhan melalui model 3D interaktif yang dapat diputar dan dibedah, cocok untuk mengenalkan struktur akar, batang, dan daun.",
        },
        {
          id: 2,
          title: "Sistem Irigasi Pintar",
          image: "/images/dashboard/beranda/2.png",
          description:
            "Langkah mengenalkan cara kerja irigasi otomatis: dari sensor kelembapan, aliran air, hingga cara menjelaskannya kepada siswa.",
        },
        {
          id: 3,
          title: "Geometri Lahan (X,Y,Z)",
          image: "/images/dashboard/beranda/3.png",
          description:
            "Cara memanfaatkan model lahan 3D untuk mengajarkan konsep sumbu koordinat ruang dan pengukuran bidang.",
        },
        {
          id: 4,
          title: "Siklus Pertanian",
          image: "/images/dashboard/beranda/4.png",
          description:
            "Simulasi tahapan siklus pertanian mulai dari pengolahan lahan, penanaman, hingga panen yang bisa diputar ulang.",
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
          description:
            "Rencana pembelajaran fotosintesis yang memadukan penjelasan konsep dengan visualisasi 3D prosesnya.",
        },
        {
          id: 6,
          title: "Struktur Tanah",
          image: "/images/dashboard/beranda/2.png",
          description:
            "Panduan mengajarkan lapisan dan tekstur tanah dengan model penampang yang dapat dibedah.",
        },
        {
          id: 7,
          title: "Ekosistem Sawah",
          image: "/images/dashboard/beranda/3.png",
          description:
            "Menjelajahi rantai makanan dan keseimbangan ekosistem sawah melalui aktivitas interaktif.",
        },
        {
          id: 8,
          title: "Budaya Agraris",
          image: "/images/dashboard/beranda/4.png",
          description:
            "Membahas kearifan lokal dan budaya agraris sebagai konteks pembelajaran lintas mata pelajaran.",
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
          description:
            "Aktivitas membuat diorama cetak yang dihidupkan dengan AR untuk mengamati proses pertumbuhan tanaman.",
        },
        {
          id: 10,
          title: "Poster AR: Alat Panen",
          image: "/images/dashboard/beranda/2.png",
          description:
            "Poster interaktif yang menampilkan alat panen dalam AR, siap dicetak dan dipakai di kelas.",
        },
        {
          id: 11,
          title: "Spinner AR: Jenis Pupuk",
          image: "/images/dashboard/beranda/3.png",
          description:
            "Media spinner yang memunculkan model AR jenis pupuk untuk aktivitas belajar kelompok.",
        },
        {
          id: 12,
          title: "LKPD AR: Sel Tumbuhan",
          image: "/images/dashboard/beranda/4.png",
          description:
            "Lembar kerja peserta didik sel tumbuhan dengan pemindaian AR untuk melihat struktur sel secara 3D.",
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
          description:
            "Tur singkat antarmuka editor: kanvas, panel alat, dan cara menyiapkan project baru.",
        },
        {
          id: 14,
          title: "Menambahkan Objek 3D",
          image: "/images/dashboard/beranda/3.png",
          description:
            "Cara mengimpor dan menempatkan objek 3D ke dalam kanvas untuk membangun konten AR.",
        },
        {
          id: 15,
          title: "Mengatur Interaktivitas",
          image: "/images/dashboard/beranda/4.png",
          description:
            "Menambahkan aksi, animasi, dan pemicu agar objek dapat berinteraksi dengan pengguna.",
        },
        {
          id: 16,
          title: "Export dan Publish",
          image: "/images/dashboard/beranda/1.png",
          description:
            "Langkah akhir menyimpan, mengekspor, dan mempublikasikan project agar siap dipakai siswa.",
        },
      ],
    },
  ],
};

export default function TutorialPage() {
  const [activeMode, setActiveMode] = useState<"ajar" | "buat">("ajar");
  const [selected, setSelected] = useState<{
    item: TutorialItem;
    sectionTitle: string;
  } | null>(null);

  const currentData = TUTORIAL_DATA[activeMode];

  return (
    <div className="min-h-screen  bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      {/* --- HERO SECTION --- */}
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
          {currentData.map((section) => (
            <div key={section.id} className="flex flex-col gap-6">
              {/* Section Header */}
              <div>
                <h2 className="font-serif text-[22px] font-bold text-[#171717]">
                  {section.title}
                </h2>
                <p className="mt-1 font-serif text-[14px] text-gray-500">
                  {section.description}
                </p>
              </div>

              {/* Grid Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {section.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() =>
                      setSelected({ item, sectionTitle: section.title })
                    }
                    className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#21a447]/30 hover:shadow-md"
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
                      <h3 className="font-serif text-[14px] font-semibold text-[#171717] transition-colors group-hover:text-[#21a447]">
                        {item.title}
                      </h3>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Footer />
      </main>

      {selected ? (
        <TutorialDetailModal
          item={selected.item}
          sectionTitle={selected.sectionTitle}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
