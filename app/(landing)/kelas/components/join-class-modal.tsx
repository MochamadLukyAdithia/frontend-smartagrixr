"use client";

import { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onJoin: (code: string) => void;
};

export function JoinClassModal({ open, onClose, onJoin }: Props) {
  const [code, setCode] = useState("");

  if (!open) return null;

  const handleSubmit = () => {
    if (!code.trim()) return;
    onJoin(code.trim());
    setCode("");
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-serif text-[20px] font-bold text-black">
          Gabung Kelas
        </h2>
        <p className="mt-1 font-serif text-[14px] text-gray-500">
          Masukkan kode kelas yang diberikan oleh pengajar.
        </p>

        <label className="mt-5 block font-serif text-[13px] font-semibold text-[#4a4a4a]">
          Kode Kelas
        </label>
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Contoh: AGR-2K7X"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 font-serif text-[15px] uppercase tracking-wide text-black outline-none focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20"
        />

        <div className="mt-7 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-5 py-2.5 font-serif text-[14px] font-semibold text-[#4a4a4a] hover:bg-gray-100"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="rounded-full bg-[#21a447] px-6 py-2.5 font-serif text-[14px] font-semibold text-white hover:bg-[#198b3a]"
          >
            Gabung
          </button>
        </div>
      </div>
    </div>
  );
}