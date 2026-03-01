import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { ROOM_TYPES } from "@/components/calculator/electrics/ElectricsTypes";
import type { ElectricsConfig } from "@/components/calculator/electrics/ElectricsTypes";
import { calcElectricsPrice, calcElectricsMaterials, fmt } from "@/components/calculator/electrics/electricsUtils";
import ElectricsConfigForm from "@/components/calculator/electrics/ElectricsConfigForm";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";

interface Props {
  activeZone: ElectricsConfig;
  activeIndex: number;
  regionId: string;
  markupPct: number;
  onUpdate: (patch: Partial<Omit<ElectricsConfig, "id">>) => void;
}

export default function ElectricsZoneEditor({ activeZone, activeIndex, regionId, markupPct, onUpdate }: Props) {
  const activeBreakdown = calcElectricsPrice(activeZone, regionId, markupPct);
  const activeRoomType = ROOM_TYPES.find(r => r.value === activeZone.roomType);

  return (
    <div className="lg:col-span-3">
      <div className="sticky top-24 space-y-4">
        {/* Заголовок */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            {activeIndex + 1}
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {activeZone.roomName || `Помещение ${activeIndex + 1}`}
          </h2>
          <span className="text-sm text-gray-400 ml-1">— электромонтаж</span>
        </div>

        {/* Форма */}
        <Card className="p-5">
          <ElectricsConfigForm cfg={activeZone} onUpdate={onUpdate} />
        </Card>

        {/* Детализация стоимости */}
        <Card className="p-4 border-blue-200 bg-blue-50">
          <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Receipt" size={13} />
            Детализация стоимости
          </p>

          <div className="flex gap-2 mb-3 pb-3 border-b border-blue-200">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Icon name={activeRoomType?.icon as Parameters<typeof Icon>[0]["name"] ?? "Home"} size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{activeRoomType?.label ?? "Помещение"}</p>
              <p className="text-xs text-gray-500">{activeZone.area} м² · {activeRoomType?.description}</p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            {activeBreakdown.outletsCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Розетки и выключатели</span>
                <span className="font-medium">{fmt(activeBreakdown.outletsCost + activeBreakdown.switchesCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.lightingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Освещение</span>
                <span className="font-medium">{fmt(activeBreakdown.lightingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.cablingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Прокладка кабеля</span>
                <span className="font-medium">{fmt(activeBreakdown.cablingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.panelCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Электрощиток</span>
                <span className="font-medium">{fmt(activeBreakdown.panelCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.groundingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Заземление</span>
                <span className="font-medium">{fmt(activeBreakdown.groundingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.testingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Тестирование</span>
                <span className="font-medium">{fmt(activeBreakdown.testingCost)} ₽</span>
              </div>
            )}

            <div className="border-t border-blue-200 pt-1.5 mt-1.5 space-y-1">
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Регион × {activeBreakdown.regionCoeff}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Работы</span>
                <span className="font-medium">{fmt(activeBreakdown.worksCost)} ₽</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Материалы</span>
                <span className="font-medium">{fmt(activeBreakdown.materialsCost)} ₽</span>
              </div>
              {markupPct > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Наценка {markupPct}%</span>
                  <span>+ {fmt(activeBreakdown.markupAmount)} ₽</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-base font-bold text-blue-700 pt-1">
              <span>ИТОГО</span>
              <span>{fmt(activeBreakdown.total)} ₽</span>
            </div>
          </div>
        </Card>

        {/* Ведомость материалов */}
        <MaterialsTable
          items={calcElectricsMaterials(activeZone, activeBreakdown, regionId)}
          accentColor="blue"
        />
      </div>
    </div>
  );
}
