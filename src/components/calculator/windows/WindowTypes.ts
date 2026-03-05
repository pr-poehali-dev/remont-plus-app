// ─── Типы конструкций ───────────────────────────────────────────────────────

export type ConstructionType =
  | "window_single"     // Одностворчатое окно
  | "window_double"     // Двухстворчатое окно
  | "window_triple"     // Трёхстворчатое окно
  | "door_balcony"      // Балконная дверь
  | "balcony_block"     // Балконный блок (окно + дверь)
  | "balcony_glazing"   // Остекление балкона/лоджии
  | "facade"            // Фасадное остекление
  | "roof_window"       // Мансардное окно
  | "partition"         // Офисная перегородка
  | "entrance_door";    // Входная дверь ПВХ/алюминий

export interface ConstructionOption {
  value: ConstructionType;
  label: string;
  icon: string;
  sashes: number; // кол-во створок по умолчанию
}

export const CONSTRUCTION_TYPES: ConstructionOption[] = [
  { value: "window_single",   label: "Одностворчатое окно",     icon: "Square",         sashes: 1 },
  { value: "window_double",   label: "Двухстворчатое окно",     icon: "Columns2",       sashes: 2 },
  { value: "window_triple",   label: "Трёхстворчатое окно",     icon: "Columns3",       sashes: 3 },
  { value: "door_balcony",    label: "Балконная дверь",         icon: "DoorOpen",       sashes: 1 },
  { value: "balcony_block",   label: "Балконный блок",          icon: "LayoutTemplate", sashes: 2 },
  { value: "balcony_glazing", label: "Остекление балкона/лоджии", icon: "PanelTop",    sashes: 3 },
  { value: "facade",          label: "Фасадное остекление",     icon: "Building2",      sashes: 4 },
  { value: "roof_window",     label: "Мансардное окно",         icon: "Home",           sashes: 1 },
  { value: "partition",       label: "Офисная перегородка",     icon: "SplitSquareHorizontal", sashes: 2 },
  { value: "entrance_door",   label: "Входная дверь ПВХ/Алюм.", icon: "DoorClosed",     sashes: 1 },
];

// ─── Материал профиля ───────────────────────────────────────────────────────

export type ProfileMaterial = "pvc" | "aluminum" | "aluminum_warm";

export interface ProfileSystem {
  id: string;
  material: ProfileMaterial;
  brand: string;
  series: string;
  chambers: number;          // кол-во камер (PVC)
  depth: number;             // глубина профиля мм
  glassThicknessMax: number; // макс. толщина стеклопакета
  priceCoeff: number;        // коэф. к базовой цене
  description: string;
}

export const PROFILE_SYSTEMS: ProfileSystem[] = [
  // ── PVC ──
  { id: "rehau_blitz",     material: "pvc", brand: "REHAU",    series: "BLITZ",          chambers: 3, depth: 60, glassThicknessMax: 24, priceCoeff: 1.0,  description: "Базовая 3-камерная система" },
  { id: "rehau_euro60",    material: "pvc", brand: "REHAU",    series: "EURO 60",        chambers: 3, depth: 60, glassThicknessMax: 24, priceCoeff: 1.1,  description: "Популярная 3-камерная система" },
  { id: "rehau_geneo",     material: "pvc", brand: "REHAU",    series: "GENEO",          chambers: 6, depth: 86, glassThicknessMax: 48, priceCoeff: 1.85, description: "6-камерная система премиум-класса" },
  { id: "veka_softline70", material: "pvc", brand: "VEKA",     series: "Softline 70",    chambers: 5, depth: 70, glassThicknessMax: 36, priceCoeff: 1.25, description: "5-камерная система VEKA" },
  { id: "veka_spectral",   material: "pvc", brand: "VEKA",     series: "Spectral",       chambers: 6, depth: 82, glassThicknessMax: 48, priceCoeff: 1.75, description: "6-камерная система с арматурой" },
  { id: "kbe_expert",      material: "pvc", brand: "KBE",      series: "Expert",         chambers: 5, depth: 70, glassThicknessMax: 36, priceCoeff: 1.2,  description: "5-камерная немецкая система" },
  { id: "kbe_88",          material: "pvc", brand: "KBE",      series: "88mm",           chambers: 6, depth: 88, glassThicknessMax: 52, priceCoeff: 1.8,  description: "6-камерная высокоэффективная" },
  { id: "gealan_s9000",    material: "pvc", brand: "GEALAN",   series: "S9000 IQ",       chambers: 6, depth: 85, glassThicknessMax: 52, priceCoeff: 1.7,  description: "6-камерная с IQ-технологией" },
  { id: "deceuninck_2500", material: "pvc", brand: "Deceuninck", series: "Deceuninck 2500", chambers: 3, depth: 60, glassThicknessMax: 24, priceCoeff: 1.05, description: "Бельгийская 3-камерная система" },
  { id: "deceuninck_3000", material: "pvc", brand: "Deceuninck", series: "Deceuninck 3000", chambers: 5, depth: 70, glassThicknessMax: 36, priceCoeff: 1.3,  description: "5-камерная бельгийская система" },
  { id: "roplasto_70",     material: "pvc", brand: "Roplasto",  series: "70 Series",     chambers: 5, depth: 70, glassThicknessMax: 36, priceCoeff: 1.15, description: "5-камерная немецкая система" },
  { id: "exprof_ps58",     material: "pvc", brand: "Exprof",    series: "PS 58",         chambers: 3, depth: 58, glassThicknessMax: 24, priceCoeff: 0.9,  description: "Российская 3-камерная система" },
  // ── Алюминий холодный ──
  { id: "alutech_s45",     material: "aluminum",      brand: "Alutech",   series: "S45",         chambers: 1, depth: 45, glassThicknessMax: 20, priceCoeff: 1.1,  description: "Холодное остекление, балконы" },
  { id: "provedal_t45",    material: "aluminum",      brand: "Provedal",  series: "T45",         chambers: 1, depth: 45, glassThicknessMax: 20, priceCoeff: 1.0,  description: "Холодное алюминиевое остекление" },
  { id: "tatprof_aes60",   material: "aluminum",      brand: "Татпроф",   series: "AES 60",      chambers: 1, depth: 60, glassThicknessMax: 28, priceCoeff: 1.05, description: "Российский алюминиевый профиль" },
  // ── Алюминий тёплый ──
  { id: "schuco_aws75",    material: "aluminum_warm", brand: "Schüco",    series: "AWS 75",      chambers: 1, depth: 75, glassThicknessMax: 48, priceCoeff: 2.4,  description: "Премиум тёплое остекление" },
  { id: "reynaers_cs77",   material: "aluminum_warm", brand: "Reynaers",  series: "CS 77",       chambers: 1, depth: 77, glassThicknessMax: 50, priceCoeff: 2.6,  description: "Бельгийская тёплая система" },
  { id: "alutech_w72",     material: "aluminum_warm", brand: "Alutech",   series: "W72",         chambers: 1, depth: 72, glassThicknessMax: 44, priceCoeff: 1.6,  description: "Тёплое алюминиевое остекление" },
  { id: "krauss_w62",      material: "aluminum_warm", brand: "Kraus",     series: "W62",         chambers: 1, depth: 62, glassThicknessMax: 40, priceCoeff: 1.5,  description: "Тёплое, российское производство" },
];

// ─── Стеклопакеты ────────────────────────────────────────────────────────────

export interface GlassUnit {
  id: string;
  name: string;
  description: string;
  thickness: number; // мм
  chambers: number;  // 1 или 2
  priceCoeff: number;
}

export const GLASS_UNITS: GlassUnit[] = [
  { id: "1ch_4_16_4",       name: "4-16-4",            description: "Однокамерный, аргон",          thickness: 24, chambers: 1, priceCoeff: 1.0  },
  { id: "1ch_4_16_4i",      name: "4-16-4i",           description: "Однокамерный, энергосберег.",  thickness: 24, chambers: 1, priceCoeff: 1.15 },
  { id: "2ch_4_10_4_10_4",  name: "4-10-4-10-4",       description: "Двухкамерный стандарт",        thickness: 32, chambers: 2, priceCoeff: 1.3  },
  { id: "2ch_4_14_4_14_4i", name: "4-14-4-14-4i",      description: "Двухкамерный, i-стекло",       thickness: 36, chambers: 2, priceCoeff: 1.5  },
  { id: "2ch_4_16_4_16_4i", name: "4-16-4-16-4i",      description: "Двухкамерный, аргон+i-стекло", thickness: 40, chambers: 2, priceCoeff: 1.65 },
  { id: "2ch_triplex",      name: "Триплекс 44.2",      description: "Ударостойкое P4A",             thickness: 42, chambers: 2, priceCoeff: 2.1  },
  { id: "1ch_solar",        name: "Солнцезащитный",     description: "Снижает нагрев на 60%",        thickness: 26, chambers: 1, priceCoeff: 1.8  },
  { id: "1ch_acoustic",     name: "Акустический",       description: "Rw=36дБ, шумоизоляция",       thickness: 30, chambers: 1, priceCoeff: 1.9  },
  { id: "2ch_acoustic",     name: "Акустический 2к.",   description: "Rw=42дБ, асимметричный",      thickness: 44, chambers: 2, priceCoeff: 2.3  },
  { id: "1ch_decorative",   name: "Декоративный",       description: "С рисунком/матовый",           thickness: 24, chambers: 1, priceCoeff: 1.4  },
];

// ─── Покрытие стекла ─────────────────────────────────────────────────────────

export interface GlassCoating {
  id: string;
  name: string;
  description: string;
  priceAdd: number; // руб/м²
}

export const GLASS_COATINGS: GlassCoating[] = [
  { id: "none",         name: "Без покрытия",         description: "Стандартное стекло",                  priceAdd: 0    },
  { id: "energy_save",  name: "K-стекло (i-стекло)",  description: "Энергосберегающее покрытие",          priceAdd: 780  },
  { id: "low_e",        name: "Low-E (мягкое)",        description: "Нейтральное, макс. светопропускание", priceAdd: 1100 },
  { id: "solar_ctrl",   name: "Солнцезащитное",        description: "Отражение тепла до 60%",              priceAdd: 1380 },
  { id: "self_clean",   name: "Самоочищающееся",       description: "Гидрофильное покрытие Pilkington",    priceAdd: 2050 },
  { id: "decorative",   name: "Тонированное",          description: "Серый, бронза, синий",                priceAdd: 1050 },
  { id: "frosted",      name: "Матовое (сатин)",       description: "Пескоструйное или кислотное травление", priceAdd: 1200 },
];

// ─── Ламинирование профиля ───────────────────────────────────────────────────

export interface LaminationType {
  id: string;
  name: string;
  description: string;
  priceAdd: number; // руб/пм профиля
}

export interface LaminationOption {
  id: string;
  name: string;
  description: string;
  priceAdd: number;    // руб/пм — одна сторона
  bothSides?: boolean; // признак двусторонней ламинации (задаётся отдельным флагом)
}

export const LAMINATION_TYPES: LaminationOption[] = [
  { id: "none",         name: "Без ламинации (белый)",   description: "Стандартный белый профиль",           priceAdd: 0   },
  { id: "golden_oak",   name: "Золотой дуб",             description: "Тиснение под дерево",                priceAdd: 490 },
  { id: "dark_oak",     name: "Тёмный дуб",              description: "Тёмная текстура дерева",             priceAdd: 490 },
  { id: "mahogany",     name: "Махагон",                 description: "Красно-коричневый дуб",               priceAdd: 490 },
  { id: "antracite",    name: "Антрацит (RAL 7016)",     description: "Тёмно-серый, популярный цвет",        priceAdd: 610 },
  { id: "black",        name: "Чёрный (RAL 9005)",       description: "Чёрный матовый профиль",              priceAdd: 610 },
  { id: "silver",       name: "Серебристый металлик",    description: "Алюминий под металл",                 priceAdd: 560 },
  { id: "ral_custom",   name: "RAL по запросу",          description: "Любой цвет каталога RAL",             priceAdd: 870 },
];

// ─── Регионы ─────────────────────────────────────────────────────────────────

export interface WindowRegion {
  id: string;
  name: string;
  priceCoeff: number; // множитель к базовой цене
}

export const WINDOW_REGIONS: WindowRegion[] = [
  { id: "moscow",       name: "Москва и МО",             priceCoeff: 1.0  },
  { id: "spb",          name: "Санкт-Петербург и ЛО",    priceCoeff: 0.95 },
  { id: "ekb",          name: "Екатеринбург",            priceCoeff: 0.85 },
  { id: "novosibirsk",  name: "Новосибирск",             priceCoeff: 0.82 },
  { id: "kazan",        name: "Казань",                  priceCoeff: 0.87 },
  { id: "samara",       name: "Самара",                  priceCoeff: 0.84 },
  { id: "nizhny",       name: "Нижний Новгород",         priceCoeff: 0.86 },
  { id: "chelyabinsk",  name: "Челябинск",               priceCoeff: 0.80 },
  { id: "krasnodar",    name: "Краснодар",               priceCoeff: 0.88 },
  { id: "rostov",       name: "Ростов-на-Дону",          priceCoeff: 0.86 },
  { id: "ufa",          name: "Уфа",                     priceCoeff: 0.83 },
  { id: "perm",         name: "Пермь",                   priceCoeff: 0.83 },
  { id: "voronezh",     name: "Воронеж",                 priceCoeff: 0.84 },
  { id: "volgograd",    name: "Волгоград",               priceCoeff: 0.82 },
  { id: "saratov",      name: "Саратов",                 priceCoeff: 0.81 },
  { id: "other",        name: "Другой регион",           priceCoeff: 0.85 },
];

// ─── Фурнитура ───────────────────────────────────────────────────────────────

export interface Hardware {
  id: string;
  brand: string;
  series: string;
  description: string;
  pricePerSash: number; // руб/створку
}

export const HARDWARE_OPTIONS: Hardware[] = [
  { id: "maco_multi",     brand: "MACO",    series: "Multi-Matic",    description: "Австрия, базовая",          pricePerSash: 3100 },
  { id: "maco_smart",     brand: "MACO",    series: "Smart",          description: "Австрия, с микропроветр.",  pricePerSash: 4100 },
  { id: "roto_nt",        brand: "ROTO",    series: "NT",             description: "Германия, стандарт",        pricePerSash: 3450 },
  { id: "roto_ntdesign",  brand: "ROTO",    series: "NT Design",      description: "Германия, скрытая петля",   pricePerSash: 5500 },
  { id: "winkhaus_av2",   brand: "Winkhaus", series: "activPilot",    description: "Германия, автоматика",      pricePerSash: 6500 },
  { id: "siegenia_ti",    brand: "Siegenia", series: "TITAN AF",      description: "Германия, высокая нагрузка",pricePerSash: 4800 },
  { id: "gretsch_mf",     brand: "G-U",      series: "Secural MF",    description: "Германия, антивзломная",    pricePerSash: 6000 },
  { id: "futuruss_301",   brand: "Futuruss", series: "F-301",         description: "Россия, базовая",           pricePerSash: 2100 },
  { id: "kale_basic",     brand: "Kale",     series: "Basic",         description: "Турция, эконом",            pricePerSash: 1750 },
];

// ─── Тип открывания ─────────────────────────────────────────────────────────

export type OpeningType = "fixed" | "tilt" | "swing" | "tilt_swing" | "slide" | "fold";

export interface OpeningOption {
  value: OpeningType;
  label: string;
  priceCoeff: number;
}

export const OPENING_TYPES: OpeningOption[] = [
  { value: "fixed",      label: "Глухая (нет открывания)",  priceCoeff: 0.85 },
  { value: "tilt",       label: "Откидная",                  priceCoeff: 0.95 },
  { value: "swing",      label: "Поворотная",                priceCoeff: 1.0  },
  { value: "tilt_swing", label: "Поворотно-откидная",        priceCoeff: 1.0  },
  { value: "slide",      label: "Раздвижная",                priceCoeff: 1.3  },
  { value: "fold",       label: "Складная (гармошка)",       priceCoeff: 1.5  },
];

// ─── Подоконник ──────────────────────────────────────────────────────────────

export interface WindowSill {
  id: string;
  brand: string;
  material: string;
  pricePerMeter: number;
}

export const WINDOW_SILLS: WindowSill[] = [
  { id: "none",           brand: "—",         material: "Без подоконника",       pricePerMeter: 0    },
  { id: "pvc_white",      brand: "Danke",     material: "ПВХ белый",             pricePerMeter: 780  },
  { id: "pvc_marble",     brand: "Danke",     material: "ПВХ под мрамор",        pricePerMeter: 900  },
  { id: "werzalit",       brand: "Werzalit",  material: "Вержалит (дерево-пластик)", pricePerMeter: 1550 },
  { id: "mdf_oak",        brand: "Egger",     material: "МДФ дуб",               pricePerMeter: 1900 },
  { id: "granite",        brand: "—",         material: "Натуральный камень",    pricePerMeter: 6000 },
  { id: "marble",         brand: "—",         material: "Мрамор",                pricePerMeter: 8500 },
];

// ─── Откос ───────────────────────────────────────────────────────────────────

export interface Slope {
  id: string;
  name: string;
  pricePerMeter: number;
}

export const SLOPES: Slope[] = [
  { id: "none",         name: "Без откосов",              pricePerMeter: 0    },
  { id: "pvc_white",    name: "ПВХ панель белая",         pricePerMeter: 660  },
  { id: "pvc_marble",   name: "ПВХ панель под мрамор",    pricePerMeter: 780  },
  { id: "gypsum",       name: "Штукатурные (гипс)",       pricePerMeter: 1100 },
  { id: "mdf",          name: "МДФ крашеный",             pricePerMeter: 1450 },
];

// ─── Итоговая конструкция ────────────────────────────────────────────────────

export interface WindowConfig {
  id: string;
  constructionType: ConstructionType;
  width: number;        // мм
  height: number;       // мм
  quantity: number;
  profileSystemId: string;
  glassUnitId: string;
  glassCoatingId: string;
  laminationId: string;
  laminationBothSides: boolean; // ламинирование с двух сторон
  hardwareId: string;
  openingTypes: OpeningType[]; // для каждой створки
  windowSillId: string;
  windowSillWidth: number;   // мм, глубина подоконника
  slopeId: string;
  slopePerimeter: number;    // пм
  installationIncluded: boolean;
  regionId: string;
  note: string;
  totalPrice: number;
}

// ─── Базовая цена за м² конструкции ─────────────────────────────────────────

export const BASE_PRICE_PER_M2: Record<ProfileMaterial, number> = {
  pvc:           20000,
  aluminum:      16000,
  aluminum_warm: 37000,
};

export const INSTALLATION_PRICE_PER_M2 = 3100;