import { EditorEngine } from "../EditorEngine";
import { GLBImporter } from "./GLBImporter";
import { GLTFImporter } from "./GLTFImporter";

export class ImportManager {
  private editor: EditorEngine;
  private glbImporter: GLBImporter;
  private gltfImporter: GLTFImporter;

  constructor(editor: EditorEngine) {
    this.editor = editor;
    this.glbImporter = new GLBImporter(editor);
    this.gltfImporter = new GLTFImporter(editor);
  }

  public async importFile(file: File, onProgress?: (progress: number) => void): Promise<string> {
    const name = file.name.replace(/\.[^/.]+$/, "");
    if (file.name.endsWith(".gltf")) {
      return this.gltfImporter.importAsset(file, name, onProgress);
    } else {
      return this.glbImporter.importAsset(file, name, onProgress);
    }
  }

  public async importFromUrl(url: string, name: string, onProgress?: (progress: number) => void): Promise<string> {
    if (url.endsWith(".gltf")) {
      return this.gltfImporter.importAsset(url, name, onProgress);
    } else {
      return this.glbImporter.importAsset(url, name, onProgress);
    }
  }
}
