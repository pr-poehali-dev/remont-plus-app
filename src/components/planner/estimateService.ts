import type { Wall, PlacedFurniture } from "./plannerTypes";
import type { FurnitureItem } from "./furnitureCatalog";
import { FURNITURE_CATALOG } from "./furnitureCatalog";

const catalogMap = new Map(FURNITURE_CATALOG.map((i) => [i.id, i]));

export interface EstimateLine {
  name: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface EstimateSection {
  title: string;
  lines: EstimateLine[];
  subtotal: number;
}

export interface RoomMetrics {
  totalWallLength: number;
  wallArea: number;
  floorArea: number;
  ceilingArea: number;
  perimeter: number;
  doorCount: number;
  windowCount: number;
  windowArea: number;
  doorArea: number;
}

export interface FullEstimate {
  metrics: RoomMetrics;
  sections: EstimateSection[];
  furnitureSection: EstimateSection | null;
  grandTotal: number;
  date: string;
}

function wallLength(w: Wall): number {
  const dx = w.end.x - w.start.x;
  const dy = w.end.y - w.start.y;
  return Math.sqrt(dx * dx + dy * dy);
}

function computeFloorArea(walls: Wall[]): number {
  if (walls.length < 3) return 0;

  const points: { x: number; y: number }[] = [];
  const visited = new Set<string>();

  function ptKey(x: number, y: number) {
    return `${Math.round(x)}_${Math.round(y)}`;
  }

  for (const w of walls) {
    const ks = ptKey(w.start.x, w.start.y);
    if (!visited.has(ks)) {
      visited.add(ks);
      points.push({ x: w.start.x, y: w.start.y });
    }
    const ke = ptKey(w.end.x, w.end.y);
    if (!visited.has(ke)) {
      visited.add(ke);
      points.push({ x: w.end.x, y: w.end.y });
    }
  }

  if (points.length < 3) return 0;

  const cx = points.reduce((s, p) => s + p.x, 0) / points.length;
  const cy = points.reduce((s, p) => s + p.y, 0) / points.length;

  points.sort(
    (a, b) =>
      Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  );

  let area = 0;
  for (let i = 0; i < points.length; i++) {
    const j = (i + 1) % points.length;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area) / 2;
}

export function computeMetrics(
  walls: Wall[],
  ceilingHeight: number
): RoomMetrics {
  let totalWallLength = 0;
  let doorCount = 0;
  let windowCount = 0;
  let doorArea = 0;
  let windowArea = 0;

  for (const w of walls) {
    const len = wallLength(w);
    totalWallLength += len;

    for (const op of w.openings) {
      if (op.type === "door") {
        doorCount++;
        doorArea += (op.width / 1000) * 2.1;
      } else {
        windowCount++;
        windowArea += (op.width / 1000) * 1.5;
      }
    }
  }

  const perimeterMm = totalWallLength;
  const wallAreaMm2 =
    totalWallLength * ceilingHeight - doorArea * 1_000_000 - windowArea * 1_000_000;
  const floorAreaMm2 = computeFloorArea(walls);

  return {
    totalWallLength: perimeterMm / 1000,
    wallArea: Math.max(0, wallAreaMm2 / 1_000_000),
    floorArea: floorAreaMm2 / 1_000_000,
    ceilingArea: floorAreaMm2 / 1_000_000,
    perimeter: perimeterMm / 1000,
    doorCount,
    windowCount,
    windowArea,
    doorArea,
  };
}

function furniturePrice(item: FurnitureItem): number {
  const vol = (item.width * item.depth * item.height) / 1e9;
  const base = vol * 15000;
  return Math.round(Math.max(3000, base) / 100) * 100;
}

export function buildEstimate(
  walls: Wall[],
  furniture: PlacedFurniture[],
  ceilingHeight: number
): FullEstimate {
  const m = computeMetrics(walls, ceilingHeight);
  const sections: EstimateSection[] = [];

  const wallSection: EstimateLine[] = [];
  if (m.wallArea > 0) {
    const plasterBags = Math.ceil((m.wallArea * 10) / 30);
    wallSection.push({
      name: "Штукатурка гипсовая (30 кг)",
      unit: "мешок",
      quantity: plasterBags,
      pricePerUnit: 420,
      total: plasterBags * 420,
    });
    const puttyBags = Math.ceil((m.wallArea * 3) / 20);
    wallSection.push({
      name: "Шпатлёвка финишная (20 кг)",
      unit: "мешок",
      quantity: puttyBags,
      pricePerUnit: 580,
      total: puttyBags * 580,
    });
    const primerCans = Math.ceil(m.wallArea / 50);
    wallSection.push({
      name: "Грунтовка глубокого проникновения (10 л)",
      unit: "канистра",
      quantity: primerCans,
      pricePerUnit: 650,
      total: primerCans * 650,
    });
    const wallpaperRolls = Math.ceil(m.wallArea / 5);
    wallSection.push({
      name: "Обои флизелиновые (рулон 10 м)",
      unit: "рулон",
      quantity: wallpaperRolls,
      pricePerUnit: 1500,
      total: wallpaperRolls * 1500,
    });
    const corners = Math.ceil(m.perimeter / 3) * 2;
    wallSection.push({
      name: "Уголок перфорированный (3 м)",
      unit: "шт",
      quantity: corners,
      pricePerUnit: 45,
      total: corners * 45,
    });
  }
  if (wallSection.length > 0) {
    const sub = wallSection.reduce((s, l) => s + l.total, 0);
    sections.push({ title: "Стены", lines: wallSection, subtotal: sub });
  }

  const floorSection: EstimateLine[] = [];
  if (m.floorArea > 0) {
    const screedBags = Math.ceil((m.floorArea * 20) / 25);
    floorSection.push({
      name: "Стяжка для пола (25 кг)",
      unit: "мешок",
      quantity: screedBags,
      pricePerUnit: 350,
      total: screedBags * 350,
    });
    const substratePacks = Math.ceil(m.floorArea / 15);
    floorSection.push({
      name: "Подложка под ламинат (рулон 15 м\u00B2)",
      unit: "рулон",
      quantity: substratePacks,
      pricePerUnit: 650,
      total: substratePacks * 650,
    });
    const laminatePacks = Math.ceil((m.floorArea * 1.1) / 2.1);
    floorSection.push({
      name: "Ламинат 33 класс (1 уп = 2.1 м\u00B2)",
      unit: "уп",
      quantity: laminatePacks,
      pricePerUnit: 1400,
      total: laminatePacks * 1400,
    });
    const plinthPcs = Math.ceil(m.perimeter / 2.5);
    floorSection.push({
      name: "Плинтус напольный (2.5 м)",
      unit: "шт",
      quantity: plinthPcs,
      pricePerUnit: 280,
      total: plinthPcs * 280,
    });
  }
  if (floorSection.length > 0) {
    const sub = floorSection.reduce((s, l) => s + l.total, 0);
    sections.push({ title: "Пол", lines: floorSection, subtotal: sub });
  }

  const ceilingSection: EstimateLine[] = [];
  if (m.ceilingArea > 0) {
    const ceilM2 = Math.ceil(m.ceilingArea);
    ceilingSection.push({
      name: "Натяжной потолок (1 м\u00B2)",
      unit: "м\u00B2",
      quantity: ceilM2,
      pricePerUnit: 450,
      total: ceilM2 * 450,
    });
  }
  if (ceilingSection.length > 0) {
    const sub = ceilingSection.reduce((s, l) => s + l.total, 0);
    sections.push({ title: "Потолок", lines: ceilingSection, subtotal: sub });
  }

  const openingsSection: EstimateLine[] = [];
  if (m.doorCount > 0) {
    openingsSection.push({
      name: "Дверь межкомнатная с коробкой",
      unit: "шт",
      quantity: m.doorCount,
      pricePerUnit: 8500,
      total: m.doorCount * 8500,
    });
    openingsSection.push({
      name: "Ручка дверная комплект",
      unit: "шт",
      quantity: m.doorCount,
      pricePerUnit: 1200,
      total: m.doorCount * 1200,
    });
  }
  if (m.windowCount > 0) {
    const windowM2 = Math.ceil(m.windowArea);
    openingsSection.push({
      name: "Окно ПВХ двухкамерное (1 м\u00B2)",
      unit: "м\u00B2",
      quantity: Math.max(1, windowM2),
      pricePerUnit: 7200,
      total: Math.max(1, windowM2) * 7200,
    });
    openingsSection.push({
      name: "Герметик силиконовый",
      unit: "шт",
      quantity: m.windowCount,
      pricePerUnit: 350,
      total: m.windowCount * 350,
    });
  }
  if (openingsSection.length > 0) {
    const sub = openingsSection.reduce((s, l) => s + l.total, 0);
    sections.push({
      title: "Двери и окна",
      lines: openingsSection,
      subtotal: sub,
    });
  }

  let furnitureSection: EstimateSection | null = null;
  if (furniture.length > 0) {
    const counts = new Map<string, number>();
    for (const f of furniture) {
      counts.set(f.itemId, (counts.get(f.itemId) || 0) + 1);
    }
    const lines: EstimateLine[] = [];
    for (const [itemId, qty] of counts) {
      const cat = catalogMap.get(itemId);
      if (!cat) continue;
      const price = furniturePrice(cat);
      lines.push({
        name: cat.name,
        unit: "шт",
        quantity: qty,
        pricePerUnit: price,
        total: qty * price,
      });
    }
    if (lines.length > 0) {
      const sub = lines.reduce((s, l) => s + l.total, 0);
      furnitureSection = {
        title: "Мебель (ориентировочно)",
        lines,
        subtotal: sub,
      };
    }
  }

  const materialsTotal = sections.reduce((s, sec) => s + sec.subtotal, 0);
  const furnitureTotal = furnitureSection?.subtotal || 0;

  const now = new Date();
  const date = now.toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return {
    metrics: m,
    sections,
    furnitureSection,
    grandTotal: materialsTotal + furnitureTotal,
    date,
  };
}

export default buildEstimate;