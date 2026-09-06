import { GizmoManager, TransformNode, Vector3, Quaternion, PointerEventTypes, AbstractMesh } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export class TransformManager {
  private editor: EditorEngine;
  private gizmoManager: GizmoManager;
  private tempGroup: TransformNode | null = null;
  private isDragging: boolean = false;
  private currentAttachedIds: string[] = [];

  // Store original parents during multi-select temporary parenting
  private originalParents: Map<string, any> = new Map();

  constructor(editor: EditorEngine) {
    this.editor = editor;
    this.gizmoManager = new GizmoManager(this.editor.scene);
    this.gizmoManager.usePointerToAttachGizmos = false;

    // Enhance gizmo size for effortless precision
    this.gizmoManager.scaleRatio = 1.3;

    // Setup gizmos
    this.syncGizmoSettings();

    // Observe engine frame rendering to update store coordinates interactively if dragging
    this.editor.scene.onBeforeRenderObservable.add(() => {
      if (this.isDragging) {
        this.applyCurrentTransformsToStore();
      }
    });
  }

  public isTransforming(): boolean {
    return this.isDragging;
  }

  private bindGizmoListeners() {
    const onDragStart = () => {
      this.isDragging = true;
      // Record undo snapshot before transform begins
      this.editor.historyManager.recordSnapshot();
      // Detach active camera so mouse drag does not rotate/pan the camera while moving/rotating/scaling
      if (this.editor.scene.activeCamera) {
        this.editor.scene.activeCamera.detachControl();
      }
    };

    const onDragEnd = () => {
      this.isDragging = false;
      // Re-attach active camera to canvas
      if (this.editor.scene.activeCamera && this.editor.canvas) {
        this.editor.scene.activeCamera.attachControl(this.editor.canvas, true);
      }
      this.applyCurrentTransformsToStore();
    };

    const onDrag = () => {
      this.applyCurrentTransformsToStore();
    };

    const gizmos = this.gizmoManager.gizmos;
    
    // Bind position gizmo axes and plane handles
    if (gizmos.positionGizmo) {
      const pos = gizmos.positionGizmo;
      [
        pos.xGizmo, 
        pos.yGizmo, 
        pos.zGizmo, 
        pos.xPlaneGizmo, 
        pos.yPlaneGizmo, 
        pos.zPlaneGizmo
      ].forEach((axis) => {
        if (axis && axis.dragBehavior) {
          axis.dragBehavior.onDragStartObservable.removeCallback(onDragStart);
          axis.dragBehavior.onDragStartObservable.add(onDragStart);
          axis.dragBehavior.onDragObservable.removeCallback(onDrag);
          axis.dragBehavior.onDragObservable.add(onDrag);
          axis.dragBehavior.onDragEndObservable.removeCallback(onDragEnd);
          axis.dragBehavior.onDragEndObservable.add(onDragEnd);
        }
      });
    }

    // Bind rotation gizmo axes
    if (gizmos.rotationGizmo) {
      const rot = gizmos.rotationGizmo;
      [rot.xGizmo, rot.yGizmo, rot.zGizmo].forEach((axis) => {
        if (axis && axis.dragBehavior) {
          axis.dragBehavior.onDragStartObservable.removeCallback(onDragStart);
          axis.dragBehavior.onDragStartObservable.add(onDragStart);
          axis.dragBehavior.onDragObservable.removeCallback(onDrag);
          axis.dragBehavior.onDragObservable.add(onDrag);
          axis.dragBehavior.onDragEndObservable.removeCallback(onDragEnd);
          axis.dragBehavior.onDragEndObservable.add(onDragEnd);
        }
      });
    }

    // Bind scale gizmo axes and uniform scale box
    if (gizmos.scaleGizmo) {
      const scl = gizmos.scaleGizmo;
      [
        scl.xGizmo, 
        scl.yGizmo, 
        scl.zGizmo, 
        (scl as any).uniformGizmo
      ].forEach((axis) => {
        if (axis && axis.dragBehavior) {
          axis.dragBehavior.onDragStartObservable.removeCallback(onDragStart);
          axis.dragBehavior.onDragStartObservable.add(onDragStart);
          axis.dragBehavior.onDragObservable.removeCallback(onDrag);
          axis.dragBehavior.onDragObservable.add(onDrag);
          axis.dragBehavior.onDragEndObservable.removeCallback(onDragEnd);
          axis.dragBehavior.onDragEndObservable.add(onDragEnd);
        }
      });
    }
  }

  public syncGizmoSettings() {
    const store = useEditorStore.getState();
    
    // Gizmo Mode
    const mode = store.gizmoMode;
    this.gizmoManager.positionGizmoEnabled = mode === "translate";
    this.gizmoManager.rotationGizmoEnabled = mode === "rotate";
    this.gizmoManager.scaleGizmoEnabled = mode === "scale";

    // Snapping configuration
    const snap = store.snapping;
    const isWorld = store.gizmoSpace === "world";
    
    const posGizmo = this.gizmoManager.gizmos.positionGizmo;
    if (posGizmo) {
      posGizmo.snapDistance = snap.translateEnabled ? snap.translateValue : 0;
      posGizmo.planarGizmoEnabled = true;
      posGizmo.updateGizmoRotationToMatchAttachedMesh = !isWorld;
    }

    const rotGizmo = this.gizmoManager.gizmos.rotationGizmo;
    if (rotGizmo) {
      // Rotation snap distance is specified in radians
      rotGizmo.snapDistance = snap.rotateEnabled ? (snap.rotateValue * Math.PI) / 180 : 0;
      rotGizmo.updateGizmoRotationToMatchAttachedMesh = !isWorld;
    }

    const sclGizmo = this.gizmoManager.gizmos.scaleGizmo;
    if (sclGizmo) {
      sclGizmo.snapDistance = snap.scaleEnabled ? snap.scaleValue : 0;
      sclGizmo.sensitivity = 1;
    }

    // Space: Local vs World
    this.gizmoManager.coordinatesMode = isWorld ? 0 : 1; // 0 = World, 1 = Local

    // Bind drag behavior callbacks to currently active gizmos
    this.bindGizmoListeners();
  }

  public attachGizmo(ids: string[]) {
    // Release previous attachments
    this.detachGizmo();
    this.currentAttachedIds = [...ids];

    if (ids.length === 0) return;

    if (ids.length === 1) {
      const node = this.editor.nodesMap.get(ids[0]);
      if (node && node instanceof AbstractMesh) {
        this.gizmoManager.attachToMesh(node);
      } else if (node && (node instanceof TransformNode || "position" in node)) {
        this.gizmoManager.attachToNode(node as any);
      }
    } else {
      // Multi-selection: create temporary group node at selection center
      this.tempGroup = new TransformNode("temp_gizmo_group", this.editor.scene);
      
      let sumPos = Vector3.Zero();
      let count = 0;

      ids.forEach((id) => {
        const node = this.editor.nodesMap.get(id);
        if (node) {
          const nodePos = (node as any).absolutePosition || (node as any).position || Vector3.Zero();
          sumPos.addInPlace(nodePos);
          count++;
        }
      });

      if (count > 0) {
        sumPos.scaleInPlace(1 / count);
        this.tempGroup.position.copyFrom(sumPos);
      }

      // Parent selected meshes to the temp group, keeping world transforms
      ids.forEach((id) => {
        const node = this.editor.nodesMap.get(id);
        if (node && "setParent" in node) {
          this.originalParents.set(id, (node as any).parent);
          (node as any).setParent(this.tempGroup);
        }
      });

      // Attach gizmo to temp group
      this.gizmoManager.attachToNode(this.tempGroup);
    }

    this.syncGizmoSettings();
  }

  private detachGizmo() {
    this.gizmoManager.attachToMesh(null);
    this.gizmoManager.attachToNode(null);

    if (this.tempGroup) {
      // Revert children back to their original parents
      this.currentAttachedIds.forEach((id) => {
        const node = this.editor.nodesMap.get(id);
        if (node && "setParent" in node) {
          const originalParent = this.originalParents.get(id) || null;
          (node as any).setParent(originalParent);
        }
      });

      this.tempGroup.dispose();
      this.tempGroup = null;
      this.originalParents.clear();
    }
  }

  private applyCurrentTransformsToStore() {
    // If multi-select or single, update transformed object properties in store
    this.currentAttachedIds.forEach((id) => {
      const node = this.editor.nodesMap.get(id);
      if (!node) return;

      const pos = (node as any).position;
      const rotQuat = (node as any).rotationQuaternion;
      const rotEuler = (node as any).rotation;

      let rotX = 0;
      let rotY = 0;
      let rotZ = 0;

      if (rotQuat) {
        const euler = rotQuat.toEulerAngles();
        rotX = Number(((euler.x * 180) / Math.PI).toFixed(2));
        rotY = Number(((euler.y * 180) / Math.PI).toFixed(2));
        rotZ = Number(((euler.z * 180) / Math.PI).toFixed(2));
      } else if (rotEuler && typeof rotEuler.x === "number") {
        rotX = Number(((rotEuler.x * 180) / Math.PI).toFixed(2));
        rotY = Number(((rotEuler.y * 180) / Math.PI).toFixed(2));
        rotZ = Number(((rotEuler.z * 180) / Math.PI).toFixed(2));
      }

      const posX = pos && typeof pos.x === "number" ? Number(pos.x.toFixed(3)) : 0;
      const posY = pos && typeof pos.y === "number" ? Number(pos.y.toFixed(3)) : 0;
      const posZ = pos && typeof pos.z === "number" ? Number(pos.z.toFixed(3)) : 0;

      const scl = (node as any).scaling;
      const sclX = scl && typeof scl.x === "number" ? Number(scl.x.toFixed(3)) : 1;
      const sclY = scl && typeof scl.y === "number" ? Number(scl.y.toFixed(3)) : 1;
      const sclZ = scl && typeof scl.z === "number" ? Number(scl.z.toFixed(3)) : 1;

      useEditorStore.getState().updateObject(id, {
        position: [posX, posY, posZ],
        rotation: [rotX, rotY, rotZ],
        scale: [sclX, sclY, sclZ]
      });
    });
  }

  public setMode(mode: "translate" | "rotate" | "scale" | "none") {
    useEditorStore.getState().setGizmoMode(mode);
    this.syncGizmoSettings();
  }

  public setSpace(space: "local" | "world") {
    useEditorStore.getState().setGizmoSpace(space);
    this.syncGizmoSettings();
  }

  public dispose() {
    this.detachGizmo();
    this.gizmoManager.dispose();
  }
}
