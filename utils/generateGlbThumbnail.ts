import {
  ArcRotateCamera,
  Color4,
  CreateScreenshotAsync,
  DirectionalLight,
  Engine,
  HemisphericLight,
  Scene,
  SceneLoader,
  Vector3,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/loaders/OBJ";

export async function generateGlbThumbnail(file: File): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = 512;
  canvas.height = 512;

  const engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
  const scene = new Scene(engine);
  scene.clearColor = new Color4(0.82, 0.84, 0.88, 1);

  const hemi = new HemisphericLight("thumbHemi", new Vector3(0, 1, 0.5), scene);
  hemi.intensity = 1.0;

  const dirLight = new DirectionalLight(
    "thumbDir",
    new Vector3(0.4, -1, 0.6),
    scene,
  );
  dirLight.intensity = 1.2;

  const camera = new ArcRotateCamera(
    "thumbCam",
    Math.PI / 4,
    Math.PI / 2.6,
    3,
    Vector3.Zero(),
    scene,
  );
  scene.activeCamera = camera;

  const ext = file.name.split(".").pop()?.toLowerCase();
  const extension = ext === "obj" ? ".obj" : ".glb";

  const objectUrl = URL.createObjectURL(file);

  try {
    await SceneLoader.ImportMeshAsync(
      "",
      "",
      objectUrl,
      scene,
      undefined,
      extension,
    );
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    scene.dispose();
    engine.dispose();
    throw err;
  }

  const { min, max } = scene.getWorldExtends();
  const center = min.add(max).scale(0.5);
  const size = Vector3.Distance(min, max);

  if (!size) {
    URL.revokeObjectURL(objectUrl);
    scene.dispose();
    engine.dispose();
    throw new Error("Model tidak memiliki geometry.");
  }

  camera.setTarget(center);
  camera.radius = Math.max(size, 0.5) * 1.6;
  camera.alpha = Math.PI / 4;
  camera.beta = Math.PI / 2.6;

  engine.runRenderLoop(() => scene.render());
  await new Promise((r) => setTimeout(r, 150));

  const dataUrl = await CreateScreenshotAsync(engine, camera, 512);

  engine.stopRenderLoop();

  if (!dataUrl) {
    URL.revokeObjectURL(objectUrl);
    scene.dispose();
    engine.dispose();
    throw new Error("Screenshot kosong.");
  }

  const response = await fetch(dataUrl);
  const blob = await response.blob();

  URL.revokeObjectURL(objectUrl);
  scene.dispose();
  engine.dispose();

  return blob;
}
