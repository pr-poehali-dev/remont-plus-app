export interface FurnitureItem {
  id: string;
  name: string;
  price: [number, number];
  image: string;
  room: string;
}

export interface InteriorStyle {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  priceMultiplier: number;
  accent: string;
}

export interface ApartmentType {
  id: string;
  title: string;
  subtitle: string;
  area: string;
  rooms: string[];
}

export const STYLES: InteriorStyle[] = [
  {
    id: "modern",
    title: "Современный",
    subtitle: "Чистые линии, функциональность",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/73854242-4b2d-48e2-be29-768825c6700a.jpg",
    priceMultiplier: 1.0,
    accent: "#f97316",
  },
  {
    id: "scandi",
    title: "Скандинавский",
    subtitle: "Светлое дерево, уют, хюгге",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/48a5de48-7594-40c6-af92-00f00c5fa60d.jpg",
    priceMultiplier: 1.1,
    accent: "#0ea5e9",
  },
  {
    id: "classic",
    title: "Классика",
    subtitle: "Элегантность, богатые текстуры",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e21786e0-7646-40e2-9e70-a070520fce48.jpg",
    priceMultiplier: 1.35,
    accent: "#a855f7",
  },
  {
    id: "loft",
    title: "Лофт",
    subtitle: "Кирпич, металл, индустриальный шик",
    image: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e3cfb18a-63ec-4dc2-9731-c91c0e701a88.jpg",
    priceMultiplier: 1.2,
    accent: "#ef4444",
  },
];

export const APARTMENTS: ApartmentType[] = [
  { id: "studio", title: "Студия", subtitle: "до 35 м²", area: "20–35 м²", rooms: ["Жилая зона", "Кухня", "Прихожая"] },
  { id: "one", title: "1-комнатная", subtitle: "35–50 м²", area: "35–50 м²", rooms: ["Спальня", "Гостиная", "Кухня", "Прихожая"] },
  { id: "two", title: "2-комнатная", subtitle: "50–70 м²", area: "50–70 м²", rooms: ["Спальня", "Детская", "Гостиная", "Кухня", "Прихожая"] },
  { id: "three", title: "3-комнатная", subtitle: "70–100 м²", area: "70–100 м²", rooms: ["Спальня", "Детская", "Гостевая", "Гостиная", "Кухня", "Прихожая"] },
];

const IMG = {
  sofa: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/97f2955c-803c-41ba-94b7-15a955d6254d.jpg",
  wardrobe: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a47f97ee-9ddb-4d56-b3b1-d2efc37ed3d2.jpg",
  kitchen: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/0a2e43a1-e6f8-4456-a0c8-64329f27893b.jpg",
  bed: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/271af53d-2252-452f-b882-08e0abc4756c.jpg",
  coffeeTable: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/64c1621c-75bd-434c-97e0-ee550304d96b.jpg",
  tvStand: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5015f788-17e6-4289-b304-327998c48e25.jpg",
  diningTable: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e67ea18a-8879-4d7d-9dbb-9664db9866ac.jpg",
  chairs: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/66d88e56-363b-4c5b-a2d7-0cbd41f3d368.jpg",
  hallway: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/39f5019f-3e8a-4e38-b4d0-4de95e305a09.jpg",
  cornerSofa: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8439c393-0b8b-4682-9326-42ecf81f7904.jpg",
  wallUnit: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/44ac4b16-4045-42d0-bee1-21c9847fbab0.jpg",
  nightstands: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/997513dc-f398-414e-90f8-91f6bdc29b18.jpg",
  dresser: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/449ca11d-73eb-46c8-8c50-0c4537d5d08b.jpg",
  vanity: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/af079fa7-4a3a-45d4-bff4-bedf97b3b274.jpg",
  bunkBed: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/5ce223fa-149d-48ec-a32e-2c02d4123b0a.jpg",
  desk: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/808a7511-9d62-422a-8354-e5cb668e92ad.jpg",
  shelf: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8cf7bbc3-b309-4a55-b788-5b486d266b67.jpg",
  armchair: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/feb8f8ea-2784-4358-83d5-7ae651203856.jpg",
  bench: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/433c9f50-89e5-43f5-8599-eac8d6d8a6d1.jpg",
};

export const ALL_ITEMS: FurnitureItem[] = [
  { id: "sofa-bed", name: "Диван-кровать", price: [25000, 65000], image: IMG.sofa, room: "Жилая зона" },
  { id: "wardrobe-studio", name: "Шкаф-купе", price: [30000, 80000], image: IMG.wardrobe, room: "Жилая зона" },
  { id: "coffee-studio", name: "Журнальный столик", price: [5000, 15000], image: IMG.coffeeTable, room: "Жилая зона" },
  { id: "tv-studio", name: "Тумба под ТВ", price: [8000, 20000], image: IMG.tvStand, room: "Жилая зона" },

  { id: "bed-1", name: "Кровать двуспальная", price: [30000, 80000], image: IMG.bed, room: "Спальня" },
  { id: "wardrobe-bed-1", name: "Шкаф-купе", price: [35000, 90000], image: IMG.wardrobe, room: "Спальня" },
  { id: "nightstands-1", name: "Прикроватные тумбы (2 шт.)", price: [8000, 24000], image: IMG.nightstands, room: "Спальня" },
  { id: "dresser-1", name: "Комод", price: [12000, 30000], image: IMG.dresser, room: "Спальня" },
  { id: "vanity-1", name: "Туалетный столик", price: [12000, 35000], image: IMG.vanity, room: "Спальня" },

  { id: "corner-sofa", name: "Диван угловой", price: [35000, 100000], image: IMG.cornerSofa, room: "Гостиная" },
  { id: "wall-unit", name: "Стенка / горка", price: [25000, 75000], image: IMG.wallUnit, room: "Гостиная" },
  { id: "coffee-table", name: "Журнальный столик", price: [6000, 22000], image: IMG.coffeeTable, room: "Гостиная" },
  { id: "armchair", name: "Кресло", price: [12000, 35000], image: IMG.armchair, room: "Гостиная" },

  { id: "kitchen-set", name: "Кухонный гарнитур", price: [35000, 130000], image: IMG.kitchen, room: "Кухня" },
  { id: "dining-table", name: "Обеденный стол", price: [10000, 45000], image: IMG.diningTable, room: "Кухня" },
  { id: "chairs", name: "Стулья (4 шт.)", price: [12000, 48000], image: IMG.chairs, room: "Кухня" },

  { id: "kids-bed", name: "Кровать / двухъярусная", price: [25000, 75000], image: IMG.bunkBed, room: "Детская" },
  { id: "kids-wardrobe", name: "Шкаф", price: [25000, 70000], image: IMG.wardrobe, room: "Детская" },
  { id: "kids-desk", name: "Письменный стол", price: [10000, 35000], image: IMG.desk, room: "Детская" },
  { id: "kids-shelf", name: "Стеллаж / полки", price: [8000, 28000], image: IMG.shelf, room: "Детская" },

  { id: "guest-bed", name: "Кровать / диван-кровать", price: [25000, 70000], image: IMG.sofa, room: "Гостевая" },
  { id: "guest-wardrobe", name: "Шкаф", price: [25000, 65000], image: IMG.wardrobe, room: "Гостевая" },

  { id: "hallway-wardrobe", name: "Шкаф для прихожей", price: [20000, 80000], image: IMG.hallway, room: "Прихожая" },
  { id: "hallway-bench", name: "Банкетка + зеркало", price: [8000, 25000], image: IMG.bench, room: "Прихожая" },
];

export const BUDGET_LABELS = ["Бюджет", "Комфорт", "Премиум"];

export function formatPrice(value: number): string {
  return Math.round(value).toLocaleString("ru-RU") + " ₽";
}
