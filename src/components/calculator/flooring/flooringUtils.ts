import {
  FLOORING_PRODUCTS, SUBSTRATE_OPTIONS, INSTALL_PATTERNS, SKIRTING_OPTIONS, REGIONS,
} from "./FlooringTypes";
import type { FlooringConfig } from "./FlooringTypes";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

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

export function calcFlooringMaterials(
  cfg: Omit<FlooringConfig, "id" | "totalPrice">,
  bd: PriceBreakdown,
  regionId = "moscow",
): MaterialItem[] {
  const product  = FLOORING_PRODUCTS.find(p => p.id === cfg.productId);
  const substrate = SUBSTRATE_OPTIONS.find(s => s.id === cfg.substrateId);
  const pattern  = INSTALL_PATTERNS.find(p => p.id === cfg.patternId);
  const skirting = SKIRTING_OPTIONS.find(s => s.id === cfg.skirtingId);
  const region   = REGIONS.find(r => r.id === regionId) ?? REGIONS[3];
  const rc = region.coeff;

  const area = cfg.area || 0;
  const perimeter = cfg.perimeter || 0;
  const wasteFactor = 1 + (pattern?.wastePct ?? 5) / 100;
  const items: MaterialItem[] = [];

  // ── МАТЕРИАЛЫ ──────────────────────────────────────────────────────────────
  if (product && bd.materialCost > 0) {
    items.push({
      name: `${product.brand} ${product.name}`,
      spec: `${product.wear}, ${product.thickness} мм`,
      unit: "м²",
      qty: bd.materialQty,
      pricePerUnit: product.pricePerM2,
      total: bd.materialCost,
    });
  }

  if (substrate && bd.substrateCost > 0) {
    items.push({
      name: substrate.name,
      spec: substrate.description,
      unit: "м²",
      qty: area,
      pricePerUnit: substrate.pricePerM2,
      total: bd.substrateCost,
    });
  }

  if (cfg.skirtingIncluded && skirting && bd.skirtingCost > 0) {
    const skirtingMat = Math.round(perimeter * skirting.pricePerM * 0.55); // ~55% материал
    items.push({
      name: skirting.name,
      spec: "с кляймерами и заглушками",
      unit: "м.п.",
      qty: perimeter,
      pricePerUnit: Math.round(skirting.pricePerM * 0.55),
      total: skirtingMat,
    });
  }

  if (cfg.thresholdCount > 0) {
    items.push({
      name: "Порог стыковочный",
      spec: "алюминий/ламинат, 90 см",
      unit: "шт.",
      qty: cfg.thresholdCount,
      pricePerUnit: Math.round(850 * 0.7),
      total: Math.round(cfg.thresholdCount * 850 * 0.7),
    });
  }

  // ── РАСХОДНИКИ ──────────────────────────────────────────────────────────────
  const isEpoxy = product?.category === "epoxy";

  if (isEpoxy && bd.materialCost > 0) {
    // Эпоксидный праймер: ~0.3 кг/м², упаковка 4 кг = ~13 м²
    const primerPacks = Math.ceil(area / 13);
    items.push({
      name: "Эпоксидный праймер 2К, 4 кг",
      spec: "Uzin PE 460 / Mapei Primer G",
      unit: "компл.",
      qty: primerPacks,
      pricePerUnit: 3_800,
      total: primerPacks * 3_800,
      isConsumable: true,
    });
    // Смола: ~1.5 кг/м² на 3 мм, упаковка 10 кг = ~6.5 м²
    const resinPacks = Math.ceil(area / 6.5);
    items.push({
      name: "Эпоксидная смола наливная 2К, 10 кг",
      spec: "Эпоксол EF-120 / Sika FloorCoat (компонент A+B)",
      unit: "компл.",
      qty: resinPacks,
      pricePerUnit: 6_400,
      total: resinPacks * 6_400,
      isConsumable: true,
    });
    // Финишный лак ПУ: ~0.2 кг/м², упаковка 5 кг = ~25 м²
    const lacquerPacks = Math.ceil(area / 25);
    items.push({
      name: "Финишный полиуретановый лак 2К, 5 кг",
      spec: "Uzin PE 480 / Bostik PU 2K",
      unit: "компл.",
      qty: lacquerPacks,
      pricePerUnit: 4_200,
      total: lacquerPacks * 4_200,
      isConsumable: true,
    });
    if (product?.id === "epoxy-flake" || product?.id === "epoxy-3d") {
      items.push({
        name: "Декоративные флоки / чипсы 0.5 кг",
        spec: "ColorFlakes Standart Mix",
        unit: "шт.",
        qty: Math.ceil(area / 8),
        pricePerUnit: 1_200,
        total: Math.ceil(area / 8) * 1_200,
        isConsumable: true,
      });
    }
    items.push({
      name: "Обезжириватель / растворитель, 1 л",
      spec: "подготовка основания",
      unit: "шт.",
      qty: Math.ceil(area / 20),
      pricePerUnit: 380,
      total: Math.ceil(area / 20) * 380,
      isConsumable: true,
    });
  } else if (bd.materialCost > 0) {
    items.push({
      name: "Клей для плинтуса / дюбели",
      spec: "крепёж и клей",
      unit: "компл.",
      qty: 1,
      pricePerUnit: Math.round(area * 25),
      total: Math.round(area * 25),
      isConsumable: true,
    });
    items.push({
      name: "Распорные клинья, крестики",
      spec: "для укладки с зазором",
      unit: "уп.",
      qty: Math.ceil(area / 10),
      pricePerUnit: 120,
      total: Math.ceil(area / 10) * 120,
      isConsumable: true,
    });
  }

  if (cfg.levelingIncluded && bd.levelingCost > 0) {
    const cementKg = Math.ceil(area * cfg.levelingThicknessMm * 1.8); // кг смеси
    items.push({
      name: "Наливной пол / нивелир. смесь",
      spec: `толщ. ${cfg.levelingThicknessMm} мм`,
      unit: "кг",
      qty: cementKg,
      pricePerUnit: Math.round(bd.levelingCost * 0.6 / cementKg),
      total: Math.round(bd.levelingCost * 0.6),
      isConsumable: true,
    });
    items.push({
      name: "Грунтовка бетоноконтакт",
      spec: "для стяжки",
      unit: "л",
      qty: Math.ceil(area * 0.15),
      pricePerUnit: 280,
      total: Math.ceil(area * 0.15) * 280,
      isConsumable: true,
    });
  }

  // ── РАБОТЫ ──────────────────────────────────────────────────────────────────
  if (product && bd.installCost > 0) {
    const workName = isEpoxy
      ? "Заливка эпоксидного пола (шлифовка + грунт + заливка + лак)"
      : `Укладка ${product.name.split(" ")[0].toLowerCase()}`;
    items.push({
      name: workName,
      spec: isEpoxy ? `${product.thickness} мм, включая подготовку основания` : (pattern ? `${pattern.name}, отход ${pattern.wastePct}%` : ""),
      unit: "м²",
      qty: area,
      pricePerUnit: Math.round(product.installPrice * rc),
      total: bd.installCost,
      isWork: true,
    });
  }

  if (cfg.skirtingIncluded && skirting && bd.skirtingCost > 0) {
    const skirtingWork = Math.round(perimeter * skirting.pricePerM * 0.45 * rc);
    items.push({
      name: "Монтаж плинтуса",
      unit: "м.п.",
      qty: perimeter,
      pricePerUnit: Math.round(skirting.pricePerM * 0.45 * rc),
      total: skirtingWork,
      isWork: true,
    });
  }

  if (cfg.demolitionIncluded && bd.demolitionCost > 0) {
    items.push({
      name: "Демонтаж напольного покрытия",
      unit: "м²",
      qty: area,
      pricePerUnit: Math.round(180 * rc),
      total: bd.demolitionCost,
      isWork: true,
    });
  }

  if (cfg.levelingIncluded && bd.levelingCost > 0) {
    items.push({
      name: "Устройство стяжки / выравнивание",
      spec: `${cfg.levelingThicknessMm} мм`,
      unit: "м²",
      qty: area,
      pricePerUnit: Math.round(bd.levelingCost * 0.4 / area),
      total: Math.round(bd.levelingCost * 0.4),
      isWork: true,
    });
  }

  return items;
}