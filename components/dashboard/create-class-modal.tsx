"use client";

import { useState } from "react";
import { X, GraduationCap, Loader2, CheckCircle2 } from "lucide-react";

type FormState = {
  name: string;
  description: string;
  subject: string;
};

const initialForm: FormState = {
  name: "",
  description: "",
  subject: "",
};

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: FormState) => Promise<void>;
};

export function CreateClassModal({ open, onClose, onSubmit }: Props) {
  const [form, setForm] = useState<FormState>(initialForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!open) return null;

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Nama kelas wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setForm(initialForm);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat kelas.");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    "mt-1.5 w-full rounded-xl border border-gray-200 px-4 py-2.5 font-serif text-[15px] text-black outline-none transition-colors focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20";

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-[480px] overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="h-1.5 w-full bg-gradient-to-r from-[#21a447] via-[#4ade80] to-[#21a447]" />

        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#21a447]/10">
              <GraduationCap className="h-5 w-5 text-[#21a447]" />
            </div>
            <h3 className="font-serif text-[19px] font-bold text-black">
              Buat Kelas Baru
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
            Lengkapi detail kelas untuk mulai membagikan materi kepada siswa.
          </p>

          <div className="space-y-4">
            <div>
              <label className="font-serif text-[13px] font-semibold text-[#4a4a4a]">
                Nama Kelas <span className="text-[#21a447]">*</span>
              </label>
              <input
                value={form.name}
                onChange={(e) => update("name", e.target.value)}
                placeholder="Contoh: Teknologi Pertanian A"
                autoFocus
                className={fieldClass}
              />
            </div>

            <div>
              <label className="font-serif text-[13px] font-semibold text-[#4a4a4a]">
                Subject
              </label>
              <input
                value={form.subject}
                onChange={(e) => update("subject", e.target.value)}
                placeholder="Contoh: Teknologi Pertanian"
                className={fieldClass}
              />
            </div>

            <div>
              <label className="font-serif text-[13px] font-semibold text-[#4a4a4a]">
                Deskripsi
              </label>
              <textarea
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
                placeholder="Ceritakan tentang kelas ini..."
                rows={3}
                className={`${fieldClass} resize-none`}
              />
            </div>
          </div>

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
                  Menyimpan...
                </>
              ) : success ? (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Berhasil
                </>
              ) : (
                "Buat Kelas"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
