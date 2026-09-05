"use client";

import { useEditorStore } from "../store/useEditorStore";
import { Info, X } from "lucide-react";

export function AnnotationOverlay() {
  const { activeInfoDialog, setActiveInfoDialog } = useEditorStore();

  if (!activeInfoDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 select-none animate-in fade-in duration-100">
      <div className="relative w-full max-w-sm bg-[#18181b] border border-zinc-800 rounded-lg shadow-2xl overflow-hidden text-white p-5">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="absolute top-3.5 right-3.5 p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-7 h-7 rounded bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-emerald-400">
            <Info className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-100 tracking-tight">
              {activeInfoDialog.title}
            </h3>
            <span className="text-[10px] text-zinc-400 font-mono">
              Node Info
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#111113] p-3 rounded border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-56 overflow-y-auto">
          {activeInfoDialog.content}
        </div>

        {/* Action button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="mt-3.5 w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
}
