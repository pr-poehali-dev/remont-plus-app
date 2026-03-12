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
  worksTotal: number;
  materialsTotal: number;
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
  const area = cfg.area || 0;
  const ceilH = cfg.ceilingHeightM || 2.8;
  const wallCoeff = roomType?.wallCoeff ?? 2.4;
  const wallArea = Math.round(area * wallCoeff * ceilH / 2.8 * 10) / 10;

  // ── Стяжка: цена из типа × уровень (работа + материал) ──────────────────
  const screedPriceM2 = screedType?.priceM2 ?? 1100;
  const screedCost = cfg.screedIncluded
    ? Math.round(area * screedPriceM2 * lc * tc * rc)
    : 0;

  // ── Штукатурка стен: цена из типа × уровень ──────────────────────────────
  const plasterPriceM2 = plasterType?.priceM2 ?? 720;
  const plasterCost = cfg.plasterIncluded
    ? Math.round(wallArea * plasterPriceM2 * lc * tc * rc)
    : 0;

  // ── Потолок: цена из типа × уровень ──────────────────────────────────────
  const ceilPriceM2 = ceilingType?.priceM2 ?? 850;
  const ceilingCost = cfg.ceilingLevelIncluded
    ? Math.round(area * ceilPriceM2 * lc * tc * rc)
    : 0;

  // ── Покраска: 200 ₽/м²/слой (работа), уровень влияет на качество краски
  let paintArea = 0;
  if (cfg.paintingWalls) paintArea += wallArea;
  if (cfg.paintingCeiling) paintArea += area;
  const paintCost = paintArea > 0
    ? Math.round(paintArea * 200 * (cfg.paintLayersCount || 2) * lc * rc)
    : 0;

  // ── Напольное покрытие: работа 700 ₽/м² + материал × уровень ─────────────
  const floorMaterialM2 = flooringType?.priceM2 ?? 1100;
  const flooringCost = Math.round(area * (700 + floorMaterialM2 * lc) * tc * rc);

  // ── Электрика: 900 ₽/м² разводка + 800 ₽/точка ───────────────────────────
  const electricsCost = cfg.electricsIncluded
    ? Math.round((area * 900 + (cfg.outletsCount + cfg.switchesCount) * 800) * lc * tc * rc)
    : 0;

  // ── Двери: pricePerDoor × количество × уровень (материал + монтаж) ───────
  const doorPrice = doorType?.pricePerDoor ?? 20000;
  const doorsCost = cfg.doorsCount > 0
    ? Math.round(cfg.doorsCount * doorPrice * lc * rc)
    : 0;

  // ── Откосы: 4 000 ₽/проём (ПВХ-панель + монтаж) ─────────────────────────
  const windowSlopesCost = cfg.windowSlopesCount > 0
    ? Math.round(cfg.windowSlopesCount * 4000 * rc)
    : 0;

  const worksSubtotal = screedCost + plasterCost + ceilingCost + paintCost +
    flooringCost + electricsCost + doorsCost + windowSlopesCost;

  // Материальная составляющая
  const materialsCost = Math.round(
    screedCost       * 0.60 +
    plasterCost      * 0.55 +
    ceilingCost      * 0.55 +
    paintCost        * 0.40 +
    flooringCost     * 0.65 +
    electricsCost    * 0.50 +
    doorsCost        * 0.70 +
    windowSlopesCost * 0.50,
  );

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
  const ceilH = cfg.ceilingHeightM || 2.8;
  const wallCoeff = roomType?.wallCoeff ?? 2.4;
  const wallArea = Math.round(area * wallCoeff * ceilH / 2.8 * 10) / 10;
  const items: MaterialItem[] = [];

  if (cfg.screedIncluded && bd.screedCost > 0 && screedType) {
    if (screedType.id === "dry") {
      items.push({ name: "Листы ГВЛ (сухая стяжка)", spec: "Knauf Суперпол, 1200×600 мм", unit: "м²", qty: Math.round(area * 1.08 * 10) / 10, pricePerUnit: Math.round(screedType.priceM2 * 0.6), total: Math.round(area * 1.08 * screedType.priceM2 * 0.6 * rc) });
      items.push({ name: "Керамзит фракция 5–10 мм", spec: "3 см", unit: "м³", qty: Math.round(area * 0.03 * 10) / 10, pricePerUnit: 3600, total: Math.round(area * 0.03 * 3600), isConsumable: true });
    } else if (screedType.id === "wet") {
      const cementKg = Math.ceil(area * 22);
      items.push({ name: "Цементно-песчаная смесь М200", spec: "мешки 50 кг", unit: "кг", qty: cementKg, pricePerUnit: 12, total: cementKg * 12 });
      items.push({ name: "Фибра полипропиленовая", unit: "кг", qty: Math.ceil(area * 0.06), pricePerUnit: 480, total: Math.ceil(area * 0.06) * 480, isConsumable: true });
    } else {
      items.push({ name: "Самовыравнивающаяся смесь Vetonit", spec: "5–40 мм", unit: "кг", qty: Math.ceil(area * 15), pricePerUnit: 32, total: Math.ceil(area * 15) * 32 });
    }
    items.push({ name: "Грунтовка для пола", unit: "л", qty: Math.ceil(area * 0.2), pricePerUnit: 150, total: Math.ceil(area * 0.2) * 150, isConsumable: true });
    items.push({ name: "Маяки для стяжки", unit: "шт.", qty: Math.ceil(area / 3), pricePerUnit: 45, total: Math.ceil(area / 3) * 45, isConsumable: true });
  }

  if (cfg.plasterIncluded && bd.plasterCost > 0 && plasterType) {
    const plasterKg = Math.ceil(wallArea * 12);
    items.push({ name: `Штукатурка ${plasterType.label}`, spec: plasterType.description, unit: "кг", qty: plasterKg, pricePerUnit: Math.round(plasterType.priceM2 * 0.55 * rc / 12), total: Math.round(wallArea * plasterType.priceM2 * 0.55 * rc) });
    items.push({ name: "Грунтовка стен Ceresit CT17", unit: "л", qty: Math.ceil(wallArea * 0.15), pricePerUnit: 120, total: Math.ceil(wallArea * 0.15) * 120, isConsumable: true });
    items.push({ name: "Профили маячные", unit: "шт.", qty: Math.ceil(wallArea / 5), pricePerUnit: 58, total: Math.ceil(wallArea / 5) * 58, isConsumable: true });
  }

  if (cfg.ceilingLevelIncluded && bd.ceilingCost > 0 && ceilingType) {
    if (ceilingType.id === "stretch") {
      items.push({ name: "Натяжное полотно ПВХ", unit: "м²", qty: Math.round(area * 1.05), pricePerUnit: Math.round(ceilingType.priceM2 * lc * 0.5), total: Math.round(area * 1.05 * ceilingType.priceM2 * lc * 0.5) });
      items.push({ name: "Профиль для натяжного потолка", unit: "м.п.", qty: Math.round(Math.sqrt(area) * 4), pricePerUnit: 125, total: Math.round(Math.sqrt(area) * 4 * 125) });
    } else if (ceilingType.id === "gypsum-board") {
      const gkpArea = Math.round(area * 1.05);
      items.push({ name: "Гипсокартон потолочный Knauf", spec: "9.5 мм", unit: "м²", qty: gkpArea, pricePerUnit: Math.round(360 * rc), total: Math.round(gkpArea * 360 * rc) });
      items.push({ name: "Профиль CD/UD и подвесы", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 125), total: Math.round(area * 125), isConsumable: true });
    } else {
      items.push({ name: "Шпаклёвка потолочная Bergauf", unit: "кг", qty: Math.ceil(area * 0.9), pricePerUnit: 29, total: Math.ceil(area * 0.9) * 29 });
      items.push({ name: "Грунтовка потолка", unit: "л", qty: Math.ceil(area * 0.15), pricePerUnit: 120, total: Math.ceil(area * 0.15) * 120, isConsumable: true });
    }
  }

  if ((cfg.paintingWalls || cfg.paintingCeiling) && bd.paintCost > 0) {
    const paintArea = (cfg.paintingWalls ? wallArea : 0) + (cfg.paintingCeiling ? area : 0);
    const litres = Math.ceil(paintArea * 0.18 * cfg.paintLayersCount);
    items.push({ name: `Краска интерьерная Dulux / Tikkurila`, spec: `${cfg.paintLayersCount} слоя`, unit: "л", qty: litres, pricePerUnit: Math.round(125 * lc), total: Math.round(litres * 125 * lc) });
    items.push({ name: "Грунтовка под краску", unit: "л", qty: Math.ceil(paintArea * 0.12), pricePerUnit: 110, total: Math.ceil(paintArea * 0.12) * 110, isConsumable: true });
    items.push({ name: "Малярный скотч, валики, кисти", unit: "компл.", qty: 1, pricePerUnit: Math.round(paintArea * 20), total: Math.round(paintArea * 20), isConsumable: true });
  }

  if (bd.flooringCost > 0 && flooringType) {
    const floorQty = Math.round(area * 1.08 * 10) / 10;
    items.push({ name: `Напольное покрытие: ${flooringType.label}`, spec: "+8% отход", unit: "м²", qty: floorQty, pricePerUnit: Math.round(flooringType.priceM2 * lc * rc * 0.6), total: Math.round(floorQty * flooringType.priceM2 * lc * rc * 0.6) });
    items.push({ name: "Подложка 3 мм", unit: "м²", qty: Math.round(area * 1.05), pricePerUnit: 75, total: Math.round(area * 1.05 * 75) });
    items.push({ name: "Плинтус напольный", unit: "м.п.", qty: Math.round(Math.sqrt(area) * 4), pricePerUnit: 240, total: Math.round(Math.sqrt(area) * 4 * 240) });
    items.push({ name: "Клей, дюбели, саморезы", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 45), total: Math.round(area * 45), isConsumable: true });
  }

  if (cfg.electricsIncluded && bd.electricsCost > 0) {
    items.push({ name: "Кабель ВВГнг-LS 3×2,5 мм²", unit: "м.п.", qty: Math.round(area * 4), pricePerUnit: 72, total: Math.round(area * 4 * 72) });
    items.push({ name: "Розетки, выключатели, коробки", unit: "компл.", qty: 1, pricePerUnit: Math.round((cfg.outletsCount * 420 + cfg.switchesCount * 360) * lc), total: Math.round((cfg.outletsCount * 420 + cfg.switchesCount * 360) * lc), isConsumable: true });
    items.push({ name: "Гофра, подрозетники", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 80), total: Math.round(area * 80), isConsumable: true });
  }

  if (cfg.doorsCount > 0 && bd.doorsCost > 0 && doorType) {
    items.push({ name: `Двери ${doorType.label}`, spec: "с коробкой и фурнитурой", unit: "компл.", qty: cfg.doorsCount, pricePerUnit: Math.round(doorType.pricePerDoor * 0.70 * rc), total: Math.round(cfg.doorsCount * doorType.pricePerDoor * 0.70 * rc) });
    items.push({ name: "Наличники, петли, ручки", unit: "компл.", qty: cfg.doorsCount, pricePerUnit: Math.round(doorType.pricePerDoor * 0.05), total: Math.round(cfg.doorsCount * doorType.pricePerDoor * 0.05), isConsumable: true });
  }

  if (cfg.windowSlopesCount > 0 && bd.windowSlopesCost > 0) {
    items.push({ name: "Откосы оконные ПВХ", unit: "компл.", qty: cfg.windowSlopesCount, pricePerUnit: Math.round(bd.windowSlopesCost * 0.50 / cfg.windowSlopesCount), total: Math.round(bd.windowSlopesCost * 0.50) });
    items.push({ name: "Монтажная пена, герметик", unit: "компл.", qty: 1, pricePerUnit: Math.round(cfg.windowSlopesCount * 490), total: Math.round(cfg.windowSlopesCount * 490), isConsumable: true });
  }

  // ── Малярный инструмент и расходники ────────────────────────────────────────
  {
    const paintSurface = wallArea + area;
    const rollersQty = Math.ceil(paintSurface / 60);
    const brushesQty = Math.ceil(paintSurface / 40);
    items.push({ name: "Валики малярные ∅180 мм (нейлон)", unit: "шт.", qty: rollersQty, pricePerUnit: 280, total: rollersQty * 280, isConsumable: true });
    items.push({ name: "Кисти малярные (набор: 25/50/75 мм)", unit: "набор", qty: brushesQty, pricePerUnit: 350, total: brushesQty * 350, isConsumable: true });
    items.push({ name: "Лоток малярный с сеткой", unit: "шт.", qty: Math.max(1, rollersQty), pricePerUnit: 180, total: Math.max(1, rollersQty) * 180, isConsumable: true });
    items.push({ name: "Малярный скотч 50 мм", unit: "шт.", qty: Math.ceil(wallArea / 30), pricePerUnit: 95, total: Math.ceil(wallArea / 30) * 95, isConsumable: true });
    items.push({ name: "Плёнка защитная 4×5 м", unit: "шт.", qty: Math.ceil(area / 18), pricePerUnit: 140, total: Math.ceil(area / 18) * 140, isConsumable: true });
    items.push({ name: "Шпатели (набор: 80/150/250 мм)", unit: "набор", qty: Math.max(2, Math.ceil(area / 30)), pricePerUnit: 420, total: Math.max(2, Math.ceil(area / 30)) * 420, isConsumable: true });
    items.push({ name: "Перчатки строительные (нитрил)", unit: "пар", qty: Math.ceil(area / 10), pricePerUnit: 55, total: Math.ceil(area / 10) * 55, isConsumable: true });
    items.push({ name: "Респираторы FFP2 (при шлифовке, штукатурке)", unit: "шт.", qty: Math.ceil(area / 20), pricePerUnit: 85, total: Math.ceil(area / 20) * 85, isConsumable: true });
    items.push({ name: "Мусорные мешки строительные 120 л", unit: "шт.", qty: Math.ceil(area / 5), pricePerUnit: 28, total: Math.ceil(area / 5) * 28, isConsumable: true });
    items.push({ name: "Наждачная бумага / абразивная сетка", unit: "шт.", qty: Math.ceil(wallArea / 8), pricePerUnit: 45, total: Math.ceil(wallArea / 8) * 45, isConsumable: true });
  }

  // ── Доставка стройматериалов и подъём на этаж ─────────────────────────────
  if (cfg.deliveryIncluded) {
    const floorN = cfg.floorNumber || 1;
    const weightTonnes = Math.max(0.3, Math.round(area * 25 / 1000 * 10) / 10);
    const deliveryBase = Math.round(weightTonnes * 3500 * rc);
    const liftCost = floorN > 1 ? Math.round(weightTonnes * 250 * (floorN - 1) * rc) : 0;
    items.push({
      name: "Доставка стройматериалов",
      spec: `~${weightTonnes} т, до подъезда`,
      unit: "рейс",
      qty: Math.max(1, Math.ceil(weightTonnes / 3)),
      pricePerUnit: Math.round(deliveryBase / Math.max(1, Math.ceil(weightTonnes / 3))),
      total: deliveryBase,
    });
    if (liftCost > 0) {
      items.push({
        name: `Подъём материалов на ${floorN}-й этаж`,
        spec: "без лифта / по договорённости с грузчиками",
        unit: "т",
        qty: weightTonnes,
        pricePerUnit: Math.round(250 * (floorN - 1) * rc),
        total: liftCost,
      });
    }
  }

  return items;
}