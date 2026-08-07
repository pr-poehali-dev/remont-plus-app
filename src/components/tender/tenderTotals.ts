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
  /** сумма до вычета скидки */
  totalBeforeDiscount: number;
  /** сумма скидки (положительное число), вычитается из итога */
  discount: number;
  discountPct: number;
  total: number;
}

/** Скидка: процент от итога или фиксированная сумма в рублях. */
export interface DiscountState {
  mode: "percent" | "amount";
  value: number;
}

export const DEFAULT_DISCOUNT: DiscountState = { mode: "percent", value: 0 };

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
  discount: DiscountState = DEFAULT_DISCOUNT,
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

  const totalBeforeDiscount = base + markup + oh.total + profit;

  // Скидка заказчику — вычитается из итоговой суммы
  let discountAmount = 0;
  if (discount && discount.value > 0) {
    discountAmount = discount.mode === "percent"
      ? Math.round(totalBeforeDiscount * Math.min(discount.value, 100) / 100)
      : Math.round(discount.value);
    discountAmount = Math.min(discountAmount, totalBeforeDiscount);
  }
  const discountPct = totalBeforeDiscount > 0 ? (discountAmount / totalBeforeDiscount) * 100 : 0;

  const total = totalBeforeDiscount - discountAmount;

  return {
    works, materials, worksTotal, materialsTotal, base,
    markup, markupPct,
    overheadLines: oh.lines.map((l) => ({ id: l.id, label: l.label, pct: l.pct, amount: l.amount })),
    overheadsTotal: oh.total,
    profit, profitPct,
    extraLines,
    totalBeforeDiscount,
    discount: discountAmount,
    discountPct,
    total,
  };
}