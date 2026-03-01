import type { FrameHouseConfig } from "./FrameHouseTypes";
import {
  FRAME_WALL_TECHS, FRAME_INSULATIONS, FOUNDATION_TYPES,
  ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES, FLOOR_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES, REGIONS,
} from "./FrameHouseTypes";

export interface FrameHouseBreakdown {
  foundation: number;
  frame: number;
  insulation: number;
  roofStructure: number;
  roofing: number;
  facade: number;
  windows: number;
  floor: number;
  underfloorHeating: number;
  heating: number;
  electrical: number;
  plumbing: number;
  sewage: number;
  interiorFinish: number;
  terrace: number;
  garage: number;
  assembly: number;
  foreman: number;
  supplier: number;
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

  const floorFactor = cfg.floors === 1.5 ? 1.3 : cfg.floors;
  const side = Math.sqrt(area / floorFactor);
  const perimeter = side * 4;
  const wallFloors = cfg.roofType === "a_frame" ? 1 : (cfg.floors === 1.5 ? 1.5 : cfg.floors);
  const wallArea = perimeter * cfg.wallHeight * wallFloors;
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;

  const foundBase = FOUNDATION_TYPES[cfg.foundation].basePrice;
  const foundation = foundBase * (1 + (area - 50) * 0.008);

  const framePriceM2 = FRAME_WALL_TECHS[cfg.wallTech].pricePerM2;
  const frame = wallArea * framePriceM2;

  const insulPriceM2 = FRAME_INSULATIONS[cfg.insulation].pricePerM2;
  const insulArea = wallArea + area * (cfg.floors === 2 ? 2 : cfg.floors === 1.5 ? 1.75 : 1.5);
  const insulation = insulArea * insulPriceM2;

  const roofStructure = roofArea * 1650;
  const roofing = roofArea * ROOFING_MATERIALS[cfg.roofingMaterial].pricePerM2;

  const facadePriceM2 = FACADE_TYPES[cfg.facade].pricePerM2;
  const facade = wallArea * facadePriceM2;

  const windowPrice = WINDOW_TYPES[cfg.windowType].pricePerUnit;
  const windows = cfg.windowCount * windowPrice;

  const floorPriceM2 = FLOOR_TYPES[cfg.floorType].pricePerM2;
  const floor = area * floorPriceM2;
  const underfloorHeating = cfg.underfloorHeating ? area * 2800 : 0;

  const heatingBase = HEATING_TYPES[cfg.heating].basePrice;
  const heating = heatingBase + area * 320;

  const electrical = cfg.electricalIncluded ? area * 1650 + 28000 : 0;
  const plumbing = cfg.plumbingIncluded ? area * 880 + 38000 : 0;
  const sewage = cfg.sewageIncluded ? 75000 + area * 320 : 0;

  const finishPriceM2 = INTERIOR_FINISHES[cfg.interiorFinish].pricePerM2;
  const interiorFinish = area * finishPriceM2;

  const terrace = cfg.terrace ? cfg.terraceArea * 6800 : 0;
  const garage = cfg.garage ? cfg.garageArea * 22000 : 0;

  const materialsSum = foundation + frame + insulation + roofStructure + roofing +
    facade + windows + floor + underfloorHeating + heating + electrical +
    plumbing + sewage + interiorFinish + terrace + garage;
  const assembly = materialsSum * 0.38;

  const totalBeforeServices = (materialsSum + assembly) * regionCoeff;

  const foreman = cfg.foremanIncluded
    ? totalBeforeServices * (cfg.foremanPct / 100)
    : 0;
  const supplier = cfg.supplierIncluded
    ? materialsSum * regionCoeff * (cfg.supplierPct / 100)
    : 0;

  const subtotal = totalBeforeServices + foreman + supplier;
  const markupAmount = subtotal * (markupPct / 100);
  const total = subtotal + markupAmount;

  const materialsFraction = 0.62;
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
