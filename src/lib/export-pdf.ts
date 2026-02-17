import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { type EstimateSavedItem, roundUpToPackaging } from "./lemanapro-data";
import type { EstimateItem } from "@/components/calculator/EstimateTab";

const formatPrice = (n: number) => n.toLocaleString("ru-RU");

export function exportEstimatePdf(items: EstimateItem[], lemanaItems: EstimateSavedItem[]) {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("AVANGARD", 14, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Smeta / Estimate", 14, 27);
  doc.text(new Date().toLocaleDateString("ru-RU"), 196, 20, { align: "right" });

  let y = 35;

  if (items.length > 0) {
    const totalMaterials = items
      .filter((i) => i.category === "Materialy" || i.category === "Материалы")
      .reduce((s, i) => s + i.total, 0);
    const totalWorks = items
      .filter((i) => i.category === "Raboty" || i.category === "Работы")
      .reduce((s, i) => s + i.total, 0);
    const grandTotal = totalMaterials + totalWorks;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("Smeta", 14, y);
    y += 3;

    autoTable(doc, {
      startY: y,
      head: [["#", "Category", "Name", "Unit", "Qty", "Price", "Total"]],
      body: items.map((item, idx) => [
        idx + 1,
        item.category,
        item.name,
        item.unit,
        item.quantity,
        formatPrice(item.price) + " rub",
        formatPrice(item.total) + " rub",
      ]),
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [245, 158, 11], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 10 },
        4: { halign: "center" },
        5: { halign: "right" },
        6: { halign: "right" },
      },
    });

    y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? y + 40;
    y += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Materials: ${formatPrice(totalMaterials)} rub`, 14, y);
    doc.text(`Works: ${formatPrice(totalWorks)} rub`, 14, y + 5);
    doc.setFont("helvetica", "bold");
    doc.text(`TOTAL: ${formatPrice(grandTotal)} rub`, 14, y + 11);
    y += 20;
  }

  if (lemanaItems.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("LemanapPro (Samara)", 14, y);
    y += 3;

    const lemanaTotal = lemanaItems.reduce((s, i) => {
      const rounded = roundUpToPackaging(i.quantity, i.packaging || 1);
      return s + (i.price || 0) * rounded;
    }, 0);

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
        const unit = item.unit || "pcs";
        const rounded = roundUpToPackaging(item.quantity, item.packaging || 1);
        const lineTotal = (item.price || 0) * rounded;
        const qtyLabel = rounded !== item.quantity
          ? `${item.quantity} -> ${rounded} ${unit}`
          : `${rounded} ${unit}`;
        rows.push([
          idx,
          cat,
          item.name + (item.note ? ` (${item.note})` : ""),
          qtyLabel,
          item.price ? formatPrice(item.price) + " rub" : "-",
          lineTotal ? formatPrice(lineTotal) + " rub" : "-",
        ]);
      }
    }

    autoTable(doc, {
      startY: y,
      head: [["#", "Category", "Item", "Qty", "Price", "Total"]],
      body: rows,
      styles: { fontSize: 9, cellPadding: 2 },
      headStyles: { fillColor: [34, 197, 94], textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 10 },
        3: { halign: "center" },
        4: { halign: "right" },
        5: { halign: "right" },
      },
    });

    y = (doc as unknown as Record<string, number>).lastAutoTable?.finalY ?? y + 40;
    y += 5;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Items: ${lemanaItems.length}`, 14, y);
    if (lemanaTotal > 0) {
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL LemanaPro: ${formatPrice(lemanaTotal)} rub`, 14, y + 6);
    }
  }

  doc.save(`avangard-smeta-${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportLemanaProPdf(lemanaItems: EstimateSavedItem[]) {
  exportEstimatePdf([], lemanaItems);
}