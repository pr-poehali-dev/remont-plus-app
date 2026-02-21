export interface MaterialVariant {
  name: string;
  brand: string;
  pricePerUnit: number;
  unit: string;
  coverage?: string;
  regions?: string[];
  popular?: boolean;
}

export interface MaterialSuggestion {
  workKeywords: string[];
  materialName: string;
  description: string;
  variants: MaterialVariant[];
}

export const MATERIAL_SUGGESTIONS: MaterialSuggestion[] = [
  {
    workKeywords: ["штукатурк", "оштукатурив"],
    materialName: "Штукатурка",
    description: "Материал для выравнивания стен",
    variants: [
      { name: "Волма Слой", brand: "Волма", pricePerUnit: 380, unit: "мешок 30кг", coverage: "≈10 м² (1 слой)", popular: true },
      { name: "Knauf Rotband", brand: "Knauf", pricePerUnit: 520, unit: "мешок 30кг", coverage: "≈10 м² (1 слой)", popular: true },
      { name: "Unis Теплон", brand: "Unis", pricePerUnit: 340, unit: "мешок 30кг", coverage: "≈10 м²", regions: ["samara", "kazan", "ekaterinburg"] },
      { name: "Основит Стартвэлл", brand: "Основит", pricePerUnit: 310, unit: "мешок 30кг", coverage: "≈10 м²", regions: ["moscow", "spb"] },
      { name: "Ceresit CT 35", brand: "Ceresit", pricePerUnit: 680, unit: "мешок 25кг", coverage: "≈8 м²" },
    ],
  },
  {
    workKeywords: ["шпаклёвк", "шпаклевк", "шпаклев"],
    materialName: "Шпаклёвка",
    description: "Финишное выравнивание поверхности",
    variants: [
      { name: "Волма Финиш", brand: "Волма", pricePerUnit: 320, unit: "мешок 20кг", coverage: "≈15 м² (1 слой)", popular: true },
      { name: "Knauf Fugen", brand: "Knauf", pricePerUnit: 410, unit: "мешок 25кг", coverage: "≈18 м²", popular: true },
      { name: "Ceresit CT 127", brand: "Ceresit", pricePerUnit: 540, unit: "мешок 20кг", coverage: "≈14 м²" },
      { name: "Unis Блик", brand: "Unis", pricePerUnit: 290, unit: "мешок 20кг", coverage: "≈15 м²", regions: ["samara", "ekaterinburg", "novosibirsk"] },
      { name: "Основит Финишвэлл", brand: "Основит", pricePerUnit: 275, unit: "мешок 20кг", coverage: "≈15 м²" },
    ],
  },
  {
    workKeywords: ["грунтовк", "грунтован"],
    materialName: "Грунтовка",
    description: "Укрепление и подготовка основания",
    variants: [
      { name: "Ceresit CT 17", brand: "Ceresit", pricePerUnit: 680, unit: "канистра 10л", coverage: "≈100 м²", popular: true },
      { name: "Knauf Tiefengrund", brand: "Knauf", pricePerUnit: 590, unit: "канистра 10л", coverage: "≈80 м²", popular: true },
      { name: "Волма Контакт", brand: "Волма", pricePerUnit: 480, unit: "канистра 10л", coverage: "≈100 м²" },
      { name: "Unis Грунт", brand: "Unis", pricePerUnit: 390, unit: "канистра 10л", coverage: "≈100 м²", regions: ["samara", "kazan"] },
    ],
  },
  {
    workKeywords: ["плитк", "кафел", "керамогранит", "укладк"],
    materialName: "Плитка / керамогранит",
    description: "Облицовочный материал для стен и пола",
    variants: [
      { name: "Плитка Kerama Marazzi (эконом)", brand: "Kerama Marazzi", pricePerUnit: 980, unit: "м²", coverage: "1 м²", popular: true },
      { name: "Плитка Kerama Marazzi (стандарт)", brand: "Kerama Marazzi", pricePerUnit: 1650, unit: "м²", coverage: "1 м²", popular: true },
      { name: "Керамогранит Грани Таганая", brand: "Грани Таганая", pricePerUnit: 1200, unit: "м²", coverage: "1 м²", regions: ["ekaterinburg", "chelyabinsk"] },
      { name: "Плитка Нефрит-Керамика", brand: "Нефрит", pricePerUnit: 890, unit: "м²", coverage: "1 м²" },
      { name: "Клей для плитки Ceresit CM 11", brand: "Ceresit", pricePerUnit: 410, unit: "мешок 25кг", coverage: "≈5 м²" },
    ],
  },
  {
    workKeywords: ["ламинат", "паркет", "напольн", "пол"],
    materialName: "Напольное покрытие",
    description: "Ламинат или паркетная доска",
    variants: [
      { name: "Ламинат Tarkett (32 класс)", brand: "Tarkett", pricePerUnit: 890, unit: "м²", coverage: "1 м²", popular: true },
      { name: "Ламинат Kronospan (33 класс)", brand: "Kronospan", pricePerUnit: 1100, unit: "м²", coverage: "1 м²", popular: true },
      { name: "Ламинат Quick-Step", brand: "Quick-Step", pricePerUnit: 1650, unit: "м²", coverage: "1 м²" },
      { name: "Подложка Arbiton 3мм", brand: "Arbiton", pricePerUnit: 85, unit: "м²", coverage: "1 м²" },
    ],
  },
  {
    workKeywords: ["покраск", "окраск", "краш"],
    materialName: "Краска",
    description: "Финишное покрытие стен и потолка",
    variants: [
      { name: "Dulux Easy Care (белая)", brand: "Dulux", pricePerUnit: 1280, unit: "банка 5л", coverage: "≈35 м² (2 слоя)", popular: true },
      { name: "Caparol Amphibolin", brand: "Caparol", pricePerUnit: 1950, unit: "банка 5л", coverage: "≈40 м² (2 слоя)", popular: true },
      { name: "Tikkurila Euro 7", brand: "Tikkurila", pricePerUnit: 2100, unit: "банка 5л", coverage: "≈35 м² (2 слоя)" },
      { name: "Yaroslavl Vip Premium", brand: "ЯКраска", pricePerUnit: 680, unit: "банка 5л", coverage: "≈35 м² (2 слоя)", regions: ["moscow", "spb", "nizhny_novgorod"] },
      { name: "Sniezka Rafaello", brand: "Sniezka", pricePerUnit: 780, unit: "банка 5л", coverage: "≈35 м² (2 слоя)" },
    ],
  },
  {
    workKeywords: ["обои", "поклейк", "поклейк"],
    materialName: "Обои",
    description: "Настенное покрытие",
    variants: [
      { name: "Обои виниловые на бумаге (эконом)", brand: "Палитра", pricePerUnit: 320, unit: "рулон 10м²", coverage: "10 м²", popular: true },
      { name: "Обои флизелиновые (стандарт)", brand: "Erismann", pricePerUnit: 680, unit: "рулон 10м²", coverage: "10 м²", popular: true },
      { name: "Обои AS Création (премиум)", brand: "A.S. Création", pricePerUnit: 1450, unit: "рулон 10м²", coverage: "10 м²" },
      { name: "Клей для обоев Quelyd", brand: "Quelyd", pricePerUnit: 290, unit: "упаковка", coverage: "≈20 м²" },
    ],
  },
  {
    workKeywords: ["стяжк", "заливк пол", "бетонн пол"],
    materialName: "Сухая смесь для стяжки",
    description: "Выравнивание пола",
    variants: [
      { name: "Knauf Убо (стяжка)", brand: "Knauf", pricePerUnit: 420, unit: "мешок 25кг", coverage: "≈3 м² (5см)", popular: true },
      { name: "Волма Нивелир Экспресс", brand: "Волма", pricePerUnit: 360, unit: "мешок 20кг", coverage: "≈5 м² (3мм)", popular: true },
      { name: "Ceresit CN 175", brand: "Ceresit", pricePerUnit: 530, unit: "мешок 25кг", coverage: "≈5 м² (3мм)" },
      { name: "Старатели (ровнитель)", brand: "Старатели", pricePerUnit: 280, unit: "мешок 20кг", coverage: "≈4 м²", regions: ["moscow", "spb", "nizhny_novgorod"] },
    ],
  },
  {
    workKeywords: ["гипсокартон", "гкл", "монтаж перегород"],
    materialName: "Гипсокартон и комплектующие",
    description: "Листы ГКЛ и профиль",
    variants: [
      { name: "ГКЛ Knauf 12,5мм (1 лист)", brand: "Knauf", pricePerUnit: 420, unit: "лист 1,2×2,5м", coverage: "3 м²", popular: true },
      { name: "ГКЛВ Knauf влагостойкий", brand: "Knauf", pricePerUnit: 520, unit: "лист 1,2×2,5м", coverage: "3 м²", popular: true },
      { name: "Профиль CD 60 (3м)", brand: "Knauf", pricePerUnit: 180, unit: "шт", coverage: "3 пм" },
      { name: "Профиль UD 28 (3м)", brand: "Knauf", pricePerUnit: 150, unit: "шт", coverage: "3 пм" },
    ],
  },
  {
    workKeywords: ["натяжн потолок", "натяжной потолок"],
    materialName: "Натяжной потолок",
    description: "Полотно и комплектующие",
    variants: [
      { name: "Матовое полотно (эконом)", brand: "Descor", pricePerUnit: 450, unit: "м²", coverage: "1 м²", popular: true },
      { name: "Глянцевое полотно", brand: "Descor", pricePerUnit: 520, unit: "м²", coverage: "1 м²" },
      { name: "Сатиновое полотно", brand: "Clipso", pricePerUnit: 850, unit: "м²", coverage: "1 м²" },
    ],
  },
];

export function getSuggestionsForWork(workName: string, region?: string): MaterialSuggestion[] {
  const nameLower = workName.toLowerCase();
  return MATERIAL_SUGGESTIONS.filter((s) =>
    s.workKeywords.some((kw) => nameLower.includes(kw))
  ).map((s) => ({
    ...s,
    variants: s.variants
      .filter((v) => !v.regions || v.regions.includes(region || "") || !region)
      .sort((a, b) => {
        if (a.popular && !b.popular) return -1;
        if (!a.popular && b.popular) return 1;
        const aRegion = a.regions?.includes(region || "") ? 1 : 0;
        const bRegion = b.regions?.includes(region || "") ? 1 : 0;
        return bRegion - aRegion;
      }),
  }));
}
