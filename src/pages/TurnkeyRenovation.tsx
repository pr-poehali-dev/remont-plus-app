import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import {
  REGIONS, APARTMENT_TYPES, RENOVATION_LEVELS,
  FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
  DEFAULT_TURNKEY_CONFIG,
} from "@/components/calculator/turnkey/TurnkeyTypes";
import type { TurnkeyConfig } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkeyPrice, calcTurnkeyMaterials, fmt } from "@/components/calculator/turnkey/turnkeyUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import TurnkeyConfigForm from "@/components/calculator/turnkey/TurnkeyConfigForm";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

const MARKUP_KEY = "turnkey_markup_pct";
const REGION_KEY = "turnkey_region";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "moscow";
}

function makeConfig(): TurnkeyConfig {
  return {
    ...DEFAULT_TURNKEY_CONFIG,
    id: `tk-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    totalPrice: 0,
  };
}

export default function TurnkeyRenovation() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent('turnkey', 'open'); }, []);

  useMeta({
    title: "Ремонт квартиры под ключ — расчёт стоимости",
    description: "Онлайн-калькулятор ремонта квартиры под ключ. Введите параметры квартиры и получите полную смету: черновые работы, чистовые, санузлы, двери, уборка.",
    keywords: "ремонт под ключ расчёт, калькулятор ремонт квартиры, стоимость ремонта под ключ, смета под ключ",
    canonical: "/turnkey",
  });

  const [cfg, setCfg] = useState<TurnkeyConfig>(() => {
    const mk = loadMarkup();
    const rg = loadRegion();
    const c = makeConfig();
    const bd = calcTurnkeyPrice(c, rg, mk);
    return { ...c, totalPrice: bd.total };
  });
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const updateCfg = (patch: Partial<Omit<TurnkeyConfig, "id">>) => {
    setCfg(prev => {
      const updated = { ...prev, ...patch };
      const bd = calcTurnkeyPrice(updated, regionId, markupPct);
      return { ...updated, totalPrice: bd.total };
    });
  };

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
    const bd = calcTurnkeyPrice(cfg, regionId, n);
    setCfg(prev => ({ ...prev, totalPrice: bd.total }));
  };

  const handleRegionChange = (rg: string) => {
    setRegionId(rg);
    localStorage.setItem(REGION_KEY, rg);
    const bd = calcTurnkeyPrice(cfg, rg, markupPct);
    setCfg(prev => ({ ...prev, totalPrice: bd.total }));
  };

  const handleExportConfirm = (data: ExportConfirmData) => {
    const now = new Date();
    const printState = {
      cfg,
      markupPct,
      regionId,
      totalSum: cfg.totalPrice,
      docNum: String(now.getTime()).slice(-6),
      date: now.toLocaleDateString("ru-RU"),
      ...data,
    };
    sessionStorage.setItem("turnkey_print_state", JSON.stringify(printState));
    window.open("/turnkey/print", "_blank");
  };

  const breakdown = calcTurnkeyPrice(cfg, regionId, markupPct);
  const aptType = APARTMENT_TYPES.find(a => a.id === cfg.apartmentType);
  const level = RENOVATION_LEVELS.find(l => l.id === cfg.renovationLevel);
  const floorType = FLOOR_TYPES.find(f => f.id === cfg.floorType);
  const ceilingType = CEILING_TYPES.find(c => c.id === cfg.ceilingType);
  const bathroomLevel = BATHROOM_LEVELS.find(b => b.id === cfg.bathroomLevel);

  const breakdownRows: { label: string; value: number }[] = [
    { label: "Демонтаж", value: breakdown.demolitionCost },
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

  return (
    <CalcAuthGate calcName="Ремонт под ключ" calcPath="/turnkey">
    <SEOMeta
      title="Калькулятор ремонта под ключ онлайн 2026"
      description="Рассчитайте стоимость ремонта квартиры под ключ онлайн. Черновые и чистовые работы, материалы, сантехника, электрика — полная смета онлайн."
      keywords="ремонт квартиры под ключ калькулятор, стоимость ремонта под ключ, расчёт ремонта квартиры"
      path="/turnkey"
      jsonLd={[
        calcJsonLd("Калькулятор ремонта под ключ", "Онлайн расчёт полной стоимости ремонта квартиры под ключ", "/turnkey"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Ремонт под ключ",url:"/turnkey"}])
      ]}
    />
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="KeyRound" size={20} className="text-emerald-600" />
                  Ремонт под ключ
                </h1>
                <p className="text-sm text-gray-500">
                  {aptType?.label} · {cfg.totalAreaM2} м²
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={regionId}
                onChange={e => handleRegionChange(e.target.value)}
                className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 cursor-pointer hover:border-emerald-400 transition-colors"
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMarkup(v => !v)}
                className={markupPct > 0 ? "border-orange-300 text-orange-600" : ""}
              >
                <Icon name="Percent" size={15} className="mr-1.5" />
                Наценка{markupPct > 0 ? ` ${markupPct}%` : ""}
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setShowExport(true);
                  if (typeof window !== "undefined" && (window as unknown as { ym?: (id: number, action: string, goal: string) => void }).ym) {
                    (window as unknown as { ym: (id: number, action: string, goal: string) => void }).ym(107009331, "reachGoal", "turnkey_document_open");
                  }
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                <Icon name="FileText" size={15} className="mr-1.5" />
                Документ
              </Button>
            </div>
          </div>

          {showMarkup && (
            <div className="mt-3 pb-3 border-t pt-3 flex items-center gap-3 max-w-sm">
              <Label className="text-sm whitespace-nowrap">Наценка, %</Label>
              <Input
                type="number" min={0} max={200}
                value={markupPct}
                onChange={e => handleMarkupChange(e.target.value)}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-gray-400">0–200%</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Левая панель — форма конфигурации */}
          <div className="lg:col-span-3">
            {/* Карточка квартиры */}
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                <Icon name="Home" size={14} />
              </div>
              <h2 className="text-base font-bold text-gray-900">Конфигурация квартиры</h2>
              <span className="text-sm text-gray-400 ml-1">— все параметры</span>
            </div>

            <Card className="p-5">
              <TurnkeyConfigForm cfg={cfg} onUpdate={updateCfg} />
            </Card>
          </div>

          {/* Правая панель — итог и breakdown */}
          <div className="lg:col-span-2">
            <div className="sticky top-24 space-y-4">
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
                  onClick={() => setShowExport(true)}
                >
                  <Icon name="FileText" size={15} className="mr-2" />
                  Создать документ
                </Button>
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

              <CalcOrderForm
                calcType="Ремонт под ключ"
                total={`от ${fmt(breakdown.total)} ₽`}
              />

              {/* Ведомость материалов */}
              <MaterialsTable
                items={calcTurnkeyMaterials(cfg, breakdown, regionId)}
                accentColor="green"
              />
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={data => { handleExportConfirm(data); setShowExport(false); }}
          onCancel={() => setShowExport(false)}
        />
      )}
    </div>
    </CalcAuthGate>
  );
}