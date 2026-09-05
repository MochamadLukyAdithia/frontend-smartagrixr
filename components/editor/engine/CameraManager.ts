import { ArcRotateCamera, FreeCamera, TargetCamera, Vector3 } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export class CameraManager {
  private editor: EditorEngine;
  private defaultCamera: ArcRotateCamera | null = null;
  private cameras: Map<string, TargetCamera> = new Map();

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public createDefaultCamera() {
    // Create an ArcRotateCamera for the orbit/pan/zoom viewport navigation
    const camera = new ArcRotateCamera(
      "default_camera",
      Math.PI / 4,
      Math.PI / 3,
      10,
      new Vector3(0, 0, 0),
      this.editor.scene
    );
    camera.attachControl(this.editor.canvas, true);
    camera.wheelPrecision = 50;
    camera.lowerRadiusLimit = 0.1;
    camera.upperRadiusLimit = 500;
    
    // Configure default controls
    camera.keysLeft = [];
    camera.keysRight = [];
    camera.keysUp = [];
    camera.keysDown = [];

    this.defaultCamera = camera;
    this.editor.scene.activeCamera = camera;
  }

  public switchCamera(cameraId: string) {
    if (cameraId === "default_camera" && this.defaultCamera) {
      this.editor.scene.activeCamera = this.defaultCamera;
      this.defaultCamera.attachControl(this.editor.canvas, true);
      useEditorStore.getState().setActiveCameraId("default_camera");
      return;
    }

    const camera = this.cameras.get(cameraId);
    if (camera) {
      if (this.editor.scene.activeCamera) {
        this.editor.scene.activeCamera.detachControl();
      }
      this.editor.scene.activeCamera = camera;
      camera.attachControl(this.editor.canvas, true);
      useEditorStore.getState().setActiveCameraId(cameraId);
    }
  }

  public addCamera(id: string, name: string, type: "perspective" | "orthographic") {
    // Create a user camera
    const camera = new ArcRotateCamera(
      id,
      Math.PI / 4,
      Math.PI / 3,
      15,
      Vector3.Zero(),
      this.editor.scene
    );

    if (type === "orthographic") {
      camera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
      camera.orthoLeft = -5;
      camera.orthoRight = 5;
      camera.orthoTop = 5;
      camera.orthoBottom = -5;
    }

    this.cameras.set(id, camera);
    this.editor.nodesMap.set(id, camera);

    // Sync to Zustand
    const stateObj = {
      id,
      name,
      type: "camera" as const,
      parentId: null,
      visible: true,
      locked: false,
      position: [camera.position.x, camera.position.y, camera.position.z] as [number, number, number],
      rotation: [camera.rotation.x, camera.rotation.y, camera.rotation.z] as [number, number, number],
      scale: [1, 1, 1] as [number, number, number],
      cameraSettings: {
        type,
        fov: camera.fov,
        near: camera.minZ,
        far: camera.maxZ,
      }
    };
    useEditorStore.getState().addObject(stateObj);
  }

  public updateCameraSettings(id: string, settings: any) {
    const camera = this.cameras.get(id);
    if (!camera) return;

    if (settings.type) {
      camera.mode = settings.type === "orthographic" ? ArcRotateCamera.ORTHOGRAPHIC_CAMERA : ArcRotateCamera.PERSPECTIVE_CAMERA;
    }
    if (settings.fov !== undefined) {
      camera.fov = settings.fov;
    }
    if (settings.near !== undefined) {
      camera.minZ = settings.near;
    }
    if (settings.far !== undefined) {
      camera.maxZ = settings.far;
    }
  }

  public removeCamera(id: string) {
    const camera = this.cameras.get(id);
    if (camera) {
      camera.dispose();
      this.cameras.delete(id);
      this.editor.nodesMap.delete(id);
      
      // If we deleted the active camera, fall back to default
      if (this.editor.scene.activeCamera === camera) {
        this.switchCamera("default_camera");
      }
    }
  }

  public frameSelected() {
    const selectedIds = useEditorStore.getState().selectedIds;
    if (selectedIds.length === 0) return;

    const firstId = selectedIds[0];
    const node = this.editor.nodesMap.get(firstId);
    if (!node) return;

    this.focusOnNode(node);
  }

  public frameAll() {
    // Focus on scene center
    if (this.editor.scene.activeCamera && "setTarget" in this.editor.scene.activeCamera) {
      const activeCam = this.editor.scene.activeCamera as any;
      activeCam.setTarget(Vector3.Zero());
      if (activeCam.radius) {
        activeCam.radius = 15;
      }
    }
  }

  public focusOnNode(node: any) {
    if (!node) return;
    
    // Find absolute position
    let position = Vector3.Zero();
    if (node.absolutePosition) {
      position = node.absolutePosition;
    } else if (node.position) {
      position = node.position;
    }

    if (this.editor.scene.activeCamera && "setTarget" in this.editor.scene.activeCamera) {
      const activeCam = this.editor.scene.activeCamera as any;
      activeCam.setTarget(position.clone());
    }
  }

  public setViewportMode(mode: "perspective" | "top" | "front" | "right") {
    if (!this.defaultCamera) return;

    this.switchCamera("default_camera");

    if (mode === "perspective") {
      this.defaultCamera.mode = ArcRotateCamera.PERSPECTIVE_CAMERA;
      this.defaultCamera.alpha = Math.PI / 4;
      this.defaultCamera.beta = Math.PI / 3;
    } else {
      // 2D Orthographic projection mode
      this.defaultCamera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;
      const aspect = this.editor.engine.getAspectRatio(this.defaultCamera) || 1.6;
      const zoomSize = 7;
      this.defaultCamera.orthoLeft = -zoomSize * aspect;
      this.defaultCamera.orthoRight = zoomSize * aspect;
      this.defaultCamera.orthoTop = zoomSize;
      this.defaultCamera.orthoBottom = -zoomSize;

      switch (mode) {
        case "top":
          this.defaultCamera.alpha = -Math.PI / 2;
          this.defaultCamera.beta = 0.001;
          break;
        case "front":
          this.defaultCamera.alpha = -Math.PI / 2;
          this.defaultCamera.beta = Math.PI / 2;
          break;
        case "right":
          this.defaultCamera.alpha = 0;
          this.defaultCamera.beta = Math.PI / 2;
          break;
      }
    }
  }
}
