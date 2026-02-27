import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import {
  HOUSE_STYLES, FRAME_WALL_TECHS, FOUNDATION_TYPES, ROOF_TYPES,
  FACADE_TYPES, HEATING_TYPES, INTERIOR_FINISHES,
} from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHouseUtils";
import { fmt } from "@/components/calculator/framehouse/frameHouseUtils";
import FrameHouseConfigForm from "@/components/calculator/framehouse/FrameHouseConfigForm";
import HouseStylePreview from "@/components/framehouse/HouseStylePreview";

interface Props {
  config: FrameHouseConfig;
  bd: FrameHouseBreakdown;
  onChange: (patch: Partial<FrameHouseConfig>) => void;
  onOpenResult: () => void;
}

export default function FrameHouseTabConfig({ config, bd, onChange, onOpenResult }: Props) {
  return (
    <div className="lg:grid lg:grid-cols-[1fr_380px] gap-6">
      <Card className="p-4 md:p-6">
        <FrameHouseConfigForm config={config} onChange={onChange} />
      </Card>

      {/* Боковая панель */}
      <div className="hidden lg:block">
        <div className="sticky top-14 space-y-4">
          <HouseStylePreview style={config.style} label={HOUSE_STYLES[config.style]?.label ?? ""} />

          <Card className="p-4 bg-green-50 border-green-200">
            <h3 className="font-bold text-green-900 text-sm mb-3 flex items-center gap-2">
              <Icon name="Settings2" size={14} />
              Текущая конфигурация
            </h3>
            <div className="space-y-1.5 text-xs">
              {[
                ["🏠", "Стиль", HOUSE_STYLES[config.style]?.label],
                ["📏", "Площадь", `${config.totalArea} м² / ${config.floors} эт.`],
                ["🏗", "Каркас", FRAME_WALL_TECHS[config.wallTech]?.label.split(" (")[0]],
                ["🏚", "Фундамент", FOUNDATION_TYPES[config.foundation]?.label.split(" (")[0]],
                ["🏡", "Крыша", ROOF_TYPES[config.roofType]?.label],
                ["🎨", "Фасад", FACADE_TYPES[config.facade]?.label.split(" (")[0]],
                ["🔥", "Отопление", HEATING_TYPES[config.heating]?.label.split(" (")[0]],
                ["🪟", "Окна", `${config.windowCount} шт.`],
                ["🛋", "Отделка", INTERIOR_FINISHES[config.interiorFinish]?.label],
              ].map(([emoji, label, val], i) => (
                <div key={i} className="flex gap-1.5">
                  <span className="text-base leading-none">{emoji}</span>
                  <span className="text-gray-500">{label}:</span>
                  <span className="text-gray-800 font-medium">{val}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-green-200">
              <div className="text-xs text-green-800 font-semibold mb-1">Итого</div>
              <div className="text-2xl font-extrabold text-green-700">{fmt(bd.total)} ₽</div>
              <div className="text-xs text-gray-500">{fmt(bd.total / Math.max(config.totalArea, 1))} ₽/м²</div>
              <div className="mt-2 grid grid-cols-2 gap-1.5 text-xs">
                <div className="bg-white rounded-lg px-2 py-1.5 text-center">
                  <div className="font-semibold text-gray-700">{fmt(bd.materialsCost)} ₽</div>
                  <div className="text-gray-400">Материалы</div>
                </div>
                <div className="bg-white rounded-lg px-2 py-1.5 text-center">
                  <div className="font-semibold text-gray-700">{fmt(bd.worksCost)} ₽</div>
                  <div className="text-gray-400">Работы</div>
                </div>
              </div>
            </div>

            <Button
              className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm"
              onClick={onOpenResult}
            >
              <Icon name="ClipboardList" size={14} className="mr-2" />
              Открыть смету
            </Button>
          </Card>

          {/* Рекомендации */}
          <Card className="p-4 border-blue-100">
            <h3 className="font-bold text-blue-900 text-sm mb-2 flex items-center gap-1.5">
              <Icon name="Lightbulb" size={14} />
              Советы по выбору
            </h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Каркасный дом строится в 2–3 раза быстрее кирпичного — под ключ за 3–6 месяцев</p>
              </div>
              <div className="flex gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Минвата 200 мм даёт теплопотери как у кирпичной стены 1,5 м — отопление дешевле на 40%</p>
              </div>
              <div className="flex gap-2">
                <span className="text-green-500 mt-0.5">✓</span>
                <p>Сваи винтовые — самый быстрый фундамент для каркасника, устанавливаются за 1 день</p>
              </div>
              <div className="flex gap-2">
                <span className="text-yellow-500 mt-0.5">!</span>
                <p>Газовый котёл — самое выгодное отопление при наличии газа на участке</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}