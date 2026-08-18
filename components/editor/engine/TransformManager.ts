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

    // Force instantiate gizmo meshes so setupGizmoListeners can bind to them
    this.gizmoManager.positionGizmoEnabled = true;
    this.gizmoManager.rotationGizmoEnabled = true;
    this.gizmoManager.scaleGizmoEnabled = true;

    this.setupGizmoListeners();

    this.gizmoManager.positionGizmoEnabled = false;
    this.gizmoManager.rotationGizmoEnabled = false;
    this.gizmoManager.scaleGizmoEnabled = false;

    this.syncGizmoSettings();
  }

  private setupGizmoListeners() {
    // Listen to changes in gizmo transforms to update Zustand store
    const onDragEnd = () => {
      this.isDragging = false;
      this.applyCurrentTransformsToStore();
    };

    const onDragStart = () => {
      this.isDragging = true;
    };

    const gizmos = this.gizmoManager.gizmos;
    
    // Bind position gizmo axes
    if (gizmos.positionGizmo) {
      [gizmos.positionGizmo.xGizmo, gizmos.positionGizmo.yGizmo, gizmos.positionGizmo.zGizmo].forEach((axis) => {
        axis?.dragBehavior.onDragStartObservable.add(onDragStart);
        axis?.dragBehavior.onDragEndObservable.add(onDragEnd);
      });
    }

    // Bind rotation gizmo axes
    if (gizmos.rotationGizmo) {
      [gizmos.rotationGizmo.xGizmo, gizmos.rotationGizmo.yGizmo, gizmos.rotationGizmo.zGizmo].forEach((axis) => {
        axis?.dragBehavior.onDragStartObservable.add(onDragStart);
        axis?.dragBehavior.onDragEndObservable.add(onDragEnd);
      });
    }

    // Bind scale gizmo axes
    if (gizmos.scaleGizmo) {
      [gizmos.scaleGizmo.xGizmo, gizmos.scaleGizmo.yGizmo, gizmos.scaleGizmo.zGizmo, (gizmos.scaleGizmo as any).uniformGizmo].forEach((axis) => {
        axis?.dragBehavior.onDragStartObservable.add(onDragStart);
        axis?.dragBehavior.onDragEndObservable.add(onDragEnd);
      });
    }

    // Also observe engine frame rendering to update store coordinates interactively if dragging
    this.editor.scene.onBeforeRenderObservable.add(() => {
      if (this.isDragging) {
        this.applyCurrentTransformsToStore();
      }
    });
  }

  public syncGizmoSettings() {
    const store = useEditorStore.getState();
    
    // Snapping configuration
    const snap = store.snapping;
    
    const posGizmo = this.gizmoManager.gizmos.positionGizmo;
    if (posGizmo) {
      posGizmo.snapDistance = snap.translateEnabled ? snap.translateValue : 0;
    }

    const rotGizmo = this.gizmoManager.gizmos.rotationGizmo;
    if (rotGizmo) {
      // Rotation snap distance is specified in radians
      rotGizmo.snapDistance = snap.rotateEnabled ? (snap.rotateValue * Math.PI) / 180 : 0;
    }

    const sclGizmo = this.gizmoManager.gizmos.scaleGizmo;
    if (sclGizmo) {
      sclGizmo.snapDistance = snap.scaleEnabled ? snap.scaleValue : 0;
    }

    // Space: Local vs World
    const isWorld = store.gizmoSpace === "world";
    this.gizmoManager.coordinatesMode = isWorld ? 0 : 1; // 0 = World, 1 = Local

    // Gizmo Mode
    const mode = store.gizmoMode;
    this.gizmoManager.positionGizmoEnabled = mode === "translate";
    this.gizmoManager.rotationGizmoEnabled = mode === "rotate";
    this.gizmoManager.scaleGizmoEnabled = mode === "scale";
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
      } else if (node && "position" in node) {
        // For cameras or lights, we attach gizmo to a placeholder mesh or we can use custom attachments
        // If it's a transform node, we can cast it or wrap it
        this.gizmoManager.attachToNode(node);
      }
    } else {
      // Multi-selection: create temporary group node at selection center
      this.tempGroup = new TransformNode("temp_gizmo_group", this.editor.scene);
      
      let sumPos = Vector3.Zero();
      let count = 0;

      ids.forEach((id) => {
        const node = this.editor.nodesMap.get(id);
        if (node) {
          sumPos.addInPlace(node.absolutePosition || node.position || Vector3.Zero());
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
        if (node) {
          this.originalParents.set(id, node.parent);
          node.setParent(this.tempGroup);
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
        if (node) {
          const originalParent = this.originalParents.get(id) || null;
          node.setParent(originalParent);
        }
      });

      this.tempGroup.dispose();
      this.tempGroup = null;
      this.originalParents.clear();
    }
  }

  private applyCurrentTransformsToStore() {
    // If multi-select, we must update all children's properties
    this.currentAttachedIds.forEach((id) => {
      const node = this.editor.nodesMap.get(id);
      if (!node) return;

      const pos = node.position;
      const rot = node.rotationQuaternion 
        ? node.rotationQuaternion.toEulerAngles() 
        : node.rotation;
      const scl = node.scaling;

      useEditorStore.getState().updateObject(id, {
        position: [pos.x, pos.y, pos.z],
        rotation: [
          rot.x * (180 / Math.PI),
          rot.y * (180 / Math.PI),
          rot.z * (180 / Math.PI)
        ],
        scale: [scl.x, scl.y, scl.z]
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
