import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";

// ─── SECTION ─────────────────────────────────────────────────────────────────

export function Section({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 pb-2 border-b">
        <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-blue-600" />
        <span className="font-semibold text-gray-800 text-sm uppercase tracking-wide">{title}</span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

// ─── OPTION GRID ─────────────────────────────────────────────────────────────

export function OptionGrid<T extends string>({
  options, value, onChange, cols = 2,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  cols?: 2 | 3;
}) {
  return (
    <div className={`grid gap-2 ${cols === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
      {options.map(o => (
        <button
          key={o.id} type="button"
          onClick={() => onChange(o.id)}
          className={`px-3 py-2 rounded-lg border text-xs font-medium text-left transition-all ${
            value === o.id
              ? "bg-blue-600 text-white border-blue-600"
              : "bg-white text-gray-700 border-gray-200 hover:border-blue-400"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

// ─── NUM ROW ─────────────────────────────────────────────────────────────────

export function NumRow({ label, value, onChange, min = 0, max = 9999 }: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-gray-600 flex-1">{label}</span>
      <div className="flex items-center gap-1.5">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">−</button>
        <Input
          type="number" value={value} min={min} max={max}
          onChange={e => onChange(Math.max(min, Math.min(max, Number(e.target.value) || 0)))}
          className="w-16 h-7 text-center text-sm px-1"
        />
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm">+</button>
      </div>
    </div>
  );
}

// ─── TOGGLE ──────────────────────────────────────────────────────────────────

export function Toggle({ label, value, onChange, description }: {
  label: string; value: boolean; onChange: (v: boolean) => void; description?: string;
}) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
        value ? "bg-blue-50 border-blue-400" : "bg-white border-gray-200 hover:border-blue-300"
      }`}>
      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${
        value ? "bg-blue-600 border-blue-600" : "border-gray-300"
      }`}>
        {value && <Icon name="Check" size={10} className="text-white" />}
      </div>
      <div>
        <div className="text-sm font-medium text-gray-800">{label}</div>
        {description && <div className="text-xs text-gray-400">{description}</div>}
      </div>
    </button>
  );
}
