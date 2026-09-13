"use client";

import { useEditorStore } from "../store/useEditorStore";
import { 
  Home, 
  Box, 
  Sprout, 
  Image as ImageIcon, 
  Type, 
  SunMedium, 
  Video, 
  Music,
  Cloud,
  Wand2
} from "lucide-react";
import Link from "next/link";

export function LeftToolbar() {
  const { activeLeftTab, setActiveLeftTab } = useEditorStore();

  const menuItems = [
    { id: "storage", label: "Cloud & Files", icon: Cloud },
    { id: "text2model", label: "Text to 3D", icon: Wand2 },
    { id: "agri", label: "Smart Agri", icon: Sprout },
    { id: "objects", label: "3D Shapes", icon: Box },
    { id: "text", label: "3D Text", icon: Type },
    { id: "images", label: "Images", icon: ImageIcon },
    { id: "environment", label: "Lighting", icon: SunMedium },
    { id: "video", label: "Video", icon: Video },
    { id: "audio", label: "Audio", icon: Music },
  ] as const;

  return (
    <div className="w-16 bg-[#161619] border-r border-[#27272a] flex flex-col items-center py-3 justify-between select-none z-20 shadow-xl font-sans">
      {/* Top logo/home button */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl bg-emerald-500 hover:bg-emerald-400 flex items-center justify-center text-zinc-950 shadow-sm hover:scale-105 active:scale-95 transition-all font-bold"
        title="Kembali ke Beranda"
      >
        <Home className="w-5 h-5 stroke-[2.5]" />
      </Link>

      {/* Middle tools with solid green / yellow highlights */}
      <div className="flex flex-col gap-2 w-full px-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeLeftTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveLeftTab(item.id)}
              className={`group w-full h-11 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer border ${
                isActive 
                  ? "bg-emerald-500 border-emerald-400 text-zinc-950 font-bold shadow-sm"
                  : "border-transparent text-zinc-400 hover:bg-[#202024] hover:text-emerald-400 hover:scale-105 active:scale-95"
              }`}
              title={item.label}
            >
              <Icon className="w-4 h-4 transition-colors" />
              <span className="text-[8px] font-bold tracking-tight uppercase">
                {item.id === "text2model" ? "AI 3D" : item.id.slice(0, 5)}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bottom live engine indicator */}
      <div className="flex flex-col items-center gap-1" title="SmartAgri Engine Active">
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-4 ring-emerald-500/20 animate-pulse" />
      </div>
    </div>
  );
}



