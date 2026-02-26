import {
  FLOORING_PRODUCTS, SUBSTRATE_OPTIONS, INSTALL_PATTERNS, SKIRTING_OPTIONS, REGIONS,
} from "./FlooringTypes";
import type { FlooringConfig } from "./FlooringTypes";

export function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

export const DEFAULT_CONFIG: Omit<FlooringConfig, "id" | "totalPrice"> = {
  roomName: "",
  length: 5,
  width: 4,
  area: 20,
  perimeter: 18,
  productId: "lam-quick-step-33",
  substrateId: "xps-3",
  patternId: "straight",
  skirtingId: "mdf-60",
  skirtingIncluded: true,
  demolitionIncluded: false,
  levelingIncluded: false,
  levelingThicknessMm: 30,
  thresholdCount: 1,
};

export interface PriceBreakdown {
  materialQty: number;
  materialCost: number;
  substrateCost: number;
  installCost: number;
  skirtingCost: number;
  demolitionCost: number;
  levelingCost: number;
  thresholdCost: number;
  materialsCost: number;
  worksCost: number;
  total: number;
  pricePerM2: number;
}

export function calcFlooringPrice(cfg: Omit<FlooringConfig, "id" | "totalPrice">, regionId = "moscow", markupPct = 0): PriceBreakdown {
  const product = FLOORING_PRODUCTS.find(p => p.id === cfg.productId);
  const substrate = SUBSTRATE_OPTIONS.find(s => s.id === cfg.substrateId);
  const pattern = INSTALL_PATTERNS.find(p => p.id === cfg.patternId);
  const skirting = SKIRTING_OPTIONS.find(s => s.id === cfg.skirtingId);
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];

  const area = cfg.area || 0;
  const perimeter = cfg.perimeter || 0;
  const rc = region.coeff;

  const wasteFactor = 1 + (pattern?.wastePct ?? 5) / 100;
  const materialQty = Math.ceil(area * wasteFactor * 10) / 10;

  const materialCost = Math.round(materialQty * (product?.pricePerM2 ?? 0));
  const substrateCost = Math.round(area * (substrate?.pricePerM2 ?? 0));
  const installCost = Math.round(area * (product?.installPrice ?? 0) * rc);
  const skirtingCost = cfg.skirtingIncluded ? Math.round(perimeter * (skirting?.pricePerM ?? 0) * rc) : 0;
  const demolitionCost = cfg.demolitionIncluded ? Math.round(area * 180 * rc) : 0;
  const levelingCost = cfg.levelingIncluded
    ? Math.round(area * cfg.levelingThicknessMm * 18 * rc)
    : 0;
  const thresholdCost = Math.round(cfg.thresholdCount * 850 * rc);

  const subtotal = materialCost + substrateCost + installCost + skirtingCost + demolitionCost + levelingCost + thresholdCost;
  const markup = markupPct > 0 ? Math.round(subtotal * markupPct / 100) : 0;
  const total = subtotal + markup;

  // Материалы: само покрытие + подложка + пороги (изделия)
  const materialsCost = materialCost + substrateCost + Math.round(cfg.thresholdCount * 850 * 0.7); // пороги ~70% материал
  // Работы: монтаж + плинтус (монтаж) + демонтаж + выравнивание
  const worksCost = subtotal - materialsCost;

  return {
    materialQty,
    materialCost,
    substrateCost,
    installCost,
    skirtingCost,
    demolitionCost,
    levelingCost,
    thresholdCost,
    materialsCost,
    worksCost,
    total,
    pricePerM2: area > 0 ? Math.round(total / area) : 0,
  };
}