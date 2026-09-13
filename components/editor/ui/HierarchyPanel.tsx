"use client";

import { useState } from "react";
import { useEditorStore, SceneObject } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, FolderPlus, HelpCircle, Lightbulb, Camera, Search, ChevronRight, ChevronDown, Layers, Box, Sprout
} from "lucide-react";

export function HierarchyPanel() {
  const { selectedIds, setSelectedIds, getObjects } = useEditorStore();
  const objects = getObjects();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const editor = useEditorInstance();

  const handleSelect = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const ed = getEditorInstance();
    const isMulti = event.ctrlKey || event.metaKey;
    if (ed) {
      ed.selectionManager.selectObject(id, isMulti);
    } else {
      setSelectedIds(isMulti ? [...selectedIds, id] : [id]);
    }
  };

  const toggleExpand = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedNodes(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleVisibility = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const obj = objects.find(o => o.id === id);
    const ed = getEditorInstance();
    if (obj && ed) {
      ed.objectManager.setVisibility(id, !obj.visible);
    }
  };

  const toggleLock = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const obj = objects.find(o => o.id === id);
    const ed = getEditorInstance();
    if (obj && ed) {
      ed.objectManager.setLocked(id, !obj.locked);
    }
  };

  const handleDelete = (id: string, event: React.MouseEvent) => {
    event.stopPropagation();
    const ed = getEditorInstance();
    if (ed) {
      ed.objectManager.deleteObject(id);
    }
  };

  const startRename = (id: string, currentName: string, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingId(id);
    setEditName(currentName);
  };

  const finishRename = () => {
    if (editingId && editName.trim() !== "") {
      useEditorStore.getState().updateObject(editingId, { name: editName });
      const ed = getEditorInstance();
      const node = ed?.nodesMap.get(editingId);
      if (node) {
        node.name = editName;
      }
    }
    setEditingId(null);
  };

  // Helper icons for different object types with vibrant playful colors
  const getIcon = (type: string) => {
    switch (type) {
      case "group": return <FolderPlus className="w-3.5 h-3.5 text-amber-400" />;
      case "light": return <Lightbulb className="w-3.5 h-3.5 text-yellow-400" />;
      case "camera": return <Camera className="w-3.5 h-3.5 text-cyan-400" />;
      case "agri": return <Sprout className="w-3.5 h-3.5 text-lime-400" />;
      default: return <Box className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  // Render a node and its children recursively
  const renderNode = (obj: SceneObject, depth = 0) => {
    const children = objects.filter(o => o.parentId === obj.id);
    const isExpanded = !!expandedNodes[obj.id];
    const isSelected = selectedIds.includes(obj.id);
    const hasChildren = children.length > 0;

    // Filter by search query if applicable
    if (searchQuery && !obj.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      const anyChildMatches = children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!anyChildMatches) return null;
    }

    return (
      <div key={obj.id} className="select-none text-white">
        <div
          onClick={(e) => handleSelect(obj.id, e)}
          onDoubleClick={(e) => startRename(obj.id, obj.name, e)}
          className={`group flex items-center justify-between px-2.5 py-2 cursor-pointer text-xs transition-all rounded-xl mb-1 border ${
            isSelected 
              ? "bg-emerald-500/20 border-emerald-500/60 text-emerald-200 shadow-[0_0_12px_rgba(16,185,129,0.2)]" 
              : "border-transparent hover:bg-[#202026] text-zinc-300 hover:text-white"
          }`}
          style={{ paddingLeft: `${depth * 12 + 10}px` }}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {/* Expand arrow */}
            {hasChildren ? (
              <button 
                onClick={(e) => toggleExpand(obj.id, e)} 
                className="hover:bg-white/10 p-0.5 rounded text-zinc-400 hover:text-zinc-200"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-3.5" />
            )}

            <div className="p-1 rounded-lg bg-zinc-800/80 border border-white/5 flex-shrink-0">
              {getIcon(obj.type)}
            </div>

            {editingId === obj.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => e.key === "Enter" && finishRename()}
                className="bg-[#1e1e23] text-white border border-emerald-500 px-2 py-0.5 rounded-lg w-full outline-none text-xs"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className={`truncate text-xs font-semibold ${isSelected ? "text-emerald-300 font-bold" : "text-zinc-200"}`}>
                {obj.name}
              </span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 flex-shrink-0 transition-opacity">
            <button
              onClick={(e) => toggleVisibility(obj.id, e)}
              className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              title={obj.visible ? "Sembunyikan" : "Tampilkan"}
            >
              {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-rose-400" />}
            </button>
            <button
              onClick={(e) => toggleLock(obj.id, e)}
              className="p-1 hover:bg-white/10 rounded-md text-zinc-400 hover:text-white transition-colors"
              title={obj.locked ? "Buka Kunci" : "Kunci"}
            >
              {obj.locked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => handleDelete(obj.id, e)}
              className="p-1 hover:bg-rose-500/20 rounded-md text-zinc-400 hover:text-rose-400 transition-colors"
              title="Hapus"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div className="flex flex-col">
            {children.map(child => renderNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  // Find root nodes (no parentId)
  const rootObjects = objects.filter(o => !o.parentId);

  return (
    <div className="w-68 bg-[#161619] border-r border-[#27272a] flex flex-col h-full select-none text-white font-sans shadow-2xl">
      {/* Header */}
      <div className="p-3.5 border-b border-[#27272a] flex items-center justify-between bg-[#131316]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-bold tracking-wide text-zinc-100">Hierarchy</span>
        </div>
        <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
          {objects.length} Objects
        </span>
      </div>

      {/* Search box */}
      <div className="p-3 border-b border-[#27272a]/60 bg-[#161619]">
        <div className="flex items-center gap-2 bg-[#1e1e23] px-2.5 py-1.5 rounded-xl border border-zinc-700/80 focus-within:border-emerald-500 transition-colors">
          <Search className="w-3.5 h-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Cari objek..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-zinc-500 w-full outline-none font-medium"
          />
        </div>
      </div>

      {/* Object List */}
      <div className="flex-1 overflow-y-auto p-2.5">
        {rootObjects.length === 0 ? (
          <div className="text-xs text-zinc-500 text-center py-8">
            Scene kosong.
          </div>
        ) : (
          rootObjects.map(obj => renderNode(obj))
        )}
      </div>
    </div>
  );
}


