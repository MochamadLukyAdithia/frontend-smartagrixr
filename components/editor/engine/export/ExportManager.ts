import { EditorEngine } from "../EditorEngine";
import { GLBExporter } from "./GLBExporter";

export class ExportManager {
  private editor: EditorEngine;
  private glbExporter: GLBExporter;

  constructor(editor: EditorEngine) {
    this.editor = editor;
    this.glbExporter = new GLBExporter(editor);
  }

  public async exportToGLB(fileName: string = "smartagri-scene") {
    try {
      const blob = await this.glbExporter.exportScene(fileName);
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = `${fileName}.glb`;
      if (document.body) {
        document.body.appendChild(link);
      }
      link.click();
      
      if (document.body) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export GLB", error);
      alert("Failed to export GLB model.");
    }
  }
}
