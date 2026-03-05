import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { DEFAULT_CONFIG, calcFlooringPrice } from "@/components/calculator/flooring/flooringUtils";
import type { FlooringConfig } from "@/components/calculator/flooring/FlooringTypes";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import FlooringHeader from "@/components/calculator/flooring/FlooringHeader";
import FlooringZoneList from "@/components/calculator/flooring/FlooringZoneList";
import FlooringZoneEditor from "@/components/calculator/flooring/FlooringZoneEditor";

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
  useEffect(() => { trackCalcEvent('flooring', 'open'); }, []);

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
        <FlooringHeader
          totalArea={totalArea}
          zoneCount={zones.length}
          regionId={regionId}
          markupPct={markupPct}
          showMarkup={showMarkup}
          onRegionChange={handleRegionChange}
          onMarkupChange={handleMarkupChange}
          onToggleMarkup={() => setShowMarkup(v => !v)}
          onExport={() => setShowExport(true)}
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
              onSelectZone={setActiveId}
              onAddZone={addZone}
              onRemoveZone={removeZone}
              onDuplicateZone={duplicateZone}
              onRenameZone={renameZone}
              onStartRename={setRenamingId}
              onStopRename={() => setRenamingId(null)}
              onExport={() => setShowExport(true)}
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
        <SalesWidget calcContext={{ calcName: "Калькулятор напольных покрытий", totalPrice: totalSum }} />
      </div>
    </CalcAuthGate>
  );
}