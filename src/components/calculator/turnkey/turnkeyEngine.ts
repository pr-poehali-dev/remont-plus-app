import {
  REGIONS, RENOVATION_LEVELS, FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
  DEMOLITION_SCOPES, DEBRIS_TRUCK_VOLUME_M3, DEBRIS_TRUCK_PRICE,
} from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА РЕМОНТА ПОД КЛЮЧ (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений.
 *
 * Услуги мастера (прораб / снабженец) — это НЕ блоки сметы, а надбавки поверх:
 *   foremanCost  = % от (работы + материалы)   [база = worksTotal+materialsTotal]
 *   supplierCost = % от материалов             [база = materialsTotal]
 * Они входят в subtotal, но в детальной печати отдельными строками не показываются
 * (зашиваются в цены позиций через коэффициент k в TurnkeyPrint).
 *
 * Региональный коэффициент rc и уровень отделки lc применяются к РАБОТАМ.
 */

export type TurnkeyBlock =
  | "demolition"
  | "debris"
  | "cabinDemolition"
  | "cabinConstruction"
  | "electrics"
  | "plumbing"
  | "plaster"
  | "floors"
  | "ceilings"
  | "bathrooms"
  | "kitchen"
  | "doors"
  | "windowSlopes"
  | "furniture"
  | "cleaning";

export interface TurnkeyLine extends MaterialItem {
  block: TurnkeyBlock;
}

export interface TurnkeyEstimate {
  lines: TurnkeyLine[];
  works: TurnkeyLine[];
  materials: TurnkeyLine[];
  worksTotal: number;
  materialsTotal: number;
  foremanCost: number;
  supplierCost: number;
  subtotal: number;     // works + materials + foreman + supplier (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  levelCoeff: number;
  debrisTruckCount: number;
  blockTotals: Record<TurnkeyBlock, number>;
}

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до lc и rc) ───────────────────────────────
// Ставки приведены к рыночным ориентирам Москвы 2026 (только работа).
const WORK_RATES = {
  cabinDemolition: 1700,     // демонтаж сантехкабины, ₽/м.п. перегородок
  cabinMasonry: 1350,        // кладка перегородок сантехкабины, ₽/м²
  electricsM2: 1100,         // электромонтаж, ₽/м² (рынок 1000–1200; было 1450 — завышено)
  plumbingPerBath: 20000,    // разводка сантехники, ₽/санузел (рынок 18000–22000; было 24000)
  plasterWall: 950,          // штукатурка стен, ₽/м² (рынок 900–1100; было 720 — занижено)
  screedFloor: 900,          // стяжка пола, ₽/м² (рынок 850–1000; было 750)
  floorLay: 850,             // укладка напольного покрытия, ₽/м² (рынок 800–1000; было 650)
  ceilingPaint: 520,         // покраска потолка, ₽/м² (рынок 500–600)
  ceilingStretch: 480,       // монтаж натяжного потолка, ₽/м²
  kitchenInstall: 38000,     // монтаж кухонного гарнитура, ₽/компл
  doorInstall: 4500,         // установка двери, ₽/шт
  windowSlope: 3000,         // монтаж откоса, ₽/проём
  furniturePerRoom: 8000,    // сборка/навеска мебели, ₽/комната
  cleaningM2: 180,           // финальная уборка, ₽/м²
};

// ─── СТРУКТУРА САНУЗЛА «ПОД КЛЮЧ» (раскладка опорного прайса) ─────────────────
// Раньше санузел дробился непрозрачно: работа = 45%, материал = 55% от прайса.
// Теперь опорный прайс санузла (pricePerUnit) раскладывается на ПОНЯТНЫЕ
// позиции с явным типом (работа/материал). Сумма долей = 1.0 (100%), поэтому
// итог по санузлам = pricePerUnit × кол-во санузлов (как и прежде — инвариант
// сохранён). Каждая доля — это укрупнённый этап санузла «под ключ».
const BATHROOM_PARTS = [
  { key: "tile",    label: "Плитка + укладка (стены и пол)",            share: 0.40, isWork: false },
  { key: "plumb",   label: "Сантехника + монтаж (санфаянс, смесители)", share: 0.25, isWork: false },
  { key: "waterpr", label: "Гидроизоляция + стяжка (работа)",            share: 0.12, isWork: true  },
  { key: "cabin",   label: "Сантехкабина / перегородки (работа)",        share: 0.10, isWork: true  },
  { key: "finish",  label: "Прочая отделка и расходники",                share: 0.13, isWork: false },
] as const;

// ─── ЦЕНЫ МАТЕРИАЛОВ 2026, ₽ ─────────────────────────────────────────────────
const MAT_PRICES = {
  block: 95,                 // пеноблок/ПГБ 600×300×100, ₽/шт
  blockGlue: 28,             // клей для блоков, ₽/кг
  serpyanka: 18,             // сетка-серпянка, ₽/м.п.
  rebar: 35,                 // арматура ∅6, ₽/м.п.
  cablePower: 105,           // кабель ВВГнг 3×2,5, ₽/м.п. (рынок 95–120; было 72 — занижено)
  cableLight: 68,            // кабель ВВГнг 3×1,5, ₽/м.п. (рынок 60–75; было 50)
  panel: 8500,               // щиток распределительный, ₽/шт
  electricFittings: 360,     // автоматы/розетки/выключатели, ₽/м² (компл.)
  corrugation: 110,          // гофра/подрозетники, ₽/м² (компл.)
  pipePpr: 125,              // труба PPR, ₽/м.п.
  pprFittings: 4500,         // фитинги PPR, ₽/санузел
  sewerPipe: 160,            // канализационная гофра/труба, ₽/м.п.
  plasterMix: 24,            // гипсовая штукатурка, ₽/кг (~12 кг/м²; рынок 22–28; было 16 — занижено)
  screedMix: 18,             // ЦПС М200, ₽/кг (~22 кг/м²; рынок 16–20; было 12 — занижено)
  putty: 24,                 // финишная шпаклёвка, ₽/кг (~1,2 кг/м²)
  primer: 120,               // грунтовка, ₽/л
  beacons: 58,               // маяки/профили, ₽/м² (компл.)
  underlay: 75,              // подложка, ₽/м²
  skirting: 240,             // плинтус, ₽/м.п.
  floorGlue: 45,             // клей/дюбели для пола, ₽/м² (компл.)
  stretchCanvas: 480,        // натяжное полотно ПВХ, ₽/м²
  stretchProfile: 125,       // профиль натяжного, ₽/м.п.
  ceilPutty: 29,             // шпаклёвка потолочная, ₽/кг (~0,9 кг/м²)
  ceilPaint: 420,            // краска потолочная, ₽/л (~0,36 л/м²)
  doorEdge: 0,               // наличники включены в долю
  slopePvc: 1400,            // ПВХ-откос, ₽/проём
  slopeFoam: 490,            // пена/герметик, ₽/проём
};

export function calcTurnkey(
  cfg: Omit<TurnkeyConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): TurnkeyEstimate {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[3];
  const level = RENOVATION_LEVELS.find((l) => l.id === cfg.renovationLevel);
  const bathroomLevel = BATHROOM_LEVELS.find((b) => b.id === cfg.bathroomLevel);
  const floorType = FLOOR_TYPES.find((f) => f.id === cfg.floorType);
  const ceilingType = CEILING_TYPES.find((c) => c.id === cfg.ceilingType);

  const rc = region.coeff;
  const lc = level?.priceCoeff ?? 1.0;
  const area = cfg.totalAreaM2 || 0;
  const baths = cfg.bathroomCount || 1;
  const ceilH = cfg.ceilingHeightM || 2.8;
  // Оценка площади стен по площади квартиры: √площадь даёт сторону условного
  // квадрата, ×3.5 — приведение к суммарной длине стен (с учётом внутренних
  // перегородок), ×ceilH — высота. Приближение при отсутствии точной планировки.
  const wallArea = Math.round(Math.sqrt(area) * 3.5 * ceilH * 10) / 10;
  // Оценка числа оконных проёмов: балконы + ~1 окно на каждые 18 м² площади.
  const windowCount = (cfg.balconyCount || 0) + Math.max(1, Math.ceil(area / 18));
  // Оценка числа комнат: ~1 комната на каждые 20 м² площади квартиры.
  const roomCount = Math.max(1, Math.round(area / 20));
  const cabinPerimPerBath = 12;

  const lines: TurnkeyLine[] = [];
  const round = (n: number) => Math.round(n);

  // work: цена за единицу с региональным коэффициентом и уровнем отделки
  const work = (block: TurnkeyBlock, name: string, unit: string, qty: number, ratePerUnit: number, spec?: string, applyLevel = true) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * (applyLevel ? lc : 1) * rc);
    const q = Math.round(qty * 10) / 10;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // material: цена по прайсу поставщика
  const material = (block: TurnkeyBlock, name: string, unit: string, qty: number, pricePerUnit: number, spec?: string, isConsumable?: boolean) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const q = Math.round(qty * 100) / 100;
    const price = round(pricePerUnit);
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };

  // ── ДЕМОНТАЖ ───────────────────────────────────────────────
  const demoScope = DEMOLITION_SCOPES.find((s) => s.id === cfg.demolitionScope) ?? DEMOLITION_SCOPES[1];
  if (cfg.demolitionIncluded) {
    if (cfg.demolitionFloors) work("demolition", `Демонтаж полов (${demoScope.label})`, "м²", area, demoScope.floorPriceM2, demoScope.description, false);
    if (cfg.demolitionWalls) work("demolition", `Демонтаж стен/покрытий (${demoScope.label})`, "м²", wallArea, demoScope.wallPriceM2, demoScope.description, false);
  }

  // ── ВЫВОЗ МУСОРА ───────────────────────────────────────────
  const debrisVolume = cfg.demolitionIncluded
    ? ((cfg.demolitionFloors ? area : 0) + (cfg.demolitionWalls ? wallArea : 0)) * demoScope.debrisM3perM2
    : 0;
  const autoTrucks = debrisVolume > 0 ? Math.ceil(debrisVolume / DEBRIS_TRUCK_VOLUME_M3) : 0;
  const debrisTruckCount = cfg.debrisTruckCount > 0 ? cfg.debrisTruckCount : autoTrucks;
  if (cfg.demolitionIncluded && debrisTruckCount > 0) {
    work("debris", "Вывоз строительного мусора", "маш.", debrisTruckCount, DEBRIS_TRUCK_PRICE, `${DEBRIS_TRUCK_VOLUME_M3} м³ / машина, погрузка`, false);
  }

  // ── ДЕМОНТАЖ САНТЕХКАБИНЫ ──────────────────────────────────
  if (cfg.bathroomCabinDemolition) {
    work("cabinDemolition", "Демонтаж перегородок сантехкабины", "м.п.", cabinPerimPerBath * baths, WORK_RATES.cabinDemolition, "снос, разборка, вынос", false);
  }

  // ── ВОЗВЕДЕНИЕ САНТЕХКАБИНЫ ────────────────────────────────
  if (cfg.bathroomCabinConstruction) {
    const cabinWallSqm = cabinPerimPerBath * baths * 2.5;
    const perimeterM = baths * cabinPerimPerBath;
    work("cabinConstruction", "Кладка перегородок сантехкабины из блоков", "м²", cabinWallSqm, WORK_RATES.cabinMasonry, "возведение стен", false);
    const blockQty = Math.ceil(cabinWallSqm / 0.18);
    material("cabinConstruction", "Пеноблоки / ПГБ 600×300×100 мм", "шт.", blockQty, MAT_PRICES.block, "перегородочные");
    material("cabinConstruction", "Клей для газо- и пенобетона", "кг", Math.ceil(cabinWallSqm * 3), MAT_PRICES.blockGlue, "Ceresit CT 21 / аналог", true);
    material("cabinConstruction", "Сетка-серпянка штукатурная", "м.п.", Math.ceil(perimeterM * 2), MAT_PRICES.serpyanka, undefined, true);
    material("cabinConstruction", "Арматура кладочная ∅6 мм", "м.п.", Math.ceil(perimeterM * 2.5), MAT_PRICES.rebar, "перевязка рядов");
  }

  // ── ЭЛЕКТРИКА ──────────────────────────────────────────────
  if (cfg.electricsIncluded) {
    work("electrics", "Электромонтаж (штробление, разводка, сборка щита)", "м²", area, WORK_RATES.electricsM2, "розетки, выключатели, освещение");
    material("electrics", "Кабель ВВГнг-LS 3×2,5 мм²", "м.п.", Math.round(area * 5), MAT_PRICES.cablePower, "силовой");
    material("electrics", "Кабель ВВГнг-LS 3×1,5 мм²", "м.п.", Math.round(area * 2), MAT_PRICES.cableLight, "для освещения");
    material("electrics", "Щиток распределительный", "шт.", 1, round(MAT_PRICES.panel * lc), `на ${Math.round(area / 5) + 4} мест`);
    material("electrics", "Автоматы, УЗО, розетки, выключатели", "м²", area, round(MAT_PRICES.electricFittings * lc), undefined, true);
    material("electrics", "Гофра, подрозетники, стяжки", "м²", area, MAT_PRICES.corrugation, undefined, true);
  }

  // ── САНТЕХНИКА (разводка) ──────────────────────────────────
  if (cfg.plumbingIncluded) {
    work("plumbing", "Разводка труб ХВС/ГВС/канализация", "санузел", baths, WORK_RATES.plumbingPerBath, "коллекторная разводка");
    material("plumbing", "Труба полипропиленовая ∅20/25 мм", "м.п.", Math.round(baths * 18), MAT_PRICES.pipePpr, "ХВС/ГВС");
    material("plumbing", "Фитинги PPR (муфты, тройники, угольники)", "санузел", baths, MAT_PRICES.pprFittings, undefined, true);
    material("plumbing", "Гофра канализационная ∅50/110 мм", "м.п.", Math.round(baths * 8), MAT_PRICES.sewerPipe);
  }

  // ── ШТУКАТУРКА + СТЯЖКА ────────────────────────────────────
  if (cfg.plastersIncluded) {
    work("plaster", "Штукатурка стен по маякам", "м²", wallArea, WORK_RATES.plasterWall, "+ финишная шпаклёвка");
    work("plaster", "Устройство стяжки пола", "м²", area, WORK_RATES.screedFloor, "по маякам");
    material("plaster", "Гипсовая штукатурка Knauf Rotband", "кг", Math.ceil(wallArea * 12), MAT_PRICES.plasterMix, "мешки 30 кг");
    material("plaster", "ЦПС М200 для стяжки пола", "кг", Math.ceil(area * 22), MAT_PRICES.screedMix, "мешки 50 кг");
    material("plaster", "Шпаклёвка финишная Knauf", "кг", Math.ceil(wallArea * 1.2), MAT_PRICES.putty);
    material("plaster", "Грунтовка (стены + пол)", "л", Math.ceil((wallArea + area) * 0.2), MAT_PRICES.primer, undefined, true);
    material("plaster", "Маяки, профили, серпянка", "м²", wallArea + area, MAT_PRICES.beacons, undefined, true);
  }

  // ── ПОЛЫ ───────────────────────────────────────────────────
  if (cfg.floorsIncluded && floorType) {
    const perimeter = Math.round(Math.sqrt(area) * 3.5);
    work("floors", `Укладка напольного покрытия: ${floorType.label}`, "м²", area, WORK_RATES.floorLay, floorType.description);
    material("floors", `Напольное покрытие: ${floorType.label}`, "м²", area * 1.08, round(floorType.priceM2 * lc), "+8% отход");
    material("floors", "Подложка под ламинат/паркет", "м²", area * 1.05, MAT_PRICES.underlay, undefined, true);
    material("floors", "Плинтус напольный с кабель-каналом", "м.п.", perimeter, MAT_PRICES.skirting);
    material("floors", "Клей для напольных покрытий, дюбели", "м²", area, MAT_PRICES.floorGlue, undefined, true);
  }

  // ── ПОТОЛКИ ────────────────────────────────────────────────
  if (cfg.ceilingsIncluded && ceilingType) {
    const perimeter = Math.round(Math.sqrt(area) * 3.5);
    if (ceilingType.id === "stretch") {
      work("ceilings", "Монтаж натяжного потолка", "м²", area, WORK_RATES.ceilingStretch, ceilingType.description);
      material("ceilings", "Натяжное полотно ПВХ (глянец/матт)", "м²", area * 1.05, round(MAT_PRICES.stretchCanvas * lc), ceilingType.label);
      material("ceilings", "Профиль для натяжного потолка", "м.п.", perimeter, MAT_PRICES.stretchProfile, undefined, true);
    } else {
      work("ceilings", "Шпаклёвка и покраска потолка", "м²", area, WORK_RATES.ceilingPaint, ceilingType.description);
      material("ceilings", "Шпаклёвка потолочная Bergauf", "кг", Math.ceil(area * 0.9), MAT_PRICES.ceilPutty);
      material("ceilings", "Краска для потолков Dulux / Tikkurila", "л", Math.ceil(area * 0.36), round(MAT_PRICES.ceilPaint * lc), "белая матовая, 2 слоя");
      material("ceilings", "Грунтовка потолка", "л", Math.ceil(area * 0.15), MAT_PRICES.primer, undefined, true);
    }
  }

  // ── САНУЗЛЫ ПОД КЛЮЧ ───────────────────────────────────────
  // Опорный прайс санузла (pricePerUnit) раскладывается на понятные этапы
  // (BATHROOM_PARTS) с явным типом работа/материал вместо абстрактных «45/55».
  if (cfg.bathroomIncluded && bathroomLevel) {
    const unit = bathroomLevel.pricePerUnit;
    // Разносим ЦЕНУ ОДНОГО САНУЗЛА на целочисленные доли так, чтобы их сумма
    // была ровно = unit. Тогда каждая строка: total = pricePerUnit × baths
    // (оба целые → деление/округление не нужно, инвариант total=round(price×q)
    // выполняется точно), а блок санузлов = unit × baths.
    let pricedSoFar = 0;
    BATHROOM_PARTS.forEach((part, idx) => {
      const isLast = idx === BATHROOM_PARTS.length - 1;
      const pricePerUnit = isLast ? unit - pricedSoFar : round(unit * part.share);
      if (pricePerUnit <= 0) return;
      pricedSoFar += pricePerUnit;
      const spec = idx === 0 && bathroomLevel.description
        ? `${bathroomLevel.label}, ${bathroomLevel.description}`
        : bathroomLevel.label;
      lines.push({
        block: "bathrooms",
        name: `Санузел под ключ — ${part.label}`,
        spec,
        unit: "санузел",
        qty: baths,
        pricePerUnit,
        total: round(pricePerUnit * baths),
        isWork: part.isWork,
        isConsumable: false,
      });
    });
  }

  // ── КУХНЯ ──────────────────────────────────────────────────
  if (cfg.kitchenIncluded) {
    work("kitchen", "Монтаж кухонного гарнитура", "компл.", 1, WORK_RATES.kitchenInstall, "сборка, навеска, подключение");
  }

  // ── ДВЕРИ ──────────────────────────────────────────────────
  if (cfg.doorsIncluded && cfg.doorsCount > 0) {
    const doorMatPrice = round(19500 * lc); // межкомнатная дверь с коробкой, материал
    work("doors", "Установка межкомнатной двери", "шт.", cfg.doorsCount, WORK_RATES.doorInstall, "коробка, наличники, фурнитура");
    material("doors", "Межкомнатная дверь с коробкой и фурнитурой", "шт.", cfg.doorsCount, doorMatPrice, "полотно + короб");
    material("doors", "Наличники, петли, ручки", "компл.", cfg.doorsCount, round(doorMatPrice * 0.07), undefined, true);
  }

  // ── ОТКОСЫ ОКОН ────────────────────────────────────────────
  if (cfg.windowslopeIncluded) {
    work("windowSlopes", "Монтаж оконных откосов", "проём", windowCount, WORK_RATES.windowSlope, "окна и балконные двери", false);
    material("windowSlopes", "Откосы оконные ПВХ (панель + уголок)", "проём", windowCount, MAT_PRICES.slopePvc);
    material("windowSlopes", "Монтажная пена, герметик", "проём", windowCount, MAT_PRICES.slopeFoam, undefined, true);
  }

  // ── МЕБЕЛЬ ─────────────────────────────────────────────────
  if (cfg.furnitureAssembly) {
    work("furniture", "Сборка и навеска мебели", "комн.", roomCount, WORK_RATES.furniturePerRoom, "шкафы, полки, гарнитуры", false);
  }

  // ── УБОРКА ─────────────────────────────────────────────────
  if (cfg.cleaningIncluded) {
    work("cleaning", "Финальная уборка после ремонта", "м²", area, WORK_RATES.cleaningM2, "вынос мусора, мытьё", false);
  }

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);

  // Услуги мастера (надбавки поверх позиций)
  const foremanBase = worksTotal + materialsTotal;
  const foremanCost = cfg.foremanIncluded ? Math.round(foremanBase * (cfg.foremanPct || 10) / 100) : 0;
  const supplierCost = cfg.supplierIncluded ? Math.round(materialsTotal * (cfg.supplierPct || 5) / 100) : 0;

  const subtotal = worksTotal + materialsTotal + foremanCost + supplierCost;
  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blocks: TurnkeyBlock[] = [
    "demolition", "debris", "cabinDemolition", "cabinConstruction", "electrics",
    "plumbing", "plaster", "floors", "ceilings", "bathrooms", "kitchen", "doors",
    "windowSlopes", "furniture", "cleaning",
  ];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<TurnkeyBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, foremanCost, supplierCost,
    subtotal, markupAmount, total,
    regionCoeff: rc, levelCoeff: lc, debrisTruckCount, blockTotals,
  };
}