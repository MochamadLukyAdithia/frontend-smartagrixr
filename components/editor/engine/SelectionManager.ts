import { HighlightLayer, Color3, AbstractMesh, Mesh, PointerEventTypes } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export class SelectionManager {
  private editor: EditorEngine;
  private highlightLayer: HighlightLayer | null = null;
  private onPointerObserver: any = null;

  constructor(editor: EditorEngine) {
    this.editor = editor;
    this.highlightLayer = new HighlightLayer("selection_highlight", this.editor.scene);
    this.highlightLayer.innerGlow = false;
    this.highlightLayer.outerGlow = true;

    this.setupPicking();
  }

  private setupPicking() {
    let startX = 0;
    let startY = 0;

    this.onPointerObserver = this.editor.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type === PointerEventTypes.POINTERDOWN) {
        if (pointerInfo.event.button !== 0) return;
        startX = pointerInfo.event.clientX;
        startY = pointerInfo.event.clientY;
      }

      if (pointerInfo.type === PointerEventTypes.POINTERUP) {
        if (pointerInfo.event.button !== 0) return;
        
        // Skip picking if a gizmo drag or transform is in progress
        if (this.editor.transformManager.isTransforming()) {
          return;
        }

        // Calculate drag distance
        const dx = pointerInfo.event.clientX - startX;
        const dy = pointerInfo.event.clientY - startY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // If the cursor moved more than 8 pixels, consider it an orbit/pan drag and skip picking
        if (distance > 8) return;

        let pickResult = pointerInfo.pickInfo;
        if (!pickResult || !pickResult.hit || !pickResult.pickedMesh) {
          pickResult = this.editor.scene.pick(
            this.editor.scene.pointerX,
            this.editor.scene.pointerY,
            (mesh) => {
              if (
                mesh.name.indexOf("Gizmo") !== -1 ||
                mesh.name.indexOf("helper") !== -1 ||
                mesh.name.indexOf("editor_grid") !== -1 ||
                mesh.name.indexOf("axis") !== -1
              ) {
                return false;
              }
              return mesh.isPickable && mesh.isVisible;
            }
          );
        }

        if (pickResult && pickResult.hit && pickResult.pickedMesh) {
          const mesh = pickResult.pickedMesh;
          if (
            mesh.name.indexOf("Gizmo") !== -1 || 
            mesh.name.indexOf("helper") !== -1 ||
            mesh.name.indexOf("editor_grid") !== -1 ||
            mesh.name.indexOf("axis") !== -1
          ) {
            return;
          }

          // Find the logical root object in our registry
          const objectId = this.findLogicalObjectId(mesh);
          if (objectId) {
            const isPreview = useEditorStore.getState().isPreviewMode;
            if (isPreview) {
              this.editor.interactionManager.triggerClick(objectId);
            } else {
              const isMultiSelect = pointerInfo.event.ctrlKey || pointerInfo.event.metaKey;
              this.selectObject(objectId, isMultiSelect);
            }
          } else {
            // Clicked empty space
            const isPreview = useEditorStore.getState().isPreviewMode;
            if (!isPreview) {
              this.clearSelection();
            }
          }
        } else {
          // Clicked background
          const isPreview = useEditorStore.getState().isPreviewMode;
          if (!isPreview) {
            this.clearSelection();
          }
        }
      }
    });
  }

  private findLogicalObjectId(mesh: AbstractMesh): string | null {
    // Traverse up node tree to find an ID registered in nodesMap
    let current: any = mesh;
    while (current) {
      for (const [id, node] of this.editor.nodesMap.entries()) {
        if (node === current || (current.id && current.id === id)) {
          const obj = useEditorStore.getState().getObjects().find(o => o.id === id);
          if (obj && obj.locked) {
            // Locked objects cannot be picked
            return null;
          }
          return id;
        }
      }
      current = current.parent;
    }
    return null;
  }


  public selectObject(id: string, multiSelect: boolean = false) {
    const store = useEditorStore.getState();
    const obj = store.getObjects().find(o => o.id === id);
    if (!obj || obj.locked) return;

    let newSelected: string[];
    if (multiSelect) {
      if (store.selectedIds.includes(id)) {
        newSelected = store.selectedIds.filter(x => x !== id);
      } else {
        newSelected = [...store.selectedIds, id];
      }
    } else {
      newSelected = [id];
    }

    store.setSelectedIds(newSelected);
    this.updateHighlighting(newSelected);
    this.editor.transformManager.attachGizmo(newSelected);
  }

  public selectAll() {
    const store = useEditorStore.getState();
    // Select all unlocked objects
    const allIds = store.getObjects()
      .filter(o => !o.locked)
      .map(o => o.id);
    store.setSelectedIds(allIds);
    this.updateHighlighting(allIds);
    this.editor.transformManager.attachGizmo(allIds);
  }

  public clearSelection() {
    const store = useEditorStore.getState();
    store.setSelectedIds([]);
    this.updateHighlighting([]);
    this.editor.transformManager.attachGizmo([]);
  }

  public updateHighlighting(selectedIds: string[]) {
    if (!this.highlightLayer) return;

    // Clear previous highlighting
    this.highlightLayer.removeAllMeshes();

    selectedIds.forEach((id) => {
      const node = this.editor.nodesMap.get(id);
      if (!node) return;

      // Add all child meshes to highlight layer
      if (node instanceof Mesh) {
        this.highlightLayer?.addMesh(node, Color3.FromHexString("#22a447"));
      }
      node.getChildMeshes?.().forEach((mesh: any) => {
        if (mesh instanceof Mesh) {
          this.highlightLayer?.addMesh(mesh, Color3.FromHexString("#22a447"));
        }
      });
    });
  }

  public dispose() {
    if (this.onPointerObserver) {
      this.editor.scene.onPointerObservable.remove(this.onPointerObserver);
    }
    if (this.highlightLayer) {
      this.highlightLayer.dispose();
    }
  }
}
