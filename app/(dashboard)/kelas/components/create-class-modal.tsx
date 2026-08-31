"use client";

import { useState } from "react";
import { CLASS_COLORS } from "../data";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, color: string) => void;
};

export function CreateClassModal({ open, onClose, onCreate }: Props) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(CLASS_COLORS[0]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!name.trim()) return;
    onCreate(name.trim(), color);
    setName("");
    setColor(CLASS_COLORS[0]);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-[420px] rounded-2xl bg-white p-6 shadow-xl">
        <h2 className="font-serif text-[20px] font-bold text-black">
          Buat Kelas Baru
        </h2>
        <p className="mt-1 font-serif text-[14px] text-gray-500">
          Beri nama kelas dan pilih warna sampul.
        </p>

        <label className="mt-5 block font-serif text-[13px] font-semibold text-[#4a4a4a]">
          Nama Kelas
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Contoh: Kelas Biologi 11"
          className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2.5 font-serif text-[15px] text-black outline-none focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20"
        />

        <p className="mt-5 font-serif text-[13px] font-semibold text-[#4a4a4a]">
          Warna Sampul
        </p>
        <div className="mt-2 flex gap-3">
          {CLASS_COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              aria-label={`Pilih warna ${c}`}
              style={{ backgroundColor: c }}
              className={`h-9 w-9 rounded-full border-2 transition-all ${
                color === c ? "scale-110 border-black" : "border-transparent"
              }`}
            />
          ))}
        </div>

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
            Buat Kelas
          </button>
        </div>
      </div>
    </div>
  );
}