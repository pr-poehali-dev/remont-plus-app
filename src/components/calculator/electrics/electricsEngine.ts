import { REGIONS, ROOM_TYPES, CABLING_TYPES } from "./ElectricsTypes";
import type { ElectricsConfig } from "./ElectricsTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * ЕДИНЫЙ ДВИЖОК РАСЧЁТА ЭЛЕКТРИКИ (расценки 2026 г.)
 *
 * Принцип: смета строится ТОЛЬКО из детальных позиций (норма расхода × цена).
 * Итог = строгая сумма всех позиций. Никаких «процентных» приближений.
 *
 * Каждая позиция помечена блоком (block) — чтобы экранный калькулятор мог
 * показать привычную разбивку по этапам, а печать — полный построчный список.
 *
 * Региональный коэффициент rc применяется к РАБОТАМ.
 * Коэффициент типа помещения tc применяется к РАБОТАМ (сложность монтажа).
 * Материалы — по прайсу поставщика (без rc и tc).
 */

export type ElectricsBlock =
  | "outlets"
  | "switches"
  | "lighting"
  | "cabling"
  | "panel"
  | "grounding"
  | "testing";

export interface ElectricsLine extends MaterialItem {
  block: ElectricsBlock;
}

export interface ElectricsEstimate {
  lines: ElectricsLine[];
  works: ElectricsLine[];
  materials: ElectricsLine[];
  worksTotal: number;
  materialsTotal: number;
  subtotal: number;     // works + materials (без наценки)
  markupAmount: number;
  total: number;        // subtotal + markup
  regionCoeff: number;
  blockTotals: Record<ElectricsBlock, number>;
}

// ─── РАСЦЕНКИ РАБОТ 2026, ₽ (база, до rc и tc) ───────────────────────────────
const WORK_RATES = {
  outletInstall: 480,        // установка розетки (любой), ₽/шт
  switchInstall: 460,        // установка выключателя/диммера, ₽/шт
  lightGroupInstall: 850,    // монтаж люстры/группы освещения, ₽/точка
  spotInstall: 320,          // монтаж точечного светильника, ₽/шт
  cableLay: {                // прокладка кабеля, ₽/м.п. (зависит от способа)
    open: 110,               // открытая (кабель-канал)
    corrugated: 160,         // в гофре поверх стен
    hidden: 290,             // скрытая (штробление + заделка)
  } as Record<string, number>,
  panelAssembly: 4500,       // сборка и навеска щитка, ₽/компл
  breakerConnect: 350,       // подключение автомата/УЗО в щитке, ₽/шт
  grounding: 7100,           // устройство контура заземления, ₽/компл
  testing: 4200,             // прозвонка, замеры, протокол, ₽/компл
};

// ─── ЦЕНЫ МАТЕРИАЛОВ 2026, ₽ ─────────────────────────────────────────────────
const MAT_PRICES = {
  outletSingle: 420,         // розетка одинарная скрытой установки, ₽/шт
  outletDouble: 620,         // розетка двойная, ₽/шт
  outletGrounded: 560,       // розетка с заземлением IP44, ₽/шт
  switchSingle: 380,         // выключатель одноклавишный, ₽/шт
  switchDouble: 540,         // выключатель двухклавишный, ₽/шт
  dimmer: 1450,              // диммер 300 Вт, ₽/шт
  socketBox: 48,             // подрозетник ∅68 мм, ₽/шт
  lightGroupBox: 95,         // потолочная коробка/крюк для люстры, ₽/шт
  spotFixture: 240,          // корпус точечного светильника GU10, ₽/шт
  cablePower: 95,            // кабель ВВГнг-LS 3×2,5, ₽/м.п.
  cableLight: 62,            // кабель ВВГнг-LS 3×1,5, ₽/м.п.
  corrugation: 28,           // гофротруба ПВХ ∅20 мм, ₽/м.п.
  cableChannel: 58,          // кабель-канал 25×16 мм, ₽/м.п.
  gypsum: 22,                // алебастр/ротбанд для заделки штроб, ₽/кг
  junctionBox: 65,           // распаечная коробка, ₽/шт
  wago: 11,                  // клеммники Wago, стяжки, изолента, ₽/м кабеля
  panelEnclosure: 3800,      // бокс щитка на DIN-рейку, ₽/шт
  breaker: 480,              // автоматический выключатель 16/25 А, ₽/шт
  rcd: 1450,                 // УЗО/дифавтомат 30 мА, ₽/шт
  groundKit: 3600,           // комплект заземления (штыри, полоса, зажимы), ₽/компл
};

// доля кабеля под розетки/силовые линии (остальное — освещение)
const POWER_CABLE_SHARE = 0.65;

export function calcElectrics(
  cfg: Omit<ElectricsConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0,
): ElectricsEstimate {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;
  const tc = ROOM_TYPES.find((r) => r.value === cfg.roomType)?.priceCoeff ?? 1.0;
  const cablingType = CABLING_TYPES.find((c) => c.id === cfg.cablingType);

  const lines: ElectricsLine[] = [];
  const round = (n: number) => Math.round(n);

  // work: цена за единицу с региональным коэффициентом и коэффициентом сложности
  const work = (
    block: ElectricsBlock,
    name: string,
    unit: string,
    qty: number,
    ratePerUnit: number,
    spec?: string,
  ) => {
    if (qty <= 0 || ratePerUnit <= 0) return;
    const price = round(ratePerUnit * tc * rc);
    lines.push({ block, name, spec, unit, qty: Math.round(qty * 10) / 10, pricePerUnit: price, total: round(price * qty), isWork: true });
  };

  // material: цена по прайсу поставщика (без rc/tc)
  const material = (
    block: ElectricsBlock,
    name: string,
    unit: string,
    qty: number,
    pricePerUnit: number,
    spec?: string,
    isConsumable?: boolean,
  ) => {
    if (qty <= 0 || pricePerUnit <= 0) return;
    lines.push({ block, name, spec, unit, qty: Math.round(qty * 100) / 100, pricePerUnit: round(pricePerUnit), total: round(pricePerUnit * qty), isConsumable, isWork: false });
  };

  const totalOutlets = cfg.outletsCount + cfg.doubleOutletsCount + cfg.groundedOutletsCount;
  const totalSwitches = cfg.switchesCount + cfg.doubleSwitchesCount + cfg.dimmersCount;

  // ── РОЗЕТКИ ────────────────────────────────────────────────
  if (totalOutlets > 0) {
    work("outlets", "Установка розеток", "шт.", totalOutlets, WORK_RATES.outletInstall, "монтаж, подключение, расключение");
    material("outlets", "Розетка одинарная", "шт.", cfg.outletsCount, MAT_PRICES.outletSingle, "IP20, скрытый монтаж");
    material("outlets", "Розетка двойная", "шт.", cfg.doubleOutletsCount, MAT_PRICES.outletDouble, "IP20, евростандарт");
    material("outlets", "Розетка с заземлением", "шт.", cfg.groundedOutletsCount, MAT_PRICES.outletGrounded, "IP44, для кухни/ванной");
    material("outlets", "Подрозетник ∅68 мм", "шт.", totalOutlets, MAT_PRICES.socketBox, "глубина 45 мм", true);
  }

  // ── ВЫКЛЮЧАТЕЛИ ────────────────────────────────────────────
  if (totalSwitches > 0) {
    work("switches", "Установка выключателей и диммеров", "шт.", totalSwitches, WORK_RATES.switchInstall, "монтаж, подключение");
    material("switches", "Выключатель одноклавишный", "шт.", cfg.switchesCount, MAT_PRICES.switchSingle, "скрытый монтаж");
    material("switches", "Выключатель двухклавишный", "шт.", cfg.doubleSwitchesCount, MAT_PRICES.switchDouble, "скрытый монтаж");
    material("switches", "Диммер", "шт.", cfg.dimmersCount, MAT_PRICES.dimmer, "регулятор яркости, 300 Вт");
    material("switches", "Подрозетник ∅68 мм", "шт.", totalSwitches, MAT_PRICES.socketBox, "глубина 45 мм", true);
  }

  // ── ОСВЕЩЕНИЕ ──────────────────────────────────────────────
  if (cfg.lightGroupsCount > 0) {
    work("lighting", "Монтаж групп освещения (люстры/светильники)", "точка", cfg.lightGroupsCount, WORK_RATES.lightGroupInstall, "вывод, подключение");
    material("lighting", "Потолочная коробка / крюк для люстры", "шт.", cfg.lightGroupsCount, MAT_PRICES.lightGroupBox, undefined, true);
  }
  if (cfg.spotLightsCount > 0) {
    work("lighting", "Монтаж точечных светильников", "шт.", cfg.spotLightsCount, WORK_RATES.spotInstall, "установка, подключение");
    material("lighting", "Корпус точечного светильника", "шт.", cfg.spotLightsCount, MAT_PRICES.spotFixture, "GU10, врезной");
  }

  // ── ПРОКЛАДКА КАБЕЛЯ ───────────────────────────────────────
  if (cfg.cableRunM > 0) {
    const layRate = WORK_RATES.cableLay[cfg.cablingType] ?? WORK_RATES.cableLay.hidden;
    work("cabling", `Прокладка кабеля (${cablingType?.label ?? ""})`, "м.п.", cfg.cableRunM, layRate, cablingType?.description);

    const powerM = Math.round(cfg.cableRunM * POWER_CABLE_SHARE);
    const lightM = cfg.cableRunM - powerM;
    material("cabling", "Кабель ВВГнг-LS 3×2,5", "м.п.", powerM, MAT_PRICES.cablePower, "силовой, для розеток");
    material("cabling", "Кабель ВВГнг-LS 3×1,5", "м.п.", lightM, MAT_PRICES.cableLight, "для освещения");

    // способозависимые расходники
    if (cfg.cablingType === "hidden") {
      material("cabling", "Гофротруба ПВХ ∅20 мм", "м.п.", Math.ceil(cfg.cableRunM * 1.1), MAT_PRICES.corrugation, "для скрытой разводки", true);
      material("cabling", "Алебастр / ротбанд для заделки штроб", "кг", Math.ceil(cfg.cableRunM * 0.3), MAT_PRICES.gypsum, undefined, true);
    } else if (cfg.cablingType === "corrugated") {
      material("cabling", "Гофротруба ПВХ ∅20 мм + крепёж", "м.п.", Math.ceil(cfg.cableRunM * 1.1), MAT_PRICES.corrugation, undefined, true);
    } else {
      material("cabling", "Кабель-канал 25×16 мм", "м.п.", Math.ceil(cfg.cableRunM), MAT_PRICES.cableChannel, "пластиковый, белый", true);
    }

    // общие расходники разводки
    material("cabling", "Распаечная коробка", "шт.", Math.max(1, Math.ceil(cfg.cableRunM / 12)), MAT_PRICES.junctionBox, "для расключения", true);
    material("cabling", "Клеммники Wago, стяжки, изолента", "м.п.", cfg.cableRunM, MAT_PRICES.wago, "монтажные расходники", true);
  }

  // ── ЩИТОК И АВТОМАТЫ ───────────────────────────────────────
  if (cfg.panelIncluded) {
    work("panel", "Сборка и навеска электрощитка", "компл.", 1, WORK_RATES.panelAssembly, "коммутация, маркировка");
    work("panel", "Подключение модулей в щитке", "шт.", cfg.breakersCount, WORK_RATES.breakerConnect, "автоматы / УЗО");
    material("panel", "Бокс щитка на DIN-рейку", "шт.", 1, MAT_PRICES.panelEnclosure, `на ${cfg.breakersCount}+ мест`);
    // часть модулей — УЗО/дифавтоматы (~30%), остальное — обычные автоматы
    const rcdCount = Math.max(1, Math.round(cfg.breakersCount * 0.3));
    const breakerCount = Math.max(0, cfg.breakersCount - rcdCount);
    material("panel", "Автоматический выключатель", "шт.", breakerCount, MAT_PRICES.breaker, "16/25 А, однополюсный");
    material("panel", "УЗО / дифавтомат", "шт.", rcdCount, MAT_PRICES.rcd, "30 мА, защита человека");
  }

  // ── ЗАЗЕМЛЕНИЕ ─────────────────────────────────────────────
  if (cfg.groundingIncluded) {
    work("grounding", "Устройство контура заземления", "компл.", 1, WORK_RATES.grounding, "монтаж, подключение к щитку");
    material("grounding", "Комплект заземления", "компл.", 1, MAT_PRICES.groundKit, "штыри, полоса, зажимы");
  }

  // ── ТЕСТИРОВАНИЕ ───────────────────────────────────────────
  if (cfg.testingIncluded) {
    work("testing", "Прозвонка, замеры и тестирование", "компл.", 1, WORK_RATES.testing, "протокол испытаний");
  }

  // ── ИТОГИ (строгая сумма позиций) ──────────────────────────
  const works = lines.filter((l) => l.isWork);
  const materials = lines.filter((l) => !l.isWork);
  const worksTotal = works.reduce((s, l) => s + l.total, 0);
  const materialsTotal = materials.reduce((s, l) => s + l.total, 0);
  const subtotal = worksTotal + materialsTotal;
  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  const blocks: ElectricsBlock[] = [
    "outlets", "switches", "lighting", "cabling", "panel", "grounding", "testing",
  ];
  const blockTotals = blocks.reduce((acc, b) => {
    acc[b] = lines.filter((l) => l.block === b).reduce((s, l) => s + l.total, 0);
    return acc;
  }, {} as Record<ElectricsBlock, number>);

  return {
    lines, works, materials,
    worksTotal, materialsTotal, subtotal, markupAmount, total,
    regionCoeff: rc, blockTotals,
  };
}
