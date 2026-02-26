import {
  REGIONS, ROOM_TYPES, RENOVATION_LEVELS, SCREED_TYPES,
  PLASTER_TYPES, CEILING_FINISH_TYPES, FLOORING_TYPES, DOOR_TYPES,
} from "./NewbuildTypes";
import type { NewbuildConfig } from "./NewbuildTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

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

export function calcNewbuildMaterials(
  cfg: Omit<NewbuildConfig, "id" | "totalPrice">,
  bd: NewbuildPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;
  const lc = bd.levelCoeff;
  const roomType = ROOM_TYPES.find(r => r.id === cfg.roomType);
  const screedType = SCREED_TYPES.find(s => s.id === cfg.screedType);
  const plasterType = PLASTER_TYPES.find(p => p.id === cfg.plasterType);
  const ceilingType = CEILING_FINISH_TYPES.find(c => c.id === cfg.ceilingType);
  const flooringType = FLOORING_TYPES.find(f => f.id === cfg.flooringType);
  const doorType = DOOR_TYPES.find(d => d.id === cfg.doorType);

  const area = cfg.area || 0;
  const wallCoeff = roomType?.wallCoeff ?? 2.4;
  const wallArea = Math.round(area * wallCoeff * 10) / 10;
  const items: MaterialItem[] = [];

  // ── МАТЕРИАЛЫ: Стяжка ────────────────────────────────────────────────────
  if (cfg.screedIncluded && bd.screedCost > 0 && screedType) {
    if (screedType.id === "dry") {
      items.push({ name: "Листы ГВЛ (сухая стяжка)", spec: "Knauf Суперпол, 1200×600 мм", unit: "м²", qty: Math.round(area * 1.08 * 10) / 10, pricePerUnit: Math.round(screedType.priceM2 * 0.6), total: Math.round(area * 1.08 * screedType.priceM2 * 0.6 * rc) });
      items.push({ name: "Керамзит фракция 5–10 мм", spec: "выравнивающий слой, 3 см", unit: "м³", qty: Math.round(area * 0.03 * 10) / 10, pricePerUnit: 2800, total: Math.round(area * 0.03 * 2800), isConsumable: true });
    } else if (screedType.id === "wet") {
      const cementKg = Math.ceil(area * 22);
      items.push({ name: "Цементно-песчаная смесь М200", spec: "мешки по 50 кг", unit: "кг", qty: cementKg, pricePerUnit: 9, total: cementKg * 9 });
      items.push({ name: "Фибра полипропиленовая", spec: "армирование стяжки", unit: "кг", qty: Math.ceil(area * 0.06), pricePerUnit: 380, total: Math.ceil(area * 0.06) * 380, isConsumable: true });
    } else {
      items.push({ name: "Самовыравнивающаяся смесь Vetonit", spec: "толщина 5–40 мм", unit: "кг", qty: Math.ceil(area * 15), pricePerUnit: 24, total: Math.ceil(area * 15) * 24 });
    }
    items.push({ name: "Грунтовка для пола", unit: "л", qty: Math.ceil(area * 0.2), pricePerUnit: 120, total: Math.ceil(area * 0.2) * 120, isConsumable: true });
    items.push({ name: "Маяки для стяжки", unit: "шт.", qty: Math.ceil(area / 3), pricePerUnit: 35, total: Math.ceil(area / 3) * 35, isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Штукатурка стен ────────────────────────────────────────────
  if (cfg.plasterIncluded && bd.plasterCost > 0 && plasterType) {
    const plasterKg = Math.ceil(wallArea * 12);
    items.push({ name: `Штукатурка ${plasterType.label}`, spec: plasterType.description, unit: "кг", qty: plasterKg, pricePerUnit: Math.round(plasterType.priceM2 * 0.55 * rc / (12)), total: Math.round(wallArea * plasterType.priceM2 * 0.55 * rc) });
    items.push({ name: "Грунтовка стен Ceresit CT17", unit: "л", qty: Math.ceil(wallArea * 0.15), pricePerUnit: 90, total: Math.ceil(wallArea * 0.15) * 90, isConsumable: true });
    items.push({ name: "Профили маячные для штукатурки", unit: "шт.", qty: Math.ceil(wallArea / 5), pricePerUnit: 45, total: Math.ceil(wallArea / 5) * 45, isConsumable: true });
    if (plasterType.id === "gypsum") {
      items.push({ name: "Шпаклёвка финишная Knauf HP Start", unit: "кг", qty: Math.ceil(wallArea * 1.2), pricePerUnit: 18, total: Math.ceil(wallArea * 1.2) * 18, isConsumable: true });
    }
  }

  // ── МАТЕРИАЛЫ: Потолок ───────────────────────────────────────────────────
  if (cfg.ceilingLevelIncluded && bd.ceilingCost > 0 && ceilingType) {
    if (ceilingType.id === "stretch") {
      items.push({ name: "Натяжной потолок (полотно + монтаж)", spec: "ПВХ матовый, белый", unit: "м²", qty: area, pricePerUnit: Math.round(ceilingType.priceM2 * 0.55 * lc * rc), total: Math.round(area * ceilingType.priceM2 * 0.55 * lc * rc) });
    } else if (ceilingType.id === "gypsum-board") {
      items.push({ name: "Лист ГКЛ 12,5 мм (потолочный)", spec: "Кнауф", unit: "м²", qty: Math.round(area * 1.1 * 10) / 10, pricePerUnit: 280, total: Math.round(area * 1.1 * 280) });
      items.push({ name: "Профиль CD 60 для каркаса", unit: "м.п.", qty: Math.ceil(area * 2.8), pricePerUnit: 65, total: Math.ceil(area * 2.8) * 65 });
      items.push({ name: "Серпянка, шурупы, дюбели", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 45), total: Math.round(area * 45), isConsumable: true });
    } else {
      items.push({ name: "Шпаклёвка потолка Knauf Multifinish", unit: "кг", qty: Math.ceil(area * 0.8), pricePerUnit: 28, total: Math.ceil(area * 0.8) * 28 });
      items.push({ name: "Грунтовка потолка", unit: "л", qty: Math.ceil(area * 0.15), pricePerUnit: 90, total: Math.ceil(area * 0.15) * 90, isConsumable: true });
    }
  }

  // ── МАТЕРИАЛЫ: Покраска ──────────────────────────────────────────────────
  if ((cfg.paintingWalls || cfg.paintingCeiling) && bd.paintCost > 0) {
    const paintArea = (cfg.paintingWalls ? wallArea : 0) + (cfg.paintingCeiling ? area : 0);
    const paintL = Math.ceil(paintArea * 0.12 * cfg.paintLayersCount);
    items.push({ name: "Краска интерьерная (латексная)", spec: `${cfg.paintLayersCount} слоя, белая`, unit: "л", qty: paintL, pricePerUnit: Math.round(bd.paintCost * 0.40 / paintL), total: Math.round(bd.paintCost * 0.40) });
    items.push({ name: "Валик, кисти, малярная лента", unit: "компл.", qty: 1, pricePerUnit: Math.round(paintArea * 12), total: Math.round(paintArea * 12), isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Полы ──────────────────────────────────────────────────────
  if (bd.flooringCost > 0 && flooringType) {
    const floorQty = Math.round(area * 1.07 * 10) / 10;
    items.push({ name: flooringType.label, spec: flooringType.description, unit: "м²", qty: floorQty, pricePerUnit: Math.round(flooringType.priceM2 * 0.65 * lc), total: Math.round(floorQty * flooringType.priceM2 * 0.65 * lc) });
    if (flooringType.id === "laminate" || flooringType.id === "parquet") {
      items.push({ name: "Подложка под ламинат/паркет 3 мм", unit: "м²", qty: Math.round(area * 1.05 * 10) / 10, pricePerUnit: 95, total: Math.round(area * 1.05 * 95), isConsumable: true });
    }
    if (flooringType.id === "tile") {
      items.push({ name: "Клей плиточный C2", unit: "кг", qty: Math.ceil(area * 6), pricePerUnit: 28, total: Math.ceil(area * 6) * 28, isConsumable: true });
      items.push({ name: "Затирка швов", unit: "кг", qty: Math.ceil(area * 0.5), pricePerUnit: 180, total: Math.ceil(area * 0.5) * 180, isConsumable: true });
    }
  }

  // ── МАТЕРИАЛЫ: Электрика ─────────────────────────────────────────────────
  if (cfg.electricsIncluded && bd.electricsCost > 0) {
    items.push({ name: "Розетки одинарные", unit: "шт.", qty: cfg.outletsCount, pricePerUnit: Math.round(550 * 0.5), total: Math.round(cfg.outletsCount * 550 * 0.5 * rc) });
    items.push({ name: "Выключатели", unit: "шт.", qty: cfg.switchesCount, pricePerUnit: Math.round(450 * 0.5), total: Math.round(cfg.switchesCount * 450 * 0.5 * rc) });
    items.push({ name: "Кабель ВВГнг-LS", spec: "3×2,5 мм², метраж по плану", unit: "м.п.", qty: Math.round((cfg.outletsCount + cfg.switchesCount) * 4), pricePerUnit: 55, total: Math.round((cfg.outletsCount + cfg.switchesCount) * 4 * 55), isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Двери ─────────────────────────────────────────────────────
  if (cfg.doorsCount > 0 && bd.doorsCost > 0 && doorType) {
    items.push({ name: `Дверной блок: ${doorType.label}`, spec: doorType.description, unit: "компл.", qty: cfg.doorsCount, pricePerUnit: Math.round(doorType.pricePerDoor * 0.70 * rc), total: Math.round(cfg.doorsCount * doorType.pricePerDoor * 0.70 * rc) });
    items.push({ name: "Фурнитура для дверей (ручки, петли)", unit: "компл.", qty: cfg.doorsCount, pricePerUnit: 850, total: cfg.doorsCount * 850, isConsumable: true });
  }

  // ── МАТЕРИАЛЫ: Откосы окон ───────────────────────────────────────────────
  if (cfg.windowSlopesCount > 0 && bd.windowSlopesCost > 0) {
    items.push({ name: "Откосы оконные (сэндвич-панель)", unit: "компл.", qty: cfg.windowSlopesCount, pricePerUnit: Math.round(3500 * 0.5 * rc), total: Math.round(cfg.windowSlopesCount * 3500 * 0.5 * rc) });
    items.push({ name: "Наличники, профили откосов", unit: "компл.", qty: cfg.windowSlopesCount, pricePerUnit: 320, total: cfg.windowSlopesCount * 320, isConsumable: true });
  }

  // ── РАБОТЫ ───────────────────────────────────────────────────────────────
  if (cfg.screedIncluded && bd.screedCost > 0)
    items.push({ name: `Устройство стяжки (${screedType?.label ?? ""})`, unit: "м²", qty: area, pricePerUnit: Math.round(bd.screedCost * 0.40 / area), total: Math.round(bd.screedCost * 0.40), isWork: true });
  if (cfg.plasterIncluded && bd.plasterCost > 0)
    items.push({ name: `Штукатурка стен (${plasterType?.label ?? ""})`, unit: "м²", qty: wallArea, pricePerUnit: Math.round(bd.plasterCost * 0.45 / wallArea), total: Math.round(bd.plasterCost * 0.45), isWork: true });
  if (cfg.ceilingLevelIncluded && bd.ceilingCost > 0)
    items.push({ name: `Устройство потолка (${ceilingType?.label ?? ""})`, unit: "м²", qty: area, pricePerUnit: Math.round(bd.ceilingCost * 0.45 / area), total: Math.round(bd.ceilingCost * 0.45), isWork: true });
  if ((cfg.paintingWalls || cfg.paintingCeiling) && bd.paintCost > 0)
    items.push({ name: "Малярные работы (стены/потолок)", unit: "м²", qty: (cfg.paintingWalls ? wallArea : 0) + (cfg.paintingCeiling ? area : 0), pricePerUnit: Math.round(280 * cfg.paintLayersCount * lc * rc), total: Math.round(bd.paintCost * 0.60), isWork: true });
  if (bd.flooringCost > 0)
    items.push({ name: `Укладка пола (${flooringType?.label ?? ""})`, unit: "м²", qty: area, pricePerUnit: Math.round(bd.flooringCost * 0.35 / area), total: Math.round(bd.flooringCost * 0.35), isWork: true });
  if (cfg.electricsIncluded && bd.electricsCost > 0)
    items.push({ name: "Монтаж электрики (розетки, выключатели)", unit: "точка", qty: cfg.outletsCount + cfg.switchesCount, pricePerUnit: Math.round(bd.electricsCost * 0.50 / (cfg.outletsCount + cfg.switchesCount || 1)), total: Math.round(bd.electricsCost * 0.50), isWork: true });
  if (cfg.doorsCount > 0 && bd.doorsCost > 0)
    items.push({ name: "Установка дверей", unit: "шт.", qty: cfg.doorsCount, pricePerUnit: Math.round(doorType ? doorType.pricePerDoor * 0.30 * rc : 0), total: Math.round(cfg.doorsCount * (doorType?.pricePerDoor ?? 0) * 0.30 * rc), isWork: true });
  if (cfg.windowSlopesCount > 0 && bd.windowSlopesCost > 0)
    items.push({ name: "Монтаж откосов", unit: "компл.", qty: cfg.windowSlopesCount, pricePerUnit: Math.round(3500 * 0.50 * rc), total: Math.round(cfg.windowSlopesCount * 3500 * 0.50 * rc), isWork: true });

  return items;
}