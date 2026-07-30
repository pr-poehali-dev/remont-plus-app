import {
  REGIONS,
  BATHROOM_TYPES,
  FLOOR_TILES,
  WALL_TILES,
  WATERPROOFING_TYPES,
} from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА САНУЗЛА (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений.
 *
 * Каждая позиция помечена блоком (block) — чтобы экранный калькулятор мог
 * показать привычную разбивку по этапам, а печать — полный построчный список.
 */

export type BathroomBlock =
  | "demolition"
  | "cabinDemolition"
  | "cabinConstruction"
  | "screed"
  | "waterproofing"
  | "floorTile"
  | "wallTile"
  | "plumbing"
  | "heatedFloor"
  | "ventilation"
  | "furniture"
  | "accessories";

export interface BathroomLine extends MaterialItem {
  block: BathroomBlock;
}

export interface BathroomEstimate {
  lines: BathroomLine[];
  works: BathroomLine[];
  materials: BathroomLine[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;     // works + materials (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  blockTotals: Record<BathroomBlock, number>;
}

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до регионального коэффициента) ─────────────
// Ставки приведены к рыночным ориентирам Москвы 2026 г. (только работа, без
// материалов). Источник проверки — прайсы бригад/сметные нормативы 2026.
const WORK_RATES = {
  demolitionFloor: 700,      // демонтаж напольной плитки+стяжки, ₽/м² (рынок 600–800; было 950 — завышено)
  demolitionWall: 600,       // демонтаж настенной плитки+штукатурки, ₽/м² (рынок 500–700; было 780)
  cabinDemolition: 2400,     // снос перегородок сантехкабины, ₽/м.п.
  cabinMasonry: 1350,        // кладка перегородок из блоков, ₽/м²
  screed: 900,               // устройство стяжки по маякам, ₽/м² (рынок 850–1000; было 750 — занижено)
  waterproofing: 500,        // нанесение гидроизоляции, ₽/м² (рынок 450–550; было 480)
  tileFloorBase: 0,          // берётся из плитки (installPriceM2)
  groutFloor: 170,           // затирка швов пола, ₽/м² (рынок 150–180; было 220 — завышено)
  groutWall: 150,            // затирка швов стен, ₽/м² (рынок 150–180; было 190 — завышено)
  toilet: 3800,              // установка унитаза, ₽/шт
  installSystem: 6500,       // монтаж инсталляции, ₽/шт
  sink: 2900,                // установка раковины, ₽/шт
  bath: 5400,                // установка ванны, ₽/шт
  showerCabin: 6000,         // монтаж душевого поддона/кабины, ₽/шт (было 7200 — завышено)
  mixer: 1800,               // установка смесителя, ₽/шт
  heatedFloorElectric: 900,  // монтаж электрического тёплого пола, ₽/м²
  heatedFloorWater: 1600,    // монтаж водяного тёплого пола, ₽/м² (было 1300 — занижено)
  ventilation: 3400,         // монтаж вытяжного вентилятора, ₽/шт
  vanity: 3200,              // монтаж тумбы с раковиной, ₽/шт
  mirror: 1600,              // установка зеркала, ₽/шт
  accessories: 2400,         // монтаж комплекта аксессуаров, ₽/компл
};

// ─── ЦЕНЫ МАТЕРИАЛОВ 2026, ₽ ─────────────────────────────────────────────────
const MAT_PRICES = {
  block: 120,                // пеноблок/ПГБ 600×300×100, ₽/шт
  blockGlue: 32,             // клей для блоков, ₽/кг
  serpyanka: 22,             // сетка-серпянка, ₽/м.п.
  rebar: 42,                 // арматура ∅6, ₽/м.п.
  tileGlue: 45,              // клей плиточный C2, ₽/кг
  groutMaterial: 280,        // затирка фуга, ₽/кг
  screedMix: 14,             // ЦПС М150, ₽/кг
  primer: 140,               // грунтовка, ₽/л
  screedBeacons: 55,         // маяки+плёнка, ₽/м²
  heatCable: 1850,           // нагревательный мат, ₽/м²
  thermostat: 4200,          // терморегулятор, ₽/шт
  heatPipe: 95,              // труба ∅16 PE-Xa, ₽/м.п.
  heatCollector: 13500,      // коллектор тёплого пола, ₽/шт
  ventilator: 4800,          // вентилятор вытяжной, ₽/шт
  accessoriesSet: 4200,      // набор аксессуаров, ₽/компл
  tileCrosses: 130,          // крестики/клинья, ₽/уп (на 5 м²)
  siliconeSealant: 420,      // герметик санитарный, ₽/шт
};

const TILE_WASTE = 1.1; // запас плитки 10%

export function calcBathroom(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
  seasonCoeff = 1.0,
): BathroomEstimate {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[3];
  // Сезонный коэффициент применяется ТОЛЬКО к работам (спрос на мастеров).
  const rc = region.coeff * seasonCoeff;
  const tc = BATHROOM_TYPES.find((b) => b.id === cfg.bathroomType)?.priceCoeff ?? 1.0;
  const floorTile = FLOOR_TILES.find((t) => t.id === cfg.floorTileId);
  const wallTile = WALL_TILES.find((t) => t.id === cfg.wallTileId);
  const waterproofing = WATERPROOFING_TYPES.find((w) => w.id === cfg.waterproofingType);

  const area = cfg.area || 0;
  const wallArea = cfg.wallArea || 0;
  // Оценка периметра по площади для квадратного помещения: сторона = √площадь,
  // периметр = 4·сторона. Приближение для типового санузла (точную геометрию
  // не вводим). Минимум 6 м.п. — нижняя граница для малых санузлов.
  const perimeter = Math.max(6, Math.round(Math.sqrt(area) * 4));
  const cabinWallSqm = perimeter * 2.5;

  const lines: BathroomLine[] = [];

  const round = (n: number) => Math.round(n);

  // work: цена за единицу с региональным коэффициентом
  const work = (block: BathroomBlock, name: string, unit: string, qty: number, ratePerUnit: number, spec?: string) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * rc);
    const q = Math.round(qty * 10) / 10;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // material: цена материала (региональный коэффициент применяем к работам и
  // оборудованию; сыпучие материалы по прайсу поставщика без rc)
  const material = (block: BathroomBlock, name: string, unit: string, qty: number, pricePerUnit: number, spec?: string, isConsumable?: boolean) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const q = Math.round(qty * 100) / 100;
    const price = round(pricePerUnit);
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };

  // ── ДЕМОНТАЖ ───────────────────────────────────────────────
  if (cfg.demolitionIncluded) {
    work("demolition", "Демонтаж напольной плитки и стяжки", "м²", area, WORK_RATES.demolitionFloor, "до основания, вынос");
    work("demolition", "Демонтаж настенной плитки и штукатурки", "м²", wallArea, WORK_RATES.demolitionWall, "очистка стен, вынос");
  }

  // ── ДЕМОНТАЖ САНТЕХКАБИНЫ ──────────────────────────────────
  if (cfg.cabinDemolition) {
    work("cabinDemolition", "Демонтаж перегородок сантехкабины", "м.п.", perimeter, WORK_RATES.cabinDemolition, "снос, разборка, вынос");
  }

  // ── ВОЗВЕДЕНИЕ САНТЕХКАБИНЫ ────────────────────────────────
  if (cfg.cabinConstruction) {
    work("cabinConstruction", "Кладка перегородок из блоков", "м²", cabinWallSqm, WORK_RATES.cabinMasonry, "возведение стен");
    const blockQty = Math.ceil(cabinWallSqm / 0.18); // 1 блок 0,6×0,3 = 0,18 м²
    material("cabinConstruction", "Пеноблоки / ПГБ 600×300×100 мм", "шт.", blockQty, MAT_PRICES.block, "перегородочные");
    const glueKg = Math.ceil(cabinWallSqm * 3);
    material("cabinConstruction", "Клей для газо- и пенобетона", "кг", glueKg, MAT_PRICES.blockGlue, "Ceresit CT 21 / аналог", true);
    material("cabinConstruction", "Сетка-серпянка штукатурная", "м.п.", Math.ceil(perimeter * 2), MAT_PRICES.serpyanka, undefined, true);
    material("cabinConstruction", "Арматура кладочная ∅6 мм", "м.п.", Math.ceil(perimeter * 2.5), MAT_PRICES.rebar, "перевязка рядов");
  }

  // ── СТЯЖКА ─────────────────────────────────────────────────
  if (cfg.screedIncluded) {
    work("screed", "Устройство цементной стяжки пола", "м²", area, WORK_RATES.screed, "по маякам");
    material("screed", "Цементно-песчаная смесь М150", "кг", Math.ceil(area * 22), MAT_PRICES.screedMix, "слой ~30 мм");
    material("screed", "Грунтовка глубокого проникновения", "л", Math.ceil(area * 0.2), MAT_PRICES.primer, undefined, true);
    material("screed", "Маяки и плёнка для стяжки", "м²", area, MAT_PRICES.screedBeacons, undefined, true);
  }

  // ── ГИДРОИЗОЛЯЦИЯ ──────────────────────────────────────────
  if (waterproofing && waterproofing.id !== "none") {
    // Площадь гидроизоляции = весь пол + 30% площади стен. Коэффициент 0.3 —
    // это гидроизоляция стен на высоту ~30 см от пола (зона у пола и мокрые
    // зоны: периметр, ванна, душ). Стандартная инженерная практика СП 29.13330.
    const hydroArea = area + wallArea * 0.3;
    work("waterproofing", "Нанесение гидроизоляции", "м²", hydroArea, WORK_RATES.waterproofing, `${waterproofing.label}, 2 слоя`);
    material("waterproofing", `Гидроизоляция: ${waterproofing.label}`, "м²", Math.ceil(hydroArea), waterproofing.priceM2, "расход на 2 слоя");
  }

  // ── ПЛИТКА ПОЛА ────────────────────────────────────────────
  if (floorTile) {
    const tileQty = area * TILE_WASTE;
    work("floorTile", "Укладка плитки на пол", "м²", area, floorTile.installPriceM2 * tc, floorTile.label);
    work("floorTile", "Затирка межплиточных швов (пол)", "м²", area, WORK_RATES.groutFloor);
    material("floorTile", `Плитка пол: ${floorTile.label}`, "м²", tileQty, floorTile.materialPriceM2, floorTile.description);
    material("floorTile", "Клей плиточный C2 (пол)", "кг", Math.ceil(area * 6), MAT_PRICES.tileGlue, "эластичный", true);
    // Норма затирки пола: 0.5 кг/м² (крупный формат, шов 2–3 мм). Оставлено.
    material("floorTile", "Затирка-фуга (пол)", "кг", Math.ceil(area * 0.5), MAT_PRICES.groutMaterial, "влагостойкая", true);
  }

  // ── ПЛИТКА СТЕН ────────────────────────────────────────────
  if (wallTile) {
    const tileQty = wallArea * TILE_WASTE;
    work("wallTile", "Укладка плитки на стены", "м²", wallArea, wallTile.installPriceM2 * tc, wallTile.label);
    work("wallTile", "Затирка межплиточных швов (стены)", "м²", wallArea, WORK_RATES.groutWall);
    material("wallTile", `Плитка стены: ${wallTile.label}`, "м²", tileQty, wallTile.materialPriceM2, wallTile.description);
    material("wallTile", "Клей плиточный C2 (стены)", "кг", Math.ceil(wallArea * 5), MAT_PRICES.tileGlue, "белый", true);
    // Норма затирки стен: 0.4 кг/м² — тонкий шов 1.5–2 мм у настенной плитки
    // (расход ниже, чем у пола). Ранее завышенные нормы 2 кг/м² не используются.
    material("wallTile", "Затирка-фуга (стены)", "кг", Math.ceil(wallArea * 0.4), MAT_PRICES.groutMaterial, "влагостойкая", true);
  }

  // расходники по плитке
  if (floorTile || wallTile) {
    const sqm = area + wallArea;
    material("floorTile", "Крестики, клинья, уголки СВП", "уп.", Math.ceil(sqm / 5), MAT_PRICES.tileCrosses, undefined, true);
    material("floorTile", "Герметик санитарный силиконовый", "шт.", 2, MAT_PRICES.siliconeSealant, "швы плинтуса/ванны", true);
  }

  // ── САНТЕХНИКА (только монтаж, приборы покупает заказчик) ───
  if (cfg.toiletInstall) work("plumbing", "Установка и подключение унитаза", "шт.", 1, WORK_RATES.toilet, "монтаж, подводка");
  if (cfg.installationSystemIncluded) work("plumbing", "Монтаж инсталляции подвесного унитаза", "шт.", 1, WORK_RATES.installSystem, "рама, бачок, кнопка");
  if (cfg.sinkInstall) work("plumbing", "Установка раковины с подводкой", "шт.", 1, WORK_RATES.sink, "сифон, подключение");
  if (cfg.bathInstall) work("plumbing", "Установка ванны со смесителем", "шт.", 1, WORK_RATES.bath, "выставление, слив");
  if (cfg.showerCabinInstall) work("plumbing", "Монтаж душевого поддона и кабины", "шт.", 1, WORK_RATES.showerCabin, "поддон, ограждение");
  if (cfg.mixersCount > 0) work("plumbing", "Установка смесителя", "шт.", cfg.mixersCount, WORK_RATES.mixer, "монтаж, подключение");

  // ── ТЁПЛЫЙ ПОЛ ─────────────────────────────────────────────
  if (cfg.heatedFloorIncluded) {
    if (cfg.heatedFloorType === "electric") {
      work("heatedFloor", "Монтаж электрического тёплого пола", "м²", area, WORK_RATES.heatedFloorElectric, "укладка мата");
      material("heatedFloor", "Нагревательный мат", "м²", area, MAT_PRICES.heatCable, `~${Math.round(area * 150)} Вт`);
      material("heatedFloor", "Терморегулятор программируемый", "шт.", 1, MAT_PRICES.thermostat);
    } else {
      work("heatedFloor", "Монтаж водяного тёплого пола", "м²", area, WORK_RATES.heatedFloorWater, "укладка контура");
      material("heatedFloor", "Труба тёплого пола ∅16 PE-Xa", "м.п.", Math.ceil(area * 8), MAT_PRICES.heatPipe);
      material("heatedFloor", "Коллектор водяного тёплого пола", "шт.", 1, MAT_PRICES.heatCollector);
    }
  }

  // ── ВЕНТИЛЯЦИЯ ─────────────────────────────────────────────
  if (cfg.ventilationIncluded) {
    work("ventilation", "Монтаж вытяжного вентилятора", "шт.", 1, WORK_RATES.ventilation, "установка, вывод канала");
    material("ventilation", "Вентилятор вытяжной", "шт.", 1, MAT_PRICES.ventilator, "IP44, 100 мм, таймер");
  }

  // ── МЕБЕЛЬ / ЗЕРКАЛО ───────────────────────────────────────
  if (cfg.vanityInstall) work("furniture", "Монтаж тумбы с раковиной", "шт.", 1, WORK_RATES.vanity, "навеска, регулировка");
  if (cfg.mirrorInstall) work("furniture", "Установка зеркала / зеркала-шкафа", "шт.", 1, WORK_RATES.mirror, "крепление");

  // ── АКСЕССУАРЫ ─────────────────────────────────────────────
  if (cfg.accessoriesIncluded) {
    work("accessories", "Монтаж комплекта аксессуаров", "компл.", 1, WORK_RATES.accessories, "держатели, крючки");
    material("accessories", "Набор аксессуаров (держатели, крючки, мыльница)", "компл.", 1, MAT_PRICES.accessoriesSet);
  }

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);
  const subtotal = worksTotal + materialsTotal;
  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blocks: BathroomBlock[] = [
    "demolition", "cabinDemolition", "cabinConstruction", "screed", "waterproofing",
    "floorTile", "wallTile", "plumbing", "heatedFloor", "ventilation", "furniture", "accessories",
  ];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<BathroomBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, subtotal, markupAmount, total,
    regionCoeff: rc, blockTotals,
  };
}