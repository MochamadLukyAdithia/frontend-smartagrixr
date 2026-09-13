"use client";

import { useEditorStore } from "../store/useEditorStore";
import { Info, X } from "lucide-react";

export function AnnotationOverlay() {
  const { activeInfoDialog, setActiveInfoDialog } = useEditorStore();

  if (!activeInfoDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 select-none animate-in fade-in duration-150 font-sans">
      <div className="relative w-full max-w-sm bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden text-slate-800 p-5">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="bouncy-hover absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-3.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-700 shadow-xs">
            <Info className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              {activeInfoDialog.title}
            </h3>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300/60">
              Informasi Agrikultur
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed max-h-56 overflow-y-auto font-medium">
          {activeInfoDialog.content}
        </div>

        {/* Action button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="bouncy-hover mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          Tutup
        </button>
      </div>
    </div>
  );
}


