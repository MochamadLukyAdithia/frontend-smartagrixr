"use client";

import { useEditorStore } from "../store/useEditorStore";
import { Info, X, Sparkles } from "lucide-react";

export function AnnotationOverlay() {
  const { activeInfoDialog, setActiveInfoDialog } = useEditorStore();

  if (!activeInfoDialog) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in zoom-in-95 duration-150">
      <div className="relative w-full max-w-md bg-[#1c1c20] border border-[#22a447]/30 rounded-2xl shadow-2xl overflow-hidden text-white p-6">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[#22a447]/20 border border-[#22a447]/40 flex items-center justify-center text-[#22a447]">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">
              {activeInfoDialog.title}
            </h3>
            <span className="text-[10px] text-[#22a447] font-semibold uppercase tracking-wider">
              Smart Agriculture Node
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="bg-[#141416] p-4 rounded-xl border border-white/5 text-xs text-gray-300 leading-relaxed max-h-60 overflow-y-auto">
          {activeInfoDialog.content}
        </div>

        {/* Action button */}
        <button
          onClick={() => setActiveInfoDialog(null)}
          className="mt-4 w-full py-2.5 bg-[#22a447] hover:bg-[#198b3a] text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
