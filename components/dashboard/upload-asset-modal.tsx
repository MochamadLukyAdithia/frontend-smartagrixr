"use client";

import { useState, useRef } from "react";
import { uploadAsset } from "@/lib/api";
import { generateGlbThumbnail } from "@/utils/generateGlbThumbnail";
import { X, Upload, CheckCircle, AlertCircle } from "lucide-react";

interface UploadAssetModalProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
  /** Kategori yang sudah ada, untuk dipilih dari dropdown. */
  categories?: string[];
}

export function UploadAssetModal({
  token,
  onClose,
  onSuccess,
  categories = [],
}: UploadAssetModalProps) {
  const [name, setName] = useState("");
  const [categoryName, setCategoryName] = useState("");
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isPublic, setIsPublic] = useState(false);
  const [file, setFile] = useState<File | null>(null);
const [loading, setLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [generateThumbnail, setGenerateThumbnail] = useState(true);
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
      let thumbnail: File | null = null;

      if (generateThumbnail) {
        setIsGenerating(true);
        try {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(
              () => reject(new Error("generate thumbnail terlalu lama")),
              25000,
            ),
          );
          const blob = await Promise.race([
            generateGlbThumbnail(file),
            timeout,
          ]);
          const baseName = file.name.replace(/\.[^.]+$/, "");
          thumbnail = new File([blob], `${baseName}-thumbnail.png`, {
            type: "image/png",
          });
        } catch (genErr) {
          thumbnail = null;
          setError(
            `Thumbnail gagal dibuat, aset tetap diupload. (${
              genErr instanceof Error ? genErr.message : "error"
            })`,
          );
        } finally {
          setIsGenerating(false);
        }
      }

      await uploadAsset(token, {
        file,
        name: trimmedName,
        category: trimmedCategory,
        is_public: isPublic,
        thumbnail,
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
      const ext = selected.name.split(".").pop()?.toLowerCase();
      if (ext !== "glb" && ext !== "obj") {
        setError("Hanya file GLB atau OBJ yang didukung.");
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
                  File 3D (GLB / OBJ)
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
                        Klik untuk memilih file GLB atau OBJ
                      </p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".glb,.obj"
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

                <select
                  value={isAddingCategory ? "__new__" : categoryName}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "__new__") {
                      setIsAddingCategory(true);
                      setCategoryName("");
                    } else {
                      setIsAddingCategory(false);
                      setCategoryName(value);
                    }
                  }}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                >
                  <option value="" disabled>
                    Pilih kategori
                  </option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__new__">+ Tambah kategori baru...</option>
                </select>

                {isAddingCategory && (
                  <input
                    type="text"
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder="Tulis kategori baru (misal: Bunga, Panah)"
                    autoFocus
                    className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 font-serif text-[14px] outline-none transition-all focus:border-[#21a447] focus:ring-1 focus:ring-[#21a447]"
                  />
                )}
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

              <div className="mb-6">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={generateThumbnail}
                    onChange={(e) => setGenerateThumbnail(e.target.checked)}
                    className="h-5 w-5 rounded border-gray-300 accent-[#21a447]"
                  />
                  <span className="font-serif text-[14px] font-medium text-[#171717]">
                    Generate thumbnail otomatis dari model 3D
                  </span>
                </label>
                <p className="ml-8 mt-1 font-serif text-[12px] text-gray-500">
                  Screenshot model dipakai sebagai thumbnail agar daftar aset
                  ringan ditampilkan.
                </p>
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
                {isGenerating
                  ? "Membuat thumbnail..."
                  : loading
                    ? "Mengupload..."
                    : "Upload Aset"}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
