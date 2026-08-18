"use client";

import { useEditorStore } from "../store/useEditorStore";
import { 
  Home, Box, Image as ImageIcon, Type, Video, Music
} from "lucide-react";
import Link from "next/link";

export function LeftToolbar() {
  const { activeLeftTab, setActiveLeftTab } = useEditorStore();

  const menuItems = [
    { id: "objects", label: "3D Objects", icon: <Box className="w-5 h-5" /> },
    { id: "images", label: "Images", icon: <ImageIcon className="w-5 h-5" /> },
    { id: "text", label: "Text", icon: <Type className="w-5 h-5" /> },
    { id: "video", label: "Video", icon: <Video className="w-5 h-5" /> },
    { id: "audio", label: "Audio", icon: <Music className="w-5 h-5" /> },
  ] as const;

  return (
    <div className="w-16 bg-[#1a1a1a] border-r border-[#2d2d2d] flex flex-col items-center py-4 justify-between select-none">
      {/* Top logo/home */}
      <Link
        href="/"
        className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#22a447] to-emerald-400 flex items-center justify-center text-white shadow-md hover:scale-105 transition-transform"
        title="Go Home"
      >
        <Home className="w-5 h-5" />
      </Link>

      {/* Middle tabs */}
      <div className="flex flex-col gap-4">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveLeftTab(item.id)}
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
              activeLeftTab === item.id 
                ? "bg-[#22a447] text-white shadow-lg" 
                : "text-gray-400 hover:bg-[#252525] hover:text-white"
            }`}
            title={item.label}
          >
            {item.icon}
            <span className="text-[9px] font-semibold">{item.id.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Bottom spacer */}
      <div className="w-12 h-12 flex items-center justify-center text-gray-600 text-xs font-bold">
        v1.0
      </div>
    </div>
  );
}
