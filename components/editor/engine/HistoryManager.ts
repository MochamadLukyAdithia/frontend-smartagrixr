import { EditorEngine } from "./EditorEngine";

export interface Command {
  name: string;
  execute: () => void;
  undo: () => void;
}

export class HistoryManager {
  private editor: EditorEngine;
  private undoStack: Command[] = [];
  private redoStack: Command[] = [];

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public execute(command: Command) {
    command.execute();
    this.undoStack.push(command);
    // Clear redo stack on new action
    this.redoStack = [];
  }

  public undo() {
    const command = this.undoStack.pop();
    if (command) {
      command.undo();
      this.redoStack.push(command);
    }
  }

  public redo() {
    const command = this.redoStack.pop();
    if (command) {
      command.execute();
      this.undoStack.push(command);
    }
  }

  public clear() {
    this.undoStack = [];
    this.redoStack = [];
  }
}
