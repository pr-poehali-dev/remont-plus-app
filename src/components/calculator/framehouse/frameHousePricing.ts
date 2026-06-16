import type { FrameHouseConfig } from "./FrameHouseTypes";
import { calcFrameHouse } from "./frameHouseEngine";
import type { FrameHouseBlock } from "./frameHouseEngine";

export interface FrameHouseBreakdown {
  foundation: number;
  frame: number;
  insulation: number;
  roofStructure: number;
  roofing: number;
  facade: number;
  windows: number;
  floor: number;
  underfloorHeating: number;
  heating: number;
  electrical: number;
  plumbing: number;
  sewage: number;
  interiorFinish: number;
  terrace: number;
  garage: number;
  assembly: number;
  foreman: number;
  supplier: number;
  materialsBase: number;
  worksCost: number;
  materialsCost: number;
  regionCoeff: number;
  markupAmount: number;
  subtotal: number;
  total: number;
}

/**
 * Совместимая обёртка над единым движком calcFrameHouse.
 *
 * Маппинг полей под прежний интерфейс:
 *  - блочные поля (foundation, frame, ...) = сумма МАТЕРИАЛОВ блока;
 *  - assembly = сумма ВСЕХ работ (общий труд по объекту) = worksCost;
 *  - materialsBase / materialsCost = сумма всех материалов;
 *  - worksCost = сумма всех работ;
 *  - foreman/supplier — услуги мастера (как раньше), subtotal их включает.
 *
 * Так Σ(материалы блоков) + assembly = материалы + работы (строгая сумма позиций).
 */
export function calcFrameHousePrice(
  cfg: FrameHouseConfig,
  regionId: string,
  markupPct = 0,
): FrameHouseBreakdown {
  const e = calcFrameHouse(cfg, regionId, markupPct);

  // материалы по блокам (без работ)
  const matByBlock = (block: FrameHouseBlock) =>
    e.materials.filter((l) => l.block === block).reduce((s, l) => s + l.total, 0);

  return {
    foundation: matByBlock("foundation"),
    frame: matByBlock("frame"),
    insulation: matByBlock("insulation"),
    roofStructure: matByBlock("roofStructure"),
    roofing: matByBlock("roofing"),
    facade: matByBlock("facade"),
    windows: matByBlock("windows"),
    floor: matByBlock("floor"),
    underfloorHeating: matByBlock("underfloorHeating"),
    heating: matByBlock("heating"),
    electrical: matByBlock("electrical"),
    plumbing: matByBlock("plumbing"),
    sewage: matByBlock("sewage"),
    interiorFinish: matByBlock("interiorFinish"),
    terrace: matByBlock("terrace"),
    garage: matByBlock("garage"),
    assembly: e.worksTotal,
    foreman: e.foreman,
    supplier: e.supplier,
    materialsBase: e.materialsTotal,
    worksCost: e.worksTotal,
    materialsCost: e.materialsTotal,
    regionCoeff: e.regionCoeff,
    markupAmount: e.markupAmount,
    subtotal: e.subtotal,
    total: e.total,
  };
}
