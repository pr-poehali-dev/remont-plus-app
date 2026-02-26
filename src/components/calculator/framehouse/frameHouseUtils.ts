import type { FrameHouseConfig } from "./FrameHouseTypes";
import {
  FRAME_WALL_TECHS, FRAME_INSULATIONS, FOUNDATION_TYPES,
  ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES, FLOOR_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES, REGIONS,
} from "./FrameHouseTypes";

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

export interface FrameHouseBreakdown {
  // Конструктив
  foundation: number;
  frame: number;
  insulation: number;
  // Крыша
  roofStructure: number;
  roofing: number;
  // Фасад и окна
  facade: number;
  windows: number;
  // Полы
  floor: number;
  underfloorHeating: number;
  // Инженерия
  heating: number;
  electrical: number;
  plumbing: number;
  sewage: number;
  // Отделка
  interiorFinish: number;
  // Доп. опции
  terrace: number;
  garage: number;
  // Монтажные работы
  assembly: number;
  // Сервис
  foreman: number;
  supplier: number;
  // Итоги
  materialsBase: number;
  worksCost: number;
  materialsCost: number;
  regionCoeff: number;
  markupAmount: number;
  subtotal: number;
  total: number;
}

export function calcFrameHousePrice(
  cfg: FrameHouseConfig,
  regionId: string,
  markupPct = 0,
): FrameHouseBreakdown {
  const area = Math.max(cfg.totalArea, 10);
  const regionCoeff = REGIONS[regionId]?.coeff ?? 0.8;

  // ── Геометрия ──────────────────────────────────────────────────────────────
  const side = Math.sqrt(area / cfg.floors);
  const perimeter = side * 4;
  const wallArea = perimeter * cfg.wallHeight * cfg.floors;
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;

  // ── 1. Фундамент ──────────────────────────────────────────────────────────
  const foundBase = FOUNDATION_TYPES[cfg.foundation].basePrice;
  const foundation = foundBase * (1 + (area - 50) * 0.008);

  // ── 2. Каркас стен ────────────────────────────────────────────────────────
  const framePriceM2 = FRAME_WALL_TECHS[cfg.wallTech].pricePerM2;
  const frame = wallArea * framePriceM2;

  // ── 3. Утепление (стены + перекрытия + кровля) ────────────────────────────
  const insulPriceM2 = FRAME_INSULATIONS[cfg.insulation].pricePerM2;
  const insulArea = wallArea + area * (cfg.floors === 2 ? 2 : 1.5);
  const insulation = insulArea * insulPriceM2;

  // ── 4. Кровельная конструкция ─────────────────────────────────────────────
  const roofStructure = roofArea * 1650;

  // ── 5. Кровельный материал ───────────────────────────────────────────────
  const roofing = roofArea * ROOFING_MATERIALS[cfg.roofingMaterial].pricePerM2;

  // ── 6. Фасад ─────────────────────────────────────────────────────────────
  const facadePriceM2 = FACADE_TYPES[cfg.facade].pricePerM2;
  const facade = wallArea * facadePriceM2;

  // ── 7. Окна ───────────────────────────────────────────────────────────────
  const windowPrice = WINDOW_TYPES[cfg.windowType].pricePerUnit;
  const windows = cfg.windowCount * windowPrice;

  // ── 8. Полы ───────────────────────────────────────────────────────────────
  const floorPriceM2 = FLOOR_TYPES[cfg.floorType].pricePerM2;
  const floor = area * floorPriceM2;
  const underfloorHeating = cfg.underfloorHeating ? area * 2800 : 0;

  // ── 9. Отопление ─────────────────────────────────────────────────────────
  const heatingBase = HEATING_TYPES[cfg.heating].basePrice;
  const heating = heatingBase + area * 320;

  // ── 10. Электрика ─────────────────────────────────────────────────────────
  const electrical = cfg.electricalIncluded ? area * 1650 + 28000 : 0;

  // ── 11. Водоснабжение ─────────────────────────────────────────────────────
  const plumbing = cfg.plumbingIncluded ? area * 880 + 38000 : 0;

  // ── 12. Канализация ───────────────────────────────────────────────────────
  const sewage = cfg.sewageIncluded ? 75000 + area * 320 : 0;

  // ── 13. Внутренняя отделка ───────────────────────────────────────────────
  const finishPriceM2 = INTERIOR_FINISHES[cfg.interiorFinish].pricePerM2;
  const interiorFinish = area * finishPriceM2;

  // ── 14. Терраса ───────────────────────────────────────────────────────────
  const terrace = cfg.terrace ? cfg.terraceArea * 6800 : 0;

  // ── 15. Гараж ─────────────────────────────────────────────────────────────
  const garage = cfg.garage ? cfg.garageArea * 22000 : 0;

  // ── 16. Монтажные работы (38% от материальной части) ────────────────────
  const materialsSum = foundation + frame + insulation + roofStructure + roofing +
    facade + windows + floor + underfloorHeating + heating + electrical +
    plumbing + sewage + interiorFinish + terrace + garage;
  const assembly = materialsSum * 0.38;

  // ── 17. Применение регионального коэффициента ────────────────────────────
  const totalBeforeServices = (materialsSum + assembly) * regionCoeff;

  // ── 18. Прораб ────────────────────────────────────────────────────────────
  const foreman = cfg.foremanIncluded
    ? totalBeforeServices * (cfg.foremanPct / 100)
    : 0;

  // ── 19. Снабженец ─────────────────────────────────────────────────────────
  const supplier = cfg.supplierIncluded
    ? materialsSum * regionCoeff * (cfg.supplierPct / 100)
    : 0;

  // ── 20. Итоги ─────────────────────────────────────────────────────────────
  const subtotal = totalBeforeServices + foreman + supplier;
  const markupAmount = subtotal * (markupPct / 100);
  const total = subtotal + markupAmount;

  // Разбивка на работы и материалы
  const materialsFraction = 0.62; // ~62% стоимости — материалы
  const materialsCost = Math.round(subtotal * materialsFraction);
  const worksCost = subtotal - materialsCost - foreman - supplier;

  return {
    foundation: Math.round(foundation * regionCoeff),
    frame: Math.round(frame * regionCoeff),
    insulation: Math.round(insulation * regionCoeff),
    roofStructure: Math.round(roofStructure * regionCoeff),
    roofing: Math.round(roofing * regionCoeff),
    facade: Math.round(facade * regionCoeff),
    windows: Math.round(windows * regionCoeff),
    floor: Math.round(floor * regionCoeff),
    underfloorHeating: Math.round(underfloorHeating * regionCoeff),
    heating: Math.round(heating * regionCoeff),
    electrical: Math.round(electrical * regionCoeff),
    plumbing: Math.round(plumbing * regionCoeff),
    sewage: Math.round(sewage * regionCoeff),
    interiorFinish: Math.round(interiorFinish * regionCoeff),
    terrace: Math.round(terrace * regionCoeff),
    garage: Math.round(garage * regionCoeff),
    assembly: Math.round(assembly * regionCoeff),
    foreman: Math.round(foreman),
    supplier: Math.round(supplier),
    materialsBase: Math.round(materialsSum),
    worksCost: Math.round(worksCost),
    materialsCost: Math.round(materialsCost),
    regionCoeff,
    markupAmount: Math.round(markupAmount),
    subtotal: Math.round(subtotal),
    total: Math.round(total),
  };
}
