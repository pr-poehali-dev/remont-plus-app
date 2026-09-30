/**
 * ЦЕНЫ ДЛЯ ГОРОДСКИХ ЛЕНДИНГОВ.
 *
 * Считаются тем же движком, что и калькулятор ремонта под ключ, —
 * поэтому цифра на посадочной странице всегда совпадает с тем,
 * что человек увидит в расчёте. Никаких «нарисованных» вилок.
 */

import { DEFAULT_TURNKEY_CONFIG } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkey } from "@/components/calculator/turnkey/turnkeyEngine";

export interface CityPrices {
  /** ₽/м² — эконом-уровень */
  economy: number;
  /** ₽/м² — стандарт (основной ориентир) */
  standard: number;
  /** ₽/м² — премиум */
  premium: number;
  /** Смета целиком для типовой 2-комнатной 54 м² */
  exampleTotal: number;
  exampleArea: number;
}

const EXAMPLE_AREA = 54;

function pricePerM2(calcRegion: string, level: string, area = EXAMPLE_AREA): number {
  const cfg = {
    ...DEFAULT_TURNKEY_CONFIG,
    apartmentType: "2room",
    totalAreaM2: area,
    kitchenAreaM2: 10,
    renovationLevel: level,
    bathroomCount: 1,
    doorsCount: 4,
  };
  const e = calcTurnkey(cfg, calcRegion, 0);
  return Math.round(e.total / area);
}

const cache = new Map<string, CityPrices>();

export function getCityPrices(calcRegion: string): CityPrices {
  const hit = cache.get(calcRegion);
  if (hit) return hit;

  const economy = pricePerM2(calcRegion, "economy");
  const standard = pricePerM2(calcRegion, "standard");
  const premium = pricePerM2(calcRegion, "premium");

  const value: CityPrices = {
    economy,
    standard,
    premium,
    exampleTotal: standard * EXAMPLE_AREA,
    exampleArea: EXAMPLE_AREA,
  };
  cache.set(calcRegion, value);
  return value;
}

export const fmtRub = (n: number) => Math.round(n).toLocaleString("ru-RU");
