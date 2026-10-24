"use client";

import { useParams, useRouter } from "next/navigation";
import { AssetDetailModal } from "@/components/dashboard/asset-detail-modal";
import { useAuthStore } from "@/stores/useAuthStore";
import { fetchAssets } from "@/lib/api";
import { getAssetDetails } from "@/lib/api/assets";
import type { ApiAsset } from "@/lib/api";
import { useEffect, useState } from "react";

export default function InterceptedAssetModal() {
  const params = useParams();
  const router = useRouter();
  const { token } = useAuthStore();

  const idParam = params?.id;
  const assetId = Array.isArray(idParam) ? idParam[0] : idParam;

  const [asset, setAsset] = useState<ApiAsset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!assetId) {
        setLoading(false);
        return;
      }

      const numericId = Number(assetId);
      if (!Number.isFinite(numericId)) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { my_assets, public_assets } = await fetchAssets(token);
        const all = [...my_assets, ...public_assets];
        let found = all.find((a) => a.id === numericId);

        if (!found) {
          try {
            const detail = await getAssetDetails(numericId);
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
          setAsset(found ?? null);
        }
      } catch {
        if (!cancelled) {
          setAsset(null);
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
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white border-t-transparent" />
      </div>
    );
  }

  if (!asset) {
    router.back();
    return null;
  }

  return <AssetDetailModal token={token ?? null} asset={asset} onClose={handleClose} />;
}
