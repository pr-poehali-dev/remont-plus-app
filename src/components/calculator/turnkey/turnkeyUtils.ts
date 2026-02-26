import {
  REGIONS, RENOVATION_LEVELS, FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
} from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export interface TurnkeyPriceBreakdown {
  demolitionCost: number;
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
  subtotal: number;
  levelCoeff: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

export function calcTurnkeyPrice(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): TurnkeyPriceBreakdown {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);
  const floorType = FLOOR_TYPES.find(f => f.id === cfg.floorType);
  const ceilingType = CEILING_TYPES.find(c => c.id === cfg.ceilingType);
  const bathroomLevel = BATHROOM_LEVELS.find(b => b.id === cfg.bathroomLevel);

  const rc = region.coeff;
  const lc = level?.priceCoeff ?? 1.0;
  const area = cfg.totalAreaM2 || 0;
  const ceilingH = cfg.ceilingHeightM || 2.7;

  // Приблизительная площадь стен по всей квартире:
  // периметр ≈ sqrt(area) * 3.5, площадь стен = периметр * высота
  const wallArea = Math.round(Math.sqrt(area) * 3.5 * ceilingH * 10) / 10;

  // Демонтаж
  const demolitionCost = cfg.demolitionIncluded
    ? Math.round(area * 1600 * rc)
    : 0;

  // Электрика
  const electricsCost = cfg.electricsIncluded
    ? Math.round(area * 1300 * lc * rc)
    : 0;

  // Сантехника (разводка труб, без санузловой отделки)
  const plumbingCost = cfg.plumbingIncluded
    ? Math.round((area * 800 + cfg.bathroomCount * 25000) * rc)
    : 0;

  // Штукатурка и стяжка
  const plasterCost = cfg.plastersIncluded
    ? Math.round((wallArea * 600 + area * 900) * lc * rc)
    : 0;

  // Полы
  const floorsCost = cfg.floorsIncluded
    ? Math.round(area * (floorType?.priceM2 ?? 900) * lc * rc)
    : 0;

  // Потолки
  const ceilingsCost = cfg.ceilingsIncluded
    ? Math.round(area * (ceilingType?.priceM2 ?? 650) * lc * rc)
    : 0;

  // Санузлы (под ключ: плитка, гидроизоляция, сантехника)
  const bathroomsCost = cfg.bathroomIncluded
    ? Math.round(cfg.bathroomCount * (bathroomLevel?.pricePerUnit ?? 145000) * rc)
    : 0;

  // Монтаж кухни (зависит от площади кухни и уровня)
  const kitchenCost = cfg.kitchenIncluded
    ? Math.round((cfg.kitchenAreaM2 || 12) * 1200 * lc * rc)
    : 0;

  // Двери (с учётом уровня ремонта)
  const doorsCost = cfg.doorsIncluded && cfg.doorsCount > 0
    ? Math.round(cfg.doorsCount * 12000 * lc * rc)
    : 0;

  // Откосы окон (≈ кол-во окон = balcony + ~2 на комнату)
  const windowCount = cfg.balconyCount + Math.ceil(area / 18);
  const windowSlopesCost = cfg.windowslopeIncluded
    ? Math.round(windowCount * 3200 * lc * rc)
    : 0;

  // Сборка мебели
  const furnitureCost = cfg.furnitureAssembly
    ? Math.round(area * 500 * rc)
    : 0;

  // Уборка
  const cleaningCost = cfg.cleaningIncluded
    ? Math.round(area * 180 * rc)
    : 0;

  const subtotal =
    demolitionCost +
    electricsCost +
    plumbingCost +
    plasterCost +
    floorsCost +
    ceilingsCost +
    bathroomsCost +
    kitchenCost +
    doorsCost +
    windowSlopesCost +
    furnitureCost +
    cleaningCost;

  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  return {
    demolitionCost,
    electricsCost,
    plumbingCost,
    plasterCost,
    floorsCost,
    ceilingsCost,
    bathroomsCost,
    kitchenCost,
    doorsCost,
    windowSlopesCost,
    furnitureCost,
    cleaningCost,
    subtotal,
    levelCoeff: lc,
    regionCoeff: rc,
    markupAmount,
    total,
  };
}