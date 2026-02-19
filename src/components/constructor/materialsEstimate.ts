import { Wall } from './types';
import { wallLength } from './canvasEngine';

export interface MaterialLine {
  name: string;
  unit: string;
  quantity: number;
  pricePerUnit: number;
  total: number;
}

export interface MaterialCategory {
  title: string;
  icon: string;
  items: MaterialLine[];
  subtotal: number;
}

export interface Estimate {
  categories: MaterialCategory[];
  grandTotal: number;
  floorArea: number;
  wallArea: number;
  ceilingArea: number;
  perimeterM: number;
  doorsCount: number;
  windowsCount: number;
}

function calcFloorArea(walls: Wall[]): number {
  if (walls.length === 0) return 0;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const w of walls) {
    minX = Math.min(minX, w.start.x, w.end.x);
    minY = Math.min(minY, w.start.y, w.end.y);
    maxX = Math.max(maxX, w.start.x, w.end.x);
    maxY = Math.max(maxY, w.start.y, w.end.y);
  }
  return ((maxX - minX) * (maxY - minY)) / 1_000_000;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateEstimate(walls: Wall[], ceilingHeightMM: number): Estimate {
  const floorArea = calcFloorArea(walls);
  const ceilingArea = floorArea;
  const ceilingHeightM = ceilingHeightMM / 1000;

  let totalWallLengthMM = 0;
  let totalOpeningsAreaMM2 = 0;
  let doorsCount = 0;
  let windowsCount = 0;

  for (const wall of walls) {
    const len = wallLength(wall);
    totalWallLengthMM += len;

    for (const op of wall.openings) {
      const openingHeightMM = op.type === 'door' ? 2100 : 1500;
      totalOpeningsAreaMM2 += op.width * openingHeightMM;
      if (op.type === 'door') doorsCount++;
      else windowsCount++;
    }
  }

  const perimeterM = round2(totalWallLengthMM / 1000);
  const grossWallAreaM2 = round2((totalWallLengthMM * ceilingHeightMM) / 1_000_000);
  const openingsAreaM2 = round2(totalOpeningsAreaMM2 / 1_000_000);
  const netWallAreaM2 = round2(Math.max(0, grossWallAreaM2 - openingsAreaM2));

  const RESERVE = 1.1;

  const categories: MaterialCategory[] = [];

  // 1. Полы
  const floorItems: MaterialLine[] = [];
  if (floorArea > 0) {
    const laminateQty = round2(floorArea * RESERVE);
    const laminatePrice = 850;
    floorItems.push({
      name: 'Ламинат 32 класс',
      unit: 'м²',
      quantity: laminateQty,
      pricePerUnit: laminatePrice,
      total: round2(laminateQty * laminatePrice),
    });

    const substrateQty = round2(floorArea * RESERVE);
    const substratePrice = 120;
    floorItems.push({
      name: 'Подложка 3 мм',
      unit: 'м²',
      quantity: substrateQty,
      pricePerUnit: substratePrice,
      total: round2(substrateQty * substratePrice),
    });

    const plinthQty = round2(perimeterM * RESERVE);
    const plinthPrice = 350;
    floorItems.push({
      name: 'Плинтус напольный',
      unit: 'м.п.',
      quantity: plinthQty,
      pricePerUnit: plinthPrice,
      total: round2(plinthQty * plinthPrice),
    });
  }

  const floorSubtotal = floorItems.reduce((s, i) => s + i.total, 0);
  if (floorItems.length > 0) {
    categories.push({ title: 'Полы', icon: 'Layers', items: floorItems, subtotal: round2(floorSubtotal) });
  }

  // 2. Стены
  const wallItems: MaterialLine[] = [];
  if (netWallAreaM2 > 0) {
    const primerQty = round2((netWallAreaM2 * 0.2) * RESERVE);
    const primerPrice = 480;
    wallItems.push({
      name: 'Грунтовка глубокого проникновения',
      unit: 'л',
      quantity: primerQty,
      pricePerUnit: primerPrice,
      total: round2(primerQty * primerPrice),
    });

    const puttyQty = round2((netWallAreaM2 * 1.2) * RESERVE);
    const puttyPrice = 65;
    wallItems.push({
      name: 'Шпаклёвка финишная',
      unit: 'кг',
      quantity: puttyQty,
      pricePerUnit: puttyPrice,
      total: round2(puttyQty * puttyPrice),
    });

    const paintQty = round2((netWallAreaM2 * 0.15) * RESERVE);
    const paintPrice = 750;
    wallItems.push({
      name: 'Краска интерьерная',
      unit: 'л',
      quantity: paintQty,
      pricePerUnit: paintPrice,
      total: round2(paintQty * paintPrice),
    });

    const wallpaperQty = round2(netWallAreaM2 * RESERVE);
    const wallpaperPrice = 620;
    wallItems.push({
      name: 'Обои флизелиновые (альт.)',
      unit: 'м²',
      quantity: wallpaperQty,
      pricePerUnit: wallpaperPrice,
      total: round2(wallpaperQty * wallpaperPrice),
    });
  }

  const wallSubtotal = wallItems.reduce((s, i) => s + i.total, 0);
  if (wallItems.length > 0) {
    categories.push({ title: 'Стены', icon: 'PanelLeft', items: wallItems, subtotal: round2(wallSubtotal) });
  }

  // 3. Потолок
  const ceilingItems: MaterialLine[] = [];
  if (ceilingArea > 0) {
    const cPrimerQty = round2((ceilingArea * 0.2) * RESERVE);
    const cPrimerPrice = 480;
    ceilingItems.push({
      name: 'Грунтовка потолочная',
      unit: 'л',
      quantity: cPrimerQty,
      pricePerUnit: cPrimerPrice,
      total: round2(cPrimerQty * cPrimerPrice),
    });

    const cPaintQty = round2((ceilingArea * 0.15) * RESERVE);
    const cPaintPrice = 850;
    ceilingItems.push({
      name: 'Краска потолочная',
      unit: 'л',
      quantity: cPaintQty,
      pricePerUnit: cPaintPrice,
      total: round2(cPaintQty * cPaintPrice),
    });
  }

  const ceilingSubtotal = ceilingItems.reduce((s, i) => s + i.total, 0);
  if (ceilingItems.length > 0) {
    categories.push({ title: 'Потолок', icon: 'ArrowUpFromLine', items: ceilingItems, subtotal: round2(ceilingSubtotal) });
  }

  // 4. Двери и окна
  const openingItems: MaterialLine[] = [];
  if (doorsCount > 0) {
    const doorPrice = 8500;
    openingItems.push({
      name: 'Дверь межкомнатная с фурнитурой',
      unit: 'шт.',
      quantity: doorsCount,
      pricePerUnit: doorPrice,
      total: round2(doorsCount * doorPrice),
    });

    const doorFramePrice = 3200;
    openingItems.push({
      name: 'Дверная коробка + наличники',
      unit: 'комп.',
      quantity: doorsCount,
      pricePerUnit: doorFramePrice,
      total: round2(doorsCount * doorFramePrice),
    });
  }

  if (windowsCount > 0) {
    const sillPrice = 2800;
    openingItems.push({
      name: 'Подоконник ПВХ',
      unit: 'шт.',
      quantity: windowsCount,
      pricePerUnit: sillPrice,
      total: round2(windowsCount * sillPrice),
    });

    const slopePrice = 1500;
    openingItems.push({
      name: 'Откосы оконные',
      unit: 'комп.',
      quantity: windowsCount,
      pricePerUnit: slopePrice,
      total: round2(windowsCount * slopePrice),
    });
  }

  const openingSubtotal = openingItems.reduce((s, i) => s + i.total, 0);
  if (openingItems.length > 0) {
    categories.push({ title: 'Двери и окна', icon: 'DoorOpen', items: openingItems, subtotal: round2(openingSubtotal) });
  }

  // 5. Черновые материалы
  const roughItems: MaterialLine[] = [];
  if (floorArea > 0) {
    const screedQty = round2(floorArea * 20 * RESERVE);
    const screedPrice = 12;
    roughItems.push({
      name: 'Смесь для стяжки пола (50 мм)',
      unit: 'кг',
      quantity: screedQty,
      pricePerUnit: screedPrice,
      total: round2(screedQty * screedPrice),
    });
  }

  if (netWallAreaM2 > 0) {
    const plasterQty = round2(netWallAreaM2 * 8 * RESERVE);
    const plasterPrice = 14;
    roughItems.push({
      name: 'Штукатурка гипсовая (10 мм)',
      unit: 'кг',
      quantity: plasterQty,
      pricePerUnit: plasterPrice,
      total: round2(plasterQty * plasterPrice),
    });
  }

  const roughSubtotal = roughItems.reduce((s, i) => s + i.total, 0);
  if (roughItems.length > 0) {
    categories.push({ title: 'Черновые материалы', icon: 'Hammer', items: roughItems, subtotal: round2(roughSubtotal) });
  }

  const grandTotal = round2(categories.reduce((s, c) => s + c.subtotal, 0));

  return {
    categories,
    grandTotal,
    floorArea: round2(floorArea),
    wallArea: netWallAreaM2,
    ceilingArea: round2(ceilingArea),
    perimeterM,
    doorsCount,
    windowsCount,
  };
}

export function formatPrice(n: number): string {
  return n.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

export function exportEstimatePDF(estimate: Estimate, ceilingHeightMM: number): void {
  const date = new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });

  const categoryRows = estimate.categories.map((cat) => {
    const itemRows = cat.items.map((item) => `
      <tr class="item-row">
        <td class="item-name">${item.name}</td>
        <td class="center">${item.quantity}</td>
        <td class="center">${item.unit}</td>
        <td class="right">${formatPrice(item.pricePerUnit)} ₽</td>
        <td class="right total-cell">${formatPrice(item.total)} ₽</td>
      </tr>`).join('');

    return `
      <tr class="cat-header">
        <td colspan="4">${cat.title}</td>
        <td class="right">${formatPrice(cat.subtotal)} ₽</td>
      </tr>
      ${itemRows}`;
  }).join('');

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8" />
  <title>Смета материалов — АВАНГАРД</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Arial', sans-serif; font-size: 11px; color: #1a1a1a; background: #fff; padding: 24px 32px; }

    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 3px solid #1a1a6e; padding-bottom: 16px; }
    .logo { font-size: 22px; font-weight: 900; letter-spacing: 2px; color: #1a1a6e; }
    .logo span { color: #e84040; }
    .company-info { font-size: 10px; color: #555; text-align: right; line-height: 1.6; }

    h1 { font-size: 16px; font-weight: bold; margin-bottom: 4px; color: #1a1a1a; }
    .doc-meta { font-size: 10px; color: #777; margin-bottom: 20px; }

    .summary-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 24px; }
    .summary-box { border: 1px solid #ddd; border-radius: 4px; padding: 10px; }
    .summary-box .val { font-size: 15px; font-weight: bold; color: #1a1a6e; }
    .summary-box .lbl { font-size: 9px; color: #888; margin-top: 2px; text-transform: uppercase; letter-spacing: 0.5px; }

    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1a1a6e; color: #fff; padding: 7px 8px; text-align: left; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; }
    th.center, td.center { text-align: center; }
    th.right, td.right { text-align: right; }
    td { padding: 5px 8px; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
    .cat-header td { background: #f0f4ff; font-weight: bold; font-size: 11px; color: #1a1a6e; padding: 7px 8px; border-top: 2px solid #c8d4f8; border-bottom: 1px solid #c8d4f8; }
    .item-row td { color: #333; }
    .item-name { max-width: 240px; }
    .total-cell { font-weight: 600; color: #1a1a1a; }

    .grand-total { background: #1a1a6e; color: #fff; border-radius: 6px; padding: 14px 20px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
    .grand-total .label { font-size: 13px; font-weight: bold; letter-spacing: 1px; }
    .grand-total .amount { font-size: 22px; font-weight: 900; }

    .note { font-size: 9px; color: #888; margin-bottom: 20px; line-height: 1.5; }
    .footer { border-top: 1px solid #ddd; padding-top: 12px; display: flex; justify-content: space-between; font-size: 9px; color: #aaa; }

    @media print {
      body { padding: 10px 20px; }
      @page { margin: 15mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="logo">АВА<span>Н</span>ГАРД</div>
      <div style="font-size:9px;color:#888;margin-top:3px;">Профессиональный ремонт и строительство</div>
    </div>
    <div class="company-info">
      <div><strong>ООО «АВАНГАРД»</strong></div>
      <div>info@avangard-ai.ru</div>
      <div>Документ сформирован: ${date}</div>
    </div>
  </div>

  <h1>Смета на материалы</h1>
  <div class="doc-meta">Высота потолка: ${(ceilingHeightMM / 1000).toFixed(2)} м &nbsp;|&nbsp; Цены ориентировочные, с запасом 10%</div>

  <div class="summary-grid">
    <div class="summary-box"><div class="val">${estimate.floorArea} м²</div><div class="lbl">Площадь пола</div></div>
    <div class="summary-box"><div class="val">${estimate.wallArea} м²</div><div class="lbl">Площадь стен</div></div>
    <div class="summary-box"><div class="val">${estimate.doorsCount} шт.</div><div class="lbl">Дверей</div></div>
    <div class="summary-box"><div class="val">${estimate.windowsCount} шт.</div><div class="lbl">Окон</div></div>
  </div>

  <table>
    <thead>
      <tr>
        <th>Наименование</th>
        <th class="center">Кол-во</th>
        <th class="center">Ед.</th>
        <th class="right">Цена</th>
        <th class="right">Сумма</th>
      </tr>
    </thead>
    <tbody>
      ${categoryRows}
    </tbody>
  </table>

  <div class="grand-total">
    <div class="label">ИТОГО МАТЕРИАЛЫ</div>
    <div class="amount">${formatPrice(estimate.grandTotal)} ₽</div>
  </div>

  <div class="note">
    * Стоимость рассчитана автоматически на основании введённых размеров помещения. Цены носят ориентировочный характер
    и могут отличаться в зависимости от выбранных материалов, поставщиков и региона. В стоимость не включена работа
    по монтажу. Для точного расчёта обратитесь к менеджеру компании АВАНГАРД.
  </div>

  <div class="footer">
    <span>АВАНГАРД — Профессиональный ремонт и строительство</span>
    <span>info@avangard-ai.ru</span>
  </div>

  <script>window.onload = () => { window.print(); }</script>
</body>
</html>`;

  const win = window.open('', '_blank', 'width=900,height=700');
  if (!win) return;
  win.document.write(html);
  win.document.close();
}