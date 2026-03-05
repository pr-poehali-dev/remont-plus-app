import type { FrameHouseConfig } from "./FrameHouseTypes";
import {
  FRAME_WALL_TECHS, FRAME_INSULATIONS, FOUNDATION_TYPES,
  ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES, FLOOR_TYPES,
  WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES, REGIONS,
} from "./FrameHouseTypes";
import type { FrameHouseBreakdown } from "./frameHousePricing";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

export function calcFrameHouseMaterials(
  cfg: FrameHouseConfig,
  bd: FrameHouseBreakdown,
  regionId: string,
): MaterialItem[] {
  const rc = REGIONS[regionId]?.coeff ?? 0.8;
  const area = Math.max(cfg.totalArea, 10);
  const floorFactor = cfg.floors === 1.5 ? 1.3 : cfg.floors;
  const side = Math.sqrt(area / floorFactor);
  const perimeter = side * 4;
  const wallFloors = cfg.roofType === "a_frame" ? 1 : (cfg.floors === 1.5 ? 1.5 : cfg.floors);
  const wallArea = perimeter * cfg.wallHeight * wallFloors;
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;
  const insulArea = wallArea + area * (cfg.floors === 2 ? 2 : cfg.floors === 1.5 ? 1.75 : 1.5);

  const frameTech = FRAME_WALL_TECHS[cfg.wallTech];
  const insulData = FRAME_INSULATIONS[cfg.insulation];
  const roofMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  const facadeData = FACADE_TYPES[cfg.facade];
  const floorData = FLOOR_TYPES[cfg.floorType];
  const winData = WINDOW_TYPES[cfg.windowType];
  const heatData = HEATING_TYPES[cfg.heating];
  const finishData = INTERIOR_FINISHES[cfg.interiorFinish];

  const items: MaterialItem[] = [];

  // === МАТЕРИАЛЫ ===

  // Фундамент (bd.foundation уже с rc)
  const foundData = FOUNDATION_TYPES[cfg.foundation];
  items.push({ name: foundData.label, spec: "под ключ", unit: "компл.", qty: 1, pricePerUnit: bd.foundation, total: bd.foundation });

  // Каркас стен (bd.frame уже с rc)
  if (cfg.wallTech === "frame_osb") {
    const boardVol = +(wallArea * 0.05).toFixed(2);
    const boardPriceM3 = Math.round(22900 * rc);
    const boardTotal = Math.round(boardVol * boardPriceM3);

    const floorBeamVol = +(area * 0.035).toFixed(2);
    const floorBeamTotal = Math.round(floorBeamVol * boardPriceM3);

    const osbSheets = Math.ceil(wallArea * 2 / 2.98);
    const osbTotal = Math.round(osbSheets * 1550 * rc);

    items.push({ name: "Доска обрезная 50×150мм", spec: "сосна 1 сорт, каркас стен", unit: "м³", qty: boardVol, pricePerUnit: boardPriceM3, total: boardTotal });
    items.push({ name: "OSB-3 плита 15мм", spec: "2440×1220, Kronospan/Egger", unit: "лист", qty: osbSheets, pricePerUnit: Math.round(1550 * rc), total: osbTotal });
    items.push({ name: "Доска 50×200мм", spec: "перекрытие, сосна", unit: "м³", qty: floorBeamVol, pricePerUnit: boardPriceM3, total: floorBeamTotal });

    const frameRest = bd.frame - boardTotal - osbTotal - floorBeamTotal;
    if (frameRest > 0) {
      items.push({ name: "Материалы каркаса (обвязка, стойки, уголки)", spec: "крепёж, доборные элементы", unit: "компл.", qty: 1, pricePerUnit: frameRest, total: frameRest });
    }
  } else if (cfg.wallTech === "frame_sip") {
    items.push({ name: "SIP-панель 224мм (OSB-3 + ПСБ-С25)", spec: "2500×1250, завод", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(bd.frame / wallArea), total: bd.frame });
    const sipFloor = Math.round(area * 6200 * rc);
    items.push({ name: "СИП-панель перекрытие 174мм", spec: "2500×1250", unit: "м²", qty: area, pricePerUnit: Math.round(6200 * rc), total: sipFloor });
  } else {
    items.push({ name: frameTech.label, unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(bd.frame / wallArea), total: bd.frame });
  }

  // Утепление (bd.insulation уже с rc)
  const insulThick = insulData.thickness;
  const insulVol = +(insulArea * insulThick / 1000).toFixed(2);
  items.push({ name: insulData.label, spec: `${insulThick}мм, плиты`, unit: "м³", qty: insulVol, pricePerUnit: Math.round(bd.insulation / insulVol), total: bd.insulation });

  // Кровля — стропила
  const roofBoardVol = +(roofArea * 0.042).toFixed(2);
  const roofBoardPrice = Math.round(22900 * rc);
  items.push({ name: "Доска обрезная 50×200мм", spec: "стропила, сосна 1 сорт", unit: "м³", qty: roofBoardVol, pricePerUnit: roofBoardPrice, total: Math.round(roofBoardVol * roofBoardPrice) });

  const latVol = +(roofArea * 0.018).toFixed(2);
  items.push({ name: "Доска 25×100мм", spec: "обрешётка кровли", unit: "м³", qty: latVol, pricePerUnit: roofBoardPrice, total: Math.round(latVol * roofBoardPrice) });

  items.push({ name: roofMat.label, spec: roofMat.label.includes("Металлочерепица") ? "МП Монтеррей, 0.5мм" : roofMat.label.includes("Профнастил") ? "С20, оц. 0.5мм" : roofMat.label.includes("Мягкая") ? "Шинглас Ранчо, 3D" : "", unit: "м²", qty: +roofArea.toFixed(1), pricePerUnit: Math.round(bd.roofing / roofArea), total: bd.roofing });

  // Фасад (bd.facade уже с rc)
  items.push({ name: facadeData.label, unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(bd.facade / wallArea), total: bd.facade });

  // Окна (bd.windows уже с rc)
  if (cfg.windowCount > 0) {
    items.push({ name: winData.label, spec: "с монтажом, откосы", unit: "шт.", qty: cfg.windowCount, pricePerUnit: Math.round(bd.windows / cfg.windowCount), total: bd.windows });
  }

  // Полы (bd.floor уже с rc)
  items.push({ name: floorData.label, spec: floorData.label.includes("Ламинат") ? "Quick-Step, 33 класс" : floorData.label.includes("Паркет") ? "15мм, дуб" : "", unit: "м²", qty: area, pricePerUnit: Math.round(bd.floor / area), total: bd.floor });

  if (bd.underfloorHeating > 0) {
    items.push({ name: "Тёплый пол водяной (коллектор+трубы)", spec: "PE-RT ∅16, шаг 150мм", unit: "м²", qty: area, pricePerUnit: Math.round(bd.underfloorHeating / area), total: bd.underfloorHeating });
  }

  // Отопление (bd.heating уже с rc)
  if (cfg.heating !== "none") {
    items.push({ name: heatData.label, spec: "под ключ", unit: "компл.", qty: 1, pricePerUnit: bd.heating, total: bd.heating });
  }

  // Электрика (bd.electrical уже с rc)
  if (cfg.electricalIncluded) {
    items.push({ name: "Кабель ВВГнг-LS 3×2,5мм²", spec: "розетки, свет", unit: "м.п.", qty: Math.round(area * 5), pricePerUnit: Math.round(95 * rc), total: Math.round(area * 5 * 95 * rc) });
    items.push({ name: "Щиток ABB/IEK + автоматы", spec: "16–32А, 8–16 позиций", unit: "компл.", qty: 1, pricePerUnit: Math.round(24000 * rc), total: Math.round(24000 * rc) });
  }

  // Водоснабжение (bd.plumbing уже с rc)
  if (cfg.plumbingIncluded) {
    items.push({ name: "Труба полипропилен ∅25мм", spec: "Valtec/Ekoplastik, ХВС+ГВС", unit: "м.п.", qty: Math.round(area * 1.8), pricePerUnit: Math.round(120 * rc), total: Math.round(area * 1.8 * 120 * rc) });
    items.push({ name: "Сантехника (смесители, унитаз, ванна)", spec: "Grohe/Iddis", unit: "компл.", qty: 1, pricePerUnit: Math.round(62000 * rc), total: Math.round(62000 * rc) });
  }

  // Канализация (bd.sewage уже с rc)
  if (cfg.sewageIncluded) {
    items.push({ name: "Септик энергонезависимый", spec: "Тритон / Росток, 2–4 чел.", unit: "шт.", qty: 1, pricePerUnit: Math.round(98000 * rc), total: Math.round(98000 * rc) });
    items.push({ name: "Труба канализационная ∅110мм", spec: "ПВХ серая, OSTENDORF", unit: "м.п.", qty: Math.round(area * 0.6), pricePerUnit: Math.round(340 * rc), total: Math.round(area * 0.6 * 340 * rc) });
  }

  // Внутренняя отделка (bd.interiorFinish уже с rc)
  if (finishData.pricePerM2 > 0) {
    items.push({ name: finishData.label, spec: "по всей площади дома", unit: "м²", qty: area, pricePerUnit: Math.round(bd.interiorFinish / area), total: bd.interiorFinish });
  }

  // Терраса (bd.terrace уже с rc)
  if (cfg.terrace && cfg.terraceArea > 0) {
    items.push({ name: "Терраса (материалы + монтаж)", spec: "доска ДПК, перила", unit: "м²", qty: cfg.terraceArea, pricePerUnit: Math.round(bd.terrace / cfg.terraceArea), total: bd.terrace });
  }

  // Гараж (bd.garage уже с rc)
  if (cfg.garage && cfg.garageArea > 0) {
    items.push({ name: "Гараж (каркас + сэндвич-панели)", spec: "секционные ворота", unit: "м²", qty: cfg.garageArea, pricePerUnit: Math.round(bd.garage / cfg.garageArea), total: bd.garage });
  }

  // === РАСХОДНИКИ ===
  const paroQty = +((wallArea + area) * 1.15).toFixed(1);
  items.push({ name: "Пароизоляция", spec: "ТЕХНОНИКОЛЬ Паробарьер СМ, 200мкм", unit: "м²", qty: paroQty, pricePerUnit: Math.round(58 * rc), total: Math.round(paroQty * 58 * rc), isConsumable: true });

  const windQty = +(roofArea * 1.1 + wallArea * 0.5).toFixed(1);
  items.push({ name: "Ветрозащитная мембрана", spec: "Изоспан A / Ютавек 115", unit: "м²", qty: windQty, pricePerUnit: Math.round(36 * rc), total: Math.round(windQty * 36 * rc), isConsumable: true });

  items.push({ name: "Крепёж (саморезы, гвозди, анкеры, уголки)", spec: "ГОСТ, оцинкованные", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 560 * rc), total: Math.round(area * 560 * rc), isConsumable: true });

  items.push({ name: "Монтажная пена, лента ПСУЛ, герметик", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 155 * rc), total: Math.round(area * 155 * rc), isConsumable: true });

  items.push({ name: "Антисептик для дерева (огне-биозащита)", spec: "Сенеж Огнебио / Неомид 530", unit: "л", qty: Math.round(area * 0.5), pricePerUnit: Math.round(390 * rc), total: Math.round(area * 0.5 * 390 * rc), isConsumable: true });

  // === РАБОТЫ === (bd.assembly уже с rc)
  const workTotal = bd.assembly;
  const ws = (v: number) => Math.round(workTotal * v);

  items.push({ name: "Устройство фундамента", unit: "компл.", qty: 1, pricePerUnit: ws(0.16), total: ws(0.16), isWork: true });
  items.push({ name: "Монтаж каркаса стен и перекрытий", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(ws(0.25) / wallArea), total: ws(0.25), isWork: true });
  items.push({ name: "Утепление + ветрозащита + пароизоляция", unit: "м²", qty: +insulArea.toFixed(1), pricePerUnit: Math.round(ws(0.14) / insulArea), total: ws(0.14), isWork: true });
  items.push({ name: "Монтаж кровли", unit: "м²", qty: +roofArea.toFixed(1), pricePerUnit: Math.round(ws(0.16) / roofArea), total: ws(0.16), isWork: true });
  items.push({ name: "Монтаж фасада и окон", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(ws(0.12) / wallArea), total: ws(0.12), isWork: true });
  items.push({ name: "Внутренняя отделка и полы", unit: "м²", qty: area, pricePerUnit: Math.round(ws(0.12) / area), total: ws(0.12), isWork: true });
  items.push({ name: "Инженерные системы (электрика, отопление, сантехника)", unit: "компл.", qty: 1, pricePerUnit: ws(0.05), total: ws(0.05), isWork: true });

  if (bd.foreman > 0) {
    items.push({ name: `Прораб — технический надзор (${cfg.foremanPct}%)`, spec: "% от работ+материалов", unit: "компл.", qty: 1, pricePerUnit: bd.foreman, total: bd.foreman, isWork: true });
  }
  if (bd.supplier > 0) {
    items.push({ name: `Снабженец — закупка и логистика (${cfg.supplierPct}%)`, spec: "% от материалов", unit: "компл.", qty: 1, pricePerUnit: bd.supplier, total: bd.supplier, isWork: true });
  }
  if (bd.markupAmount > 0) {
    const base = bd.subtotal - bd.markupAmount;
    const markupPctDisplay = base > 0 ? Math.round(bd.markupAmount / base * 100) : 0;
    items.push({ name: `Наценка (${markupPctDisplay}%)`, spec: "коммерческая маржа", unit: "компл.", qty: 1, pricePerUnit: bd.markupAmount, total: bd.markupAmount, isWork: true });
  }

  return items;
}