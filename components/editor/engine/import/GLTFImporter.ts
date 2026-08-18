import { EditorEngine } from "../EditorEngine";
import { GLBImporter } from "./GLBImporter";

export class GLTFImporter {
  private importer: GLBImporter;

  constructor(editor: EditorEngine) {
    this.importer = new GLBImporter(editor);
  }

  public async importAsset(
    source: File | string,
    name: string,
    onProgress?: (event: any) => void
  ): Promise<string> {
    return this.importer.importAsset(source, name, onProgress);
  }
}
