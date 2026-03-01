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

export interface ZoneConfig {
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

export const REGIONS: { id: string; label: string; coeff: number }[] = [
  { id: "moscow", label: "Москва и МО", coeff: 1.0 },
  { id: "spb", label: "Санкт-Петербург", coeff: 0.92 },
  { id: "krasnodar", label: "Краснодарский край", coeff: 0.78 },
  { id: "ekb", label: "Екатеринбург", coeff: 0.82 },
  { id: "nsk", label: "Новосибирск", coeff: 0.76 },
  { id: "kazan", label: "Казань", coeff: 0.8 },
  { id: "other", label: "Другой регион", coeff: 0.75 },
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

  total += finish.pricePerM2 * z.area * room.coeff;
  total += flooring.pricePerM2 * z.area;
  total += ceiling.pricePerM2 * z.area;
  total += partition.pricePerLM * z.partitionLinearM;
  total += heating.pricePerM2 * z.area;
  total += vent.pricePerM2 * z.area;
  total += z.airConditioners * 28000;
  total += z.electricPoints * 3500;
  if (z.lighting) total += z.area * 1800;
  if (z.ups) total += 85000;
  total += network.pricePerM2 * z.area;
  total += alarm.priceBase + z.alarmSensors * 4500;
  if (z.cctvType !== "none") total += cctv.dvr + cctv.pricePerCamera * z.cctvCameras;
  if (z.accessType !== "none") total += access.panel + access.pricePerDoor * z.accessDoors;
  if (z.fireSignaling) total += 45000 + z.fireSensors * 2800;
  total += z.fireExtinguishers * 3500;
  total += fireProt.base + fireProt.pricePerHead * z.fireSprinklerHeads;
  total += metalFP.pricePerM2 * z.metalFireProofM2;
  total += woodFP.pricePerM2 * z.woodFireProofM2;
  total += z.fireDoors * 38000;
  if (z.fireHydrantCheck) total += 8500 + z.fireHydrantCount * 3200;

  total *= region.coeff;
  total *= 1 + markupPct / 100;

  return Math.round(total);
}

export function makeZone(name = ""): ZoneConfig {
  return {
    id: `off-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name,
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
    totalPrice: 0,
  };
}

export function fmtPrice(n: number): string {
  return n.toLocaleString("ru-RU") + " ₽";
}
