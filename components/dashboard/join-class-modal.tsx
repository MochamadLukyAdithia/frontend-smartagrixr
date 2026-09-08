"use client";

import { useState } from "react";
import { X, UserPlus, Loader2, CheckCircle2 } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => Promise<void>;
};

export function JoinClassModal({ open, onClose, onSubmit }: Props) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Masukkan kode undangan kelas.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit(trimmed);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setCode("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal bergabung ke kelas.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[440px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#21a447] via-[#4ade80] to-[#21a447]" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#21a447]/10">
              <UserPlus className="h-5 w-5 text-[#21a447]" />
            </div>
            <h3 className="font-serif text-[19px] font-bold text-black">
              Gabung ke Kelas
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            aria-label="Tutup"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="mb-5 font-serif text-[13px] text-gray-500">
            Masukkan kode undangan yang diberikan oleh guru/dosen untuk
            bergabung ke kelas.
          </p>

          <label className="font-serif text-[13px] font-semibold text-[#4a4a4a]">
            Kode Undangan
          </label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Contoh: 35NA6T"
            autoFocus
            autoCapitalize="characters"
            className="mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 text-center font-mono text-[22px] font-bold tracking-[0.3em] text-black uppercase outline-none transition-colors focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20"
          />

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 px-4 py-2 font-serif text-[13px] text-red-600">
              {error}
            </p>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-full border border-gray-200 px-6 py-2.5 font-serif text-[14px] font-semibold text-[#4a4a4a] transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-full bg-[#21a447] px-7 py-2.5 font-serif text-[14px] font-semibold text-white shadow-md transition-colors hover:bg-[#198b3a] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Menghubungkan...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Berhasil
                </>
              ) : (
                "Gabung Kelas"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
