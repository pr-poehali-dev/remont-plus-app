import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

export function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-amber-600" />
      <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">{children}</h3>
    </div>
  );
}

export function RadioGroup<T extends string>({
  options, value, onChange, columns = 1,
}: {
  options: { value: T; label: string; desc?: string; badge?: string; warn?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`text-left rounded-xl border-2 p-2.5 transition-all ${
            value === o.value
              ? "border-amber-500 bg-amber-50"
              : "border-gray-200 hover:border-amber-300 bg-white"
          } ${o.warn ? "border-orange-300" : ""}`}
        >
          <div className="flex items-start justify-between gap-1">
            <span className={`text-sm font-medium leading-tight ${value === o.value ? "text-amber-800" : "text-gray-700"}`}>{o.label}</span>
            {o.badge && <Badge variant="secondary" className="text-[10px] shrink-0">{o.badge}</Badge>}
          </div>
          {o.desc && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{o.desc}</p>}
        </button>
      ))}
    </div>
  );
}
