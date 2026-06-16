import type { BathHouseConfig } from "./BathHouseTypes";
import { calcBathHouse } from "./bathHouseEngine";
import type { BathHouseBlock } from "./bathHouseEngine";

export interface BathHouseBreakdown {
  foundation: number;
  walls: number;
  roofStructure: number;
  roofing: number;
  insulation: number;
  wallFinishSteam: number;
  wallFinishWash: number;
  wallFinishRest: number;
  floor: number;
  stove: number;
  ventilation: number;
  shelves: number;
  windows: number;
  chimney: number;
  tank: number;
  terrace: number;
  electrical: number;
  assembly: number;
  materialsBase: number;
  foreman: number;
  supplier: number;
  regionCoeff: number;
  markupAmount: number;
  subtotal: number;
  total: number;

  stoveRecommendation: string;
  ventRecommendation: string;
  shelfRecommendation: string;
}

/**
 * Совместимая обёртка над единым движком calcBathHouse.
 *
 * Маппинг полей под прежний интерфейс:
 *  - блочные поля (foundation, walls, ...) = сумма МАТЕРИАЛОВ блока;
 *  - assembly = сумма ВСЕХ работ (общий труд по объекту);
 *  - materialsBase = сумма всех материалов;
 *  - foreman/supplier — услуги мастера (как раньше), subtotal их включает;
 *  - recommendation-поля сохранены.
 *
 * Так Σ(материалы блоков) + assembly = материалы + работы (строгая сумма позиций).
 */
export function calcBathHousePrice(cfg: BathHouseConfig, regionId: string, markupPct = 0): BathHouseBreakdown {
  const e = calcBathHouse(cfg, regionId, markupPct);

  // материалы по блокам (без работ)
  const matByBlock = (block: BathHouseBlock) =>
    e.materials.filter((l) => l.block === block).reduce((s, l) => s + l.total, 0);

  return {
    foundation: matByBlock("foundation"),
    walls: matByBlock("walls"),
    roofStructure: matByBlock("roofStructure"),
    roofing: matByBlock("roofing"),
    insulation: matByBlock("insulation"),
    wallFinishSteam: matByBlock("wallFinishSteam"),
    wallFinishWash: matByBlock("wallFinishWash"),
    wallFinishRest: matByBlock("wallFinishRest"),
    floor: matByBlock("floor"),
    stove: matByBlock("stove"),
    ventilation: matByBlock("ventilation"),
    shelves: matByBlock("shelves"),
    windows: matByBlock("windows"),
    chimney: matByBlock("chimney"),
    tank: matByBlock("tank"),
    terrace: matByBlock("terrace"),
    electrical: matByBlock("electrical"),
    assembly: e.worksTotal,
    materialsBase: e.materialsTotal,
    foreman: e.foreman,
    supplier: e.supplier,
    regionCoeff: e.regionCoeff,
    markupAmount: e.markupAmount,
    subtotal: e.subtotal,
    total: e.total,
    stoveRecommendation: e.stoveRecommendation,
    ventRecommendation: e.ventRecommendation,
    shelfRecommendation: e.shelfRecommendation,
  };
}
