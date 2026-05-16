import { jsPDF } from "jspdf";
import { typelabel, formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function today() {
  return new Date().toLocaleDateString("ru-RU");
}

function wrapText(text: string, maxLen: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    if ((line + " " + word).trim().length > maxLen) {
      if (line) lines.push(line.trim());
      line = word;
    } else {
      line = (line + " " + word).trim();
    }
  }
  if (line) lines.push(line.trim());
  return lines;
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

export function exportContractPDF(c: Contract) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const W = 210;
  const marginL = 20;
  const marginR = 20;
  const contentW = W - marginL - marginR;
  let y = 20;

  const addText = (
    text: string,
    x: number,
    fontSize = 10,
    style: "normal" | "bold" = "normal",
    align: "left" | "center" | "right" = "left",
    maxWidth?: number
  ) => {
    doc.setFontSize(fontSize);
    doc.setFont("helvetica", style);
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth);
      doc.text(lines, x, y, { align });
      y += lines.length * (fontSize * 0.4) + 1;
    } else {
      doc.text(text, x, y, { align });
      y += fontSize * 0.4 + 1;
    }
  };

  const addLine = () => {
    doc.setDrawColor(200, 200, 200);
    doc.line(marginL, y, W - marginR, y);
    y += 5;
  };

  const addSection = (label: string, value: string, mono = false) => {
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text(label.toUpperCase(), marginL, y);
    y += 4;
    doc.setFontSize(10);
    doc.setFont("helvetica", mono ? "normal" : "normal");
    doc.setTextColor(30, 30, 30);
    const lines = doc.splitTextToSize(value, contentW);
    doc.text(lines, marginL, y);
    y += lines.length * 4.5 + 3;
  };

  const checkPage = (needed = 20) => {
    if (y + needed > 280) {
      doc.addPage();
      y = 20;
    }
  };

  // ── Header ──────────────────────────────────────────────────────────────────
  doc.setFillColor(79, 70, 229); // indigo-600
  doc.rect(0, 0, W, 18, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("ДОГОВОР", marginL, 11);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(`Сформирован: ${today()}`, W - marginR, 11, { align: "right" });

  y = 28;
  doc.setTextColor(30, 30, 30);

  // ── Название ────────────────────────────────────────────────────────────────
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const titleLines = doc.splitTextToSize(c.title, contentW);
  doc.text(titleLines, marginL, y);
  y += titleLines.length * 6 + 2;

  // ── Номер + тип
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  const meta = [
    c.contract_number ? `№ ${c.contract_number}` : null,
    typelabel(c.contract_type),
  ].filter(Boolean).join("  ·  ");
  doc.text(meta, marginL, y);
  y += 7;

  addLine();

  // ── Стороны ─────────────────────────────────────────────────────────────────
  doc.setTextColor(30, 30, 30);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Стороны договора", marginL, y);
  y += 6;

  const counterpartyType = c.counterparty_type === "company"
    ? "Юридическое лицо"
    : c.counterparty_type === "individual" ? "ИП" : "Физическое лицо";

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(50, 50, 50);

  const col1x = marginL;
  const col2x = W / 2 + 5;
  const rowY = y;

  // Исполнитель
  doc.setFont("helvetica", "bold");
  doc.text("ИСПОЛНИТЕЛЬ", col1x, rowY);
  doc.setFont("helvetica", "normal");
  doc.text("Авангард Строй", col1x, rowY + 5);
  doc.setTextColor(120, 120, 120);
  doc.text("ООО / Компания", col1x, rowY + 9);

  // Контрагент
  doc.setTextColor(50, 50, 50);
  doc.setFont("helvetica", "bold");
  doc.text("КОНТРАГЕНТ", col2x, rowY);
  doc.setFont("helvetica", "normal");
  const nameLines = doc.splitTextToSize(c.counterparty_name, contentW / 2 - 5);
  doc.text(nameLines, col2x, rowY + 5);
  doc.setTextColor(120, 120, 120);
  const innText = [counterpartyType, c.counterparty_inn ? `ИНН: ${c.counterparty_inn}` : null].filter(Boolean).join("  ·  ");
  doc.text(innText, col2x, rowY + 5 + nameLines.length * 4.5);

  y = rowY + 22;
  addLine();

  // ── Финансы + даты ───────────────────────────────────────────────────────────
  checkPage(30);

  const infoItems = [
    c.amount !== null ? ["Сумма договора", formatAmount(c.amount, c.currency)] : null,
    ["Статус", { draft: "Черновик", review: "На согласовании", active: "Действующий", signed: "Подписан", expired: "Истёк", terminated: "Расторгнут" }[c.status] ?? c.status],
    c.signed_at ? ["Дата подписания", formatDate(c.signed_at)] : null,
    c.valid_from ? ["Начало действия", formatDate(c.valid_from)] : null,
    c.valid_until ? ["Окончание действия", formatDate(c.valid_until)] : null,
    c.auto_renewal ? ["Автопролонгация", "Да"] : null,
    c.responsible_person ? ["Ответственный", c.responsible_person] : null,
  ].filter(Boolean) as [string, string][];

  if (infoItems.length > 0) {
    const cols = 2;
    const cellW = contentW / cols;
    infoItems.forEach(([label, value], i) => {
      const col = i % cols;
      const xPos = marginL + col * cellW;
      if (col === 0 && i > 0) y += 0;
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(120, 120, 120);
      doc.text(label.toUpperCase(), xPos, y);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(30, 30, 30);
      doc.text(value, xPos, y + 4);
      if (col === cols - 1 || i === infoItems.length - 1) y += 12;
    });
    y += 2;
    addLine();
  }

  // ── Предмет договора ─────────────────────────────────────────────────────────
  checkPage(20);
  if (c.subject) {
    addSection("Предмет договора", c.subject);
    checkPage(5);
    addLine();
  }

  // ── Примечания ───────────────────────────────────────────────────────────────
  checkPage(20);
  if (c.notes) {
    addSection("Примечания и условия", c.notes);
    addLine();
  }

  // ── Теги ─────────────────────────────────────────────────────────────────────
  if ((c.tags || []).length > 0) {
    checkPage(10);
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(120, 120, 120);
    doc.text("ТЕГИ", marginL, y);
    y += 4;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(79, 70, 229);
    doc.text((c.tags || []).join("  ·  "), marginL, y);
    y += 8;
  }

  // ── Подписи ──────────────────────────────────────────────────────────────────
  const signY = Math.max(y + 10, 240);
  if (signY < 270) {
    if (signY > y) y = signY;
    addLine();
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(50, 50, 50);
    doc.text("ПОДПИСИ СТОРОН", marginL, y);
    y += 8;

    const signColW = contentW / 2;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(80, 80, 80);

    ["ИСПОЛНИТЕЛЬ  /  Авангард Строй", `КОНТРАГЕНТ  /  ${c.counterparty_name}`].forEach((label, i) => {
      const xPos = marginL + i * signColW;
      doc.setFontSize(8);
      doc.setTextColor(120, 120, 120);
      const lbl = doc.splitTextToSize(label, signColW - 5);
      doc.text(lbl, xPos, y);
      doc.setDrawColor(100, 100, 100);
      doc.line(xPos, y + 14, xPos + signColW - 10, y + 14);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text("подпись / печать", xPos, y + 19);
      doc.text(`Дата: ___________`, xPos, y + 24);
    });
  }

  // ── Footer ───────────────────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let p = 1; p <= pageCount; p++) {
    doc.setPage(p);
    doc.setFontSize(8);
    doc.setTextColor(180, 180, 180);
    doc.text(`Стр. ${p} из ${pageCount}  ·  Авангард Строй  ·  ${today()}`, W / 2, 292, { align: "center" });
  }

  const filename = [
    "Договор",
    c.contract_number ? `_${c.contract_number}` : "",
    `_${c.counterparty_name.replace(/[^а-яёА-ЯЁa-zA-Z0-9]/g, "_").substring(0, 20)}`,
    ".pdf",
  ].join("");

  doc.save(filename);
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
    c.amount !== null ? row2("Сумма договора", formatAmount(c.amount, c.currency), "Статус", { draft: "Черновик", review: "На согласовании", active: "Действующий", signed: "Подписан", expired: "Истёк", terminated: "Расторгнут" }[c.status] ?? c.status) : "",
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
