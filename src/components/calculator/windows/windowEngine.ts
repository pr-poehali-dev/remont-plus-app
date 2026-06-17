import {
  PROFILE_SYSTEMS, GLASS_UNITS, GLASS_COATINGS, LAMINATION_TYPES,
  HARDWARE_OPTIONS, WINDOW_SILLS, SLOPES, OPENING_TYPES, WINDOW_REGIONS,
  CONSTRUCTION_TYPES, BASE_PRICE_PER_M2,
} from "./WindowTypes";
import type { WindowConfig } from "./WindowTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { getDefaultOverrides } from "./windowUtils";
import type { PriceOverrides } from "./windowUtils";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА ОКОН (расценки 2026 г.)
 *
 * Принцип: смета строится из детальных позиций (норма расхода × цена) с
 * разделением на РАБОТЫ и МАТЕРИАЛЫ. Итог = строгая сумма позиций.
 *
 * СОВМЕСТИМОСТЬ: subtotal (и total без наценки) вычисляются ПО ТОЙ ЖЕ формуле,
 * что и прежний calcPrice — байт-в-байт. Поэтому экранный калькулятор и
 * механизм PriceOverrides не ломаются. Детальные позиции (lines) — это честное
 * разложение той же суммы: их неокруглённая сумма по конструкции равна
 * себестоимости за единицу, а итог по позиции = компонент × регион × кол-во.
 *
 * PriceOverrides (пользовательские цены) влияют на позиции ровно так же,
 * как раньше на calcPrice — через те же поля overrides.
 */

export type WindowBlock =
  | "profile"      // профиль / рама / каркас ПВХ-алюм
  | "glass"        // стеклопакет + покрытие
  | "lamination"   // ламинация профиля
  | "hardware"     // фурнитура
  | "transom"      // фрамуга (надбавка)
  | "sill"         // подоконник
  | "slope"        // откосы
  | "fabrication"  // изготовление / сборка конструкции (работа)
  | "install";     // монтаж / демонтаж / запенивание (работа)

export interface WindowLine extends MaterialItem {
  block: WindowBlock;
}

export interface WindowEstimate {
  lines: WindowLine[];
  works: WindowLine[];
  materials: WindowLine[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;     // = прежний calcPrice (без наценки), строго та же формула
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  blockTotals: Record<WindowBlock, number>;
}

/**
 * FABRICATION_SHARE — доля «работы изготовления конструкции» в стоимости
 * профильной части окна.
 *
 * Стандартная практика оконного производства: цена изделия по профилю
 * складывается из материала профиля (~70%) и работ по изготовлению/сборке
 * рамы и створок — резка, сварка/крепёж углов, установка фурнитуры и
 * стеклопакета на линии (~30%). Поэтому профильная часть (framePortion)
 * делится 70/30 на позиции «Профиль» (материал) и «Изготовление и сборка
 * конструкции» (работа).
 *
 * ВАЖНО: это разделение ТОЛЬКО для прозрачного показа позиций работа/материал.
 * На subtotal оно не влияет — subtotal считается из frameGlassBase напрямую
 * (см. ниже), байт-в-байт с прежней формулой calcPrice.
 */
const FABRICATION_SHARE = 0.30;

export function calcWindow(
  cfg: Omit<WindowConfig, "id" | "totalPrice">,
  overrides?: PriceOverrides,
  regionId?: string,
  markupPct = 0,
): WindowEstimate {
  const o = overrides ?? getDefaultOverrides();

  const isStandaloneTransom = cfg.constructionType === "transom";
  const isEntranceGroup = cfg.constructionType === "entrance_group";
  const isShtulpDoor = cfg.constructionType === "shtulp_door";
  const totalH = cfg.hasTransom && !isStandaloneTransom
    ? cfg.height + cfg.transomHeight
    : cfg.height;
  const area = (cfg.width / 1000) * (totalH / 1000);

  const profile = PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId);
  const glass = GLASS_UNITS.find(g => g.id === cfg.glassUnitId);
  const lam = LAMINATION_TYPES.find(l => l.id === cfg.laminationId);
  const hw = HARDWARE_OPTIONS.find(h => h.id === cfg.hardwareId);
  const sill = WINDOW_SILLS.find(s => s.id === cfg.windowSillId);
  const slope = SLOPES.find(s => s.id === cfg.slopeId);

  const rid = regionId ?? cfg.regionId ?? "moscow";
  const region = WINDOW_REGIONS.find(r => r.id === rid);
  const rc = region?.priceCoeff ?? 1.0;
  const qty = cfg.quantity || 1;
  const ct = CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType);

  const empty = (): WindowEstimate => ({
    lines: [], works: [], materials: [],
    worksTotal: 0, materialsTotal: 0, subtotal: 0, markupAmount: 0, total: 0,
    regionCoeff: rc,
    blockTotals: { profile: 0, glass: 0, lamination: 0, hardware: 0, transom: 0, sill: 0, slope: 0, fabrication: 0, install: 0 },
  });

  if (!profile || !glass) return empty();

  // ─── компоненты «себестоимости за единицу» (до региона и количества) ───────
  // повторяем прежнюю формулу calcPrice ШАГ В ШАГ
  const baseMat = o.basePricePerM2[profile.material] ?? BASE_PRICE_PER_M2[profile.material];
  const profCoeff = o.profileCoeffs[profile.id] ?? profile.priceCoeff;
  const glassCoeff = o.glassCoeffs[glass.id] ?? glass.priceCoeff;

  const avgOpenCoeff = cfg.openingTypes.length > 0
    ? cfg.openingTypes.reduce((s, ov) => {
        const opt = OPENING_TYPES.find(x => x.value === ov);
        return s + (opt?.priceCoeff ?? 1);
      }, 0) / cfg.openingTypes.length
    : (OPENING_TYPES.find(ot => ot.value === (cfg.openingTypes[0] ?? "tilt_swing"))?.priceCoeff ?? 1);

  // стоимость «коробка профиля + стекло» (стекло заложено через glassCoeff множителем)
  // разделяем её на профиль и стеклопакет пропорционально вкладу glassCoeff
  const frameGlassBase = baseMat * profCoeff * glassCoeff * area * avgOpenCoeff;
  // вклад стеклопакета ≈ (glassCoeff-1)/glassCoeff от суммы, остальное — профиль/створки
  const glassPortion = glassCoeff > 0 ? frameGlassBase * ((glassCoeff - 1) / glassCoeff) : 0;
  const framePortion = frameGlassBase - glassPortion;

  const coatingAdd = o.coatingPrices[cfg.glassCoatingId] ?? GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId)?.priceAdd ?? 0;
  const coatingTotal = coatingAdd * area;

  const perim = 2 * ((cfg.width + totalH) / 1000);
  const lamAdd = o.laminationPrices[cfg.laminationId] ?? lam?.priceAdd ?? 0;
  const lamSides = cfg.laminationBothSides && lam && lam.id !== "none" ? 2 : 1;
  const lamTotal = lamAdd * perim * lamSides;

  const hwPrice = o.hardwarePrices[cfg.hardwareId] ?? hw?.pricePerSash ?? 0;
  const openSashes = cfg.openingTypes.filter(x => x !== "fixed").length;
  let hwTotal = hwPrice * openSashes;

  let transomTotal = 0;
  if (cfg.hasTransom && !isStandaloneTransom) {
    transomTotal += o.transomAddon;
    if (cfg.transomOpeningType !== "fixed") {
      hwTotal += hwPrice; // фурнитура открывающейся фрамуги
    }
  }

  // «конструктивная» часть до надбавок sill/slope/install.
  // ВАЖНО: считаем из frameGlassBase напрямую (а не из суммы долей), чтобы
  // subtotal был байт-в-байт равен прежнему calcPrice без fp-дрейфа.
  let construction = frameGlassBase + coatingTotal + lamTotal + hwTotal + transomTotal;

  // множители дверных конструкций (как в прежней формуле)
  let doorAddon = 0;
  if (isShtulpDoor) {
    const before = construction;
    construction = before * 2.06 + 2336;
    doorAddon = construction - before;
  } else if (isEntranceGroup) {
    const before = construction;
    construction = before * 2.0 + 2336;
    doorAddon = construction - before;
  }

  const sillPrice = o.sillPrices[cfg.windowSillId] ?? sill?.pricePerMeter ?? 0;
  const sillLen = cfg.windowSillWidth > 0 ? cfg.width / 1000 : 0;
  const sillTotal = sillPrice * sillLen;

  const slopePrice = o.slopePrices[cfg.slopeId] ?? slope?.pricePerMeter ?? 0;
  const slopeTotal = slopePrice * cfg.slopePerimeter;

  const installTotal = cfg.installationIncluded ? o.installationPricePerM2 * area : 0;

  // ─── СОВМЕСТИМОСТЬ: subtotal = прежний calcPrice (та же последовательность) ──
  const perUnit = construction + sillTotal + slopeTotal + installTotal;
  const subtotal = Math.round(perUnit * rc * qty);

  // ─── РАЗЛОЖЕНИЕ НА ПОЗИЦИИ (РАБОТЫ / МАТЕРИАЛЫ) ─────────────────────────────
  // каждая позиция: total = компонент × регион × кол-во (округление для показа)
  const lines: WindowLine[] = [];
  const round = (n: number) => Math.round(n);
  const px = (perUnitComponent: number) => round(perUnitComponent * rc * qty); // сумма позиции

  const pushMat = (block: WindowBlock, name: string, unit: string, unitQty: number, perUnitComponent: number, spec?: string, isConsumable?: boolean) => {
    if (perUnitComponent <= 0 || unitQty <= 0) return;
    const q = Math.round(unitQty * 100) / 100;
    const price = q > 0 ? round(px(perUnitComponent) / q) : 0;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isConsumable, isWork: false });
  };
  const pushWork = (block: WindowBlock, name: string, unit: string, unitQty: number, perUnitComponent: number, spec?: string) => {
    if (perUnitComponent <= 0 || unitQty <= 0) return;
    const q = Math.round(unitQty * 100) / 100;
    const price = q > 0 ? round(px(perUnitComponent) / q) : 0;
    lines.push({ block, name, spec, unit, qty: q, pricePerUnit: price, total: round(price * q), isWork: true });
  };

  // профиль/рама: материал (часть) + изготовление (часть)
  const frameMat = framePortion * (1 - FABRICATION_SHARE);
  const frameWork = framePortion * FABRICATION_SHARE;
  const profSpec = `${profile.brand} ${profile.series}, ${profile.depth} мм${profile.chambers > 1 ? `, ${profile.chambers} кам.` : ""}`;
  pushMat("profile", `Профиль ${ct?.label?.toLowerCase() ?? "конструкции"}`, "шт.", qty, frameMat, profSpec);
  pushWork("fabrication", "Изготовление и сборка конструкции", "шт.", qty, frameWork, `${ct?.label ?? ""}, ${area.toFixed(2)} м²`);

  // стеклопакет + покрытие — материал за м²
  if (glassPortion > 0) pushMat("glass", `Стеклопакет ${glass.name}`, "м²", area * qty, glassPortion, glass.description);
  if (coatingTotal > 0) {
    const co = GLASS_COATINGS.find(c => c.id === cfg.glassCoatingId);
    pushMat("glass", `Покрытие стекла: ${co?.name ?? ""}`.trim(), "м²", area * qty, coatingTotal, co?.description);
  }

  // ламинация профиля — материал за пм
  if (lamTotal > 0) {
    pushMat("lamination", `Ламинация: ${lam?.name ?? ""}`.trim(), "м.п.", perim * lamSides * qty, lamTotal, lamSides === 2 ? "с двух сторон" : "односторонняя");
  }

  // фурнитура — материал за створку (+открывающаяся фрамуга)
  const hwUnits = openSashes + (cfg.hasTransom && !isStandaloneTransom && cfg.transomOpeningType !== "fixed" ? 1 : 0);
  if (hwTotal > 0 && hwUnits > 0) {
    pushMat("hardware", `Фурнитура ${hw?.brand ?? ""} ${hw?.series ?? ""}`.trim(), "компл.", hwUnits * qty, hwTotal, "на открывающуюся створку");
  }

  // фрамуга — надбавка (материал профиля фрамуги)
  if (transomTotal > 0) {
    pushMat("transom", "Фрамуга (верхняя глухая/откидная часть)", "шт.", qty, transomTotal, `высота ${cfg.transomHeight} мм`);
  }

  // надбавка за дверную конструкцию (штульп/входная группа) — материал+работа
  if (doorAddon > 0) {
    pushMat("profile", "Усиление и доп. комплектация двери", "шт.", qty, doorAddon * (1 - FABRICATION_SHARE), isShtulpDoor ? "штульповая дверь" : "входная группа");
    pushWork("fabrication", "Изготовление дверной конструкции", "шт.", qty, doorAddon * FABRICATION_SHARE);
  }

  // подоконник — материал за пм
  if (sillTotal > 0) {
    pushMat("sill", `Подоконник ${sill?.brand ?? ""} ${sill?.material ?? ""}`.trim(), "м.п.", sillLen * qty, sillTotal, `глубина ${cfg.windowSillWidth} мм`);
  }

  // откосы — материал за пм
  if (slopeTotal > 0) {
    pushMat("slope", `Откосы: ${slope?.name ?? ""}`.trim(), "м.п.", cfg.slopePerimeter * qty, slopeTotal);
  }

  // монтаж — работа за м² (разворачиваем: установка + демонтаж + запенивание)
  if (installTotal > 0) {
    pushWork("install", "Монтаж конструкции (установка, крепёж, запенивание)", "м²", area * qty, installTotal, `${area.toFixed(2)} м² × ${qty} шт.`);
  }

  // ─── ИТОГИ ──────────────────────────────────────────────────────────────────
  const works = lines.filter(l => l.isWork);
  const materials = lines.filter(l => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);

  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blocks: WindowBlock[] = ["profile", "glass", "lamination", "hardware", "transom", "sill", "slope", "fabrication", "install"];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter(l => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<WindowBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, subtotal, markupAmount, total,
    regionCoeff: rc, blockTotals,
  };
}