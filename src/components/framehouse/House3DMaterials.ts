import { useMemo } from "react";
import * as THREE from "three";

export type ViewMode = "frame" | "sheathed" | "finished";

/* ──────────────────────────── ВСПОМОГАТЕЛЬНЫЕ ХУКИ ──────────────────────────── */

// мм → метры (Three использует метры)
export const mm = (v: number) => v / 1000;

/* ──────────────────────────── МАТЕРИАЛЫ ──────────────────────────── */

export function useWoodMaterial(tone: "raw" | "dark" | "siding" = "raw") {
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

export function useRoofMaterial() {
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

export function useGlassMaterial() {
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

export function useFrameMaterial(opacity = 1) {
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
