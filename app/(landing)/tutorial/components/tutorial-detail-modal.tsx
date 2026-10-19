"use client";

import { useEffect } from "react";
import { X, ExternalLink, Clock, Tag } from "lucide-react";
import type { TutorialCreation, TutorialTeaching } from "@/lib/api";

export type TutorialSelection =
  | { kind: "ajar"; category: string; teaching: TutorialTeaching }
  | { kind: "buat"; category: string; creation: TutorialCreation };

export function TutorialDetailModal({
  selection,
  onClose,
}: {
  selection: TutorialSelection;
  onClose: () => void;
}) {
  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const title =
    selection.kind === "ajar"
      ? selection.teaching.title
      : selection.creation.title;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[92vh] w-full max-w-[860px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="min-w-0">
            <span className="mb-1 inline-flex items-center rounded-full bg-[#e8f5ec] px-2.5 py-0.5 font-serif text-[11px] font-semibold text-[#21a447]">
              {selection.category}
            </span>
            <h2 className="truncate font-serif text-xl font-bold text-gray-900 sm:text-2xl">
              {title}
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
          {selection.kind === "ajar" ? (
            <AjarBody teaching={selection.teaching} />
          ) : (
            <BuatBody creation={selection.creation} />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-gray-100 px-6 py-4">
          {selection.kind === "ajar" && selection.teaching.action_button_url ? (
            <a
              href={selection.teaching.action_button_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-[#21a447] px-5 py-2 font-serif text-sm font-semibold text-white transition hover:bg-[#1b8b3b]"
            >
              {selection.teaching.action_button_text ?? "Buka"}
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#21a447] px-5 py-2 font-serif text-sm font-semibold text-white transition hover:bg-[#1b8b3b]"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function AjarBody({ teaching }: { teaching: TutorialTeaching }) {
  return (
    <div className="space-y-6">
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
        {teaching.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={teaching.image}
            alt={teaching.title}
            className="h-full w-full object-cover"
          />
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 font-serif text-[13px]">
        {teaching.badge ? (
          <span className="rounded-full bg-[#e8f5ec] px-3 py-1 font-semibold text-[#21a447]">
            {teaching.badge}
          </span>
        ) : null}
        {teaching.grade_level ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
            {teaching.grade_level}
          </span>
        ) : null}
        {teaching.subject ? (
          <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
            {teaching.subject}
          </span>
        ) : null}
      </div>

      {teaching.apa_yang_dipelajari ? (
        <div>
          <h3 className="mb-2 font-serif text-base font-bold text-gray-900">
            Apa yang dipelajari
          </h3>
          <p className="font-serif text-sm leading-relaxed text-gray-600">
            {teaching.apa_yang_dipelajari}
          </p>
        </div>
      ) : null}

      {teaching.persiapan.length > 0 ? (
        <div>
          <h3 className="mb-2 font-serif text-base font-bold text-gray-900">
            Persiapan
          </h3>
          <ul className="space-y-1.5 font-serif text-sm text-gray-600">
            {teaching.persiapan.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#21a447]" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function BuatBody({ creation }: { creation: TutorialCreation }) {
  return (
    <div className="space-y-6">
      {creation.embed_youtube_url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-black">
          <iframe
            src={creation.embed_youtube_url}
            title={creation.title}
            className="absolute inset-0 h-full w-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
        </div>
      ) : creation.thumbnail_url ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={creation.thumbnail_url}
            alt={creation.title}
            className="h-full w-full object-cover"
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-serif text-[13px] text-gray-500">
        {creation.duration ? (
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" />
            {creation.duration}
          </span>
        ) : null}
        {creation.tags ? (
          <span className="inline-flex items-center gap-1.5">
            <Tag className="h-4 w-4" />
            {creation.tags}
          </span>
        ) : null}
      </div>

      {creation.description ? (
        <div>
          <h3 className="mb-2 font-serif text-base font-bold text-gray-900">
            Deskripsi
          </h3>
          <p className="whitespace-pre-line font-serif text-sm leading-relaxed text-gray-600">
            {creation.description}
          </p>
        </div>
      ) : null}
    </div>
  );
}
