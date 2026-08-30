import { SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
// Register loaders
import "@babylonjs/loaders/glTF";
import { EditorEngine } from "../EditorEngine";
import { useEditorStore, SceneObject } from "../../store/useEditorStore";

export class GLBImporter {
  private editor: EditorEngine;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public async importAsset(
    source: File | string,
    name: string,
    onProgress?: (event: any) => void
  ): Promise<string> {
    let url = "";
    let extension = ".glb";

    if (source instanceof File) {
      url = URL.createObjectURL(source);
      extension = source.name.endsWith(".gltf") ? ".gltf" : ".glb";
    } else {
      url = source;
      extension = url.endsWith(".gltf") ? ".gltf" : ".glb";
    }

    try {
      const result = await SceneLoader.ImportMeshAsync(
        "", 
        "", 
        url, 
        this.editor.scene, 
        (evt) => {
          if (onProgress && evt.lengthComputable) {
            onProgress(evt.loaded / evt.total);
          }
        },
        extension
      );

      // Create a single logical root node for the imported asset
      const assetId = "asset_" + Math.random().toString(36).substr(2, 9);
      const rootNode = new TransformNode(assetId, this.editor.scene);
      rootNode.name = name;

      // Parent all top-level imported meshes to our logical root node
      result.meshes.forEach((mesh) => {
        if (!mesh.parent) {
          mesh.setParent(rootNode);
        }
      });

      // Register root node in editor map
      this.editor.nodesMap.set(assetId, rootNode);

      // Add to Zustand
      const stateObj: SceneObject = {
        id: assetId,
        name: name,
        type: "model",
        parentId: null,
        visible: true,
        locked: false,
        position: [rootNode.position.x, rootNode.position.y, rootNode.position.z],
        rotation: [rootNode.rotation.x, rootNode.rotation.y, rootNode.rotation.z],
        scale: [rootNode.scaling.x, rootNode.scaling.y, rootNode.scaling.z],
        assetId: assetId,
        metadata: {
          importedAt: new Date().toISOString(),
          meshCount: result.meshes.length,
          animationCount: result.animationGroups.length,
        },
      };

      // Add assets and instances metadata
      useEditorStore.getState().addAsset({
        id: assetId,
        name: name,
        url: source instanceof File ? source.name : source,
        type: extension === ".gltf" ? "gltf" : "glb",
      });

      useEditorStore.getState().addObject(stateObj);

      // Register animations
      if (result.animationGroups.length > 0) {
        this.editor.animationManager.registerAnimationGroups(assetId, result.animationGroups);
      }

      // Select it and frame camera
      this.editor.selectionManager.selectObject(assetId);
      this.editor.cameraManager.focusOnNode(rootNode);

      return assetId;
    } catch (error) {
      console.error("Failed to import asset", error);
      throw error;
    } finally {
      if (source instanceof File) {
        URL.revokeObjectURL(url);
      }
    }
  }
}
