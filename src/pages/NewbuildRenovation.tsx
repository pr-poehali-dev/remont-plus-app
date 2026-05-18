import { useState, useEffect } from "react";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import { useCalcFunnel } from "@/hooks/useCalcTracking";
import { usePageGoal } from "@/lib/metrika";
import { useMeta } from "@/hooks/useMeta";
import { DEFAULT_NEWBUILD_CONFIG } from "@/components/calculator/newbuild/NewbuildTypes";
import type { NewbuildConfig } from "@/components/calculator/newbuild/NewbuildTypes";
import { calcNewbuildPrice, calcNewbuildProjectTotals } from "@/components/calculator/newbuild/newbuildUtils";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcStickyBar from "@/components/calculator/CalcStickyBar";
import { useSessionShare } from "@/hooks/useSessionShare";
import HomePromoBanner from "@/components/home/HomePromoBanner";
import NewbuildHeader from "@/components/calculator/newbuild/NewbuildHeader";
import NewbuildZonesPanel from "@/components/calculator/newbuild/NewbuildZonesPanel";
import NewbuildEditor from "@/components/calculator/newbuild/NewbuildEditor";

const MARKUP_KEY = "newbuild_markup_pct";
const REGION_KEY = "newbuild_region";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "moscow";
}

function makeZone(name = ""): NewbuildConfig {
  return {
    ...DEFAULT_NEWBUILD_CONFIG,
    id: `nb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomName: name,
    totalPrice: 0,
  };
}

export default function NewbuildRenovation() {
  usePageGoal("view_calc_newbuild");
  const { trackInteract, trackResultView, trackExportClick } = useCalcFunnel('newbuild');

  useMeta({
    title: "Расчёт ремонта в новостройке",
    description: "Онлайн-калькулятор стоимости ремонта в новостройке: стяжка, штукатурка, покраска, полы, электрика, двери. Смета на ремонт квартиры.",
    keywords: "расчёт ремонта новостройка, калькулятор ремонт квартиры, стоимость отделки, смета ремонт, цена ремонта",
    canonical: "/newbuild",
  });

  const [zones, setZones] = useState<NewbuildConfig[]>(() => {
    const mk = loadMarkup();
    const rg = loadRegion();
    const z = makeZone("Спальня");
    const bd = calcNewbuildPrice(z, rg, mk);
    return [{ ...z, totalPrice: bd.total }];
  });
  const [activeId, setActiveId] = useState<string>(zones[0].id);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [foremanIncluded, setForemanIncluded] = useState(false);
  const [foremanPct, setForemanPct] = useState(10);
  const [supplierIncluded, setSupplierIncluded] = useState(false);
  const [supplierPct, setSupplierPct] = useState(5);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const orderFormRef = { current: null as HTMLDivElement | null };

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<NewbuildConfig, "id">>) => {
    trackInteract();
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      const bd = calcNewbuildPrice(updated, regionId, markupPct);
      return { ...updated, totalPrice: bd.total };
    }));
  };

  const recalcAll = (mk: number, rg: string) => {
    setZones(prev => prev.map(z => {
      const bd = calcNewbuildPrice(z, rg, mk);
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
    const bd = calcNewbuildPrice(z, regionId, markupPct);
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
    const copy: NewbuildConfig = {
      ...src,
      id: `nb-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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

  const allBreakdowns = zones.map(z => calcNewbuildPrice(z, regionId, 0));
  const projectTotals = calcNewbuildProjectTotals(allBreakdowns, foremanIncluded, foremanPct, supplierIncluded, supplierPct, markupPct);
  const totalSum = projectTotals.total;
  const totalArea = zones.reduce((s, z) => s + (z.area || 0), 0);

  useEffect(() => { if (totalSum > 0) trackResultView(); }, [totalSum, trackResultView]);

  const { buildShareUrl } = useSessionShare(
    { zones, markupPct, regionId, foremanIncluded, foremanPct, supplierIncluded, supplierPct },
    "newbuild_session",
    (restored: {
      zones?: NewbuildConfig[];
      markupPct?: number;
      regionId?: string;
      foremanIncluded?: boolean;
      foremanPct?: number;
      supplierIncluded?: boolean;
      supplierPct?: number;
    }) => {
      if (restored.regionId) {
        setRegionId(restored.regionId);
        localStorage.setItem(REGION_KEY, restored.regionId);
      }
      if (typeof restored.markupPct === "number") {
        setMarkupPct(restored.markupPct);
        localStorage.setItem(MARKUP_KEY, String(restored.markupPct));
      }
      if (typeof restored.foremanIncluded === "boolean") setForemanIncluded(restored.foremanIncluded);
      if (typeof restored.foremanPct === "number") setForemanPct(restored.foremanPct);
      if (typeof restored.supplierIncluded === "boolean") setSupplierIncluded(restored.supplierIncluded);
      if (typeof restored.supplierPct === "number") setSupplierPct(restored.supplierPct);
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
      foremanIncluded, foremanPct,
      supplierIncluded, supplierPct,
      docNum: String(now.getTime()).slice(-6),
      date: now.toLocaleDateString("ru-RU"),
      ...data,
    };
    sessionStorage.setItem("newbuild_print_state", JSON.stringify(printState));
    window.open("/newbuild/print", "_blank");
  };

  return (
    <CalcAuthGate calcName="Новостройка" calcPath="/newbuild">
    <HomePromoBanner />
    <SEOMeta
      title="Калькулятор ремонта новостройки онлайн 2026"
      description="Рассчитайте стоимость ремонта квартиры в новостройке онлайн. Черновой и чистовой ремонт, отделка под ключ. Смета по всем комнатам."
      keywords="калькулятор ремонта новостройки, стоимость ремонта квартиры, расчёт отделки новостройка"
      path="/newbuild"
      jsonLd={[
        calcJsonLd("Калькулятор ремонта новостройки", "Онлайн расчёт стоимости ремонта квартиры в новостройке под ключ", "/newbuild"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Ремонт новостройки",url:"/newbuild"}])
      ]}
    />
    <div className="min-h-screen bg-gray-50">
      <NewbuildHeader
        zonesCount={zones.length}
        totalArea={totalArea}
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

          <NewbuildZonesPanel
            zones={zones}
            activeId={activeId}
            renamingId={renamingId}
            totalSum={totalSum}
            totalArea={totalArea}
            markupPct={markupPct}
            regionId={regionId}
            projectTotals={projectTotals}
            foremanIncluded={foremanIncluded}
            foremanPct={foremanPct}
            supplierIncluded={supplierIncluded}
            supplierPct={supplierPct}
            onSelectZone={setActiveId}
            onAddZone={addZone}
            onRemoveZone={removeZone}
            onDuplicateZone={duplicateZone}
            onRenameZone={renameZone}
            onSetRenamingId={setRenamingId}
            onShowExport={() => setShowExport(true)}
          />

          <NewbuildEditor
            zones={zones}
            activeZone={activeZone}
            activeId={activeId}
            regionId={regionId}
            markupPct={markupPct}
            totalSum={totalSum}
            projectTotals={projectTotals}
            foremanIncluded={foremanIncluded}
            foremanPct={foremanPct}
            supplierIncluded={supplierIncluded}
            supplierPct={supplierPct}
            onUpdateZone={updateZone}
            onForemanIncludedChange={setForemanIncluded}
            onForemanPctChange={setForemanPct}
            onSupplierIncludedChange={setSupplierIncluded}
            onSupplierPctChange={setSupplierPct}
            orderFormRef={orderFormRef}
          />
        </div>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={data => { handleExportConfirm(data); setShowExport(false); }}
          onCancel={() => setShowExport(false)}
        />
      )}
      <SalesWidget calcContext={{ calcName: "Калькулятор новостройки", totalPrice: totalSum }} />
      <CalcStickyBar totalSum={totalSum} totalArea={totalArea} calcType="newbuild" shareUrl={buildShareUrl()} />
    </div>
    </CalcAuthGate>
  );
}
