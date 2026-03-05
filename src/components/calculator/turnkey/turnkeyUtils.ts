import {
  REGIONS, RENOVATION_LEVELS, FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
} from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

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
  materialsCost: number;
  foremanCost: number;
  supplierCost: number;
  subtotal: number;
  levelCoeff: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

// Доли каждой статьи от базовой стоимости (сумма активных долей = 1.0)
// Базовые доли при полном наборе работ
const BASE_SHARES = {
  demolition:   0.06,
  electrics:    0.12,
  plumbing:     0.10,
  plaster:      0.18,
  floors:       0.14,
  ceilings:     0.08,
  bathrooms:    0.16,
  kitchen:      0.04,
  doors:        0.06,
  windowSlopes: 0.02,
  furniture:    0.02,
  cleaning:     0.02,
};

export function calcTurnkeyPrice(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): TurnkeyPriceBreakdown {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);

  const rc = region.coeff;
  const lc = level?.priceCoeff ?? 1.0;
  const area = cfg.totalAreaM2 || 0;
  const basePriceM2 = level?.basePriceM2 ?? 18000;

  // Базовая сумма — именно то, что написано в карточке пакета
  const baseTotal = Math.round(basePriceM2 * area * rc);

  // Считаем, какие статьи включены, нормируем доли чтобы сумма = baseTotal
  const activeShares: Record<string, number> = {
    demolition:   cfg.demolitionIncluded    ? BASE_SHARES.demolition   : 0,
    electrics:    cfg.electricsIncluded     ? BASE_SHARES.electrics     : 0,
    plumbing:     cfg.plumbingIncluded      ? BASE_SHARES.plumbing      : 0,
    plaster:      cfg.plastersIncluded      ? BASE_SHARES.plaster       : 0,
    floors:       cfg.floorsIncluded        ? BASE_SHARES.floors        : 0,
    ceilings:     cfg.ceilingsIncluded      ? BASE_SHARES.ceilings      : 0,
    bathrooms:    cfg.bathroomIncluded      ? BASE_SHARES.bathrooms     : 0,
    kitchen:      cfg.kitchenIncluded       ? BASE_SHARES.kitchen       : 0,
    doors:        cfg.doorsIncluded && cfg.doorsCount > 0 ? BASE_SHARES.doors : 0,
    windowSlopes: cfg.windowslopeIncluded   ? BASE_SHARES.windowSlopes  : 0,
    furniture:    cfg.furnitureAssembly     ? BASE_SHARES.furniture     : 0,
    cleaning:     cfg.cleaningIncluded      ? BASE_SHARES.cleaning      : 0,
  };

  const totalShare = Object.values(activeShares).reduce((s, v) => s + v, 0);
  const norm = totalShare > 0 ? 1 / totalShare : 1;

  const get = (key: string) =>
    totalShare > 0 ? Math.round(baseTotal * activeShares[key] * norm) : 0;

  const demolitionCost   = get("demolition");
  const electricsCost    = get("electrics");
  const plumbingCost     = get("plumbing");
  const plasterCost      = get("plaster");
  const floorsCost       = get("floors");
  const ceilingsCost     = get("ceilings");
  const bathroomsCost    = get("bathrooms");
  const kitchenCost      = get("kitchen");
  const doorsCost        = get("doors");
  const windowSlopesCost = get("windowSlopes");
  const furnitureCost    = get("furniture");
  // Остаток уходит в уборку чтобы сумма была точной
  const cleaningCostRaw  = get("cleaning");
  const sumSoFar = demolitionCost + electricsCost + plumbingCost + plasterCost +
    floorsCost + ceilingsCost + bathroomsCost + kitchenCost + doorsCost +
    windowSlopesCost + furnitureCost + cleaningCostRaw;
  const cleaningCost = cfg.cleaningIncluded
    ? cleaningCostRaw + (baseTotal - sumSoFar)
    : 0;

  const worksSubtotal = demolitionCost + electricsCost + plumbingCost + plasterCost +
    floorsCost + ceilingsCost + bathroomsCost + kitchenCost + doorsCost +
    windowSlopesCost + furnitureCost + cleaningCost;

  // Материальная составляющая (доля материалов по каждой статье)
  const materialsCost = Math.round(
    demolitionCost   * 0.00 +
    electricsCost    * 0.50 +
    plumbingCost     * 0.40 +
    plasterCost      * 0.55 +
    floorsCost       * 0.65 +
    ceilingsCost     * 0.55 +
    bathroomsCost    * 0.60 +
    kitchenCost      * 0.00 +
    doorsCost        * 0.70 +
    windowSlopesCost * 0.50 +
    furnitureCost    * 0.00 +
    cleaningCost     * 0.00,
  );

  const foremanCost = cfg.foremanIncluded
    ? Math.round(worksSubtotal * (cfg.foremanPct || 10) / 100)
    : 0;

  const supplierCost = cfg.supplierIncluded
    ? Math.round(materialsCost * (cfg.supplierPct || 5) / 100)
    : 0;

  const subtotal = worksSubtotal + foremanCost + supplierCost;
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
    materialsCost,
    foremanCost,
    supplierCost,
    subtotal,
    levelCoeff: lc,
    regionCoeff: rc,
    markupAmount,
    total,
  };
}

export function calcTurnkeyMaterials(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  bd: TurnkeyPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;
  const lc = bd.levelCoeff;
  const area = cfg.totalAreaM2 || 0;
  const ceilingH = cfg.ceilingHeightM || 2.8;
  const wallArea = Math.round(Math.sqrt(area) * 3.5 * ceilingH * 10) / 10;
  const floorType    = FLOOR_TYPES.find(f => f.id === cfg.floorType);
  const ceilingType  = CEILING_TYPES.find(c => c.id === cfg.ceilingType);
  const bathroomLevel = BATHROOM_LEVELS.find(b => b.id === cfg.bathroomLevel);

  const items: MaterialItem[] = [];

  if (cfg.plastersIncluded && bd.plasterCost > 0) {
    const plasterKg = Math.ceil(wallArea * 12);
    items.push({ name: "Гипсовая штукатурка Knauf Rotband", spec: "мешки 30 кг", unit: "кг", qty: plasterKg, pricePerUnit: 16, total: plasterKg * 16 });
    const screedKg = Math.ceil(area * 22);
    items.push({ name: "ЦПС М200 для стяжки пола", spec: "мешки 50 кг", unit: "кг", qty: screedKg, pricePerUnit: 12, total: screedKg * 12 });
    items.push({ name: "Шпаклёвка финишная Knauf", unit: "кг", qty: Math.ceil(wallArea * 1.2), pricePerUnit: 24, total: Math.ceil(wallArea * 1.2) * 24 });
    items.push({ name: "Грунтовка (стены + пол)", unit: "л", qty: Math.ceil((wallArea + area) * 0.2), pricePerUnit: 120, total: Math.ceil((wallArea + area) * 0.2) * 120, isConsumable: true });
    items.push({ name: "Маяки, профили, серпянка", unit: "компл.", qty: 1, pricePerUnit: Math.round((wallArea + area) * 58), total: Math.round((wallArea + area) * 58), isConsumable: true });
  }

  if (cfg.electricsIncluded && bd.electricsCost > 0) {
    items.push({ name: "Кабель ВВГнг-LS 3×2,5 мм²", spec: "силовой, для розеток", unit: "м.п.", qty: Math.round(area * 5), pricePerUnit: 72, total: Math.round(area * 5 * 72) });
    items.push({ name: "Кабель ВВГнг-LS 3×1,5 мм²", spec: "для освещения", unit: "м.п.", qty: Math.round(area * 2), pricePerUnit: 50, total: Math.round(area * 2 * 50) });
    items.push({ name: "Щиток распределительный", spec: `на ${Math.round(area / 5) + 4} мест`, unit: "шт.", qty: 1, pricePerUnit: Math.round(8500 * lc * rc), total: Math.round(8500 * lc * rc) });
    items.push({ name: "Автоматы, УЗО, розетки, выключатели", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 360 * lc), total: Math.round(area * 360 * lc), isConsumable: true });
    items.push({ name: "Гофра, подрозетники, стяжки", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 110), total: Math.round(area * 110), isConsumable: true });
  }

  if (cfg.plumbingIncluded && bd.plumbingCost > 0) {
    items.push({ name: "Труба полипропиленовая ∅20/25 мм", spec: "ХВС/ГВС", unit: "м.п.", qty: Math.round(cfg.bathroomCount * 18), pricePerUnit: 125, total: Math.round(cfg.bathroomCount * 18 * 125) });
    items.push({ name: "Фитинги PPR (муфты, тройники, угольники)", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: 4500, total: cfg.bathroomCount * 4500, isConsumable: true });
    items.push({ name: "Гофра канализационная ∅50/110 мм", unit: "м.п.", qty: Math.round(cfg.bathroomCount * 8), pricePerUnit: 160, total: Math.round(cfg.bathroomCount * 8 * 160) });
  }

  if (cfg.floorsIncluded && bd.floorsCost > 0 && floorType) {
    const floorQty = Math.round(area * 1.08 * 10) / 10;
    items.push({ name: `Напольное покрытие: ${floorType.label}`, spec: "с учётом 8% отхода", unit: "м²", qty: floorQty, pricePerUnit: Math.round(floorType.priceM2 * lc * rc * 0.6), total: Math.round(floorQty * floorType.priceM2 * lc * rc * 0.6) });
    items.push({ name: "Подложка под ламинат/паркет", unit: "м²", qty: Math.round(area * 1.05), pricePerUnit: 75, total: Math.round(area * 1.05 * 75) });
    items.push({ name: "Плинтус напольный с кабель-каналом", unit: "м.п.", qty: Math.round(Math.sqrt(area) * 3.5), pricePerUnit: 240, total: Math.round(Math.sqrt(area) * 3.5 * 240) });
    items.push({ name: "Клей для напольных покрытий, дюбели", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 45), total: Math.round(area * 45), isConsumable: true });
  }

  if (cfg.ceilingsIncluded && bd.ceilingsCost > 0 && ceilingType) {
    if (ceilingType.id === "stretch") {
      items.push({ name: "Натяжное полотно ПВХ (глянец/матт)", unit: "м²", qty: Math.round(area * 1.05), pricePerUnit: Math.round(ceilingType.priceM2 * lc * 0.5), total: Math.round(area * 1.05 * ceilingType.priceM2 * lc * 0.5) });
      items.push({ name: "Профиль для натяжного потолка", unit: "м.п.", qty: Math.round(Math.sqrt(area) * 3.5), pricePerUnit: 125, total: Math.round(Math.sqrt(area) * 3.5 * 125) });
    } else {
      items.push({ name: "Шпаклёвка потолочная Bergauf", unit: "кг", qty: Math.ceil(area * 0.9), pricePerUnit: 29, total: Math.ceil(area * 0.9) * 29 });
      items.push({ name: "Краска для потолков Dulux / Tikkurila", spec: "белая матовая", unit: "л", qty: Math.ceil(area * 0.18 * 2), pricePerUnit: Math.round(125 * lc), total: Math.ceil(area * 0.18 * 2) * Math.round(125 * lc) });
      items.push({ name: "Грунтовка потолка", unit: "л", qty: Math.ceil(area * 0.15), pricePerUnit: 120, total: Math.ceil(area * 0.15) * 120, isConsumable: true });
    }
  }

  if (cfg.bathroomIncluded && bd.bathroomsCost > 0 && bathroomLevel) {
    const bathroomArea = cfg.bathroomCount * 6;
    items.push({ name: `Плитка настенная (${bathroomLevel.label})`, unit: "м²", qty: Math.round(bathroomArea * 2.8 * 1.1), pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.15 / (bathroomArea * 2.8 * 1.1)), total: Math.round(bathroomLevel.pricePerUnit * 0.15 * cfg.bathroomCount) });
    items.push({ name: "Плитка напольная для санузлов", unit: "м²", qty: Math.round(bathroomArea * 1.1), pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.08 / (bathroomArea * 1.1)), total: Math.round(bathroomLevel.pricePerUnit * 0.08 * cfg.bathroomCount) });
    items.push({ name: "Унитаз + инсталляция", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.12), total: Math.round(bathroomLevel.pricePerUnit * 0.12 * cfg.bathroomCount) });
    items.push({ name: "Смеситель, душ, полотенцесушитель", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.10), total: Math.round(bathroomLevel.pricePerUnit * 0.10 * cfg.bathroomCount) });
    items.push({ name: "Гидроизоляция, клей для плитки, затирка", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.05), total: Math.round(bathroomLevel.pricePerUnit * 0.05 * cfg.bathroomCount), isConsumable: true });
  }

  if (cfg.doorsIncluded && cfg.doorsCount > 0 && bd.doorsCost > 0) {
    const pricePerDoor = Math.round(bd.doorsCost / cfg.doorsCount);
    items.push({ name: "Межкомнатные двери с коробкой и фурнитурой", unit: "компл.", qty: cfg.doorsCount, pricePerUnit: Math.round(pricePerDoor * 0.70), total: Math.round(bd.doorsCost * 0.70) });
    items.push({ name: "Наличники, петли, ручки", unit: "компл.", qty: cfg.doorsCount, pricePerUnit: Math.round(pricePerDoor * 0.05), total: Math.round(bd.doorsCost * 0.05), isConsumable: true });
  }

  if (cfg.windowslopeIncluded && bd.windowSlopesCost > 0) {
    const windowCount = cfg.balconyCount + Math.ceil(area / 18);
    items.push({ name: "Откосы оконные ПВХ (панель + уголок)", unit: "компл.", qty: windowCount, pricePerUnit: Math.round(bd.windowSlopesCost * 0.50 / windowCount), total: Math.round(bd.windowSlopesCost * 0.50) });
    items.push({ name: "Монтажная пена, герметик", unit: "компл.", qty: 1, pricePerUnit: Math.round(windowCount * 490), total: Math.round(windowCount * 490), isConsumable: true });
  }

  return items;
}