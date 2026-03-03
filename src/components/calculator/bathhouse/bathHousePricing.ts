import type { BathHouseConfig } from "./BathHouseTypes";
import {
  WALL_MATERIALS,
  FOUNDATION_TYPES,
  ROOF_TYPES,
  ROOFING_MATERIALS,
  INSULATION_MATERIALS,
  WALL_FINISHES,
  STOVE_TYPES,
  VENTILATION_TYPES,
  SHELF_MATERIALS,
  FLOOR_MATERIALS,
  REGIONS,
} from "./BathHouseTypes";

export interface BathHouseBreakdown {
  foundation: number;
  walls: number;
  roofStructure: number;
  roofing: number;
  insulation: number;
  wallFinishSteam: number;
  wallFinishWash: number;
  wallFinishRest: number;
  floor: number;
  stove: number;
  ventilation: number;
  shelves: number;
  windows: number;
  chimney: number;
  tank: number;
  terrace: number;
  electrical: number;
  assembly: number;
  materialsBase: number;
  foreman: number;
  supplier: number;
  regionCoeff: number;
  markupAmount: number;
  subtotal: number;
  total: number;

  stoveRecommendation: string;
  ventRecommendation: string;
  shelfRecommendation: string;
}

export function calcBathHousePrice(cfg: BathHouseConfig, regionId: string, markupPct = 0): BathHouseBreakdown {
  const region = REGIONS[regionId] ?? REGIONS["moscow"];
  const rc = region.coeff;

  const area = Math.max(cfg.totalArea, 6);
  const perimeter = Math.sqrt(area) * 4;
  const wallArea = perimeter * cfg.wallHeight;

  const foundation = FOUNDATION_TYPES[cfg.foundation].basePrice * (1 + (area - 24) * 0.012);

  const wallMat = WALL_MATERIALS[cfg.wallMaterial];
  const walls = wallArea * wallMat.pricePerM2;

  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;
  const roofStructure = roofArea * 1980;
  const roofingMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  const roofing = roofArea * roofingMat.pricePerM2;

  const insulationMat = INSULATION_MATERIALS[cfg.insulation];
  const insulationVolume = (wallArea + area) * (cfg.insulationThickness / 1000);
  const insulation = insulationVolume * insulationMat.pricePerM3;

  const steamWallArea = cfg.steamRoomArea * 4 * 0.8;
  const washWallArea = cfg.washRoomArea * 4 * 0.8;
  const restWallArea = (cfg.restRoomArea + cfg.dressingRoomArea) * 4 * 0.8;
  const wallFinishSteam = steamWallArea * WALL_FINISHES[cfg.wallFinishSteam].pricePerM2;
  const wallFinishWash = washWallArea * WALL_FINISHES[cfg.wallFinishWash].pricePerM2;
  const wallFinishRest = restWallArea * WALL_FINISHES[cfg.wallFinishRest].pricePerM2;

  const floorMat = FLOOR_MATERIALS[cfg.floorMaterial];
  const floor = area * floorMat.pricePerM2 + (cfg.underfloorHeating ? area * 2420 : 0);

  const stoveData = STOVE_TYPES[cfg.stoveType];
  const stove = stoveData.price;

  const ventData = VENTILATION_TYPES[cfg.ventilation];
  const ventilation = ventData.price + area * 198;

  const shelfMat = SHELF_MATERIALS[cfg.shelfMaterial];
  const shelfArea = cfg.steamRoomArea * 0.35 * cfg.shelfTiers * (cfg.shelfWidth / 0.6);
  const shelves = shelfArea * shelfMat.pricePerM2;

  const windowsBase = cfg.window_pvc ? 12000 : 20000;
  const windows = cfg.windowCount * windowsBase;

  const chimney = cfg.chimney ? 30800 : 0;
  const tank = cfg.tankVolume > 0 ? 9350 + cfg.tankVolume * 50 : 0;
  const terrace = cfg.terrace ? cfg.terraceArea * 5280 : 0;
  const electrical = cfg.electricalFull ? area * 1980 + 24200 : cfg.electricalBasic ? area * 935 + 13200 : 0;

  const materialSum = foundation + walls + roofStructure + roofing + insulation +
    wallFinishSteam + wallFinishWash + wallFinishRest + floor + stove + ventilation +
    shelves + windows + chimney + tank + terrace + electrical;
  const assembly = materialSum * 0.42;

  const materialsWithRegion = materialSum * rc;
  const worksSubtotal = (materialSum + assembly) * rc;

  const foreman = cfg.foremanIncluded
    ? Math.round(worksSubtotal * (cfg.foremanPct || 10) / 100)
    : 0;
  const supplier = cfg.supplierIncluded
    ? Math.round(materialsWithRegion * (cfg.supplierPct || 5) / 100)
    : 0;

  const subtotal = worksSubtotal + foreman + supplier;
  const markupAmount = subtotal * (markupPct / 100);
  const total = subtotal + markupAmount;

  const steamVol = cfg.steamRoomArea * cfg.wallHeight;
  const recommendedKw = steamVol * 1.2;
  const stovePower = stoveData.power;

  let stoveRecommendation = `Объём парной ${steamVol.toFixed(1)} м³ → рекомендуемая мощность ${recommendedKw.toFixed(0)}–${(recommendedKw * 1.3).toFixed(0)} кВт. Выбранная печь: ${stovePower}.`;
  if (cfg.stoveType === "electric_infrared") stoveRecommendation += " ИК-кабина — это не замена парной, а отдельный продукт.";
  if (cfg.stoveType === "brick_classic" || cfg.stoveType === "brick_heater") stoveRecommendation += " Кирпичная печь требует отдельного фундамента.";

  const ventRecommendation = cfg.steamRoomArea < 8
    ? "Для парной до 8 м² достаточно естественной канальной вентиляции."
    : cfg.steamRoomArea < 15
    ? "Для парной 8–15 м² рекомендуем принудительную приточную вентиляцию."
    : "Для большой парной 15+ м² обязательна полная принудительная вентиляция с таймером.";

  let shelfRecommendation = `Площадь полога ${shelfArea.toFixed(1)} м² (${cfg.shelfTiers} яруса × ${cfg.shelfWidth} м ширина). `;
  if (cfg.shelfTiers === 1) shelfRecommendation += "Один ярус — минималистично, для небольших парных.";
  else if (cfg.shelfTiers === 2) shelfRecommendation += "Два яруса — классика. Нижний для сидения, верхний для лежания.";
  else shelfRecommendation += "Три яруса — максимальная вместимость, температура на верхнем полоке выше.";

  return {
    foundation, walls, roofStructure, roofing, insulation,
    wallFinishSteam, wallFinishWash, wallFinishRest,
    floor, stove, ventilation, shelves, windows, chimney, tank, terrace, electrical,
    assembly, materialsBase: Math.round(materialsWithRegion), foreman, supplier,
    regionCoeff: rc, markupAmount, subtotal, total,
    stoveRecommendation, ventRecommendation, shelfRecommendation,
  };
}