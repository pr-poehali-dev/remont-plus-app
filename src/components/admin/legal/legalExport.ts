import { typelabel, formatDate, formatAmount } from "./LegalTypes";
import type { Contract } from "./LegalTypes";

const STATUS_LABEL: Record<string, string> = {
  draft: "Черновик",
  review: "На согласовании",
  active: "Действующий",
  signed: "Подписан",
  expired: "Истёк",
  terminated: "Расторгнут",
};

function buildText(c: Contract): string {
  const lines: string[] = [];
  lines.push("ДОГОВОР");
  lines.push("");
  lines.push(c.title);
  if (c.contract_number) lines.push("№ " + c.contract_number);
  lines.push("Тип: " + typelabel(c.contract_type));
  lines.push("");
  lines.push("СТОРОНЫ");
  lines.push("Исполнитель: Авангард Строй");
  lines.push("Контрагент: " + c.counterparty_name);
  if (c.counterparty_inn) lines.push("ИНН: " + c.counterparty_inn);
  lines.push("");
  lines.push("ДЕТАЛИ");
  if (c.amount !== null) lines.push("Сумма: " + formatAmount(c.amount, c.currency));
  lines.push("Статус: " + (STATUS_LABEL[c.status] || c.status));
  if (c.signed_at) lines.push("Дата подписания: " + formatDate(c.signed_at));
  if (c.valid_from) lines.push("Начало действия: " + formatDate(c.valid_from));
  if (c.valid_until) lines.push("Окончание действия: " + formatDate(c.valid_until));
  if (c.auto_renewal) lines.push("Автопролонгация: Да");
  if (c.responsible_person) lines.push("Ответственный: " + c.responsible_person);
  if (c.subject) {
    lines.push("");
    lines.push("ПРЕДМЕТ ДОГОВОРА");
    lines.push(c.subject);
  }
  if (c.notes) {
    lines.push("");
    lines.push("ПРИМЕЧАНИЯ");
    lines.push(c.notes);
  }
  const tags = c.tags || [];
  if (tags.length > 0) {
    lines.push("");
    lines.push("Теги: " + tags.join(", "));
  }
  lines.push("");
  lines.push("Сформировано: " + new Date().toLocaleDateString("ru-RU"));
  return lines.join("\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportContractPDF(c: Contract) {
  const text = buildText(c);
  const w = window.open("", "_blank");
  if (!w) {
    downloadBlob(text, "contract.txt", "text/plain;charset=utf-8");
    return;
  }
  w.document.open();
  w.document.write("<pre style='font-family:Arial,sans-serif;font-size:14px;white-space:pre-wrap;padding:20px;'>" + text.replace(/</g, "&lt;") + "</pre>");
  w.document.close();
  setTimeout(() => {
    try {
      w.focus();
      w.print();
    } catch {
      /* noop */
    }
  }, 300);
}

export function exportContractWord(c: Contract) {
  const text = buildText(c);
  const safeName = c.counterparty_name.replace(/[^a-zA-Z0-9а-яёА-ЯЁ]/g, "_").substring(0, 20);
  const filename = "Договор" + (c.contract_number ? "_" + c.contract_number : "") + "_" + safeName + ".txt";
  downloadBlob("\ufeff" + text, filename, "text/plain;charset=utf-8");
}
