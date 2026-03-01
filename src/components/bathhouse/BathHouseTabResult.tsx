import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { REGIONS } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseBreakdown } from "@/components/calculator/bathhouse/bathHousePricing";
import { fmt, calcBathHouseMaterials } from "@/components/calculator/bathhouse/bathHouseUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import BathHouseBreakdownCard from "./BathHouseBreakdownCard";
import BathHouseExportPanel from "./BathHouseExportPanel";
import type { ExportState } from "./BathHouseExportPanel";

interface Props {
  config: BathHouseConfig;
  bd: BathHouseBreakdown;
  regionId: string;
  markupPct: number;
  exportState: ExportState;
  onExportChange: (patch: Partial<ExportState>) => void;
  onPrint: () => void;
  onFindMasters: () => void;
}

export default function BathHouseTabResult({
  config, bd, regionId, markupPct,
  exportState, onExportChange, onPrint, onFindMasters,
}: Props) {
  const matItems = calcBathHouseMaterials(config, bd, regionId);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
      {/* Детализация */}
      <div className="space-y-4">
        <BathHouseBreakdownCard config={config} bd={bd} regionId={regionId} markupPct={markupPct} />

        <MaterialsTable items={matItems} accentColor="amber" />

        <CalcOrderForm calcType="Баня" total={`от ${fmt(bd.total)} ₽`} />

        <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
          <h3 className="font-bold text-amber-900 mb-2">Получить предложения от строителей</h3>
          <p className="text-sm text-gray-600 mb-4">
            Партнёры вашего региона пришлют конкретные предложения с готовой сметой. Сравните и выберите лучшее.
          </p>
          <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={onFindMasters}>
            <Icon name="HardHat" size={15} className="mr-2" />
            Найти строителей бани
          </Button>
        </Card>
      </div>

      {/* Правая панель */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <BathHouseExportPanel exportState={exportState} onExportChange={onExportChange} onPrint={onPrint} />
        </Card>

        {/* Рекомендации */}
        <Card className="p-4 space-y-2.5">
          <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
            <Icon name="Lightbulb" size={14} className="text-amber-500" />
            Рекомендации
          </h3>
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
            <div className="text-xs font-bold text-orange-700 mb-1">🔥 Печь</div>
            <p className="text-xs text-gray-600 leading-relaxed">{bd.stoveRecommendation}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
            <div className="text-xs font-bold text-blue-700 mb-1">💨 Вентиляция</div>
            <p className="text-xs text-gray-600 leading-relaxed">{bd.ventRecommendation}</p>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
            <div className="text-xs font-bold text-amber-700 mb-1">🛖 Полок</div>
            <p className="text-xs text-gray-600 leading-relaxed">{bd.shelfRecommendation}</p>
          </div>
        </Card>

        {/* Что влияет на цену */}
        <Card className="p-4">
          <h3 className="font-bold text-sm text-gray-800 mb-3">Что больше всего влияет на цену</h3>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              ["🪵", "Материал стен — разница до 3× (каркас vs клееный брус)"],
              ["🏗", "Фундамент — сваи дешевле монолита на ~120 000 ₽"],
              ["🔥", "Кирпичная печь дороже металлической в 5–7 раз"],
              ["🌡", "Тёплый пол добавляет 8–15% к смете"],
              ["🪟", "Терраса и лишние окна: +10–25%"],
              ["🗺", `Ваш регион — коэффициент ×${REGIONS[regionId]?.coeff}`],
            ].map(([icon, text], i) => (
              <div key={i} className="flex gap-2">
                <span className="text-base leading-none shrink-0">{icon}</span>
                <span>{text}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
