import { typelabel, formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toLocaleDateString("ru-RU");
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  review: "На согласовании",
  active: "Действующий",
  signed: "Подписан",
  expired: "Истёк",
  terminated: "Расторгнут",
};

// ─── PDF (через окно печати браузера) ────────────────────────────────────────

export function exportContractPDF(c: Contract) {
  const counterpartyType = c.counterparty_type === "company"
    ? "Юридическое лицо"
    : c.counterparty_type === "individual" ? "ИП" : "Физическое лицо";

  const meta = [
    c.contract_number ? `№ ${c.contract_number}` : null,
    typelabel(c.contract_type),
  ].filter(Boolean).join("  ·  ");

  const infoItems: [string, string][] = [
    c.amount !== null ? ["Сумма договора", formatAmount(c.amount, c.currency)] : null,
    ["Статус", STATUS_LABEL[c.status] ?? c.status],
    c.signed_at ? ["Дата подписания", formatDate(c.signed_at)] : null,
    c.valid_from ? ["Начало действия", formatDate(c.valid_from)] : null,
    c.valid_until ? ["Окончание действия", formatDate(c.valid_until)] : null,
    c.auto_renewal ? ["Автопролонгация", "Да"] : null,
    c.responsible_person ? ["Ответственный", c.responsible_person] : null,
  ].filter(Boolean) as [string, string][];

  const infoHtml = infoItems
    .map(([l, v]) => `<div class="info-item"><div class="info-label">${escapeHtml(l)}</div><div class="info-value">${escapeHtml(v)}</div></div>`)
    .join("");

  const tagsHtml = (c.tags || []).length > 0
    ? `<div class="section"><div class="section-label">Теги</div><div class="tags">${(c.tags || []).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join("")}</div></div>`
    : "";

  const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"/>
<title>Договор ${escapeHtml(c.contract_number || "")}</title>
<style>
  @page { size: A4; margin: 15mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, "Segoe UI", Arial, sans-serif; color: #1e1e1e; font-size: 11pt; line-height: 1.45; margin: 0; padding: 20px; }
  .header { background: #4f46e5; color: #fff; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center; margin: -20px -20px 18px; }
  .header h1 { margin: 0; font-size: 14pt; font-weight: 700; letter-spacing: 0.5px; }
  .header .date { font-size: 9pt; opacity: 0.9; }
  .title { font-size: 16pt; font-weight: 700; margin: 0 0 4px; }
  .meta { color: #6b7280; font-size: 10pt; margin-bottom: 12px; }
  hr { border: none; border-top: 1px solid #e5e7eb; margin: 14px 0; }
  .section-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; margin-bottom: 4px; }
  .parties { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
  .party-title { font-weight: 700; font-size: 9pt; color: #1f2937; margin-bottom: 4px; }
  .party-name { font-size: 11pt; }
  .party-sub { color: #6b7280; font-size: 9pt; margin-top: 2px; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 20px; }
  .info-item { break-inside: avoid; }
  .info-label { font-size: 8pt; font-weight: 700; text-transform: uppercase; color: #6b7280; letter-spacing: 0.5px; }
  .info-value { font-size: 11pt; margin-top: 2px; }
  .section { margin: 14px 0; }
  .section-body { white-space: pre-wrap; font-size: 11pt; }
  .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 4px; }
  .tag { background: #eef2ff; color: #4f46e5; padding: 2px 8px; border-radius: 999px; font-size: 9pt; }
  .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 40px; break-inside: avoid; }
  .sign-block { }
  .sign-label { font-size: 8pt; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
  .sign-line { border-bottom: 1px solid #6b7280; height: 30px; margin-top: 10px; }
  .sign-hint { font-size: 8pt; color: #9ca3af; margin-top: 4px; }
  .footer { text-align: center; font-size: 8pt; color: #9ca3af; margin-top: 30px; }
  @media print {
    body { padding: 0; }
    .no-print { display: none; }
  }
  .actions { position: fixed; top: 10px; right: 10px; background: #fff; padding: 8px; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
  .actions button { background: #4f46e5; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; }
  .actions button:hover { background: #4338ca; }
</style></head>
<body>
  <div class="actions no-print">
    <button onclick="window.print()">Сохранить как PDF / Печать</button>
  </div>
  <div class="header">
    <h1>ДОГОВОР</h1>
    <div class="date">Сформирован: ${escapeHtml(today())}</div>
  </div>
  <h2 class="title">${escapeHtml(c.title)}</h2>
  ${meta ? `<div class="meta">${escapeHtml(meta)}</div>` : ""}
  <hr/>
  <div class="section-label">Стороны договора</div>
  <div class="parties">
    <div>
      <div class="party-title">ИСПОЛНИТЕЛЬ</div>
      <div class="party-name">Авангард Строй</div>
      <div class="party-sub">ООО / Компания</div>
    </div>
    <div>
      <div class="party-title">КОНТРАГЕНТ</div>
      <div class="party-name">${escapeHtml(c.counterparty_name)}</div>
      <div class="party-sub">${escapeHtml([counterpartyType, c.counterparty_inn ? `ИНН: ${c.counterparty_inn}` : null].filter(Boolean).join("  ·  "))}</div>
    </div>
  </div>
  ${infoItems.length > 0 ? `<hr/><div class="info-grid">${infoHtml}</div>` : ""}
  ${c.subject ? `<hr/><div class="section"><div class="section-label">Предмет договора</div><div class="section-body">${escapeHtml(c.subject)}</div></div>` : ""}
  ${c.notes ? `<div class="section"><div class="section-label">Примечания и условия</div><div class="section-body">${escapeHtml(c.notes)}</div></div>` : ""}
  ${tagsHtml}
  <hr/>
  <div class="section-label">Подписи сторон</div>
  <div class="signatures">
    <div class="sign-block">
      <div class="sign-label">ИСПОЛНИТЕЛЬ  /  Авангард Строй</div>
      <div class="sign-line"></div>
      <div class="sign-hint">подпись / печать &nbsp;·&nbsp; Дата: ___________</div>
    </div>
    <div class="sign-block">
      <div class="sign-label">КОНТРАГЕНТ  /  ${escapeHtml(c.counterparty_name)}</div>
      <div class="sign-line"></div>
      <div class="sign-hint">подпись / печать &nbsp;·&nbsp; Дата: ___________</div>
    </div>
  </div>
  <div class="footer">Сформировано: ${escapeHtml(today())}  ·  Авангард Строй</div>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    try { win.focus(); win.print(); } catch { /* noop */ }
  }, 300);
}

// ─── Word (RTF) ──────────────────────────────────────────────────────────────

export function exportContractWord(c: Contract) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[{}]/g, "\\$&");

  const section = (label: string, value: string) =>
    value
      ? `{\\pard\\sb120{\\b\\fs18\\cf2 ${esc(label.toUpperCase())}\\par}{\\fs20 ${esc(value)}\\par}}`
      : "";

  const row2 = (l1: string, v1: string, l2: string, v2: string) =>
    `{\\trowd\\trgaph108\\cellx4500\\cellx9000
{\\pard\\intbl{\\b\\fs16\\cf2 ${esc(l1.toUpperCase())}}\\cell}
{\\pard\\intbl{\\b\\fs16\\cf2 ${esc(l2.toUpperCase())}}\\cell}\\row
{\\pard\\intbl{\\fs20 ${esc(v1)}}\\cell}
{\\pard\\intbl{\\fs20 ${esc(v2)}}\\cell}\\row}`;

  const counterpartyType = c.counterparty_type === "company"
    ? "Юридическое лицо" : c.counterparty_type === "individual" ? "ИП" : "Физическое лицо";

  const infoLines = [
    c.amount !== null ? row2("Сумма договора", formatAmount(c.amount, c.currency), "Статус", STATUS_LABEL[c.status] ?? c.status) : "",
    (c.signed_at || c.valid_from) ? row2("Дата подписания", formatDate(c.signed_at), "Начало действия", formatDate(c.valid_from)) : "",
    c.valid_until ? row2("Окончание действия", formatDate(c.valid_until), "Автопролонгация", c.auto_renewal ? "Да" : "Нет") : "",
    c.responsible_person ? section("Ответственный", c.responsible_person) : "",
  ].join("");

  const rtf = `{\\rtf1\\ansi\\ansicpg1251\\deff0
{\\fonttbl{\\f0\\froman\\fcharset204 Times New Roman;}{\\f1\\fswiss\\fcharset204 Arial;}}
{\\colortbl;\\red255\\green255\\blue255;\\red79\\green70\\blue229;\\red50\\green50\\blue50;}
\\widowctrl\\hyphauto

{\\pard\\sb0\\sa0\\qc{\\f1\\fs28\\b\\cf2 ${esc(c.title)}\\par}}
{\\pard\\qc\\sb60{\\f1\\fs18\\cf3 ${esc([c.contract_number ? `№ ${c.contract_number}` : "", typelabel(c.contract_type)].filter(Boolean).join("  ·  "))}\\par}}
{\\pard\\sb200\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}

{\\pard\\sb120{\\f1\\b\\fs22\\cf2 Стороны договора\\par}}
${row2("ИСПОЛНИТЕЛЬ", "Авангард Строй", "КОНТРАГЕНТ", c.counterparty_name + (c.counterparty_inn ? `  (ИНН: ${c.counterparty_inn})` : "") + `\n${counterpartyType}`)}

{\\pard\\sb120\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}

${infoLines}

{\\pard\\sb120\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}
${c.subject ? section("Предмет договора", c.subject) : ""}
${c.notes ? section("Примечания и условия", c.notes) : ""}
${(c.tags || []).length > 0 ? section("Теги", (c.tags || []).join("  ·  ")) : ""}

{\\pard\\sb400\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}
{\\pard\\sb120{\\f1\\b\\fs18 Подписи сторон\\par}}
${row2("ИСПОЛНИТЕЛЬ  /  Авангард Строй", "_________________________", `КОНТРАГЕНТ  /  ${c.counterparty_name}`, "_________________________")}
${row2("Дата:", "___________", "Дата:", "___________")}

{\\pard\\sb200\\qc{\\f1\\fs16\\cf3 Сформировано: ${today()}  ·  Авангард Строй\\par}}
}`;

  const blob = new Blob(["\ufeff" + rtf], { type: "application/rtf;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Договор${c.contract_number ? "_" + c.contract_number : ""}_${c.counterparty_name.replace(/[^а-яёА-ЯЁa-zA-Z0-9]/g, "_").substring(0, 20)}.rtf`;
  a.click();
  URL.revokeObjectURL(url);
}
