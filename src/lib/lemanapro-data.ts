export const BASE_URL = "https://samara.lemanapro.ru";
export const STORAGE_KEY = "avangard_lemanapro_estimate";

export interface Category {
  name: string;
  slug: string;
  icon: string;
  description: string;
  subcategories: { name: string; slug: string }[];
}

export interface EstimateSavedItem {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  url: string;
  quantity: number;
  note: string;
  addedAt: string;
}

export function getEstimateItems(): EstimateSavedItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

export function saveEstimateItems(items: EstimateSavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export const categories: Category[] = [
  {
    name: "Стройматериалы",
    slug: "stroymaterialy",
    icon: "Warehouse",
    description: "Сухие смеси, гипсокартон, утеплители, кирпич, блоки",
    subcategories: [
      { name: "Сухие смеси", slug: "suhie-smesi" },
      { name: "Гипсокартон", slug: "gipsokarton-i-komplektuyushchie" },
      { name: "Утеплители", slug: "utepliteli" },
      { name: "Пиломатериалы", slug: "pilomaterialy" },
      { name: "Кирпич и блоки", slug: "kirpich-i-bloki" },
      { name: "Цемент и бетон", slug: "tsement-i-beton" },
    ],
  },
  {
    name: "Плитка",
    slug: "plitka",
    icon: "Grid3x3",
    description: "Керамическая плитка, керамогранит, мозаика, клей",
    subcategories: [
      { name: "Настенная плитка", slug: "nastennaya-plitka" },
      { name: "Напольная плитка", slug: "napolnaya-plitka" },
      { name: "Керамогранит", slug: "keramogranit" },
      { name: "Мозаика", slug: "mozaika" },
      { name: "Клей для плитки", slug: "klej-dlya-plitki" },
      { name: "Затирки", slug: "zatirki" },
    ],
  },
  {
    name: "Сантехника",
    slug: "santehnika",
    icon: "Droplets",
    description: "Смесители, унитазы, раковины, ванны, душевые",
    subcategories: [
      { name: "Смесители", slug: "smesiteli" },
      { name: "Унитазы", slug: "unitazy" },
      { name: "Раковины", slug: "rakoviny" },
      { name: "Ванны", slug: "vanny-i-komplektuyushchie" },
      { name: "Душевые кабины", slug: "dushevye-kabiny" },
      { name: "Полотенцесушители", slug: "polotentsesushiteli" },
    ],
  },
  {
    name: "Напольные покрытия",
    slug: "napolnye-pokrytiya",
    icon: "Layers",
    description: "Ламинат, линолеум, паркет, ковролин, подложка",
    subcategories: [
      { name: "Ламинат", slug: "laminat" },
      { name: "Линолеум", slug: "linoleum" },
      { name: "Паркет", slug: "parket" },
      { name: "Кварц-винил (SPC/LVT)", slug: "kvarts-vinilovaya-plitka" },
      { name: "Ковролин", slug: "kovrolin" },
      { name: "Подложка", slug: "podlozhka" },
    ],
  },
  {
    name: "Краски",
    slug: "kraski",
    icon: "Paintbrush",
    description: "Интерьерные и фасадные краски, лаки, грунтовки",
    subcategories: [
      { name: "Интерьерные краски", slug: "interernye-kraski" },
      { name: "Фасадные краски", slug: "fasadnye-kraski" },
      { name: "Лаки", slug: "laki" },
      { name: "Грунтовки", slug: "gruntovki" },
      { name: "Эмали", slug: "emali" },
      { name: "Колеровка", slug: "kolerovka" },
    ],
  },
  {
    name: "Обои",
    slug: "oboi",
    icon: "Wallpaper",
    description: "Виниловые, флизелиновые, бумажные обои и клей",
    subcategories: [
      { name: "Виниловые обои", slug: "vinilovye-oboi" },
      { name: "Флизелиновые обои", slug: "flizelinovye-oboi" },
      { name: "Обои под покраску", slug: "oboi-pod-pokrasku" },
      { name: "Фотообои", slug: "fotooboi" },
      { name: "Клей для обоев", slug: "klej-dlya-oboev" },
    ],
  },
  {
    name: "Электрика",
    slug: "elektrika",
    icon: "Zap",
    description: "Кабели, розетки, выключатели, автоматы, щитки",
    subcategories: [
      { name: "Кабели и провода", slug: "kabeli-i-provoda" },
      { name: "Розетки и выключатели", slug: "rozetki-i-vyklyuchateli" },
      { name: "Автоматы и УЗО", slug: "avtomaty-i-uzo" },
      { name: "Щитки", slug: "shchitki" },
      { name: "Удлинители", slug: "udliniteli" },
    ],
  },
  {
    name: "Освещение",
    slug: "osveshchenie-zhilyh-pomeshcheniy",
    icon: "Lightbulb",
    description: "Люстры, светильники, бра, лампочки, споты",
    subcategories: [
      { name: "Люстры", slug: "lyustry" },
      { name: "Потолочные светильники", slug: "potolochnye-svetilniki" },
      { name: "Бра и настенные", slug: "bra" },
      { name: "Точечные светильники", slug: "tochechnye-svetilniki" },
      { name: "Лампочки", slug: "lampochki" },
      { name: "LED-ленты", slug: "svetodiodnye-lenty" },
    ],
  },
  {
    name: "Двери",
    slug: "dveri",
    icon: "DoorOpen",
    description: "Межкомнатные, входные двери, фурнитура",
    subcategories: [
      { name: "Межкомнатные двери", slug: "mezhkomnatnye-dveri" },
      { name: "Входные двери", slug: "vhodnye-dveri" },
      { name: "Дверная фурнитура", slug: "dvernaya-furnitura" },
      { name: "Арки и порталы", slug: "arki-i-portaly" },
    ],
  },
  {
    name: "Инструменты",
    slug: "instrumenty",
    icon: "Wrench",
    description: "Ручной и электроинструмент, расходники",
    subcategories: [
      { name: "Электроинструменты", slug: "elektroinstrumenty" },
      { name: "Ручной инструмент", slug: "ruchnoj-instrument" },
      { name: "Измерительный", slug: "izmeritelnyj-instrument" },
      { name: "Расходные материалы", slug: "rashodnye-materialy" },
    ],
  },
  {
    name: "Кухни",
    slug: "kukhni",
    icon: "CookingPot",
    description: "Кухонные гарнитуры, столешницы, мойки",
    subcategories: [
      { name: "Кухонные гарнитуры", slug: "kuhonnye-garnitury" },
      { name: "Столешницы", slug: "stoleshnitsy" },
      { name: "Мойки", slug: "mojki" },
      { name: "Смесители кухонные", slug: "smesiteli-dlya-kuhni" },
    ],
  },
  {
    name: "Мебель",
    slug: "mebel",
    icon: "Sofa",
    description: "Шкафы, стеллажи, столы, стулья, кровати",
    subcategories: [
      { name: "Шкафы", slug: "shkafy" },
      { name: "Стеллажи", slug: "stellazhi" },
      { name: "Столы", slug: "stoly" },
      { name: "Стулья", slug: "stulya" },
      { name: "Кровати и матрасы", slug: "krovati-i-matrasy" },
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
