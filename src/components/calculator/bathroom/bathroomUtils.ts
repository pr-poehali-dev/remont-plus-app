import type { BathroomConfig } from "./BathroomTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcBathroom } from "./bathroomEngine";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export interface BathroomPriceBreakdown {
  demolitionCost: number;
  cabinDemolitionCost: number;
  cabinConstructionCost: number;
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

/**
 * Совместимая обёртка над единым движком calcBathroom.
 * Все суммы по блокам — это строгая сумма детальных позиций (норма × цена 2026).
 */
export function calcBathroomPrice(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): BathroomPriceBreakdown {
  const e = calcBathroom(cfg, regionId, markupPct);
  const b = e.blockTotals;
  return {
    demolitionCost: b.demolition,
    cabinDemolitionCost: b.cabinDemolition,
    cabinConstructionCost: b.cabinConstruction,
    screedCost: b.screed,
    waterproofingCost: b.waterproofing,
    floorTileCost: b.floorTile,
    wallTileCost: b.wallTile,
    plumbingCost: b.plumbing,
    heatedFloorCost: b.heatedFloor,
    furnitureCost: b.furniture,
    accessoriesCost: b.accessories,
    ventilationCost: b.ventilation,
    materialsCost: e.materialsTotal,
    subtotal: e.subtotal,
    regionCoeff: e.regionCoeff,
    markupAmount: e.markupAmount,
    total: e.total,
  };
}

/** Детальная ведомость МАТЕРИАЛОВ + работ (для MaterialsTable). */
export function calcBathroomMaterials(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  _bd: BathroomPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcBathroom(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcBathroomWorks(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  _bd: BathroomPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcBathroom(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
