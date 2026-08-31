"use client";

import { useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { GRADES, TAB_CONTENT, TAB_ORDER, type LibraryTab } from "./data";
import { TopicsLibraryHero } from "./components/topics-library-hero";
import { SubjectPill } from "./components/subject-pill";
import { GradeChip } from "./components/grade-chip";
import { RecommendationCard } from "./components/recommendation-card";
import { HorizontalScroller } from "./components/horizontal-scroller";

export default function TopicsLibrary() {
  // "slide" jadi default, sama seperti tampilan awal sebelumnya
  const [activeTab, setActiveTab] = useState<LibraryTab>("slide");
  const content = TAB_CONTENT[activeTab];

  return (
    <div className="min-h-screen pb-[200px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      {/* --- 1. HERO: full-bleed, nempel dari tepi kiri sampai tepi kanan layar --- */}
      <div className="mt-20">
        <TopicsLibraryHero
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={TAB_CONTENT}
          order={TAB_ORDER}
        />
      </div>

      <main className="mx-auto max-w-[1600px] px-5 pt-14 sm:px-8 lg:px-16">
        {/* --- 2. KATEGORI MATA PELAJARAN (berubah sesuai tab, bisa digeser) --- */}
        <section>
          <h2 className="font-serif text-[20px] font-bold text-[#21a447] sm:text-[22px]">
            Jelajahi berdasarkan Mata Pelajaran
          </h2>

          <div className="mt-5">
            <HorizontalScroller>
              {content.subjects.map((subject) => (
                <SubjectPill key={subject.name} {...subject} />
              ))}
            </HorizontalScroller>
          </div>
        </section>

        {/* --- 3. KATEGORI KELAS (sama untuk kedua tab, Prasekolah s.d. Kelas 12, bisa digeser) --- */}
        <section className="mt-10">
          <h2 className="font-serif text-[18px] font-semibold text-[#21a447]">
            Atau berdasarkan Kelas
          </h2>

          <div className="mt-5">
            <HorizontalScroller>
              {GRADES.map((grade) => (
                <GradeChip key={grade} grade={grade} />
              ))}
            </HorizontalScroller>
          </div>
        </section>

        {/* --- 4. REKOMENDASI (berubah sesuai tab) --- */}
        <section className="mt-14">
          <h2 className="font-serif text-[22px] font-bold text-[#21a447] sm:text-[24px]">
            Rekomendasi untuk Anda
          </h2>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {content.recommendations.map((item) => (
              <RecommendationCard key={item.id} item={item} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}