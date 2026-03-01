import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { REGIONS } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseBreakdown } from "@/components/calculator/bathhouse/bathHousePricing";
import { fmt } from "@/components/calculator/bathhouse/bathHouseUtils";

const BREAKDOWN_LABELS: { key: string; label: string; icon: string }[] = [
  { key: "foundation", label: "Фундамент", icon: "Building2" },
  { key: "walls", label: "Стены (коробка)", icon: "Layers" },
  { key: "roofStructure", label: "Кровельная конструкция", icon: "Home" },
  { key: "roofing", label: "Кровельный материал", icon: "CloudRain" },
  { key: "insulation", label: "Утепление", icon: "Wind" },
  { key: "wallFinishSteam", label: "Отделка парной", icon: "Paintbrush" },
  { key: "wallFinishWash", label: "Отделка мойки", icon: "Paintbrush" },
  { key: "wallFinishRest", label: "Отделка комнаты отдыха", icon: "Paintbrush" },
  { key: "floor", label: "Полы", icon: "Grid3x3" },
  { key: "stove", label: "Печь", icon: "Flame" },
  { key: "ventilation", label: "Вентиляция", icon: "AirVent" },
  { key: "shelves", label: "Полок", icon: "AlignVerticalJustifyCenter" },
  { key: "windows", label: "Окна", icon: "AppWindow" },
  { key: "chimney", label: "Дымоход", icon: "ChevronsUp" },
  { key: "tank", label: "Бак для воды", icon: "Droplets" },
  { key: "terrace", label: "Терраса", icon: "Trees" },
  { key: "electrical", label: "Электрика", icon: "Zap" },
  { key: "assembly", label: "Монтаж и работа", icon: "Wrench" },
];

interface Props {
  config: BathHouseConfig;
  bd: BathHouseBreakdown;
  regionId: string;
  markupPct: number;
}

export default function BathHouseBreakdownCard({ config, bd, regionId, markupPct }: Props) {
  const breakdownItems = BREAKDOWN_LABELS
    .map(({ key, label, icon }) => ({ label, icon, key, value: (bd as Record<string, number>)[key] ?? 0 }))
    .filter(i => i.value > 0);

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-gray-900 flex items-center gap-2">
          <Icon name="ClipboardList" size={16} className="text-amber-600" />
          Детализация сметы
        </h2>
        <span className="text-xs text-gray-400">{REGIONS[regionId]?.label}</span>
      </div>

      <div className="space-y-0.5">
        {breakdownItems.map((item, i) => (
          <div
            key={i}
            className={`flex items-center justify-between py-2 px-3 rounded-lg ${
              item.key === "assembly" ? "bg-amber-50 font-semibold" : "hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={13} className="text-gray-400 shrink-0" />
              <span className="text-sm text-gray-700">{item.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-800 tabular-nums">{fmt(item.value)} ₽</span>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
        <div className="flex justify-between text-sm text-gray-500">
          <span>Материалы + монтаж</span>
          <span className="tabular-nums">{fmt(bd.subtotal / bd.regionCoeff)} ₽</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400">
          <span>Региональный коэффициент ×{bd.regionCoeff} ({REGIONS[regionId]?.label})</span>
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>С учётом региона</span>
          <span className="tabular-nums">{fmt(bd.subtotal)} ₽</span>
        </div>
        {markupPct > 0 && (
          <div className="flex justify-between text-sm text-orange-600">
            <span>Наценка {markupPct}%</span>
            <span className="tabular-nums">+ {fmt(bd.markupAmount)} ₽</span>
          </div>
        )}
        <div className="flex justify-between text-xl font-extrabold text-amber-700 pt-2 border-t-2 border-amber-200">
          <span>ИТОГО</span>
          <span className="tabular-nums">{fmt(bd.total)} ₽</span>
        </div>
        <div className="text-center text-xs text-gray-400">
          {fmt(bd.total / Math.max(config.totalArea, 1))} ₽ за 1 м² · площадь {config.totalArea} м²
        </div>
      </div>

      <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
        * Ориентировочный расчёт. Точная стоимость зависит от типа грунта, особенностей проекта, сезона и подрядчика. Для точной сметы обратитесь к партнёрам АВАНГАРД.
      </p>
    </Card>
  );
}
