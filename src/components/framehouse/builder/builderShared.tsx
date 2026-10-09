import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function formatMoney(n: number): string {
  return new Intl.NumberFormat("ru-RU").format(Math.round(n));
}

export function NumberField({
  label,
  value,
  onChange,
  step = 100,
  min = 0,
  suffix = "мм",
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
  min?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-slate-600 dark:text-slate-400">{label}</Label>
      <div className="relative">
        <Input
          type="number"
          value={value}
          step={step}
          min={min}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="pr-12"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
          {suffix}
        </span>
      </div>
    </div>
  );
}
