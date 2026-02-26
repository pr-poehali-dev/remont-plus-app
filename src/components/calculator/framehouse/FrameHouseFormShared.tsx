import Icon from "@/components/ui/icon";
import type { Parameters } from "@/components/ui/icon";

interface SectionTitleProps {
  icon?: string;
  children: React.ReactNode;
}

export function SectionTitle({ icon, children }: SectionTitleProps) {
  return (
    <h3 className="flex items-center gap-2 text-sm font-bold text-gray-800 mt-5 mb-2 pt-4 border-t first:mt-0 first:pt-0 first:border-t-0">
      {icon && <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={15} className="text-green-600" />}
      {children}
    </h3>
  );
}

interface RadioOption<T extends string> {
  value: T;
  label: string;
  desc?: string;
  badge?: string;
}

interface RadioGroupProps<T extends string> {
  options: RadioOption<T>[];
  value: T;
  onChange: (v: T) => void;
  columns?: 1 | 2 | 3;
}

export function RadioGroup<T extends string>({ options, value, onChange, columns = 1 }: RadioGroupProps<T>) {
  const colClass = columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1";
  return (
    <div className={`grid ${colClass} gap-1.5`}>
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`text-left rounded-xl border-2 px-3 py-2 transition-all ${
            value === opt.value
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-green-300 bg-white"
          }`}
        >
          <div className="flex items-center justify-between gap-1">
            <span className={`text-sm font-medium leading-tight ${value === opt.value ? "text-green-800" : "text-gray-700"}`}>
              {opt.label}
            </span>
            {opt.badge && (
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-md shrink-0">{opt.badge}</span>
            )}
          </div>
          {opt.desc && (
            <div className="text-xs text-gray-500 mt-0.5 leading-snug">{opt.desc}</div>
          )}
        </button>
      ))}
    </div>
  );
}
