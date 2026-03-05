export interface CalcRegion {
  id: string;
  label: string;
  coeff: number;
}

export const CALC_REGIONS: CalcRegion[] = [
  { id: "moscow",      label: "Москва и МО",          coeff: 1.3  },
  { id: "spb",         label: "Санкт-Петербург и ЛО", coeff: 1.2  },
  { id: "ekb",         label: "Екатеринбург",          coeff: 1.1  },
  { id: "novosibirsk", label: "Новосибирск",           coeff: 1.05 },
  { id: "kazan",       label: "Казань",                coeff: 1.08 },
  { id: "samara",      label: "Самара",                coeff: 0.79 },
  { id: "nizhny",      label: "Нижний Новгород",       coeff: 1.06 },
  { id: "chelyabinsk", label: "Челябинск",             coeff: 1.0  },
  { id: "krasnodar",   label: "Краснодар",             coeff: 1.08 },
  { id: "rostov",      label: "Ростов-на-Дону",        coeff: 1.06 },
  { id: "ufa",         label: "Уфа",                   coeff: 1.03 },
  { id: "perm",        label: "Пермь",                 coeff: 1.03 },
  { id: "voronezh",    label: "Воронеж",               coeff: 1.05 },
  { id: "volgograd",   label: "Волгоград",             coeff: 1.02 },
  { id: "saratov",     label: "Саратов",               coeff: 1.01 },
  { id: "other",       label: "Другой регион",         coeff: 1.0  },
];

export const DEFAULT_REGION_ID = "moscow";