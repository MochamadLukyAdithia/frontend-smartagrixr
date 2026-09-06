"use client";

import { useEffect, useRef, useState } from "react";
import {
  Engine,
  Scene,
  HemisphericLight,
  ArcRotateCamera,
  Vector3,
  Color4,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { SceneLoader } from "@babylonjs/core";
import type { ApiAsset } from "@/lib/api";

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
      } catch {
        if (!disposed) setFailed(true);
        dispose();
      }
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
  }, [asset.id, autoRotate, token]);

  if (failed) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-100">
        <span className="text-3xl">🌱</span>
      </div>
    );
  }

  return <canvas ref={canvasRef} className="h-full w-full object-cover" />;
}
