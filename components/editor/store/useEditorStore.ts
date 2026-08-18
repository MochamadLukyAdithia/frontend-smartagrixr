import { create } from "zustand";

export interface Behaviour {
  trigger: "click" | "hover" | "start" | "collision";
  action: "playAnimation" | "moveObject" | "rotateObject" | "showObject" | "hideObject" | "openUrl" | "playAudio" | "changeScene";
  target: string; // Target object ID
  animation?: string;
  url?: string;
  value?: [number, number, number]; // Offset for move/rotate
}

export interface Annotation {
  title: string;
  description: string;
  position: [number, number, number];
}

export interface SceneObject {
  id: string;
  name: string;
  type: "model" | "image" | "text" | "video" | "audio" | "group" | "light" | "camera" | "empty";
  parentId: string | null;
  visible: boolean;
  locked: boolean;
  position: [number, number, number];
  rotation: [number, number, number]; // in degrees
  scale: [number, number, number];
  assetId?: string | null;
  tag?: string;
  description?: string;
  metadata?: Record<string, any>;
  behaviours?: Behaviour[];
  annotations?: Annotation[];
  
  // Media properties
  mediaUrl?: string;
  textConfig?: {
    text: string;
    font: string;
    size: number;
    color: string;
    alignment: "left" | "center" | "right";
  };

  lightSettings?: {
    type: "directional" | "point" | "spot";
    color: string;
    intensity: number;
    range?: number;
    angle?: number;
    exponent?: number;
    shadows: boolean;
  };
  cameraSettings?: {
    type: "perspective" | "orthographic";
    fov: number;
    near: number;
    far: number;
  };
  materialSettings?: {
    slots: Record<string, {
      baseColor: string;
      metallic: number;
      roughness: number;
      opacity: number;
      emissive: string;
      baseColorTexture?: string | null;
    }>;
  };
}

export interface SceneData {
  id: string;
  name: string;
  objects: SceneObject[];
}

export interface Asset {
  id: string;
  name: string;
  url: string;
  type: "glb" | "gltf" | "image" | "video" | "audio";
}

export interface EditorState {
  // Multi-Scene support
  scenes: SceneData[];
  activeSceneId: string;
  
  // Preview mode
  isPreviewMode: boolean;

  selectedIds: string[];
  activeCameraId: string | null;
  assets: Asset[];
  gizmoMode: "translate" | "rotate" | "scale" | "none";
  gizmoSpace: "local" | "world";
  snapping: {
    translateEnabled: boolean;
    translateValue: number;
    rotateEnabled: boolean;
    rotateValue: number;
    scaleEnabled: boolean;
    scaleValue: number;
  };
  gridSettings: {
    visible: boolean;
    size: number;
    spacing: number;
  };
  axisVisible: boolean;
  environment: {
    bgColor: string;
    intensity: number;
    hdrUrl: string | null;
    gridVisible: boolean;
  };
  
  // Animation state
  animationState: {
    playing: boolean;
    speed: number;
    duration: number; // in seconds
    time: number; // current playback time
    clips: string[];
    activeClip: string | null;
    loop: boolean;
  };
  
  // Active tool on left toolbar
  activeLeftTab: "none" | "objects" | "images" | "text" | "video" | "audio";
  
  // Actions
  setScenes: (scenes: SceneData[]) => void;
  setActiveSceneId: (id: string) => void;
  addScene: (name: string) => void;
  deleteScene: (id: string) => void;
  
  setIsPreviewMode: (enabled: boolean) => void;
  setActiveLeftTab: (tab: EditorState["activeLeftTab"]) => void;
  
  // Objects relative to active scene
  getObjects: () => SceneObject[];
  addObject: (obj: SceneObject) => void;
  updateObject: (id: string, partial: Partial<SceneObject>) => void;
  removeObject: (id: string) => void;
  setSelectedIds: (ids: string[]) => void;

  addAsset: (asset: Asset) => void;
  setGizmoMode: (mode: "translate" | "rotate" | "scale" | "none") => void;
  setGizmoSpace: (space: "local" | "world") => void;
  setSnapping: (partial: Partial<EditorState["snapping"]>) => void;
  setGridSettings: (partial: Partial<EditorState["gridSettings"]>) => void;
  setAnimationState: (partial: Partial<EditorState["animationState"]>) => void;
  setActiveCameraId: (id: string | null) => void;
  setEnvironment: (partial: Partial<EditorState["environment"]>) => void;
  setAxisVisible: (visible: boolean) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  scenes: [{ id: "scene_1", name: "Scene 1", objects: [] }],
  activeSceneId: "scene_1",
  activeCameraId: "default_camera",
  isPreviewMode: false,
  selectedIds: [],
  assets: [],
  gizmoMode: "translate",
  gizmoSpace: "world",
  snapping: {
    translateEnabled: false,
    translateValue: 0.25,
    rotateEnabled: false,
    rotateValue: 15,
    scaleEnabled: false,
    scaleValue: 0.1,
  },
  gridSettings: {
    visible: true,
    size: 20,
    spacing: 1,
  },
  axisVisible: true,
  activeLeftTab: "none",
  environment: {
    bgColor: "#e8e8e8",
    intensity: 1.0,
    hdrUrl: null,
    gridVisible: true,
  },
  animationState: {
    playing: false,
    speed: 1.0,
    duration: 0,
    time: 0,
    clips: [],
    activeClip: null,
    loop: true,
  },

  setScenes: (scenes) => set({ scenes }),
  setActiveSceneId: (id) => set({ activeSceneId: id, selectedIds: [] }),
  addScene: (name) => set((state) => {
    const id = "scene_" + Math.random().toString(36).substr(2, 9);
    return {
      scenes: [...state.scenes, { id, name, objects: [] }],
      activeSceneId: id,
      selectedIds: [],
    };
  }),
  deleteScene: (id) => set((state) => {
    if (state.scenes.length <= 1) return {}; // Keep at least one scene
    const newScenes = state.scenes.filter((s) => s.id !== id);
    return {
      scenes: newScenes,
      activeSceneId: newScenes[0].id,
      selectedIds: [],
    };
  }),

  setIsPreviewMode: (enabled) => set({ isPreviewMode: enabled, selectedIds: [] }),
  setActiveLeftTab: (tab) => set((state) => ({ activeLeftTab: state.activeLeftTab === tab ? "none" : tab })),

  getObjects: () => {
    const active = get().scenes.find((s) => s.id === get().activeSceneId);
    return active ? active.objects : [];
  },

  addObject: (obj) => set((state) => ({
    scenes: state.scenes.map((s) =>
      s.id === state.activeSceneId ? { ...s, objects: [...s.objects, obj] } : s
    ),
  })),

  updateObject: (id, partial) => set((state) => ({
    scenes: state.scenes.map((s) =>
      s.id === state.activeSceneId
        ? {
            ...s,
            objects: s.objects.map((o) => (o.id === id ? { ...o, ...partial } : o)),
          }
        : s
    ),
  })),

  removeObject: (id) => set((state) => ({
    scenes: state.scenes.map((s) =>
      s.id === state.activeSceneId
        ? { ...s, objects: s.objects.filter((o) => o.id !== id) }
        : s
    ),
    selectedIds: state.selectedIds.filter((selId) => selId !== id),
  })),

  setSelectedIds: (ids) => set({ selectedIds: ids }),
  addAsset: (asset) => set((state) => ({ assets: [...state.assets, asset] })),
  setGizmoMode: (mode) => set({ gizmoMode: mode }),
  setGizmoSpace: (space) => set({ gizmoSpace: space }),
  setSnapping: (partial) => set((state) => ({ snapping: { ...state.snapping, ...partial } })),
  setGridSettings: (partial) => set((state) => ({ gridSettings: { ...state.gridSettings, ...partial } })),
  setAnimationState: (partial) => set((state) => ({ animationState: { ...state.animationState, ...partial } })),
  setActiveCameraId: (id) => set({ activeCameraId: id }),
  setEnvironment: (partial) => set((state) => ({ environment: { ...state.environment, ...partial } })),
  setAxisVisible: (visible) => set({ axisVisible: visible }),
}));
export type { SceneObject as EditorSceneObject };
