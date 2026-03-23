export interface MaterialItem {
  id: string;
  name: string;
  unit: string;
  pricePerUnit: number;
  category: "walls" | "floor" | "ceiling" | "openings" | "finishing";
}

export const MATERIALS_CATALOG: MaterialItem[] = [
  { id: "brick", name: "Кирпич рядовой", unit: "шт", pricePerUnit: 18, category: "walls" },
  { id: "plaster", name: "Штукатурка гипсовая (30 кг)", unit: "мешок", pricePerUnit: 420, category: "walls" },
  { id: "putty", name: "Шпатлёвка финишная (20 кг)", unit: "мешок", pricePerUnit: 580, category: "walls" },
  { id: "paint-wall", name: "Краска интерьерная (10 л)", unit: "банка", pricePerUnit: 2800, category: "walls" },
  { id: "wallpaper", name: "Обои флизелиновые (рулон 10 м)", unit: "рулон", pricePerUnit: 1500, category: "walls" },
  { id: "laminate", name: "Ламинат 33 класс (1 уп = 2.1 м\u00B2)", unit: "уп", pricePerUnit: 1400, category: "floor" },
  { id: "screed", name: "Стяжка для пола (25 кг)", unit: "мешок", pricePerUnit: 350, category: "floor" },
  { id: "substrate", name: "Подложка под ламинат (рулон 15 м\u00B2)", unit: "рулон", pricePerUnit: 650, category: "floor" },
  { id: "plinth", name: "Плинтус напольный (2.5 м)", unit: "шт", pricePerUnit: 280, category: "floor" },
  { id: "tile-floor", name: "Плитка напольная (1 м\u00B2)", unit: "м\u00B2", pricePerUnit: 950, category: "floor" },
  { id: "stretch-ceiling", name: "Натяжной потолок (1 м\u00B2)", unit: "м\u00B2", pricePerUnit: 450, category: "ceiling" },
  { id: "ceiling-paint", name: "Краска потолочная (10 л)", unit: "банка", pricePerUnit: 2200, category: "ceiling" },
  { id: "interior-door", name: "Дверь межкомнатная с коробкой", unit: "шт", pricePerUnit: 8500, category: "openings" },
  { id: "window-pvc", name: "Окно ПВХ двухкамерное (1 м\u00B2)", unit: "м\u00B2", pricePerUnit: 7200, category: "openings" },
  { id: "door-handle", name: "Ручка дверная комплект", unit: "шт", pricePerUnit: 1200, category: "openings" },
  { id: "primer", name: "Грунтовка глубокого проникновения (10 л)", unit: "канистра", pricePerUnit: 650, category: "finishing" },
  { id: "corner-profile", name: "Уголок перфорированный (3 м)", unit: "шт", pricePerUnit: 45, category: "finishing" },
  { id: "sealant", name: "Герметик силиконовый", unit: "шт", pricePerUnit: 350, category: "finishing" },
];

export const MATERIAL_CATEGORY_LABELS: Record<MaterialItem["category"], string> = {
  walls: "Стены",
  floor: "Пол",
  ceiling: "Потолок",
  openings: "Двери и окна",
  finishing: "Отделочные материалы",
};

export default MATERIALS_CATALOG;
