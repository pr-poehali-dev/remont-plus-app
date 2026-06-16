import type { FlooringConfig } from "./FlooringTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcFlooring } from "./flooringEngine";

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const DEFAULT_CONFIG: Omit<FlooringConfig, "id" | "totalPrice"> = {
  roomName: "",
  length: 5,
  width: 4,
  area: 20,
  perimeter: 18,
  productId: "lam-quick-step-33",
  substrateId: "xps-3",
  patternId: "straight",
  skirtingId: "mdf-60",
  skirtingIncluded: true,
  demolitionIncluded: false,
  levelingIncluded: false,
  levelingThicknessMm: 30,
  thresholdCount: 1,
};

export interface PriceBreakdown {
  materialQty: number;
  materialCost: number;
  substrateCost: number;
  installCost: number;
  skirtingCost: number;
  demolitionCost: number;
  levelingCost: number;
  thresholdCost: number;
  materialsCost: number;
  worksCost: number;
  total: number;
  pricePerM2: number;
}

/**
 * Совместимая обёртка над единым движком calcFlooring.
 * Все суммы по блокам — это строгая сумма детальных позиций (норма × цена 2026).
 * materialsCost = все материалы (покрытие + подложка + плинтус + пороги + расходники),
 * worksCost = все работы. materialsCost + worksCost = subtotal (без наценки).
 */
export function calcFlooringPrice(
  cfg: Omit<FlooringConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): PriceBreakdown {
  const e = calcFlooring(cfg, regionId, markupPct);
  const b = e.blockTotals;
  const area = cfg.area || 0;
  return {
    materialQty: e.materialQty,
    materialCost: b.material,
    substrateCost: b.substrate,
    installCost: b.install,
    skirtingCost: b.skirting,
    demolitionCost: b.demolition,
    levelingCost: b.leveling,
    thresholdCost: b.threshold,
    materialsCost: e.materialsTotal,
    worksCost: e.worksTotal,
    total: e.total,
    pricePerM2: area > 0 ? Math.round(e.total / area) : 0,
  };
}

/** Детальная ведомость МАТЕРИАЛОВ + работ (для MaterialsTable). */
export function calcFlooringMaterials(
  cfg: Omit<FlooringConfig, "id" | "totalPrice">,
  _bd: PriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcFlooring(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcFlooringWorks(
  cfg: Omit<FlooringConfig, "id" | "totalPrice">,
  _bd: PriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcFlooring(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
