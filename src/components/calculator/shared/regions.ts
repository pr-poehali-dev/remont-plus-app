export interface CalcRegion {
  id: string;
  label: string;
  coeff: number;
}

// Региональные коэффициенты к РАБОТАМ.
// База = средняя по РФ = 1.0. Базовые расценки в движках заданы как средние
// по стране, регион лишь корректирует их в реальных рыночных пределах 2026.
// Реальный разброс работ Москва/регионы ~20-30%, а не в разы.
export const CALC_REGIONS: CalcRegion[] = [
  { id: "moscow",      label: "Москва и МО",          coeff: 1.18 },
  { id: "spb",         label: "Санкт-Петербург и ЛО", coeff: 1.12 },
  { id: "ekb",         label: "Екатеринбург",          coeff: 1.02 },
  { id: "novosibirsk", label: "Новосибирск",           coeff: 1.0  },
  { id: "kazan",       label: "Казань",                coeff: 1.0  },
  { id: "samara",      label: "Самара",                coeff: 0.95 },
  { id: "nizhny",      label: "Нижний Новгород",       coeff: 0.98 },
  { id: "chelyabinsk", label: "Челябинск",             coeff: 0.95 },
  { id: "krasnodar",   label: "Краснодар",             coeff: 1.0  },
  { id: "rostov",      label: "Ростов-на-Дону",        coeff: 0.98 },
  { id: "ufa",         label: "Уфа",                   coeff: 0.95 },
  { id: "perm",        label: "Пермь",                 coeff: 0.95 },
  { id: "voronezh",    label: "Воронеж",               coeff: 0.94 },
  { id: "volgograd",   label: "Волгоград",             coeff: 0.93 },
  { id: "saratov",     label: "Саратов",               coeff: 0.92 },
  { id: "other",       label: "Другой регион (средняя РФ)", coeff: 1.0 },
];

export const DEFAULT_REGION_ID = "moscow";
