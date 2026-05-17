import { useMemo } from "react";
import * as THREE from "three";

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
export function Beam({ start, end, section, material, castShadow = true, receiveShadow = true }: BeamProps) {
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

/* ──────────────────────────── СТЕНА С ВЫРЕЗАМИ ──────────────────────────── */

export function WallWithCutouts({
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

export function GableWall({
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

export function RoofPlane({
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
