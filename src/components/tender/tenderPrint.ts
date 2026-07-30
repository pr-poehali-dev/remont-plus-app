import type { OverheadState } from "@/components/calculator/shared/overheads";
import type { TenderResult, TenderItem } from "./TenderEstimateTable";
import { computeTenderTotals } from "./tenderTotals";

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");
const esc = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/**
 * Печать КП (коммерческого предложения) по смете через окно браузера → PDF.
 */
export function printTenderKP(
  result: TenderResult,
  workCoeff: number,
  markupPct: number,
  overheads: OverheadState,
  profitPct: number,
) {
  const t = computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct);
  const today = new Date().toLocaleDateString("ru-RU");

  let idx = 0;
  const section = (title: string, items: TenderItem[], sectionTotal: number) => {
    if (items.length === 0) return "";
    const rows = items.map((it) => {
      idx += 1;
      return `<tr>
        <td class="c">${idx}</td>
        <td>${esc(it.name)}${it.note ? `<div class="note">${esc(it.note)}</div>` : ""}</td>
        <td class="c">${esc(it.unit)}</td>
        <td class="r">${it.qty}</td>
        <td class="r">${fmt(it.pricePerUnit)}</td>
        <td class="r">${fmt(it.total)}</td>
      </tr>`;
    }).join("");
    return `<tr class="sect"><td colspan="6">${title}</td></tr>${rows}
      <tr class="sub"><td colspan="5">Итого ${title.toLowerCase()}</td><td class="r">${fmt(sectionTotal)} ₽</td></tr>`;
  };

  const extra = t.extraLines.map((l) =>
    `<tr class="extra"><td colspan="5">${esc(l.label)}</td><td class="r">+ ${fmt(l.amount)} ₽</td></tr>`
  ).join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">
<title>Коммерческое предложение — ${esc(result.title || "Смета")}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Arial, sans-serif; color: #1a1a1a; margin: 0; padding: 32px; font-size: 13px; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .muted { color: #666; font-size: 12px; }
  .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 3px solid #0d9488; padding-bottom: 12px; margin-bottom: 16px; }
  .brand { font-size: 18px; font-weight: 800; color: #0d9488; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; vertical-align: top; }
  th { background: #f1f5f9; font-size: 11px; text-transform: uppercase; text-align: left; }
  td.c { text-align: center; } td.r { text-align: right; white-space: nowrap; }
  tr.sect td { background: #ecfeff; font-weight: 700; color: #0f766e; text-transform: uppercase; font-size: 11px; }
  tr.sub td { font-weight: 700; background: #fafafa; }
  tr.extra td { color: #555; }
  .note { color: #b45309; font-size: 11px; }
  .total { margin-top: 14px; display: flex; justify-content: flex-end; }
  .total .box { border: 2px solid #0d9488; border-radius: 8px; padding: 10px 20px; font-size: 17px; font-weight: 800; color: #0f766e; }
  .foot { margin-top: 28px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
  @media print { body { padding: 12mm; } button { display: none; } }
</style></head>
<body>
  <div class="head">
    <div>
      <div class="brand">Авангард</div>
      <div class="muted">Коммерческое предложение · avangard-ai.ru</div>
    </div>
    <div class="muted">Дата: ${today}</div>
  </div>

  <h1>${esc(result.title || "Смета по ТЗ")}</h1>
  ${result.summary ? `<p class="muted">${esc(result.summary)}</p>` : ""}

  <table>
    <thead>
      <tr>
        <th style="width:32px">№</th>
        <th>Наименование работ / материалов</th>
        <th style="width:60px">Ед.</th>
        <th style="width:60px">Кол-во</th>
        <th style="width:90px">Цена, ₽</th>
        <th style="width:100px">Стоимость, ₽</th>
      </tr>
    </thead>
    <tbody>
      ${section("Работы", t.works, t.worksTotal)}
      ${section("Материалы", t.materials, t.materialsTotal)}
      <tr class="sub"><td colspan="5">Прямые затраты</td><td class="r">${fmt(t.base)} ₽</td></tr>
      ${extra}
    </tbody>
  </table>

  <div class="total"><div class="box">ИТОГО: ${fmt(t.total)} ₽</div></div>

  <div class="foot">
    Предложение носит информационный характер. Итоговая стоимость уточняется после осмотра объекта.
    Цены действительны 14 дней с даты формирования.
  </div>

  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body></html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
}
