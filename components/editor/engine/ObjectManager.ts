import { Mesh, MeshBuilder, TransformNode, Vector3 } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { SceneObject, useEditorStore } from "../store/useEditorStore";

export class ObjectManager {
  private editor: EditorEngine;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public clearSceneRuntime() {
    this.editor.selectionManager.clearSelection();
    
    for (const [id, node] of this.editor.nodesMap.entries()) {
      if (id !== "main_directional_light" && id !== "default_camera") {
        node.dispose();
      }
    }
    this.editor.nodesMap.clear();

    const light = this.editor.scene.getLightById("main_directional_light");
    if (light) this.editor.nodesMap.set("main_directional_light", light);
    const camera = this.editor.scene.getCameraById("default_camera");
    if (camera) this.editor.nodesMap.set("default_camera", camera);
  }

  public async loadActiveScene() {
    this.clearSceneRuntime();
    const objects = useEditorStore.getState().getObjects();
    
    // Sort to ensure parents are created before child nodes
    const sorted = [...objects].sort((a, b) => {
      if (a.parentId === null && b.parentId !== null) return -1;
      if (a.parentId !== null && b.parentId === null) return 1;
      return 0;
    });

    for (const obj of sorted) {
      if (obj.type === "empty" || obj.type === "group") {
        const node = new TransformNode(obj.id, this.editor.scene);
        node.name = obj.name;
        node.position.set(obj.position[0], obj.position[1], obj.position[2]);
        node.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
        node.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);
        this.editor.nodesMap.set(obj.id, node);
      }
    }

    // Set parenting relationships
    sorted.forEach((obj) => {
      if (obj.parentId) {
        this.setParent(obj.id, obj.parentId);
      }
    });
  }

  public createEmpty(name: string = "Empty Node", parentId: string | null = null): string {
    const id = "empty_" + Math.random().toString(36).substr(2, 9);
    const node = new TransformNode(id, this.editor.scene);
    node.name = name;

    this.editor.nodesMap.set(id, node);

    const stateObj: SceneObject = {
      id,
      name,
      type: "empty",
      parentId,
      visible: true,
      locked: false,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    useEditorStore.getState().addObject(stateObj);

    if (parentId) {
      this.setParent(id, parentId);
    }

    return id;
  }

  public createGroup(name: string = "Group"): string {
    const id = "group_" + Math.random().toString(36).substr(2, 9);
    const node = new TransformNode(id, this.editor.scene);
    node.name = name;

    this.editor.nodesMap.set(id, node);

    const selectedIds = useEditorStore.getState().selectedIds;

    const stateObj: SceneObject = {
      id,
      name,
      type: "group",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    useEditorStore.getState().addObject(stateObj);

    // If objects are selected, parent them to this group
    if (selectedIds.length > 0) {
      // Find average position of selected objects to place the group pivot
      let avgPos = Vector3.Zero();
      let count = 0;
      selectedIds.forEach((selId) => {
        const childNode = this.editor.nodesMap.get(selId);
        if (childNode) {
          avgPos.addInPlace(childNode.absolutePosition || childNode.position || Vector3.Zero());
          count++;
        }
      });
      if (count > 0) {
        avgPos.scaleInPlace(1 / count);
        node.position = avgPos;
        useEditorStore.getState().updateObject(id, {
          position: [avgPos.x, avgPos.y, avgPos.z]
        });
      }

      selectedIds.forEach((selId) => {
        this.setParent(selId, id);
      });
    }

    useEditorStore.getState().setSelectedIds([id]);
    return id;
  }

  public setParent(childId: string, parentId: string | null) {
    const childNode = this.editor.nodesMap.get(childId);
    if (!childNode) return;

    if (parentId === null) {
      // Remove parent
      childNode.setParent(null);
      useEditorStore.getState().updateObject(childId, { parentId: null });
      this.updateObjectStateFromBabylon(childId);
      return;
    }

    // Circular dependency check
    if (this.isDescendant(parentId, childId)) {
      console.warn("Circular parenting detected!");
      return;
    }

    const parentNode = this.editor.nodesMap.get(parentId);
    if (parentNode) {
      // Set parent preserving world transform
      childNode.setParent(parentNode);
      useEditorStore.getState().updateObject(childId, { parentId });
      this.updateObjectStateFromBabylon(childId);
    }
  }

  private isDescendant(checkId: string, potentialAncestorId: string): boolean {
    if (checkId === potentialAncestorId) return true;
    const objects = useEditorStore.getState().getObjects();
    const obj = objects.find(o => o.id === checkId);
    if (obj && obj.parentId) {
      return this.isDescendant(obj.parentId, potentialAncestorId);
    }
    return false;
  }

  public updateObjectStateFromBabylon(id: string) {
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
      scale: [scl.x, scl.y, scl.z],
    });
  }

  public setVisibility(id: string, visible: boolean) {
    const node = this.editor.nodesMap.get(id);
    if (node) {
      if ("setEnabled" in node) {
        node.setEnabled(visible);
      }
      useEditorStore.getState().updateObject(id, { visible });
    }
  }

  public setLocked(id: string, locked: boolean) {
    useEditorStore.getState().updateObject(id, { locked });
    // SelectionManager and TransformManager will check store's locked status
  }

  public deleteObject(id: string) {
    // Recursively delete children
    const objects = useEditorStore.getState().getObjects();
    const children = objects.filter(o => o.parentId === id);
    children.forEach(child => this.deleteObject(child.id));

    const node = this.editor.nodesMap.get(id);
    if (node) {
      node.dispose();
      this.editor.nodesMap.delete(id);
    }

    useEditorStore.getState().removeObject(id);
  }

  public duplicateObject(id: string): string | null {
    const obj = useEditorStore.getState().getObjects().find(o => o.id === id);
    const originalNode = this.editor.nodesMap.get(id);
    if (!obj || !originalNode) return null;

    const newId = obj.type + "_" + Math.random().toString(36).substr(2, 9);
    let clonedNode: any;

    if ("clone" in originalNode) {
      clonedNode = originalNode.clone(obj.name + " (Copy)", null);
    } else {
      clonedNode = new TransformNode(newId, this.editor.scene);
    }

    clonedNode.name = obj.name + " (Copy)";
    clonedNode.position.copyFrom(originalNode.position);
    if (originalNode.rotation) clonedNode.rotation.copyFrom(originalNode.rotation);
    if (originalNode.rotationQuaternion) clonedNode.rotationQuaternion = originalNode.rotationQuaternion.clone();
    clonedNode.scaling.copyFrom(originalNode.scaling);

    this.editor.nodesMap.set(newId, clonedNode);

    const clonedObj: SceneObject = {
      ...obj,
      id: newId,
      name: obj.name + " (Copy)",
      parentId: obj.parentId,
    };

    useEditorStore.getState().addObject(clonedObj);

    if (obj.parentId) {
      this.setParent(newId, obj.parentId);
    }

    // Duplicate children
    const objects = useEditorStore.getState().getObjects();
    const children = objects.filter(o => o.parentId === id);
    children.forEach(child => {
      const childCopyId = this.duplicateObject(child.id);
      if (childCopyId) {
        this.setParent(childCopyId, newId);
      }
    });

    return newId;
  }

  public createImage(file: File): string {
    const id = "image_" + Math.random().toString(36).substr(2, 9);
    const url = URL.createObjectURL(file);
    
    // Import Texture and PBRMaterial dynamically or ensure imported
    const { PBRMaterial, Texture, MeshBuilder } = require("@babylonjs/core");
    
    const plane = MeshBuilder.CreatePlane(id, { size: 2, sideOrientation: 2 }, this.editor.scene);
    plane.name = file.name;
    
    const mat = new PBRMaterial(id + "_material", this.editor.scene);
    mat.albedoTexture = new Texture(url, this.editor.scene);
    mat.roughness = 0.8;
    mat.metallic = 0.1;
    plane.material = mat;

    this.editor.nodesMap.set(id, plane);

    const stateObj: SceneObject = {
      id,
      name: file.name,
      type: "image",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      mediaUrl: url,
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }

  public createText(text: string, color: string = "#000000", size: number = 40): string {
    const id = "text_" + Math.random().toString(36).substr(2, 9);
    
    const { StandardMaterial, DynamicTexture, MeshBuilder } = require("@babylonjs/core");
    
    const plane = MeshBuilder.CreatePlane(id, { width: 3, height: 1.5 }, this.editor.scene);
    plane.name = `Text: ${text.substring(0, 10)}`;
    
    const dynamicTexture = new DynamicTexture(id + "_texture", { width: 512, height: 256 }, this.editor.scene, true);
    const mat = new StandardMaterial(id + "_material", this.editor.scene);
    mat.diffuseTexture = dynamicTexture;
    plane.material = mat;
    
    dynamicTexture.drawText(text, null, 140, `bold ${size}px sans-serif`, color, "#ffffff", true, true);

    this.editor.nodesMap.set(id, plane);

    const stateObj: SceneObject = {
      id,
      name: text,
      type: "text",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      textConfig: {
        text,
        font: "sans-serif",
        size,
        color,
        alignment: "center",
      },
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }

  public createVideo(file: File): string {
    const id = "video_" + Math.random().toString(36).substr(2, 9);
    const url = URL.createObjectURL(file);
    
    const { StandardMaterial, VideoTexture, MeshBuilder } = require("@babylonjs/core");
    
    const plane = MeshBuilder.CreatePlane(id, { size: 3 }, this.editor.scene);
    plane.name = file.name;
    
    const mat = new StandardMaterial(id + "_material", this.editor.scene);
    mat.diffuseTexture = new VideoTexture(id + "_texture", url, this.editor.scene, true, false);
    plane.material = mat;

    this.editor.nodesMap.set(id, plane);

    const stateObj: SceneObject = {
      id,
      name: file.name,
      type: "video",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      mediaUrl: url,
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }

  public createAudio(file: File): string {
    const id = "audio_" + Math.random().toString(36).substr(2, 9);
    const url = URL.createObjectURL(file);
    
    const { Sound, TransformNode } = require("@babylonjs/core");
    
    const node = new TransformNode(id, this.editor.scene);
    node.name = file.name;
    
    const sound = new Sound(id + "_sound", url, this.editor.scene, () => {
      sound.play();
    }, { loop: true, autoplay: true, spatialSound: true, maxDistance: 10 });
    sound.attachToMesh(node);

    this.editor.nodesMap.set(id, node);

    const stateObj: SceneObject = {
      id,
      name: file.name,
      type: "audio",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      mediaUrl: url,
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }
}
