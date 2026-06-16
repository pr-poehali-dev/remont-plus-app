import {
  DEMOLITION_SCOPES, DEBRIS_TRUCK_VOLUME_M3,
} from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcTurnkey } from "./turnkeyEngine";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export function calcDemoTrucks(cfg: Omit<TurnkeyConfig, "id" | "totalPrice">): number {
  const area = cfg.totalAreaM2 || 0;
  const ceilH = cfg.ceilingHeightM || 2.8;
  const wallArea = Math.round(Math.sqrt(area) * 3.5 * ceilH * 10) / 10;
  const scope = DEMOLITION_SCOPES.find(s => s.id === cfg.demolitionScope) ?? DEMOLITION_SCOPES[1];
  const vol = ((cfg.demolitionFloors ? area : 0) + (cfg.demolitionWalls ? wallArea : 0)) * scope.debrisM3perM2;
  return vol > 0 ? Math.ceil(vol / DEBRIS_TRUCK_VOLUME_M3) : 0;
}

export interface TurnkeyPriceBreakdown {
  demolitionCost: number;
  debrisRemovalCost: number;
  debrisTruckCount: number;
  bathroomCabinDemolitionCost: number;
  bathroomCabinConstructionCost: number;
  electricsCost: number;
  plumbingCost: number;
  plasterCost: number;
  floorsCost: number;
  ceilingsCost: number;
  bathroomsCost: number;
  kitchenCost: number;
  doorsCost: number;
  windowSlopesCost: number;
  furnitureCost: number;
  cleaningCost: number;
  materialsCost: number;
  foremanCost: number;
  supplierCost: number;
  subtotal: number;
  levelCoeff: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

/**
 * Совместимая обёртка над единым движком calcTurnkey.
 * Все суммы по блокам (*Cost) — строгая сумма детальных позиций (работы +
 * материалы блока). materialsCost — реальная сумма материалов.
 * foremanCost/supplierCost — услуги мастера (как раньше), subtotal их включает.
 * levelCoeff/regionCoeff — из движка.
 */
export function calcTurnkeyPrice(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): TurnkeyPriceBreakdown {
  const e = calcTurnkey(cfg, regionId, markupPct);
  const b = e.blockTotals;
  return {
    demolitionCost: b.demolition,
    debrisRemovalCost: b.debris,
    debrisTruckCount: e.debrisTruckCount,
    bathroomCabinDemolitionCost: b.cabinDemolition,
    bathroomCabinConstructionCost: b.cabinConstruction,
    electricsCost: b.electrics,
    plumbingCost: b.plumbing,
    plasterCost: b.plaster,
    floorsCost: b.floors,
    ceilingsCost: b.ceilings,
    bathroomsCost: b.bathrooms,
    kitchenCost: b.kitchen,
    doorsCost: b.doors,
    windowSlopesCost: b.windowSlopes,
    furnitureCost: b.furniture,
    cleaningCost: b.cleaning,
    materialsCost: e.materialsTotal,
    foremanCost: e.foremanCost,
    supplierCost: e.supplierCost,
    subtotal: e.subtotal,
    levelCoeff: e.levelCoeff,
    regionCoeff: e.regionCoeff,
    markupAmount: e.markupAmount,
    total: e.total,
  };
}

/**
 * Детальная ведомость МАТЕРИАЛОВ + работ (для MaterialsTable / печати).
 * Возвращает все позиции движка без служебного поля block.
 * Второй аргумент bd сохранён для обратной совместимости вызовов (не нужен).
 */
export function calcTurnkeyMaterials(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  _bd?: TurnkeyPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcTurnkey(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcTurnkeyWorks(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  _bd?: TurnkeyPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const e = calcTurnkey(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
