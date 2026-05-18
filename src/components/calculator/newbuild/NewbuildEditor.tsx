import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { ROOM_TYPES, RENOVATION_LEVELS, FLOORING_TYPES } from "@/components/calculator/newbuild/NewbuildTypes";
import type { NewbuildConfig } from "@/components/calculator/newbuild/NewbuildTypes";
import { calcNewbuildPrice, calcNewbuildMaterials, fmt } from "@/components/calculator/newbuild/newbuildUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import NewbuildConfigForm from "@/components/calculator/newbuild/NewbuildConfigForm";
import NewbuildLevelCompare from "@/components/calculator/newbuild/NewbuildLevelCompare";
import CalcResultCTA from "@/components/calculator/CalcResultCTA";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import SimilarProjects from "@/components/calculator/SimilarProjects";

interface ProjectTotals {
  total: number;
  worksTotal: number;
  materialsTotal: number;
  foremanCost: number;
  supplierCost: number;
}

interface Props {
  zones: NewbuildConfig[];
  activeZone: NewbuildConfig;
  activeId: string;
  regionId: string;
  markupPct: number;
  totalSum: number;
  projectTotals: ProjectTotals;
  foremanIncluded: boolean;
  foremanPct: number;
  supplierIncluded: boolean;
  supplierPct: number;
  onUpdateZone: (patch: Partial<Omit<NewbuildConfig, "id">>) => void;
  onForemanIncludedChange: (v: boolean) => void;
  onForemanPctChange: (v: number) => void;
  onSupplierIncludedChange: (v: boolean) => void;
  onSupplierPctChange: (v: number) => void;
  orderFormRef: { current: HTMLDivElement | null };
}

export default function NewbuildEditor({
  zones,
  activeZone,
  activeId,
  regionId,
  markupPct,
  totalSum,
  projectTotals,
  foremanIncluded,
  foremanPct,
  supplierIncluded,
  supplierPct,
  onUpdateZone,
  onForemanIncludedChange,
  onForemanPctChange,
  onSupplierIncludedChange,
  onSupplierPctChange,
  orderFormRef,
}: Props) {
  const activeBreakdown = calcNewbuildPrice(activeZone, regionId, markupPct);
  const activeRoomType = ROOM_TYPES.find(r => r.id === activeZone.roomType);
  const activeLevel = RENOVATION_LEVELS.find(l => l.id === activeZone.renovationLevel);
  const activeFlooringType = FLOORING_TYPES.find(f => f.id === activeZone.flooringType);

  return (
    <div className="lg:col-span-3">
      <div className="sticky top-24 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
            {zones.findIndex(z => z.id === activeId) + 1}
          </div>
          <h2 className="text-base font-bold text-gray-900">
            {activeZone.roomName || `Помещение ${zones.findIndex(z => z.id === activeId) + 1}`}
          </h2>
          <span className="text-sm text-gray-400 ml-1">— настройка ремонта</span>
        </div>

        <Card className="p-5">
          <NewbuildConfigForm cfg={activeZone} onUpdate={onUpdateZone} regionId={regionId} markupPct={markupPct} />
        </Card>

        <div className="mt-4">
          <NewbuildLevelCompare
            currentLevel={activeZone.renovationLevel}
            area={activeZone.area}
            regionId={regionId}
            onSelect={(levelId) => onUpdateZone({ renovationLevel: levelId })}
          />
        </div>

        {/* Детализация */}
        <Card className="p-4 border-orange-200 bg-orange-50">
          <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Receipt" size={13} />
            Детализация стоимости
          </p>

          <div className="flex gap-2 mb-3 pb-3 border-b border-orange-200">
            <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
              <Icon name={activeRoomType?.icon as Parameters<typeof Icon>[0]["name"] ?? "Home"} size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900">
                {activeRoomType?.label} · {activeLevel?.label}
              </p>
              <p className="text-xs text-gray-500">
                {activeZone.area} м² · потолок {activeZone.ceilingHeightM} м
              </p>
            </div>
            {activeFlooringType && (
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500">Пол</p>
                <p className="text-xs font-semibold text-gray-700">{activeFlooringType.label}</p>
              </div>
            )}
          </div>

          <div className="space-y-1.5 text-sm">
            {activeBreakdown.screedCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Стяжка пола</span>
                <span className="font-medium">{fmt(activeBreakdown.screedCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.plasterCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Штукатурка стен</span>
                <span className="font-medium">{fmt(activeBreakdown.plasterCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.ceilingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Отделка потолка</span>
                <span className="font-medium">{fmt(activeBreakdown.ceilingCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.paintCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Малярные работы</span>
                <span className="font-medium">{fmt(activeBreakdown.paintCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.flooringCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Напольное покрытие</span>
                <span className="font-medium">{fmt(activeBreakdown.flooringCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.electricsCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Электромонтаж</span>
                <span className="font-medium">{fmt(activeBreakdown.electricsCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.doorsCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Двери ({activeZone.doorsCount} шт.)</span>
                <span className="font-medium">{fmt(activeBreakdown.doorsCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.windowSlopesCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Откосы окон</span>
                <span className="font-medium">{fmt(activeBreakdown.windowSlopesCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.heatedFloorCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Тёплый пол</span>
                <span className="font-medium">{fmt(activeBreakdown.heatedFloorCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.backsplashCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Кухонный фартук</span>
                <span className="font-medium">{fmt(activeBreakdown.backsplashCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.countertopCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Столешница</span>
                <span className="font-medium">{fmt(activeBreakdown.countertopCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.conditionerCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Кондиционирование</span>
                <span className="font-medium">{fmt(activeBreakdown.conditionerCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.soundproofCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Шумоизоляция</span>
                <span className="font-medium">{fmt(activeBreakdown.soundproofCost)} ₽</span>
              </div>
            )}
            {activeBreakdown.plumbingCost > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Сантехника</span>
                <span className="font-medium">{fmt(activeBreakdown.plumbingCost)} ₽</span>
              </div>
            )}

            <div className="border-t border-orange-200 pt-1.5 mt-1.5 space-y-1">
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Уровень ×{activeBreakdown.levelCoeff} · Регион ×{activeBreakdown.regionCoeff}</span>
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

            <div className="flex justify-between text-base font-bold text-orange-700 pt-1">
              <span>ИТОГО</span>
              <span>{fmt(activeBreakdown.total)} ₽</span>
            </div>
            {activeZone.area > 0 && (
              <p className="text-xs text-gray-400 text-right">
                {fmt(Math.round(activeBreakdown.total / activeZone.area))} ₽/м²
              </p>
            )}
          </div>
        </Card>

        {/* Ведомость материалов */}
        <MaterialsTable
          items={calcNewbuildMaterials(activeZone, activeBreakdown, regionId)}
          accentColor="indigo"
        />

        <CalcResultCTA
          totalSum={totalSum}
          onAction={() => orderFormRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })}
        />

        <div ref={el => { orderFormRef.current = el; }}>
          <CalcOrderForm
            calcType="Новостройка"
            total={`от ${fmt(totalSum)} ₽`}
          />
        </div>

        <SimilarProjects totalSum={totalSum} calcType="newbuild" />

        {/* Управление объектом — один раз на весь объект */}
        <Card className="p-4 border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="HardHat" size={13} />
            Управление объектом
          </p>
          <div className="space-y-2">
            <label className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-orange-300"
              style={{ borderColor: foremanIncluded ? "#f97316" : "", background: foremanIncluded ? "#fff7ed" : "" }}>
              <input type="checkbox" checked={foremanIncluded} onChange={e => onForemanIncludedChange(e.target.checked)} className="accent-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Прораб</p>
                <p className="text-xs text-gray-500">% от всей суммы работ + материалов</p>
              </div>
              {foremanIncluded && (
                <div className="flex items-center gap-1.5">
                  <Input type="number" min={1} max={50} value={foremanPct}
                    onChange={e => onForemanPctChange(Math.max(1, Math.min(50, parseFloat(e.target.value) || 10)))}
                    className="w-16 h-8 text-sm text-center" />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              )}
            </label>
            <label className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-orange-300"
              style={{ borderColor: supplierIncluded ? "#f97316" : "", background: supplierIncluded ? "#fff7ed" : "" }}>
              <input type="checkbox" checked={supplierIncluded} onChange={e => onSupplierIncludedChange(e.target.checked)} className="accent-orange-500" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Снабженец</p>
                <p className="text-xs text-gray-500">% от суммы материалов ({fmt(projectTotals.materialsTotal)} ₽)</p>
              </div>
              {supplierIncluded && (
                <div className="flex items-center gap-1.5">
                  <Input type="number" min={1} max={30} value={supplierPct}
                    onChange={e => onSupplierPctChange(Math.max(1, Math.min(30, parseFloat(e.target.value) || 5)))}
                    className="w-16 h-8 text-sm text-center" />
                  <span className="text-xs text-gray-400">%</span>
                </div>
              )}
            </label>
            {(foremanIncluded || supplierIncluded) && (
              <div className="pt-2 border-t border-gray-100 space-y-1 text-sm">
                {foremanIncluded && (
                  <div className="flex justify-between text-gray-700">
                    <span>Прораб {foremanPct}%</span>
                    <span className="font-medium">+ {fmt(projectTotals.foremanCost)} ₽</span>
                  </div>
                )}
                {supplierIncluded && (
                  <div className="flex justify-between text-gray-700">
                    <span>Снабженец {supplierPct}%</span>
                    <span className="font-medium">+ {fmt(projectTotals.supplierCost)} ₽</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
