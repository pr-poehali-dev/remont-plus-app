// ─── Накладные расходы сметы ──────────────────────────────────────────────────
// Прораб, снабженец, транспорт, содержание офиса.
// Каждый вид можно включить/выключить и задать свой процент.
// База расчёта у каждого своя:
//   - прораб      → % от РАБОТ (управление бригадами)
//   - снабженец   → % от МАТЕРИАЛОВ (закупка, логистика поставок)
//   - транспорт   → % от МАТЕРИАЛОВ (доставка на объект)
//   - офис        → % от (РАБОТЫ + МАТЕРИАЛЫ) (содержание офиса, накладные 10%)

export type OverheadBase = "works" | "materials" | "total";

export interface OverheadDef {
  id: "foreman" | "supplier" | "transport" | "office";
  label: string;
  base: OverheadBase;
  defaultPct: number;
  hint: string;
}

export const OVERHEAD_DEFS: OverheadDef[] = [
  { id: "foreman",   label: "Прораб (технадзор)",     base: "works",     defaultPct: 8,  hint: "Управление бригадами, контроль качества — % от работ" },
  { id: "supplier",  label: "Снабженец (закупка)",    base: "materials", defaultPct: 5,  hint: "Подбор и закупка материалов — % от материалов" },
  { id: "transport", label: "Транспортные расходы",   base: "materials", defaultPct: 4,  hint: "Доставка материалов на объект — % от материалов" },
  { id: "office",    label: "Содержание офиса",       base: "total",     defaultPct: 10, hint: "Накладные расходы компании — % от работ+материалов" },
];

export interface OverheadState {
  foreman: { on: boolean; pct: number };
  supplier: { on: boolean; pct: number };
  transport: { on: boolean; pct: number };
  office: { on: boolean; pct: number };
}

export function defaultOverheads(): OverheadState {
  return {
    foreman:   { on: false, pct: 8 },
    supplier:  { on: false, pct: 5 },
    transport: { on: false, pct: 4 },
    office:    { on: false, pct: 10 },
  };
}

export interface OverheadLine {
  id: OverheadDef["id"];
  label: string;
  pct: number;
  base: OverheadBase;
  amount: number;
}

export interface OverheadResult {
  lines: OverheadLine[];
  total: number;
}

/** Считает накладные от сумм работ и материалов (после наценки, до итога). */
export function calcOverheads(
  state: OverheadState,
  worksSum: number,
  materialsSum: number,
): OverheadResult {
  const baseValue = (b: OverheadBase) =>
    b === "works" ? worksSum : b === "materials" ? materialsSum : worksSum + materialsSum;

  const lines: OverheadLine[] = [];
  for (const def of OVERHEAD_DEFS) {
    const s = state[def.id];
    if (!s?.on || s.pct <= 0) continue;
    const amount = Math.round(baseValue(def.base) * s.pct / 100);
    if (amount <= 0) continue;
    lines.push({ id: def.id, label: def.label, pct: s.pct, base: def.base, amount });
  }
  const total = lines.reduce((sum, l) => sum + l.amount, 0);
  return { lines, total };
}

const STORAGE_KEY = "calc_overheads";

export function loadOverheads(): OverheadState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultOverheads(), ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultOverheads();
}

export function saveOverheads(state: OverheadState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}
