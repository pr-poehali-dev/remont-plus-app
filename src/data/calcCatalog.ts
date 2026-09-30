/**
 * КАТАЛОГ КАЛЬКУЛЯТОРОВ ДЛЯ РЕГИОНАЛЬНОГО SEO.
 *
 * Каждый калькулятор получает посадочные страницы по городам:
 *   /turnkey/samara, /bathroom/kazan, /framehouse/moskva …
 * Отсюда же строится sitemap.xml и перелинковка.
 */

export interface CalcEntry {
  /** Базовый путь калькулятора: /turnkey */
  path: string;
  /** «Ремонт квартиры под ключ» */
  title: string;
  /** Короткое имя для крошек: «Ремонт под ключ» */
  short: string;
  icon: string;
  /** Винительный для заголовка: «Рассчитайте ремонт квартиры под ключ в Самаре» */
  accusative: string;
  /** Ключевой запрос без города */
  keyword: string;
  /** Показывать в региональной выдаче (у некоторых калькуляторов гео не важно) */
  regional: boolean;
}

export const CALCULATORS: CalcEntry[] = [
  {
    path: "/turnkey", title: "Ремонт квартиры под ключ", short: "Ремонт под ключ",
    icon: "Home", accusative: "ремонт квартиры под ключ",
    keyword: "ремонт квартиры под ключ", regional: true,
  },
  {
    path: "/newbuild", title: "Ремонт в новостройке", short: "Новостройка",
    icon: "Building2", accusative: "ремонт в новостройке",
    keyword: "ремонт новостройки", regional: true,
  },
  {
    path: "/bathroom", title: "Ремонт санузла", short: "Санузел",
    icon: "Bath", accusative: "ремонт ванной и санузла",
    keyword: "ремонт ванной комнаты", regional: true,
  },
  {
    path: "/ceilings", title: "Монтаж потолков", short: "Потолки",
    icon: "PanelTop", accusative: "монтаж потолков",
    keyword: "натяжные потолки цена", regional: true,
  },
  {
    path: "/flooring", title: "Укладка полов", short: "Полы",
    icon: "Layers", accusative: "укладку полов",
    keyword: "укладка ламината цена", regional: true,
  },
  {
    path: "/electrics", title: "Электромонтажные работы", short: "Электрика",
    icon: "Zap", accusative: "электромонтажные работы",
    keyword: "электрика в квартире цена", regional: true,
  },
  {
    path: "/windows", title: "Установка окон", short: "Окна",
    icon: "AppWindow", accusative: "установку окон",
    keyword: "пластиковые окна цена", regional: true,
  },
  {
    path: "/bathhouse", title: "Строительство бани", short: "Баня",
    icon: "Flame", accusative: "строительство бани",
    keyword: "построить баню цена", regional: true,
  },
  {
    path: "/framehouse", title: "Строительство каркасного дома", short: "Каркасный дом",
    icon: "House", accusative: "строительство каркасного дома",
    keyword: "каркасный дом под ключ цена", regional: true,
  },
  {
    path: "/office", title: "Ремонт офиса и коммерции", short: "Офис",
    icon: "Briefcase", accusative: "ремонт офиса",
    keyword: "ремонт офиса цена", regional: true,
  },
];

export const CALC_BY_PATH: Record<string, CalcEntry> = Object.fromEntries(
  CALCULATORS.map((c) => [c.path, c]),
);

/** Калькулятор по сегменту пути без слеша: "turnkey" → запись */
export function getCalcBySegment(segment?: string): CalcEntry | undefined {
  if (!segment) return undefined;
  return CALC_BY_PATH[`/${segment}`];
}

export const REGIONAL_CALCULATORS = CALCULATORS.filter((c) => c.regional);
