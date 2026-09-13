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
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchAssets, deleteAsset } from "@/lib/api";
import type { ApiAsset } from "@/lib/api";
import { AssetThumbnail } from "@/components/dashboard/asset-thumbnail";
import { AssetDetailModal } from "@/components/dashboard/asset-detail-modal";
import { UploadAssetModal } from "@/components/dashboard/upload-asset-modal";

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

const CATEGORY_ICONS: Record<string, string> = {
  hewan: "🐄",
  tanaman: "🌱",
  alat: "🛠️",
  mesin: "🚜",
  pascapanen: "📦",
  sensor: "📡",
};

function categoryIcon(category: string | null): string {
  if (!category) return "🌱";
  const key = Object.keys(CATEGORY_ICONS).find(
    (k) => k.toLowerCase() === category.toLowerCase(),
  );
  return (key && CATEGORY_ICONS[key]) || "🌱";
}

export default function TopicsLibrary() {
  const [activeTab, setActiveTab] = useState<LibraryTab>("asset-belajar");
  const [learnData, setLearnData] = useState<LearnData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedContentId, setSelectedContentId] = useState<number | null>(
    null,
  );

  const token = useAuthStore((s) => s.token);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ApiAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // ── State filter: subject & grade yang lagi dipilih ──
  // null = tidak ada filter aktif untuk kategori itu (tampilkan semua).
  // Klik pill/chip yang sama lagi = toggle off (unselect).
  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string | null>(
    null,
  );
  const [selectedGradeSlug, setSelectedGradeSlug] = useState<string | null>(
    null,
  );

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
          setError(
            (err as Error).message || "Terjadi kesalahan saat memuat data",
          );
        }
      } finally {
        setIsLoading(false);
      }
    }

    fetchLearnData();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetchAssets(token)
      .then(({ my_assets, public_assets }) => {
        if (cancelled) return;
        setAssets([...my_assets, ...public_assets]);
      })
      .catch((err) => {
        if (!cancelled)
          setAssetsError(
            err instanceof Error ? err.message : "Gagal memuat aset.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingAssets(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const categories = [
    "Semua",
    ...Array.from(
      new Set(
        assets
          .map((asset) => asset.category)
          .filter((c): c is string => c !== null),
      ),
    ),
  ];

  const filteredAssets = assets.filter((asset) => {
    if (activeCategory !== "Semua" && asset.category !== activeCategory)
      return false;
    return true;
  });

  const refreshAssets = () => {
    if (!token) return;
    setLoadingAssets(true);
    fetchAssets(token)
      .then(({ my_assets, public_assets }) => {
        setAssets([...my_assets, ...public_assets]);
      })
      .catch((err) => {
        setAssetsError(
          err instanceof Error ? err.message : "Gagal memuat aset.",
        );
      })
      .finally(() => setLoadingAssets(false));
  };

  const handleDeleteAsset = async (e: React.MouseEvent, assetId: number) => {
    e.stopPropagation();
    if (!token) return;
    if (!confirm("Yakin ingin menghapus aset ini?")) return;

    try {
      await deleteAsset(token, assetId);
      refreshAssets();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus aset.");
    }
  };

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
        {/* <section>
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
        </section> */}

        <section className="container pb-20">
          <div className="mb-4">
            <h2 className="font-serif text-[22px] font-bold text-[#21a447]">
              Rekomendasi Untuk Anda
            </h2>
          </div>

          <div className="flex gap-2.5 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const isActive = activeCategory === category;
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-1.5 font-serif text-[13px] font-medium transition-all border ${
                    isActive
                      ? "border-[#21a447] bg-[#21a447] text-white"
                      : "border-[#21a447]/50 bg-white text-gray-600 hover:border-[#21a447] hover:bg-[#21a447]/5"
                  }`}
                >
                  <span
                    className={`flex items-center justify-center ${isActive ? "text-white" : "text-[#21a447]"}`}
                  >
                    {categoryIcon(category)}
                  </span>
                  {category}
                </button>
              );
            })}
          </div>

          {loadingAssets && (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {Array.from({ length: 9 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-pulse flex flex-col overflow-hidden rounded-md border border-gray-200 bg-gray-100"
                >
                  <div className="aspect-[3/4] w-full bg-gray-200" />
                  <div className="p-2">
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {assetsError && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 font-serif text-[13px] text-red-600">
              {assetsError}
            </p>
          )}

          {!loadingAssets && !assetsError && (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 xl:grid-cols-9">
              {filteredAssets.length === 0 && (
                <p className="col-span-full py-8 text-center font-serif text-[14px] text-gray-500">
                  Tidak ada aset yang cocok.
                </p>
              )}
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className="group relative flex flex-col overflow-hidden rounded-md border border-[#21a447]/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md cursor-pointer"
                >
                  {token && (
                    <button
                      type="button"
                      onClick={(e) => handleDeleteAsset(e, asset.id)}
                      className="absolute right-2 top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white opacity-0 shadow-md transition-all hover:bg-red-600 group-hover:opacity-100"
                      title="Hapus aset"
                    >
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M3 6H21M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6M19 6V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}

                  <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                    <AssetThumbnail token={token} asset={asset} />
                  </div>

                  <div className="border-t border-[#21a447]/60 p-2 flex items-center justify-center gap-1.5 bg-white">
                    <span className="text-[12px] text-[#21a447] flex items-center justify-center">
                      {categoryIcon(asset.category)}
                    </span>
                    <span className="font-serif text-[10px] font-medium text-[#21a447] truncate">
                      {asset.name}
                    </span>
                  </div>
                </div>
              ))}

              {token && (
                <div
                  onClick={() => setShowUploadModal(true)}
                  className="flex cursor-pointer flex-col items-center justify-center overflow-hidden rounded-md border-2 border-dashed border-[#21a447]/60 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#21a447]"
                >
                  <div className="relative aspect-[3/4] w-full flex flex-col items-center justify-center bg-gray-50 p-4">
                    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#21a447]/10">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M12 5V19M5 12H19"
                          stroke="#21a447"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <p className="font-serif text-[13px] font-semibold text-[#21a447]">
                      Tambah Aset
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
        <Footer />

        {selectedAsset && (
          <AssetDetailModal
            token={token}
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
          />
        )}

        {showUploadModal && token && (
          <UploadAssetModal
            token={token}
            onClose={() => setShowUploadModal(false)}
            onSuccess={refreshAssets}
          />
        )}

        <ContentDetailModal
          contentId={selectedContentId}
          onClose={() => setSelectedContentId(null)}
        />
      </main>
    </div>
  );
}
