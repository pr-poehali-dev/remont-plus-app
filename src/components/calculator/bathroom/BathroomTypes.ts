// ─── Типы санузлов ────────────────────────────────────────────────────────────

export interface BathroomTypeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
  priceCoeff: number;
}

export const BATHROOM_TYPES: BathroomTypeOption[] = [
  { id: "combined",  label: "Совмещённый",    icon: "Bath",         description: "Ванна + туалет вместе",              priceCoeff: 1.0  },
  { id: "bathroom",  label: "Ванная",         icon: "Droplets",     description: "Только ванна и раковина",            priceCoeff: 1.0  },
  { id: "shower",    label: "Душевая",        icon: "ShowerHead",   description: "Душевая кабина/поддон",              priceCoeff: 0.95 },
  { id: "toilet",    label: "Туалет",         icon: "FlaskConical", description: "Отдельный санузел",                  priceCoeff: 0.85 },
  { id: "laundry",   label: "Постирочная",    icon: "Wind",         description: "Постирочная / хозяйственная",        priceCoeff: 0.9  },
];

// ─── Варианты плитки пола ────────────────────────────────────────────────────

export interface TileOption {
  id: string;
  label: string;
  description: string;
  materialPriceM2: number;
  installPriceM2: number;
}

export const FLOOR_TILES: TileOption[] = [
  { id: "ceramic-std",    label: "Керамика стандарт",     description: "20×20–30×30 см, глянец/матт",        materialPriceM2: 1050, installPriceM2: 1200 },
  { id: "ceramic-prem",   label: "Керамика премиум",      description: "60×60 см, ректификат",               materialPriceM2: 2100, installPriceM2: 1450 },
  { id: "gres-std",       label: "Керамогранит базовый",  description: "60×60 см, матовый",                  materialPriceM2: 1850, installPriceM2: 1450 },
  { id: "gres-prem",      label: "Керамогранит премиум",  description: "80×80 или 120×60 см, крупный формат", materialPriceM2: 3700, installPriceM2: 2000 },
  { id: "mosaic",         label: "Мозаика",               description: "Стеклянная/каменная мозаика",         materialPriceM2: 4600, installPriceM2: 2600 },
  { id: "marble",         label: "Натуральный камень",    description: "Мрамор/травертин, слэбы",             materialPriceM2: 8000, installPriceM2: 3300 },
];

// ─── Варианты плитки стен ────────────────────────────────────────────────────

export const WALL_TILES: TileOption[] = [
  { id: "wall-ceramic-std",  label: "Керамика стандарт",  description: "20×30–30×60 см, глянец",             materialPriceM2: 950,  installPriceM2: 1050 },
  { id: "wall-ceramic-prem", label: "Керамика премиум",   description: "30×90 см, прямоугольная",            materialPriceM2: 2000, installPriceM2: 1300 },
  { id: "wall-gres",         label: "Керамогранит",       description: "60×120 см, крупный формат",          materialPriceM2: 2900, installPriceM2: 1850 },
  { id: "wall-mosaic",       label: "Мозаика",            description: "Стеклянная, декоративная",           materialPriceM2: 4200, installPriceM2: 2400 },
  { id: "wall-subway",       label: "Метро/кабанчик",     description: "10×20 см, метровая плитка",          materialPriceM2: 1350, installPriceM2: 1250 },
  { id: "wall-marble",       label: "Натуральный камень",  description: "Мраморные слябы",                   materialPriceM2: 7200, installPriceM2: 2900 },
];

// ─── Гидроизоляция ───────────────────────────────────────────────────────────

export interface WaterproofingOption {
  id: string;
  label: string;
  description: string;
  priceM2: number;
}

export const WATERPROOFING_TYPES: WaterproofingOption[] = [
  { id: "none",     label: "Без гидроизоляции", description: "Для туалета или небольших санузлов",       priceM2: 0    },
  { id: "coating",  label: "Обмазочная",         description: "Битумная или полимерная обмазка, 2 слоя", priceM2: 600  },
  { id: "membrane", label: "Рулонная мембрана",  description: "Наплавляемая/самоклеящаяся мембрана",    priceM2: 980  },
];

// ─── Регионы ─────────────────────────────────────────────────────────────────

export { CALC_REGIONS as REGIONS, DEFAULT_REGION_ID } from "@/components/calculator/shared/regions";

// ─── Конфиг зоны ─────────────────────────────────────────────────────────────

export interface BathroomConfig {
  id: string;
  roomName: string;
  bathroomType: string;
  area: number;
  wallArea: number;
  // Демонтаж
  demolitionIncluded: boolean;
  // Стяжка и гидроизоляция
  screedIncluded: boolean;
  waterproofingType: string;
  // Плитка пол
  floorTileId: string;
  // Плитка стены
  wallTileId: string;
  wallTileHeightM: number;
  // Сантехника
  toiletInstall: boolean;
  sinkInstall: boolean;
  bathInstall: boolean;
  showerCabinInstall: boolean;
  mixersCount: number;
  installationSystemIncluded: boolean;
  // Вентиляция
  ventilationIncluded: boolean;
  // Тёплый пол
  heatedFloorIncluded: boolean;
  heatedFloorType: string;
  // Мебель и аксессуары
  vanityInstall: boolean;
  mirrorInstall: boolean;
  accessoriesIncluded: boolean;
  note: string;
  totalPrice: number;
}

// ─── Дефолтный конфиг ────────────────────────────────────────────────────────

export const DEFAULT_BATHROOM_CONFIG: Omit<BathroomConfig, "id" | "totalPrice"> = {
  roomName: "",
  bathroomType: "combined",
  area: 5,
  wallArea: 20,
  demolitionIncluded: true,
  screedIncluded: true,
  waterproofingType: "coating",
  floorTileId: "gres-std",
  wallTileId: "wall-ceramic-std",
  wallTileHeightM: 2.5,
  toiletInstall: true,
  sinkInstall: true,
  bathInstall: false,
  showerCabinInstall: false,
  mixersCount: 1,
  installationSystemIncluded: false,
  ventilationIncluded: true,
  heatedFloorIncluded: false,
  heatedFloorType: "electric",
  vanityInstall: false,
  mirrorInstall: true,
  accessoriesIncluded: true,
  note: "",
};