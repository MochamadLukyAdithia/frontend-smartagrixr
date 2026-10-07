"use client";

import { useRef, useState } from "react";
import { createClassroomPost } from "@/lib/api";
import type { FeedPost } from "@/lib/api";
import {
  Calendar,
  FilePlus2,
  Files,
  Loader2,
  Plus,
  Send,
  X,
} from "lucide-react";

const POST_TYPES = [
  { value: "announcement", label: "Pengumuman" },
  { value: "material", label: "Materi" },
  { value: "assignment", label: "Tugas" },
];

function formatFileSize(bytes: number): string {
  if (!bytes) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function CreatePostComposer({
  token,
  classroomId,
  onCreated,
}: {
  token: string | null;
  classroomId: string;
  onCreated: (post: FeedPost) => void;
}) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(POST_TYPES[0].value);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [maxScore, setMaxScore] = useState("");
  const [allowLate, setAllowLate] = useState(false);
  const [category, setCategory] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setType(POST_TYPES[0].value);
    setTitle("");
    setBody("");
    setDueAt("");
    setMaxScore("");
    setAllowLate(false);
    setCategory("");
    setFiles([]);
    setError(null);
    setOpen(false);
  };

  const handleFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles((prev) => [...prev, ...Array.from(list)]);
  };

  const submit = async () => {
    if (!token || !body.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const post = await createClassroomPost(token, classroomId, {
        type,
        title: title.trim() || undefined,
        body: body.trim(),
        due_at: type === "assignment" && dueAt ? dueAt : null,
        max_score:
          type === "assignment" && maxScore !== ""
            ? Number(maxScore)
            : null,
        allow_late: type === "assignment" ? allowLate : null,
        category: type === "material" && category.trim() ? category.trim() : null,
        files: files.length > 0 ? files : undefined,
      });
      onCreated(post);
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat post.");
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    "mt-1 w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2.5 font-serif text-sm text-gray-800 outline-none transition focus:border-[#21a447] focus:ring-2 focus:ring-[#21a447]/20";
  const labelClass =
    "font-serif text-xs font-semibold text-gray-700";

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center gap-3 rounded-xl border border-dashed border-[#21a447]/50 bg-white p-4 text-left shadow-sm transition hover:border-[#21a447] hover:bg-[#f4faf5] cursor-pointer"
      >
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#21a447] text-white">
          <Plus className="h-4 w-4" />
        </span>
        <span className="font-serif text-sm font-semibold text-[#145a2b]">
          Buat Post Kelas
        </span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-100 pb-3">
        <h3 className="font-serif text-sm font-bold text-gray-900">
          Buat Post
        </h3>
        <button
          type="button"
          onClick={reset}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 cursor-pointer"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <label className={labelClass}>Tipe Post</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className={inputClass}
          >
            {POST_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Judul</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Judul post..."
            className={inputClass}
          />
        </div>

        <div>
          <label className={labelClass}>Isi</label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Tulis isi post..."
            rows={3}
            className={`${inputClass} resize-none`}
          />
        </div>

        {type === "assignment" && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className={`${labelClass} flex items-center gap-1`}>
                <Calendar className="h-3.5 w-3.5" />
                Tenggat (due_at)
              </label>
              <input
                type="datetime-local"
                value={dueAt}
                onChange={(e) => setDueAt(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Nilai Maksimal</label>
              <input
                type="number"
                min="0"
                value={maxScore}
                onChange={(e) => setMaxScore(e.target.value)}
                placeholder="cth: 100"
                className={inputClass}
              />
            </div>
          </div>
        )}

        {type === "assignment" && (
          <label className="flex cursor-pointer items-center gap-2 pt-1">
            <input
              type="checkbox"
              checked={allowLate}
              onChange={(e) => setAllowLate(e.target.checked)}
              className="h-4 w-4 accent-[#21a447]"
            />
            <span className="font-serif text-xs font-semibold text-gray-700">
              Izinkan pengumpulan telat
            </span>
          </label>
        )}

        {type === "material" && (
          <div>
            <label className={labelClass}>Kategori Materi</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="cth: Mekanisasi, Budidaya, Rantai Pasok"
              className={inputClass}
            />
          </div>
        )}

        <div>
          <label className={`${labelClass} flex items-center gap-1`}>
            <Files className="h-3.5 w-3.5" />
            Lampiran
          </label>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className={`${inputClass} flex cursor-pointer items-center justify-center gap-2 border-dashed text-gray-500 hover:text-[#145a2b] hover:border-[#21a447]`}
          >
            <FilePlus2 className="h-4 w-4" />
            Pilih file
          </button>
          {files.length > 0 && (
            <ul className="mt-2 space-y-1.5">
              {files.map((f, i) => (
                <li
                  key={`${f.name}-${i}`}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="min-w-0 flex-1 truncate font-serif text-xs text-gray-700">
                    {f.name}
                    {f.size > 0 && (
                      <span className="ml-2 text-gray-400">
                        {formatFileSize(f.size)}
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setFiles((prev) => prev.filter((_, idx) => idx !== i))
                    }
                    className="ml-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
                    aria-label={`Hapus ${f.name}`}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {error && (
        <p className="mt-3 font-serif text-xs text-red-600">{error}</p>
      )}

      <div className="mt-4 flex justify-end gap-2 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full border border-gray-200 px-4 py-2 font-serif text-xs font-semibold text-gray-700 transition hover:bg-gray-50 cursor-pointer"
        >
          Batal
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={submitting || !body.trim()}
          className="flex items-center gap-1.5 rounded-full bg-[#21a447] px-5 py-2 font-serif text-xs font-semibold text-white shadow-md transition hover:bg-[#145a2b] disabled:opacity-60 cursor-pointer"
        >
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {submitting ? "Membuat..." : "Posting"}
        </button>
      </div>
    </div>
  );
}