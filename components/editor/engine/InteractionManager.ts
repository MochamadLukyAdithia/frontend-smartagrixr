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
        this.executeAction(behaviour);
      }
    });
  }

  private executeAction(behaviour: Behaviour) {
    const targetNode = this.editor.nodesMap.get(behaviour.target);
    if (!targetNode) return;

    switch (behaviour.action) {
      case "playAnimation":
        if (behaviour.animation) {
          // Play target clip
          this.editor.animationManager.selectClip(behaviour.animation);
          this.editor.animationManager.play();
        }
        break;
      case "showObject":
        this.editor.objectManager.setVisibility(behaviour.target, true);
        break;
      case "hideObject":
        this.editor.objectManager.setVisibility(behaviour.target, false);
        break;
      case "moveObject":
        if (behaviour.value && "position" in targetNode) {
          const val = behaviour.value;
          targetNode.position.addInPlace(new Vector3(val[0], val[1], val[2]));
          this.editor.objectManager.updateObjectStateFromBabylon(behaviour.target);
        }
        break;
      case "rotateObject":
        if (behaviour.value && "rotation" in targetNode) {
          const val = behaviour.value;
          targetNode.rotation.addInPlace(new Vector3(
            (val[0] * Math.PI) / 180,
            (val[1] * Math.PI) / 180,
            (val[2] * Math.PI) / 180
          ));
          this.editor.objectManager.updateObjectStateFromBabylon(behaviour.target);
        }
        break;
      case "openUrl":
        if (behaviour.url) {
          window.open(behaviour.url, "_blank");
        }
        break;
      case "changeScene":
        // Switch to the target scene
        if (behaviour.url) {
          useEditorStore.getState().setActiveSceneId(behaviour.url);
        }
        break;
      default:
        console.warn("Unhandled action type", behaviour.action);
    }
  }
}
