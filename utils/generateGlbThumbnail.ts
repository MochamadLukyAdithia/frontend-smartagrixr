import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export interface ThumbnailOptions {
  width?: number;
  height?: number;
  backgroundColor?: string | number | null;
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
  quality?: number;
  timeoutMs?: number;
}

/**
 * Renders a 3D GLB/GLTF model offscreen and returns a screenshot as a Blob.
 */
export async function generateGlbThumbnail(
  fileOrUrl: File | Blob | string,
  options: ThumbnailOptions = {}
): Promise<Blob> {
  const {
    width = 512,
    height = 512,
    backgroundColor = "#f8fafc",
    mimeType = "image/jpeg",
    quality = 0.9,
    timeoutMs = 15000,
  } = options;

  return new Promise((resolve, reject) => {
    let isSettled = false;
    let objectUrl = "";

    // Set timeout to avoid hanging if model fails or stalls
    const timer = setTimeout(() => {
      if (!isSettled) {
        isSettled = true;
        cleanup();
        reject(new Error("Timeout generating 3D model thumbnail"));
      }
    }, timeoutMs);

    // 1. Setup Offscreen WebGL Renderer
    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: backgroundColor === null || backgroundColor === "transparent",
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      });
      renderer.setSize(width, height);
      renderer.setPixelRatio(1);
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.outputColorSpace = THREE.SRGBColorSpace;
    } catch (e) {
      clearTimeout(timer);
      reject(new Error("WebGL is not supported or failed to initialize"));
      return;
    }

    // 2. Setup Scene & Camera
    const scene = new THREE.Scene();
    if (backgroundColor && backgroundColor !== "transparent") {
      scene.background = new THREE.Color(backgroundColor as THREE.ColorRepresentation);
    }

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.05, 1000);

    // 3. Add Studio Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.0);
    mainLight.position.set(4, 8, 6);
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xbfdbfe, 1.0);
    fillLight.position.set(-5, 4, -4);
    scene.add(fillLight);

    const hemiLight = new THREE.HemisphereLight(0xffffff, 0x64748b, 0.8);
    hemiLight.position.set(0, 10, 0);
    scene.add(hemiLight);

    // 4. Cleanup helper
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      if (renderer) {
        scene.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.geometry?.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach((m) => m.dispose());
            } else if (child.material) {
              child.material.dispose();
            }
          }
        });
        renderer.dispose();
        renderer.forceContextLoss?.();
        renderer.domElement.remove?.();
        renderer = null;
      }
    };

    // 5. Load GLB/GLTF
    const loader = new GLTFLoader();

    if (typeof fileOrUrl === "string") {
      objectUrl = fileOrUrl;
    } else {
      objectUrl = URL.createObjectURL(fileOrUrl);
    }

    loader.load(
      objectUrl,
      (gltf) => {
        if (isSettled) return;
        try {
          const model = gltf.scene;

          // Auto center and frame model
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());

          // Center the model at (0, 0, 0)
          model.position.x = -center.x;
          model.position.y = -center.y;
          model.position.z = -center.z;

          // Compute max dimension to position camera
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const fov = camera.fov * (Math.PI / 180);
          let cameraDist = Math.abs(maxDim / 2 / Math.tan(fov / 2)) * 1.5;
          cameraDist = Math.max(cameraDist, 0.5);

          // Position camera at a dynamic 3/4 isometric viewpoint
          camera.position.set(cameraDist * 0.8, cameraDist * 0.55, cameraDist * 0.95);
          camera.near = cameraDist * 0.01;
          camera.far = cameraDist * 20;
          camera.lookAt(0, 0, 0);
          camera.updateProjectionMatrix();

          scene.add(model);

          // Force matrix update & render
          scene.updateMatrixWorld(true);
          renderer?.render(scene, camera);

          if (!renderer?.domElement) {
            throw new Error("Canvas rendering context unavailable");
          }

          // Convert canvas to Blob
          renderer.domElement.toBlob(
            (blob) => {
              clearTimeout(timer);
              cleanup();
              if (blob) {
                isSettled = true;
                resolve(blob);
              } else {
                isSettled = true;
                reject(new Error("Failed to export thumbnail to Blob"));
              }
            },
            mimeType,
            quality
          );
        } catch (err) {
          clearTimeout(timer);
          cleanup();
          isSettled = true;
          reject(err);
        }
      },
      undefined,
      (error) => {
        clearTimeout(timer);
        cleanup();
        isSettled = true;
        reject(error);
      }
    );
  });
}

/**
 * Helper to generate thumbnail as a File instance ready to append to FormData.
 */
export async function generateGlbThumbnailFile(
  file: File,
  fileName = "thumbnail.jpg",
  options?: ThumbnailOptions
): Promise<File> {
  const blob = await generateGlbThumbnail(file, options);
  const mime = options?.mimeType || "image/jpeg";
  return new File([blob], fileName, { type: mime });
}

/**
 * Helper to generate Data URL (base64) preview for instant UI previewing.
 */
export async function generateGlbThumbnailDataUrl(
  fileOrUrl: File | Blob | string,
  options?: ThumbnailOptions
): Promise<string> {
  const blob = await generateGlbThumbnail(fileOrUrl, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
