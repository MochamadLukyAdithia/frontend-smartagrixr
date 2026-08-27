"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { 
  Engine, 
  Scene, 
  ArcRotateCamera, 
  Vector3, 
  Color3, 
  Color4, 
  DirectionalLight, 
  HemisphericLight,
  PointerEventTypes,
  AbstractMesh
} from "@babylonjs/core";
import { ObjectManager } from "@/components/editor/engine/ObjectManager";
import { EditorEngine } from "@/components/editor/engine/EditorEngine";
import { 
  Smartphone, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Info, 
  Maximize2, 
  Compass, 
  ExternalLink,
  ChevronLeft,
  X
} from "lucide-react";
import Link from "next/link";

function ARViewerContent() {
  const searchParams = useSearchParams();
  const sceneId = searchParams.get("id") || "demo";

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [sceneData, setSceneData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeInfo, setActiveInfo] = useState<{ title: string; content: string } | null>(null);
  const [isARSupported, setIsARSupported] = useState(false);
  const [arActive, setArActive] = useState(false);
  const [engineRef, setEngineRef] = useState<EditorEngine | null>(null);

  // Fetch scene data from API
  useEffect(() => {
    const fetchScene = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/ar?id=${sceneId}`);
        const json = await res.json();
        if (json.success) {
          setSceneData(json);
        }
      } catch (err) {
        console.error("Failed to load AR scene", err);
      } finally {
        setLoading(false);
      }
    };

    fetchScene();
  }, [sceneId]);

  // Check WebXR AR support
  useEffect(() => {
    if (typeof navigator !== "undefined" && "xr" in navigator) {
      (navigator as any).xr.isSessionSupported("immersive-ar")
        .then((supported: boolean) => setIsARSupported(supported))
        .catch(() => setIsARSupported(false));
    }
  }, []);

  // Initialize Babylon.js 3D Viewport
  useEffect(() => {
    if (!canvasRef.current || !sceneData) return;

    const editorEngine = new EditorEngine(canvasRef.current);
    setEngineRef(editorEngine);

    // Set background color
    const bgColor = sceneData.environment?.bgColor || "#1e293b";
    const c = Color3.FromHexString(bgColor);
    editorEngine.scene.clearColor = new Color4(c.r, c.g, c.b, 1.0);

    // Build scene objects
    if (sceneData.objects && Array.isArray(sceneData.objects)) {
      sceneData.objects.forEach((obj: any) => {
        if (obj.type === "primitive" && obj.primitiveType) {
          editorEngine.objectManager.createPrimitive(obj.primitiveType, obj.name);
        } else if (obj.type === "agri" && obj.agriType) {
          editorEngine.objectManager.createAgriPreset(obj.agriType, obj.name);
        } else if (obj.type === "text" && obj.textConfig) {
          editorEngine.objectManager.createText(obj.textConfig.text, obj.textConfig.color, obj.textConfig.size);
        }
      });
    }

    // Interactive pointer click handler
    const pointerObserver = editorEngine.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERUP) {
        const pickResult = pointerInfo.pickInfo;
        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
          const mesh = pickResult.pickedMesh;
          // Find corresponding object
          const matchingObj = sceneData.objects?.find((o: any) => mesh.name.includes(o.id) || o.name === mesh.name);
          if (matchingObj) {
            setActiveInfo({
              title: matchingObj.name,
              content: matchingObj.description || `Interactive Smart Agriculture 3D module: ${matchingObj.name}. Real-time monitoring enabled.`,
            });
          }
        }
      }
    });

    // Start render loop
    editorEngine.engine.runRenderLoop(() => {
      editorEngine.scene.render();
    });

    const handleResize = () => editorEngine.engine.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      editorEngine.scene.onPointerObservable.remove(pointerObserver);
      window.removeEventListener("resize", handleResize);
      editorEngine.dispose();
    };
  }, [sceneData]);

  const handleStartAR = async () => {
    if (!engineRef) return;
    try {
      setArActive(true);
      const success = await engineRef.arManager.startWebXR();
      if (!success) {
        alert("WebXR AR session could not be started directly on this device. You can explore the 3D model with touch gestures!");
        setArActive(false);
      }
    } catch {
      setArActive(false);
    }
  };

  return (
    <div className="relative w-screen h-screen bg-[#0f172a] text-white flex flex-col select-none overflow-hidden font-sans">
      {/* Top Mobile Bar */}
      <div className="absolute top-0 left-0 right-0 z-30 p-4 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent pointer-events-auto">
        <Link
          href="/editor"
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full text-xs font-bold text-white transition-all shadow-md"
        >
          <ChevronLeft className="w-4 h-4" /> Editor
        </Link>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> SmartAgri XR
          </span>
        </div>
      </div>

      {/* 3D Canvas */}
      <div className="relative flex-1 w-full h-full">
        <canvas ref={canvasRef} className="w-full h-full outline-none block touch-none" />

        {/* Loading overlay */}
        {loading && (
          <div className="absolute inset-0 bg-[#0f172a] flex flex-col items-center justify-center gap-3 z-40">
            <div className="w-10 h-10 border-4 border-[#22a447] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-gray-300">Loading 3D Agri Scene...</span>
          </div>
        )}

        {/* Interaction Hint */}
        {!loading && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full text-[11px] text-gray-200 border border-white/10 shadow-lg pointer-events-none text-center">
            👆 Touch & drag to orbit • Pinch to zoom • Tap objects for info
          </div>
        )}
      </div>

      {/* Bottom AR Launcher Floating Action Bar */}
      <div className="absolute bottom-6 left-0 right-0 z-30 px-6 flex flex-col items-center gap-3 pointer-events-none">
        <div className="w-full max-w-sm flex items-center gap-3 pointer-events-auto">
          {/* Main AR Trigger Button */}
          <button
            onClick={handleStartAR}
            className="flex-1 py-3.5 bg-gradient-to-r from-[#22a447] to-emerald-500 hover:from-[#198b3a] hover:to-emerald-600 text-white rounded-2xl font-bold text-sm shadow-xl shadow-[#22a447]/30 flex items-center justify-center gap-2 transition-all active:scale-98 cursor-pointer"
          >
            <Smartphone className="w-5 h-5" /> View in Real Space (AR)
          </button>
        </div>

        <span className="text-[10px] text-gray-400 font-medium">
          Powered by SmartAgriXR WebXR 3D Engine
        </span>
      </div>

      {/* Info Dialog Popup on object click */}
      {activeInfo && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none animate-in fade-in zoom-in-95 duration-150 pointer-events-auto">
          <div className="relative w-full max-w-sm bg-[#1e293b] border border-emerald-500/30 rounded-2xl shadow-2xl p-5 text-white">
            <button
              onClick={() => setActiveInfo(null)}
              className="absolute top-3.5 right-3.5 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold">{activeInfo.title}</h3>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed bg-[#0f172a] p-3 rounded-xl border border-white/5">
              {activeInfo.content}
            </p>

            <button
              onClick={() => setActiveInfo(null)}
              className="mt-4 w-full py-2 bg-[#22a447] text-white text-xs font-bold rounded-xl shadow"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ARViewerPage() {
  return (
    <Suspense fallback={<div className="w-screen h-screen bg-[#0f172a] flex items-center justify-center text-white text-sm">Loading SmartAgri AR...</div>}>
      <ARViewerContent />
    </Suspense>
  );
}
