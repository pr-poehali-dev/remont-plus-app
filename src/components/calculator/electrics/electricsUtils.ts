import { REGIONS, ROOM_TYPES, CABLING_TYPES } from "./ElectricsTypes";
import type { ElectricsConfig } from "./ElectricsTypes";

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
    cfg.outletsCount * 550 +
    cfg.doubleOutletsCount * 700 +
    cfg.groundedOutletsCount * 650;
  const switchBase =
    cfg.switchesCount * 450 +
    cfg.doubleSwitchesCount * 600 +
    cfg.dimmersCount * 900;
  const outletsCost = Math.round(outletBase * typeCoeff * rc);
  const switchesCost = Math.round(switchBase * typeCoeff * rc);

  // Освещение
  const lightingBase =
    cfg.lightGroupsCount * 950 +
    cfg.spotLightsCount * 280;
  const lightingCost = Math.round(lightingBase * typeCoeff * rc);

  // Прокладка кабеля
  const cablePricePerM = cablingType?.pricePerM ?? 220;
  const cablingCost = Math.round(cfg.cableRunM * cablePricePerM * typeCoeff * rc);

  // Щиток и автоматы
  const panelCost = cfg.panelIncluded
    ? Math.round((3500 + cfg.breakersCount * 550) * rc)
    : 0;

  // Заземление
  const groundingCost = cfg.groundingIncluded ? Math.round(5500 * rc) : 0;

  // Тестирование
  const testingCost = cfg.testingIncluded ? Math.round(3000 * rc) : 0;

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

  return {
    outletsCost,
    switchesCost,
    lightingCost,
    cablingCost,
    panelCost,
    groundingCost,
    testingCost,
    subtotal,
    regionCoeff: rc,
    markupAmount,
    total,
  };
}