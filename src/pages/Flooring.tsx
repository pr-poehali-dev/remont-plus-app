import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { DEFAULT_CONFIG, calcFlooringPrice } from "@/components/calculator/flooring/flooringUtils";
import type { FlooringConfig } from "@/components/calculator/flooring/FlooringTypes";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";
import CalcResultCTA from "@/components/calculator/CalcResultCTA";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import CalcStickyBar from "@/components/calculator/CalcStickyBar";
import { useSessionShare } from "@/hooks/useSessionShare";
import SimilarProjects from "@/components/calculator/SimilarProjects";
import { useCalcFunnel } from "@/hooks/useCalcTracking";
import { usePageGoal } from "@/lib/metrika";
import FlooringHeader from "@/components/calculator/flooring/FlooringHeader";
import FlooringZoneList from "@/components/calculator/flooring/FlooringZoneList";
import FlooringZoneEditor from "@/components/calculator/flooring/FlooringZoneEditor";
import HomePromoBanner from "@/components/home/HomePromoBanner";
import CalcEmailCapture from "@/components/calculator/CalcEmailCapture";
import CalcFindMaster from "@/components/calculator/CalcFindMaster";
import CalcCreateProject from "@/components/calculator/CalcCreateProject";

const MARKUP_KEY = "flooring_markup_pct";
const REGION_KEY = "flooring_region";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "moscow";
}

function makeZone(name = ""): FlooringConfig {
  return {
    ...DEFAULT_CONFIG,
    id: `floor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomName: name,
    totalPrice: 0,
  };
}

export default function Flooring() {
  const navigate = useNavigate();
  usePageGoal("view_calc_flooring");
  const { trackInteract, trackResultView, trackExportClick } = useCalcFunnel('flooring');

  useMeta({
    title: "Расчёт напольных покрытий",
    description: "Онлайн-калькулятор стоимости напольных покрытий: ламинат, паркет, плитка, SPC, виниловая плитка, ковролин. Смета с материалами и монтажом.",
    keywords: "расчёт напольных покрытий, калькулятор ламинат, стоимость укладки паркета, цена плитки, смета полы",
    canonical: "/flooring",
  });

  const [zones, setZones] = useState<FlooringConfig[]>(() => {
    const mk = loadMarkup();
    const rg = loadRegion();
    const z = makeZone("Гостиная");
    const bd = calcFlooringPrice(z, rg, mk);
    return [{ ...z, totalPrice: bd.total }];
  });
  const [activeId, setActiveId] = useState<string>(zones[0].id);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<FlooringConfig, "id">>) => {
    trackInteract();
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      const bd = calcFlooringPrice(updated, regionId, markupPct);
      return { ...updated, totalPrice: bd.total };
    }));
  };

  const recalcAll = (mk: number, rg: string) => {
    setZones(prev => prev.map(z => {
      const bd = calcFlooringPrice(z, rg, mk);
      return { ...z, totalPrice: bd.total };
    }));
  };

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
    recalcAll(n, regionId);
  };

  const handleRegionChange = (rg: string) => {
    setRegionId(rg);
    localStorage.setItem(REGION_KEY, rg);
    recalcAll(markupPct, rg);
  };

  const addZone = (name = "") => {
    const z = makeZone(name);
    const bd = calcFlooringPrice(z, regionId, markupPct);
    const zp = { ...z, totalPrice: bd.total };
    setZones(prev => [...prev, zp]);
    setActiveId(zp.id);
  };

  const removeZone = (id: string) => {
    setZones(prev => {
      const next = prev.filter(z => z.id !== id);
      if (next.length === 0) {
        const fresh = makeZone();
        setActiveId(fresh.id);
        return [fresh];
      }
      if (activeId === id) setActiveId(next[next.length - 1].id);
      return next;
    });
  };

  const duplicateZone = (id: string) => {
    const src = zones.find(z => z.id === id);
    if (!src) return;
    const copy: FlooringConfig = {
      ...src,
      id: `floor-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      roomName: src.roomName ? `${src.roomName} (копия)` : "Копия",
    };
    setZones(prev => {
      const idx = prev.findIndex(z => z.id === id);
      const next = [...prev];
      next.splice(idx + 1, 0, copy);
      return next;
    });
    setActiveId(copy.id);
  };

  const renameZone = (id: string, name: string) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, roomName: name } : z));
  };

  const totalSum = zones.reduce((s, z) => s + z.totalPrice, 0);
  const totalArea = zones.reduce((s, z) => s + (z.area || 0), 0);

  useEffect(() => { if (totalSum > 0) trackResultView(); }, [totalSum, trackResultView]);

  const { buildShareUrl } = useSessionShare(
    { zones, markupPct, regionId },
    "flooring_session",
    (restored: { zones?: FlooringConfig[]; markupPct?: number; regionId?: string }) => {
      if (restored.regionId) {
        setRegionId(restored.regionId);
        localStorage.setItem(REGION_KEY, restored.regionId);
      }
      if (typeof restored.markupPct === "number") {
        setMarkupPct(restored.markupPct);
        localStorage.setItem(MARKUP_KEY, String(restored.markupPct));
      }
      if (Array.isArray(restored.zones) && restored.zones.length > 0) {
        setZones(restored.zones);
        setActiveId(restored.zones[0].id);
      }
    },
  );

  const handleExportConfirm = (data: ExportConfirmData) => {
    const now = new Date();
    const printState = {
      zones,
      markupPct,
      regionId,
      totalSum,
      docNum: String(now.getTime()).slice(-6),
      date: now.toLocaleDateString("ru-RU"),
      ...data,
    };
    sessionStorage.setItem("flooring_print_state", JSON.stringify(printState));
    window.open("/flooring/print", "_blank");
  };

  return (
    <CalcAuthGate calcName="Напольные покрытия" calcPath="/flooring">
      <SEOMeta
        title="Калькулятор напольных покрытий онлайн 2026"
        description="Рассчитайте стоимость укладки напольных покрытий онлайн. Ламинат, паркет, плитка, линолеум — точный расчёт по площади и типу покрытия."
        keywords="калькулятор напольных покрытий, стоимость укладки ламината, расчёт плитки пол"
        path="/flooring"
        jsonLd={[
          calcJsonLd("Калькулятор напольных покрытий", "Онлайн расчёт стоимости укладки ламината, паркета, плитки и линолеума", "/flooring"),
          breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Напольные покрытия",url:"/flooring"}])
        ]}
      />
      <div className="min-h-screen bg-gray-50">
        <HomePromoBanner />
        <FlooringHeader
          totalArea={totalArea}
          zoneCount={zones.length}
          regionId={regionId}
          markupPct={markupPct}
          showMarkup={showMarkup}
          onRegionChange={handleRegionChange}
          onMarkupChange={handleMarkupChange}
          onToggleMarkup={() => setShowMarkup(v => !v)}
          onExport={() => { trackExportClick(); setShowExport(true); }}
          onBack={() => navigate("/")}
        />

        <div className="container mx-auto px-4 py-6">
          <div className="grid lg:grid-cols-5 gap-6">
            <FlooringZoneList
              zones={zones}
              activeId={activeId}
              renamingId={renamingId}
              markupPct={markupPct}
              totalSum={totalSum}
              totalArea={totalArea}
              regionId={regionId}
              onSelectZone={setActiveId}
              onAddZone={addZone}
              onRemoveZone={removeZone}
              onDuplicateZone={duplicateZone}
              onRenameZone={renameZone}
              onStartRename={setRenamingId}
              onStopRename={() => setRenamingId(null)}
              onExport={() => { trackExportClick(); setShowExport(true); }}
            />

            <FlooringZoneEditor
              activeZone={activeZone}
              activeIndex={zones.findIndex(z => z.id === activeId)}
              regionId={regionId}
              markupPct={markupPct}
              onUpdate={updateZone}
            />
          </div>
        </div>

        {showExport && (
          <ExportDialog
            onConfirm={handleExportConfirm}
            onCancel={() => setShowExport(false)}
          />
        )}
        <div className="container mx-auto px-4 py-6 space-y-4">
          <CalcResultCTA
            totalSum={totalSum}
            onAction={() => {
              const el = document.getElementById("calc-order-form");
              el?.scrollIntoView({ behavior: "smooth", block: "center" });
            }}
          />
          <div id="calc-order-form">
            <CalcOrderForm
              calcType="Напольные покрытия"
              total={`от ${totalSum.toLocaleString("ru-RU")} ₽`}
            />
          </div>
          <CalcEmailCapture
            calcType="Полы"
            totalSum={totalSum}
            items={zones.map(z => ({
              name: z.roomName || "Зона",
              price: z.totalPrice,
            }))}
            params={{
              "Площадь": `${totalArea} м²`,
              "Зон": `${zones.length}`,
              "Регион": regionId,
              ...(markupPct > 0 ? { "Наценка": `${markupPct}%` } : {}),
            }}
          />
          <CalcFindMaster calcType="Полы" totalSum={totalSum} />
          <CalcCreateProject calcType="Полы" totalSum={totalSum} />
        </div>
        <SalesWidget calcContext={{ calcName: "Калькулятор напольных покрытий", totalPrice: totalSum }} />
        <CalcStickyBar totalSum={totalSum} totalArea={totalArea} calcType="flooring" shareUrl={buildShareUrl()} />
        <SimilarProjects totalSum={totalSum} calcType="flooring" />
      </div>
    </CalcAuthGate>
  );
}