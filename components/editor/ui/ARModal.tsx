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
  Loader2 
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 select-none animate-in fade-in duration-100">
      <div className="relative w-full max-w-lg bg-[#141416] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-[#111113]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold tracking-tight text-zinc-100">
                Augmented Reality View
              </h2>
              <p className="text-[11px] text-zinc-400">
                Inspect 3D scene in real-world space via mobile scanner
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsARModalOpen(false)}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-zinc-800 bg-[#121214] px-3 pt-1 text-xs">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "qr"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <QrCode className="w-3.5 h-3.5" /> Mobile QR
          </button>
          <button
            onClick={() => setActiveTab("marker")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "marker"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Camera className="w-3.5 h-3.5" /> Marker Sheet
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-1.5 px-3 py-2 border-b-2 font-medium transition-colors cursor-pointer ${
              activeTab === "export"
                ? "border-emerald-500 text-emerald-400"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Download className="w-3.5 h-3.5" /> Export GLB
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-5 flex-1 overflow-y-auto">
          {activeTab === "qr" && (
            <div className="flex flex-col md:flex-row items-center gap-5">
              {/* QR Code Container */}
              <div className="flex flex-col items-center bg-white p-3 rounded-lg border border-zinc-700 flex-shrink-0">
                {isSavingScene || !qrDataUrl ? (
                  <div className="w-48 h-48 flex flex-col items-center justify-center text-zinc-700 gap-2">
                    <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                    <span className="text-[11px] font-medium">Generating QR...</span>
                  </div>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt="AR QR Code"
                    className="w-48 h-48 rounded"
                  />
                )}
                <span className="text-[10px] font-medium text-zinc-700 mt-1.5 flex items-center gap-1">
                  <Smartphone className="w-3 h-3 text-emerald-600" /> Point Camera to Scan
                </span>
              </div>

              {/* Instructions & Links */}
              <div className="flex flex-col gap-2.5 flex-1">
                <div className="bg-[#1c1c1f] p-3 rounded-lg border border-zinc-800 flex flex-col gap-1">
                  <span className="text-xs font-semibold text-zinc-200">
                    WebXR Instructions
                  </span>
                  <p className="text-[10.5px] text-zinc-400 leading-relaxed">
                    1. Open smartphone camera (iOS Safari / Android Chrome).<br />
                    2. Scan QR to load 3D scene.<br />
                    3. Tap <strong>"View in Real Space"</strong> to place on floor or field.
                  </p>
                </div>

                {/* Shareable Link Input */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10.5px] text-zinc-400">Direct Link</span>
                  <div className="flex items-center gap-1.5 bg-[#111113] p-1 rounded-md border border-zinc-800">
                    <input
                      type="text"
                      readOnly
                      value={arUrl}
                      className="bg-transparent text-xs text-zinc-300 px-2 outline-none flex-1 font-mono truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-medium flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Open in new tab button */}
                <button
                  onClick={handleLaunchInBrowser}
                  className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Viewer Directly
                </button>
              </div>
            </div>
          )}

          {activeTab === "marker" && (
            <div className="flex flex-col items-center gap-3 text-center">
              <div className="bg-white p-3 rounded border-2 border-black inline-block shadow">
                <div className="w-36 h-36 bg-black flex items-center justify-center p-4">
                  <div className="w-full h-full bg-white flex items-center justify-center font-bold text-black text-center text-xs tracking-wider p-2 font-mono">
                    SMARTAGRI<br />XR MARKER
                  </div>
                </div>
              </div>

              <div className="max-w-xs flex flex-col gap-1">
                <h3 className="text-xs font-semibold text-zinc-200">Marker Surface Pattern</h3>
                <p className="text-[10.5px] text-zinc-400">
                  Print or place marker on physical surface for high-precision model anchoring.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-md text-xs font-medium flex items-center gap-1.5 border border-zinc-700"
              >
                <Download className="w-3.5 h-3.5" /> Print Marker
              </button>
            </div>
          )}

          {activeTab === "export" && (
            <div className="flex flex-col gap-3">
              <div className="bg-[#1c1c1f] p-3 rounded-lg border border-zinc-800 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-zinc-900 border border-zinc-800 text-emerald-400 rounded">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-semibold text-zinc-200">Standard 3D Asset (.GLB)</h4>
                    <p className="text-[10px] text-zinc-400">
                      Standard glTF 2.0 binary package compatible with WebXR, Blender, and game engines.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-1 bg-[#111113] p-2 rounded text-center text-xs">
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase font-mono">Objects</span>
                    <span className="font-semibold text-zinc-200 text-xs">{getObjects().length}</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase font-mono">Format</span>
                    <span className="font-semibold text-emerald-400 text-xs">GLB 2.0</span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block text-[9px] uppercase font-mono">PBR</span>
                    <span className="font-semibold text-zinc-300 text-xs">Enabled</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadGLB}
                disabled={isExporting}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Exporting...
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" /> Download .GLB
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-zinc-800 bg-[#111113] flex items-center justify-between text-[10.5px] text-zinc-500">
          <div className="flex items-center gap-1">
            <Info className="w-3 h-3 text-emerald-500" />
            <span>Supported on iOS Safari & Android Chrome.</span>
          </div>
          <span className="font-mono text-zinc-500">SmartAgriXR</span>
        </div>
      </div>
    </div>
  );
}
