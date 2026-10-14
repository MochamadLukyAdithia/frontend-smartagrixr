"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  fetchPlans,
  fetchPaymentHistory,
  initiatePayment,
  type Plan,
  type PaymentInitiation,
  type PaymentHistoryItem,
} from "@/lib/api";
import { snapRedirectUrl } from "@/lib/midtrans";import {
  ArrowLeft,
  Check,
  Crown,
  Sparkles,
  ShieldCheck,
  BadgeCheck,
  CheckCircle2,
  Infinity as InfinityIcon,
  BookOpen,
  Building2,
  Users,
  Loader2,
  X,
  ExternalLink,
  RefreshCw,
  Receipt,
} from "lucide-react";

const FEATURE_LABELS: Record<string, string> = {
  view_3d_asset: "Lihat aset 3D",
  scan_ar_marker: "Pindai marker AR",
  upload_3d_asset: "Unggah aset 3D",
  generate_qr: "Buat QR marker",
  create_class: "Buat & kelola kelas",
  analytics: "Analitik pembelajaran",
  custom_ar_marker: "Marker AR kustom",
  ai_2d_to_3d: "AI ubah 2D jadi 3D",
  white_label: "White-label",
  api_access: "Akses API",
  priority_support: "Dukungan prioritas",
};

const PAID_STATUSES = ["settlement", "capture", "success", "paid"];

function rupiah(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}

function planIcon(slug: string): ReactNode {
  if (slug === "free") return <BookOpen className="h-5 w-5" />;
  if (slug === "enterprise")
    return <Building2 className="h-5 w-5" />;
  return <Crown className="h-5 w-5" />;
}

function accentFor(slug: string): { chip: string; ring: string } {
  if (slug === "enterprise")
    return { chip: "bg-indigo-100 text-indigo-600", ring: "ring-indigo-500/20" };
  if (slug === "pro" || slug === "premium")
    return { chip: "bg-[#dca82a]/15 text-[#b4821a]", ring: "ring-[#21a447]/20" };
  return { chip: "bg-[#21a447]/10 text-[#21a447]", ring: "ring-[#21a447]/20" };
}

function formatStorage(mb: number): string {
  if (mb < 0) return "Tanpa batas";
  if (mb >= 1024) return `${Math.round(mb / 1024)} GB`;
  return `${mb} MB`;
}

function formatLimit(value: number, unit: string): string {
  if (value < 0) return "Tanpa batas";
  return unit ? `${value} ${unit}` : `${value}`;
}

function billingLabel(cycle: string): string {
  if (cycle === "yearly") return "Tahunan";
  if (cycle === "monthly") return "Bulanan";
  return "Sekali";
}

function statusMeta(status: string): { label: string; className: string } {
  const s = status.toLowerCase();
  if (PAID_STATUSES.includes(s))
    return { label: "Berhasil", className: "bg-[#21a447]/10 text-[#21a447]" };
  if (s === "pending")
    return { label: "Menunggu", className: "bg-amber-100 text-amber-700" };
  if (s === "expire")
    return { label: "Kedaluwarsa", className: "bg-gray-100 text-gray-500" };
  if (s === "cancel" || s === "deny")
    return { label: "Gagal", className: "bg-red-100 text-red-600" };
  if (s === "refund")
    return { label: "Dikembalikan", className: "bg-blue-100 text-blue-600" };
  return { label: status || "—", className: "bg-gray-100 text-gray-500" };
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const t = new Date(value).getTime();
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PembayaranPage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);

  const [plans, setPlans] = useState<Plan[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [plansError, setPlansError] = useState<string | null>(null);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [history, setHistory] = useState<PaymentHistoryItem[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  const [initiating, setInitiating] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [pending, setPending] = useState<PaymentInitiation | null>(null);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [activatedPlan, setActivatedPlan] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPlans()
      .then((list) => {
        if (cancelled) return;
        setPlans(list);
        const firstPaid = list.find((p) => p.price > 0);
        setSelectedSlug(firstPaid?.slug ?? list[0]?.slug ?? null);
      })
      .catch((err) => {
        if (!cancelled)
          setPlansError(
            err instanceof Error ? err.message : "Gagal memuat paket.",
          );
      })
      .finally(() => {
        if (!cancelled) setLoadingPlans(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetchPaymentHistory(token)
      .then((list) => {
        if (!cancelled) setHistory(list);
      })
      .catch(() => {
        if (!cancelled) setHistory([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingHistory(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const selectedPlan = useMemo(() => {
    if (!plans.length) return null;
    return (
      plans.find((p) => p.slug === selectedSlug) ??
      plans.find((p) => p.price > 0) ??
      plans[0]
    );
  }, [plans, selectedSlug]);

  const currentPlan = useMemo(() => {
    const settled = history.find((h) =>
      PAID_STATUSES.includes(h.status.toLowerCase()),
    );
    return settled?.plan?.name ?? "Free";
  }, [history]);

  const refreshHistory = useCallback(async () => {
    if (!token) return;
    setLoadingHistory(true);
    try {
      const list = await fetchPaymentHistory(token);
      setHistory(list);
      const orderId = pending?.order_id;
      if (orderId) {
        const match = list.find((item) => item.order_id === orderId);
        if (match && PAID_STATUSES.includes(match.status.toLowerCase())) {
          setActivatedPlan(
            match.plan?.name ?? pending?.plan ?? selectedPlan?.name ?? "Premium",
          );
        }
      }
    } catch {
      // biarkan data lama
    } finally {
      setLoadingHistory(false);
    }
  }, [token, pending, selectedPlan]);

  const paymentRedirectUrl = useMemo(() => {
    if (pending?.snap_token) return snapRedirectUrl(pending.snap_token);
    return pending?.payment_url ?? null;
  }, [pending]);

  const handleCheckout = async () => {
    if (!token || !selectedPlan) return;
    if (selectedPlan.price <= 0) return;

    setInitiating(true);
    setCheckoutError(null);
    try {
      const result = await initiatePayment(token, selectedPlan.id);
      setPending(result);
      setShowPendingModal(true);
      const url = result.snap_token
        ? snapRedirectUrl(result.snap_token)
        : result.payment_url;
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      } else {
        setCheckoutError(
          "Respons pembayaran tidak menyertakan token pembayaran.",
        );
      }
      void refreshHistory();
    } catch (err) {
      setCheckoutError(
        err instanceof Error ? err.message : "Gagal memulai pembayaran.",
      );
    } finally {
      setInitiating(false);
    }
  };

  const isFree = (selectedPlan?.price ?? 0) <= 0;
  const isCurrent = selectedPlan
    ? currentPlan.toLowerCase() === selectedPlan.name.toLowerCase()
    : false;

  const isActivated = useMemo(() => {
    if (!pending?.order_id) return false;
    const match = history.find((item) => item.order_id === pending.order_id);
    return !!match && PAID_STATUSES.includes(match.status.toLowerCase());
  }, [history, pending]);

  return (
    <div className="min-h-screen pb-[100px] bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto] text-[#171717]">
      <Navbar />

      <main className="container mt-28 px-5 sm:px-8">
        <Link
          href="/dashboard/beranda"
          className="mb-4 inline-flex items-center gap-2 font-serif text-[13px] text-gray-500 transition-colors hover:text-[#21a447]"
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div className="flex flex-col items-center text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#dca82a]/40 bg-[#dca82a]/10 px-4 py-1.5 font-serif text-[12px] font-semibold text-[#b4821a]">
            <Crown className="h-4 w-4" />
            Langganan SmartAgriXR
          </span>
          <h1 className="font-serif text-[28px] font-bold leading-tight text-[#171717] sm:text-[36px]">
            Pilih Paket Anda
          </h1>
          <p className="mt-3 max-w-xl font-serif text-[14px] leading-relaxed text-gray-500 sm:text-[15px]">
            Buka seluruh modul pembelajaran imersif, project Augmented Reality
            tanpa batas, dan fitur berbasis AI untuk mempercepat belajar
            agrikultur digital Anda.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 font-serif text-[13px] shadow-sm border border-gray-100">
            <span className="text-gray-400">Paket aktif:</span>
            <span className="font-semibold text-[#21a447]">{currentPlan}</span>
          </div>
        </div>

        {plansError && (
          <p className="mx-auto mt-8 max-w-md rounded-lg bg-red-50 px-4 py-2 text-center font-serif text-[13px] text-red-600">
            {plansError}
          </p>
        )}

        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {loadingPlans
            ? Array.from({ length: 3 }).map((_, index) => (
                <div
                  key={`plan-skeleton-${index}`}
                  className="flex flex-col rounded-3xl border border-gray-200 bg-white p-6 shadow-sm"
                >
                  <div className="h-11 w-11 animate-pulse rounded-2xl bg-gray-200" />
                  <div className="mt-6 h-8 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-6 space-y-3">
                    {Array.from({ length: 4 }).map((__, i) => (
                      <div
                        key={i}
                        className="h-3.5 w-full animate-pulse rounded bg-gray-100"
                      />
                    ))}
                  </div>
                </div>
              ))
            : plans.map((item) => {
                const isSelected = item.slug === selectedPlan?.slug;
                const accent = accentFor(item.slug);
                const popular = item.slug === "pro";
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedSlug(item.slug)}
                    className={`relative flex flex-col rounded-3xl border bg-white p-6 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md ${
                      isSelected
                        ? `border-[#21a447] ring-2 ${accent.ring}`
                        : "border-gray-200"
                    }`}
                  >
                    {popular && (
                      <span className="absolute -top-3 right-6 inline-flex items-center gap-1 rounded-full bg-[#dca82a] px-3 py-1 font-serif text-[11px] font-bold text-white shadow-sm">
                        <Sparkles className="h-3 w-3" />
                        Paling Diminati
                      </span>
                    )}

                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${accent.chip}`}
                      >
                        {planIcon(item.slug)}
                      </span>
                      <div>
                        <h3 className="font-serif text-[18px] font-bold text-[#171717]">
                          {item.name}
                        </h3>
                        <p className="font-serif text-[12px] text-gray-400">
                          {billingLabel(item.billing_cycle)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex items-end gap-1">
                      <span className="font-serif text-[30px] font-bold leading-none text-[#171717]">
                        {item.price <= 0
                          ? "Gratis"
                          : item.price_formatted || rupiah(item.price)}
                      </span>
                      {item.price > 0 && (
                        <span className="font-serif text-[13px] text-gray-400">
                          /{item.billing_cycle === "yearly" ? "thn" : "bln"}
                        </span>
                      )}
                    </div>

                    <p className="mt-2 font-serif text-[12px] leading-relaxed text-gray-500">
                      {item.description}
                    </p>

                    <div className="mt-6 flex-1 space-y-3">
                      {item.features.map((feature) => (
                        <div key={feature} className="flex items-start gap-2.5">
                          <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#21a447]/10 text-[#21a447]">
                            <Check className="h-3 w-3" strokeWidth={3} />
                          </span>
                          <span className="font-serif text-[13px] leading-snug text-gray-600">
                            {FEATURE_LABELS[feature] ?? feature}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-[#f8faf9] p-3">
                      <div className="text-center">
                        <p className="font-serif text-[13px] font-bold text-[#171717]">
                          {formatLimit(item.max_assets, "")}
                        </p>
                        <p className="font-serif text-[10px] text-gray-400">
                          Aset
                        </p>
                      </div>
                      <div className="border-x border-gray-200 text-center">
                        <p className="font-serif text-[13px] font-bold text-[#171717]">
                          {formatStorage(item.max_storage_mb)}
                        </p>
                        <p className="font-serif text-[10px] text-gray-400">
                          Penyimpanan
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="font-serif text-[13px] font-bold text-[#171717]">
                          {formatLimit(item.max_classes, "")}
                        </p>
                        <p className="font-serif text-[10px] text-gray-400">
                          Kelas
                        </p>
                      </div>
                    </div>

                    <div
                      className={`mt-4 flex items-center justify-center gap-2 rounded-xl border py-3 font-serif text-[14px] font-semibold transition ${
                        isSelected
                          ? "border-[#21a447] bg-[#21a447] text-white"
                          : "border-gray-200 bg-white text-gray-600"
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="h-4 w-4" />
                          Dipilih
                        </>
                      ) : (
                        "Pilih Paket"
                      )}
                    </div>
                  </button>
                );
              })}
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#21a447]/10 text-[#21a447]">
                    <Receipt className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 className="font-serif text-[18px] font-bold text-[#171717]">
                      Riwayat Pembayaran
                    </h2>
                    <p className="font-serif text-[12px] text-gray-400">
                      Transaksi langganan Anda.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void refreshHistory()}
                  className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 font-serif text-[12px] font-medium text-gray-500 transition hover:border-[#21a447]/40 hover:text-[#21a447]"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 ${loadingHistory ? "animate-spin" : ""}`}
                  />
                  Muat ulang
                </button>
              </div>

              {loadingHistory ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="h-16 w-full animate-pulse rounded-2xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 py-10 text-center">
                  <Receipt className="mb-2 h-8 w-8 text-gray-300" />
                  <p className="font-serif text-[13px] text-gray-500">
                    Belum ada riwayat pembayaran.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((item) => {
                    const meta = statusMeta(item.status);
                    return (
                      <div
                        key={item.id}
                        className="flex items-center justify-between gap-4 rounded-2xl border border-gray-100 bg-white p-4"
                      >
                        <div className="min-w-0">
                          <p className="truncate font-serif text-[14px] font-semibold text-[#171717]">
                            {item.plan?.name ?? "Langganan"}
                          </p>
                          <p className="truncate font-serif text-[11px] text-gray-400">
                            {item.order_id} • {formatDate(item.created_at)}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <span className="font-serif text-[14px] font-bold text-[#171717]">
                            {rupiah(item.amount)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 font-serif text-[10px] font-semibold ${meta.className}`}
                          >
                            {meta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-[18px] font-bold text-[#171717]">
                Ringkasan Pesanan
              </h2>

              <div className="mt-5 rounded-2xl bg-[#f8faf9] p-4">
                <div className="flex items-center justify-between">
                  <span className="font-serif text-[13px] text-gray-500">
                    Paket
                  </span>
                  <span className="font-serif text-[14px] font-bold text-[#171717]">
                    {selectedPlan?.name ?? "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-[13px] text-gray-500">
                    Siklus
                  </span>
                  <span className="font-serif text-[14px] font-semibold text-[#171717]">
                    {selectedPlan
                      ? billingLabel(selectedPlan.billing_cycle)
                      : "—"}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="font-serif text-[13px] text-gray-500">
                    Metode
                  </span>
                  <span className="font-serif text-[14px] font-semibold text-[#171717]">
                    Dipilih di Midtrans
                  </span>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-dashed border-gray-200 pt-5">
                <span className="font-serif text-[14px] font-bold text-[#171717]">
                  Total
                </span>
                <span className="font-serif text-[20px] font-bold text-[#21a447]">
                  {isFree
                    ? "Rp0"
                    : selectedPlan
                      ? rupiah(selectedPlan.price)
                      : "—"}
                </span>
              </div>

              {checkoutError && (
                <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 font-serif text-[12px] text-red-600">
                  {checkoutError}
                </p>
              )}

              <button
                type="button"
                onClick={handleCheckout}
                disabled={isFree || isCurrent || initiating || !selectedPlan}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-serif text-[15px] font-semibold transition ${
                  isFree || isCurrent || initiating || !selectedPlan
                    ? "cursor-not-allowed bg-gray-100 text-gray-400"
                    : "bg-[#21a447] text-white shadow-lg shadow-[#21a447]/20 hover:bg-[#1b8b3b] hover:scale-[1.01] active:scale-[0.99]"
                }`}
              >
                {initiating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Memproses...
                  </>
                ) : isCurrent ? (
                  "Paket Anda Saat Ini"
                ) : isFree ? (
                  "Paket Gratis"
                ) : (
                  <>
                    <BadgeCheck className="h-5 w-5" />
                    Bayar Sekarang
                  </>
                )}
              </button>

              <p className="mt-3 text-center font-serif text-[11px] text-gray-400">
                Dengan melanjutkan, Anda menyetujui Syarat & Ketentuan layanan
                kami.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
          <span className="inline-flex items-center gap-2 font-serif text-[12px] text-gray-400">
            <Users className="h-4 w-4 text-[#21a447]" />
            Dipercaya mahasiswa & dosen
          </span>
          <span className="inline-flex items-center gap-2 font-serif text-[12px] text-gray-400">
            <ShieldCheck className="h-4 w-4 text-[#21a447]" />
            Pembayaran aman via Midtrans
          </span>
          <span className="inline-flex items-center gap-2 font-serif text-[12px] text-gray-400">
            <InfinityIcon className="h-4 w-4 text-[#21a447]" />
            Kelola langganan kapan saja
          </span>
        </div>
      </main>

      <Footer />

      {showPendingModal && pending && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-[440px] overflow-hidden rounded-3xl bg-white p-8 text-center shadow-2xl">
            <button
              type="button"
              onClick={() => setShowPendingModal(false)}
              aria-label="Tutup"
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-gray-400 transition hover:bg-gray-200 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>

            {isActivated ? (
              <>
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#21a447]/10">
                  <CheckCircle2 className="h-9 w-9 text-[#21a447]" />
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#171717]">
                  Pembayaran Berhasil
                </h3>
                <p className="mt-2 font-serif text-[14px] leading-relaxed text-gray-500">
                  Selamat {user?.name?.split(" ")[0] || "kawan"}! Paket{" "}
                  <span className="font-semibold text-[#171717]">
                    {activatedPlan ?? selectedPlan?.name}
                  </span>{" "}
                  Anda sudah aktif.
                </p>
                <Link
                  href="/dashboard/beranda"
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#21a447] py-3.5 font-serif text-[15px] font-semibold text-white transition hover:bg-[#1b8b3b]"
                >
                  Mulai Jelajahi Materi
                </Link>
              </>
            ) : (
              <>
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-600" />
                </div>
                <h3 className="font-serif text-[20px] font-bold text-[#171717]">
                  Menunggu Pembayaran
                </h3>
                <p className="mt-2 font-serif text-[14px] leading-relaxed text-gray-500">
                  Selesaikan pembayaran Anda untuk mengaktifkan paket{" "}
                  <span className="font-semibold text-[#171717]">
                    {selectedPlan?.name}
                  </span>
                  . Status akan diperbarui otomatis setelah pembayaran
                  terkonfirmasi.
                </p>

                {pending.order_id && (
                  <div className="mt-5 space-y-2 rounded-2xl bg-[#f8faf9] px-4 py-3 text-left">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-[12px] text-gray-500">
                        Order ID
                      </span>
                      <span className="font-mono text-[12px] font-semibold text-[#171717]">
                        {pending.order_id}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-[12px] text-gray-500">
                        Total
                      </span>
                      <span className="font-serif text-[14px] font-bold text-[#21a447]">
                        {pending.amount != null
                          ? rupiah(pending.amount)
                          : selectedPlan
                            ? rupiah(selectedPlan.price)
                            : "—"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  {paymentRedirectUrl && (
                    <a
                      href={paymentRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#21a447] py-3.5 font-serif text-[15px] font-semibold text-white transition hover:bg-[#1b8b3b]"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Buka Halaman Pembayaran
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void refreshHistory()}
                    disabled={loadingHistory}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-3.5 font-serif text-[15px] font-semibold text-gray-600 transition hover:bg-gray-50 disabled:opacity-60"
                  >
                    <RefreshCw
                      className={`h-4 w-4 ${loadingHistory ? "animate-spin" : ""}`}
                    />
                    Cek Status Pembayaran
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
