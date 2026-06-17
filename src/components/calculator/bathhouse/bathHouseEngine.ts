import type { BathHouseConfig } from "./BathHouseTypes";
import {
  WALL_MATERIALS,
  FOUNDATION_TYPES,
  ROOF_TYPES,
  ROOFING_MATERIALS,
  INSULATION_MATERIALS,
  WALL_FINISHES,
  STOVE_TYPES,
  VENTILATION_TYPES,
  SHELF_MATERIALS,
  FLOOR_MATERIALS,
  REGIONS,
} from "./BathHouseTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА БАНИ (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений
 * (раньше assembly = materialSum × 0.42, materialsBase оценочно).
 *
 * Каждая позиция помечена блоком (block) — экранный калькулятор показывает
 * привычную разбивку по блокам (blockTotals), печать — полный список.
 *
 * Региональный коэффициент rc применяется ко всем позициям (как и раньше:
 * и материалы, и работы умножались на rc).
 *
 * Услуги мастера (foreman/supplier) — надбавки поверх позиций, входят в subtotal,
 * в детальной печати отдельными строками не показываются.
 */

export type BathHouseBlock =
  | "foundation"
  | "walls"
  | "roofStructure"
  | "roofing"
  | "insulation"
  | "wallFinishSteam"
  | "wallFinishWash"
  | "wallFinishRest"
  | "floor"
  | "stove"
  | "ventilation"
  | "shelves"
  | "windows"
  | "chimney"
  | "tank"
  | "terrace"
  | "electrical"
  | "assembly";

export interface BathHouseLine extends MaterialItem {
  block: BathHouseBlock;
}

export interface BathHouseEstimate {
  lines: BathHouseLine[];
  works: BathHouseLine[];
  materials: BathHouseLine[];
  worksTotal: number;
  materialsTotal: number;
  foreman: number;
  supplier: number;
  subtotal: number;     // works + materials + foreman + supplier (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  blockTotals: Record<BathHouseBlock, number>;
  // текстовые рекомендации (сохранены из прежней логики)
  stoveRecommendation: string;
  ventRecommendation: string;
  shelfRecommendation: string;
}

// Доля монтажа от стоимости материалов соответствующего блока (работа = % материала)
const ASSEMBLY_SHARE: Record<Exclude<BathHouseBlock, "assembly">, number> = {
  foundation: 0.0,        // фундамент — цена «под ключ» уже включает работы → ниже отдельная позиция
  walls: 0.55,            // возведение коробки
  roofStructure: 0.65,    // монтаж стропил/обрешётки
  roofing: 0.45,          // монтаж кровли
  insulation: 0.50,       // монтаж утепления/пароизоляции
  wallFinishSteam: 0.60,  // монтаж вагонки
  wallFinishWash: 0.60,
  wallFinishRest: 0.55,
  floor: 0.55,            // устройство пола
  stove: 0.18,            // монтаж печи
  ventilation: 0.35,      // монтаж вентиляции
  shelves: 0.50,          // изготовление/монтаж полка
  windows: 0.20,          // установка окон
  chimney: 0.30,          // монтаж дымохода
  tank: 0.20,             // установка бака
  terrace: 0.0,           // цена террасы уже «материал+монтаж»
  electrical: 0.0,        // электрика — цена «под ключ» (работа)
};

export function calcBathHouse(cfg: BathHouseConfig, regionId: string, markupPct = 0): BathHouseEstimate {
  const region = REGIONS[regionId] ?? REGIONS["moscow"];
  const rc = region.coeff;

  const area = Math.max(cfg.totalArea, 6);
  const perimeter = Math.sqrt(area) * 4;
  const wallArea = perimeter * cfg.wallHeight;
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;

  const lines: BathHouseLine[] = [];
  const round = (n: number) => Math.round(n);

  // material: цена по прайсу × rc
  const material = (block: BathHouseBlock, name: string, unit: string, qty: number, pricePerUnit: number, spec?: string, isConsumable?: boolean) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const price = round(pricePerUnit * rc);
    const q = Math.round(qty * 100) / 100;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };

  // work: цена работы × rc (block "assembly" для общестроя или собственный блок)
  const work = (block: BathHouseBlock, name: string, unit: string, qty: number, totalWork: number, spec?: string) => {
    if (qty <= 0 || totalWork <= 0) return;
    const t = round(totalWork * rc);
    const q = Math.round(qty * 100) / 100;
    const price = q > 0 ? round(t / q) : 0;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // ── ФУНДАМЕНТ (цена «под ключ» = материал + работа) ─────────
  const foundData = FOUNDATION_TYPES[cfg.foundation];
  const foundationBase = foundData.basePrice * (1 + (area - 24) * 0.012);
  // делим на материал (60%) и работу (40%)
  material("foundation", `Фундамент: ${foundData.label}`, "компл.", 1, foundationBase * 0.6, foundData.desc);
  work("foundation", "Устройство фундамента", "компл.", 1, foundationBase * 0.4, foundData.label);

  // ── СТЕНЫ (коробка) ────────────────────────────────────────
  const wallMat = WALL_MATERIALS[cfg.wallMaterial];
  const wallsMatBase = wallArea * wallMat.pricePerM2;
  material("walls", wallMat.label, "м²", wallArea, wallMat.pricePerM2, wallMat.category);
  work("walls", "Возведение коробки (стены)", "м²", wallArea, wallsMatBase * ASSEMBLY_SHARE.walls);

  // ── КРОВЛЯ: КАРКАС (стропила, обрешётка) ───────────────────
  const roofStructBase = roofArea * 1980;
  material("roofStructure", "Стропильная система и обрешётка", "м²", roofArea, 1980, "доска 50×200 / 25×100, сосна");
  work("roofStructure", "Монтаж стропильной системы и обрешётки", "м²", roofArea, roofStructBase * ASSEMBLY_SHARE.roofStructure);

  // ── КРОВЛЯ: ПОКРЫТИЕ ───────────────────────────────────────
  const roofingMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  const roofingMatBase = roofArea * roofingMat.pricePerM2;
  material("roofing", roofingMat.label, "м²", roofArea, roofingMat.pricePerM2);
  work("roofing", "Монтаж кровельного покрытия", "м²", roofArea, roofingMatBase * ASSEMBLY_SHARE.roofing);

  // ── УТЕПЛЕНИЕ ──────────────────────────────────────────────
  const insulationMat = INSULATION_MATERIALS[cfg.insulation];
  const insulationVolume = (wallArea + area) * (cfg.insulationThickness / 1000);
  const insulMatBase = insulationVolume * insulationMat.pricePerM3;
  material("insulation", insulationMat.label, "м³", insulationVolume, insulationMat.pricePerM3, `${cfg.insulationThickness} мм`);
  material("insulation", "Пароизоляция", "м²", wallArea * 1.15, 52, "Изоспан / Ютафол", true);
  material("insulation", "Ветрозащитная мембрана", "м²", roofArea * 1.1, 32, "Изоспан A", true);
  work("insulation", "Монтаж утепления и пароизоляции", "м²", wallArea + area, insulMatBase * ASSEMBLY_SHARE.insulation);

  // ── ОТДЕЛКА СТЕН ───────────────────────────────────────────
  const steamWallArea = cfg.steamRoomArea * 4 * 0.8;
  const washWallArea = cfg.washRoomArea * 4 * 0.8;
  const restWallArea = (cfg.restRoomArea + cfg.dressingRoomArea) * 4 * 0.8;
  const finSteam = WALL_FINISHES[cfg.wallFinishSteam];
  const finWash = WALL_FINISHES[cfg.wallFinishWash];
  const finRest = WALL_FINISHES[cfg.wallFinishRest];
  if (steamWallArea > 0) {
    material("wallFinishSteam", `${finSteam.label} (парная)`, "м²", steamWallArea, finSteam.pricePerM2, "AB сорт, шип-паз");
    work("wallFinishSteam", "Отделка парной (монтаж вагонки)", "м²", steamWallArea, steamWallArea * finSteam.pricePerM2 * ASSEMBLY_SHARE.wallFinishSteam);
  }
  if (washWallArea > 0) {
    material("wallFinishWash", `${finWash.label} (мойка)`, "м²", washWallArea, finWash.pricePerM2, "AB сорт");
    work("wallFinishWash", "Отделка мойки (монтаж)", "м²", washWallArea, washWallArea * finWash.pricePerM2 * ASSEMBLY_SHARE.wallFinishWash);
  }
  if (restWallArea > 0) {
    material("wallFinishRest", `${finRest.label} (комната отдыха)`, "м²", restWallArea, finRest.pricePerM2, "AB сорт");
    work("wallFinishRest", "Отделка комнаты отдыха (монтаж)", "м²", restWallArea, restWallArea * finRest.pricePerM2 * ASSEMBLY_SHARE.wallFinishRest);
  }

  // ── ПОЛ ────────────────────────────────────────────────────
  const floorMat = FLOOR_MATERIALS[cfg.floorMaterial];
  material("floor", floorMat.label, "м²", area, floorMat.pricePerM2);
  if (cfg.underfloorHeating) material("floor", "Тёплый пол электрический", "м²", area, 2420, "Теплолюкс, 150 Вт/м²");
  work("floor", "Устройство пола", "м²", area, area * floorMat.pricePerM2 * ASSEMBLY_SHARE.floor);

  // ── ПЕЧЬ ───────────────────────────────────────────────────
  const stoveData = STOVE_TYPES[cfg.stoveType];
  material("stove", stoveData.label, "шт.", 1, stoveData.price, stoveData.power);
  work("stove", "Монтаж и обвязка печи", "шт.", 1, stoveData.price * ASSEMBLY_SHARE.stove);

  // ── ВЕНТИЛЯЦИЯ ─────────────────────────────────────────────
  const ventData = VENTILATION_TYPES[cfg.ventilation];
  const ventBase = ventData.price + area * 240;
  material("ventilation", ventData.label, "компл.", 1, ventBase, ventData.desc);
  work("ventilation", "Монтаж вентиляции", "компл.", 1, ventBase * ASSEMBLY_SHARE.ventilation);

  // ── ПОЛОК ──────────────────────────────────────────────────
  const shelfMat = SHELF_MATERIALS[cfg.shelfMaterial];
  const shelfArea = cfg.steamRoomArea * 0.35 * cfg.shelfTiers * (cfg.shelfWidth / 0.6);
  if (shelfArea > 0) {
    material("shelves", `Полок из ${shelfMat.label.toLowerCase()}`, "м²", shelfArea, shelfMat.pricePerM2, `${cfg.shelfTiers} яруса, ш. ${cfg.shelfWidth} м`);
    work("shelves", "Изготовление и монтаж полка", "м²", shelfArea, shelfArea * shelfMat.pricePerM2 * ASSEMBLY_SHARE.shelves);
  }

  // ── ОКНА ───────────────────────────────────────────────────
  const windowsBase = cfg.window_pvc ? 14000 : 23000;
  if (cfg.windowCount > 0) {
    material("windows", cfg.window_pvc ? "Окно ПВХ 600×600 мм" : "Окно деревянное 600×600 мм", "шт.", cfg.windowCount, windowsBase, cfg.window_pvc ? "двойной стеклопакет" : "со стеклопакетом");
    work("windows", "Установка окон", "шт.", cfg.windowCount, cfg.windowCount * windowsBase * ASSEMBLY_SHARE.windows);
  }

  // ── ДЫМОХОД ────────────────────────────────────────────────
  if (cfg.chimney) {
    const chimneyBase = 34500;
    material("chimney", "Дымоход сэндвич-труба ∅115", "компл.", 1, chimneyBase, "нерж./оц., 8 секций");
    work("chimney", "Монтаж дымохода", "компл.", 1, chimneyBase * ASSEMBLY_SHARE.chimney);
  }

  // ── БАК ДЛЯ ВОДЫ ───────────────────────────────────────────
  if (cfg.tankVolume > 0) {
    const tankBase = 10500 + cfg.tankVolume * 55;
    material("tank", `Бак для воды ${cfg.tankVolume} л`, "шт.", 1, tankBase, "нержавеющая сталь");
    work("tank", "Установка бака", "шт.", 1, tankBase * ASSEMBLY_SHARE.tank);
  }

  // ── ТЕРРАСА (материал + монтаж в цене) ─────────────────────
  if (cfg.terrace && cfg.terraceArea > 0) {
    const terraceBase = cfg.terraceArea * 5900;
    material("terrace", "Терраса: доска лиственница, перила", "м²", cfg.terraceArea, 5900 * 0.6, "материалы");
    work("terrace", "Монтаж террасы", "м²", cfg.terraceArea, terraceBase * 0.4);
  }

  // ── ЭЛЕКТРИКА (цена «под ключ» = работа + материалы) ───────
  if (cfg.electricalFull || cfg.electricalBasic) {
    const electricalBase = cfg.electricalFull ? area * 2200 + 27000 : area * 1050 + 15000;
    material("electrical", cfg.electricalFull ? "Электрика (полная): кабель, автоматы, розетки" : "Электрика (базовая): кабель, автоматы, розетки", "компл.", 1, electricalBase * 0.5, "материалы");
    work("electrical", cfg.electricalFull ? "Электромонтаж (полный)" : "Электромонтаж (базовый)", "компл.", 1, electricalBase * 0.5);
  }

  // ── РАСХОДНИКИ ОБЩИЕ ───────────────────────────────────────
  material("assembly", "Крепёж (саморезы, нагели, анкеры)", "компл.", 1, area * 420, "ГОСТ, оцинк.", true);
  const woodArea = wallArea + steamWallArea + washWallArea + restWallArea;
  material("assembly", "Антисептик для бани", "л", Math.round(woodArea * 0.18), 420, "Тиккурила Валтти / Сенеж", true);
  material("assembly", "Монтажная пена + герметик", "компл.", 1, area * 110, undefined, true);

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);

  // Услуги мастера (как раньше): прораб — % от (работы+материалы), снабженец — % от материалов
  const foreman = cfg.foremanIncluded ? Math.round((worksTotal + materialsTotal) * (cfg.foremanPct || 10) / 100) : 0;
  const supplier = cfg.supplierIncluded ? Math.round(materialsTotal * (cfg.supplierPct || 5) / 100) : 0;

  const subtotal = worksTotal + materialsTotal + foreman + supplier;
  const markupAmount = Math.round(subtotal * (markupPct / 100));
  const total = subtotal + markupAmount;

  const blocks: BathHouseBlock[] = [
    "foundation", "walls", "roofStructure", "roofing", "insulation",
    "wallFinishSteam", "wallFinishWash", "wallFinishRest", "floor", "stove",
    "ventilation", "shelves", "windows", "chimney", "tank", "terrace",
    "electrical", "assembly",
  ];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<BathHouseBlock, number>);

  // ── РЕКОМЕНДАЦИИ (сохранены из прежней логики) ─────────────
  const steamVol = cfg.steamRoomArea * cfg.wallHeight;
  const recommendedKw = steamVol * 1.2;
  const stovePower = stoveData.power;
  let stoveRecommendation = `Объём парной ${steamVol.toFixed(1)} м³ → рекомендуемая мощность ${recommendedKw.toFixed(0)}–${(recommendedKw * 1.3).toFixed(0)} кВт. Выбранная печь: ${stovePower}.`;
  if (cfg.stoveType === "electric_infrared") stoveRecommendation += " ИК-кабина — это не замена парной, а отдельный продукт.";
  if (cfg.stoveType === "brick_classic" || cfg.stoveType === "brick_heater") stoveRecommendation += " Кирпичная печь требует отдельного фундамента.";

  const ventRecommendation = cfg.steamRoomArea < 8
    ? "Для парной до 8 м² достаточно естественной канальной вентиляции."
    : cfg.steamRoomArea < 15
    ? "Для парной 8–15 м² рекомендуем принудительную приточную вентиляцию."
    : "Для большой парной 15+ м² обязательна полная принудительная вентиляция с таймером.";

  let shelfRecommendation = `Площадь полога ${shelfArea.toFixed(1)} м² (${cfg.shelfTiers} яруса × ${cfg.shelfWidth} м ширина). `;
  if (cfg.shelfTiers === 1) shelfRecommendation += "Один ярус — минималистично, для небольших парных.";
  else if (cfg.shelfTiers === 2) shelfRecommendation += "Два яруса — классика. Нижний для сидения, верхний для лежания.";
  else shelfRecommendation += "Три яруса — максимальная вместимость, температура на верхнем полоке выше.";

  return {
    lines, works, materials,
    worksTotal, materialsTotal, foreman, supplier,
    subtotal, markupAmount, total,
    regionCoeff: rc, blockTotals,
    stoveRecommendation, ventRecommendation, shelfRecommendation,
  };
}