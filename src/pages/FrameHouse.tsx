import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { DEFAULT_FRAMEHOUSE_CONFIG } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import { calcFrameHousePrice } from "@/components/calculator/framehouse/frameHouseUtils";
import FrameHouseHeader from "@/components/framehouse/FrameHouseHeader";
import type { ViewTab } from "@/components/framehouse/FrameHouseHeader";
import FrameHouseTabConfig from "@/components/framehouse/FrameHouseTabConfig";
import FrameHouseTabResult from "@/components/framehouse/FrameHouseTabResult";
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
import SmartLeadTrigger from "@/components/calculator/SmartLeadTrigger";

const REGION_KEY = "framehouse_region";
const MARKUP_KEY = "framehouse_markup";

function loadRegion() { return localStorage.getItem(REGION_KEY) || "samara"; }
function loadMarkup() { const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0"); return isNaN(v) ? 0 : v; }

function makeConfig(): FrameHouseConfig {
  return { ...DEFAULT_FRAMEHOUSE_CONFIG, id: `fh-${Date.now()}`, region: loadRegion() };
}

interface ExportState {
  showExportPanel: boolean;
  customer: string;
  contractor: string;
  address: string;
  phone: string;
  email: string;
  inn: string;
  docType: "smeta" | "kp" | "contract" | "ks2" | "ks3" | "act";
  validDays: string;
  startDate: string;
  endDate: string;
  contractNum: string;
  contractDate: string;
  advancePct: string;
  warrantyMonths: string;
}

export default function FrameHouse() {
  const navigate = useNavigate();
  usePageGoal("view_calc_framehouse");
  const { trackInteract, trackResultView, trackExportClick } = useCalcFunnel('framehouse');

  useMeta({
    title: "Калькулятор строительства каркасного дома — АВАНГАРД",
    description: "Онлайн-калькулятор строительства каркасного дома под ключ: каркас, фундамент, кровля, фасад, отопление, отделка. Смета за 2 минуты.",
    keywords: "калькулятор каркасного дома, стоимость каркасного дома под ключ, каркасный дом цена, смета на дом, строительство дома онлайн",
    canonical: "/framehouse",
  });

  const [config, setConfig] = useState<FrameHouseConfig>(makeConfig);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [viewTab, setViewTab] = useState<ViewTab>("config");

  const today = new Date().toISOString().slice(0, 10);
  const [exportState, setExportState] = useState<ExportState>({
    showExportPanel: false,
    customer: "",
    contractor: "",
    address: "",
    phone: "",
    email: "",
    inn: "",
    docType: "smeta",
    validDays: "30",
    startDate: today,
    endDate: "",
    contractNum: "",
    contractDate: today,
    advancePct: "30",
    warrantyMonths: "12",
  });

  const handleChange = useCallback((patch: Partial<FrameHouseConfig>) => {
    trackInteract();
    setConfig(prev => ({ ...prev, ...patch }));
  }, [trackInteract]);

  const handleRegionChange = (v: string) => {
    setRegionId(v);
    localStorage.setItem(REGION_KEY, v);
  };

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
  };

  const handleExportChange = (patch: Partial<ExportState>) => {
    setExportState(prev => ({ ...prev, ...patch }));
  };

  const bd = useMemo(() => calcFrameHousePrice(config, regionId, markupPct), [config, regionId, markupPct]);

  useEffect(() => { if (bd.total > 0) trackResultView(); }, [bd.total, trackResultView]);

  const { buildShareUrl } = useSessionShare(
    { config, regionId, markupPct },
    "framehouse_session",
    (restored: { config?: FrameHouseConfig; regionId?: string; markupPct?: number }) => {
      if (restored.config) setConfig(restored.config);
      if (restored.regionId) {
        setRegionId(restored.regionId);
        localStorage.setItem(REGION_KEY, restored.regionId);
      }
      if (typeof restored.markupPct === "number") {
        setMarkupPct(restored.markupPct);
        localStorage.setItem(MARKUP_KEY, String(restored.markupPct));
      }
    },
  );

  const handlePrint = () => {
    const now = new Date();
    const printState = {
      config,
      regionId,
      markupPct,
      bd,
      docNum: String(now.getTime()).slice(-6),
      date: now.toLocaleDateString("ru-RU"),
      docType: exportState.docType,
      customer: exportState.customer,
      contractor: exportState.contractor,
      address: exportState.address,
      phone: exportState.phone,
      email: exportState.email,
      inn: exportState.inn,
      validDays: exportState.validDays,
      startDate: exportState.startDate,
      endDate: exportState.endDate,
      contractNum: exportState.contractNum,
      contractDate: exportState.contractDate,
      advancePct: exportState.advancePct,
      warrantyMonths: exportState.warrantyMonths,
    };
    sessionStorage.setItem("framehouse_print_state", JSON.stringify(printState));
    window.open("/framehouse/print", "_blank");
  };

  const handlePrintClick = () => {
    trackExportClick();
    setViewTab("result");
    handleExportChange({ showExportPanel: true });
  };

  return (
    <CalcAuthGate calcName="Каркасный дом" calcPath="/framehouse">
    <SEOMeta
      title="Калькулятор каркасного дома онлайн 2026"
      description="Рассчитайте стоимость каркасного дома онлайн. Точный расчёт стройматериалов, работ и отделки по вашему проекту."
      keywords="калькулятор каркасного дома, стоимость каркасного дома, расчёт строительства дома"
      path="/framehouse"
      jsonLd={[
        calcJsonLd("Калькулятор каркасного дома", "Онлайн расчёт стоимости строительства каркасного дома под ключ", "/framehouse"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Каркасный дом",url:"/framehouse"}])
      ]}
    />
    <div className="min-h-screen bg-[#f7faf7]">
      <HomePromoBanner />
      <FrameHouseHeader
        config={config}
        bd={bd}
        regionId={regionId}
        markupPct={markupPct}
        viewTab={viewTab}
        onNavigateBack={() => navigate(-1)}
        onPrintClick={handlePrintClick}
        onRegionChange={handleRegionChange}
        onMarkupChange={handleMarkupChange}
        onTabChange={setViewTab}
      />

      <div className="container mx-auto px-4 py-5">
        {viewTab === "config" && (
          <FrameHouseTabConfig
            config={config}
            bd={bd}
            onChange={handleChange}
            onOpenResult={() => setViewTab("result")}
          />
        )}
        {viewTab === "result" && (
          <FrameHouseTabResult
            config={config}
            bd={bd}
            regionId={regionId}
            markupPct={markupPct}
            exportState={exportState}
            onExportChange={handleExportChange}
            onPrint={handlePrint}
            onFindMasters={() => navigate("/masters")}
          />
        )}
      </div>
      <div className="container mx-auto px-4 py-6 space-y-4">
        <CalcResultCTA
          totalSum={bd.total}
          onAction={() => {
            const el = document.getElementById("calc-order-form");
            el?.scrollIntoView({ behavior: "smooth", block: "center" });
          }}
        />
        <div id="calc-order-form">
          <CalcOrderForm
            calcType="Каркасный дом"
            total={`от ${bd.total.toLocaleString("ru-RU")} ₽`}
          />
        </div>
        <CalcEmailCapture
          calcType="Каркасный дом"
          totalSum={bd.total}
          items={[
            { name: "Фундамент", price: bd.foundation },
            { name: "Каркас стен", price: bd.frame },
            { name: "Утепление", price: bd.insulation },
            { name: "Кровельная конструкция", price: bd.roofStructure },
            { name: "Кровельный материал", price: bd.roofing },
            { name: "Фасад", price: bd.facade },
            { name: "Окна", price: bd.windows },
            { name: "Полы", price: bd.floor },
            { name: "Отопление", price: bd.heating },
            { name: "Электрика", price: bd.electrical },
            { name: "Водоснабжение", price: bd.plumbing },
            { name: "Канализация", price: bd.sewage },
            { name: "Внутренняя отделка", price: bd.interiorFinish },
            { name: "Терраса", price: bd.terrace },
            { name: "Гараж", price: bd.garage },
            { name: "Монтажные работы", price: bd.assembly },
          ].filter(r => r.price > 0)}
          params={{
            "Площадь": `${config.totalArea} м²`,
            "Этажей": `${config.floors}`,
            "Регион": regionId,
            ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
          }}
        />
        <CalcFindMaster calcType="Каркасный дом" totalSum={bd.total} />
        <CalcCreateProject calcType="Каркасный дом" totalSum={bd.total} />
      </div>
      <SalesWidget calcContext={{ calcName: "Калькулятор каркасного дома", totalPrice: bd.total }} />
      <CalcStickyBar totalSum={bd.total} calcType="framehouse" shareUrl={buildShareUrl()} />
      <SimilarProjects totalSum={bd.total} calcType="framehouse" />
      <SmartLeadTrigger
        calcType="Каркасный дом"
        totalSum={bd.total}
        progressPct={Math.round(([!!config.style, config.totalArea > 0, config.floors > 0, !!config.wallTech, !!config.foundation, !!config.roofType, !!config.facade, !!config.heating].filter(Boolean).length / 8) * 100)}
        items={[{ name: `Каркасный дом ${config.totalArea} м²`, price: bd.total }]}
        params={{
          "Площадь": `${config.totalArea} м²`,
          "Этажей": `${config.floors}`,
          "Регион": regionId,
          ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
        }}
      />
    </div>
    </CalcAuthGate>
  );
}