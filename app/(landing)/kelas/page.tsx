"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchClassrooms, createClassroom, joinClassroom } from "@/lib/api";
import type { Classroom } from "@/lib/api";
import { CreateClassModal } from "@/components/dashboard/create-class-modal";
import { JoinClassModal } from "@/components/dashboard/join-class-modal";

export default function KelasPage() {
  const router = useRouter();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState("");
  const [classrooms, setClassrooms] = useState<Classroom[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(true);

  const [showCreateClassModal, setShowCreateClassModal] = useState(false);
  const [showJoinClassModal, setShowJoinClassModal] = useState(false);

  // Cek Role User (Sama seperti di Beranda)
  const isStudent =
    user?.unej_role?.toLowerCase() === "mahasiswa" ||
    user?.unej_role?.toLowerCase() === "student";

  // Fetch Data Kelas
  const refreshClassrooms = () => {
    if (!token) {
      setLoadingClasses(false);
      return;
    }
    setLoadingClasses(true);
    fetchClassrooms(token)
      .then(({ as_teacher, as_student }) => {
        setClassrooms([...as_teacher, ...as_student]);
      })
      .catch(() => setClassrooms([]))
      .finally(() => setLoadingClasses(false));
  };

  useEffect(() => {
    refreshClassrooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Handlers untuk Modal
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

  // Filter Kelas berdasarkan Pencarian
  const filteredClasses = classrooms.filter(
    (cls) =>
      cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (cls.subject &&
        cls.subject.toLowerCase().includes(searchQuery.toLowerCase())),
  );

  return (
    <div className="min-h-screen pb-[100px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="container mt-28 px-5 sm:px-8">
        {/* --- HEADER SECTION --- */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-gray-200 bg-white p-6 sm:p-8 shadow-sm">
          <div>
            <h1 className="font-serif text-[24px] font-bold text-[#171717] sm:text-[28px]">
              Kelas Anda
            </h1>
            <p className="font-serif text-[14px] text-gray-500 mt-1">
              Kelola dan jelajahi seluruh ruang kelas digital Anda.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[350px]">
              <span className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Cari nama kelas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-11 pr-4 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
              />
            </div>

            <button
              type="button"
              onClick={() =>
                token ? setShowJoinClassModal(true) : router.push("/masuk")
              }
              className="w-fit rounded-full bg-[#21a447] px-6 py-2.5 font-serif text-[14px] font-semibold text-white shadow-md transition-colors hover:bg-[#198b3a]"
            >
              + Gabung Kelas
            </button>
          </div>
        </div>

        {/* --- CONTENT SECTION --- */}
        <section>
          {!token ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="font-serif text-[15px] text-gray-600">
                Silakan masuk terlebih dahulu untuk melihat daftar kelas Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
              {/* SKELETON LOADING */}
              {loadingClasses &&
                Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="h-[180px] w-full animate-pulse rounded-2xl bg-gray-200"
                  />
                ))}

              {/* LIST KELAS */}
              {!loadingClasses &&
                filteredClasses.map((cls) => (
                  <Link
                    key={cls.id}
                    href={`/kelas/${cls.id}`}
                    className="group relative h-[180px] w-full cursor-pointer overflow-hidden rounded-2xl bg-gray-200 shadow-sm transition-all hover:shadow-md"
                  >
                    <Image
                      src="/images/dashboard/beranda/1.png"
                      alt={cls.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/85 via-black/20 to-transparent p-5">
                      <div className="w-full">
                        <h3 className="font-serif text-[16px] font-bold leading-snug text-white">
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

              {/* EMPTY STATE PENCARIAN */}
              {!loadingClasses &&
                classrooms.length > 0 &&
                filteredClasses.length === 0 && (
                  <div className="col-span-full py-8 text-center">
                    <p className="font-serif text-[14px] text-gray-500">
                      Pencarian untuk "{searchQuery}" tidak ditemukan.
                    </p>
                  </div>
                )}

              {/* TOMBOL TAMBAH/GABUNG KELAS */}
              {!loadingClasses && (
                <button
                  type="button"
                  onClick={() =>
                    isStudent
                      ? setShowJoinClassModal(true)
                      : setShowCreateClassModal(true)
                  }
                  className="flex h-[180px] w-full cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 transition-colors hover:border-[#21a447] hover:bg-green-50/50"
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
              )}
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* --- MODALS --- */}
      {showCreateClassModal && token && !isStudent && (
        <CreateClassModal
          open={showCreateClassModal}
          onClose={() => setShowCreateClassModal(false)}
          onSubmit={handleCreateClass}
        />
      )}

      {showJoinClassModal && token && (
        <JoinClassModal
          open={showJoinClassModal}
          onClose={() => setShowJoinClassModal(false)}
          onSubmit={handleJoinClass}
        />
      )}
    </div>
  );
}
