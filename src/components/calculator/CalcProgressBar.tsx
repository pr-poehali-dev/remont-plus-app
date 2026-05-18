import { useMemo } from "react";
import Icon from "@/components/ui/icon";

interface Props {
  /** Текущее количество заполненных параметров */
  filled: number;
  /** Общее количество параметров */
  total: number;
  /** Цветовой акцент (соответствует калькулятору) */
  accentColor?: "blue" | "orange" | "emerald" | "amber" | "violet" | "rose" | "indigo" | "green";
  /** Дополнительный текст-подсказка */
  hint?: string;
  /** Компактный режим (без подписей) */
  compact?: boolean;
}

const COLOR_MAP: Record<NonNullable<Props["accentColor"]>, { bar: string; text: string; bg: string; icon: string }> = {
  blue:    { bar: "bg-blue-600",    text: "text-blue-700",    bg: "bg-blue-50",    icon: "text-blue-500" },
  orange:  { bar: "bg-orange-600",  text: "text-orange-700",  bg: "bg-orange-50",  icon: "text-orange-500" },
  emerald: { bar: "bg-emerald-600", text: "text-emerald-700", bg: "bg-emerald-50", icon: "text-emerald-500" },
  amber:   { bar: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50",   icon: "text-amber-500" },
  violet:  { bar: "bg-violet-600",  text: "text-violet-700",  bg: "bg-violet-50",  icon: "text-violet-500" },
  rose:    { bar: "bg-rose-600",    text: "text-rose-700",    bg: "bg-rose-50",    icon: "text-rose-500" },
  indigo:  { bar: "bg-indigo-600",  text: "text-indigo-700",  bg: "bg-indigo-50",  icon: "text-indigo-500" },
  green:   { bar: "bg-green-600",   text: "text-green-700",   bg: "bg-green-50",   icon: "text-green-500" },
};

export default function CalcProgressBar({ filled, total, accentColor = "blue", hint, compact = false }: Props) {
  const pct = useMemo(() => {
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, Math.round((filled / total) * 100)));
  }, [filled, total]);

  const c = COLOR_MAP[accentColor];
  const done = pct >= 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full ${c.bar} transition-all duration-500 ease-out`}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className={`text-[11px] font-semibold ${c.text} tabular-nums`}>{pct}%</span>
      </div>
    );
  }

  return (
    <div className={`${c.bg} rounded-xl p-3 mb-4 border border-transparent`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          <Icon name={done ? "CheckCircle2" : "ListChecks"} size={14} className={c.icon} />
          <span className={`text-xs font-semibold ${c.text}`}>
            {done ? "Готово!" : "Заполнение калькулятора"}
          </span>
        </div>
        <span className={`text-xs font-bold ${c.text} tabular-nums`}>
          {filled}/{total} · {pct}%
        </span>
      </div>
      <div className="h-2 bg-white/70 rounded-full overflow-hidden shadow-inner">
        <div
          className={`h-full ${c.bar} transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && !done && (
        <p className="text-[11px] text-gray-500 mt-1.5 leading-tight">{hint}</p>
      )}
      {done && (
        <p className="text-[11px] text-gray-500 mt-1.5 leading-tight">
          Все основные параметры заполнены — итоговая смета максимально точная.
        </p>
      )}
    </div>
  );
}
