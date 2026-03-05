export type FlooringCategory = "laminate" | "parquet" | "tile" | "vinyl" | "carpet" | "linoleum" | "engineered" | "cork" | "spc" | "bamboo";

export interface FlooringProduct {
  id: string;
  category: FlooringCategory;
  name: string;
  brand: string;
  pricePerM2: number;
  thickness: number;
  wear: string;
  warranty: number;
  image: string;
  features: string[];
  suitable: string[];
  installPrice: number;
}

export interface SubstrateOption {
  id: string;
  name: string;
  pricePerM2: number;
  description: string;
}

export interface InstallPattern {
  id: string;
  name: string;
  wastePct: number;
  description: string;
}

export interface SkirtingOption {
  id: string;
  name: string;
  pricePerM: number;
  description: string;
}

export interface FlooringConfig {
  id: string;
  roomName: string;
  length: number;
  width: number;
  area: number;
  perimeter: number;
  productId: string;
  substrateId: string;
  patternId: string;
  skirtingId: string;
  skirtingIncluded: boolean;
  demolitionIncluded: boolean;
  levelingIncluded: boolean;
  levelingThicknessMm: number;
  thresholdCount: number;
  totalPrice: number;
}

export const FLOORING_CATEGORIES: { value: FlooringCategory; label: string; icon: string }[] = [
  { value: "laminate",   label: "Ламинат",          icon: "🪵" },
  { value: "parquet",    label: "Паркет",            icon: "✨" },
  { value: "engineered", label: "Инж. доска",        icon: "🏠" },
  { value: "spc",        label: "SPC/LVT vinyl",     icon: "💧" },
  { value: "vinyl",      label: "Виниловая плитка",  icon: "🔲" },
  { value: "tile",       label: "Керамогранит",      icon: "⬜" },
  { value: "linoleum",   label: "Линолеум",          icon: "🔄" },
  { value: "cork",       label: "Пробка",            icon: "🍂" },
  { value: "carpet",     label: "Ковролин",          icon: "🛋️" },
  { value: "bamboo",     label: "Бамбук",            icon: "🌿" },
];

const IMG = {
  laminate: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/2a8a1529-169a-4a6e-ab84-b2f2aa7de4f1.jpg",
  parquet:  "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/9adef847-303e-42d9-ae52-7f1e4815160a.jpg",
  tile:     "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/f83be6a5-5006-405c-8d00-20abfc7b017f.jpg",
  vinyl:    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d7ed8480-a3d2-4ca4-89cf-dc0e995ea4be.jpg",
  carpet:   "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7f6a9c05-1915-4d24-8ad0-9475ba244022.jpg",
};

export const FLOORING_PRODUCTS: FlooringProduct[] = [
  // ЛАМИНАТ
  {
    id: "lam-quick-step-33",
    category: "laminate",
    name: "Impressive IM1855",
    brand: "Quick-Step",
    pricePerM2: 1850,
    thickness: 8,
    wear: "33 класс",
    warranty: 25,
    image: IMG.laminate,
    features: ["Гидрофобное покрытие", "Фаска 4V", "Замок Uniclic"],
    suitable: ["Гостиная", "Спальня", "Детская"],
    installPrice: 450,
  },
  {
    id: "lam-pergo-33",
    category: "laminate",
    name: "Living Expression",
    brand: "Pergo",
    pricePerM2: 2200,
    thickness: 9,
    wear: "33 класс",
    warranty: 30,
    image: IMG.laminate,
    features: ["TitanX покрытие", "Защита от царапин", "PerfectFold 3.0"],
    suitable: ["Гостиная", "Кухня", "Прихожая"],
    installPrice: 450,
  },
  {
    id: "lam-egger-32",
    category: "laminate",
    name: "PRO Kingsize",
    brand: "Egger",
    pricePerM2: 1200,
    thickness: 8,
    wear: "32 класс",
    warranty: 15,
    image: IMG.laminate,
    features: ["Антистатик", "EPL замок", "Широкая доска"],
    suitable: ["Спальня", "Детская", "Кабинет"],
    installPrice: 400,
  },

  // ПАРКЕТ (штучный)
  {
    id: "parq-barlinek-oak",
    category: "parquet",
    name: "Дуб Tasty Canyon",
    brand: "Barlinek",
    pricePerM2: 4200,
    thickness: 22,
    wear: "Массив 22 мм",
    warranty: 25,
    image: IMG.parquet,
    features: ["Натуральный массив", "Масло-воск", "Елочный рисунок"],
    suitable: ["Гостиная", "Кабинет", "Спальня"],
    installPrice: 900,
  },
  {
    id: "parq-coswick-ash",
    category: "parquet",
    name: "Ясень Натур",
    brand: "Coswick",
    pricePerM2: 5800,
    thickness: 19,
    wear: "Массив 19 мм",
    warranty: 30,
    image: IMG.parquet,
    features: ["Ручная обработка", "UV масло", "Узкая доска 60 мм"],
    suitable: ["Гостиная", "Библиотека"],
    installPrice: 1100,
  },

  // ИНЖЕНЕРНАЯ ДОСКА
  {
    id: "eng-boen-oak",
    category: "engineered",
    name: "Oak Animoso",
    brand: "Boen",
    pricePerM2: 4700,
    thickness: 14,
    wear: "3,5 мм шпон",
    warranty: 20,
    image: IMG.parquet,
    features: ["Шпон 3,5 мм", "Браш + масло", "Uniclic замок"],
    suitable: ["Гостиная", "Спальня", "Кухня"],
    installPrice: 950,
  },
  {
    id: "eng-coswick-maple",
    category: "engineered",
    name: "Клён Натур",
    brand: "Coswick",
    pricePerM2: 5800,
    thickness: 15,
    wear: "4 мм шпон",
    warranty: 25,
    image: IMG.parquet,
    features: ["Глубокий браш", "Твёрдый шпон", "Широкая доска 190 мм"],
    suitable: ["Гостиная", "Кабинет"],
    installPrice: 1000,
  },

  // SPC / LVT
  {
    id: "spc-fargo",
    category: "spc",
    name: "Sherwood 936",
    brand: "Fargo",
    pricePerM2: 1300,
    thickness: 5,
    wear: "34 класс",
    warranty: 15,
    image: IMG.vinyl,
    features: ["100% водостойкий", "Каменная основа", "Без подложки"],
    suitable: ["Кухня", "Ванная", "Прихожая", "Везде"],
    installPrice: 480,
  },
  {
    id: "spc-alpine-floor",
    category: "spc",
    name: "Grand Sequoia",
    brand: "Alpine Floor",
    pricePerM2: 1800,
    thickness: 6,
    wear: "43 класс",
    warranty: 25,
    image: IMG.vinyl,
    features: ["Коммерческий класс", "Антибактериальный", "Встроенная подложка"],
    suitable: ["Кухня", "Прихожая", "Коммерция"],
    installPrice: 480,
  },

  // ВИНИЛОВАЯ ПЛИТКА LVT
  {
    id: "vinyl-tarkett",
    category: "vinyl",
    name: "Art Vinyl New Age",
    brand: "Tarkett",
    pricePerM2: 2200,
    thickness: 4.5,
    wear: "34 класс",
    warranty: 20,
    image: IMG.vinyl,
    features: ["Click замок", "Фаска", "Теплый на ощупь"],
    suitable: ["Гостиная", "Кухня", "Спальня"],
    installPrice: 520,
  },
  {
    id: "vinyl-moduleo",
    category: "vinyl",
    name: "Roots 55 Blackjack Oak",
    brand: "Moduleo",
    pricePerM2: 2800,
    thickness: 5,
    wear: "34 класс",
    warranty: 25,
    image: IMG.vinyl,
    features: ["Pure Click", "Водостойкий", "Скошенная кромка"],
    suitable: ["Везде"],
    installPrice: 540,
  },

  // КЕРАМОГРАНИТ
  {
    id: "tile-kerama-60",
    category: "tile",
    name: "Про Стоун серый 60×60",
    brand: "Kerama Marazzi",
    pricePerM2: 2400,
    thickness: 10,
    wear: "PEI 4",
    warranty: 50,
    image: IMG.tile,
    features: ["Матовая поверхность", "Ректификат", "Морозостойкий"],
    suitable: ["Ванная", "Кухня", "Прихожая", "Балкон"],
    installPrice: 1600,
  },
  {
    id: "tile-atlas-concorde",
    category: "tile",
    name: "Marvel Stone Statuario",
    brand: "Atlas Concorde",
    pricePerM2: 4200,
    thickness: 9.5,
    wear: "PEI 4",
    warranty: 50,
    image: IMG.tile,
    features: ["Под мрамор", "Лаппатированный", "Крупный формат 75×75"],
    suitable: ["Гостиная", "Ванная", "Холл"],
    installPrice: 1850,
  },

  // ЛИНОЛЕУМ
  {
    id: "lino-tarkett-home",
    category: "linoleum",
    name: "Smile SD 51816",
    brand: "Tarkett",
    pricePerM2: 600,
    thickness: 3.5,
    wear: "23 класс",
    warranty: 10,
    image: IMG.vinyl,
    features: ["Утеплённая основа", "Под дерево", "Ширина 3 м"],
    suitable: ["Спальня", "Детская", "Дача"],
    installPrice: 340,
  },
  {
    id: "lino-forbo-commercial",
    category: "linoleum",
    name: "Eternal Material 11052",
    brand: "Forbo",
    pricePerM2: 1450,
    thickness: 2,
    wear: "34 класс",
    warranty: 15,
    image: IMG.vinyl,
    features: ["Антистатик", "Коммерческий", "Без основы"],
    suitable: ["Офис", "Кухня", "Прихожая"],
    installPrice: 400,
  },

  // ПРОБКА
  {
    id: "cork-wicanders",
    category: "cork",
    name: "Wood Essence Chalk Oak",
    brand: "Wicanders",
    pricePerM2: 3200,
    thickness: 11.5,
    wear: "31 класс",
    warranty: 10,
    image: IMG.carpet,
    features: ["Натуральная пробка", "Тёплый на ощупь", "Звукоизоляция"],
    suitable: ["Спальня", "Детская", "Кабинет"],
    installPrice: 720,
  },
  {
    id: "cork-granorte",
    category: "cork",
    name: "Vita Classic Natural",
    brand: "Granorte",
    pricePerM2: 2500,
    thickness: 10,
    wear: "31 класс",
    warranty: 10,
    image: IMG.carpet,
    features: ["Eco Cork", "UV лак", "Гипоаллергенный"],
    suitable: ["Детская", "Спальня"],
    installPrice: 660,
  },

  // КОВРОЛИН
  {
    id: "carpet-balsan",
    category: "carpet",
    name: "Centaure New 097",
    brand: "Balsan",
    pricePerM2: 1450,
    thickness: 9,
    wear: "32 класс",
    warranty: 10,
    image: IMG.carpet,
    features: ["Петлевой ворс", "Антистатик", "Ширина 4 м"],
    suitable: ["Спальня", "Гостиная", "Кабинет"],
    installPrice: 460,
  },
  {
    id: "carpet-ideal",
    category: "carpet",
    name: "Vario 820",
    brand: "Ideal",
    pricePerM2: 520,
    thickness: 7,
    wear: "21/23 класс",
    warranty: 5,
    image: IMG.carpet,
    features: ["Разрезной ворс", "Бюджетный", "Ширина 3/4 м"],
    suitable: ["Спальня", "Детская"],
    installPrice: 340,
  },

  // БАМБУК
  {
    id: "bamboo-greenline",
    category: "bamboo",
    name: "HM Strand Carbonized",
    brand: "Greenline",
    pricePerM2: 4100,
    thickness: 14,
    wear: "Тж. 1450 Janka",
    warranty: 15,
    image: IMG.parquet,
    features: ["Прессованный бамбук", "Твёрже дуба", "Экологичный"],
    suitable: ["Гостиная", "Спальня", "Кабинет"],
    installPrice: 920,
  },
  {
    id: "bamboo-austinat",
    category: "bamboo",
    name: "Elite Woven Ash",
    brand: "Austinat",
    pricePerM2: 3400,
    thickness: 12,
    wear: "Тж. 1200 Janka",
    warranty: 10,
    image: IMG.parquet,
    features: ["Плетёный бамбук", "Масло-воск", "Пепельный тон"],
    suitable: ["Гостиная", "Кабинет"],
    installPrice: 860,
  },
];

export const SUBSTRATE_OPTIONS: SubstrateOption[] = [
  { id: "none",      name: "Без подложки",        pricePerM2: 0,   description: "Для SPC/LVT со встроенной подложкой" },
  { id: "foam-3",    name: "Вспененная 3 мм",      pricePerM2: 65,  description: "Базовая, для ровных полов" },
  { id: "xps-3",     name: "XPS 3 мм",             pricePerM2: 90,  description: "Теплоизоляция + шумоизоляция" },
  { id: "xps-5",     name: "XPS 5 мм",             pricePerM2: 130, description: "Повышенная теплоизоляция" },
  { id: "cork-2",    name: "Пробковая 2 мм",       pricePerM2: 150, description: "Премиум, гипоаллергенная" },
  { id: "thermo",    name: "Тёплый пол (подложка)", pricePerM2: 115, description: "Совместима с тёплым полом" },
];

export const INSTALL_PATTERNS: InstallPattern[] = [
  { id: "straight",    name: "Прямая (вдоль)",    wastePct: 5,  description: "Минимум отходов, классика" },
  { id: "diagonal",    name: "Диагональ 45°",     wastePct: 15, description: "+15% отходов, визуально расширяет" },
  { id: "herringbone", name: "Ёлочка",            wastePct: 12, description: "+12% отходов, классический паркет" },
  { id: "brick",       name: "Кирпичная кладка",  wastePct: 8,  description: "+8% отходов, популярна для плитки" },
  { id: "versailles",  name: "Версаль",           wastePct: 20, description: "+20% отходов, декоративная" },
];

export const SKIRTING_OPTIONS: SkirtingOption[] = [
  { id: "none",       name: "Без плинтуса",          pricePerM: 0,   description: "" },
  { id: "pvc-60",     name: "ПВХ плинтус 60 мм",     pricePerM: 160, description: "Эконом, под цвет пола" },
  { id: "mdf-60",     name: "МДФ плинтус 60 мм",     pricePerM: 290, description: "Стандарт, крашеный" },
  { id: "mdf-100",    name: "МДФ плинтус 100 мм",    pricePerM: 500, description: "Высокий, премиум вид" },
  { id: "solid-oak",  name: "Дубовый плинтус",       pricePerM: 850, description: "Натуральный дуб, к паркету" },
  { id: "tile-10",    name: "Плинтус из плитки 10 см", pricePerM: 580, description: "Для керамогранита" },
];

export { CALC_REGIONS as REGIONS, DEFAULT_REGION_ID } from "@/components/calculator/shared/regions";
export type { CalcRegion as Region } from "@/components/calculator/shared/regions";