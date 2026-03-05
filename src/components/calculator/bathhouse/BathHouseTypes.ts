export type WallMaterial = "timber_profiled" | "timber_glued" | "log_rounded" | "log_hand" | "brick" | "block_gas" | "block_foam" | "frame_osb" | "frame_sip" | "frame_metal";
export type FoundationType = "strip_shallow" | "strip_deep" | "piles_screw" | "piles_bored" | "slab" | "columnar";
export type RoofType = "flat_single" | "gable" | "hip" | "mansard";
export type InsulationMaterial = "mineral_wool" | "basalt_wool" | "ecowool" | "penoizol" | "foil_penofol" | "pir_panel";
export type WallFinishInterior = "linden" | "aspen" | "cedar" | "abash" | "thermo_aspen" | "spruce" | "pine" | "tile_ceramic" | "tile_porcelain" | "plaster_decor";
export type StoveType = "metal_sauna" | "metal_hakka" | "brick_classic" | "brick_heater" | "electric_sauna" | "electric_infrared" | "gas_sauna" | "steam_generator";
export type VentilationType = "natural_simple" | "natural_duct" | "forced_supply" | "forced_full" | "recuperator";
export type ShelfMaterial = "linden" | "aspen" | "cedar" | "abash" | "thermo_aspen";
export type FloorMaterial = "ceramic_tile" | "porcelain_tile" | "wood_larch" | "thermo_wood" | "concrete_screed" | "anti_slip_tile";
export type RoofingMaterial = "metal_tile" | "corrugated_sheet" | "soft_bitumen" | "ceramic_tile" | "ondulin" | "seam_roof";
export type BathStyle = "russian_classic" | "scandinavian" | "japanese" | "turkish_hamam" | "finnish_sauna" | "banya_sauna_hybrid" | "modern_minimalist" | "eco_natural";
export type BathLayout = "2room" | "3room" | "4room" | "house_bath";

export interface BathHouseConfig {
  id: string;
  // Основные параметры
  style: BathStyle;
  layout: BathLayout;
  totalArea: number;
  steamRoomArea: number;
  washRoomArea: number;
  restRoomArea: number;
  dressingRoomArea: number;
  // Стены
  wallMaterial: WallMaterial;
  wallHeight: number;
  // Фундамент
  foundation: FoundationType;
  // Крыша
  roofType: RoofType;
  roofingMaterial: RoofingMaterial;
  // Утепление
  insulation: InsulationMaterial;
  insulationThickness: number;
  // Отделка стен
  wallFinishSteam: WallFinishInterior;
  wallFinishWash: WallFinishInterior;
  wallFinishRest: WallFinishInterior;
  // Полок
  shelfMaterial: ShelfMaterial;
  shelfTiers: 1 | 2 | 3;
  shelfWidth: number;
  // Печь
  stoveType: StoveType;
  stoneMass: number;
  // Вентиляция
  ventilation: VentilationType;
  // Полы
  floorMaterial: FloorMaterial;
  underfloorHeating: boolean;
  // Доп. опции
  terrace: boolean;
  terraceArea: number;
  window_pvc: boolean;
  windowCount: number;
  chimney: boolean;
  tankVolume: number;
  electricalBasic: boolean;
  electricalFull: boolean;
  foremanIncluded: boolean;
  foremanPct: number;
  supplierIncluded: boolean;
  supplierPct: number;
  region: string;
  // Итог
  totalPrice: number;
}

export const DEFAULT_BATHHOUSE_CONFIG: BathHouseConfig = {
  id: "",
  style: "russian_classic",
  layout: "3room",
  totalArea: 24,
  steamRoomArea: 8,
  washRoomArea: 8,
  restRoomArea: 8,
  dressingRoomArea: 0,
  wallMaterial: "timber_profiled",
  wallHeight: 2.3,
  foundation: "piles_screw",
  roofType: "gable",
  roofingMaterial: "metal_tile",
  insulation: "basalt_wool",
  insulationThickness: 100,
  wallFinishSteam: "linden",
  wallFinishWash: "aspen",
  wallFinishRest: "pine",
  shelfMaterial: "linden",
  shelfTiers: 2,
  shelfWidth: 0.6,
  stoveType: "metal_sauna",
  stoneMass: 40,
  ventilation: "natural_duct",
  floorMaterial: "ceramic_tile",
  underfloorHeating: false,
  terrace: false,
  terraceArea: 0,
  window_pvc: true,
  windowCount: 3,
  chimney: true,
  tankVolume: 200,
  electricalBasic: true,
  electricalFull: false,
  foremanIncluded: false,
  foremanPct: 10,
  supplierIncluded: false,
  supplierPct: 5,
  region: "moscow",
  totalPrice: 0,
};

export const WALL_MATERIALS: Record<WallMaterial, { label: string; desc: string; pricePerM2: number; category: string }> = {
  timber_profiled:   { label: "Брус профилированный 150×150", desc: "Классика. Экологично, быстро, хорошая теплоёмкость", pricePerM2: 3850, category: "Дерево" },
  timber_glued:      { label: "Брус клеёный 150×150", desc: "Премиум. Не деформируется, не трескается, идеальная геометрия", pricePerM2: 8800, category: "Дерево" },
  log_rounded:       { label: "Бревно оцилиндрованное ∅200", desc: "Традиционный русский вид, хорошая теплоёмкость", pricePerM2: 4600, category: "Дерево" },
  log_hand:          { label: "Бревно ручной рубки ∅220+", desc: "Премиум-ручная работа, максимальная аутентичность", pricePerM2: 8500, category: "Дерево" },
  brick:             { label: "Кирпич полнотелый", desc: "Долговечно, не горит, требует мощного утепления", pricePerM2: 8200, category: "Камень" },
  block_gas:         { label: "Газобетонный блок D400", desc: "Лёгкий, тёплый, требует пароизоляции", pricePerM2: 4500, category: "Камень" },
  block_foam:        { label: "Пенобетонный блок D600", desc: "Доступно, но чуть хуже по теплу чем газобетон", pricePerM2: 3900, category: "Камень" },
  frame_osb:         { label: "Каркас + OSB + утепление", desc: "Быстро, доступно, хорошо утепляется", pricePerM2: 3800, category: "Каркас" },
  frame_sip:         { label: "Каркас + SIP-панели", desc: "Современно, отличная теплоизоляция, заводская точность", pricePerM2: 5800, category: "Каркас" },
  frame_metal:       { label: "ЛСТК (металлокаркас)", desc: "Долговечно, не горит, быстрый монтаж", pricePerM2: 6700, category: "Каркас" },
};

export const FOUNDATION_TYPES: Record<FoundationType, { label: string; desc: string; basePrice: number }> = {
  strip_shallow: { label: "Ленточный мелкозаглублённый", desc: "30–50 см, для лёгких строений, дренаж обязателен", basePrice: 140000 },
  strip_deep:    { label: "Ленточный заглублённый", desc: "Ниже глубины промерзания, надёжно для кирпича/блоков", basePrice: 225000 },
  piles_screw:   { label: "Сваи винтовые", desc: "Быстро, любой грунт, незаменим на склонах и воде", basePrice: 120000 },
  piles_bored:   { label: "Сваи буронабивные (ТИСЭ)", desc: "Надёжно на любом грунте, морозоустойчиво", basePrice: 165000 },
  slab:          { label: "Монолитная плита 200 мм", desc: "Самый надёжный вариант, подходит для слабых грунтов", basePrice: 325000 },
  columnar:      { label: "Столбчатый", desc: "Бюджетно для лёгких каркасных бань", basePrice: 70000 },
};

export const ROOF_TYPES: Record<RoofType, { label: string; desc: string; priceCoeff: number }> = {
  flat_single: { label: "Односкатная", desc: "Простая, дешёвая, современный вид", priceCoeff: 0.85 },
  gable:       { label: "Двускатная", desc: "Классика, чердак или мансарда, отличный снегосброс", priceCoeff: 1.0 },
  hip:         { label: "Вальмовая (4-скатная)", desc: "Устойчива к ветру, красивый вид со всех сторон", priceCoeff: 1.35 },
  mansard:     { label: "Мансардная", desc: "Доп. пространство под крышей, но сложнее в строительстве", priceCoeff: 1.55 },
};

export const ROOFING_MATERIALS: Record<RoofingMaterial, { label: string; pricePerM2: number }> = {
  metal_tile:        { label: "Металлочерепица", pricePerM2: 1450 },
  corrugated_sheet:  { label: "Профнастил", pricePerM2: 1050 },
  soft_bitumen:      { label: "Мягкая черепица (Шинглас)", pricePerM2: 1250 },
  ceramic_tile:      { label: "Керамическая черепица", pricePerM2: 3800 },
  ondulin:           { label: "Ондулин", pricePerM2: 680 },
  seam_roof:         { label: "Фальцевая кровля (металл)", pricePerM2: 1950 },
};

export const INSULATION_MATERIALS: Record<InsulationMaterial, { label: string; pricePerM3: number }> = {
  mineral_wool:  { label: "Минеральная вата (Rockwool, Knauf)", pricePerM3: 3800 },
  basalt_wool:   { label: "Базальтовая вата (ISOVER, ТехноНиколь)", pricePerM3: 4200 },
  ecowool:       { label: "Эковата (целлюлоза)", pricePerM3: 3200 },
  penoizol:      { label: "Пеноизол (жидкий пенопласт)", pricePerM3: 5000 },
  foil_penofol:  { label: "Пенофол фольгированный", pricePerM3: 6800 },
  pir_panel:     { label: "PIR-панели (современные)", pricePerM3: 68000 },
};

export const WALL_FINISHES: Record<WallFinishInterior, { label: string; pricePerM2: number; suitsSteam: boolean }> = {
  linden:         { label: "Вагонка липа", pricePerM2: 1600, suitsSteam: true },
  aspen:          { label: "Вагонка осина", pricePerM2: 1200, suitsSteam: true },
  cedar:          { label: "Вагонка кедр (сибирский)", pricePerM2: 3800, suitsSteam: true },
  abash:          { label: "Абаши (африканский дуб)", pricePerM2: 16000, suitsSteam: true },
  thermo_aspen:   { label: "Термоосина", pricePerM2: 4400, suitsSteam: true },
  spruce:         { label: "Вагонка ель", pricePerM2: 1050, suitsSteam: false },
  pine:           { label: "Вагонка сосна", pricePerM2: 950, suitsSteam: false },
  tile_ceramic:   { label: "Плитка керамическая", pricePerM2: 1600, suitsSteam: false },
  tile_porcelain: { label: "Керамогранит", pricePerM2: 2400, suitsSteam: false },
  plaster_decor:  { label: "Декоративная штукатурка", pricePerM2: 1500, suitsSteam: false },
};

export const STOVE_TYPES: Record<StoveType, { label: string; desc: string; price: number; power: string }> = {
  metal_sauna:      { label: "Металлическая дровяная (эконом)", desc: "Harvia, TMF, Термофор — надёжно и бюджетно", price: 58000, power: "12–18 кВт" },
  metal_hakka:      { label: "Финская металлическая (премиум)", desc: "Harvia Legend, Helo — медленный нагрев, мягкий пар", price: 108000, power: "20–36 кВт" },
  brick_classic:    { label: "Кирпичная классическая", desc: "Долго нагревается, долго держит тепло, аутентично", price: 195000, power: "до 30 кВт" },
  brick_heater:     { label: "Кирпичная с каменкой", desc: "Максимальная теплоёмкость, премиальный пар", price: 285000, power: "40–60 кВт" },
  electric_sauna:   { label: "Электрокаменка (сухая)", desc: "Быстрый нагрев 30 мин, никаких дров, точный контроль", price: 58000, power: "6–18 кВт" },
  electric_infrared:{ label: "ИК-кабина (инфракрасная)", desc: "Низкая температура, лечебный эффект, экономично", price: 138000, power: "2–4 кВт" },
  gas_sauna:        { label: "Газовая печь", desc: "Экономично при наличии газа, автоматика", price: 95000, power: "18–30 кВт" },
  steam_generator:  { label: "Парогенератор (хамам/паровая)", desc: "Для турецкой бани, влажность 100%, 40–50°C", price: 115000, power: "3–18 кВт" },
};

export const VENTILATION_TYPES: Record<VentilationType, { label: string; desc: string; price: number }> = {
  natural_simple: { label: "Естественная простая", desc: "Приточное и вытяжное отверстие — минимум", price: 11500 },
  natural_duct:   { label: "Естественная канальная", desc: "Каналы под полом и у потолка — правильно для парной", price: 25000 },
  forced_supply:  { label: "Принудительная приточная", desc: "Вентилятор на притоке, вытяжка естественная", price: 44000 },
  forced_full:    { label: "Принудительная полная", desc: "Приток + вытяжка с вентиляторами, таймер", price: 76000 },
  recuperator:    { label: "Рекуперация тепла (современная)", desc: "Сохраняет до 80% тепла при вентиляции", price: 132000 },
};

export const SHELF_MATERIALS: Record<ShelfMaterial, { label: string; pricePerM2: number }> = {
  linden:       { label: "Липа", pricePerM2: 2900 },
  aspen:        { label: "Осина", pricePerM2: 2300 },
  cedar:        { label: "Кедр", pricePerM2: 6500 },
  abash:        { label: "Абаши", pricePerM2: 5200 },
  thermo_aspen: { label: "Термоосина", pricePerM2: 4000 },
};

export const FLOOR_MATERIALS: Record<FloorMaterial, { label: string; pricePerM2: number }> = {
  ceramic_tile:   { label: "Керамическая плитка", pricePerM2: 1600 },
  porcelain_tile: { label: "Керамогранит anti-slip", pricePerM2: 2400 },
  wood_larch:     { label: "Доска лиственница (разборная)", pricePerM2: 2100 },
  thermo_wood:    { label: "Термодерево (скандинавский стиль)", pricePerM2: 5800 },
  concrete_screed:{ label: "Бетонная стяжка + слив", pricePerM2: 950 },
  anti_slip_tile: { label: "Нескользящая мозаика", pricePerM2: 3500 },
};

export const BATH_STYLES: Record<BathStyle, { label: string; desc: string; emoji: string }> = {
  russian_classic:     { label: "Русская баня", desc: "Дровяная печь, берёзовый веник, полок из липы, 60–90°C", emoji: "🪵" },
  scandinavian:        { label: "Скандинавская сауна", desc: "Сухой жар 90–110°C, ель/ольха, финская печь Harvia", emoji: "🇫🇮" },
  japanese:            { label: "Японская офуро", desc: "Деревянная кадка, хиноки-кипарис, температура 42–44°C", emoji: "🎋" },
  turkish_hamam:       { label: "Турецкий хамам", desc: "Мраморная отделка, пар 100%, 40–55°C, лежаки", emoji: "🕌" },
  finnish_sauna:       { label: "Финская сауна", desc: "Электрокаменка, сухой пар, стеклянная дверь", emoji: "🧖" },
  banya_sauna_hybrid:  { label: "Баня-сауна гибрид", desc: "Дровяная печь + режим сауны, универсально", emoji: "🔥" },
  modern_minimalist:   { label: "Современный минимализм", desc: "Бетон, дерево, стекло, скрытые коммуникации", emoji: "🏛" },
  eco_natural:         { label: "Эко / Натуральный", desc: "Необработанное дерево, мох-законопатка, максимальная природность", emoji: "🌿" },
};

export const BATH_LAYOUTS: Record<BathLayout, { label: string; desc: string; rooms: string[]; svgId: string }> = {
  "2room": { label: "2 помещения", desc: "Парная + мойка/предбанник", rooms: ["Парная", "Мойка+Предбанник"], svgId: "layout2" },
  "3room": { label: "3 помещения", desc: "Парная + мойка + комната отдыха", rooms: ["Парная", "Мойка", "Комната отдыха"], svgId: "layout3" },
  "4room": { label: "4 помещения", desc: "Парная + мойка + предбанник + КО", rooms: ["Парная", "Мойка", "Предбанник", "Комната отдыха"], svgId: "layout4" },
  "house_bath": { label: "Дом-баня", desc: "Баня + жилая мансарда/второй этаж", rooms: ["Парная", "Мойка", "КО", "Спальня"], svgId: "layoutHB" },
};

export const REGIONS: Record<string, { label: string; coeff: number }> = {
  moscow:       { label: "Москва и МО", coeff: 1.0 },
  spb:          { label: "Санкт-Петербург", coeff: 0.95 },
  ekaterinburg: { label: "Екатеринбург", coeff: 0.82 },
  novosibirsk:  { label: "Новосибирск", coeff: 0.78 },
  kazan:        { label: "Казань", coeff: 0.80 },
  krasnodar:    { label: "Краснодар", coeff: 0.88 },
  rostov:       { label: "Ростов-на-Дону", coeff: 0.83 },
  samara:       { label: "Самара", coeff: 0.79 },
  voronezh:     { label: "Воронеж", coeff: 0.76 },
  other:        { label: "Другой регион", coeff: 0.75 },
};