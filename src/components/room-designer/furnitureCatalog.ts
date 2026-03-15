export interface FurnitureItem {
  id: string;
  name: string;
  category: string;
  icon: string;
  width: number;
  depth: number;
  height: number;
  defaultColor: string;
  shape: "box" | "cylinder" | "lshape";
}

export const FURNITURE_CATEGORIES = [
  { id: "living", label: "Гостиная", icon: "Sofa" },
  { id: "bedroom", label: "Спальня", icon: "BedDouble" },
  { id: "kitchen", label: "Кухня", icon: "CookingPot" },
  { id: "office", label: "Офис", icon: "Monitor" },
  { id: "bathroom", label: "Ванная", icon: "Bath" },
  { id: "storage", label: "Хранение", icon: "Archive" },
];

export const FURNITURE_CATALOG: FurnitureItem[] = [
  { id: "sofa-3", name: "Диван 3-местный", category: "living", icon: "Sofa", width: 2.2, depth: 0.9, height: 0.8, defaultColor: "#7c8ea0", shape: "box" },
  { id: "sofa-2", name: "Диван 2-местный", category: "living", icon: "Sofa", width: 1.6, depth: 0.85, height: 0.75, defaultColor: "#8b9fad", shape: "box" },
  { id: "sofa-corner", name: "Угловой диван", category: "living", icon: "Sofa", width: 2.5, depth: 2.0, height: 0.75, defaultColor: "#6b7f8e", shape: "lshape" },
  { id: "armchair", name: "Кресло", category: "living", icon: "Armchair", width: 0.85, depth: 0.8, height: 0.8, defaultColor: "#a08060", shape: "box" },
  { id: "coffee-table", name: "Журнальный стол", category: "living", icon: "Table", width: 1.0, depth: 0.6, height: 0.4, defaultColor: "#b08050", shape: "box" },
  { id: "tv-stand", name: "Тумба под ТВ", category: "living", icon: "Tv", width: 1.5, depth: 0.4, height: 0.5, defaultColor: "#555555", shape: "box" },
  { id: "bookshelf", name: "Книжный шкаф", category: "living", icon: "BookOpen", width: 1.0, depth: 0.35, height: 1.8, defaultColor: "#a08060", shape: "box" },

  { id: "bed-double", name: "Кровать двуспальная", category: "bedroom", icon: "BedDouble", width: 1.8, depth: 2.1, height: 0.5, defaultColor: "#c0b8a8", shape: "box" },
  { id: "bed-single", name: "Кровать односпальная", category: "bedroom", icon: "BedSingle", width: 0.9, depth: 2.0, height: 0.45, defaultColor: "#b8b0a0", shape: "box" },
  { id: "wardrobe", name: "Шкаф-купе", category: "bedroom", icon: "Archive", width: 2.0, depth: 0.6, height: 2.2, defaultColor: "#8b7355", shape: "box" },
  { id: "nightstand", name: "Тумбочка", category: "bedroom", icon: "Square", width: 0.45, depth: 0.4, height: 0.5, defaultColor: "#a89878", shape: "box" },
  { id: "dresser", name: "Комод", category: "bedroom", icon: "Archive", width: 1.2, depth: 0.45, height: 0.85, defaultColor: "#a08868", shape: "box" },

  { id: "dining-table", name: "Обеденный стол", category: "kitchen", icon: "Table", width: 1.4, depth: 0.8, height: 0.75, defaultColor: "#b89878", shape: "box" },
  { id: "dining-chair", name: "Стул", category: "kitchen", icon: "Armchair", width: 0.45, depth: 0.45, height: 0.85, defaultColor: "#a08868", shape: "box" },
  { id: "kitchen-set", name: "Кухонный гарнитур", category: "kitchen", icon: "CookingPot", width: 2.4, depth: 0.6, height: 0.85, defaultColor: "#e8e0d8", shape: "box" },
  { id: "fridge", name: "Холодильник", category: "kitchen", icon: "Refrigerator", width: 0.6, depth: 0.65, height: 1.8, defaultColor: "#d0d0d0", shape: "box" },

  { id: "desk", name: "Письменный стол", category: "office", icon: "Monitor", width: 1.4, depth: 0.7, height: 0.75, defaultColor: "#b89878", shape: "box" },
  { id: "office-chair", name: "Офисное кресло", category: "office", icon: "Armchair", width: 0.6, depth: 0.6, height: 1.1, defaultColor: "#333333", shape: "cylinder" },
  { id: "filing-cabinet", name: "Шкаф для документов", category: "office", icon: "Archive", width: 0.8, depth: 0.45, height: 1.5, defaultColor: "#808080", shape: "box" },

  { id: "bathtub", name: "Ванна", category: "bathroom", icon: "Bath", width: 1.7, depth: 0.7, height: 0.6, defaultColor: "#f0f0f0", shape: "box" },
  { id: "shower", name: "Душевая кабина", category: "bathroom", icon: "Droplets", width: 0.9, depth: 0.9, height: 2.0, defaultColor: "#e0e8f0", shape: "box" },
  { id: "toilet", name: "Унитаз", category: "bathroom", icon: "Droplets", width: 0.4, depth: 0.65, height: 0.4, defaultColor: "#f5f5f5", shape: "box" },
  { id: "sink", name: "Раковина", category: "bathroom", icon: "Droplets", width: 0.6, depth: 0.45, height: 0.85, defaultColor: "#f0f0f0", shape: "cylinder" },
  { id: "washing-machine", name: "Стиральная машина", category: "bathroom", icon: "Disc", width: 0.6, depth: 0.55, height: 0.85, defaultColor: "#e8e8e8", shape: "box" },

  { id: "shelf-unit", name: "Стеллаж", category: "storage", icon: "Archive", width: 1.0, depth: 0.4, height: 1.8, defaultColor: "#c0b098", shape: "box" },
  { id: "shoe-rack", name: "Обувница", category: "storage", icon: "Footprints", width: 0.8, depth: 0.3, height: 1.0, defaultColor: "#a09080", shape: "box" },
];
