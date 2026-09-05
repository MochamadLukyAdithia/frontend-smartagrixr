"use client";

import { useState, useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  fetchAssetCategories, 
  createAssetCategory, 
  fetchAssets, 
  uploadAsset, 
  deleteAsset, 
  resolveAssetFileUrl,
  AssetCategory, 
  CloudAsset 
} from "@/lib/api/assets";
import { 
  Cloud, 
  HardDrive, 
  Upload, 
  Plus, 
  Search, 
  Loader2, 
  Trash2, 
  FolderPlus, 
  Box, 
  Image as ImageIcon, 
  Video, 
  Music, 
  Check, 
  X, 
  FileBox,
  RefreshCw
} from "lucide-react";

export function StorageAssetDrawer() {
  const { addAsset } = useEditorStore();
  const editor = getEditorInstance();

  // Mode: Cloud Storage vs Local Browse
  const [sourceMode, setSourceMode] = useState<"storage" | "browse">("storage");

  // Storage Data
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | number>("all");
  const [assets, setAssets] = useState<CloudAsset[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [loading, setLoading] = useState(false);

  // Inserting State
  const [insertingId, setInsertingId] = useState<string | number | null>(null);
  const [insertProgress, setInsertProgress] = useState(0);

  // Upload Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState("");
  const [uploadCategoryId, setUploadCategoryId] = useState<string | number>("");
  const [uploadDescription, setUploadDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // New Category Modal State
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);

  // Local Browse drag & drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [alsoUploadToCloud, setAlsoUploadToCloud] = useState(true);
  const [localBrowseLoading, setLocalBrowseLoading] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    if (sourceMode === "storage") {
      loadAssets();
    }
  }, [selectedCategory, selectedType, sourceMode]);

  const loadCategories = async () => {
    try {
      const cats = await fetchAssetCategories();
      setCategories(cats);
      if (cats.length > 0 && !uploadCategoryId) {
        const firstReal = cats.find((c) => c.id !== "all");
        if (firstReal) setUploadCategoryId(firstReal.id);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const list = await fetchAssets({
        category_id: selectedCategory === "all" ? undefined : selectedCategory,
        search: searchQuery.trim() || undefined,
        type: selectedType === "all" ? undefined : selectedType,
      });
      setAssets(list);
    } catch (err) {
      console.warn("Failed to load assets", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadAssets();
  };

  // 1. Insert Cloud Asset into 3D Scene
  const handleInsertCloudAsset = async (asset: CloudAsset) => {
    const ed = getEditorInstance();
    if (!ed) return;

    const fileUrl = resolveAssetFileUrl(asset);
    if (!fileUrl) {
      alert(`Asset "${asset.name}" has no valid file URL.`);
      return;
    }

    setInsertingId(asset.id);
    setInsertProgress(0);

    try {
      const ext = (asset.type || fileUrl.split(".").pop() || "glb").toLowerCase();
      if (ext.includes("glb") || ext.includes("gltf")) {
        await ed.importManager.importFromUrl(fileUrl, asset.name, (pct) => {
          setInsertProgress(Math.round(pct * 100));
        });
      } else if (ext.includes("png") || ext.includes("jpg") || ext.includes("jpeg") || ext.includes("webp") || ext.includes("image")) {
        ed.objectManager.createImage(fileUrl, asset.name);
      } else if (ext.includes("mp4") || ext.includes("webm") || ext.includes("video")) {
        ed.objectManager.createVideo(fileUrl, asset.name);
      } else if (ext.includes("mp3") || ext.includes("wav") || ext.includes("audio")) {
        ed.objectManager.createAudio(fileUrl, asset.name);
      } else {
        await ed.importManager.importFromUrl(fileUrl, asset.name);
      }
    } catch (err: any) {
      console.error("Failed to insert asset into 3D scene", err);
      alert(`Failed to load asset "${asset.name}" into scene.`);
    } finally {
      setInsertingId(null);
      setInsertProgress(0);
    }
  };


  // 2. Delete Asset from Cloud Storage
  const handleDeleteCloudAsset = async (e: React.MouseEvent, asset: CloudAsset) => {
    e.stopPropagation();
    if (!confirm(`Delete "${asset.name}" from storage?`)) return;

    try {
      await deleteAsset(asset.id);
      setAssets((prev) => prev.filter((a) => a.id !== asset.id));
    } catch (err: any) {
      alert(`Failed to delete asset: ${err?.message || "Error"}`);
    }
  };

  // 3. Upload File to Cloud Storage
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", uploadFile);
    formData.append("name", uploadName || uploadFile.name.replace(/\.[^/.]+$/, ""));
    if (uploadCategoryId && uploadCategoryId !== "all") {
      formData.append("category_id", String(uploadCategoryId));
    }
    if (uploadDescription) {
      formData.append("description", uploadDescription);
    }

    const fileExt = uploadFile.name.split(".").pop()?.toLowerCase() || "glb";
    formData.append("type", fileExt);

    try {
      const newAsset = await uploadAsset(formData, (progress) => {
        setUploadProgress(progress);
      });

      setAssets((prev) => [newAsset, ...prev]);
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadName("");
      setUploadDescription("");
    } catch (err: any) {
      alert(`Upload failed: ${err?.message || "Network error"}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  // 4. Create Category
  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;

    setIsCreatingCategory(true);
    try {
      const created = await createAssetCategory({
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      });
      setCategories((prev) => [...prev, created]);
      setSelectedCategory(created.id);
      setIsNewCategoryModalOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
    } catch (err: any) {
      alert(`Failed to create category: ${err?.message || "Error"}`);
    } finally {
      setIsCreatingCategory(false);
    }
  };

  // 5. Handle Direct Local Browse File Selection
  const handleLocalFileSelect = async (file: File) => {
    if (!editor) return;
    setLocalBrowseLoading(true);

    try {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (ext === "glb" || ext === "gltf") {
        await editor.importManager.importFile(file);
      } else if (["png", "jpg", "jpeg", "webp"].includes(ext)) {
        editor.objectManager.createImage(file);
        addAsset({ id: "img_" + Date.now(), name: file.name, url: file.name, type: "image" });
      } else if (["mp4", "webm"].includes(ext)) {
        editor.objectManager.createVideo(file);
        addAsset({ id: "vid_" + Date.now(), name: file.name, url: file.name, type: "video" });
      } else if (["mp3", "wav"].includes(ext)) {
        editor.objectManager.createAudio(file);
        addAsset({ id: "aud_" + Date.now(), name: file.name, url: file.name, type: "audio" });
      } else {
        alert("Unsupported file format. Please use .glb, .gltf, images, or media files.");
      }

      if (alsoUploadToCloud) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("name", file.name.replace(/\.[^/.]+$/, ""));
        formData.append("type", ext);
        if (selectedCategory && selectedCategory !== "all") {
          formData.append("category_id", String(selectedCategory));
        }
        uploadAsset(formData).then((cloud) => {
          setAssets((prev) => [cloud, ...prev]);
        }).catch((e) => console.warn("Background upload skipped:", e));
      }
    } catch (err) {
      console.error("Local file import failed", err);
      alert("Failed to load local file into 3D scene.");
    } finally {
      setLocalBrowseLoading(false);
    }
  };

  return (
    <div className="w-80 bg-[#141416] border-r border-[#242427] flex flex-col h-full text-white select-none z-10">
      {/* Top Header */}
      <div className="p-3 border-b border-[#242427] bg-[#111113] flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileBox className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold tracking-tight text-zinc-200">
              Asset Manager
            </span>
          </div>

          <button
            onClick={() => loadAssets()}
            className="p-1 text-zinc-400 hover:text-white rounded hover:bg-zinc-800 transition-colors"
            title="Refresh assets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>

        {/* Source Selector: Cloud Storage (API) vs Browse Local */}
        <div className="grid grid-cols-2 p-0.5 bg-[#1c1c1f] rounded-lg border border-zinc-800 text-xs font-medium">
          <button
            onClick={() => setSourceMode("storage")}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              sourceMode === "storage"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Cloud API
          </button>
          <button
            onClick={() => setSourceMode("browse")}
            className={`py-1.5 rounded-md flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
              sourceMode === "browse"
                ? "bg-zinc-700 text-white"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Browse File
          </button>
        </div>
      </div>

      {/* ===================== MODE 1: CLOUD STORAGE (API) ===================== */}
      {sourceMode === "storage" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Bar: Upload to Cloud + New Category */}
          <div className="p-2.5 border-b border-[#242427] flex items-center gap-1.5">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex-1 py-1.5 px-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Asset
            </button>
            <button
              onClick={() => setIsNewCategoryModalOpen(true)}
              className="py-1.5 px-2.5 bg-[#1c1c1f] hover:bg-[#232327] text-zinc-300 border border-zinc-800 rounded-md text-xs font-medium flex items-center justify-center gap-1 transition-colors cursor-pointer"
              title="Add Category"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-400" />
              Category
            </button>
          </div>

          {/* Search and Category Filter */}
          <div className="p-2.5 border-b border-[#242427] flex flex-col gap-2 bg-[#121214]">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5" />
              <input
                type="text"
                placeholder="Search storage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#1c1c1f] text-xs text-white pl-8 pr-3 py-1.5 rounded-md outline-none border border-zinc-800 focus:border-zinc-600"
              />
            </form>

            {/* Category Pills */}
            <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-2.5 py-0.5 rounded-md whitespace-nowrap transition-colors font-medium cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-zinc-700 text-zinc-100"
                    : "bg-[#1c1c1f] text-zinc-400 hover:text-zinc-200"
                }`}
              >
                All ({assets.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-0.5 rounded-md whitespace-nowrap transition-colors font-medium cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-zinc-700 text-zinc-100"
                      : "bg-[#1c1c1f] text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Asset List Grid */}
          <div className="flex-1 overflow-y-auto p-2.5">
            {loading && (
              <div className="flex flex-col items-center justify-center p-8 gap-2 text-zinc-400">
                <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                <span className="text-xs">Loading assets...</span>
              </div>
            )}

            {!loading && assets.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center text-zinc-500 gap-2 border border-dashed border-zinc-800 rounded-lg my-2">
                <Cloud className="w-6 h-6 text-zinc-600" />
                <span className="text-xs font-medium text-zinc-400">No assets in storage</span>
                <span className="text-[10px]">Upload assets above or use Browse File to import.</span>
              </div>
            )}

            {!loading && assets.length > 0 && (
              <div className="grid grid-cols-2 gap-2">
                {assets.map((asset) => {
                  const isBeingInserted = insertingId === asset.id;
                  const is3D = !asset.type || asset.type.includes("glb") || asset.type.includes("gltf");

                  return (
                    <div
                      key={asset.id}
                      onClick={() => !isBeingInserted && handleInsertCloudAsset(asset)}
                      className={`group relative bg-[#1c1c1f] hover:bg-[#232327] border border-zinc-800 hover:border-zinc-600 p-2 rounded-lg cursor-pointer transition-colors flex flex-col items-center gap-1.5 ${
                        isBeingInserted ? "border-emerald-500" : ""
                      }`}
                    >
                      {/* Asset Preview Frame */}
                      <div className="w-full aspect-square bg-[#111113] rounded border border-zinc-800/80 relative overflow-hidden flex items-center justify-center">
                        {isBeingInserted ? (
                          <div className="flex flex-col items-center gap-1 text-emerald-400">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="text-[10px] font-mono">{insertProgress}%</span>
                          </div>
                        ) : asset.thumbnail_url ? (
                          <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : is3D ? (
                          <div className="flex flex-col items-center gap-1 text-zinc-400">
                            <Box className="w-5 h-5" />
                            <span className="text-[8.5px] uppercase font-mono">3D</span>
                          </div>
                        ) : asset.type === "image" ? (
                          <ImageIcon className="w-5 h-5 text-zinc-400" />
                        ) : asset.type === "video" ? (
                          <Video className="w-5 h-5 text-zinc-400" />
                        ) : (
                          <Music className="w-5 h-5 text-zinc-400" />
                        )}

                        {/* Format badge */}
                        <div className="absolute top-1 left-1 px-1 py-0.2 bg-black/80 rounded text-[7.5px] font-mono text-zinc-400 uppercase">
                          {asset.type || "3D"}
                        </div>

                        {/* Hover Overlay Action */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleInsertCloudAsset(asset)}
                            className="p-1 bg-emerald-600 hover:bg-emerald-500 rounded text-white"
                            title="Insert into Scene"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCloudAsset(e, asset)}
                            className="p-1 bg-zinc-800 hover:bg-red-600 rounded text-zinc-300 hover:text-white"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Asset Title */}
                      <div className="w-full flex flex-col overflow-hidden text-center">
                        <span className="text-[11px] font-medium text-zinc-200 group-hover:text-white truncate" title={asset.name}>
                          {asset.name}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===================== MODE 2: BROWSE LOCAL FILES ===================== */}
      {sourceMode === "browse" && (
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold text-zinc-200">Local File Import</span>
            <span className="text-[10.5px] text-zinc-400">
              Load .glb, .gltf, textures, or media files directly into active scene.
            </span>
          </div>

          {/* Drag and Drop Zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDraggingOver(true);
            }}
            onDragLeave={() => setIsDraggingOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDraggingOver(false);
              const files = e.dataTransfer.files;
              if (files && files.length > 0) {
                handleLocalFileSelect(files[0]);
              }
            }}
            className={`border border-dashed rounded-lg p-5 flex flex-col items-center justify-center gap-2.5 text-center transition-colors ${
              isDraggingOver
                ? "border-emerald-500 bg-emerald-950/20"
                : "border-zinc-800 bg-[#1c1c1f] hover:border-zinc-700"
            }`}
          >
            <div className="w-9 h-9 rounded-md bg-zinc-900 border border-zinc-800 text-zinc-400 flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-medium text-zinc-200">Drag & drop files here</span>
              <span className="text-[9.5px] text-zinc-500">.GLB, .GLTF, .PNG, .JPG, .MP4, .MP3</span>
            </div>

            <label className="cursor-pointer px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md text-xs font-medium transition-colors mt-0.5">
              {localBrowseLoading ? "Importing..." : "Choose File"}
              <input
                type="file"
                accept=".glb,.gltf,.png,.jpg,.jpeg,.webp,.mp4,.webm,.mp3,.wav"
                onChange={(e) => {
                  if (e.target.files && e.target.files.length > 0) {
                    handleLocalFileSelect(e.target.files[0]);
                  }
                }}
                className="hidden"
                disabled={localBrowseLoading}
              />
            </label>
          </div>

          {/* Sync Option: Also save to Cloud Storage */}
          <label className="p-2.5 bg-[#1c1c1f] rounded-lg border border-zinc-800 flex items-center justify-between cursor-pointer">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-zinc-300">Sync to Cloud Storage</span>
              <span className="text-[9.5px] text-zinc-500">Upload copy to API Storage</span>
            </div>
            <input
              type="checkbox"
              checked={alsoUploadToCloud}
              onChange={(e) => setAlsoUploadToCloud(e.target.checked)}
              className="w-3.5 h-3.5 accent-emerald-500 rounded"
            />
          </label>
        </div>
      )}

      {/* ===================== UPLOAD TO CLOUD MODAL ===================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-lg w-full max-w-sm p-4 text-white shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <Cloud className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold">Upload Asset to Storage</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 font-medium">Asset File</span>
                <input
                  type="file"
                  accept=".glb,.gltf,.png,.jpg,.jpeg,.webp,.mp4,.mp3"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setUploadFile(f);
                      if (!uploadName) setUploadName(f.name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="bg-[#111113] p-1.5 rounded border border-zinc-800 text-zinc-300 file:mr-2 file:py-0.5 file:px-2 file:rounded file:border-0 file:text-xs file:bg-zinc-800 file:text-zinc-200 hover:file:bg-zinc-700 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 font-medium">Name</span>
                <input
                  type="text"
                  placeholder="e.g. Soil Sensor Model"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="bg-[#111113] px-2.5 py-1.5 rounded outline-none border border-zinc-800 focus:border-zinc-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 font-medium">Category</span>
                <select
                  value={uploadCategoryId}
                  onChange={(e) => setUploadCategoryId(e.target.value)}
                  className="bg-[#111113] px-2.5 py-1.5 rounded outline-none border border-zinc-800 focus:border-zinc-600 text-white"
                >
                  <option value="">-- Select Category --</option>
                  {categories.filter((c) => c.id !== "all").map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {isUploading && (
                <div className="flex flex-col gap-1 bg-[#111113] p-2 rounded">
                  <div className="flex justify-between text-[10px] font-mono">
                    <span>Uploading...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded font-medium transition-colors"
                  disabled={isUploading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isUploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
                  {isUploading ? "Uploading..." : "Save to Storage"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CREATE CATEGORY MODAL ===================== */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-[#18181b] border border-zinc-800 rounded-lg w-full max-w-xs p-4 text-white shadow-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800 mb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-semibold">New Category</h3>
              </div>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="p-1 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400 font-medium">Category Name</span>
                <input
                  type="text"
                  placeholder="e.g. Sensors"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-[#111113] px-2.5 py-1.5 rounded outline-none border border-zinc-800 focus:border-zinc-600"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="flex-1 py-1.5 bg-zinc-800 hover:bg-zinc-700 rounded font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded font-medium flex items-center justify-center gap-1"
                >
                  {isCreatingCategory ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
