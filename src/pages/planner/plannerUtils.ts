import { FURNITURE_CATALOG } from "@/components/planner/furnitureCatalog";
import type {
  Point,
  Wall,
  PlacedFurniture,
  Opening,
} from "@/components/planner/plannerTypes";

export const STORAGE_KEY = "planner_project";
export const SAVE_DELAY = 1000;
export const ZOOM_FACTOR = 1.12;
export const HIT_THRESHOLD = 200;

export const catalogMap = new Map(FURNITURE_CATALOG.map((i) => [i.id, i]));

export function uid(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function pointInRotatedRect(
  px: number,
  py: number,
  cx: number,
  cy: number,
  w: number,
  d: number,
  rotation: number
): boolean {
  const rad = (-rotation * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  const dx = px - cx;
  const dy = py - cy;
  const lx = dx * cos - dy * sin;
  const ly = dx * sin + dy * cos;
  return Math.abs(lx) <= w / 2 && Math.abs(ly) <= d / 2;
}

export function makeWall(
  start: Point,
  end: Point,
  thickness: number,
  openings: Opening[] = []
): Wall {
  return { id: uid(), start, end, thickness, openings };
}

export function makeOpening(
  type: "door" | "window",
  position: number,
  width: number,
  direction?: "left" | "right"
): Opening {
  return { id: uid(), type, position, width, direction };
}

export function generatePreset(
  presetId: string,
  thickness: number
): { walls: Wall[]; furniture: PlacedFurniture[] } {
  const t = thickness;
  const furniture: PlacedFurniture[] = [];

  switch (presetId) {
    case "studio": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 7000, y: 0 }, t, [
          makeOpening("window", 0.5, 1500),
        ]),
        makeWall({ x: 7000, y: 0 }, { x: 7000, y: 4000 }, t, [
          makeOpening("window", 0.5, 1200),
        ]),
        makeWall({ x: 7000, y: 4000 }, { x: 0, y: 4000 }, t, [
          makeOpening("door", 0.15, 900, "left"),
        ]),
        makeWall({ x: 0, y: 4000 }, { x: 0, y: 0 }, t),
        makeWall({ x: 4000, y: 0 }, { x: 4000, y: 4000 }, t, [
          makeOpening("door", 0.5, 800, "right"),
        ]),
      ];
      return { walls, furniture };
    }
    case "living": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 5000, y: 0 }, t, [
          makeOpening("window", 0.5, 1800),
        ]),
        makeWall({ x: 5000, y: 0 }, { x: 5000, y: 4000 }, t, [
          makeOpening("window", 0.5, 1400),
        ]),
        makeWall({ x: 5000, y: 4000 }, { x: 0, y: 4000 }, t, [
          makeOpening("door", 0.2, 900, "left"),
        ]),
        makeWall({ x: 0, y: 4000 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "bedroom": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 4000, y: 0 }, t, [
          makeOpening("window", 0.5, 1500),
        ]),
        makeWall({ x: 4000, y: 0 }, { x: 4000, y: 3500 }, t),
        makeWall({ x: 4000, y: 3500 }, { x: 0, y: 3500 }, t, [
          makeOpening("door", 0.25, 800, "left"),
        ]),
        makeWall({ x: 0, y: 3500 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "kitchen": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 4000, y: 0 }, t, [
          makeOpening("window", 0.5, 1400),
        ]),
        makeWall({ x: 4000, y: 0 }, { x: 4000, y: 3000 }, t),
        makeWall({ x: 4000, y: 3000 }, { x: 0, y: 3000 }, t, [
          makeOpening("door", 0.2, 800, "right"),
        ]),
        makeWall({ x: 0, y: 3000 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "bathroom": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 2500, y: 0 }, t),
        makeWall({ x: 2500, y: 0 }, { x: 2500, y: 2000 }, t),
        makeWall({ x: 2500, y: 2000 }, { x: 0, y: 2000 }, t, [
          makeOpening("door", 0.5, 700, "left"),
        ]),
        makeWall({ x: 0, y: 2000 }, { x: 0, y: 0 }, t),
      ];
      return { walls, furniture };
    }
    case "hallway": {
      const walls = [
        makeWall({ x: 0, y: 0 }, { x: 6000, y: 0 }, t),
        makeWall({ x: 6000, y: 0 }, { x: 6000, y: 1500 }, t, [
          makeOpening("door", 0.5, 900, "right"),
        ]),
        makeWall({ x: 6000, y: 1500 }, { x: 0, y: 1500 }, t, [
          makeOpening("door", 0.8, 900, "left"),
        ]),
        makeWall({ x: 0, y: 1500 }, { x: 0, y: 0 }, t, [
          makeOpening("door", 0.5, 900, "left"),
        ]),
      ];
      return { walls, furniture };
    }
    default:
      return { walls: [], furniture: [] };
  }
}

export default {
  uid,
  pointInRotatedRect,
  makeWall,
  makeOpening,
  generatePreset,
  catalogMap,
};
