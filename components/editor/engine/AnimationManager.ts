import { AnimationGroup } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export class AnimationManager {
  private editor: EditorEngine;
  private animGroupsMap: Map<string, AnimationGroup[]> = new Map();
  private activeGroups: AnimationGroup[] = [];

  constructor(editor: EditorEngine) {
    this.editor = editor;

    // Observe frame updates to synchronize the timeline scrubber's current time state
    this.editor.scene.onBeforeRenderObservable.add(() => {
      if (this.activeGroups.length > 0 && useEditorStore.getState().animationState.playing) {
        // Find the main active animation group's current time
        const group = this.activeGroups[0];
        const currentFrame = group.animatables[0]?.masterFrame || 0;
        const fromFrame = group.from;
        const toFrame = group.to;
        const fps = 60; // Babylon standard frames per second fallback

        const time = Math.max(0, (currentFrame - fromFrame) / fps);
        useEditorStore.getState().setAnimationState({ time });
      }
    });
  }

  public registerAnimationGroups(assetId: string, groups: AnimationGroup[]) {
    this.animGroupsMap.set(assetId, groups);
    
    // Update store with available animation clips
    const clipNames = groups.map((g) => g.name || "Unnamed Clip");
    useEditorStore.getState().setAnimationState({
      clips: clipNames,
      activeClip: clipNames[0] || null,
      duration: groups[0] ? (groups[0].to - groups[0].from) / 60 : 0,
    });
  }

  public selectClip(clipName: string) {
    // Find matching group in registry
    let foundGroup: AnimationGroup | null = null;
    for (const groups of this.animGroupsMap.values()) {
      const match = groups.find((g) => g.name === clipName);
      if (match) {
        foundGroup = match;
        break;
      }
    }

    if (foundGroup) {
      // Stop previous active animations
      this.stop();
      this.activeGroups = [foundGroup];

      const duration = (foundGroup.to - foundGroup.from) / 60;
      useEditorStore.getState().setAnimationState({
        activeClip: clipName,
        duration,
        time: 0,
      });
    }
  }

  public play(loop: boolean = true) {
    if (this.activeGroups.length === 0) return;

    const speed = useEditorStore.getState().animationState.speed;
    this.activeGroups.forEach((group) => {
      group.play(loop);
      group.speedRatio = speed;
    });

    useEditorStore.getState().setAnimationState({ playing: true });
  }

  public pause() {
    this.activeGroups.forEach((group) => group.pause());
    useEditorStore.getState().setAnimationState({ playing: false });
  }

  public stop() {
    this.activeGroups.forEach((group) => {
      group.stop();
      group.reset();
    });
    useEditorStore.getState().setAnimationState({ playing: false, time: 0 });
  }

  public setSpeed(speed: number) {
    this.activeGroups.forEach((group) => {
      group.speedRatio = speed;
    });
    useEditorStore.getState().setAnimationState({ speed });
  }

  public scrubToTime(time: number) {
    if (this.activeGroups.length === 0) return;

    const group = this.activeGroups[0];
    const fromFrame = group.from;
    const toFrame = group.to;
    const fps = 60;

    const targetFrame = fromFrame + time * fps;
    const boundedFrame = Math.max(fromFrame, Math.min(toFrame, targetFrame));

    this.activeGroups.forEach((g) => {
      g.goToFrame(boundedFrame);
    });

    useEditorStore.getState().setAnimationState({ time });
  }
}
