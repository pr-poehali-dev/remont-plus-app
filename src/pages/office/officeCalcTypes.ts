// ─── TYPES ────────────────────────────────────────────────────────────────────

export type RoomType = "office" | "warehouse" | "retail" | "restaurant" | "medical" | "production";
export type FinishLevel = "economy" | "standard" | "premium" | "luxury";
export type HeatingType = "none" | "radiator" | "underfloor" | "vrf" | "fancoil";
export type VentType = "none" | "supply_exhaust" | "hvac" | "split" | "precision";
export type AlarmType = "none" | "basic" | "gsm" | "smart" | "perimeter";
export type FireProtectionType = "none" | "signaling" | "sprinkler" | "gas" | "powder";
export type MetalFireProofType = "none" | "R15" | "R30" | "R45" | "R60" | "R90" | "R120";
export type WoodFireProofType = "none" | "group1" | "group2" | "group3";
export type NetworkType = "none" | "basic_lan" | "structured" | "enterprise";
export type AccessType = "none" | "card" | "biometric" | "multi_zone";
export type CCTVType = "none" | "basic" | "ip_hd" | "ip_4k" | "analytics";
export type FlooringType = "none" | "linoleum" | "carpet" | "porcelain" | "epoxy" | "raised_floor";
export type CeilingType = "none" | "armstrong" | "stretch" | "gypsum" | "grillato" | "exposed";
export type PartitionType = "none" | "gypsum" | "glass" | "glass_full" | "mobile";
export type MaterialsSupply = "labor_only" | "customer" | "contractor_basic" | "contractor_full" | "turnkey";
export type DocType = "none" | "sketch" | "working" | "bim";
export type DocEstimate = "none" | "local" | "full" | "expertize";
export type DocPermit = "none" | "notice" | "permit" | "full_approval";

// Блок-флаги — включает/выключает целый раздел из расчёта
export interface ZoneBlocks {
  blockFinish: boolean;
  blockFlooring: boolean;
  blockCeiling: boolean;
  blockPartitions: boolean;
  blockHeating: boolean;
  blockVentilation: boolean;
  blockElectric: boolean;
  blockNetwork: boolean;
  blockAlarm: boolean;
  blockCCTV: boolean;
  blockAccess: boolean;
  blockFire: boolean;
  blockMaterials: boolean;
  blockDocs: boolean;
  blockStaff: boolean;
}

export interface ZoneConfig extends ZoneBlocks {
  id: string;
  name: string;
  roomType: RoomType;
  area: number;
  height: number;
  finishLevel: FinishLevel;
  flooring: FlooringType;
  ceiling: CeilingType;
  partitions: PartitionType;
  partitionLinearM: number;
  heating: HeatingType;
  ventilation: VentType;
  airConditioners: number;
  electricPoints: number;
  lighting: boolean;
  ups: boolean;
  networkType: NetworkType;
  alarmType: AlarmType;
  alarmSensors: number;
  cctvType: CCTVType;
  cctvCameras: number;
  accessType: AccessType;
  accessDoors: number;
  fireSignaling: boolean;
  fireSensors: number;
  fireExtinguishers: number;
  fireProtection: FireProtectionType;
  fireSprinklerHeads: number;
  metalFireProof: MetalFireProofType;
  metalFireProofM2: number;
  woodFireProof: WoodFireProofType;
  woodFireProofM2: number;
  fireDoors: number;
  fireHydrantCheck: boolean;
  fireHydrantCount: number;
  // Материалы
  materialsSupply: MaterialsSupply;
  materialsCoeffCustom: number;
  // Персонал (прораб, снабженец)
  foremanPct: number;
  supplyPct: number;
  // Документы
  docProject: DocType;
  docEstimate: DocEstimate;
  docPermit: DocPermit;
  docAsBuilt: boolean;
  docSro: boolean;
  docFireAudit: boolean;
  docEnergyCert: boolean;
  totalPrice: number;
}

// ─── СПРАВОЧНИКИ ──────────────────────────────────────────────────────────────

export const ROOM_TYPES: { id: RoomType; label: string; icon: string; coeff: number }[] = [
  { id: "office", label: "Офис", icon: "Briefcase", coeff: 1.0 },
  { id: "warehouse", label: "Склад", icon: "Warehouse", coeff: 0.75 },
  { id: "retail", label: "Торговый зал", icon: "ShoppingBag", coeff: 1.1 },
  { id: "restaurant", label: "Ресторан/кафе", icon: "UtensilsCrossed", coeff: 1.25 },
  { id: "medical", label: "Медицинский", icon: "Stethoscope", coeff: 1.4 },
  { id: "production", label: "Производство", icon: "Factory", coeff: 0.85 },
];

export const FINISH_LEVELS: { id: FinishLevel; label: string; pricePerM2: number }[] = [
  { id: "economy", label: "Эконом", pricePerM2: 3500 },
  { id: "standard", label: "Стандарт", pricePerM2: 6500 },
  { id: "premium", label: "Премиум", pricePerM2: 12000 },
  { id: "luxury", label: "Люкс", pricePerM2: 22000 },
];

export const FLOORING_OPTIONS: { id: FlooringType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без полов", pricePerM2: 0 },
  { id: "linoleum", label: "Линолеум коммерческий", pricePerM2: 850 },
  { id: "carpet", label: "Ковролин", pricePerM2: 1100 },
  { id: "porcelain", label: "Керамогранит", pricePerM2: 2400 },
  { id: "epoxy", label: "Наливной эпоксидный пол", pricePerM2: 3200 },
  { id: "raised_floor", label: "Фальш-пол (raised floor)", pricePerM2: 5500 },
];

export const CEILING_OPTIONS: { id: CeilingType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без потолка", pricePerM2: 0 },
  { id: "armstrong", label: "Армстронг (подвесной)", pricePerM2: 1200 },
  { id: "stretch", label: "Натяжной потолок", pricePerM2: 1800 },
  { id: "gypsum", label: "ГКЛ (гипсокартон)", pricePerM2: 2100 },
  { id: "grillato", label: "Грильято (решётчатый)", pricePerM2: 2800 },
  { id: "exposed", label: "Открытый (без отделки)", pricePerM2: 400 },
];

export const PARTITION_OPTIONS: { id: PartitionType; label: string; pricePerLM: number }[] = [
  { id: "none", label: "Без перегородок", pricePerLM: 0 },
  { id: "gypsum", label: "Гипсокартон", pricePerLM: 4500 },
  { id: "glass", label: "Стеклянная (рамочная)", pricePerLM: 18000 },
  { id: "glass_full", label: "Стеклянная (цельная)", pricePerLM: 28000 },
  { id: "mobile", label: "Мобильная (складная)", pricePerLM: 35000 },
];

export const HEATING_OPTIONS: { id: HeatingType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без отопления", pricePerM2: 0 },
  { id: "radiator", label: "Радиаторное", pricePerM2: 1800 },
  { id: "underfloor", label: "Тёплый пол электрический", pricePerM2: 2500 },
  { id: "fancoil", label: "Фанкойлы (2-трубные)", pricePerM2: 4200 },
  { id: "vrf", label: "VRF/VRV-система", pricePerM2: 7500 },
];

export const VENT_OPTIONS: { id: VentType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без вентиляции", pricePerM2: 0 },
  { id: "supply_exhaust", label: "Приточно-вытяжная", pricePerM2: 2200 },
  { id: "hvac", label: "Центральный кондиционер (HVAC)", pricePerM2: 4800 },
  { id: "split", label: "Сплит-системы", pricePerM2: 1600 },
  { id: "precision", label: "Прецизионное кондиционирование", pricePerM2: 9500 },
];

export const ALARM_OPTIONS: { id: AlarmType; label: string; priceBase: number }[] = [
  { id: "none", label: "Без сигнализации", priceBase: 0 },
  { id: "basic", label: "Базовая охранная", priceBase: 25000 },
  { id: "gsm", label: "GSM-сигнализация", priceBase: 45000 },
  { id: "smart", label: "Smart (с приложением)", priceBase: 75000 },
  { id: "perimeter", label: "Периметровая охрана", priceBase: 120000 },
];

export const CCTV_OPTIONS: { id: CCTVType; label: string; pricePerCamera: number; dvr: number }[] = [
  { id: "none", label: "Без видеонаблюдения", pricePerCamera: 0, dvr: 0 },
  { id: "basic", label: "Аналоговое (AHD)", pricePerCamera: 5500, dvr: 15000 },
  { id: "ip_hd", label: "IP-камеры HD (2 Мп)", pricePerCamera: 9000, dvr: 25000 },
  { id: "ip_4k", label: "IP-камеры 4K (8 Мп)", pricePerCamera: 18000, dvr: 45000 },
  { id: "analytics", label: "IP + видеоаналитика", pricePerCamera: 28000, dvr: 65000 },
];

export const ACCESS_OPTIONS: { id: AccessType; label: string; pricePerDoor: number; panel: number }[] = [
  { id: "none", label: "Без СКУД", pricePerDoor: 0, panel: 0 },
  { id: "card", label: "Карточный доступ (RFID)", pricePerDoor: 18000, panel: 35000 },
  { id: "biometric", label: "Биометрический (отпечаток)", pricePerDoor: 35000, panel: 45000 },
  { id: "multi_zone", label: "Многозонный + интеграция", pricePerDoor: 55000, panel: 80000 },
];

export const FIRE_PROTECTION_OPTIONS: { id: FireProtectionType; label: string; pricePerHead: number; base: number }[] = [
  { id: "none", label: "Без пожаротушения", pricePerHead: 0, base: 0 },
  { id: "signaling", label: "Только сигнализация", pricePerHead: 0, base: 55000 },
  { id: "sprinkler", label: "Водяное спринклерное", pricePerHead: 4500, base: 80000 },
  { id: "gas", label: "Газовое пожаротушение", pricePerHead: 12000, base: 150000 },
  { id: "powder", label: "Порошковое (склады)", pricePerHead: 8000, base: 90000 },
];

export const METAL_FIREPROOF_OPTIONS: { id: MetalFireProofType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без огнезащиты металла", pricePerM2: 0 },
  { id: "R15", label: "R15 — 15 минут (покрытие)", pricePerM2: 280 },
  { id: "R30", label: "R30 — 30 минут", pricePerM2: 420 },
  { id: "R45", label: "R45 — 45 минут", pricePerM2: 620 },
  { id: "R60", label: "R60 — 60 минут (ГОСТ)", pricePerM2: 850 },
  { id: "R90", label: "R90 — 90 минут", pricePerM2: 1200 },
  { id: "R120", label: "R120 — 120 минут (max)", pricePerM2: 1700 },
];

export const WOOD_FIREPROOF_OPTIONS: { id: WoodFireProofType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без огнезащиты дерева", pricePerM2: 0 },
  { id: "group1", label: "I группа — огнезащищённые (трудносгораемые)", pricePerM2: 380 },
  { id: "group2", label: "II группа — трудновоспламеняемые", pricePerM2: 220 },
  { id: "group3", label: "III группа — трудновоспламеняемая обработка", pricePerM2: 140 },
];

export const NETWORK_OPTIONS: { id: NetworkType; label: string; pricePerM2: number }[] = [
  { id: "none", label: "Без СКС", pricePerM2: 0 },
  { id: "basic_lan", label: "Базовая сеть (Cat5e)", pricePerM2: 800 },
  { id: "structured", label: "СКС Cat6a + патч-панели", pricePerM2: 1600 },
  { id: "enterprise", label: "Enterprise (Cat7 + WiFi 6)", pricePerM2: 3200 },
];

export const REGIONS: { id: string; label: string; coeff: number; group: string }[] = [
  // ЦФО
  { id: "moscow",      label: "Москва и МО",          coeff: 1.00, group: "ЦФО" },
  { id: "voronezh",   label: "Воронеж",               coeff: 0.78, group: "ЦФО" },
  { id: "tula",       label: "Тула",                  coeff: 0.80, group: "ЦФО" },
  { id: "yaroslavl",  label: "Ярославль",             coeff: 0.79, group: "ЦФО" },
  { id: "kaluga",     label: "Калуга",                coeff: 0.80, group: "ЦФО" },
  { id: "ryazan",     label: "Рязань",                coeff: 0.77, group: "ЦФО" },
  { id: "tver",       label: "Тверь",                 coeff: 0.78, group: "ЦФО" },
  { id: "ivanovo",    label: "Иваново",               coeff: 0.74, group: "ЦФО" },
  { id: "kursk",      label: "Курск",                 coeff: 0.76, group: "ЦФО" },
  { id: "belgorod",   label: "Белгород",              coeff: 0.77, group: "ЦФО" },
  { id: "lipetsk",    label: "Липецк",                coeff: 0.76, group: "ЦФО" },
  { id: "bryansk",    label: "Брянск",                coeff: 0.75, group: "ЦФО" },
  { id: "oryol",      label: "Орёл",                  coeff: 0.74, group: "ЦФО" },
  { id: "smolensk",   label: "Смоленск",              coeff: 0.75, group: "ЦФО" },
  { id: "kostroma",   label: "Кострома",              coeff: 0.74, group: "ЦФО" },
  { id: "vladimir",   label: "Владимир",              coeff: 0.76, group: "ЦФО" },
  { id: "tambov",     label: "Тамбов",                coeff: 0.74, group: "ЦФО" },
  // СЗФО
  { id: "spb",        label: "Санкт-Петербург",       coeff: 0.92, group: "СЗФО" },
  { id: "murmansk",   label: "Мурманск",              coeff: 0.88, group: "СЗФО" },
  { id: "arkhangelsk",label: "Архангельск",           coeff: 0.82, group: "СЗФО" },
  { id: "petrozavodsk",label: "Петрозаводск",         coeff: 0.81, group: "СЗФО" },
  { id: "syktyvkar",  label: "Сыктывкар",             coeff: 0.82, group: "СЗФО" },
  { id: "vologda",    label: "Вологда",               coeff: 0.77, group: "СЗФО" },
  { id: "novgorod",   label: "Великий Новгород",      coeff: 0.77, group: "СЗФО" },
  { id: "pskov",      label: "Псков",                 coeff: 0.75, group: "СЗФО" },
  { id: "kaliningrad",label: "Калининград",           coeff: 0.84, group: "СЗФО" },
  // ЮФО
  { id: "krasnodar",  label: "Краснодар",             coeff: 0.82, group: "ЮФО" },
  { id: "sochi",      label: "Сочи",                  coeff: 0.90, group: "ЮФО" },
  { id: "rostov",     label: "Ростов-на-Дону",        coeff: 0.80, group: "ЮФО" },
  { id: "volgograd",  label: "Волгоград",             coeff: 0.77, group: "ЮФО" },
  { id: "astrakhan",  label: "Астрахань",             coeff: 0.76, group: "ЮФО" },
  { id: "stavropol",  label: "Ставрополь",            coeff: 0.76, group: "ЮФО" },
  { id: "maikop",     label: "Майкоп",                coeff: 0.73, group: "ЮФО" },
  { id: "elista",     label: "Элиста",                coeff: 0.70, group: "ЮФО" },
  // ПФО
  { id: "kazan",      label: "Казань",                coeff: 0.82, group: "ПФО" },
  { id: "nnovgorod",  label: "Нижний Новгород",       coeff: 0.82, group: "ПФО" },
  { id: "samara",     label: "Самара",                coeff: 0.80, group: "ПФО" },
  { id: "ufa",        label: "Уфа",                   coeff: 0.80, group: "ПФО" },
  { id: "perm",       label: "Пермь",                 coeff: 0.80, group: "ПФО" },
  { id: "saratov",    label: "Саратов",               coeff: 0.76, group: "ПФО" },
  { id: "orenburg",   label: "Оренбург",              coeff: 0.75, group: "ПФО" },
  { id: "ulyanovsk",  label: "Ульяновск",             coeff: 0.75, group: "ПФО" },
  { id: "cheboksary", label: "Чебоксары",             coeff: 0.74, group: "ПФО" },
  { id: "saransk",    label: "Саранск",               coeff: 0.73, group: "ПФО" },
  { id: "izhevsk",    label: "Ижевск",                coeff: 0.76, group: "ПФО" },
  { id: "penza",      label: "Пенза",                 coeff: 0.74, group: "ПФО" },
  { id: "kirov",      label: "Киров",                 coeff: 0.74, group: "ПФО" },
  { id: "yoshkarola", label: "Йошкар-Ола",            coeff: 0.73, group: "ПФО" },
  // УФО
  { id: "ekb",        label: "Екатеринбург",          coeff: 0.86, group: "УФО" },
  { id: "chelyabinsk",label: "Челябинск",             coeff: 0.82, group: "УФО" },
  { id: "tyumen",     label: "Тюмень",                coeff: 0.86, group: "УФО" },
  { id: "surgut",     label: "Сургут",                coeff: 0.90, group: "УФО" },
  { id: "khanty",     label: "Ханты-Мансийск",        coeff: 0.88, group: "УФО" },
  { id: "kurgan",     label: "Курган",                coeff: 0.73, group: "УФО" },
  // СФО
  { id: "nsk",        label: "Новосибирск",           coeff: 0.80, group: "СФО" },
  { id: "krasnoyarsk",label: "Красноярск",            coeff: 0.82, group: "СФО" },
  { id: "irkutsk",    label: "Иркутск",               coeff: 0.80, group: "СФО" },
  { id: "omsk",       label: "Омск",                  coeff: 0.77, group: "СФО" },
  { id: "tomsk",      label: "Томск",                 coeff: 0.78, group: "СФО" },
  { id: "kemerovo",   label: "Кемерово",              coeff: 0.78, group: "СФО" },
  { id: "barnaul",    label: "Барнаул",               coeff: 0.76, group: "СФО" },
  { id: "abakan",     label: "Абакан",                coeff: 0.75, group: "СФО" },
  { id: "ulan_ude",   label: "Улан-Удэ",              coeff: 0.76, group: "СФО" },
  { id: "chita",      label: "Чита",                  coeff: 0.74, group: "СФО" },
  // ДФО
  { id: "vladivostok",label: "Владивосток",           coeff: 0.88, group: "ДФО" },
  { id: "khabarovsk", label: "Хабаровск",             coeff: 0.86, group: "ДФО" },
  { id: "yakutsk",    label: "Якутск",                coeff: 0.92, group: "ДФО" },
  { id: "blagoveschensk",label: "Благовещенск",       coeff: 0.80, group: "ДФО" },
  { id: "yuzhno",     label: "Южно-Сахалинск",        coeff: 0.94, group: "ДФО" },
  { id: "petropavl",  label: "Петропавловск-Камч.",   coeff: 0.95, group: "ДФО" },
  { id: "magadan",    label: "Магадан",               coeff: 0.96, group: "ДФО" },
  // Прочее
  { id: "other",      label: "Другой регион",         coeff: 0.74, group: "Другое" },
];

// ─── МАТЕРИАЛЫ ────────────────────────────────────────────────────────────────

export const MATERIALS_SUPPLY: { id: MaterialsSupply; label: string; description: string; coeff: number }[] = [
  { id: "labor_only",       label: "Только работы",            description: "Материалы не входят в смету", coeff: 0 },
  { id: "customer",         label: "Материалы заказчика",      description: "Клиент привозит сам, мы монтируем", coeff: 0 },
  { id: "contractor_basic", label: "Материалы подрядчика — базовые", description: "Эконом-класс, проверенные бренды", coeff: 0.40 },
  { id: "contractor_full",  label: "Материалы подрядчика — стандарт", description: "Средний сегмент, гарантия качества", coeff: 0.65 },
  { id: "turnkey",          label: "Под ключ — премиум материалы", description: "Всё включено, материалы высокого класса", coeff: 0.90 },
];

// ─── ДОКУМЕНТЫ ────────────────────────────────────────────────────────────────

export const DOC_PROJECT_OPTIONS: { id: DocType; label: string; price: number }[] = [
  { id: "none",    label: "Без проекта",                        price: 0 },
  { id: "sketch",  label: "Эскизный проект",                    price: 45000 },
  { id: "working", label: "Рабочий проект (АР + ЭОМ + ВК...)", price: 120000 },
  { id: "bim",     label: "BIM-проект (полный)",                price: 280000 },
];

export const DOC_ESTIMATE_OPTIONS: { id: DocEstimate; label: string; price: number }[] = [
  { id: "none",      label: "Без сметы",                        price: 0 },
  { id: "local",     label: "Локальная смета (ФЕР/ТЕР)",        price: 25000 },
  { id: "full",      label: "Сводная смета по разделам",        price: 65000 },
  { id: "expertize", label: "Смета + госэкспертиза",            price: 150000 },
];

export const DOC_PERMIT_OPTIONS: { id: DocPermit; label: string; price: number }[] = [
  { id: "none",          label: "Без согласований",             price: 0 },
  { id: "notice",        label: "Уведомление (несущ. перепланировка)", price: 18000 },
  { id: "permit",        label: "Разрешение на перепланировку", price: 55000 },
  { id: "full_approval", label: "Полное согласование (все ведомства)", price: 120000 },
];

// ─── CALCULATION ──────────────────────────────────────────────────────────────

export function calcPrice(z: ZoneConfig, regionId: string, markupPct: number): number {
  const region = REGIONS.find(r => r.id === regionId) ?? REGIONS[0];
  const room = ROOM_TYPES.find(r => r.id === z.roomType) ?? ROOM_TYPES[0];
  const finish = FINISH_LEVELS.find(f => f.id === z.finishLevel) ?? FINISH_LEVELS[1];
  const flooring = FLOORING_OPTIONS.find(f => f.id === z.flooring) ?? FLOORING_OPTIONS[0];
  const ceiling = CEILING_OPTIONS.find(c => c.id === z.ceiling) ?? CEILING_OPTIONS[0];
  const partition = PARTITION_OPTIONS.find(p => p.id === z.partitions) ?? PARTITION_OPTIONS[0];
  const heating = HEATING_OPTIONS.find(h => h.id === z.heating) ?? HEATING_OPTIONS[0];
  const vent = VENT_OPTIONS.find(v => v.id === z.ventilation) ?? VENT_OPTIONS[0];
  const alarm = ALARM_OPTIONS.find(a => a.id === z.alarmType) ?? ALARM_OPTIONS[0];
  const cctv = CCTV_OPTIONS.find(c => c.id === z.cctvType) ?? CCTV_OPTIONS[0];
  const access = ACCESS_OPTIONS.find(a => a.id === z.accessType) ?? ACCESS_OPTIONS[0];
  const fireProt = FIRE_PROTECTION_OPTIONS.find(f => f.id === z.fireProtection) ?? FIRE_PROTECTION_OPTIONS[0];
  const metalFP = METAL_FIREPROOF_OPTIONS.find(m => m.id === z.metalFireProof) ?? METAL_FIREPROOF_OPTIONS[0];
  const woodFP = WOOD_FIREPROOF_OPTIONS.find(w => w.id === z.woodFireProof) ?? WOOD_FIREPROOF_OPTIONS[0];
  const network = NETWORK_OPTIONS.find(n => n.id === z.networkType) ?? NETWORK_OPTIONS[0];

  let total = 0;

  if (z.blockFinish)     total += finish.pricePerM2 * z.area * room.coeff;
  if (z.blockFlooring)   total += flooring.pricePerM2 * z.area;
  if (z.blockCeiling)    total += ceiling.pricePerM2 * z.area;
  if (z.blockPartitions) total += partition.pricePerLM * z.partitionLinearM;
  if (z.blockHeating)    total += heating.pricePerM2 * z.area;
  if (z.blockVentilation) {
    total += vent.pricePerM2 * z.area;
    total += z.airConditioners * 28000;
  }
  if (z.blockElectric) {
    total += z.electricPoints * 3500;
    if (z.lighting) total += z.area * 1800;
    if (z.ups) total += 85000;
  }
  if (z.blockNetwork)    total += network.pricePerM2 * z.area;
  if (z.blockAlarm)      total += alarm.priceBase + z.alarmSensors * 4500;
  if (z.blockCCTV && z.cctvType !== "none") total += cctv.dvr + cctv.pricePerCamera * z.cctvCameras;
  if (z.blockAccess && z.accessType !== "none") total += access.panel + access.pricePerDoor * z.accessDoors;
  if (z.blockFire) {
    if (z.fireSignaling) total += 45000 + z.fireSensors * 2800;
    total += z.fireExtinguishers * 3500;
    total += fireProt.base + fireProt.pricePerHead * z.fireSprinklerHeads;
    total += metalFP.pricePerM2 * z.metalFireProofM2;
    total += woodFP.pricePerM2 * z.woodFireProofM2;
    total += z.fireDoors * 38000;
    if (z.fireHydrantCheck) total += 8500 + z.fireHydrantCount * 3200;
  }

  // Персонал — % от суммы работ до регионального коэффициента
  if (z.blockStaff) {
    total += total * (z.foremanPct / 100);
    total += total * (z.supplyPct / 100);
  }

  // Применяем региональный коэффициент и наценку к работам
  const laborTotal = total * region.coeff * (1 + markupPct / 100);

  // Материалы — процент от стоимости работ
  let materialsTotal = 0;
  if (z.blockMaterials) {
    const matSupply = MATERIALS_SUPPLY.find(m => m.id === z.materialsSupply) ?? MATERIALS_SUPPLY[0];
    materialsTotal = laborTotal * matSupply.coeff * z.materialsCoeffCustom;
  }

  // Документы — фиксированные суммы, не зависят от площади
  let docsTotal = 0;
  if (z.blockDocs) {
    const docProj = DOC_PROJECT_OPTIONS.find(d => d.id === z.docProject) ?? DOC_PROJECT_OPTIONS[0];
    const docEst  = DOC_ESTIMATE_OPTIONS.find(d => d.id === z.docEstimate) ?? DOC_ESTIMATE_OPTIONS[0];
    const docPerm = DOC_PERMIT_OPTIONS.find(d => d.id === z.docPermit) ?? DOC_PERMIT_OPTIONS[0];
    docsTotal += docProj.price;
    docsTotal += docEst.price;
    docsTotal += docPerm.price;
    if (z.docAsBuilt)    docsTotal += 35000;
    if (z.docSro)        docsTotal += 45000;
    if (z.docFireAudit)  docsTotal += 28000;
    if (z.docEnergyCert) docsTotal += 22000;
  }

  return Math.round(laborTotal + materialsTotal + docsTotal);
}

export function makeZone(name = ""): ZoneConfig {
  return {
    id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
    // блок-флаги — по умолчанию все включены
    blockFinish: true,
    blockFlooring: true,
    blockCeiling: true,
    blockPartitions: true,
    blockHeating: true,
    blockVentilation: true,
    blockElectric: true,
    blockNetwork: true,
    blockAlarm: true,
    blockCCTV: true,
    blockAccess: true,
    blockFire: true,
    blockMaterials: false,
    blockDocs: false,
    blockStaff: false,
    // параметры
    roomType: "office",
    area: 100,
    height: 3,
    finishLevel: "standard",
    flooring: "porcelain",
    ceiling: "armstrong",
    partitions: "gypsum",
    partitionLinearM: 20,
    heating: "radiator",
    ventilation: "supply_exhaust",
    airConditioners: 2,
    electricPoints: 20,
    lighting: true,
    ups: false,
    networkType: "structured",
    alarmType: "gsm",
    alarmSensors: 8,
    cctvType: "ip_hd",
    cctvCameras: 4,
    accessType: "card",
    accessDoors: 2,
    fireSignaling: true,
    fireSensors: 10,
    fireExtinguishers: 4,
    fireProtection: "signaling",
    fireSprinklerHeads: 0,
    metalFireProof: "none",
    metalFireProofM2: 0,
    woodFireProof: "none",
    woodFireProofM2: 0,
    fireDoors: 1,
    fireHydrantCheck: false,
    fireHydrantCount: 0,
    // Материалы
    materialsSupply: "labor_only",
    materialsCoeffCustom: 1.0,
    // Персонал
    foremanPct: 8,
    supplyPct: 5,
    // Документы
    docProject: "none",
    docEstimate: "none",
    docPermit: "none",
    docAsBuilt: false,
    docSro: false,
    docFireAudit: false,
    docEnergyCert: false,
    totalPrice: 0,
  };
}

export function fmtPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}