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

  // ── ЭЛЕКТРИКА ──────────────────────────────────────────────────────────────

  {
    workKeywords: ["электропровод", "прокладк кабел", "разводк электр", "электромонтаж", "электрик"],
    materialName: "Кабель и провод",
    description: "Силовой кабель для электропроводки",
    variants: [
      { name: "Кабель ВВГнг-LS 3×2,5мм² (50м)", brand: "Кабэкс", pricePerUnit: 2200, unit: "бухта 50м", coverage: "50 пм", popular: true },
      { name: "Кабель ВВГнг-LS 3×1,5мм² (50м)", brand: "Кабэкс", pricePerUnit: 1550, unit: "бухта 50м", coverage: "50 пм", popular: true },
      { name: "Кабель NYM 3×2,5мм² (50м)", brand: "КоЗЭл", pricePerUnit: 2800, unit: "бухта 50м", coverage: "50 пм" },
      { name: "Провод ПВС 3×2,5мм² (50м)", brand: "Гарантпроводкомплект", pricePerUnit: 1900, unit: "бухта 50м", coverage: "50 пм" },
      { name: "Гофротруба ПВХ 20мм (50м)", brand: "DKC", pricePerUnit: 680, unit: "бухта 50м", coverage: "50 пм" },
    ],
  },
  {
    workKeywords: ["розетк", "выключател", "установк розетк", "монтаж розетк"],
    materialName: "Розетки и выключатели",
    description: "Электроустановочные изделия",
    variants: [
      { name: "Розетка Legrand Valena (белая)", brand: "Legrand", pricePerUnit: 380, unit: "шт", popular: true },
      { name: "Выключатель Legrand Valena одинарный", brand: "Legrand", pricePerUnit: 290, unit: "шт", popular: true },
      { name: "Розетка Schneider Этюд (белая)", brand: "Schneider Electric", pricePerUnit: 220, unit: "шт" },
      { name: "Розетка ABB Basic 55 (белая)", brand: "ABB", pricePerUnit: 450, unit: "шт" },
      { name: "Рамка Legrand Valena (1 пост)", brand: "Legrand", pricePerUnit: 180, unit: "шт" },
      { name: "Подрозетник скрытый 60мм", brand: "ДКС", pricePerUnit: 25, unit: "шт" },
    ],
  },
  {
    workKeywords: ["щиток", "электрощит", "автомат", "устройств защит", "узо"],
    materialName: "Щитовое оборудование",
    description: "Автоматы, УЗО, щиток",
    variants: [
      { name: "Автомат ABB SH201 16А (C16)", brand: "ABB", pricePerUnit: 320, unit: "шт", popular: true },
      { name: "Автомат IEK ВА47-29 16А", brand: "IEK", pricePerUnit: 180, unit: "шт", popular: true },
      { name: "УЗО ABB F202 25А/30мА", brand: "ABB", pricePerUnit: 1450, unit: "шт" },
      { name: "Дифавтомат Legrand DX3 C16/30мА", brand: "Legrand", pricePerUnit: 1850, unit: "шт" },
      { name: "Щиток навесной на 12 модулей", brand: "IEK", pricePerUnit: 680, unit: "шт" },
      { name: "Щиток встроенный на 24 модуля", brand: "Legrand", pricePerUnit: 1900, unit: "шт" },
    ],
  },
  {
    workKeywords: ["освещени", "светильник", "люстр", "споты", "точечн"],
    materialName: "Светильники и освещение",
    description: "Точечные светильники и LED-лампы",
    variants: [
      { name: "Светильник встроенный GU10 (белый)", brand: "Elektrostandard", pricePerUnit: 290, unit: "шт", popular: true },
      { name: "LED-лампа GU10 7W 4000K", brand: "Gauss", pricePerUnit: 180, unit: "шт", popular: true },
      { name: "Светодиодная лента 5м 12V 14,4W/м", brand: "Gauss", pricePerUnit: 890, unit: "рулон 5м" },
      { name: "Блок питания для ленты 60W", brand: "Gauss", pricePerUnit: 650, unit: "шт" },
      { name: "Профиль алюминиевый для ленты 2м", brand: "Lumex", pricePerUnit: 320, unit: "шт" },
    ],
  },

  // ── САНТЕХНИКА ─────────────────────────────────────────────────────────────

  {
    workKeywords: ["водопровод", "разводк труб", "трубы водоснабж", "монтаж труб водоснабж"],
    materialName: "Трубы водоснабжения",
    description: "Трубы и фитинги для водопровода",
    variants: [
      { name: "Труба PP-R Ekoplastik ø20мм (2м)", brand: "Ekoplastik", pricePerUnit: 95, unit: "шт (2м)", popular: true },
      { name: "Труба PP-R Ekoplastik ø25мм (2м)", brand: "Ekoplastik", pricePerUnit: 145, unit: "шт (2м)", popular: true },
      { name: "Труба металлопластик ø16мм (1м)", brand: "Valtec", pricePerUnit: 85, unit: "пм" },
      { name: "Фитинг PP-R муфта ø20мм", brand: "Ekoplastik", pricePerUnit: 28, unit: "шт" },
      { name: "Труба PE-X Rehau ø16мм (1м)", brand: "Rehau", pricePerUnit: 110, unit: "пм" },
      { name: "Вентиль шаровый Valtec 1/2\"", brand: "Valtec", pricePerUnit: 290, unit: "шт" },
    ],
  },
  {
    workKeywords: ["канализац", "слив", "трубы канализ", "унитаз", "инсталляц"],
    materialName: "Трубы канализации",
    description: "Канализационные трубы и фасонные части",
    variants: [
      { name: "Труба канализац. ПВХ ø110мм (2м)", brand: "Ostendorf", pricePerUnit: 420, unit: "шт (2м)", popular: true },
      { name: "Труба канализац. ПВХ ø50мм (2м)", brand: "Ostendorf", pricePerUnit: 190, unit: "шт (2м)", popular: true },
      { name: "Колено 90° ø110мм", brand: "Ostendorf", pricePerUnit: 280, unit: "шт" },
      { name: "Тройник ø110/50мм", brand: "Ostendorf", pricePerUnit: 320, unit: "шт" },
      { name: "Инсталляция Geberit для унитаза", brand: "Geberit", pricePerUnit: 8900, unit: "шт" },
      { name: "Инсталляция Grohe Rapid SL", brand: "Grohe", pricePerUnit: 12500, unit: "шт" },
    ],
  },
  {
    workKeywords: ["смеситель", "установк смесител", "монтаж смесител"],
    materialName: "Смесители",
    description: "Смесители для кухни и ванной",
    variants: [
      { name: "Смеситель для ванны Grohe Start (хром)", brand: "Grohe", pricePerUnit: 4200, unit: "шт", popular: true },
      { name: "Смеситель для кухни Hansgrohe Focus (хром)", brand: "Hansgrohe", pricePerUnit: 5800, unit: "шт", popular: true },
      { name: "Смеситель для ванны Valtec (хром)", brand: "Valtec", pricePerUnit: 1900, unit: "шт" },
      { name: "Смеситель для умывальника Lemark (хром)", brand: "Lemark", pricePerUnit: 2100, unit: "шт" },
      { name: "Термостат Grohe Grohtherm 1000", brand: "Grohe", pricePerUnit: 9500, unit: "шт" },
    ],
  },
  {
    workKeywords: ["радиатор", "батарея", "унитаз", "ванн", "душев"],
    materialName: "Сантехнические приборы",
    description: "Унитаз, ванна, душевой поддон",
    variants: [
      { name: "Унитаз подвесной Cersanit Carina (белый)", brand: "Cersanit", pricePerUnit: 8900, unit: "шт", popular: true },
      { name: "Ванна акриловая 1700×700мм", brand: "Roca", pricePerUnit: 14500, unit: "шт", popular: true },
      { name: "Душевой поддон 900×900мм", brand: "Cersanit", pricePerUnit: 6800, unit: "шт" },
      { name: "Раковина накладная 60см", brand: "Cersanit", pricePerUnit: 3200, unit: "шт" },
      { name: "Зеркало с подсветкой 80×60см", brand: "Mirsant", pricePerUnit: 5600, unit: "шт" },
    ],
  },

  // ── ОТОПЛЕНИЕ ──────────────────────────────────────────────────────────────

  {
    workKeywords: ["отоплен", "радиатор", "батар", "секци", "теплоснабж"],
    materialName: "Радиаторы отопления",
    description: "Секционные и панельные радиаторы",
    variants: [
      { name: "Радиатор алюм. Global VOX 500 (8 секц.)", brand: "Global", pricePerUnit: 4200, unit: "шт", popular: true },
      { name: "Радиатор биметалл. RIFAR Base 500 (8 секц.)", brand: "Rifar", pricePerUnit: 5800, unit: "шт", popular: true },
      { name: "Радиатор панельный Kermi FTV 22 500×1200", brand: "Kermi", pricePerUnit: 7900, unit: "шт" },
      { name: "Радиатор стальной Royal Thermo 500 (10 секц.)", brand: "Royal Thermo", pricePerUnit: 3900, unit: "шт" },
      { name: "Кронштейн для радиатора (комплект)", brand: "Valtec", pricePerUnit: 180, unit: "комплект" },
      { name: "Термоголовка Danfoss RA 2000 M30", brand: "Danfoss", pricePerUnit: 890, unit: "шт" },
    ],
  },
  {
    workKeywords: ["тёплый пол", "теплый пол", "тёплый пол электр", "нагреват кабел", "мат тёплог"],
    materialName: "Тёплый пол",
    description: "Электрические нагревательные маты и кабель",
    variants: [
      { name: "Мат нагрев. Теплолюкс 150Вт/м² (2м²)", brand: "Теплолюкс", pricePerUnit: 3200, unit: "шт (2м²)", popular: true },
      { name: "Мат нагрев. Devi Devimat (2м²)", brand: "Devi", pricePerUnit: 5800, unit: "шт (2м²)", popular: true },
      { name: "Кабель нагрев. Теплолюкс Profiroll 18 (20м)", brand: "Теплолюкс", pricePerUnit: 2900, unit: "шт (20м)" },
      { name: "Терморегулятор Thermorex TX-20 (белый)", brand: "Thermorex", pricePerUnit: 1200, unit: "шт" },
      { name: "Терморегулятор Danfoss RET2000B", brand: "Danfoss", pricePerUnit: 3400, unit: "шт" },
      { name: "Теплоотражающая подложка (1м²)", brand: "Пенофол", pricePerUnit: 95, unit: "м²" },
    ],
  },
  {
    workKeywords: ["трубы отоплен", "монтаж отоплен", "разводк отоплен", "котёл", "котел"],
    materialName: "Трубы и арматура отопления",
    description: "Трубы, фитинги и запорная арматура",
    variants: [
      { name: "Труба PE-X Rehau ø16мм (1м)", brand: "Rehau", pricePerUnit: 130, unit: "пм", popular: true },
      { name: "Труба металлопласт. Valtec ø16мм (1м)", brand: "Valtec", pricePerUnit: 95, unit: "пм", popular: true },
      { name: "Коллектор Valtec на 5 выходов", brand: "Valtec", pricePerUnit: 3800, unit: "шт" },
      { name: "Шаровый кран Valtec 1\" (прямой)", brand: "Valtec", pricePerUnit: 650, unit: "шт" },
      { name: "Теплоноситель Технология -30°C (20кг)", brand: "Технология", pricePerUnit: 1650, unit: "канистра 20кг" },
      { name: "Котёл газовый Baxi ECO 4s 24кВт", brand: "Baxi", pricePerUnit: 38000, unit: "шт" },
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