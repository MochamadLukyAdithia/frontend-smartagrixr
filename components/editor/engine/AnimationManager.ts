import { Animation, AnimationGroup, Animatable, Vector3, Mesh } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export type MotionPreset = "spin" | "bounce" | "pulse" | "sway" | "none";

export class AnimationManager {
  private editor: EditorEngine;
  private animGroupsMap: Map<string, AnimationGroup[]> = new Map();
  private activeGroups: AnimationGroup[] = [];
  private proceduralAnimatables: Map<string, Animatable[]> = new Map();
  private currentTime: number = 0;

  constructor(editor: EditorEngine) {
    this.editor = editor;

    // Observe frame updates to synchronize the timeline scrubber's current time state
    this.editor.scene.onBeforeRenderObservable.add(() => {
      const state = useEditorStore.getState().animationState;
      if (state.playing) {
        const fps = 60;
        const duration = state.duration || 5;
        this.currentTime += (this.editor.scene.getEngine().getDeltaTime() / 1000) * state.speed;

        if (this.currentTime > duration) {
          if (state.loop) {
            this.currentTime = this.currentTime % duration;
          } else {
            this.currentTime = duration;
            this.pause();
          }
        }

        useEditorStore.getState().setAnimationState({ time: this.currentTime });
      }
    });
  }

  public registerAnimationGroups(assetId: string, groups: AnimationGroup[]) {
    this.animGroupsMap.set(assetId, groups);
    
    // Update store with available animation clips
    const clipNames = groups.map((g) => g.name || "Unnamed Clip");
    const duration = groups[0] ? (groups[0].to - groups[0].from) / 60 : 5;
    
    useEditorStore.getState().setAnimationState({
      clips: ["Motion Loop", ...clipNames],
      activeClip: clipNames[0] || "Motion Loop",
      duration: Math.max(5, duration),
    });
  }

  public applyMotionPreset(nodeId: string, preset: MotionPreset) {
    const node = this.editor.nodesMap.get(nodeId);
    if (!node) return;

    // Stop existing procedural animations for this node
    this.removeMotionPreset(nodeId);

    if (preset === "none") return;

    const fps = 60;
    const animatables: Animatable[] = [];

    if (preset === "spin") {
      const spinAnim = new Animation(
        `${nodeId}_spin`,
        "rotation.y",
        fps,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      const startRot = node.rotation.y;
      const keys = [
        { frame: 0, value: startRot },
        { frame: 120, value: startRot + Math.PI },
        { frame: 240, value: startRot + Math.PI * 2 },
      ];
      spinAnim.setKeys(keys);
      node.animations = node.animations || [];
      node.animations.push(spinAnim);

      const a = this.editor.scene.beginAnimation(node, 0, 240, true, 1.0);
      animatables.push(a);
    } else if (preset === "bounce") {
      const bounceAnim = new Animation(
        `${nodeId}_bounce`,
        "position.y",
        fps,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      const startY = node.position.y;
      const keys = [
        { frame: 0, value: startY },
        { frame: 60, value: startY + 0.6 },
        { frame: 120, value: startY },
        { frame: 180, value: startY - 0.2 },
        { frame: 240, value: startY },
      ];
      bounceAnim.setKeys(keys);
      node.animations = node.animations || [];
      node.animations.push(bounceAnim);

      const a = this.editor.scene.beginAnimation(node, 0, 240, true, 1.0);
      animatables.push(a);
    } else if (preset === "pulse") {
      const pulseAnim = new Animation(
        `${nodeId}_pulse`,
        "scaling",
        fps,
        Animation.ANIMATIONTYPE_VECTOR3,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      const baseScale = node.scaling.clone();
      const keys = [
        { frame: 0, value: baseScale },
        { frame: 60, value: baseScale.scale(1.15) },
        { frame: 120, value: baseScale },
      ];
      pulseAnim.setKeys(keys);
      node.animations = node.animations || [];
      node.animations.push(pulseAnim);

      const a = this.editor.scene.beginAnimation(node, 0, 120, true, 1.0);
      animatables.push(a);
    } else if (preset === "sway") {
      const swayAnim = new Animation(
        `${nodeId}_sway`,
        "rotation.z",
        fps,
        Animation.ANIMATIONTYPE_FLOAT,
        Animation.ANIMATIONLOOPMODE_CYCLE
      );
      const startZ = node.rotation.z;
      const keys = [
        { frame: 0, value: startZ },
        { frame: 60, value: startZ + 0.15 },
        { frame: 120, value: startZ },
        { frame: 180, value: startZ - 0.15 },
        { frame: 240, value: startZ },
      ];
      swayAnim.setKeys(keys);
      node.animations = node.animations || [];
      node.animations.push(swayAnim);

      const a = this.editor.scene.beginAnimation(node, 0, 240, true, 1.0);
      animatables.push(a);
    }

    this.proceduralAnimatables.set(nodeId, animatables);
    useEditorStore.getState().setAnimationState({ playing: true });
  }

  public removeMotionPreset(nodeId: string) {
    const existing = this.proceduralAnimatables.get(nodeId);
    if (existing) {
      existing.forEach((a) => a.stop());
      this.proceduralAnimatables.delete(nodeId);
    }
    const node = this.editor.nodesMap.get(nodeId);
    if (node && node.animations) {
      node.animations = node.animations.filter((a: Animation) => !a.name.startsWith(nodeId));
    }
  }

  public selectClip(clipName: string) {
    let foundGroup: AnimationGroup | null = null;
    for (const groups of this.animGroupsMap.values()) {
      const match = groups.find((g) => g.name === clipName);
      if (match) {
        foundGroup = match;
        break;
      }
    }

    if (foundGroup) {
      this.stop();
      this.activeGroups = [foundGroup];

      const duration = (foundGroup.to - foundGroup.from) / 60;
      this.currentTime = 0;
      useEditorStore.getState().setAnimationState({
        activeClip: clipName,
        duration: Math.max(1, duration),
        time: 0,
      });
      this.play(useEditorStore.getState().animationState.loop);
    }
  }

  public play(loop: boolean = true) {
    const speed = useEditorStore.getState().animationState.speed;
    
    // Play skeletal/GLTF groups
    this.activeGroups.forEach((group) => {
      group.play(loop);
      group.speedRatio = speed;
    });

    // Resume procedural animations
    this.proceduralAnimatables.forEach((animatables) => {
      animatables.forEach((a) => {
        a.restart();
        a.speedRatio = speed;
      });
    });

    useEditorStore.getState().setAnimationState({ playing: true });
  }

  public pause() {
    this.activeGroups.forEach((group) => group.pause());
    this.proceduralAnimatables.forEach((animatables) => {
      animatables.forEach((a) => a.pause());
    });
    useEditorStore.getState().setAnimationState({ playing: false });
  }

  public stop() {
    this.activeGroups.forEach((group) => {
      group.stop();
      group.reset();
    });
    this.proceduralAnimatables.forEach((animatables) => {
      animatables.forEach((a) => a.stop());
    });
    this.currentTime = 0;
    useEditorStore.getState().setAnimationState({ playing: false, time: 0 });
  }

  public setSpeed(speed: number) {
    this.activeGroups.forEach((group) => {
      group.speedRatio = speed;
    });
    this.proceduralAnimatables.forEach((animatables) => {
      animatables.forEach((a) => {
        a.speedRatio = speed;
      });
    });
    useEditorStore.getState().setAnimationState({ speed });
  }

  public scrubToTime(time: number) {
    this.currentTime = time;
    const fps = 60;

    if (this.activeGroups.length > 0) {
      const group = this.activeGroups[0];
      const fromFrame = group.from;
      const toFrame = group.to;
      const targetFrame = fromFrame + time * fps;
      const boundedFrame = Math.max(fromFrame, Math.min(toFrame, targetFrame));
      this.activeGroups.forEach((g) => g.goToFrame(boundedFrame));
    }

    useEditorStore.getState().setAnimationState({ time });
  }
}

