import { Suspense, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Grid,
  Sky,
  SoftShadows,
  Stats,
  Html,
} from "@react-three/drei";
import * as THREE from "three";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";

export type ViewMode = "frame" | "sheathed" | "finished";

interface Props {
  spec: FrameHouseSpec;
  mode: ViewMode;
  showShadows?: boolean;
  showGrid?: boolean;
  timeOfDay?: "day" | "sunset" | "night";
  quality?: "high" | "medium";
}

/* ──────────────────────────── ВСПОМОГАТЕЛЬНЫЕ ХУКИ ──────────────────────────── */

// мм → метры (Three использует метры)
const mm = (v: number) => v / 1000;

/* ──────────────────────────── МАТЕРИАЛЫ ──────────────────────────── */

function useWoodMaterial(tone: "raw" | "dark" | "siding" = "raw") {
  return useMemo(() => {
    const colors = {
      raw: "#c8a373",
      dark: "#6b4a2b",
      siding: "#d9b885",
    };
    return new THREE.MeshPhysicalMaterial({
      color: colors[tone],
      roughness: 0.78,
      metalness: 0.0,
      clearcoat: 0.08,
      clearcoatRoughness: 0.6,
      sheen: 0.1,
      sheenColor: new THREE.Color("#f3d9a8"),
    });
  }, [tone]);
}

function useRoofMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#3a3a3a",
        roughness: 0.42,
        metalness: 0.32,
        clearcoat: 0.2,
        clearcoatRoughness: 0.45,
      }),
    []
  );
}

function useGlassMaterial() {
  return useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#aedcf5",
        transmission: 0.92,
        roughness: 0.05,
        metalness: 0,
        ior: 1.52,
        thickness: 0.01,
        transparent: true,
        opacity: 0.5,
        clearcoat: 1.0,
        clearcoatRoughness: 0.02,
        envMapIntensity: 1.4,
        reflectivity: 0.6,
      }),
    []
  );
}

function useFrameMaterial(opacity = 1) {
  return useMemo(() => {
    const mat = new THREE.MeshPhysicalMaterial({
      color: "#caa274",
      roughness: 0.82,
      metalness: 0,
      sheen: 0.15,
      sheenColor: new THREE.Color("#e8c896"),
    });
    if (opacity < 1) {
      mat.transparent = true;
      mat.opacity = opacity;
    }
    return mat;
  }, [opacity]);
}

/* ──────────────────────────── ДЕТАЛИ КАРКАСА ──────────────────────────── */

interface BeamProps {
  start: [number, number, number];
  end: [number, number, number];
  /** Сечение в метрах: ширина (x) × высота (y) */
  section: [number, number];
  material: THREE.Material;
  castShadow?: boolean;
  receiveShadow?: boolean;
}

/**
 * Универсальная балка/стойка между двумя точками с заданным сечением.
 */
function Beam({ start, end, section, material, castShadow = true, receiveShadow = true }: BeamProps) {
  const [w, h] = section;
  const s = new THREE.Vector3(...start);
  const e = new THREE.Vector3(...end);
  const dir = new THREE.Vector3().subVectors(e, s);
  const length = dir.length();
  const mid = new THREE.Vector3().addVectors(s, e).multiplyScalar(0.5);

  // Направление балки = +Y по умолчанию (BoxGeometry высотой = length)
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

  return (
    <mesh
      position={mid.toArray()}
      quaternion={[quat.x, quat.y, quat.z, quat.w]}
      castShadow={castShadow}
      receiveShadow={receiveShadow}
    >
      <boxGeometry args={[w, length, h]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ──────────────────────────── ОСНОВНОЙ ДОМ ──────────────────────────── */

function HouseFrame({ spec, mode }: { spec: FrameHouseSpec; mode: ViewMode }) {
  const L = mm(spec.length);
  const W = mm(spec.width);
  const H = mm(spec.wallHeight);
  const studPitch = mm(spec.studPitch);
  const floors = spec.floors;
  const totalH = H * floors;

  const frameMat = useFrameMaterial(mode === "finished" ? 0 : 1);
  const beltMat = useWoodMaterial("dark");
  const sidingMat = useWoodMaterial("siding");
  const roofMat = useRoofMaterial();
  const glassMat = useGlassMaterial();
  const doorMat = useWoodMaterial("dark");

  // Сечения, м
  const studSec: [number, number] = [0.05, 0.15];
  const beltSec: [number, number] = [0.15, 0.15];
  const joistSec: [number, number] = [0.05, 0.2];
  const rafterSec: [number, number] = [0.05, 0.2];

  /* ── Стойки стен ── */
  const studs = useMemo(() => {
    if (mode !== "frame") return [];
    const out: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    for (let f = 0; f < floors; f++) {
      const yBot = f * H + 0.15;
      const yTop = (f + 1) * H - 0.05;
      // Фасад и тыл (вдоль X)
      for (let x = 0; x <= L; x += studPitch) {
        const xClamp = Math.min(x, L);
        out.push({ start: [xClamp, yBot, 0], end: [xClamp, yTop, 0] });
        out.push({ start: [xClamp, yBot, W], end: [xClamp, yTop, W] });
      }
      // Боковые (вдоль Z) — без угловых
      for (let z = studPitch; z < W; z += studPitch) {
        out.push({ start: [0, yBot, z], end: [0, yTop, z] });
        out.push({ start: [L, yBot, z], end: [L, yTop, z] });
      }
    }
    return out;
  }, [L, W, H, studPitch, floors, mode]);

  /* ── Обвязка ── */
  const belts = useMemo(() => {
    const out: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    for (let f = 0; f <= floors; f++) {
      const y = f * H;
      // нижняя обвязка чуть толще
      out.push({ start: [0, y, 0], end: [L, y, 0] });
      out.push({ start: [0, y, W], end: [L, y, W] });
      out.push({ start: [0, y, 0], end: [0, y, W] });
      out.push({ start: [L, y, 0], end: [L, y, W] });
    }
    return out;
  }, [L, W, H, floors]);

  /* ── Лаги ── */
  const joists = useMemo(() => {
    if (mode !== "frame") return [];
    const out: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    const pitch = 0.6;
    for (let f = 0; f < floors; f++) {
      const y = f * H + 0.07;
      for (let x = 0; x <= L; x += pitch) {
        const xClamp = Math.min(x, L);
        out.push({ start: [xClamp, y, 0], end: [xClamp, y, W] });
      }
    }
    return out;
  }, [L, W, H, floors, mode]);

  /* ── Стропила ── */
  const roofPitchDeg = spec.roofPitchDeg;
  const overhang = mm(spec.roofOverhang);
  const halfSpan = W / 2 + overhang;
  const ridgeHeight = totalH + (W / 2) * Math.tan((roofPitchDeg * Math.PI) / 180);
  const rafters = useMemo(() => {
    if (mode === "finished") return [];
    const out: Array<{ start: [number, number, number]; end: [number, number, number] }> = [];
    const rPitch = 0.7;
    for (let x = 0; x <= L; x += rPitch) {
      const xClamp = Math.min(x, L);
      // Левый скат
      out.push({
        start: [xClamp, totalH, -overhang],
        end: [xClamp, ridgeHeight, W / 2],
      });
      // Правый скат
      out.push({
        start: [xClamp, totalH, W + overhang],
        end: [xClamp, ridgeHeight, W / 2],
      });
    }
    return out;
  }, [L, W, totalH, ridgeHeight, overhang, mode]);

  /* ── Двери (на нижней стене Z=W) ── */
  const doors = useMemo(() => {
    const arr = [];
    const dw = mm(spec.doorWidth);
    const dh = mm(spec.doorHeight);
    const step = L / (spec.doorsCount + 1);
    for (let i = 0; i < spec.doorsCount; i++) {
      arr.push({
        x: step * (i + 1) - dw / 2,
        w: dw,
        h: dh,
      });
    }
    return arr;
  }, [L, spec.doorsCount, spec.doorWidth, spec.doorHeight]);

  /* ── Окна (на фасаде Z=0, на каждом этаже) ── */
  const windows = useMemo(() => {
    const arr: Array<{ x: number; y: number; w: number; h: number; side: "front" | "back" }> = [];
    const ww = mm(spec.windowWidth);
    const wh = mm(spec.windowHeight);
    for (let f = 0; f < floors; f++) {
      const y = f * H + 0.9;
      const step = L / (spec.windowsCount + 1);
      for (let i = 0; i < spec.windowsCount; i++) {
        arr.push({ x: step * (i + 1) - ww / 2, y, w: ww, h: wh, side: "front" });
        // По одному окну на боковинах для разнообразия
      }
      arr.push({ x: L * 0.25 - ww / 2, y, w: ww, h: wh, side: "back" });
      arr.push({ x: L * 0.75 - ww / 2, y, w: ww, h: wh, side: "back" });
    }
    return arr;
  }, [L, H, spec.windowsCount, spec.windowWidth, spec.windowHeight, floors]);

  /* ── Стены/обшивка (для режимов sheathed и finished) ── */
  const renderWalls = mode !== "frame";

  /* ── Скаты крыши (треугольники) ── */
  const renderRoof = mode !== "frame";

  return (
    <group position={[-L / 2, 0, -W / 2]}>
      {/* Фундамент-цоколь */}
      <mesh position={[L / 2, -0.15, W / 2]} receiveShadow castShadow>
        <boxGeometry args={[L + 0.6, 0.3, W + 0.6]} />
        <meshPhysicalMaterial color="#888888" roughness={0.85} metalness={0.02} />
      </mesh>

      {/* Обвязка */}
      {belts.map((b, i) => (
        <Beam key={`belt-${i}`} start={b.start} end={b.end} section={beltSec} material={beltMat} />
      ))}

      {/* Стойки (только в режиме каркаса) */}
      {studs.map((s, i) => (
        <Beam key={`stud-${i}`} start={s.start} end={s.end} section={studSec} material={frameMat} />
      ))}

      {/* Лаги (только в каркасе) */}
      {joists.map((j, i) => (
        <Beam key={`joist-${i}`} start={j.start} end={j.end} section={joistSec} material={frameMat} />
      ))}

      {/* Стропила (в каркасе и в "обшит") */}
      {rafters.map((r, i) => (
        <Beam key={`rafter-${i}`} start={r.start} end={r.end} section={rafterSec} material={frameMat} />
      ))}

      {/* Коньковый прогон */}
      {mode !== "finished" && (
        <Beam
          start={[0, ridgeHeight, W / 2]}
          end={[L, ridgeHeight, W / 2]}
          section={[0.1, 0.2]}
          material={beltMat}
        />
      )}

      {/* Стены-обшивка */}
      {renderWalls && (
        <>
          {/* Передняя стена */}
          <WallWithCutouts
            width={L}
            height={totalH}
            position={[L / 2, totalH / 2, 0]}
            rotation={[0, 0, 0]}
            material={mode === "finished" ? sidingMat : frameMat}
            openings={[
              ...windows
                .filter((w) => w.side === "front")
                .map((w) => ({ x: w.x + w.w / 2 - L / 2, y: w.y + w.h / 2 - totalH / 2, w: w.w, h: w.h })),
            ]}
          />
          {/* Задняя стена */}
          <WallWithCutouts
            width={L}
            height={totalH}
            position={[L / 2, totalH / 2, W]}
            rotation={[0, Math.PI, 0]}
            material={mode === "finished" ? sidingMat : frameMat}
            openings={[
              ...doors.map((d) => ({ x: d.x + d.w / 2 - L / 2, y: d.h / 2 - totalH / 2, w: d.w, h: d.h })),
              ...windows
                .filter((w) => w.side === "back")
                .map((w) => ({ x: -(w.x + w.w / 2 - L / 2), y: w.y + w.h / 2 - totalH / 2, w: w.w, h: w.h })),
            ]}
          />
          {/* Левая стена (треугольный фронтон) */}
          <GableWall
            width={W}
            height={totalH}
            ridgeHeight={ridgeHeight - totalH}
            position={[0, 0, W / 2]}
            rotation={[0, -Math.PI / 2, 0]}
            material={mode === "finished" ? sidingMat : frameMat}
          />
          {/* Правая стена */}
          <GableWall
            width={W}
            height={totalH}
            ridgeHeight={ridgeHeight - totalH}
            position={[L, 0, W / 2]}
            rotation={[0, Math.PI / 2, 0]}
            material={mode === "finished" ? sidingMat : frameMat}
          />
        </>
      )}

      {/* Окна (стёкла) */}
      {windows.map((w, i) => {
        const isFront = w.side === "front";
        const z = isFront ? -0.025 : W + 0.025;
        return (
          <group key={`win-${i}`}>
            {/* Стекло */}
            <mesh position={[w.x + w.w / 2, w.y + w.h / 2, z]} castShadow={false}>
              <boxGeometry args={[w.w, w.h, 0.05]} />
              <primitive object={glassMat} attach="material" />
            </mesh>
            {/* Рама */}
            <mesh position={[w.x + w.w / 2, w.y + w.h / 2, z]}>
              <boxGeometry args={[w.w + 0.06, w.h + 0.06, 0.07]} />
              <meshPhysicalMaterial color="#f8f5ee" roughness={0.4} metalness={0.05} clearcoat={0.3} />
            </mesh>
          </group>
        );
      })}

      {/* Двери */}
      {doors.map((d, i) => (
        <group key={`door-${i}`}>
          <mesh position={[d.x + d.w / 2, d.h / 2, W + 0.03]} castShadow>
            <boxGeometry args={[d.w, d.h, 0.06]} />
            <primitive object={doorMat} attach="material" />
          </mesh>
          {/* Ручка */}
          <mesh position={[d.x + d.w - 0.1, d.h / 2 - 0.05, W + 0.07]} castShadow>
            <sphereGeometry args={[0.025, 16, 16]} />
            <meshPhysicalMaterial color="#caa75a" metalness={0.85} roughness={0.25} />
          </mesh>
        </group>
      ))}

      {/* Скаты крыши */}
      {renderRoof && (
        <>
          <RoofPlane
            length={L}
            width={W / 2 + overhang}
            pitchDeg={roofPitchDeg}
            start={[0 - overhang, totalH, -overhang]}
            facing="left"
            material={roofMat}
            ridgeHeight={ridgeHeight}
            houseW={W}
            houseL={L}
          />
          <RoofPlane
            length={L}
            width={W / 2 + overhang}
            pitchDeg={roofPitchDeg}
            start={[0 - overhang, totalH, W + overhang]}
            facing="right"
            material={roofMat}
            ridgeHeight={ridgeHeight}
            houseW={W}
            houseL={L}
          />
        </>
      )}
    </group>
  );
}

/* ──────────────────────────── СТЕНА С ВЫРЕЗАМИ ──────────────────────────── */

function WallWithCutouts({
  width,
  height,
  position,
  rotation,
  material,
  openings,
}: {
  width: number;
  height: number;
  position: [number, number, number];
  rotation: [number, number, number];
  material: THREE.Material;
  openings: Array<{ x: number; y: number; w: number; h: number }>;
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, -height / 2);
    s.lineTo(width / 2, -height / 2);
    s.lineTo(width / 2, height / 2);
    s.lineTo(-width / 2, height / 2);
    s.lineTo(-width / 2, -height / 2);

    openings.forEach((o) => {
      const hole = new THREE.Path();
      hole.moveTo(o.x - o.w / 2, o.y - o.h / 2);
      hole.lineTo(o.x + o.w / 2, o.y - o.h / 2);
      hole.lineTo(o.x + o.w / 2, o.y + o.h / 2);
      hole.lineTo(o.x - o.w / 2, o.y + o.h / 2);
      hole.lineTo(o.x - o.w / 2, o.y - o.h / 2);
      s.holes.push(hole);
    });
    return s;
  }, [width, height, openings]);

  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
    g.translate(0, 0, -0.01);
    return g;
  }, [shape]);

  return (
    <mesh position={position} rotation={rotation} geometry={geom} castShadow receiveShadow>
      <primitive object={material} attach="material" />
    </mesh>
  );
}

function GableWall({
  width,
  height,
  ridgeHeight,
  position,
  rotation,
  material,
}: {
  width: number;
  height: number;
  ridgeHeight: number;
  position: [number, number, number];
  rotation: [number, number, number];
  material: THREE.Material;
}) {
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(-width / 2, 0);
    s.lineTo(width / 2, 0);
    s.lineTo(width / 2, height);
    s.lineTo(0, height + ridgeHeight);
    s.lineTo(-width / 2, height);
    s.lineTo(-width / 2, 0);
    return s;
  }, [width, height, ridgeHeight]);

  const geom = useMemo(() => {
    const g = new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false });
    g.translate(0, 0, -0.01);
    return g;
  }, [shape]);

  return (
    <mesh position={position} rotation={rotation} geometry={geom} castShadow receiveShadow>
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ──────────────────────────── СКАТ КРЫШИ ──────────────────────────── */

function RoofPlane({
  length,
  pitchDeg,
  material,
  ridgeHeight,
  houseW,
  houseL,
  facing,
}: {
  length: number;
  width: number;
  pitchDeg: number;
  start: [number, number, number];
  facing: "left" | "right";
  material: THREE.Material;
  ridgeHeight: number;
  houseW: number;
  houseL: number;
}) {
  const overhang = 0.5;
  const rad = (pitchDeg * Math.PI) / 180;
  const slopeWidth = (houseW / 2 + overhang) / Math.cos(rad);
  const totalH = ridgeHeight - (houseW / 2) * Math.tan(rad);

  // Размещаем плоскость, вращая вокруг X
  const angle = facing === "left" ? rad : -rad;
  const zCenter = facing === "left" ? houseW / 4 - overhang / 2 : houseW * 0.75 + overhang / 2;
  const yCenter = totalH + (ridgeHeight - totalH) / 2;

  return (
    <mesh
      position={[houseL / 2, yCenter, zCenter]}
      rotation={[angle, 0, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[length + overhang * 2, slopeWidth, 0.05]} />
      <primitive object={material} attach="material" />
    </mesh>
  );
}

/* ──────────────────────────── ОКРУЖЕНИЕ ──────────────────────────── */

function Ground() {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#5a7a3e",
        roughness: 0.95,
        metalness: 0,
      }),
    []
  );
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]} receiveShadow>
      <circleGeometry args={[40, 64]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
}

/* Лёгкое вращение солнца для динамики */
function MovingSun() {
  const ref = useRef<THREE.DirectionalLight>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.elapsedTime * 0.02;
    ref.current.position.x = 15 * Math.sin(t);
    ref.current.position.z = 15 * Math.cos(t);
  });
  return (
    <directionalLight
      ref={ref}
      position={[10, 18, 12]}
      intensity={2.2}
      color="#fff5d6"
      castShadow
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-camera-far={60}
      shadow-camera-left={-25}
      shadow-camera-right={25}
      shadow-camera-top={25}
      shadow-camera-bottom={-25}
      shadow-bias={-0.0005}
    />
  );
}

/* ──────────────────────────── ОСНОВНОЙ КОМПОНЕНТ ──────────────────────────── */

export default function House3D({
  spec,
  mode,
  showShadows = true,
  showGrid = false,
  timeOfDay = "day",
  quality = "high",
}: Props) {
  const envPreset = timeOfDay === "sunset" ? "sunset" : timeOfDay === "night" ? "night" : "park";
  const ambientIntensity = timeOfDay === "night" ? 0.15 : timeOfDay === "sunset" ? 0.4 : 0.6;

  return (
    <Canvas
      shadows={showShadows ? "soft" : false}
      dpr={quality === "high" ? [1, 2] : 1}
      camera={{ position: [12, 8, 14], fov: 38, near: 0.1, far: 200 }}
      gl={{
        antialias: true,
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: timeOfDay === "night" ? 0.55 : 1.05,
        outputColorSpace: THREE.SRGBColorSpace,
      }}
    >
      <color attach="background" args={[timeOfDay === "night" ? "#0b1220" : "#cfe6f5"]} />
      <fog attach="fog" args={[timeOfDay === "night" ? "#0b1220" : "#dbeefb", 35, 95]} />

      {/* Освещение */}
      <ambientLight intensity={ambientIntensity} />
      <hemisphereLight args={["#bcd9f0", "#7a6a4d", 0.45]} />
      <MovingSun />

      {/* Окружение для PBR-отражений */}
      <Suspense fallback={null}>
        <Environment preset={envPreset as never} background={false} />
      </Suspense>

      {/* Небо (днём) */}
      {timeOfDay === "day" && (
        <Sky
          distance={450000}
          sunPosition={[10, 18, 12]}
          mieCoefficient={0.005}
          rayleigh={2}
          turbidity={6}
          inclination={0.5}
        />
      )}

      {/* Мягкие тени */}
      {showShadows && <SoftShadows size={20} samples={16} focus={0.6} />}

      {/* Сцена */}
      <Suspense
        fallback={
          <Html center>
            <div className="text-slate-600 text-sm bg-white/80 px-3 py-1.5 rounded-lg shadow">
              Загрузка…
            </div>
          </Html>
        }
      >
        <HouseFrame spec={spec} mode={mode} />
        <Ground />
        <ContactShadows
          position={[0, -0.14, 0]}
          opacity={0.45}
          scale={50}
          blur={2.4}
          far={20}
          resolution={1024}
        />
      </Suspense>

      {showGrid && (
        <Grid
          position={[0, -0.14, 0]}
          args={[40, 40]}
          cellSize={1}
          sectionSize={5}
          cellColor="#88a"
          sectionColor="#557"
          fadeDistance={30}
          fadeStrength={1}
          infiniteGrid
        />
      )}

      <OrbitControls
        makeDefault
        enableDamping
        dampingFactor={0.08}
        minDistance={4}
        maxDistance={40}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, mm(spec.wallHeight * spec.floors) / 2, 0]}
      />

      {process.env.NODE_ENV === "development" && <Stats />}
    </Canvas>
  );
}
