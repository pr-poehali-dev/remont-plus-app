import {
  REGIONS, ROOM_TYPES, RENOVATION_LEVELS, SCREED_TYPES,
  PLASTER_TYPES, CEILING_FINISH_TYPES, FLOORING_TYPES, DOOR_TYPES,
  HEATED_FLOOR_TYPES, BACKSPLASH_TYPES, COUNTERTOP_TYPES,
  CONDITIONER_TYPES, SOUNDPROOF_TYPES,
  BATHTUB_TYPES, SHOWER_TYPES, TOILET_TYPES, SINK_TYPES, PLUMBING_PIPES_TYPES,
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
  const K = 1.3;

  const screedPriceM2 = screedType?.priceM2 ?? 1100;
  const screedCost = cfg.screedIncluded
    ? Math.round(area * screedPriceM2 * K * lc * tc * rc)
    : 0;

  const plasterPriceM2 = plasterType?.priceM2 ?? 720;
  const plasterCost = cfg.plasterIncluded
    ? Math.round(wallArea * plasterPriceM2 * K * lc * tc * rc)
    : 0;

  const ceilPriceM2 = ceilingType?.priceM2 ?? 850;
  const ceilingCost = cfg.ceilingLevelIncluded
    ? Math.round(area * ceilPriceM2 * K * lc * tc * rc)
    : 0;

  let paintArea = 0;
  if (cfg.paintingWalls) paintArea += wallArea;
  if (cfg.paintingCeiling) paintArea += area;
  const paintCost = paintArea > 0
    ? Math.round(paintArea * 286 * (cfg.paintLayersCount || 2) * lc * rc)
    : 0;

  const floorMaterialM2 = flooringType?.priceM2 ?? 1100;
  const flooringCost = Math.round(area * (1001 + floorMaterialM2 * K * lc) * tc * rc);

  const electricsCost = cfg.electricsIncluded
    ? Math.round((area * 1287 + (cfg.outletsCount + cfg.switchesCount) * 1144) * lc * tc * rc)
    : 0;

  const doorPrice = doorType?.pricePerDoor ?? 20000;
  const doorsCost = cfg.doorsCount > 0
    ? Math.round(cfg.doorsCount * doorPrice * K * lc * rc)
    : 0;

  const windowSlopesCost = cfg.windowSlopesCount > 0
    ? Math.round(cfg.windowSlopesCount * 5720 * rc)
    : 0;

  const heatedFloorType = HEATED_FLOOR_TYPES.find(h => h.id === cfg.heatedFloorType);
  const hfArea = cfg.heatedFloorArea > 0 ? cfg.heatedFloorArea : area * 0.7;
  const heatedFloorCost = cfg.heatedFloorIncluded
    ? Math.round(hfArea * (heatedFloorType?.priceM2 ?? 2750) * K * lc * rc)
    : 0;

  const backsplashType = BACKSPLASH_TYPES.find(b => b.id === cfg.backsplashType);
  const backsplashCost = cfg.backsplashIncluded
    ? Math.round((cfg.backsplashArea || 3) * (backsplashType?.priceM2 ?? 3850) * K * lc * rc)
    : 0;

  const countertopType = COUNTERTOP_TYPES.find(c => c.id === cfg.countertopType);
  const countertopCost = cfg.countertopIncluded
    ? Math.round((cfg.countertopLength || 3) * (countertopType?.pricePerMeter ?? 4400) * K * lc * rc)
    : 0;

  const conditionerType = CONDITIONER_TYPES.find(c => c.id === cfg.conditionerType);
  const conditionerCost = cfg.conditionerIncluded
    ? Math.round((cfg.conditionerCount || 1) * (conditionerType?.pricePerUnit ?? 38500) * K * rc)
    : 0;

  const soundproofType = SOUNDPROOF_TYPES.find(s => s.id === cfg.soundproofType);
  const soundproofCost = cfg.soundproofIncluded
    ? Math.round(area * (soundproofType?.priceM2 ?? 1650) * K * lc * rc)
    : 0;

  let plumbingCost = 0;
  if (cfg.plumbingIncluded) {
    const pipesType = PLUMBING_PIPES_TYPES.find(p => p.id === cfg.plumbingPipesType);
    plumbingCost += Math.round((cfg.plumbingPointsCount || 4) * (pipesType?.pricePerPoint ?? 4400) * K * rc);

    if (cfg.bathtubIncluded) {
      const bt = BATHTUB_TYPES.find(b => b.id === cfg.bathtubType);
      plumbingCost += Math.round((bt?.pricePerUnit ?? 18700) * K * lc * rc);
    }
    if (cfg.showerIncluded) {
      const sh = SHOWER_TYPES.find(s => s.id === cfg.showerType);
      plumbingCost += Math.round((sh?.pricePerUnit ?? 22000) * K * lc * rc);
    }
    if (cfg.toiletIncluded) {
      const tl = TOILET_TYPES.find(t => t.id === cfg.toiletType);
      plumbingCost += Math.round((cfg.toiletCount || 1) * (tl?.pricePerUnit ?? 16500) * K * lc * rc);
    }
    if (cfg.sinkIncluded) {
      const sk = SINK_TYPES.find(s => s.id === cfg.sinkType);
      plumbingCost += Math.round((cfg.sinkCount || 1) * (sk?.pricePerUnit ?? 15400) * K * lc * rc);
    }
  }

  const worksSubtotal = screedCost + plasterCost + ceilingCost + paintCost +
    flooringCost + electricsCost + doorsCost + windowSlopesCost +
    heatedFloorCost + backsplashCost + countertopCost + conditionerCost + soundproofCost +
    plumbingCost;

  const materialsCost = Math.round(
    screedCost       * 0.60 +
    plasterCost      * 0.55 +
    ceilingCost      * 0.55 +
    paintCost        * 0.40 +
    flooringCost     * 0.65 +
    electricsCost    * 0.50 +
    doorsCost        * 0.70 +
    windowSlopesCost * 0.50 +
    heatedFloorCost    * 0.55 +
    backsplashCost     * 0.60 +
    countertopCost     * 0.75 +
    conditionerCost    * 0.70 +
    soundproofCost     * 0.60 +
    plumbingCost       * 0.65,
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
    heatedFloorCost,
    backsplashCost,
    countertopCost,
    conditionerCost,
    soundproofCost,
    plumbingCost,
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

  if (cfg.heatedFloorIncluded && bd.heatedFloorCost > 0) {
    const hfType = HEATED_FLOOR_TYPES.find(h => h.id === cfg.heatedFloorType);
    const hfA = cfg.heatedFloorArea > 0 ? cfg.heatedFloorArea : area * 0.7;
    if (cfg.heatedFloorType === "water") {
      items.push({ name: "Труба PEX-a для тёплого пола", spec: "16×2 мм, бухта", unit: "м.п.", qty: Math.round(hfA * 6.5), pricePerUnit: 85, total: Math.round(hfA * 6.5 * 85) });
      items.push({ name: "Коллектор тёплого пола", unit: "компл.", qty: 1, pricePerUnit: Math.round(8500 * rc), total: Math.round(8500 * rc) });
    } else {
      items.push({ name: `Нагревательный ${cfg.heatedFloorType === "electric-mat" ? "мат" : "кабель"}`, spec: hfType?.description ?? "", unit: "м²", qty: Math.round(hfA * 10) / 10, pricePerUnit: Math.round((hfType?.priceM2 ?? 2750) * 0.55), total: Math.round(hfA * (hfType?.priceM2 ?? 2750) * 0.55) });
    }
    items.push({ name: "Терморегулятор с датчиком", unit: "шт.", qty: 1, pricePerUnit: Math.round(3200 * rc), total: Math.round(3200 * rc) });
    items.push({ name: "Теплоизоляция (пенополистирол 20 мм)", unit: "м²", qty: Math.round(hfA * 1.05), pricePerUnit: 180, total: Math.round(hfA * 1.05 * 180), isConsumable: true });
  }

  if (cfg.backsplashIncluded && bd.backsplashCost > 0) {
    const bsType = BACKSPLASH_TYPES.find(b => b.id === cfg.backsplashType);
    const bsArea = cfg.backsplashArea || 3;
    items.push({ name: `Фартук: ${bsType?.label ?? "плитка"}`, spec: bsType?.description ?? "", unit: "м²", qty: Math.round(bsArea * 1.1 * 10) / 10, pricePerUnit: Math.round((bsType?.priceM2 ?? 3850) * 0.6), total: Math.round(bsArea * 1.1 * (bsType?.priceM2 ?? 3850) * 0.6) });
    if (cfg.backsplashType !== "glass") {
      items.push({ name: "Плиточный клей, затирка", unit: "компл.", qty: 1, pricePerUnit: Math.round(bsArea * 350), total: Math.round(bsArea * 350), isConsumable: true });
    }
  }

  if (cfg.countertopIncluded && bd.countertopCost > 0) {
    const ctType = COUNTERTOP_TYPES.find(c => c.id === cfg.countertopType);
    const ctLen = cfg.countertopLength || 3;
    items.push({ name: `Столешница: ${ctType?.label ?? "ДСП"}`, spec: `${ctLen} м.п., глубина 600 мм`, unit: "м.п.", qty: ctLen, pricePerUnit: Math.round((ctType?.pricePerMeter ?? 4400) * 0.75 * rc), total: Math.round(ctLen * (ctType?.pricePerMeter ?? 4400) * 0.75 * rc) });
    items.push({ name: "Кромка, торцевые планки, герметик", unit: "компл.", qty: 1, pricePerUnit: Math.round(ctLen * 420), total: Math.round(ctLen * 420), isConsumable: true });
  }

  if (cfg.conditionerIncluded && bd.conditionerCost > 0) {
    const acType = CONDITIONER_TYPES.find(c => c.id === cfg.conditionerType);
    const acQty = cfg.conditionerCount || 1;
    items.push({ name: `${acType?.label ?? "Сплит-система"}`, spec: acType?.description ?? "", unit: "компл.", qty: acQty, pricePerUnit: Math.round((acType?.pricePerUnit ?? 38500) * 0.70), total: Math.round(acQty * (acType?.pricePerUnit ?? 38500) * 0.70) });
    items.push({ name: "Медная трасса + дренаж", spec: "до 5 м.п.", unit: "компл.", qty: acQty, pricePerUnit: Math.round(4500 * rc), total: Math.round(acQty * 4500 * rc), isConsumable: true });
  }

  if (cfg.soundproofIncluded && bd.soundproofCost > 0) {
    const spType = SOUNDPROOF_TYPES.find(s => s.id === cfg.soundproofType);
    if (cfg.soundproofType === "premium") {
      items.push({ name: "Минвата акустическая 50 мм", unit: "м²", qty: Math.round(area * 2.5), pricePerUnit: 320, total: Math.round(area * 2.5 * 320) });
      items.push({ name: "ГКЛ акустический (стены+потолок)", unit: "м²", qty: Math.round(area * 3), pricePerUnit: 480, total: Math.round(area * 3 * 480) });
    } else if (cfg.soundproofType === "enhanced") {
      items.push({ name: "Минвата акустическая 50 мм", unit: "м²", qty: Math.round(area * 1.8), pricePerUnit: 320, total: Math.round(area * 1.8 * 320) });
      items.push({ name: "ГКЛ акустический 12.5 мм (2 слоя)", unit: "м²", qty: Math.round(area * 1.5 * 2), pricePerUnit: 480, total: Math.round(area * 1.5 * 2 * 480) });
    } else {
      items.push({ name: "Минвата акустическая 50 мм", unit: "м²", qty: Math.round(area * 1.2), pricePerUnit: 320, total: Math.round(area * 1.2 * 320) });
      items.push({ name: "ГКЛ 12.5 мм", unit: "м²", qty: Math.round(area * 1.2), pricePerUnit: 360, total: Math.round(area * 1.2 * 360) });
    }
    items.push({ name: "Виброподвесы, профиль, уплотнители", spec: spType?.label ?? "", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 180 * rc), total: Math.round(area * 180 * rc), isConsumable: true });
  }

  if (cfg.plumbingIncluded && bd.plumbingCost > 0) {
    const pipesType = PLUMBING_PIPES_TYPES.find(p => p.id === cfg.plumbingPipesType);
    const pts = cfg.plumbingPointsCount || 4;
    items.push({ name: `Трубы ${pipesType?.label ?? "ППР"}`, spec: `разводка, ${pts} точек`, unit: "компл.", qty: 1, pricePerUnit: Math.round(pts * (pipesType?.pricePerPoint ?? 4400) * 0.5 * rc), total: Math.round(pts * (pipesType?.pricePerPoint ?? 4400) * 0.5 * rc) });
    items.push({ name: "Фитинги, запорная арматура, краны", unit: "компл.", qty: 1, pricePerUnit: Math.round(pts * 850 * rc), total: Math.round(pts * 850 * rc), isConsumable: true });

    if (cfg.bathtubIncluded) {
      const bt = BATHTUB_TYPES.find(b => b.id === cfg.bathtubType);
      items.push({ name: `Ванна: ${bt?.label ?? "акриловая"}`, spec: bt?.description ?? "", unit: "шт.", qty: 1, pricePerUnit: Math.round((bt?.pricePerUnit ?? 18700) * 0.65 * rc), total: Math.round((bt?.pricePerUnit ?? 18700) * 0.65 * rc) });
      items.push({ name: "Смеситель для ванны + сифон", unit: "компл.", qty: 1, pricePerUnit: Math.round(4200 * lc * rc), total: Math.round(4200 * lc * rc), isConsumable: true });
    }
    if (cfg.showerIncluded) {
      const sh = SHOWER_TYPES.find(s => s.id === cfg.showerType);
      items.push({ name: `Душ: ${sh?.label ?? "кабина"}`, spec: sh?.description ?? "", unit: "шт.", qty: 1, pricePerUnit: Math.round((sh?.pricePerUnit ?? 22000) * 0.65 * rc), total: Math.round((sh?.pricePerUnit ?? 22000) * 0.65 * rc) });
      items.push({ name: "Смеситель душа + лейка + шланг", unit: "компл.", qty: 1, pricePerUnit: Math.round(3800 * lc * rc), total: Math.round(3800 * lc * rc), isConsumable: true });
    }
    if (cfg.toiletIncluded) {
      const tl = TOILET_TYPES.find(t => t.id === cfg.toiletType);
      const tqty = cfg.toiletCount || 1;
      items.push({ name: `Унитаз: ${tl?.label ?? "напольный"}`, spec: tl?.description ?? "", unit: "шт.", qty: tqty, pricePerUnit: Math.round((tl?.pricePerUnit ?? 16500) * 0.65 * rc), total: Math.round(tqty * (tl?.pricePerUnit ?? 16500) * 0.65 * rc) });
      items.push({ name: "Гофра, крепёж, герметик", unit: "компл.", qty: tqty, pricePerUnit: Math.round(650 * rc), total: Math.round(tqty * 650 * rc), isConsumable: true });
    }
    if (cfg.sinkIncluded) {
      const sk = SINK_TYPES.find(s => s.id === cfg.sinkType);
      const sqty = cfg.sinkCount || 1;
      items.push({ name: `Раковина: ${sk?.label ?? "с тумбой"}`, spec: sk?.description ?? "", unit: "шт.", qty: sqty, pricePerUnit: Math.round((sk?.pricePerUnit ?? 15400) * 0.65 * rc), total: Math.round(sqty * (sk?.pricePerUnit ?? 15400) * 0.65 * rc) });
      items.push({ name: "Смеситель + сифон для раковины", unit: "компл.", qty: sqty, pricePerUnit: Math.round(3200 * lc * rc), total: Math.round(sqty * 3200 * lc * rc), isConsumable: true });
    }
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