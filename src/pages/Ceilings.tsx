import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS } from "@/components/calculator/ceilings/CeilingTypes";
import type { CeilingConfig } from "@/components/calculator/ceilings/CeilingTypes";
import { calcPrice, DEFAULT_CONFIG, fmt } from "@/components/calculator/ceilings/ceilingUtils";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import DocsTab from "@/components/calculator/DocsTab";
import CeilingsHeader from "@/components/calculator/ceilings/CeilingsHeader";
import CeilingsZoneList from "@/components/calculator/ceilings/CeilingsZoneList";
import CeilingsZoneSummary from "@/components/calculator/ceilings/CeilingsZoneSummary";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import { trackCalcEvent } from "@/hooks/useCalcTracking";

const MARKUP_KEY = "ceilings_markup_pct";
const REGION_KEY = "ceilings_region";

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "moscow";
}

function makeZone(name = "", regionId = "moscow"): CeilingConfig {
  return {
    ...DEFAULT_CONFIG,
    regionId,
    id: `ceil-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomName: name,
    totalPrice: 0,
  };
}

export default function Ceilings() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent('ceilings', 'open'); }, []);

  useMeta({
    title: "Расчёт натяжных потолков",
    description: "Онлайн-калькулятор стоимости натяжных потолков. Выберите тип полотна, бренд, освещение и получите смету или коммерческое предложение.",
    keywords: "расчёт натяжных потолков, стоимость натяжного потолка, калькулятор потолков, смета натяжной потолок",
    canonical: "/ceilings",
  });

  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [zones, setZones] = useState<CeilingConfig[]>(() => {
    const mk = loadMarkup();
    const rg = loadRegion();
    const z = makeZone("Гостиная", rg);
    const base = calcPrice(z);
    return [{ ...z, totalPrice: base + (mk > 0 ? Math.round(base * mk / 100) : 0) }];
  });
  const [activeId, setActiveId] = useState<string>(zones[0].id);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<CeilingConfig, "id">>) => {
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      updated.totalPrice = (() => {
        const base = calcPrice(updated);
        const mk = markupPct > 0 ? Math.round(base * markupPct / 100) : 0;
        return base + mk;
      })();
      return updated;
    }));
  };

  const recalcAll = (newMarkup: number, newRegion?: string) => {
    const rg = newRegion ?? regionId;
    setZones(prev => prev.map(z => {
      const updated = { ...z, regionId: rg };
      const base = calcPrice(updated);
      const mk = newMarkup > 0 ? Math.round(base * newMarkup / 100) : 0;
      return { ...updated, totalPrice: base + mk };
    }));
  };

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
    recalcAll(n);
  };

  const handleRegionChange = (rg: string) => {
    setRegionId(rg);
    localStorage.setItem(REGION_KEY, rg);
    recalcAll(markupPct, rg);
  };

  const addZone = (name = "") => {
    const z = makeZone(name, regionId);
    const base = calcPrice(z);
    const mk = markupPct > 0 ? Math.round(base * markupPct / 100) : 0;
    const zWithPrice = { ...z, totalPrice: base + mk };
    setZones(prev => [...prev, zWithPrice]);
    setActiveId(zWithPrice.id);
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
    const copy: CeilingConfig = {
      ...src,
      id: `ceil-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
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
      configs: zones,
      markupPct,
      totalSum,
      docNum: String(now.getTime()).slice(-6),
      date: now.toLocaleDateString("ru-RU"),
      ...data,
    };
    sessionStorage.setItem("ceilings_print_state", JSON.stringify(printState));
    window.open("/ceilings/print", "_blank");
  };

  const ceilingEstimateItems = zones.map(c => {
    const ct = CEILING_TYPES.find(x => x.value === c.ceilingType);
    const lv = CEILING_LEVELS.find(x => x.value === c.level);
    const br = CEILING_BRANDS.find(x => x.id === c.brandId);
    const name = c.roomName
      ? c.roomName
      : [ct?.label, lv?.label, br?.name, `${c.area} м²`].filter(Boolean).join(", ");
    return {
      id: c.id,
      category: "Натяжные потолки",
      name,
      unit: "м²",
      quantity: c.area,
      price: c.area > 0 ? Math.round(c.totalPrice / c.area) : 0,
      total: c.totalPrice,
    };
  });

  return (
    <CalcAuthGate calcName="Натяжные потолки" calcPath="/ceilings">
    <SEOMeta
      title="Калькулятор натяжных потолков онлайн 2026"
      description="Рассчитайте стоимость натяжного потолка онлайн. Точный расчёт по площади, типу полотна и освещению. Смета за 3 минуты."
      keywords="калькулятор натяжных потолков, стоимость натяжного потолка, расчёт потолка онлайн"
      path="/ceilings"
      jsonLd={[
        calcJsonLd("Калькулятор натяжных потолков", "Онлайн расчёт стоимости натяжных потолков по площади и типу полотна", "/ceilings"),
        breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Натяжные потолки",url:"/ceilings"}])
      ]}
    />
    <div className="min-h-screen bg-gray-50">
      <CeilingsHeader
        zoneCount={zones.length}
        totalArea={totalArea}
        regionId={regionId}
        markupPct={markupPct}
        showMarkup={showMarkup}
        onBack={() => navigate("/")}
        onRegionChange={handleRegionChange}
        onMarkupToggle={() => setShowMarkup(v => !v)}
        onMarkupChange={handleMarkupChange}
        onExportOpen={() => setShowExport(true)}
      />

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="config">
          <TabsList className="grid w-full grid-cols-2 mb-6 max-w-xs">
            <TabsTrigger value="config">
              <Icon name="Layers" size={13} className="mr-1.5" />
              Конфигуратор
            </TabsTrigger>
            <TabsTrigger value="docs">
              <Icon name="FileText" size={13} className="mr-1.5" />
              Документы
            </TabsTrigger>
          </TabsList>

          <TabsContent value="config">
            <div className="grid lg:grid-cols-5 gap-6">
              <CeilingsZoneList
                zones={zones}
                activeId={activeId}
                markupPct={markupPct}
                totalSum={totalSum}
                totalArea={totalArea}
                renamingId={renamingId}
                onSelectZone={setActiveId}
                onAddZone={addZone}
                onRemoveZone={removeZone}
                onDuplicateZone={duplicateZone}
                onRenameStart={id => setRenamingId(id)}
                onRenameEnd={() => setRenamingId(null)}
                onRenameChange={renameZone}
                onExportOpen={() => setShowExport(true)}
              />
              <CeilingsZoneSummary
                activeZone={activeZone}
                activeIndex={zones.findIndex(z => z.id === activeId)}
                markupPct={markupPct}
                onUpdate={updateZone}
              />
            </div>
          </TabsContent>

          <TabsContent value="docs">
            <DocsTab
              items={ceilingEstimateItems}
              onCreateDoc={() => setShowExport(true)}
            />
          </TabsContent>
        </Tabs>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={handleExportConfirm}
          onClose={() => setShowExport(false)}
          totalSum={totalSum}
        />
      )}
      <SalesWidget calcContext={{ calcName: "Калькулятор потолков", totalPrice: totalSum }} />
    </div>
    </CalcAuthGate>
  );
}