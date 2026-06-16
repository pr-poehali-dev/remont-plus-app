import type { NewbuildConfig } from "./NewbuildTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcNewbuild } from "./newbuildEngine";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export interface NewbuildPriceBreakdown {
  screedCost: number;
  plasterCost: number;
  ceilingCost: number;
  paintCost: number;
  flooringCost: number;
  electricsCost: number;
  doorsCost: number;
  windowSlopesCost: number;
  heatedFloorCost: number;
  backsplashCost: number;
  countertopCost: number;
  conditionerCost: number;
  soundproofCost: number;
  plumbingCost: number;
  materialsCost: number;
  subtotal: number;
  levelCoeff: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

export interface NewbuildProjectTotals {
  worksTotal: number;
  materialsTotal: number;
  foremanCost: number;
  supplierCost: number;
  markupAmount: number;
  total: number;
}

/**
 * Совместимая обёртка над единым движком calcNewbuild.
 * Все суммы по блокам (*Cost) — строгая сумма детальных позиций (работы +
 * материалы блока). materialsCost — реальная сумма материалов, subtotal =
 * works + materials. levelCoeff и regionCoeff берутся из движка.
 */
export function calcNewbuildPrice(
  cfg: Omit<NewbuildConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): NewbuildPriceBreakdown {
  const e = calcNewbuild(cfg, regionId, markupPct);
  const b = e.blockTotals;
  return {
    screedCost: b.screed,
    plasterCost: b.plaster,
    ceilingCost: b.ceiling,
    paintCost: b.paint,
    flooringCost: b.flooring,
    electricsCost: b.electrics,
    doorsCost: b.doors,
    windowSlopesCost: b.windowSlopes,
    heatedFloorCost: b.heatedFloor,
    backsplashCost: b.backsplash,
    countertopCost: b.countertop,
    conditionerCost: b.conditioner,
    soundproofCost: b.soundproof,
    plumbingCost: b.plumbing,
    materialsCost: e.materialsTotal,
    subtotal: e.subtotal,
    levelCoeff: e.levelCoeff,
    regionCoeff: e.regionCoeff,
    markupAmount: e.markupAmount,
    total: e.total,
  };
}

// Итоговый расчёт по всему объекту (прораб и снабженец — один раз на весь объект)
export function calcNewbuildProjectTotals(
  breakdowns: NewbuildPriceBreakdown[],
  foremanIncluded: boolean,
  foremanPct: number,
  supplierIncluded: boolean,
  supplierPct: number,
  markupPct = 0,
): NewbuildProjectTotals {
  const worksTotal = breakdowns.reduce((s, bd) => s + bd.subtotal, 0);
  const materialsTotal = breakdowns.reduce((s, bd) => s + bd.materialsCost, 0);

  const foremanCost = foremanIncluded
    ? Math.round(worksTotal * (foremanPct || 10) / 100)
    : 0;
  const supplierCost = supplierIncluded
    ? Math.round(materialsTotal * (supplierPct || 5) / 100)
    : 0;

  const base = worksTotal + foremanCost + supplierCost;
  const markupAmount = markupPct > 0 ? Math.round(base * markupPct / 100) : 0;
  const total = base + markupAmount;

  return { worksTotal, materialsTotal, foremanCost, supplierCost, markupAmount, total };
}

/**
 * Детальная ведомость МАТЕРИАЛОВ + работ (для MaterialsTable / печати).
 * Возвращает все позиции движка без служебного поля block.
 * Третий аргумент bd сохранён для обратной совместимости вызовов (не нужен).
 */
export function calcNewbuildMaterials(
  cfg: Omit<NewbuildConfig, "id" | "totalPrice">,
  _bd?: NewbuildPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcNewbuild(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcNewbuildWorks(
  cfg: Omit<NewbuildConfig, "id" | "totalPrice">,
  _bd?: NewbuildPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcNewbuild(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
