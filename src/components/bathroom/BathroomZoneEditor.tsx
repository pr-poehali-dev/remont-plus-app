import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import { BATHROOM_TYPES } from "@/components/calculator/bathroom/BathroomTypes";
import type { BathroomConfig } from "@/components/calculator/bathroom/BathroomTypes";
import type { BathroomPriceBreakdown } from "@/components/calculator/bathroom/bathroomUtils";
import { fmt, calcBathroomMaterials } from "@/components/calculator/bathroom/bathroomUtils";
import BathroomConfigForm from "@/components/calculator/bathroom/BathroomConfigForm";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";

interface Props {
  activeZone: BathroomConfig;
  activeIndex: number;
  activeBreakdown: BathroomPriceBreakdown;
  markupPct: number;
  regionId: string;
  onUpdateZone: (patch: Partial<Omit<BathroomConfig, "id">>) => void;
}

export default function BathroomZoneEditor({
  activeZone,
  activeIndex,
  activeBreakdown,
  markupPct,
  regionId,
  onUpdateZone,
}: Props) {
  const activeBathroomType = BATHROOM_TYPES.find(b => b.id === activeZone.bathroomType);

  return (
    <div className="lg:col-span-3">
      <div className="sticky top-24 space-y-4">
        {/* Заголовок */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
            {activeIndex + 1}
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {activeZone.roomName || `Санузел ${activeIndex + 1}`}
          </h2>
          <span className="text-sm text-gray-400 ml-1">— ремонт</span>
        </div>

        {/* Форма */}
        <Card className="p-5">
          <BathroomConfigForm cfg={activeZone} onUpdate={onUpdateZone} />
        </Card>

        {/* Детализация стоимости */}
        <Card className="p-4 border-teal-200 bg-teal-50">
          <p className="text-xs font-semibold text-teal-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Receipt" size={13} />
            Детализация стоимости
          </p>

          <div className="flex gap-2 mb-3 pb-3 border-b border-teal-200">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Icon name={activeBathroomType?.icon as Parameters<typeof Icon>[0]["name"] ?? "Bath"} size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">{activeBathroomType?.label ?? "Санузел"}</p>
              <p className="text-xs text-gray-500">{activeZone.area} м² пол · {activeZone.wallArea} м² стены</p>
            </div>
          </div>

          <div className="space-y-1.5 text-sm">
            {activeBreakdown.demolitionCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Демонтаж</span>
                <span className="font-medium">{fmt(activeBreakdown.demolitionCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.screedCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Стяжка</span>
                <span className="font-medium">{fmt(activeBreakdown.screedCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.waterproofingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Гидроизоляция</span>
                <span className="font-medium">{fmt(activeBreakdown.waterproofingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.floorTileCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Плитка пола</span>
                <span className="font-medium">{fmt(activeBreakdown.floorTileCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.wallTileCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Плитка стен</span>
                <span className="font-medium">{fmt(activeBreakdown.wallTileCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.plumbingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Сантехника</span>
                <span className="font-medium">{fmt(activeBreakdown.plumbingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.heatedFloorCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Тёплый пол</span>
                <span className="font-medium">{fmt(activeBreakdown.heatedFloorCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.ventilationCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Вентиляция</span>
                <span className="font-medium">{fmt(activeBreakdown.ventilationCost)} ₽</span>
              </div>
            )}
            {(activeBreakdown.furnitureCost + activeBreakdown.accessoriesCost) > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Мебель и аксессуары</span>
                <span className="font-medium">{fmt(activeBreakdown.furnitureCost + activeBreakdown.accessoriesCost)} ₽</span>
              </div>
            )}

            <div className="border-t border-teal-200 pt-1.5 mt-1.5 space-y-1">
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Регион × {activeBreakdown.regionCoeff}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Работы</span>
                <span className="font-medium">{fmt(activeBreakdown.subtotal - activeBreakdown.materialsCost)} ₽</span>
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

            <div className="flex justify-between text-base font-bold text-teal-700 pt-1">
              <span>ИТОГО</span>
              <span>{fmt(activeBreakdown.total)} ₽</span>
            </div>
          </div>
        </Card>

        {/* Ведомость материалов */}
        <MaterialsTable
          items={calcBathroomMaterials(activeZone, activeBreakdown, regionId)}
          accentColor="teal"
        />
      </div>
    </div>
  );
}