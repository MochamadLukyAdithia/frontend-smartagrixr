"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
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
  Camera
} from "lucide-react";

export function Toolbar() {
  const { 
    gizmoMode, 
    snapping, 
    gridSettings, 
    axisVisible,
    isPreviewMode,
    isARModalOpen,
    setIsARModalOpen,
    setGizmoMode, 
    setSnapping, 
    setGridSettings, 
    setAxisVisible,
    setIsPreviewMode
  } = useEditorStore();

  const editor = useEditorInstance();

  const handleGizmoModeChange = (mode: "translate" | "rotate" | "scale" | "none") => {
    setGizmoMode(mode);
    const ed = getEditorInstance();
    if (ed) {
      ed.transformManager.setMode(mode);
    }
  };

  const toggleGrid = () => {
    const nextVisible = !gridSettings.visible;
    setGridSettings({ visible: nextVisible });
    const ed = getEditorInstance();
    if (ed) {
      ed.sceneManager.updateGrid();
    }
  };

  const toggleAxis = () => {
    const nextVisible = !axisVisible;
    setAxisVisible(nextVisible);
    const ed = getEditorInstance();
    if (ed) {
      ed.sceneManager.updateAxis();
    }
  };

  const handleUndo = () => {
    const ed = getEditorInstance();
    if (ed) ed.historyManager.undo();
  };

  const handleRedo = () => {
    const ed = getEditorInstance();
    if (ed) ed.historyManager.redo();
  };


  const [activeAngle, setActiveAngle] = useState<"perspective" | "top" | "front" | "right">("perspective");

  const handleSetViewportAngle = (mode: "perspective" | "top" | "front" | "right") => {
    setActiveAngle(mode);
    if (editor) {
      editor.cameraManager.setViewportMode(mode);
    }
  };

  return (
    <div className="h-12 bg-[#121214] border-b border-[#242427] px-4 flex items-center justify-between text-white select-none z-20">
      {/* Left: Clean Logo and Project Name */}
      <div className="flex items-center gap-2.5">
        <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
        <span className="font-semibold text-sm tracking-tight text-zinc-100">
          SmartAgriXR
        </span>
        <span className="text-[10px] text-zinc-500 font-mono">
          Editor
        </span>
      </div>

      {/* Middle: Transform and Snapping Settings (Only if not in Preview Mode) */}
      {!isPreviewMode && (
        <div className="flex items-center gap-2 bg-[#1a1a1d] px-2 py-1 rounded-lg border border-zinc-800">
          <div className="flex items-center gap-0.5 text-xs text-zinc-400 font-medium">
            <button
              onClick={() => handleGizmoModeChange("translate")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${gizmoMode === "translate" ? "bg-zinc-700 text-white" : "hover:text-zinc-200"}`}
            >
              Move
            </button>
            <button
              onClick={() => handleGizmoModeChange("rotate")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${gizmoMode === "rotate" ? "bg-zinc-700 text-white" : "hover:text-zinc-200"}`}
            >
              Rotate
            </button>
            <button
              onClick={() => handleGizmoModeChange("scale")}
              className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${gizmoMode === "scale" ? "bg-zinc-700 text-white" : "hover:text-zinc-200"}`}
            >
              Scale
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          {/* Camera View Angle Selector */}
          <div className="flex items-center gap-0.5 text-[10.5px] font-medium text-zinc-400">
            <button
              onClick={() => handleSetViewportAngle("perspective")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeAngle === "perspective" ? "bg-zinc-700 text-white font-semibold" : "hover:text-zinc-200"
              }`}
              title="3D Free Orbit Perspective View"
            >
              3D
            </button>
            <button
              onClick={() => handleSetViewportAngle("top")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeAngle === "top" ? "bg-zinc-700 text-white font-semibold" : "hover:text-zinc-200"
              }`}
              title="2D Top Orthographic View"
            >
              Top
            </button>
            <button
              onClick={() => handleSetViewportAngle("front")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeAngle === "front" ? "bg-zinc-700 text-white font-semibold" : "hover:text-zinc-200"
              }`}
              title="2D Front Orthographic View"
            >
              Front
            </button>
            <button
              onClick={() => handleSetViewportAngle("right")}
              className={`px-2 py-0.5 rounded transition-colors cursor-pointer ${
                activeAngle === "right" ? "bg-zinc-700 text-white font-semibold" : "hover:text-zinc-200"
              }`}
              title="2D Right Orthographic View"
            >
              Right
            </button>
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

        {/* Convert to AR Modal Button */}
        <button
          onClick={() => setIsARModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors cursor-pointer"
        >
          <QrCode className="w-3.5 h-3.5" />
          <span>Launch AR</span>
        </button>

        {/* Preview toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer border ${
            isPreviewMode 
              ? "bg-amber-600/20 border-amber-500/50 text-amber-300" 
              : "bg-zinc-800 border-zinc-700/60 hover:bg-zinc-700 text-zinc-300"
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

