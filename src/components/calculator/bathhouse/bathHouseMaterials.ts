import type { BathHouseConfig } from "./BathHouseTypes";
import type { BathHouseBreakdown } from "./bathHousePricing";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcBathHouse } from "./bathHouseEngine";

/**
 * Детальная ведомость МАТЕРИАЛОВ + расходников + работ.
 * Возвращает все позиции движка без служебного поля block.
 * Сумма позиций = worksTotal + materialsTotal (без наценки/прораба/снабженца).
 * Второй аргумент bd сохранён для обратной совместимости вызовов (не нужен).
 */
export function calcBathHouseMaterials(
  cfg: BathHouseConfig,
  _bd: BathHouseBreakdown | undefined,
  regionId: string,
): MaterialItem[] {
  const e = calcBathHouse(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcBathHouseWorks(
  cfg: BathHouseConfig,
  _bd: BathHouseBreakdown | undefined,
  regionId: string,
): MaterialItem[] {
  const e = calcBathHouse(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
