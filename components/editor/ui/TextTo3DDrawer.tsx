"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  createTextTo3DTask, 
  queryTripoTask, 
  extractModelUrl, 
  extractPreviewImageUrl,
  TripoTaskData 
} from "@/lib/api/tripo";
import { 
  Wand2, 
  Loader2, 
  Check, 
  X, 
  Download, 
  Plus, 
  Sliders, 
  Layers, 
  Clock, 
  Box, 
  ChevronDown, 
  ChevronUp, 
  Trash2,
  AlertCircle,
  Zap,
  Sparkles,
  ShieldCheck,
  Cpu
} from "lucide-react";

interface GenerationHistoryItem {
  id: string;
  prompt: string;
  model: string;
  modelUrl: string;
  previewUrl?: string | null;
  createdAt: string;
}

const SMART_AGRI_PROMPTS = [
  { label: "Rumah Kaca Pintar", prompt: "Low-poly automated smart greenhouse with solar panels, glass walls, and ventilation fans" },
  { label: "Drone Semprot Tani", prompt: "Precision agriculture quadcopter drone with multispectral camera and spray tank" },
  { label: "Robot Sensor Tanah", prompt: "Autonomous agricultural rover robot with soil moisture sensor probes and solar roof" },
  { label: "Menara Hidroponik", prompt: "Vertical hydroponic crop tower with green lettuce plants and LED grow lights" },
  { label: "Stasiun Cuaca IoT", prompt: "Solar-powered IoT weather station with telemetry antenna, anemometer, and soil sensors" },
  { label: "Traktor Modern", prompt: "Modern agricultural farm tractor with trailer and realistic farm wheels" },
];

export function TextTo3DDrawer() {
  const { setActiveLeftTab } = useEditorStore();
  const editor = getEditorInstance();

  // Form states
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, broken mesh, distorted geometry");
  const [qualityMode, setQualityMode] = useState<"fast" | "hd">("fast");
  const [detailLevel, setDetailLevel] = useState<"low" | "medium" | "high">("medium");
  const [texture, setTexture] = useState<boolean>(true);
  const [pbr, setPbr] = useState<boolean>(true);
  const [textureQuality, setTextureQuality] = useState<"standard" | "detailed" | "extreme">("standard");
  const [autoSize, setAutoSize] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Task generation & polling states
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null);
  const [taskStatus, setTaskStatus] = useState<TripoTaskData | null>(null);
  const [progressPct, setProgressPct] = useState<number>(0);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [generatedModelUrl, setGeneratedModelUrl] = useState<string | null>(null);
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isInserting, setIsInserting] = useState(false);
  const [activeTab, setActiveTab] = useState<"generate" | "history">("generate");

  // History list
  const [history, setHistory] = useState<GenerationHistoryItem[]>([]);

  // Polling ref
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Load history from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("tripo3d_generation_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load generation history", e);
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = (item: GenerationHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.id !== item.id)].slice(0, 20);
      try {
        localStorage.setItem("tripo3d_generation_history", JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save history", e);
      }
      return updated;
    });
  };

  const deleteFromHistory = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter((h) => h.id !== id);
      try {
        localStorage.setItem("tripo3d_generation_history", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  // Poll task status
  const startPolling = (taskId: string) => {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);

    let checkCount = 0;
    pollIntervalRef.current = setInterval(async () => {
      checkCount++;
      try {
        const taskData = await queryTripoTask(taskId);
        if (!taskData) return;
        setTaskStatus(taskData);

        const currentProg = taskData.progress ?? (taskData.status === "running" ? Math.min(95, checkCount * 5) : 0);
        setProgressPct(currentProg);

        if (taskData.status === "queued") {
          setStatusMessage("Sedang mengantre di server AI...");
        } else if (taskData.status === "running") {
          if (currentProg < 40) {
            setStatusMessage("Membentuk struktur geometri 3D...");
          } else if (currentProg < 80) {
            setStatusMessage("Mewarnai tekstur & material PBR...");
          } else {
            setStatusMessage("Menyelesaikan file 3D (.glb)...");
          }
        } else if (taskData.status === "success") {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          setProgressPct(100);
          setStatusMessage("Model 3D berhasil dibuat & dimasukkan ke canvas!");

          const modelUrl = extractModelUrl(taskData);
          const previewImg = extractPreviewImageUrl(taskData);
          setGeneratedModelUrl(modelUrl);
          setPreviewImageUrl(previewImg);

          if (modelUrl) {
            const assetName = prompt.trim().slice(0, 30) || "Model 3D AI";
            saveToHistory({
              id: taskId,
              prompt: prompt || "Model 3D AI",
              model: qualityMode === "fast" ? "Cepat & Ringan" : "Kualitas HD",
              modelUrl: modelUrl,
              previewUrl: previewImg,
              createdAt: new Date().toISOString(),
            });

            // Auto-insert directly into Babylon 3D Scene Viewport!
            handleInsertIntoScene(modelUrl, assetName);
          } else {
            console.warn("No model URL found in taskData:", taskData);
            setErrorMessage("Model URL tidak ditemukan di respons server.");
          }
        } else if (taskData.status === "failed" || taskData.status === "cancelled") {
          clearInterval(pollIntervalRef.current!);
          pollIntervalRef.current = null;
          setIsGenerating(false);
          setErrorMessage("Pembuatan 3D gagal. Silakan coba sesuaikan deskripsi prompt Anda.");
          setStatusMessage("Gagal");
        }
      } catch (err: any) {
        console.error("Polling error", err);
      }
    }, 2500);
  };

  // Determine polycount based on friendly selection
  const getCalculatedFaceLimit = (): number => {
    if (detailLevel === "low") return 2000;
    if (detailLevel === "high") return 10000;
    return 4500; // medium / balanced
  };

  // Trigger text to 3D generation
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMessage("Silakan masukkan deskripsi objek 3D yang ingin dibuat.");
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setProgressPct(5);
    setStatusMessage("Mengirim permintaan ke AI...");
    setGeneratedModelUrl(null);
    setPreviewImageUrl(null);

    const modelVersion = qualityMode === "fast" ? "P1-20260311" : "P2-20260801";
    const calculatedFaces = getCalculatedFaceLimit();

    try {
      const taskId = await createTextTo3DTask({
        prompt: prompt.trim(),
        negative_prompt: negativePrompt.trim() || undefined,
        model: modelVersion,
        face_limit: calculatedFaces,
        texture,
        pbr,
        texture_quality: textureQuality,
        auto_size: autoSize,
        quad: qualityMode === "hd",
      });

      setCurrentTaskId(taskId);
      startPolling(taskId);
    } catch (err: any) {
      console.error("Failed to start text-to-3d generation", err);
      setIsGenerating(false);
      const msg = err?.message || "Gagal memulai pembuatan model 3D";
      setErrorMessage(msg);
    }
  };

  // Insert generated GLB directly into Babylon.js scene
  const handleInsertIntoScene = async (url: string, assetName: string) => {
    const ed = getEditorInstance();
    if (!ed) return;
    setIsInserting(true);
    try {
      await ed.importManager.importFromUrl(url, assetName);
    } catch (err: any) {
      console.error("Failed to insert generated model into scene", err);
      alert("Gagal memasukkan model ke canvas: " + (err?.message || "Error tidak diketahui"));
    } finally {
      setIsInserting(false);
    }
  };


  return (
    <div className="w-88 bg-[#141416] border-r border-[#242427] flex flex-col h-full text-zinc-300 select-none z-10">
      {/* Header */}
      <div className="h-12 border-b border-[#242427] px-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Wand2 className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="text-xs font-semibold text-zinc-100 flex items-center gap-1.5">
              <span>Text to 3D AI</span>
              <span className="text-[9px] bg-emerald-950/60 text-emerald-400 font-medium px-1.5 py-0.2 rounded border border-emerald-500/30">
                Otomatis
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveLeftTab("none")}
          className="p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-zinc-200 transition-colors"
          title="Tutup Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex border-b border-[#242427] px-3 pt-2 gap-1 bg-[#121214]">
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "generate"
              ? "border-emerald-500 text-emerald-400 font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Buat Model 3D
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex-1 pb-2 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
            activeTab === "history"
              ? "border-emerald-500 text-emerald-400 font-semibold"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Riwayat ({history.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === "generate" ? (
          <form onSubmit={handleGenerate} className="space-y-3.5">
            {/* Error banner */}
            {errorMessage && (
              <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-zinc-200">
                  Deskripsi Objek 3D <span className="text-emerald-400">*</span>
                </label>
                <span className="text-[10px] text-zinc-500">{prompt.length}/1024</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={1024}
                rows={3}
                placeholder="Contoh: Rumah kaca pintar modern dengan panel surya, dinding kaca, dan kipas angin otomatis..."
                className="w-full bg-[#1c1c1f] border border-[#2b2b30] focus:border-emerald-500/80 rounded-lg p-2.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none transition-colors resize-none"
              />
            </div>

            {/* Quick Presets for Smart Agri */}
            <div>
              <div className="text-[11px] font-medium text-zinc-400 mb-1.5 flex items-center justify-between">
                <span>Contoh Cepat Pertanian:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SMART_AGRI_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(item.prompt)}
                    className="text-[11px] bg-[#1a1a1d] hover:bg-emerald-950/30 hover:border-emerald-500/40 text-zinc-300 hover:text-emerald-300 border border-[#27272b] p-1.5 rounded text-left transition-colors truncate"
                    title={item.prompt}
                  >
                    + {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality & Speed Mode (Replacing technical P1/P2) */}
            <div>
              <label className="text-xs font-medium text-zinc-200 block mb-1.5">
                Mode Pembuatan
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQualityMode("fast")}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    qualityMode === "fast"
                      ? "bg-emerald-950/25 border-emerald-500/60 text-emerald-300"
                      : "bg-[#1a1a1d] border-[#27272b] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>Cepat & Ringan</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 leading-tight">
                    Cocok untuk WebGL & HP (Rekomendasi)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQualityMode("hd")}
                  className={`p-2.5 rounded-lg border text-left transition-colors cursor-pointer ${
                    qualityMode === "hd"
                      ? "bg-emerald-950/25 border-emerald-500/60 text-emerald-300"
                      : "bg-[#1a1a1d] border-[#27272b] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-semibold">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Detail Tinggi</span>
                  </div>
                  <div className="text-[10px] text-zinc-400 mt-1 leading-tight">
                    Format Quad Mesh lebih halus
                  </div>
                </button>
              </div>
            </div>

            {/* Model Complexity / Polygon Density (Replacing Face Limit slider) */}
            <div>
              <label className="text-xs font-medium text-zinc-200 block mb-1.5">
                Tingkat Kepadatan Detail
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDetailLevel("low")}
                  className={`py-1.5 px-2 rounded-md border text-center text-xs transition-colors cursor-pointer ${
                    detailLevel === "low"
                      ? "bg-emerald-600 text-white font-semibold border-emerald-500"
                      : "bg-[#1a1a1d] border-[#27272b] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Ringan
                </button>
                <button
                  type="button"
                  onClick={() => setDetailLevel("medium")}
                  className={`py-1.5 px-2 rounded-md border text-center text-xs transition-colors cursor-pointer ${
                    detailLevel === "medium"
                      ? "bg-emerald-600 text-white font-semibold border-emerald-500"
                      : "bg-[#1a1a1d] border-[#27272b] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Standar
                </button>
                <button
                  type="button"
                  onClick={() => setDetailLevel("high")}
                  className={`py-1.5 px-2 rounded-md border text-center text-xs transition-colors cursor-pointer ${
                    detailLevel === "high"
                      ? "bg-emerald-600 text-white font-semibold border-emerald-500"
                      : "bg-[#1a1a1d] border-[#27272b] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  Detail Tinggi
                </button>
              </div>
            </div>

            {/* Advanced Settings Toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center justify-between w-full text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors py-1"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-zinc-500" />
                  <span>Pengaturan Tambahan (Opsional)</span>
                </div>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-2.5 rounded-lg bg-[#18181c] border border-[#27272c] space-y-3">
                  {/* Negative Prompt */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                      Hindari Bentuk Berikut (Negative Prompt)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Contoh: buram, rusak, jaring terdistorsi..."
                      className="w-full bg-[#121214] border border-[#2b2b30] rounded p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Texture & PBR Toggles */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={texture}
                        onChange={(e) => setTexture(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>Beri Warna Tekstur</span>
                    </label>
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={pbr}
                        onChange={(e) => setPbr(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>Efek Kilau PBR Realistis</span>
                    </label>
                  </div>

                  {/* Texture Quality */}
                  <div>
                    <label className="text-[11px] font-medium text-zinc-300 block mb-1">
                      Ketajaman Tekstur
                    </label>
                    <select
                      value={textureQuality}
                      onChange={(e) => setTextureQuality(e.target.value as any)}
                      className="w-full bg-[#121214] border border-[#2b2b30] rounded p-1.5 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="standard">Standar (Cepat & Hemat Kuota)</option>
                      <option value="detailed">HD Lebih Tajam</option>
                      <option value="extreme">Ultra HD 8K</option>
                    </select>
                  </div>

                  {/* Auto size toggle */}
                  <div className="text-xs">
                    <label className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={autoSize}
                        onChange={(e) => setAutoSize(e.target.checked)}
                        className="accent-emerald-500"
                      />
                      <span>Skala Otomatis ke Ukuran Nyata (Meter)</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Progress Card */}
            {isGenerating && (
              <div className="p-3 rounded-lg bg-[#18181c] border border-emerald-500/30 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-medium">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>{statusMessage || "Sedang memproses..."}</span>
                  </div>
                  <span className="font-mono text-zinc-400">{progressPct}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Generation Success Card & Insert Button */}
            {generatedModelUrl && !isGenerating && (
              <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5" /> Model 3D Berhasil Dibuat!
                  </span>
                </div>

                {previewImageUrl && (
                  <div className="w-full h-32 rounded bg-black/40 border border-zinc-800 overflow-hidden flex items-center justify-center">
                    <img
                      src={previewImageUrl}
                      alt="Rendered Preview"
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleInsertIntoScene(generatedModelUrl, prompt.slice(0, 24) || "Model 3D AI")}
                    disabled={isInserting}
                    className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                  >
                    {isInserting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memasukkan ke Canvas...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" /> Masukkan ke Canvas 3D
                      </>
                    )}
                  </button>
                  <a
                    href={generatedModelUrl}
                    download="model_3d.glb"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-md border border-zinc-700 flex items-center justify-center"
                    title="Unduh file .GLB"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isGenerating || !prompt.trim()}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-zinc-800 disabled:text-zinc-600 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sedang Membuat Model 3D...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" /> Buat Model 3D
                </>
              )}
            </button>
          </form>
        ) : (
          /* History Tab */
          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                Belum ada riwayat model 3D. Buat model 3D pertama Anda di tab sebelah!
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-2.5 rounded-lg bg-[#1a1a1d] border border-[#27272a] space-y-2 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-medium text-xs text-zinc-200 line-clamp-2">
                      {item.prompt}
                    </div>
                    <button
                      onClick={() => deleteFromHistory(item.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 cursor-pointer"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.previewUrl && (
                    <div className="w-full h-24 rounded bg-black/30 overflow-hidden flex items-center justify-center border border-zinc-800">
                      <img
                        src={item.previewUrl}
                        alt={item.prompt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-zinc-500">
                      {item.model}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleInsertIntoScene(item.modelUrl, item.prompt.slice(0, 20))}
                        className="px-2.5 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/40 rounded text-[11px] font-medium transition-colors cursor-pointer"
                      >
                        Masukkan
                      </button>
                      <a
                        href={item.modelUrl}
                        download="model.glb"
                        target="_blank"
                        rel="noreferrer"
                        className="p-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white rounded border border-zinc-700"
                        title="Unduh GLB"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
