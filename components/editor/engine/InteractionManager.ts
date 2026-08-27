import { Vector3 } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore, Behaviour } from "../store/useEditorStore";

export class InteractionManager {
  private editor: EditorEngine;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  // Triggered when an object is clicked in Preview Mode
  public triggerClick(objectId: string) {
    const isPreview = useEditorStore.getState().isPreviewMode;
    if (!isPreview) return;

    const objects = useEditorStore.getState().getObjects();
    const obj = objects.find((o) => o.id === objectId);
    if (!obj || !obj.behaviours) return;

    obj.behaviours.forEach((behaviour) => {
      if (behaviour.trigger === "click") {
        this.executeAction(behaviour, obj);
      }
    });
  }

  // Triggered when scene starts in preview mode
  public triggerSceneStart() {
    const objects = useEditorStore.getState().getObjects();
    objects.forEach((obj) => {
      if (obj.behaviours) {
        obj.behaviours.forEach((b) => {
          if (b.trigger === "start") {
            this.executeAction(b, obj);
          }
        });
      }
    });
  }

  public executeAction(behaviour: Behaviour, sourceObj?: any) {
    const targetId = behaviour.target || (sourceObj ? sourceObj.id : "");
    const targetNode = this.editor.nodesMap.get(targetId);

    switch (behaviour.action) {
      case "playAnimation":
        if (behaviour.animation) {
          this.editor.animationManager.selectClip(behaviour.animation);
          this.editor.animationManager.play();
        }
        break;
      case "showObject":
        this.editor.objectManager.setVisibility(targetId, true);
        break;
      case "hideObject":
        this.editor.objectManager.setVisibility(targetId, false);
        break;
      case "moveObject":
        if (targetNode && "position" in targetNode) {
          const val = behaviour.value || [0, 1, 0];
          targetNode.position.addInPlace(new Vector3(val[0], val[1], val[2]));
          this.editor.objectManager.updateObjectStateFromBabylon(targetId);
        }
        break;
      case "rotateObject":
        if (targetNode && "rotation" in targetNode) {
          const val = behaviour.value || [0, 45, 0];
          targetNode.rotation.addInPlace(new Vector3(
            (val[0] * Math.PI) / 180,
            (val[1] * Math.PI) / 180,
            (val[2] * Math.PI) / 180
          ));
          this.editor.objectManager.updateObjectStateFromBabylon(targetId);
        }
        break;
      case "showInfo":
        useEditorStore.getState().setActiveInfoDialog({
          title: behaviour.infoTitle || sourceObj?.name || "Information",
          content: behaviour.infoDescription || sourceObj?.description || "Smart Agriculture node interaction.",
        });
        break;
      case "openUrl":
        if (behaviour.url) {
          window.open(behaviour.url, "_blank");
        }
        break;
      case "changeScene":
        if (behaviour.url) {
          useEditorStore.getState().setActiveSceneId(behaviour.url);
        }
        break;
      default:
        console.warn("Unhandled action type", behaviour.action);
    }
  }
}

