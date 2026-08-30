"use client";

import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { 
  Undo, 
  Redo, 
  Download, 
  Eye, 
  EyeOff, 
  QrCode, 
  Smartphone, 
  Compass, 
  Grid, 
  Magnet,
  Camera,
  Sparkles
} from "lucide-react";

export function Toolbar() {
  const { 
    gizmoMode, 
    gizmoSpace, 
    snapping, 
    gridSettings, 
    axisVisible,
    isPreviewMode,
    isARModalOpen,
    setIsARModalOpen,
    setGizmoMode, 
    setGizmoSpace, 
    setSnapping, 
    setGridSettings, 
    setAxisVisible,
    setIsPreviewMode
  } = useEditorStore();

  const editor = getEditorInstance();

  const handleGizmoModeChange = (mode: "translate" | "rotate" | "scale" | "none") => {
    setGizmoMode(mode);
    if (editor) {
      editor.transformManager.setMode(mode);
    }
  };

  const handleGizmoSpaceToggle = () => {
    const nextSpace = gizmoSpace === "world" ? "local" : "world";
    setGizmoSpace(nextSpace);
    if (editor) {
      editor.transformManager.setSpace(nextSpace);
    }
  };

  const toggleGrid = () => {
    const nextVisible = !gridSettings.visible;
    setGridSettings({ visible: nextVisible });
    if (editor) {
      editor.sceneManager.updateGrid();
    }
  };

  const toggleAxis = () => {
    const nextVisible = !axisVisible;
    setAxisVisible(nextVisible);
    if (editor) {
      editor.sceneManager.updateAxis();
    }
  };

  const handleUndo = () => {
    if (editor) editor.historyManager.undo();
  };

  const handleRedo = () => {
    if (editor) editor.historyManager.redo();
  };

  const handleSetViewportAngle = (mode: "perspective" | "top" | "front" | "right") => {
    if (editor) {
      editor.cameraManager.setViewportMode(mode);
    }
  };

  return (
    <div className="h-14 bg-[#161618] border-b border-[#2d2d30] px-4 flex items-center justify-between text-white select-none z-20">
      {/* Left: Logo and Project Name */}
      <div className="flex items-center gap-3">
        <span className="font-sans font-black text-lg tracking-tight bg-gradient-to-r from-[#22a447] via-emerald-400 to-teal-300 bg-clip-text text-transparent flex items-center gap-1.5">
          <Sparkles className="w-5 h-5 text-[#22a447]" /> SmartAgriXR
        </span>
        <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/30 rounded-full uppercase tracking-wider">
          3D & AR Engine
        </span>
      </div>

      {/* Middle: Transform and Snapping Settings (Only if not in Preview Mode) */}
      {!isPreviewMode && (
        <div className="flex items-center gap-3 bg-[#242429] px-3 py-1 rounded-full border border-white/5 shadow-inner">
          <div className="flex items-center gap-1 text-xs text-gray-400 font-bold">
            <button
              onClick={() => handleGizmoModeChange("translate")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${gizmoMode === "translate" ? "bg-[#22a447] text-white shadow-md" : "hover:text-white"}`}
            >
              Move
            </button>
            <button
              onClick={() => handleGizmoModeChange("rotate")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${gizmoMode === "rotate" ? "bg-[#22a447] text-white shadow-md" : "hover:text-white"}`}
            >
              Rotate
            </button>
            <button
              onClick={() => handleGizmoModeChange("scale")}
              className={`px-3 py-1 rounded-full transition-all cursor-pointer ${gizmoMode === "scale" ? "bg-[#22a447] text-white shadow-md" : "hover:text-white"}`}
            >
              Scale
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Local vs World Coordinate Space */}
          <button
            onClick={handleGizmoSpaceToggle}
            className="text-[10px] uppercase font-bold text-gray-400 hover:text-white px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
            title="Toggle Local / World space"
          >
            {gizmoSpace}
          </button>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Camera View Angle Selector */}
          <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
            <button onClick={() => handleSetViewportAngle("perspective")} className="px-1.5 py-0.5 hover:text-white" title="Perspective">3D</button>
            <button onClick={() => handleSetViewportAngle("top")} className="px-1.5 py-0.5 hover:text-white" title="Top View">Top</button>
            <button onClick={() => handleSetViewportAngle("front")} className="px-1.5 py-0.5 hover:text-white" title="Front View">Front</button>
            <button onClick={() => handleSetViewportAngle("right")} className="px-1.5 py-0.5 hover:text-white" title="Right View">Right</button>
          </div>
        </div>
      )}

      {/* Right: Actions, AR Barcode, Preview & Publish */}
      <div className="flex items-center gap-2.5">
        {!isPreviewMode && (
          <>
            <button
              onClick={handleUndo}
              className="p-2 hover:bg-[#252528] rounded-full text-gray-400 hover:text-white transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              className="p-2 hover:bg-[#252528] rounded-full text-gray-400 hover:text-white transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={toggleGrid}
              className={`p-2 rounded-full transition-colors ${gridSettings.visible ? "text-[#22a447] bg-[#22a447]/10" : "text-gray-400 hover:text-white"}`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
          </>
        )}

        <div className="h-5 w-[1px] bg-white/10 mx-0.5" />

        {/* 🚀 Convert to AR Barcode / QR Code Modal Button */}
        <button
          onClick={() => setIsARModalOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-[#22a447] hover:from-emerald-500 hover:to-green-500 text-white rounded-full text-xs font-bold transition-all shadow-lg shadow-[#22a447]/20 cursor-pointer animate-pulse hover:animate-none"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Convert to AR</span>
        </button>

        {/* Preview toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow cursor-pointer ${
            isPreviewMode 
              ? "bg-amber-500 hover:bg-amber-600 text-white" 
              : "bg-[#252528] hover:bg-[#323236] text-gray-200"
          }`}
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-3.5 h-3.5" /> Exit Preview
            </>
          ) : (
            <>
              <Eye className="w-3.5 h-3.5" /> Preview
            </>
          )}
        </button>
      </div>
    </div>
  );
}

