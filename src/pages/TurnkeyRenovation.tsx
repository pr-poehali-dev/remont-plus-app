import { useState, useEffect } from "react";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { useMeta } from "@/hooks/useMeta";
import { DEFAULT_TURNKEY_CONFIG } from "@/components/calculator/turnkey/TurnkeyTypes";
import type { TurnkeyConfig } from "@/components/calculator/turnkey/TurnkeyTypes";
import { calcTurnkeyPrice } from "@/components/calculator/turnkey/turnkeyUtils";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import CalcStickyBar from "@/components/calculator/CalcStickyBar";
import { useSessionShare } from "@/hooks/useSessionShare";
import { useCalcFunnel } from "@/hooks/useCalcTracking";
import { usePageGoal } from "@/lib/metrika";
import HomePromoBanner from "@/components/home/HomePromoBanner";
import TurnkeyHeader from "@/components/calculator/turnkey/TurnkeyHeader";
import TurnkeyConfigPanel from "@/components/calculator/turnkey/TurnkeyConfigPanel";
import TurnkeySummaryPanel from "@/components/calculator/turnkey/TurnkeySummaryPanel";
import SmartLeadTrigger from "@/components/calculator/SmartLeadTrigger";

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
  usePageGoal("view_calc_turnkey");
  const { trackInteract, trackResultView, trackExportClick } = useCalcFunnel('turnkey');

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
    trackInteract();
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

  useEffect(() => { if (cfg.totalPrice > 0) trackResultView(); }, [cfg.totalPrice, trackResultView]);

  const { buildShareUrl } = useSessionShare(
    { cfg, regionId, markupPct },
    "turnkey_session",
    (restored: { cfg?: TurnkeyConfig; regionId?: string; markupPct?: number }) => {
      if (restored.regionId) {
        setRegionId(restored.regionId);
        localStorage.setItem(REGION_KEY, restored.regionId);
      }
      if (typeof restored.markupPct === "number") {
        setMarkupPct(restored.markupPct);
        localStorage.setItem(MARKUP_KEY, String(restored.markupPct));
      }
      if (restored.cfg) {
        const rg = restored.regionId ?? regionId;
        const mk = typeof restored.markupPct === "number" ? restored.markupPct : markupPct;
        const bd = calcTurnkeyPrice(restored.cfg, rg, mk);
        setCfg({ ...restored.cfg, totalPrice: bd.total });
      }
    },
  );

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
      <HomePromoBanner />
      <TurnkeyHeader
        cfg={cfg}
        regionId={regionId}
        markupPct={markupPct}
        showMarkup={showMarkup}
        onRegionChange={handleRegionChange}
        onToggleMarkup={() => setShowMarkup(v => !v)}
        onMarkupChange={handleMarkupChange}
        onExport={() => { trackExportClick(); setShowExport(true); }}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <TurnkeyConfigPanel
            cfg={cfg}
            regionId={regionId}
            onUpdate={updateCfg}
          />

          <TurnkeySummaryPanel
            cfg={cfg}
            regionId={regionId}
            markupPct={markupPct}
            onShowExport={() => setShowExport(true)}
          />
        </div>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={data => { handleExportConfirm(data); setShowExport(false); }}
          onCancel={() => setShowExport(false)}
        />
      )}
      <CalcStickyBar totalSum={cfg.totalPrice} totalArea={cfg.totalAreaM2} calcType="turnkey" shareUrl={buildShareUrl()} />
      <SmartLeadTrigger
        calcType="Ремонт под ключ"
        totalSum={cfg.totalPrice}
        progressPct={Math.round(([!!cfg.apartmentType, cfg.totalAreaM2 > 0, !!cfg.renovationLevel, !!cfg.floorType, !!cfg.ceilingType, cfg.bathroomCount > 0, !!cfg.bathroomLevel].filter(Boolean).length / 7) * 100)}
        items={[{ name: `Ремонт ${cfg.totalAreaM2} м²`, price: cfg.totalPrice }]}
        params={{
          "Площадь": `${cfg.totalAreaM2} м²`,
          "Регион": regionId,
          ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
        }}
      />
    </div>
    </CalcAuthGate>
  );
}