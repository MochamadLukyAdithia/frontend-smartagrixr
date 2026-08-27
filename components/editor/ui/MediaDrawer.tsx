"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { 
  Upload, 
  Plus, 
  Search, 
  Loader2, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Type,
  Sprout,
  Box,
  SunMedium,
  Circle,
  Cylinder,
  Cone,
  Square,
  Sparkles,
  Check,
  Home,
  Droplets,
  Navigation,
  Layers,
  Sliders
} from "lucide-react";

export function MediaDrawer() {
  const { activeLeftTab, assets, addAsset, environment, setEnvironment } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Text local settings
  const [typedText, setTypedText] = useState("SmartAgri 3D");
  const [textColor, setTextColor] = useState("#22c55e");
  const [bgColor, setBgColor] = useState("#0f172a");
  const [textSize, setTextSize] = useState(48);

  const editor = getEditorInstance();

  if (activeLeftTab === "none") return null;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "glb" | "image" | "video" | "audio") => {
    const files = event.target.files;
    if (!files || files.length === 0 || !editor) return;

    const file = files[0];
    setIsUploading(true);

    try {
      if (type === "glb") {
        await editor.importManager.importFile(file);
      } else if (type === "image") {
        editor.objectManager.createImage(file);
        addAsset({ id: "img_" + Math.random().toString(36).substring(2, 9), name: file.name, url: file.name, type: "image" });
      } else if (type === "video") {
        editor.objectManager.createVideo(file);
        addAsset({ id: "vid_" + Math.random().toString(36).substring(2, 9), name: file.name, url: file.name, type: "video" });
      } else if (type === "audio") {
        editor.objectManager.createAudio(file);
        addAsset({ id: "aud_" + Math.random().toString(36).substring(2, 9), name: file.name, url: file.name, type: "audio" });
      }
    } catch (err) {
      alert("Failed to load file.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSpawnText = () => {
    if (editor && typedText.trim()) {
      editor.objectManager.createText(typedText, textColor, textSize, bgColor);
    }
  };

  const handleSpawnPrimitive = (type: "box" | "sphere" | "cylinder" | "cone" | "capsule" | "torus" | "plane" | "ground") => {
    if (editor) {
      editor.objectManager.createPrimitive(type);
    }
  };

  const handleSpawnAgriPreset = (type: "greenhouse" | "solar_sensor" | "water_tank" | "drone" | "crop_field" | "tractor" | "plant") => {
    if (editor) {
      editor.objectManager.createAgriPreset(type);
    }
  };

  const handleApplyPreset = (preset: "studio" | "farm" | "greenhouse" | "cyber" | "dark") => {
    if (editor) {
      editor.sceneManager.applyPreset(preset);
    }
  };

  // Smart Agriculture Preset List
  const agriPresets = [
    { type: "greenhouse", name: "Smart Greenhouse", desc: "Climate regulated glass house", icon: <Home className="w-5 h-5 text-cyan-300" />, color: "from-blue-600 to-cyan-500" },
    { type: "solar_sensor", name: "IoT Soil Sensor", desc: "Solar powered telemetry unit", icon: <SunMedium className="w-5 h-5 text-amber-300" />, color: "from-emerald-600 to-green-500" },
    { type: "water_tank", name: "Irrigation Tank", desc: "Automated reservoir system", icon: <Droplets className="w-5 h-5 text-sky-300" />, color: "from-sky-600 to-blue-500" },
    { type: "drone", name: "Sprayer Drone", desc: "Precision aerial sprayer", icon: <Navigation className="w-5 h-5 text-yellow-300" />, color: "from-amber-600 to-yellow-500" },
    { type: "crop_field", name: "Raised Crop Bed", desc: "Structured row cultivation", icon: <Layers className="w-5 h-5 text-lime-300" />, color: "from-lime-600 to-emerald-500" },
    { type: "tractor", name: "Farm Rover", desc: "Autonomous electric field unit", icon: <Sliders className="w-5 h-5 text-emerald-300" />, color: "from-green-600 to-emerald-700" },
    { type: "plant", name: "Hydroponic Plant", desc: "Monitored container crop", icon: <Sprout className="w-5 h-5 text-emerald-300" />, color: "from-red-500 to-orange-500" },
  ] as const;

  // Basic Primitives List
  const primitivePresets = [
    { type: "box", name: "Cube / Box", icon: <Box className="w-5 h-5 text-emerald-400" /> },
    { type: "sphere", name: "Sphere", icon: <Circle className="w-5 h-5 text-blue-400" /> },
    { type: "cylinder", name: "Cylinder", icon: <Cylinder className="w-5 h-5 text-amber-400" /> },
    { type: "cone", name: "Cone", icon: <Cone className="w-5 h-5 text-purple-400" /> },
    { type: "capsule", name: "Capsule", icon: <Box className="w-5 h-5 text-cyan-400" /> },
    { type: "torus", name: "Torus / Ring", icon: <Circle className="w-5 h-5 text-pink-400" /> },
    { type: "plane", name: "Plane", icon: <Square className="w-5 h-5 text-yellow-400" /> },
    { type: "ground", name: "Ground Terrain", icon: <Square className="w-5 h-5 text-green-500" /> },
  ] as const;

  return (
    <div className="w-72 bg-[#1b1b1e] border-r border-[#2d2d30] flex flex-col h-full text-white select-none z-10 transition-all duration-200 shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-[#2d2d30] flex items-center justify-between bg-[#141416]">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-300 flex items-center gap-1.5">
          {activeLeftTab === "agri" && <Sprout className="w-4 h-4 text-[#22a447]" />}
          {activeLeftTab === "objects" && <Box className="w-4 h-4 text-emerald-400" />}
          {activeLeftTab === "environment" && <SunMedium className="w-4 h-4 text-amber-400" />}
          {activeLeftTab === "text" && <Type className="w-4 h-4 text-blue-400" />}
          {activeLeftTab === "agri" ? "Smart Agriculture 3D" : activeLeftTab === "objects" ? "3D Primitives" : activeLeftTab}
        </h3>

        {(activeLeftTab === "images" || activeLeftTab === "video" || activeLeftTab === "audio") && (
          <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-[#22a447] hover:bg-[#198b3a] text-white rounded text-xs font-bold transition-all shadow">
            <Upload className="w-3.5 h-3.5" />
            Upload
            <input
              type="file"
              accept={
                activeLeftTab === "images" ? ".png,.jpg,.jpeg,.webp" :
                activeLeftTab === "video" ? ".mp4,.webm" : ".mp3,.wav"
              }
              onChange={(e) => handleFileUpload(e, activeLeftTab as any)}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Drawer Content */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        
        {/* 1. Smart Agriculture Presets */}
        {activeLeftTab === "agri" && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] text-gray-400 font-semibold">
              Click any SmartAgri preset to place into the 3D scene:
            </span>
            <div className="grid grid-cols-1 gap-2.5">
              {agriPresets.map((preset) => (
                <div
                  key={preset.type}
                  onClick={() => handleSpawnAgriPreset(preset.type)}
                  className="group relative bg-[#242429] hover:bg-[#2c2c33] border border-white/5 hover:border-[#22a447] p-3 rounded-xl cursor-pointer transition-all flex items-center gap-3 shadow hover:shadow-lg"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${preset.color} flex items-center justify-center text-xl shadow-md flex-shrink-0 group-hover:scale-105 transition-transform`}>
                    {preset.icon}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-bold text-gray-200 group-hover:text-white truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-gray-400 truncate">
                      {preset.desc}
                    </span>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity bg-[#22a447] p-1 rounded-full text-white">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Basic 3D Primitives */}
        {activeLeftTab === "objects" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-semibold">Geometric Primitives</span>
              <label className="cursor-pointer text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-bold">
                <Upload className="w-3 h-3" /> Custom GLB
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => handleFileUpload(e, "glb")}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {primitivePresets.map((p) => (
                <div
                  key={p.type}
                  onClick={() => handleSpawnPrimitive(p.type)}
                  className="group bg-[#242429] hover:bg-[#2e2e36] border border-white/5 hover:border-[#22a447] p-3 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <div className="p-2.5 bg-[#17171a] rounded-lg group-hover:scale-110 transition-transform">
                    {p.icon}
                  </div>
                  <span className="text-[11px] font-bold text-gray-300 group-hover:text-white text-center">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Environment Presets */}
        {activeLeftTab === "environment" && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] text-gray-400 font-semibold">
              Select 3D World & Sky Environment Preset:
            </span>
            <div className="flex flex-col gap-2">
              {[
                { id: "studio", name: "Clean Studio", color: "#e8e8e8", desc: "Neutral grey studio environment" },
                { id: "farm", name: "Sunny Farm Field", color: "#bbf7d0", desc: "Lush green ground with bright sky" },
                { id: "greenhouse", name: "Greenhouse Hydroponics", color: "#ecfdf5", desc: "Warm high-humidity grow room" },
                { id: "cyber", name: "Cyberpunk Precision Agri", color: "#0f172a", desc: "Futuristic dark neon grid" },
                { id: "dark", name: "Dark Modern Mode", color: "#18181b", desc: "Sleek charcoal workspace" },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    environment.preset === p.id 
                      ? "bg-[#22a447]/15 border-[#22a447]" 
                      : "bg-[#242429] hover:bg-[#2c2c33] border-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full border border-white/20 shadow-inner"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white">{p.name}</span>
                      <span className="text-[10px] text-gray-400">{p.desc}</span>
                    </div>
                  </div>
                  {environment.preset === p.id && (
                    <Check className="w-4 h-4 text-[#22a447]" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 3D Text Creator */}
        {activeLeftTab === "text" && (
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400 font-semibold">Text Content</span>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="bg-[#242429] text-white px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-[#22a447]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">Text Color</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-gray-400">Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-8 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-gray-400 font-semibold">
                <span>Font Size</span>
                <span>{textSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="2"
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value))}
                className="accent-[#22a447]"
              />
            </div>

            <button
              onClick={handleSpawnText}
              className="mt-2 w-full py-2.5 bg-[#22a447] hover:bg-[#198b3a] font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all text-white shadow-lg cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Place 3D Text
            </button>
          </div>
        )}

        {/* 5. Images / Video / Audio */}
        {(activeLeftTab === "images" || activeLeftTab === "video" || activeLeftTab === "audio") && (
          <div className="flex flex-col gap-3">
            <span className="text-[11px] text-gray-400 font-semibold">
              Uploaded Media Assets ({assets.filter(a => a.type === activeLeftTab.slice(0, -1)).length}):
            </span>
            {assets.filter(a => a.type === activeLeftTab.slice(0, -1)).length === 0 ? (
              <div className="p-6 border border-dashed border-white/10 rounded-xl text-center text-xs text-gray-500">
                No {activeLeftTab} uploaded yet. Click Upload above to add your files.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {assets.filter(a => a.type === activeLeftTab.slice(0, -1)).map((asset) => (
                  <div
                    key={asset.id}
                    className="p-2.5 bg-[#242429] rounded-xl border border-white/5 flex flex-col items-center gap-1.5"
                  >
                    <span className="text-xs font-bold text-white truncate w-full text-center">{asset.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

