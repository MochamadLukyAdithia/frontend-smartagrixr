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
  FolderOpen,
  Wand2
} from "lucide-react";
import Link from "next/link";

export function LeftToolbar() {
  const { activeLeftTab, setActiveLeftTab } = useEditorStore();

  const menuItems = [
    { id: "storage", label: "Cloud & Browse Assets", icon: <Cloud className="w-5 h-5" /> },
    { id: "text2model", label: "Text to 3D (Tripo3D)", icon: <Wand2 className="w-5 h-5" /> },
    { id: "agri", label: "Smart Agri", icon: <Sprout className="w-5 h-5" /> },
    { id: "objects", label: "3D Primitives", icon: <Box className="w-5 h-5" /> },
    { id: "text", label: "3D Text", icon: <Type className="w-5 h-5" /> },
    { id: "images", label: "Images", icon: <ImageIcon className="w-5 h-5" /> },
    { id: "environment", label: "Environment", icon: <SunMedium className="w-5 h-5" /> },
    { id: "video", label: "Video", icon: <Video className="w-5 h-5" /> },
    { id: "audio", label: "Audio", icon: <Music className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="w-14 bg-[#121214] border-r border-[#242427] flex flex-col items-center py-2.5 justify-between select-none z-20">
      {/* Top logo/home */}
      <Link
        href="/"
        className="w-9 h-9 rounded-lg bg-zinc-800/80 border border-zinc-700/60 flex items-center justify-center text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors"
        title="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {/* Middle tabs */}
      <div className="flex flex-col gap-1.5 w-full px-1.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveLeftTab(item.id)}
            className={`w-full h-11 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-colors cursor-pointer ${
              activeLeftTab === item.id 
                ? "bg-zinc-800 text-emerald-400 border border-zinc-700" 
                : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
            }`}
            title={item.label}
          >
            {item.icon}
            <span className="text-[7.5px] font-medium tracking-tight uppercase">{item.id.slice(0, 5)}</span>
          </button>
        ))}
      </div>

      {/* Bottom subtle status dot */}
      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 mb-1" title="Engine Active" />
    </div>
  );
}

