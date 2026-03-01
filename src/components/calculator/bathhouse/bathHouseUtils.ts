// Реэкспорт для обратной совместимости
export { calcBathHousePrice } from "./bathHousePricing";
export type { BathHouseBreakdown } from "./bathHousePricing";
export { calcBathHouseMaterials } from "./bathHouseMaterials";

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}
