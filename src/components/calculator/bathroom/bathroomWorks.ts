import { REGIONS, BATHROOM_TYPES, FLOOR_TILES, WALL_TILES, WATERPROOFING_TYPES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import type { BathroomPriceBreakdown } from "./bathroomUtils";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

/**
 * Детальная расшифровка РАБОТ по санузлу.
 * Каждый укрупнённый блок разворачивается в конкретные работы с количеством,
 * единицей и ценой за единицу. Работы считаются из тех же формул, что и в
 * calcBathroomPrice, поэтому согласованы с итогом сметы.
 */
export function calcBathroomWorks(
  cfg: Omit<BathroomConfig, "id" | "totalPrice">,
  bd: BathroomPriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const region = REGIONS.find((r) => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;
  const typeCoeff = BATHROOM_TYPES.find((b) => b.id === cfg.bathroomType)?.priceCoeff ?? 1.0;
  const floorTile = FLOOR_TILES.find((t) => t.id === cfg.floorTileId);
  const wallTile = WALL_TILES.find((t) => t.id === cfg.wallTileId);
  const waterproofing = WATERPROOFING_TYPES.find((w) => w.id === cfg.waterproofingType);
  const area = cfg.area || 0;
  const wallArea = cfg.wallArea || 0;
  const items: MaterialItem[] = [];

  const W = (name: string, unit: string, qty: number, total: number, spec?: string) => {
    if (total <= 0 || qty <= 0) return;
    items.push({
      name,
      spec,
      unit,
      qty: Math.round(qty * 10) / 10,
      pricePerUnit: Math.round(total / qty),
      total: Math.round(total),
      isWork: true,
    });
  };

  // ── Демонтаж ───────────────────────────────────────────────
  if (bd.demolitionCost > 0) {
    W("Демонтаж напольной плитки и стяжки", "м²", area, area * 380 * rc, "снятие покрытия до основания");
    W("Демонтаж настенной плитки и штукатурки", "м²", wallArea, wallArea * 320 * rc, "очистка стен, вынос мусора");
  }

  // ── Демонтаж сантехкабины ──────────────────────────────────
  if (bd.cabinDemolitionCost > 0) {
    const perimeter = Math.max(6, Math.round(Math.sqrt(area) * 4));
    W("Демонтаж перегородок сантехкабины", "м.п.", perimeter, bd.cabinDemolitionCost, "снос блоков, разборка, вынос");
  }

  // ── Возведение сантехкабины (работа ~35%) ──────────────────
  if (bd.cabinConstructionCost > 0) {
    const perimeter = Math.max(6, Math.round(Math.sqrt(area) * 4));
    W("Кладка перегородок из блоков", "м²", perimeter * 2.5, bd.cabinConstructionCost * 0.35, "возведение стен сантехкабины");
  }

  // ── Стяжка (работа ~45%) ───────────────────────────────────
  if (bd.screedCost > 0) {
    W("Устройство цементной стяжки пола", "м²", area, bd.screedCost * 0.45, "выравнивание по маякам");
  }

  // ── Гидроизоляция (работа ~40%) ────────────────────────────
  if (bd.waterproofingCost > 0 && waterproofing) {
    const sqm = area + wallArea * 0.3;
    W("Нанесение гидроизоляции", "м²", sqm, bd.waterproofingCost * 0.4, `${waterproofing.label}, в 2 слоя`);
  }

  // ── Укладка плитки пола (работа) ───────────────────────────
  if (floorTile && bd.floorTileCost > 0) {
    W("Укладка плитки на пол", "м²", area, area * floorTile.installPriceM2 * typeCoeff * rc, floorTile.label);
    W("Затирка межплиточных швов (пол)", "м²", area, area * 180 * rc, "затирка швов");
  }

  // ── Укладка плитки стен (работа) ───────────────────────────
  if (wallTile && bd.wallTileCost > 0) {
    W("Укладка плитки на стены", "м²", wallArea, wallArea * wallTile.installPriceM2 * typeCoeff * rc, wallTile.label);
    W("Затирка межплиточных швов (стены)", "м²", wallArea, wallArea * 150 * rc, "затирка швов");
  }

  // ── Сантехнические работы (детально) ───────────────────────
  if (cfg.toiletInstall) W("Установка и подключение унитаза", "шт.", 1, 9500 * rc, "монтаж, подводка, проверка");
  if (cfg.installationSystemIncluded) W("Монтаж инсталляции подвесного унитаза", "шт.", 1, 22000 * rc, "рама, бачок, кнопка смыва");
  if (cfg.sinkInstall) W("Установка раковины с подводкой", "шт.", 1, 7500 * rc, "монтаж, сифон, подключение");
  if (cfg.bathInstall) W("Установка ванны со смесителем и сливом", "шт.", 1, 14000 * rc, "выставление, подключение");
  if (cfg.showerCabinInstall) W("Монтаж душевого поддона и кабины", "шт.", 1, 18000 * rc, "поддон, лейка, ограждение");
  if (cfg.mixersCount > 0) W("Установка смесителя", "шт.", cfg.mixersCount, cfg.mixersCount * 4500 * rc, "монтаж и подключение");

  // ── Тёплый пол (работа ~40%) ───────────────────────────────
  if (bd.heatedFloorCost > 0) {
    const basePerM2 = cfg.heatedFloorType === "electric" ? 2200 : 3800;
    W(
      cfg.heatedFloorType === "electric" ? "Монтаж электрического тёплого пола" : "Монтаж водяного тёплого пола",
      "м²",
      area,
      area * basePerM2 * rc * 0.4,
      "укладка, подключение терморегулятора",
    );
  }

  // ── Вентиляция (работа ~60%) ───────────────────────────────
  if (bd.ventilationCost > 0) {
    W("Монтаж вытяжного вентилятора", "шт.", 1, bd.ventilationCost * 0.6, "установка, подключение, вывод канала");
  }

  // ── Мебель / зеркало (монтаж) ──────────────────────────────
  if (cfg.vanityInstall) W("Монтаж тумбы с раковиной", "шт.", 1, 8500 * rc, "навеска, регулировка");
  if (cfg.mirrorInstall) W("Установка зеркала / зеркала-шкафа", "шт.", 1, 3500 * rc, "крепление, выставление");

  // ── Аксессуары (работа ~30%) ───────────────────────────────
  if (bd.accessoriesCost > 0) {
    W("Установка аксессуаров (полотенцесушитель, держатели)", "компл.", 1, bd.accessoriesCost * 0.3, "монтаж комплекта");
  }

  return items;
}
