import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import {
  CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS, CEILING_COLORS, LIGHTING_OPTIONS,
} from "@/components/calculator/ceilings/CeilingTypes";
import type { CeilingConfig } from "@/components/calculator/ceilings/CeilingTypes";
import { calcPrice, DEFAULT_CONFIG, fmt } from "@/components/calculator/ceilings/ceilingUtils";
import CeilingConfigForm from "@/components/calculator/ceilings/CeilingConfigForm";
import ExportDialog from "@/components/calculator/ExportDialog";
import type { ExportConfirmData } from "@/components/calculator/ExportDialog";
import DocsTab from "@/components/calculator/DocsTab";

const MARKUP_KEY = "ceilings_markup_pct";

const ROOM_PRESETS = ["Гостиная", "Спальня", "Кухня", "Детская", "Коридор", "Ванная", "Кабинет"];

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}

function makeZone(name = ""): CeilingConfig {
  return {
    ...DEFAULT_CONFIG,
    id: `ceil-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    roomName: name,
    totalPrice: 0,
  };
}

export default function Ceilings() {
  const navigate = useNavigate();

  useMeta({
    title: "Расчёт натяжных потолков",
    description: "Онлайн-калькулятор стоимости натяжных потолков. Выберите тип полотна, бренд, освещение и получите смету или коммерческое предложение.",
    keywords: "расчёт натяжных потолков, стоимость натяжного потолка, калькулятор потолков, смета натяжной потолок",
    canonical: "/ceilings",
  });

  const [zones, setZones] = useState<CeilingConfig[]>(() => {
    const mk = loadMarkup();
    const z = makeZone("Гостиная");
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

  const recalcAll = (newMarkup: number) => {
    setZones(prev => prev.map(z => {
      const base = calcPrice(z);
      const mk = newMarkup > 0 ? Math.round(base * newMarkup / 100) : 0;
      return { ...z, totalPrice: base + mk };
    }));
  };

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
    recalcAll(n);
  };

  const addZone = (name = "") => {
    const z = makeZone(name);
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
    navigate("/ceilings/print", {
      state: {
        configs: zones,
        markupPct,
        totalSum,
        docNum: String(now.getTime()).slice(-6),
        date: now.toLocaleDateString("ru-RU"),
        ...data,
      },
    });
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

  const activeBase = calcPrice(activeZone);
  const activeMarkup = markupPct > 0 ? Math.round(activeBase * markupPct / 100) : 0;
  const activePrice = activeBase + activeMarkup;

  const ceilingType = CEILING_TYPES.find(t => t.value === activeZone.ceilingType);
  const ceilingLevel = CEILING_LEVELS.find(l => l.value === activeZone.level);
  const ceilingBrand = CEILING_BRANDS.find(b => b.id === activeZone.brandId);
  const ceilingColor = CEILING_COLORS.find(c => c.id === activeZone.colorId);
  const ceilingLighting = LIGHTING_OPTIONS.find(l => l.id === activeZone.lightingId);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <Icon name="ArrowLeft" className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                  <Icon name="Layers" size={20} className="text-violet-600" />
                  Натяжные потолки
                </h1>
                <p className="text-sm text-gray-500">
                  {zones.length} {zones.length === 1 ? "помещение" : zones.length < 5 ? "помещения" : "помещений"} · {fmt(Math.round(totalArea * 10) / 10)} м²
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
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
                className="bg-violet-600 hover:bg-violet-700 text-white"
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
                        className="px-2.5 py-1 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-violet-400 hover:text-violet-600 hover:bg-violet-50 transition-all"
                      >
                        + {name}
                      </button>
                    ))}
                    <button
                      onClick={() => addZone()}
                      className="px-2.5 py-1 bg-white border border-dashed border-gray-300 rounded-full text-xs text-gray-400 hover:border-violet-400 hover:text-violet-600 transition-all"
                    >
                      + Своё помещение
                    </button>
                  </div>
                </div>

                {/* Список зон */}
                <div className="space-y-2">
                  {zones.map((z, i) => {
                    const isActive = z.id === activeId;
                    const zBase = calcPrice(z);
                    const zPrice = zBase + (markupPct > 0 ? Math.round(zBase * markupPct / 100) : 0);
                    const zType = CEILING_TYPES.find(t => t.value === z.ceilingType);
                    return (
                      <div
                        key={z.id}
                        onClick={() => setActiveId(z.id)}
                        className={`group relative rounded-xl border p-3 cursor-pointer transition-all ${
                          isActive
                            ? "border-violet-400 bg-violet-50 shadow-sm"
                            : "border-gray-200 bg-white hover:border-violet-200 hover:bg-violet-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                              isActive ? "bg-violet-600 text-white" : "bg-gray-100 text-gray-500"
                            }`}>
                              {i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              {renamingId === z.id ? (
                                <input
                                  autoFocus
                                  className="w-full text-sm font-semibold border-b border-violet-400 bg-transparent outline-none pb-0.5"
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
                                {zType?.label} · {z.area} м²
                              </p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-sm font-bold ${isActive ? "text-violet-700" : "text-gray-700"}`}>
                              {fmt(zPrice)} ₽
                            </p>
                            <p className="text-[10px] text-gray-400">{z.area > 0 ? `${fmt(Math.round(zPrice / z.area))} ₽/м²` : ""}</p>
                          </div>
                        </div>

                        {/* Действия */}
                        <div className={`flex gap-1 mt-2 pt-2 border-t border-gray-100 ${isActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"} transition-opacity`}>
                          <button
                            onClick={e => { e.stopPropagation(); setRenamingId(z.id); }}
                            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 px-1.5 py-0.5 rounded transition-colors"
                          >
                            <Icon name="Pencil" size={11} />
                            Переименовать
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); duplicateZone(z.id); }}
                            className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-violet-600 px-1.5 py-0.5 rounded transition-colors"
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

                {/* Итого по смете */}
                <Card className="p-4 bg-gradient-to-br from-violet-600 to-purple-700 border-0 text-white">
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

              {/* Правая панель — редактор активной зоны */}
              <div className="lg:col-span-3">
                <div className="sticky top-24 space-y-4">
                  {/* Заголовок зоны */}
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-violet-600 text-white flex items-center justify-center text-xs font-bold">
                      {zones.findIndex(z => z.id === activeId) + 1}
                    </div>
                    <h2 className="text-base font-bold text-gray-900">
                      {activeZone.roomName || `Помещение ${zones.findIndex(z => z.id === activeId) + 1}`}
                    </h2>
                    <span className="text-sm text-gray-400 ml-1">— настройка потолка</span>
                  </div>

                  {/* Форма */}
                  <Card className="p-5">
                    <CeilingConfigForm
                      cfg={activeZone}
                      onUpdate={updateZone}
                    />
                  </Card>

                  {/* Мини-итог зоны */}
                  <Card className="p-4 border-violet-200 bg-violet-50">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide">Стоимость зоны</p>
                      {activeZone.area > 0 && (
                        <span className="text-xs text-gray-400">{fmt(Math.round(activePrice / activeZone.area))} ₽/м²</span>
                      )}
                    </div>
                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex justify-between">
                        <span>Тип</span><span className="font-medium text-gray-900">{ceilingType?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Уровни</span><span className="font-medium text-gray-900">{ceilingLevel?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Бренд</span><span className="font-medium text-gray-900">{ceilingBrand?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Цвет</span><span className="font-medium text-gray-900">{ceilingColor?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Площадь</span><span className="font-medium text-gray-900">{activeZone.area} м²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Освещение</span>
                        <span className="font-medium text-gray-900">
                          {ceilingLighting?.id !== "none" ? `${ceilingLighting?.name} × ${activeZone.lightingCount}` : "Нет"}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-violet-200 pt-2 flex justify-between text-base font-bold text-violet-700">
                      <span>Итого</span>
                      <span>{fmt(activePrice)} ₽</span>
                    </div>
                    {markupPct > 0 && (
                      <div className="flex justify-between text-xs text-orange-500 mt-1">
                        <span>в т.ч. наценка {markupPct}%</span>
                        <span>+{fmt(activeMarkup)} ₽</span>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
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
    </div>
  );
}