import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseBreakdown } from "@/components/calculator/framehouse/frameHousePricing";
import { fmt, calcFrameHouseMaterials } from "@/components/calculator/framehouse/frameHouseUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import FrameHouseBreakdownCard from "./FrameHouseBreakdownCard";
import FrameHouseExportPanel from "./FrameHouseExportPanel";
import type { FrameExportState } from "./FrameHouseExportPanel";

// Реэкспорт для обратной совместимости с BathHouse.tsx (ExportState)
export type { FrameExportState as ExportState };

interface Props {
  config: FrameHouseConfig;
  bd: FrameHouseBreakdown;
  regionId: string;
  markupPct: number;
  exportState: FrameExportState;
  onExportChange: (patch: Partial<FrameExportState>) => void;
  onPrint: () => void;
  onFindMasters: () => void;
}

export default function FrameHouseTabResult({
  config, bd, regionId, markupPct, exportState, onExportChange, onPrint, onFindMasters,
}: Props) {
  const matItems = calcFrameHouseMaterials(config, bd, regionId);

  return (
    <div className="lg:grid lg:grid-cols-[1fr_360px] gap-6">
      {/* Смета */}
      <div className="space-y-4">
        <FrameHouseBreakdownCard config={config} bd={bd} regionId={regionId} markupPct={markupPct} />

        <MaterialsTable items={matItems} accentColor="green" />

        <CalcOrderForm calcType="Каркасный дом" total={`от ${fmt(bd.total)} ₽`} />

        <Card className="p-4 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50">
          <h3 className="font-bold text-green-900 text-sm mb-1">Найти строителей каркасных домов</h3>
          <p className="text-xs text-gray-600 mb-3">
            Получите предложения от проверенных бригад в вашем регионе — сравните цены и отзывы
          </p>
          <Button onClick={onFindMasters} className="bg-green-600 hover:bg-green-700 text-white text-sm">
            <Icon name="Users" size={14} className="mr-2" />
            Найти мастеров
          </Button>
        </Card>
      </div>

      {/* Правая панель */}
      <div className="space-y-4">
        <Card className="overflow-hidden">
          <FrameHouseExportPanel exportState={exportState} onExportChange={onExportChange} onPrint={onPrint} />
        </Card>

        {/* Что влияет на цену */}
        <Card className="p-4 border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="TrendingUp" size={14} />
            Что влияет на цену
          </h3>
          <div className="space-y-2 text-xs text-gray-600">
            {[
              ["Площадь дома",      "Основной фактор — каждый м² увеличивает смету пропорционально"],
              ["Технология каркаса","SIP дороже OSB на 30-40%, но ускоряет монтаж"],
              ["Тип фундамента",    "Монолитная плита в 4× дороже свай, но надёжнее на сложных грунтах"],
              ["Отопление",         "Тепловой насос дороже при покупке, но самый выгодный в эксплуатации"],
              ["Внутренняя отделка","Переход с «эконом» на «стандарт» добавляет ~700 тыс. ₽ для 80 м²"],
              ["Регион",            "Самара и Воронеж в среднем на 20–25% дешевле Москвы"],
            ].map(([factor, desc], i) => (
              <div key={i} className="flex gap-2">
                <Icon name="ArrowRight" size={12} className="text-green-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium text-gray-700">{factor}</span>
                  <span className="text-gray-500"> — {desc}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Этапы строительства */}
        <Card className="p-4 border-gray-200">
          <h3 className="font-bold text-gray-800 text-sm mb-3 flex items-center gap-2">
            <Icon name="ListChecks" size={14} />
            Этапы строительства
          </h3>
          <div className="space-y-2">
            {[
              ["1", "Фундамент",             "1–2 нед."],
              ["2", "Каркас и кровля",        "2–4 нед."],
              ["3", "Утепление и фасад",      "2–3 нед."],
              ["4", "Окна и двери",           "1 нед."],
              ["5", "Инженерные системы",     "3–4 нед."],
              ["6", "Внутренняя отделка",     "4–8 нед."],
              ["7", "Финишные работы",        "1–2 нед."],
            ].map(([n, step, time]) => (
              <div key={n} className="flex items-center gap-2 text-xs">
                <div className="w-5 h-5 rounded-full bg-green-100 text-green-700 font-bold text-xs flex items-center justify-center shrink-0">
                  {n}
                </div>
                <span className="text-gray-700 flex-1">{step}</span>
                <span className="text-gray-400">{time}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
