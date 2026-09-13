import { DirectionalLight, HemisphericLight, PointLight, SpotLight, Vector3, Color3 } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { SceneObject, useEditorStore } from "../store/useEditorStore";

export class LightingManager {
  private editor: EditorEngine;
  private lights: Map<string, DirectionalLight | PointLight | SpotLight | HemisphericLight> = new Map();

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public createDefaultLights() {
    // 1. Ambient Hemispheric Light (Illuminates all models & materials from sky & ground)
    const hemiLight = new HemisphericLight("ambient_hemi_light", new Vector3(0, 1, 0), this.editor.scene);
    hemiLight.intensity = 1.0;
    hemiLight.diffuse = new Color3(1, 1, 1);
    hemiLight.groundColor = new Color3(0.4, 0.4, 0.45);
    this.lights.set("ambient_hemi_light", hemiLight);

    // 2. Scene Sunlight for directional cast shadows and depth (direct scene light, not a user object)
    const sunLight = new DirectionalLight("scene_sun_light", new Vector3(-1, -2, -1), this.editor.scene);
    sunLight.intensity = 1.0;
    sunLight.diffuse = new Color3(1, 1, 1);
    sunLight.specular = new Color3(0.2, 0.2, 0.2);
    this.lights.set("scene_sun_light", sunLight);
  }

  public addLight(type: "directional" | "point" | "spot") {
    const id = "light_" + Math.random().toString(36).substr(2, 9);
    let light: any;
    let name = "";

    if (type === "directional") {
      name = "Directional Light";
      light = new DirectionalLight(id, new Vector3(0, -1, 0), this.editor.scene);
      light.position = new Vector3(0, 5, 0);
    } else if (type === "point") {
      name = "Point Light";
      light = new PointLight(id, new Vector3(0, 3, 0), this.editor.scene);
    } else {
      name = "Spot Light";
      light = new SpotLight(id, new Vector3(0, 5, 0), new Vector3(0, -1, 0), Math.PI / 3, 2, this.editor.scene);
    }

    light.intensity = 1.0;
    light.diffuse = new Color3(1, 1, 1);

    this.lights.set(id, light);
    this.editor.nodesMap.set(id, light);

    const stateObj: SceneObject = {
      id,
      name,
      type: "light",
      parentId: null,
      visible: true,
      locked: false,
      position: [light.position.x, light.position.y, light.position.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      lightSettings: {
        type,
        color: "#ffffff",
        intensity: 1.0,
        range: type !== "directional" ? 15 : undefined,
        angle: type === "spot" ? 60 : undefined,
        exponent: type === "spot" ? 2 : undefined,
        shadows: false,
      },
    };

    useEditorStore.getState().addObject(stateObj);
    this.editor.selectionManager.selectObject(id);
  }

  public updateLightSettings(id: string, settings: any) {
    const light = this.lights.get(id);
    if (!light) return;

    if (settings.color !== undefined) {
      light.diffuse = Color3.FromHexString(settings.color);
    }
    if (settings.intensity !== undefined) {
      light.intensity = settings.intensity;
    }
    if (settings.range !== undefined && "range" in light) {
      (light as any).range = settings.range;
    }
    if (settings.angle !== undefined && "angle" in light) {
      (light as any).angle = (settings.angle * Math.PI) / 180;
    }
    if (settings.exponent !== undefined && "exponent" in light) {
      (light as any).exponent = settings.exponent;
    }

    // Save in Zustand
    const objects = useEditorStore.getState().getObjects();
    const obj = objects.find(o => o.id === id);
    if (obj && obj.lightSettings) {
      useEditorStore.getState().updateObject(id, {
        lightSettings: {
          ...obj.lightSettings,
          ...settings,
        },
      });
    }
  }

  public removeLight(id: string) {
    const light = this.lights.get(id);
    if (light) {
      light.dispose();
      this.lights.delete(id);
      this.editor.nodesMap.delete(id);
    }
  }
}
