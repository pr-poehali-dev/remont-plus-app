import { Card } from "@/components/ui/card";
import { FLOORING_PRODUCTS, FLOORING_CATEGORIES } from "@/components/calculator/flooring/FlooringTypes";
import type { FlooringConfig } from "@/components/calculator/flooring/FlooringTypes";
import { calcFlooringPrice, calcFlooringMaterials, fmt } from "@/components/calculator/flooring/flooringUtils";
import FlooringConfigForm from "@/components/calculator/flooring/FlooringConfigForm";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";

interface Props {
  activeZone: FlooringConfig;
  activeIndex: number;
  regionId: string;
  markupPct: number;
  onUpdate: (patch: Partial<Omit<FlooringConfig, "id">>) => void;
}

export default function FlooringZoneEditor({ activeZone, activeIndex, regionId, markupPct, onUpdate }: Props) {
  const activeBreakdown = calcFlooringPrice(activeZone, regionId, markupPct);
  const activeCat = FLOORING_CATEGORIES.find(c => {
    const prod = FLOORING_PRODUCTS.find(p => p.id === activeZone.productId);
    return prod?.category === c.value;
  });
  const activeProduct = FLOORING_PRODUCTS.find(p => p.id === activeZone.productId);

  return (
    <div className="lg:col-span-3">
      <div className="sticky top-24 space-y-4">
        {/* Заголовок */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
            {activeIndex + 1}
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {activeZone.roomName || `Помещение ${activeIndex + 1}`}
          </h2>
          <span className="text-sm text-gray-400 ml-1">— настройка покрытия</span>
        </div>

        {/* Форма */}
        <Card className="p-5">
          <FlooringConfigForm cfg={activeZone} onUpdate={onUpdate} />
        </Card>

        {/* Детализация стоимости */}
        <Card className="p-4 border-amber-200 bg-amber-50">
          <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Детализация стоимости</p>

          {activeProduct && (
            <div className="flex gap-3 mb-3 pb-3 border-b border-amber-200">
              <img src={activeProduct.image} alt={activeProduct.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
              <div>
                <p className="text-xs text-gray-500">{activeProduct.brand}</p>
                <p className="text-sm font-bold text-gray-900">{activeProduct.name}</p>
                <p className="text-xs text-gray-400">{activeCat?.label} · {activeProduct.wear}</p>
              </div>
            </div>
          )}

          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Материал ({activeBreakdown.materialQty} м²)</span>
              <span className="font-medium text-gray-900">{fmt(activeBreakdown.materialCost)} ₽</span>
            </div>
            {activeBreakdown.substrateCost > 0 && (
              <div className="flex justify-between">
                <span>Подложка</span>
                <span className="font-medium text-gray-900">{fmt(activeBreakdown.substrateCost)} ₽</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Монтаж</span>
              <span className="font-medium text-gray-900">{fmt(activeBreakdown.installCost)} ₽</span>
            </div>
            {activeBreakdown.skirtingCost > 0 && (
              <div className="flex justify-between">
                <span>Плинтус ({activeZone.perimeter} м)</span>
                <span className="font-medium text-gray-900">{fmt(activeBreakdown.skirtingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.demolitionCost > 0 && (
              <div className="flex justify-between">
                <span>Демонтаж</span>
                <span className="font-medium text-gray-900">{fmt(activeBreakdown.demolitionCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.levelingCost > 0 && (
              <div className="flex justify-between">
                <span>Стяжка {activeZone.levelingThicknessMm} мм</span>
                <span className="font-medium text-gray-900">{fmt(activeBreakdown.levelingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.thresholdCost > 0 && (
              <div className="flex justify-between">
                <span>Порожки × {activeZone.thresholdCount}</span>
                <span className="font-medium text-gray-900">{fmt(activeBreakdown.thresholdCost)} ₽</span>
              </div>
            )}
          </div>

          <div className="border-t border-amber-200 pt-2 mt-3 space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Работы</span>
              <span className="font-medium">{fmt(activeBreakdown.worksCost)} ₽</span>
            </div>
            <div className="flex justify-between text-xs text-gray-600">
              <span>Материалы</span>
              <span className="font-medium">{fmt(activeBreakdown.materialsCost)} ₽</span>
            </div>
            {markupPct > 0 && (
              <div className="flex justify-between text-xs text-orange-500">
                <span>в т.ч. наценка {markupPct}%</span>
                <span>+{fmt(Math.round(activeBreakdown.total - activeBreakdown.total / (1 + markupPct / 100)))} ₽</span>
              </div>
            )}
          </div>
          <div className="flex justify-between text-base font-bold text-amber-700 pt-1">
            <span>Итого</span>
            <span>{fmt(activeBreakdown.total)} ₽</span>
          </div>
          {activeZone.area > 0 && (
            <div className="flex justify-between text-xs text-gray-400 mt-0.5">
              <span>Удельная стоимость</span>
              <span>{fmt(activeBreakdown.pricePerM2)} ₽/м²</span>
            </div>
          )}
        </Card>

        {/* Ведомость материалов */}
        <MaterialsTable
          items={calcFlooringMaterials(activeZone, activeBreakdown, regionId)}
          accentColor="amber"
        />
      </div>
    </div>
  );
}
