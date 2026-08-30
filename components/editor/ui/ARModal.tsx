"use client";

import { useEffect, useState, useRef } from "react";
import QRCode from "qrcode";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { 
  X, 
  QrCode, 
  Smartphone, 
  Download, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles, 
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
  const [sceneKey, setSceneKey] = useState<string>("");

  const editor = getEditorInstance();

  useEffect(() => {
    if (!isARModalOpen) return;

    const syncAndGenerateQR = async () => {
      setIsSavingScene(true);
      try {
        const objects = getObjects();
        const currentOrigin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
        const generatedKey = `scene_${activeSceneId}_${Date.now().toString(36)}`;
        setSceneKey(generatedKey);

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
          margin: 2,
          color: {
            dark: "#0f172a",
            light: "#ffffff",
          },
        });
        setQrDataUrl(dataUrl);
      } catch (err) {
        console.error("Failed to generate AR QR code", err);
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
    if (!editor) return;
    setIsExporting(true);
    try {
      await editor.exportManager.exportToGLB("smartagri-ar-model");
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-[#18181b] border border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col text-white">
        
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-[#18181b] via-[#22a447]/10 to-[#18181b]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#22a447]/20 border border-[#22a447]/40 flex items-center justify-center text-[#22a447]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Convert to Augmented Reality
                <span className="text-[10px] uppercase font-bold bg-[#22a447] text-white px-2 py-0.5 rounded-full">
                  AR Ready
                </span>
              </h2>
              <p className="text-xs text-gray-400">
                View your 3D SmartAgri scene in real-world space via mobile QR or Barcode
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsARModalOpen(false)}
            className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-white/10 bg-[#121214] px-4 pt-2">
          <button
            onClick={() => setActiveTab("qr")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "qr"
                ? "border-[#22a447] text-[#22a447]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <QrCode className="w-4 h-4" /> Scan QR Barcode
          </button>
          <button
            onClick={() => setActiveTab("marker")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "marker"
                ? "border-[#22a447] text-[#22a447]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Camera className="w-4 h-4" /> AR Marker Mode
          </button>
          <button
            onClick={() => setActiveTab("export")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
              activeTab === "export"
                ? "border-[#22a447] text-[#22a447]"
                : "border-transparent text-gray-400 hover:text-gray-200"
            }`}
          >
            <Download className="w-4 h-4" /> Download 3D Model
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          {activeTab === "qr" && (
            <div className="flex flex-col md:flex-row items-center gap-6">
              {/* QR Code Container */}
              <div className="flex flex-col items-center bg-white p-4 rounded-2xl shadow-lg border border-black/10 flex-shrink-0">
                {isSavingScene || !qrDataUrl ? (
                  <div className="w-56 h-56 flex flex-col items-center justify-center text-gray-600 gap-2">
                    <Loader2 className="w-8 h-8 text-[#22a447] animate-spin" />
                    <span className="text-xs font-medium">Generating AR Barcode...</span>
                  </div>
                ) : (
                  <img
                    src={qrDataUrl}
                    alt="AR QR Code"
                    className="w-56 h-56 rounded-lg"
                  />
                )}
                <span className="text-[11px] font-bold text-gray-700 mt-2 flex items-center gap-1">
                  <Smartphone className="w-3.5 h-3.5 text-[#22a447]" /> Point Phone Camera to Scan
                </span>
              </div>

              {/* Instructions & Links */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="bg-[#242429] p-3.5 rounded-xl border border-white/5 flex flex-col gap-2">
                  <span className="text-xs font-bold text-gray-200 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#22a447]" /> Instant WebXR & SceneViewer AR
                  </span>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    1. Open your smartphone camera (iOS or Android).<br />
                    2. Scan the barcode above to launch the 3D SmartAgri viewer.<br />
                    3. Tap <strong>"View in your space"</strong> to project the 3D model onto your real floor or farm field!
                  </p>
                </div>

                {/* Shareable Link Input */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-[11px] text-gray-400 font-semibold">AR Viewer Link:</span>
                  <div className="flex items-center gap-2 bg-[#121214] p-1.5 rounded-xl border border-white/10">
                    <input
                      type="text"
                      readOnly
                      value={arUrl}
                      className="bg-transparent text-xs text-gray-300 px-2 outline-none flex-1 font-mono truncate"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="px-3 py-1.5 bg-[#252528] hover:bg-[#323236] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>

                {/* Open in new tab button */}
                <button
                  onClick={handleLaunchInBrowser}
                  className="w-full py-2.5 bg-[#22a447] hover:bg-[#198b3a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#22a447]/20 transition-all cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4" /> Open AR Viewer in Browser
                </button>
              </div>
            </div>
          )}

          {activeTab === "marker" && (
            <div className="flex flex-col items-center gap-4 text-center">
              <div className="bg-white p-4 rounded-xl border-4 border-black inline-block shadow-lg">
                <div className="w-44 h-44 bg-black flex items-center justify-center p-6">
                  <div className="w-full h-full bg-white flex items-center justify-center font-bold text-black text-center text-xs tracking-wider p-2">
                    SMARTAGRI<br />XR MARKER
                  </div>
                </div>
              </div>

              <div className="max-w-md flex flex-col gap-2">
                <h3 className="text-sm font-bold text-white">Image / Marker-Based AR</h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Print or display this marker pattern. When scanned with an AR camera, your 3D SmartAgri models and interactive pins anchor precisely to this barcode surface.
                </p>
              </div>

              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow"
              >
                <Download className="w-4 h-4" /> Print / Save Marker Sheet
              </button>
            </div>
          )}

          {activeTab === "export" && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#242429] p-4 rounded-xl border border-white/5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-[#22a447]/10 text-[#22a447] rounded-xl">
                    <Layers className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white">Universal 3D / AR Asset (.GLB)</h4>
                    <p className="text-xs text-gray-400">
                      Standard glTF 2.0 binary package compatible with WebXR, Google SceneViewer, Unity, Unreal Engine, and Blender.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-2 bg-[#121214] p-3 rounded-lg text-center text-xs">
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Total Objects</span>
                    <span className="font-bold text-white text-sm">{getObjects().length}</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">Format</span>
                    <span className="font-bold text-emerald-400 text-sm">GLB / glTF 2.0</span>
                  </div>
                  <div>
                    <span className="text-gray-500 block text-[10px] uppercase font-bold">PBR Materials</span>
                    <span className="font-bold text-blue-400 text-sm">Included</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDownloadGLB}
                disabled={isExporting}
                className="w-full py-3 bg-[#22a447] hover:bg-[#198b3a] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-[#22a447]/20 transition-all"
              >
                {isExporting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Exporting GLB Package...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" /> Download Scene as .GLB
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 border-t border-white/10 bg-[#121214] flex items-center justify-between text-[11px] text-gray-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#22a447]" />
            <span>Works seamlessly on iOS (Safari) & Android (Chrome).</span>
          </div>
          <span className="font-mono text-gray-400">SmartAgriXR Engine v1.0</span>
        </div>
      </div>
    </div>
  );
}
