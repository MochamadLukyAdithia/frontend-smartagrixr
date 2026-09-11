"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { TAB_CONTENT, TAB_ORDER, type LibraryTab } from "./data";
import { TopicsLibraryHero } from "./components/topics-library-hero";
import { SubjectPill } from "./components/subject-pill";
import { GradeChip } from "./components/grade-chip";
import { RecommendationCard } from "./components/recommendation-card";
import { HorizontalScroller } from "./components/horizontal-scroller";
import { ContentDetailModal } from "./components/content-detail-modal";
import Footer from "@/components/layout/footer";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

// --- TYPES SESUAI RESPONSE /api/learn ---
type ApiSubject = {
  id: number;
  name: string;
  slug: string;
  is_active: boolean;
  sort_order: number;
  contents_count: number;
};

type ApiGradeLevel = {
  id: number;
  name: string;
  slug: string;
  level_type: string;
};

type ApiLatestContent = {
  id: number;
  title: string;
  content_type: string;
  subject: { id: number; name: string; slug: string };
  grade_level: { id: number; name: string; slug: string };
  thumbnail_url: string | null;
  embed_url: string | null;
  created_at: string;
};

type LearnData = {
  subjects: ApiSubject[];
  grade_levels: ApiGradeLevel[];
  latest: ApiLatestContent[];
};

const SUBJECT_ICON_MAP: Record<string, string> = {
  literasi: "📖",
  sains: "🧬",
  matematika: "√",
  "pendidikan-pancasila": "🦅",
  umum: "⊞",
  agroteknologi: "🌾",
  biologi: "🧫",
};

function getSubjectIcon(slug: string): string {
  return SUBJECT_ICON_MAP[slug] ?? "📘";
}

export default function TopicsLibrary() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("slide");

  const [learnData, setLearnData] = useState<LearnData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedContentId, setSelectedContentId] = useState<number | null>(null);

  // ── State filter: subject & grade yang lagi dipilih ──
  // null = tidak ada filter aktif untuk kategori itu (tampilkan semua).
  // Klik pill/chip yang sama lagi = toggle off (unselect).
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | null>(null);
  const [selectedGradeSlug, setSelectedGradeSlug] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchLearnData() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_URL}/api/learn`, {
          signal: controller.signal,
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Gagal memuat data (status ${res.status})`);
        }

        const json = await res.json();

        if (!json.success) {
          throw new Error(json.message ?? "Gagal memuat data modul");
        }

        setLearnData(json.data as LearnData);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError((err as Error).message || "Terjadi kesalahan saat memuat data");
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchLearnData();

    return () => controller.abort();
  }, []);

  // ── Filtered list: hasil filter subject + grade terhadap learnData.latest ──
  const filteredLatest = useMemo(() => {
    if (!learnData) return [];

    return learnData.latest.filter((content) => {
      const matchSubject =
        !selectedSubjectSlug || content.subject.slug === selectedSubjectSlug;
      const matchGrade =
        !selectedGradeSlug || content.grade_level.slug === selectedGradeSlug;
      return matchSubject && matchGrade;
    });
  }, [learnData, selectedSubjectSlug, selectedGradeSlug]);

  function handleSubjectClick(slug: string) {
    setSelectedSubjectSlug((prev) => (prev === slug ? null : slug));
  }

  function handleGradeClick(slug: string) {
    setSelectedGradeSlug((prev) => (prev === slug ? null : slug));
  }

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
        {!isLoading && error && (
          <div className="mb-10 rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="font-serif text-[14px] text-red-600">{error}</p>
          </div>
        )}

        {/* ── Jelajahi berdasarkan Mata Pelajaran ── */}
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-[20px] font-bold text-[#21a447] sm:text-[22px]">
            Jelajahi Berdasarkan Mata Pelajaran
          </h2>

          {isLoading && (
            <div className="flex gap-4 overflow-x-hidden">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[72px] w-[200px] flex-shrink-0 animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          )}

          {!isLoading && !error && learnData && (
            <HorizontalScroller>
              {learnData.subjects.map((subject) => (
                <SubjectPill
                  key={subject.id}
                  name={subject.name}
                  icon={getSubjectIcon(subject.slug)}
                  isActive={selectedSubjectSlug === subject.slug}
                  onClick={() => handleSubjectClick(subject.slug)}
                />
              ))}
            </HorizontalScroller>
          )}
        </section>

        {/* ── Atau berdasarkan Kelas ── */}
        <section className="mb-12">
          <h2 className="mb-6 font-serif text-[20px] font-bold text-[#21a447] sm:text-[22px]">
            Atau Berdasarkan Kelas
          </h2>

          {isLoading && (
            <div className="flex gap-3 overflow-x-hidden">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[44px] w-[110px] flex-shrink-0 animate-pulse rounded-full bg-gray-100"
                />
              ))}
            </div>
          )}

          {!isLoading && !error && learnData && (
            <HorizontalScroller>
              {learnData.grade_levels.map((grade) => (
                <GradeChip
                  key={grade.id}
                  grade={grade.name}
                  isActive={selectedGradeSlug === grade.slug}
                  onClick={() => handleGradeClick(grade.slug)}
                />
              ))}
            </HorizontalScroller>
          )}
        </section>

        {/* ── Rekomendasi untuk Anda ── */}
        <section>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-[20px] font-bold text-[#21a447] sm:text-[22px]">
              Rekomendasi untuk Anda
            </h2>

            <Link
              href="/bahan-ajar/topics-library/1"
              className="font-serif text-[14px] font-semibold text-[#21a447] hover:underline"
            >
              Lihat Semua →
            </Link>
          </div>

          {/* Info filter aktif + tombol reset */}
          {!isLoading && !error && (selectedSubjectSlug || selectedGradeSlug) && (
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="font-serif text-[13px] text-gray-500">
                Filter aktif:
              </span>
              {selectedSubjectSlug && (
                <span className="rounded-full bg-[#21a447]/10 px-3 py-1 font-serif text-[12px] font-semibold text-[#21a447]">
                  {learnData?.subjects.find((s) => s.slug === selectedSubjectSlug)?.name}
                </span>
              )}
              {selectedGradeSlug && (
                <span className="rounded-full bg-[#1da1f2]/10 px-3 py-1 font-serif text-[12px] font-semibold text-[#1da1f2]">
                  {learnData?.grade_levels.find((g) => g.slug === selectedGradeSlug)?.name}
                </span>
              )}
              <button
                type="button"
                onClick={() => {
                  setSelectedSubjectSlug(null);
                  setSelectedGradeSlug(null);
                }}
                className="font-serif text-[12px] text-gray-400 underline hover:text-gray-600"
              >
                Reset filter
              </button>
            </div>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[4/3] animate-pulse rounded-2xl bg-gray-100"
                />
              ))}
            </div>
          )}

          {!isLoading && !error && learnData && filteredLatest.length === 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center">
              <p className="font-serif text-[14px] text-gray-500">
                {selectedSubjectSlug || selectedGradeSlug
                  ? "Tidak ada materi yang cocok dengan filter ini."
                  : "Belum ada materi yang tersedia."}
              </p>
            </div>
          )}

          {!isLoading && !error && learnData && filteredLatest.length > 0 && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {filteredLatest.map((content) => (
                <RecommendationCard
                  key={content.id}
                  item={{
                    id: content.id,
                    title: content.title,
                    image: content.thumbnail_url ?? "",
                    embedUrl: content.embed_url,
                    grade: content.grade_level.name,
                  }}
                  onClick={(item) => setSelectedContentId(item.id)}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer />

      <ContentDetailModal
        contentId={selectedContentId}
        onClose={() => setSelectedContentId(null)}
      />
    </div>
  );
}