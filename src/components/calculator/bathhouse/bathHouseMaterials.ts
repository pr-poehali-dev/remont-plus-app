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
import type { BathHouseBreakdown } from "./bathHousePricing";
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

export function calcBathHouseMaterials(
  cfg: BathHouseConfig,
  bd: BathHouseBreakdown,
  regionId: string,
): MaterialItem[] {
  const rc = (REGIONS[regionId] ?? REGIONS["moscow"]).coeff;
  const area = Math.max(cfg.totalArea, 6);
  const perimeter = Math.sqrt(area) * 4;
  const wallArea = perimeter * cfg.wallHeight;
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;
  const steamWallArea = cfg.steamRoomArea * 4 * 0.8;
  const washWallArea = cfg.washRoomArea * 4 * 0.8;
  const restWallArea = (cfg.restRoomArea + cfg.dressingRoomArea) * 4 * 0.8;
  const shelfArea = cfg.steamRoomArea * 0.35 * cfg.shelfTiers * (cfg.shelfWidth / 0.6);
  const insulVol = (wallArea + area) * (cfg.insulationThickness / 1000);

  const wallMat = WALL_MATERIALS[cfg.wallMaterial];
  const roofMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  const insulMat = INSULATION_MATERIALS[cfg.insulation];
  const finSteam = WALL_FINISHES[cfg.wallFinishSteam];
  const finWash = WALL_FINISHES[cfg.wallFinishWash];
  const finRest = WALL_FINISHES[cfg.wallFinishRest];
  const floorMat = FLOOR_MATERIALS[cfg.floorMaterial];
  const stoveData = STOVE_TYPES[cfg.stoveType];
  const ventData = VENTILATION_TYPES[cfg.ventilation];
  const shelfMat = SHELF_MATERIALS[cfg.shelfMaterial];

  const items: MaterialItem[] = [];

  // --- МАТЕРИАЛЫ ---

  // Фундамент
  const foundData = FOUNDATION_TYPES[cfg.foundation];
  items.push({ name: foundData.label, spec: "под ключ", unit: "компл.", qty: 1, pricePerUnit: Math.round(bd.foundation * rc), total: Math.round(bd.foundation * rc) });

  // Стены
  if (cfg.wallMaterial.startsWith("timber") || cfg.wallMaterial.startsWith("log")) {
    const m3perM2 = cfg.wallMaterial === "timber_profiled" ? 0.15 : cfg.wallMaterial === "timber_glued" ? 0.15 : 0.22;
    const vol = +(wallArea * m3perM2).toFixed(2);
    const priceM3 = wallMat.pricePerM2 / m3perM2;
    items.push({ name: wallMat.label, spec: "ГОСТ 8486", unit: "м³", qty: vol, pricePerUnit: Math.round(priceM3 * rc), total: Math.round(vol * priceM3 * rc) });
  } else if (cfg.wallMaterial === "brick") {
    const qty = +(wallArea * 0.5).toFixed(1);
    items.push({ name: "Кирпич полнотелый M150", spec: "1NF, ГОСТ 530", unit: "тыс.шт.", qty, pricePerUnit: Math.round(23500 * rc), total: Math.round(qty * 23500 * rc) });
  } else if (cfg.wallMaterial === "block_gas") {
    const qty = +(wallArea * 0.3).toFixed(1);
    items.push({ name: "Газобетон D400", spec: "625×300×250, ГОСТ 31359", unit: "м³", qty, pricePerUnit: Math.round(6400 * rc), total: Math.round(qty * 6400 * rc) });
  } else if (cfg.wallMaterial === "block_foam") {
    const qty = +(wallArea * 0.3).toFixed(1);
    items.push({ name: "Пенобетон D600", spec: "600×300×200", unit: "м³", qty, pricePerUnit: Math.round(5100 * rc), total: Math.round(qty * 5100 * rc) });
  } else if (cfg.wallMaterial === "frame_osb") {
    const boardVol = +(wallArea * 0.045).toFixed(2);
    const boardPriceM3 = Math.round(22900 * rc);
    const boardTotal = Math.round(boardVol * boardPriceM3);
    items.push({ name: "Доска обрезная 50×150мм", spec: "сосна, 1 сорт, каркас стен", unit: "м³", qty: boardVol, pricePerUnit: boardPriceM3, total: boardTotal });
    const osbSheets = Math.ceil(wallArea / 2.88);
    const osbTotal = Math.round(osbSheets * 1350 * rc);
    items.push({ name: "OSB-3 плита 12мм", spec: "2440×1220, Kronospan", unit: "лист", qty: osbSheets, pricePerUnit: Math.round(1350 * rc), total: osbTotal });
    const frameRest = Math.round(bd.walls * rc) - boardTotal - osbTotal;
    if (frameRest > 0) {
      items.push({ name: "Материалы каркаса (обвязка, стойки, уголки)", spec: "крепёж, доборные элементы", unit: "компл.", qty: 1, pricePerUnit: frameRest, total: frameRest });
    }
  } else if (cfg.wallMaterial === "frame_sip") {
    items.push({ name: "SIP-панель 174мм", spec: "2500×1250, ПСБ-С25", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(5800 * rc), total: Math.round(wallArea * 5800 * rc) });
  } else {
    items.push({ name: wallMat.label, unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(wallMat.pricePerM2 * rc), total: Math.round(wallArea * wallMat.pricePerM2 * rc) });
  }

  // Кровля — стропила
  const boardRoofVol = +(roofArea * 0.04).toFixed(2);
  const boardRoofPrice = Math.round(22900 * rc);
  items.push({ name: "Доска обрезная 50×200мм", spec: "стропила, сосна 1 сорт", unit: "м³", qty: boardRoofVol, pricePerUnit: boardRoofPrice, total: Math.round(boardRoofVol * boardRoofPrice) });

  // Обрешётка
  const latVol = +(roofArea * 0.02).toFixed(2);
  const latPrice = Math.round(22900 * rc);
  items.push({ name: "Доска 25×100мм", spec: "обрешётка, сосна", unit: "м³", qty: latVol, pricePerUnit: latPrice, total: Math.round(latVol * latPrice) });

  // Кровельный материал
  const roofQty = +roofArea.toFixed(1);
  items.push({ name: roofMat.label, spec: roofMat.label.includes("Металлочерепица") ? "МП Монтеррей, 0.5мм" : roofMat.label.includes("Профнастил") ? "С8, оц. 0.45мм" : "", unit: "м²", qty: roofQty, pricePerUnit: Math.round(roofMat.pricePerM2 * rc), total: Math.round(roofQty * roofMat.pricePerM2 * rc) });

  // Утепление
  items.push({ name: insulMat.label, spec: `${cfg.insulationThickness}мм`, unit: "м³", qty: +insulVol.toFixed(2), pricePerUnit: Math.round(insulMat.pricePerM3 * rc), total: Math.round(insulVol * insulMat.pricePerM3 * rc) });

  // Отделка стен
  if (steamWallArea > 0) items.push({ name: `${finSteam.label} (парная)`, spec: "AB сорт, шип-паз", unit: "м²", qty: +steamWallArea.toFixed(1), pricePerUnit: Math.round(finSteam.pricePerM2 * rc), total: Math.round(steamWallArea * finSteam.pricePerM2 * rc) });
  if (washWallArea > 0) items.push({ name: `${finWash.label} (мойка)`, spec: "AB сорт", unit: "м²", qty: +washWallArea.toFixed(1), pricePerUnit: Math.round(finWash.pricePerM2 * rc), total: Math.round(washWallArea * finWash.pricePerM2 * rc) });
  if (restWallArea > 0) items.push({ name: `${finRest.label} (КО)`, spec: "AB сорт", unit: "м²", qty: +restWallArea.toFixed(1), pricePerUnit: Math.round(finRest.pricePerM2 * rc), total: Math.round(restWallArea * finRest.pricePerM2 * rc) });

  // Пол
  items.push({ name: floorMat.label, unit: "м²", qty: area, pricePerUnit: Math.round(floorMat.pricePerM2 * rc), total: Math.round(area * floorMat.pricePerM2 * rc) });
  if (cfg.underfloorHeating) items.push({ name: "Тёплый пол электрический", spec: "Теплолюкс, 150Вт/м²", unit: "м²", qty: area, pricePerUnit: Math.round(2900 * rc), total: Math.round(area * 2900 * rc) });

  // Печь
  items.push({ name: stoveData.label, spec: stoveData.power, unit: "шт.", qty: 1, pricePerUnit: Math.round(bd.stove * rc), total: Math.round(bd.stove * rc) });

  // Вентиляция
  items.push({ name: ventData.label, unit: "компл.", qty: 1, pricePerUnit: Math.round(bd.ventilation * rc), total: Math.round(bd.ventilation * rc) });

  // Полок
  if (shelfArea > 0) items.push({ name: `Полок из ${shelfMat.label.toLowerCase()}`, spec: `${cfg.shelfTiers} яруса, ш. ${cfg.shelfWidth}м`, unit: "м²", qty: +shelfArea.toFixed(1), pricePerUnit: Math.round(shelfMat.pricePerM2 * rc), total: Math.round(shelfArea * shelfMat.pricePerM2 * rc) });

  // Окна
  const winPrice = cfg.window_pvc ? 14500 : 24000;
  if (cfg.windowCount > 0) items.push({ name: cfg.window_pvc ? "Окно ПВХ 600×600мм" : "Окно деревянное 600×600мм", spec: cfg.window_pvc ? "двойной стеклопакет" : "со стеклопакетом", unit: "шт.", qty: cfg.windowCount, pricePerUnit: Math.round(winPrice * rc), total: Math.round(cfg.windowCount * winPrice * rc) });

  // Дымоход
  if (cfg.chimney) items.push({ name: "Дымоход сэндвич-труба ∅115", spec: "нерж./оц., 8 секций", unit: "компл.", qty: 1, pricePerUnit: Math.round(38500 * rc), total: Math.round(38500 * rc) });

  // Бак
  if (cfg.tankVolume > 0) items.push({ name: `Бак для воды ${cfg.tankVolume}л`, spec: "нержавеющая сталь", unit: "шт.", qty: 1, pricePerUnit: Math.round((12000 + cfg.tankVolume * 65) * rc), total: Math.round((12000 + cfg.tankVolume * 65) * rc) });

  // Терраса
  if (cfg.terrace && cfg.terraceArea > 0) items.push({ name: "Терраса (материалы + монтаж)", spec: "доска лиственница, перила", unit: "м²", qty: cfg.terraceArea, pricePerUnit: Math.round(6800 * rc), total: Math.round(cfg.terraceArea * 6800 * rc) });

  // Электрика
  if (bd.electrical > 0) items.push({ name: cfg.electricalFull ? "Электрика (полная)" : "Электрика (базовая)", spec: "кабель, автоматы, розетки", unit: "компл.", qty: 1, pricePerUnit: Math.round(bd.electrical * rc), total: Math.round(bd.electrical * rc) });

  // --- РАСХОДНИКИ ---
  const paroQty = +(wallArea * 1.15).toFixed(1);
  items.push({ name: "Пароизоляция", spec: "Ютафол Д 96, ТЕХНОНИКОЛЬ Паробарьер", unit: "м²", qty: paroQty, pricePerUnit: Math.round(52 * rc), total: Math.round(paroQty * 52 * rc), isConsumable: true });

  const windQty = +(roofArea * 1.1).toFixed(1);
  items.push({ name: "Ветрозащитная мембрана", spec: "Изоспан A, 1 слой", unit: "м²", qty: windQty, pricePerUnit: Math.round(32 * rc), total: Math.round(windQty * 32 * rc), isConsumable: true });

  items.push({ name: "Крепёж (саморезы, нагели, анкеры)", spec: "ГОСТ, оцинк.", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 420 * rc), total: Math.round(area * 420 * rc), isConsumable: true });

  const woodArea = wallArea + steamWallArea + washWallArea + restWallArea;
  const antisepticL = +(woodArea * 0.18).toFixed(0);
  items.push({ name: "Антисептик для бани", spec: "Тиккурила Валтти / Сенеж", unit: "л", qty: +antisepticL, pricePerUnit: Math.round(420 * rc), total: Math.round(+antisepticL * 420 * rc), isConsumable: true });

  items.push({ name: "Монтажная пена + герметик", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 110 * rc), total: Math.round(area * 110 * rc), isConsumable: true });

  // --- РАБОТЫ ---
  const workTotal = Math.round(bd.assembly * rc);
  const workShare = (v: number) => Math.round(workTotal * v);

  items.push({ name: "Устройство фундамента", unit: "компл.", qty: 1, pricePerUnit: workShare(0.18), total: workShare(0.18), isWork: true });
  items.push({ name: "Возведение коробки (стены)", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(workShare(0.22) / wallArea), total: workShare(0.22), isWork: true });
  items.push({ name: "Монтаж кровли", unit: "м²", qty: roofQty, pricePerUnit: Math.round(workShare(0.18) / roofQty), total: workShare(0.18), isWork: true });
  items.push({ name: "Утепление и пароизоляция", unit: "м²", qty: +((wallArea + area) * 1.1).toFixed(1), pricePerUnit: Math.round(workShare(0.12) / ((wallArea + area) * 1.1)), total: workShare(0.12), isWork: true });
  items.push({ name: "Внутренняя отделка (вагонка, пол)", unit: "м²", qty: area, pricePerUnit: Math.round(workShare(0.15) / area), total: workShare(0.15), isWork: true });
  items.push({ name: "Монтаж печи, дымохода, вентиляции", unit: "компл.", qty: 1, pricePerUnit: workShare(0.10), total: workShare(0.10), isWork: true });
  items.push({ name: "Прочие работы (двери, окна, сантехника)", unit: "компл.", qty: 1, pricePerUnit: workShare(0.05), total: workShare(0.05), isWork: true });

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