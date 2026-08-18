"use client";

import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { 
  Undo, Redo, Download, Eye, EyeOff, Save, Play, Square, Compass
} from "lucide-react";

export function Toolbar() {
  const { 
    gizmoMode, 
    gizmoSpace, 
    snapping, 
    gridSettings, 
    axisVisible,
    isPreviewMode,
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

  const handleExport = () => {
    if (editor) {
      editor.exportManager.exportToGLB("smartagri-project");
    }
  };

  return (
    <div className="h-14 bg-[#1a1a1a] border-b border-[#2d2d2d] px-4 flex items-center justify-between text-white select-none z-20">
      {/* Left: Logo and Project Name */}
      <div className="flex items-center gap-3">
        <span className="font-serif font-bold text-lg text-[#22a447] tracking-tight bg-gradient-to-r from-[#22a447] to-emerald-400 bg-clip-text text-transparent">
          SmartAgriXR
        </span>
        <span className="text-xs text-gray-500 font-bold px-2 py-0.5 bg-[#252525] rounded uppercase tracking-wider">
          Assemblr
        </span>
      </div>

      {/* Middle: Transform and Snapping Settings (Only if not in Preview Mode) */}
      {!isPreviewMode && (
        <div className="flex items-center gap-4 bg-[#252525] px-3 py-1 rounded-full border border-white/5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <button
              onClick={() => handleGizmoModeChange("translate")}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${gizmoMode === "translate" ? "bg-[#22a447] text-white shadow" : "hover:text-white"}`}
            >
              Move
            </button>
            <button
              onClick={() => handleGizmoModeChange("rotate")}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${gizmoMode === "rotate" ? "bg-[#22a447] text-white shadow" : "hover:text-white"}`}
            >
              Rotate
            </button>
            <button
              onClick={() => handleGizmoModeChange("scale")}
              className={`px-2.5 py-1 rounded-full font-bold transition-all ${gizmoMode === "scale" ? "bg-[#22a447] text-white shadow" : "hover:text-white"}`}
            >
              Scale
            </button>
          </div>

          <div className="h-4 w-[1px] bg-white/10" />

          <button
            onClick={handleGizmoSpaceToggle}
            className="text-[10px] uppercase font-bold text-gray-400 hover:text-white"
          >
            {gizmoSpace}
          </button>
        </div>
      )}

      {/* Right: Actions, Preview & Publish */}
      <div className="flex items-center gap-3">
        {!isPreviewMode && (
          <>
            <button
              onClick={handleUndo}
              className="p-2 hover:bg-[#252525] rounded-full text-gray-400 hover:text-white"
              title="Undo"
            >
              <Undo className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              className="p-2 hover:bg-[#252525] rounded-full text-gray-400 hover:text-white"
              title="Redo"
            >
              <Redo className="w-4 h-4" />
            </button>
            <button
              onClick={toggleGrid}
              className={`px-2.5 py-1 rounded text-xs font-bold ${gridSettings.visible ? "bg-blue-600/20 text-blue-400 border border-blue-600/30" : "text-gray-400 hover:text-white"}`}
              title="Toggle Grid"
            >
              Grid
            </button>
          </>
        )}

        <div className="h-5 w-[1px] bg-white/10 mx-1" />

        {/* Preview toggle */}
        <button
          onClick={() => setIsPreviewMode(!isPreviewMode)}
          className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold transition-all shadow ${
            isPreviewMode 
              ? "bg-amber-500 hover:bg-amber-600 text-white" 
              : "bg-[#252525] hover:bg-[#333] text-gray-200"
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

        {!isPreviewMode && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-bold transition-all shadow"
          >
            Publish
          </button>
        )}
      </div>
    </div>
  );
}
