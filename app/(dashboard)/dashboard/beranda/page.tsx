"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  fetchAssets,
  deleteAsset,
  fetchClassrooms,
  createClassroom,
  joinClassroom,
} from "@/lib/api";
import type { ApiAsset, Classroom } from "@/lib/api";
import { AssetThumbnail } from "@/components/dashboard/asset-thumbnail";
import { AssetDetailModal } from "@/components/dashboard/asset-detail-modal";
import { UploadAssetModal } from "@/components/dashboard/upload-asset-modal";
import { CreateClassModal } from "@/components/dashboard/create-class-modal";
import { JoinClassModal } from "@/components/dashboard/join-class-modal";

const LEARNING_MODULES = [
  {
    id: 1,
    title: "Budidaya Tanaman Modern",
    image: "/images/dashboard/beranda/1.png",
  },
  {
    id: 2,
    title: "Smart Farming (IoT)",
    image: "/images/dashboard/beranda/2.png",
  },
  {
    id: 3,
    title: "Rantai Pasok Agroindustri",
    image: "/images/dashboard/beranda/3.png",
  },
  {
    id: 4,
    title: "Perencanaan dan Pengelolaan",
    image: "/images/dashboard/beranda/4.png",
  },
  {
    id: 5,
    title: "Mekanisasi Pertanian",
    image: "/images/dashboard/beranda/1.png",
  },
];

const CATEGORY_ICONS: Record<string, string> = {
  Semua: "🗂️",
  Bunga: "🌸",
  tanaman: "🌱",
  panah: "🎯",
  greenhouse: "🏠",
  irigasi: "💧",
  drone: "🚁",
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

export default function DashboardBeranda() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [searchQuery, setSearchQuery] = useState("");
  const [assets, setAssets] = useState<ApiAsset[]>([]);
  const [loadingAssets, setLoadingAssets] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ApiAsset | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);
  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    fetchClassrooms(token)
      .then(({ as_teacher, as_student }) => {
        if (cancelled) return;
        setClassrooms([...as_teacher, ...as_student]);
      })
      .catch(() => {
        if (!cancelled) setClassrooms([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingClasses(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const refreshClassrooms = () => {
    if (!token) return;
    setLoadingClasses(true);
    fetchClassrooms(token)
      .then(({ as_teacher, as_student }) => {
        setClassrooms([...as_teacher, ...as_student]);
      })
      .catch(() => setClassrooms([]))
      .finally(() => setLoadingClasses(false));
  };

  const handleCreateClass = async (values: {
    name: string;
    description: string;
    subject: string;
  }) => {
    if (!token) return;
    await createClassroom(token, values);
    refreshClassrooms();
  };

  const handleJoinClass = async (code: string) => {
    if (!token) return;
    await joinClassroom(token, code);
    refreshClassrooms();
  };

  useEffect(() => {
    if (!token) return;

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

  // Cek apakah role user adalah Dosen/Guru (sesuaikan string role backend Anda, misal "dosen" atau "Guru")
  const isDosen =
    user?.unej_role?.toLowerCase() === "dosen" ||
    user?.unej_role?.toLowerCase() === "guru";

  // Role mahasiswa hanya bisa join kelas, tidak bisa membuat kelas
  const isStudent =
    user?.unej_role?.toLowerCase() === "mahasiswa" ||
    user?.unej_role?.toLowerCase() === "student";

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
    if (
      searchQuery &&
      !asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
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

  return (
    <div className="min-h-screen pb-[100px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="container mt-28 px-5 sm:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <h1 className="font-serif text-[24px] font-bold text-[#171717] sm:text-[28px]">
              Selamat datang, {user?.name}!
            </h1>
            {isDosen && (
              <p className="font-serif text-[14px] text-gray-500 mt-1">
                Apa yang akan kamu buat hari ini?
              </p>
            )}
          </div>

          {isDosen && (
            <div className="relative w-full sm:w-[350px]">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
              <input
                type="text"
                placeholder="Apa yang ingin kamu cari?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
              />
            </div>
          )}
        </div>

        {isDosen && (
          <div className="mb-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#21a447] text-white">
                <span className="text-2xl font-bold">+</span>
              </div>
              <div>
                <h3 className="font-serif text-[16px] font-bold text-black">
                  Buat Project AR
                </h3>
                <p className="font-serif text-[12px] text-gray-500">
                  Buat konten Augmented Reality interaktif
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#21a447] text-white">
                <span className="text-xl">✨</span>
              </div>
              <div>
                <h3 className="font-serif text-[16px] font-bold text-black">
                  Generator Objek AI
                </h3>
                <p className="font-serif text-[12px] text-gray-500">
                  Ubah prompt atau gambar jadi objek 3D keren
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:shadow-md cursor-pointer">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-[#21a447] text-white">
                <span className="text-xl">📚</span>
              </div>
              <div>
                <h3 className="font-serif text-[16px] font-bold text-black">
                  Coba LessonCraft
                </h3>
                <p className="font-serif text-[12px] text-gray-500">
                  Buat RPP, lembar kerja, flashcard, dan lainnya
                </p>
              </div>
            </div>
          </div>
        )}

        <section className="rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-8">
            <h2 className="font-serif text-[20px] font-bold text-black sm:text-[22px]">
              {isDosen
                ? "Materi Pembelajaran"
                : "Modul Pembelajaran Pertanian Imersif"}
            </h2>

            {isDosen ? (
              <Link
                href="#"
                className="font-serif text-[14px] font-medium text-[#21a447] hover:underline"
              >
                Lihat Semua Materi
              </Link>
            ) : (
              <div className="relative w-full lg:w-[380px]">
                <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="M21 21l-4.3-4.3" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Cari modul pembelajaran yang ingin dipelajari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {LEARNING_MODULES.slice(0, isDosen ? 4 : 5).map((modul) => (
              <Link
                key={modul.id}
                href={`/bahan-ajar/topics-library/${modul.id}`}
                className="group flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md hover:border-[#21a447]/50"
              >
                <div className="relative h-[150px] w-full overflow-hidden bg-gray-100">
                  <Image
                    src={modul.image}
                    alt={modul.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="border-b border-gray-100 p-4 pb-5">
                  <h3 className="font-serif text-[15px] font-bold text-[#171717] leading-snug">
                    {modul.title}
                  </h3>
                </div>
                <div className="flex items-center justify-between p-4 bg-white">
                  <span className="font-serif text-[13px] font-medium text-[#21a447]">
                    Jelajahi Materi
                  </span>
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#21a447] transition-transform group-hover:translate-x-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M5 12H19M19 12L12 5M19 12L12 19"
                        stroke="white"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}

            {isDosen && (
              <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50/50 p-6 text-center cursor-pointer hover:bg-gray-100 transition-colors min-h-[260px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#21a447] text-white shadow-md mb-3">
                  <span className="text-2xl leading-none">+</span>
                </div>
                <span className="font-serif text-[14px] font-bold text-gray-700">
                  Buat Materi Baru
                </span>
              </div>
            )}
          </div>
        </section>
        <section className="mb-12 mt-10">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-serif text-[22px] font-bold text-black">
              Kelas Anda
            </h2>
            <Link
              href="#"
              className="font-serif text-[14px] font-medium text-[#21a447] hover:underline"
            >
              Lihat Semua Kelas
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {loadingClasses &&
              Array.from({ length: 2 }).map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-200"
                />
              ))}

            {!loadingClasses &&
              classrooms.map((cls) => (
                <Link
                  key={cls.id}
                  href={`/dashboard/kelas/${cls.id}`}
                  className="group relative h-[180px] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition-all hover:shadow-md"
                >
                  <Image
                    src="/images/dashboard/beranda/1.png"
                    alt={cls.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent flex items-end p-5">
                    <div className="w-full">
                      <h3 className="font-serif text-[16px] font-bold text-white leading-snug">
                        {cls.name}
                      </h3>
                      {cls.subject && (
                        <p className="mt-1 truncate font-serif text-[12px] text-white/80">
                          {cls.subject}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}

            {!loadingClasses && classrooms.length === 0 && (
              <div className="h-[180px] w-full rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 flex items-center justify-center">
                <span className="font-serif text-[14px] text-gray-500">
                  Belum ada kelas
                </span>
              </div>
            )}

            <button
              type="button"
              onClick={() =>
                isStudent
                  ? setShowJoinClassModal(true)
                  : setShowCreateClassModal(true)
              }
              className="flex h-[180px] w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/50 transition-colors hover:bg-gray-100 hover:border-gray-400"
            >
              <div className="flex flex-col items-center justify-center rounded-xl bg-[#21a447] px-6 py-4 text-white shadow-sm transition-transform hover:scale-105">
                <span className="text-2xl leading-none">
                  {isStudent ? "🔑" : "+"}
                </span>
                <span className="mt-2 font-serif text-[12px] font-medium tracking-wide">
                  {isStudent ? "Gabung ke Kelas" : "Buat Kelas Baru"}
                </span>
              </div>
            </button>
          </div>
        </section>
        <section className="mt-12">
          <div className="mb-4">
            <h2 className="font-serif text-[22px] font-bold text-black">
              Asset 3d
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

          {!token && (
            <p className="mt-4 rounded-lg bg-yellow-50 px-4 py-2 font-serif text-[13px] text-yellow-700">
              Silakan masuk terlebih dahulu untuk melihat aset.
            </p>
          )}

          {loadingAssets && token && (
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

          {token && !loadingAssets && !assetsError && (
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

                  <div className="relative aspect-[3/4] w-full bg-gray-100 overflow-hidden">
                    <AssetThumbnail token={token!} asset={asset} />
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

              {/* Card kosong untuk tambah aset */}
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
            </div>
          )}
        </section>
      </main>
      <Footer />

      {selectedAsset && token && (
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

      {showCreateClassModal && token && !isStudent && (
        <CreateClassModal
          open={showCreateClassModal}
          onClose={() => setShowCreateClassModal(false)}
          onSubmit={handleCreateClass}
        />
      )}

      {showJoinClassModal && token && isStudent && (
        <JoinClassModal
          open={showJoinClassModal}
          onClose={() => setShowJoinClassModal(false)}
          onSubmit={handleJoinClass}
        />
      )}
    </div>
  );
}
