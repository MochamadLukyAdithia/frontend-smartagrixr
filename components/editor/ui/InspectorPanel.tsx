"use client";

import { useEffect, useState } from "react";
import { Quaternion } from "@babylonjs/core";
import { useEditorStore, Behaviour, Annotation } from "../store/useEditorStore";
import { getEditorInstance, useEditorInstance } from "../engine/editorInstance";
import { 
  Settings, 
  Eye, 
  Lock, 
  Check, 
  Plus, 
  Trash2, 
  ArrowLeft, 
  Copy, 
  Sparkles, 
  Type, 
  Palette, 
  Activity,
  Layers
} from "lucide-react";

export function InspectorPanel() {
  const { selectedIds, getObjects, updateObject, removeObject, animationState, setAnimationState } = useEditorStore();
  const selectedId = selectedIds[0];
  
  const sceneObjects = getObjects();
  const obj = sceneObjects.find((o) => o.id === selectedId);

  const editor = useEditorInstance();

  // Local state for transforms
  const [posX, setPosX] = useState(0);
  const [posY, setPosY] = useState(0);
  const [posZ, setPosZ] = useState(0);

  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [rotZ, setRotZ] = useState(0);

  const [sclX, setSclX] = useState(1);
  const [sclY, setSclY] = useState(1);
  const [sclZ, setSclZ] = useState(1);

  // Material Slots state
  const [materialSlots, setMaterialSlots] = useState<any[]>([]);
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);

  // Interactivity inputs
  const [trigger, setTrigger] = useState<"click" | "hover" | "start" | "collision">("click");
  const [action, setAction] = useState<"playAnimation" | "showInfo" | "moveObject" | "rotateObject" | "showObject" | "hideObject" | "openUrl" | "changeScene">("showInfo");
  const [target, setTarget] = useState("");
  const [actionUrl, setActionUrl] = useState("");
  const [infoTitle, setInfoTitle] = useState("");
  const [infoDesc, setInfoDesc] = useState("");

  // Annotation inputs
  const [annoTitle, setAnnoTitle] = useState("");
  const [annoDesc, setAnnoDesc] = useState("");

  // Text inputs
  const [textVal, setTextVal] = useState("");
  const [textColor, setTextColor] = useState("#22c55e");
  const [textSize, setTextSize] = useState(48);

  // Sync state with selected object
  useEffect(() => {
    if (obj) {
      setPosX(Number(obj.position[0].toFixed(2)));
      setPosY(Number(obj.position[1].toFixed(2)));
      setPosZ(Number(obj.position[2].toFixed(2)));

      setRotX(Number(obj.rotation[0].toFixed(1)));
      setRotY(Number(obj.rotation[1].toFixed(1)));
      setRotZ(Number(obj.rotation[2].toFixed(1)));

      setSclX(Number(obj.scale[0].toFixed(2)));
      setSclY(Number(obj.scale[1].toFixed(2)));
      setSclZ(Number(obj.scale[2].toFixed(2)));

      if (obj.textConfig) {
        setTextVal(obj.textConfig.text);
        setTextColor(obj.textConfig.color);
        setTextSize(obj.textConfig.size);
      }

      const ed = getEditorInstance();
      if (ed) {
        const slots = ed.materialManager.getMaterialSlots(obj.id);
        setMaterialSlots(slots);
        if (slots.length > 0) {
          setActiveSlotId(slots[0].slotId);
        }
      }
    }
  }, [obj, selectedId, editor]);

  const updateTransform = (
    axis: "x" | "y" | "z",
    val: number,
    type: "position" | "rotation" | "scale"
  ) => {
    if (!obj) return;
    const ed = getEditorInstance();
    ed?.historyManager.recordSnapshot();
    const node = ed?.nodesMap.get(obj.id);

    if (node) {
      if (type === "position") {
        node.position[axis] = val;
      } else if (type === "rotation") {
        const rad = (val * Math.PI) / 180;
        if (node.rotationQuaternion) {
          const euler = node.rotationQuaternion.toEulerAngles();
          euler[axis] = rad;
          node.rotationQuaternion = Quaternion.FromEulerAngles(euler.x, euler.y, euler.z);
        } else {
          node.rotation[axis] = rad;
        }
      } else if (type === "scale") {
        node.scaling[axis] = val;
      }

      const rot = node.rotationQuaternion
        ? node.rotationQuaternion.toEulerAngles()
        : node.rotation;

      updateObject(obj.id, {
        position: [node.position.x, node.position.y, node.position.z],
        rotation: [
          (rot.x * 180) / Math.PI,
          (rot.y * 180) / Math.PI,
          (rot.z * 180) / Math.PI,
        ],
        scale: [node.scaling.x, node.scaling.y, node.scaling.z],
      });
    } else {
      const currentPos = [...obj.position] as [number, number, number];
      const currentRot = [...obj.rotation] as [number, number, number];
      const currentScl = [...obj.scale] as [number, number, number];
      const axisIdx = axis === "x" ? 0 : axis === "y" ? 1 : 2;

      if (type === "position") currentPos[axisIdx] = val;
      if (type === "rotation") currentRot[axisIdx] = val;
      if (type === "scale") currentScl[axisIdx] = val;

      updateObject(obj.id, {
        position: currentPos,
        rotation: currentRot,
        scale: currentScl,
      });
    }
  };

  const handleMaterialChange = (prop: string, val: any) => {
    const ed = getEditorInstance();
    if (ed && activeSlotId && obj) {
      ed.historyManager.recordSnapshot();
      ed.materialManager.updateMaterialSlot(obj.id, activeSlotId, {
        [prop]: val,
      });
      const slots = ed.materialManager.getMaterialSlots(obj.id);
      setMaterialSlots(slots);
    }
  };

  const handleAddBehaviour = () => {
    if (!obj) return;
    const ed = getEditorInstance();
    ed?.historyManager.recordSnapshot();
    const newBehaviour: Behaviour = {
      trigger,
      action,
      target: target || obj.id,
      url: actionUrl,
      infoTitle: infoTitle || obj.name,
      infoDescription: infoDesc || obj.description || "Smart Agriculture module interaction.",
    };
    updateObject(obj.id, {
      behaviours: [...(obj.behaviours || []), newBehaviour],
    });
    setTarget("");
    setActionUrl("");
    setInfoTitle("");
    setInfoDesc("");
  };

  const handleAddAnnotation = () => {
    if (!obj || !annoTitle) return;
    const ed = getEditorInstance();
    ed?.historyManager.recordSnapshot();
    const newAnno: Annotation = {
      id: "anno_" + Math.random().toString(36).substring(2, 9),
      title: annoTitle,
      description: annoDesc,
      position: [0, 1.5, 0],
    };
    updateObject(obj.id, {
      annotations: [...(obj.annotations || []), newAnno],
    });
    setAnnoTitle("");
    setAnnoDesc("");
  };

  const handleUpdateText = (newText: string, newColor: string, newSize: number) => {
    if (!obj) return;
    setTextVal(newText);
    setTextColor(newColor);
    setTextSize(newSize);
    const ed = getEditorInstance();
    if (ed) {
      ed.objectManager.updateText(obj.id, { text: newText, color: newColor, size: newSize });
    }
  };

  // If nothing is selected, show Scene Overview
  if (!obj) {
    return (
      <div className="w-80 bg-[#161618] border-l border-[#2d2d30] flex flex-col h-full text-white select-none">
        <div className="p-4 border-b border-[#2d2d30] flex items-center justify-between bg-[#121214]">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-[#22a447]" /> Scene Objects
          </span>
          <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-bold text-gray-300">
            {sceneObjects.length} Nodes
          </span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Object List</h4>
          {sceneObjects.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-8">
              No objects in this scene.<br />Use the left toolbar to add 3D Agriculture presets or primitives.
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {sceneObjects.map((sObj) => (
                <div
                  key={sObj.id}
                  onClick={() => {
                    const ed = getEditorInstance();
                    if (ed) {
                      ed.selectionManager.selectObject(sObj.id);
                    } else {
                      useEditorStore.getState().setSelectedIds([sObj.id]);
                    }
                  }}
                  className="px-3 py-2.5 bg-[#202024] hover:bg-[#28282d] rounded-xl text-xs cursor-pointer flex items-center justify-between border border-white/5 transition-colors"
                >
                  <span className="font-semibold text-gray-200 truncate">{sObj.name}</span>
                  <span className="text-[9px] text-[#22a447] px-2 py-0.5 bg-[#22a447]/10 rounded-full uppercase font-bold">
                    {sObj.type}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const activeSlot = materialSlots.find((s) => s.slotId === activeSlotId);

  return (
    <div className="w-80 bg-[#161618] border-l border-[#2d2d30] flex flex-col h-full text-white select-none overflow-y-auto shadow-2xl">
      {/* Top Header */}
      <div className="p-4 border-b border-[#2d2d30] flex items-center justify-between bg-[#121214]">
        <button
          onClick={() => {
            const ed = getEditorInstance();
            if (ed) {
              ed.selectionManager.clearSelection();
            } else {
              useEditorStore.getState().setSelectedIds([]);
            }
          }}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-xs font-bold text-[#22a447] uppercase tracking-wider bg-[#22a447]/10 px-2 py-0.5 rounded-full border border-[#22a447]/20">
          {obj.type}
        </span>
      </div>

      {/* 1. Basic Information & Renaming */}
      <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Object Info</h4>
        <div className="flex flex-col gap-1.5">
          <label className="text-xs text-gray-400 font-semibold">Name</label>
          <input
            type="text"
            value={obj.name}
            onChange={(e) => {
              updateObject(obj.id, { name: e.target.value });
              const ed = getEditorInstance();
              const node = ed?.nodesMap.get(obj.id);
              if (node) node.name = e.target.value;
            }}
            className="bg-[#242429] text-xs text-white px-3 py-2 rounded-xl outline-none border border-white/10 focus:border-[#22a447]"
          />
        </div>

        {/* Quick Object Actions */}
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => {
              const ed = getEditorInstance();
              if (ed) ed.objectManager.duplicateObject(obj.id);
            }}
            className="flex-1 py-1.5 bg-[#242429] hover:bg-[#2e2e36] text-xs font-bold rounded-lg text-gray-200 flex items-center justify-center gap-1 border border-white/5 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5" /> Duplicate
          </button>
          <button
            onClick={() => {
              const ed = getEditorInstance();
              if (ed) ed.objectManager.deleteObject(obj.id);
            }}
            className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 text-xs font-bold rounded-lg text-red-400 flex items-center justify-center gap-1 border border-red-500/20 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" /> Delete
          </button>
        </div>
      </div>


      {/* 2. Text 3D Customizer */}
      {obj.type === "text" && obj.textConfig && (
        <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-3 bg-[#131316]">
          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-4 h-4" /> 3D Text Settings
          </h4>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-gray-400">Content</span>
            <input
              type="text"
              value={textVal}
              onChange={(e) => handleUpdateText(e.target.value, textColor, textSize)}
              className="bg-[#242429] text-xs text-white px-3 py-1.5 rounded-lg border border-white/10 outline-none focus:border-[#22a447]"
            />
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-gray-400">Text Color</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleUpdateText(textVal, e.target.value, textSize)}
              className="w-10 h-7 bg-transparent border-0 cursor-pointer"
            />
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex justify-between text-xs text-gray-400">
              <span>Font Size</span>
              <span>{textSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="2"
              value={textSize}
              onChange={(e) => handleUpdateText(textVal, textColor, parseInt(e.target.value))}
              className="accent-[#22a447]"
            />
          </div>
        </div>
      )}

      {/* 3. Transform Controls (Position, Rotation, Scale) */}
      <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Transform</h4>

        {/* Position */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300 font-semibold">Position</span>
          <div className="flex gap-1.5 text-xs">
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-red-500 font-bold text-[10px]">X</span>
              <input
                type="number"
                step="0.25"
                value={posX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosX(val);
                  updateTransform("x", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-green-500 font-bold text-[10px]">Y</span>
              <input
                type="number"
                step="0.25"
                value={posY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosY(val);
                  updateTransform("y", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-blue-500 font-bold text-[10px]">Z</span>
              <input
                type="number"
                step="0.25"
                value={posZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosZ(val);
                  updateTransform("z", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
          </div>
        </div>

        {/* Rotation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300 font-semibold">Rotation</span>
          <div className="flex gap-1.5 text-xs">
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-red-500 font-bold text-[10px]">X</span>
              <input
                type="number"
                step="15"
                value={rotX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotX(val);
                  updateTransform("x", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-green-500 font-bold text-[10px]">Y</span>
              <input
                type="number"
                step="15"
                value={rotY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotY(val);
                  updateTransform("y", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-blue-500 font-bold text-[10px]">Z</span>
              <input
                type="number"
                step="15"
                value={rotZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotZ(val);
                  updateTransform("z", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
          </div>
        </div>

        {/* Scale */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300 font-semibold">Scale</span>
          <div className="flex gap-1.5 text-xs">
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-red-500 font-bold text-[10px]">X</span>
              <input
                type="number"
                step="0.1"
                value={sclX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSclX(val);
                  updateTransform("x", val, "scale");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-green-500 font-bold text-[10px]">Y</span>
              <input
                type="number"
                step="0.1"
                value={sclY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSclY(val);
                  updateTransform("y", val, "scale");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#242429] px-2 py-1 rounded-lg border border-white/5">
              <span className="text-blue-500 font-bold text-[10px]">Z</span>
              <input
                type="number"
                step="0.1"
                value={sclZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSclZ(val);
                  updateTransform("z", val, "scale");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 4. Materials & Colors */}
      {materialSlots.length > 0 && (
        <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-emerald-400" /> Material & Shader
          </h4>
          
          {materialSlots.length > 1 && (
            <select
              value={activeSlotId || ""}
              onChange={(e) => setActiveSlotId(e.target.value)}
              className="bg-[#242429] text-xs text-white px-3 py-2 rounded-xl outline-none border border-white/10"
            >
              {materialSlots.map((s) => (
                <option key={s.slotId} value={s.slotId}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {activeSlot && (
            <div className="flex flex-col gap-3 mt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-300 font-semibold">Albedo Color</span>
                <input
                  type="color"
                  value={activeSlot.properties.baseColor}
                  onChange={(e) => handleMaterialChange("baseColor", e.target.value)}
                  className="w-9 h-7 bg-transparent border-0 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-gray-400">
                  <span>Metallic</span>
                  <span>{activeSlot.properties.metallic}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={activeSlot.properties.metallic}
                  onChange={(e) => handleMaterialChange("metallic", parseFloat(e.target.value))}
                  className="accent-[#22a447]"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-gray-400">
                  <span>Roughness</span>
                  <span>{activeSlot.properties.roughness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={activeSlot.properties.roughness}
                  onChange={(e) => handleMaterialChange("roughness", parseFloat(e.target.value))}
                  className="accent-[#22a447]"
                />
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-gray-400">Wireframe</span>
                <input
                  type="checkbox"
                  checked={!!activeSlot.properties.wireframe}
                  onChange={(e) => handleMaterialChange("wireframe", e.target.checked)}
                  className="accent-[#22a447] w-4 h-4"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 4.5. 3D Text Configuration */}
      {obj.type === "text" && obj.textConfig && (
        <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
            3D Text Properties
          </h4>

          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-400">Content</span>
              <input
                type="text"
                value={obj.textConfig.text}
                onChange={(e) => {
                  const ed = getEditorInstance();
                  if (ed) {
                    ed.objectManager.updateTextConfig(obj.id, { text: e.target.value });
                  }
                }}
                className="bg-[#242429] text-white px-2.5 py-1.5 rounded-lg outline-none border border-zinc-700 focus:border-zinc-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1">
                <span className="text-zinc-400">Color</span>
                <input
                  type="color"
                  value={obj.textConfig.color}
                  onChange={(e) => {
                    const ed = getEditorInstance();
                    if (ed) {
                      ed.objectManager.updateTextConfig(obj.id, { color: e.target.value });
                    }
                  }}
                  className="w-full h-8 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-zinc-400">Background</span>
                <input
                  type="color"
                  value={obj.textConfig.bgColor || "#18181b"}
                  onChange={(e) => {
                    const ed = getEditorInstance();
                    if (ed) {
                      ed.objectManager.updateTextConfig(obj.id, { bgColor: e.target.value });
                    }
                  }}
                  className="w-full h-8 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-zinc-400">
                <span>Font Size</span>
                <span>{obj.textConfig.size}px</span>
              </div>
              <input
                type="range"
                min="20"
                max="120"
                step="2"
                value={obj.textConfig.size}
                onChange={(e) => {
                  const ed = getEditorInstance();
                  if (ed) {
                    ed.objectManager.updateTextConfig(obj.id, { size: parseInt(e.target.value) });
                  }
                }}
                className="accent-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Motion & Animation Presets */}
      <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Motion & Animation
        </h4>

        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-300 font-semibold">Motion Preset</span>
            <select
              onChange={(e) => {
                const ed = getEditorInstance();
                if (ed) {
                  ed.animationManager.applyMotionPreset(obj.id, e.target.value as any);
                }
              }}
              defaultValue="none"
              className="bg-[#242429] text-white px-2.5 py-1.5 rounded-lg outline-none border border-white/10 text-xs"
            >
              <option value="none">Static (None)</option>
              <option value="spin">Spin 360° Continuous</option>
              <option value="bounce">Floating Hover Bob</option>
              <option value="pulse">Pulse Scaling</option>
              <option value="sway">Pendulum Sway</option>
            </select>
          </div>

          {/* If object has GLB Animation clips */}
          {animationState.clips.length > 1 && (
            <div className="flex items-center justify-between mt-1">
              <span className="text-gray-400">Clip</span>
              <select
                value={animationState.activeClip || ""}
                onChange={(e) => {
                  const ed = getEditorInstance();
                  if (ed) ed.animationManager.selectClip(e.target.value);
                }}
                className="bg-[#242429] text-white px-2 py-1 rounded outline-none w-36 text-xs"
              >
                {animationState.clips.map((clip) => (
                  <option key={clip} value={clip}>
                    {clip}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Quick Playback Controls */}
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                const ed = getEditorInstance();
                if (ed) {
                  if (animationState.playing) {
                    ed.animationManager.pause();
                  } else {
                    ed.animationManager.play(animationState.loop);
                  }
                }
              }}
              className="flex-1 py-2 bg-[#22a447] hover:bg-[#198b3a] font-bold rounded-lg text-xs text-white shadow transition-all cursor-pointer"
            >
              {animationState.playing ? "Pause Motion" : "Play Motion"}
            </button>
            <button
              onClick={() => {
                const ed = getEditorInstance();
                if (ed) ed.animationManager.stop();
              }}
              className="px-3 py-2 bg-[#242429] hover:bg-[#2e2e36] font-bold rounded-lg text-xs text-gray-300 transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>


      {/* 6. Interactivity & Behaviours */}
      <div className="p-4 border-b border-[#2d2d30] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-blue-400" /> Interactivity (AR Tap)
        </h4>

        {/* Existing Interactions List */}
        {obj.behaviours && obj.behaviours.length > 0 ? (
          <div className="flex flex-col gap-1.5 text-xs">
            {obj.behaviours.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#242429] p-2.5 rounded-xl border border-white/5">
                <span className="text-emerald-400 font-bold">On {b.trigger} → <span className="text-white">{b.action}</span></span>
                <button
                  onClick={() => {
                    const nextB = obj.behaviours!.filter((_, i) => i !== idx);
                    updateObject(obj.id, { behaviours: nextB });
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 text-center py-2">
            No interactivity configured yet.
          </div>
        )}

        {/* Add Interactivity form */}
        <div className="bg-[#242429] p-3.5 rounded-xl flex flex-col gap-2.5 border border-white/5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">Trigger</span>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as any)}
              className="bg-[#161618] text-white px-2 py-1 rounded-lg outline-none text-xs"
            >
              <option value="click">On Tap / Click</option>
              <option value="start">On Scene Start</option>
            </select>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-semibold">Response</span>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="bg-[#161618] text-white px-2 py-1 rounded-lg outline-none text-xs"
            >
              <option value="showInfo">Show Info Popup</option>
              <option value="rotateObject">Rotate 45°</option>
              <option value="moveObject">Lift Up 1m</option>
              <option value="showObject">Show Node</option>
              <option value="hideObject">Hide Node</option>
              <option value="openUrl">Open URL</option>
              <option value="changeScene">Change Scene</option>
            </select>
          </div>

          {action === "showInfo" && (
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Title (e.g. Smart Sensor Data)"
                value={infoTitle}
                onChange={(e) => setInfoTitle(e.target.value)}
                className="bg-[#161618] text-xs px-2.5 py-1.5 rounded-lg outline-none border border-white/5"
              />
              <textarea
                placeholder="Description of agricultural module..."
                value={infoDesc}
                onChange={(e) => setInfoDesc(e.target.value)}
                rows={2}
                className="bg-[#161618] text-xs px-2.5 py-1.5 rounded-lg outline-none border border-white/5 resize-none"
              />
            </div>
          )}

          {action === "openUrl" && (
            <input
              type="text"
              placeholder="https://example.com"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="bg-[#161618] text-xs px-2.5 py-1.5 rounded-lg outline-none"
            />
          )}

          <button
            onClick={handleAddBehaviour}
            className="w-full py-2 bg-[#22a447] hover:bg-[#198b3a] text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 text-white shadow transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Attach Interactivity
          </button>
        </div>
      </div>
    </div>
  );
}


