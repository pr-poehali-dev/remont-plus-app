import {
  type Subcategory,
  categories,
} from "@/lib/lemanapro-data";

export type AreaType = "floor" | "wall" | "ceiling";

export interface Room {
  id: string;
  name: string;
  length: string;
  width: string;
  height: string;
  doors: string;
  windows: string;
}

export interface MaterialNorm {
  subcategory: string;
  consumptionPer: string;
  rate: number;
  area: AreaType;
  note: string;
}

export interface ApartmentPreset {
  label: string;
  icon: string;
  area: string;
  rooms: Omit<Room, "id">[];
}

export interface AreaTotals {
  floor: number;
  wall: number;
  ceiling: number;
  validCount: number;
  hasValid: boolean;
}

export const materialNorms: MaterialNorm[] = [
  { subcategory: "Ламинат", consumptionPer: "м²", rate: 1.1, area: "floor", note: "+10% на подрезку" },
  { subcategory: "Линолеум", consumptionPer: "м²", rate: 1.05, area: "floor", note: "+5% на подрезку" },
  { subcategory: "Керамогранит", consumptionPer: "м²", rate: 1.1, area: "floor", note: "+10% на подрезку" },
  { subcategory: "Подложка под напольные покрытия", consumptionPer: "м²", rate: 1.05, area: "floor", note: "+5% запас" },
  { subcategory: "Клей для плитки", consumptionPer: "кг", rate: 5, area: "floor", note: "5 кг/м² пола" },
  { subcategory: "Настенная плитка", consumptionPer: "м²", rate: 1.1, area: "wall", note: "+10% на подрезку" },
  { subcategory: "Виниловые обои", consumptionPer: "рулон", rate: 0.2, area: "wall", note: "~5 м² на рулон" },
  { subcategory: "Флизелиновые обои", consumptionPer: "рулон", rate: 0.2, area: "wall", note: "~5 м² на рулон" },
  { subcategory: "Обои под покраску", consumptionPer: "рулон", rate: 0.2, area: "wall", note: "~5 м² на рулон" },
  { subcategory: "Клей для обоев", consumptionPer: "упак", rate: 0.04, area: "wall", note: "1 упак на 25 м²" },
  { subcategory: "Интерьерные краски", consumptionPer: "л", rate: 0.25, area: "wall", note: "0.25 л/м² (2 слоя)" },
  { subcategory: "Грунтовки", consumptionPer: "л", rate: 0.15, area: "wall", note: "0.15 л/м²" },
  { subcategory: "Интерьерные краски", consumptionPer: "л", rate: 0.25, area: "ceiling", note: "0.25 л/м² потолок" },
  { subcategory: "Сухие смеси и грунтовки", consumptionPer: "кг", rate: 10, area: "wall", note: "10 кг/м² стен" },
  { subcategory: "Затирки", consumptionPer: "кг", rate: 0.3, area: "floor", note: "0.3 кг/м²" },
];

export const areaLabels: Record<AreaType, string> = {
  floor: "Пол",
  wall: "Стены",
  ceiling: "Потолок",
};

export const areaIcons: Record<AreaType, string> = {
  floor: "Layers",
  wall: "PanelLeft",
  ceiling: "ArrowUpFromLine",
};

const defaultRoomNames = [
  "Комната 1", "Комната 2", "Комната 3", "Кухня", "Коридор",
  "Ванная", "Санузел", "Спальня", "Гостиная", "Детская",
];

export const presets: ApartmentPreset[] = [
  {
    label: "Студия",
    icon: "Square",
    area: "~28 м²",
    rooms: [
      { name: "Студия", length: "6", width: "3.5", height: "2.7", doors: "1", windows: "1" },
      { name: "Санузел", length: "2.2", width: "1.5", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "3", width: "1.2", height: "2.7", doors: "1", windows: "0" },
    ],
  },
  {
    label: "Однушка",
    icon: "LayoutGrid",
    area: "~38 м²",
    rooms: [
      { name: "Комната", length: "5", width: "3.5", height: "2.7", doors: "1", windows: "1" },
      { name: "Кухня", length: "3.5", width: "2.8", height: "2.7", doors: "1", windows: "1" },
      { name: "Ванная", length: "2.2", width: "1.5", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "4", width: "1.3", height: "2.7", doors: "2", windows: "0" },
    ],
  },
  {
    label: "Двушка",
    icon: "Columns2",
    area: "~54 м²",
    rooms: [
      { name: "Гостиная", length: "5.5", width: "3.5", height: "2.7", doors: "1", windows: "1" },
      { name: "Спальня", length: "4", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Кухня", length: "3.5", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Ванная", length: "2.5", width: "1.7", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "5", width: "1.4", height: "2.7", doors: "3", windows: "0" },
    ],
  },
  {
    label: "Трёшка",
    icon: "Columns3",
    area: "~72 м²",
    rooms: [
      { name: "Гостиная", length: "5.5", width: "4", height: "2.7", doors: "1", windows: "1" },
      { name: "Спальня", length: "4.5", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Детская", length: "4", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Кухня", length: "4", width: "3", height: "2.7", doors: "1", windows: "1" },
      { name: "Ванная", length: "2.5", width: "1.7", height: "2.7", doors: "1", windows: "0" },
      { name: "Коридор", length: "6", width: "1.5", height: "2.7", doors: "4", windows: "0" },
    ],
  },
];

export function makeRoom(index: number): Room {
  return {
    id: `room_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    name: defaultRoomNames[index] || `Комната ${index + 1}`,
    length: "",
    width: "",
    height: "2.7",
    doors: "1",
    windows: "1",
  };
}

export function roomAreas(room: Room) {
  const l = parseFloat(room.length) || 0;
  const w = parseFloat(room.width) || 0;
  const h = parseFloat(room.height) || 0;
  const d = parseInt(room.doors) || 0;
  const win = parseInt(room.windows) || 0;
  const floor = l * w;
  const wall = Math.max(0, 2 * (l + w) * h - d * 1.8 - win * 1.5);
  return { floor, wall, ceiling: floor, valid: l > 0 && w > 0 && h > 0 };
}

export function normId(norm: MaterialNorm): string {
  return `${norm.subcategory}__${norm.area}`;
}

export function findSubcategoryData(name: string): Subcategory | undefined {
  for (const cat of categories) {
    const found = cat.subcategories.find((s) => s.name === name);
    if (found) return found;
  }
  return undefined;
}

export function findCategoryName(subcategoryName: string): string {
  for (const cat of categories) {
    if (cat.subcategories.some((s) => s.name === subcategoryName)) {
      return cat.name;
    }
  }
  return "Прочее";
}

export function calcTotals(rooms: Room[]): AreaTotals {
  let floor = 0, wall = 0, ceiling = 0, validCount = 0;
  for (const room of rooms) {
    const a = roomAreas(room);
    if (a.valid) {
      floor += a.floor;
      wall += a.wall;
      ceiling += a.ceiling;
      validCount++;
    }
  }
  return { floor, wall, ceiling, validCount, hasValid: validCount > 0 };
}

export function calcQuantity(norm: MaterialNorm, areaByType: Record<AreaType, number>): number {
  const area = areaByType[norm.area];
  return Math.ceil(area * norm.rate * 100) / 100;
}

export function groupNorms(): Record<AreaType, MaterialNorm[]> {
  const groups: Record<AreaType, MaterialNorm[]> = { floor: [], wall: [], ceiling: [] };
  for (const norm of materialNorms) {
    groups[norm.area].push(norm);
  }
  return groups;
}

const ROOMS_STORAGE_KEY = "avangard_calc_rooms";

export function saveRooms(rooms: Room[]) {
  try {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch { /* ignore */ }
}

export function loadRooms(): Room[] | null {
  try {
    const raw = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}