import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  BATH_STYLES, WALL_MATERIALS, FOUNDATION_TYPES,
  ROOF_TYPES, STOVE_TYPES, VENTILATION_TYPES,
} from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseBreakdown } from "@/components/calculator/bathhouse/bathHouseUtils";
import { fmt } from "@/components/calculator/bathhouse/bathHouseUtils";
import BathHouseConfigForm from "@/components/calculator/bathhouse/BathHouseConfigForm";

interface Props {
  config: BathHouseConfig;
  bd: BathHouseBreakdown;
  onChange: (patch: Partial<BathHouseConfig>) => void;
  onOpenResult: () => void;
}

export default function BathHouseTabConfig({ config, bd, onChange, onOpenResult }: Props) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] gap-6">
      <Card className="p-4 md:p-6">
        <BathHouseConfigForm config={config} onChange={onChange} />
      </Card>

      {/* Боковая панель — конфигурация */}
      <div className="hidden lg:block">
        <div className="sticky top-14 space-y-4">
          <Card className="p-4 bg-amber-50 border-amber-200">
            <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
              <Icon name="Settings2" size={14} />
              Текущая конфигурация
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                ["🏠", "Стиль", BATH_STYLES[config.style]?.label],
                ["📏", "Площадь", `${config.totalArea} м² / высота ${config.wallHeight} м`],
                ["🪵", "Стены", WALL_MATERIALS[config.wallMaterial]?.label],
                ["🏗", "Фундамент", FOUNDATION_TYPES[config.foundation]?.label],
                ["🏠", "Крыша", ROOF_TYPES[config.roofType]?.label],
                ["🔥", "Печь", STOVE_TYPES[config.stoveType]?.label],
                ["💨", "Вентиляция", VENTILATION_TYPES[config.ventilation]?.label],
                ["📐", "Парная", `${config.steamRoomArea} м²`],
                ["🚿", "Мойка", `${config.washRoomArea} м²`],
                ["🛋", "Комната отдыха", `${config.restRoomArea} м²`],
              ].map(([emoji, label, val], i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="text-gray-500">{label}:</span>
                  <span className="text-gray-800 font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-amber-200">
              <div className="text-xs text-amber-800 font-semibold mb-1">Итого</div>
              <div className="text-2xl font-extrabold text-amber-700">{fmt(bd.total)} ₽</div>
              <div className="text-xs text-gray-500">{fmt(bd.total / Math.max(config.totalArea, 1))} ₽/м²</div>
            </div>

            <Button
              className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white text-sm"
              onClick={onOpenResult}
            >
              <Icon name="ClipboardList" size={14} className="mr-2" />
              Открыть смету
            </Button>
          </Card>

          {/* Рекомендации */}
          <Card className="p-4 space-y-2.5">
            <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
              <Icon name="Lightbulb" size={14} className="text-amber-500" />
              Рекомендации
            </h3>
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
              <div className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1"><span>🔥</span> Печь</div>
              <p className="text-xs text-gray-600 leading-relaxed">{bd.stoveRecommendation}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
              <div className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1"><span>💨</span> Вентиляция</div>
              <p className="text-xs text-gray-600 leading-relaxed">{bd.ventRecommendation}</p>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><span>🛖</span> Полок</div>
              <p className="text-xs text-gray-600 leading-relaxed">{bd.shelfRecommendation}</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
