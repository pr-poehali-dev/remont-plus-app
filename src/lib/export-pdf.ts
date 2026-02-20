import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type EstimateSavedItem, roundUpToPackaging } from "./lemanapro-data";
import type { EstimateItem } from "@/pages/Calculator";

const fmt = (n: number) => n.toLocaleString("ru-RU") + " руб.";
const today = () => new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
const docNum = () => `${Date.now().toString().slice(-6)}`;

export interface EstimateParties {
  customer?: string;
  contractor?: string;
  address?: string;
}

export function exportEstimatePdf(
  items: EstimateItem[],
  lemanaItems: EstimateSavedItem[],
  materialSurcharge = 0,
  parties: EstimateParties = {}
) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const L = 14;
  const R = W - 14;

  const customerLine = parties.customer ? `Заказчик: ${parties.customer}` : "Заказчик: ________________________________________________";
  const contractorLine = parties.contractor ? `Подрядчик: ${parties.contractor}` : "Подрядчик: _______________________________________________";
  const addressLine = parties.address ? `Адрес объекта: ${parties.address}` : "Адрес объекта: __________________________________________";

  // ── Шапка документа ──────────────────────────────────────────────────────
  doc.setDrawColor(200, 200, 200);
  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, W, 42, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text("СМЕТА НА ВЫПОЛНЕНИЕ РЕМОНТНЫХ РАБОТ", W / 2, 14, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(`№ С-${docNum()} от ${today()} г.`, W / 2, 21, { align: "center" });

  // Реквизиты — заказчик и подрядчик
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(customerLine, L, 30);
  doc.text(contractorLine, L, 37);
  doc.text(addressLine, L + 108, 30);
  doc.text(`Дата составления: ${today()} г.`, L + 108, 37);

  let y = 50;

  // ── Раздел 1: Работы и материалы ─────────────────────────────────────────
  if (items.length > 0) {
    const totalMaterials = items
      .filter((i) => i.category === "Материалы")
      .reduce((s, i) => s + i.total, 0);
    const totalWorks = items
      .filter((i) => i.category === "Работы")
      .reduce((s, i) => s + i.total, 0);
    const adjustedWorks = totalWorks + materialSurcharge;
    const grandTotal = totalMaterials + adjustedWorks;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text("1. Перечень работ и материалов", L, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [["№", "Раздел", "Наименование", "Ед.", "Кол-во", "Цена, руб.", "Сумма, руб."]],
      body: items.map((item, idx) => [
        idx + 1,
        item.category,
        item.name,
        item.unit,
        item.quantity,
        item.price.toLocaleString("ru-RU"),
        item.total.toLocaleString("ru-RU"),
      ]),
      styles: { fontSize: 8.5, cellPadding: 2, font: "helvetica", textColor: [30, 30, 30] },
      headStyles: { fillColor: [245, 158, 11], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 9, halign: "center" },
        1: { cellWidth: 22 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 12, halign: "center" },
        4: { cellWidth: 16, halign: "center" },
        5: { cellWidth: 26, halign: "right" },
        6: { cellWidth: 26, halign: "right" },
      },
      margin: { left: L, right: 14 },
    });

    y = (doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY ?? y + 40;
    y += 4;

    // Итоги по разделу 1
    const summaryRows: [string, string][] = [
      ["Итого материалы:", fmt(totalMaterials)],
      ["Итого работы:", fmt(adjustedWorks)],
    ];
    if (materialSurcharge > 0) {
      summaryRows.push([`  в т.ч. надбавка за объём материалов (×1,3):`, `+${fmt(materialSurcharge)}`]);
    }
    summaryRows.push(["ИТОГО ПО СМЕТЕ:", fmt(grandTotal)]);

    for (let i = 0; i < summaryRows.length; i++) {
      const [label, val] = summaryRows[i];
      const isTotal = label.startsWith("ИТОГО ПО СМЕТЕ");
      doc.setFont("helvetica", isTotal ? "bold" : "normal");
      doc.setFontSize(isTotal ? 10 : 8.5);
      doc.setTextColor(isTotal ? 20 : 80, isTotal ? 20 : 80, isTotal ? 20 : 80);
      doc.text(label, R - 75, y);
      doc.text(val, R, y, { align: "right" });
      if (isTotal) {
        doc.setDrawColor(180, 180, 180);
        doc.line(R - 76, y - 3.5, R, y - 3.5);
      }
      y += isTotal ? 7 : 5;
    }
  }

  // ── Раздел 2: Материалы ЛеманаПро ────────────────────────────────────────
  if (lemanaItems.length > 0) {
    if (y > 220) { doc.addPage(); y = 20; }
    else y += 4;

    const lemanaTotal = lemanaItems.reduce((s, i) => {
      const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
      return s + (i.price || 0) * rounded;
    }, 0);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    const sectionNum = items.length > 0 ? "2" : "1";
    doc.text(`${sectionNum}. Материалы (ЛеманаПро, г. Самара)`, L, y);
    y += 4;

    const grouped = lemanaItems.reduce<Record<string, EstimateSavedItem[]>>((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {});

    const rows: (string | number)[][] = [];
    let idx = 0;
    for (const [cat, catItems] of Object.entries(grouped)) {
      for (const item of catItems) {
        idx++;
        const rounded = roundUpToPackaging(item.quantity, item.packaging || 1);
        const lineTotal = (item.price || 0) * rounded;
        const qtyLabel = rounded !== item.quantity
          ? `${item.quantity} → ${rounded} ${item.unit || "шт."}`
          : `${rounded} ${item.unit || "шт."}`;
        rows.push([
          idx,
          cat,
          item.name + (item.note ? ` (${item.note})` : ""),
          qtyLabel,
          item.price ? item.price.toLocaleString("ru-RU") : "—",
          lineTotal ? lineTotal.toLocaleString("ru-RU") : "—",
        ]);
      }
    }

    autoTable(doc, {
      startY: y,
      head: [["№", "Категория", "Наименование товара", "Кол-во", "Цена, руб.", "Сумма, руб."]],
      body: rows,
      styles: { fontSize: 8.5, cellPadding: 2, font: "helvetica", textColor: [30, 30, 30] },
      headStyles: { fillColor: [34, 197, 94], textColor: [255, 255, 255], fontStyle: "bold", fontSize: 8.5 },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 9, halign: "center" },
        1: { cellWidth: 28 },
        2: { cellWidth: "auto" },
        3: { cellWidth: 24, halign: "center" },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 26, halign: "right" },
      },
      margin: { left: L, right: 14 },
    });

    y = (doc as unknown as Record<string, Record<string, number>>).lastAutoTable?.finalY ?? y + 40;
    y += 4;

    if (lemanaTotal > 0) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(30, 30, 30);
      doc.text("ИТОГО МАТЕРИАЛЫ:", R - 55, y);
      doc.text(fmt(lemanaTotal), R, y, { align: "right" });
      y += 7;
    }
  }

  // ── Условия и примечания ──────────────────────────────────────────────────
  if (y > 220) { doc.addPage(); y = 20; }
  else y += 6;

  doc.setDrawColor(220, 220, 220);
  doc.line(L, y, R, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text("Условия выполнения работ:", L, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  const conditions = [
    "1. Настоящая смета является предварительной и может быть скорректирована после осмотра объекта.",
    "2. Срок действия цен: 30 дней с даты составления документа.",
    "3. Оплата производится в соответствии с договором подряда: аванс — 30%, остаток — по завершении работ.",
    "4. Гарантия на выполненные работы устанавливается договором подряда.",
    "5. Стоимость дополнительных работ, не предусмотренных сметой, согласовывается дополнительно.",
  ];
  for (const line of conditions) {
    doc.text(line, L, y);
    y += 4.5;
  }

  // ── Подписи ───────────────────────────────────────────────────────────────
  if (y > 230) { doc.addPage(); y = 20; }
  else y += 8;

  doc.setDrawColor(220, 220, 220);
  doc.line(L, y, R, y);
  y += 7;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 30, 30);
  doc.text("Подписи сторон", W / 2, y, { align: "center" });
  y += 8;

  // Две колонки подписей
  const col1 = L;
  const col2 = W / 2 + 6;
  const colW = W / 2 - 20;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("ЗАКАЗЧИК", col1, y);
  doc.text("ПОДРЯДЧИК", col2, y);
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);

  const customerName = parties.customer ? `ФИО: ${parties.customer}` : "ФИО: _________________________________";
  const contractorName = parties.contractor ? `ФИО: ${parties.contractor}` : "ФИО: _________________________________";
  doc.text(customerName, col1, y);
  doc.text(contractorName, col2, y);
  y += 7;

  doc.text("Подпись: _____________________________", col1, y);
  doc.text("Подпись: _____________________________", col2, y);
  y += 7;

  doc.text(`Дата: _________________ г.`, col1, y);
  doc.text(`Дата: _________________ г.`, col2, y);
  y += 7;

  doc.text("М.П. _________________________________", col1, y);
  doc.text("М.П. _________________________________", col2, y);
  y += 10;

  // Рамка вокруг блока подписей
  doc.setDrawColor(200, 200, 200);
  doc.rect(L - 2, y - 39, colW + 2, 37);
  doc.rect(col2 - 2, y - 39, colW + 2, 37);

  // ── Нижний колонтитул ─────────────────────────────────────────────────────
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(160, 160, 160);
    doc.text(
      `Ремонт+ · Смета № С-${docNum()} от ${today()} г. · Стр. ${i} из ${pageCount}`,
      W / 2,
      290,
      { align: "center" }
    );
  }

  doc.save(`smeta-remont-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportLemanaProPdf(lemanaItems: EstimateSavedItem[]) {
  exportEstimatePdf([], lemanaItems);
}