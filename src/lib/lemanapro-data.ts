export const BASE_URL = "https://samara.lemanapro.ru";
export const STORAGE_KEY = "avangard_lemanapro_estimate";

export type UnitType = "шт" | "м²" | "м" | "л" | "кг" | "рулон" | "комплект" | "упак";

export interface Subcategory {
  name: string;
  slug: string;
  unit: UnitType;
  packaging: number;
}

export interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: Subcategory[];
}

export interface EstimateSavedItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  quantity: number;
  price: number;
  unit: UnitType;
  packaging: number;
  note: string;
  addedAt: string;
}

export function getEstimateItems(): EstimateSavedItem[] {
  try {
    const items = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return items.map((i: EstimateSavedItem) => ({
      ...i,
      unit: i.unit || "шт",
      packaging: i.packaging || 1,
    }));
  } catch {
    return [];
  }
}

export function saveEstimateItems(items: EstimateSavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function roundUpToPackaging(quantity: number, packaging: number): number {
  if (packaging <= 1) return Math.ceil(quantity);
  return Math.ceil(quantity / packaging) * packaging;
}

export function subcategoryUrl(name: string) {
  return `${BASE_URL}/search/?q=${encodeURIComponent(name)}`;
}

export function categoryUrl(slug: string) {
  return `${BASE_URL}/catalogue/${slug}/`;
}

export const categories: Category[] = [
  {
    name: "Стройматериалы",
    slug: "stroymaterialy",
    icon: "Warehouse",
    description: "Сухие смеси, гипсокартон, утеплители, кирпич, блоки",
    subcategories: [
      { name: "Сухие смеси и грунтовки", slug: "suhie-smesi-i-gruntovki", unit: "кг", packaging: 25 },
      { name: "Гипсокартон", slug: "gipsokarton", unit: "шт", packaging: 1 },
      { name: "Утеплители", slug: "utepliteli", unit: "м²", packaging: 1 },
      { name: "Пиломатериалы", slug: "pilomaterialy", unit: "м", packaging: 1 },
      { name: "Кирпич и блоки", slug: "kirpich", unit: "шт", packaging: 1 },
      { name: "Цемент", slug: "cement", unit: "кг", packaging: 50 },
    ],
  },
  {
    name: "Плитка",
    slug: "plitka",
    icon: "Grid3x3",
    description: "Керамическая плитка, керамогранит, мозаика, клей",
    subcategories: [
      { name: "Настенная плитка", slug: "nastennaya-plitka", unit: "м²", packaging: 1 },
      { name: "Напольная плитка", slug: "napolnaya-plitka", unit: "м²", packaging: 1 },
      { name: "Керамогранит", slug: "keramogranit", unit: "м²", packaging: 1 },
      { name: "Мозаика", slug: "mozaika", unit: "м²", packaging: 1 },
      { name: "Клей для плитки", slug: "klei-dlya-plitki", unit: "кг", packaging: 25 },
      { name: "Затирки", slug: "zatirki", unit: "кг", packaging: 2 },
    ],
  },
  {
    name: "Сантехника",
    slug: "santehnika",
    icon: "Droplets",
    description: "Смесители, унитазы, раковины, ванны, душевые",
    subcategories: [
      { name: "Смесители", slug: "smesiteli", unit: "шт", packaging: 1 },
      { name: "Унитазы", slug: "unitazy", unit: "шт", packaging: 1 },
      { name: "Раковины", slug: "rakoviny", unit: "шт", packaging: 1 },
      { name: "Ванны", slug: "vanny", unit: "шт", packaging: 1 },
      { name: "Душевые кабины", slug: "dushevye-kabiny", unit: "шт", packaging: 1 },
      { name: "Полотенцесушители", slug: "polotentsesushiteli", unit: "шт", packaging: 1 },
    ],
  },
  {
    name: "Напольные покрытия",
    slug: "napolnye-pokrytiya",
    icon: "Layers",
    description: "Ламинат, линолеум, паркет, ковролин, подложка",
    subcategories: [
      { name: "Ламинат", slug: "laminat", unit: "м²", packaging: 1 },
      { name: "Линолеум", slug: "linoleum", unit: "м²", packaging: 1 },
      { name: "Паркет", slug: "parket", unit: "м²", packaging: 1 },
      { name: "Кварц-виниловая плитка", slug: "kvarts-vinilovaya-plitka", unit: "м²", packaging: 1 },
      { name: "Ковролин", slug: "kovrolin", unit: "м²", packaging: 1 },
      { name: "Подложка под напольные покрытия", slug: "podlozhka-pod-napolnye-pokrytiya", unit: "м²", packaging: 1 },
    ],
  },
  {
    name: "Краски",
    slug: "kraski",
    icon: "Paintbrush",
    description: "Интерьерные и фасадные краски, лаки, грунтовки",
    subcategories: [
      { name: "Интерьерные краски", slug: "interernye-kraski", unit: "л", packaging: 1 },
      { name: "Фасадные краски", slug: "fasadnye-kraski", unit: "л", packaging: 1 },
      { name: "Лаки", slug: "laki", unit: "л", packaging: 1 },
      { name: "Грунтовки", slug: "gruntovki", unit: "л", packaging: 1 },
      { name: "Эмали", slug: "emali", unit: "л", packaging: 1 },
      { name: "Колеровка", slug: "kolerovka", unit: "л", packaging: 1 },
    ],
  },
  {
    name: "Обои",
    slug: "oboi-dlya-sten-i-potolka",
    icon: "Wallpaper",
    description: "Виниловые, флизелиновые, бумажные обои и клей",
    subcategories: [
      { name: "Виниловые обои", slug: "vinilovye-oboi", unit: "рулон", packaging: 1 },
      { name: "Флизелиновые обои", slug: "flizelinovye-oboi", unit: "рулон", packaging: 1 },
      { name: "Обои под покраску", slug: "oboi-pod-pokrasku", unit: "рулон", packaging: 1 },
      { name: "Фотообои", slug: "fotooboi", unit: "шт", packaging: 1 },
      { name: "Клей для обоев", slug: "klei-dlya-oboev", unit: "упак", packaging: 1 },
    ],
  },
  {
    name: "Электрика",
    slug: "elektrotovary",
    icon: "Zap",
    description: "Кабели, розетки, выключатели, автоматы, щитки",
    subcategories: [
      { name: "Кабели и провода", slug: "kabeli-i-provoda", unit: "м", packaging: 1 },
      { name: "Розетки и выключатели", slug: "rozetki-i-vyklyuchateli", unit: "шт", packaging: 1 },
      { name: "Автоматы и УЗО", slug: "avtomaty-uzo", unit: "шт", packaging: 1 },
      { name: "Электрощитки", slug: "elektricheskie-shchity", unit: "шт", packaging: 1 },
      { name: "Удлинители", slug: "udliniteli", unit: "шт", packaging: 1 },
    ],
  },
  {
    name: "Освещение",
    slug: "osveshchenie",
    icon: "Lightbulb",
    description: "Люстры, светильники, бра, лампочки, споты",
    subcategories: [
      { name: "Люстры", slug: "lyustry", unit: "шт", packaging: 1 },
      { name: "Потолочные светильники", slug: "potolochnye-svetilniki", unit: "шт", packaging: 1 },
      { name: "Бра и настенные светильники", slug: "bra", unit: "шт", packaging: 1 },
      { name: "Точечные светильники", slug: "tochechnye-svetilniki", unit: "шт", packaging: 1 },
      { name: "Лампочки", slug: "lampochki", unit: "шт", packaging: 1 },
      { name: "Светодиодные ленты", slug: "svetodiodnye-lenty", unit: "м", packaging: 5 },
    ],
  },
  {
    name: "Двери",
    slug: "dveri",
    icon: "DoorOpen",
    description: "Межкомнатные, входные двери, фурнитура",
    subcategories: [
      { name: "Межкомнатные двери", slug: "mezhkomnatnye-dveri", unit: "шт", packaging: 1 },
      { name: "Входные двери", slug: "vhodnye-dveri", unit: "шт", packaging: 1 },
      { name: "Дверная фурнитура", slug: "dvernaya-furnitura", unit: "комплект", packaging: 1 },
      { name: "Арки и порталы", slug: "arki", unit: "шт", packaging: 1 },
    ],
  },
  {
    name: "Инструменты",
    slug: "instrumenty",
    icon: "Wrench",
    description: "Ручной и электроинструмент, расходники",
    subcategories: [
      { name: "Электроинструменты", slug: "elektroinstrumenty", unit: "шт", packaging: 1 },
      { name: "Ручной инструмент", slug: "ruchnoj-instrument", unit: "шт", packaging: 1 },
      { name: "Измерительный инструмент", slug: "izmeritelnyj-instrument", unit: "шт", packaging: 1 },
      { name: "Расходные материалы", slug: "rashodnye-materialy", unit: "упак", packaging: 1 },
    ],
  },
  {
    name: "Кухни",
    slug: "kukhni",
    icon: "CookingPot",
    description: "Кухонные гарнитуры, столешницы, мойки",
    subcategories: [
      { name: "Кухонные гарнитуры", slug: "kuhonnye-garnitury", unit: "комплект", packaging: 1 },
      { name: "Столешницы", slug: "stoleshnitsy", unit: "м", packaging: 1 },
      { name: "Кухонные мойки", slug: "kuhonnye-moyki", unit: "шт", packaging: 1 },
      { name: "Смесители для кухни", slug: "smesiteli-dlya-kukhni", unit: "шт", packaging: 1 },
    ],
  },
  {
    name: "Мебель",
    slug: "mebel",
    icon: "Sofa",
    description: "Шкафы, стеллажи, столы, стулья, кровати",
    subcategories: [
      { name: "Шкафы", slug: "shkafy", unit: "шт", packaging: 1 },
      { name: "Стеллажи", slug: "stellazhi", unit: "шт", packaging: 1 },
      { name: "Столы", slug: "stoly", unit: "шт", packaging: 1 },
      { name: "Стулья", slug: "stulya", unit: "шт", packaging: 1 },
      { name: "Кровати и матрасы", slug: "krovati", unit: "шт", packaging: 1 },
    ],
  },
];

export const groupLabels: Record<string, string[]> = {
  "Отделка и стройка": ["Стройматериалы", "Плитка", "Напольные покрытия", "Краски", "Обои"],
  "Инженерные системы": ["Сантехника", "Электрика", "Освещение"],
  "Обустройство": ["Двери", "Кухни", "Мебель", "Инструменты"],
};

export function groupCategories(cats: Category[], hasSearch: boolean) {
  if (hasSearch) {
    return [{ label: `Найдено: ${cats.length}`, items: cats }];
  }
  const result: { label: string; items: Category[] }[] = [];
  for (const [label, names] of Object.entries(groupLabels)) {
    const items = cats.filter((c) => names.includes(c.name));
    if (items.length) result.push({ label, items });
  }
  return result;
}

export function filterCategories(search: string) {
  if (!search.trim()) return categories;
  const q = search.toLowerCase();
  return categories.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.subcategories.some((s) => s.name.toLowerCase().includes(q))
  );
}
