"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, PlayCircle } from "lucide-react";

export type TutorialItem = {
  id: number;
  title: string;
  image: string;
  description: string;
};

export type TutorialSection = {
  id: string;
  title: string;
  description: string;
  items: TutorialItem[];
};

export function TutorialDetailModal({
  item,
  sectionTitle,
  onClose,
}: {
  item: TutorialItem;
  sectionTitle: string;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[820px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="min-w-0">
            <span className="mb-1 inline-flex items-center rounded-full bg-[#e8f5ec] px-2.5 py-0.5 font-serif text-[11px] font-semibold text-[#21a447]">
              {sectionTitle}
            </span>
            <h2 className="truncate font-serif text-xl font-bold text-gray-900 sm:text-2xl">
              {item.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>

          <p className="mt-5 font-serif text-sm leading-relaxed text-gray-600">
            {item.description}
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-gray-200 px-5 py-2 font-serif text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full bg-[#21a447] px-5 py-2 font-serif text-sm font-semibold text-white transition hover:bg-[#1b8b3b]"
          >
            <PlayCircle className="h-4 w-4" />
            Mulai Belajar
          </button>
        </div>
      </div>
    </div>
  );
}
