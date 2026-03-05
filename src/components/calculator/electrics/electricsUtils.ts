import { REGIONS, ROOM_TYPES, CABLING_TYPES } from "./ElectricsTypes";
import type { ElectricsConfig } from "./ElectricsTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

export function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export interface ElectricsPriceBreakdown {
  outletsCost: number;
  switchesCost: number;
  lightingCost: number;
  cablingCost: number;
  panelCost: number;
  groundingCost: number;
  testingCost: number;
  materialsCost: number;
  worksCost: number;
  subtotal: number;
  regionCoeff: number;
  markupAmount: number;
  total: number;
}

export function calcElectricsPrice(
  cfg: Omit<ElectricsConfig, "id" | "totalPrice">,
  regionId = "moscow",
  markupPct = 0
): ElectricsPriceBreakdown {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const roomType = ROOM_TYPES.find(r => r.id === cfg.roomType);
  const cablingType = CABLING_TYPES.find(c => c.id === cfg.cablingType);

  const rc = region.coeff;
  const typeCoeff = roomType?.priceCoeff ?? 1.0;

  // Розетки и выключатели
  const outletBase =
    cfg.outletsCount * 950 +
    cfg.doubleOutletsCount * 1200 +
    cfg.groundedOutletsCount * 1100;
  const switchBase =
    cfg.switchesCount * 760 +
    cfg.doubleSwitchesCount * 1000 +
    cfg.dimmersCount * 1550;
  const outletsCost = Math.round(outletBase * typeCoeff * rc);
  const switchesCost = Math.round(switchBase * typeCoeff * rc);

  // Освещение
  const lightingBase =
    cfg.lightGroupsCount * 1600 +
    cfg.spotLightsCount * 490;
  const lightingCost = Math.round(lightingBase * typeCoeff * rc);

  // Прокладка кабеля
  const cablePricePerM = cablingType?.pricePerM ?? 220;
  const cablingCost = Math.round(cfg.cableRunM * cablePricePerM * typeCoeff * rc);

  // Щиток и автоматы
  const panelCost = cfg.panelIncluded
    ? Math.round((6200 + cfg.breakersCount * 950) * rc)
    : 0;

  // Заземление
  const groundingCost = cfg.groundingIncluded ? Math.round(9800 * rc) : 0;

  // Тестирование
  const testingCost = cfg.testingIncluded ? Math.round(5500 * rc) : 0;

  const subtotal =
    outletsCost +
    switchesCost +
    lightingCost +
    cablingCost +
    panelCost +
    groundingCost +
    testingCost;

  const markupAmount = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markupAmount;

  // Материалы: кабель (~70%), розетки/выключатели (~50%), щиток (~60%)
  const materialsCost = Math.round(
    outletsCost  * 0.50 +
    switchesCost * 0.50 +
    lightingCost * 0.40 +
    cablingCost  * 0.70 +
    panelCost    * 0.60 +
    groundingCost * 0.30 +
    testingCost  * 0.00
  );
  const worksCost = subtotal - materialsCost;

  return {
    outletsCost,
    switchesCost,
    lightingCost,
    cablingCost,
    panelCost,
    groundingCost,
    testingCost,
    materialsCost,
    worksCost,
    subtotal,
    regionCoeff: rc,
    markupAmount,
    total,
  };
}

export function calcElectricsMaterials(
  cfg: Omit<ElectricsConfig, "id" | "totalPrice">,
  bd: ElectricsPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const cablingType = CABLING_TYPES.find(c => c.id === cfg.cablingType);
  const rc = region.coeff;
  const tc = ROOM_TYPES.find(r => r.id === cfg.roomType)?.priceCoeff ?? 1.0;

  const items: MaterialItem[] = [];

  // ── МАТЕРИАЛЫ: Розетки ───────────────────────────────────────────────────
  const totalOutlets = cfg.outletsCount + cfg.doubleOutletsCount + cfg.groundedOutletsCount;
  if (totalOutlets > 0) {
    if (cfg.outletsCount > 0) items.push({
      name: "Розетка одинарная",
      spec: "IP20, скрытый монтаж",
      unit: "шт.",
      qty: cfg.outletsCount,
      pricePerUnit: Math.round(950 * 0.50),
      total: Math.round(cfg.outletsCount * 950 * 0.50 * tc * rc),
    });
    if (cfg.doubleOutletsCount > 0) items.push({
      name: "Розетка двойная",
      spec: "IP20, евростандарт",
      unit: "шт.",
      qty: cfg.doubleOutletsCount,
      pricePerUnit: Math.round(1200 * 0.50),
      total: Math.round(cfg.doubleOutletsCount * 1200 * 0.50 * tc * rc),
    });
    if (cfg.groundedOutletsCount > 0) items.push({
      name: "Розетка с заземлением",
      spec: "IP44, для кухни/ванной",
      unit: "шт.",
      qty: cfg.groundedOutletsCount,
      pricePerUnit: Math.round(1100 * 0.50),
      total: Math.round(cfg.groundedOutletsCount * 1100 * 0.50 * tc * rc),
    });
  }

  // ── МАТЕРИАЛЫ: Выключатели ───────────────────────────────────────────────
  if (cfg.switchesCount > 0) items.push({
    name: "Выключатель одноклавишный",
    unit: "шт.",
    qty: cfg.switchesCount,
    pricePerUnit: Math.round(760 * 0.50),
    total: Math.round(cfg.switchesCount * 760 * 0.50 * tc * rc),
  });
  if (cfg.doubleSwitchesCount > 0) items.push({
    name: "Выключатель двухклавишный",
    unit: "шт.",
    qty: cfg.doubleSwitchesCount,
    pricePerUnit: Math.round(1000 * 0.50),
    total: Math.round(cfg.doubleSwitchesCount * 1000 * 0.50 * tc * rc),
  });
  if (cfg.dimmersCount > 0) items.push({
    name: "Диммер",
    spec: "регулятор яркости, 300 Вт",
    unit: "шт.",
    qty: cfg.dimmersCount,
    pricePerUnit: Math.round(1550 * 0.50),
    total: Math.round(cfg.dimmersCount * 1550 * 0.50 * tc * rc),
  });

  // ── МАТЕРИАЛЫ: Кабель ────────────────────────────────────────────────────
  if (cfg.cableRunM > 0 && cablingType) {
    items.push({
      name: "Кабель ВВГнг-LS 3×2,5",
      spec: "силовой, для розеток",
      unit: "м.п.",
      qty: Math.round(cfg.cableRunM * 0.7),
      pricePerUnit: Math.round(cablingType.pricePerM * 0.7 * 0.6),
      total: Math.round(cfg.cableRunM * 0.7 * cablingType.pricePerM * 0.7 * tc * rc),
    });
    items.push({
      name: "Кабель ВВГнг-LS 3×1,5",
      spec: "для освещения",
      unit: "м.п.",
      qty: Math.round(cfg.cableRunM * 0.3),
      pricePerUnit: Math.round(cablingType.pricePerM * 0.7 * 0.45),
      total: Math.round(cfg.cableRunM * 0.3 * cablingType.pricePerM * 0.7 * tc * rc),
    });
  }

  // ── МАТЕРИАЛЫ: Щиток ─────────────────────────────────────────────────────
  if (cfg.panelIncluded) {
    items.push({
      name: "Щиток распределительный",
      spec: `на ${cfg.breakersCount} мест`,
      unit: "шт.",
      qty: 1,
      pricePerUnit: Math.round(6200 * 0.6 * rc),
      total: Math.round(6200 * 0.6 * rc),
    });
    items.push({
      name: "Автоматический выключатель",
      spec: "16/25 А, однополюсный",
      unit: "шт.",
      qty: cfg.breakersCount,
      pricePerUnit: Math.round(950 * 0.6 * rc),
      total: Math.round(cfg.breakersCount * 950 * 0.6 * rc),
    });
  }

  // ── РАСХОДНИКИ ────────────────────────────────────────────────────────────
  if (cfg.cableRunM > 0) {
    if (cfg.cablingType === "hidden") {
      items.push({
        name: "Гофротруба ПВХ ∅20 мм",
        spec: "для скрытой разводки",
        unit: "м.п.",
        qty: Math.ceil(cfg.cableRunM * 1.1),
        pricePerUnit: 25,
        total: Math.ceil(cfg.cableRunM * 1.1) * 25,
        isConsumable: true,
      });
      items.push({
        name: "Монтажная коробка (подрозетник)",
        spec: "∅68 мм, глубина 45 мм",
        unit: "шт.",
        qty: totalOutlets + cfg.switchesCount + cfg.doubleSwitchesCount + cfg.dimmersCount,
        pricePerUnit: 48,
        total: (totalOutlets + cfg.switchesCount + cfg.doubleSwitchesCount + cfg.dimmersCount) * 48,
        isConsumable: true,
      });
      items.push({
        name: "Алебастр / ротбанд для заделки штроб",
        unit: "кг",
        qty: Math.ceil(cfg.cableRunM * 0.3),
        pricePerUnit: 29,
        total: Math.ceil(cfg.cableRunM * 0.3) * 29,
        isConsumable: true,
      });
    } else if (cfg.cablingType === "corrugated") {
      items.push({
        name: "Гофротруба ∅20 мм + крепёж",
        unit: "м.п.",
        qty: Math.ceil(cfg.cableRunM * 1.1),
        pricePerUnit: 33,
        total: Math.ceil(cfg.cableRunM * 1.1) * 33,
        isConsumable: true,
      });
    } else {
      items.push({
        name: "Кабель-канал 25×16 мм",
        spec: "пластиковый, белый",
        unit: "м.п.",
        qty: Math.ceil(cfg.cableRunM),
        pricePerUnit: 58,
        total: Math.ceil(cfg.cableRunM) * 58,
        isConsumable: true,
      });
    }
    items.push({
      name: "Клеммники Wago, стяжки, изолента",
      spec: "монтажные расходники",
      unit: "компл.",
      qty: 1,
      pricePerUnit: Math.round(cfg.cableRunM * 11),
      total: Math.round(cfg.cableRunM * 11),
      isConsumable: true,
    });
  }

  // ── РАБОТЫ ────────────────────────────────────────────────────────────────
  const outletTotal = cfg.outletsCount + cfg.doubleOutletsCount + cfg.groundedOutletsCount;
  if (outletTotal > 0) items.push({
    name: "Установка розеток",
    unit: "шт.",
    qty: outletTotal,
    pricePerUnit: Math.round(720 * 0.50 * tc * rc),
    total: Math.round(outletTotal * 720 * 0.50 * tc * rc),
    isWork: true,
  });

  const switchTotal = cfg.switchesCount + cfg.doubleSwitchesCount + cfg.dimmersCount;
  if (switchTotal > 0) items.push({
    name: "Установка выключателей / диммеров",
    unit: "шт.",
    qty: switchTotal,
    pricePerUnit: Math.round(650 * 0.50 * tc * rc),
    total: Math.round(switchTotal * 650 * 0.50 * tc * rc),
    isWork: true,
  });

  if (cfg.lightGroupsCount + cfg.spotLightsCount > 0) items.push({
    name: "Монтаж светильников",
    unit: "точка",
    qty: cfg.lightGroupsCount + cfg.spotLightsCount,
    pricePerUnit: Math.round(360 * tc * rc),
    total: Math.round((cfg.lightGroupsCount * 1220 + cfg.spotLightsCount * 360) * 0.60 * tc * rc),
    isWork: true,
  });

  if (cfg.cableRunM > 0) items.push({
    name: `Прокладка кабеля (${cablingType?.label ?? ""})`,
    unit: "м.п.",
    qty: cfg.cableRunM,
    pricePerUnit: Math.round(cablingType ? cablingType.pricePerM * 0.30 * tc * rc : 0),
    total: Math.round(cfg.cableRunM * (cablingType?.pricePerM ?? 0) * 0.30 * tc * rc),
    isWork: true,
  });

  if (cfg.panelIncluded) items.push({
    name: "Монтаж и сборка щитка",
    unit: "компл.",
    qty: 1,
    pricePerUnit: Math.round((4500 + cfg.breakersCount * 720) * 0.40 * rc),
    total: Math.round((4500 + cfg.breakersCount * 720) * 0.40 * rc),
    isWork: true,
  });

  if (cfg.groundingIncluded) items.push({
    name: "Устройство заземления",
    unit: "компл.",
    qty: 1,
    pricePerUnit: Math.round(7100 * 0.70 * rc),
    total: Math.round(7100 * 0.70 * rc),
    isWork: true,
  });

  if (cfg.testingIncluded) items.push({
    name: "Прозвонка и тестирование",
    spec: "протокол испытаний",
    unit: "компл.",
    qty: 1,
    pricePerUnit: Math.round(3000 * rc),
    total: Math.round(3000 * rc),
    isWork: true,
  });

  return items;
}