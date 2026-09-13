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
} from "@/lib/api";
import type { FeedPost, SocialComment } from "@/lib/api";
import { Heart, MessageCircle, Reply, Send, Trash2 } from "lucide-react";

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

export function PostCard({
  token,
  classroomId,
  post,
  isOwner,
}: {
  token: string | null;
  classroomId: string;
  post: FeedPost;
  isOwner: (userId: number) => boolean;
}) {
  const router = useRouter();
  const [postLiked, setPostLiked] = useState(post.is_liked);
  const [postLikes, setPostLikes] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<SocialComment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [busy, setBusy] = useState(false);

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
        <div className="min-w-0">
          <p className="truncate font-serif text-sm font-bold text-gray-900">
            {post.user.name}
          </p>
          <p className="font-serif text-xs text-gray-400">
            {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      <p className="mt-3 font-serif text-sm leading-relaxed text-gray-700">
        {post.body}
      </p>

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