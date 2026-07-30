import { calcOverheads } from "@/components/calculator/shared/overheads";
import type { OverheadState } from "@/components/calculator/shared/overheads";
import type { TenderItem, TenderResult } from "./TenderEstimateTable";

export interface TenderScaledItem extends TenderItem {}

export interface TenderExtraLine {
  key: string;
  label: string;
  amount: number;
}

export interface TenderTotals {
  works: TenderScaledItem[];
  materials: TenderScaledItem[];
  worksTotal: number;
  materialsTotal: number;
  base: number;
  markup: number;
  markupPct: number;
  overheadLines: { id: string; label: string; pct: number; amount: number }[];
  overheadsTotal: number;
  profit: number;
  profitPct: number;
  extraLines: TenderExtraLine[];
  total: number;
}

/**
 * Единый расчёт итогов сметы по ТЗ (формат локальной сметы estimate.ru):
 * работы + материалы → наценка → накладные расходы → сметная прибыль → ИТОГО.
 * Сметная прибыль (СП) начисляется на работы (после наценки) — как в МДС.
 */
export function computeTenderTotals(
  result: TenderResult,
  workCoeff: number,
  markupPct: number,
  overheads: OverheadState,
  profitPct: number,
): TenderTotals {
  const scaled = result.items.map((it) => {
    const price = it.type === "work" ? Math.round(it.pricePerUnit * workCoeff) : it.pricePerUnit;
    return { ...it, pricePerUnit: price, total: Math.round(price * it.qty) };
  });

  const works = scaled.filter((i) => i.type === "work");
  const materials = scaled.filter((i) => i.type === "material");
  const worksTotal = works.reduce((s, i) => s + i.total, 0);
  const materialsTotal = materials.reduce((s, i) => s + i.total, 0);
  const base = worksTotal + materialsTotal;
  const markup = markupPct > 0 ? Math.round(base * markupPct / 100) : 0;

  const kMarkup = base > 0 ? (base + markup) / base : 1;
  const worksWithMarkup = Math.round(worksTotal * kMarkup);
  const materialsWithMarkup = Math.round(materialsTotal * kMarkup);

  const oh = calcOverheads(overheads, worksWithMarkup, materialsWithMarkup);

  // Сметная прибыль — процент от работ (с учётом наценки), как в локальной смете.
  const profit = profitPct > 0 ? Math.round(worksWithMarkup * profitPct / 100) : 0;

  const extraLines: TenderExtraLine[] = [];
  if (markup > 0) extraLines.push({ key: "markup", label: `Наценка ${markupPct}%`, amount: markup });
  for (const l of oh.lines) {
    extraLines.push({ key: l.id, label: `${l.label} (${l.pct}%)`, amount: l.amount });
  }
  if (profit > 0) extraLines.push({ key: "profit", label: `Сметная прибыль ${profitPct}%`, amount: profit });

  const total = base + markup + oh.total + profit;

  return {
    works, materials, worksTotal, materialsTotal, base,
    markup, markupPct,
    overheadLines: oh.lines.map((l) => ({ id: l.id, label: l.label, pct: l.pct, amount: l.amount })),
    overheadsTotal: oh.total,
    profit, profitPct,
    extraLines, total,
  };
}
