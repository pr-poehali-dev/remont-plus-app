import {
  FLOORING_PRODUCTS,
  SUBSTRATE_OPTIONS,
  INSTALL_PATTERNS,
  SKIRTING_OPTIONS,
  REGIONS,
} from "./FlooringTypes";
import type { FlooringConfig } from "./FlooringTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА НАПОЛЬНЫХ ПОКРЫТИЙ (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений
 * (0.55 / 0.7 / 0.6 / 0.45 / 0.4) — каждая строка реальна.
 *
 * Каждая позиция помечена блоком (block) — чтобы экранный калькулятор мог
 * показать привычную разбивку по этапам, а печать — полный построчный список.
 *
 * Региональный коэффициент rc применяется к РАБОТАМ. Материалы — по прайсу
 * поставщика (берём базу из FlooringTypes / констант MAT_PRICES ниже).
 */

export type FlooringBlock =
  | "material"     // само покрытие
  | "substrate"    // подложка
  | "install"      // монтаж покрытия
  | "skirting"     // плинтус (изделие + монтаж)
  | "demolition"   // демонтаж старого пола
  | "leveling"     // выравнивание / стяжка
  | "threshold"    // переходные пороги
  | "consumables"; // расходники (клей, праймер, смола и т.п.)

export interface FlooringLine extends MaterialItem {
  block: FlooringBlock;
}

export interface FlooringEstimate {
  lines: FlooringLine[];
  works: FlooringLine[];
  materials: FlooringLine[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;      // works + materials (без наценки)
  markupAmount: number;
  total: number;         // subtotal + markup
  regionCoeff: number;
  materialQty: number;   // фактический объём покрытия с запасом, м²
  blockTotals: Record<FlooringBlock, number>;
}

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до регионального коэффициента) ─────────────
// Ставки приведены к рыночным ориентирам Москвы 2026 г. (только работа).
const WORK_RATES = {
  demolition: 300,         // демонтаж старого покрытия, ₽/м² (рынок 250–350; было 180 — занижено)
  levelingApply: 500,      // устройство наливного пола/выравнивание, ₽/м² (рынок 450–600; было 350 — занижено)
  levelingPrimer: 80,      // грунтование основания, ₽/м² (рынок ~80; было 60)
  skirtingInstall: 220,    // монтаж плинтуса, ₽/м.п.
  thresholdInstall: 350,   // монтаж переходного порога, ₽/шт
  substrateLay: 60,        // укладка подложки, ₽/м²
  // эпоксидные работы (разворот «заливки» на этапы), ₽/м²
  epoxyGrind: 280,         // шлифовка/подготовка основания, ₽/м²
  epoxyPrimer: 140,        // нанесение грунта, ₽/м²
  epoxyPour: 0,            // заливка — берётся из product.installPrice
  epoxyLacquer: 220,       // нанесение финишного лака, ₽/м²
};

// ─── ЦЕНЫ МАТЕРИАЛОВ / РАСХОДНИКОВ 2026, ₽ ───────────────────────────────────
const MAT_PRICES = {
  threshold: 850,          // порог стыковочный алюминий/ламинат 90 см, ₽/шт
  glueDowel: 25,           // клей/дюбели для плинтуса, ₽/м.п.
  wedges: 120,             // распорные клинья/крестики, ₽/уп (на 10 м²)
  levelingMix: 24,         // нивелир-смесь/наливной пол, ₽/кг
  levelingPrimer: 280,     // грунт бетоноконтакт, ₽/л
  // эпоксидные расходники (упаковки)
  epoxyPrimerPack: 3_800,  // эпоксидный праймер 2К, 4 кг (≈13 м²)
  epoxyResinPack: 6_400,   // эпоксидная смола наливная 2К, 10 кг (≈6.5 м²)
  epoxyLacquerPack: 4_200, // финишный ПУ лак 2К, 5 кг (≈25 м²)
  epoxyFlakePack: 1_200,   // декоративные флоки/чипсы 0.5 кг (≈8 м²)
  epoxyDegreaser: 380,     // обезжириватель/растворитель 1 л (≈20 м²)
};

export function calcFlooring(
  cfg: Omit<FlooringConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): FlooringEstimate {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;

  const product = FLOORING_PRODUCTS.find((p) => p.id === cfg.productId);
  const substrate = SUBSTRATE_OPTIONS.find((s) => s.id === cfg.substrateId);
  const pattern = INSTALL_PATTERNS.find((p) => p.id === cfg.patternId);
  const skirting = SKIRTING_OPTIONS.find((s) => s.id === cfg.skirtingId);

  const area = cfg.area || 0;
  const perimeter = cfg.perimeter || 0;
  const isEpoxy = product?.category === "epoxy";

  const wasteFactor = 1 + (pattern?.wastePct ?? 5) / 100;
  const materialQty = Math.ceil(area * wasteFactor * 10) / 10;

  const lines: FlooringLine[] = [];
  const round = (n: number) => Math.round(n);

  // work: цена за единицу с региональным коэффициентом
  const work = (
    block: FlooringBlock,
    name: string,
    unit: string,
    qty: number,
    ratePerUnit: number,
    spec?: string,
  ) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * rc);
    const q = Math.round(qty * 10) / 10;
    lines.push({
      block,
      name,
      spec,
      unit,
      qty: q,
      pricePerUnit: price,
      total: round(price * q),
      isWork: true,
    });
  };

  // material: цена по прайсу поставщика (без rc)
  const material = (
    block: FlooringBlock,
    name: string,
    unit: string,
    qty: number,
    pricePerUnit: number,
    spec?: string,
    isConsumable?: boolean,
  ) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const q = Math.round(qty * 100) / 100;
    const price = round(pricePerUnit);
    lines.push({
      block,
      name,
      spec,
      unit,
      qty: q,
      pricePerUnit: price,
      total: round(price * q),
      isConsumable,
      isWork: false,
    });
  };

  // ── ДЕМОНТАЖ ───────────────────────────────────────────────
  if (cfg.demolitionIncluded) {
    work("demolition", "Демонтаж старого напольного покрытия", "м²", area, WORK_RATES.demolition, "со снятием и выносом");
  }

  // ── ВЫРАВНИВАНИЕ / СТЯЖКА ──────────────────────────────────
  if (cfg.levelingIncluded) {
    const th = cfg.levelingThicknessMm || 0;
    work("leveling", "Грунтование основания (бетоноконтакт)", "м²", area, WORK_RATES.levelingPrimer);
    work("leveling", "Устройство наливного пола / выравнивание", "м²", area, WORK_RATES.levelingApply, `толщ. ${th} мм`);
    const mixKg = Math.ceil(area * th * 1.8); // ~1.8 кг/м² на 1 мм
    material("leveling", "Наливной пол / нивелир-смесь", "кг", mixKg, MAT_PRICES.levelingMix, `толщ. ${th} мм`, true);
    material("leveling", "Грунтовка бетоноконтакт", "л", Math.ceil(area * 0.15), MAT_PRICES.levelingPrimer, "для стяжки", true);
  }

  // ── ПОДЛОЖКА ───────────────────────────────────────────────
  if (substrate && substrate.id !== "none" && substrate.pricePerM2 > 0) {
    material("substrate", substrate.name, "м²", area, substrate.pricePerM2, substrate.description);
    work("substrate", "Укладка подложки", "м²", area, WORK_RATES.substrateLay);
  }

  // ── ПОКРЫТИЕ (материал) ────────────────────────────────────
  if (product) {
    material(
      "material",
      `${product.brand} ${product.name}`,
      "м²",
      materialQty,
      product.pricePerM2,
      `${product.wear}, ${product.thickness} мм`,
    );
  }

  // ── МОНТАЖ ПОКРЫТИЯ ────────────────────────────────────────
  if (product) {
    if (isEpoxy) {
      // разворачиваем «заливку» в реальные этапы
      work("install", "Шлифовка и подготовка основания", "м²", area, WORK_RATES.epoxyGrind, `${product.thickness} мм система`);
      work("install", "Грунтование под эпоксидный пол", "м²", area, WORK_RATES.epoxyPrimer);
      work("install", "Заливка эпоксидного наливного пола", "м²", area, product.installPrice, product.name);
      work("install", "Нанесение финишного полиуретанового лака", "м²", area, WORK_RATES.epoxyLacquer);
    } else {
      work(
        "install",
        `Укладка покрытия: ${product.name}`,
        "м²",
        area,
        product.installPrice,
        pattern ? `${pattern.name}, отход ${pattern.wastePct}%` : undefined,
      );
    }
  }

  // ── ПЛИНТУС ────────────────────────────────────────────────
  if (cfg.skirtingIncluded && skirting && skirting.id !== "none" && skirting.pricePerM > 0) {
    material("skirting", skirting.name, "м.п.", perimeter, skirting.pricePerM, skirting.description || "с заглушками и углами");
    work("skirting", "Монтаж плинтуса", "м.п.", perimeter, WORK_RATES.skirtingInstall, "с креплением и стыковкой");
    material("skirting", "Клей для плинтуса / дюбели", "м.п.", perimeter, MAT_PRICES.glueDowel, "крепёж", true);
  }

  // ── ПОРОГИ ─────────────────────────────────────────────────
  if (cfg.thresholdCount > 0) {
    material("threshold", "Порог стыковочный", "шт.", cfg.thresholdCount, MAT_PRICES.threshold, "алюминий/ламинат, 90 см");
    work("threshold", "Монтаж переходного порога", "шт.", cfg.thresholdCount, WORK_RATES.thresholdInstall);
  }

  // ── РАСХОДНИКИ ──────────────────────────────────────────────
  if (product && area > 0) {
    if (isEpoxy) {
      const primerPacks = Math.ceil(area / 13);
      material("consumables", "Эпоксидный праймер 2К, 4 кг", "компл.", primerPacks, MAT_PRICES.epoxyPrimerPack, "Uzin PE 460 / Mapei Primer G", true);
      const resinPacks = Math.ceil(area / 6.5);
      material("consumables", "Эпоксидная смола наливная 2К, 10 кг", "компл.", resinPacks, MAT_PRICES.epoxyResinPack, "компонент A+B", true);
      const lacquerPacks = Math.ceil(area / 25);
      material("consumables", "Финишный полиуретановый лак 2К, 5 кг", "компл.", lacquerPacks, MAT_PRICES.epoxyLacquerPack, "Uzin PE 480 / Bostik PU 2K", true);
      if (product.id === "epoxy-flake" || product.id === "epoxy-3d") {
        material("consumables", "Декоративные флоки / чипсы 0.5 кг", "шт.", Math.ceil(area / 8), MAT_PRICES.epoxyFlakePack, "ColorFlakes Standart Mix", true);
      }
      material("consumables", "Обезжириватель / растворитель, 1 л", "шт.", Math.ceil(area / 20), MAT_PRICES.epoxyDegreaser, "подготовка основания", true);
    } else {
      material("consumables", "Распорные клинья, крестики", "уп.", Math.ceil(area / 10), MAT_PRICES.wedges, "для укладки с зазором", true);
    }
  }

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);
  const subtotal = worksTotal + materialsTotal;
  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blockTotals: Record<FlooringBlock, number> = {
    material: 0,
    substrate: 0,
    install: 0,
    skirting: 0,
    demolition: 0,
    leveling: 0,
    threshold: 0,
    consumables: 0,
  };
  for (const l of lines) blockTotals[l.block] += l.total;

  return {
    lines,
    works,
    materials,
    worksTotal,
    materialsTotal,
    subtotal,
    markupAmount,
    total,
    regionCoeff: rc,
    materialQty,
    blockTotals,
  };
}