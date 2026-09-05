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
      extension = source.name.toLowerCase().endsWith(".gltf") ? ".gltf" : ".glb";
    } else {
      const cleanUrl = source.toLowerCase().split("?")[0];
      extension = cleanUrl.endsWith(".gltf") ? ".gltf" : ".glb";
      if (source.startsWith("http://") || source.startsWith("https://")) {
        url = `/api/proxy-model?url=${encodeURIComponent(source)}`;
      } else {
        url = source;
      }
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

      // Compute bounding box of imported meshes and normalize to rootNode origin
      let min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
      let max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
      let hasBounds = false;

      result.meshes.forEach((mesh) => {
        mesh.isPickable = true;
        if (mesh.getTotalVertices && mesh.getTotalVertices() > 0) {
          mesh.computeWorldMatrix(true);
          const boundingInfo = mesh.getBoundingInfo();
          min = Vector3.Minimize(min, boundingInfo.boundingBox.minimumWorld);
          max = Vector3.Maximize(max, boundingInfo.boundingBox.maximumWorld);
          hasBounds = true;
        }
      });

      if (hasBounds) {
        const center = min.add(max).scale(0.5);
        const bottomY = min.y;

        result.meshes.forEach((mesh) => {
          if (!mesh.parent) {
            mesh.position.x -= center.x;
            mesh.position.y -= bottomY;
            mesh.position.z -= center.z;
            mesh.setParent(rootNode);
          }
        });
      } else {
        result.meshes.forEach((mesh) => {
          if (!mesh.parent) {
            mesh.setParent(rootNode);
          }
        });
      }

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
        mediaUrl: typeof source === "string" ? source : undefined,
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

      // Record undo snapshot before adding imported asset
      this.editor.historyManager.recordSnapshot();

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
