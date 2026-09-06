"use client";

import { useEditorStore } from "../store/useEditorStore";
import { Info, X } from "lucide-react";

export function AnnotationOverlay() {
  const { activeInfoDialog, setActiveInfoDialog } = useEditorStore();

  if (!activeInfoDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-sm bg-[#161619] border border-zinc-700 rounded-2xl shadow-2xl overflow-hidden text-white p-5">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="bouncy-hover absolute top-3.5 right-3.5 p-1.5 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
              {activeInfoDialog.title}
            </h3>
            <span className="text-[10px] text-emerald-400 font-bold bg-emerald-500/15 px-2 py-0.5 rounded-full border border-emerald-500/30">
              Informasi Agrikultur
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#1e1e23] p-3.5 rounded-xl border border-zinc-800 text-xs text-zinc-300 leading-relaxed max-h-56 overflow-y-auto font-medium">
          {activeInfoDialog.content}
        </div>

        {/* Action button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="bouncy-hover mt-4 w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}


