"use client";

import { useState } from "react";
import { useEditorStore, SceneObject } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  Eye, EyeOff, Lock, Unlock, Trash2, FolderPlus, HelpCircle, Lightbulb, Camera, Search, ChevronRight, ChevronDown
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


  // Helper icons for different object types
  const getIcon = (type: string) => {
    switch (type) {
      case "group": return <FolderPlus className="w-4 h-4 text-amber-400" />;
      case "light": return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case "camera": return <Camera className="w-4 h-4 text-blue-400" />;
      default: return <HelpCircle className="w-4 h-4 text-emerald-400" />;
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
      // If none of children match either, skip rendering
      const anyChildMatches = children.some(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
      if (!anyChildMatches) return null;
    }

    return (
      <div key={obj.id} className="select-none text-white">
        <div
          onClick={(e) => handleSelect(obj.id, e)}
          onDoubleClick={(e) => startRename(obj.id, obj.name, e)}
          className={`flex items-center justify-between px-2 py-1.5 cursor-pointer text-sm transition-all rounded ${
            isSelected ? "bg-[#22a447]/30 border-l-2 border-[#22a447]" : "hover:bg-[#252525]"
          }`}
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          <div className="flex items-center gap-2 overflow-hidden flex-1">
            {/* Expand arrow */}
            {hasChildren ? (
              <button 
                onClick={(e) => toggleExpand(obj.id, e)} 
                className="hover:bg-white/10 p-0.5 rounded text-gray-400"
              >
                {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <div className="w-4.5" />
            )}

            {getIcon(obj.type)}

            {editingId === obj.id ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={finishRename}
                onKeyDown={(e) => e.key === "Enter" && finishRename()}
                className="bg-[#1a1a1a] text-white border border-[#333] px-1 rounded w-full outline-none text-xs"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span className="truncate text-xs font-medium text-gray-200">{obj.name}</span>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 hover:opacity-100 flex-shrink-0 transition-opacity">
            <button
              onClick={(e) => toggleVisibility(obj.id, e)}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
            >
              {obj.visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5 text-red-500" />}
            </button>
            <button
              onClick={(e) => toggleLock(obj.id, e)}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
            >
              {obj.locked ? <Lock className="w-3.5 h-3.5 text-red-500" /> : <Unlock className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={(e) => handleDelete(obj.id, e)}
              className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-red-500"
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
    <div className="w-64 bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col h-full select-none text-white">
      <div className="p-3 border-b border-[#2a2a2a] flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search scene..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-[#2a2a2a] text-xs text-white px-2 py-1.5 rounded w-full outline-none border border-transparent focus:border-[#22a447]"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2 group">
        {rootObjects.length === 0 ? (
          <div className="text-xs text-gray-500 text-center mt-8">Empty Scene</div>
        ) : (
          rootObjects.map(obj => renderNode(obj))
        )}
      </div>
    </div>
  );
}
