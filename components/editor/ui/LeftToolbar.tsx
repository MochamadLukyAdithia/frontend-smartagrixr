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
  Sliders
} from "lucide-react";
import Link from "next/link";

export function LeftToolbar() {
  const { activeLeftTab, setActiveLeftTab } = useEditorStore();

  const menuItems = [
    { id: "agri", label: "Smart Agri", icon: <Sprout className="w-5 h-5" /> },
    { id: "objects", label: "3D Primitives", icon: <Box className="w-5 h-5" /> },
    { id: "text", label: "3D Text", icon: <Type className="w-5 h-5" /> },
    { id: "images", label: "Images", icon: <ImageIcon className="w-5 h-5" /> },
    { id: "environment", label: "Environment", icon: <SunMedium className="w-5 h-5" /> },
    { id: "video", label: "Video", icon: <Video className="w-5 h-5" /> },
    { id: "audio", label: "Audio", icon: <Music className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="w-16 bg-[#161618] border-r border-[#2d2d30] flex flex-col items-center py-3 justify-between select-none z-20">
      {/* Top logo/home */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22a447] to-emerald-400 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
        title="SmartAgriXR Home"
      >
        <Home className="w-5 h-5" />
      </Link>

      {/* Middle tabs */}
      <div className="flex flex-col gap-2.5">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveLeftTab(item.id)}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all cursor-pointer ${
              activeLeftTab === item.id 
                ? "bg-[#22a447] text-white shadow-lg shadow-[#22a447]/30 scale-105" 
                : "text-gray-400 hover:bg-[#252528] hover:text-white"
            }`}
            title={item.label}
          >
            {item.icon}
            <span className="text-[8px] font-bold uppercase tracking-tight">{item.id.slice(0, 5)}</span>
          </button>
        ))}
      </div>

      {/* Bottom version badge */}
      <div className="text-[10px] font-mono text-emerald-500/60 font-bold">
        XR 1.0
      </div>
    </div>
  );
}

