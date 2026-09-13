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
  Layers,
  Box,
  Compass,
  Maximize2
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
  const [textColor, setTextColor] = useState("#10b981");
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
      if (type === "position" && node.position) {
        node.position[axis] = val;
      } else if (type === "rotation") {
        const rad = (val * Math.PI) / 180;
        if (node.rotationQuaternion) {
          const euler = node.rotationQuaternion.toEulerAngles();
          euler[axis] = rad;
          node.rotationQuaternion = Quaternion.FromEulerAngles(euler.x, euler.y, euler.z);
        } else if (node.rotation) {
          node.rotation[axis] = rad;
        }
      } else if (type === "scale" && node.scaling) {
        node.scaling[axis] = val;
      }

      const pos = (node as any).position;
      const rotQuat = (node as any).rotationQuaternion;
      const rotEuler = (node as any).rotation;

      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;

      if (rotQuat) {
        const euler = rotQuat.toEulerAngles();
        rotX = (euler.x * 180) / Math.PI;
        rotY = (euler.y * 180) / Math.PI;
        rotZ = (euler.z * 180) / Math.PI;
      } else if (rotEuler && typeof rotEuler.x === "number") {
        rotX = (rotEuler.x * 180) / Math.PI;
        rotY = (rotEuler.y * 180) / Math.PI;
        rotZ = (rotEuler.z * 180) / Math.PI;
      }

      const posX = pos && typeof pos.x === "number" ? pos.x : obj.position[0];
      const posY = pos && typeof pos.y === "number" ? pos.y : obj.position[1];
      const posZ = pos && typeof pos.z === "number" ? pos.z : obj.position[2];

      const scl = (node as any).scaling;
      const sclX = scl && typeof scl.x === "number" ? scl.x : obj.scale[0];
      const sclY = scl && typeof scl.y === "number" ? scl.y : obj.scale[1];
      const sclZ = scl && typeof scl.z === "number" ? scl.z : obj.scale[2];

      updateObject(obj.id, {
        position: [posX, posY, posZ],
        rotation: [rotX, rotY, rotZ],
        scale: [sclX, sclY, sclZ],
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
      <div className="w-80 bg-[#161619] border-l border-[#27272a] flex flex-col h-full text-white select-none font-sans shadow-2xl">
        <div className="p-3.5 border-b border-[#27272a] flex items-center justify-between bg-[#131316]">
          <span className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" /> Scene Objects
          </span>
          <span className="text-[10px] bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            {sceneObjects.length} Nodes
          </span>
        </div>
        <div className="p-3.5 flex-1 overflow-y-auto flex flex-col gap-3">
          <div className="flex items-center justify-between text-[11px] text-zinc-400 font-semibold uppercase tracking-wider">
            <span>Daftar Objek</span>
          </div>
          {sceneObjects.length === 0 ? (
            <div className="text-xs text-zinc-500 text-center py-8">
              Pilih objek di 3D canvas atau dari toolbar.
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
                  className="px-3 py-2.5 bg-[#1e1e23] hover:bg-[#25252b] rounded-xl text-xs cursor-pointer flex items-center justify-between border border-zinc-800 hover:border-emerald-500/50 transition-all bouncy-hover"
                >
                  <span className="font-semibold text-zinc-200 truncate">{sObj.name}</span>
                  <span className="text-[9.5px] text-emerald-400 px-2 py-0.5 bg-emerald-500/15 border border-emerald-500/30 rounded-full uppercase font-bold">
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
    <div className="w-80 bg-[#161619] border-l border-[#27272a] flex flex-col h-full text-white select-none overflow-y-auto shadow-2xl font-sans">
      {/* Top Header */}
      <div className="p-3.5 border-b border-[#27272a] flex items-center justify-between bg-[#131316]">
        <button
          onClick={() => {
            const ed = getEditorInstance();
            if (ed) {
              ed.selectionManager.clearSelection();
            } else {
              useEditorStore.getState().setSelectedIds([]);
            }
          }}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-emerald-400 transition-colors cursor-pointer font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Kembali
        </button>
        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-500/15 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          {obj.type}
        </span>
      </div>

      {/* 1. Basic Information & Renaming */}
      <div className="p-3.5 border-b border-[#27272a] flex flex-col gap-3 bg-[#161619]">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Box className="w-3.5 h-3.5 text-emerald-400" /> Informasi Objek
          </h4>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-zinc-400 font-semibold">Nama Node</label>
          <input
            type="text"
            value={obj.name}
            onChange={(e) => {
              updateObject(obj.id, { name: e.target.value });
              const ed = getEditorInstance();
              const node = ed?.nodesMap.get(obj.id);
              if (node) node.name = e.target.value;
            }}
            className="bg-[#1e1e23] text-xs text-white px-3 py-2 rounded-xl outline-none border border-zinc-700/80 focus:border-emerald-500 transition-colors font-medium"
          />
        </div>

        {/* Quick Object Actions */}
        <div className="flex gap-2 mt-0.5">
          <button
            onClick={() => {
              const ed = getEditorInstance();
              if (ed) ed.objectManager.duplicateObject(obj.id);
            }}
            className="bouncy-hover flex-1 py-1.5 bg-[#1e1e23] hover:bg-[#25252b] text-xs font-bold rounded-xl text-zinc-200 flex items-center justify-center gap-1.5 border border-zinc-700 transition-colors cursor-pointer"
          >
            <Copy className="w-3.5 h-3.5 text-cyan-400" /> Duplikat
          </button>
          <button
            onClick={() => {
              const ed = getEditorInstance();
              if (ed) ed.objectManager.deleteObject(obj.id);
            }}
            className="bouncy-hover flex-1 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-xs font-bold rounded-xl text-rose-300 flex items-center justify-center gap-1.5 border border-rose-500/30 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" /> Hapus
          </button>
        </div>
      </div>

      {/* 2. Text 3D Customizer */}
      {obj.type === "text" && obj.textConfig && (
        <div className="p-3.5 border-b border-[#27272a] flex flex-col gap-3 bg-[#131316]">
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Type className="w-4 h-4" /> 3D Text Settings
          </h4>

          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] text-zinc-400">Content</span>
            <input
              type="text"
              value={textVal}
              onChange={(e) => handleUpdateText(e.target.value, textColor, textSize)}
              className="bg-[#1e1e23] text-xs text-white px-3 py-1.5 rounded-xl border border-zinc-700 outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center bg-[#1e1e23] p-2 rounded-xl border border-zinc-800">
            <span className="text-[11px] text-zinc-300 font-medium">Text Color</span>
            <input
              type="color"
              value={textColor}
              onChange={(e) => handleUpdateText(textVal, e.target.value, textSize)}
              className="w-9 h-7 bg-transparent border-0 cursor-pointer rounded"
            />
          </div>

          <div className="flex flex-col gap-1.5 bg-[#1e1e23] p-2.5 rounded-xl border border-zinc-800">
            <div className="flex justify-between text-xs text-zinc-300 font-semibold">
              <span>Font Size</span>
              <span className="text-emerald-400">{textSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="120"
              step="2"
              value={textSize}
              onChange={(e) => handleUpdateText(textVal, textColor, parseInt(e.target.value))}
              className="accent-emerald-500 cursor-pointer"
            />
          </div>
        </div>
      )}

      {/* 3. Transform Controls (Position, Rotation, Scale) */}
      <div className="p-3.5 border-b border-[#27272a] flex flex-col gap-3.5">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Compass className="w-3.5 h-3.5 text-cyan-400" /> Transform
        </h4>

        {/* Position */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold">Posisi</span>
          <div className="flex gap-1.5 text-xs">
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-rose-500/20">
              <span className="text-rose-400 font-bold text-[10px]">X</span>
              <input
                type="number"
                step="0.25"
                value={posX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosX(val);
                  updateTransform("x", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-[10px]">Y</span>
              <input
                type="number"
                step="0.25"
                value={posY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosY(val);
                  updateTransform("y", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-cyan-500/20">
              <span className="text-cyan-400 font-bold text-[10px]">Z</span>
              <input
                type="number"
                step="0.25"
                value={posZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosZ(val);
                  updateTransform("z", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
          </div>
        </div>

        {/* Rotation */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold">Rotasi</span>
          <div className="flex gap-1.5 text-xs">
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-rose-500/20">
              <span className="text-rose-400 font-bold text-[10px]">X</span>
              <input
                type="number"
                step="15"
                value={rotX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotX(val);
                  updateTransform("x", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-[10px]">Y</span>
              <input
                type="number"
                step="15"
                value={rotY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotY(val);
                  updateTransform("y", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-cyan-500/20">
              <span className="text-cyan-400 font-bold text-[10px]">Z</span>
              <input
                type="number"
                step="15"
                value={rotZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotZ(val);
                  updateTransform("z", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
          </div>
        </div>

        {/* Scale */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-zinc-300 font-semibold">Skala</span>
          <div className="flex gap-1.5 text-xs">
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-rose-500/20">
              <span className="text-rose-400 font-bold text-[10px]">X</span>
              <input
                type="number"
                step="0.1"
                value={sclX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSclX(val);
                  updateTransform("x", val, "scale");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-emerald-500/20">
              <span className="text-emerald-400 font-bold text-[10px]">Y</span>
              <input
                type="number"
                step="0.1"
                value={sclY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSclY(val);
                  updateTransform("y", val, "scale");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
            <label className="flex items-center gap-1 bg-[#1e1e23] px-2 py-1.5 rounded-xl border border-cyan-500/20">
              <span className="text-cyan-400 font-bold text-[10px]">Z</span>
              <input
                type="number"
                step="0.1"
                value={sclZ}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setSclZ(val);
                  updateTransform("z", val, "scale");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono text-xs"
              />
            </label>
          </div>
        </div>
      </div>

      {/* 4. Materials & Colors */}
      {materialSlots.length > 0 && (
        <div className="p-3.5 border-b border-[#27272a] flex flex-col gap-3">
          <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-lime-400" /> Material & Shader
          </h4>
          
          {materialSlots.length > 1 && (
            <select
              value={activeSlotId || ""}
              onChange={(e) => setActiveSlotId(e.target.value)}
              className="bg-[#1e1e23] text-xs text-white px-3 py-2 rounded-xl outline-none border border-zinc-700 font-medium"
            >
              {materialSlots.map((s) => (
                <option key={s.slotId} value={s.slotId}>
                  {s.name}
                </option>
              ))}
            </select>
          )}

          {activeSlot && (
            <div className="flex flex-col gap-3 text-xs">
              <div className="flex items-center justify-between bg-[#1e1e23] p-2 rounded-xl border border-zinc-800">
                <span className="text-zinc-300 font-medium">Albedo Color</span>
                <input
                  type="color"
                  value={activeSlot.properties.baseColor}
                  onChange={(e) => handleMaterialChange("baseColor", e.target.value)}
                  className="w-9 h-7 bg-transparent border-0 cursor-pointer rounded"
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-[#1e1e23] p-2.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Metallic</span>
                  <span className="text-emerald-400 font-mono">{activeSlot.properties.metallic}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={activeSlot.properties.metallic}
                  onChange={(e) => handleMaterialChange("metallic", parseFloat(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1.5 bg-[#1e1e23] p-2.5 rounded-xl border border-zinc-800">
                <div className="flex justify-between text-zinc-400 text-xs">
                  <span>Roughness</span>
                  <span className="text-emerald-400 font-mono">{activeSlot.properties.roughness}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={activeSlot.properties.roughness}
                  onChange={(e) => handleMaterialChange("roughness", parseFloat(e.target.value))}
                  className="accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between bg-[#1e1e23] p-2.5 rounded-xl border border-zinc-800">
                <span className="text-zinc-300 font-medium">Wireframe Mode</span>
                <input
                  type="checkbox"
                  checked={!!activeSlot.properties.wireframe}
                  onChange={(e) => handleMaterialChange("wireframe", e.target.checked)}
                  className="accent-emerald-500 w-4 h-4 cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Motion & Animation Presets */}
      <div className="p-3.5 border-b border-[#27272a] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-amber-400" /> Animasi & Gerakan
        </h4>

        <div className="flex flex-col gap-2.5 text-xs">
          <div className="flex flex-col gap-1.5">
            <span className="text-zinc-400 text-[11px] font-medium">Preset Gerakan</span>
            <select
              onChange={(e) => {
                const ed = getEditorInstance();
                if (ed) {
                  ed.animationManager.applyMotionPreset(obj.id, e.target.value as any);
                }
              }}
              defaultValue="none"
              className="bg-[#1e1e23] text-white px-3 py-2 rounded-xl outline-none border border-zinc-700 text-xs font-medium"
            >
              <option value="none">Statis (Tidak Ada)</option>
              <option value="spin">Putar 360° Berkelanjutan</option>
              <option value="bounce">Melayang Bobbing</option>
              <option value="pulse">Pulse Skala Denyut</option>
              <option value="sway">Goyangan Bandul (Sway)</option>
            </select>
          </div>

          {/* Quick Playback Controls */}
          <div className="flex gap-2 mt-1">
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
              className="bouncy-hover flex-1 py-2 bg-emerald-500 hover:bg-emerald-400 font-bold rounded-xl text-xs text-zinc-950 shadow-sm transition-all cursor-pointer"
            >
              {animationState.playing ? "Jeda Gerakan" : "Putar Gerakan"}
            </button>
            <button
              onClick={() => {
                const ed = getEditorInstance();
                if (ed) ed.animationManager.stop();
              }}
              className="bouncy-hover px-3 py-2 bg-[#1e1e23] hover:bg-[#25252b] font-bold rounded-xl text-xs text-zinc-300 border border-zinc-700 transition-all cursor-pointer"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 6. Interactivity & Behaviours */}
      <div className="p-3.5 border-b border-[#27272a] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-cyan-400" /> Interaktivitas (Tap AR)
        </h4>

        {/* Existing Interactions List */}
        {obj.behaviours && obj.behaviours.length > 0 ? (
          <div className="flex flex-col gap-2 text-xs">
            {obj.behaviours.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#1e1e23] p-2.5 rounded-xl border border-zinc-800">
                <span className="text-emerald-400 font-bold">Saat {b.trigger} → <span className="text-white">{b.action}</span></span>
                <button
                  onClick={() => {
                    const nextB = obj.behaviours!.filter((_, i) => i !== idx);
                    updateObject(obj.id, { behaviours: nextB });
                  }}
                  className="text-rose-400 hover:text-rose-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-zinc-500 text-center py-2">
            Belum ada aksi interaksi terpasang.
          </div>
        )}

        {/* Add Interactivity form */}
        <div className="bg-[#1e1e23] p-3 rounded-xl flex flex-col gap-2.5 border border-zinc-800">
          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-semibold">Pemicu</span>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as any)}
              className="bg-[#161619] text-white px-2.5 py-1.5 rounded-lg outline-none text-xs border border-zinc-700"
            >
              <option value="click">Saat Tap / Klik</option>
              <option value="start">Saat Scene Dimulai</option>
            </select>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-zinc-400 font-semibold">Aksi Respon</span>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="bg-[#161619] text-white px-2.5 py-1.5 rounded-lg outline-none text-xs border border-zinc-700"
            >
              <option value="showInfo">Buka Popup Info</option>
              <option value="rotateObject">Putar 45°</option>
              <option value="moveObject">Angkat 1m</option>
              <option value="showObject">Tampilkan Node</option>
              <option value="hideObject">Sembunyikan Node</option>
              <option value="openUrl">Buka Link URL</option>
              <option value="changeScene">Ganti Scene</option>
            </select>
          </div>

          {action === "showInfo" && (
            <div className="flex flex-col gap-1.5">
              <input
                type="text"
                placeholder="Judul (contoh: Sensor Kelembaban Tanah)"
                value={infoTitle}
                onChange={(e) => setInfoTitle(e.target.value)}
                className="bg-[#161619] text-xs px-2.5 py-1.5 rounded-lg outline-none border border-zinc-700 text-white"
              />
              <textarea
                placeholder="Deskripsi data agrikultur..."
                value={infoDesc}
                onChange={(e) => setInfoDesc(e.target.value)}
                rows={2}
                className="bg-[#161619] text-xs px-2.5 py-1.5 rounded-lg outline-none border border-zinc-700 resize-none text-white"
              />
            </div>
          )}

          {action === "openUrl" && (
            <input
              type="text"
              placeholder="https://example.com"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="bg-[#161619] text-xs px-2.5 py-1.5 rounded-lg outline-none border border-zinc-700 text-white"
            />
          )}

          <button
            onClick={handleAddBehaviour}
            className="bouncy-hover w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 text-zinc-950 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" /> Pasang Interaksi
          </button>
        </div>
      </div>
    </div>
  );
}




