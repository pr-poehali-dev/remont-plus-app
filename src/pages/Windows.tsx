import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS, LAMINATION_TYPES, WINDOW_REGIONS,
} from "@/components/calculator/windows/WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "@/components/calculator/windows/WindowTypes";
import { calcPrice, DEFAULT_CONFIG, syncSashes, fmt } from "@/components/calculator/windows/windowUtils";
import WindowConfigForm from "@/components/calculator/windows/WindowConfigForm";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import DocsTab from "@/components/calculator/DocsTab";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

const MARKUP_KEY = "windows_markup_pct";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}

export default function Windows() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent('windows', 'open'); }, []);

  useMeta({
    title: "Расчёт окон и остекления",
    description: "Онлайн-калькулятор стоимости окон ПВХ и алюминиевых конструкций. Выберите профиль, стеклопакет, фурнитуру и получите смету или коммерческое предложение.",
    keywords: "расчёт окон онлайн, стоимость окон ПВХ, калькулятор остекления балкона, алюминиевые конструкции",
    canonical: "/windows",
  });

  const [cfg, setCfg] = useState<Omit<WindowConfig, "id" | "totalPrice">>(DEFAULT_CONFIG);
  const [configs, setConfigs] = useState<WindowConfig[]>([]);
  const [matFilter, setMatFilter] = useState<ProfileMaterial | "all">("all");
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const update = (patch: Partial<typeof cfg>) => setCfg(prev => ({ ...prev, ...patch }));

  const basePrice = calcPrice(cfg);
  const markup = markupPct > 0 ? Math.round(basePrice * markupPct / 100) : 0;
  const price = basePrice + markup;

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
  };

  const handleSashOpeningChange = (idx: number, val: OpeningType) => {
    const arr = [...cfg.openingTypes];
    arr[idx] = val;
    update({ openingTypes: arr });
  };

  const handleSyncSashes = (type: typeof cfg.constructionType) => {
    update({ constructionType: type, openingTypes: syncSashes(type, CONSTRUCTION_TYPES) });
  };

  const handleAdd = () => {
    const id = `win-${Date.now()}`;
    const newCfg: WindowConfig = { ...cfg, id, totalPrice: price };
    setConfigs(prev => [...prev, newCfg]);
  };

  const removeConfig = (id: string) => setConfigs(prev => prev.filter(c => c.id !== id));

  const totalSum = configs.reduce((s, c) => s + c.totalPrice, 0);

  const handleExportConfirm = (data: ExportConfirmData) => {
    const now = new Date();
    const date = now.toLocaleDateString("ru-RU");
    const docNum = String(now.getTime()).slice(-6);

    const exportConfigs = configs.length > 0
      ? configs
      : [{ ...cfg, id: `win-${Date.now()}`, totalPrice: price }];
    const exportTotal = exportConfigs.reduce((s, c) => s + c.totalPrice, 0);

    const printState = {
      configs: exportConfigs,
      markupPct,
      totalSum: exportTotal,
      docNum,
      date,
      ...data,
    };
    sessionStorage.setItem("windows_print_state", JSON.stringify(printState));
    window.open("/windows/print", "_blank");
  };

  // Преобразуем configs в EstimateItem[] для DocsTab
  const windowEstimateItems = configs.map(c => {
    const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
    const pf = PROFILE_SYSTEMS.find(x => x.id === c.profileSystemId);
    const gl = GLASS_UNITS.find(x => x.id === c.glassUnitId);
    const name = [ct?.label, `${c.width}×${c.height} мм`, pf ? `${pf.brand} ${pf.series}` : "", gl?.name].filter(Boolean).join(", ");
    return {
      id: c.id,
      category: "Окна и остекление",
      name,
      unit: "шт.",
      quantity: c.quantity,
      price: Math.round(c.totalPrice / c.quantity),
      total: c.totalPrice,
    };
  });

  return (
    <CalcAuthGate calcName="Окна и остекление" calcPath="/windows">
    <SEOMeta
      title="Калькулятор окон ПВХ онлайн 2026"
      description="Рассчитайте стоимость пластиковых окон онлайн. Расчёт ПВХ окон по размерам, профилю и фурнитуре. Точная смета за 2 минуты."
      keywords="калькулятор окон ПВХ, стоимость пластиковых окон, расчёт окон онлайн"
      path="/windows"
      jsonLd={[
        calcJsonLd("Калькулятор окон ПВХ", "Онлайн расчёт стоимости пластиковых окон по размерам и конфигурации", "/windows"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Окна ПВХ",url:"/windows"}])
      ]}
    />
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="AppWindow" size={20} className="text-blue-600" />
                  Окна и остекление
                </h1>
                <p className="text-sm text-gray-500">ПВХ и алюминиевые конструкции</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                disabled={price === 0}
                onClick={() => setShowExport(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Icon name="FileText" size={15} className="mr-1.5" />
                Создать документ
              </Button>
            </div>
          </div>

          {showMarkup && (
            <div className="mt-3 pb-3 border-t pt-3 flex items-center gap-3 max-w-sm">
              <Label className="text-sm whitespace-nowrap">Наценка на все позиции, %</Label>
              <Input
                type="number"
                min={0}
                max={200}
                value={markupPct}
                onChange={e => handleMarkupChange(e.target.value)}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-gray-400">от 0 до 200%</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-2 mb-6 max-w-xs">
            <TabsTrigger value="config">
              <Icon name="AppWindow" size={13} className="mr-1.5" />
              Конфигуратор
            </TabsTrigger>
            <TabsTrigger value="docs">
              <Icon name="FileText" size={13} className="mr-1.5" />
              Документы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <div className="grid lg:grid-cols-5 gap-6">
              {/* Конфигуратор */}
              <div className="lg:col-span-3">
                <Card className="p-5">
                  <WindowConfigForm
                    cfg={cfg}
                    matFilter={matFilter}
                    onUpdate={update}
                    onMatFilterChange={setMatFilter}
                    onSashOpeningChange={handleSashOpeningChange}
                    onSyncSashes={handleSyncSashes}
                  />
                </Card>
              </div>

              {/* Итог */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-4">
                  <Card className="p-5 border-blue-200 bg-gradient-to-br from-blue-50 to-sky-50">
                    <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-3">Стоимость конструкции</p>

                    <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Тип</span>
                        <span className="font-medium text-gray-900 text-right">
                          {CONSTRUCTION_TYPES.find(c => c.value === cfg.constructionType)?.label}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Размер</span>
                        <span className="font-medium text-gray-900">{cfg.width}×{cfg.height} мм</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Площадь</span>
                        <span className="font-medium text-gray-900">
                          {((cfg.width / 1000) * (cfg.height / 1000)).toFixed(2)} м²
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Профиль</span>
                        <span className="font-medium text-gray-900 text-right">
                          {PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId)?.brand}{" "}
                          {PROFILE_SYSTEMS.find(p => p.id === cfg.profileSystemId)?.series}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Стеклопакет</span>
                        <span className="font-medium text-gray-900">
                          {GLASS_UNITS.find(g => g.id === cfg.glassUnitId)?.name}
                        </span>
                      </div>
                      {cfg.laminationId !== "none" && (
                        <div className="flex justify-between">
                          <span>Ламинация</span>
                          <span className="font-medium text-gray-900">
                            {LAMINATION_TYPES.find(l => l.id === cfg.laminationId)?.name}
                            {cfg.laminationBothSides && " (2 стороны)"}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Регион</span>
                        <span className="font-medium text-gray-900">
                          {WINDOW_REGIONS.find(r => r.id === cfg.regionId)?.name ?? cfg.regionId}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Кол-во</span>
                        <span className="font-medium text-gray-900">{cfg.quantity} шт.</span>
                      </div>
                    </div>

                    {markupPct > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mb-3 space-y-1 text-sm">
                        <div className="flex justify-between text-gray-500">
                          <span>Себестоимость</span>
                          <span>{fmt(basePrice)} ₽</span>
                        </div>
                        <div className="flex justify-between text-orange-600">
                          <span>Наценка {markupPct}%</span>
                          <span>+{fmt(markup)} ₽</span>
                        </div>
                      </div>
                    )}

                    <div className="border-t border-blue-200 pt-3 mb-4">
                      <div className="flex justify-between items-end">
                        <span className="text-sm text-gray-600">Цена за 1 шт.</span>
                        <span className="text-lg font-bold text-gray-900">{fmt(Math.round(price / cfg.quantity))} ₽</span>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <span className="text-sm text-gray-600">
                          {cfg.quantity > 1 ? `Итого ${cfg.quantity} шт.` : "Итого"}
                        </span>
                        <span className="text-2xl font-bold text-blue-700">{fmt(price)} ₽</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                      onClick={handleAdd}
                      disabled={price === 0}
                    >
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить в список
                    </Button>
                    <p className="text-[11px] text-center text-gray-400 mt-2">
                      Расчёт ориентировочный. Точная цена — после замера.
                    </p>
                  </Card>

                  {configs.length > 0 && (
                    <Card className="p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Список позиций
                        <Badge className="ml-2 bg-blue-100 text-blue-700 border-blue-200">{configs.length}</Badge>
                      </p>
                      <div className="space-y-2">
                        {configs.map((c) => {
                          const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
                          const pf = PROFILE_SYSTEMS.find(x => x.id === c.profileSystemId);
                          return (
                            <div key={c.id} className="flex items-start justify-between gap-2 text-xs border-b pb-2 last:border-0 last:pb-0">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">{ct?.label}</p>
                                <p className="text-gray-500">{c.width}×{c.height} · {pf?.brand} · {c.quantity} шт.</p>
                                <p className="text-blue-600 font-semibold">{fmt(c.totalPrice)} ₽</p>
                              </div>
                              <button
                                onClick={() => removeConfig(c.id)}
                                className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                              >
                                <Icon name="Trash2" size={13} />
                              </button>
                            </div>
                          );
                        })}
                        <div className="flex justify-between font-bold text-sm pt-2 border-t">
                          <span>Итого</span>
                          <span className="text-blue-700">{fmt(totalSum)} ₽</span>
                        </div>
                      </div>
                      <Button
                        className="w-full mt-3 bg-blue-600 hover:bg-blue-700 text-white"
                        onClick={() => setShowExport(true)}
                      >
                        <Icon name="FileText" size={15} className="mr-2" />
                        Создать документ
                      </Button>
                    </Card>
                  )}

                  {configs.length > 0 && (
                    <CalcOrderForm
                      calcType="Окна"
                      total={`от ${fmt(totalSum)} ₽`}
                    />
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <Card className="p-6">
              <DocsTab
                items={windowEstimateItems}
                lemanaItems={[]}
                grandTotal={totalSum}
                materialSurcharge={0}
                totalMaterials={0}
                totalWorks={totalSum}
                adjustedWorks={totalSum}
              />
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={handleExportConfirm}
          onCancel={() => setShowExport(false)}
        />
      )}
      <SalesWidget calcContext={{ calcName: "Калькулятор окон", totalPrice: totalSum }} />
    </div>
    </CalcAuthGate>
  );
}