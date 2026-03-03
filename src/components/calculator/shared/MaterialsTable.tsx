import Icon from "@/components/ui/icon";

export interface MaterialItem {
  name: string;
  spec?: string;      // характеристика (марка, класс, толщина)
  unit: string;       // ед. изм.
  qty: number;        // количество
  pricePerUnit: number;
  total: number;
  isConsumable?: boolean; // расходник
  isWork?: boolean;       // работа, а не материал
}

interface Props {
  items: MaterialItem[];
  accentColor?: string; // tailwind border/text color class, напр. "teal"
}

const COLORS: Record<string, { border: string; bg: string; text: string; badge: string; badgeText: string }> = {
  teal:   { border: "border-teal-200",  bg: "bg-teal-50",  text: "text-teal-700",  badge: "bg-teal-100",  badgeText: "text-teal-700"  },
  amber:  { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-700", badge: "bg-amber-100", badgeText: "text-amber-700" },
  blue:   { border: "border-blue-200",  bg: "bg-blue-50",  text: "text-blue-700",  badge: "bg-blue-100",  badgeText: "text-blue-700"  },
  indigo: { border: "border-indigo-200",bg: "bg-indigo-50",text: "text-indigo-700",badge: "bg-indigo-100",badgeText: "text-indigo-700"},
  violet: { border: "border-violet-200",bg: "bg-violet-50",text: "text-violet-700",badge: "bg-violet-100",badgeText: "text-violet-700"},
  green:  { border: "border-green-200", bg: "bg-green-50", text: "text-green-700", badge: "bg-green-100", badgeText: "text-green-700" },
};

function fmtN(n: number) {
  if (Number.isInteger(n)) return n.toLocaleString("ru-RU");
  return n.toLocaleString("ru-RU", { maximumFractionDigits: 2 });
}
function fmtRub(n: number) {
  return Math.round(n).toLocaleString("ru-RU");
}

export default function MaterialsTable({ items, accentColor = "teal" }: Props) {
  const c = COLORS[accentColor] ?? COLORS.teal;

  const materials   = items.filter(i => !i.isWork && !i.isConsumable);
  const consumables = items.filter(i => i.isConsumable);
  const works       = items.filter(i => i.isWork);

  const renderSection = (rows: MaterialItem[], label: string, icon: string) => {
    if (!rows.length) return null;
    return (
      <div className="mb-3">
        <p className={`text-[10px] font-bold uppercase tracking-widest mb-1.5 flex items-center gap-1 ${c.text} opacity-70`}>
          <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={10} />
          {label}
        </p>
        <div className="space-y-1">
          {rows.map((item, i) => (
            <div key={i} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-2 items-center text-xs">
              <div className="min-w-0">
                <span className="text-gray-800 font-medium leading-tight">{item.name}</span>
                {item.spec && <span className="text-gray-400 ml-1">· {item.spec}</span>}
              </div>
              <span className="text-gray-400 text-right whitespace-nowrap">{fmtN(item.qty)} {item.unit}</span>
              <span className="text-gray-400 text-right whitespace-nowrap">{fmtRub(item.pricePerUnit)} ₽/{item.unit}</span>
              <span className="text-gray-700 font-semibold text-right whitespace-nowrap">{fmtRub(item.total)} ₽</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`rounded-xl border ${c.border} ${c.bg} p-4`}>
      <p className={`text-xs font-semibold uppercase tracking-wide mb-3 flex items-center gap-2 ${c.text}`}>
        <Icon name="PackageOpen" size={13} />
        Ведомость материалов и работ
      </p>

      {renderSection(materials,   "Материалы",  "Layers")}
      {renderSection(consumables, "Расходники", "FlaskConical")}
      {renderSection(works,       "Работы",     "Hammer")}

      {consumables.length > 0 && (
        <div className={`border-t ${c.border} pt-2 mt-1 mb-1 grid grid-cols-[1fr_auto_auto_auto] gap-x-2 text-xs text-gray-400`}>
          <span>Расходники (справочно, входят в смету)</span>
          <span></span>
          <span></span>
          <span>{fmtRub(consumables.reduce((s, i) => s + i.total, 0))} ₽</span>
        </div>
      )}
      <div className={`border-t ${c.border} pt-2 mt-2 grid grid-cols-[1fr_auto_auto_auto] gap-x-2 text-xs font-bold ${c.text}`}>
        <span>ИТОГО (материалы + работы)</span>
        <span></span>
        <span></span>
        <span>{fmtRub(items.filter(i => !i.isConsumable).reduce((s, i) => s + i.total, 0))} ₽</span>
      </div>
    </div>
  );
}