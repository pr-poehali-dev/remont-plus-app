import { useState, useEffect } from "react";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import {
  CONSTRUCTION_TYPES, PROFILE_SYSTEMS, GLASS_UNITS,
} from "@/components/calculator/windows/WindowTypes";
import type { WindowConfig, ProfileMaterial, OpeningType } from "@/components/calculator/windows/WindowTypes";
import { calcPrice, DEFAULT_CONFIG, syncSashes, fmt, loadPriceOverrides, savePriceOverrides, resetPriceOverrides } from "@/components/calculator/windows/windowUtils";
import type { PriceOverrides } from "@/components/calculator/windows/windowUtils";
import WindowConfigForm from "@/components/calculator/windows/WindowConfigForm";
import WindowPriceSettings from "@/components/calculator/windows/WindowPriceSettings";
import WindowsHeader from "@/components/calculator/windows/WindowsHeader";
import WindowsResultCard from "@/components/calculator/windows/WindowsResultCard";
import WindowsConfigsList from "@/components/calculator/windows/WindowsConfigsList";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import DocsTab from "@/components/calculator/DocsTab";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import CalcResultCTA from "@/components/calculator/CalcResultCTA";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import CalcStickyBar from "@/components/calculator/CalcStickyBar";
import { useSessionShare } from "@/hooks/useSessionShare";
import SimilarProjects from "@/components/calculator/SimilarProjects";
import { useCalcFunnel } from "@/hooks/useCalcTracking";
import { usePageGoal } from "@/lib/metrika";
import HomePromoBanner from "@/components/home/HomePromoBanner";
import CalcEmailCapture from "@/components/calculator/CalcEmailCapture";
import CalcFindMaster from "@/components/calculator/CalcFindMaster";
import CalcCreateProject from "@/components/calculator/CalcCreateProject";

const MARKUP_KEY = "windows_markup_pct";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}

export default function Windows() {
  usePageGoal("view_calc_windows");
  const { trackInteract, trackResultView, trackExportClick } = useCalcFunnel('windows');

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
  const [showPriceSettings, setShowPriceSettings] = useState(false);
  const [priceOverrides, setPriceOverrides] = useState<PriceOverrides>(loadPriceOverrides);

  const update = (patch: Partial<typeof cfg>) => { trackInteract(); setCfg(prev => ({ ...prev, ...patch })); };

  const basePrice = calcPrice(cfg, priceOverrides);
  const markup = markupPct > 0 ? Math.round(basePrice * markupPct / 100) : 0;
  const price = basePrice + markup;

  useEffect(() => { if (price > 0) trackResultView(); }, [price, trackResultView]);

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

  const { buildShareUrl } = useSessionShare(
    { cfg, configs, markupPct },
    "windows_session",
    (restored: { cfg?: typeof cfg; configs?: WindowConfig[]; markupPct?: number }) => {
      if (restored.cfg) setCfg(restored.cfg);
      if (Array.isArray(restored.configs)) setConfigs(restored.configs);
      if (typeof restored.markupPct === "number") {
        setMarkupPct(restored.markupPct);
        localStorage.setItem(MARKUP_KEY, String(restored.markupPct));
      }
    },
  );

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
    const name = [ct?.label, `${c.width}×${c.height} мм`, c.hasTransom && c.constructionType !== "transom" ? `+ фрамуга ${c.transomHeight} мм` : "", pf ? `${pf.brand} ${pf.series}` : "", gl?.name].filter(Boolean).join(", ");
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
      <HomePromoBanner />
      <WindowsHeader
        priceOverrides={priceOverrides}
        markupPct={markupPct}
        showMarkup={showMarkup}
        price={price}
        onShowPriceSettings={() => setShowPriceSettings(true)}
        onToggleMarkup={() => setShowMarkup(v => !v)}
        onMarkupChange={handleMarkupChange}
        onCreateDocument={() => { trackExportClick(); setShowExport(true); }}
      />

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
                  <WindowsResultCard
                    cfg={cfg}
                    basePrice={basePrice}
                    markup={markup}
                    markupPct={markupPct}
                    price={price}
                    onAdd={handleAdd}
                  />

                  <WindowsConfigsList
                    configs={configs}
                    cfg={cfg}
                    price={price}
                    markupPct={markupPct}
                    totalSum={totalSum}
                    onRemove={removeConfig}
                    onShowExport={() => setShowExport(true)}
                  />

                  {configs.length > 0 && (
                    <>
                    <CalcResultCTA
                      totalSum={totalSum}
                      onAction={() => {
                        const el = document.getElementById("calc-order-form");
                        el?.scrollIntoView({ behavior: "smooth", block: "center" });
                      }}
                    />
                    <div id="calc-order-form">
                      <CalcOrderForm
                        calcType="Окна"
                        total={`от ${fmt(totalSum)} ₽`}
                      />
                    </div>
                    </>
                  )}
                  <SimilarProjects totalSum={totalSum} calcType="windows" />
                  <CalcEmailCapture
                    calcType="Окна"
                    totalSum={totalSum}
                    items={configs.map(c => {
                      const ct = CONSTRUCTION_TYPES.find(x => x.value === c.constructionType);
                      return { name: `${ct?.label ?? "Окно"} ${c.width}x${c.height} x${c.quantity}`, price: c.totalPrice };
                    })}
                    params={{
                      "Позиций": `${configs.length}`,
                      ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
                    }}
                  />
                  <CalcFindMaster calcType="Окна" totalSum={totalSum} />
                  <CalcCreateProject calcType="Окна" totalSum={totalSum} />
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
      <CalcStickyBar totalSum={totalSum} calcType="windows" shareUrl={buildShareUrl()} />

      <WindowPriceSettings
        open={showPriceSettings}
        onOpenChange={setShowPriceSettings}
        overrides={priceOverrides}
        onSave={o => { savePriceOverrides(o); setPriceOverrides(o); }}
        onReset={() => { resetPriceOverrides(); setPriceOverrides(loadPriceOverrides()); }}
      />
    </div>
    </CalcAuthGate>
  );
}
