"use client";

import { useEffect, useRef, useState } from "react";
import { Vector3, Matrix } from "@babylonjs/core";
import { EditorEngine } from "../engine/EditorEngine";
import { setEditorInstance, getEditorInstance } from "../engine/editorInstance";
import { useEditorStore } from "../store/useEditorStore";
import { Move, RotateCw, Maximize, Trash2, MoreHorizontal, Copy, EyeOff, Lock, Unlock } from "lucide-react";

export function Viewport() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isPreviewMode = useEditorStore((state) => state.isPreviewMode);
  const selectedIds = useEditorStore((state) => state.selectedIds);
  const [menuPos, setMenuPos] = useState<{ x: number; y: number } | null>(null);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new EditorEngine(canvasRef.current);
    setEditorInstance(engine);

    // Setup projection observer to update contextual menu position
    const observer = engine.scene.onAfterRenderObservable.add(() => {
      const state = useEditorStore.getState();
      if (state.isPreviewMode || state.selectedIds.length !== 1) {
        setMenuPos(null);
        return;
      }

      const selectedId = state.selectedIds[0];
      const node = engine.nodesMap.get(selectedId);
      if (!node) {
        setMenuPos(null);
        return;
      }

      const camera = engine.scene.activeCamera;
      if (!camera) return;

      let topY = node.absolutePosition ? node.absolutePosition.y : (node.position ? node.position.y : 0);
      let posX = node.absolutePosition ? node.absolutePosition.x : (node.position ? node.position.x : 0);
      let posZ = node.absolutePosition ? node.absolutePosition.z : (node.position ? node.position.z : 0);

      const childMeshes = node.getChildMeshes ? node.getChildMeshes() : (node.getBoundingInfo ? [node] : []);
      if (childMeshes.length > 0) {
        let maxWorldY = -Number.MAX_VALUE;
        let sumX = 0;
        let sumZ = 0;
        let validCount = 0;

        childMeshes.forEach((m: any) => {
          if (m.getBoundingInfo) {
            const b = m.getBoundingInfo().boundingBox;
            maxWorldY = Math.max(maxWorldY, b.maximumWorld.y);
            sumX += b.centerWorld.x;
            sumZ += b.centerWorld.z;
            validCount++;
          }
        });

        if (maxWorldY !== -Number.MAX_VALUE) {
          topY = maxWorldY;
        }
        if (validCount > 0) {
          posX = sumX / validCount;
          posZ = sumZ / validCount;
        }
      }

      const topPos = new Vector3(posX, topY, posZ);
      const transformMatrix = engine.scene.getTransformMatrix();
      const viewport = camera.viewport.toGlobal(
        engine.engine.getRenderWidth(),
        engine.engine.getRenderHeight()
      );

      const projected = Vector3.Project(
        topPos,
        Matrix.IdentityReadOnly || Matrix.Identity(),
        transformMatrix,
        viewport
      );

      // Offset position slightly above the object
      setMenuPos({
        x: projected.x,
        y: projected.y - 40,
      });
    });


    // Auto-resize Babylon engine on any container or canvas dimensions change
    const resizeEngine = () => {
      if (engine && engine.engine) {
        engine.engine.resize();
      }
    };

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(() => {
        resizeEngine();
      });
      if (canvasRef.current.parentElement) {
        resizeObserver.observe(canvasRef.current.parentElement);
      }
      resizeObserver.observe(canvasRef.current);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      engine.scene.onAfterRenderObservable.remove(observer);
      engine.dispose();
      setEditorInstance(null);
    };
  }, []);

  // Update preview mode helper visibility
  useEffect(() => {
    const editor = getEditorInstance();
    if (editor) {
      editor.previewManager.togglePreview(isPreviewMode);
    }
  }, [isPreviewMode]);

  const activeSceneId = useEditorStore((state) => state.activeSceneId);
  const prevSceneIdRef = useRef(activeSceneId);

  // Reload scene when activeSceneId changes
  useEffect(() => {
    if (prevSceneIdRef.current !== activeSceneId) {
      prevSceneIdRef.current = activeSceneId;
      const editor = getEditorInstance();
      if (editor) {
        editor.objectManager.loadActiveScene();
      }
    }
  }, [activeSceneId]);


  const activeSelectedId = selectedIds.length === 1 ? selectedIds[0] : null;

  const handleAction = (action: string) => {
    const editor = getEditorInstance();
    if (!editor || !activeSelectedId) return;

    switch (action) {
      case "translate":
        editor.transformManager.setMode("translate");
        break;
      case "rotate":
        editor.transformManager.setMode("rotate");
        break;
      case "scale":
        editor.transformManager.setMode("scale");
        break;
      case "delete":
        editor.objectManager.deleteObject(activeSelectedId);
        break;
      case "duplicate":
        editor.objectManager.duplicateObject(activeSelectedId);
        break;
      case "hide":
        editor.objectManager.setVisibility(activeSelectedId, false);
        break;
      case "lock":
        editor.objectManager.setLocked(activeSelectedId, true);
        break;
      default:
        break;
    }
    setShowMore(false);
  };

  return (
    <div className="relative w-full h-full bg-[#e8e8e8] overflow-hidden flex-1">
      <canvas
        ref={canvasRef}
        className="w-full h-full outline-none block touch-none"
      />

      {/* Floating Contextual Object Menu */}
      {menuPos && !isPreviewMode && (
        <div
          className="absolute z-40 bg-white border border-[#22a447]/30 shadow-lg rounded-full px-2 py-1 flex items-center gap-1.5 translate-x-[-50%] translate-y-[-100%] transition-all duration-75 select-none"
          style={{
            left: `${menuPos.x}px`,
            top: `${menuPos.y}px`,
          }}
        >
          <button
            onClick={() => handleAction("translate")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-700"
            title="Move"
          >
            <Move className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAction("rotate")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-700"
            title="Rotate"
          >
            <RotateCw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAction("scale")}
            className="p-1.5 hover:bg-gray-100 rounded-full text-gray-700"
            title="Scale"
          >
            <Maximize className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => handleAction("delete")}
            className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-full text-gray-700"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          
          <div className="relative">
            <button
              onClick={() => setShowMore(!showMore)}
              className="p-1.5 hover:bg-gray-100 rounded-full text-gray-700"
              title="More Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>
            {showMore && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 shadow-md rounded py-1 w-28 text-xs flex flex-col z-50">
                <button
                  onClick={() => handleAction("duplicate")}
                  className="px-3 py-1.5 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </button>
                <button
                  onClick={() => handleAction("hide")}
                  className="px-3 py-1.5 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                >
                  <EyeOff className="w-3 h-3" /> Hide
                </button>
                <button
                  onClick={() => handleAction("lock")}
                  className="px-3 py-1.5 hover:bg-gray-50 text-left flex items-center gap-2 text-gray-700"
                >
                  <Lock className="w-3 h-3" /> Lock
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Editor Active Indicator */}
      <div className="absolute top-4 left-4 pointer-events-none select-none text-xs text-black/60 bg-white/70 px-2 py-1 rounded shadow-sm font-semibold border border-black/5">
        {isPreviewMode ? "Preview Mode active" : "WebGL 3D Viewport"}
      </div>
    </div>
  );
}
