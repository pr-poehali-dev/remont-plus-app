import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SEOMeta, { calcJsonLd, breadcrumbJsonLd } from "@/components/SEOMeta";
import CalcAuthGate from "@/components/calculator/CalcAuthGate";
import SalesWidget from "@/components/calculator/SalesWidget";
import { trackCalcEvent } from "@/hooks/useCalcTracking";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import {
  REGIONS, ROOM_TYPES, RENOVATION_LEVELS, FLOORING_TYPES, DEFAULT_NEWBUILD_CONFIG,
} from "@/components/calculator/newbuild/NewbuildTypes";
import type { NewbuildConfig } from "@/components/calculator/newbuild/NewbuildTypes";
import { calcNewbuildPrice, calcNewbuildProjectTotals, calcNewbuildMaterials, fmt } from "@/components/calculator/newbuild/newbuildUtils";
import MaterialsTable from "@/components/calculator/shared/MaterialsTable";
import NewbuildConfigForm from "@/components/calculator/newbuild/NewbuildConfigForm";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import CalcOrderForm from "@/components/calculator/CalcOrderForm";

const MARKUP_KEY = "newbuild_markup_pct";
const REGION_KEY = "newbuild_region";

const ROOM_PRESETS = ["Спальня", "Гостиная", "Кухня", "Ванная", "Прихожая", "Балкон", "Детская", "Кабинет"];

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
  const navigate = useNavigate();

  useEffect(() => { trackCalcEvent('newbuild', 'open'); }, []);

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

  const activeZone = zones.find(z => z.id === activeId) ?? zones[0];

  const updateZone = (patch: Partial<Omit<NewbuildConfig, "id">>) => {
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

  const activeBreakdown = calcNewbuildPrice(activeZone, regionId, markupPct);
  const activeRoomType = ROOM_TYPES.find(r => r.id === activeZone.roomType);
  const activeLevel = RENOVATION_LEVELS.find(l => l.id === activeZone.renovationLevel);
  const activeFlooringType = FLOORING_TYPES.find(f => f.id === activeZone.flooringType);

  return (
    <CalcAuthGate calcName="Новостройка" calcPath="/newbuild">
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
      {/* Шапка */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="Building2" size={20} className="text-orange-600" />
                  Ремонт в новостройке
                </h1>
                <p className="text-sm text-gray-500">
                  {zones.length} {zones.length === 1 ? "помещение" : zones.length < 5 ? "помещения" : "помещений"} · {fmt(Math.round(totalArea * 10) / 10)} м²
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={regionId}
                onChange={e => handleRegionChange(e.target.value)}
                className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 cursor-pointer hover:border-orange-400 transition-colors"
              >
                {REGIONS.map(r => (
                  <option key={r.id} value={r.id}>{r.label}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMarkup(v => !v)}
                className={markupPct > 0 ? "border-orange-300 text-orange-600" : ""}
              >
                <Icon name="Percent" size={15} className="mr-1.5" />
                Наценка{markupPct > 0 ? ` ${markupPct}%` : ""}
              </Button>
              <Button
                size="sm"
                onClick={() => setShowExport(true)}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                <Icon name="FileText" size={15} className="mr-1.5" />
                Документ
              </Button>
            </div>
          </div>

          {showMarkup && (
            <div className="mt-3 pb-3 border-t pt-3 flex items-center gap-3 max-w-sm">
              <Label className="text-sm whitespace-nowrap">Наценка на все зоны, %</Label>
              <Input
                type="number" min={0} max={200}
                value={markupPct}
                onChange={e => handleMarkupChange(e.target.value)}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-gray-400">0–200%</span>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-5 gap-6">

          {/* Левая панель — список зон */}
          <div className="lg:col-span-2 space-y-3">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Icon name="Zap" size={11} />
                Быстрое добавление
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_PRESETS.map(name => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => addZone(name)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-orange-400 hover:text-orange-700 hover:bg-orange-50 transition-all"
                  >
                    + {name}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => addZone()}
                  className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-orange-400 hover:text-orange-600 transition-all"
                >
                  + Своё
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {zones.map((z, i) => {
                const isActive = z.id === activeId;
                const rt = ROOM_TYPES.find(r => r.id === z.roomType);
                const lv = RENOVATION_LEVELS.find(l => l.id === z.renovationLevel);
                return (
                  <div
                    key={z.id}
                    onClick={() => setActiveId(z.id)}
                    className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                      isActive
                        ? "border-orange-400 bg-orange-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-orange-200 hover:bg-orange-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isActive ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {renamingId === z.id ? (
                            <input
                              autoFocus
                              className="w-full text-sm font-semibold border-b border-orange-400 bg-transparent outline-none pb-0.5"
                              value={z.roomName}
                              onChange={e => renameZone(z.id, e.target.value)}
                              onBlur={() => setRenamingId(null)}
                              onKeyDown={e => e.key === "Enter" && setRenamingId(null)}
                              onClick={e => e.stopPropagation()}
                            />
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {z.roomName || `Помещение ${i + 1}`}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 truncate mt-0.5">
                            {rt?.label} · {z.area} м² · {lv?.label}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isActive ? "text-orange-700" : "text-gray-700"}`}>
                          {fmt(z.totalPrice)} ₽
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {z.area > 0 ? `${fmt(Math.round(z.totalPrice / z.area))} ₽/м²` : ""}
                        </p>
                      </div>
                    </div>

                    <div className={`flex gap-1 mt-2 pt-2 border-t border-gray-100 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); setRenamingId(z.id); }}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-600 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <Icon name="Pencil" size={11} />
                        Переименовать
                      </button>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); duplicateZone(z.id); }}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-orange-600 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <Icon name="Copy" size={11} />
                        Копировать
                      </button>
                      {zones.length > 1 && (
                        <button
                          type="button"
                          onClick={e => { e.stopPropagation(); removeZone(z.id); }}
                          className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 px-1.5 py-0.5 rounded transition-colors ml-auto"
                        >
                          <Icon name="Trash2" size={11} />
                          Удалить
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Итого */}
            <Card className="p-4 bg-gradient-to-br from-orange-600 to-orange-800 border-0 text-white">
              <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-2">Итого по всем помещениям</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold">{fmt(totalSum)} ₽</p>
                  <p className="text-xs opacity-60 mt-0.5">
                    {fmt(Math.round(totalArea * 10) / 10)} м² · {zones.length} {zones.length === 1 ? "зона" : zones.length < 5 ? "зоны" : "зон"}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setShowExport(true)}
                  className="bg-white/20 hover:bg-white/30 text-white border-0 text-xs"
                >
                  <Icon name="FileText" size={13} className="mr-1" />
                  Документ
                </Button>
              </div>
              <div className="mt-3 pt-2 border-t border-white/20 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <p className="opacity-60">Работы</p>
                  <p className="font-semibold">{fmt(projectTotals.worksTotal - projectTotals.materialsTotal)} ₽</p>
                </div>
                <div>
                  <p className="opacity-60">Материалы</p>
                  <p className="font-semibold">{fmt(projectTotals.materialsTotal)} ₽</p>
                </div>
              </div>
              {markupPct > 0 && (
                <p className="text-xs opacity-60 mt-2 flex items-center gap-1">
                  <Icon name="Info" size={11} />
                  Включая наценку {markupPct}%
                </p>
              )}
            </Card>
          </div>

          {/* Правая панель — редактор */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-orange-600 text-white flex items-center justify-center text-xs font-bold">
                  {zones.findIndex(z => z.id === activeId) + 1}
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {activeZone.roomName || `Помещение ${zones.findIndex(z => z.id === activeId) + 1}`}
                </h2>
                <span className="text-sm text-gray-400 ml-1">— настройка ремонта</span>
              </div>

              <Card className="p-5">
                <NewbuildConfigForm cfg={activeZone} onUpdate={updateZone} />
              </Card>

              {/* Детализация */}
              <Card className="p-4 border-orange-200 bg-orange-50">
                <p className="text-xs font-semibold text-orange-700 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Icon name="Receipt" size={13} />
                  Детализация стоимости
                </p>

                <div className="flex gap-2 mb-3 pb-3 border-b border-orange-200">
                  <div className="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center shrink-0">
                    <Icon name={activeRoomType?.icon as Parameters<typeof Icon>[0]["name"] ?? "Home"} size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      {activeRoomType?.label} · {activeLevel?.label}
                    </p>
                    <p className="text-xs text-gray-500">
                      {activeZone.area} м² · потолок {activeZone.ceilingHeightM} м
                    </p>
                  </div>
                  {activeFlooringType && (
                    <div className="ml-auto text-right">
                      <p className="text-xs text-gray-500">Пол</p>
                      <p className="text-xs font-semibold text-gray-700">{activeFlooringType.label}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5 text-sm">
                  {activeBreakdown.screedCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Стяжка пола</span>
                      <span className="font-medium">{fmt(activeBreakdown.screedCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.plasterCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Штукатурка стен</span>
                      <span className="font-medium">{fmt(activeBreakdown.plasterCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.ceilingCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Отделка потолка</span>
                      <span className="font-medium">{fmt(activeBreakdown.ceilingCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.paintCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Малярные работы</span>
                      <span className="font-medium">{fmt(activeBreakdown.paintCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.flooringCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Напольное покрытие</span>
                      <span className="font-medium">{fmt(activeBreakdown.flooringCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.electricsCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Электромонтаж</span>
                      <span className="font-medium">{fmt(activeBreakdown.electricsCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.doorsCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Двери ({activeZone.doorsCount} шт.)</span>
                      <span className="font-medium">{fmt(activeBreakdown.doorsCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.windowSlopesCost > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Откосы окон</span>
                      <span className="font-medium">{fmt(activeBreakdown.windowSlopesCost)} ₽</span>
                    </div>
                  )}


                  <div className="border-t border-orange-200 pt-1.5 mt-1.5 space-y-1">
                    <div className="flex justify-between text-gray-500 text-xs">
                      <span>Уровень ×{activeBreakdown.levelCoeff} · Регион ×{activeBreakdown.regionCoeff}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Работы</span>
                      <span className="font-medium">{fmt(activeBreakdown.subtotal - activeBreakdown.materialsCost)} ₽</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Материалы</span>
                      <span className="font-medium">{fmt(activeBreakdown.materialsCost)} ₽</span>
                    </div>
                    {markupPct > 0 && (
                      <div className="flex justify-between text-orange-600">
                        <span>Наценка {markupPct}%</span>
                        <span>+ {fmt(activeBreakdown.markupAmount)} ₽</span>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between text-base font-bold text-orange-700 pt-1">
                    <span>ИТОГО</span>
                    <span>{fmt(activeBreakdown.total)} ₽</span>
                  </div>
                  {activeZone.area > 0 && (
                    <p className="text-xs text-gray-400 text-right">
                      {fmt(Math.round(activeBreakdown.total / activeZone.area))} ₽/м²
                    </p>
                  )}
                </div>
              </Card>

              {/* Ведомость материалов */}
              <MaterialsTable
                items={calcNewbuildMaterials(activeZone, activeBreakdown, regionId)}
                accentColor="indigo"
              />

              <CalcOrderForm
                calcType="Новостройка"
                total={`от ${fmt(totalSum)} ₽`}
              />

              {/* Управление объектом — один раз на весь объект */}
              <Card className="p-4 border-gray-200">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <Icon name="HardHat" size={13} />
                  Управление объектом
                </p>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-orange-300"
                    style={{ borderColor: foremanIncluded ? "#f97316" : "", background: foremanIncluded ? "#fff7ed" : "" }}>
                    <input type="checkbox" checked={foremanIncluded} onChange={e => setForemanIncluded(e.target.checked)} className="accent-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Прораб</p>
                      <p className="text-xs text-gray-500">% от всей суммы работ + материалов</p>
                    </div>
                    {foremanIncluded && (
                      <div className="flex items-center gap-1.5">
                        <Input type="number" min={1} max={50} value={foremanPct}
                          onChange={e => setForemanPct(Math.max(1, Math.min(50, parseFloat(e.target.value) || 10)))}
                          className="w-16 h-8 text-sm text-center" />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    )}
                  </label>
                  <label className="flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-orange-300"
                    style={{ borderColor: supplierIncluded ? "#f97316" : "", background: supplierIncluded ? "#fff7ed" : "" }}>
                    <input type="checkbox" checked={supplierIncluded} onChange={e => setSupplierIncluded(e.target.checked)} className="accent-orange-500" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">Снабженец</p>
                      <p className="text-xs text-gray-500">% от суммы материалов ({fmt(projectTotals.materialsTotal)} ₽)</p>
                    </div>
                    {supplierIncluded && (
                      <div className="flex items-center gap-1.5">
                        <Input type="number" min={1} max={30} value={supplierPct}
                          onChange={e => setSupplierPct(Math.max(1, Math.min(30, parseFloat(e.target.value) || 5)))}
                          className="w-16 h-8 text-sm text-center" />
                        <span className="text-xs text-gray-400">%</span>
                      </div>
                    )}
                  </label>
                  {(foremanIncluded || supplierIncluded) && (
                    <div className="pt-2 border-t border-gray-100 space-y-1 text-sm">
                      {foremanIncluded && (
                        <div className="flex justify-between text-gray-700">
                          <span>Прораб {foremanPct}%</span>
                          <span className="font-medium">+ {fmt(projectTotals.foremanCost)} ₽</span>
                        </div>
                      )}
                      {supplierIncluded && (
                        <div className="flex justify-between text-gray-700">
                          <span>Снабженец {supplierPct}%</span>
                          <span className="font-medium">+ {fmt(projectTotals.supplierCost)} ₽</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={data => { handleExportConfirm(data); setShowExport(false); }}
          onCancel={() => setShowExport(false)}
        />
      )}
      <SalesWidget calcContext={{ calcName: "Калькулятор новостройки", totalPrice: totalSum }} />
    </div>
    </CalcAuthGate>
  );
}