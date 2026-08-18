"use client";

import { useEffect, useState } from "react";
import { useEditorStore, Behaviour, Annotation } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";
import { Settings, Eye, Lock, Check, Plus, Trash2, ArrowLeft } from "lucide-react";

export function InspectorPanel() {
  const { selectedIds, getObjects, updateObject, removeObject, animationState, setAnimationState } = useEditorStore();
  const selectedId = selectedIds[0];
  
  const sceneObjects = getObjects();
  const obj = sceneObjects.find((o) => o.id === selectedId);

  const editor = getEditorInstance();

  // Local state for transforms to prevent input delay
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
  const [action, setAction] = useState<"playAnimation" | "moveObject" | "showObject" | "hideObject" | "openUrl" | "changeScene">("playAnimation");
  const [target, setTarget] = useState("");
  const [actionUrl, setActionUrl] = useState("");

  // Annotation inputs
  const [annoTitle, setAnnoTitle] = useState("");
  const [annoDesc, setAnnoDesc] = useState("");

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

      if (editor && obj.type === "model") {
        const slots = editor.materialManager.getMaterialSlots(obj.id);
        setMaterialSlots(slots);
        if (slots.length > 0 && !activeSlotId) {
          setActiveSlotId(slots[0].slotId);
        }
      }
    }
  }, [obj, selectedId]);

  const updateTransform = (
    axis: "x" | "y" | "z",
    val: number,
    type: "position" | "rotation" | "scale"
  ) => {
    const node = editor?.nodesMap.get(obj!.id);
    if (!node) return;

    if (type === "position") {
      node.position[axis] = val;
    } else if (type === "rotation") {
      node.rotation[axis] = (val * Math.PI) / 180;
    } else if (type === "scale") {
      node.scaling[axis] = val;
    }

    updateObject(obj!.id, {
      position: [node.position.x, node.position.y, node.position.z],
      rotation: [
        node.rotation.x * (180 / Math.PI),
        node.rotation.y * (180 / Math.PI),
        node.rotation.z * (180 / Math.PI),
      ],
      scale: [node.scaling.x, node.scaling.y, node.scaling.z],
    });
  };

  const handleMaterialChange = (prop: string, val: any) => {
    if (editor && activeSlotId && obj) {
      editor.materialManager.updateMaterialSlot(obj.id, activeSlotId, {
        [prop]: val,
      });
      const slots = editor.materialManager.getMaterialSlots(obj.id);
      setMaterialSlots(slots);
    }
  };

  const handleAddBehaviour = () => {
    if (!obj) return;
    const newBehaviour: Behaviour = {
      trigger,
      action,
      target: target || obj.id,
      url: actionUrl,
    };
    updateObject(obj.id, {
      behaviours: [...(obj.behaviours || []), newBehaviour],
    });
    setTarget("");
    setActionUrl("");
  };

  const handleAddAnnotation = () => {
    if (!obj || !annoTitle) return;
    const newAnno: Annotation = {
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

  // If nothing is selected, show general Scene Objects List
  if (!obj) {
    return (
      <div className="w-80 bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col h-full text-white select-none">
        <div className="p-4 border-b border-[#2d2d2d] flex items-center justify-between bg-[#171717]">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">SCENE</span>
        </div>
        <div className="p-4 flex-1 overflow-y-auto">
          <h4 className="text-xs font-bold text-gray-400 mb-3 uppercase tracking-wider">Object List</h4>
          {sceneObjects.length === 0 ? (
            <div className="text-xs text-gray-500 text-center py-6">No objects in this scene</div>
          ) : (
            <div className="flex flex-col gap-1.5">
              {sceneObjects.map((sObj) => (
                <div
                  key={sObj.id}
                  onClick={() => editor?.selectionManager.selectObject(sObj.id)}
                  className="px-3 py-2 bg-[#252525] rounded text-xs hover:bg-[#2c2c2c] cursor-pointer flex items-center justify-between"
                >
                  <span className="font-semibold text-gray-200">{sObj.name}</span>
                  <span className="text-[9px] text-[#22a447] px-1.5 py-0.5 bg-[#22a447]/10 rounded uppercase font-bold">
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
    <div className="w-80 bg-[#1e1e1e] border-l border-[#2d2d2d] flex flex-col h-full text-white select-none overflow-y-auto">
      {/* Title */}
      <div className="p-4 border-b border-[#2d2d2d] flex items-center justify-between bg-[#171717]">
        <button
          onClick={() => editor?.selectionManager.clearSelection()}
          className="flex items-center gap-1 text-xs text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-xs font-bold text-[#22a447] uppercase tracking-wider">
          {obj.type} Object
        </span>
      </div>

      {/* 1. Basic Information */}
      <div className="p-4 border-b border-[#2d2d2d] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Basic Information</h4>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] text-gray-400 font-mono">UUID: {obj.id}</span>
          <label className="text-xs text-gray-400 mt-1">Name</label>
          <input
            type="text"
            value={obj.name}
            onChange={(e) => {
              updateObject(obj.id, { name: e.target.value });
              const node = editor?.nodesMap.get(obj.id);
              if (node) node.name = e.target.value;
            }}
            className="bg-[#2a2a2a] text-xs text-white px-2 py-1.5 rounded outline-none border border-transparent focus:border-blue-600"
          />
        </div>

        {/* Annotation Creator */}
        <div className="bg-[#252525] p-3 rounded mt-2 flex flex-col gap-2">
          <span className="text-xs font-bold text-gray-300">Add Annotation</span>
          <input
            type="text"
            placeholder="Title"
            value={annoTitle}
            onChange={(e) => setAnnoTitle(e.target.value)}
            className="bg-[#1a1a1a] text-xs px-2 py-1 rounded outline-none w-full"
          />
          <input
            type="text"
            placeholder="Description"
            value={annoDesc}
            onChange={(e) => setAnnoDesc(e.target.value)}
            className="bg-[#1a1a1a] text-xs px-2 py-1 rounded outline-none w-full"
          />
          <button
            onClick={handleAddAnnotation}
            className="py-1 bg-[#22a447] hover:bg-[#198b3a] text-xs font-bold rounded flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" /> Save Annotation
          </button>
        </div>
      </div>

      {/* 2. Edit Transform */}
      <div className="p-4 border-b border-[#2d2d2d] flex flex-col gap-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Edit Transform</h4>

        {/* Position */}
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Position</span>
          <div className="flex gap-1 text-xs">
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-red-500 font-bold text-[9px] px-0.5">X</span>
              <input
                type="number"
                step="0.1"
                value={posX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosX(val);
                  updateTransform("x", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-green-500 font-bold text-[9px] px-0.5">Y</span>
              <input
                type="number"
                step="0.1"
                value={posY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setPosY(val);
                  updateTransform("y", val, "position");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-blue-500 font-bold text-[9px] px-0.5">Z</span>
              <input
                type="number"
                step="0.1"
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
          <span className="text-xs text-gray-300">Rotation</span>
          <div className="flex gap-1 text-xs">
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-red-500 font-bold text-[9px] px-0.5">X</span>
              <input
                type="number"
                step="1"
                value={rotX}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotX(val);
                  updateTransform("x", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-green-500 font-bold text-[9px] px-0.5">Y</span>
              <input
                type="number"
                step="1"
                value={rotY}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  setRotY(val);
                  updateTransform("y", val, "rotation");
                }}
                className="w-10 bg-transparent text-center outline-none text-white font-mono"
              />
            </label>
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-blue-500 font-bold text-[9px] px-0.5">Z</span>
              <input
                type="number"
                step="1"
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
          <span className="text-xs text-gray-300">Scale</span>
          <div className="flex gap-1 text-xs">
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-red-500 font-bold text-[9px] px-0.5">X</span>
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
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-green-500 font-bold text-[9px] px-0.5">Y</span>
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
            <label className="flex items-center gap-0.5 bg-[#2a2a2a] px-1 py-1 rounded">
              <span className="text-blue-500 font-bold text-[9px] px-0.5">Z</span>
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

      {/* 3. Behaviours (Add Interactivity) */}
      <div className="p-4 border-b border-[#2d2d2d] flex flex-col gap-3">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Behaviours</h4>
        
        {/* Interaction List */}
        {obj.behaviours && obj.behaviours.length > 0 ? (
          <div className="flex flex-col gap-1 text-xs">
            {obj.behaviours.map((b, idx) => (
              <div key={idx} className="flex justify-between items-center bg-[#252525] p-2 rounded">
                <span>On {b.trigger} → {b.action}</span>
                <button
                  onClick={() => {
                    const nextB = obj.behaviours!.filter((_, i) => i !== idx);
                    updateObject(obj.id, { behaviours: nextB });
                  }}
                  className="text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-xs text-gray-500 font-semibold italic text-center py-2">
            No interactivity configured.
          </div>
        )}

        {/* Add Interactivity form */}
        <div className="bg-[#252525] p-3 rounded flex flex-col gap-2 mt-1">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Trigger</span>
            <select
              value={trigger}
              onChange={(e) => setTrigger(e.target.value as any)}
              className="bg-[#1a1a1a] text-white px-2 py-0.5 rounded outline-none"
            >
              <option value="click">On Click</option>
              <option value="hover">On Hover</option>
              <option value="start">On Start</option>
            </select>
          </div>

          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Response</span>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="bg-[#1a1a1a] text-white px-2 py-0.5 rounded outline-none"
            >
              <option value="playAnimation">Play Animation</option>
              <option value="showObject">Show Object</option>
              <option value="hideObject">Hide Object</option>
              <option value="openUrl">Open URL</option>
              <option value="changeScene">Change Scene</option>
            </select>
          </div>

          {action === "openUrl" && (
            <input
              type="text"
              placeholder="https://example.com"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="bg-[#1a1a1a] text-xs px-2 py-1 rounded outline-none w-full"
            />
          )}

          {action === "changeScene" && (
            <select
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="bg-[#1a1a1a] text-white px-2 py-1 rounded outline-none text-xs w-full"
            >
              <option value="">Select target scene...</option>
              {useEditorStore.getState().scenes.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          )}

          <button
            onClick={handleAddBehaviour}
            className="py-1 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded flex items-center justify-center gap-1 mt-1 text-white shadow"
          >
            <Plus className="w-3.5 h-3.5" /> Add Interactivity
          </button>
        </div>
      </div>

      {/* 4. Materials Slots */}
      {obj.type === "model" && materialSlots.length > 0 && (
        <div className="p-4 border-b border-[#2d2d2d] flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Materials</h4>
          
          <select
            value={activeSlotId || ""}
            onChange={(e) => setActiveSlotId(e.target.value)}
            className="bg-[#2a2a2a] text-xs text-white px-2 py-1.5 rounded outline-none border border-[#333]"
          >
            {materialSlots.map((s) => (
              <option key={s.slotId} value={s.slotId}>
                {s.name}
              </option>
            ))}
          </select>

          {activeSlot && (
            <div className="flex flex-col gap-3 mt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Base Color</span>
                <input
                  type="color"
                  value={activeSlot.properties.baseColor}
                  onChange={(e) => handleMaterialChange("baseColor", e.target.value)}
                  className="w-8 h-6 bg-transparent border-0 cursor-pointer"
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
                  step="0.01"
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
                  step="0.01"
                  value={activeSlot.properties.roughness}
                  onChange={(e) => handleMaterialChange("roughness", parseFloat(e.target.value))}
                  className="accent-[#22a447]"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* 5. Animation Panel */}
      {obj.type === "model" && animationState.clips.length > 0 && (
        <div className="p-4 border-b border-[#2d2d2d] flex flex-col gap-3">
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Animation</h4>
          
          <div className="flex flex-col gap-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Clip</span>
              <select
                value={animationState.activeClip || ""}
                onChange={(e) => {
                  if (editor) editor.animationManager.selectClip(e.target.value);
                }}
                className="bg-[#2a2a2a] text-white px-2 py-1 rounded outline-none w-36"
              >
                {animationState.clips.map((clip) => (
                  <option key={clip} value={clip}>
                    {clip}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-400">Loop</span>
              <label className="flex items-center gap-1.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={animationState.loop}
                  onChange={(e) => {
                    setAnimationState({ loop: e.target.checked });
                  }}
                  className="accent-blue-600"
                />
                ON
              </label>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-gray-400">
                <span>Speed</span>
                <span>{animationState.speed}x</span>
              </div>
              <input
                type="range"
                min="0.25"
                max="2.0"
                step="0.25"
                value={animationState.speed}
                onChange={(e) => {
                  if (editor) editor.animationManager.setSpeed(parseFloat(e.target.value));
                }}
                className="accent-blue-600"
              />
            </div>

            <div className="flex gap-2 mt-1">
              <button
                onClick={() => {
                  if (editor) {
                    if (animationState.playing) {
                      editor.animationManager.pause();
                    } else {
                      editor.animationManager.play(animationState.loop);
                    }
                  }
                }}
                className="flex-1 py-1.5 bg-blue-600 hover:bg-blue-700 font-bold rounded text-xs text-white"
              >
                {animationState.playing ? "Pause" : "Play"}
              </button>
              <button
                onClick={() => {
                  if (editor) editor.animationManager.stop();
                }}
                className="flex-1 py-1.5 bg-[#2a2a2a] hover:bg-[#333] font-bold rounded text-xs text-gray-300"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
