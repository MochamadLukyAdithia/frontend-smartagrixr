"use client";

import Image from "next/image";
import type { LibraryTab, TabContent } from "../data";

type Props = {
  activeTab: LibraryTab;
  onTabChange: (tab: LibraryTab) => void;
  tabs: Record<LibraryTab, TabContent>;
  order: LibraryTab[];
};

export function TopicsLibraryHero({
  activeTab,
  onTabChange,
  tabs,
  order,
}: Props) {
  const content = tabs[activeTab];

  return (
    <section
      className={`relative w-full overflow-hidden  transition-colors duration-500 py-12 px-6 sm:px-12 lg:px-20`}
    >
      <div className="max-w-[1320px] mx-auto">
        <div className="relative rounded-[32px] bg-[#d4af37] p-8 sm:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.1)] transition-all duration-500">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="flex-1 max-w-xl">
              <h1 className="font-serif text-[32px] sm:text-[40px] font-bold leading-tight text-[#171717]">
                Hemat waktu dengan <br />
                <span className="text-[#1a365d]">Slide Learning</span> <br />
                Interaktif siap pakai
              </h1>
              <p className="mt-4 font-serif text-[15px] sm:text-[16px] text-[#171717]/80">
                {content.description ||
                  "Jelajahi berbagai materi pembelajaran interaktif untuk mendalami teknologi pertanian cerdas secara praktis."}
              </p>
            </div>

            <div className="relative w-full lg:w-[480px] aspect-[16/10] rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20 bg-white">
              <Image
                src={"/images/bahan-ajar/hero.png"}
                alt="Smart Farming Guide"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
