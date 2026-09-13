import { useState, useEffect } from "react";
import { EditorEngine } from "./EditorEngine";

let instance: EditorEngine | null = null;
const listeners = new Set<(engine: EditorEngine | null) => void>();

export function getEditorInstance(): EditorEngine | null {
  return instance;
}

export function setEditorInstance(engine: EditorEngine | null) {
  instance = engine;
  listeners.forEach((listener) => {
    try {
      listener(engine);
    } catch (e) {
      console.error(e);
    }
  });
}

export function useEditorInstance(): EditorEngine | null {
  const [engine, setEngine] = useState<EditorEngine | null>(() => instance);

  useEffect(() => {
    setEngine(instance);
    const listener = (newEngine: EditorEngine | null) => setEngine(newEngine);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return engine;
}

