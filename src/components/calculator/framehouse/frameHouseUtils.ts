// Реэкспорт для обратной совместимости
export { calcFrameHousePrice } from "./frameHousePricing";
export type { FrameHouseBreakdown } from "./frameHousePricing";
export { calcFrameHouseMaterials } from "./frameHouseMaterials";

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}
