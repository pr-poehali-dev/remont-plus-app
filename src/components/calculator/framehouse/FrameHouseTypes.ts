// ─── Типы ──────────────────────────────────────────────────────────────────
export type FrameWallTech   = "frame_osb" | "frame_sip" | "frame_lsts";
export type FrameInsulation = "mineral_wool_150" | "mineral_wool_200" | "basalt_wool_200" | "ecowool_200" | "pir_panel_150";
export type FoundationType  = "piles_screw" | "strip_shallow" | "strip_deep" | "slab" | "columnar";
export type RoofType        = "gable" | "flat_single" | "hip" | "mansard" | "a_frame";
export type RoofingMaterial = "metal_tile" | "corrugated_sheet" | "soft_bitumen" | "seam_roof";
export type FacadeType      = "scandinavian_board" | "imitation_timber" | "osb_paint" | "fiber_cement" | "vinyl_siding" | "dspc";
export type FloorType       = "laminate" | "parquet_board" | "ceramic_tile" | "porcelain_tile" | "lvt" | "linoleum";
export type WindowType      = "pvc_double" | "pvc_triple" | "wood_euro";
export type HeatingType     = "none" | "electric_convectors" | "gas_boiler" | "heat_pump" | "pellet_boiler";
export type InteriorFinish  = "rough" | "pre_finish" | "turnkey_econom" | "turnkey_standard" | "turnkey_premium";
export type HouseStyle      = "modern" | "barnhouse" | "scandinavian" | "classic" | "eco_wood" | "hi_tech" | "a_frame";
export type HouseFloors     = 1 | 1.5 | 2;
export type HouseLayout     = "studio" | "1bed" | "2bed" | "3bed" | "4bed";

// ─── Справочники ────────────────────────────────────────────────────────────

export const HOUSE_STYLES: Record<HouseStyle, { label: string; emoji: string; desc: string }> = {
  modern:        { label: "Современный",     emoji: "🏠", desc: "Плоские линии, большие окна, минимализм" },
  barnhouse:     { label: "Барнхаус",        emoji: "🏚", desc: "Высокая двускатная крыша, чёрный фасад" },
  scandinavian:  { label: "Скандинавский",   emoji: "🌲", desc: "Белый фасад, дерево, уютный интерьер" },
  classic:       { label: "Классический",    emoji: "🏡", desc: "Симметрия, портик, традиционные формы" },
  eco_wood:      { label: "Эко / деревянный",emoji: "🌿", desc: "Натуральное дерево, вписан в природу" },
  hi_tech:       { label: "Hi-Tech",         emoji: "⚡", desc: "Стекло, металл, технологичный вид" },
  a_frame:       { label: "А-фрейм",         emoji: "🔺", desc: "Треугольный силуэт, крыша до земли, панорамные окна" },
};

export const HOUSE_LAYOUTS: Record<HouseLayout, { label: string; bedrooms: number; desc: string }> = {
  studio:  { label: "Студия / без спален",  bedrooms: 0, desc: "Кухня-гостиная, санузел" },
  "1bed":  { label: "1 спальня",            bedrooms: 1, desc: "Кухня, гостиная, 1 спальня, санузел" },
  "2bed":  { label: "2 спальни",            bedrooms: 2, desc: "Кухня, гостиная, 2 спальни, 1–2 санузла" },
  "3bed":  { label: "3 спальни",            bedrooms: 3, desc: "Кухня, гостиная, 3 спальни, 2 санузла" },
  "4bed":  { label: "4+ спальни",           bedrooms: 4, desc: "Кухня, гостиная, 4 спальни, 2 санузла" },
};

export const FRAME_WALL_TECHS: Record<FrameWallTech, { label: string; desc: string; pricePerM2: number }> = {
  frame_osb:  { label: "Каркас + OSB-3 (15мм)",         desc: "Классический каркас, доступно, проверено годами", pricePerM2: 4800 },
  frame_sip:  { label: "SIP-панели (OSB + пенополистирол)", desc: "Заводская точность, отличное утепление, быстрый монтаж", pricePerM2: 6800 },
  frame_lsts: { label: "ЛСТК (лёгкий металлокаркас)",   desc: "Долговечно, не горит, не гниёт, точные размеры", pricePerM2: 7800 },
};

export const FRAME_INSULATIONS: Record<FrameInsulation, { label: string; thickness: number; pricePerM2: number }> = {
  mineral_wool_150: { label: "Минвата 150 мм (Rockwool / Knauf)",  thickness: 150, pricePerM2: 580 },
  mineral_wool_200: { label: "Минвата 200 мм (Rockwool / Knauf)",  thickness: 200, pricePerM2: 760 },
  basalt_wool_200:  { label: "Базальтовая вата 200 мм (ТехноНиколь)", thickness: 200, pricePerM2: 840 },
  ecowool_200:      { label: "Эковата 200 мм (задувная)",           thickness: 200, pricePerM2: 640 },
  pir_panel_150:    { label: "PIR-панели 150 мм (премиум)",         thickness: 150, pricePerM2: 10500 },
};

export const FOUNDATION_TYPES: Record<FoundationType, { label: string; desc: string; basePrice: number }> = {
  piles_screw:  { label: "Сваи винтовые",                  desc: "Быстро, любой грунт, сезонность не важна, от 3 дней", basePrice: 115000 },
  strip_shallow:{ label: "Ленточный мелкозаглублённый",     desc: "30–50 см, хороший дренаж, популярно для каркасников", basePrice: 148000 },
  strip_deep:   { label: "Ленточный заглублённый",          desc: "Ниже глубины промерзания, для тяжёлых проектов", basePrice: 235000 },
  slab:         { label: "Монолитная плита 200 мм",         desc: "Самый надёжный, подходит для слабых грунтов", basePrice: 295000 },
  columnar:     { label: "Столбчатый",                      desc: "Бюджетно для лёгких строений, быстрый монтаж", basePrice: 72000 },
};

export const ROOF_TYPES: Record<RoofType, { label: string; desc: string; priceCoeff: number }> = {
  gable:       { label: "Двускатная",      desc: "Классика, чердак, отличный снегосброс", priceCoeff: 1.0 },
  flat_single: { label: "Односкатная",     desc: "Современный вид, дешевле, барнхаус стиль", priceCoeff: 0.82 },
  hip:         { label: "Вальмовая (4-скатная)", desc: "Устойчива к ветру, красивый вид со всех сторон", priceCoeff: 1.35 },
  mansard:     { label: "Мансардная",      desc: "Жилой этаж под крышей, увеличивает площадь", priceCoeff: 1.55 },
  a_frame:     { label: "А-фрейм",        desc: "Треугольный силуэт, крыша до земли, современный стиль", priceCoeff: 1.65 },
};

export const ROOFING_MATERIALS: Record<RoofingMaterial, { label: string; pricePerM2: number }> = {
  metal_tile:       { label: "Металлочерепица",             pricePerM2: 1450 },
  corrugated_sheet: { label: "Профнастил",                  pricePerM2: 1050 },
  soft_bitumen:     { label: "Мягкая черепица (Шинглас)",   pricePerM2: 1250 },
  seam_roof:        { label: "Фальцевая кровля (металл)",   pricePerM2: 1950 },
};

export const FACADE_TYPES: Record<FacadeType, { label: string; desc: string; pricePerM2: number }> = {
  scandinavian_board: { label: "Скандинавская доска",        desc: "Классика каркасника, долговечно, красиво", pricePerM2: 2500 },
  imitation_timber:   { label: "Имитация бруса",             desc: "Деревянный вид, доступно", pricePerM2: 1700 },
  osb_paint:          { label: "OSB + фасадная краска",      desc: "Бюджетно, современный минимализм", pricePerM2: 980 },
  fiber_cement:       { label: "Фиброцементные панели",      desc: "Премиум, не горит, 50 лет без обслуживания", pricePerM2: 4100 },
  vinyl_siding:       { label: "Виниловый сайдинг",          desc: "Доступно, не нужна покраска, большой выбор цветов", pricePerM2: 1150 },
  dspc:               { label: "ДСПК (доска из ДПК)",        desc: "Дерево-полимер, не гниёт, не трескается", pricePerM2: 3300 },
};

export const FLOOR_TYPES: Record<FloorType, { label: string; pricePerM2: number }> = {
  laminate:         { label: "Ламинат (33 класс)",           pricePerM2: 1800 },
  parquet_board:    { label: "Паркетная доска",              pricePerM2: 4800 },
  ceramic_tile:     { label: "Керамическая плитка",          pricePerM2: 1600 },
  porcelain_tile:   { label: "Керамогранит",                 pricePerM2: 2400 },
  lvt:              { label: "LVT (виниловая плитка)",       pricePerM2: 1950 },
  linoleum:         { label: "Линолеум коммерческий",        pricePerM2: 850 },
};

export const WINDOW_TYPES: Record<WindowType, { label: string; pricePerUnit: number }> = {
  pvc_double:  { label: "ПВХ двухкамерный (стандарт)",  pricePerUnit: 24000 },
  pvc_triple:  { label: "ПВХ трёхкамерный (тёплый)",    pricePerUnit: 34000 },
  wood_euro:   { label: "Деревянное евроокно",           pricePerUnit: 48000 },
};

export const HEATING_TYPES: Record<HeatingType, { label: string; desc: string; basePrice: number }> = {
  none:               { label: "Без отопления (разводка только)", desc: "Только разводка труб, оборудование заказчика", basePrice: 58000 },
  electric_convectors:{ label: "Электрические конвекторы",        desc: "Простой монтаж, зональный контроль, без трубопровода", basePrice: 110000 },
  gas_boiler:         { label: "Газовый котёл + радиаторы",       desc: "Самое дешёвое в эксплуатации, требует газа на участке", basePrice: 185000 },
  heat_pump:          { label: "Тепловой насос",                  desc: "Современно, COP 3–5, субсидии, тихо работает", basePrice: 420000 },
  pellet_boiler:      { label: "Пеллетный котёл",                 desc: "Автономно, экономно, нет газа — не проблема", basePrice: 255000 },
};

export const INTERIOR_FINISHES: Record<InteriorFinish, { label: string; desc: string; pricePerM2: number }> = {
  rough:            { label: "Черновая (без отделки)",      desc: "OSB или гипсокартон, без финишного слоя", pricePerM2: 0 },
  pre_finish:       { label: "Предчистовая (White Box)",    desc: "Штукатурка, стяжка, подготовка под отделку", pricePerM2: 4500 },
  turnkey_econom:   { label: "Под ключ — Эконом",           desc: "Ламинат, обои, плитка в с/у, базовый сантехника", pricePerM2: 8800 },
  turnkey_standard: { label: "Под ключ — Стандарт",         desc: "Паркетная доска, покраска, качественная плитка", pricePerM2: 14500 },
  turnkey_premium:  { label: "Под ключ — Премиум",          desc: "Дизайнерская отделка, паркет, премиум-материалы", pricePerM2: 24000 },
};

export const REGIONS: Record<string, { label: string; coeff: number }> = {
  moscow:        { label: "Москва и МО",      coeff: 1.00 },
  spb:           { label: "Санкт-Петербург",  coeff: 0.95 },
  ekaterinburg:  { label: "Екатеринбург",     coeff: 0.83 },
  novosibirsk:   { label: "Новосибирск",      coeff: 0.79 },
  kazan:         { label: "Казань",           coeff: 0.81 },
  krasnodar:     { label: "Краснодар",        coeff: 0.89 },
  rostov:        { label: "Ростов-на-Дону",   coeff: 0.84 },
  samara:        { label: "Самара",           coeff: 0.80 },
  voronezh:      { label: "Воронеж",          coeff: 0.77 },
  chelyabinsk:   { label: "Челябинск",        coeff: 0.80 },
  other:         { label: "Другой регион",    coeff: 0.76 },
};

// ─── Конфигурация ───────────────────────────────────────────────────────────

export interface FrameHouseConfig {
  id: string;
  style: HouseStyle;
  floors: HouseFloors;
  layout: HouseLayout;
  totalArea: number;
  wallHeight: number;
  // Стены
  wallTech: FrameWallTech;
  insulation: FrameInsulation;
  // Фундамент
  foundation: FoundationType;
  // Крыша
  roofType: RoofType;
  roofingMaterial: RoofingMaterial;
  // Фасад
  facade: FacadeType;
  // Полы
  floorType: FloorType;
  underfloorHeating: boolean;
  // Окна
  windowType: WindowType;
  windowCount: number;
  // Отопление
  heating: HeatingType;
  // Отделка
  interiorFinish: InteriorFinish;
  // Доп. опции
  terrace: boolean;
  terraceArea: number;
  garage: boolean;
  garageArea: number;
  electricalIncluded: boolean;
  plumbingIncluded: boolean;
  sewageIncluded: boolean;
  // Управление
  foremanIncluded: boolean;
  foremanPct: number;
  supplierIncluded: boolean;
  supplierPct: number;
  region: string;
  totalPrice: number;
}

export const DEFAULT_FRAMEHOUSE_CONFIG: FrameHouseConfig = {
  id: "",
  style: "scandinavian",
  floors: 1,
  layout: "2bed",
  totalArea: 80,
  wallHeight: 2.7,
  wallTech: "frame_osb",
  insulation: "mineral_wool_200",
  foundation: "piles_screw",
  roofType: "gable",
  roofingMaterial: "metal_tile",
  facade: "scandinavian_board",
  floorType: "laminate",
  underfloorHeating: false,
  windowType: "pvc_double",
  windowCount: 8,
  heating: "electric_convectors",
  interiorFinish: "pre_finish",
  terrace: true,
  terraceArea: 12,
  garage: false,
  garageArea: 0,
  electricalIncluded: true,
  plumbingIncluded: true,
  sewageIncluded: false,
  foremanIncluded: false,
  foremanPct: 10,
  supplierIncluded: false,
  supplierPct: 5,
  region: "samara",
  totalPrice: 0,
};