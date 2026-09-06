"use client";

import { useEffect, useRef } from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  DirectionalLight,
  ArcRotateCamera,
  Vector3,
  Color4,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { SceneLoader } from "@babylonjs/core";
import { X } from "lucide-react";
import type { ApiAsset } from "@/lib/api";

export function AssetDetailModal({
  token,
  asset,
  onClose,
}: {
  token: string;
  asset: ApiAsset;
  onClose: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!asset) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0.96, 0.98, 0.97, 1);

    const hemi = new HemisphericLight(
      "dHemi",
      new Vector3(0, 1, 0.5),
      scene
    );
    hemi.intensity = 0.5;

    const dir = new DirectionalLight(
      "dDir",
      new Vector3(1, -1, -0.5),
      scene
    );
    dir.intensity = 1;

    const camera = new ArcRotateCamera(
      "dCam",
      Math.PI / 4,
      Math.PI / 2.4,
      3,
      Vector3.Zero(),
      scene
    );
    camera.panningSensibility = 1;
    camera.wheelPrecision = 30;
    camera.minZ = 0.1;
    camera.attachControl(canvas, true);

    const url = `/api/assets/${asset.id}/asset?access_token=${encodeURIComponent(token)}`;

    const resizeObserver = new ResizeObserver(() => engine.resize());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let disposed = false;

    (async () => {
      try {
        const result = await SceneLoader.ImportMeshAsync(
          "",
          "",
          url,
          scene,
          undefined,
          ".glb"
        );
        if (disposed) return;

        const meshes = result.meshes.filter((m) => m.getTotalVertices() > 0);
        if (meshes.length) {
          let min: Vector3 | null = null;
          let max: Vector3 | null = null;
          for (const mesh of meshes) {
            const bounds = mesh.getHierarchyBoundingVectors(true);
            min = min ? Vector3.Minimize(min, bounds.min) : bounds.min;
            max = max ? Vector3.Maximize(max, bounds.max) : bounds.max;
          }
          const center = min!.add(max!).scale(0.5);
          const size = Vector3.Distance(min!, max!);
          camera.setTarget(center);
          camera.radius = Math.max(size, 0.5) * 1.6;
        }
      } catch {
        // abaikan, canvas kosong
      }
    })();

    engine.runRenderLoop(() => {
      scene.render();
    });

    function dispose() {
      disposed = true;
      camera.detachControl();
      resizeObserver.disconnect();
      scene.dispose();
      engine.dispose();
    }

    return dispose;
  }, [asset.id, asset, token]);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="font-serif text-[20px] font-bold text-[#171717]">
              {asset.name}
            </h3>
            <p className="font-serif text-[13px] text-gray-500">
              Kategori: {asset.category}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative aspect-square w-full bg-[#f5f8f6]">
          <canvas
            ref={canvasRef}
            className="h-full w-full cursor-grab active:cursor-grabbing"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-full bg-black/55 px-3 py-1.5 text-[11px] font-medium text-white">
              Klik &amp; seret / scroll untuk menjelajah model 3D
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
