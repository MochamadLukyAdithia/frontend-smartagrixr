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

  public applyPreset(preset: "studio" | "farm" | "greenhouse" | "cyber" | "dark" | "custom") {
    let bgColor = "#e8e8e8";
    let gridVisible = true;
    let intensity = 1.0;

    switch (preset) {
      case "studio":
        bgColor = "#e8e8e8";
        intensity = 1.2;
        break;
      case "farm":
        bgColor = "#bbf7d0"; // Soft sky-green for farm
        intensity = 1.5;
        break;
      case "greenhouse":
        bgColor = "#ecfdf5";
        intensity = 1.4;
        break;
      case "cyber":
        bgColor = "#0f172a";
        intensity = 1.0;
        break;
      case "dark":
        bgColor = "#18181b";
        intensity = 0.9;
        break;
      default:
        break;
    }

    useEditorStore.getState().setEnvironment({
      preset,
      bgColor,
      intensity,
      gridVisible,
    });

    this.updateBackgroundColor();
    this.updateGrid();
  }

  public updateBackgroundColor() {
    const bgColor = useEditorStore.getState().environment.bgColor;
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

    const size = gridSettings.size;
    const spacing = gridSettings.spacing;
    const linesPoints: Vector3[][] = [];

    const halfSize = size / 2;
    for (let i = -halfSize; i <= halfSize; i += spacing) {
      linesPoints.push([new Vector3(-halfSize, 0, i), new Vector3(halfSize, 0, i)]);
      linesPoints.push([new Vector3(i, 0, -halfSize), new Vector3(i, 0, halfSize)]);
    }

    this.gridMesh = MeshBuilder.CreateLineSystem(
      "editor_grid",
      { lines: linesPoints },
      this.editor.scene
    );
    this.gridMesh.isPickable = false;

    const env = useEditorStore.getState().environment;
    const isDark = env.bgColor.toLowerCase() === "#0f172a" || env.bgColor.toLowerCase() === "#18181b";
    this.gridMesh.color = isDark ? new Color3(0.2, 0.4, 0.3) : new Color3(0.65, 0.65, 0.65);
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

