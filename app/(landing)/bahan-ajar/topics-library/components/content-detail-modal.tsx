"use client";

import { useEffect, useState, useCallback } from "react";
import { normalizeEmbedHtml } from "@/lib/canva";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// ⚠️ SESUAIKAN dengan mekanisme auth kamu yang sebenarnya (Zustand persist,
// cookie, dll). Ini cuma fallback tebakan umum — token dicoba dibaca dari
// localStorage dulu, baru cookie.
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return (
    localStorage.getItem("token") ??
    document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1] ??
    null
  );
}

type ContentAuthor = {
  id: number;
  name: string;
  avatar: string | null;
};

type RelatedContent = {
  id: number;
  title: string;
  content_type: string;
  subject: { id: number; name: string; slug: string };
  grade_level: { id: number; name: string; slug: string };
  thumbnail_url: string | null;
  created_at: string;
};

type RelatedPagination = {
  current_page: number;
  data: RelatedContent[];
  last_page: number;
  per_page: number;
  total: number;
};

type ContentDetail = {
  id: number;
  title: string;
  description: string;
  content_type: string;
  embed_url: string | null;
  thumbnail_url: string | null;
  subject: { id: number; name: string; slug: string };
  grade_level: { id: number; name: string; slug: string };
  author: ContentAuthor;
  created_at: string;
  related: RelatedPagination;
};

type Props = {
  /** Id konten awal yang mau ditampilkan. null = modal tertutup. */
  contentId: number | null;
  onClose: () => void;
};

const RELATED_PER_PAGE = 4;

export function ContentDetailModal({ contentId, onClose }: Props) {
  const [activeId, setActiveId] = useState<number | null>(contentId);
  const [detail, setDetail] = useState<ContentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatedPage, setRelatedPage] = useState(1);

  useEffect(() => {
    setActiveId(contentId);
    setRelatedPage(1);
  }, [contentId]);

  const fetchDetail = useCallback(
    async (id: number, page: number, signal?: AbortSignal) => {
      try {
        setIsLoading(true);
        setError(null);

        const token = getAuthToken();

        const res = await fetch(
          `${API_URL}/api/learn/contents/${id}?related_page=${page}&related_per_page=${RELATED_PER_PAGE}`,
          {
            signal,
            headers: {
              Accept: "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          }
        );

        if (res.status === 404) {
          throw new Error("Konten tidak ditemukan");
        }
        if (!res.ok) {
          throw new Error(`Gagal memuat konten (status ${res.status})`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message ?? "Gagal memuat konten");
        }

        setDetail(json.data as ContentDetail);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Terjadi kesalahan saat memuat konten");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Fetch setiap kali activeId atau relatedPage berubah
  useEffect(() => {
    if (activeId === null) {
      setDetail(null);
      return;
    }

    const controller = new AbortController();
    fetchDetail(activeId, relatedPage, controller.signal);

    return () => controller.abort();
  }, [activeId, relatedPage, fetchDetail]);

  if (contentId === null) return null;

  const handleClose = () => {
    setDetail(null);
    setActiveId(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 sm:p-8">
      <div className="relative w-full max-w-[900px] flex max-h-[90vh] flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
          <div className="flex min-w-0 items-center gap-4">
            <button
              onClick={handleClose}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              aria-label="Tutup"
            >
              ←
            </button>
            <h2 className="truncate font-serif text-[16px] sm:text-[18px] font-bold text-[#171717]">
              {detail?.title ?? "Memuat..."}
            </h2>
          </div>

          <button
            onClick={handleClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-700 transition-colors"
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-10">
          {isLoading && !detail && (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#21a447] border-t-transparent" />
              <p className="mt-4 font-serif text-[14px] text-gray-500">
                Memuat konten...
              </p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="font-serif text-[14px] text-red-600">{error}</p>
            </div>
          )}

          {!isLoading && !error && detail && (
            <>
              {/* Embed Canva / video */}
              <div className="mx-auto w-full max-w-[700px]">
                {detail.content_type === "canva" && detail.embed_url ? (
                  <div
                    className="canva-embed-wrapper overflow-hidden rounded-2xl shadow-inner"
                    dangerouslySetInnerHTML={{ __html: normalizeEmbedHtml(detail.embed_url) }}
                  />
                ) : detail.content_type === "youtube" && detail.embed_url ? (
                  <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-black shadow-inner">
                    <iframe
                      src={detail.embed_url}
                      className="absolute inset-0 h-full w-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-[16/9] w-full items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
                    Pratinjau tidak tersedia
                  </div>
                )}
              </div>

              {/* Meta info */}
              <div className="mx-auto mt-4 flex w-full max-w-[700px] flex-wrap items-center gap-3 font-serif text-[13px] text-gray-500">
                <span className="rounded-full bg-[#f0f9f2] px-3 py-1 font-medium text-[#21a447]">
                  {detail.subject.name}
                </span>
                <span className="rounded-full bg-gray-100 px-3 py-1 font-medium text-gray-600">
                  {detail.grade_level.name}
                </span>
                <span>oleh {detail.author.name}</span>
              </div>

              {/* Resume / deskripsi */}
              <div className="mx-auto mt-8 w-full max-w-[700px]">
                <h4 className="mb-2 font-serif text-[16px] font-bold text-[#171717]">
                  Resume :
                </h4>
                <p className="text-justify font-serif text-[15px] leading-relaxed text-gray-600">
                  {detail.description}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}