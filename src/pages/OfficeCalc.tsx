import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMeta } from "@/hooks/useMeta";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { calcPrice, makeZone, fmtPrice, REGIONS, ZoneConfig } from "./office/officeCalcTypes";
import OfficeZoneEditor from "./office/OfficeZoneEditor";
import OfficeSidebar from "./office/OfficeSidebar";
import SalesWidget from "@/components/calculator/SalesWidget";

const MARKUP_KEY = "office_calc_markup";
const REGION_KEY = "office_calc_region";

export default function OfficeCalc() {
  const navigate = useNavigate();
  useEffect(() => { trackCalcEvent("office", "open"); }, []);

  useMeta({
    title: "Калькулятор отделки офиса, склада — ОФИС",
    description: "Расчёт стоимости ремонта и оснащения коммерческих помещений: офисов, складов, торговых залов. Вентиляция, сигнализация, пожарная безопасность, огнезащита.",
    keywords: "калькулятор офис ремонт, стоимость отделки офиса, огнезащита металлоконструкций, пожарная сигнализация офис, СКУД расчёт",
    canonical: "/office",
  });

  const [regionId, setRegionId] = useState(() => localStorage.getItem(REGION_KEY) || "moscow");
  const [markupPct, setMarkupPct] = useState(() => {
    const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
    return isNaN(v) ? 0 : v;
  });
  const [showMarkup, setShowMarkup] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const [zones, setZones] = useState<ZoneConfig[]>(() => {
    const z = makeZone("Офисный блок");
    z.totalPrice = calcPrice(z, "moscow", 0);
    return [z];
  });
  const [activeId, setActiveId] = useState(zones[0].id);

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<ZoneConfig, "id" | "totalPrice">>) => {
    setZones(prev => prev.map(z => {
      if (z.id !== activeId) return z;
      const updated = { ...z, ...patch };
      return { ...updated, totalPrice: calcPrice(updated, regionId, markupPct) };
    }));
  };

  const recalcAll = (rg: string, mk: number) => {
    setZones(prev => prev.map(z => ({ ...z, totalPrice: calcPrice(z, rg, mk) })));
  };

  const addZone = () => {
    const z = makeZone(`Зона ${zones.length + 1}`);
    z.totalPrice = calcPrice(z, regionId, markupPct);
    setZones(prev => [...prev, z]);
    setActiveId(z.id);
  };

  const removeZone = (id: string) => {
    if (zones.length === 1) return;
    const remaining = zones.filter(z => z.id !== id);
    setZones(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const totalAll = zones.reduce((s, z) => s + z.totalPrice, 0);

  const handleRegionChange = (rg: string) => {
    setRegionId(rg);
    localStorage.setItem(REGION_KEY, rg);
    recalcAll(rg, markupPct);
  };

  const handleMarkup = (v: string) => {
    const n = Math.max(0, Math.min(300, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
    recalcAll(regionId, n);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOMeta
        title="Калькулятор ремонта офиса онлайн 2026"
        description="Рассчитайте стоимость ремонта офиса онлайн. Отделка, электрика, сети, мебель — точная смета по площади и классу отделки."
        keywords="калькулятор ремонта офиса, стоимость ремонта офиса, расчёт отделки офиса"
        path="/office"
        jsonLd={[
          calcJsonLd("Калькулятор ремонта офиса", "Онлайн расчёт стоимости ремонта и отделки офиса", "/office"),
          breadcrumbJsonLd([{name:"Главная",url:"/"},{name:"Калькуляторы",url:"/calculator"},{name:"Ремонт офиса",url:"/office"}])
        ]}
      />
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-20">
        <div className="container mx-auto px-4 py-3 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <Icon name="ArrowLeft" size={18} />
          </Button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Icon name="Building2" size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-gray-900 leading-tight">ОФИС</div>
              <div className="text-xs text-gray-400">Калькулятор коммерческих помещений</div>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-400">Итого по объекту</div>
              <div className="text-lg font-bold text-blue-600">{fmtPrice(totalAll)}</div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowMarkup(!showMarkup)}>
              <Icon name="Percent" size={14} className="mr-1" />
              {markupPct > 0 ? `+${markupPct}%` : "Наценка"}
            </Button>
          </div>
        </div>
        {showMarkup && (
          <div className="bg-amber-50 border-t px-4 py-2 flex items-center gap-3">
            <span className="text-sm text-amber-700">Наценка (%):</span>
            <Input
              type="number" value={markupPct} min={0} max={300}
              onChange={e => handleMarkup(e.target.value)}
              className="w-24 h-7 text-sm"
            />
            <span className="text-xs text-amber-600">Применяется ко всем зонам</span>
          </div>
        )}
      </header>

      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── ЛЕВАЯ КОЛОНКА: список зон + параметры ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Регион */}
            <Card className="p-4">
              <div className="mb-2">
                <Label className="text-xs text-gray-500">Регион объекта</Label>
              </div>
              <select
                value={regionId}
                onChange={e => handleRegionChange(e.target.value)}
                className="w-full h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {Object.entries(
                  REGIONS.reduce<Record<string, typeof REGIONS>>((acc, r) => {
                    if (!acc[r.group]) acc[r.group] = [];
                    acc[r.group].push(r);
                    return acc;
                  }, {})
                ).map(([group, items]) => (
                  <optgroup key={group} label={group}>
                    {items.map(r => (
                      <option key={r.id} value={r.id}>{r.label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Card>

            {/* Вкладки зон */}
            <div className="flex items-center gap-2 flex-wrap">
              {zones.map(z => (
                <button key={z.id} type="button" onClick={() => setActiveId(z.id)}
                  className={`group flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium transition-all ${
                    activeId === z.id ? "bg-blue-600 text-white border-blue-600" : "bg-white border-gray-200 text-gray-700 hover:border-blue-400"
                  }`}>
                  {renamingId === z.id ? (
                    <input
                      autoFocus defaultValue={z.name}
                      className="bg-transparent outline-none w-28 text-sm"
                      onBlur={e => { setZones(p => p.map(x => x.id === z.id ? { ...x, name: e.target.value || x.name } : x)); setRenamingId(null); }}
                      onKeyDown={e => { if (e.key === "Enter") (e.target as HTMLInputElement).blur(); }}
                      onClick={e => e.stopPropagation()}
                    />
                  ) : (
                    <span onDoubleClick={() => setRenamingId(z.id)}>{z.name}</span>
                  )}
                  {activeId === z.id && fmtPrice(z.totalPrice) !== "0 ₽" && (
                    <span className="text-xs opacity-80 ml-1">{fmtPrice(z.totalPrice)}</span>
                  )}
                  {zones.length > 1 && (
                    <span onClick={e => { e.stopPropagation(); removeZone(z.id); }}
                      className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-opacity ml-1 text-xs">✕</span>
                  )}
                </button>
              ))}
              <button type="button" onClick={addZone}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full border border-dashed border-blue-300 text-blue-500 text-sm hover:bg-blue-50 transition-all">
                <Icon name="Plus" size={13} /> Добавить зону
              </button>
            </div>

            {/* Редактор активной зоны */}
            <OfficeZoneEditor zone={activeZone} onChange={updateZone} />
          </div>

          {/* ── ПРАВАЯ КОЛОНКА ── */}
          <OfficeSidebar
            zones={zones}
            activeId={activeId}
            totalAll={totalAll}
            markupPct={markupPct}
            regionId={regionId}
            onSelectZone={setActiveId}
          />
        </div>
      </div>

      <SalesWidget
        calcContext={{
          calcName: "Калькулятор офиса / коммерческих помещений",
          totalPrice: totalAll,
          region: REGIONS.find(r => r.id === regionId)?.label,
          items: zones.map(z => ({ name: z.name, total: z.totalPrice })),
          summary: `${zones.length} зон: ${zones.map(z => `${z.name} ${z.area}м²`).join(", ")}`,
        }}
      />
    </div>
  );
}