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
      { category: "Работы", name: "Демонтаж старой плитки", unit: "м²", quantity: 15, price: 550 },
      { category: "Работы", name: "Гидроизоляция (обмазочная)", unit: "м²", quantity: 5, price: 800 },
      { category: "Работы", name: "Штукатурка стен (машинная)", unit: "м²", quantity: 18, price: 800 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 18, price: 2150 },
      { category: "Работы", name: "Укладка плитки на пол", unit: "м²", quantity: 5, price: 2500 },
      { category: "Работы", name: "Затирка швов плитки", unit: "м²", quantity: 23, price: 350 },
      { category: "Работы", name: "Установка смесителя", unit: "шт", quantity: 1, price: 2700 },
      { category: "Работы", name: "Установка унитаза", unit: "шт", quantity: 1, price: 6300 },
      { category: "Работы", name: "Разводка труб ХВС/ГВС (полипропилен)", unit: "пм", quantity: 8, price: 1100 },
      { category: "Работы", name: "Замена труб канализации", unit: "пм", quantity: 4, price: 1800 },
    ],
  },
  {
    id: "bathroom-standard",
    name: "Ванная стандарт",
    description: "Полный ремонт ванной с тёплым полом, натяжным потолком и инсталляцией",
    icon: "Bath",
    category: "bathroom",
    items: [
      { category: "Работы", name: "Демонтаж старой плитки", unit: "м²", quantity: 15, price: 550 },
      { category: "Работы", name: "Гидроизоляция (обмазочная)", unit: "м²", quantity: 5, price: 800 },
      { category: "Работы", name: "Штукатурка стен (ручная)", unit: "м²", quantity: 18, price: 1000 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 18, price: 2150 },
      { category: "Работы", name: "Укладка керамогранита", unit: "м²", quantity: 5, price: 2900 },
      { category: "Работы", name: "Затирка швов плитки", unit: "м²", quantity: 23, price: 350 },
      { category: "Работы", name: "Монтаж тёплого пола (электрический)", unit: "м²", quantity: 4, price: 1450 },
      { category: "Работы", name: "Монтаж натяжного потолка", unit: "м²", quantity: 5, price: 1250 },
      { category: "Работы", name: "Установка инсталляции", unit: "шт", quantity: 1, price: 9000 },
      { category: "Работы", name: "Установка смесителя", unit: "шт", quantity: 1, price: 2700 },
      { category: "Работы", name: "Разводка труб ХВС/ГВС (металлопластик)", unit: "пм", quantity: 10, price: 1250 },
      { category: "Работы", name: "Замена труб канализации", unit: "пм", quantity: 5, price: 1800 },
    ],
  },
  {
    id: "kitchen-economy",
    name: "Кухня эконом",
    description: "Косметический ремонт кухни: стены, пол, потолок, базовая электрика",
    icon: "UtensilsCrossed",
    category: "kitchen",
    items: [
      { category: "Работы", name: "Шпатлёвка стен под обои", unit: "м²", quantity: 32, price: 650 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 32, price: 550 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 6, price: 2150 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 12, price: 900 },
      { category: "Работы", name: "Шпатлёвка потолка", unit: "м²", quantity: 12, price: 800 },
      { category: "Работы", name: "Покраска потолка", unit: "м²", quantity: 12, price: 650 },
      { category: "Работы", name: "Установка розетки (скрытая)", unit: "шт", quantity: 6, price: 900 },
    ],
  },
  {
    id: "kitchen-standard",
    name: "Кухня стандарт",
    description: "Полный ремонт кухни с натяжным потолком, тёплым полом и новой проводкой",
    icon: "UtensilsCrossed",
    category: "kitchen",
    items: [
      { category: "Работы", name: "Демонтаж старого пола", unit: "м²", quantity: 12, price: 450 },
      { category: "Работы", name: "Штукатурка стен (машинная)", unit: "м²", quantity: 32, price: 800 },
      { category: "Работы", name: "Шпатлёвка стен под покраску", unit: "м²", quantity: 32, price: 900 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 26, price: 550 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 6, price: 2150 },
      { category: "Работы", name: "Укладка керамогранита", unit: "м²", quantity: 12, price: 2900 },
      { category: "Работы", name: "Монтаж тёплого пола (электрический)", unit: "м²", quantity: 10, price: 1450 },
      { category: "Работы", name: "Монтаж натяжного потолка", unit: "м²", quantity: 12, price: 1250 },
      { category: "Работы", name: "Прокладка кабеля в штробе", unit: "пм", quantity: 30, price: 250 },
      { category: "Работы", name: "Штробление стен под кабель", unit: "пм", quantity: 15, price: 650 },
      { category: "Работы", name: "Установка смесителя", unit: "шт", quantity: 1, price: 2700 },
    ],
  },
  {
    id: "room-economy",
    name: "Комната (спальня/гостиная) эконом",
    description: "Косметический ремонт: стены, потолок, пол, минимум работ",
    icon: "BedDouble",
    category: "room",
    items: [
      { category: "Работы", name: "Демонтаж старых обоев", unit: "м²", quantity: 52, price: 200 },
      { category: "Работы", name: "Шпатлёвка стен под обои", unit: "м²", quantity: 52, price: 650 },
      { category: "Работы", name: "Поклейка обоев (флизелиновые)", unit: "м²", quantity: 52, price: 900 },
      { category: "Работы", name: "Шпатлёвка потолка", unit: "м²", quantity: 18, price: 800 },
      { category: "Работы", name: "Покраска потолка", unit: "м²", quantity: 18, price: 650 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 18, price: 900 },
      { category: "Работы", name: "Установка розетки (скрытая)", unit: "шт", quantity: 5, price: 900 },
    ],
  },
  {
    id: "room-standard",
    name: "Комната стандарт",
    description: "Полный ремонт комнаты: выравнивание, обои, натяжной потолок, ламинат",
    icon: "BedDouble",
    category: "room",
    items: [
      { category: "Работы", name: "Демонтаж старых обоев", unit: "м²", quantity: 52, price: 200 },
      { category: "Работы", name: "Демонтаж старого пола", unit: "м²", quantity: 18, price: 450 },
      { category: "Работы", name: "Штукатурка стен (машинная)", unit: "м²", quantity: 52, price: 800 },
      { category: "Работы", name: "Шпатлёвка стен под обои", unit: "м²", quantity: 52, price: 650 },
      { category: "Работы", name: "Поклейка обоев (флизелиновые)", unit: "м²", quantity: 52, price: 900 },
      { category: "Работы", name: "Монтаж натяжного потолка", unit: "м²", quantity: 18, price: 1250 },
      { category: "Работы", name: "Стяжка пола (цементно-песчаная)", unit: "м²", quantity: 18, price: 1100 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 18, price: 900 },
      { category: "Работы", name: "Прокладка кабеля в штробе", unit: "пм", quantity: 20, price: 250 },
      { category: "Работы", name: "Установка розетки (скрытая)", unit: "шт", quantity: 5, price: 900 },
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
      { category: "Работы", name: "Демонтаж старых обоев", unit: "м²", quantity: 180, price: 200 },
      { category: "Работы", name: "Демонтаж старого пола", unit: "м²", quantity: 55, price: 450 },
      { category: "Работы", name: "Демонтаж старой плитки", unit: "м²", quantity: 22, price: 550 },
      { category: "Работы", name: "Штукатурка стен (машинная)", unit: "м²", quantity: 180, price: 800 },
      { category: "Работы", name: "Шпатлёвка стен под обои", unit: "м²", quantity: 100, price: 650 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 80, price: 550 },
      { category: "Работы", name: "Поклейка обоев (флизелиновые)", unit: "м²", quantity: 100, price: 900 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 22, price: 2150 },
      { category: "Работы", name: "Укладка плитки на пол", unit: "м²", quantity: 5, price: 2500 },
      { category: "Работы", name: "Затирка швов плитки", unit: "м²", quantity: 27, price: 350 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 40, price: 900 },
      { category: "Работы", name: "Стяжка пола (цементно-песчаная)", unit: "м²", quantity: 55, price: 1100 },
      { category: "Работы", name: "Шпатлёвка потолка", unit: "м²", quantity: 55, price: 800 },
      { category: "Работы", name: "Покраска потолка", unit: "м²", quantity: 55, price: 650 },
      { category: "Работы", name: "Прокладка кабеля в штробе", unit: "пм", quantity: 150, price: 250 },
      { category: "Работы", name: "Штробление стен под кабель", unit: "пм", quantity: 80, price: 650 },
      { category: "Работы", name: "Разводка труб ХВС/ГВС (полипропилен)", unit: "пм", quantity: 12, price: 1100 },
      { category: "Работы", name: "Замена труб канализации", unit: "пм", quantity: 6, price: 1800 },
      { category: "Работы", name: "Установка смесителя", unit: "шт", quantity: 4, price: 2700 },
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
      { category: "Работы", name: "Демонтаж старых обоев", unit: "м²", quantity: 180, price: 200 },
      { category: "Работы", name: "Демонтаж старого пола", unit: "м²", quantity: 55, price: 450 },
      { category: "Работы", name: "Демонтаж старой плитки", unit: "м²", quantity: 22, price: 550 },
      { category: "Работы", name: "Штукатурка стен (машинная)", unit: "м²", quantity: 180, price: 800 },
      { category: "Работы", name: "Шпатлёвка стен под покраску", unit: "м²", quantity: 80, price: 900 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 80, price: 550 },
      { category: "Работы", name: "Поклейка обоев (флизелиновые)", unit: "м²", quantity: 100, price: 900 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 22, price: 2150 },
      { category: "Работы", name: "Укладка керамогранита", unit: "м²", quantity: 25, price: 2900 },
      { category: "Работы", name: "Затирка швов плитки", unit: "м²", quantity: 27, price: 350 },
      { category: "Работы", name: "Монтаж тёплого пола (электрический)", unit: "м²", quantity: 15, price: 1450 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 30, price: 900 },
      { category: "Работы", name: "Стяжка пола (цементно-песчаная)", unit: "м²", quantity: 55, price: 1100 },
      { category: "Работы", name: "Монтаж натяжного потолка", unit: "м²", quantity: 55, price: 1250 },
      { category: "Работы", name: "Прокладка кабеля в штробе", unit: "пм", quantity: 180, price: 250 },
      { category: "Работы", name: "Штробление стен под кабель", unit: "пм", quantity: 100, price: 650 },
      { category: "Работы", name: "Разводка труб ХВС/ГВС (металлопластик)", unit: "пм", quantity: 15, price: 1250 },
      { category: "Работы", name: "Замена труб канализации", unit: "пм", quantity: 8, price: 1800 },
      { category: "Работы", name: "Установка инсталляции", unit: "шт", quantity: 1, price: 9000 },
      { category: "Работы", name: "Установка смесителя", unit: "шт", quantity: 4, price: 2700 },
    ],
  },
  {
    id: "apartment-full-cleaning",
    name: "Квартира под ключ + клининг и вывоз мусора",
    description: "Комплексный ремонт ~55 м² с финальной уборкой и вывозом всего строительного мусора",
    icon: "Sparkles",
    category: "full",
    baseArea: 55,
    items: [
      { category: "Работы", name: "Демонтаж старых обоев", unit: "м²", quantity: 180, price: 200 },
      { category: "Работы", name: "Демонтаж старого пола", unit: "м²", quantity: 55, price: 450 },
      { category: "Работы", name: "Демонтаж старой плитки", unit: "м²", quantity: 22, price: 550 },
      { category: "Работы", name: "Штукатурка стен (машинная)", unit: "м²", quantity: 180, price: 800 },
      { category: "Работы", name: "Шпатлёвка стен под обои", unit: "м²", quantity: 100, price: 650 },
      { category: "Работы", name: "Покраска стен", unit: "м²", quantity: 80, price: 550 },
      { category: "Работы", name: "Поклейка обоев (флизелиновые)", unit: "м²", quantity: 100, price: 900 },
      { category: "Работы", name: "Укладка плитки на стены", unit: "м²", quantity: 22, price: 2150 },
      { category: "Работы", name: "Укладка плитки на пол", unit: "м²", quantity: 5, price: 2500 },
      { category: "Работы", name: "Затирка швов плитки", unit: "м²", quantity: 27, price: 350 },
      { category: "Работы", name: "Укладка ламината", unit: "м²", quantity: 40, price: 900 },
      { category: "Работы", name: "Стяжка пола (цементно-песчаная)", unit: "м²", quantity: 55, price: 1100 },
      { category: "Работы", name: "Шпатлёвка потолка", unit: "м²", quantity: 55, price: 800 },
      { category: "Работы", name: "Покраска потолка", unit: "м²", quantity: 55, price: 650 },
      { category: "Работы", name: "Прокладка кабеля в штробе", unit: "пм", quantity: 150, price: 250 },
      { category: "Работы", name: "Штробление стен под кабель", unit: "пм", quantity: 80, price: 650 },
      { category: "Работы", name: "Разводка труб ХВС/ГВС (полипропилен)", unit: "пм", quantity: 12, price: 1100 },
      { category: "Работы", name: "Замена труб канализации", unit: "пм", quantity: 6, price: 1800 },
      { category: "Работы", name: "Установка смесителя", unit: "шт", quantity: 4, price: 2700 },
      { category: "Работы", name: "Вывоз строительного мусора (1–5 м³)", unit: "м³", quantity: 4, price: 2000 },
      { category: "Работы", name: "Уборка после ремонта (черновая)", unit: "м²", quantity: 55, price: 80 },
      { category: "Работы", name: "Уборка после ремонта (чистовая)", unit: "м²", quantity: 55, price: 120 },
      { category: "Работы", name: "Мытьё окон (двустворчатое)", unit: "шт.", quantity: 4, price: 550 },
      { category: "Работы", name: "Уборка ванной комнаты", unit: "шт.", quantity: 1, price: 2500 },
      { category: "Работы", name: "Уборка кухни", unit: "шт.", quantity: 1, price: 2800 },
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
