import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { PlannerState } from "./plannerTypes";
import { FURNITURE_CATALOG } from "./furnitureCatalog";
import { buildEstimate } from "./estimateService";
import type { FullEstimate } from "./estimateService";

const catalogMap = new Map(FURNITURE_CATALOG.map((i) => [i.id, i]));

const fmt = (n: number) => n.toLocaleString("ru-RU") + " \u0440\u0443\u0431.";
const fmtM = (n: number) => n.toFixed(1);
const fmtM2 = (n: number) => n.toFixed(1) + " \u043C\u00B2";

function renderFloorPlan(
  state: PlannerState,
  width: number,
  height: number
): string {
  const canvas = document.createElement("canvas");
  const dpr = 2;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas.toDataURL("image/png");

  ctx.scale(dpr, dpr);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const allPts: { x: number; y: number }[] = [];
  for (const w of state.walls) {
    allPts.push(w.start, w.end);
  }
  for (const f of state.furniture) {
    const cat = catalogMap.get(f.itemId);
    const hw = cat ? cat.width / 2 : 500;
    const hd = cat ? cat.depth / 2 : 500;
    allPts.push({ x: f.x - hw, y: f.y - hd }, { x: f.x + hw, y: f.y + hd });
  }

  if (allPts.length === 0) {
    ctx.fillStyle = "#999";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("(empty plan)", width / 2, height / 2);
    return canvas.toDataURL("image/png");
  }

  const minX = Math.min(...allPts.map((p) => p.x));
  const maxX = Math.max(...allPts.map((p) => p.x));
  const minY = Math.min(...allPts.map((p) => p.y));
  const maxY = Math.max(...allPts.map((p) => p.y));

  const pad = 30;
  const rangeX = maxX - minX || 1000;
  const rangeY = maxY - minY || 1000;
  const scale = Math.min(
    (width - pad * 2) / rangeX,
    (height - pad * 2) / rangeY
  );
  const ox = (width - rangeX * scale) / 2 - minX * scale;
  const oy = (height - rangeY * scale) / 2 - minY * scale;

  function toScreen(x: number, y: number): [number, number] {
    return [x * scale + ox, y * scale + oy];
  }

  ctx.fillStyle = "#F5F0E8";
  if (state.walls.length >= 3) {
    const pts = extractPolygon(state.walls);
    if (pts.length >= 3) {
      ctx.beginPath();
      const [sx, sy] = toScreen(pts[0].x, pts[0].y);
      ctx.moveTo(sx, sy);
      for (let i = 1; i < pts.length; i++) {
        const [px, py] = toScreen(pts[i].x, pts[i].y);
        ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  for (const w of state.walls) {
    const [x1, y1] = toScreen(w.start.x, w.start.y);
    const [x2, y2] = toScreen(w.end.x, w.end.y);
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    if (len === 0) continue;
    const nx = -dy / len;
    const ny = dx / len;
    const ht = (w.thickness * scale) / 2;

    ctx.fillStyle = "#333";
    ctx.beginPath();
    ctx.moveTo(x1 + nx * ht, y1 + ny * ht);
    ctx.lineTo(x2 + nx * ht, y2 + ny * ht);
    ctx.lineTo(x2 - nx * ht, y2 - ny * ht);
    ctx.lineTo(x1 - nx * ht, y1 - ny * ht);
    ctx.closePath();
    ctx.fill();

    for (const op of w.openings) {
      const wLen = Math.sqrt(
        (w.end.x - w.start.x) ** 2 + (w.end.y - w.start.y) ** 2
      );
      const opCenter = op.position;
      const opHalf = op.width / 2 / wLen;
      const t1 = Math.max(0, opCenter - opHalf);
      const t2 = Math.min(1, opCenter + opHalf);

      const ox1 = x1 + dx * t1;
      const oy1 = y1 + dy * t1;
      const ox2 = x1 + dx * t2;
      const oy2 = y1 + dy * t2;

      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(ox1 + nx * (ht + 1), oy1 + ny * (ht + 1));
      ctx.lineTo(ox2 + nx * (ht + 1), oy2 + ny * (ht + 1));
      ctx.lineTo(ox2 - nx * (ht + 1), oy2 - ny * (ht + 1));
      ctx.lineTo(ox1 - nx * (ht + 1), oy1 - ny * (ht + 1));
      ctx.closePath();
      ctx.fill();

      if (op.type === "door") {
        ctx.strokeStyle = "#22c55e";
        ctx.lineWidth = 1.5;
        const arcR = (op.width * scale) / 1000;
        const cx = op.direction === "right" ? ox2 : ox1;
        const cy = op.direction === "right" ? oy2 : oy1;
        const startAngle = Math.atan2(dy, dx);
        ctx.beginPath();
        ctx.arc(cx, cy, arcR, startAngle, startAngle + Math.PI / 2, false);
        ctx.stroke();
      } else {
        ctx.strokeStyle = "#3b82f6";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(ox1, oy1);
        ctx.lineTo(ox2, oy2);
        ctx.stroke();
        ctx.strokeStyle = "#93c5fd";
        ctx.lineWidth = 1;
        const mxo = (ox1 + ox2) / 2;
        const myo = (oy1 + oy2) / 2;
        ctx.beginPath();
        ctx.moveTo(mxo + nx * 3, myo + ny * 3);
        ctx.lineTo(mxo - nx * 3, myo - ny * 3);
        ctx.stroke();
      }
    }

    const wLenMm = Math.sqrt(
      (w.end.x - w.start.x) ** 2 + (w.end.y - w.start.y) ** 2
    );
    const label =
      wLenMm >= 1000
        ? `${(wLenMm / 1000).toFixed(1)} \u043C`
        : `${Math.round(wLenMm)} \u043C\u043C`;
    const mx = (x1 + x2) / 2;
    const my = (y1 + y2) / 2;
    ctx.save();
    ctx.fillStyle = "#ff6b35";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const txtW = ctx.measureText(label).width + 6;
    ctx.fillStyle = "rgba(255,255,255,0.85)";
    ctx.fillRect(mx - txtW / 2, my - 7, txtW, 14);
    ctx.fillStyle = "#ff6b35";
    ctx.fillText(label, mx, my);
    ctx.restore();
  }

  for (const f of state.furniture) {
    const cat = catalogMap.get(f.itemId);
    if (!cat) continue;
    const [cx, cy] = toScreen(f.x, f.y);
    const fw = cat.width * scale;
    const fd = cat.depth * scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((f.rotation * Math.PI) / 180);

    ctx.fillStyle = cat.color + "cc";
    ctx.strokeStyle = "#555";
    ctx.lineWidth = 0.5;
    ctx.fillRect(-fw / 2, -fd / 2, fw, fd);
    ctx.strokeRect(-fw / 2, -fd / 2, fw, fd);

    ctx.fillStyle = "#333";
    const fontSize = Math.max(6, Math.min(10, fw * 0.15));
    ctx.font = `${fontSize}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(cat.icon, 0, -fontSize * 0.3);
    ctx.font = `${Math.max(5, fontSize * 0.7)}px sans-serif`;
    ctx.fillText(cat.name, 0, fontSize * 0.6);

    ctx.restore();
  }

  return canvas.toDataURL("image/png");
}

function extractPolygon(
  walls: PlannerState["walls"]
): { x: number; y: number }[] {
  const pts: { x: number; y: number }[] = [];
  const visited = new Set<string>();

  function key(x: number, y: number) {
    return `${Math.round(x)}_${Math.round(y)}`;
  }
  for (const w of walls) {
    const k1 = key(w.start.x, w.start.y);
    if (!visited.has(k1)) {
      visited.add(k1);
      pts.push(w.start);
    }
    const k2 = key(w.end.x, w.end.y);
    if (!visited.has(k2)) {
      visited.add(k2);
      pts.push(w.end);
    }
  }
  if (pts.length < 3) return pts;
  const cx = pts.reduce((s, p) => s + p.x, 0) / pts.length;
  const cy = pts.reduce((s, p) => s + p.y, 0) / pts.length;
  pts.sort(
    (a, b) =>
      Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx)
  );
  return pts;
}

export function exportPlannerPdf(state: PlannerState): void {
  const estimate = buildEstimate(
    state.walls,
    state.furniture,
    state.ceilingHeight
  );

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210;
  const L = 14;
  const R = W - 14;

  doc.setFillColor(249, 250, 251);
  doc.rect(0, 0, W, 36, "F");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(30, 30, 30);
  doc.text(
    "\u041F\u041B\u0410\u041D\u0418\u0420\u041E\u0412\u041A\u0410 \u041F\u041E\u041C\u0415\u0429\u0415\u041D\u0418\u042F \u0421\u041E \u0421\u041C\u0415\u0422\u041E\u0419 \u041C\u0410\u0422\u0415\u0420\u0418\u0410\u041B\u041E\u0412",
    W / 2,
    14,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `\u0414\u0430\u0442\u0430: ${estimate.date} | \u0421\u0433\u0435\u043D\u0435\u0440\u0438\u0440\u043E\u0432\u0430\u043D\u043E \u0432 3D-\u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0449\u0438\u043A\u0435`,
    W / 2,
    21,
    { align: "center" }
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(60, 60, 60);
  doc.text(
    `\u0410\u0434\u0440\u0435\u0441: ________________________________________________`,
    L,
    30
  );
  doc.text(
    `\u0417\u0430\u043A\u0430\u0437\u0447\u0438\u043A: ___________________________________________`,
    L + 108,
    30
  );

  let y = 42;

  const planImg = renderFloorPlan(state, 700, 450);
  const imgW = R - L;
  const imgH = imgW * (450 / 700);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);
  doc.text("1. \u041F\u043B\u0430\u043D \u043F\u043E\u043C\u0435\u0449\u0435\u043D\u0438\u044F", L, y);
  y += 3;

  doc.addImage(planImg, "PNG", L, y, imgW, imgH);
  y += imgH + 4;

  drawMetricsBox(doc, estimate, L, y, R);
  y += 20;

  let sectionNum = 2;
  for (const section of estimate.sections) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`${sectionNum}. ${section.title}`, L, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [
        [
          "\u2116",
          "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435",
          "\u0415\u0434.",
          "\u041A\u043E\u043B-\u0432\u043E",
          "\u0426\u0435\u043D\u0430, \u0440\u0443\u0431.",
          "\u0421\u0443\u043C\u043C\u0430, \u0440\u0443\u0431.",
        ],
      ],
      body: section.lines.map((line, idx) => [
        idx + 1,
        line.name,
        line.unit,
        line.quantity,
        line.pricePerUnit.toLocaleString("ru-RU"),
        line.total.toLocaleString("ru-RU"),
      ]),
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        font: "helvetica",
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [59, 130, 246],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 9, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 16, halign: "center" },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 26, halign: "right" },
      },
      margin: { left: L, right: 14 },
    });

    y =
      (doc as unknown as Record<string, Record<string, number>>).lastAutoTable
        ?.finalY ?? y + 30;
    y += 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `\u0418\u0442\u043E\u0433\u043E ${section.title.toLowerCase()}:`,
      R - 60,
      y
    );
    doc.text(fmt(section.subtotal), R, y, { align: "right" });
    y += 7;

    sectionNum++;
  }

  if (estimate.furnitureSection) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(30, 30, 30);
    doc.text(`${sectionNum}. ${estimate.furnitureSection.title}`, L, y);
    y += 4;

    autoTable(doc, {
      startY: y,
      head: [
        [
          "\u2116",
          "\u041D\u0430\u0438\u043C\u0435\u043D\u043E\u0432\u0430\u043D\u0438\u0435",
          "\u0415\u0434.",
          "\u041A\u043E\u043B-\u0432\u043E",
          "\u0426\u0435\u043D\u0430, \u0440\u0443\u0431.",
          "\u0421\u0443\u043C\u043C\u0430, \u0440\u0443\u0431.",
        ],
      ],
      body: estimate.furnitureSection.lines.map((line, idx) => [
        idx + 1,
        line.name,
        line.unit,
        line.quantity,
        line.pricePerUnit.toLocaleString("ru-RU"),
        line.total.toLocaleString("ru-RU"),
      ]),
      styles: {
        fontSize: 8.5,
        cellPadding: 2,
        font: "helvetica",
        textColor: [30, 30, 30],
      },
      headStyles: {
        fillColor: [34, 197, 94],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
      },
      alternateRowStyles: { fillColor: [250, 250, 250] },
      columnStyles: {
        0: { cellWidth: 9, halign: "center" },
        1: { cellWidth: "auto" },
        2: { cellWidth: 18, halign: "center" },
        3: { cellWidth: 16, halign: "center" },
        4: { cellWidth: 26, halign: "right" },
        5: { cellWidth: 26, halign: "right" },
      },
      margin: { left: L, right: 14 },
    });

    y =
      (doc as unknown as Record<string, Record<string, number>>).lastAutoTable
        ?.finalY ?? y + 30;
    y += 2;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(
      `\u0418\u0442\u043E\u0433\u043E \u043C\u0435\u0431\u0435\u043B\u044C:`,
      R - 60,
      y
    );
    doc.text(fmt(estimate.furnitureSection.subtotal), R, y, { align: "right" });
    y += 7;
    sectionNum++;
  }

  if (y > 240) {
    doc.addPage();
    y = 20;
  }
  y += 4;

  doc.setDrawColor(200, 200, 200);
  doc.line(L, y, R, y);
  y += 6;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 20, 20);
  doc.text(
    "\u0418\u0422\u041E\u0413\u041E:",
    R - 60,
    y
  );
  doc.text(fmt(estimate.grandTotal), R, y, { align: "right" });
  y += 10;

  doc.setDrawColor(220, 220, 220);
  doc.line(L, y, R, y);
  y += 5;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(30, 30, 30);
  doc.text(
    "\u041F\u0440\u0438\u043C\u0435\u0447\u0430\u043D\u0438\u044F:",
    L,
    y
  );
  y += 5;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(70, 70, 70);
  const notes = [
    "1. \u0426\u0435\u043D\u044B \u043D\u0430 \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u044B \u043E\u0440\u0438\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u043E\u0447\u043D\u044B\u0435, \u043C\u043E\u0433\u0443\u0442 \u043E\u0442\u043B\u0438\u0447\u0430\u0442\u044C\u0441\u044F \u0432 \u0437\u0430\u0432\u0438\u0441\u0438\u043C\u043E\u0441\u0442\u0438 \u043E\u0442 \u0440\u0435\u0433\u0438\u043E\u043D\u0430 \u0438 \u043F\u043E\u0441\u0442\u0430\u0432\u0449\u0438\u043A\u0430.",
    "2. \u041A\u043E\u043B\u0438\u0447\u0435\u0441\u0442\u0432\u043E \u043C\u0430\u0442\u0435\u0440\u0438\u0430\u043B\u043E\u0432 \u0440\u0430\u0441\u0441\u0447\u0438\u0442\u0430\u043D\u043E \u0441 \u0443\u0447\u0451\u0442\u043E\u043C \u0437\u0430\u043F\u0430\u0441\u0430 10% \u043D\u0430 \u043E\u0431\u0440\u0435\u0437\u043A\u0438 \u0438 \u0431\u0440\u0430\u043A.",
    "3. \u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u043C\u0435\u0431\u0435\u043B\u0438 \u0443\u043A\u0430\u0437\u0430\u043D\u0430 \u043E\u0440\u0438\u0435\u043D\u0442\u0438\u0440\u043E\u0432\u043E\u0447\u043D\u043E \u0438 \u0437\u0430\u0432\u0438\u0441\u0438\u0442 \u043E\u0442 \u0432\u044B\u0431\u0440\u0430\u043D\u043D\u043E\u0433\u043E \u043F\u0440\u043E\u0438\u0437\u0432\u043E\u0434\u0438\u0442\u0435\u043B\u044F.",
    "4. \u0421\u0442\u043E\u0438\u043C\u043E\u0441\u0442\u044C \u0440\u0430\u0431\u043E\u0442 \u043D\u0435 \u0432\u043A\u043B\u044E\u0447\u0435\u043D\u0430 \u0432 \u0441\u043C\u0435\u0442\u0443.",
  ];
  for (const n of notes) {
    doc.text(n, L, y);
    y += 4.5;
  }

  const pages = doc.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(180, 180, 180);
    doc.text(
      `3D-\u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u0449\u0438\u043A | \u0421\u0442\u0440. ${i} \u0438\u0437 ${pages}`,
      W / 2,
      290,
      { align: "center" }
    );
  }

  doc.save(
    `\u041F\u043B\u0430\u043D\u0438\u0440\u043E\u0432\u043A\u0430_${estimate.date.replace(/\./g, "-")}.pdf`
  );
}

function drawMetricsBox(
  doc: jsPDF,
  estimate: FullEstimate,
  left: number,
  y: number,
  right: number
): void {
  const m = estimate.metrics;
  const colW = (right - left) / 3;

  doc.setDrawColor(220, 220, 220);
  doc.setFillColor(249, 250, 251);
  doc.rect(left, y, right - left, 14, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);

  const cols = [
    [
      `\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u043F\u043E\u043B\u0430: ${fmtM2(m.floorArea)}`,
      `\u041F\u0435\u0440\u0438\u043C\u0435\u0442\u0440: ${fmtM(m.perimeter)} \u043C`,
    ],
    [
      `\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u0441\u0442\u0435\u043D: ${fmtM2(m.wallArea)}`,
      `\u041F\u043B\u043E\u0449\u0430\u0434\u044C \u043F\u043E\u0442\u043E\u043B\u043A\u0430: ${fmtM2(m.ceilingArea)}`,
    ],
    [
      `\u0414\u0432\u0435\u0440\u0435\u0439: ${m.doorCount} \u0448\u0442.`,
      `\u041E\u043A\u043E\u043D: ${m.windowCount} \u0448\u0442.`,
    ],
  ];

  for (let c = 0; c < cols.length; c++) {
    const x = left + colW * c + 4;
    doc.text(cols[c][0], x, y + 5);
    doc.text(cols[c][1], x, y + 10);
  }
}

export default exportPlannerPdf;
