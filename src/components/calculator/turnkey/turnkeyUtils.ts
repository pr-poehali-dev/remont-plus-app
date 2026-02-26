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

  const worksSubtotal =
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

  // Материальная составляющая по каждой статье (доля материалов от суммы позиции)
  const materialsCost =
    demolitionCost  * 0.00 + // демонтаж — чистая работа
    electricsCost   * 0.50 + // кабель, розетки, щиток
    plumbingCost    * 0.40 + // трубы, фитинги
    plasterCost     * 0.55 + // смеси, штукатурка, стяжка
    floorsCost      * 0.65 + // напольное покрытие
    ceilingsCost    * 0.55 + // потолочные материалы
    bathroomsCost   * 0.60 + // плитка, сантехника, фурнитура
    kitchenCost     * 0.00 + // только монтаж, мебель куплена отдельно
    doorsCost       * 0.70 + // сами двери + коробки
    windowSlopesCost* 0.50 + // откосные панели
    furnitureCost   * 0.00 + // сборка, мебель куплена отдельно
    cleaningCost    * 0.00;  // расходники незначительны

  // Прораб: % от всей суммы работ (работа + материалы)
  const foremanCost = cfg.foremanIncluded
    ? Math.round(worksSubtotal * (cfg.foremanPct || 10) / 100)
    : 0;

  // Снабженец: % от суммы закупаемых материалов
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
    materialsCost: Math.round(materialsCost),
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

  // ── МАТЕРИАЛЫ: Штукатурка + Стяжка ───────────────────────────────────────
  if (cfg.plastersIncluded && bd.plasterCost > 0) {
    const plasterKg = Math.ceil(wallArea * 12);
    items.push({ name: "Гипсовая штукатурка Knauf Rotband", spec: "мешки 30 кг", unit: "кг", qty: plasterKg, pricePerUnit: 12, total: plasterKg * 12 });
    const screedKg = Math.ceil(area * 22);
    items.push({ name: "ЦПС М200 для стяжки пола", spec: "мешки 50 кг", unit: "кг", qty: screedKg, pricePerUnit: 9, total: screedKg * 9 });
    items.push({ name: "Шпаклёвка финишная Knauf", unit: "кг", qty: Math.ceil(wallArea * 1.2), pricePerUnit: 18, total: Math.ceil(wallArea * 1.2) * 18 });
    items.push({ name: "Грунтовка (стены + пол)", unit: "л", qty: Math.ceil((wallArea + area) * 0.2), pricePerUnit: 90, total: Math.ceil((wallArea + area) * 0.2) * 90, isConsumable: true });
    items.push({ name: "Маяки, профили, серпянка", unit: "компл.", qty: 1, pricePerUnit: Math.round((wallArea + area) * 45), total: Math.round((wallArea + area) * 45), isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Электрика ─────────────────────────────────────────────────
  if (cfg.electricsIncluded && bd.electricsCost > 0) {
    items.push({ name: "Кабель ВВГнг-LS 3×2,5 мм²", spec: "силовой, для розеток", unit: "м.п.", qty: Math.round(area * 5), pricePerUnit: 55, total: Math.round(area * 5 * 55) });
    items.push({ name: "Кабель ВВГнг-LS 3×1,5 мм²", spec: "для освещения", unit: "м.п.", qty: Math.round(area * 2), pricePerUnit: 38, total: Math.round(area * 2 * 38) });
    items.push({ name: "Щиток распределительный", spec: `на ${Math.round(area / 5) + 4} мест`, unit: "шт.", qty: 1, pricePerUnit: Math.round(6500 * lc * rc), total: Math.round(6500 * lc * rc) });
    items.push({ name: "Автоматы, УЗО, розетки, выключатели", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 280 * lc), total: Math.round(area * 280 * lc), isConsumable: true });
    items.push({ name: "Гофра, подрозетники, стяжки", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 85), total: Math.round(area * 85), isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Водоснабжение ─────────────────────────────────────────────
  if (cfg.plumbingIncluded && bd.plumbingCost > 0) {
    items.push({ name: "Труба полипропиленовая ∅20/25 мм", spec: "для ХВС/ГВС", unit: "м.п.", qty: Math.round(cfg.bathroomCount * 12 + 6), pricePerUnit: 95, total: Math.round((cfg.bathroomCount * 12 + 6) * 95) });
    items.push({ name: "Фитинги полипропиленовые", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: 1800, total: cfg.bathroomCount * 1800 });
    items.push({ name: "Труба канализационная ПВХ ∅50/110 мм", unit: "м.п.", qty: Math.round(cfg.bathroomCount * 5 + 3), pricePerUnit: 140, total: Math.round((cfg.bathroomCount * 5 + 3) * 140) });
    items.push({ name: "Ревизии, тройники, угловые соединения", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: 650, total: cfg.bathroomCount * 650, isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Полы ──────────────────────────────────────────────────────
  if (cfg.floorsIncluded && bd.floorsCost > 0 && floorType) {
    const floorQty = Math.round(area * 1.07 * 10) / 10;
    items.push({ name: floorType.label, spec: floorType.description, unit: "м²", qty: floorQty, pricePerUnit: Math.round(floorType.priceM2 * 0.65 * lc), total: Math.round(floorQty * floorType.priceM2 * 0.65 * lc) });
    if (cfg.floorType === "laminate") {
      items.push({ name: "Подложка 3 мм (пенополистирол)", unit: "м²", qty: Math.round(area * 1.05 * 10) / 10, pricePerUnit: 95, total: Math.round(area * 1.05 * 95), isConsumable: true });
    } else if (cfg.floorType === "tile-all" || cfg.floorType === "mixed") {
      items.push({ name: "Клей плиточный C2, затирка", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 190), total: Math.round(area * 190), isConsumable: true });
    }
  }

  // ── МАТЕРИАЛЫ: Потолки ───────────────────────────────────────────────────
  if (cfg.ceilingsIncluded && bd.ceilingsCost > 0 && ceilingType) {
    if (cfg.ceilingType === "stretch") {
      items.push({ name: "Натяжное полотно ПВХ", spec: "матовый белый, включая профиль", unit: "м²", qty: area, pricePerUnit: Math.round(ceilingType.priceM2 * 0.55 * lc * rc), total: Math.round(area * ceilingType.priceM2 * 0.55 * lc * rc) });
    } else {
      items.push({ name: "Шпаклёвка + грунтовка + краска (потолки)", unit: "м²", qty: area, pricePerUnit: Math.round(ceilingType.priceM2 * 0.55 * lc), total: Math.round(area * ceilingType.priceM2 * 0.55 * lc) });
    }
  }

  // ── МАТЕРИАЛЫ: Санузлы ───────────────────────────────────────────────────
  if (cfg.bathroomIncluded && bd.bathroomsCost > 0 && bathroomLevel) {
    items.push({ name: `Плитка для санузлов (${bathroomLevel.label})`, spec: "пол + стены, +10% запас", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.35 * rc), total: Math.round(cfg.bathroomCount * bathroomLevel.pricePerUnit * 0.35 * rc) });
    items.push({ name: "Гидроизоляция + затирка + клей (санузлы)", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.10 * rc), total: Math.round(cfg.bathroomCount * bathroomLevel.pricePerUnit * 0.10 * rc), isConsumable: true });
    items.push({ name: "Сантехника (унитаз, ванна/душ, раковина, смесители)", spec: bathroomLevel.label, unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bathroomLevel.pricePerUnit * 0.15 * rc), total: Math.round(cfg.bathroomCount * bathroomLevel.pricePerUnit * 0.15 * rc) });
  }

  // ── МАТЕРИАЛЫ: Двери ─────────────────────────────────────────────────────
  if (cfg.doorsIncluded && cfg.doorsCount > 0 && bd.doorsCost > 0) {
    const doorPrice = Math.round(12000 * lc * 0.70 * rc);
    items.push({ name: "Дверные блоки (полотно + коробка)", spec: `уровень ${RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel)?.label ?? ""}`, unit: "компл.", qty: cfg.doorsCount, pricePerUnit: doorPrice, total: cfg.doorsCount * doorPrice });
    items.push({ name: "Фурнитура дверная (ручки, петли, доводчики)", unit: "компл.", qty: cfg.doorsCount, pricePerUnit: Math.round(950 * lc), total: Math.round(cfg.doorsCount * 950 * lc), isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Откосы ────────────────────────────────────────────────────
  if (cfg.windowslopeIncluded && bd.windowSlopesCost > 0) {
    const winCount = cfg.balconyCount + Math.ceil(area / 18);
    items.push({ name: "Откосные сэндвич-панели", spec: "1500×350 мм, белые", unit: "компл.", qty: winCount, pricePerUnit: Math.round(3200 * 0.50 * lc * rc), total: Math.round(winCount * 3200 * 0.50 * lc * rc) });
  }

  // ── РАСХОДНИКИ (общестрой) ────────────────────────────────────────────────
  items.push({ name: "Дюбели, шурупы, анкеры, крепёж", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 65), total: Math.round(area * 65), isConsumable: true });
  items.push({ name: "Полиэтиленовая плёнка, скотч малярный", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 28), total: Math.round(area * 28), isConsumable: true });
  if (cfg.cleaningIncluded) {
    items.push({ name: "Расходники для уборки", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 35), total: Math.round(area * 35), isConsumable: true });
  }

  // ── РАБОТЫ ───────────────────────────────────────────────────────────────
  if (cfg.demolitionIncluded && bd.demolitionCost > 0) items.push({ name: "Демонтаж перегородок, покрытий, сантехники", unit: "м²", qty: area, pricePerUnit: Math.round(1600 * rc), total: bd.demolitionCost, isWork: true });
  if (cfg.plastersIncluded && bd.plasterCost > 0)      items.push({ name: "Штукатурка стен + стяжка пола", unit: "м²", qty: area + wallArea, pricePerUnit: Math.round(bd.plasterCost * 0.45 / (area + wallArea)), total: Math.round(bd.plasterCost * 0.45), isWork: true });
  if (cfg.electricsIncluded && bd.electricsCost > 0)   items.push({ name: "Электромонтажные работы", unit: "м²", qty: area, pricePerUnit: Math.round(bd.electricsCost * 0.50 / area), total: Math.round(bd.electricsCost * 0.50), isWork: true });
  if (cfg.plumbingIncluded && bd.plumbingCost > 0)     items.push({ name: "Сантехнические работы (разводка)", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: Math.round(bd.plumbingCost * 0.60 / cfg.bathroomCount), total: Math.round(bd.plumbingCost * 0.60), isWork: true });
  if (cfg.floorsIncluded && bd.floorsCost > 0)         items.push({ name: "Укладка напольного покрытия", unit: "м²", qty: area, pricePerUnit: Math.round(bd.floorsCost * 0.35 / area), total: Math.round(bd.floorsCost * 0.35), isWork: true });
  if (cfg.ceilingsIncluded && bd.ceilingsCost > 0)     items.push({ name: "Работы по потолку", unit: "м²", qty: area, pricePerUnit: Math.round(bd.ceilingsCost * 0.45 / area), total: Math.round(bd.ceilingsCost * 0.45), isWork: true });
  if (cfg.bathroomIncluded && bd.bathroomsCost > 0)    items.push({ name: "Ремонт санузлов под ключ", unit: "санузел", qty: cfg.bathroomCount, pricePerUnit: Math.round(bd.bathroomsCost * 0.40 / cfg.bathroomCount), total: Math.round(bd.bathroomsCost * 0.40), isWork: true });
  if (cfg.doorsIncluded && cfg.doorsCount > 0 && bd.doorsCost > 0) items.push({ name: "Установка дверей", unit: "шт.", qty: cfg.doorsCount, pricePerUnit: Math.round(12000 * 0.30 * lc * rc), total: Math.round(cfg.doorsCount * 12000 * 0.30 * lc * rc), isWork: true });
  if (cfg.kitchenIncluded && bd.kitchenCost > 0) items.push({ name: "Монтаж кухонного гарнитура", unit: "компл.", qty: 1, pricePerUnit: bd.kitchenCost, total: bd.kitchenCost, isWork: true });
  if (cfg.furnitureAssembly && bd.furnitureCost > 0) items.push({ name: "Сборка мебели", unit: "компл.", qty: 1, pricePerUnit: bd.furnitureCost, total: bd.furnitureCost, isWork: true });

  return items;
}