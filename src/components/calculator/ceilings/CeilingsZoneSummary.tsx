import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS, CEILING_COLORS, LIGHTING_OPTIONS } from "./CeilingTypes";
import type { CeilingConfig } from "./CeilingTypes";
import { calcPrice, fmt } from "./ceilingUtils";
import CeilingConfigForm from "./CeilingConfigForm";

interface Props {
  activeZone: CeilingConfig;
  activeIndex: number;
  markupPct: number;
  onUpdate: (patch: Partial<Omit<CeilingConfig, "id">>) => void;
}

export default function CeilingsZoneSummary({ activeZone, activeIndex, markupPct, onUpdate }: Props) {
  const activeBase = calcPrice(activeZone);
  const activeMarkup = markupPct > 0 ? Math.round(activeBase * markupPct / 100) : 0;
  const activePrice = activeBase + activeMarkup;

  const ceilingType = CEILING_TYPES.find(t => t.value === activeZone.ceilingType);
  const ceilingLevel = CEILING_LEVELS.find(l => l.value === activeZone.level);
  const ceilingBrand = CEILING_BRANDS.find(b => b.id === activeZone.brandId);
  const ceilingColor = CEILING_COLORS.find(c => c.id === activeZone.colorId);
  const ceilingLighting = LIGHTING_OPTIONS.find(l => l.id === activeZone.lightingId);

  return (
    <div className="lg:col-span-3">
      <div className="sticky top-24 space-y-4">
        {/* Заголовок зоны */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
            {activeIndex + 1}
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {activeZone.roomName || `Помещение ${activeIndex + 1}`}
          </h2>
          <span className="text-sm text-gray-400 ml-1">— настройка потолка</span>
        </div>

        {/* Форма */}
        <Card className="p-5">
          <CeilingConfigForm cfg={activeZone} onUpdate={onUpdate} />
        </Card>

        {/* Мини-итог зоны */}
        <Card className="p-4 border-violet-200 bg-violet-50">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Стоимость зоны</p>
            {activeZone.area > 0 && (
              <span className="text-xs text-gray-400">{fmt(Math.round(activePrice / activeZone.area))} ₽/м²</span>
            )}
          </div>
          <div className="space-y-1 text-xs text-gray-600 mb-3">
            <div className="flex justify-between">
              <span>Тип</span><span className="font-medium text-gray-900">{ceilingType?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Уровни</span><span className="font-medium text-gray-900">{ceilingLevel?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Бренд</span><span className="font-medium text-gray-900">{ceilingBrand?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Цвет</span><span className="font-medium text-gray-900">{ceilingColor?.label}</span>
            </div>
            <div className="flex justify-between">
              <span>Площадь</span><span className="font-medium text-gray-900">{activeZone.area} м²</span>
            </div>
            <div className="flex justify-between">
              <span>Освещение</span>
              <span className="font-medium text-gray-900">
                {ceilingLighting?.id !== "none" ? `${ceilingLighting?.name} × ${activeZone.lightingCount}` : "Нет"}
              </span>
            </div>
          </div>
          <div className="border-t border-violet-200 pt-2 flex justify-between text-base font-bold text-violet-700">
            <span>Итого</span>
            <span>{fmt(activePrice)} ₽</span>
          </div>
          {markupPct > 0 && (
            <div className="flex justify-between text-xs text-orange-500 mt-1">
              <span>в т.ч. наценка {markupPct}%</span>
              <span>+{fmt(activeMarkup)} ₽</span>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
