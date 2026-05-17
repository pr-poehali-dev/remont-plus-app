import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";
import { mm, type ViewMode } from "./House3DMaterials";

interface Props {
  spec: FrameHouseSpec;
  mode: ViewMode;
  onClose: () => void;
}

type ARSupport = "checking" | "supported" | "ios" | "unsupported";

/**
 * AR-режим через WebXR (immersive-ar).
 * На Android Chrome/Edge с ARCore — нативная AR-сессия.
 * На iOS — инструкция (Safari не поддерживает WebXR нативно).
 */
export default function House3DAR({ spec, mode, onClose }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [support, setSupport] = useState<ARSupport>("checking");
  const [sessionActive, setSessionActive] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [scale, setScale] = useState(1);

  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const houseGroupRef = useRef<THREE.Group | null>(null);
  const reticleRef = useRef<THREE.Mesh | null>(null);
  const hitTestSourceRef = useRef<XRHitTestSource | null>(null);
  const sessionRef = useRef<XRSession | null>(null);

  // Проверка поддержки
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

  /* ──────── Построение AR-модели дома (упрощённая копия HouseFrame) ──────── */
  const buildHouseModel = (): THREE.Group => {
    const group = new THREE.Group();

    const L = mm(spec.length);
    const W = mm(spec.width);
    const H = mm(spec.wallHeight);
    const totalH = H * spec.floors;
    const overhang = mm(spec.roofOverhang);
    const ridgeHeight =
      totalH + (W / 2) * Math.tan((spec.roofPitchDeg * Math.PI) / 180);

    const wallColor = mode === "finished" ? "#d9b885" : "#caa274";
    const wallMat = new THREE.MeshStandardMaterial({
      color: wallColor,
      roughness: 0.85,
      metalness: 0,
    });
    const beltMat = new THREE.MeshStandardMaterial({
      color: "#6b4a2b",
      roughness: 0.8,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: "#3a3a3a",
      roughness: 0.45,
      metalness: 0.3,
    });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: "#aedcf5",
      transmission: 0.85,
      roughness: 0.05,
      opacity: 0.5,
      transparent: true,
    });

    // Фундамент
    const foundation = new THREE.Mesh(
      new THREE.BoxGeometry(L + 0.6, 0.3, W + 0.6),
      new THREE.MeshStandardMaterial({ color: "#888", roughness: 0.85 })
    );
    foundation.position.set(0, -0.15, 0);
    foundation.receiveShadow = true;
    group.add(foundation);

    // Стены
    if (mode !== "frame") {
      const wallThickness = 0.05;
      const front = new THREE.Mesh(
        new THREE.BoxGeometry(L, totalH, wallThickness),
        wallMat
      );
      front.position.set(0, totalH / 2, -W / 2);
      group.add(front);

      const back = front.clone();
      back.position.z = W / 2;
      group.add(back);

      const left = new THREE.Mesh(
        new THREE.BoxGeometry(wallThickness, totalH, W),
        wallMat
      );
      left.position.set(-L / 2, totalH / 2, 0);
      group.add(left);

      const right = left.clone();
      right.position.x = L / 2;
      group.add(right);
    } else {
      // Стойки каркаса
      const studGeom = new THREE.BoxGeometry(0.05, totalH, 0.15);
      const studMat = new THREE.MeshStandardMaterial({
        color: "#caa274",
        roughness: 0.82,
      });
      const studPitch = mm(spec.studPitch);
      for (let x = -L / 2; x <= L / 2; x += studPitch) {
        const s1 = new THREE.Mesh(studGeom, studMat);
        s1.position.set(x, totalH / 2, -W / 2);
        group.add(s1);
        const s2 = new THREE.Mesh(studGeom, studMat);
        s2.position.set(x, totalH / 2, W / 2);
        group.add(s2);
      }
      for (let z = -W / 2 + studPitch; z < W / 2; z += studPitch) {
        const s = new THREE.Mesh(
          new THREE.BoxGeometry(0.15, totalH, 0.05),
          studMat
        );
        s.position.set(-L / 2, totalH / 2, z);
        group.add(s);
        const s2 = s.clone();
        s2.position.x = L / 2;
        group.add(s2);
      }
    }

    // Обвязка (нижняя и верхняя)
    const beltGeomLong = new THREE.BoxGeometry(L, 0.15, 0.15);
    const beltGeomShort = new THREE.BoxGeometry(0.15, 0.15, W);
    [0, totalH].forEach((y) => {
      [-W / 2, W / 2].forEach((z) => {
        const b = new THREE.Mesh(beltGeomLong, beltMat);
        b.position.set(0, y, z);
        group.add(b);
      });
      [-L / 2, L / 2].forEach((x) => {
        const b = new THREE.Mesh(beltGeomShort, beltMat);
        b.position.set(x, y, 0);
        group.add(b);
      });
    });

    // Крыша — два ската
    const slopeWidth =
      (W / 2 + overhang) / Math.cos((spec.roofPitchDeg * Math.PI) / 180);
    const rad = (spec.roofPitchDeg * Math.PI) / 180;
    const yCenter = (totalH + ridgeHeight) / 2;

    const leftRoof = new THREE.Mesh(
      new THREE.BoxGeometry(L + overhang * 2, slopeWidth, 0.05),
      roofMat
    );
    leftRoof.rotation.x = rad;
    leftRoof.position.set(0, yCenter, -W / 4);
    group.add(leftRoof);

    const rightRoof = leftRoof.clone();
    rightRoof.rotation.x = -rad;
    rightRoof.position.z = W / 4;
    group.add(rightRoof);

    // Окна
    const ww = mm(spec.windowWidth);
    const wh = mm(spec.windowHeight);
    for (let f = 0; f < spec.floors; f++) {
      const y = f * H + 0.9 + wh / 2;
      const step = L / (spec.windowsCount + 1);
      for (let i = 0; i < spec.windowsCount; i++) {
        const w = new THREE.Mesh(
          new THREE.BoxGeometry(ww, wh, 0.05),
          glassMat
        );
        w.position.set(-L / 2 + step * (i + 1), y, -W / 2 - 0.03);
        group.add(w);
      }
    }

    // Двери
    const dw = mm(spec.doorWidth);
    const dh = mm(spec.doorHeight);
    const dStep = L / (spec.doorsCount + 1);
    for (let i = 0; i < spec.doorsCount; i++) {
      const door = new THREE.Mesh(
        new THREE.BoxGeometry(dw, dh, 0.06),
        beltMat
      );
      door.position.set(-L / 2 + dStep * (i + 1), dh / 2, W / 2 + 0.03);
      group.add(door);
    }

    group.traverse((obj) => {
      if (obj instanceof THREE.Mesh) {
        obj.castShadow = true;
        obj.receiveShadow = true;
      }
    });

    return group;
  };

  const startAR = async () => {
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
      sessionRef.current = session;
      setSessionActive(true);

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
      rendererRef.current = renderer;

      // Сцена
      const scene = new THREE.Scene();
      scene.add(new THREE.HemisphereLight(0xffffff, 0xbbbbff, 0.9));
      const dir = new THREE.DirectionalLight(0xffffff, 1.0);
      dir.position.set(2, 4, 2);
      scene.add(dir);
      sceneRef.current = scene;

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
      reticleRef.current = reticle;

      // Дом (пока невидим, появится при тапе)
      const house = buildHouseModel();
      house.visible = false;
      scene.add(house);
      houseGroupRef.current = house;

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
        hitTestSourceRef.current = source;
      }

      // Тап — разместить/переместить дом
      session.addEventListener("select", () => {
        if (reticle.visible && houseGroupRef.current) {
          houseGroupRef.current.visible = true;
          houseGroupRef.current.position.setFromMatrixPosition(reticle.matrix);
          houseGroupRef.current.quaternion.setFromRotationMatrix(reticle.matrix);
          setPlaced(true);
        }
      });

      // Рендер-цикл
      renderer.setAnimationLoop((_t, frame) => {
        if (!frame) return;
        if (hitTestSourceRef.current && reticleRef.current) {
          const results = frame.getHitTestResults(hitTestSourceRef.current);
          if (results.length > 0) {
            const pose = results[0].getPose(refSpace);
            if (pose) {
              reticleRef.current.visible = !placed;
              reticleRef.current.matrix.fromArray(pose.transform.matrix);
            }
          } else {
            reticleRef.current.visible = false;
          }
        }
        renderer.render(scene, camera);
      });

      session.addEventListener("end", () => {
        setSessionActive(false);
        setPlaced(false);
        renderer.setAnimationLoop(null);
        renderer.dispose();
      });
    } catch (err) {
      console.error("AR session failed:", err);
      setSupport("unsupported");
    }
  };

  const endAR = () => {
    sessionRef.current?.end?.();
  };

  // Управление масштабом дома в AR
  useEffect(() => {
    if (houseGroupRef.current) {
      houseGroupRef.current.scale.setScalar(scale);
    }
  }, [scale]);

  return (
    <div className="fixed inset-0 z-[90] bg-slate-950/95 backdrop-blur-md flex flex-col">
      {/* Шапка */}
      <div className="flex items-center justify-between p-4 text-white">
        <div className="flex items-center gap-2">
          <Icon name="View" size={20} className="text-orange-400" />
          <h2 className="text-lg font-bold">AR-режим</h2>
          <span className="text-[10px] uppercase tracking-wider bg-orange-500 px-1.5 py-0.5 rounded font-bold">
            BETA
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            endAR();
            onClose();
          }}
          className="text-white hover:bg-white/10"
        >
          <Icon name="X" size={18} />
        </Button>
      </div>

      {/* Контент */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center p-6">
        {support === "checking" && (
          <div className="text-white text-center">
            <Icon name="Loader2" size={36} className="animate-spin mx-auto mb-3" />
            <p>Проверяем поддержку AR…</p>
          </div>
        )}

        {support === "supported" && !sessionActive && (
          <div className="max-w-md text-center text-white space-y-5">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-2xl shadow-orange-500/40">
              <Icon name="ScanLine" size={44} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold">Дом в натуральную величину</h3>
            <p className="text-slate-300">
              Поставьте свой каркасник на участок и обойдите его вокруг. Используется ARCore через
              WebXR — без установки приложений.
            </p>
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left space-y-2 text-sm text-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">1</span>
                Направьте камеру на ровную поверхность
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">2</span>
                Дождитесь оранжевого кольца-прицела
              </div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center font-bold">3</span>
                Коснитесь экрана — дом появится в реальном мире
              </div>
            </div>
            <Button
              onClick={startAR}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white border-0 text-base font-bold"
            >
              <Icon name="ScanLine" className="mr-2" />
              Запустить AR
            </Button>
          </div>
        )}

        {sessionActive && (
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3 z-10">
            {placed && (
              <div className="bg-white/95 backdrop-blur-md rounded-full px-4 py-2 shadow-xl flex items-center gap-3">
                <button
                  onClick={() => setScale(Math.max(0.1, scale - 0.1))}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <Icon name="Minus" size={16} />
                </button>
                <span className="text-sm font-semibold w-12 text-center">
                  {Math.round(scale * 100)}%
                </span>
                <button
                  onClick={() => setScale(Math.min(2, scale + 0.1))}
                  className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center"
                >
                  <Icon name="Plus" size={16} />
                </button>
              </div>
            )}
            <Button
              onClick={endAR}
              className="bg-red-500 hover:bg-red-600 text-white border-0"
            >
              <Icon name="X" className="mr-1" size={16} />
              Завершить AR
            </Button>
          </div>
        )}

        {support === "ios" && (
          <div className="max-w-md text-center text-white space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-sky-500/20 flex items-center justify-center">
              <Icon name="Smartphone" size={36} className="text-sky-400" />
            </div>
            <h3 className="text-xl font-bold">AR для iOS</h3>
            <p className="text-slate-300">
              Safari пока не поддерживает WebXR. Для AR на iPhone/iPad используйте Android-устройство или браузер с поддержкой WebXR
              (например, Mozilla XR Viewer).
            </p>
            <p className="text-slate-400 text-sm">
              Мы готовим версию с AR Quick Look (USDZ-модели) для iOS — будет доступно в ближайших обновлениях.
            </p>
          </div>
        )}

        {support === "unsupported" && (
          <div className="max-w-md text-center text-white space-y-4">
            <div className="w-20 h-20 mx-auto rounded-full bg-slate-700 flex items-center justify-center">
              <Icon name="AlertTriangle" size={36} className="text-amber-400" />
            </div>
            <h3 className="text-xl font-bold">AR недоступен на этом устройстве</h3>
            <p className="text-slate-300">
              Откройте сайт на Android-смартфоне в Chrome или Edge (требуется ARCore). На компьютере AR-режим не работает.
            </p>
            <Button onClick={onClose} variant="outline" className="text-white border-white/30 hover:bg-white/10">
              Вернуться к 3D
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
