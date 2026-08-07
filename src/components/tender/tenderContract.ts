import type { OverheadState } from "@/components/calculator/shared/overheads";
import type { TenderResult, TenderItem } from "./TenderEstimateTable";
import { computeTenderTotals, DEFAULT_DISCOUNT, type DiscountState } from "./tenderTotals";

const fmt = (n: number) => Math.round(n).toLocaleString("ru-RU");
const esc = (s: string) => (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export interface ContractParty {
  /** Подрядчик */
  contractorName: string;
  contractorDetails: string;
  /** Заказчик */
  customerName: string;
  customerDetails: string;
  /** Объект / адрес работ */
  objectAddress: string;
  contractNumber: string;
  dateStr: string;
  /** срок выполнения, дней */
  termDays: number;
  /** аванс, % */
  prepayPct: number;
}

export const EMPTY_CONTRACT: ContractParty = {
  contractorName: "",
  contractorDetails: "",
  customerName: "",
  customerDetails: "",
  objectAddress: "",
  contractNumber: "",
  dateStr: new Date().toLocaleDateString("ru-RU"),
  termDays: 45,
  prepayPct: 30,
};

/** Сумма прописью (рубли). */
export function rublesInWords(nRaw: number): string {
  const n = Math.round(nRaw);
  if (n === 0) return "ноль рублей";
  const ones = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const onesF = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
  const teens = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
  const tens = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
  const hundreds = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

  const triadToWords = (num: number, female: boolean): string[] => {
    const out: string[] = [];
    const h = Math.floor(num / 100);
    const t = Math.floor((num % 100) / 10);
    const o = num % 10;
    if (h) out.push(hundreds[h]);
    if (t === 1) {
      out.push(teens[o]);
    } else {
      if (t) out.push(tens[t]);
      if (o) out.push(female ? onesF[o] : ones[o]);
    }
    return out;
  };

  const plural = (num: number, forms: [string, string, string]) => {
    const n100 = num % 100;
    const n10 = num % 10;
    if (n100 > 10 && n100 < 20) return forms[2];
    if (n10 === 1) return forms[0];
    if (n10 >= 2 && n10 <= 4) return forms[1];
    return forms[2];
  };

  const words: string[] = [];
  const millions = Math.floor(n / 1_000_000);
  const thousands = Math.floor((n % 1_000_000) / 1000);
  const rest = n % 1000;

  if (millions) {
    words.push(...triadToWords(millions, false));
    words.push(plural(millions, ["миллион", "миллиона", "миллионов"]));
  }
  if (thousands) {
    words.push(...triadToWords(thousands, true));
    words.push(plural(thousands, ["тысяча", "тысячи", "тысяч"]));
  }
  if (rest) words.push(...triadToWords(rest, false));

  words.push(plural(n, ["рубль", "рубля", "рублей"]));
  const s = words.filter(Boolean).join(" ");
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * Печать договора подряда по смете (со скидкой) + смета как Приложение №1.
 */
export function printContract(
  result: TenderResult,
  workCoeff: number,
  markupPct: number,
  overheads: OverheadState,
  profitPct: number,
  discount: DiscountState = DEFAULT_DISCOUNT,
  party: ContractParty = EMPTY_CONTRACT,
) {
  const t = computeTenderTotals(result, workCoeff, markupPct, overheads, profitPct, discount);
  const total = t.total;
  const prepay = Math.round(total * (party.prepayPct || 0) / 100);

  let idx = 0;
  const section = (title: string, items: TenderItem[], sectionTotal: number) => {
    if (items.length === 0) return "";
    const rows = items.map((it) => {
      idx += 1;
      return `<tr>
        <td class="c">${idx}</td>
        <td>${esc(it.name)}</td>
        <td class="c">${esc(it.unit)}</td>
        <td class="r">${it.qty}</td>
        <td class="r">${fmt(it.pricePerUnit)}</td>
        <td class="r">${fmt(it.total)}</td>
      </tr>`;
    }).join("");
    return `<tr class="sect"><td colspan="6">${title}</td></tr>${rows}
      <tr class="sub"><td colspan="5">Итого ${title.toLowerCase()}</td><td class="r">${fmt(sectionTotal)} ₽</td></tr>`;
  };

  const extras = t.extraLines.map((l) =>
    `<tr class="extra"><td colspan="5">${esc(l.label)}</td><td class="r">+ ${fmt(l.amount)} ₽</td></tr>`
  ).join("");

  const discountRows = t.discount > 0
    ? `<tr class="extra"><td colspan="5">Сумма до скидки</td><td class="r">${fmt(t.totalBeforeDiscount)} ₽</td></tr>
       <tr class="extra disc"><td colspan="5">Скидка заказчику${t.discountPct >= 0.5 ? ` ${t.discountPct.toFixed(t.discountPct % 1 === 0 ? 0 : 1)}%` : ""}</td><td class="r">− ${fmt(t.discount)} ₽</td></tr>`
    : "";

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="utf-8">
<title>Договор подряда${party.contractNumber ? ` №${esc(party.contractNumber)}` : ""}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Times New Roman", Georgia, serif; color: #111; margin: 0; padding: 28px 34px; font-size: 13px; line-height: 1.55; }
  h1 { font-size: 17px; text-align: center; margin: 0 0 4px; }
  h2 { font-size: 14px; margin: 18px 0 6px; }
  .meta { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 16px; }
  p { margin: 6px 0; text-align: justify; }
  ol { padding-left: 18px; margin: 6px 0; }
  ol li { margin: 4px 0; text-align: justify; }
  table { width: 100%; border-collapse: collapse; margin-top: 8px; font-family: Arial, sans-serif; font-size: 11.5px; }
  th, td { border: 1px solid #d4d4d4; padding: 5px 6px; }
  th { background: #f3f4f6; font-size: 11px; }
  td.c { text-align: center; } td.r { text-align: right; white-space: nowrap; }
  tr.sect td { background: #f0fdfa; font-weight: 700; text-transform: uppercase; font-size: 10.5px; }
  tr.sub td { font-weight: 700; background: #fafafa; }
  tr.extra td { color: #444; }
  tr.disc td { color: #b91c1c; font-weight: 700; }
  .total-box { margin-top: 12px; text-align: right; font-size: 15px; font-weight: 700; }
  .sign { display: flex; justify-content: space-between; gap: 30px; margin-top: 34px; }
  .sign div { width: 47%; font-size: 12px; }
  .sign .line { margin-top: 34px; border-top: 1px solid #333; padding-top: 4px; }
  .page-break { page-break-before: always; }
  @media print { body { padding: 12mm 14mm; } @page { margin: 0; size: A4; } }
</style></head><body>

<h1>ДОГОВОР ПОДРЯДА${party.contractNumber ? ` № ${esc(party.contractNumber)}` : ""}</h1>
<div class="meta"><span>${esc(party.objectAddress ? `Объект: ${party.objectAddress}` : "")}</span><span>${esc(party.dateStr)}</span></div>

<p><b>${esc(party.contractorName) || "____________________"}</b>, именуемый в дальнейшем «Подрядчик», с одной стороны, и
<b>${esc(party.customerName) || "____________________"}</b>, именуемый в дальнейшем «Заказчик», с другой стороны,
заключили настоящий Договор о нижеследующем.</p>

<h2>1. Предмет договора</h2>
<ol>
  <li>Подрядчик обязуется выполнить работы: <b>${esc(result.title || "строительно-монтажные работы")}</b>${party.objectAddress ? ` на объекте по адресу: ${esc(party.objectAddress)}` : ""}, а Заказчик — принять результат и оплатить его.</li>
  <li>Объём, состав и стоимость работ определены Сметой (Приложение №1), являющейся неотъемлемой частью Договора.</li>
</ol>

<h2>2. Стоимость и порядок расчётов</h2>
<ol>
  <li>Общая стоимость работ составляет <b>${fmt(total)} ₽</b> (${rublesInWords(total)}).${t.discount > 0 ? ` Стоимость указана с учётом предоставленной Заказчику скидки в размере ${fmt(t.discount)} ₽.` : ""}</li>
  <li>Заказчик перечисляет аванс в размере ${party.prepayPct}% — <b>${fmt(prepay)} ₽</b> в течение 3 (трёх) рабочих дней с даты подписания Договора.</li>
  <li>Окончательный расчёт — <b>${fmt(total - prepay)} ₽</b> — производится в течение 5 (пяти) рабочих дней с даты подписания Акта сдачи-приёмки выполненных работ.</li>
  <li>Стоимость может быть изменена при изменении объёма работ по согласованию Сторон путём подписания дополнительного соглашения.</li>
</ol>

<h2>3. Сроки выполнения работ</h2>
<ol>
  <li>Срок выполнения работ — <b>${party.termDays}</b> календарных дней с даты поступления аванса.</li>
  <li>Срок может быть продлён при возникновении обстоятельств, не зависящих от Подрядчика, а также при задержке предоставления Заказчиком материалов, доступа на объект или согласований.</li>
</ol>

<h2>4. Права и обязанности сторон</h2>
<ol>
  <li>Подрядчик обязуется выполнить работы качественно, в соответствии со строительными нормами и Сметой.</li>
  <li>Заказчик обязуется обеспечить доступ на объект, наличие электроснабжения и водоснабжения, а также своевременно принять и оплатить работы.</li>
  <li>Скрытые работы принимаются Заказчиком по мере готовности с оформлением соответствующих актов.</li>
</ol>

<h2>5. Приёмка работ и гарантия</h2>
<ol>
  <li>По завершении работ Подрядчик передаёт Заказчику Акт сдачи-приёмки. Заказчик обязан подписать Акт либо предоставить мотивированный отказ в течение 3 (трёх) рабочих дней.</li>
  <li>Гарантийный срок на выполненные работы — 12 месяцев с даты подписания Акта. Гарантия не распространяется на дефекты, вызванные нарушением правил эксплуатации, действиями третьих лиц и материалами Заказчика.</li>
</ol>

<h2>6. Ответственность сторон</h2>
<ol>
  <li>За нарушение сроков оплаты Заказчик уплачивает пеню 0,1% от просроченной суммы за каждый день просрочки, но не более 10% от суммы Договора.</li>
  <li>За нарушение сроков выполнения работ Подрядчик уплачивает пеню 0,1% от стоимости невыполненных работ за каждый день просрочки, но не более 10%.</li>
  <li>Стороны освобождаются от ответственности при наступлении обстоятельств непреодолимой силы.</li>
</ol>

<h2>7. Заключительные положения</h2>
<ol>
  <li>Договор вступает в силу с момента подписания и действует до полного исполнения обязательств.</li>
  <li>Споры разрешаются путём переговоров, при недостижении согласия — в суде по месту нахождения Подрядчика.</li>
  <li>Договор составлен в двух экземплярах, имеющих равную юридическую силу.</li>
</ol>

<h2>8. Реквизиты и подписи сторон</h2>
<div class="sign">
  <div>
    <b>Подрядчик</b><br>
    ${esc(party.contractorName) || "____________________"}<br>
    <span style="white-space: pre-wrap">${esc(party.contractorDetails)}</span>
    <div class="line">подпись / М.П.</div>
  </div>
  <div>
    <b>Заказчик</b><br>
    ${esc(party.customerName) || "____________________"}<br>
    <span style="white-space: pre-wrap">${esc(party.customerDetails)}</span>
    <div class="line">подпись</div>
  </div>
</div>

<div class="page-break"></div>
<h1>ПРИЛОЖЕНИЕ №1</h1>
<p style="text-align:center; margin-bottom: 10px;">Смета к Договору подряда${party.contractNumber ? ` № ${esc(party.contractNumber)}` : ""} от ${esc(party.dateStr)}</p>
<p><b>${esc(result.title || "Смета")}</b>${result.summary ? `<br><span style="font-size:12px;color:#555">${esc(result.summary)}</span>` : ""}</p>

<table>
  <thead><tr><th style="width:34px">№</th><th>Наименование работ / материалов</th><th style="width:58px">Ед.</th><th style="width:58px">Кол-во</th><th style="width:82px">Цена, ₽</th><th style="width:96px">Сумма, ₽</th></tr></thead>
  <tbody>
    ${section("Работы", t.works, t.worksTotal)}
    ${section("Материалы", t.materials, t.materialsTotal)}
    <tr class="sub"><td colspan="5">Прямые затраты</td><td class="r">${fmt(t.base)} ₽</td></tr>
    ${extras}
    ${discountRows}
  </tbody>
</table>
<div class="total-box">ИТОГО: ${fmt(total)} ₽</div>
<p style="font-size:12px;margin-top:6px">(${rublesInWords(total)})</p>

<div class="sign">
  <div><b>Подрядчик</b><div class="line">подпись / М.П.</div></div>
  <div><b>Заказчик</b><div class="line">подпись</div></div>
</div>

</body></html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  setTimeout(() => w.print(), 400);
}
