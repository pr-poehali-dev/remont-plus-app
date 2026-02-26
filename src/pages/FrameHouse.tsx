import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import { DEFAULT_FRAMEHOUSE_CONFIG } from "@/components/calculator/framehouse/FrameHouseTypes";
import type { FrameHouseConfig } from "@/components/calculator/framehouse/FrameHouseTypes";
import { calcFrameHousePrice } from "@/components/calculator/framehouse/frameHouseUtils";
import FrameHouseHeader from "@/components/framehouse/FrameHouseHeader";
import type { ViewTab } from "@/components/framehouse/FrameHouseHeader";
import FrameHouseTabConfig from "@/components/framehouse/FrameHouseTabConfig";
import FrameHouseTabResult from "@/components/framehouse/FrameHouseTabResult";

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
  docType: "smeta" | "kp";
  validDays: string;
}

export default function FrameHouse() {
  const navigate = useNavigate();

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

  const [exportState, setExportState] = useState<ExportState>({
    showExportPanel: false,
    customer: "",
    contractor: "",
    address: "",
    phone: "",
    email: "",
    docType: "smeta",
    validDays: "30",
  });

  const handleChange = useCallback((patch: Partial<FrameHouseConfig>) => {
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

  const bd = useMemo(() => calcFrameHousePrice(config, regionId, markupPct), [config, regionId, markupPct]);

  const handlePrint = () => {
    const now = new Date();
    navigate("/framehouse/print", {
      state: {
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
        validDays: exportState.validDays,
      },
    });
  };

  const handlePrintClick = () => {
    setViewTab("result");
    handleExportChange({ showExportPanel: true });
  };

  return (
    <div className="min-h-screen bg-[#f7faf7]">
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
    </div>
  );
}
