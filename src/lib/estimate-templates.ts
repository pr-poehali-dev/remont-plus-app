import type { EstimateItem } from "@/pages/Calculator";

export interface EstimateTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "bathroom" | "kitchen" | "room" | "full" | "custom";
  baseArea?: number;
  items: Omit<EstimateItem, "id" | "total">[];
}

// Единицы измерения, которые масштабируются пропорционально площади
const SCALABLE_UNITS = new Set(["м²", "пм", "т.ч"]);

export function scaleTemplateItems(
  items: Omit<EstimateItem, "id" | "total">[],
  baseArea: number,
  targetArea: number
): Omit<EstimateItem, "id" | "total">[] {
  const ratio = targetArea / baseArea;
  return items.map((item) => ({
    ...item,
    quantity: SCALABLE_UNITS.has(item.unit)
      ? Math.round(item.quantity * ratio)
      : item.quantity,
  }));
}

export const PRESET_TEMPLATES: EstimateTemplate[] = [
  {
    id: "bathroom-economy",
    name: "Ванная эконом",
    description: "Базовый ремонт ванной: демонтаж, штукатурка, плитка, сантехника",
    icon: "Bath",
    category: "bathroom",
    items: [
      { category: "Работы", name: "Демонтажные работы", unit: "м²", quantity: 15, price: 350 },
      { category: "Работы", name: "Штукатурка стен", unit: "м²", quantity: 18, price: 450 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 18, price: 900 },
      { category: "Работы", name: "Укладка плитки на пол", unit: "м²", quantity: 5, price: 1100 },
      { category: "Работы", name: "Установка смесителя для ванны", unit: "шт", quantity: 1, price: 1500 },
      { category: "Работы", name: "Установка унитаза", unit: "шт", quantity: 1, price: 2500 },
      { category: "Работы", name: "Монтаж труб водоснабжения", unit: "пм", quantity: 8, price: 600 },
      { category: "Работы", name: "Монтаж труб канализации", unit: "пм", quantity: 4, price: 700 },
      { category: "Работы", name: "Электромонтаж", unit: "т.ч", quantity: 8, price: 1800 },
    ],
  },
  {
    id: "bathroom-standard",
    name: "Ванная стандарт",
    description: "Полный ремонт ванной с тёплым полом, натяжным потолком и инсталляцией",
    icon: "Bath",
    category: "bathroom",
    items: [
      { category: "Работы", name: "Демонтажные работы", unit: "м²", quantity: 15, price: 350 },
      { category: "Работы", name: "Штукатурка стен", unit: "м²", quantity: 18, price: 450 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 18, price: 1100 },
      { category: "Работы", name: "Укладка плитки на пол (керамогранит)", unit: "м²", quantity: 5, price: 1400 },
      { category: "Работы", name: "Тёплый пол электрический монтаж", unit: "м²", quantity: 4, price: 800 },
      { category: "Работы", name: "Натяжной потолок", unit: "м²", quantity: 5, price: 1200 },
      { category: "Работы", name: "Установка инсталляции для унитаза", unit: "шт", quantity: 1, price: 4500 },
      { category: "Работы", name: "Установка смесителя для ванны", unit: "шт", quantity: 1, price: 1500 },
      { category: "Работы", name: "Монтаж труб водоснабжения", unit: "пм", quantity: 10, price: 600 },
      { category: "Работы", name: "Монтаж труб канализации", unit: "пм", quantity: 5, price: 700 },
      { category: "Работы", name: "Электромонтаж", unit: "т.ч", quantity: 12, price: 1800 },
    ],
  },
  {
    id: "kitchen-economy",
    name: "Кухня эконом",
    description: "Косметический ремонт кухни: стены, пол, потолок, базовая электрика",
    icon: "UtensilsCrossed",
    category: "kitchen",
    items: [
      { category: "Работы", name: "Шпаклёвка стен", unit: "м²", quantity: 32, price: 350 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 32, price: 280 },
      { category: "Работы", name: "Укладка плитки на фартук", unit: "м²", quantity: 6, price: 900 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 12, price: 450 },
      { category: "Работы", name: "Шпаклёвка потолка", unit: "м²", quantity: 12, price: 320 },
      { category: "Работы", name: "Покраска потолка", unit: "м²", quantity: 12, price: 250 },
      { category: "Работы", name: "Установка розеток и выключателей", unit: "шт", quantity: 6, price: 500 },
    ],
  },
  {
    id: "kitchen-standard",
    name: "Кухня стандарт",
    description: "Полный ремонт кухни с натяжным потолком, теплым полом и новой проводкой",
    icon: "UtensilsCrossed",
    category: "kitchen",
    items: [
      { category: "Работы", name: "Демонтажные работы", unit: "м²", quantity: 12, price: 350 },
      { category: "Работы", name: "Штукатурка стен", unit: "м²", quantity: 32, price: 450 },
      { category: "Работы", name: "Шпаклёвка стен", unit: "м²", quantity: 32, price: 350 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 26, price: 280 },
      { category: "Работы", name: "Укладка плитки на фартук", unit: "м²", quantity: 6, price: 1100 },
      { category: "Работы", name: "Укладка керамогранита на пол", unit: "м²", quantity: 12, price: 1200 },
      { category: "Работы", name: "Тёплый пол электрический монтаж", unit: "м²", quantity: 10, price: 800 },
      { category: "Работы", name: "Натяжной потолок", unit: "м²", quantity: 12, price: 1200 },
      { category: "Работы", name: "Электромонтаж", unit: "т.ч", quantity: 16, price: 1800 },
      { category: "Работы", name: "Установка смесителя для кухни", unit: "шт", quantity: 1, price: 1200 },
    ],
  },
  {
    id: "room-economy",
    name: "Комната (спальня/гостиная) эконом",
    description: "Косметический ремонт: стены, потолок, пол, минимум работ",
    icon: "BedDouble",
    category: "room",
    items: [
      { category: "Работы", name: "Шпаклёвка стен", unit: "м²", quantity: 52, price: 350 },
      { category: "Работы", name: "Поклейка обоев", unit: "м²", quantity: 52, price: 350 },
      { category: "Работы", name: "Шпаклёвка потолка", unit: "м²", quantity: 18, price: 320 },
      { category: "Работы", name: "Покраска потолка", unit: "м²", quantity: 18, price: 250 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 18, price: 450 },
      { category: "Работы", name: "Установка розеток и выключателей", unit: "шт", quantity: 5, price: 500 },
    ],
  },
  {
    id: "room-standard",
    name: "Комната стандарт",
    description: "Полный ремонт комнаты: выравнивание, обои, натяжной потолок, ламинат",
    icon: "BedDouble",
    category: "room",
    items: [
      { category: "Работы", name: "Демонтажные работы", unit: "м²", quantity: 18, price: 350 },
      { category: "Работы", name: "Штукатурка стен", unit: "м²", quantity: 52, price: 450 },
      { category: "Работы", name: "Шпаклёвка стен", unit: "м²", quantity: 52, price: 350 },
      { category: "Работы", name: "Поклейка обоев", unit: "м²", quantity: 52, price: 380 },
      { category: "Работы", name: "Натяжной потолок", unit: "м²", quantity: 18, price: 1200 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 18, price: 500 },
      { category: "Работы", name: "Стяжка пола", unit: "м²", quantity: 18, price: 650 },
      { category: "Работы", name: "Электромонтаж", unit: "т.ч", quantity: 10, price: 1800 },
    ],
  },
  {
    id: "apartment-economy",
    name: "Квартира под ключ эконом",
    description: "Комплексный ремонт 2-комнатной квартиры ~55 м²: всё необходимое без излишеств",
    icon: "Home",
    category: "full",
    baseArea: 55,
    items: [
      { category: "Работы", name: "Демонтажные работы", unit: "м²", quantity: 55, price: 350 },
      { category: "Работы", name: "Штукатурка стен", unit: "м²", quantity: 180, price: 450 },
      { category: "Работы", name: "Шпаклёвка стен", unit: "м²", quantity: 180, price: 350 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 100, price: 280 },
      { category: "Работы", name: "Поклейка обоев", unit: "м²", quantity: 80, price: 350 },
      { category: "Работы", name: "Укладка плитки на стены (ванная)", unit: "м²", quantity: 22, price: 900 },
      { category: "Работы", name: "Укладка плитки на пол (ванная)", unit: "м²", quantity: 5, price: 1100 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 40, price: 450 },
      { category: "Работы", name: "Стяжка пола", unit: "м²", quantity: 55, price: 650 },
      { category: "Работы", name: "Шпаклёвка потолков", unit: "м²", quantity: 55, price: 320 },
      { category: "Работы", name: "Покраска потолков", unit: "м²", quantity: 55, price: 250 },
      { category: "Работы", name: "Электромонтаж", unit: "т.ч", quantity: 40, price: 1800 },
      { category: "Работы", name: "Монтаж труб водоснабжения", unit: "пм", quantity: 12, price: 600 },
      { category: "Работы", name: "Монтаж труб канализации", unit: "пм", quantity: 6, price: 700 },
      { category: "Работы", name: "Установка смесителей и сантехники", unit: "шт", quantity: 4, price: 1500 },
    ],
  },
  {
    id: "apartment-standard",
    name: "Квартира под ключ стандарт",
    description: "Полный ремонт 2-комнатной квартиры ~55 м² с натяжными потолками и тёплым полом",
    icon: "Building2",
    category: "full",
    baseArea: 55,
    items: [
      { category: "Работы", name: "Демонтажные работы", unit: "м²", quantity: 55, price: 400 },
      { category: "Работы", name: "Штукатурка стен", unit: "м²", quantity: 180, price: 500 },
      { category: "Работы", name: "Шпаклёвка стен", unit: "м²", quantity: 180, price: 380 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 80, price: 320 },
      { category: "Работы", name: "Поклейка обоев", unit: "м²", quantity: 100, price: 400 },
      { category: "Работы", name: "Укладка плитки на стены (ванная)", unit: "м²", quantity: 22, price: 1100 },
      { category: "Работы", name: "Укладка керамогранита на пол", unit: "м²", quantity: 25, price: 1300 },
      { category: "Работы", name: "Тёплый пол электрический монтаж", unit: "м²", quantity: 15, price: 800 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 30, price: 550 },
      { category: "Работы", name: "Стяжка пола", unit: "м²", quantity: 55, price: 700 },
      { category: "Работы", name: "Натяжной потолок", unit: "м²", quantity: 55, price: 1200 },
      { category: "Работы", name: "Электромонтаж", unit: "т.ч", quantity: 48, price: 1800 },
      { category: "Работы", name: "Монтаж труб водоснабжения", unit: "пм", quantity: 15, price: 650 },
      { category: "Работы", name: "Монтаж труб канализации", unit: "пм", quantity: 8, price: 750 },
      { category: "Работы", name: "Установка инсталляции для унитаза", unit: "шт", quantity: 1, price: 4500 },
      { category: "Работы", name: "Установка смесителей и сантехники", unit: "шт", quantity: 4, price: 1800 },
      { category: "Работы", name: "Монтаж радиаторов отопления", unit: "шт", quantity: 5, price: 2200 },
    ],
  },
];

const CUSTOM_TEMPLATES_KEY = "avangard_custom_templates";

export interface SavedTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: "custom";
  savedAt: string;
  items: EstimateItem[];
}

export function getCustomTemplates(): SavedTemplate[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TEMPLATES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomTemplate(name: string, description: string, items: EstimateItem[]): SavedTemplate {
  const templates = getCustomTemplates();
  const template: SavedTemplate = {
    id: `custom-${Date.now()}`,
    name,
    description,
    icon: "Star",
    category: "custom",
    savedAt: new Date().toLocaleDateString("ru-RU"),
    items,
  };
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify([template, ...templates]));
  return template;
}

export function deleteCustomTemplate(id: string) {
  const templates = getCustomTemplates().filter((t) => t.id !== id);
  localStorage.setItem(CUSTOM_TEMPLATES_KEY, JSON.stringify(templates));
}