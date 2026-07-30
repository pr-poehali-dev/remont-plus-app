// ─── Сезонность цен на работы ────────────────────────────────────────────────
// В высокий сезон (тёплые месяцы) спрос на мастеров выше, специалистов не хватает —
// расценки на РАБОТЫ растут. Зимой — спад, мастера дают скидки.
// Коэффициент применяется ТОЛЬКО к работам (не к материалам).

export type SeasonId = "low" | "normal" | "high" | "auto";

export interface SeasonOption {
  id: Exclude<SeasonId, "auto">;
  label: string;
  coeff: number;
  hint: string;
}

export const SEASONS: SeasonOption[] = [
  { id: "low",    label: "Низкий сезон",   coeff: 0.92, hint: "Зима — спад спроса, мастера дают скидки" },
  { id: "normal", label: "Обычный сезон",  coeff: 1.0,  hint: "Межсезонье — базовые расценки" },
  { id: "high",   label: "Высокий сезон",  coeff: 1.15, hint: "Тёплый сезон — нехватка мастеров, цены выше" },
];

// Авто-коэффициент по номеру месяца (0=январь … 11=декабрь)
// Пик: май–сентябрь. Спад: декабрь–февраль. Плавные переходы весной/осенью.
const MONTH_COEFF: number[] = [
  0.92, // Январь  — низкий
  0.92, // Февраль — низкий
  0.97, // Март    — переход
  1.03, // Апрель  — рост
  1.12, // Май     — высокий
  1.15, // Июнь    — пик
  1.15, // Июль    — пик
  1.15, // Август  — пик
  1.10, // Сентябрь— высокий
  1.02, // Октябрь — спад
  0.96, // Ноябрь  — переход
  0.92, // Декабрь — низкий
];

const MONTH_LABELS = [
  "январь", "февраль", "март", "апрель", "май", "июнь",
  "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь",
];

/** Авто-коэффициент сезона для текущего (или заданного) месяца. */
export function autoSeasonCoeff(date = new Date()): number {
  return MONTH_COEFF[date.getMonth()] ?? 1.0;
}

/** Человеко-читаемое описание текущего сезона по месяцу. */
export function autoSeasonLabel(date = new Date()): string {
  const c = autoSeasonCoeff(date);
  const m = MONTH_LABELS[date.getMonth()];
  if (c >= 1.1) return `Высокий сезон (${m})`;
  if (c <= 0.95) return `Низкий сезон (${m})`;
  return `Обычный сезон (${m})`;
}

/**
 * Итоговый коэффициент сезона к работам.
 * seasonId="auto" — берётся по текущему месяцу; иначе — ручной выбор.
 */
export function seasonCoeff(seasonId: SeasonId, date = new Date()): number {
  if (seasonId === "auto") return autoSeasonCoeff(date);
  return SEASONS.find(s => s.id === seasonId)?.coeff ?? 1.0;
}

export function seasonLabel(seasonId: SeasonId, date = new Date()): string {
  if (seasonId === "auto") return autoSeasonLabel(date);
  return SEASONS.find(s => s.id === seasonId)?.label ?? "Обычный сезон";
}

export const DEFAULT_SEASON_ID: SeasonId = "auto";
