import { Engine, Scene, Vector3, Color3 } from "@babylonjs/core";
import { SceneManager } from "./SceneManager";
import { ObjectManager } from "./ObjectManager";
import { SelectionManager } from "./SelectionManager";
import { TransformManager } from "./TransformManager";
import { ImportManager } from "./import/ImportManager";
import { ExportManager } from "./export/ExportManager";
import { MaterialManager } from "./MaterialManager";
import { LightingManager } from "./LightingManager";
import { CameraManager } from "./CameraManager";
import { AnimationManager } from "./AnimationManager";
import { HistoryManager } from "./HistoryManager";
import { InteractionManager } from "./InteractionManager";
import { PreviewManager } from "./PreviewManager";
import { useEditorStore } from "../store/useEditorStore";

export class EditorEngine {
  public canvas: HTMLCanvasElement;
  public engine: Engine;
  public scene: Scene;

  // Sub-Managers
  public sceneManager: SceneManager;
  public objectManager: ObjectManager;
  public selectionManager: SelectionManager;
  public transformManager: TransformManager;
  public importManager: ImportManager;
  public exportManager: ExportManager;
  public materialManager: MaterialManager;
  public lightingManager: LightingManager;
  public cameraManager: CameraManager;
  public animationManager: AnimationManager;
  public historyManager: HistoryManager;
  public interactionManager: InteractionManager;
  public previewManager: PreviewManager;

  // Runtime reference registry mapping objectId -> Babylon TransformNode / Node
  public nodesMap: Map<string, any> = new Map();

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      disableWebGL2Support: false,
    });
    this.scene = new Scene(this.engine);

    // Initialize History first so others can record events
    this.historyManager = new HistoryManager(this);

    // Initialize all managers
    this.sceneManager = new SceneManager(this);
    this.cameraManager = new CameraManager(this);
    this.objectManager = new ObjectManager(this);
    this.selectionManager = new SelectionManager(this);
    this.transformManager = new TransformManager(this);
    this.materialManager = new MaterialManager(this);
    this.lightingManager = new LightingManager(this);
    this.animationManager = new AnimationManager(this);
    this.interactionManager = new InteractionManager(this);
    this.previewManager = new PreviewManager(this);
    this.importManager = new ImportManager(this);
    this.exportManager = new ExportManager(this);

    // Subscribe to Zustand store changes for instant synchronization
    let prevSelectedIds: string[] = [];
    let prevGizmoMode = "";
    let prevGizmoSpace = "";

    this.unsubscribeStore = useEditorStore.subscribe((state) => {
      // Sync Selection
      if (state.selectedIds !== prevSelectedIds) {
        prevSelectedIds = state.selectedIds;
        this.transformManager.attachGizmo(state.selectedIds);
        this.selectionManager.updateHighlighting(state.selectedIds);
      }

      // Sync Gizmo Settings
      if (state.gizmoMode !== prevGizmoMode || state.gizmoSpace !== prevGizmoSpace) {
        prevGizmoMode = state.gizmoMode;
        prevGizmoSpace = state.gizmoSpace;
        this.transformManager.syncGizmoSettings();
      }
    });

    // Start render loop
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });

    // Handle window resize
    window.addEventListener("resize", this.handleResize);

    // Set up default scene environment
    this.initDefaultScene();
  }

  private unsubscribeStore: () => void;

  private handleResize = () => {
    if (this.engine) {
      this.engine.resize();
    }
  };

  private initDefaultScene() {
    // Scene Manager defaults
    this.sceneManager.setupEnvironment();
    // Create default lights
    this.lightingManager.createDefaultLights();
    // Setup default editor camera
    this.cameraManager.createDefaultCamera();
  }

  public dispose() {
    this.unsubscribeStore();
    window.removeEventListener("resize", this.handleResize);
    this.transformManager.dispose();
    this.selectionManager.dispose();
    this.scene.dispose();
    this.engine.dispose();
  }
}
