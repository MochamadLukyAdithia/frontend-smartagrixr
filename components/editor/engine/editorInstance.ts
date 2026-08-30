import { EditorEngine } from "./EditorEngine";

let instance: EditorEngine | null = null;

export function getEditorInstance(): EditorEngine | null {
  return instance;
}

export function setEditorInstance(engine: EditorEngine | null) {
  instance = engine;
}
