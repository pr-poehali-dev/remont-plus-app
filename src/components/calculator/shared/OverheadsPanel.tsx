import { OVERHEAD_DEFS } from "./overheads";
import type { OverheadState } from "./overheads";
import Icon from "@/components/ui/icon";

const BASE_LABEL: Record<string, string> = {
  works: "от работ",
  materials: "от материалов",
  total: "от работ+материалов",
};

interface Props {
  value: OverheadState;
  onChange: (next: OverheadState) => void;
  className?: string;
}

/** Панель настройки накладных: прораб, снабженец, транспорт, офис. */
export default function OverheadsPanel({ value, onChange, className }: Props) {
  const toggle = (id: keyof OverheadState) =>
    onChange({ ...value, [id]: { ...value[id], on: !value[id].on } });

  const setPct = (id: keyof OverheadState, pct: number) =>
    onChange({ ...value, [id]: { ...value[id], pct: Math.max(0, Math.min(100, pct)) } });

  return (
    <div className={className}>
      <p className="text-xs font-semibold text-gray-500 uppercase mb-2 flex items-center gap-1">
        <Icon name="Briefcase" size={13} /> Накладные расходы
      </p>
      <div className="space-y-2">
        {OVERHEAD_DEFS.map((def) => {
          const s = value[def.id];
          return (
            <div
              key={def.id}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 transition ${
                s.on ? "border-teal-300 bg-teal-50/50" : "border-gray-200"
              }`}
            >
              <button
                type="button"
                onClick={() => toggle(def.id)}
                className={`shrink-0 w-5 h-5 rounded flex items-center justify-center border ${
                  s.on ? "bg-teal-600 border-teal-600 text-white" : "border-gray-300 text-transparent"
                }`}
                aria-label={def.label}
              >
                <Icon name="Check" size={13} />
              </button>
              <div className="flex-1 min-w-0">
                <div className="text-sm text-gray-800 truncate">{def.label}</div>
                <div className="text-[11px] text-gray-400">{BASE_LABEL[def.base]}</div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={s.pct}
                  disabled={!s.on}
                  onChange={(e) => setPct(def.id, parseFloat(e.target.value) || 0)}
                  className="w-14 border border-gray-200 rounded px-2 py-1 text-sm text-right disabled:bg-gray-50 disabled:text-gray-400"
                />
                <span className="text-sm text-gray-400">%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
