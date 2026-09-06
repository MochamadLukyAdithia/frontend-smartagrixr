"use client";

import { useState, useRef } from "react";
import { uploadAsset } from "@/lib/api";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface UploadAssetModalProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function UploadAssetModal({
  token,
  onClose,
  onSuccess,
}: UploadAssetModalProps) {
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    const trimmedCategory = categoryName.trim();

    if (!file || !trimmedName || !trimmedCategory) {
      setError("Semua field wajib diisi.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await uploadAsset(token, {
        file,
        name: trimmedName,
        category: trimmedCategory,
        is_public: isPublic,
      });
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload aset.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      if (!selected.name.endsWith(".glb")) {
        setError("Hanya file GLB yang didukung.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="font-serif text-[20px] font-bold text-[#171717]">
            Tambah Aset 3D
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {success ? (
            <div className="flex flex-col items-center justify-center py-8">
              <CheckCircle className="h-12 w-12 text-[#21a447] mb-3" />
              <p className="font-serif text-[16px] font-semibold text-[#171717]">
                Aset berhasil diupload!
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4">
                <label className="mb-2 block font-serif text-[14px] font-semibold text-[#171717]">
                  File GLB
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-[#21a447] hover:bg-green-50"
                >
                  {file ? (
                    <div className="text-center">
                      <p className="font-serif text-[14px] font-medium text-[#171717]">
                        {file.name}
                      </p>
                      <p className="font-serif text-[12px] text-gray-500">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-gray-400 mb-2" />
                      <p className="font-serif text-[14px] text-gray-500">
                        Klik untuk memilih file GLB
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block font-serif text-[14px] font-semibold text-[#171717]">
                  Nama Aset
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama aset"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="mb-2 block font-serif text-[14px] font-semibold text-[#171717]">
                  Kategori
                </label>
                <input
                  type="text"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  placeholder="Masukkan kategori (misal: Bunga, Panah)"
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                  required
                />
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 accent-[#21a447]"
                  />
                  <span className="font-serif text-[14px] font-medium text-[#171717]">
                    Publikasikan aset ini
                  </span>
                </label>
              </div>

              {error && (
                <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-4 py-3">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <p className="font-serif text-[13px] text-red-600">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !file || !name.trim() || !categoryName.trim()}
                className="w-full rounded-full bg-[#21a447] py-3.5 font-serif text-[16px] font-bold text-white shadow-md transition-all hover:bg-[#1a8a39] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? "Mengupload..." : "Upload Aset"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
