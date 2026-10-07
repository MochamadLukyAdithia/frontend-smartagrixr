"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  fetchPostComments,
  createPostComment,
  likePost,
  likeComment,
  replyComment,
  deleteComment,
  classroomFileUrl,
} from "@/lib/api";
import type { FeedFile, FeedPost, SocialComment } from "@/lib/api";
import {
  Calendar,
  Clock,
  Download,
  Eye,
  FileText,
  Heart,
  MessageCircle,
  Reply,
  Send,
  Trash2,
  X,
} from "lucide-react";

function Avatar({
  name,
  avatar,
  size = "h-9 w-9",
}: {
  name: string;
  avatar: string | null;
  size?: string;
}) {
  if (avatar) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={avatar} alt={name} className={`${size} rounded-full object-cover`} />
    );
  }
  return (
    <div
      className={`${size} flex items-center justify-center rounded-full bg-[#21a447] text-xs font-bold uppercase text-white`}
    >
      {name ? name.charAt(0) : "?"}
    </div>
  );
}

function timeAgo(value: string): string {
  if (!value) return "";
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return "";
  const diff = Date.now() - t;
  const m = Math.floor(diff / 60000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} mnt`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam`;
  return new Date(value).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatDate(value: string): string {
  if (!value) return "";
  const t = new Date(value);
  if (!Number.isFinite(t.getTime())) return "";
  return t.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return "";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const POST_TYPE_LABELS: Record<string, string> = {
  announcement: "Pengumuman",
  material: "Materi",
  assignment: "Tugas",
};

function isPdfFile(file: FeedFile): boolean {
  const ref = file.url ?? file.path ?? "";
  if (!ref) return false;
  return (
    file.extension?.toLowerCase() === "pdf" ||
    file.mimeType?.toLowerCase().includes("pdf") ||
    file.name.toLowerCase().endsWith(".pdf") ||
    ref.toLowerCase().endsWith(".pdf")
  );
}

function isImageFile(file: FeedFile): boolean {
  const ref = file.url ?? file.path ?? "";
  if (!ref) return false;
  if (file.mimeType?.toLowerCase().startsWith("image/")) return true;
  return (
    /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(file.name) ||
    /\.(png|jpe?g|gif|webp|svg|avif|bmp)$/i.test(ref)
  );
}

export function PostCard({
  token,
  classroomId,
  post,
  isOwner,
  canDelete,
  onDelete,
}: {
  token: string | null;
  classroomId: string;
  post: FeedPost;
  isOwner: (userId: number) => boolean;
  canDelete?: boolean;
  onDelete?: (post: FeedPost) => void;
}) {
  const router = useRouter();
  const [postLiked, setPostLiked] = useState(post.is_liked);
  const [postLikes, setPostLikes] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [viewerFile, setViewerFile] = useState<FeedFile | null>(null);

  const requireLogin = useCallback((): boolean => {
    if (token) return true;
    router.push("/masuk");
    return false;
  }, [token, router]);

  const togglePostLike = async () => {
    if (!token || !requireLogin()) return;
    const prevLiked = postLiked;
    const prevCount = postLikes;
    setPostLiked((v) => !v);
    setPostLikes((v) => v + (prevLiked ? -1 : 1));
    try {
      const r = await likePost(token, post.id);
      setPostLiked(r.is_liked);
      setPostLikes(r.likes_count);
    } catch (err) {
      setPostLiked(prevLiked);
      setPostLikes(prevCount);
      alert(err instanceof Error ? err.message : "Gagal memberi like.");
    }
  };

  const loadComments = async () => {
    if (!token) return;
    setShowComments((v) => {
      const next = !v;
      if (next && comments.length === 0 && !commentsLoading) {
        setCommentsLoading(true);
        fetchPostComments(token, post.id)
          .then(setComments)
          .catch((err) =>
            alert(err instanceof Error ? err.message : "Gagal memuat komentar.")
          )
          .finally(() => setCommentsLoading(false));
      }
      return next;
    });
  };

  const handleCommentCount = (delta: number) =>
    setCommentCount((v) => Math.max(0, v + delta));

  const addCreatedComment = (c: SocialComment) => {
    setComments((prev) => [...prev, c]);
    handleCommentCount(1);
  };

  const createComment = async (text: string) => {
    if (!token || !text.trim()) return;
    setBusy(true);
    try {
      const c = await createPostComment(token, post.id, text.trim());
      addCreatedComment(c);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menambah komentar.");
    } finally {
      setBusy(false);
    }
  };

  const toggleCommentLike = async (comment: SocialComment) => {
    if (!token || !requireLogin()) return;
    const prev = { liked: comment.is_liked, count: comment.likes_count };
    comment.is_liked = !comment.is_liked;
    comment.likes_count += comment.is_liked ? 1 : -1;
    setComments((prevList) => [...prevList]);
    try {
      const r = await likeComment(token, comment.id);
      comment.is_liked = r.is_liked;
      comment.likes_count = r.likes_count;
      setComments((prevList) => [...prevList]);
    } catch (err) {
      comment.is_liked = prev.liked;
      comment.likes_count = prev.count;
      setComments((prevList) => [...prevList]);
      alert(err instanceof Error ? err.message : "Gagal memberi like.");
    }
  };

  const createReply = async (comment: SocialComment, text: string) => {
    if (!token || !text.trim()) return;
    setBusy(true);
    try {
      const c = await replyComment(token, comment.id, text.trim());
      comment.replies = [...comment.replies, c];
      setComments((prevList) => [...prevList]);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal membalas komentar.");
    } finally {
      setBusy(false);
    }
  };

  const removeComment = async (comment: SocialComment) => {
    if (!token || !requireLogin()) return;
    if (!confirm("Hapus komentar ini?")) return;
    try {
      await deleteComment(token, comment.id);
      const filtered = comments.filter((c) => c.id !== comment.id);
      setComments(filtered);
      handleCommentCount(-1);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Gagal menghapus komentar.");
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      {/* header */}
      <div className="flex items-center gap-3">
        <Avatar name={post.user.name} avatar={post.user.avatar} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-sm font-bold text-gray-900">
            {post.user.name}
          </p>
          <p className="font-serif text-xs text-gray-400">
            {timeAgo(post.created_at)}
          </p>
        </div>
        {canDelete && (
          <button
            type="button"
            onClick={() => {
              if (!confirm("Hapus post ini?")) return;
              onDelete?.(post);
            }}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 transition hover:bg-red-50 hover:text-red-500 cursor-pointer"
            aria-label="Hapus post"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      {post.type && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-[#eef6f0] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#145a2b]">
            {POST_TYPE_LABELS[post.type] ?? post.type}
          </span>
          {post.due_at && (
            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-semibold text-amber-700">
              <Calendar className="h-3 w-3" />
              Tenggat {formatDate(post.due_at)}
            </span>
          )}
          {post.max_score != null && (
            <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-[10px] font-semibold text-sky-700">
              Nilai Maks: {post.max_score}
            </span>
          )}
          {post.allow_late === true && (
            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-700">
              <Clock className="h-3 w-3" />
              Boleh telat
            </span>
          )}
        </div>
      )}

      {post.title && (
        <h3 className="mt-3 font-serif text-sm font-bold text-gray-900">
          {post.title}
        </h3>
      )}

      <p
        className={`font-serif text-sm leading-relaxed text-gray-700 ${
          post.title ? "mt-1" : "mt-3"
        }`}
      >
        {post.body}
      </p>

      {/* attachments */}
      {post.files.length > 0 && (
        <div className="mt-3 space-y-1.5">
          {post.files.map((f) => (
            <button
              key={`${f.id}-${f.name}`}
              type="button"
              onClick={() => setViewerFile(f)}
              className="flex w-full cursor-pointer items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-left font-serif text-xs text-gray-700 transition hover:border-[#21a447] hover:bg-[#f4faf5]"
            >
              <FileText className="h-4 w-4 shrink-0 text-[#21a447]" />
              <span className="min-w-0 flex-1 truncate">{f.name}</span>
              {f.size > 0 && (
                <span className="shrink-0 text-[10px] text-gray-400">
                  {formatFileSize(f.size)}
                </span>
              )}
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-[#eef6f0] px-2 py-0.5 text-[10px] font-semibold text-[#145a2b]">
                <Eye className="h-3 w-3" />
                Lihat
              </span>
            </button>
          ))}
        </div>
      )}

      {/* actions */}
      <div className="mt-3 flex items-center gap-5 border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={togglePostLike}
          className={`flex items-center gap-1.5 font-serif text-xs font-semibold transition cursor-pointer ${
            postLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${postLiked ? "fill-red-500" : ""}`}
          />
          {postLikes > 0 ? postLikes : ""} Suka
        </button>
        <button
          type="button"
          onClick={loadComments}
          className={`flex items-center gap-1.5 font-serif text-xs font-semibold transition cursor-pointer ${
            showComments ? "text-[#21a447]" : "text-gray-600 hover:text-[#21a447]"
          }`}
        >
          <MessageCircle className="h-4 w-4" />
          {commentCount > 0 ? commentCount : ""} Komentar
        </button>
      </div>

      {/* comments */}
      {showComments && (
        <div className="mt-3 space-y-3 border-t border-gray-100 pt-3">
          {commentsLoading && (
            <p className="font-serif text-xs text-gray-400">Memuat komentar...</p>
          )}
          {!commentsLoading && comments.length === 0 && (
            <p className="font-serif text-xs text-gray-400">
              Belum ada komentar.
            </p>
          )}
          {comments.map((c) => (
            <div key={c.id} className="space-y-2">
              <CommentItem
                comment={c}
                token={token}
                isOwner={isOwner}
                busy={busy}
                onLike={toggleCommentLike}
                onReply={createReply}
                onDelete={removeComment}
              />
            </div>
          ))}

          <CommentComposer
            placeholder="Tulis komentar..."
            token={token}
            busy={busy}
            onSubmit={(text) => createComment(text)}
          />
        </div>
      )}

      {viewerFile && (
        <FileViewer
          file={viewerFile}
          token={token}
          onClose={() => setViewerFile(null)}
        />
      )}
    </div>
  );
}

export function FileViewer({
  file,
  token,
  onClose,
}: {
  file: FeedFile;
  token: string | null;
  onClose: () => void;
}) {
  const url = classroomFileUrl(file, token);
  const isPdf = isPdfFile(file);
  const isImage = !isPdf && isImageFile(file);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
          <div className="min-w-0 flex-1">
            <p className="truncate font-serif text-xs font-bold text-gray-900">
              {file.name}
            </p>
            {file.size > 0 && (
              <p className="font-serif text-[10px] text-gray-400">
                {formatFileSize(file.size)}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-3">
            {url && (
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#eef6f0] px-3 py-1.5 font-serif text-[11px] font-semibold text-[#145a2b] transition hover:bg-[#dbeade]"
              >
                <Download className="h-3.5 w-3.5" />
                Unduh
              </a>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 cursor-pointer"
              aria-label="Tutup"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-gray-100">
          {isPdf && url ? (
            <iframe
              src={url}
              title={file.name}
              className="h-[70vh] w-full"
            />
          ) : isImage && url ? (
            <div className="flex items-center justify-center p-4">
              <img
                src={url}
                alt={file.name}
                className="max-h-[70vh] w-auto rounded-lg object-contain"
              />
            </div>
          ) : url ? (
            <div className="flex h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center">
              <FileText className="h-12 w-12 text-gray-300" />
              <p className="font-serif text-xs text-gray-500">
                File ini tidak bisa dipratinjau di dalam halaman.
              </p>
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full bg-[#21a447] px-4 py-2 font-serif text-xs font-semibold text-white transition hover:bg-[#145a2b]"
              >
                <Download className="h-3.5 w-3.5" />
                Buka / Unduh File
              </a>
            </div>
          ) : (
            <div className="flex h-[70vh] items-center justify-center p-6 text-center">
              <p className="font-serif text-xs text-gray-500">
                File tidak tersedia.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CommentItem({
  comment,
  token,
  isOwner,
  busy,
  onLike,
  onReply,
  onDelete,
}: {
  comment: SocialComment;
  token: string | null;
  isOwner: (userId: number) => boolean;
  busy: boolean;
  onLike: (c: SocialComment) => void;
  onReply: (c: SocialComment, text: string) => Promise<void>;
  onDelete: (c: SocialComment) => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [replyText, setReplyText] = useState("");

  const submitReply = () => {
    if (!replyText.trim()) return;
    onReply(comment, replyText).then(() => {
      setReplyText("");
      setShowReply(false);
    });
  };

  return (
    <div className="rounded-lg bg-gray-50 p-3">
      <div className="flex items-start gap-2.5">
        <Avatar
          name={comment.user.name}
          avatar={comment.user.avatar}
          size="h-8 w-8"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-serif text-xs font-bold text-gray-800">
              {comment.user.name}
            </span>
            <span className="font-serif text-[10px] text-gray-400">
              {timeAgo(comment.created_at)}
            </span>
          </div>
          <p className="mt-0.5 font-serif text-xs text-gray-700">
            {comment.body}
          </p>
          <div className="mt-1.5 flex items-center gap-4">
            <button
              type="button"
              onClick={() => onLike(comment)}
              className={`flex items-center gap-1 font-serif text-[11px] font-semibold transition cursor-pointer ${
                comment.is_liked
                  ? "text-red-500"
                  : "text-gray-500 hover:text-red-500"
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${comment.is_liked ? "fill-red-500" : ""}`}
              />
              {comment.likes_count > 0 ? comment.likes_count : ""} Suka
            </button>
            <button
              type="button"
              onClick={() => setShowReply((v) => !v)}
              className="flex items-center gap-1 font-serif text-[11px] font-semibold text-gray-500 transition hover:text-[#21a447] cursor-pointer"
            >
              <Reply className="h-3.5 w-3.5" />
              Balas
            </button>
            {isOwner(comment.user.id) && (
              <button
                type="button"
                onClick={() => onDelete(comment)}
                className="flex items-center gap-1 font-serif text-[11px] font-semibold text-red-500 transition hover:text-red-600 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Hapus
              </button>
            )}
          </div>

          {comment.replies.length > 0 && (
            <div className="mt-2 space-y-2 border-l-2 border-gray-200 pl-3">
              {comment.replies.map((r) => (
                <CommentItem
                  key={r.id}
                  comment={r}
                  token={token}
                  isOwner={isOwner}
                  busy={busy}
                  onLike={onLike}
                  onReply={onReply}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}

          {showReply && (
            <CommentComposer
              placeholder="Tulis balasan..."
              token={token}
              busy={busy}
              value={replyText}
              onChange={setReplyText}
              onSubmit={() => submitReply()}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CommentComposer({
  placeholder,
  token,
  busy,
  value,
  onChange,
  onSubmit,
}: {
  placeholder: string;
  token: string | null;
  busy: boolean;
  value?: string;
  onChange?: (v: string) => void;
  onSubmit: (text: string) => void;
}) {
  const [local, setLocal] = useState("");
  const text = value ?? local;
  const setText = onChange ?? setLocal;

  return (
    <div className="flex items-start gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            if (token) onSubmit(text);
          }
        }}
        placeholder={placeholder}
        className="flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 font-serif text-xs text-gray-800 outline-none transition focus:border-[#21a447]"
      />
      <button
        type="button"
        onClick={() => {
          if (token) onSubmit(text);
          else window.location.href = "/masuk";
        }}
        disabled={!token || busy || !text.trim()}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#21a447] text-white transition hover:bg-[#145a2b] disabled:opacity-50 cursor-pointer"
        aria-label="Kirim"
      >
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
}