import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import { FLOORING_PRODUCTS, FLOORING_CATEGORIES, REGIONS } from "@/components/calculator/flooring/FlooringTypes";
import type { FlooringConfig } from "@/components/calculator/flooring/FlooringTypes";
import { calcFlooringPrice, DEFAULT_CONFIG, fmt } from "@/components/calculator/flooring/flooringUtils";
import FlooringConfigForm from "@/components/calculator/flooring/FlooringConfigForm";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";

const MARKUP_KEY = "flooring_markup_pct";
const REGION_KEY = "flooring_region";

const ROOM_PRESETS = ["Гостиная", "Спальня", "Кухня", "Детская", "Коридор", "Прихожая", "Кабинет", "Ванная"];

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}
function loadRegion(): string {
  return localStorage.getItem(REGION_KEY) || "region";
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
    navigate("/flooring/print", {
      state: {
        zones,
        markupPct,
        regionId,
        totalSum,
        docNum: String(now.getTime()).slice(-6),
        date: now.toLocaleDateString("ru-RU"),
        ...data,
      },
    });
  };

  const activeBreakdown = calcFlooringPrice(activeZone, regionId, markupPct);
  const activeCat = FLOORING_CATEGORIES.find(c => {
    const prod = FLOORING_PRODUCTS.find(p => p.id === activeZone.productId);
    return prod?.category === c.value;
  });
  const activeProduct = FLOORING_PRODUCTS.find(p => p.id === activeZone.productId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="Layers" size={20} className="text-amber-600" />
                  Напольные покрытия
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
                className="h-9 text-sm border border-gray-200 rounded-md px-2 bg-white text-gray-700 cursor-pointer hover:border-amber-400 transition-colors"
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
                className="bg-amber-600 hover:bg-amber-700 text-white"
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

            {/* Быстрые пресеты */}
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Icon name="Zap" size={11} />
                Быстрое добавление
              </p>
              <div className="flex flex-wrap gap-1.5">
                {ROOM_PRESETS.map(name => (
                  <button
                    key={name}
                    onClick={() => addZone(name)}
                    className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-amber-400 hover:text-amber-700 hover:bg-amber-50 transition-all"
                  >
                    + {name}
                  </button>
                ))}
                <button
                  onClick={() => addZone()}
                  className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-amber-400 hover:text-amber-600 transition-all"
                >
                  + Своё
                </button>
              </div>
            </div>

            {/* Список зон */}
            <div className="space-y-2">
              {zones.map((z, i) => {
                const isActive = z.id === activeId;
                const prod = FLOORING_PRODUCTS.find(p => p.id === z.productId);
                const cat = FLOORING_CATEGORIES.find(c => c.value === prod?.category);
                return (
                  <div
                    key={z.id}
                    onClick={() => setActiveId(z.id)}
                    className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                      isActive
                        ? "border-amber-400 bg-amber-50 shadow-sm"
                        : "border-gray-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                          isActive ? "bg-amber-600 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {i + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          {renamingId === z.id ? (
                            <input
                              autoFocus
                              className="w-full text-sm font-semibold border-b border-amber-400 bg-transparent outline-none pb-0.5"
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
                            {cat?.icon} {cat?.label} · {z.area} м²
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className={`text-sm font-bold ${isActive ? "text-amber-700" : "text-gray-700"}`}>
                          {fmt(z.totalPrice)} ₽
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {z.area > 0 ? `${fmt(Math.round(z.totalPrice / z.area))} ₽/м²` : ""}
                        </p>
                      </div>
                    </div>

                    {/* Действия */}
                    <div className={`flex gap-1 mt-2 pt-2 border-t border-gray-100 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                      <button
                        onClick={e => { e.stopPropagation(); setRenamingId(z.id); }}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-amber-600 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <Icon name="Pencil" size={11} />
                        Переименовать
                      </button>
                      <button
                        onClick={e => { e.stopPropagation(); duplicateZone(z.id); }}
                        className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-amber-600 px-1.5 py-0.5 rounded transition-colors"
                      >
                        <Icon name="Copy" size={11} />
                        Дублировать
                      </button>
                      {zones.length > 1 && (
                        <button
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
            <Card className="p-4 bg-gradient-to-br from-amber-600 to-orange-700 border-0 text-white">
              <p className="text-xs font-semibold opacity-70 uppercase tracking-wide mb-2">Итого по всем зонам</p>
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
              {/* Заголовок */}
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-amber-600 text-white flex items-center justify-center text-xs font-bold">
                  {zones.findIndex(z => z.id === activeId) + 1}
                </div>
                <h2 className="text-base font-bold text-gray-900">
                  {activeZone.roomName || `Помещение ${zones.findIndex(z => z.id === activeId) + 1}`}
                </h2>
                <span className="text-sm text-gray-400 ml-1">— настройка покрытия</span>
              </div>

              {/* Форма */}
              <Card className="p-5">
                <FlooringConfigForm cfg={activeZone} onUpdate={updateZone} />
              </Card>

              {/* Детализация стоимости */}
              <Card className="p-4 border-amber-200 bg-amber-50">
                <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-3">Детализация стоимости</p>

                {activeProduct && (
                  <div className="flex gap-3 mb-3 pb-3 border-b border-amber-200">
                    <img src={activeProduct.image} alt={activeProduct.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">{activeProduct.brand}</p>
                      <p className="text-sm font-bold text-gray-900">{activeProduct.name}</p>
                      <p className="text-xs text-gray-400">{activeCat?.label} · {activeProduct.wear}</p>
                    </div>
                  </div>
                )}

                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex justify-between">
                    <span>Материал ({activeBreakdown.materialQty} м²)</span>
                    <span className="font-medium text-gray-900">{fmt(activeBreakdown.materialCost)} ₽</span>
                  </div>
                  {activeBreakdown.substrateCost > 0 && (
                    <div className="flex justify-between">
                      <span>Подложка</span>
                      <span className="font-medium text-gray-900">{fmt(activeBreakdown.substrateCost)} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Монтаж</span>
                    <span className="font-medium text-gray-900">{fmt(activeBreakdown.installCost)} ₽</span>
                  </div>
                  {activeBreakdown.skirtingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Плинтус ({activeZone.perimeter} м)</span>
                      <span className="font-medium text-gray-900">{fmt(activeBreakdown.skirtingCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.demolitionCost > 0 && (
                    <div className="flex justify-between">
                      <span>Демонтаж</span>
                      <span className="font-medium text-gray-900">{fmt(activeBreakdown.demolitionCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.levelingCost > 0 && (
                    <div className="flex justify-between">
                      <span>Стяжка {activeZone.levelingThicknessMm} мм</span>
                      <span className="font-medium text-gray-900">{fmt(activeBreakdown.levelingCost)} ₽</span>
                    </div>
                  )}
                  {activeBreakdown.thresholdCost > 0 && (
                    <div className="flex justify-between">
                      <span>Порожки × {activeZone.thresholdCount}</span>
                      <span className="font-medium text-gray-900">{fmt(activeBreakdown.thresholdCost)} ₽</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-amber-200 pt-2 mt-3 flex justify-between text-base font-bold text-amber-700">
                  <span>Итого</span>
                  <span>{fmt(activeBreakdown.total)} ₽</span>
                </div>
                {activeZone.area > 0 && (
                  <div className="flex justify-between text-xs text-gray-400 mt-0.5">
                    <span>Удельная стоимость</span>
                    <span>{fmt(activeBreakdown.pricePerM2)} ₽/м²</span>
                  </div>
                )}
                {markupPct > 0 && (
                  <div className="flex justify-between text-xs text-orange-500 mt-1">
                    <span>в т.ч. наценка {markupPct}%</span>
                    <span>+{fmt(Math.round(activeBreakdown.total - activeBreakdown.total / (1 + markupPct / 100)))} ₽</span>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>

      {showExport && (
        <ExportDialog
          onConfirm={handleExportConfirm}
          onCancel={() => setShowExport(false)}
        />
      )}
    </div>
  );
}