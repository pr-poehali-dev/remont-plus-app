import * as THREE from "three";
import type { FrameHouseSpec } from "@/lib/frameHouseGenerator";
import { mm, type ViewMode } from "./House3DMaterials";

/**
 * Построение AR-модели дома (упрощённая копия HouseFrame).
 * Логика полностью идентична исходной функции buildHouseModel из House3DAR.tsx.
 */
export function buildHouseModel(spec: FrameHouseSpec, mode: ViewMode): THREE.Group {
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
}
