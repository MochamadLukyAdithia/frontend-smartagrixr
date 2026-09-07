"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  ArcRotateCamera,
  Vector3,
  Color4,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";
import { SceneLoader } from "@babylonjs/core";
import { assetExtensionCandidates, type ApiAsset } from "@/lib/api";

export function AssetThumbnail({
  token,
  asset,
  autoRotate = true,
}: {
  token: string;
  asset: ApiAsset;
  autoRotate?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [failed, setFailed] = useState(false);

  const extensions = useMemo(
    () =>
      assetExtensionCandidates(
        asset.file_extension,
        asset.extension,
        asset.asset_type,
        asset.name,
        asset.thumbnail_url
      ),
    [
      asset.file_extension,
      asset.extension,
      asset.asset_type,
      asset.name,
      asset.thumbnail_url,
    ]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    scene.clearColor = new Color4(1, 1, 1, 1);

    const light = new HemisphericLight(
      "thumbLight",
      new Vector3(0, 1, 0.5),
      scene
    );
    light.intensity = 0.85;

    const camera = new ArcRotateCamera(
      "thumbCam",
      Math.PI / 4,
      Math.PI / 2.4,
      3,
      Vector3.Zero(),
      scene
    );

    const url = `/api/assets/${asset.id}/asset?access_token=${encodeURIComponent(token)}`;

    const resizeObserver = new ResizeObserver(() => engine.resize());
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);

    let disposed = false;

    (async () => {
      let result: Awaited<
        ReturnType<typeof SceneLoader.ImportMeshAsync>
      > | null = null;

      for (const ext of extensions) {
        try {
          result = await SceneLoader.ImportMeshAsync(
            "",
            "",
            url,
            scene,
            undefined,
            ext
          );
          break;
        } catch {
          continue;
        }
      }

      if (!result || disposed) {
        if (!disposed) setFailed(true);
        dispose();
        return;
      }

        const meshes = result.meshes.filter((m) => m.getTotalVertices() > 0);
      if (!meshes.length) {
        setFailed(true);
        dispose();
        return;
      }

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
      camera.radius = Math.max(size, 0.5) * 1.35;

      if (autoRotate) {
        scene.onBeforeRenderObservable.add(() => {
          camera.alpha += 0.003;
        });
      }

      engine.runRenderLoop(() => {
        scene.render();
      });
    })();

    function dispose() {
      disposed = true;
      scene.onBeforeRenderObservable.clear();
      engine.stopRenderLoop();
      resizeObserver.disconnect();
      scene.dispose();
      engine.dispose();
    }

    return dispose;
  }, [asset.id, autoRotate, token, extensions]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <span className="text-3xl">🌱</span>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-full w-full object-cover" />;
}
