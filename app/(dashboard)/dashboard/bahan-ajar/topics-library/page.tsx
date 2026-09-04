"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { GRADES, TAB_CONTENT, TAB_ORDER, type LibraryTab } from "./data";
import { TopicsLibraryHero } from "./components/topics-library-hero";
import { SubjectPill } from "./components/subject-pill";
import { GradeChip } from "./components/grade-chip";
import { RecommendationCard } from "./components/recommendation-card";
import { HorizontalScroller } from "./components/horizontal-scroller";
import Footer from "@/components/layout/footer";

// --- DATA DUMMY SESUAI GAMBAR ---
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
  // Item ke-5 untuk mensimulasikan card turun ke baris bawah seperti di gambar
  {
    id: 5,
    title: "Budidaya Tanaman Modern",
    image: "/images/dashboard/beranda/1.png",
  },
];

export default function TopicsLibrary() {
  // "slide" jadi default, sama seperti tampilan awal sebelumnya
  const [activeTab, setActiveTab] = useState<LibraryTab>("slide");
  const content = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen  bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <div className="mt-20">
        <TopicsLibraryHero
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={TAB_CONTENT}
          order={TAB_ORDER}
        />
      </div>

      <main className="container px-5 sm:px-8 pt-14 pb-20">
        <section>
          <h2 className="mb-6 font-serif text-[20px] font-bold text-[#21a447] sm:text-[22px]">
            Jelajahi Berdasarkan Modul Pembelajaran
          </h2>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {LEARNING_MODULES.map((modul) => (
              <Link
                key={modul.id}
                href={`/bahan-ajar/topics-library/${modul.id}`} // Sesuaikan tujuan link Anda
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#21a447]/50"
              >
                <div className="relative h-[160px] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={modul.image}
                    alt={modul.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="border-b border-gray-100 p-4 pb-5">
                  <h3 className="font-serif text-[16px] font-bold text-[#171717]">
                    {modul.title}
                  </h3>
                </div>

                <div className="flex items-center justify-between p-4">
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
      </main>

      <Footer />
    </div>
  );
}
