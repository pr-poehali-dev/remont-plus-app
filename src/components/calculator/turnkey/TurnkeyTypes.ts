// ─── Типы квартир ────────────────────────────────────────────────────────────

export interface ApartmentTypeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  defaultArea: number;
}

export const APARTMENT_TYPES: ApartmentTypeOption[] = [
  { id: "studio",  label: "Студия",    icon: "Maximize2",   description: "Открытая планировка",   defaultArea: 28  },
  { id: "1room",   label: "1-комн.",   icon: "Square",      description: "1 жилая комната",       defaultArea: 42  },
  { id: "2room",   label: "2-комн.",   icon: "LayoutGrid",  description: "2 жилые комнаты",       defaultArea: 62  },
  { id: "3room",   label: "3-комн.",   icon: "Grid3x3",     description: "3 жилые комнаты",       defaultArea: 82  },
  { id: "4room+",  label: "4+ комн.",  icon: "Building",    description: "4 и более комнат",      defaultArea: 105 },
];

// ─── Уровни ремонта ───────────────────────────────────────────────────────────

export interface RenovationLevelOption {
  id: string;
  label: string;
  description: string;
  includes: string[];
  basePriceM2: number;
  priceCoeff: number;
  color: string;
}

export const RENOVATION_LEVELS: RenovationLevelOption[] = [
  {
    id: "economy",
    label: "Эконом",
    description: "Минимальный ремонт, бюджетные материалы",
    includes: ["Штукатурка", "Обои", "Линолеум", "Базовая электрика"],
    basePriceM2: 15000,
    priceCoeff: 0.7,
    color: "gray",
  },
  {
    id: "standard",
    label: "Стандарт",
    description: "Хорошее качество, проверенные материалы",
    includes: ["Стяжка + штукатурка", "Покраска", "Ламинат 33кл", "Электрика", "Сантехника базовая"],
    basePriceM2: 23000,
    priceCoeff: 1.0,
    color: "blue",
  },
  {
    id: "comfort",
    label: "Комфорт",
    description: "Качество выше среднего, хорошие бренды",
    includes: ["Всё из Стандарт", "Паркетная доска", "Натяжные потолки", "Тёплые полы в санузлах", "Дизайн-проект"],
    basePriceM2: 36000,
    priceCoeff: 1.4,
    color: "green",
  },
  {
    id: "premium",
    label: "Премиум",
    description: "Премиальные материалы, авторский дизайн",
    includes: ["Натуральный камень", "Паркет из массива", "Умный дом", "Авторский надзор", "Дизайн-проект"],
    basePriceM2: 58000,
    priceCoeff: 2.0,
    color: "purple",
  },
  {
    id: "luxury",
    label: "Люкс",
    description: "Элитный ремонт без ограничений",
    includes: ["Итальянские материалы", "Эксклюзивная мебель", "Система умного дома", "Персональный менеджер"],
    basePriceM2: 105000,
    priceCoeff: 3.0,
    color: "amber",
  },
];

// ─── Типы напольного покрытия ────────────────────────────────────────────────

export interface FloorTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const FLOOR_TYPES: FloorTypeOption[] = [
  { id: "laminate",   label: "Ламинат 33 класс",       description: "Для комнат, коридора",            priceM2: 1200  },
  { id: "parquet",    label: "Паркетная доска",         description: "Комфорт и выше",                  priceM2: 2400 },
  { id: "tile-all",   label: "Керамогранит везде",      description: "Надёжно, влагостойко",            priceM2: 1800 },
  { id: "mixed",      label: "Комбинированный",         description: "Паркет в комнатах, плитка в кухне/ванной", priceM2: 1700 },
];

// ─── Типы потолков ────────────────────────────────────────────────────────────

export interface CeilingTypeOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const CEILING_TYPES: CeilingTypeOption[] = [
  { id: "paint",    label: "Покраска потолков",      description: "Шпаклёвка + покраска",       priceM2: 850  },
  { id: "stretch",  label: "Натяжные потолки",       description: "ПВХ или тканевое полотно",   priceM2: 1200  },
  { id: "mixed",    label: "Комбинированный",        description: "Покраска + натяжные в части", priceM2: 1050  },
];

// ─── Уровни санузлов ─────────────────────────────────────────────────────────

export interface BathroomLevelOption {
  id: string;
  label: string;
  description: string;
  pricePerUnit: number;
}

export const BATHROOM_LEVELS: BathroomLevelOption[] = [
  { id: "economy",  label: "Эконом",   description: "Плитка базовая, санфаянс стандарт",    pricePerUnit: 110000  },
  { id: "standard", label: "Стандарт", description: "Плитка хорошая, гидроизоляция, тёплый пол", pricePerUnit: 185000 },
  { id: "premium",  label: "Премиум",  description: "Дизайнерская плитка, инсталляция, премиум санфаянс", pricePerUnit: 320000 },
];

// ─── Регионы ─────────────────────────────────────────────────────────────────

export { CALC_REGIONS as REGIONS, DEFAULT_REGION_ID } from "@/components/calculator/shared/regions";

// ─── Конфиг квартиры ─────────────────────────────────────────────────────────

export interface TurnkeyConfig {
  id: string;
  apartmentType: string;
  totalAreaM2: number;
  kitchenAreaM2: number;
  bathroomCount: number;
  balconyCount: number;
  ceilingHeightM: number;
  renovationLevel: string;
  demolitionIncluded: boolean;
  electricsIncluded: boolean;
  plumbingIncluded: boolean;
  plastersIncluded: boolean;
  floorsIncluded: boolean;
  floorType: string;
  ceilingsIncluded: boolean;
  ceilingType: string;
  bathroomIncluded: boolean;
  bathroomLevel: string;
  kitchenIncluded: boolean;
  doorsIncluded: boolean;
  doorsCount: number;
  windowslopeIncluded: boolean;
  furnitureAssembly: boolean;
  cleaningIncluded: boolean;
  foremanIncluded: boolean;
  foremanPct: number;
  supplierIncluded: boolean;
  supplierPct: number;
  note: string;
  totalPrice: number;
}

// ─── Дефолтный конфиг ────────────────────────────────────────────────────────

export const DEFAULT_TURNKEY_CONFIG: Omit<TurnkeyConfig, "id" | "totalPrice"> = {
  apartmentType: "2room",
  totalAreaM2: 62,
  kitchenAreaM2: 12,
  bathroomCount: 1,
  balconyCount: 1,
  ceilingHeightM: 2.8,
  renovationLevel: "standard",
  demolitionIncluded: true,
  electricsIncluded: true,
  plumbingIncluded: true,
  plastersIncluded: true,
  floorsIncluded: true,
  floorType: "laminate",
  ceilingsIncluded: true,
  ceilingType: "paint",
  bathroomIncluded: true,
  bathroomLevel: "standard",
  kitchenIncluded: false,
  doorsIncluded: true,
  doorsCount: 4,
  windowslopeIncluded: true,
  furnitureAssembly: false,
  cleaningIncluded: true,
  foremanIncluded: false,
  foremanPct: 10,
  supplierIncluded: false,
  supplierPct: 5,
  note: "",
};