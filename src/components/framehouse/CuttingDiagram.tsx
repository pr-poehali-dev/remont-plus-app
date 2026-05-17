import type { StockSheet } from "@/lib/cutting";

interface Props {
  sheets: StockSheet[];
  stockLength: number;
}

// Палитра цветов для разных меток
const PALETTE = [
  "#fb923c", "#60a5fa", "#34d399", "#a78bfa",
  "#f472b6", "#fbbf24", "#22d3ee", "#f87171",
  "#84cc16", "#c084fc", "#fb7185", "#14b8a6",
];

function hashColor(label: string): string {
  let h = 0;
  for (let i = 0; i < label.length; i++) h = (h * 31 + label.charCodeAt(i)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

export default function CuttingDiagram({ sheets, stockLength }: Props) {
  if (sheets.length === 0) {
    return <div className="text-sm text-slate-500">Деталей нет</div>;
  }

  return (
    <div className="space-y-2">
      {sheets.map((sheet, idx) => {
        const usedPct = (sheet.used / stockLength) * 100;
        return (
          <div key={idx} className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500 w-16 shrink-0">
              №{idx + 1}
            </span>
            <div className="flex-1 relative h-9 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700 overflow-hidden">
              {sheet.pieces.map((p, i) => {
                const left = (p.start / stockLength) * 100;
                const width = (p.length / stockLength) * 100;
                const color = hashColor(p.label.replace(/\s*\d+\s*$/, ""));
                return (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 flex items-center justify-center text-[10px] font-semibold text-white overflow-hidden whitespace-nowrap border-r border-white/40 px-1"
                    style={{
                      left: `${left}%`,
                      width: `${width}%`,
                      background: color,
                    }}
                    title={`${p.label} — ${p.length} мм`}
                  >
                    {p.length}
                  </div>
                );
              })}
              {sheet.waste > 50 && (
                <div
                  className="absolute top-0 bottom-0 right-0 flex items-center justify-center text-[10px] font-medium text-slate-500"
                  style={{ width: `${100 - usedPct}%` }}
                  title={`Остаток ${sheet.waste} мм`}
                >
                  {sheet.waste}
                </div>
              )}
            </div>
            <span className="text-xs text-slate-400 w-16 text-right shrink-0 tabular-nums">
              {Math.round(usedPct)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}
