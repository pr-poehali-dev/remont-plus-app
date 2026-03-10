import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { DEFAULT_BATHROOM_CONFIG } from "@/components/calculator/bathroom/BathroomTypes";
import type { BathroomConfig } from "@/components/calculator/bathroom/BathroomTypes";
import { calcBathroomPrice } from "@/components/calculator/bathroom/bathroomUtils";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import BathroomHeader from "@/components/bathroom/BathroomHeader";
import BathroomZoneList from "@/components/bathroom/BathroomZoneList";
import BathroomZoneEditor from "@/components/bathroom/BathroomZoneEditor";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

const MARKUP_KEY = "bathroom_markup_pct";
const REGION_KEY = "bathroom_region";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "moscow";
}

function makeZone(name = ""): BathroomConfig {
  return {
    ...DEFAULT_BATHROOM_CONFIG,
    id: `bath-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomName: name,
    totalPrice: 0,
  };
}

export default function Bathroom() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent('bathroom', 'open'); }, []);

  useMeta({
    title: "Расчёт ремонта санузла",
    description: "Онлайн-калькулятор ремонта ванной комнаты и санузла: плитка, сантехника, гидроизоляция, тёплый пол. Смета на ремонт ванной.",
    keywords: "расчёт ремонта ванной, калькулятор санузел, стоимость плитки, цена сантехника, смета ванная комната",
    canonical: "/bathroom",
  });

  const [zones, setZones] = useState<BathroomConfig[]>(() => {
    const mk = loadMarkup();
    const rg = loadRegion();
    const z = makeZone("Ванная");
    const bd = calcBathroomPrice(z, rg, mk);
    return [{ ...z, totalPrice: bd.total }];
  });
  const [activeId, setActiveId] = useState<string>(zones[0].id);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<BathroomConfig, "id">>) => {
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      const bd = calcBathroomPrice(updated, regionId, markupPct);
      return { ...updated, totalPrice: bd.total };
    }));
  };

  const recalcAll = (mk: number, rg: string) => {
    setZones(prev => prev.map(z => {
      const bd = calcBathroomPrice(z, rg, mk);
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
    const bd = calcBathroomPrice(z, regionId, markupPct);
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
    const copy: BathroomConfig = {
      ...src,
      id: `bath-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    sessionStorage.setItem("bathroom_print_state", JSON.stringify(printState));
    window.open("/bathroom/print", "_blank");
  };

  const activeBreakdown = calcBathroomPrice(activeZone, regionId, markupPct);
  const activeIndex = zones.findIndex(z => z.id === activeId);

  return (
    <CalcAuthGate calcName="Ремонт санузла" calcPath="/bathroom">
    <SEOMeta
      title="Калькулятор ремонта ванной комнаты онлайн 2026"
      description="Рассчитайте стоимость ремонта ванной комнаты онлайн. Точный расчёт плитки, сантехники, отделки по вашим размерам. Смета за 5 минут."
      keywords="калькулятор ремонта ванной комнаты, стоимость ремонта ванной, расчёт плитки ванная"
      path="/bathroom"
      jsonLd={[
        calcJsonLd("Калькулятор ремонта ванной комнаты", "Онлайн расчёт стоимости ремонта ванной комнаты с учётом плитки, сантехники и отделки", "/bathroom"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Ванная комната",url:"/bathroom"}])
      ]}
    />
    <div className="min-h-screen bg-gray-50">
      <BathroomHeader
        zonesCount={zones.length}
        totalArea={totalArea}
        regionId={regionId}
        markupPct={markupPct}
        showMarkup={showMarkup}
        onNavigateBack={() => navigate("/")}
        onRegionChange={handleRegionChange}
        onMarkupChange={handleMarkupChange}
        onToggleMarkup={() => setShowMarkup(v => !v)}
        onOpenExport={() => setShowExport(true)}
      />

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">
          <BathroomZoneList
            zones={zones}
            activeId={activeId}
            renamingId={renamingId}
            markupPct={markupPct}
            totalSum={totalSum}
            totalArea={totalArea}
            onSelectZone={setActiveId}
            onAddZone={addZone}
            onRemoveZone={removeZone}
            onDuplicateZone={duplicateZone}
            onRenameZone={renameZone}
            onSetRenamingId={setRenamingId}
            onOpenExport={() => setShowExport(true)}
          />

          <BathroomZoneEditor
            activeZone={activeZone}
            activeIndex={activeIndex}
            activeBreakdown={activeBreakdown}
            markupPct={markupPct}
            regionId={regionId}
            onUpdateZone={updateZone}
          />
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