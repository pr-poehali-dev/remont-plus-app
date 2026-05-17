import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
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
import { mm, type ViewMode } from "./House3DMaterials";
import { HouseFrame, Ground, MovingSun } from "./House3DScene";

export type { ViewMode };

interface Props {
  spec: FrameHouseSpec;
  mode: ViewMode;
  showShadows?: boolean;
  showGrid?: boolean;
  timeOfDay?: "day" | "sunset" | "night";
  quality?: "high" | "medium";
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
