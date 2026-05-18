import { useEffect, useState } from "react";
import * as THREE from "three";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";
import type { ViewMode } from "./House3DMaterials";
import { buildHouseModel } from "./House3DARModel";
import func2url from "../../../backend/func2url.json";

export type ARSupport = "checking" | "supported" | "ios" | "unsupported";

/**
 * Хук определения поддержки AR. Логика идентична оригинальному useEffect
 * в House3DAR.tsx (строки 39-57).
 */
export function useARSupport(): [ARSupport, (s: ARSupport) => void] {
  const [support, setSupport] = useState<ARSupport>("checking");

  useEffect(() => {
    const xrNav = navigator as Navigator & {
      xr?: { isSessionSupported?: (mode: string) => Promise<boolean> };
    };
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !("MSStream" in window);

    if (isIOS) {
      setSupport("ios");
      return;
    }
    if (!xrNav.xr || !xrNav.xr.isSessionSupported) {
      setSupport("unsupported");
      return;
    }
    xrNav.xr
      .isSessionSupported("immersive-ar")
      .then((ok: boolean) => setSupport(ok ? "supported" : "unsupported"))
      .catch(() => setSupport("unsupported"));
  }, []);

  return [support, setSupport];
}

export interface ARSessionRefs {
  rendererRef: React.MutableRefObject<THREE.WebGLRenderer | null>;
  sceneRef: React.MutableRefObject<THREE.Scene | null>;
  houseGroupRef: React.MutableRefObject<THREE.Group | null>;
  reticleRef: React.MutableRefObject<THREE.Mesh | null>;
  hitTestSourceRef: React.MutableRefObject<XRHitTestSource | null>;
  sessionRef: React.MutableRefObject<XRSession | null>;
}

export interface ARSessionCallbacks {
  setSessionActive: (v: boolean) => void;
  setPlaced: (v: boolean) => void;
  setSupport: (v: ARSupport) => void;
  placedRef: { current: boolean };
}

/**
 * Запуск WebXR AR-сессии. Идентично оригинальной функции startAR (строки 230-350).
 */
export async function startARSession(
  spec: FrameHouseSpec,
  mode: ViewMode,
  refs: ARSessionRefs,
  cb: ARSessionCallbacks,
): Promise<void> {
  const xrNav = navigator as Navigator & {
    xr?: {
      requestSession?: (
        mode: string,
        init: XRSessionInit
      ) => Promise<XRSession>;
    };
  };
  if (!xrNav.xr?.requestSession) return;

  try {
    const session = await xrNav.xr.requestSession("immersive-ar", {
      requiredFeatures: ["hit-test", "local-floor"],
    });
    refs.sessionRef.current = session;
    cb.setSessionActive(true);

    // Three.js renderer для XR
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2", { xrCompatible: true });
    const renderer = new THREE.WebGLRenderer({
      canvas,
      context: gl as WebGL2RenderingContext,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.xr.enabled = true;
    renderer.xr.setReferenceSpaceType("local-floor");
    await renderer.xr.setSession(session as unknown as XRSession);
    refs.rendererRef.current = renderer;

    // Сцена
    const scene = new THREE.Scene();
    scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 1.0);
    dir.position.set(2, 4, 2);
    scene.add(dir);
    refs.sceneRef.current = scene;

    // Reticle (прицел для размещения)
    const ringGeom = new THREE.RingGeometry(0.12, 0.16, 32).rotateX(
      -Math.PI / 2
    );
    const reticle = new THREE.Mesh(
      ringGeom,
      new THREE.MeshBasicMaterial({ color: 0xfb923c })
    );
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);
    refs.reticleRef.current = reticle;

    // Дом (пока невидим, появится при тапе)
    const house = buildHouseModel(spec, mode);
    house.visible = false;
    scene.add(house);
    refs.houseGroupRef.current = house;

    // Камера управляется WebXR-сессией
    const camera = new THREE.PerspectiveCamera();

    // Hit-test source
    const refSpace = await session.requestReferenceSpace("local-floor");
    const viewerSpace = await session.requestReferenceSpace("viewer");
    const xrSession = session as unknown as {
      requestHitTestSource?: (init: {
        space: XRReferenceSpace;
      }) => Promise<XRHitTestSource>;
    };
    if (xrSession.requestHitTestSource) {
      const source = await xrSession.requestHitTestSource({
        space: viewerSpace as XRReferenceSpace,
      });
      refs.hitTestSourceRef.current = source;
    }

    // Тап — разместить/переместить дом
    session.addEventListener("select", () => {
      if (reticle.visible && refs.houseGroupRef.current) {
        refs.houseGroupRef.current.visible = true;
        refs.houseGroupRef.current.position.setFromMatrixPosition(reticle.matrix);
        refs.houseGroupRef.current.quaternion.setFromRotationMatrix(reticle.matrix);
        cb.setPlaced(true);
      }
    });

    // Рендер-цикл
    renderer.setAnimationLoop((_t, frame) => {
      if (!frame) return;
      if (refs.hitTestSourceRef.current && refs.reticleRef.current) {
        const results = frame.getHitTestResults(refs.hitTestSourceRef.current);
        if (results.length > 0) {
          const pose = results[0].getPose(refSpace);
          if (pose) {
            refs.reticleRef.current.visible = !cb.placedRef.current;
            refs.reticleRef.current.matrix.fromArray(pose.transform.matrix);
          }
        } else {
          refs.reticleRef.current.visible = false;
        }
      }
      renderer.render(scene, camera);
    });

    session.addEventListener("end", () => {
      cb.setSessionActive(false);
      cb.setPlaced(false);
      renderer.setAnimationLoop(null);
      renderer.dispose();
    });
  } catch (err) {
    console.error("AR session failed:", err);
    cb.setSupport("unsupported");
  }
}

/**
 * iOS AR Quick Look. Идентично функции launchIOSQuickLook (строки 357-386).
 */
export async function launchIOSQuickLook(
  spec: FrameHouseSpec,
  setIosError: (v: string | null) => void,
  setIosLoading: (v: boolean) => void,
): Promise<void> {
  setIosError(null);
  setIosLoading(true);
  try {
    const usdzUrl = (func2url as Record<string, string>)["house-usdz"];
    const res = await fetch(usdzUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ spec }),
    });
    if (!res.ok) throw new Error("Не удалось сгенерировать модель");
    const data = (await res.json()) as { url: string };

    // AR Quick Look запускается через <a rel="ar"> с href на .usdz
    const anchor = document.createElement("a");
    anchor.setAttribute("rel", "ar");
    anchor.setAttribute("href", data.url);
    // Внутри ссылки обязательно должен быть <img> для активации Quick Look на iOS
    const img = document.createElement("img");
    img.style.display = "none";
    anchor.appendChild(img);
    document.body.appendChild(anchor);
    anchor.click();
    setTimeout(() => anchor.remove(), 500);
  } catch (err) {
    setIosError(err instanceof Error ? err.message : "Ошибка генерации");
  } finally {
    setIosLoading(false);
  }
}
