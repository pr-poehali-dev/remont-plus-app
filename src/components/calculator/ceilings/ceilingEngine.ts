import {
  CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS, CEILING_COLORS,
  LIGHTING_OPTIONS, PROFILE_OPTIONS, CEILING_REGIONS,
} from "./CeilingTypes";
import type { CeilingConfig } from "./CeilingTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА НАТЯЖНЫХ ПОТОЛКОВ (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «укрупнённых» приближений.
 *
 * Каждая позиция помечена блоком (block) — чтобы экранный калькулятор мог
 * показать привычную разбивку по этапам, а печать — полный построчный список.
 *
 * Региональный коэффициент rc применяется к РАБОТАМ.
 * Материалы (полотно, профиль, светильники) — по прайсу поставщика без rc.
 */

export type CeilingBlock =
  | "canvas"      // полотно / плёнка
  | "profile"     // багет / профиль + крепёж
  | "install"     // монтаж полотна
  | "levels"      // дополнительные уровни (каркас ГКЛ)
  | "lighting"    // освещение (работа + светильники)
  | "extras";     // обводы труб, углы, расходники

export interface CeilingLine extends MaterialItem {
  block: CeilingBlock;
}

export interface CeilingEstimate {
  lines: CeilingLine[];
  works: CeilingLine[];
  materials: CeilingLine[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;     // works + materials (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  blockTotals: Record<CeilingBlock, number>;
}

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до регионального коэффициента) ─────────────
const WORK_RATES = {
  installM2: 480,            // монтаж полотна, ₽/м² (= INSTALLATION_PRICE_PER_M2)
  profileMount: 95,          // монтаж/крепление профиля (багета), ₽/м.п.
  levelFrame: 1450,          // устройство доп. уровня (каркас ГКЛ+гнутьё), ₽/м.п. короба
  spotInstall: 320,          // врезка точечного светильника, ₽/шт
  ledRun: 180,               // монтаж LED/RGB ленты, ₽/м.п.
  backlightM2: 650,          // монтаж фоновой подсветки, ₽/м²
  pipeBypass: 850,           // обвод трубы / стойки, ₽/шт
  cornerWelding: 0,          // сварка углов входит в монтаж
};

// ─── ЦЕНЫ МАТЕРИАЛОВ 2026, ₽ ─────────────────────────────────────────────────
const MAT_PRICES = {
  canvasBaseM2: 1850,        // полотно ПВХ матовое стандарт, ₽/м² (= BASE_PRICE_PER_M2)
  profilePerM: 110,          // алюминиевый/ПВХ багет, ₽/м.п.
  garpunPerM: 35,            // гарпун (привар к полотну), ₽/м.п.
  dowelPerM: 18,             // дюбель-гвозди + саморезы, ₽/м.п. профиля
  gklSheetM2: 320,           // лист ГКЛ влагостойкий, ₽/м² короба
  profileFrameM: 145,        // профиль CD/UD для каркаса, ₽/м.п. короба
  spotFixture: 240,          // корпус точечного светильника GU10, ₽/шт
  spotRing: 65,              // термокольцо + платформа, ₽/шт
  ledTape: 420,              // светодиодная лента, ₽/м.п.
  rgbTape: 680,              // RGB-лента, ₽/м.п.
  rgbController: 2200,       // RGB-контроллер + блок питания, ₽/шт
  ledProfile: 190,           // профиль/закладная под ленту, ₽/м.п.
  backlightModuleM2: 880,    // комплект фоновой подсветки, ₽/м²
  bypassRing: 95,            // обводное кольцо/манжета трубы, ₽/шт
  cornerInsert: 45,          // вставка/заглушка декоративная, ₽/м.п.
};

/**
 * Доплата за цвет/бренд/тип учитывается как множитель/надбавка к ЦЕНЕ ПОЛОТНА
 * (материала), а не размазывается по всей смете — так позиция «полотно»
 * остаётся честной (м² × фактическая цена за м²).
 */
export function calcCeiling(
  cfg: Omit<CeilingConfig, "id" | "totalPrice">,
  regionId?: string,
  markupPct = 0,
): CeilingEstimate {
  const rid = regionId ?? cfg.regionId ?? "moscow";
  const region = CEILING_REGIONS.find((r) => r.id === rid) ?? CEILING_REGIONS[3];
  const rc = region.coeff ?? 1.0;

  const type = CEILING_TYPES.find((t) => t.value === cfg.ceilingType);
  const level = CEILING_LEVELS.find((l) => l.value === cfg.level);
  const brand = CEILING_BRANDS.find((b) => b.id === cfg.brandId);
  const color = CEILING_COLORS.find((c) => c.id === cfg.colorId);
  const lighting = LIGHTING_OPTIONS.find((l) => l.id === cfg.lightingId);
  const profile = PROFILE_OPTIONS.find((p) => p.id === cfg.profileId);

  const area = cfg.area || 0;
  const perimeter = cfg.perimeter || 0;

  const typeCoeff = type?.priceCoeff ?? 1.0;
  const brandCoeff = brand?.priceCoeff ?? 1.0;
  const profileCoeff = profile?.priceCoeff ?? 1.0;
  const colorAdd = color?.priceAdd ?? 0;

  const lines: CeilingLine[] = [];
  const round = (n: number) => Math.round(n);

  // work: цена за единицу с региональным коэффициентом
  const work = (block: CeilingBlock, name: string, unit: string, qty: number, ratePerUnit: number, spec?: string) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * rc);
    const q = Math.round(qty * 10) / 10;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // material: цена по прайсу поставщика (без rc)
  const material = (block: CeilingBlock, name: string, unit: string, qty: number, pricePerUnit: number, spec?: string, isConsumable?: boolean) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    const q = Math.round(qty * 100) / 100;
    const price = round(pricePerUnit);
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };

  // ── ПОЛОТНО / ПЛЁНКА (материал) ────────────────────────────
  if (area > 0) {
    // фактическая цена за м² полотна = база × тип × бренд + доплата за цвет
    const canvasPriceM2 = round(MAT_PRICES.canvasBaseM2 * typeCoeff * brandCoeff + colorAdd);
    const canvasSpec = [type?.label, brand?.name, color && color.id !== "white" ? color.label : null]
      .filter(Boolean).join(", ");
    material("canvas", `Полотно ${type?.label?.toLowerCase() ?? ""} ${brand?.name ?? ""}`.trim(), "м²", area, canvasPriceM2, canvasSpec || undefined);
    // гарпун/окантовка по периметру (привар к полотну)
    material("canvas", "Гарпун / окантовка полотна", "м.п.", perimeter, MAT_PRICES.garpunPerM, "привар по контуру", true);
  }

  // ── ПРОФИЛЬ / БАГЕТ (материал + монтаж) ────────────────────
  if (perimeter > 0) {
    work("profile", "Монтаж крепёжного профиля (багета)", "м.п.", perimeter, round(WORK_RATES.profileMount * profileCoeff), profile?.label);
    material("profile", `Багет ${profile?.label?.toLowerCase() ?? ""}`.trim(), "м.п.", perimeter, round(MAT_PRICES.profilePerM * profileCoeff), profile?.description);
    material("profile", "Дюбель-гвозди, саморезы", "м.п.", perimeter, MAT_PRICES.dowelPerM, "крепёж профиля", true);
  }

  // ── МОНТАЖ ПОЛОТНА (работа) ────────────────────────────────
  if (cfg.installationIncluded && area > 0) {
    work("install", "Натяжка и монтаж полотна", "м²", area, round(WORK_RATES.installM2 * typeCoeff), `${type?.label ?? ""}, газовый нагрев`);
  }

  // ── ДОПОЛНИТЕЛЬНЫЕ УРОВНИ (каркас ГКЛ) ─────────────────────
  // длина короба ~ периметр на каждый дополнительный уровень
  const extraLevels = level?.value === "double" ? 1 : level?.value === "triple" ? 2 : 0;
  if (extraLevels > 0 && perimeter > 0) {
    const boxRunM = perimeter * extraLevels;
    const boxAreaM2 = boxRunM * 0.4; // короб шириной ~0,4 м
    work("levels", `Устройство ${level?.label?.toLowerCase()} короба (каркас ГКЛ)`, "м.п.", boxRunM, WORK_RATES.levelFrame, "каркас, гнутьё, шпаклёвка");
    material("levels", "Профиль каркаса CD/UD", "м.п.", round(boxRunM * 2.5), MAT_PRICES.profileFrameM, "подвесы, соединители", true);
    material("levels", "Лист ГКЛ влагостойкий", "м²", round(boxAreaM2 * 1.15), MAT_PRICES.gklSheetM2, "обшивка короба");
  }

  // ── ОСВЕЩЕНИЕ (работа + светильники) ───────────────────────
  if (lighting && lighting.id !== "none" && cfg.lightingCount > 0) {
    const cnt = cfg.lightingCount;
    if (lighting.id === "spot") {
      work("lighting", "Врезка и подключение точечных светильников", "шт.", cnt, WORK_RATES.spotInstall, "отверстие, термокольцо");
      material("lighting", "Точечный светильник", "шт.", cnt, MAT_PRICES.spotFixture, "GU10, врезной");
      material("lighting", "Термокольцо + платформа", "шт.", cnt, MAT_PRICES.spotRing, "закладная под светильник", true);
    } else if (lighting.id === "led_perim") {
      work("lighting", "Монтаж LED-ленты по периметру", "м.п.", cnt, WORK_RATES.ledRun, "укладка, пайка, подключение");
      material("lighting", "Светодиодная лента", "м.п.", cnt, MAT_PRICES.ledTape, "монохромная, IP20");
      material("lighting", "Профиль/закладная под ленту", "м.п.", cnt, MAT_PRICES.ledProfile, undefined, true);
    } else if (lighting.id === "rgb_perim") {
      work("lighting", "Монтаж RGB-ленты по периметру", "м.п.", cnt, WORK_RATES.ledRun, "укладка, пайка, подключение");
      material("lighting", "RGB светодиодная лента", "м.п.", cnt, MAT_PRICES.rgbTape, "многоцветная");
      material("lighting", "RGB-контроллер + блок питания", "шт.", 1, MAT_PRICES.rgbController, "с пультом");
      material("lighting", "Профиль/закладная под ленту", "м.п.", cnt, MAT_PRICES.ledProfile, undefined, true);
    } else if (lighting.id === "backlight") {
      work("lighting", "Монтаж фоновой подсветки потолка", "м²", cnt, WORK_RATES.backlightM2, "равномерная засветка");
      material("lighting", "Комплект фоновой подсветки", "м²", cnt, MAT_PRICES.backlightModuleM2, "лента + рассеиватель");
    }
  }

  // ── ОБВОДЫ ТРУБ / УГЛЫ (расходники) ────────────────────────
  // оценка количества обводов труб по площади (стояки/радиаторы)
  if (area > 0) {
    const bypassCount = area >= 12 ? 2 : 1;
    work("extras", "Обвод труб / стоек отопления", "шт.", bypassCount, WORK_RATES.pipeBypass, "герметичный обвод");
    material("extras", "Обводное кольцо / манжета трубы", "шт.", bypassCount, MAT_PRICES.bypassRing, undefined, true);
  }
  if (perimeter > 0) {
    material("extras", "Декоративная вставка/заглушка", "м.п.", perimeter, MAT_PRICES.cornerInsert, "маскировочная лента", true);
  }

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);
  const subtotal = worksTotal + materialsTotal;
  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blocks: CeilingBlock[] = ["canvas", "profile", "install", "levels", "lighting", "extras"];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<CeilingBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, subtotal, markupAmount, total,
    regionCoeff: rc, blockTotals,
  };
}