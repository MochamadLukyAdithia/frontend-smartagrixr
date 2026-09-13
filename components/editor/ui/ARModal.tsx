"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  X, 
  QrCode, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Layers, 
  Camera, 
  Info,
  Loader2,
  Sparkles
} from "lucide-react";

export function ARModal() {
  const { isARModalOpen, setIsARModalOpen, getObjects, environment, activeSceneId } = useEditorStore();
  const [activeTab, setActiveTab] = useState<"qr" | "marker" | "export">("qr");
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [arUrl, setArUrl] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isSavingScene, setIsSavingScene] = useState(false);

  const editor = useEditorInstance();

  useEffect(() => {
    if (!isARModalOpen) return;

    const syncAndGenerateQR = async () => {
      setIsSavingScene(true);
      try {
        const objects = getObjects();
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const generatedKey = `scene_${activeSceneId}_${Date.now().toString(36)}`;

        // Sync scene to temporary AR API
        await fetch("/api/ar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sceneId: generatedKey,
            objects,
            environment,
          }),
        });

        const targetUrl = `${currentOrigin}/ar?id=${generatedKey}`;
        setArUrl(targetUrl);

        // Generate QR code Data URL
        const dataUrl = await QRCode.toDataURL(targetUrl, {
          width: 320,
          margin: 1,
          color: {
            dark: "#10b981",
            light: "#00000000",
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate QR code", err);
      } finally {
        setIsSavingScene(false);
      }
    };

    syncAndGenerateQR();
  }, [isARModalOpen, activeSceneId]);

  if (!isARModalOpen) return null;

  const handleCopyLink = () => {
    if (!arUrl) return;
    navigator.clipboard.writeText(arUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadGLB = async () => {
    const ed = getEditorInstance();
    if (!ed) return;
    setIsExporting(true);
    try {
      await ed.exportManager.exportToGLB("smartagri-ar-model");
    } catch (err) {
      alert("Failed to export GLB model");
    } finally {
      setIsExporting(false);
    }
  };

  const handleLaunchInBrowser = () => {
    if (arUrl) {
      window.open(arUrl, "_blank");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-slate-800">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-700 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                Mode Augmented Reality (AR)
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h2>
              <p className="text-[11px] text-slate-500">
                Visualisasikan scene 3D di dunia nyata melalui scanner kamera
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsARModalOpen(false)}
            className="bouncy-hover p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-1.5 text-xs gap-2">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl font-bold transition-all cursor-pointer ${
              activeTab === "qr"
                ? "bg-white border-t-2 border-emerald-600 text-emerald-700 shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Mobile QR
          </button>
          <button
            onClick={() => setActiveTab("marker")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl font-bold transition-all cursor-pointer ${
              activeTab === "marker"
                ? "bg-white border-t-2 border-cyan-600 text-cyan-700 shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> AR Marker
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-t-xl font-bold transition-all cursor-pointer ${
              activeTab === "export"
                ? "bg-white border-t-2 border-amber-600 text-amber-700 shadow-xs"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export GLB
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto bg-white">
          {activeTab === "qr" && (
            <div className="flex flex-col md:flex-row items-center gap-5">
              {/* QR Code Container */}
              <div className="flex flex-col items-center bg-white p-3.5 rounded-2xl border-2 border-emerald-500/40 shadow-md flex-shrink-0">
                {isSavingScene || !qrDataUrl ? (
                  <div className="w-44 h-44 flex flex-col items-center justify-center text-slate-600 gap-2">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    <span className="text-[11px] font-bold">Membuat QR AR...</span>
                  </div>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt="AR QR Code"
                    className="w-44 h-44 rounded-lg"
                  />
                )}
                <span className="text-[10.5px] font-bold text-slate-800 mt-2 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-600" /> Arahkan Kamera HP
                </span>
              </div>

              {/* Instructions & Links */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex flex-col gap-1.5">
                  <span className="text-xs font-bold text-slate-800">
                    Petunjuk Scan WebXR
                  </span>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    1. Buka kamera ponsel (iOS Safari / Android Chrome).<br />
                    2. Scan QR untuk membuka scene 3D.<br />
                    3. Tekan <strong>"Lihat di Ruang Nyata"</strong> untuk menempatkan di lantai/tanah pertanian.
                  </p>
                </div>

                {/* Shareable Link Input */}
                <div className="flex flex-col gap-1">
                  <span className="text-[11px] text-slate-600 font-semibold">Tautan Langsung</span>
                  <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <input
                      type="text"
                      readOnly
                      value={arUrl}
                      className="bg-transparent text-xs text-slate-800 px-2 outline-none flex-1 font-mono truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="bouncy-hover px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300/60 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Tersalin" : "Salin"}
                    </button>
                  </div>
                </div>

                {/* Open in new tab button */}
                <button
                  onClick={handleLaunchInBrowser}
                  className="bouncy-hover w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Buka Viewer di Tab Baru
                </button>
              </div>
            </div>
          )}

          {activeTab === "marker" && (
            <div className="flex flex-col items-center gap-3.5 text-center py-2">
              <div className="bg-white p-3 rounded-2xl border-2 border-slate-900 inline-block shadow-md">
                <div className="w-36 h-36 bg-slate-950 flex items-center justify-center p-4 rounded-xl">
                  <div className="w-full h-full bg-white flex items-center justify-center font-bold text-slate-950 text-center text-xs tracking-wider p-2 font-mono rounded">
                    SMARTAGRI<br />XR MARKER
                  </div>
                </div>
              </div>

              <div className="max-w-xs flex flex-col gap-1">
                <h3 className="text-xs font-bold text-slate-800">Pola Marker Permukaan</h3>
                <p className="text-[11px] text-slate-500">
                  Cetak atau tempel marker di permukaan fisik untuk tracking model 3D yang stabil.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="bouncy-hover px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-cyan-600" /> Cetak Marker
              </button>
            </div>
          )}

          {activeTab === "export" && (
            <div className="flex flex-col gap-3.5">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 border border-emerald-300/60 text-emerald-700 rounded-xl">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Format Standar 3D (.GLB)</h4>
                    <p className="text-[10.5px] text-slate-500">
                      Paket biner glTF 2.0 standar kompatibel dengan WebXR, Blender, Unity, & Unreal.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1 bg-white p-2.5 rounded-xl border border-slate-200 text-center text-xs">
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Total Node</span>
                    <span className="font-bold text-slate-800 text-xs">{getObjects().length}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold">Format</span>
                    <span className="font-bold text-emerald-700 text-xs">GLB 2.0</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9.5px] uppercase font-bold">PBR Shader</span>
                    <span className="font-bold text-teal-700 text-xs">Aktif</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadGLB}
                disabled={isExporting}
                className="bouncy-hover w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sedang Mengekspor...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5 stroke-[2.5]" /> Unduh File .GLB
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-emerald-600" />
            <span>Mendukung iOS Safari (QuickLook) & Android Chrome (WebXR).</span>
          </div>
          <span className="font-bold text-emerald-700">SmartAgriXR</span>
        </div>
      </div>
    </div>
  );
}

