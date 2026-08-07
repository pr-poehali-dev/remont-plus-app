import * as XLSX from "xlsx";
import type { OverheadState } from "@/components/calculator/shared/overheads";
import type { TenderResult } from "./TenderEstimateTable";
import { computeTenderTotals, DEFAULT_DISCOUNT, type DiscountState } from "./tenderTotals";

const r = (n: number) => Math.round(n);

/**
 * Экспорт сметы по ТЗ в Excel (формат локальной сметы).
 * Колонки: №, Наименование, Ед.изм, Кол-во, Цена ₽, Стоимость ₽, Источник.
 */
export function exportTenderToExcel(
  result: TenderResult,
  workCoeff: number,
  markupPct: number,
  overheads: OverheadState,
  profitPct: number,
  discount: DiscountState = DEFAULT_DISCOUNT,
) {
  const t = computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct, discount);

  const rows: (string | number)[][] = [];
  rows.push([result.title || "Смета по ТЗ"]);
  if (result.summary) rows.push([result.summary]);
  rows.push([]);
  rows.push(["№", "Наименование работ / материалов", "Ед. изм.", "Кол-во", "Цена, ₽", "Стоимость, ₽", "Источник"]);

  let idx = 0;
  const pushSection = (title: string, items: typeof t.works, sectionTotal: number) => {
    if (items.length === 0) return;
    rows.push(["", title.toUpperCase(), "", "", "", "", ""]);
    for (const it of items) {
      idx += 1;
      rows.push([
        idx,
        it.note ? `${it.name} (${it.note})` : it.name,
        it.unit,
        it.qty,
        r(it.pricePerUnit),
        r(it.total),
        it.source === "book" ? "своя расценка" : "оценка ИИ",
      ]);
    }
    rows.push(["", `Итого ${title.toLowerCase()}`, "", "", "", r(sectionTotal), ""]);
  };

  pushSection("Работы", t.works, t.worksTotal);
  pushSection("Материалы", t.materials, t.materialsTotal);

  rows.push([]);
  rows.push(["", "Прямые затраты (работы + материалы)", "", "", "", r(t.base), ""]);
  for (const l of t.extraLines) {
    rows.push(["", l.label, "", "", "", r(l.amount), ""]);
  }
  if (t.discount > 0) {
    rows.push(["", "Сумма до скидки, ₽", "", "", "", r(t.totalBeforeDiscount), ""]);
    rows.push(["", `Скидка заказчику${t.discountPct >= 0.5 ? ` (${t.discountPct.toFixed(t.discountPct % 1 === 0 ? 0 : 1)}%)` : ""}, ₽`, "", "", "", -r(t.discount), ""]);
  }
  rows.push(["", "ИТОГО ПО СМЕТЕ, ₽", "", "", "", r(t.total), ""]);

  const ws = XLSX.utils.aoa_to_sheet(rows);
  ws["!cols"] = [
    { wch: 5 }, { wch: 52 }, { wch: 9 }, { wch: 9 }, { wch: 13 }, { wch: 15 }, { wch: 16 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Смета");

  const safeTitle = (result.title || "smeta").replace(/[^\wа-яА-Я0-9 -]/gi, "").slice(0, 40).trim() || "smeta";
  XLSX.writeFile(wb, `${safeTitle}.xlsx`);
}