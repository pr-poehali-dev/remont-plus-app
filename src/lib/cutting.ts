/**
 * 1D Cutting Stock — алгоритм раскроя пиломатериалов
 * Использует First Fit Decreasing — близок к оптимуму, работает быстро.
 */

export interface CutPiece {
  /** Длина детали, мм */
  length: number;
  /** Метка детали (например, "Стойка стены А") */
  label: string;
}

export interface StockBoard {
  /** Стандартная длина доски, мм (например 6000) */
  length: number;
  /** Расход на пропил (kerf), мм */
  kerf?: number;
}

export interface PlacedPiece {
  start: number;
  length: number;
  label: string;
}

export interface StockSheet {
  length: number;
  pieces: PlacedPiece[];
  /** Использованная длина (включая пропилы) */
  used: number;
  /** Остаток */
  waste: number;
}

export interface CuttingResult {
  /** Стандартный размер хлыста */
  stockLength: number;
  /** Конкретные хлысты */
  sheets: StockSheet[];
  /** Сколько хлыстов всего */
  totalStock: number;
  /** Полезная длина (сумма деталей), мм */
  totalUsefulMm: number;
  /** Закуплено всего, мм */
  totalStockMm: number;
  /** Отход в мм */
  wasteMm: number;
  /** Отход в % */
  wastePct: number;
  /** Детали, которые не влезли ни на один хлыст (длина > stock) */
  oversized: CutPiece[];
}

/**
 * Раскрой методом First Fit Decreasing.
 * Сортируем по убыванию длины и кладём каждую деталь в первый доступный хлыст.
 */
export function cutStock(
  pieces: CutPiece[],
  stock: StockBoard
): CuttingResult {
  const kerf = stock.kerf ?? 3; // 3 мм по умолчанию
  const stockLength = stock.length;

  const oversized: CutPiece[] = [];
  const fitting: CutPiece[] = [];

  for (const p of pieces) {
    if (p.length > stockLength) oversized.push(p);
    else fitting.push(p);
  }

  // FFD — сортируем по убыванию длины
  const sorted = [...fitting].sort((a, b) => b.length - a.length);

  const sheets: StockSheet[] = [];

  for (const piece of sorted) {
    let placed = false;
    for (const sheet of sheets) {
      const needed = piece.length + (sheet.pieces.length > 0 ? kerf : 0);
      if (sheet.used + needed <= stockLength) {
        const start = sheet.used + (sheet.pieces.length > 0 ? kerf : 0);
        sheet.pieces.push({ start, length: piece.length, label: piece.label });
        sheet.used += needed;
        sheet.waste = stockLength - sheet.used;
        placed = true;
        break;
      }
    }
    if (!placed) {
      sheets.push({
        length: stockLength,
        pieces: [{ start: 0, length: piece.length, label: piece.label }],
        used: piece.length,
        waste: stockLength - piece.length,
      });
    }
  }

  const totalUsefulMm = fitting.reduce((s, p) => s + p.length, 0);
  const totalStockMm = sheets.length * stockLength;
  const wasteMm = totalStockMm - totalUsefulMm;
  const wastePct = totalStockMm > 0 ? (wasteMm / totalStockMm) * 100 : 0;

  return {
    stockLength,
    sheets,
    totalStock: sheets.length,
    totalUsefulMm,
    totalStockMm,
    wasteMm,
    wastePct,
    oversized,
  };
}

/**
 * Сгруппировать одинаковые детали для краткой спецификации.
 */
export function groupPieces(pieces: CutPiece[]): Array<{ label: string; length: number; qty: number }> {
  const map = new Map<string, { label: string; length: number; qty: number }>();
  for (const p of pieces) {
    const key = `${p.label}__${p.length}`;
    const existing = map.get(key);
    if (existing) existing.qty++;
    else map.set(key, { label: p.label, length: p.length, qty: 1 });
  }
  return Array.from(map.values()).sort((a, b) => b.length - a.length);
}
