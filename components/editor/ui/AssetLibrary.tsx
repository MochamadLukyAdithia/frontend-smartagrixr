"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { Upload, Plus, Search, Loader2 } from "lucide-react";

export function AssetLibrary() {
  const { assets } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const editor = getEditorInstance();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0 || !editor) return;

    const file = files[0];
    setIsImporting(true);
    setImportProgress(0);

    try {
      await editor.importManager.importFile(file, (progress) => {
        setImportProgress(Math.round(progress * 100));
      });
    } catch (err) {
      alert("Failed to import asset. Make sure it is a valid GLTF/GLB file.");
    } finally {
      setIsImporting(false);
      setImportProgress(0);
      // Reset input
      event.target.value = "";
    }
  };

  const spawnInstance = (assetId: string, name: string) => {
    if (!editor) return;
    
    // Create new scene instance of the asset
    const id = "instance_" + Math.random().toString(36).substr(2, 9);
    
    // We duplicate the root mesh node of the asset
    const rootNode = editor.nodesMap.get(assetId);
    if (!rootNode) return;

    const duplicatedId = editor.objectManager.duplicateObject(assetId);
    if (duplicatedId) {
      // Offset slightly to prevent perfect overlapping
      const node = editor.nodesMap.get(duplicatedId);
      if (node) {
        node.position.x += (Math.random() - 0.5) * 2;
        node.position.z += (Math.random() - 0.5) * 2;
        editor.objectManager.updateObjectStateFromBabylon(duplicatedId);
        
        // Auto-select the newly spawned instance
        editor.selectionManager.selectObject(duplicatedId);
      }
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col h-full text-white select-none">
      <div className="p-3 border-b border-[#2a2a2a] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Asset Library</span>
        <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-[#22a447] hover:bg-[#198b3a] text-white rounded text-xs font-bold transition-all shadow">
          <Upload className="w-3.5 h-3.5" />
          Import 3D
          <input
            type="file"
            accept=".glb,.gltf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isImporting}
          />
        </label>
      </div>

      {/* Search */}
      <div className="p-3 border-b border-[#2a2a2a] flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#2a2a2a] text-xs text-white px-2 py-1.5 rounded w-full outline-none border border-transparent focus:border-[#22a447]"
        />
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isImporting && (
          <div className="flex flex-col items-center justify-center p-6 bg-[#252525] rounded mb-3 gap-2">
            <Loader2 className="w-6 h-6 text-[#22a447] animate-spin" />
            <span className="text-xs text-gray-300">Importing Model ({importProgress}%)</span>
          </div>
        )}

        {filteredAssets.length === 0 ? (
          <div className="text-xs text-gray-500 text-center mt-8">
            No assets imported yet. Upload a .glb or .gltf model to begin.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => spawnInstance(asset.id, asset.name)}
                className="group relative bg-[#252525] border border-[#333] hover:border-[#22a447] p-2.5 rounded cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:shadow-lg"
              >
                {/* Visual placeholder box for model thumbnail */}
                <div className="w-full aspect-square bg-[#1a1a1a] rounded flex items-center justify-center text-xs text-[#22a447] font-bold group-hover:scale-105 transition-transform">
                  3D Asset
                </div>
                <span className="text-xs font-semibold text-gray-300 truncate w-full text-center">
                  {asset.name}
                </span>

                <div className="absolute top-1.5 right-1.5 bg-[#22a447] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Plus className="w-3 h-3 text-white" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
