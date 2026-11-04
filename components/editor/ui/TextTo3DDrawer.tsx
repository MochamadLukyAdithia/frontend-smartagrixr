"use client";

import { useState, useEffect, useRef } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { useAuthStore } from "@/stores/useAuthStore";
import { 
  createTextTo3DTask, 
  queryTripoTask, 
  extractModelUrl, 
  extractPreviewImageUrl,
  TripoTaskData 
} from "@/lib/api/tripo";
import {
  fetchAiQuota,
  verifyAiTicket,
  consumeAiTicket,
  refundAiTicket,
  fetchAiHistory,
  saveAiHistory,
  type AiQuotaData,
  type AiHistoryRecord,
} from "@/lib/api/aiQuota";
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
  Cpu,
  Crown,
  RefreshCw,
  ExternalLink
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
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);

  // Form states - Mode Terbaru P2-20260801 sebagai default ("hd")
  const [prompt, setPrompt] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("blurry, low quality, broken mesh, distorted geometry");
  const [qualityMode, setQualityMode] = useState<"fast" | "hd">("hd");
  const [detailLevel, setDetailLevel] = useState<"low" | "medium" | "high">("medium");
  const [texture, setTexture] = useState<boolean>(true);
  const [pbr, setPbr] = useState<boolean>(true);
  const [textureQuality, setTextureQuality] = useState<"standard" | "detailed" | "extreme">("standard");
  const [autoSize, setAutoSize] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Quota states (api/ai/quota, api/ai/consume, api/ai/verify-ticket, api/ai/refund)
  const [quota, setQuota] = useState<AiQuotaData | null>(null);
  const [loadingQuota, setLoadingQuota] = useState<boolean>(true);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

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

  // Load quota from backend / API
  const refreshQuota = async () => {
    try {
      setLoadingQuota(true);
      const q = await fetchAiQuota(token);
      setQuota(q);
    } catch (e) {
      console.error("Failed to load AI quota", e);
    } finally {
      setLoadingQuota(false);
    }
  };

  // Load history from API with localStorage fallback
  const refreshHistory = async () => {
    try {
      const remoteHistory = await fetchAiHistory(token);
      if (remoteHistory && remoteHistory.length > 0) {
        setHistory(remoteHistory);
        return;
      }
    } catch {}

    try {
      const saved = localStorage.getItem("tripo3d_generation_history");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load generation history", e);
    }
  };

  useEffect(() => {
    refreshQuota();
    refreshHistory();
  }, [token]);

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
  const startPolling = (taskId: string, ticketId?: string | null) => {
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
            const historyItem: GenerationHistoryItem = {
              id: taskId,
              prompt: prompt || "Model 3D AI",
              model: qualityMode === "fast" ? "P1-20260311 (Ringan)" : "P2-20260801 (HD Terbaru)",
              modelUrl: modelUrl,
              previewUrl: previewImg,
              createdAt: new Date().toISOString(),
            };
            saveToHistory(historyItem);

            // Simpan riwayat ke backend API
            saveAiHistory({
              ticket_id: ticketId || undefined,
              prompt: prompt || "Model 3D AI",
              model: qualityMode === "fast" ? "P1-20260311" : "P2-20260801",
              model_url: modelUrl,
              preview_url: previewImg,
              task_id: taskId,
            }, token);

            refreshQuota();

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

          // Refund tiket kuota karena pembuatan gagal
          if (ticketId) {
            await refundAiTicket({ ticket_id: ticketId, reason: "Pembuatan model AI 3D gagal" }, token);
            refreshQuota();
          }

          setErrorMessage("Pembuatan 3D gagal. Kuota generate Anda telah dikembalikan secara otomatis.");
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

  // Trigger text to 3D generation dengan pengecekan kuota & tiket
  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      setErrorMessage("Silakan masukkan deskripsi objek 3D yang ingin dibuat.");
      return;
    }

    // Cek batas kuota untuk akun gratisan
    if (quota && !quota.is_pro && quota.remaining_quota <= 0) {
      setErrorMessage(
        "Kuota generate AI gratis Anda telah habis (3/3 kali). Silakan upgrade ke paket Pro untuk membuat model tanpa batas."
      );
      return;
    }

    setErrorMessage(null);
    setIsGenerating(true);
    setProgressPct(5);
    setStatusMessage("Memvalidasi tiket & kuota AI...");
    setGeneratedModelUrl(null);
    setPreviewImageUrl(null);

    // Ambil mode terbaru secara konsisten: hd = P2-20260801, fast = P1-20260311
    const modelVersion = qualityMode === "fast" ? "P1-20260311" : "P2-20260801";
    const calculatedFaces = getCalculatedFaceLimit();

    let ticketId: string | null = null;

    try {
      // 1. Verifikasi tiket izin generate (api/ai/verify-ticket)
      const ticketRes = await verifyAiTicket(prompt.trim(), modelVersion, token);
      ticketId = ticketRes.ticket_id;
      setActiveTicketId(ticketId);

      // 2. Gunakan / potong kuota tiket (api/ai/consume)
      await consumeAiTicket({
        ticket_id: ticketId,
        prompt: prompt.trim(),
        model: modelVersion,
      }, token);

      // Update kuota tampilan lokal secara responsif
      setQuota((prev) => prev ? {
        ...prev,
        used_quota: prev.used_quota + 1,
        remaining_quota: Math.max(0, prev.remaining_quota - 1),
        can_generate: prev.is_pro || (prev.remaining_quota - 1 > 0),
      } : prev);

      setStatusMessage("Mengirim permintaan ke AI Tripo3D...");

      // 3. Buat task generasi 3D
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
      startPolling(taskId, ticketId);
    } catch (err: any) {
      console.error("Failed to start text-to-3d generation", err);
      setIsGenerating(false);

      // Kembalikan kuota jika inisiasi task gagal (api/ai/refund)
      if (ticketId) {
        await refundAiTicket({ ticket_id: ticketId, reason: "Gagal inisiasi task AI" }, token);
        refreshQuota();
      }

      const msg = err?.message || "Gagal memulai pembuatan model 3D. Kuota Anda telah dikembalikan.";
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
    <div className="w-88 bg-white border-r border-slate-200 flex flex-col h-full text-slate-700 select-none z-10 font-sans shadow-lg">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-700 shadow-xs">
            <Wand2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Text to 3D AI</span>
              <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-300/60">
                AI Generator
              </span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setActiveLeftTab("none")}
          className="bouncy-hover p-1.5 hover:bg-slate-200 rounded-xl text-slate-500 hover:text-slate-900 transition-colors"
          title="Tutup Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Mode Sub-tabs */}
      <div className="flex border-b border-slate-200 px-3.5 pt-2 gap-1.5 bg-slate-50">
        <button
          onClick={() => setActiveTab("generate")}
          className={`bouncy-hover flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "generate"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Buat Model 3D
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`bouncy-hover flex-1 pb-2.5 text-xs font-bold border-b-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-emerald-600 text-emerald-700"
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Riwayat ({history.length})
        </button>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-3.5 space-y-4">
        {activeTab === "generate" ? (
          <form onSubmit={handleGenerate} className="space-y-3.5">
            {/* AI Quota & Plan Card */}
            <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-50/80 via-white to-emerald-50/40 border border-emerald-200/80 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  {quota?.is_pro ? (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-300/60 shadow-2xs">
                      <Crown className="w-3 h-3 text-amber-600 fill-amber-500" /> Paket Pro
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-300/60 shadow-2xs">
                      <Sparkles className="w-3 h-3 text-emerald-600" /> Kuota AI Gratis
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-mono font-bold text-slate-800">
                    {quota?.is_pro ? (
                      <span className="text-emerald-700 font-extrabold">Akses Tanpa Batas</span>
                    ) : (
                      <span>
                        <strong className={quota && quota.remaining_quota <= 0 ? "text-rose-600" : "text-emerald-700"}>
                          {quota?.remaining_quota ?? 3}
                        </strong> / {quota?.total_quota ?? 3} kali
                      </span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={refreshQuota}
                    className="p-1 hover:bg-slate-200/60 rounded text-slate-400 hover:text-slate-700 transition"
                    title="Perbarui Kuota"
                  >
                    <RefreshCw className={`w-3 h-3 ${loadingQuota ? "animate-spin" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Progress bar untuk akun free */}
              {!quota?.is_pro && (
                <div className="space-y-1 pt-0.5">
                  <div className="w-full bg-slate-200/80 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        (quota?.remaining_quota ?? 3) <= 0
                          ? "bg-rose-500"
                          : (quota?.remaining_quota ?? 3) === 1
                          ? "bg-amber-500"
                          : "bg-emerald-600"
                      }`}
                      style={{
                        width: `${Math.min(100, (((quota?.used_quota ?? 0) / (quota?.total_quota ?? 3)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{quota?.reset_info || "3 kali generate gratis per akun"}</span>
                    {(quota?.remaining_quota ?? 3) <= 1 && (
                      <a
                        href="/dashboard/pembayaran"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-0.5"
                      >
                        Upgrade Pro <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Warning jika kuota habis */}
            {quota && !quota.is_pro && quota.remaining_quota <= 0 && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-bold">Kuota Gratis Anda Telah Habis</div>
                    <div className="text-[11px] text-amber-800 mt-0.5">
                      Anda telah menggunakan batas 3 kali generasi model 3D AI. Tingkatkan ke paket Pro untuk membuat model tanpa batas.
                    </div>
                  </div>
                </div>
                <a
                  href="/dashboard/pembayaran"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-bold text-xs shadow-xs transition"
                >
                  <Crown className="w-3.5 h-3.5" /> Buka Halaman Pembayaran
                </a>
              </div>
            )}

            {/* Error banner */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="font-medium">{errorMessage}</span>
              </div>
            )}

            {/* Prompt Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Deskripsi Objek 3D <span className="text-emerald-600">*</span>
                </label>
                <span className="text-[10px] text-slate-400 font-mono">{prompt.length}/1024</span>
              </div>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                maxLength={1024}
                rows={3}
                placeholder="Contoh: Rumah kaca pintar modern dengan panel surya, dinding kaca, dan kipas angin otomatis..."
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-xl p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none transition-colors resize-none font-medium"
              />
            </div>

            {/* Quick Presets for Smart Agri */}
            <div>
              <div className="text-[11px] font-bold text-slate-500 mb-1.5 flex items-center justify-between">
                <span>Contoh Cepat Pertanian:</span>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {SMART_AGRI_PROMPTS.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setPrompt(item.prompt)}
                    className="bouncy-hover text-[11px] bg-slate-50 hover:bg-emerald-50 hover:border-emerald-500/50 text-slate-700 hover:text-emerald-800 border border-slate-200 p-2 rounded-xl text-left transition-colors truncate font-medium shadow-xs"
                    title={item.prompt}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Quality & Speed Mode — Mode Terbaru P2-20260801 */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-800">
                  Mode Pembuatan AI
                </label>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded">
                  P2 Aktif (Terbaru)
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setQualityMode("hd")}
                  className={`bouncy-hover p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    qualityMode === "hd"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs ring-1 ring-emerald-500/30"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 text-xs font-bold">
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Mode HD</span>
                    </div>
                    <span className="text-[8px] bg-emerald-600 text-white font-extrabold px-1 rounded">
                      TERBARU
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">
                    Model P2-20260801 Quad Mesh
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setQualityMode("fast")}
                  className={`bouncy-hover p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                    qualityMode === "fast"
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <div className="flex items-center gap-1.5 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 text-amber-500" />
                    <span>Mode Cepat</span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1 leading-tight font-medium">
                    Model P1-20260311 Ringan
                  </div>
                </button>
              </div>
            </div>

            {/* Model Complexity */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Tingkat Kepadatan Detail
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => setDetailLevel("low")}
                  className={`bouncy-hover py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    detailLevel === "low"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ringan
                </button>
                <button
                  type="button"
                  onClick={() => setDetailLevel("medium")}
                  className={`bouncy-hover py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    detailLevel === "medium"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Standar
                </button>
                <button
                  type="button"
                  onClick={() => setDetailLevel("high")}
                  className={`bouncy-hover py-2 px-2 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                    detailLevel === "high"
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                      : "bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900"
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
                className="flex items-center justify-between w-full text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors py-1 cursor-pointer"
              >
                <div className="flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-slate-400" />
                  <span>Pengaturan Tambahan (Opsional)</span>
                </div>
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showAdvanced && (
                <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  {/* Negative Prompt */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Hindari Bentuk Berikut (Negative Prompt)
                    </label>
                    <input
                      type="text"
                      value={negativePrompt}
                      onChange={(e) => setNegativePrompt(e.target.value)}
                      placeholder="Contoh: buram, rusak, jaring terdistorsi..."
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Texture & PBR Toggles */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={texture}
                        onChange={(e) => setTexture(e.target.checked)}
                        className="accent-emerald-600"
                      />
                      <span>Beri Warna Tekstur</span>
                    </label>
                    <label className="flex items-center gap-2 text-slate-700 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={pbr}
                        onChange={(e) => setPbr(e.target.checked)}
                        className="accent-emerald-600"
                      />
                      <span>Kilau PBR Realistis</span>
                    </label>
                  </div>

                  {/* Texture Quality */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 block mb-1">
                      Ketajaman Tekstur
                    </label>
                    <select
                      value={textureQuality}
                      onChange={(e) => setTextureQuality(e.target.value as any)}
                      className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 font-medium"
                    >
                      <option value="standard">Standar (Cepat & Ringan)</option>
                      <option value="detailed">HD Lebih Tajam</option>
                      <option value="extreme">Ultra HD 8K</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Generation Progress Card */}
            {isGenerating && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 font-bold">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{statusMessage || "Sedang memproses..."}</span>
                  </div>
                  <span className="font-mono text-slate-700 font-bold">{progressPct}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full transition-all duration-300 ease-out"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>
            )}

            {/* Generation Success Card & Insert Button */}
            {generatedModelUrl && !isGenerating && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-300/70 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> Model 3D Berhasil Dibuat!
                  </span>
                </div>

                {previewImageUrl && (
                  <div className="w-full h-32 rounded-xl bg-white border border-slate-200 overflow-hidden flex items-center justify-center">
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
                    className="bouncy-hover flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                  >
                    {isInserting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Memasukkan...
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5 stroke-[3]" /> Masukkan ke Canvas 3D
                      </>
                    )}
                  </button>
                  <a
                    href={generatedModelUrl}
                    download="model_3d.glb"
                    target="_blank"
                    rel="noreferrer"
                    className="bouncy-hover p-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-200 flex items-center justify-center"
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
              disabled={isGenerating || !prompt.trim() || Boolean(quota && !quota.is_pro && quota.remaining_quota <= 0)}
              className={`bouncy-hover w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm ${
                quota && !quota.is_pro && quota.remaining_quota <= 0
                  ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-200 disabled:text-slate-400 text-white cursor-pointer"
              }`}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Sedang Membuat Model 3D...
                </>
              ) : quota && !quota.is_pro && quota.remaining_quota <= 0 ? (
                <>
                  <Crown className="w-4 h-4 text-amber-500" /> Kuota Gratis Habis (3/3) — Upgrade Pro
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 stroke-[2.5]" /> Buat Model 3D (Mode P2 Terbaru)
                </>
              )}
            </button>
          </form>
        ) : (
          /* History Tab */
          <div className="space-y-2.5">
            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                Belum ada riwayat model 3D.
              </div>
            ) : (
              history.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 hover:border-emerald-500/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="font-bold text-xs text-slate-800 line-clamp-2">
                      {item.prompt}
                    </div>
                    <button
                      onClick={() => deleteFromHistory(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer transition-colors"
                      title="Hapus dari riwayat"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {item.previewUrl && (
                    <div className="w-full h-24 rounded-xl bg-white overflow-hidden flex items-center justify-center border border-slate-200">
                      <img
                        src={item.previewUrl}
                        alt={item.prompt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-500 font-medium">
                      {item.model}
                    </span>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => handleInsertIntoScene(item.modelUrl, item.prompt.slice(0, 20))}
                        className="bouncy-hover px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Masukkan
                      </button>
                      <a
                        href={item.modelUrl}
                        download="model.glb"
                        target="_blank"
                        rel="noreferrer"
                        className="bouncy-hover p-1.5 bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200"
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
