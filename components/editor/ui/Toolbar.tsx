"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  Undo, 
  Redo, 
  Eye, 
  EyeOff, 
  QrCode, 
  Grid, 
  Sparkles,
  Move,
  RotateCw,
  Maximize2,
  Sprout
} from "lucide-react";

export function Toolbar() {
  const { 
    gizmoMode, 
    gridSettings, 
    axisVisible,
    isPreviewMode,
    setIsARModalOpen,
    setGizmoMode, 
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
    <div className="h-14 bg-[#161619] border-b border-[#27272a] px-4 flex items-center justify-between text-white select-none z-20 shadow-sm font-sans">
      {/* Left: Brand / Studio Badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-500 flex items-center justify-center text-zinc-950 font-black text-sm shadow-sm">
          <Sprout className="w-5 h-5 text-zinc-950 stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-emerald-400">
            SmartAgri Studio
          </span>
          <span className="text-[10px] text-zinc-400 font-medium">
            3D & XR Workspace
          </span>
        </div>
      </div>

      {/* Middle: Transform and Snapping Settings (Only if not in Preview Mode) */}
      {!isPreviewMode && (
        <div className="flex items-center gap-2 bg-[#1f1f24] px-2.5 py-1.5 rounded-xl border border-zinc-700/60 shadow-inner">
          {/* Gizmo transform modes */}
          <div className="flex items-center gap-1 text-xs font-semibold">
            {[
              { id: "translate", label: "Move", icon: Move },
              { id: "rotate", label: "Rotate", icon: RotateCw },
              { id: "scale", label: "Scale", icon: Maximize2 },
            ].map((m) => {
              const Icon = m.icon;
              const isSelected = gizmoMode === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => handleGizmoModeChange(m.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    isSelected 
                      ? "bg-emerald-500 text-zinc-950 font-bold shadow-md scale-100" 
                      : "text-zinc-300 hover:bg-zinc-800 hover:text-white"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-zinc-700" />

          {/* Camera View Angle Selector */}
          <div className="flex items-center gap-1 text-xs font-medium text-zinc-400">
            {(["perspective", "top", "front", "right"] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => handleSetViewportAngle(angle)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  activeAngle === angle 
                    ? "bg-zinc-700 text-emerald-300 font-bold border border-emerald-500/40" 
                    : "hover:bg-zinc-800 hover:text-zinc-200"
                }`}
                title={`${angle} View`}
              >
                {angle === "perspective" ? "3D" : angle}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Right: Actions, Launch AR, Preview Mode */}
      <div className="flex items-center gap-2">
        {!isPreviewMode && (
          <div className="flex items-center gap-1 bg-[#1f1f24] p-1 rounded-xl border border-zinc-800">
            <button
              onClick={handleUndo}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={toggleGrid}
              className={`p-1.5 rounded-lg transition-colors ${
                gridSettings.visible 
                  ? "text-emerald-400 bg-emerald-500/10" 
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Launch AR Modal Button */}
        <button
          onClick={() => setIsARModalOpen(true)}
          className="bouncy-hover flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-zinc-950" />
          <span>Launch AR</span>
        </button>

        {/* Preview mode toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isPreviewMode 
              ? "bg-amber-500 text-zinc-950 font-bold border-amber-400 shadow-sm" 
              : "bg-[#1f1f24] border-zinc-700/80 hover:bg-zinc-800 text-zinc-200"
          }`}
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-4 h-4 text-zinc-950" />
              <span>Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-emerald-400" />
              <span>Preview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



