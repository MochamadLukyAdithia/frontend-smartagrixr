"use client";

import { useEffect } from "react";
import { useEditorStore } from "../store/useEditorStore";
import { getEditorInstance } from "../engine/editorInstance";

let clipboardIds: string[] = [];

export function KeyboardShortcutManager() {
  const { selectedIds } = useEditorStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const editor = getEditorInstance();
      // Avoid triggering shortcuts while typing inside inputs, selects, or textareas
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === "INPUT" ||
          activeEl.tagName === "SELECT" ||
          activeEl.tagName === "TEXTAREA" ||
          activeEl.getAttribute("contenteditable") === "true")
      ) {
        return;
      }

      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      // W -> Translate
      if (e.key.toLowerCase() === "w" && !isCtrlOrCmd) {
        e.preventDefault();
        if (editor) editor.transformManager.setMode("translate");
      }

      // E -> Rotate
      if (e.key.toLowerCase() === "e" && !isCtrlOrCmd) {
        e.preventDefault();
        if (editor) editor.transformManager.setMode("rotate");
      }

      // R -> Scale
      if (e.key.toLowerCase() === "r" && !isCtrlOrCmd) {
        e.preventDefault();
        if (editor) editor.transformManager.setMode("scale");
      }

      // Escape -> Deselect
      if (e.key === "Escape") {
        e.preventDefault();
        if (editor) editor.selectionManager.clearSelection();
      }

      // Delete -> Delete Selected
      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        if (editor && selectedIds.length > 0) {
          selectedIds.forEach((id) => editor.objectManager.deleteObject(id));
        }
      }

      // Ctrl + A -> Select All
      if (isCtrlOrCmd && e.key.toLowerCase() === "a") {
        e.preventDefault();
        if (editor) editor.selectionManager.selectAll();
      }

      // Ctrl + D -> Duplicate
      if (isCtrlOrCmd && e.key.toLowerCase() === "d") {
        e.preventDefault();
        if (editor && selectedIds.length > 0) {
          const newIds: string[] = [];
          selectedIds.forEach((id) => {
            const newId = editor.objectManager.duplicateObject(id);
            if (newId) newIds.push(newId);
          });
          if (newIds.length > 0) {
            editor.selectionManager.selectObject(newIds[0]);
          }
        }
      }

      // Ctrl + C -> Copy
      if (isCtrlOrCmd && e.key.toLowerCase() === "c") {
        e.preventDefault();
        if (selectedIds.length > 0) {
          clipboardIds = [...selectedIds];
        }
      }

      // Ctrl + V -> Paste
      if (isCtrlOrCmd && e.key.toLowerCase() === "v") {
        e.preventDefault();
        if (editor && clipboardIds.length > 0) {
          const pastedIds: string[] = [];
          clipboardIds.forEach((id) => {
            const newId = editor.objectManager.duplicateObject(id);
            if (newId) pastedIds.push(newId);
          });
          if (pastedIds.length > 0) {
            editor.selectionManager.selectObject(pastedIds[0]);
          }
        }
      }

      // Ctrl + Z -> Undo
      if (isCtrlOrCmd && !e.shiftKey && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (editor) editor.historyManager.undo();
      }

      // Ctrl + Shift + Z or Ctrl + Y -> Redo
      if (isCtrlOrCmd && ((e.shiftKey && e.key.toLowerCase() === "z") || e.key.toLowerCase() === "y")) {
        e.preventDefault();
        if (editor) editor.historyManager.redo();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedIds]);

  return null;
}

