export interface RoomDimensions {
  width: number;
  length: number;
  height: number;
}

export interface WallOpening {
  id: string;
  wall: "front" | "back" | "left" | "right";
  type: "door" | "window";
  position: number;
  width: number;
  height: number;
  elevation: number;
}

export interface PlacedFurniture {
  id: string;
  catalogId: string;
  x: number;
  z: number;
  rotation: number;
  color: string;
}

export interface WallStyle {
  wall: "front" | "back" | "left" | "right" | "floor" | "ceiling";
  color: string;
  material: string;
}

export interface RoomProject {
  id: string;
  name: string;
  dimensions: RoomDimensions;
  openings: WallOpening[];
  furniture: PlacedFurniture[];
  wallStyles: WallStyle[];
  createdAt: string;
}

export type WallName = "front" | "back" | "left" | "right";

export const WALL_LABELS: Record<WallName, string> = {
  front: "Передняя",
  back: "Задняя",
  left: "Левая",
  right: "Правая",
};

export const DEFAULT_WALL_STYLES: WallStyle[] = [
  { wall: "front", color: "#f5f0eb", material: "paint" },
  { wall: "back", color: "#f5f0eb", material: "paint" },
  { wall: "left", color: "#f5f0eb", material: "paint" },
  { wall: "right", color: "#f5f0eb", material: "paint" },
  { wall: "floor", color: "#c4a882", material: "wood" },
  { wall: "ceiling", color: "#ffffff", material: "paint" },
];

export const MATERIALS: { id: string; label: string }[] = [
  { id: "paint", label: "Краска" },
  { id: "wallpaper", label: "Обои" },
  { id: "tile", label: "Плитка" },
  { id: "wood", label: "Дерево" },
  { id: "laminate", label: "Ламинат" },
  { id: "brick", label: "Кирпич" },
  { id: "concrete", label: "Бетон" },
];
