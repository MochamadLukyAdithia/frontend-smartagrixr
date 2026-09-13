"use client";

import { useState } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { Upload, Plus, Search, Loader2 } from "lucide-react";

export function AssetLibrary() {
  const { assets } = useEditorStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);

  const editor = useEditorInstance();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const ed = getEditorInstance();
    if (!files || files.length === 0 || !ed) return;

    const file = files[0];
    setIsImporting(true);
    setImportProgress(0);

    try {
      await ed.importManager.importFile(file, (progress) => {
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
    const ed = getEditorInstance();
    if (!ed) return;
    
    // Create new scene instance of the asset
    const id = "instance_" + Math.random().toString(36).substr(2, 9);
    
    // We duplicate the root mesh node of the asset
    const rootNode = ed.nodesMap.get(assetId);
    if (!rootNode) return;

    const duplicatedId = ed.objectManager.duplicateObject(assetId);
    if (duplicatedId) {
      // Offset slightly to prevent perfect overlapping
      const node = ed.nodesMap.get(duplicatedId);
      if (node) {
        node.position.x += (Math.random() - 0.5) * 2;
        node.position.z += (Math.random() - 0.5) * 2;
        ed.objectManager.updateObjectStateFromBabylon(duplicatedId);
        
        // Auto-select the newly spawned instance
        ed.selectionManager.selectObject(duplicatedId);
      }
    }
  };


  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full text-slate-800 select-none font-sans shadow-lg">
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-700">Asset Library</span>
        <label className="cursor-pointer flex items-center gap-1.5 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs">
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
      <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-white">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-slate-50 text-xs text-slate-900 px-2 py-1.5 rounded-lg w-full outline-none border border-slate-200 focus:border-emerald-500 font-medium"
        />
      </div>

      {/* Asset List */}
      <div className="flex-1 overflow-y-auto p-3">
        {isImporting && (
          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-xl mb-3 gap-2">
            <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
            <span className="text-xs text-slate-600 font-medium">Importing Model ({importProgress}%)</span>
          </div>
        )}

        {filteredAssets.length === 0 ? (
          <div className="text-xs text-slate-400 text-center mt-8">
            No assets imported yet. Upload a .glb or .gltf model to begin.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                onClick={() => spawnInstance(asset.id, asset.name)}
                className="group relative bg-slate-50 border border-slate-200 hover:border-emerald-500 p-2.5 rounded-xl cursor-pointer transition-all flex flex-col items-center justify-center gap-2 hover:shadow-md"
              >
                {/* Visual placeholder box for model thumbnail */}
                <div className="w-full aspect-square bg-slate-200/60 rounded-lg flex items-center justify-center text-xs text-emerald-700 font-bold group-hover:scale-105 transition-transform">
                  3D Asset
                </div>
                <span className="text-xs font-semibold text-slate-800 truncate w-full text-center">
                  {asset.name}
                </span>

                <div className="absolute top-1.5 right-1.5 bg-emerald-600 p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
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
