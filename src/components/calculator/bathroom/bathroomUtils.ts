import { REGIONS, BATHROOM_TYPES, FLOOR_TILES, WALL_TILES, WATERPROOFING_TYPES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";

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
    ? Math.round((area * 2200 + wallArea * 900) * rc)
    : 0;

  // Стяжка
  const screedCost = cfg.screedIncluded
    ? Math.round(area * 1600 * rc)
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
  if (cfg.toiletInstall) plumbingBase += 4500;
  if (cfg.sinkInstall) plumbingBase += 3500;
  if (cfg.bathInstall) plumbingBase += 7000;
  if (cfg.showerCabinInstall) plumbingBase += 8500;
  plumbingBase += cfg.mixersCount * 2500;
  if (cfg.installationSystemIncluded) plumbingBase += 12000;
  const plumbingCost = Math.round(plumbingBase * rc);

  // Тёплый пол
  let heatedFloorCost = 0;
  if (cfg.heatedFloorIncluded) {
    const basePerM2 = cfg.heatedFloorType === "electric" ? 2200 : 3500;
    heatedFloorCost = Math.round(area * basePerM2 * rc);
  }

  // Вентиляция
  const ventilationCost = cfg.ventilationIncluded ? Math.round(3200 * rc) : 0;

  // Мебель и аксессуары
  let furnitureBase = 0;
  if (cfg.vanityInstall) furnitureBase += 4000;
  if (cfg.mirrorInstall) furnitureBase += 2500;
  const furnitureCost = Math.round(furnitureBase * rc);

  const accessoriesCost = cfg.accessoriesIncluded ? Math.round(2800 * rc) : 0;

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