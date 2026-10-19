"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { BookOpen, PenTool, Loader2, Play, Clock } from "lucide-react";
import {
  fetchTutorials,
  type TutorialCategory,
  type TutorialsData,
} from "@/lib/api";
import {
  TutorialDetailModal,
  type TutorialSelection,
} from "./components/tutorial-detail-modal";

type Mode = "ajar" | "buat";

function tabLabel(tab: string): string {
  return tab
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const DEFAULT_HEADER: Record<Mode, string> = {
  ajar: "Pelajari cara menggunakan aktivitas siap pakai bersama siswa",
  buat: "Pelajari cara membangun pelajaran interaktif sendiri",
};

export default function TutorialPage() {
  const [data, setData] = useState<TutorialsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  const [mode, setMode] = useState<Mode>("ajar");
  const [buatTab, setBuatTab] = useState<string | null>(null);
  const [selected, setSelected] = useState<TutorialSelection | null>(null);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const result = await fetchTutorials();
        if (cancelled) return;
        setData(result);
        setBuatTab(result.buat.current_tab ?? result.buat.tabs[0] ?? null);
        setError(null);
        setLoading(false);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Gagal memuat data tutorial."
        );
        setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const retry = () => {
    setLoading(true);
    setError(null);
    setAttempt((value) => value + 1);
  };

  const group = data ? data[mode] : null;

  const categories: TutorialCategory[] = group
    ? group.categories.filter((category) =>
        mode === "buat" ? !buatTab || category.tab === buatTab : true
      )
    : [];

  const headerTitle = group?.header_title || DEFAULT_HEADER[mode];

  return (
    <div className="min-h-screen  bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      {/* --- HERO SECTION --- */}
      <section className="pb-16 pt-[140px] text-center">
        <div className="container mx-auto px-6">
          <h1 className="mx-auto max-w-2xl font-serif text-[32px] font-bold leading-tight text-[#171717] sm:text-[40px]">
            {headerTitle}
          </h1>

          {/* Toggle Button */}
          <div className="mx-auto mt-8 flex w-max items-center rounded-full bg-white p-1.5 shadow-sm border border-gray-200">
            <button
              onClick={() => setMode("ajar")}
              className={`flex items-center gap-2 rounded-full px-6 py-2 font-serif text-[14px] font-semibold transition-all ${
                mode === "ajar"
                  ? "bg-[#21a447] text-white shadow-md"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <BookOpen size={16} />
              Ajar
            </button>
            <button
              onClick={() => setMode("buat")}
              className={`flex items-center gap-2 rounded-full px-6 py-2 font-serif text-[14px] font-semibold transition-all ${
                mode === "buat"
                  ? "bg-[#21a447] text-white shadow-md"
                  : "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <PenTool size={16} />
              Buat
            </button>
          </div>

          {/* Sub-tabs (khusus mode Buat) */}
          {mode === "buat" && group && group.tabs.length > 1 ? (
            <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
              {group.tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setBuatTab(tab)}
                  className={`rounded-full border px-4 py-1.5 font-serif text-[13px] font-semibold transition-all ${
                    buatTab === tab
                      ? "border-[#21a447] bg-[#e8f5ec] text-[#21a447]"
                      : "border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:text-gray-800"
                  }`}
                >
                  {tabLabel(tab)}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <main className="container mx-auto px-6 pb-24 pt-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-400">
            <Loader2 className="h-8 w-8 animate-spin text-[#21a447]" />
            <p className="font-serif text-sm">Memuat tutorial...</p>
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
        ) : categories.length === 0 ? (
          <div className="py-24 text-center">
            <p className="font-serif text-sm text-gray-500">
              Belum ada tutorial untuk bagian ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-16">
            {categories.map((category) => (
              <div key={category.id} className="flex flex-col gap-6">
                {/* Section Header */}
                <div>
                  <h2 className="font-serif text-[22px] font-bold text-[#171717]">
                    {category.title}
                  </h2>
                  {category.description ? (
                    <p className="mt-1 max-w-3xl font-serif text-[14px] text-gray-500">
                      {category.description}
                    </p>
                  ) : null}
                </div>

                {/* Grid Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {mode === "ajar"
                    ? category.teachings.map((teaching) => (
                        <button
                          key={teaching.id}
                          type="button"
                          onClick={() =>
                            setSelected({
                              kind: "ajar",
                              category: category.title,
                              teaching,
                            })
                          }
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#21a447]/30 hover:shadow-md"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                            {teaching.image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={teaching.image}
                                alt={teaching.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : null}
                          </div>
                          <div className="p-4">
                            <h3 className="font-serif text-[14px] font-semibold text-[#171717] transition-colors group-hover:text-[#21a447]">
                              {teaching.title}
                            </h3>
                          </div>
                        </button>
                      ))
                    : category.creations.map((creation) => (
                        <button
                          key={creation.id}
                          type="button"
                          onClick={() =>
                            setSelected({
                              kind: "buat",
                              category: category.title,
                              creation,
                            })
                          }
                          className="group cursor-pointer overflow-hidden rounded-2xl border border-gray-100 bg-white text-left shadow-sm transition-all hover:-translate-y-1 hover:border-[#21a447]/30 hover:shadow-md"
                        >
                          <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
                            {creation.thumbnail_url ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={creation.thumbnail_url}
                                alt={creation.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#21a447] to-[#0f5f28]">
                                <Play className="h-8 w-8 text-white/90" />
                              </div>
                            )}
                            {creation.duration ? (
                              <span className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded bg-black/70 px-2 py-0.5 font-serif text-[11px] font-medium text-white">
                                <Clock className="h-3 w-3" />
                                {creation.duration}
                              </span>
                            ) : null}
                          </div>
                          <div className="p-4">
                            <h3 className="font-serif text-[14px] font-semibold text-[#171717] transition-colors group-hover:text-[#21a447]">
                              {creation.title}
                            </h3>
                          </div>
                        </button>
                      ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <Footer />
      </main>

      {selected ? (
        <TutorialDetailModal
          selection={selected}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
