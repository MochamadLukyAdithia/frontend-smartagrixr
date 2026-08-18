import { GLTF2Export } from "@babylonjs/serializers";
import { EditorEngine } from "../EditorEngine";

export class GLBExporter {
  private editor: EditorEngine;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public async exportScene(fileName: string = "scene"): Promise<Blob> {
    const activeSelection = useEditorStoreSelectionState();
    // Temporarily detach gizmos before export to ensure no gizmo meshes are exported
    this.editor.selectionManager.clearSelection();

    try {
      const options = {
        shouldExportNode: (node: any) => {
          const name = node.name || "";
          if (
            name.indexOf("editor_grid") !== -1 ||
            name.indexOf("axis") !== -1 ||
            name.indexOf("temp_gizmo_group") !== -1 ||
            name.indexOf("Gizmo") !== -1 ||
            name.indexOf("helper") !== -1 ||
            name === "default_camera" ||
            node.id === "default_camera"
          ) {
            return false;
          }
          return true;
        },
      };

      const result = await GLTF2Export.GLBAsync(this.editor.scene, fileName, options);
      
      // Get the exported blob
      const fileKey = Object.keys(result.glTFFiles).find((key) => key.endsWith(".glb"));
      if (!fileKey) {
        throw new Error("No glb file found in export results");
      }

      return result.glTFFiles[fileKey] as Blob;
    } catch (error) {
      console.error("Export to GLB failed", error);
      throw error;
    } finally {
      // Restore selection if it existed
      if (activeSelection.length > 0) {
        this.editor.selectionManager.selectObject(activeSelection[0]);
      }
    }
  }
}

// Inline helper to avoid circular imports during build
function useEditorStoreSelectionState(): string[] {
  try {
    const { useEditorStore } = require("../../store/useEditorStore");
    return useEditorStore.getState().selectedIds;
  } catch {
    return [];
  }
}
