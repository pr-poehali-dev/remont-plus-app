import type { ElectricsConfig } from "./ElectricsTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcElectrics } from "./electricsEngine";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export interface ElectricsPriceBreakdown {
  outletsCost: number;
  switchesCost: number;
  lightingCost: number;
  cablingCost: number;
  panelCost: number;
  groundingCost: number;
  testingCost: number;
  materialsCost: number;
  worksCost: number;
  subtotal: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

/**
 * Совместимая обёртка над единым движком calcElectrics.
 * Все суммы по блокам — это строгая сумма детальных позиций (норма × цена 2026).
 * *Cost = сумма работ + материалов блока, materialsCost = сумма всех материалов,
 * worksCost = сумма всех работ, subtotal = worksCost + materialsCost.
 */
export function calcElectricsPrice(
  cfg: Omit<ElectricsConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): ElectricsPriceBreakdown {
  const e = calcElectrics(cfg, regionId, markupPct);
  const b = e.blockTotals;
  return {
    outletsCost: b.outlets,
    switchesCost: b.switches,
    lightingCost: b.lighting,
    cablingCost: b.cabling,
    panelCost: b.panel,
    groundingCost: b.grounding,
    testingCost: b.testing,
    materialsCost: e.materialsTotal,
    worksCost: e.worksTotal,
    subtotal: e.subtotal,
    regionCoeff: e.regionCoeff,
    markupAmount: e.markupAmount,
    total: e.total,
  };
}

/** Детальная ведомость МАТЕРИАЛОВ + работ (для MaterialsTable). */
export function calcElectricsMaterials(
  cfg: Omit<ElectricsConfig, "id" | "totalPrice">,
  _bd: ElectricsPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcElectrics(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcElectricsWorks(
  cfg: Omit<ElectricsConfig, "id" | "totalPrice">,
  _bd: ElectricsPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcElectrics(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
