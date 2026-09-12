"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
import "@babylonjs/loaders/OBJ";
import { SceneLoader } from "@babylonjs/core";
import {
  X,
  ArrowLeft,
  Share,
  Maximize,
  Box,
  MessageSquare,
  Copy,
  QrCode,
  Check,
  Edit3,
} from "lucide-react";
import { assetExtensionCandidates, type ApiAsset } from "@/lib/api";

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

  // === NEW STATES UNTUK MARKER FLOW ===
  const [isMarkerMode, setIsMarkerMode] = useState(false);
  const [markerStep, setMarkerStep] = useState(1);
  const [markerType, setMarkerType] = useState("default");
  const [markerOrientation, setMarkerOrientation] = useState("horizontal");

  const extensions = useMemo(
    () =>
      assetExtensionCandidates(
        asset.file_extension,
        asset.extension,
        asset.asset_type,
        asset.name,
        asset.thumbnail_url,
      ),
    [
      asset.file_extension,
      asset.extension,
      asset.asset_type,
      asset.name,
      asset.thumbnail_url,
    ],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (!asset) return;

    const engine = new Engine(canvas, true);
    const scene = new Scene(engine);
    // Warna background default babylon
    scene.clearColor = new Color4(0.96, 0.98, 0.97, 1);

    const hemi = new HemisphericLight("dHemi", new Vector3(0, 1, 0.5), scene);
    hemi.intensity = 0.5;

    const dir = new DirectionalLight("dDir", new Vector3(1, -1, -0.5), scene);
    dir.intensity = 1;

    const camera = new ArcRotateCamera(
      "dCam",
      Math.PI / 4,
      Math.PI / 2.4,
      3,
      Vector3.Zero(),
      scene,
    );
    camera.panningSensibility = 1;
    camera.wheelPrecision = 30;
    camera.minZ = 0.1;
    camera.attachControl(canvas, true);

    const url = `/api/assets/${asset.id}/asset?access_token=${encodeURIComponent(
      token,
    )}`;

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
            ext,
          );
          break;
        } catch {
          continue;
        }
      }

      if (result && !disposed) {
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
  }, [asset, token, extensions]);

  if (!asset) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 sm:p-6 backdrop-blur-sm">
      <div
        className={`relative flex h-[90vh] w-full max-w-[1200px] flex-col overflow-hidden rounded-3xl shadow-2xl md:flex-row ${
          isMarkerMode ? "bg-[#040e25]" : "bg-white"
        }`}
      >
        {/* === LEFT PANEL === */}
        {!isMarkerMode ? (
          /* TAMPILAN KIRI DEFAULT */
          <div className="z-10 flex w-full shrink-0 flex-col overflow-y-auto bg-white p-6 md:w-[400px]">
            <div className="mb-6 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <button className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-700 transition hover:bg-gray-200">
                <Share className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-8">
              <h2 className="mb-3 font-serif text-[22px] font-bold leading-snug text-[#171717]">
                {asset.name}
              </h2>
              <p className="text-justify font-serif text-[13px] leading-relaxed text-gray-500">
                Project AR ini merupakan media pembelajaran interaktif untuk
                mengenalkan objek 3D. Kategori:{" "}
                <span className="font-medium text-gray-700">
                  {asset.category}
                </span>
                . Setiap objek dilengkapi informasi singkat sehingga pengguna
                dapat mempelajari karakteristik dan nilai budaya secara lebih
                menarik dan interaktif.
              </p>
            </div>

            <div className="mt-auto flex flex-col gap-3 md:mt-0">
              <button className="flex w-full items-center justify-between rounded-xl bg-[#ff7a3d] px-4 py-3.5 text-white transition hover:bg-[#ff6822]">
                <div className="flex items-center gap-2 font-serif text-[14px] font-bold">
                  Duplikat <Copy className="h-4 w-4" />
                </div>
                <span className="rounded-full bg-white/20 px-2 py-1 text-[10px] font-bold tracking-wider">
                  UPGRADE
                </span>
              </button>

              <button
                onClick={() => setIsMarkerMode(true)}
                className="flex w-full items-center justify-between rounded-xl bg-[#2563eb] px-4 py-3.5 text-white transition hover:bg-[#1d4ed8]"
              >
                <span className="font-serif text-[14px] font-bold">
                  Atur Marker
                </span>
                <QrCode className="h-5 w-5" />
              </button>

              <button className="flex w-full items-center justify-between rounded-xl border-2 border-[#2563eb] bg-white px-4 py-3 text-[#2563eb] transition hover:bg-gray-50">
                <span className="font-serif text-[14px] font-bold">
                  Embed di Canva
                </span>
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#00c4cc] text-white">
                  <span className="text-[12px] font-bold">C</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          /* TAMPILAN KIRI MARKER FLOW */
          <div className="z-10 flex w-full shrink-0 flex-col overflow-y-auto bg-[#040e25] p-6 text-white md:w-[380px]">
            {/* Header */}
            <div className="relative mb-8 flex items-center">
              <button
                onClick={() => setIsMarkerMode(false)}
                className="absolute left-0 flex h-6 w-6 items-center justify-center rounded-full bg-[#ef4444] text-white transition hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="w-full text-center font-serif text-[15px] font-bold">
                Penanda Pengaturan
              </h3>
            </div>

            {/* Step 1: Konfigurasi */}
            <div
              className={`mb-4 rounded-xl border ${
                markerStep === 1
                  ? "border-white bg-white text-black"
                  : markerStep > 1
                    ? "cursor-pointer border-white bg-white text-black"
                    : "border-[#1b2b4d] bg-transparent text-gray-500"
              }`}
              onClick={() => markerStep > 1 && setMarkerStep(1)}
            >
              <div className="flex items-center justify-between p-4 font-serif">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      markerStep >= 1
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#1b2b4d] text-gray-500"
                    }`}
                  >
                    1
                  </span>
                  <span className="text-[15px] font-bold">Konfigurasi</span>
                </div>
                {markerStep > 1 && <Edit3 className="h-4 w-4 text-gray-400" />}
              </div>

              {markerStep === 1 && (
                <div className="px-4 pb-4 font-serif">
                  <p className="mb-3 text-[12px] text-gray-500">
                    pilih jenis penanda
                  </p>
                  <div className="mb-4 flex gap-3">
                    <div
                      onClick={() => setMarkerType("default")}
                      className={`relative flex-1 cursor-pointer rounded-lg border p-2 text-center transition ${
                        markerType === "default"
                          ? "border-[#2563eb] bg-[#f0f5ff]"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {markerType === "default" && (
                        <div className="absolute left-1 top-1 rounded bg-[#2563eb] p-[2px]">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {/* Placeholder Image Penanda Default */}
                      <div className="relative mx-auto mb-2 flex h-20 w-20 items-center justify-center border border-gray-300 bg-white p-1">
                        <div className="absolute inset-1 flex flex-col justify-between border border-black p-1">
                          <div className="flex justify-between">
                            <div className="h-1.5 w-1.5 bg-black" />
                            <div className="h-1.5 w-1.5 bg-black" />
                          </div>
                          <QrCode className="mx-auto h-6 w-6" />
                          <div className="flex justify-between">
                            <div className="h-1.5 w-1.5 bg-black" />
                            <div className="h-1.5 w-1.5 bg-black" />
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[12px] font-bold ${
                          markerType === "default"
                            ? "text-[#2563eb]"
                            : "text-gray-600"
                        }`}
                      >
                        Penanda Default
                      </span>
                    </div>

                    <div
                      onClick={() => setMarkerType("custom")}
                      className={`relative flex-1 cursor-pointer rounded-lg border p-2 text-center transition ${
                        markerType === "custom"
                          ? "border-[#2563eb] bg-[#f0f5ff]"
                          : "border-gray-200 bg-gray-50 opacity-70 hover:bg-gray-100"
                      }`}
                    >
                      {markerType === "custom" && (
                        <div className="absolute left-1 top-1 rounded bg-[#2563eb] p-[2px]">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                      )}
                      {/* Placeholder Image Penanda Custom */}
                      <div className="mx-auto mb-2 flex h-20 w-20 flex-col items-center justify-center rounded-md bg-[#d2dceb] p-2">
                        <QrCode className="absolute right-3 top-3 h-3 w-3 text-gray-500" />
                        <div className="mb-1 h-8 w-8 rounded-full bg-[#a8b8d0]" />
                        <span className="text-center text-[7px] font-bold text-gray-600">
                          YOUR IMAGE HERE
                        </span>
                      </div>
                      <span
                        className={`text-[12px] font-bold ${
                          markerType === "custom"
                            ? "text-[#2563eb]"
                            : "text-gray-600"
                        }`}
                      >
                        Penanda Kustom
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setMarkerStep(2)}
                      className="rounded-lg bg-[#2563eb] px-5 py-2 font-serif text-[13px] font-bold text-white transition hover:bg-[#1d4ed8]"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Sesuaikan Konten AR */}
            <div
              className={`mb-4 rounded-xl border ${
                markerStep === 2
                  ? "border-white bg-white text-black"
                  : markerStep > 2
                    ? "cursor-pointer border-white bg-white text-black"
                    : "border-[#1b2b4d] bg-transparent text-gray-500"
              }`}
              onClick={() => markerStep > 2 && setMarkerStep(2)}
            >
              <div className="flex items-center justify-between p-4 font-serif">
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                      markerStep >= 2
                        ? "bg-[#2563eb] text-white"
                        : "bg-[#1b2b4d] text-gray-500"
                    }`}
                  >
                    2
                  </span>
                  <span className="text-[15px] font-bold">
                    Sesuaikan Konten AR
                  </span>
                </div>
                {markerStep > 2 && <Edit3 className="h-4 w-4 text-gray-400" />}
              </div>

              {markerStep === 2 && (
                <div className="px-4 pb-4 font-serif">
                  <p className="mb-4 text-[12px] text-gray-500">
                    Sesuaikan skala dan posisi objek.
                  </p>
                  <div className="mb-4">
                    <label className="text-[10px] font-bold tracking-wider text-gray-500">
                      UKURAN OBJEK
                    </label>
                    <div className="mt-2 flex gap-3">
                      <button className="flex-1 rounded-lg border border-gray-200 py-2 text-center text-lg font-medium transition hover:bg-gray-50">
                        -
                      </button>
                      <button className="flex-1 rounded-lg border border-gray-200 py-2 text-center text-lg font-medium transition hover:bg-gray-50">
                        +
                      </button>
                    </div>
                  </div>
                  <div className="mb-6">
                    <label className="text-[10px] font-bold tracking-wider text-gray-500">
                      ORIENTASI PENANDA
                    </label>
                    <div className="mt-2 flex rounded-lg border border-gray-200 p-1">
                      <button
                        onClick={() => setMarkerOrientation("horizontal")}
                        className={`flex-1 rounded-md py-2 text-[13px] font-bold transition ${
                          markerOrientation === "horizontal"
                            ? "bg-[#1e293b] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Horisontal
                      </button>
                      <button
                        onClick={() => setMarkerOrientation("vertical")}
                        className={`flex-1 rounded-md py-2 text-[13px] font-bold transition ${
                          markerOrientation === "vertical"
                            ? "bg-[#1e293b] text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        Vertikal
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between">
                    <button
                      onClick={() => setMarkerStep(1)}
                      className="rounded-lg border border-gray-300 px-4 py-2 font-serif text-[13px] font-bold text-gray-700 transition hover:bg-gray-50"
                    >
                      Sebelumnya
                    </button>
                    <button
                      onClick={() => setMarkerStep(3)}
                      className="rounded-lg bg-[#2563eb] px-5 py-2 font-serif text-[13px] font-bold text-white transition hover:bg-[#1d4ed8]"
                    >
                      Berikutnya
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Step 3: Gunakanlah */}
            <div
              className={`mb-4 rounded-xl border ${
                markerStep === 3
                  ? "border-white bg-white text-black"
                  : "border-[#1b2b4d] bg-transparent text-gray-500"
              }`}
            >
              <div className="flex items-center gap-3 p-4 font-serif">
                <span
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                    markerStep === 3
                      ? "bg-[#2563eb] text-white"
                      : "bg-[#1b2b4d] text-gray-500"
                  }`}
                >
                  3
                </span>
                <span className="text-[15px] font-bold">Gunakanlah</span>
              </div>
              {markerStep === 3 && (
                <div className="px-4 pb-4 font-serif">
                  <p className="mb-2 text-[12px] leading-relaxed text-gray-600">
                    Anda sekarang dapat membagikan konten ini dengan kolega atau
                    siswa Anda. Ikuti panduan di sebelah kanan untuk
                    petunjuknya.
                  </p>
                  <div className="flex justify-center py-2">
                    <svg
                      width="60"
                      height="40"
                      viewBox="0 0 60 40"
                      fill="none"
                      stroke="#2563eb"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                      className="opacity-70"
                    >
                      <path
                        d="M5 5 Q 30 40 55 20 M 45 15 L 55 20 L 50 30"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* === RIGHT PANEL (CANVAS & OVERLAYS) === */}
        <div
          className={`relative flex-1 transition-colors duration-300 ${
            !isMarkerMode
              ? "bg-gray-100" // Default mode background
              : markerStep !== 3
                ? "bg-gradient-to-b from-[#c0daf6] to-[#78c9ed]" // Step 1 & 2 background
                : "m-3 rounded-l-2xl bg-white md:m-4 md:rounded-l-3xl" // Step 3 background
          }`}
        >
          {/* 
              CANVAS HARUS SELALU ADA DI DALAM TREE AGAR BABYLONJS TIDAK ERROR.
              Saat step 3, kita hanya memberikan display: none / hidden.
          */}
          <canvas
            ref={canvasRef}
            className={`h-full w-full cursor-grab outline-none active:cursor-grabbing ${
              isMarkerMode && markerStep === 3 ? "hidden" : "block"
            }`}
          />

          {/* OVERLAY DEFAULT (Hanya muncul jika bukan Marker Mode) */}
          {!isMarkerMode && (
            <>
              {/* Overlay Kanan Atas */}
              <div className="pointer-events-none absolute right-4 top-4 flex gap-3">
                <button className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition hover:bg-gray-50">
                  <Maximize className="h-5 w-5" />
                </button>
                <button className="pointer-events-auto flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-gray-700 shadow-sm transition hover:bg-gray-50">
                  <Box className="h-5 w-5" />
                  <span className="text-left font-serif text-[12px] font-bold leading-tight">
                    Place it in
                    <br />
                    your room
                  </span>
                </button>
                <button className="pointer-events-auto flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-700 shadow-sm transition hover:bg-gray-50">
                  <MessageSquare className="h-5 w-5" />
                </button>
              </div>

              {/* Overlay Kiri Bawah */}
              <div className="pointer-events-none absolute bottom-6 left-6 flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <span className="pointer-events-auto rounded-md bg-black/60 px-3 py-1 font-serif text-[12px] font-bold text-white backdrop-blur-md">
                      {asset.name}
                    </span>
                    <button className="pointer-events-auto flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-md transition hover:bg-black/80">
                      <span className="text-[10px]">▶</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <div className="pointer-events-auto h-14 w-14 cursor-pointer overflow-hidden rounded-xl border-2 border-white bg-gray-200 shadow-md">
                      <img
                        src={
                          asset.thumbnail_url ||
                          "/images/dashboard/beranda/1.png"
                        }
                        alt="thumb 1"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="pointer-events-auto h-14 w-14 cursor-pointer overflow-hidden rounded-xl border-2 border-transparent bg-gray-200 opacity-70 transition hover:opacity-100">
                      <img
                        src={
                          asset.thumbnail_url ||
                          "/images/dashboard/beranda/2.png"
                        }
                        alt="thumb 2"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                <div className="pointer-events-auto flex w-max items-center gap-3 rounded-full bg-black/60 py-1.5 pl-1.5 pr-4 shadow-sm backdrop-blur-md">
                  <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white">
                    <img
                      src="/images/dashboard/beranda/1.png"
                      alt="Author"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-serif text-[11px] font-bold leading-tight text-white">
                      {asset.name}
                    </span>
                    <span className="font-serif text-[9px] leading-tight text-gray-300">
                      Dipublikasikan oleh SmartAgriXR
                    </span>
                  </div>
                </div>
              </div>

              {/* Guide Text Bawah Tengah */}
              <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center opacity-70">
                <span className="rounded-full bg-black/50 px-3 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm">
                  Klik &amp; seret / scroll untuk menjelajah model 3D
                </span>
              </div>
            </>
          )}

          {/* OVERLAY STEP 3 MARKER (Hanya muncul jika Marker Mode = 3) */}
          {isMarkerMode && markerStep === 3 && (
            <div className="absolute inset-0 flex flex-col items-center justify-center rounded-l-2xl p-6 text-[#041029] md:p-8">
              <h2 className="mb-10 text-center font-serif text-[22px] font-bold">
                Bagaimana cara menggunakan Marker?
              </h2>
              <div className="flex w-full max-w-4xl flex-col gap-6 md:flex-row">
                {/* Step Box 1 */}
                <div className="flex h-full flex-1 flex-col rounded-xl border border-gray-100 bg-[#f0f4f8] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-[11px] font-bold text-white">
                      1
                    </span>
                    <span className="font-serif text-[14px] font-bold leading-tight text-[#1e293b]">
                      Unduh & cetak spidolnya
                    </span>
                  </div>
                  <div className="mb-4 flex flex-1 flex-col items-center justify-center rounded-lg border border-gray-200 bg-white p-6">
                    <div className="relative flex h-24 w-24 items-center justify-center border border-gray-300 bg-gray-50 p-1">
                      <div className="absolute inset-2 flex flex-col justify-between border border-black p-1">
                        <div className="flex justify-between">
                          <div className="h-1.5 w-1.5 bg-black" />
                          <div className="h-1.5 w-1.5 bg-black" />
                        </div>
                        <QrCode className="mx-auto h-8 w-8" />
                        <div className="flex justify-between">
                          <div className="h-1.5 w-1.5 bg-black" />
                          <div className="h-1.5 w-1.5 bg-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <button className="flex w-full items-center justify-center gap-2 rounded-full bg-[#2563eb] py-2.5 font-serif text-[13px] font-bold text-white transition hover:bg-[#1d4ed8]">
                    <Share className="h-4 w-4" /> Unduh
                  </button>
                </div>

                {/* Step Box 2 */}
                <div className="flex h-full flex-1 flex-col rounded-xl border border-gray-100 bg-[#f0f4f8] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-[11px] font-bold text-white">
                      2
                    </span>
                    <span className="font-serif text-[14px] font-bold leading-tight text-[#1e293b]">
                      Pindai kode QR-nya
                    </span>
                  </div>
                  <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-4">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      {/* Mockup HP Scan */}
                      <div className="relative flex h-[140px] w-[75px] items-center justify-center rounded-xl border-[5px] border-gray-800 bg-white shadow-lg">
                        <div className="flex h-12 w-12 items-center justify-center border-2 border-orange-500">
                          <QrCode className="h-6 w-6 text-black" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Step Box 3 */}
                <div className="flex h-full flex-1 flex-col rounded-xl border border-gray-100 bg-[#f0f4f8] p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#1e293b] text-[11px] font-bold text-white">
                      3
                    </span>
                    <span className="font-serif text-[14px] font-bold leading-tight text-[#1e293b]">
                      Kemudian, pindai seluruh grafik.
                    </span>
                  </div>
                  <div className="relative flex flex-1 flex-col items-center justify-center overflow-hidden rounded-lg border border-gray-200 bg-white p-4">
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                      {/* Mockup HP Scan Full Graphic */}
                      <div className="relative flex h-[100px] w-[130px] items-center justify-center rounded-xl border-[5px] border-gray-800 bg-white shadow-lg">
                        <div className="flex h-[75%] w-[75%] items-center justify-center border-2 border-dashed border-orange-500">
                          <QrCode className="h-10 w-10 text-black opacity-30" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
