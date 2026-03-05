import { REGIONS, BATHROOM_TYPES, FLOOR_TILES, WALL_TILES, WATERPROOFING_TYPES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export interface BathroomPriceBreakdown {
  demolitionCost: number;
  screedCost: number;
  waterproofingCost: number;
  floorTileCost: number;
  wallTileCost: number;
  plumbingCost: number;
  heatedFloorCost: number;
  furnitureCost: number;
  accessoriesCost: number;
  ventilationCost: number;
  materialsCost: number;
  subtotal: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

export function calcBathroomPrice(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0
): BathroomPriceBreakdown {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const bathroomType = BATHROOM_TYPES.find(b => b.id === cfg.bathroomType);
  const floorTile = FLOOR_TILES.find(t => t.id === cfg.floorTileId);
  const wallTile = WALL_TILES.find(t => t.id === cfg.wallTileId);
  const waterproofing = WATERPROOFING_TYPES.find(w => w.id === cfg.waterproofingType);

  const rc = region.coeff;
  const typeCoeff = bathroomType?.priceCoeff ?? 1.0;
  const area = cfg.area || 0;
  const wallArea = cfg.wallArea || 0;

  // Демонтаж
  const demolitionCost = cfg.demolitionIncluded
    ? Math.round((area * 3700 + wallArea * 1550) * rc)
    : 0;

  // Стяжка
  const screedCost = cfg.screedIncluded
    ? Math.round(area * 2700 * rc)
    : 0;

  // Гидроизоляция
  const waterproofingCost = waterproofing && waterproofing.id !== "none"
    ? Math.round((area + wallArea * 0.3) * waterproofing.priceM2 * rc)
    : 0;

  // Плитка пол (материал + укладка)
  const floorMaterialCost = Math.round(area * 1.1 * (floorTile?.materialPriceM2 ?? 0));
  const floorInstallCost = Math.round(area * (floorTile?.installPriceM2 ?? 0) * typeCoeff * rc);
  const floorTileCost = floorMaterialCost + floorInstallCost;

  // Плитка стены (материал + укладка)
  const wallMaterialCost = Math.round(wallArea * 1.1 * (wallTile?.materialPriceM2 ?? 0));
  const wallInstallCost = Math.round(wallArea * (wallTile?.installPriceM2 ?? 0) * typeCoeff * rc);
  const wallTileCost = wallMaterialCost + wallInstallCost;

  // Сантехника
  let plumbingBase = 0;
  if (cfg.toiletInstall) plumbingBase += 21000;
  if (cfg.sinkInstall) plumbingBase += 14500;
  if (cfg.bathInstall) plumbingBase += 36000;
  if (cfg.showerCabinInstall) plumbingBase += 49000;
  plumbingBase += cfg.mixersCount * 7800;
  if (cfg.installationSystemIncluded) plumbingBase += 36000;
  const plumbingCost = Math.round(plumbingBase * rc);

  // Тёплый пол
  let heatedFloorCost = 0;
  if (cfg.heatedFloorIncluded) {
    const basePerM2 = cfg.heatedFloorType === "electric" ? 3700 : 5800;
    heatedFloorCost = Math.round(area * basePerM2 * rc);
  }

  // Вентиляция
  const ventilationCost = cfg.ventilationIncluded ? Math.round(5800 * rc) : 0;

  // Мебель и аксессуары
  let furnitureBase = 0;
  if (cfg.vanityInstall) furnitureBase += 20500;
  if (cfg.mirrorInstall) furnitureBase += 9000;
  const furnitureCost = Math.round(furnitureBase * rc);

  const accessoriesCost = cfg.accessoriesIncluded ? Math.round(4900 * rc) : 0;

  const subtotal =
    demolitionCost +
    screedCost +
    waterproofingCost +
    floorTileCost +
    wallTileCost +
    plumbingCost +
    heatedFloorCost +
    ventilationCost +
    furnitureCost +
    accessoriesCost;

  // Материальная составляющая по каждой статье
  const materialsCost = Math.round(
    demolitionCost      * 0.00 +
    screedCost          * 0.55 + // смеси для стяжки
    waterproofingCost   * 0.60 + // гидроизоляционные материалы
    floorMaterialCost             + // вся стоимость плитки пола — материал
    wallMaterialCost              + // вся стоимость плитки стен — материал
    plumbingCost        * 0.50 + // сантехнические приборы (50% — установка)
    heatedFloorCost     * 0.60 + // кабель/плёнка тёплого пола
    ventilationCost     * 0.40 + // вентилятор и фурнитура
    furnitureCost       * 0.00 + // только монтаж (мебель куплена отдельно)
    accessoriesCost     * 0.70   // аксессуары — почти полностью материалы
  );

  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  return {
    demolitionCost,
    screedCost,
    waterproofingCost,
    floorTileCost,
    wallTileCost,
    plumbingCost,
    heatedFloorCost,
    furnitureCost,
    accessoriesCost,
    ventilationCost,
    materialsCost,
    subtotal,
    regionCoeff: rc,
    markupAmount,
    total,
  };
}

export function calcBathroomMaterials(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  bd: BathroomPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;
  const tc = BATHROOM_TYPES.find(b => b.id === cfg.bathroomType)?.priceCoeff ?? 1.0;
  const floorTile = FLOOR_TILES.find(t => t.id === cfg.floorTileId);
  const wallTile  = WALL_TILES.find(t => t.id === cfg.wallTileId);
  const waterproofing = WATERPROOFING_TYPES.find(w => w.id === cfg.waterproofingType);

  const area     = cfg.area || 0;
  const wallArea = cfg.wallArea || 0;
  const items: MaterialItem[] = [];

  // ── МАТЕРИАЛЫ: Плитка пола ───────────────────────────────────────────────
  if (floorTile && bd.floorTileCost > 0) {
    const floorMatCost = Math.round(area * 1.1 * floorTile.materialPriceM2);
    items.push({
      name: `Плитка пол: ${floorTile.label}`,
      spec: floorTile.description,
      unit: "м²",
      qty: Math.round(area * 1.1 * 10) / 10,
      pricePerUnit: floorTile.materialPriceM2,
      total: floorMatCost,
    });
    items.push({
      name: "Клей плиточный (пол)",
      spec: "C2 класс, эластичный",
      unit: "кг",
      qty: Math.ceil(area * 6),
      pricePerUnit: 38,
      total: Math.ceil(area * 6) * 38,
      isConsumable: true,
    });
    items.push({
      name: "Затирка межплиточных швов (пол)",
      spec: "влагостойкая, фугу",
      unit: "кг",
      qty: Math.ceil(area * 0.5),
      pricePerUnit: 230,
      total: Math.ceil(area * 0.5) * 230,
      isConsumable: true,
    });
  }

  // ── МАТЕРИАЛЫ: Плитка стен ───────────────────────────────────────────────
  if (wallTile && bd.wallTileCost > 0) {
    const wallMatCost = Math.round(wallArea * 1.1 * wallTile.materialPriceM2);
    items.push({
      name: `Плитка стены: ${wallTile.label}`,
      spec: wallTile.description,
      unit: "м²",
      qty: Math.round(wallArea * 1.1 * 10) / 10,
      pricePerUnit: wallTile.materialPriceM2,
      total: wallMatCost,
    });
    items.push({
      name: "Клей плиточный (стены)",
      spec: "C1/C2, белый",
      unit: "кг",
      qty: Math.ceil(wallArea * 5),
      pricePerUnit: 38,
      total: Math.ceil(wallArea * 5) * 38,
      isConsumable: true,
    });
    items.push({
      name: "Затирка межплиточных швов (стены)",
      spec: "влагостойкая",
      unit: "кг",
      qty: Math.ceil(wallArea * 0.4),
      pricePerUnit: 230,
      total: Math.ceil(wallArea * 0.4) * 230,
      isConsumable: true,
    });
  }

  // ── МАТЕРИАЛЫ: Гидроизоляция ─────────────────────────────────────────────
  if (waterproofing && waterproofing.id !== "none" && bd.waterproofingCost > 0) {
    const hydroArea = area + wallArea * 0.3;
    const hydroMat = Math.round(hydroArea * waterproofing.priceM2 * 0.6);
    items.push({
      name: `Гидроизоляция: ${waterproofing.label}`,
      unit: "м²",
      qty: Math.round(hydroArea * 10) / 10,
      pricePerUnit: Math.round(waterproofing.priceM2 * 0.6),
      total: hydroMat,
    });
  }

  // ── МАТЕРИАЛЫ: Стяжка ────────────────────────────────────────────────────
  if (cfg.screedIncluded && bd.screedCost > 0) {
    const screedKg = Math.ceil(area * 20);
    items.push({
      name: "Цементно-песчаная смесь (стяжка)",
      spec: "М150/М200",
      unit: "кг",
      qty: screedKg,
      pricePerUnit: 12,
      total: screedKg * 12,
    });
    items.push({
      name: "Грунтовка глубокого проникновения",
      unit: "л",
      qty: Math.ceil(area * 0.2),
      pricePerUnit: 120,
      total: Math.ceil(area * 0.2) * 120,
      isConsumable: true,
    });
  }

  // ── МАТЕРИАЛЫ: Тёплый пол ────────────────────────────────────────────────
  if (cfg.heatedFloorIncluded && bd.heatedFloorCost > 0) {
    if (cfg.heatedFloorType === "electric") {
      items.push({
        name: "Нагревательный кабель / мат",
        spec: `~${Math.round(area * 150)} Вт, ${area} м²`,
        unit: "м²",
        qty: area,
        pricePerUnit: Math.round(2800 * 0.6 * rc),
        total: Math.round(area * 2800 * 0.6 * rc),
      });
      items.push({
        name: "Терморегулятор",
        spec: "программируемый",
        unit: "шт.",
        qty: 1,
        pricePerUnit: Math.round(3600 * rc),
        total: Math.round(3600 * rc),
      });
    } else {
      items.push({
        name: "Труба тёплого пола ∅16 PE-Xa",
        unit: "м.п.",
        qty: Math.ceil(area * 8),
        pricePerUnit: 82,
        total: Math.ceil(area * 8) * 82,
      });
      items.push({
        name: "Коллектор водяного тёплого пола",
        unit: "шт.",
        qty: 1,
        pricePerUnit: Math.round(11000 * rc),
        total: Math.round(11000 * rc),
      });
    }
  }

  // ── МАТЕРИАЛЫ: Вентиляция ────────────────────────────────────────────────
  if (cfg.ventilationIncluded && bd.ventilationCost > 0) {
    items.push({
      name: "Вентилятор вытяжной",
      spec: "IP44, 100 мм, таймер",
      unit: "шт.",
      qty: 1,
      pricePerUnit: Math.round(4200 * 0.40 * rc),
      total: Math.round(4200 * 0.40 * rc),
    });
  }

  // ── МАТЕРИАЛЫ: Аксессуары ────────────────────────────────────────────────
  if (cfg.accessoriesIncluded && bd.accessoriesCost > 0) {
    items.push({
      name: "Набор аксессуаров (полотенцедержатель, крючки, мыльница)",
      unit: "компл.",
      qty: 1,
      pricePerUnit: Math.round(3600 * 0.70 * rc),
      total: Math.round(3600 * 0.70 * rc),
    });
  }

  // ── РАСХОДНИКИ ───────────────────────────────────────────────────────────
  if ((floorTile || wallTile) && (area + wallArea) > 0) {
    items.push({
      name: "Крестики, клинья, уголки для плитки",
      unit: "уп.",
      qty: Math.ceil((area + wallArea) / 5),
      pricePerUnit: 115,
      total: Math.ceil((area + wallArea) / 5) * 115,
      isConsumable: true,
    });
    items.push({
      name: "Силиконовый герметик (санитарный)",
      spec: "для швов плинтуса и ванны",
      unit: "шт.",
      qty: 2,
      pricePerUnit: 360,
      total: 720,
      isConsumable: true,
    });
  }
  if (cfg.screedIncluded) {
    items.push({
      name: "Маяки для стяжки, плёнка",
      unit: "компл.",
      qty: 1,
      pricePerUnit: Math.ceil(area * 45),
      total: Math.ceil(area * 45),
      isConsumable: true,
    });
  }

  // ── РАБОТЫ ───────────────────────────────────────────────────────────────
  if (cfg.demolitionIncluded && bd.demolitionCost > 0) {
    items.push({
      name: "Демонтаж плитки пола и стен",
      unit: "м²",
      qty: area + wallArea,
      pricePerUnit: Math.round((area * 2800 + wallArea * 1150) / (area + wallArea) * rc),
      total: bd.demolitionCost,
      isWork: true,
    });
  }
  if (cfg.screedIncluded && bd.screedCost > 0) {
    items.push({
      name: "Устройство стяжки",
      unit: "м²",
      qty: area,
      pricePerUnit: Math.round(2050 * 0.45 * rc),
      total: Math.round(area * 2050 * 0.45 * rc),
      isWork: true,
    });
  }
  if (waterproofing && waterproofing.id !== "none" && bd.waterproofingCost > 0) {
    const hydroArea = area + wallArea * 0.3;
    items.push({
      name: "Нанесение гидроизоляции",
      unit: "м²",
      qty: Math.round(hydroArea * 10) / 10,
      pricePerUnit: Math.round(waterproofing.priceM2 * 0.4 * rc),
      total: Math.round(hydroArea * waterproofing.priceM2 * 0.4 * rc),
      isWork: true,
    });
  }
  if (floorTile && bd.floorTileCost > 0) {
    items.push({
      name: `Укладка плитки пола`,
      spec: floorTile.label,
      unit: "м²",
      qty: area,
      pricePerUnit: Math.round(floorTile.installPriceM2 * tc * rc),
      total: Math.round(area * floorTile.installPriceM2 * tc * rc),
      isWork: true,
    });
  }
  if (wallTile && bd.wallTileCost > 0) {
    items.push({
      name: "Укладка плитки стен",
      spec: wallTile.label,
      unit: "м²",
      qty: wallArea,
      pricePerUnit: Math.round(wallTile.installPriceM2 * tc * rc),
      total: Math.round(wallArea * wallTile.installPriceM2 * tc * rc),
      isWork: true,
    });
  }
  if (bd.plumbingCost > 0) {
    if (cfg.toiletInstall) items.push({ name: "Установка унитаза", unit: "шт.", qty: 1, pricePerUnit: Math.round(5800 * rc), total: Math.round(5800 * rc), isWork: true });
    if (cfg.sinkInstall)   items.push({ name: "Установка раковины", unit: "шт.", qty: 1, pricePerUnit: Math.round(4500 * rc), total: Math.round(4500 * rc), isWork: true });
    if (cfg.bathInstall)   items.push({ name: "Установка ванны", unit: "шт.", qty: 1, pricePerUnit: Math.round(9000 * rc), total: Math.round(9000 * rc), isWork: true });
    if (cfg.showerCabinInstall) items.push({ name: "Установка душевой кабины", unit: "шт.", qty: 1, pricePerUnit: Math.round(11000 * rc), total: Math.round(11000 * rc), isWork: true });
    if (cfg.mixersCount > 0) items.push({ name: "Установка смесителей", unit: "шт.", qty: cfg.mixersCount, pricePerUnit: Math.round(3200 * rc), total: Math.round(cfg.mixersCount * 3200 * rc), isWork: true });
  }
  if (cfg.heatedFloorIncluded && bd.heatedFloorCost > 0) {
    items.push({ name: "Монтаж тёплого пола", unit: "м²", qty: area, pricePerUnit: Math.round(bd.heatedFloorCost * 0.4 / area), total: Math.round(bd.heatedFloorCost * 0.4), isWork: true });
  }
  if (cfg.ventilationIncluded && bd.ventilationCost > 0) {
    items.push({ name: "Монтаж вентилятора", unit: "шт.", qty: 1, pricePerUnit: Math.round(4200 * 0.60 * rc), total: Math.round(4200 * 0.60 * rc), isWork: true });
  }

  return items;
}