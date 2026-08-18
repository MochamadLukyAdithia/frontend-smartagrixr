import { Color3, Color4, MeshBuilder, Vector3 } from "@babylonjs/core";
import { EditorEngine } from "./EditorEngine";
import { useEditorStore } from "../store/useEditorStore";

export class SceneManager {
  private editor: EditorEngine;
  private gridMesh: any = null;
  private axisLines: any = null;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public setupEnvironment() {
    this.updateBackgroundColor();
    this.updateGrid();
    this.updateAxis();
  }

  public updateBackgroundColor() {
    const bgColor = useEditorStore.getState().environment.bgColor;
    // Parse hex color
    const color = Color3.FromHexString(bgColor);
    this.editor.scene.clearColor = new Color4(color.r, color.g, color.b, 1.0);
  }

  public updateGrid() {
    const gridSettings = useEditorStore.getState().gridSettings;

    if (this.gridMesh) {
      this.gridMesh.dispose();
      this.gridMesh = null;
    }

    if (!gridSettings.visible) {
      return;
    }

    // Grid Material using Babylon GridMaterial or StandardMaterial lines
    // To ensure compatibility without extra plugins, we can create a grid using standard lines or GridMaterial
    // Let's use GridMaterial if it works, or fallback to creating standard line arrays for stability.
    // Let's create lines or a GridMaterial. Babylon core contains GridMaterial sometimes, but standard lines are extremely reliable.
    // Let's build a grid using lines for absolute safety, since GridMaterial is in a separate @babylonjs/materials package.
    const size = gridSettings.size;
    const spacing = gridSettings.spacing;
    const linesPoints: Vector3[][] = [];

    const halfSize = size / 2;
    for (let i = -halfSize; i <= halfSize; i += spacing) {
      // X-aligned lines
      linesPoints.push([new Vector3(-halfSize, 0, i), new Vector3(halfSize, 0, i)]);
      // Z-aligned lines
      linesPoints.push([new Vector3(i, 0, -halfSize), new Vector3(i, 0, halfSize)]);
    }

    this.gridMesh = MeshBuilder.CreateLineSystem(
      "editor_grid",
      { lines: linesPoints },
      this.editor.scene
    );
    this.gridMesh.isPickable = false;
    this.gridMesh.color = new Color3(0.3, 0.3, 0.3);
  }

  public updateAxis() {
    const axisVisible = useEditorStore.getState().axisVisible;

    if (this.axisLines) {
      this.axisLines.forEach((mesh: any) => mesh.dispose());
      this.axisLines = null;
    }

    if (!axisVisible) {
      return;
    }

    // Create custom red/green/blue lines for X, Y, Z axes
    const axisX = MeshBuilder.CreateLines(
      "axisX",
      { points: [Vector3.Zero(), new Vector3(2, 0, 0)] },
      this.editor.scene
    );
    axisX.color = new Color3(1, 0, 0); // Red
    axisX.isPickable = false;

    const axisY = MeshBuilder.CreateLines(
      "axisY",
      { points: [Vector3.Zero(), new Vector3(0, 2, 0)] },
      this.editor.scene
    );
    axisY.color = new Color3(0, 1, 0); // Green
    axisY.isPickable = false;

    const axisZ = MeshBuilder.CreateLines(
      "axisZ",
      { points: [Vector3.Zero(), new Vector3(0, 0, 2)] },
      this.editor.scene
    );
    axisZ.color = new Color3(0, 0, 1); // Blue
    axisZ.isPickable = false;

    this.axisLines = [axisX, axisY, axisZ];
  }
}
