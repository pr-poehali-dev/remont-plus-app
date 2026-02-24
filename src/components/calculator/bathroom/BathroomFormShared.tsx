import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";

export function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        checked ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-200"
      }`}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={v => onChange(!!v)}
        className="mt-0.5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
        onClick={e => e.stopPropagation()}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          <Icon name="Minus" size={12} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          <Icon name="Plus" size={12} />
        </button>
      </div>
    </div>
  );
}
