import type { FrameHouseConfig } from "./FrameHouseTypes";
import type { FrameHouseBreakdown } from "./frameHousePricing";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";
import { calcFrameHouse } from "./frameHouseEngine";

/**
 * Детальная ведомость МАТЕРИАЛОВ + расходников + работ.
 * Возвращает все позиции движка без служебного поля block.
 * Сумма позиций = worksTotal + materialsTotal (без наценки/прораба/снабженца).
 * Второй аргумент bd сохранён для обратной совместимости вызовов (не нужен).
 */
export function calcFrameHouseMaterials(
  cfg: FrameHouseConfig,
  _bd: FrameHouseBreakdown | undefined,
  regionId: string,
): MaterialItem[] {
  const e = calcFrameHouse(cfg, regionId, 0);
  return e.lines.map(({ block: _block, ...item }) => item);
}

/** Детальные РАБОТЫ. */
export function calcFrameHouseWorks(
  cfg: FrameHouseConfig,
  _bd: FrameHouseBreakdown | undefined,
  regionId: string,
): MaterialItem[] {
  const e = calcFrameHouse(cfg, regionId, 0);
  return e.works.map(({ block: _block, ...item }) => item);
}
