import {
  REGIONS, ROOM_TYPES, RENOVATION_LEVELS, SCREED_TYPES,
  PLASTER_TYPES, CEILING_FINISH_TYPES, FLOORING_TYPES, DOOR_TYPES,
} from "./NewbuildTypes";
import type { NewbuildConfig } from "./NewbuildTypes";

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
  materialsCost: number;
  subtotal: number;
  levelCoeff: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

export interface NewbuildProjectTotals {
  worksTotal: number;     // сумма всех зон без вознаграждений
  materialsTotal: number; // сумма материалов по всем зонам
  foremanCost: number;
  supplierCost: number;
  markupAmount: number;
  total: number;
}

export function calcNewbuildPrice(
  cfg: Omit<NewbuildConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): NewbuildPriceBreakdown {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const roomType = ROOM_TYPES.find(r => r.id === cfg.roomType);
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);
  const screedType = SCREED_TYPES.find(s => s.id === cfg.screedType);
  const plasterType = PLASTER_TYPES.find(p => p.id === cfg.plasterType);
  const ceilingType = CEILING_FINISH_TYPES.find(c => c.id === cfg.ceilingType);
  const flooringType = FLOORING_TYPES.find(f => f.id === cfg.flooringType);
  const doorType = DOOR_TYPES.find(d => d.id === cfg.doorType);

  const rc = region.coeff;
  const lc = level?.priceCoeff ?? 1.0;
  const tc = roomType?.priceCoeff ?? 1.0;
  const wallCoeff = roomType?.wallCoeff ?? 2.4;

  const area = cfg.area || 0;
  const wallArea = Math.round(area * wallCoeff * 10) / 10;

  // Стяжка пола (tc уже заложен в wallCoeff — для стяжки не применяем)
  const screedCost = cfg.screedIncluded
    ? Math.round(area * (screedType?.priceM2 ?? 850) * rc)
    : 0;

  // Штукатурка стен (wallArea уже рассчитан с wallCoeff типа комнаты — tc не дублируем)
  const plasterCost = cfg.plasterIncluded
    ? Math.round(wallArea * (plasterType?.priceM2 ?? 550) * rc)
    : 0;

  // Потолок
  const ceilingCost = cfg.ceilingLevelIncluded
    ? Math.round(area * (ceilingType?.priceM2 ?? 650) * lc * rc)
    : 0;

  // Малярные работы (стены + потолок)
  const wallPaintPrice = 280 * cfg.paintLayersCount;
  const ceilPaintPrice = 220 * cfg.paintLayersCount;
  const paintCost =
    (cfg.paintingWalls ? Math.round(wallArea * wallPaintPrice * lc * rc) : 0) +
    (cfg.paintingCeiling ? Math.round(area * ceilPaintPrice * lc * rc) : 0);

  // Напольное покрытие
  const flooringCost = Math.round(area * (flooringType?.priceM2 ?? 850) * lc * rc);

  // Электрика (розетки + выключатели)
  const electricsCost = cfg.electricsIncluded
    ? Math.round((cfg.outletsCount * 600 + cfg.switchesCount * 450) * tc * rc)
    : 0;

  // Двери (включая установку)
  const doorsCost = cfg.doorsCount > 0
    ? Math.round(cfg.doorsCount * (doorType?.pricePerDoor ?? 15000) * rc)
    : 0;

  // Откосы окон
  const windowSlopesCost = cfg.windowSlopesCount > 0
    ? Math.round(cfg.windowSlopesCount * 3500 * rc)
    : 0;

  const worksSubtotal =
    screedCost +
    plasterCost +
    ceilingCost +
    paintCost +
    flooringCost +
    electricsCost +
    doorsCost +
    windowSlopesCost;

  // Материальная составляющая по каждой статье
  const materialsCost =
    screedCost       * 0.60 +
    plasterCost      * 0.55 +
    ceilingCost      * 0.55 +
    paintCost        * 0.40 +
    flooringCost     * 0.65 +
    electricsCost    * 0.50 +
    doorsCost        * 0.70 +
    windowSlopesCost * 0.50;

  const subtotal = worksSubtotal;

  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  return {
    screedCost,
    plasterCost,
    ceilingCost,
    paintCost,
    flooringCost,
    electricsCost,
    doorsCost,
    windowSlopesCost,
    materialsCost: Math.round(materialsCost),
    subtotal,
    levelCoeff: lc,
    regionCoeff: rc,
    markupAmount,
    total,
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