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

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, tabType?: string) => {
    const files = event.target.files;
    const ed = getEditorInstance();
    if (!files || files.length === 0 || !ed) return;

    const file = files[0];
    setIsUploading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      const isGlb = tabType === "glb" || ext === "glb" || ext === "gltf";
      const isImg = tabType === "images" || tabType === "image" || ["png", "jpg", "jpeg", "webp", "gif", "svg"].includes(ext);
      const isVid = tabType === "video" || tabType === "videos" || ["mp4", "webm", "ogv", "mov"].includes(ext);
      const isAud = tabType === "audio" || tabType === "audios" || ["mp3", "wav", "ogg", "aac"].includes(ext);

      const objectUrl = URL.createObjectURL(file);

      if (isGlb) {
        await ed.importManager.importFile(file);
      } else if (isImg) {
        ed.objectManager.createImage(file);
        addAsset({ 
          id: "img_" + Math.random().toString(36).substring(2, 9), 
          name: file.name, 
          url: objectUrl, 
          type: "image" 
        });
      } else if (isVid) {
        ed.objectManager.createVideo(file);
        addAsset({ 
          id: "vid_" + Math.random().toString(36).substring(2, 9), 
          name: file.name, 
          url: objectUrl, 
          type: "video" 
        });
      } else if (isAud) {
        ed.objectManager.createAudio(file);
        addAsset({ 
          id: "aud_" + Math.random().toString(36).substring(2, 9), 
          name: file.name, 
          url: objectUrl, 
          type: "audio" 
        });
      }
    } catch (err) {
      console.error("Failed to load file into canvas:", err);
      alert("Failed to load file onto canvas.");
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


  // Smart Agriculture Preset List (Playful, Colorful Cards)
  const agriPresets = [
    { type: "greenhouse", name: "Smart Greenhouse", desc: "Climate regulated grow zone", icon: Home, color: "text-emerald-400 bg-emerald-500/15 border-emerald-500/30" },
    { type: "solar_sensor", name: "Soil Sensor Node", desc: "Moisture & pH telemetry", icon: SunMedium, color: "text-amber-400 bg-amber-500/15 border-amber-500/30" },
    { type: "water_tank", name: "Irrigation Tank", desc: "Smart valve reservoir", icon: Droplets, color: "text-cyan-400 bg-cyan-500/15 border-cyan-500/30" },
    { type: "drone", name: "Sprayer Drone", desc: "Autonomous field sprayer", icon: Navigation, color: "text-sky-400 bg-sky-500/15 border-sky-500/30" },
    { type: "crop_field", name: "Raised Crop Bed", desc: "Modular soil bed matrix", icon: Layers, color: "text-lime-400 bg-lime-500/15 border-lime-500/30" },
    { type: "tractor", name: "Field Rover", desc: "Ground sensor rover", icon: Sliders, color: "text-orange-400 bg-orange-500/15 border-orange-500/30" },
    { type: "plant", name: "Hydroponic Crop", desc: "Monitored container plant", icon: Sprout, color: "text-teal-400 bg-teal-500/15 border-teal-500/30" },
  ] as const;

  // Basic Primitives List with cheerful colors
  const primitivePresets = [
    { type: "box", name: "Cube", icon: Box, color: "text-cyan-400 bg-cyan-500/10" },
    { type: "sphere", name: "Sphere", icon: Circle, color: "text-purple-400 bg-purple-500/10" },
    { type: "cylinder", name: "Cylinder", icon: Cylinder, color: "text-emerald-400 bg-emerald-500/10" },
    { type: "cone", name: "Cone", icon: Cone, color: "text-amber-400 bg-amber-500/10" },
    { type: "capsule", name: "Capsule", icon: Box, color: "text-pink-400 bg-pink-500/10" },
    { type: "torus", name: "Torus", icon: Circle, color: "text-lime-400 bg-lime-500/10" },
    { type: "plane", name: "Plane", icon: Square, color: "text-blue-400 bg-blue-500/10" },
    { type: "ground", name: "Ground Grid", icon: Square, color: "text-teal-400 bg-teal-500/10" },
  ] as const;

  return (
    <div className="w-76 bg-white border-r border-slate-200 flex flex-col h-full text-slate-800 select-none z-10 shadow-lg font-sans">
      {/* Header */}
      <div className="p-3.5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
        <h3 className="text-xs font-bold tracking-wide text-slate-900 flex items-center gap-2">
          {activeLeftTab === "agri" && <Sprout className="w-4 h-4 text-emerald-600" />}
          {activeLeftTab === "objects" && <Box className="w-4 h-4 text-cyan-600" />}
          {activeLeftTab === "environment" && <SunMedium className="w-4 h-4 text-amber-500" />}
          {activeLeftTab === "text" && <Type className="w-4 h-4 text-indigo-600" />}
          <span>{activeLeftTab === "agri" ? "Smart Agriculture 3D" : activeLeftTab === "objects" ? "3D Shapes & Mesh" : activeLeftTab}</span>
        </h3>

        {(activeLeftTab === "images" || activeLeftTab === "video" || activeLeftTab === "audio") && (
          <label className="bouncy-hover cursor-pointer flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm">
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
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
        
        {/* 1. Smart Agriculture Presets */}
        {activeLeftTab === "agri" && (
          <div className="flex flex-col gap-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span className="font-medium text-slate-600">Tap preset to spawn:</span>
              <button
                onClick={() => setActiveLeftTab("storage")}
                className="text-emerald-700 hover:text-emerald-800 flex items-center gap-1 font-semibold hover:underline"
              >
                <Cloud className="w-3.5 h-3.5" /> Cloud Assets
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              {agriPresets.map((preset) => {
                const Icon = preset.icon;
                return (
                  <div
                    key={preset.type}
                    onClick={() => handleSpawnAgriPreset(preset.type)}
                    className="group bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500/60 p-2.5 rounded-xl cursor-pointer transition-all duration-200 flex items-center gap-3 bouncy-hover"
                  >
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${preset.color} shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs font-semibold text-slate-800 group-hover:text-emerald-700 truncate">
                        {preset.name}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {preset.desc}
                      </span>
                    </div>
                    <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 2. Basic 3D Primitives */}
        {activeLeftTab === "objects" && (
          <div className="flex flex-col gap-3">
            {/* Direct Switch to Storage */}
            <button
              onClick={() => setActiveLeftTab("storage")}
              className="w-full p-2.5 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-300/70 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer bouncy-hover shadow-xs"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-emerald-100 border border-emerald-300/50 rounded-lg text-emerald-700">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-emerald-950">Cloud Storage & Assets</span>
                  <span className="text-[9.5px] text-slate-500">Import custom 3D files & textures</span>
                </div>
              </div>
              <Plus className="w-4 h-4 text-emerald-700" />
            </button>

            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-slate-700 font-semibold">Geometric Meshes</span>
              <label className="cursor-pointer text-[11px] text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 font-semibold">
                <Upload className="w-3.5 h-3.5" /> Upload GLB
                <input
                  type="file"
                  accept=".glb,.gltf"
                  onChange={(e) => handleFileUpload(e, "glb")}
                  className="hidden"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {primitivePresets.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.type}
                    onClick={() => handleSpawnPrimitive(p.type)}
                    className="group bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500/60 p-2.5 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 bouncy-hover"
                  >
                    <div className={`p-2 rounded-xl ${p.color} group-hover:scale-110 transition-transform shadow-xs`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-700 group-hover:text-emerald-700 text-center">
                      {p.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Environment Presets */}
        {activeLeftTab === "environment" && (
          <div className="flex flex-col gap-3">
            <span className="text-xs text-slate-700 font-semibold">
              3D Lighting & Environment:
            </span>
            <div className="flex flex-col gap-2">
              {[
                { id: "studio", name: "Neutral Studio", color: "#64748b", desc: "Crisp studio lighting & neutral grey floor" },
                { id: "farm", name: "Sunlit Field", color: "#16a34a", desc: "Bright outdoor daylight and grass terrain" },
                { id: "greenhouse", name: "Smart Greenhouse", color: "#059669", desc: "Warm grow lights & high clarity" },
                { id: "dark", name: "Modern Dark Lab", color: "#18181b", desc: "Deep contrast slate workspace" },
              ].map((p) => (
                <div
                  key={p.id}
                  onClick={() => handleApplyPreset(p.id as any)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between bouncy-hover ${
                    environment.preset === p.id 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950" 
                      : "bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border-2 border-white shadow-xs flex-shrink-0"
                      style={{ backgroundColor: p.color }}
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">{p.name}</span>
                      <span className="text-[10px] text-slate-500">{p.desc}</span>
                    </div>
                  </div>
                  {environment.preset === p.id && (
                    <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. 3D Text Creator */}
        {activeLeftTab === "text" && (
          <div className="flex flex-col gap-3.5 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-slate-700 font-semibold">Text Content</span>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="bg-slate-50 text-slate-900 px-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 transition-colors font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] font-medium">Text Color</span>
                <input
                  type="color"
                  value={textColor}
                  onChange={(e) => setTextColor(e.target.value)}
                  className="w-full h-8 bg-transparent border-0 cursor-pointer rounded-lg"
                />
              </div>
              <div className="flex flex-col gap-1.5 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                <span className="text-slate-500 text-[11px] font-medium">Background</span>
                <input
                  type="color"
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                  className="w-full h-8 bg-transparent border-0 cursor-pointer rounded-lg"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex justify-between text-slate-700 text-xs font-semibold">
                <span>Font Size</span>
                <span className="text-emerald-700 font-bold">{textSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="2"
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value))}
                className="accent-emerald-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSpawnText}
              className="bouncy-hover mt-1 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer text-xs"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> Place 3D Text
            </button>
          </div>
        )}

        {/* 5. Images / Video / Audio */}
        {(activeLeftTab === "images" || activeLeftTab === "video" || activeLeftTab === "audio") && (() => {
          const currentType = activeLeftTab === "images" ? "image" : activeLeftTab === "video" ? "video" : "audio";
          const currentAssets = assets.filter((a) => a.type === currentType);
          const labelTitle = activeLeftTab === "images" ? "Foto / Gambar" : activeLeftTab === "video" ? "Video Media" : "Audio / Suara";
          const acceptTypes = activeLeftTab === "images" ? ".png,.jpg,.jpeg,.webp,.gif" : activeLeftTab === "video" ? ".mp4,.webm" : ".mp3,.wav";

          const handleInsertExisting = (asset: { type: string; url: string; name: string }) => {
            const ed = getEditorInstance();
            if (!ed) return;
            if (asset.type === "image") {
              ed.objectManager.createImage(asset.url, asset.name);
            } else if (asset.type === "video") {
              ed.objectManager.createVideo(asset.url, asset.name);
            } else if (asset.type === "audio") {
              ed.objectManager.createAudio(asset.url, asset.name);
            }
          };

          return (
            <div className="flex flex-col gap-3">
              {/* Quick Upload Dropzone / Button */}
              <label className="cursor-pointer border-2 border-dashed border-emerald-500/40 hover:border-emerald-600 bg-emerald-50/50 hover:bg-emerald-50/80 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 transition-all bouncy-hover group">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs">
                  {isUploading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : activeLeftTab === "images" ? (
                    <ImageIcon className="w-5 h-5" />
                  ) : activeLeftTab === "video" ? (
                    <Video className="w-5 h-5" />
                  ) : (
                    <Music className="w-5 h-5" />
                  )}
                </div>
                <div className="flex flex-col items-center text-center">
                  <span className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">
                    {isUploading ? "Memproses File..." : `Upload ${labelTitle}`}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Otomatis masuk & muncul di 3D Canvas
                  </span>
                </div>
                <input
                  type="file"
                  accept={acceptTypes}
                  onChange={(e) => handleFileUpload(e, activeLeftTab)}
                  className="hidden"
                  disabled={isUploading}
                />
              </label>

              <div className="flex items-center justify-between text-xs text-slate-700 font-semibold pt-1">
                <span>Daftar {labelTitle} ({currentAssets.length}):</span>
                {currentAssets.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-normal">Klik untuk tambah ke canvas</span>
                )}
              </div>

              {currentAssets.length === 0 ? (
                <div className="p-4 border border-slate-200 rounded-xl text-center text-xs text-slate-500 bg-slate-50 flex flex-col items-center gap-1.5">
                  <span className="text-[11px] text-slate-600 font-medium">Belum ada {labelTitle.toLowerCase()}</span>
                  <span className="text-[10px] text-slate-400">Upload file untuk langsung memunculkan di ruang 3D</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {currentAssets.map((asset) => (
                    <div
                      key={asset.id}
                      onClick={() => handleInsertExisting(asset)}
                      className="group p-2.5 bg-slate-50 hover:bg-emerald-50/60 rounded-xl border border-slate-200 hover:border-emerald-400 flex flex-col items-center gap-2 transition-all cursor-pointer bouncy-hover shadow-2xs"
                      title="Klik untuk tempatkan di canvas 3D"
                    >
                      <div className="w-full h-16 rounded-lg bg-slate-200/80 overflow-hidden flex items-center justify-center relative">
                        {asset.type === "image" && asset.url ? (
                          <img
                            src={asset.url}
                            alt={asset.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : asset.type === "video" ? (
                          <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-emerald-700">
                            <Video className="w-6 h-6" />
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-600 group-hover:text-emerald-700">
                            <Music className="w-6 h-6" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-emerald-950/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <Plus className="w-5 h-5 text-white stroke-[3]" />
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-800 group-hover:text-emerald-800 truncate w-full text-center">
                        {asset.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}

