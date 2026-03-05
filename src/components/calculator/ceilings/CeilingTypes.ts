// ─── Типы натяжных потолков ──────────────────────────────────────────────────

export type CeilingType =
  | "matte"          // Матовый
  | "glossy"         // Глянцевый
  | "satin"          // Сатиновый
  | "fabric"         // Тканевый
  | "photo"          // С фотопечатью
  | "perforated"     // Перфорированный
  | "translucent";   // Светопрозрачный

export interface CeilingTypeOption {
  value: CeilingType;
  label: string;
  icon: string;
  description: string;
  priceCoeff: number;
}

export const CEILING_TYPES: CeilingTypeOption[] = [
  { value: "matte",       label: "Матовый",          icon: "Square",      description: "Классический матовый финиш, скрывает неровности", priceCoeff: 1.0  },
  { value: "glossy",      label: "Глянцевый",        icon: "Sparkles",    description: "Зеркальный эффект, визуально увеличивает комнату", priceCoeff: 1.15 },
  { value: "satin",       label: "Сатиновый",        icon: "Star",        description: "Шёлковый блеск, премиальный вид",                 priceCoeff: 1.2  },
  { value: "fabric",      label: "Тканевый",         icon: "Layers",      description: "Дышащий материал, лучшая акустика",               priceCoeff: 1.35 },
  { value: "photo",       label: "Фотопечать",       icon: "Image",       description: "Любой рисунок или изображение",                   priceCoeff: 1.6  },
  { value: "perforated",  label: "Перфорированный",  icon: "Grid3x3",     description: "С отверстиями для встроенных светильников",       priceCoeff: 1.25 },
  { value: "translucent", label: "Светопрозрачный",  icon: "Sun",         description: "Равномерная подсветка через полотно",             priceCoeff: 1.75 },
];

// ─── Уровни потолка ──────────────────────────────────────────────────────────

export type CeilingLevel = "single" | "double" | "triple";

export const CEILING_LEVELS: { value: CeilingLevel; label: string; priceCoeff: number }[] = [
  { value: "single", label: "Одноуровневый",   priceCoeff: 1.0  },
  { value: "double", label: "Двухуровневый",   priceCoeff: 1.55 },
  { value: "triple", label: "Трёхуровневый",   priceCoeff: 2.1  },
];

// ─── Бренды плёнки ───────────────────────────────────────────────────────────

export interface CeilingBrand {
  id: string;
  name: string;
  country: string;
  description: string;
  priceCoeff: number;
}

export const CEILING_BRANDS: CeilingBrand[] = [
  { id: "lackfolie",  name: "Lackfolie",  country: "Германия",  description: "Немецкое качество, срок 15 лет",         priceCoeff: 1.0  },
  { id: "pongs",      name: "Pongs",      country: "Германия",  description: "Ведущий производитель ПВХ-плёнки",       priceCoeff: 1.1  },
  { id: "extenzo",    name: "Extenzo",    country: "Франция",   description: "Французский бренд, широкая палитра",      priceCoeff: 1.2  },
  { id: "barrisol",   name: "Barrisol",   country: "Франция",   description: "Премиум, патентованная технология",       priceCoeff: 1.65 },
  { id: "clipso",     name: "Clipso",     country: "Швейцария", description: "Безгарпунная система, тканевые полотна",  priceCoeff: 1.4  },
  { id: "natasha",    name: "Наташа",     country: "Россия",    description: "Российское производство, доступная цена", priceCoeff: 0.85 },
  { id: "pvc_noname", name: "Стандарт",   country: "Россия",    description: "Бюджетная ПВХ-плёнка",                   priceCoeff: 0.75 },
];

// ─── Цвет / группа цвета ─────────────────────────────────────────────────────

export const CEILING_COLORS = [
  { id: "white",     label: "Белый",         priceAdd: 0    },
  { id: "light",     label: "Светлые тона",  priceAdd: 200  },
  { id: "dark",      label: "Тёмные тона",   priceAdd: 340  },
  { id: "metallic",  label: "Металлик",      priceAdd: 480  },
  { id: "custom",    label: "Под заказ",     priceAdd: 950  },
];

// ─── Освещение ───────────────────────────────────────────────────────────────

export interface LightingOption {
  id: string;
  name: string;
  description: string;
  pricePerUnit: number;
  unit: string;
}

export const LIGHTING_OPTIONS: LightingOption[] = [
  { id: "none",        name: "Без подсветки",         description: "Без встроенного освещения",              pricePerUnit: 0,    unit: "" },
  { id: "spot",        name: "Точечные светильники",  description: "Врезные споты (цена за отверстие)",      pricePerUnit: 480,  unit: "шт." },
  { id: "led_perim",   name: "LED по периметру",      description: "Светодиодная лента по контуру (пм)",     pricePerUnit: 620,  unit: "пм" },
  { id: "rgb_perim",   name: "RGB по периметру",      description: "Цветная RGB-лента + контроллер (пм)",    pricePerUnit: 890,  unit: "пм" },
  { id: "backlight",   name: "Фоновая подсветка",     description: "Подсветка за потолком равномерная (м²)", pricePerUnit: 1100, unit: "м²" },
];

// ─── Профиль крепления ───────────────────────────────────────────────────────

export const PROFILE_OPTIONS = [
  { id: "garpun",    label: "Гарпунный",      description: "Стандартное крепление ПВХ", priceCoeff: 1.0  },
  { id: "shtapik",   label: "Штапиковый",     description: "Безгарпунный, тканевые",    priceCoeff: 1.1  },
  { id: "klinovoy",  label: "Клиновой",       description: "Бюджетное крепление",       priceCoeff: 0.9  },
];

// ─── Регионы ─────────────────────────────────────────────────────────────────

export { CALC_REGIONS as CEILING_REGIONS } from "@/components/calculator/shared/regions";

// ─── Конфиг ───────────────────────────────────────────────────────────────────

export interface CeilingConfig {
  id: string;
  roomName: string;     // название помещения
  ceilingType: CeilingType;
  level: CeilingLevel;
  brandId: string;
  colorId: string;
  area: number;         // м²
  perimeter: number;    // пм
  lightingId: string;
  lightingCount: number;
  profileId: string;
  installationIncluded: boolean;
  regionId: string;
  note: string;
  totalPrice: number;
}

// ─── Базовые цены ─────────────────────────────────────────────────────────────

export const BASE_PRICE_PER_M2 = 1850; // руб/м² (матовый стандарт)
export const INSTALLATION_PRICE_PER_M2 = 480; // руб/м²