"use client";

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
    // Full-bleed: section ini sengaja TIDAK dibungkus max-w di page.tsx,
    // supaya background-nya nempel penuh dari tepi kiri sampai tepi kanan layar.
    <section
      className={`relative w-full overflow-hidden bg-gradient-to-r ${content.heroBg} transition-colors duration-500`}
    >
      <div className="mx-auto flex w-full max-w-[1600px] flex-col items-center justify-between gap-10 px-5 py-14 sm:px-8 md:flex-row lg:px-16 lg:py-20">
        <div className="z-10 w-full md:w-3/5">
          {/* Tabs: klik untuk ganti konten alat peraga <-> slide interaktif */}
          <div
            className="mb-6 flex gap-3"
            role="tablist"
            aria-label="Jenis bahan ajar"
          >
            {order.map((tab) => {
              const isActive = tab === activeTab;
              return (
                <button
                  key={tab}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => onTabChange(tab)}
                  className={`rounded-full px-4 py-2 font-serif text-[14px] transition-all focus:outline-none focus:ring-2 focus:ring-[#21a447] focus:ring-offset-2 ${
                    isActive
                      ? "bg-white font-bold text-[#21a447] shadow-sm"
                      : "bg-white/60 font-semibold text-[#4a4a4a] backdrop-blur-sm hover:bg-white/80"
                  }`}
                >
                  {tabs[tab].tagLabel}
                </button>
              );
            })}
          </div>

          {/* Headline berganti mengikuti tab aktif */}
          <h1 className="font-serif text-[32px] font-bold leading-[1.2] text-black sm:text-[40px] lg:text-[48px]">
            {content.heroHeadline.prefix}
            <span className="text-[#21a447]">
              {content.heroHeadline.highlight}
            </span>
            {content.heroHeadline.suffix}
          </h1>
        </div>

        {/* Ilustrasi hero, ganti sesuai tab aktif */}
        <div className="relative h-[220px] w-full max-w-[360px] flex-shrink-0 md:h-[300px] md:w-[380px] lg:h-[360px] lg:w-[440px]">
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/40">
            <span className="font-serif text-gray-500">
              Ilustrasi {content.tagLabel}
            </span>
          </div>
          {/* Ganti placeholder di atas dengan gambar asli:
          <Image
            src={content.heroIllustration}
            alt={content.tagLabel}
            fill
            className="object-contain"
          />
          */}
        </div>
      </div>
    </section>
  );
}