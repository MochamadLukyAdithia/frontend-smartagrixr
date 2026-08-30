import { WebXRDefaultExperience, WebXRHitTest, Vector3, TransformNode } from "@babylonjs/core";
import { EditorEngine } from "../EditorEngine";

export class ARManager {
  private editor: EditorEngine;
  private xrExperience: WebXRDefaultExperience | null = null;
  private isARActive: boolean = false;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public async checkARSupport(): Promise<boolean> {
    if (typeof navigator === "undefined" || !("xr" in navigator)) {
      return false;
    }
    try {
      const isSupported = await (navigator as any).xr.isSessionSupported("immersive-ar");
      return !!isSupported;
    } catch {
      return false;
    }
  }

  public async startWebXR(): Promise<boolean> {
    try {
      if (!this.xrExperience) {
        this.xrExperience = await this.editor.scene.createDefaultXRExperienceAsync({
          uiOptions: {
            sessionMode: "immersive-ar",
          },
          optionalFeatures: true,
        });

        // Hide editor helpers during XR
        this.editor.selectionManager.clearSelection();
        if (this.editor.sceneManager) {
          this.editor.scene.meshes.forEach((mesh) => {
            if (mesh.name === "editor_grid" || mesh.name.startsWith("axis")) {
              mesh.setEnabled(false);
            }
          });
        }

        this.xrExperience.baseExperience.onStateChangedObservable.add((state) => {
          // 2 = IN_XR, 3 = NOT_IN_XR
          if (state === 3) {
            this.isARActive = false;
            this.editor.sceneManager.updateGrid();
            this.editor.sceneManager.updateAxis();
          } else if (state === 2) {
            this.isARActive = true;
          }
        });
      }

      await this.xrExperience.baseExperience.enterXRAsync("immersive-ar", "local-floor");
      this.isARActive = true;
      return true;
    } catch (error) {
      console.warn("Failed to enter WebXR AR session", error);
      return false;
    }
  }

  public async exitXR() {
    if (this.xrExperience && this.isARActive) {
      await this.xrExperience.baseExperience.exitXRAsync();
      this.isARActive = false;
    }
  }

  public isSessionActive(): boolean {
    return this.isARActive;
  }
}
