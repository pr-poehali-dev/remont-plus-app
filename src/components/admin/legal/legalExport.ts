import { typelabel, formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

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

export function exportContractPDF(c: Contract) {
  const counterpartyType = c.counterparty_type === "company"
    ? "Юридическое лицо"
    : c.counterparty_type === "individual" ? "ИП" : "Физическое лицо";

  const metaParts: string[] = [];
  if (c.contract_number) metaParts.push("№ " + c.contract_number);
  metaParts.push(typelabel(c.contract_type));
  const meta = metaParts.join("  ·  ");

  const infoItems: Array<[string, string]> = [];
  if (c.amount !== null) infoItems.push(["Сумма договора", formatAmount(c.amount, c.currency)]);
  infoItems.push(["Статус", STATUS_LABEL[c.status] || c.status]);
  if (c.signed_at) infoItems.push(["Дата подписания", formatDate(c.signed_at)]);
  if (c.valid_from) infoItems.push(["Начало действия", formatDate(c.valid_from)]);
  if (c.valid_until) infoItems.push(["Окончание действия", formatDate(c.valid_until)]);
  if (c.auto_renewal) infoItems.push(["Автопролонгация", "Да"]);
  if (c.responsible_person) infoItems.push(["Ответственный", c.responsible_person]);

  let infoHtml = "";
  for (const item of infoItems) {
    infoHtml += '<div class="info-item"><div class="info-label">' + escapeHtml(item[0]) + '</div><div class="info-value">' + escapeHtml(item[1]) + "</div></div>";
  }

  let tagsHtml = "";
  const tags = c.tags || [];
  if (tags.length > 0) {
    let tagsList = "";
    for (const t of tags) tagsList += '<span class="tag">' + escapeHtml(t) + "</span>";
    tagsHtml = '<div class="section"><div class="section-label">Теги</div><div class="tags">' + tagsList + "</div></div>";
  }

  const subRow: string[] = [counterpartyType];
  if (c.counterparty_inn) subRow.push("ИНН: " + c.counterparty_inn);
  const partySub = subRow.join("  ·  ");

  const css =
    "@page{size:A4;margin:15mm;}" +
    "*{box-sizing:border-box;}" +
    "body{font-family:-apple-system,Segoe UI,Arial,sans-serif;color:#1e1e1e;font-size:11pt;line-height:1.45;margin:0;padding:20px;}" +
    ".header{background:#4f46e5;color:#fff;padding:10px 16px;display:flex;justify-content:space-between;align-items:center;margin:-20px -20px 18px;}" +
    ".header h1{margin:0;font-size:14pt;font-weight:700;letter-spacing:0.5px;}" +
    ".header .date{font-size:9pt;opacity:0.9;}" +
    ".title{font-size:16pt;font-weight:700;margin:0 0 4px;}" +
    ".meta{color:#6b7280;font-size:10pt;margin-bottom:12px;}" +
    "hr{border:none;border-top:1px solid #e5e7eb;margin:14px 0;}" +
    ".section-label{font-size:8pt;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px;margin-bottom:4px;}" +
    ".parties{display:grid;grid-template-columns:1fr 1fr;gap:20px;}" +
    ".party-title{font-weight:700;font-size:9pt;color:#1f2937;margin-bottom:4px;}" +
    ".party-name{font-size:11pt;}" +
    ".party-sub{color:#6b7280;font-size:9pt;margin-top:2px;}" +
    ".info-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 20px;}" +
    ".info-item{break-inside:avoid;}" +
    ".info-label{font-size:8pt;font-weight:700;text-transform:uppercase;color:#6b7280;letter-spacing:0.5px;}" +
    ".info-value{font-size:11pt;margin-top:2px;}" +
    ".section{margin:14px 0;}" +
    ".section-body{white-space:pre-wrap;font-size:11pt;}" +
    ".tags{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px;}" +
    ".tag{background:#eef2ff;color:#4f46e5;padding:2px 8px;border-radius:999px;font-size:9pt;}" +
    ".signatures{display:grid;grid-template-columns:1fr 1fr;gap:30px;margin-top:40px;break-inside:avoid;}" +
    ".sign-label{font-size:8pt;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;}" +
    ".sign-line{border-bottom:1px solid #6b7280;height:30px;margin-top:10px;}" +
    ".sign-hint{font-size:8pt;color:#9ca3af;margin-top:4px;}" +
    ".footer{text-align:center;font-size:8pt;color:#9ca3af;margin-top:30px;}" +
    "@media print{body{padding:0;}.no-print{display:none;}}" +
    ".actions{position:fixed;top:10px;right:10px;background:#fff;padding:8px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);}" +
    ".actions button{background:#4f46e5;color:#fff;border:none;padding:8px 16px;border-radius:6px;cursor:pointer;font-size:14px;font-weight:600;}";

  const dateStr = escapeHtml(today());
  const titleEsc = escapeHtml(c.title);
  const counterpartyEsc = escapeHtml(c.counterparty_name);

  let html = "<!doctype html><html lang=\"ru\"><head><meta charset=\"utf-8\"/>";
  html += "<title>Договор " + escapeHtml(c.contract_number || "") + "</title>";
  html += "<style>" + css + "</style></head><body>";
  html += '<div class="actions no-print"><button onclick="window.print()">Сохранить как PDF / Печать</button></div>';
  html += '<div class="header"><h1>ДОГОВОР</h1><div class="date">Сформирован: ' + dateStr + "</div></div>";
  html += '<h2 class="title">' + titleEsc + "</h2>";
  if (meta) html += '<div class="meta">' + escapeHtml(meta) + "</div>";
  html += "<hr/>";
  html += '<div class="section-label">Стороны договора</div>';
  html += '<div class="parties">';
  html += '<div><div class="party-title">ИСПОЛНИТЕЛЬ</div><div class="party-name">Авангард Строй</div><div class="party-sub">ООО / Компания</div></div>';
  html += '<div><div class="party-title">КОНТРАГЕНТ</div><div class="party-name">' + counterpartyEsc + '</div><div class="party-sub">' + escapeHtml(partySub) + "</div></div>";
  html += "</div>";
  if (infoItems.length > 0) html += '<hr/><div class="info-grid">' + infoHtml + "</div>";
  if (c.subject) html += '<hr/><div class="section"><div class="section-label">Предмет договора</div><div class="section-body">' + escapeHtml(c.subject) + "</div></div>";
  if (c.notes) html += '<div class="section"><div class="section-label">Примечания и условия</div><div class="section-body">' + escapeHtml(c.notes) + "</div></div>";
  html += tagsHtml;
  html += '<hr/><div class="section-label">Подписи сторон</div>';
  html += '<div class="signatures">';
  html += '<div><div class="sign-label">ИСПОЛНИТЕЛЬ / Авангард Строй</div><div class="sign-line"></div><div class="sign-hint">подпись · Дата: ___________</div></div>';
  html += '<div><div class="sign-label">КОНТРАГЕНТ / ' + counterpartyEsc + '</div><div class="sign-line"></div><div class="sign-hint">подпись · Дата: ___________</div></div>';
  html += "</div>";
  html += '<div class="footer">Сформировано: ' + dateStr + " · Авангард Строй</div>";
  html += "</body></html>";

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
  setTimeout(() => {
    try {
      win.focus();
      win.print();
    } catch {
      /* noop */
    }
  }, 300);
}

export function exportContractWord(c: Contract) {
  const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/[{}]/g, "\\$&");

  const section = (label: string, value: string) =>
    value
      ? "{\\pard\\sb120{\\b\\fs18\\cf2 " + esc(label.toUpperCase()) + "\\par}{\\fs20 " + esc(value) + "\\par}}"
      : "";

  const row2 = (l1: string, v1: string, l2: string, v2: string) =>
    "{\\trowd\\trgaph108\\cellx4500\\cellx9000" +
    "{\\pard\\intbl{\\b\\fs16\\cf2 " + esc(l1.toUpperCase()) + "}\\cell}" +
    "{\\pard\\intbl{\\b\\fs16\\cf2 " + esc(l2.toUpperCase()) + "}\\cell}\\row" +
    "{\\pard\\intbl{\\fs20 " + esc(v1) + "}\\cell}" +
    "{\\pard\\intbl{\\fs20 " + esc(v2) + "}\\cell}\\row}";

  const counterpartyType = c.counterparty_type === "company"
    ? "Юридическое лицо"
    : c.counterparty_type === "individual" ? "ИП" : "Физическое лицо";

  const metaParts: string[] = [];
  if (c.contract_number) metaParts.push("№ " + c.contract_number);
  metaParts.push(typelabel(c.contract_type));
  const meta = metaParts.join("  ·  ");

  let infoLines = "";
  if (c.amount !== null) {
    infoLines += row2("Сумма договора", formatAmount(c.amount, c.currency), "Статус", STATUS_LABEL[c.status] || c.status);
  }
  if (c.signed_at || c.valid_from) {
    infoLines += row2("Дата подписания", formatDate(c.signed_at), "Начало действия", formatDate(c.valid_from));
  }
  if (c.valid_until) {
    infoLines += row2("Окончание действия", formatDate(c.valid_until), "Автопролонгация", c.auto_renewal ? "Да" : "Нет");
  }
  if (c.responsible_person) {
    infoLines += section("Ответственный", c.responsible_person);
  }

  const partyContent = c.counterparty_name +
    (c.counterparty_inn ? "  (ИНН: " + c.counterparty_inn + ")" : "") +
    "\n" + counterpartyType;

  let rtf = "{\\rtf1\\ansi\\ansicpg1251\\deff0";
  rtf += "{\\fonttbl{\\f0\\froman\\fcharset204 Times New Roman;}{\\f1\\fswiss\\fcharset204 Arial;}}";
  rtf += "{\\colortbl;\\red255\\green255\\blue255;\\red79\\green70\\blue229;\\red50\\green50\\blue50;}";
  rtf += "\\widowctrl\\hyphauto";
  rtf += "{\\pard\\sb0\\sa0\\qc{\\f1\\fs28\\b\\cf2 " + esc(c.title) + "\\par}}";
  rtf += "{\\pard\\qc\\sb60{\\f1\\fs18\\cf3 " + esc(meta) + "\\par}}";
  rtf += "{\\pard\\sb200\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}";
  rtf += "{\\pard\\sb120{\\f1\\b\\fs22\\cf2 Стороны договора\\par}}";
  rtf += row2("ИСПОЛНИТЕЛЬ", "Авангард Строй", "КОНТРАГЕНТ", partyContent);
  rtf += "{\\pard\\sb120\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}";
  rtf += infoLines;
  rtf += "{\\pard\\sb120\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}";
  if (c.subject) rtf += section("Предмет договора", c.subject);
  if (c.notes) rtf += section("Примечания и условия", c.notes);
  const tags = c.tags || [];
  if (tags.length > 0) rtf += section("Теги", tags.join("  ·  "));
  rtf += "{\\pard\\sb400\\brdrb\\brdrs\\brdrw10\\brsp20 \\par}";
  rtf += "{\\pard\\sb120{\\f1\\b\\fs18 Подписи сторон\\par}}";
  rtf += row2("ИСПОЛНИТЕЛЬ / Авангард Строй", "_________________________", "КОНТРАГЕНТ / " + c.counterparty_name, "_________________________");
  rtf += row2("Дата:", "___________", "Дата:", "___________");
  rtf += "{\\pard\\sb200\\qc{\\f1\\fs16\\cf3 Сформировано: " + today() + " · Авангард Строй\\par}}";
  rtf += "}";

  const blob = new Blob(["\ufeff" + rtf], { type: "application/rtf;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const safeName = c.counterparty_name.replace(/[^а-яёА-ЯЁa-zA-Z0-9]/g, "_").substring(0, 20);
  a.download = "Договор" + (c.contract_number ? "_" + c.contract_number : "") + "_" + safeName + ".rtf";
  a.click();
  URL.revokeObjectURL(url);
}
