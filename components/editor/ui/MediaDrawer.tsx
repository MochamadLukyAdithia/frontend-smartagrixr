"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";

import { StorageAssetDrawer } from "./StorageAssetDrawer";
import { TextTo3DDrawer } from "./TextTo3DDrawer";
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
  Check,
  Home,
  Droplets,
  Navigation,
  Layers,
  Sliders,
  Cloud
} from "lucide-react";

export function MediaDrawer() {
  const { activeLeftTab, setActiveLeftTab, assets, addAsset, environment, setEnvironment } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Text local settings
  const [typedText, setTypedText] = useState("SmartAgri 3D");
  const [textColor, setTextColor] = useState("#10b981");
  const [bgColor, setBgColor] = useState("#18181b");
  const [textSize, setTextSize] = useState(48);

  const editor = useEditorInstance();

  if (activeLeftTab === "none") return null;
  if (activeLeftTab === "storage") return <StorageAssetDrawer />;
  if (activeLeftTab === "text2model") return <TextTo3DDrawer />;

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "glb" | "image" | "video" | "audio") => {
    const files = event.target.files;
    const ed = getEditorInstance();
    if (!files || files.length === 0 || !ed) return;

    const file = files[0];
    setIsUploading(true);

    try {
      if (type === "glb") {
        await ed.importManager.importFile(file);
      } else if (type === "image") {
        ed.objectManager.createImage(file);
        addAsset({ id: "img_" + Math.random().toString(36).substring(2, 9), name: file.name, url: file.name, type: "image" });
      } else if (type === "video") {
        ed.objectManager.createVideo(file);
        addAsset({ id: "vid_" + Math.random().toString(36).substring(2, 9), name: file.name, url: file.name, type: "video" });
      } else if (type === "audio") {
        ed.objectManager.createAudio(file);
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
    const ed = getEditorInstance();
    if (ed && typedText.trim()) {
      ed.objectManager.createText(typedText, textColor, textSize, bgColor);
    }
  };

  const handleSpawnPrimitive = (type: "box" | "sphere" | "cylinder" | "cone" | "capsule" | "torus" | "plane" | "ground") => {
    const ed = getEditorInstance();
    if (ed) {
      ed.objectManager.createPrimitive(type);
    }
  };

  const handleSpawnAgriPreset = (type: "greenhouse" | "solar_sensor" | "water_tank" | "drone" | "crop_field" | "tractor" | "plant") => {
    const ed = getEditorInstance();
    if (ed) {
      ed.objectManager.createAgriPreset(type);
    }
  };

  const handleApplyPreset = (preset: "studio" | "farm" | "greenhouse" | "cyber" | "dark") => {
    const ed = getEditorInstance();
    if (ed) {
      ed.sceneManager.applyPreset(preset);
    }
  };


  // Smart Agriculture Preset List (Clean Precision Design)
  const agriPresets = [
    { type: "greenhouse", name: "Smart Greenhouse", desc: "Climate regulated structure", icon: <Home className="w-4 h-4 text-emerald-400" /> },
    { type: "solar_sensor", name: "Soil Telemetry Node", desc: "Telemetry & moisture sensor", icon: <SunMedium className="w-4 h-4 text-emerald-400" /> },
    { type: "water_tank", name: "Irrigation Reservoir", desc: "Automated valve storage", icon: <Droplets className="w-4 h-4 text-emerald-400" /> },
    { type: "drone", name: "Sprayer Drone", desc: "Aerial field sprayer", icon: <Navigation className="w-4 h-4 text-emerald-400" /> },
    { type: "crop_field", name: "Raised Crop Bed", desc: "Modular soil bed matrix", icon: <Layers className="w-4 h-4 text-emerald-400" /> },
    { type: "tractor", name: "Field Rover", desc: "Autonomous ground unit", icon: <Sliders className="w-4 h-4 text-emerald-400" /> },
    { type: "plant", name: "Hydroponic Crop", desc: "Monitored container plant", icon: <Sprout className="w-4 h-4 text-emerald-400" /> },
  ] as const;

  // Basic Primitives List
  const primitivePresets = [
    { type: "box", name: "Cube / Box", icon: <Box className="w-4 h-4" /> },
    { type: "sphere", name: "Sphere", icon: <Circle className="w-4 h-4" /> },
    { type: "cylinder", name: "Cylinder", icon: <Cylinder className="w-4 h-4" /> },
    { type: "cone", name: "Cone", icon: <Cone className="w-4 h-4" /> },
    { type: "capsule", name: "Capsule", icon: <Box className="w-4 h-4" /> },
    { type: "torus", name: "Torus / Ring", icon: <Circle className="w-4 h-4" /> },
    { type: "plane", name: "Plane", icon: <Square className="w-4 h-4" /> },
    { type: "ground", name: "Ground Grid", icon: <Square className="w-4 h-4" /> },
  ] as const;

  return (
    <div className="w-72 bg-[#141416] border-r border-[#242427] flex flex-col h-full text-white select-none z-10">
      {/* Header */}
      <div className="p-3.5 border-b border-[#242427] flex items-center justify-between bg-[#111113]">
        <h3 className="text-xs font-semibold tracking-tight text-zinc-200 flex items-center gap-1.5">
          {activeLeftTab === "agri" && <Sprout className="w-3.5 h-3.5 text-emerald-400" />}
          {activeLeftTab === "objects" && <Box className="w-3.5 h-3.5 text-emerald-400" />}
          {activeLeftTab === "environment" && <SunMedium className="w-3.5 h-3.5 text-emerald-400" />}
          {activeLeftTab === "text" && <Type className="w-3.5 h-3.5 text-emerald-400" />}
          {activeLeftTab === "agri" ? "Smart Agriculture Presets" : activeLeftTab === "objects" ? "3D Primitives" : activeLeftTab}
        </h3>

        {(activeLeftTab === "images" || activeLeftTab === "video" || activeLeftTab === "audio") && (
          <label className="cursor-pointer flex items-center gap-1 px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors">
            <Upload className="w-3 h-3" />
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
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        
        {/* 1. Smart Agriculture Presets */}
        {activeLeftTab === "agri" && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span>Select preset to insert:</span>
              <button
                onClick={() => setActiveLeftTab("storage")}
                className="text-emerald-400 hover:underline flex items-center gap-1 font-medium"
              >
                <Cloud className="w-3 h-3" /> Cloud Assets
              </button>
            </div>
            
            <div className="flex flex-col gap-1.5">
              {agriPresets.map((preset) => (
                <div
                  key={preset.type}
                  onClick={() => handleSpawnAgriPreset(preset.type)}
                  className="group bg-[#1c1c1f] hover:bg-[#232327] border border-zinc-800/80 hover:border-zinc-600 p-2.5 rounded-lg cursor-pointer transition-colors flex items-center gap-2.5"
                >
                  <div className="w-8 h-8 rounded-md bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-emerald-400">
                    {preset.icon}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-xs font-medium text-zinc-200 group-hover:text-white truncate">
                      {preset.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 truncate">
                      {preset.desc}
                    </span>
                  </div>
                  <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400">
                    <Plus className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Basic 3D Primitives */}
        {activeLeftTab === "objects" && (
          <div className="flex flex-col gap-2.5">
            {/* Direct Switch to Storage */}
            <button
              onClick={() => setActiveLeftTab("storage")}
              className="w-full p-2 bg-[#1c1c1f] hover:bg-[#232327] border border-zinc-800 hover:border-zinc-700 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <div className="p-1 bg-zinc-900 border border-zinc-800 rounded text-emerald-400">
                  <Cloud className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-zinc-200">Cloud & Local Storage</span>
                  <span className="text-[9px] text-zinc-500">Import 3D models & browse files</span>
                </div>
              </div>
              <Plus className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <span className="text-[11px] text-zinc-400 font-medium">Geometric Mesh</span>
              <label className="cursor-pointer text-[11px] text-emerald-400 hover:underline flex items-center gap-1 font-medium">
                <Upload className="w-3 h-3" /> Custom GLB
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => handleFileUpload(e, "glb")}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {primitivePresets.map((p) => (
                <div
                  key={p.type}
                  onClick={() => handleSpawnPrimitive(p.type)}
                  className="group bg-[#1c1c1f] hover:bg-[#232327] border border-zinc-800/80 hover:border-zinc-600 p-2 rounded-lg cursor-pointer transition-colors flex flex-col items-center justify-center gap-1.5"
                >
                  <div className="p-1.5 bg-zinc-900 rounded text-zinc-400 group-hover:text-zinc-200">
                    {p.icon}
                  </div>
                  <span className="text-[10.5px] font-medium text-zinc-300 group-hover:text-white text-center">
                    {p.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Environment Presets */}
        {activeLeftTab === "environment" && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] text-zinc-400 font-medium">
              3D Environment & Background:
            </span>
            <div className="flex flex-col gap-1.5">
              {[
                { id: "studio", name: "Neutral Studio", color: "#27272a", desc: "Clean neutral grey lighting" },
                { id: "farm", name: "Field Daylight", color: "#166534", desc: "Outdoor sunlight and terrain" },
                { id: "greenhouse", name: "Greenhouse", color: "#065f46", desc: "High-transmittance grow light" },
                { id: "dark", name: "Dark Modern", color: "#09090b", desc: "Deep contrast slate workspace" },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as any)}
                  className={`p-2.5 rounded-lg border cursor-pointer transition-colors flex items-center justify-between ${
                    environment.preset === p.id 
                      ? "bg-zinc-800/90 border-emerald-500/60" 
                      : "bg-[#1c1c1f] hover:bg-[#232327] border-zinc-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="w-5 h-5 rounded-full border border-zinc-600"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-zinc-200">{p.name}</span>
                      <span className="text-[9.5px] text-zinc-500">{p.desc}</span>
                    </div>
                  </div>
                  {environment.preset === p.id && (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 3D Text Creator */}
        {activeLeftTab === "text" && (
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-400 font-medium">Text Content</span>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="bg-[#1c1c1f] text-white px-2.5 py-1.5 rounded-md outline-none border border-zinc-800 focus:border-zinc-600"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400">Text Color</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-7 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400">Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-7 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400">
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
                className="accent-emerald-500"
              />
            </div>

            <button
              onClick={handleSpawnText}
              className="mt-1 w-full py-2 bg-emerald-600 hover:bg-emerald-500 font-medium rounded-md flex items-center justify-center gap-1.5 transition-colors text-white cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Place 3D Text
            </button>
          </div>
        )}

        {/* 5. Images / Video / Audio */}
        {(activeLeftTab === "images" || activeLeftTab === "video" || activeLeftTab === "audio") && (
          <div className="flex flex-col gap-2.5">
            <span className="text-[11px] text-zinc-400 font-medium">
              Uploaded Media ({assets.filter(a => a.type === activeLeftTab.slice(0, -1)).length}):
            </span>
            {assets.filter(a => a.type === activeLeftTab.slice(0, -1)).length === 0 ? (
              <div className="p-4 border border-dashed border-zinc-800 rounded-lg text-center text-xs text-zinc-500">
                No {activeLeftTab} uploaded yet. Click Upload above to add files.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-1.5">
                {assets.filter(a => a.type === activeLeftTab.slice(0, -1)).map((asset) => (
                  <div
                    key={asset.id}
                    className="p-2 bg-[#1c1c1f] rounded-lg border border-zinc-800 flex flex-col items-center gap-1"
                  >
                    <span className="text-xs font-medium text-zinc-200 truncate w-full text-center">{asset.name}</span>
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
