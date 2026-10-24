"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AssetDetailModal } from "@/components/dashboard/asset-detail-modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchAssets } from "@/lib/api";
import { getAssetDetails } from "@/lib/api/assets";
import type { ApiAsset } from "@/lib/api";

export default function AssetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const idParam = params?.id;
  const assetId = Array.isArray(idParam) ? idParam[0] : idParam;

  const [asset, setAsset] = useState<ApiAsset | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!assetId) {
        setError("ID aset tidak valid.");
        setLoading(false);
        return;
      }

      const numericId = Number(assetId);
      if (!Number.isFinite(numericId)) {
        setError("ID aset tidak valid.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Try to find from the same lists the page uses
        const { my_assets, public_assets } = await fetchAssets(token ?? null);
        const all = [...my_assets, ...public_assets];
        let found = all.find((a) => a.id === numericId);

        if (!found) {
          // Fallback to direct detail fetch if available
          try {
            const detail = await getAssetDetails(numericId);
            // Map CloudAsset to ApiAsset shape (best effort)
            found = {
              id: detail.id,
              name: detail.name,
              category: (detail as any).category ?? null,
              category_id: (detail as any).category_id ?? null,
              is_pro: (detail as any).is_pro ?? false,
              is_public: (detail as any).is_public ?? false,
              file_size: (detail as any).file_size ?? 0,
              thumbnail_url: (detail as any).thumbnail_url ?? null,
              file_url: (detail as any).file_url ?? (detail as any).url ?? "",
              type: (detail as any).type ?? "glb",
              locked: (detail as any).locked ?? false,
            } as ApiAsset;
          } catch {
            // ignore
          }
        }

        if (!cancelled) {
          if (!found) {
            setError("Aset tidak ditemukan.");
          } else {
            setAsset(found);
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Gagal memuat aset.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [assetId, token]);

  const handleClose = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto]">
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#21a447] border-t-transparent" />
        </div>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen bg-[url('/bg.svg')] bg-[center_100px] bg-no-repeat bg-[length:100%_auto]">
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
          <p className="font-serif text-[16px] text-gray-700">
            {error || "Aset tidak ditemukan."}
          </p>
          <button
            type="button"
            onClick={() => router.push("/bahan-ajar")}
            className="rounded-full bg-[#21a447] px-6 py-2 font-serif text-[14px] font-semibold text-white transition hover:bg-[#1b8a3a]"
          >
            Kembali ke Bahan Ajar
          </button>
        </div>
      </div>
    );
  }

  return (
    <AssetDetailModal
      token={token ?? null}
      asset={asset}
      onClose={handleClose}
    />
  );
}
