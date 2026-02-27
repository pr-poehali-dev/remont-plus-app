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
import type { MaterialItem } from "@/components/calculator/shared/MaterialsTable";

export function fmt(n: number): string {
  return Math.round(n).toLocaleString("ru-RU");
}

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

  // Подсказки
  stoveRecommendation: string;
  ventRecommendation: string;
  shelfRecommendation: string;
}

export function calcBathHousePrice(cfg: BathHouseConfig, regionId: string, markupPct = 0): BathHouseBreakdown {
  const region = REGIONS[regionId] ?? REGIONS["moscow"];
  const rc = region.coeff;

  const area = Math.max(cfg.totalArea, 6);
  const perimeter = Math.sqrt(area) * 4; // приблизительный периметр квадратной бани
  const wallArea = perimeter * cfg.wallHeight;

  // --- Фундамент ---
  const foundation = FOUNDATION_TYPES[cfg.foundation].basePrice * (1 + (area - 24) * 0.012);

  // --- Стены (коробка) ---
  const wallMat = WALL_MATERIALS[cfg.wallMaterial];
  const walls = wallArea * wallMat.pricePerM2;

  // --- Крыша (конструкция) ---
  const roofArea = area * 1.25 * ROOF_TYPES[cfg.roofType].priceCoeff;
  const roofStructure = roofArea * 1980; // стропила, обрешётка
  const roofingMat = ROOFING_MATERIALS[cfg.roofingMaterial];
  const roofing = roofArea * roofingMat.pricePerM2;

  // --- Утепление ---
  const insulationMat = INSULATION_MATERIALS[cfg.insulation];
  const insulationVolume = (wallArea + area) * (cfg.insulationThickness / 1000);
  const insulation = insulationVolume * insulationMat.pricePerM3;

  // --- Отделка стен ---
  const steamWallArea = cfg.steamRoomArea * 4 * 0.8; // стены парной
  const washWallArea = cfg.washRoomArea * 4 * 0.8;
  const restWallArea = (cfg.restRoomArea + cfg.dressingRoomArea) * 4 * 0.8;
  const wallFinishSteam = steamWallArea * WALL_FINISHES[cfg.wallFinishSteam].pricePerM2;
  const wallFinishWash = washWallArea * WALL_FINISHES[cfg.wallFinishWash].pricePerM2;
  const wallFinishRest = restWallArea * WALL_FINISHES[cfg.wallFinishRest].pricePerM2;

  // --- Полы ---
  const floorMat = FLOOR_MATERIALS[cfg.floorMaterial];
  const floor = area * floorMat.pricePerM2 + (cfg.underfloorHeating ? area * 2420 : 0);

  // --- Печь ---
  const stoveData = STOVE_TYPES[cfg.stoveType];
  const stove = stoveData.price;

  // --- Вентиляция ---
  const ventData = VENTILATION_TYPES[cfg.ventilation];
  const ventilation = ventData.price + area * 198;

  // --- Полок ---
  const shelfMat = SHELF_MATERIALS[cfg.shelfMaterial];
  const shelfArea = cfg.steamRoomArea * 0.35 * cfg.shelfTiers * (cfg.shelfWidth / 0.6);
  const shelves = shelfArea * shelfMat.pricePerM2;

  // --- Окна ---
  const windowsBase = cfg.window_pvc ? 9350 : 15400; // ПВХ или деревянный
  const windows = cfg.windowCount * windowsBase;

  // --- Дымоход ---
  const chimney = cfg.chimney ? 30800 : 0;

  // --- Бак для воды ---
  const tank = cfg.tankVolume > 0 ? 9350 + cfg.tankVolume * 50 : 0;

  // --- Терраса ---
  const terrace = cfg.terrace ? cfg.terraceArea * 5280 : 0;

  // --- Электрика ---
  const electrical = cfg.electricalFull ? area * 1980 + 24200 : cfg.electricalBasic ? area * 935 + 13200 : 0;

  // --- Монтаж (работа) ---
  const materialSum = foundation + walls + roofStructure + roofing + insulation + wallFinishSteam + wallFinishWash + wallFinishRest + floor + stove + ventilation + shelves + windows + chimney + tank + terrace + electrical;
  const assembly = materialSum * 0.42; // 42% монтажные работы

  // База для расчёта вознаграждений (с учётом региона)
  const materialsWithRegion = materialSum * rc;       // закупаемые материалы
  const worksSubtotal = (materialSum + assembly) * rc; // материалы + работа

  // Прораб: % от всей суммы (работы + материалы)
  const foreman = cfg.foremanIncluded
    ? Math.round(worksSubtotal * (cfg.foremanPct || 10) / 100)
    : 0;

  // Снабженец: % от суммы закупаемых материалов
  const supplier = cfg.supplierIncluded
    ? Math.round(materialsWithRegion * (cfg.supplierPct || 5) / 100)
    : 0;

  const subtotal = worksSubtotal + foreman + supplier;
  const markupAmount = subtotal * (markupPct / 100);
  const total = subtotal + markupAmount;

  // Рекомендации
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
    assembly, materialsBase: Math.round(materialsWithRegion), foreman, supplier, regionCoeff: rc, markupAmount, subtotal, total,
    stoveRecommendation, ventRecommendation, shelfRecommendation,
  };
}

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

  // Стены (с разбивкой по типу)
  if (cfg.wallMaterial.startsWith("timber") || cfg.wallMaterial.startsWith("log")) {
    const m3perM2 = cfg.wallMaterial === "timber_profiled" ? 0.15 : cfg.wallMaterial === "timber_glued" ? 0.15 : 0.22;
    const vol = +(wallArea * m3perM2).toFixed(2);
    const priceM3 = wallMat.pricePerM2 / m3perM2;
    items.push({ name: wallMat.label, spec: "ГОСТ 8486", unit: "м³", qty: vol, pricePerUnit: Math.round(priceM3 * rc), total: Math.round(vol * priceM3 * rc) });
  } else if (cfg.wallMaterial === "brick") {
    const qty = +(wallArea * 0.5).toFixed(1);
    items.push({ name: "Кирпич полнотелый M150", spec: "1NF, ГОСТ 530", unit: "тыс.шт.", qty: qty, pricePerUnit: Math.round(19800 * rc), total: Math.round(qty * 19800 * rc) });
  } else if (cfg.wallMaterial === "block_gas") {
    const qty = +(wallArea * 0.3).toFixed(1);
    items.push({ name: "Газобетон D400", spec: "625×300×250, ГОСТ 31359", unit: "м³", qty: qty, pricePerUnit: Math.round(5200 * rc), total: Math.round(qty * 5200 * rc) });
  } else if (cfg.wallMaterial === "block_foam") {
    const qty = +(wallArea * 0.3).toFixed(1);
    items.push({ name: "Пенобетон D600", spec: "600×300×200", unit: "м³", qty: qty, pricePerUnit: Math.round(4400 * rc), total: Math.round(qty * 4400 * rc) });
  } else if (cfg.wallMaterial === "frame_osb") {
    const boardVol = +(wallArea * 0.045).toFixed(2);
    items.push({ name: "Доска обрезная 50×150мм", spec: "сосна, 1 сорт", unit: "м³", qty: boardVol, pricePerUnit: Math.round(16500 * rc), total: Math.round(boardVol * 16500 * rc) });
    const osbSheets = Math.ceil(wallArea / 2.88);
    items.push({ name: "OSB-3 плита 12мм", spec: "2440×1220, Kronospan", unit: "лист", qty: osbSheets, pricePerUnit: Math.round(950 * rc), total: Math.round(osbSheets * 950 * rc) });
  } else if (cfg.wallMaterial === "frame_sip") {
    items.push({ name: "SIP-панель 174мм", spec: "2500×1250, ПСБ-С25", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(4950 * rc), total: Math.round(wallArea * 4950 * rc) });
  } else {
    items.push({ name: wallMat.label, unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(wallMat.pricePerM2 * rc), total: Math.round(wallArea * wallMat.pricePerM2 * rc) });
  }

  // Кровля — стропила
  const boardRoofVol = +(roofArea * 0.04).toFixed(2);
  items.push({ name: "Доска обрезная 50×200мм", spec: "стропила, сосна 1 сорт", unit: "м³", qty: boardRoofVol, pricePerUnit: Math.round(18000 * rc), total: Math.round(boardRoofVol * 18000 * rc) });

  // Обрешётка
  const latVol = +(roofArea * 0.02).toFixed(2);
  items.push({ name: "Доска 25×100мм", spec: "обрешётка, сосна", unit: "м³", qty: latVol, pricePerUnit: Math.round(14000 * rc), total: Math.round(latVol * 14000 * rc) });

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
  if (cfg.underfloorHeating) items.push({ name: "Тёплый пол электрический", spec: "Теплолюкс, 150Вт/м²", unit: "м²", qty: area, pricePerUnit: Math.round(2420 * rc), total: Math.round(area * 2420 * rc) });

  // Печь
  items.push({ name: stoveData.label, spec: stoveData.power, unit: "шт.", qty: 1, pricePerUnit: Math.round(stoveData.price * rc), total: Math.round(stoveData.price * rc) });

  // Вентиляция
  items.push({ name: ventData.label, unit: "компл.", qty: 1, pricePerUnit: Math.round(ventData.price * rc), total: Math.round(ventData.price * rc) });

  // Полок
  if (shelfArea > 0) items.push({ name: `Полок из ${shelfMat.label.toLowerCase()}`, spec: `${cfg.shelfTiers} яруса, ш. ${cfg.shelfWidth}м`, unit: "м²", qty: +shelfArea.toFixed(1), pricePerUnit: Math.round(shelfMat.pricePerM2 * rc), total: Math.round(shelfArea * shelfMat.pricePerM2 * rc) });

  // Окна
  const winPrice = cfg.window_pvc ? 9350 : 15400;
  if (cfg.windowCount > 0) items.push({ name: cfg.window_pvc ? "Окно ПВХ 600×600мм" : "Окно деревянное 600×600мм", spec: cfg.window_pvc ? "двойной стеклопакет" : "со стеклопакетом", unit: "шт.", qty: cfg.windowCount, pricePerUnit: Math.round(winPrice * rc), total: Math.round(cfg.windowCount * winPrice * rc) });

  // Дымоход
  if (cfg.chimney) items.push({ name: "Дымоход сэндвич-труба ∅115", spec: "нерж./оц., 8 секций", unit: "компл.", qty: 1, pricePerUnit: Math.round(30800 * rc), total: Math.round(30800 * rc) });

  // Бак
  if (cfg.tankVolume > 0) items.push({ name: `Бак для воды ${cfg.tankVolume}л`, spec: "нержавеющая сталь", unit: "шт.", qty: 1, pricePerUnit: Math.round((9350 + cfg.tankVolume * 50) * rc), total: Math.round((9350 + cfg.tankVolume * 50) * rc) });

  // Терраса
  if (cfg.terrace && cfg.terraceArea > 0) items.push({ name: "Терраса (материалы + монтаж)", spec: "доска лиственница, перила", unit: "м²", qty: cfg.terraceArea, pricePerUnit: Math.round(5280 * rc), total: Math.round(cfg.terraceArea * 5280 * rc) });

  // --- РАСХОДНИКИ ---
  // Пароизоляция
  const paroQty = +(wallArea * 1.15).toFixed(1);
  items.push({ name: "Пароизоляция", spec: "Ютафол Д 96, ТЕХНОНИКОЛЬ Паробарьер", unit: "м²", qty: paroQty, pricePerUnit: Math.round(38 * rc), total: Math.round(paroQty * 38 * rc), isConsumable: true });

  // Ветрозащита
  const windQty = +(roofArea * 1.1).toFixed(1);
  items.push({ name: "Ветрозащитная мембрана", spec: "Изоспан A, 1 слой", unit: "м²", qty: windQty, pricePerUnit: Math.round(22 * rc), total: Math.round(windQty * 22 * rc), isConsumable: true });

  // Крепёж и нагели
  items.push({ name: "Крепёж (саморезы, нагели, анкеры)", spec: "ГОСТ, оцинк.", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 350 * rc), total: Math.round(area * 350 * rc), isConsumable: true });

  // Антисептик
  const woodArea = wallArea + steamWallArea + washWallArea + restWallArea;
  const antisepticL = +(woodArea * 0.18).toFixed(0);
  items.push({ name: "Антисептик для бани", spec: "Тиккурила Валтти / Сенеж", unit: "л", qty: +antisepticL, pricePerUnit: Math.round(320 * rc), total: Math.round(+antisepticL * 320 * rc), isConsumable: true });

  // Монтажная пена и герметик
  items.push({ name: "Монтажная пена + герметик", unit: "компл.", qty: 1, pricePerUnit: Math.round(area * 80 * rc), total: Math.round(area * 80 * rc), isConsumable: true });

  // --- РАБОТЫ ---
  const workTotal = bd.assembly;
  const workShare = (v: number) => Math.round(workTotal * v);

  items.push({ name: "Устройство фундамента", unit: "компл.", qty: 1, pricePerUnit: workShare(0.18), total: workShare(0.18), isWork: true });
  items.push({ name: "Возведение коробки (стены)", unit: "м²", qty: +wallArea.toFixed(1), pricePerUnit: Math.round(workShare(0.22) / wallArea), total: workShare(0.22), isWork: true });
  items.push({ name: "Монтаж кровли", unit: "м²", qty: roofQty, pricePerUnit: Math.round(workShare(0.18) / roofQty), total: workShare(0.18), isWork: true });
  items.push({ name: "Утепление и пароизоляция", unit: "м²", qty: +((wallArea + area) * 1.1).toFixed(1), pricePerUnit: Math.round(workShare(0.12) / ((wallArea + area) * 1.1)), total: workShare(0.12), isWork: true });
  items.push({ name: "Внутренняя отделка (вагонка, пол)", unit: "м²", qty: area, pricePerUnit: Math.round(workShare(0.15) / area), total: workShare(0.15), isWork: true });
  items.push({ name: "Монтаж печи, дымохода, вентиляции", unit: "компл.", qty: 1, pricePerUnit: workShare(0.10), total: workShare(0.10), isWork: true });
  items.push({ name: "Прочие работы (двери, окна, сантехника)", unit: "компл.", qty: 1, pricePerUnit: workShare(0.05), total: workShare(0.05), isWork: true });

  return items;
}