import type { FrameHouseConfig } from "./FrameHouseTypes";
import {
  FRAME_WALL_TECHS, FRAME_INSULATIONS, FOUNDATION_TYPES,
  ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES, FLOOR_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES, REGIONS,
} from "./FrameHouseTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА КАРКАСНОГО ДОМА (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений
 * (раньше assembly = materialsSum × 0.38, materialsCost = subtotal × 0.62).
 *
 * Каждая позиция помечена блоком (block) — экранный калькулятор показывает
 * привычную разбивку по блокам (blockTotals), печать — полный список.
 *
 * Региональный коэффициент rc применяется ко всем позициям (как и раньше:
 * и материалы, и работы умножались на regionCoeff).
 *
 * Услуги мастера (foreman/supplier) — надбавки поверх позиций, входят в subtotal,
 * в детальной печати отдельными строками не показываются.
 */

export type FrameHouseBlock =
  | "foundation"
  | "frame"
  | "insulation"
  | "roofStructure"
  | "roofing"
  | "facade"
  | "windows"
  | "floor"
  | "underfloorHeating"
  | "heating"
  | "electrical"
  | "plumbing"
  | "sewage"
  | "interiorFinish"
  | "terrace"
  | "garage";

export interface FrameHouseLine extends MaterialItem {
  block: FrameHouseBlock;
}

export interface FrameHouseEstimate {
  lines: FrameHouseLine[];
  works: FrameHouseLine[];
  materials: FrameHouseLine[];
  worksTotal: number;
  materialsTotal: number;
  foreman: number;
  supplier: number;
  subtotal: number;     // works + materials + foreman + supplier (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  blockTotals: Record<FrameHouseBlock, number>;
}

// Доля монтажа от стоимости материалов соответствующего блока (работа = % материала)
const ASSEMBLY_SHARE: Record<FrameHouseBlock, number> = {
  foundation: 0.0,        // фундамент — цена «под ключ» (ниже отдельная позиция работ)
  frame: 0.45,            // монтаж каркаса
  insulation: 0.40,       // монтаж утепления + ветрозащита + пароизоляция
  roofStructure: 0.65,    // монтаж стропил/обрешётки
  roofing: 0.40,          // монтаж кровли
  facade: 0.55,           // монтаж фасада
  windows: 0.18,          // установка окон (часто в цене)
  floor: 0.50,            // устройство пола
  underfloorHeating: 0.45,// монтаж тёплого пола
  heating: 0.0,           // отопление — цена «под ключ» (работа отдельно)
  electrical: 0.0,        // электрика — цена «под ключ»
  plumbing: 0.0,          // водоснабжение — цена «под ключ»
  sewage: 0.0,            // канализация — цена «под ключ»
  interiorFinish: 0.55,   // внутренняя отделка
  terrace: 0.0,           // терраса — цена материал+монтаж
  garage: 0.0,            // гараж — цена материал+монтаж
};

export function calcFrameHouse(cfg: FrameHouseConfig, regionId: string, markupPct = 0): FrameHouseEstimate {
  const area = Math.max(cfg.totalArea, 10);
  const rc = REGIONS[regionId]?.coeff ?? 0.8;

  const floorFactor = cfg.floors === 1.5 ? 1.3 : cfg.floors;
  const side = Math.sqrt(area / floorFactor);
  const perimeter = side * 4;
  const wallFloors = cfg.roofType === "a_frame" ? 1 : (cfg.floors === 1.5 ? 1.5 : cfg.floors);
  const wallArea = perimeter * cfg.wallHeight * wallFloors;
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;
  const insulArea = wallArea + area * (cfg.floors === 2 ? 2 : cfg.floors === 1.5 ? 1.75 : 1.5);

  const lines: FrameHouseLine[] = [];
  const round = (n: number) => Math.round(n);

  // material: цена по прайсу × rc
  const material = (block: FrameHouseBlock, name: string, unit: string, qty: number, pricePerUnit: number, spec?: string, isConsumable?: boolean) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const price = round(pricePerUnit * rc);
    lines.push({ block, name, spec, unit, qty: Math.round(qty * 100) / 100, pricePerUnit: price, total: round(pricePerUnit * qty * rc), isConsumable, isWork: false });
  };

  // work: общая стоимость работы × rc
  const work = (block: FrameHouseBlock, name: string, unit: string, qty: number, totalWork: number, spec?: string) => {
    if (qty <= 0 || totalWork <= 0) return;
    const t = round(totalWork * rc);
    lines.push({ block, name, spec, unit, qty: Math.round(qty * 100) / 100, pricePerUnit: round(t / qty), total: t, isWork: true });
  };

  // ── ФУНДАМЕНТ (цена «под ключ» = материал 55% + работа 45%) ─
  const foundData = FOUNDATION_TYPES[cfg.foundation];
  const foundationBase = foundData.basePrice * (1 + (area - 50) * 0.008);
  material("foundation", `Фундамент: ${foundData.label}`, "компл.", 1, foundationBase * 0.55, foundData.desc);
  work("foundation", "Устройство фундамента", "компл.", 1, foundationBase * 0.45, foundData.label);

  // ── КАРКАС СТЕН ────────────────────────────────────────────
  const frameTech = FRAME_WALL_TECHS[cfg.wallTech];
  const frameMatBase = wallArea * frameTech.pricePerM2;
  material("frame", frameTech.label, "м²", wallArea, frameTech.pricePerM2, frameTech.desc);
  work("frame", "Монтаж каркаса стен и перекрытий", "м²", wallArea, frameMatBase * ASSEMBLY_SHARE.frame);

  // ── УТЕПЛЕНИЕ ──────────────────────────────────────────────
  const insulData = FRAME_INSULATIONS[cfg.insulation];
  const insulMatBase = insulArea * insulData.pricePerM2;
  material("insulation", insulData.label, "м²", insulArea, insulData.pricePerM2, `${insulData.thickness} мм`);
  material("insulation", "Пароизоляция", "м²", (wallArea + area) * 1.15, 58, "ТЕХНОНИКОЛЬ Паробарьер", true);
  material("insulation", "Ветрозащитная мембрана", "м²", roofArea * 1.1 + wallArea * 0.5, 36, "Изоспан A / Ютавек", true);
  work("insulation", "Утепление + ветрозащита + пароизоляция", "м²", insulArea, insulMatBase * ASSEMBLY_SHARE.insulation);

  // ── КРОВЛЯ: КАРКАС ─────────────────────────────────────────
  const roofStructBase = roofArea * 1650;
  material("roofStructure", "Стропильная система и обрешётка", "м²", roofArea, 1650, "доска 50×200 / 25×100, сосна");
  work("roofStructure", "Монтаж стропильной системы и обрешётки", "м²", roofArea, roofStructBase * ASSEMBLY_SHARE.roofStructure);

  // ── КРОВЛЯ: ПОКРЫТИЕ ───────────────────────────────────────
  const roofMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  const roofingMatBase = roofArea * roofMat.pricePerM2;
  material("roofing", roofMat.label, "м²", roofArea, roofMat.pricePerM2);
  work("roofing", "Монтаж кровельного покрытия", "м²", roofArea, roofingMatBase * ASSEMBLY_SHARE.roofing);

  // ── ФАСАД ──────────────────────────────────────────────────
  const facadeData = FACADE_TYPES[cfg.facade];
  const facadeMatBase = wallArea * facadeData.pricePerM2;
  material("facade", facadeData.label, "м²", wallArea, facadeData.pricePerM2, facadeData.desc);
  work("facade", "Монтаж фасада", "м²", wallArea, facadeMatBase * ASSEMBLY_SHARE.facade);

  // ── ОКНА ───────────────────────────────────────────────────
  if (cfg.windowCount > 0) {
    const winData = WINDOW_TYPES[cfg.windowType];
    const windowsBase = cfg.windowCount * winData.pricePerUnit;
    material("windows", winData.label, "шт.", cfg.windowCount, winData.pricePerUnit, "стеклопакет, фурнитура");
    work("windows", "Установка окон, откосы", "шт.", cfg.windowCount, windowsBase * ASSEMBLY_SHARE.windows);
  }

  // ── ПОЛЫ ───────────────────────────────────────────────────
  const floorData = FLOOR_TYPES[cfg.floorType];
  const floorMatBase = area * floorData.pricePerM2;
  material("floor", floorData.label, "м²", area, floorData.pricePerM2);
  work("floor", "Устройство пола (стяжка/лаги + покрытие)", "м²", area, floorMatBase * ASSEMBLY_SHARE.floor);

  // ── ТЁПЛЫЙ ПОЛ ─────────────────────────────────────────────
  if (cfg.underfloorHeating) {
    const ufhBase = area * 2800;
    material("underfloorHeating", "Тёплый пол водяной (коллектор + трубы)", "м²", area, 2800 * 0.55, "PE-RT ∅16, шаг 150 мм");
    work("underfloorHeating", "Монтаж тёплого пола", "м²", area, ufhBase * ASSEMBLY_SHARE.underfloorHeating);
  }

  // ── ОТОПЛЕНИЕ (под ключ = материал + работа) ───────────────
  {
    const heatData = HEATING_TYPES[cfg.heating];
    const heatingBase = heatData.basePrice + area * 320;
    material("heating", heatData.label, "компл.", 1, heatingBase * 0.6, heatData.desc);
    work("heating", "Монтаж системы отопления", "компл.", 1, heatingBase * 0.4);
  }

  // ── ЭЛЕКТРИКА (под ключ) ───────────────────────────────────
  if (cfg.electricalIncluded) {
    const electricalBase = area * 1650 + 28000;
    material("electrical", "Электрика: кабель, щиток ABB/IEK, автоматы, розетки", "компл.", 1, electricalBase * 0.45, "ВВГнг-LS, 16–32 А");
    work("electrical", "Электромонтаж под ключ", "компл.", 1, electricalBase * 0.55);
  }

  // ── ВОДОСНАБЖЕНИЕ (под ключ) ───────────────────────────────
  if (cfg.plumbingIncluded) {
    const plumbingBase = area * 880 + 38000;
    material("plumbing", "Водоснабжение: трубы PPR, сантехника Grohe/Iddis", "компл.", 1, plumbingBase * 0.55, "ХВС/ГВС, смесители, унитаз, ванна");
    work("plumbing", "Монтаж водоснабжения", "компл.", 1, plumbingBase * 0.45);
  }

  // ── КАНАЛИЗАЦИЯ / СЕПТИК (под ключ) ────────────────────────
  if (cfg.sewageIncluded) {
    const sewageBase = 75000 + area * 320;
    material("sewage", "Септик энергонезависимый + трубы ПВХ ∅110", "компл.", 1, sewageBase * 0.6, "Тритон / Росток");
    work("sewage", "Монтаж канализации и септика", "компл.", 1, sewageBase * 0.4);
  }

  // ── ВНУТРЕННЯЯ ОТДЕЛКА ─────────────────────────────────────
  const finishData = INTERIOR_FINISHES[cfg.interiorFinish];
  if (finishData.pricePerM2 > 0) {
    const finishMatBase = area * finishData.pricePerM2;
    material("interiorFinish", finishData.label, "м²", area, finishData.pricePerM2, finishData.desc);
    work("interiorFinish", "Внутренняя отделка и финишные работы", "м²", area, finishMatBase * ASSEMBLY_SHARE.interiorFinish);
  }

  // ── ТЕРРАСА (материал + монтаж) ────────────────────────────
  if (cfg.terrace && cfg.terraceArea > 0) {
    const terraceBase = cfg.terraceArea * 6800;
    material("terrace", "Терраса: доска ДПК, перила", "м²", cfg.terraceArea, 6800 * 0.6, "материалы");
    work("terrace", "Монтаж террасы", "м²", cfg.terraceArea, terraceBase * 0.4);
  }

  // ── ГАРАЖ (материал + монтаж) ──────────────────────────────
  if (cfg.garage && cfg.garageArea > 0) {
    const garageBase = cfg.garageArea * 22000;
    material("garage", "Гараж: каркас + сэндвич-панели, ворота", "м²", cfg.garageArea, 22000 * 0.6, "секционные ворота");
    work("garage", "Монтаж гаража", "м²", cfg.garageArea, garageBase * 0.4);
  }

  // ── ОБЩИЕ РАСХОДНИКИ ───────────────────────────────────────
  material("frame", "Крепёж (саморезы, гвозди, анкеры, уголки)", "компл.", 1, area * 560, "ГОСТ, оцинкованные", true);
  material("frame", "Монтажная пена, лента ПСУЛ, герметик", "компл.", 1, area * 155, undefined, true);
  material("frame", "Антисептик для дерева (огне-биозащита)", "л", Math.round(area * 0.5), 390, "Сенеж Огнебио / Неомид 530", true);

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);

  // Услуги мастера (как раньше): прораб — % от (работы+материалы), снабженец — % от материалов
  const foreman = cfg.foremanIncluded ? Math.round((worksTotal + materialsTotal) * (cfg.foremanPct || 0) / 100) : 0;
  const supplier = cfg.supplierIncluded ? Math.round(materialsTotal * (cfg.supplierPct || 0) / 100) : 0;

  const subtotal = worksTotal + materialsTotal + foreman + supplier;
  const markupAmount = Math.round(subtotal * (markupPct / 100));
  const total = subtotal + markupAmount;

  const blocks: FrameHouseBlock[] = [
    "foundation", "frame", "insulation", "roofStructure", "roofing", "facade",
    "windows", "floor", "underfloorHeating", "heating", "electrical", "plumbing",
    "sewage", "interiorFinish", "terrace", "garage",
  ];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<FrameHouseBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, foreman, supplier,
    subtotal, markupAmount, total,
    regionCoeff: rc, blockTotals,
  };
}
