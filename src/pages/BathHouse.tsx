import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { DEFAULT_BATHHOUSE_CONFIG } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import { calcBathHousePrice } from "@/components/calculator/bathhouse/bathHouseUtils";
import BathHouseHeader from "@/components/bathhouse/BathHouseHeader";
import BathHouseTabConfig from "@/components/bathhouse/BathHouseTabConfig";
import BathHouseTabScheme from "@/components/bathhouse/BathHouseTabScheme";
import BathHouseTabResult from "@/components/bathhouse/BathHouseTabResult";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

const REGION_KEY = "bathhouse_region";
const MARKUP_KEY = "bathhouse_markup";

function loadRegion() { return localStorage.getItem(REGION_KEY) || "moscow"; }
function loadMarkup() { const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0"); return isNaN(v) ? 0 : v; }

function makeConfig(): BathHouseConfig {
  return { ...DEFAULT_BATHHOUSE_CONFIG, id: `bath-${Date.now()}`, region: loadRegion() };
}

type ViewTab = "config" | "scheme" | "result";

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

export default function BathHouse() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent('bathhouse', 'open'); }, []);

  useMeta({
    title: "Калькулятор строительства бани — АВАНГАРД",
    description: "Онлайн-калькулятор строительства бани с нуля: материалы стен, фундамент, крыша, печь, вентиляция, отделка. Смета и схемы помещений.",
    keywords: "калькулятор строительства бани, стоимость бани под ключ, баня из бруса цена, каркасная баня, кирпичная баня, баня из газобетона, смета баня",
    canonical: "/bathhouse",
  });

  const [config, setConfig] = useState<BathHouseConfig>(makeConfig);
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

  const handleChange = useCallback((patch: Partial<BathHouseConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

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

  const bd = useMemo(() => calcBathHousePrice(config, regionId, markupPct), [config, regionId, markupPct]);

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
    sessionStorage.setItem("bathhouse_print_state", JSON.stringify(printState));
    window.open("/bathhouse/print", "_blank");
  };

  const handlePrintClick = () => {
    setViewTab("result");
    handleExportChange({ showExportPanel: true });
  };

  return (
    <CalcAuthGate calcName="Баня под ключ" calcPath="/bathhouse">
    <SEOMeta
      title="Калькулятор строительства бани онлайн 2026"
      description="Рассчитайте стоимость строительства бани онлайн. Каркасная, брусовая, из бревна — точный расчёт материалов и работ."
      keywords="калькулятор строительства бани, стоимость бани под ключ, расчёт бани из бруса"
      path="/bathhouse"
      jsonLd={[
        calcJsonLd("Калькулятор строительства бани", "Онлайн расчёт стоимости строительства бани из бруса, каркаса и бревна", "/bathhouse"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Строительство бани",url:"/bathhouse"}])
      ]}
    />
    <div className="min-h-screen bg-[#fafaf8]">
      <BathHouseHeader
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
          <BathHouseTabConfig
            config={config}
            bd={bd}
            onChange={handleChange}
            onOpenResult={() => setViewTab("result")}
          />
        )}

        {viewTab === "scheme" && (
          <BathHouseTabScheme config={config} />
        )}

        {viewTab === "result" && (
          <BathHouseTabResult
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
      <SalesWidget calcContext={{ calcName: "Калькулятор бани", totalPrice: bd.total }} />
    </div>
    </CalcAuthGate>
  );
}