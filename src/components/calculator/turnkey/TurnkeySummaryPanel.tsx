import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import {
  REGIONS, APARTMENT_TYPES, RENOVATION_LEVELS,
  FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
} from "@/components/calculator/turnkey/TurnkeyTypes";
import type { TurnkeyConfig } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkeyPrice, calcTurnkeyMaterials, fmt } from "@/components/calculator/turnkey/turnkeyUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import EstimateActions from "@/components/calculator/EstimateActions";
import CalcInlineLeadForm from "@/components/calculator/CalcInlineLeadForm";
import CalcResultCTA from "@/components/calculator/CalcResultCTA";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import SimilarProjects from "@/components/calculator/SimilarProjects";
import ScreenProtection from "@/components/print/ScreenProtection";
import CalcEmailCapture from "@/components/calculator/CalcEmailCapture";
import CalcFindMaster from "@/components/calculator/CalcFindMaster";
import CalcCreateProject from "@/components/calculator/CalcCreateProject";
import CalcProgressBar from "@/components/calculator/CalcProgressBar";

interface Props {
  cfg: TurnkeyConfig;
  regionId: string;
  markupPct: number;
  onShowExport: () => void;
}

export default function TurnkeySummaryPanel({ cfg, regionId, markupPct, onShowExport }: Props) {
  const breakdown = calcTurnkeyPrice(cfg, regionId, markupPct);
  const aptType = APARTMENT_TYPES.find(a => a.id === cfg.apartmentType);
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);
  const floorType = FLOOR_TYPES.find(f => f.id === cfg.floorType);
  const ceilingType = CEILING_TYPES.find(c => c.id === cfg.ceilingType);
  const bathroomLevel = BATHROOM_LEVELS.find(b => b.id === cfg.bathroomLevel);

  const breakdownRows: { label: string; value: number }[] = [
    { label: "Демонтаж (работы)", value: breakdown.demolitionCost },
    { label: `Вывоз мусора ×${breakdown.debrisTruckCount} маш.`, value: breakdown.debrisRemovalCost },
    { label: `Демонтаж сантехкабины ×${cfg.bathroomCount}`, value: breakdown.bathroomCabinDemolitionCost },
    { label: `Возведение сантехкабины ×${cfg.bathroomCount}`, value: breakdown.bathroomCabinConstructionCost },
    { label: "Электромонтаж", value: breakdown.electricsCost },
    { label: "Сантехника (разводка)", value: breakdown.plumbingCost },
    { label: "Штукатурка и стяжка", value: breakdown.plasterCost },
    { label: "Напольное покрытие", value: breakdown.floorsCost },
    { label: "Потолки", value: breakdown.ceilingsCost },
    { label: `Санузлы ×${cfg.bathroomCount} (${bathroomLevel?.label})`, value: breakdown.bathroomsCost },
    { label: "Монтаж кухни", value: breakdown.kitchenCost },
    { label: `Двери ×${cfg.doorsCount}`, value: breakdown.doorsCost },
    { label: "Откосы окон", value: breakdown.windowSlopesCost },
    { label: "Сборка мебели", value: breakdown.furnitureCost },
    { label: "Финальная уборка", value: breakdown.cleaningCost },
    { label: `Прораб ${cfg.foremanPct}% (от работ+материалов)`, value: breakdown.foremanCost },
    { label: `Снабженец ${cfg.supplierPct}% (от материалов ${fmt(breakdown.materialsCost)} ₽)`, value: breakdown.supplierCost },
  ].filter(r => r.value > 0);

  const progressChecks = [
    !!cfg.apartmentType,
    cfg.totalAreaM2 > 0,
    !!cfg.renovationLevel,
    !!cfg.floorType,
    !!cfg.ceilingType,
    cfg.bathroomCount > 0,
    !!cfg.bathroomLevel,
  ];
  const filled = progressChecks.filter(Boolean).length;
  const total = progressChecks.length;

  return (
    <div className="lg:col-span-2">
      <ScreenProtection>
      <div className="sticky top-24 space-y-4">
        <CalcProgressBar
          filled={filled}
          total={total}
          accentColor="emerald"
          hint="Заполните параметры квартиры для точной сметы"
        />
        {/* Большой итог */}
        <Card className="p-5 bg-gradient-to-br from-emerald-600 to-emerald-800 border-0 text-white">
          <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-1">Стоимость ремонта</p>
          <p className="text-3xl font-bold mb-1">{fmt(cfg.totalPrice)} ₽</p>
          <p className="text-sm opacity-70">
            {cfg.totalAreaM2 > 0 ? `${fmt(Math.round(cfg.totalPrice / cfg.totalAreaM2))} ₽/м²` : ""}
          </p>
          <div className="mt-3 pt-3 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
            <div>
              <p className="opacity-60">Квартира</p>
              <p className="font-semibold">{aptType?.label} · {cfg.totalAreaM2} м²</p>
            </div>
            <div>
              <p className="opacity-60">Уровень</p>
              <p className="font-semibold">{level?.label}</p>
            </div>
            <div>
              <p className="opacity-60">Регион</p>
              <p className="font-semibold">{REGIONS.find(r => r.id === regionId)?.label}</p>
            </div>
            {markupPct > 0 && (
              <div>
                <p className="opacity-60">Наценка</p>
                <p className="font-semibold">{markupPct}% (+{fmt(breakdown.markupAmount)} ₽)</p>
              </div>
            )}
          </div>
          <Button
            className="w-full mt-4 bg-white/20 hover:bg-white/30 text-white border-0"
            onClick={onShowExport}
          >
            <Icon name="FileText" size={15} className="mr-2" />
            Создать документ
          </Button>
          <div className="mt-3 pt-3 border-t border-white/20 [&_button]:border-white/30 [&_button]:text-white [&_button]:hover:bg-white/10 [&_input]:bg-white/10 [&_input]:border-white/30 [&_input]:text-white [&_input]:placeholder:text-white/50">
            <EstimateActions
              onPrint={() => {
                const now = new Date();
                const printState = {
                  cfg,
                  markupPct,
                  regionId,
                  totalSum: cfg.totalPrice,
                  docNum: String(now.getTime()).slice(-6),
                  date: now.toLocaleDateString("ru-RU"),
                  docType: "smeta" as const,
                };
                sessionStorage.setItem("turnkey_print_state", JSON.stringify(printState));
                window.open("/turnkey/print", "_blank");
              }}
              calcName="Ремонт под ключ"
              totalSum={cfg.totalPrice}
              items={breakdownRows.map(r => ({ name: r.label, price: r.value }))}
              params={{
                "Тип квартиры": aptType?.label ?? "",
                "Площадь": `${cfg.totalAreaM2} м²`,
                "Уровень": level?.label ?? "",
                "Регион": REGIONS.find(r => r.id === regionId)?.label ?? "",
              }}
            />
          </div>
        <CalcInlineLeadForm calcType="Под ключ" totalSum={cfg.totalPrice} />
        </Card>

        {/* Краткая сводка */}
        <Card className="p-4 border-gray-200">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Конфигурация</p>
          <div className="space-y-1.5 text-xs text-gray-600">
            <div className="flex justify-between">
              <span>Потолки</span>
              <span className="font-medium text-gray-900">{ceilingType?.label ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Полы</span>
              <span className="font-medium text-gray-900">{floorType?.label ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Санузлы ×{cfg.bathroomCount}</span>
              <span className="font-medium text-gray-900">{bathroomLevel?.label ?? "—"}</span>
            </div>
            <div className="flex justify-between">
              <span>Высота потолков</span>
              <span className="font-medium text-gray-900">{cfg.ceilingHeightM} м</span>
            </div>
          </div>
        </Card>

        {/* Детализация breakdown */}
        <Card className="p-4 border-emerald-200 bg-emerald-50">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-3 flex items-center gap-2">
            <Icon name="Receipt" size={13} />
            Детализация стоимости
          </p>
          <div className="space-y-1.5 text-sm">
            {breakdownRows.map(row => (
              <div key={row.label} className="flex justify-between">
                <span className="text-gray-600">{row.label}</span>
                <span className="font-medium">{fmt(row.value)} ₽</span>
              </div>
            ))}

            <div className="border-t border-emerald-200 pt-1.5 mt-1.5 space-y-1">
              <div className="flex justify-between text-gray-500 text-xs">
                <span>Уровень ×{breakdown.levelCoeff} · Регион ×{breakdown.regionCoeff}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Работы</span>
                <span className="font-medium">{fmt(breakdown.subtotal - breakdown.materialsCost - breakdown.foremanCost - breakdown.supplierCost)} ₽</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Материалы</span>
                <span className="font-medium">{fmt(breakdown.materialsCost)} ₽</span>
              </div>
              {markupPct > 0 && (
                <div className="flex justify-between text-orange-600">
                  <span>Наценка {markupPct}%</span>
                  <span>+ {fmt(breakdown.markupAmount)} ₽</span>
                </div>
              )}
            </div>

            <div className="flex justify-between text-base font-bold text-emerald-700 pt-1">
              <span>ИТОГО</span>
              <span>{fmt(breakdown.total)} ₽</span>
            </div>
          </div>
        </Card>

        <CalcResultCTA
          totalSum={cfg.totalPrice}
          onAction={() => {
            const el = document.getElementById("calc-order-form");
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
        <div id="calc-order-form">
          <CalcOrderForm
            calcType="Ремонт под ключ"
            total={`от ${fmt(breakdown.total)} ₽`}
          />
        </div>

        <SimilarProjects totalSum={cfg.totalPrice} calcType="turnkey" />

        {/* Ведомость материалов */}
        <MaterialsTable
          items={calcTurnkeyMaterials(cfg, breakdown, regionId)}
          accentColor="green"
        />
      </div>
      </ScreenProtection>
      <CalcEmailCapture
        calcType="Под ключ"
        totalSum={cfg.totalPrice}
        items={breakdownRows.map(r => ({ name: r.label, price: r.value }))}
        params={{
          "Тип квартиры": aptType?.label ?? "",
          "Площадь": `${cfg.totalAreaM2} м²`,
          "Уровень": level?.label ?? "",
          "Регион": REGIONS.find(r => r.id === regionId)?.label ?? "",
          ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
        }}
      />
      <CalcFindMaster calcType="Под ключ" totalSum={cfg.totalPrice} />
      <CalcCreateProject calcType="Под ключ" totalSum={cfg.totalPrice} />
    </div>
  );
}