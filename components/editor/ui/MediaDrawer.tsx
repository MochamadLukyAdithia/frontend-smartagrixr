"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { Upload, Plus, Search, Loader2, Image, Video, Music, Type } from "lucide-react";

export function MediaDrawer() {
  const { activeLeftTab, assets, addAsset } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  
  // Text local settings
  const [typedText, setTypedText] = useState("Hello World");
  const [textColor, setTextColor] = useState("#000000");
  const [textSize, setTextSize] = useState(60);

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
        addAsset({ id: "img_" + Math.random().toString(36).substr(2, 9), name: file.name, url: file.name, type: "image" });
      } else if (type === "video") {
        editor.objectManager.createVideo(file);
        addAsset({ id: "vid_" + Math.random().toString(36).substr(2, 9), name: file.name, url: file.name, type: "video" });
      } else if (type === "audio") {
        editor.objectManager.createAudio(file);
        addAsset({ id: "aud_" + Math.random().toString(36).substr(2, 9), name: file.name, url: file.name, type: "audio" });
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
      editor.objectManager.createText(typedText, textColor, textSize);
    }
  };

  const spawnInstance = (assetId: string) => {
    if (!editor) return;
    const duplicatedId = editor.objectManager.duplicateObject(assetId);
    if (duplicatedId) {
      const node = editor.nodesMap.get(duplicatedId);
      if (node) {
        node.position.x += (Math.random() - 0.5) * 2;
        node.position.z += (Math.random() - 0.5) * 2;
        editor.objectManager.updateObjectStateFromBabylon(duplicatedId);
        editor.selectionManager.selectObject(duplicatedId);
      }
    }
  };

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) && 
    (activeLeftTab === "objects" ? (a.type === "glb" || a.type === "gltf") : a.type === activeLeftTab.slice(0, -1))
  );

  return (
    <div className="w-64 bg-[#1e1e1e] border-r border-[#2d2d2d] flex flex-col h-full text-white select-none z-10 transition-all duration-200">
      {/* Tab Title & Action */}
      <div className="p-4 border-b border-[#2d2d2d] flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          {activeLeftTab === "objects" ? "3D Objects" : activeLeftTab}
        </h3>

        {activeLeftTab !== "text" && (
          <label className="cursor-pointer flex items-center gap-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs font-bold transition-all shadow">
            <Upload className="w-3.5 h-3.5" />
            Upload
            <input
              type="file"
              accept={
                activeLeftTab === "objects" ? ".glb,.gltf" :
                activeLeftTab === "images" ? ".png,.jpg,.jpeg,.webp" :
                activeLeftTab === "video" ? ".mp4,.webm" : ".mp3,.wav"
              }
              onChange={(e) => handleFileUpload(e, activeLeftTab === "objects" ? "glb" : activeLeftTab.slice(0, -1) as any)}
              className="hidden"
              disabled={isUploading}
            />
          </label>
        )}
      </div>

      {/* Upload Loader */}
      {isUploading && (
        <div className="p-4 flex items-center gap-3 bg-[#252525] border-b border-[#2d2d2d] text-xs">
          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
          <span>Processing upload...</span>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-3">
        {activeLeftTab === "text" ? (
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <span className="text-gray-400">Text Content</span>
              <input
                type="text"
                value={typedText}
                onChange={(e) => setTypedText(e.target.value)}
                className="bg-[#2a2a2a] text-white px-2.5 py-2 rounded outline-none border border-transparent focus:border-blue-600"
              />
            </div>

            <div className="flex justify-between items-center">
              <span className="text-gray-400">Color</span>
              <input
                type="color"
                value={textColor}
                onChange={(e) => setTextColor(e.target.value)}
                className="w-10 h-8 bg-transparent border-0 cursor-pointer"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between text-gray-400">
                <span>Font Size</span>
                <span>{textSize}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="1"
                value={textSize}
                onChange={(e) => setTextSize(parseInt(e.target.value))}
                className="accent-blue-600"
              />
            </div>

            <button
              onClick={handleSpawnText}
              className="mt-2 w-full py-2 bg-blue-600 hover:bg-blue-700 font-bold rounded flex items-center justify-center gap-1.5 transition-colors text-white"
            >
              <Plus className="w-4 h-4" /> Add Text
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Search */}
            <div className="flex items-center gap-2 bg-[#2a2a2a] px-2 py-1.5 rounded">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search assets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white outline-none w-full"
              />
            </div>

            {filteredAssets.length === 0 ? (
              <div className="text-xs text-gray-500 text-center mt-6">
                No items uploaded yet. Click upload to get started.
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-2">
                {filteredAssets.map((asset) => (
                  <div
                    key={asset.id}
                    onClick={() => spawnInstance(asset.id)}
                    className="group relative bg-[#252525] border border-[#333] hover:border-blue-600 p-2 rounded cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-full aspect-square bg-[#1a1a1a] rounded flex items-center justify-center text-blue-500">
                      {activeLeftTab === "objects" && <Plus className="w-5 h-5" />}
                      {activeLeftTab === "images" && <Image className="w-5 h-5" />}
                      {activeLeftTab === "video" && <Video className="w-5 h-5" />}
                      {activeLeftTab === "audio" && <Music className="w-5 h-5" />}
                    </div>
                    <span className="text-[10px] text-gray-300 truncate w-full text-center">
                      {asset.name}
                    </span>
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
