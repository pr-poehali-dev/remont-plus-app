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
    basePriceM2: 15000,
    priceCoeff: 0.7,
  },
  {
    id: "standard",
    label: "Стандарт",
    description: "Оптимальное соотношение цены и качества",
    includes: ["Стяжка", "Штукатурка гипс", "Покраска 2 слоя", "Ламинат 33кл", "Электрика базовая"],
    basePriceM2: 23000,
    priceCoeff: 1.0,
  },
  {
    id: "comfort",
    label: "Комфорт",
    description: "Качественные материалы, детальная проработка",
    includes: ["Стяжка самонивелир", "Штукатурка+шпаклёвка", "Покраска 3 слоя", "Паркетная доска", "Электрика полная"],
    basePriceM2: 36000,
    priceCoeff: 1.4,
  },
  {
    id: "premium",
    label: "Премиум",
    description: "Материалы премиум-класса, авторские решения",
    includes: ["Все работы комфорт", "Дизайн-проект", "Авторский надзор", "Паркет/натуральный камень", "Умный дом"],
    basePriceM2: 58000,
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
  { id: "dry",           label: "Сухая стяжка",          description: "Быстрый монтаж, лёгкая конструкция", priceM2: 850  },
  { id: "wet",           label: "Мокрая стяжка",         description: "Цементно-песчаная, прочная",          priceM2: 1100  },
  { id: "self-leveling", label: "Самовыравнивающаяся",   description: "Идеально ровная поверхность",          priceM2: 1450 },
];

// ─── Типы штукатурки ──────────────────────────────────────────────────────────

export interface PlasterTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const PLASTER_TYPES: PlasterTypeOption[] = [
  { id: "gypsum",  label: "Гипсовая штукатурка",  description: "Для жилых помещений, ровная поверхность", priceM2: 720 },
  { id: "cement",  label: "Цементная штукатурка",  description: "Для влажных помещений, прочная",           priceM2: 850 },
];

// ─── Типы потолка ─────────────────────────────────────────────────────────────

export interface CeilingTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const CEILING_FINISH_TYPES: CeilingTypeOption[] = [
  { id: "paint",        label: "Покраска потолка",      description: "Шпаклёвка + грунт + покраска",  priceM2: 850  },
  { id: "stretch",      label: "Натяжной потолок",      description: "ПВХ полотно, любой цвет",        priceM2: 1200  },
  { id: "gypsum-board", label: "Гипсокартонный потолок",description: "С подсветкой, сложные формы",    priceM2: 1600 },
];

// ─── Типы напольного покрытия ────────────────────────────────────────────────

export interface FlooringTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const FLOORING_TYPES: FlooringTypeOption[] = [
  { id: "laminate",  label: "Ламинат 33 класс",     description: "Универсальный вариант",               priceM2: 1100  },
  { id: "tile",      label: "Плитка / керамогранит", description: "Для кухни, ванной, прихожей",         priceM2: 1700 },
  { id: "parquet",   label: "Паркетная доска",       description: "Для гостиной, спальни",               priceM2: 2400 },
  { id: "linoleum",  label: "Линолеум",              description: "Бюджетный, быстрый монтаж",           priceM2: 600  },
];

// ─── Типы дверей ─────────────────────────────────────────────────────────────

export interface DoorTypeOption {
  id: string;
  label: string;
  description: string;
  pricePerDoor: number;
}

export const DOOR_TYPES: DoorTypeOption[] = [
  { id: "economy",  label: "Эконом (ламинат)",  description: "МДФ с ламинатом, коробка в комплекте",  pricePerDoor: 11500  },
  { id: "standard", label: "Стандарт (шпон)",   description: "Шпонированная дверь + коробка + установка", pricePerDoor: 20000 },
  { id: "premium",  label: "Премиум (массив)",  description: "Массив дерева, фурнитура, установка",   pricePerDoor: 38000 },
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
  note: "",
};