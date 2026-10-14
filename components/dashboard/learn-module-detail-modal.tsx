"use client";

import { useEffect, useState } from "react";
import {
  X,
  Loader2,
  Play,
  Lock,
  User,
  Calendar,
  Layers,
  ArrowLeft,
} from "lucide-react";
import {
  fetchLearnModule,
  type LearnModule,
  type LearnModuleDetail,
} from "@/lib/api";

function formatDate(value: string | null): string {
  if (!value) return "";
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return "";
  return new Date(t).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function toEmbedSrc(url: string | null): string | null {
  if (!url) return null;
  if (url.includes("?embed") || url.includes("&embed")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}embed`;
}

export function LearnModuleDetailModal({
  moduleId,
  onClose,
  onSelect,
}: {
  moduleId: number;
  onClose: () => void;
  onSelect: (id: number) => void;
}) {
  const [detail, setDetail] = useState<LearnModuleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const data = await fetchLearnModule(moduleId);
        if (cancelled) return;
        setDetail(data);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Gagal memuat materi.");
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [moduleId, attempt]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((value) => value + 1);
  };

  const embedSrc = detail ? toEmbedSrc(detail.embed_ready_url) : null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm sm:p-6">
      <div className="relative flex max-h-[92vh] w-full max-w-[960px] flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-6 py-5">
          <div className="min-w-0">
            {detail?.category ? (
              <span className="mb-1 inline-flex items-center rounded-full bg-[#e8f5ec] px-2.5 py-0.5 font-serif text-[11px] font-semibold text-[#21a447]">
                {detail.category.title}
              </span>
            ) : null}
            <h2 className="truncate font-serif text-xl font-bold text-gray-900 sm:text-2xl">
              {detail?.title ?? "Memuat materi..."}
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
          {loading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
              <Loader2 className="h-8 w-8 animate-spin text-[#21a447]" />
              <p className="font-serif text-sm">Memuat materi pembelajaran...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
              <p className="font-serif text-sm text-red-500">{error}</p>
              <button
                type="button"
                onClick={retry}
                className="rounded-full bg-[#21a447] px-5 py-2 font-serif text-sm font-semibold text-white transition hover:bg-[#1b8b3b]"
              >
                Coba lagi
              </button>
            </div>
          ) : detail ? (
            <div className="space-y-6">
              {embedSrc ? (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
                  <iframe
                    src={embedSrc}
                    title={detail.title}
                    loading="lazy"
                    allowFullScreen
                    allow="fullscreen"
                    className="absolute inset-0 h-full w-full border-0"
                  />
                </div>
              ) : (
                <div className="relative flex aspect-[16/9] w-full flex-col items-center justify-center gap-2 overflow-hidden rounded-2xl bg-gradient-to-br from-[#21a447] to-[#0f5f28] text-white">
                  <Play className="h-12 w-12 opacity-90" />
                  <p className="font-serif text-sm font-semibold">
                    Materi interaktif belum tersedia
                  </p>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 font-serif text-[13px] text-gray-500">
                {detail.author?.name ? (
                  <span className="inline-flex items-center gap-1.5">
                    <User className="h-4 w-4" />
                    {detail.author.name}
                  </span>
                ) : null}
                {detail.created_at ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    {formatDate(detail.created_at)}
                  </span>
                ) : null}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                    detail.is_pro
                      ? "bg-amber-50 text-amber-600"
                      : "bg-[#e8f5ec] text-[#21a447]"
                  }`}
                >
                  {detail.is_pro ? (
                    <Lock className="h-3 w-3" />
                  ) : (
                    <Play className="h-3 w-3" />
                  )}
                  {detail.is_pro ? "Premium" : "Gratis"}
                </span>
              </div>

              {detail.description ? (
                <div>
                  <h3 className="mb-2 font-serif text-base font-bold text-gray-900">
                    Ringkasan Materi
                  </h3>
                  <p className="whitespace-pre-line font-serif text-sm leading-relaxed text-gray-600">
                    {detail.description}
                  </p>
                </div>
              ) : null}

              {detail.related.length > 0 ? (
                <div>
                  <h3 className="mb-3 inline-flex items-center gap-2 font-serif text-base font-bold text-gray-900">
                    <Layers className="h-4 w-4 text-[#21a447]" />
                    Modul Terkait
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {detail.related.map((rel: LearnModule) => (
                      <button
                        key={rel.id}
                        type="button"
                        onClick={() => onSelect(rel.id)}
                        className="group flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-2.5 text-left transition hover:border-[#21a447]/30 hover:shadow-md"
                      >
                        <div className="h-14 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                          {rel.thumbnail_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={rel.thumbnail_url}
                              alt={rel.title}
                              className="h-full w-full object-cover"
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0">
                          <p className="line-clamp-2 font-serif text-[13px] font-semibold text-gray-800 group-hover:text-[#21a447]">
                            {rel.title}
                          </p>
                          {rel.category ? (
                            <p className="mt-0.5 truncate font-serif text-[11px] text-gray-400">
                              {rel.category.title}
                            </p>
                          ) : null}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex items-center gap-2 font-serif text-sm font-medium text-gray-500 transition hover:text-gray-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
