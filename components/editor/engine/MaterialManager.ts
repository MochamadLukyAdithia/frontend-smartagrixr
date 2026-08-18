import { PBRMaterial, Color3, Texture, AbstractMesh } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export interface MaterialProperties {
  baseColor: string;
  metallic: number;
  roughness: number;
  opacity: number;
  emissive: string;
  baseColorTexture?: string | null;
}

export class MaterialManager {
  private editor: EditorEngine;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  // Get list of materials in a given object
  public getMaterialSlots(objectId: string): { slotId: string; name: string; properties: MaterialProperties }[] {
    const node = this.editor.nodesMap.get(objectId);
    if (!node) return [];

    const slots: { slotId: string; name: string; properties: MaterialProperties }[] = [];
    const seenMaterials = new Set<string>();

    const checkMesh = (mesh: AbstractMesh) => {
      const mat = mesh.material;
      if (mat && !seenMaterials.has(mat.uniqueId.toString())) {
        seenMaterials.add(mat.uniqueId.toString());

        // Extract properties (assuming PBR or Standard)
        let baseColor = "#ffffff";
        let metallic = 0.5;
        let roughness = 0.5;
        let opacity = 1.0;
        let emissive = "#000000";

        if (mat instanceof PBRMaterial) {
          baseColor = mat.albedoColor ? mat.albedoColor.toHexString() : "#ffffff";
          metallic = mat.metallic ?? 0.5;
          roughness = mat.roughness ?? 0.5;
          opacity = mat.alpha ?? 1.0;
          emissive = mat.emissiveColor ? mat.emissiveColor.toHexString() : "#000000";
        }

        slots.push({
          slotId: mat.uniqueId.toString(),
          name: mat.name || "Unnamed Material",
          properties: {
            baseColor,
            metallic,
            roughness,
            opacity,
            emissive,
          },
        });
      }
    };

    if (node instanceof AbstractMesh) {
      checkMesh(node);
    }
    node.getChildMeshes?.().forEach(checkMesh);

    return slots;
  }

  // Update properties on a specific material slot
  public updateMaterialSlot(objectId: string, slotId: string, properties: Partial<MaterialProperties>) {
    const node = this.editor.nodesMap.get(objectId);
    if (!node) return;

    const applyToMaterial = (mat: any) => {
      if (mat && mat.uniqueId.toString() === slotId) {
        if (mat instanceof PBRMaterial) {
          if (properties.baseColor !== undefined) {
            mat.albedoColor = Color3.FromHexString(properties.baseColor);
          }
          if (properties.metallic !== undefined) {
            mat.metallic = properties.metallic;
          }
          if (properties.roughness !== undefined) {
            mat.roughness = properties.roughness;
          }
          if (properties.opacity !== undefined) {
            mat.alpha = properties.opacity;
          }
          if (properties.emissive !== undefined) {
            mat.emissiveColor = Color3.FromHexString(properties.emissive);
          }
          if (properties.baseColorTexture !== undefined) {
            if (properties.baseColorTexture === null) {
              mat.albedoTexture = null;
            } else {
              mat.albedoTexture = new Texture(properties.baseColorTexture, this.editor.scene);
            }
          }
        }
      }
    };

    if (node instanceof AbstractMesh) {
      applyToMaterial(node.material);
    }
    node.getChildMeshes?.().forEach((mesh: AbstractMesh) => {
      applyToMaterial(mesh.material);
    });

    // Save in Zustand
    const objects = useEditorStore.getState().getObjects();
    const obj = objects.find((o) => o.id === objectId);
    if (obj) {
      const existingSettings = obj.materialSettings || { slots: {} };
      const currentSlotSettings = existingSettings.slots[slotId] || {
        baseColor: "#ffffff",
        metallic: 0.5,
        roughness: 0.5,
        opacity: 1.0,
        emissive: "#000000",
      };

      existingSettings.slots[slotId] = {
        ...currentSlotSettings,
        ...properties,
      } as any;

      useEditorStore.getState().updateObject(objectId, {
        materialSettings: existingSettings,
      });
    }
  }
}
