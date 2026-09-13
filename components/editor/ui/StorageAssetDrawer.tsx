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
  fetchAssetUrl,
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

  // Storage Data (Loaded purely from API)
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
  const [categoryInputMode, setCategoryInputMode] = useState<"select" | "custom">("select");
  const [uploadCategoryId, setUploadCategoryId] = useState<string | number>("");
  const [uploadCategoryName, setUploadCategoryName] = useState("");
  const [uploadIsPublic, setUploadIsPublic] = useState(true);
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
      setCategories(cats || []);
      if (cats && cats.length > 0 && !uploadCategoryId) {
        const firstReal = cats.find((c) => c.id !== "all");
        if (firstReal) setUploadCategoryId(firstReal.id);
      }
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    }
  };

  const loadAssets = async () => {
    setLoading(true);
    try {
      const selectedCatObj = categories.find((c) => String(c.id) === String(selectedCategory));
      const categoryName = selectedCategory !== "all" ? (selectedCatObj?.name || String(selectedCategory)) : undefined;

      const list = await fetchAssets({
        category: categoryName,
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

    setInsertingId(asset.id);
    setInsertProgress(0);

    try {
      let fileUrl = resolveAssetFileUrl(asset);
      if (!fileUrl && asset.id) {
        fileUrl = await fetchAssetUrl(asset.id);
      }

      if (!fileUrl) {
        alert(`Asset "${asset.name}" has no valid file URL.`);
        return;
      }
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

  // 3. Upload File to Cloud Storage: POST /api/assets/upload
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
    
    // According to API spec:
    // jika pengguna memilih kategori berarti input category_id
    // jika pengguna input kategori sendiri berarti input category_name
    if (categoryInputMode === "select") {
      if (uploadCategoryId && uploadCategoryId !== "all") {
        formData.append("category_id", String(uploadCategoryId));
      }
    } else {
      if (uploadCategoryName.trim()) {
        formData.append("category_name", uploadCategoryName.trim());
      }
    }

    // is_public: boolean (send "1" or "0" for multipart/form-data Laravel validation)
    formData.append("is_public", uploadIsPublic ? "1" : "0");

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
      setUploadCategoryName("");
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
      // Fallback local addition if backend endpoint is unavailable
      const localCat: AssetCategory = {
        id: "cat_" + Math.random().toString(36).substring(2, 9),
        name: newCategoryName.trim(),
        description: newCategoryDesc.trim() || undefined,
      };
      setCategories((prev) => [...prev, localCat]);
      setSelectedCategory(localCat.id);
      setIsNewCategoryModalOpen(false);
      setNewCategoryName("");
      setNewCategoryDesc("");
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
        formData.append("is_public", "1");
        if (selectedCategory && selectedCategory !== "all") {
          const selectedCatObj = categories.find((c) => String(c.id) === String(selectedCategory) || c.name === selectedCategory);
          const catName = selectedCatObj ? selectedCatObj.name : String(selectedCategory);
          formData.append("category", catName);
          formData.append("category_name", catName);
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
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full text-slate-800 select-none z-10 shadow-lg font-sans">
      {/* Top Header */}
      <div className="p-3.5 border-b border-slate-200 bg-slate-50 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 border border-emerald-300/60 flex items-center justify-center text-emerald-700">
              <FileBox className="w-3.5 h-3.5" />
            </div>
            <span className="text-xs font-bold tracking-tight text-slate-900">
              Asset Storage & Library
            </span>
          </div>

          <button
            onClick={() => loadAssets()}
            className="p-1.5 text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-200 transition-colors"
            title="Refresh assets"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-600" : ""}`} />
          </button>
        </div>

        {/* Source Selector: Cloud Storage (API) vs Browse Local */}
        <div className="grid grid-cols-2 p-1 bg-slate-200/70 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setSourceMode("storage")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              sourceMode === "storage"
                ? "bg-white text-emerald-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            Cloud Storage
          </button>
          <button
            onClick={() => setSourceMode("browse")}
            className={`py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              sourceMode === "browse"
                ? "bg-white text-emerald-700 font-bold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            Local Files
          </button>
        </div>
      </div>

      {/* ===================== MODE 1: CLOUD STORAGE (API) ===================== */}
      {sourceMode === "storage" && (
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Action Bar: Upload to Cloud + New Category */}
          <div className="p-3 border-b border-slate-200 flex items-center gap-2 bg-white">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="bouncy-hover flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 stroke-[2.5]" />
              Upload Asset
            </button>
            <button
              onClick={() => setIsNewCategoryModalOpen(true)}
              className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              title="Add Category"
            >
              <FolderPlus className="w-3.5 h-3.5 text-emerald-600" />
              Category
            </button>
          </div>

          {/* Search and Category Filter */}
          <div className="p-3 border-b border-slate-200 flex flex-col gap-2.5 bg-slate-50">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3" />
              <input
                type="text"
                placeholder="Search models & textures..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white text-xs text-slate-900 pl-9 pr-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 transition-colors font-medium"
              />
            </form>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] no-scrollbar">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold cursor-pointer ${
                  selectedCategory === "all"
                    ? "bg-emerald-600 text-white font-bold shadow-xs"
                    : "bg-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                }`}
              >
                All ({assets.length})
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-semibold cursor-pointer ${
                    selectedCategory === cat.id
                      ? "bg-emerald-600 text-white font-bold shadow-xs"
                      : "bg-slate-200/70 text-slate-600 hover:text-slate-900 hover:bg-slate-200"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Asset List Grid */}
          <div className="flex-1 overflow-y-auto p-3">
            {loading && (
              <div className="flex flex-col items-center justify-center p-8 gap-2 text-slate-400">
                <Loader2 className="w-6 h-6 text-emerald-600 animate-spin" />
                <span className="text-xs font-medium">Memuat aset cloud...</span>
              </div>
            )}

            {!loading && assets.length === 0 && (
              <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-1.5 border border-slate-200 rounded-xl my-2 bg-slate-50">
                <span className="text-xs font-bold text-slate-700">Belum ada aset tersimpan</span>
                <span className="text-[11px] text-slate-500">Upload model 3D di atas untuk memulai.</span>
              </div>
            )}

            {!loading && assets.length > 0 && (
              <div className="grid grid-cols-2 gap-2.5">
                {assets.map((asset) => {
                  const isBeingInserted = insertingId === asset.id;
                  const is3D = !asset.type || asset.type.includes("glb") || asset.type.includes("gltf");

                  return (
                    <div
                      key={asset.id}
                      onClick={() => !isBeingInserted && handleInsertCloudAsset(asset)}
                      className={`group relative bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-emerald-500/60 p-2 rounded-xl cursor-pointer transition-all flex flex-col items-center gap-1.5 bouncy-hover shadow-xs ${
                        isBeingInserted ? "border-emerald-500 ring-2 ring-emerald-500/30" : ""
                      }`}
                    >
                      {/* Asset Preview Frame */}
                      <div className="w-full aspect-square bg-slate-200/60 rounded-lg border border-slate-200 relative overflow-hidden flex items-center justify-center">
                        {isBeingInserted ? (
                          <div className="flex flex-col items-center gap-1 text-emerald-600">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="text-[10px] font-mono font-bold">{insertProgress}%</span>
                          </div>
                        ) : asset.thumbnail_url ? (
                          <img src={asset.thumbnail_url} alt={asset.name} className="w-full h-full object-cover" />
                        ) : is3D ? (
                          <div className="flex flex-col items-center gap-1 text-emerald-600">
                            <Box className="w-6 h-6" />
                            <span className="text-[8.5px] uppercase font-bold tracking-wider">3D</span>
                          </div>
                        ) : asset.type === "image" ? (
                          <ImageIcon className="w-6 h-6 text-pink-500" />
                        ) : asset.type === "video" ? (
                          <Video className="w-6 h-6 text-blue-500" />
                        ) : (
                          <Music className="w-6 h-6 text-teal-600" />
                        )}

                        {/* Format badge */}
                        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-white/90 shadow-xs backdrop-blur-sm rounded-md text-[8px] font-bold text-emerald-800 uppercase border border-slate-200">
                          {asset.type || "3D"}
                        </div>

                        {/* Hover Overlay Action */}
                        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => handleInsertCloudAsset(asset)}
                            className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-white font-bold shadow-md cursor-pointer"
                            title="Insert into Scene"
                          >
                            <Plus className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCloudAsset(e, asset)}
                            className="p-1.5 bg-white hover:bg-rose-600 hover:text-white rounded-lg text-slate-700 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Asset Title & Category Badge */}
                      <div className="w-full flex flex-col overflow-hidden text-center gap-0.5 px-1">
                        <span className="text-[11px] font-bold text-slate-800 group-hover:text-emerald-700 truncate" title={asset.name}>
                          {asset.name}
                        </span>
                        {(() => {
                          const catName = typeof asset.category === "object" && asset.category !== null
                            ? asset.category.name
                            : typeof asset.category === "string" && asset.category
                            ? asset.category
                            : categories.find((c) => String(c.id) === String(asset.category_id))?.name;
                          return catName ? (
                            <span className="text-[9px] text-emerald-800 font-medium truncate px-1.5 py-0.2 rounded-full bg-emerald-100 border border-emerald-300/60 self-center max-w-full">
                              {catName}
                            </span>
                          ) : null;
                        })()}
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
        <div className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-bold text-slate-900">Local File Import</span>
            <span className="text-[11px] text-slate-500">
              Muat file .glb, .gltf, tekstur, atau media langsung ke scene 3D.
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
            className={`border-2 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center gap-3 text-center transition-all ${
              isDraggingOver
                ? "border-emerald-500 bg-emerald-50 scale-102"
                : "border-slate-300 bg-slate-50 hover:border-emerald-500/50"
            }`}
          >
            <div className="w-11 h-11 rounded-xl bg-emerald-100 border border-emerald-300/60 text-emerald-700 flex items-center justify-center">
              <Upload className="w-5 h-5" />
            </div>

            <div className="flex flex-col gap-0.5">
              <span className="text-xs font-bold text-slate-800">Tarik & Lepas file di sini</span>
              <span className="text-[10px] text-slate-500">.GLB, .GLTF, .PNG, .JPG, .MP4, .MP3</span>
            </div>

            <label className="bouncy-hover cursor-pointer px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-sm mt-1">
              {localBrowseLoading ? "Sedang Mengimpor..." : "Pilih File dari Komputer"}
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
          <label className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 flex items-center justify-between cursor-pointer transition-colors">
            <div className="flex flex-col">
              <span className="text-xs font-semibold text-slate-800">Sinkronkan ke Cloud API</span>
              <span className="text-[10px] text-slate-500">Otomatis simpan salinan ke API backend</span>
            </div>
            <input
              type="checkbox"
              checked={alsoUploadToCloud}
              onChange={(e) => setAlsoUploadToCloud(e.target.checked)}
              className="w-4 h-4 accent-emerald-600 rounded"
            />
          </label>
        </div>
      )}

      {/* ===================== UPLOAD TO CLOUD MODAL ===================== */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm p-5 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <Cloud className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">Upload Asset Baru</h3>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-3 text-xs">
              <div className="flex flex-col gap-1.5">
                <span className="text-slate-700 font-semibold">File 3D / Media</span>
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
                  className="bg-slate-50 p-2 rounded-xl border border-slate-200 text-slate-700 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-600 file:text-white hover:file:bg-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <span className="text-slate-700 font-semibold">Nama Asset</span>
                <input
                  type="text"
                  placeholder="e.g. Bunga Biru Cantik"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="bg-slate-50 px-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 font-medium text-slate-900"
                  required
                />
              </div>

              {/* Category selection mode switch */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">Kategori</span>
                  <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[10.5px]">
                    <button
                      type="button"
                      onClick={() => setCategoryInputMode("select")}
                      className={`px-2.5 py-0.5 rounded-md transition-all font-semibold ${
                        categoryInputMode === "select" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Pilih (ID)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCategoryInputMode("custom")}
                      className={`px-2.5 py-0.5 rounded-md transition-all font-semibold ${
                        categoryInputMode === "custom" ? "bg-white text-emerald-800 shadow-xs" : "text-slate-500 hover:text-slate-800"
                      }`}
                    >
                      Kustom Nama
                    </button>
                  </div>
                </div>

                {categoryInputMode === "select" ? (
                  <select
                    value={uploadCategoryId}
                    onChange={(e) => setUploadCategoryId(e.target.value)}
                    className="bg-slate-50 px-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-slate-900 font-medium"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.filter((c) => c.id !== "all").map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    placeholder="e.g. Bunga"
                    value={uploadCategoryName}
                    onChange={(e) => setUploadCategoryName(e.target.value)}
                    className="bg-slate-50 px-3 py-2 rounded-xl outline-none border border-slate-200 focus:border-emerald-500 text-slate-900 font-medium"
                  />
                )}
              </div>

              {/* Public Asset Toggle */}
              <label className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <span className="text-slate-700 font-semibold text-xs">Jadikan Aset Publik</span>
                <input
                  type="checkbox"
                  checked={uploadIsPublic}
                  onChange={(e) => setUploadIsPublic(e.target.checked)}
                  className="w-4 h-4 accent-emerald-600 rounded"
                />
              </label>

              {isUploading && (
                <div className="flex flex-col gap-1.5 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                    <span>Sedang mengunggah...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-150"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-semibold text-slate-700 transition-colors"
                  disabled={isUploading}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="bouncy-hover flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {isUploading ? "Mengunggah..." : "Simpan Aset"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== CREATE CATEGORY MODAL ===================== */}
      {isNewCategoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xs p-5 text-slate-900 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-900">Tambah Kategori Baru</h3>
              </div>
              <button
                onClick={() => setIsNewCategoryModalOpen(false)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="flex flex-col gap-2.5 text-xs">
              <div className="flex flex-col gap-1">
                <span className="text-slate-600 font-medium">Category Name</span>
                <input
                  type="text"
                  placeholder="e.g. Sensors"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="bg-slate-50 px-2.5 py-1.5 rounded-lg outline-none border border-slate-200 focus:border-emerald-500 text-slate-900"
                  required
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewCategoryModalOpen(false)}
                  className="flex-1 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingCategory || !newCategoryName.trim()}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg font-medium flex items-center justify-center gap-1"
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
