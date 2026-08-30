import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export class PreviewManager {
  private editor: EditorEngine;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public togglePreview(enabled: boolean) {
    if (enabled) {
      // Enter Preview Mode: clear selection, hide helpers
      this.editor.selectionManager.clearSelection();
      
      // Hide grid & axis temporarily
      if (this.editor.sceneManager) {
        // We override settings or just dispose the visual meshes
        this.editor.scene.meshes.forEach((mesh) => {
          if (mesh.name === "editor_grid" || mesh.name.startsWith("axis")) {
            mesh.setEnabled(false);
          }
        });
      }
    } else {
      // Exit Preview Mode: restore helpers
      if (this.editor.sceneManager) {
        this.editor.sceneManager.updateGrid();
        this.editor.sceneManager.updateAxis();
      }
    }
  }
}
