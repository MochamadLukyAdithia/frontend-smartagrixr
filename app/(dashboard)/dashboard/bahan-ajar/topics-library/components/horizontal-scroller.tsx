"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  /** Jarak geser tiap klik tombol panah, dalam px */
  scrollAmount?: number;
};

export function HorizontalScroller({ children, scrollAmount = 320 }: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  // Hitung ulang saat isi berubah (mis. ganti tab Alat Peraga <-> Slide)
  // dan saat ukuran layar berubah.
  useEffect(() => {
    updateScrollState();
    window.addEventListener("resize", updateScrollState);
    return () => window.removeEventListener("resize", updateScrollState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children]);

  const scrollBy = (amount: number) => {
    scrollerRef.current?.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <div className="relative">
      {canScrollLeft && (
        <div className="pointer-events-none absolute left-0 top-0 z-10 hidden h-full w-14 bg-gradient-to-r from-white/90 to-transparent sm:block" />
      )}
      {canScrollRight && (
        <div className="pointer-events-none absolute right-0 top-0 z-10 hidden h-full w-14 bg-gradient-to-l from-white/90 to-transparent sm:block" />
      )}

      <div
        ref={scrollerRef}
        onScroll={updateScrollState}
        className={`flex gap-4 overflow-x-auto scroll-smooth pb-2 [&::-webkit-scrollbar]:hidden ${
          canScrollLeft ? "pl-14" : ""
        } ${canScrollRight ? "pr-14" : ""}`}
      >
        {children}
      </div>

      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scrollBy(-scrollAmount)}
          aria-label="Geser ke kiri"
          className="absolute left-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[#21a447] shadow-md transition-colors hover:bg-[#f0f9f2] focus:outline-none focus:ring-2 focus:ring-[#21a447] sm:flex"
        >
          ←
        </button>
      )}

      {canScrollRight && (
        <button
          type="button"
          onClick={() => scrollBy(scrollAmount)}
          aria-label="Geser ke kanan"
          className="absolute right-0 top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-[#21a447] shadow-md transition-colors hover:bg-[#f0f9f2] focus:outline-none focus:ring-2 focus:ring-[#21a447] sm:flex"
        >
          →
        </button>
      )}
    </div>
  );
}