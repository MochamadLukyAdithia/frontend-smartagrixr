import { EditorEngine } from "./EditorEngine";
import { SceneObject, useEditorStore } from "../store/useEditorStore";

export class HistoryManager {
  private editor: EditorEngine;
  private undoStack: string[] = []; // Serialized SceneObject[]
  private redoStack: string[] = []; // Serialized SceneObject[]
  private maxHistory: number = 40;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  /**
   * Records a snapshot of the current active scene objects before any state mutation
   */
  public recordSnapshot() {
    const objects = useEditorStore.getState().getObjects();
    const serialized = JSON.stringify(objects);

    // Skip duplicate consecutive states
    if (this.undoStack.length > 0 && this.undoStack[this.undoStack.length - 1] === serialized) {
      return;
    }

    this.undoStack.push(serialized);
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }
    // Clear redo stack on new user actions
    this.redoStack = [];
  }

  public undo() {
    if (this.undoStack.length === 0) return;

    // Save current active state to redo stack before applying undo
    const currentObjects = useEditorStore.getState().getObjects();
    this.redoStack.push(JSON.stringify(currentObjects));

    const previousSerialized = this.undoStack.pop();
    if (!previousSerialized) return;

    try {
      const prevObjects: SceneObject[] = JSON.parse(previousSerialized);
      const activeSceneId = useEditorStore.getState().activeSceneId;

      useEditorStore.setState((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === activeSceneId ? { ...s, objects: prevObjects } : s
        ),
        selectedIds: [],
      }));

      // Reconstruct Babylon.js scene objects
      this.editor.objectManager.loadActiveScene();
    } catch (e) {
      console.error("Undo execution error:", e);
    }
  }

  public redo() {
    if (this.redoStack.length === 0) return;

    // Save current state to undo stack before applying redo
    const currentObjects = useEditorStore.getState().getObjects();
    this.undoStack.push(JSON.stringify(currentObjects));

    const nextSerialized = this.redoStack.pop();
    if (!nextSerialized) return;

    try {
      const nextObjects: SceneObject[] = JSON.parse(nextSerialized);
      const activeSceneId = useEditorStore.getState().activeSceneId;

      useEditorStore.setState((state) => ({
        scenes: state.scenes.map((s) =>
          s.id === activeSceneId ? { ...s, objects: nextObjects } : s
        ),
        selectedIds: [],
      }));

      // Reconstruct Babylon.js scene objects
      this.editor.objectManager.loadActiveScene();
    } catch (e) {
      console.error("Redo execution error:", e);
    }
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  public canUndo(): boolean {
    return this.undoStack.length > 0;
  }

  public canRedo(): boolean {
    return this.redoStack.length > 0;
  }
}
