import { 
  Mesh, 
  MeshBuilder, 
  TransformNode, 
  Vector3, 
  PBRMaterial, 
  Color3, 
  Texture, 
  DynamicTexture, 
  StandardMaterial,
  SceneLoader
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import { EditorEngine } from "./EditorEngine";
import { SceneObject, useEditorStore } from "../store/useEditorStore";

export class ObjectManager {
  private editor: EditorEngine;
  private isLoadingScene: boolean = false;

  constructor(editor: EditorEngine) {
    this.editor = editor;
  }

  public clearSceneRuntime() {
    this.editor.selectionManager.clearSelection();
    
    for (const [id, node] of this.editor.nodesMap.entries()) {
      if (id !== "main_directional_light" && id !== "default_camera") {
        node.dispose();
      }
    }
    this.editor.nodesMap.clear();

    const light = this.editor.scene.getLightById("main_directional_light");
    if (light) this.editor.nodesMap.set("main_directional_light", light);
    const camera = this.editor.scene.getCameraById("default_camera");
    if (camera) this.editor.nodesMap.set("default_camera", camera);
  }

  public async loadActiveScene() {
    if (this.isLoadingScene) return;
    this.isLoadingScene = true;

    try {
      this.clearSceneRuntime();
      const objects = useEditorStore.getState().getObjects();
      
      // Sort to ensure parents are created before child nodes
      const sorted = [...objects].sort((a, b) => {
        if (a.parentId === null && b.parentId !== null) return -1;
        if (a.parentId !== null && b.parentId === null) return 1;
        return 0;
      });

      for (const obj of sorted) {
        if (obj.type === "empty" || obj.type === "group") {
          const node = new TransformNode(obj.id, this.editor.scene);
          node.name = obj.name;
          node.position.set(obj.position[0], obj.position[1], obj.position[2]);
          node.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
          node.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);
          this.editor.nodesMap.set(obj.id, node);
        } else if (obj.type === "primitive" && obj.primitiveType) {
          this.reconstructPrimitive(obj);
        } else if (obj.type === "agri" && obj.agriType) {
          this.reconstructAgriPreset(obj);
        } else if (obj.type === "text" && obj.textConfig) {
          this.reconstructText(obj);
        } else if (obj.type === "image" && obj.mediaUrl) {
          this.reconstructImage(obj);
        } else if (obj.type === "video" && obj.mediaUrl) {
          this.reconstructVideo(obj);
        } else if (obj.type === "audio" && obj.mediaUrl) {
          this.reconstructAudio(obj);
        } else if (obj.type === "model" && (obj.mediaUrl || obj.assetId)) {
          await this.reconstructModel(obj);
        }
      }

      // Set parenting relationships and visibility
      sorted.forEach((obj) => {
        if (obj.parentId) {
          this.setParent(obj.id, obj.parentId);
        }
        if (obj.visible === false) {
          const node = this.editor.nodesMap.get(obj.id);
          if (node && "setEnabled" in node) {
            node.setEnabled(false);
          }
        }
      });

      // Re-sync current selection if any
      const selectedIds = useEditorStore.getState().selectedIds;
      if (selectedIds.length > 0) {
        this.editor.selectionManager.updateHighlighting(selectedIds);
        this.editor.transformManager.attachGizmo(selectedIds);
      }
    } finally {
      this.isLoadingScene = false;
    }
  }


  // ----------------------------------------------------
  // Basic Primitives (Cube, Sphere, Cylinder, etc.)
  // ----------------------------------------------------
  public createPrimitive(
    type: "box" | "sphere" | "cylinder" | "cone" | "capsule" | "torus" | "plane" | "ground", 
    name?: string
  ): string {
    this.editor.historyManager.recordSnapshot();
    const id = `${type}_` + Math.random().toString(36).substring(2, 9);
    const objectName = name || (type.charAt(0).toUpperCase() + type.slice(1));
    let mesh: Mesh;

    switch (type) {
      case "box":
        mesh = MeshBuilder.CreateBox(id, { size: 1.5 }, this.editor.scene);
        mesh.position.y = 0.75;
        break;
      case "sphere":
        mesh = MeshBuilder.CreateSphere(id, { diameter: 1.5, segments: 24 }, this.editor.scene);
        mesh.position.y = 0.75;
        break;
      case "cylinder":
        mesh = MeshBuilder.CreateCylinder(id, { height: 2, diameter: 1.2, tessellation: 24 }, this.editor.scene);
        mesh.position.y = 1;
        break;
      case "cone":
        mesh = MeshBuilder.CreateCylinder(id, { height: 2, diameterTop: 0, diameterBottom: 1.5, tessellation: 24 }, this.editor.scene);
        mesh.position.y = 1;
        break;
      case "capsule":
        mesh = MeshBuilder.CreateCapsule(id, { radius: 0.5, capSubdivisions: 6, subdivisions: 2, height: 2 }, this.editor.scene);
        mesh.position.y = 1;
        break;
      case "torus":
        mesh = MeshBuilder.CreateTorus(id, { diameter: 1.5, thickness: 0.4, tessellation: 32 }, this.editor.scene);
        mesh.position.y = 0.5;
        break;
      case "plane":
        mesh = MeshBuilder.CreatePlane(id, { size: 2, sideOrientation: Mesh.DOUBLESIDE }, this.editor.scene);
        mesh.position.y = 1;
        break;
      case "ground":
        mesh = MeshBuilder.CreateGround(id, { width: 10, height: 10, subdivisions: 4 }, this.editor.scene);
        mesh.position.y = 0;
        break;
      default:
        mesh = MeshBuilder.CreateBox(id, { size: 1 }, this.editor.scene);
        mesh.position.y = 0.5;
    }

    mesh.name = objectName;

    // Apply default smooth PBR material
    const mat = new PBRMaterial(id + "_mat", this.editor.scene);
    mat.albedoColor = Color3.FromHexString("#22a447");
    mat.metallic = 0.1;
    mat.roughness = 0.5;
    mesh.material = mat;

    this.editor.nodesMap.set(id, mesh);

    const stateObj: SceneObject = {
      id,
      name: objectName,
      type: "primitive",
      primitiveType: type,
      parentId: null,
      visible: true,
      locked: false,
      position: [mesh.position.x, mesh.position.y, mesh.position.z],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      materialSettings: {
        slots: {
          [mat.uniqueId.toString()]: {
            baseColor: "#22a447",
            metallic: 0.1,
            roughness: 0.5,
            opacity: 1.0,
            emissive: "#000000",
          }
        }
      }
    };

    useEditorStore.getState().addObject(stateObj);
    this.editor.selectionManager.selectObject(id);
    this.editor.cameraManager.focusOnNode(mesh);

    return id;
  }

  private reconstructPrimitive(obj: SceneObject) {
    const type = obj.primitiveType || "box";
    let mesh: Mesh;
    switch (type) {
      case "box": mesh = MeshBuilder.CreateBox(obj.id, { size: 1.5 }, this.editor.scene); break;
      case "sphere": mesh = MeshBuilder.CreateSphere(obj.id, { diameter: 1.5, segments: 24 }, this.editor.scene); break;
      case "cylinder": mesh = MeshBuilder.CreateCylinder(obj.id, { height: 2, diameter: 1.2, tessellation: 24 }, this.editor.scene); break;
      case "cone": mesh = MeshBuilder.CreateCylinder(obj.id, { height: 2, diameterTop: 0, diameterBottom: 1.5, tessellation: 24 }, this.editor.scene); break;
      case "capsule": mesh = MeshBuilder.CreateCapsule(obj.id, { radius: 0.5, capSubdivisions: 6, subdivisions: 2, height: 2 }, this.editor.scene); break;
      case "torus": mesh = MeshBuilder.CreateTorus(obj.id, { diameter: 1.5, thickness: 0.4, tessellation: 32 }, this.editor.scene); break;
      case "plane": mesh = MeshBuilder.CreatePlane(obj.id, { size: 2, sideOrientation: Mesh.DOUBLESIDE }, this.editor.scene); break;
      case "ground": mesh = MeshBuilder.CreateGround(obj.id, { width: 10, height: 10, subdivisions: 4 }, this.editor.scene); break;
      default: mesh = MeshBuilder.CreateBox(obj.id, { size: 1 }, this.editor.scene);
    }

    mesh.name = obj.name;
    mesh.position.set(obj.position[0], obj.position[1], obj.position[2]);
    mesh.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
    mesh.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

    const mat = new PBRMaterial(obj.id + "_mat", this.editor.scene);
    if (obj.materialSettings?.slots) {
      const firstSlotKey = Object.keys(obj.materialSettings.slots)[0];
      const slot = obj.materialSettings.slots[firstSlotKey];
      if (slot) {
        mat.albedoColor = Color3.FromHexString(slot.baseColor);
        mat.metallic = slot.metallic ?? 0.1;
        mat.roughness = slot.roughness ?? 0.5;
        mat.alpha = slot.opacity ?? 1.0;
        mat.emissiveColor = Color3.FromHexString(slot.emissive || "#000000");
      }
    } else {
      mat.albedoColor = Color3.FromHexString("#22a447");
      mat.metallic = 0.1;
      mat.roughness = 0.5;
    }
    mesh.material = mat;
    mesh.isPickable = true;
    this.editor.nodesMap.set(obj.id, mesh);
  }


  // ----------------------------------------------------
  // Smart Agriculture 3D Presets (Greenhouse, IoT Sensor, etc.)
  // ----------------------------------------------------
  public createAgriPreset(
    type: "greenhouse" | "solar_sensor" | "water_tank" | "drone" | "crop_field" | "tractor" | "plant",
    name?: string
  ): string {
    this.editor.historyManager.recordSnapshot();
    const id = `agri_${type}_` + Math.random().toString(36).substring(2, 9);
    const rootNode = new TransformNode(id, this.editor.scene);
    const defaultName = name || this.getAgriPresetDisplayName(type);
    rootNode.name = defaultName;

    switch (type) {
      case "greenhouse":
        this.buildGreenhouseModel(id, rootNode);
        break;
      case "solar_sensor":
        this.buildSolarSensorModel(id, rootNode);
        break;
      case "water_tank":
        this.buildWaterTankModel(id, rootNode);
        break;
      case "drone":
        this.buildDroneModel(id, rootNode);
        break;
      case "crop_field":
        this.buildCropFieldModel(id, rootNode);
        break;
      case "tractor":
        this.buildTractorModel(id, rootNode);
        break;
      case "plant":
        this.buildPlantModel(id, rootNode);
        break;
    }

    this.editor.nodesMap.set(id, rootNode);

    const stateObj: SceneObject = {
      id,
      name: defaultName,
      type: "agri",
      agriType: type,
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      description: `Smart Agriculture Asset: ${defaultName}`,
      annotations: [
        {
          id: "anno_" + id,
          title: defaultName,
          description: `Interactive SmartAgri 3D module with real-time monitoring and automation.`,
          position: [0, 2, 0],
        }
      ]
    };

    useEditorStore.getState().addObject(stateObj);
    this.editor.selectionManager.selectObject(id);
    this.editor.cameraManager.focusOnNode(rootNode);

    return id;
  }

  private reconstructAgriPreset(obj: SceneObject) {
    const rootNode = new TransformNode(obj.id, this.editor.scene);
    rootNode.name = obj.name;
    rootNode.position.set(obj.position[0], obj.position[1], obj.position[2]);
    rootNode.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
    rootNode.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

    const type = obj.agriType || "greenhouse";
    switch (type) {
      case "greenhouse": this.buildGreenhouseModel(obj.id, rootNode); break;
      case "solar_sensor": this.buildSolarSensorModel(obj.id, rootNode); break;
      case "water_tank": this.buildWaterTankModel(obj.id, rootNode); break;
      case "drone": this.buildDroneModel(obj.id, rootNode); break;
      case "crop_field": this.buildCropFieldModel(obj.id, rootNode); break;
      case "tractor": this.buildTractorModel(obj.id, rootNode); break;
      case "plant": this.buildPlantModel(obj.id, rootNode); break;
    }

    rootNode.getChildMeshes?.().forEach((m) => {
      m.isPickable = true;
    });

    this.editor.nodesMap.set(obj.id, rootNode);
  }


  private getAgriPresetDisplayName(type: string): string {
    switch (type) {
      case "greenhouse": return "Smart Greenhouse";
      case "solar_sensor": return "IoT Soil & Solar Sensor";
      case "water_tank": return "Smart Irrigation Tank";
      case "drone": return "AgriSprayer Drone";
      case "crop_field": return "Raised Crop Field";
      case "tractor": return "Autonomous Farm Rover";
      case "plant": return "Hydroponic Crop Plant";
      default: return "Agri Asset";
    }
  }

  // --- Procedural 3D Agri Builders ---
  private buildGreenhouseModel(id: string, parent: TransformNode) {
    // Glass Walls
    const glass = MeshBuilder.CreateBox(id + "_glass", { width: 4, height: 2.5, depth: 6 }, this.editor.scene);
    glass.position.y = 1.25;
    glass.setParent(parent);
    const glassMat = new PBRMaterial(id + "_glass_mat", this.editor.scene);
    glassMat.albedoColor = Color3.FromHexString("#60a5fa");
    glassMat.alpha = 0.35;
    glassMat.roughness = 0.1;
    glassMat.metallic = 0.9;
    glass.material = glassMat;

    // Roof Frame (Triangular Prism)
    const roof = MeshBuilder.CreateCylinder(id + "_roof", { height: 6, diameter: 2.8, tessellation: 3 }, this.editor.scene);
    roof.rotation.x = Math.PI / 2;
    roof.rotation.z = Math.PI / 6;
    roof.position.y = 3.2;
    roof.setParent(parent);
    roof.material = glassMat;

    // Frame Borders
    const frame = MeshBuilder.CreateBox(id + "_base", { width: 4.2, height: 0.3, depth: 6.2 }, this.editor.scene);
    frame.position.y = 0.15;
    frame.setParent(parent);
    const frameMat = new PBRMaterial(id + "_frame_mat", this.editor.scene);
    frameMat.albedoColor = Color3.FromHexString("#22c55e");
    frameMat.metallic = 0.7;
    frameMat.roughness = 0.3;
    frame.material = frameMat;
  }

  private buildSolarSensorModel(id: string, parent: TransformNode) {
    // Ground Stake
    const pole = MeshBuilder.CreateCylinder(id + "_pole", { height: 2.2, diameter: 0.12 }, this.editor.scene);
    pole.position.y = 1.1;
    pole.setParent(parent);
    const metalMat = new PBRMaterial(id + "_metal", this.editor.scene);
    metalMat.albedoColor = Color3.FromHexString("#94a3b8");
    metalMat.metallic = 0.9;
    metalMat.roughness = 0.2;
    pole.material = metalMat;

    // Sensor Body Box
    const sensorBody = MeshBuilder.CreateBox(id + "_sensor", { width: 0.6, height: 0.7, depth: 0.4 }, this.editor.scene);
    sensorBody.position.y = 1.8;
    sensorBody.setParent(parent);
    const bodyMat = new PBRMaterial(id + "_body", this.editor.scene);
    bodyMat.albedoColor = Color3.FromHexString("#059669");
    sensorBody.material = bodyMat;

    // Solar Panel on top tilted
    const solar = MeshBuilder.CreateBox(id + "_solar", { width: 0.9, height: 0.05, depth: 0.7 }, this.editor.scene);
    solar.position.y = 2.25;
    solar.rotation.x = -Math.PI / 6;
    solar.setParent(parent);
    const solarMat = new PBRMaterial(id + "_solar_mat", this.editor.scene);
    solarMat.albedoColor = Color3.FromHexString("#1e3a8a");
    solarMat.roughness = 0.1;
    solarMat.metallic = 0.8;
    solar.material = solarMat;

    // Antenna & Indicator Light
    const antenna = MeshBuilder.CreateCylinder(id + "_ant", { height: 0.5, diameter: 0.04 }, this.editor.scene);
    antenna.position.set(0.2, 2.35, 0);
    antenna.setParent(parent);
    antenna.material = metalMat;

    const led = MeshBuilder.CreateSphere(id + "_led", { diameter: 0.1 }, this.editor.scene);
    led.position.set(-0.15, 1.9, 0.21);
    led.setParent(parent);
    const ledMat = new PBRMaterial(id + "_led_mat", this.editor.scene);
    ledMat.albedoColor = Color3.FromHexString("#22c55e");
    ledMat.emissiveColor = Color3.FromHexString("#22c55e");
    led.material = ledMat;
  }

  private buildWaterTankModel(id: string, parent: TransformNode) {
    // Tank Cylinder
    const tank = MeshBuilder.CreateCylinder(id + "_tank", { height: 3, diameter: 2.2, tessellation: 32 }, this.editor.scene);
    tank.position.y = 2;
    tank.setParent(parent);
    const tankMat = new PBRMaterial(id + "_tank_mat", this.editor.scene);
    tankMat.albedoColor = Color3.FromHexString("#0284c7");
    tankMat.roughness = 0.3;
    tankMat.metallic = 0.4;
    tank.material = tankMat;

    // Base Stand legs
    const stand = MeshBuilder.CreateBox(id + "_stand", { width: 2.5, height: 0.6, depth: 2.5 }, this.editor.scene);
    stand.position.y = 0.3;
    stand.setParent(parent);
    const standMat = new PBRMaterial(id + "_stand_mat", this.editor.scene);
    standMat.albedoColor = Color3.FromHexString("#334155");
    stand.material = standMat;

    // Pipe Outlet
    const pipe = MeshBuilder.CreateCylinder(id + "_pipe", { height: 1, diameter: 0.3 }, this.editor.scene);
    pipe.rotation.z = Math.PI / 2;
    pipe.position.set(1.2, 0.9, 0);
    pipe.setParent(parent);
    const pipeMat = new PBRMaterial(id + "_pipe_mat", this.editor.scene);
    pipeMat.albedoColor = Color3.FromHexString("#64748b");
    pipe.material = pipeMat;
  }

  private buildDroneModel(id: string, parent: TransformNode) {
    // Drone Central Body
    const body = MeshBuilder.CreateCylinder(id + "_body", { height: 0.3, diameter: 0.9, tessellation: 20 }, this.editor.scene);
    body.position.y = 1.5;
    body.setParent(parent);
    const bodyMat = new PBRMaterial(id + "_dbody_mat", this.editor.scene);
    bodyMat.albedoColor = Color3.FromHexString("#10b981");
    bodyMat.metallic = 0.5;
    body.material = bodyMat;

    // 4 Arms
    const angles = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
    angles.forEach((angle, idx) => {
      const arm = MeshBuilder.CreateBox(id + "_arm_" + idx, { width: 1.4, height: 0.08, depth: 0.08 }, this.editor.scene);
      arm.rotation.y = angle + Math.PI / 4;
      arm.position.y = 1.5;
      arm.setParent(parent);
      const armMat = new PBRMaterial(id + "_arm_mat_" + idx, this.editor.scene);
      armMat.albedoColor = Color3.FromHexString("#1e293b");
      arm.material = armMat;

      // Rotor at end
      const rotor = MeshBuilder.CreateCylinder(id + "_rotor_" + idx, { height: 0.02, diameter: 0.7 }, this.editor.scene);
      const rx = Math.cos(angle + Math.PI / 4) * 0.7;
      const rz = Math.sin(angle + Math.PI / 4) * 0.7;
      rotor.position.set(rx, 1.56, rz);
      rotor.setParent(parent);
      const rotMat = new PBRMaterial(id + "_rot_mat_" + idx, this.editor.scene);
      rotMat.albedoColor = Color3.FromHexString("#38bdf8");
      rotor.material = rotMat;
    });

    // Fertilizer Tank underneath
    const sprayTank = MeshBuilder.CreateSphere(id + "_sprayer", { diameterX: 0.7, diameterY: 0.4, diameterZ: 0.7 }, this.editor.scene);
    sprayTank.position.y = 1.25;
    sprayTank.setParent(parent);
    const sprayMat = new PBRMaterial(id + "_spray_mat", this.editor.scene);
    sprayMat.albedoColor = Color3.FromHexString("#f59e0b");
    sprayTank.material = sprayMat;
  }

  private buildCropFieldModel(id: string, parent: TransformNode) {
    // Soil Bed
    const soil = MeshBuilder.CreateBox(id + "_soil", { width: 4, height: 0.4, depth: 3 }, this.editor.scene);
    soil.position.y = 0.2;
    soil.setParent(parent);
    const soilMat = new PBRMaterial(id + "_soil_mat", this.editor.scene);
    soilMat.albedoColor = Color3.FromHexString("#78350f"); // Soil Brown
    soilMat.roughness = 0.9;
    soil.material = soilMat;

    // Wooden Border
    const border = MeshBuilder.CreateBox(id + "_wood", { width: 4.2, height: 0.45, depth: 3.2 }, this.editor.scene);
    border.position.y = 0.2;
    border.setParent(parent);
    const woodMat = new PBRMaterial(id + "_wood_mat", this.editor.scene);
    woodMat.albedoColor = Color3.FromHexString("#92400e");
    border.material = woodMat;

    // Crop Rows
    const cropMat = new PBRMaterial(id + "_sprout_mat", this.editor.scene);
    cropMat.albedoColor = Color3.FromHexString("#22c55e");
    cropMat.roughness = 0.4;

    for (let x = -1.4; x <= 1.4; x += 0.7) {
      for (let z = -1; z <= 1; z += 0.5) {
        const crop = MeshBuilder.CreateCylinder(id + `_c_${x}_${z}`, { diameterTop: 0, diameterBottom: 0.35, height: 0.6 }, this.editor.scene);
        crop.position.set(x, 0.65, z);
        crop.setParent(parent);
        crop.material = cropMat;
      }
    }
  }

  private buildTractorModel(id: string, parent: TransformNode) {
    // Rover Chassis
    const chassis = MeshBuilder.CreateBox(id + "_chassis", { width: 2.2, height: 0.8, depth: 1.4 }, this.editor.scene);
    chassis.position.y = 0.8;
    chassis.setParent(parent);
    const chassisMat = new PBRMaterial(id + "_chassis_mat", this.editor.scene);
    chassisMat.albedoColor = Color3.FromHexString("#16a34a");
    chassis.material = chassisMat;

    // Cab
    const cab = MeshBuilder.CreateBox(id + "_cab", { width: 1.1, height: 1.0, depth: 1.2 }, this.editor.scene);
    cab.position.set(-0.3, 1.6, 0);
    cab.setParent(parent);
    const cabMat = new PBRMaterial(id + "_cab_mat", this.editor.scene);
    cabMat.albedoColor = Color3.FromHexString("#38bdf8");
    cabMat.alpha = 0.6;
    cab.material = cabMat;

    // Wheels
    const wheelPositions = [
      [0.7, 0.4, 0.75],
      [0.7, 0.4, -0.75],
      [-0.7, 0.5, 0.75],
      [-0.7, 0.5, -0.75]
    ];
    const wheelMat = new PBRMaterial(id + "_wheel_mat", this.editor.scene);
    wheelMat.albedoColor = Color3.FromHexString("#0f172a");
    wheelMat.roughness = 0.8;

    wheelPositions.forEach((pos, i) => {
      const wheel = MeshBuilder.CreateCylinder(id + "_wheel_" + i, { height: 0.3, diameter: i >= 2 ? 1.0 : 0.8 }, this.editor.scene);
      wheel.rotation.x = Math.PI / 2;
      wheel.position.set(pos[0], pos[1], pos[2]);
      wheel.setParent(parent);
      wheel.material = wheelMat;
    });
  }

  private buildPlantModel(id: string, parent: TransformNode) {
    // Pot
    const pot = MeshBuilder.CreateCylinder(id + "_pot", { height: 0.9, diameterTop: 0.9, diameterBottom: 0.6 }, this.editor.scene);
    pot.position.y = 0.45;
    pot.setParent(parent);
    const potMat = new PBRMaterial(id + "_pot_mat", this.editor.scene);
    potMat.albedoColor = Color3.FromHexString("#ea580c");
    pot.material = potMat;

    // Stem
    const stem = MeshBuilder.CreateCylinder(id + "_stem", { height: 1.2, diameter: 0.08 }, this.editor.scene);
    stem.position.y = 1.35;
    stem.setParent(parent);
    const stemMat = new PBRMaterial(id + "_stem_mat", this.editor.scene);
    stemMat.albedoColor = Color3.FromHexString("#15803d");
    stem.material = stemMat;

    // Leaves
    const leafMat = new PBRMaterial(id + "_leaf_mat", this.editor.scene);
    leafMat.albedoColor = Color3.FromHexString("#22c55e");

    for (let i = 0; i < 4; i++) {
      const leaf = MeshBuilder.CreateSphere(id + "_leaf_" + i, { diameterX: 0.8, diameterY: 0.1, diameterZ: 0.4 }, this.editor.scene);
      const angle = (i * Math.PI) / 2;
      leaf.rotation.y = angle;
      leaf.rotation.z = Math.PI / 8;
      leaf.position.set(Math.cos(angle) * 0.35, 1.5 + i * 0.1, Math.sin(angle) * 0.35);
      leaf.setParent(parent);
      leaf.material = leafMat;
    }

    // Fruit (Tomato / Berry)
    const fruit = MeshBuilder.CreateSphere(id + "_fruit", { diameter: 0.35 }, this.editor.scene);
    fruit.position.set(0.15, 1.7, 0.15);
    fruit.setParent(parent);
    const fruitMat = new PBRMaterial(id + "_fruit_mat", this.editor.scene);
    fruitMat.albedoColor = Color3.FromHexString("#ef4444");
    fruit.material = fruitMat;
  }

  // ----------------------------------------------------
  // Text 3D / Dynamic Text Mesh
  // ----------------------------------------------------
  public createText(
    text: string = "SmartAgri 3D",
    color: string = "#10b981",
    size: number = 48,
    bgColor: string = "#18181b"
  ): string {
    this.editor.historyManager.recordSnapshot();
    const id = "text_" + Math.random().toString(36).substring(2, 9);
    const name = `Text (${text.slice(0, 10)})`;
    
    const textureWidth = 1024;
    const textureHeight = 512;
    const dynamicTexture = new DynamicTexture(
      id + "_texture",
      { width: textureWidth, height: textureHeight },
      this.editor.scene,
      false
    );
    dynamicTexture.hasAlpha = true;

    const font = `bold ${size * 2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    dynamicTexture.drawText(text, null, null, font, color, bgColor || "transparent", true);

    const plane = MeshBuilder.CreatePlane(
      id,
      { width: 4, height: 2, sideOrientation: Mesh.DOUBLESIDE },
      this.editor.scene
    );
    plane.name = name;
    plane.position.y = 1.5;

    const mat = new StandardMaterial(id + "_material", this.editor.scene);
    mat.diffuseTexture = dynamicTexture;
    mat.emissiveColor = Color3.FromHexString(color).scale(0.3);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    plane.material = mat;

    this.editor.nodesMap.set(id, plane);

    const stateObj: SceneObject = {
      id,
      name,
      type: "text",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      textConfig: {
        text,
        font: "sans-serif",
        size,
        color,
        bgColor,
        alignment: "center",
      },
    };

    useEditorStore.getState().addObject(stateObj);
    this.editor.selectionManager.selectObject(id);
    this.editor.cameraManager.focusOnNode(plane);
    return id;
  }

  public updateText(id: string, textConfig: { text: string; color: string; size: number; bgColor?: string }) {
    this.updateTextConfig(id, textConfig);
  }

  public updateTextConfig(id: string, partial: Partial<NonNullable<SceneObject["textConfig"]>>) {
    this.editor.historyManager.recordSnapshot();
    const mesh = this.editor.nodesMap.get(id);
    const objects = useEditorStore.getState().getObjects();
    const obj = objects.find((o) => o.id === id);
    if (!obj || !obj.textConfig) return;

    const updatedConfig = { ...obj.textConfig, ...partial };
    useEditorStore.getState().updateObject(id, { textConfig: updatedConfig });

    if (mesh && mesh.material && mesh.material.diffuseTexture) {
      const dt = mesh.material.diffuseTexture as DynamicTexture;
      const font = `bold ${updatedConfig.size * 2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
      dt.drawText(updatedConfig.text, null, null, font, updatedConfig.color, updatedConfig.bgColor || "transparent", true);
      mesh.material.emissiveColor = Color3.FromHexString(updatedConfig.color).scale(0.3);
    }
  }

  private reconstructText(obj: SceneObject) {
    const textConfig = obj.textConfig || {
      text: "SmartAgri 3D",
      size: 48,
      color: "#10b981",
      bgColor: "#18181b",
    };
    
    const textureWidth = 1024;
    const textureHeight = 512;
    const dynamicTexture = new DynamicTexture(
      obj.id + "_texture",
      { width: textureWidth, height: textureHeight },
      this.editor.scene,
      false
    );
    dynamicTexture.hasAlpha = true;

    const font = `bold ${textConfig.size * 2}px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`;
    dynamicTexture.drawText(textConfig.text, null, null, font, textConfig.color, textConfig.bgColor || "transparent", true);

    const plane = MeshBuilder.CreatePlane(
      obj.id,
      { width: 4, height: 2, sideOrientation: Mesh.DOUBLESIDE },
      this.editor.scene
    );
    plane.name = obj.name;
    plane.position.set(obj.position[0], obj.position[1], obj.position[2]);
    plane.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
    plane.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

    const mat = new StandardMaterial(obj.id + "_material", this.editor.scene);
    mat.diffuseTexture = dynamicTexture;
    mat.emissiveColor = Color3.FromHexString(textConfig.color).scale(0.3);
    mat.specularColor = Color3.Black();
    mat.backFaceCulling = false;
    plane.material = mat;
    plane.isPickable = true;

    this.editor.nodesMap.set(obj.id, plane);
  }


  // ----------------------------------------------------
  // Hierarchy, Groups, Parenting & Standard Actions
  // ----------------------------------------------------
  public createEmpty(name: string = "Empty Node", parentId: string | null = null): string {
    this.editor.historyManager.recordSnapshot();
    const id = "empty_" + Math.random().toString(36).substring(2, 9);
    const node = new TransformNode(id, this.editor.scene);
    node.name = name;

    this.editor.nodesMap.set(id, node);

    const stateObj: SceneObject = {
      id,
      name,
      type: "empty",
      parentId,
      visible: true,
      locked: false,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    useEditorStore.getState().addObject(stateObj);

    if (parentId) {
      this.setParent(id, parentId);
    }

    return id;
  }

  public createGroup(name: string = "Group"): string {
    this.editor.historyManager.recordSnapshot();
    const id = "group_" + Math.random().toString(36).substring(2, 9);
    const node = new TransformNode(id, this.editor.scene);
    node.name = name;

    this.editor.nodesMap.set(id, node);

    const selectedIds = useEditorStore.getState().selectedIds;

    const stateObj: SceneObject = {
      id,
      name,
      type: "group",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
    };

    useEditorStore.getState().addObject(stateObj);

    // If objects are selected, parent them to this group
    if (selectedIds.length > 0) {
      let avgPos = Vector3.Zero();
      let count = 0;
      selectedIds.forEach((selId) => {
        const childNode = this.editor.nodesMap.get(selId);
        if (childNode) {
          avgPos.addInPlace(childNode.absolutePosition || childNode.position || Vector3.Zero());
          count++;
        }
      });
      if (count > 0) {
        avgPos.scaleInPlace(1 / count);
        node.position = avgPos;
        useEditorStore.getState().updateObject(id, {
          position: [avgPos.x, avgPos.y, avgPos.z]
        });
      }

      selectedIds.forEach((selId) => {
        this.setParent(selId, id);
      });
    }

    useEditorStore.getState().setSelectedIds([id]);
    return id;
  }

  public setParent(childId: string, parentId: string | null) {
    const childNode = this.editor.nodesMap.get(childId);
    if (!childNode) return;

    if (parentId === null) {
      childNode.setParent(null);
      useEditorStore.getState().updateObject(childId, { parentId: null });
      this.updateObjectStateFromBabylon(childId);
      return;
    }

    // Circular dependency check
    if (this.isDescendant(parentId, childId)) {
      console.warn("Circular parenting detected!");
      return;
    }

    const parentNode = this.editor.nodesMap.get(parentId);
    if (parentNode) {
      childNode.setParent(parentNode);
      useEditorStore.getState().updateObject(childId, { parentId });
      this.updateObjectStateFromBabylon(childId);
    }
  }

  private isDescendant(checkId: string, potentialAncestorId: string): boolean {
    if (checkId === potentialAncestorId) return true;
    const objects = useEditorStore.getState().getObjects();
    const obj = objects.find(o => o.id === checkId);
    if (obj && obj.parentId) {
      return this.isDescendant(obj.parentId, potentialAncestorId);
    }
    return false;
  }

  public updateObjectStateFromBabylon(id: string) {
    const node = this.editor.nodesMap.get(id);
    if (!node) return;

    const pos = node.position;
    const rot = node.rotationQuaternion 
      ? node.rotationQuaternion.toEulerAngles() 
      : node.rotation;
    const scl = node.scaling;

    useEditorStore.getState().updateObject(id, {
      position: [pos.x, pos.y, pos.z],
      rotation: [
        rot.x * (180 / Math.PI),
        rot.y * (180 / Math.PI),
        rot.z * (180 / Math.PI)
      ],
      scale: [scl.x, scl.y, scl.z],
    });
  }

  public setVisibility(id: string, visible: boolean) {
    const node = this.editor.nodesMap.get(id);
    if (node) {
      if ("setEnabled" in node) {
        node.setEnabled(visible);
      }
      useEditorStore.getState().updateObject(id, { visible });
    }
  }

  public setLocked(id: string, locked: boolean) {
    useEditorStore.getState().updateObject(id, { locked });
  }

  public deleteObject(id: string) {
    this.editor.historyManager.recordSnapshot();
    const objects = useEditorStore.getState().getObjects();
    const children = objects.filter(o => o.parentId === id);
    children.forEach(child => this.deleteObject(child.id));

    const node = this.editor.nodesMap.get(id);
    if (node) {
      node.dispose();
      this.editor.nodesMap.delete(id);
    }

    useEditorStore.getState().removeObject(id);
  }

  public duplicateObject(id: string): string | null {
    this.editor.historyManager.recordSnapshot();
    const obj = useEditorStore.getState().getObjects().find(o => o.id === id);
    const originalNode = this.editor.nodesMap.get(id);
    if (!obj || !originalNode) return null;

    const newId = obj.type + "_" + Math.random().toString(36).substring(2, 9);
    let clonedNode: any;

    if ("clone" in originalNode) {
      clonedNode = originalNode.clone(obj.name + " (Copy)", null);
    } else {
      clonedNode = new TransformNode(newId, this.editor.scene);
    }

    clonedNode.name = obj.name + " (Copy)";
    clonedNode.position.copyFrom(originalNode.position);
    if (originalNode.rotation) clonedNode.rotation.copyFrom(originalNode.rotation);
    if (originalNode.rotationQuaternion) clonedNode.rotationQuaternion = originalNode.rotationQuaternion.clone();
    clonedNode.scaling.copyFrom(originalNode.scaling);

    this.editor.nodesMap.set(newId, clonedNode);

    const clonedObj: SceneObject = {
      ...obj,
      id: newId,
      name: obj.name + " (Copy)",
      parentId: obj.parentId,
    };

    useEditorStore.getState().addObject(clonedObj);

    if (obj.parentId) {
      this.setParent(newId, obj.parentId);
    }

    // Duplicate children
    const objects = useEditorStore.getState().getObjects();
    const children = objects.filter(o => o.parentId === id);
    children.forEach(child => {
      const childCopyId = this.duplicateObject(child.id);
      if (childCopyId) {
        this.setParent(childCopyId, newId);
      }
    });

    return newId;
  }

  public createImage(source: File | string, customName?: string): string {
    this.editor.historyManager.recordSnapshot();
    const id = "image_" + Math.random().toString(36).substring(2, 9);
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    const name = customName || (source instanceof File ? source.name : "Image " + id.slice(-4));
    
    const plane = MeshBuilder.CreatePlane(id, { size: 2, sideOrientation: Mesh.DOUBLESIDE }, this.editor.scene);
    plane.name = name;
    
    const mat = new PBRMaterial(id + "_material", this.editor.scene);
    mat.albedoTexture = new Texture(url, this.editor.scene);
    mat.roughness = 0.8;
    mat.metallic = 0.1;
    plane.material = mat;

    this.editor.nodesMap.set(id, plane);

    const stateObj: SceneObject = {
      id,
      name,
      type: "image",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      mediaUrl: url,
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }

  public createVideo(source: File | string, customName?: string): string {
    this.editor.historyManager.recordSnapshot();
    const id = "video_" + Math.random().toString(36).substring(2, 9);
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    const name = customName || (source instanceof File ? source.name : "Video " + id.slice(-4));
    
    const { VideoTexture } = require("@babylonjs/core");
    
    const plane = MeshBuilder.CreatePlane(id, { size: 3 }, this.editor.scene);
    plane.name = name;
    
    const mat = new StandardMaterial(id + "_material", this.editor.scene);
    mat.diffuseTexture = new VideoTexture(id + "_texture", url, this.editor.scene, true, false);
    plane.material = mat;

    this.editor.nodesMap.set(id, plane);

    const stateObj: SceneObject = {
      id,
      name,
      type: "video",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1.5, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      mediaUrl: url,
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }

  public createAudio(source: File | string, customName?: string): string {
    this.editor.historyManager.recordSnapshot();
    const id = "audio_" + Math.random().toString(36).substring(2, 9);
    const url = source instanceof File ? URL.createObjectURL(source) : source;
    const name = customName || (source instanceof File ? source.name : "Audio " + id.slice(-4));
    
    const { Sound } = require("@babylonjs/core");
    
    const node = new TransformNode(id, this.editor.scene);
    node.name = name;
    
    const sound = new Sound(id + "_sound", url, this.editor.scene, () => {
      sound.play();
    }, { loop: true, autoplay: true, spatialSound: true, maxDistance: 10 });
    sound.attachToMesh(node);

    this.editor.nodesMap.set(id, node);

    const stateObj: SceneObject = {
      id,
      name,
      type: "audio",
      parentId: null,
      visible: true,
      locked: false,
      position: [0, 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      mediaUrl: url,
    };

    useEditorStore.getState().addObject(stateObj);
    return id;
  }

  private reconstructImage(obj: SceneObject) {
    if (!obj.mediaUrl) return;
    const plane = MeshBuilder.CreatePlane(obj.id, { size: 2, sideOrientation: Mesh.DOUBLESIDE }, this.editor.scene);
    plane.name = obj.name;
    plane.position.set(obj.position[0], obj.position[1], obj.position[2]);
    plane.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
    plane.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

    const mat = new PBRMaterial(obj.id + "_material", this.editor.scene);
    mat.albedoTexture = new Texture(obj.mediaUrl, this.editor.scene);
    mat.roughness = 0.8;
    mat.metallic = 0.1;
    plane.material = mat;
    plane.isPickable = true;

    this.editor.nodesMap.set(obj.id, plane);
  }

  private reconstructVideo(obj: SceneObject) {
    if (!obj.mediaUrl) return;
    const { VideoTexture } = require("@babylonjs/core");
    const plane = MeshBuilder.CreatePlane(obj.id, { size: 3 }, this.editor.scene);
    plane.name = obj.name;
    plane.position.set(obj.position[0], obj.position[1], obj.position[2]);
    plane.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
    plane.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

    const mat = new StandardMaterial(obj.id + "_material", this.editor.scene);
    mat.diffuseTexture = new VideoTexture(obj.id + "_texture", obj.mediaUrl, this.editor.scene, true, false);
    plane.material = mat;
    plane.isPickable = true;

    this.editor.nodesMap.set(obj.id, plane);
  }


  private reconstructAudio(obj: SceneObject) {
    if (!obj.mediaUrl) return;
    const { Sound } = require("@babylonjs/core");
    const node = new TransformNode(obj.id, this.editor.scene);
    node.name = obj.name;
    node.position.set(obj.position[0], obj.position[1], obj.position[2]);
    node.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
    node.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

    const sound = new Sound(obj.id + "_sound", obj.mediaUrl, this.editor.scene, () => {
      sound.play();
    }, { loop: true, autoplay: true, spatialSound: true, maxDistance: 10 });
    sound.attachToMesh(node);

    this.editor.nodesMap.set(obj.id, node);
  }

  private async reconstructModel(obj: SceneObject) {
    const url = obj.mediaUrl;
    if (!url || url.startsWith("blob:")) return;
    try {
      const cleanUrl = url.toLowerCase().split("?")[0];
      const extension = cleanUrl.endsWith(".gltf") ? ".gltf" : ".glb";
      const loadUrl = (url.startsWith("http://") || url.startsWith("https://"))
        ? `/api/proxy-model?url=${encodeURIComponent(url)}`
        : url;
      const result = await SceneLoader.ImportMeshAsync("", "", loadUrl, this.editor.scene, undefined, extension);
      
      const rootNode = new TransformNode(obj.id, this.editor.scene);
      rootNode.name = obj.name;
      rootNode.position.set(obj.position[0], obj.position[1], obj.position[2]);
      rootNode.rotation.set((obj.rotation[0] * Math.PI) / 180, (obj.rotation[1] * Math.PI) / 180, (obj.rotation[2] * Math.PI) / 180);
      rootNode.scaling.set(obj.scale[0], obj.scale[1], obj.scale[2]);

      // Compute bounding box of imported meshes and normalize to rootNode origin
      let min = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
      let max = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
      let hasBounds = false;

      result.meshes.forEach((mesh) => {
        mesh.isPickable = true;
        if (mesh.getTotalVertices && mesh.getTotalVertices() > 0) {
          mesh.computeWorldMatrix(true);
          const boundingInfo = mesh.getBoundingInfo();
          min = Vector3.Minimize(min, boundingInfo.boundingBox.minimumWorld);
          max = Vector3.Maximize(max, boundingInfo.boundingBox.maximumWorld);
          hasBounds = true;
        }
      });

      if (hasBounds) {
        const center = min.add(max).scale(0.5);
        const bottomY = min.y;

        result.meshes.forEach((mesh) => {
          if (!mesh.parent) {
            mesh.position.x -= center.x;
            mesh.position.y -= bottomY;
            mesh.position.z -= center.z;
            mesh.setParent(rootNode);
          }
        });
      } else {
        result.meshes.forEach((mesh) => {
          if (!mesh.parent) {
            mesh.setParent(rootNode);
          }
        });
      }

      this.editor.nodesMap.set(obj.id, rootNode);
      if (result.animationGroups.length > 0) {
        this.editor.animationManager.registerAnimationGroups(obj.id, result.animationGroups);
      }
    } catch (err) {
      console.warn("Failed to reconstruct model", obj.name, err);
    }
  }

}


