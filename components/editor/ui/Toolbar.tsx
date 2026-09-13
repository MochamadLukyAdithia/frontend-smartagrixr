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
    <div className="h-14 bg-white border-b border-slate-200 px-4 flex items-center justify-between text-slate-800 select-none z-20 shadow-sm font-sans">
      {/* Left: Brand / Studio Badge */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-sm">
          <Sprout className="w-5 h-5 text-white stroke-[2.5]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-sm tracking-tight text-emerald-700">
            SmartAgri Studio
          </span>
          <span className="text-[10px] text-slate-500 font-medium">
            3D & XR Workspace
          </span>
        </div>
      </div>

      {/* Middle: Transform and Snapping Settings (Only if not in Preview Mode) */}
      {!isPreviewMode && (
        <div className="flex items-center gap-2 bg-slate-100 px-2 py-1.5 rounded-xl border border-slate-200 shadow-xs">
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
                      ? "bg-white text-emerald-700 font-bold shadow-xs border border-emerald-500/30 scale-100" 
                      : "text-slate-600 hover:bg-slate-200/70 hover:text-slate-900"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-[1px] bg-slate-300" />

          {/* Camera View Angle Selector */}
          <div className="flex items-center gap-1 text-xs font-medium text-slate-500">
            {(["perspective", "top", "front", "right"] as const).map((angle) => (
              <button
                key={angle}
                onClick={() => handleSetViewportAngle(angle)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  activeAngle === angle 
                    ? "bg-white text-emerald-700 font-bold border border-slate-300 shadow-xs" 
                    : "hover:bg-slate-200/70 hover:text-slate-800"
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
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={handleUndo}
              className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              className="p-1.5 hover:bg-slate-200/80 rounded-lg text-slate-600 hover:text-emerald-700 transition-colors cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={toggleGrid}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                gridSettings.visible 
                  ? "text-emerald-700 bg-emerald-100 border border-emerald-300/40" 
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/80"
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
          className="bouncy-hover flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition-all shadow-sm cursor-pointer"
        >
          <QrCode className="w-4 h-4 text-white" />
          <span>Launch AR</span>
        </button>

        {/* Preview mode toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
            isPreviewMode 
              ? "bg-amber-500 text-white font-bold border-amber-600 shadow-sm" 
              : "bg-slate-100 border-slate-200 hover:bg-slate-200 text-slate-700"
          }`}
        >
          {isPreviewMode ? (
            <>
              <EyeOff className="w-4 h-4 text-white" />
              <span>Exit Preview</span>
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 text-emerald-600" />
              <span>Preview</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}



