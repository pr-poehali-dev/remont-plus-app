import type { CeilingConfig } from "./CeilingTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcCeiling } from "./ceilingEngine";

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const DEFAULT_CONFIG: Omit<CeilingConfig, "id" | "totalPrice"> = {
  roomName: "",
  ceilingType: "matte",
  level: "single",
  brandId: "lackfolie",
  colorId: "white",
  area: 20,
  perimeter: 18,
  lightingId: "spot",
  lightingCount: 6,
  profileId: "garpun",
  installationIncluded: true,
  regionId: "moscow",
  note: "",
};

/**
 * Базовая цена потолка БЕЗ наценки (с региональным коэффициентом).
 * Совместимая обёртка над единым движком calcCeiling: возвращает строгую
 * сумму детальных позиций (норма × цена 2026). Экранный калькулятор
 * добавляет наценку поверх этого значения — поведение сохранено.
 */
export function calcPrice(cfg: Omit<CeilingConfig, "id" | "totalPrice">): number {
  return calcCeiling(cfg, cfg.regionId).subtotal;
}

/** Детальная ведомость МАТЕРИАЛОВ + работ (для таблиц). */
export function calcCeilingMaterials(
  cfg: Omit<CeilingConfig, "id" | "totalPrice">,
  regionId?: string,
): MaterialItem[] {
  const e = calcCeiling(cfg, regionId ?? cfg.regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcCeilingWorks(
  cfg: Omit<CeilingConfig, "id" | "totalPrice">,
  regionId?: string,
): MaterialItem[] {
  const e = calcCeiling(cfg, regionId ?? cfg.regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}