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

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до регионального коэффициента rc) ──────────
// Прозрачно: работа = СТАВКА × КОЛИЧЕСТВО в реальных единицах (₽/м², ₽/м.п.,
// ₽/шт). Никаких долей от стоимости материала (раньше ASSEMBLY_SHARE).
// Ставки приведены к рыночным ориентирам строительства Москвы/области 2026.
const WORK_RATES = {
  frame: 1500,            // сборка каркаса стен и перекрытий, ₽/м² стены
  insulation: 450,        // утепление + ветрозащита + пароизоляция, ₽/м²
  roofStructure: 800,     // монтаж стропил + обрешётки, ₽/м² кровли
  roofing: 600,           // монтаж кровельного покрытия, ₽/м² кровли
  facade: 700,            // монтаж фасада, ₽/м²
  windows: 2800,          // установка окна + откосы, ₽/шт
  floor: 1100,            // устройство пола (стяжка/лаги + покрытие), ₽/м²
  underfloorHeating: 1300,// монтаж тёплого пола, ₽/м²
  interiorFinish: 900,    // внутренняя отделка и финишные работы, ₽/м²
  terrace: 2600,          // монтаж террасы, ₽/м²
  garage: 3500,           // монтаж гаража, ₽/м²
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
    const q = Math.round(qty * 100) / 100;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };

  // work: работа = СТАВКА × КОЛИЧЕСТВО. price = round(rate × rc), total = round(price × q).
  // (как в bathroomEngine — прозрачно, без долей от материала).
  const work = (block: FrameHouseBlock, name: string, unit: string, qty: number, ratePerUnit: number, spec?: string) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * rc);
    const q = Math.round(qty * 100) / 100;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // ── ФУНДАМЕНТ (одна понятная позиция «под ключ») ───────────
  // Базовая цена фундамента уже включает и материалы, и работы (земляные,
  // опалубка, армирование, бетон). Оставляем единой позицией «под ключ».
  const foundData = FOUNDATION_TYPES[cfg.foundation];
  const foundationBase = foundData.basePrice * (1 + (area - 50) * 0.008);
  material("foundation", `Фундамент под ключ: ${foundData.label}`, "компл.", 1, foundationBase, `${foundData.desc} (материалы + работы)`);

  // ── КАРКАС СТЕН ────────────────────────────────────────────
  const frameTech = FRAME_WALL_TECHS[cfg.wallTech];
  material("frame", frameTech.label, "м²", wallArea, frameTech.pricePerM2, frameTech.desc);
  work("frame", "Монтаж каркаса стен и перекрытий", "м²", wallArea, WORK_RATES.frame);

  // ── УТЕПЛЕНИЕ ──────────────────────────────────────────────
  const insulData = FRAME_INSULATIONS[cfg.insulation];
  material("insulation", insulData.label, "м²", insulArea, insulData.pricePerM2, `${insulData.thickness} мм`);
  material("insulation", "Пароизоляция", "м²", (wallArea + area) * 1.15, 58, "ТЕХНОНИКОЛЬ Паробарьер", true);
  material("insulation", "Ветрозащитная мембрана", "м²", roofArea * 1.1 + wallArea * 0.5, 36, "Изоспан A / Ютавек", true);
  work("insulation", "Утепление + ветрозащита + пароизоляция", "м²", insulArea, WORK_RATES.insulation);

  // ── КРОВЛЯ: КАРКАС ─────────────────────────────────────────
  material("roofStructure", "Стропильная система и обрешётка", "м²", roofArea, 1650, "доска 50×200 / 25×100, сосна");
  work("roofStructure", "Монтаж стропильной системы и обрешётки", "м²", roofArea, WORK_RATES.roofStructure);

  // ── КРОВЛЯ: ПОКРЫТИЕ ───────────────────────────────────────
  const roofMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  material("roofing", roofMat.label, "м²", roofArea, roofMat.pricePerM2);
  work("roofing", "Монтаж кровельного покрытия", "м²", roofArea, WORK_RATES.roofing);

  // ── ФАСАД ──────────────────────────────────────────────────
  const facadeData = FACADE_TYPES[cfg.facade];
  material("facade", facadeData.label, "м²", wallArea, facadeData.pricePerM2, facadeData.desc);
  work("facade", "Монтаж фасада", "м²", wallArea, WORK_RATES.facade);

  // ── ОКНА ───────────────────────────────────────────────────
  if (cfg.windowCount > 0) {
    const winData = WINDOW_TYPES[cfg.windowType];
    material("windows", winData.label, "шт.", cfg.windowCount, winData.pricePerUnit, "стеклопакет, фурнитура");
    work("windows", "Установка окон, откосы", "шт.", cfg.windowCount, WORK_RATES.windows);
  }

  // ── ПОЛЫ ───────────────────────────────────────────────────
  const floorData = FLOOR_TYPES[cfg.floorType];
  material("floor", floorData.label, "м²", area, floorData.pricePerM2);
  work("floor", "Устройство пола (стяжка/лаги + покрытие)", "м²", area, WORK_RATES.floor);

  // ── ТЁПЛЫЙ ПОЛ ─────────────────────────────────────────────
  if (cfg.underfloorHeating) {
    material("underfloorHeating", "Тёплый пол водяной (коллектор + трубы)", "м²", area, 1540, "PE-RT ∅16, шаг 150 мм");
    work("underfloorHeating", "Монтаж тёплого пола", "м²", area, WORK_RATES.underfloorHeating);
  }

  // ── ОТОПЛЕНИЕ (одна понятная позиция «под ключ») ───────────
  {
    const heatData = HEATING_TYPES[cfg.heating];
    const heatingBase = heatData.basePrice + area * 320;
    material("heating", `Отопление под ключ: ${heatData.label}`, "компл.", 1, heatingBase, `${heatData.desc} (материалы + работы)`);
  }

  // ── ЭЛЕКТРИКА (одна понятная позиция «под ключ») ───────────
  if (cfg.electricalIncluded) {
    const electricalBase = area * 1650 + 28000;
    material("electrical", "Электрика под ключ: кабель, щиток ABB/IEK, автоматы, розетки, монтаж", "компл.", 1, electricalBase, "ВВГнг-LS, 16–32 А (материалы + работы)");
  }

  // ── ВОДОСНАБЖЕНИЕ (одна понятная позиция «под ключ») ───────
  if (cfg.plumbingIncluded) {
    const plumbingBase = area * 880 + 38000;
    material("plumbing", "Водоснабжение под ключ: трубы PPR, сантехника Grohe/Iddis, монтаж", "компл.", 1, plumbingBase, "ХВС/ГВС, смесители, унитаз, ванна (материалы + работы)");
  }

  // ── КАНАЛИЗАЦИЯ / СЕПТИК (одна понятная позиция «под ключ») ─
  if (cfg.sewageIncluded) {
    const sewageBase = 75000 + area * 320;
    material("sewage", "Канализация и септик под ключ: септик + трубы ПВХ ∅110, монтаж", "компл.", 1, sewageBase, "Тритон / Росток (материалы + работы)");
  }

  // ── ВНУТРЕННЯЯ ОТДЕЛКА ─────────────────────────────────────
  const finishData = INTERIOR_FINISHES[cfg.interiorFinish];
  if (finishData.pricePerM2 > 0) {
    material("interiorFinish", finishData.label, "м²", area, finishData.pricePerM2, finishData.desc);
    work("interiorFinish", "Внутренняя отделка и финишные работы", "м²", area, WORK_RATES.interiorFinish);
  }

  // ── ТЕРРАСА (материал по прайсу + монтаж по ставке) ────────
  if (cfg.terrace && cfg.terraceArea > 0) {
    material("terrace", "Терраса: доска ДПК, перила", "м²", cfg.terraceArea, 4100, "материалы (доска ДПК, перила, лаги)");
    work("terrace", "Монтаж террасы", "м²", cfg.terraceArea, WORK_RATES.terrace);
  }

  // ── ГАРАЖ (материал по прайсу + монтаж по ставке) ──────────
  if (cfg.garage && cfg.garageArea > 0) {
    material("garage", "Гараж: каркас + сэндвич-панели, ворота", "м²", cfg.garageArea, 13200, "секционные ворота");
    work("garage", "Монтаж гаража", "м²", cfg.garageArea, WORK_RATES.garage);
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