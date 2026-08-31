"use client";

import { useMemo, useState } from "react";
import { Navbar } from "@/components/layout/navbar";
import { INITIAL_CLASSES, type KelasItem } from "./data";
import { ClassCard } from "./components/class-card";
import { CreateClassModal } from "./components/create-class-modal";
import { JoinClassModal } from "./components/join-class-modal";

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export default function KelasPage() {
  const [classes, setClasses] = useState<KelasItem[]>(INITIAL_CLASSES);
  const [search, setSearch] = useState("");
  const [isCreateOpen, setCreateOpen] = useState(false);
  const [isJoinOpen, setJoinOpen] = useState(false);

  const filteredClasses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return classes;
    return classes.filter((item) => item.name.toLowerCase().includes(query));
  }, [classes, search]);

  const handleCreateClass = (name: string, color: string) => {
    const id = `${slugify(name)}-${Date.now()}`;
    setClasses((prev) => [...prev, { id, name, color }]);
    setCreateOpen(false);
  };

  const handleJoinClass = (code: string) => {
    // TODO: hubungkan ke API gabung kelas berdasarkan kode dari backend.
    console.log("Gabung kelas dengan kode:", code);
    setJoinOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f7f8f9] text-[#171717]">
      <Navbar />

      <main className="mx-auto max-w-[1320px] px-5 pb-20 pt-28 sm:px-8">
        {/* Header + aksi */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="font-serif text-[30px] font-bold text-[#171717] sm:text-[34px]">
            Kelas Anda
          </h1>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setJoinOpen(true)}
              className="rounded-full border border-gray-200 bg-white px-5 py-2.5 font-serif text-[14px] font-semibold text-[#171717] shadow-sm transition-colors hover:border-[#21a447] hover:text-[#21a447]"
            >
              Gabung kelas
            </button>
            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="rounded-full bg-[#21a447] px-5 py-2.5 font-serif text-[14px] font-semibold text-white shadow-sm transition-colors hover:bg-[#198b3a]"
            >
              + Kelas
            </button>
          </div>
        </div>

        {/* Saring kelas */}
        <div className="mt-6">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Saring kelas Anda"
            className="w-full rounded-2xl border border-gray-200 bg-white px-5 py-3.5 font-serif text-[15px] text-black shadow-sm outline-none focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20"
          />
        </div>

        {/* Grid kelas / empty state */}
        {filteredClasses.length > 0 ? (
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredClasses.map((item) => (
              <ClassCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="mt-14 flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-white py-16 text-center">
            <p className="font-serif text-[16px] font-semibold text-[#171717]">
              Kelas tidak ditemukan
            </p>
            <p className="mt-1 font-serif text-[14px] text-gray-500">
              Coba kata kunci lain, atau buat kelas baru.
            </p>
          </div>
        )}
      </main>

      <CreateClassModal
        open={isCreateOpen}
        onClose={() => setCreateOpen(false)}
        onCreate={handleCreateClass}
      />
      <JoinClassModal
        open={isJoinOpen}
        onClose={() => setJoinOpen(false)}
        onJoin={handleJoinClass}
      />
    </div>
  );
}