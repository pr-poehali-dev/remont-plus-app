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

export function calcTurnkeyPrice(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): TurnkeyPriceBreakdown {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const level  = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);
  const bathroomLevel = BATHROOM_LEVELS.find(b => b.id === cfg.bathroomLevel);
  const floorType    = FLOOR_TYPES.find(f => f.id === cfg.floorType);
  const ceilingType  = CEILING_TYPES.find(c => c.id === cfg.ceilingType);

  const rc  = region.coeff;
  const lc  = level?.priceCoeff ?? 1.0;
  const area = cfg.totalAreaM2 || 0;
  const baths = cfg.bathroomCount || 1;
  const ceilH = cfg.ceilingHeightM || 2.8;
  // периметр стен (приближение)
  const wallArea = Math.round(Math.sqrt(area) * 3.5 * ceilH * 10) / 10;
  // количество окон (оценка)
  const windowCount = (cfg.balconyCount || 0) + Math.max(1, Math.ceil(area / 18));

  // ── Черновые работы ──────────────────────────────────────────────────────
  // Демонтаж: 400 ₽/м² пола + 350 ₽/м² стен (снятие покрытий + вывоз мусора)
  const demolitionCost = cfg.demolitionIncluded
    ? Math.round((area * 440 + wallArea * 385) * rc)
    : 0;

  // Демонтаж / возведение сантехкабины — по периметру санузла
  const cabinPerimPerBath = 12; // пог. м на одну кабину (ср. санузел ~3×3 м)
  const bathroomCabinDemolitionCost = cfg.bathroomCabinDemolition
    ? Math.round(cabinPerimPerBath * baths * 13200 * rc)
    : 0;
  const bathroomCabinConstructionCost = cfg.bathroomCabinConstruction
    ? Math.round(cabinPerimPerBath * baths * 2.5 * 5280 * rc)
    : 0;

  // Электрика: 1 500 ₽/м² × уровень (работа + материалы кабель/гофра)
  const electricsCost = cfg.electricsIncluded
    ? Math.round(area * 1650 * lc * rc)
    : 0;

  // Сантехника (разводка ХВС/ГВС/канализация): 25 000 ₽/санузел × уровень
  const plumbingCost = cfg.plumbingIncluded
    ? Math.round(baths * 27500 * lc * rc)
    : 0;

  // Штукатурка + стяжка: 1 100 ₽/м² стен + 1 150 ₽/м² пола
  const plasterCost = cfg.plastersIncluded
    ? Math.round((wallArea * 1210 + area * 1265) * rc)
    : 0;

  // Напольное покрытие: работа 700 ₽/м² + материал priceM2 × уровень
  const floorMaterial = floorType?.priceM2 ?? 1200;
  const floorsCost = cfg.floorsIncluded
    ? Math.round(area * (770 + floorMaterial * lc) * rc)
    : 0;

  // Потолки: работа 500 ₽/м² + материал priceM2 × уровень
  const ceilMaterial = ceilingType?.priceM2 ?? 850;
  const ceilingsCost = cfg.ceilingsIncluded
    ? Math.round(area * (550 + ceilMaterial * lc) * rc)
    : 0;

  // Санузлы под ключ: pricePerUnit × кол-во × регион (материалы + все работы)
  const bathUnitPrice = bathroomLevel?.pricePerUnit ?? 185000;
  const bathroomsCost = cfg.bathroomIncluded
    ? Math.round(bathUnitPrice * baths * rc)
    : 0;

  // Монтаж кухни: 55 000 ₽ фикс × уровень (сборка, встройка техники, подвеска)
  const kitchenCost = cfg.kitchenIncluded
    ? Math.round(60500 * lc * rc)
    : 0;

  // Двери: 14 000 ₽/дверь × уровень (материал + коробка + фурнитура + монтаж)
  const doorsCost = cfg.doorsIncluded && cfg.doorsCount > 0
    ? Math.round(cfg.doorsCount * 15400 * lc * rc)
    : 0;

  // Откосы: 4 000 ₽/проём (материал ПВХ + монтаж)
  const windowSlopesCost = cfg.windowslopeIncluded
    ? Math.round(windowCount * 4400 * rc)
    : 0;

  // Сборка мебели: 9 000 ₽/комната
  const roomCount = Math.max(1, Math.round(area / 20));
  const furnitureCost = cfg.furnitureAssembly
    ? Math.round(roomCount * 9900 * rc)
    : 0;

  // Финальная уборка: 180 ₽/м² (строительная уборка после ремонта)
  const cleaningCost = cfg.cleaningIncluded
    ? Math.round(area * 198 * rc)
    : 0;

  const worksSubtotal = demolitionCost + bathroomCabinDemolitionCost + bathroomCabinConstructionCost +
    electricsCost + plumbingCost + plasterCost +
    floorsCost + ceilingsCost + bathroomsCost + kitchenCost + doorsCost +
    windowSlopesCost + furnitureCost + cleaningCost;

  // Материальная составляющая (для расчёта снабженца)
  const materialsCost = Math.round(
    demolitionCost                * 0.00 +
    bathroomCabinDemolitionCost   * 0.00 +
    bathroomCabinConstructionCost * 0.65 +
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
    bathroomCabinDemolitionCost,
    bathroomCabinConstructionCost,
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

  if (cfg.bathroomCabinConstruction && bd.bathroomCabinConstructionCost > 0) {
    const perimeterM = cfg.bathroomCount * 10;
    const wallH = ceilingH;
    const blockQty = Math.ceil(perimeterM * wallH / 0.09);
    items.push({ name: "Пеноблоки / ПГБ 600×300×100 мм", spec: "перегородочные блоки", unit: "шт.", qty: blockQty, pricePerUnit: 95, total: blockQty * 95 });
    items.push({ name: "Клей для газо- и пенобетона", spec: "Ceresit CT 21 / аналог", unit: "кг", qty: Math.ceil(perimeterM * wallH * 3), pricePerUnit: 28, total: Math.ceil(perimeterM * wallH * 3) * 28, isConsumable: true });
    items.push({ name: "Штукатурная сетка серпянка", unit: "м.п.", qty: Math.ceil(perimeterM * 2), pricePerUnit: 18, total: Math.ceil(perimeterM * 2) * 18, isConsumable: true });
    items.push({ name: "Арматура кладочная ∅6 мм", spec: "перевязка рядов блоков", unit: "м.п.", qty: Math.ceil(perimeterM * wallH / 0.6 * 0.6), pricePerUnit: 35, total: Math.ceil(perimeterM * wallH / 0.6 * 0.6) * 35 });
    items.push({ name: "Дюбели, анкеры, метизы", unit: "компл.", qty: cfg.bathroomCount, pricePerUnit: 1800, total: cfg.bathroomCount * 1800, isConsumable: true });
  }

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

  // ── Малярный инструмент и расходники ────────────────────────────────────────
  // Валики, кисти, лотки, малярный скотч, плёнка защитная, шпатели, перчатки
  {
    const paintSurface = wallArea + area;
    const rollersQty = Math.ceil(paintSurface / 60);       // 1 валик на ~60 м²
    const brushesQty = Math.ceil(paintSurface / 40);       // 1 кисть на ~40 м²
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
    // Базовая доставка: фура до подъезда — вес материалов ~30 кг/м² → тоннаж
    const weightTonnes = Math.max(1, Math.round(area * 30 / 1000 * 10) / 10);
    const deliveryBase = Math.round(weightTonnes * 3500 * rc);
    // Подъём: 1-й этаж — бесплатно, со 2-го — 250 ₽/т/этаж
    const liftCost = floorN > 1 ? Math.round(weightTonnes * 250 * (floorN - 1) * rc) : 0;
    const deliveryTotal = deliveryBase + liftCost;
    items.push({
      name: "Доставка стройматериалов",
      spec: `~${weightTonnes} т, до подъезда`,
      unit: "рейс",
      qty: Math.ceil(weightTonnes / 3),
      pricePerUnit: Math.round(deliveryBase / Math.ceil(weightTonnes / 3)),
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
    void deliveryTotal;
  }

  return items;
}