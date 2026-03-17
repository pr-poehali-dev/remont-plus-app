// ─── Типы помещений ───────────────────────────────────────────────────────────

export interface RoomTypeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  priceCoeff: number;
  wallCoeff: number; // коэффициент площади стен к площади пола
}

export const ROOM_TYPES: RoomTypeOption[] = [
  { id: "bedroom",  label: "Спальня",    icon: "BedDouble",       description: "Жилая комната",              priceCoeff: 1.0,  wallCoeff: 2.4 },
  { id: "living",   label: "Гостиная",   icon: "Sofa",            description: "Большая жилая зона",         priceCoeff: 1.0,  wallCoeff: 2.2 },
  { id: "kitchen",  label: "Кухня",      icon: "UtensilsCrossed", description: "Усиленная отделка, фартук",  priceCoeff: 1.2,  wallCoeff: 2.6 },
  { id: "bathroom", label: "Ванная",     icon: "Bath",            description: "Влагостойкие материалы",    priceCoeff: 1.35, wallCoeff: 3.2 },
  { id: "hallway",  label: "Прихожая",   icon: "DoorOpen",        description: "Коридор, прихожая",          priceCoeff: 1.05, wallCoeff: 2.8 },
  { id: "balcony",  label: "Балкон",     icon: "Wind",            description: "Застеклённый балкон/лоджия", priceCoeff: 0.85, wallCoeff: 2.0 },
  { id: "office",   label: "Кабинет",    icon: "Monitor",         description: "Рабочий кабинет",            priceCoeff: 1.05, wallCoeff: 2.4 },
];

// ─── Уровни ремонта ───────────────────────────────────────────────────────────

export interface RenovationLevelOption {
  id: string;
  label: string;
  description: string;
  includes: string[];
  basePriceM2: number;
  priceCoeff: number;
}

export const RENOVATION_LEVELS: RenovationLevelOption[] = [
  {
    id: "economy",
    label: "Эконом",
    description: "Минимальный набор работ, бюджетные материалы",
    includes: ["Стяжка", "Штукатурка", "Обои/покраска", "Линолеум/ламинат эконом"],
    basePriceM2: 16500,
    priceCoeff: 0.7,
  },
  {
    id: "standard",
    label: "Стандарт",
    description: "Оптимальное соотношение цены и качества",
    includes: ["Стяжка", "Штукатурка гипс", "Покраска 2 слоя", "Ламинат 33кл", "Электрика базовая"],
    basePriceM2: 25300,
    priceCoeff: 1.0,
  },
  {
    id: "comfort",
    label: "Комфорт",
    description: "Качественные материалы, детальная проработка",
    includes: ["Стяжка самонивелир", "Штукатурка+шпаклёвка", "Покраска 3 слоя", "Паркетная доска", "Электрика полная"],
    basePriceM2: 39600,
    priceCoeff: 1.4,
  },
  {
    id: "premium",
    label: "Премиум",
    description: "Материалы премиум-класса, авторские решения",
    includes: ["Все работы комфорт", "Дизайн-проект", "Авторский надзор", "Паркет/натуральный камень", "Умный дом"],
    basePriceM2: 63800,
    priceCoeff: 2.0,
  },
];

// ─── Типы стяжки ──────────────────────────────────────────────────────────────

export interface ScreedTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const SCREED_TYPES: ScreedTypeOption[] = [
  { id: "dry",           label: "Сухая стяжка",          description: "Быстрый монтаж, лёгкая конструкция", priceM2: 1210 },
  { id: "wet",           label: "Мокрая стяжка",         description: "Цементно-песчаная, прочная",          priceM2: 1485 },
  { id: "self-leveling", label: "Самовыравнивающаяся",   description: "Идеально ровная поверхность",          priceM2: 1870 },
];

// ─── Типы штукатурки ──────────────────────────────────────────────────────────

export interface PlasterTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const PLASTER_TYPES: PlasterTypeOption[] = [
  { id: "gypsum",  label: "Гипсовая штукатурка",  description: "Для жилых помещений, ровная поверхность", priceM2: 990 },
  { id: "cement",  label: "Цементная штукатурка",  description: "Для влажных помещений, прочная",           priceM2: 1155 },
];

// ─── Типы потолка ─────────────────────────────────────────────────────────────

export interface CeilingTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const CEILING_FINISH_TYPES: CeilingTypeOption[] = [
  { id: "paint",        label: "Покраска потолка",      description: "Шпаклёвка + грунт + покраска",  priceM2: 1045 },
  { id: "stretch",      label: "Натяжной потолок",      description: "ПВХ полотно, любой цвет",        priceM2: 1540 },
  { id: "gypsum-board", label: "Гипсокартонный потолок",description: "С подсветкой, сложные формы",    priceM2: 2090 },
];

// ─── Типы напольного покрытия ────────────────────────────────────────────────

export interface FlooringTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const FLOORING_TYPES: FlooringTypeOption[] = [
  { id: "laminate",  label: "Ламинат 33 класс",     description: "Универсальный вариант",               priceM2: 1540 },
  { id: "tile",      label: "Плитка / керамогранит", description: "Для кухни, ванной, прихожей",         priceM2: 2310 },
  { id: "parquet",   label: "Паркетная доска",       description: "Для гостиной, спальни",               priceM2: 3520 },
  { id: "linoleum",  label: "Линолеум",              description: "Бюджетный, быстрый монтаж",           priceM2: 880  },
];

// ─── Типы дверей ─────────────────────────────────────────────────────────────

export interface DoorTypeOption {
  id: string;
  label: string;
  description: string;
  pricePerDoor: number;
}

export const DOOR_TYPES: DoorTypeOption[] = [
  { id: "economy",  label: "Эконом (ламинат)",  description: "МДФ с ламинатом, коробка в комплекте",  pricePerDoor: 15400 },
  { id: "standard", label: "Стандарт (шпон)",   description: "Шпонированная дверь + коробка + установка", pricePerDoor: 26400 },
  { id: "premium",  label: "Премиум (массив)",  description: "Массив дерева, фурнитура, установка",   pricePerDoor: 49500 },
];

// ─── Тёплый пол ─────────────────────────────────────────────────────────────

export interface HeatedFloorTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const HEATED_FLOOR_TYPES: HeatedFloorTypeOption[] = [
  { id: "electric-cable",  label: "Электрический кабельный",  description: "Кабель в стяжку, терморегулятор",           priceM2: 2750 },
  { id: "electric-mat",    label: "Электрический мат",        description: "Нагревательный мат под плитку/ламинат",     priceM2: 3300 },
  { id: "water",           label: "Водяной тёплый пол",       description: "Трубы + коллектор, подключение к отоплению", priceM2: 4400 },
];

// ─── Кухонный фартук ────────────────────────────────────────────────────────

export interface BacksplashTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const BACKSPLASH_TYPES: BacksplashTypeOption[] = [
  { id: "ceramic",    label: "Керамическая плитка",  description: "Классический вариант, водостойкий",      priceM2: 3850 },
  { id: "mosaic",     label: "Мозаика",              description: "Стеклянная/керамическая мозаика",        priceM2: 5500 },
  { id: "glass",      label: "Стеклянный скинали",   description: "Закалённое стекло с фотопечатью",        priceM2: 6600 },
];

export interface CountertopTypeOption {
  id: string;
  label: string;
  description: string;
  pricePerMeter: number;
}

export const COUNTERTOP_TYPES: CountertopTypeOption[] = [
  { id: "laminate",    label: "Ламинированная ДСП",     description: "Бюджет, быстрая замена",                pricePerMeter: 4400  },
  { id: "acrylic",     label: "Искусственный камень",   description: "Акрил/кварц, бесшовная стыковка",       pricePerMeter: 12100 },
  { id: "natural",     label: "Натуральный камень",     description: "Гранит/мрамор, премиум-класс",          pricePerMeter: 22000 },
];

// ─── Кондиционирование ──────────────────────────────────────────────────────

export interface ConditionerTypeOption {
  id: string;
  label: string;
  description: string;
  pricePerUnit: number;
}

export const CONDITIONER_TYPES: ConditionerTypeOption[] = [
  { id: "split-economy",  label: "Сплит-система эконом",    description: "Бытовая, до 25 м², монтаж + трасса",       pricePerUnit: 38500  },
  { id: "split-inverter", label: "Сплит-система инвертор",  description: "Инверторная, до 35 м², тихая работа",       pricePerUnit: 55000  },
  { id: "multi-split",    label: "Мульти-сплит (1 блок)",   description: "Один внешний блок на несколько комнат",     pricePerUnit: 72600  },
];

// ─── Шумоизоляция ───────────────────────────────────────────────────────────

export interface SoundproofTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const SOUNDPROOF_TYPES: SoundproofTypeOption[] = [
  { id: "basic",    label: "Базовая (стены)",         description: "Минвата 50 мм + ГКЛ, снижение до 10 дБ",  priceM2: 1650 },
  { id: "enhanced", label: "Усиленная (стены+пол)",   description: "Минвата + виброподвесы + 2 слоя ГКЛ",      priceM2: 2860 },
  { id: "premium",  label: "Максимальная (комплекс)",  description: "Стены + пол + потолок, до 20 дБ снижения", priceM2: 4400 },
];

// ─── Регионы ─────────────────────────────────────────────────────────────────

export { CALC_REGIONS as REGIONS, DEFAULT_REGION_ID } from "@/components/calculator/shared/regions";

// ─── Конфиг зоны ─────────────────────────────────────────────────────────────

export interface NewbuildConfig {
  id: string;
  roomName: string;
  roomType: string;
  area: number;
  ceilingHeightM: number;
  renovationLevel: string;
  screedIncluded: boolean;
  screedType: string;
  plasterIncluded: boolean;
  plasterType: string;
  ceilingLevelIncluded: boolean;
  ceilingType: string;
  paintingWalls: boolean;
  paintingCeiling: boolean;
  paintLayersCount: number;
  flooringType: string;
  electricsIncluded: boolean;
  outletsCount: number;
  switchesCount: number;
  doorsCount: number;
  doorType: string;
  windowSlopesCount: number;
  floorNumber: number;
  deliveryIncluded: boolean;
  heatedFloorIncluded: boolean;
  heatedFloorType: string;
  heatedFloorArea: number;
  backsplashIncluded: boolean;
  backsplashType: string;
  backsplashArea: number;
  countertopIncluded: boolean;
  countertopType: string;
  countertopLength: number;
  conditionerIncluded: boolean;
  conditionerType: string;
  conditionerCount: number;
  soundproofIncluded: boolean;
  soundproofType: string;
  note: string;
  totalPrice: number;
}

// ─── Дефолтный конфиг ────────────────────────────────────────────────────────

export const DEFAULT_NEWBUILD_CONFIG: Omit<NewbuildConfig, "id" | "totalPrice"> = {
  roomName: "",
  roomType: "bedroom",
  area: 18,
  ceilingHeightM: 2.8,
  renovationLevel: "standard",
  screedIncluded: true,
  screedType: "wet",
  plasterIncluded: true,
  plasterType: "gypsum",
  ceilingLevelIncluded: true,
  ceilingType: "paint",
  paintingWalls: true,
  paintingCeiling: true,
  paintLayersCount: 2,
  flooringType: "laminate",
  electricsIncluded: true,
  outletsCount: 3,
  switchesCount: 2,
  doorsCount: 1,
  doorType: "standard",
  windowSlopesCount: 1,
  floorNumber: 3,
  deliveryIncluded: true,
  heatedFloorIncluded: false,
  heatedFloorType: "electric-mat",
  heatedFloorArea: 0,
  backsplashIncluded: false,
  backsplashType: "ceramic",
  backsplashArea: 3,
  countertopIncluded: false,
  countertopType: "laminate",
  countertopLength: 3,
  conditionerIncluded: false,
  conditionerType: "split-economy",
  conditionerCount: 1,
  soundproofIncluded: false,
  soundproofType: "basic",
  note: "",
};