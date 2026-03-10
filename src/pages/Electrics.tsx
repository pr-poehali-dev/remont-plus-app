import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { DEFAULT_ELECTRICS_CONFIG } from "@/components/calculator/electrics/ElectricsTypes";
import type { ElectricsConfig } from "@/components/calculator/electrics/ElectricsTypes";
import { calcElectricsPrice } from "@/components/calculator/electrics/electricsUtils";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import ElectricsHeader from "@/components/calculator/electrics/ElectricsHeader";
import ElectricsZoneList from "@/components/calculator/electrics/ElectricsZoneList";
import ElectricsZoneEditor from "@/components/calculator/electrics/ElectricsZoneEditor";

const MARKUP_KEY = "electrics_markup_pct";
const REGION_KEY = "electrics_region";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "moscow";
}

function makeZone(name = ""): ElectricsConfig {
  return {
    ...DEFAULT_ELECTRICS_CONFIG,
    id: `elec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomName: name,
    totalPrice: 0,
  };
}

export default function Electrics() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent('electrics', 'open'); }, []);

  useMeta({
    title: "Расчёт электромонтажных работ",
    description: "Онлайн-калькулятор стоимости электрики: розетки, выключатели, прокладка кабеля, монтаж щитка. Смета на электромонтаж.",
    keywords: "расчёт электрики, калькулятор электромонтаж, стоимость проводки, цена розетки, смета электрика",
    canonical: "/electrics",
  });

  const [zones, setZones] = useState<ElectricsConfig[]>(() => {
    const mk = loadMarkup();
    const rg = loadRegion();
    const z = makeZone("Спальня");
    const bd = calcElectricsPrice(z, rg, mk);
    return [{ ...z, totalPrice: bd.total }];
  });
  const [activeId, setActiveId] = useState<string>(zones[0].id);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<ElectricsConfig, "id">>) => {
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      const bd = calcElectricsPrice(updated, regionId, markupPct);
      return { ...updated, totalPrice: bd.total };
    }));
  };

  const recalcAll = (mk: number, rg: string) => {
    setZones(prev => prev.map(z => {
      const bd = calcElectricsPrice(z, rg, mk);
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
    const bd = calcElectricsPrice(z, regionId, markupPct);
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
    const copy: ElectricsConfig = {
      ...src,
      id: `elec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
    sessionStorage.setItem("electrics_print_state", JSON.stringify(printState));
    window.open("/electrics/print", "_blank");
  };

  return (
    <CalcAuthGate calcName="Электромонтаж" calcPath="/electrics">
      <SEOMeta
        title="Калькулятор электрики в квартире онлайн 2026"
        description="Рассчитайте стоимость электрики в квартире онлайн. Расчёт проводки, розеток, щитка и светильников по комнатам."
        keywords="калькулятор электрики, стоимость электрики в квартире, расчёт проводки онлайн"
        path="/electrics"
        jsonLd={[
          calcJsonLd("Калькулятор электрики", "Онлайн расчёт стоимости электромонтажных работ в квартире", "/electrics"),
          breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Электрика",url:"/electrics"}])
        ]}
      />
      <div className="min-h-screen bg-gray-50">
        <ElectricsHeader
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
            <ElectricsZoneList
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

            <ElectricsZoneEditor
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
            onConfirm={data => { handleExportConfirm(data); setShowExport(false); }}
            onCancel={() => setShowExport(false)}
          />
        )}
        <SalesWidget calcContext={{ calcName: "Калькулятор электрики", totalPrice: totalSum }} />
      </div>
    </CalcAuthGate>
  );
}