"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import type { ApiAsset } from "@/lib/api";

/**
 * Membuka AssetDetailModal di /bahan-ajar berdasarkan query param `?asset=<id>`.
 * Cocok untuk deep-link dari halaman lain (mis. tutorial).
 */
export function AssetDeepLink({
  assets,
  ready,
  onOpen,
}: {
  assets: ApiAsset[];
  ready: boolean;
  onOpen: (asset: ApiAsset) => void;
}) {
  const searchParams = useSearchParams();
  const param = searchParams.get("asset");
  const handledRef = useRef<string | null>(null);

  useEffect(() => {
    if (!param) {
      handledRef.current = null;
      return;
    }
    if (!ready || handledRef.current === param) return;

    const id = Number(param);
    if (!Number.isFinite(id)) return;

    const found = assets.find((asset) => asset.id === id);
    if (found) {
      handledRef.current = param;
      onOpen(found);
    }
  }, [param, ready, assets, onOpen]);

  return null;
}
