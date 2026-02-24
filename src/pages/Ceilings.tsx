import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

function loadMarkup(): number {
  const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0");
  return isNaN(v) ? 0 : v;
}

export default function Ceilings() {
  const navigate = useNavigate();

  useMeta({
    title: "Расчёт натяжных потолков",
    description: "Онлайн-калькулятор стоимости натяжных потолков. Выберите тип полотна, бренд, освещение и получите смету или коммерческое предложение.",
    keywords: "расчёт натяжных потолков, стоимость натяжного потолка, калькулятор потолков, смета натяжной потолок",
    canonical: "/ceilings",
  });

  const [cfg, setCfg] = useState<Omit<CeilingConfig, "id" | "totalPrice">>(DEFAULT_CONFIG);
  const [configs, setConfigs] = useState<CeilingConfig[]>([]);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [showMarkup, setShowMarkup] = useState(false);
  const [showExport, setShowExport] = useState(false);

  const update = (patch: Partial<typeof cfg>) => setCfg(prev => ({ ...prev, ...patch }));

  const basePrice = calcPrice(cfg);
  const markup = markupPct > 0 ? Math.round(basePrice * markupPct / 100) : 0;
  const price = basePrice + markup;

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
  };

  const handleAdd = () => {
    const id = `ceil-${Date.now()}`;
    const newCfg: CeilingConfig = { ...cfg, id, totalPrice: price };
    setConfigs(prev => [...prev, newCfg]);
  };

  const removeConfig = (id: string) => setConfigs(prev => prev.filter(c => c.id !== id));

  const totalSum = configs.reduce((s, c) => s + c.totalPrice, 0);

  const handleExportConfirm = (data: ExportConfirmData) => {
    const now = new Date();
    const date = now.toLocaleDateString("ru-RU");
    const docNum = String(now.getTime()).slice(-6);

    const exportConfigs = configs.length > 0
      ? configs
      : [{ ...cfg, id: `ceil-${Date.now()}`, totalPrice: price }];
    const exportTotal = exportConfigs.reduce((s, c) => s + c.totalPrice, 0);

    navigate("/ceilings/print", {
      state: {
        configs: exportConfigs,
        markupPct,
        totalSum: exportTotal,
        docNum,
        date,
        ...data,
      },
    });
  };

  const ceilingEstimateItems = configs.map(c => {
    const ct = CEILING_TYPES.find(x => x.value === c.ceilingType);
    const lv = CEILING_LEVELS.find(x => x.value === c.level);
    const br = CEILING_BRANDS.find(x => x.id === c.brandId);
    const name = [ct?.label, lv?.label, br?.name, `${c.area} м²`].filter(Boolean).join(", ");
    return {
      id: c.id,
      category: "Натяжные потолки",
      name,
      unit: "м²",
      quantity: c.area,
      price: Math.round(c.totalPrice / c.area),
      total: c.totalPrice,
    };
  });

  const ceilingType = CEILING_TYPES.find(t => t.value === cfg.ceilingType);
  const ceilingLevel = CEILING_LEVELS.find(l => l.value === cfg.level);
  const ceilingBrand = CEILING_BRANDS.find(b => b.id === cfg.brandId);
  const ceilingColor = CEILING_COLORS.find(c => c.id === cfg.colorId);
  const ceilingLighting = LIGHTING_OPTIONS.find(l => l.id === cfg.lightingId);

  return (
    <div className="min-h-screen bg-gray-50">
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
                <p className="text-sm text-gray-500">ПВХ и тканевые полотна</p>
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
                disabled={price === 0}
                onClick={() => setShowExport(true)}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Icon name="FileText" size={15} className="mr-1.5" />
                Создать документ
              </Button>
            </div>
          </div>

          {showMarkup && (
            <div className="mt-3 pb-3 border-t pt-3 flex items-center gap-3 max-w-sm">
              <Label className="text-sm whitespace-nowrap">Наценка на все позиции, %</Label>
              <Input
                type="number" min={0} max={200}
                value={markupPct}
                onChange={e => handleMarkupChange(e.target.value)}
                className="w-24 h-8 text-sm"
              />
              <span className="text-xs text-gray-400">от 0 до 200%</span>
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
              {/* Конфигуратор */}
              <div className="lg:col-span-3">
                <Card className="p-5">
                  <CeilingConfigForm cfg={cfg} onUpdate={update} />
                </Card>
              </div>

              {/* Итог */}
              <div className="lg:col-span-2">
                <div className="sticky top-24 space-y-4">
                  <Card className="p-5 border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50">
                    <p className="text-xs font-semibold text-violet-600 uppercase tracking-wide mb-3">Стоимость потолка</p>

                    <div className="space-y-1.5 text-sm text-gray-600 mb-4">
                      <div className="flex justify-between">
                        <span>Тип</span>
                        <span className="font-medium text-gray-900">{ceilingType?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Уровни</span>
                        <span className="font-medium text-gray-900">{ceilingLevel?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Бренд</span>
                        <span className="font-medium text-gray-900">{ceilingBrand?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Цвет</span>
                        <span className="font-medium text-gray-900">{ceilingColor?.label}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Площадь</span>
                        <span className="font-medium text-gray-900">{cfg.area} м²</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Освещение</span>
                        <span className="font-medium text-gray-900">
                          {ceilingLighting?.id !== "none" ? `${ceilingLighting?.name} × ${cfg.lightingCount}` : "Нет"}
                        </span>
                      </div>
                    </div>

                    <div className="border-t pt-3 space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Базовая цена</span>
                        <span>{fmt(basePrice)} ₽</span>
                      </div>
                      {markupPct > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-orange-500">Наценка {markupPct}%</span>
                          <span className="text-orange-500">+{fmt(markup)} ₽</span>
                        </div>
                      )}
                      <div className="flex justify-between text-lg font-bold text-violet-700 pt-1">
                        <span>Итого</span>
                        <span>{fmt(price)} ₽</span>
                      </div>
                      {cfg.area > 0 && (
                        <p className="text-xs text-gray-400 text-right">{fmt(Math.round(price / cfg.area))} ₽/м²</p>
                      )}
                    </div>

                    <Button
                      className="w-full mt-4 bg-violet-600 hover:bg-violet-700 text-white"
                      onClick={handleAdd}
                      disabled={price === 0}
                    >
                      <Icon name="Plus" size={15} className="mr-1.5" />
                      Добавить в смету
                    </Button>
                  </Card>

                  {/* Список добавленных */}
                  {configs.length > 0 && (
                    <Card className="p-4">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                        Смета ({configs.length} позиц.)
                      </p>
                      <div className="space-y-2">
                        {configs.map((c, i) => {
                          const ct = CEILING_TYPES.find(x => x.value === c.ceilingType);
                          const lv = CEILING_LEVELS.find(x => x.value === c.level);
                          return (
                            <div key={c.id} className="flex items-start justify-between gap-2 text-xs">
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                  {i + 1}. {ct?.label}, {lv?.label}
                                </p>
                                <p className="text-gray-400">{c.area} м² · {fmt(c.totalPrice)} ₽</p>
                              </div>
                              <button
                                onClick={() => removeConfig(c.id)}
                                className="text-gray-300 hover:text-red-400 transition-colors shrink-0 mt-0.5"
                              >
                                <Icon name="X" size={13} />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                      <div className="border-t mt-3 pt-3 flex justify-between text-sm font-semibold">
                        <span>Всего</span>
                        <span className="text-violet-700">{fmt(totalSum)} ₽</span>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3 bg-violet-600 hover:bg-violet-700 text-white"
                        onClick={() => setShowExport(true)}
                      >
                        <Icon name="FileText" size={13} className="mr-1.5" />
                        Создать документ
                      </Button>
                    </Card>
                  )}

                  {/* Подсказка */}
                  <Card className="p-4 bg-violet-50 border-violet-100">
                    <p className="text-xs text-violet-700 font-semibold mb-1 flex items-center gap-1.5">
                      <Icon name="Info" size={12} />
                      Как пользоваться
                    </p>
                    <ol className="text-xs text-violet-600 space-y-1 list-decimal list-inside">
                      <li>Настройте параметры потолка</li>
                      <li>Нажмите «Добавить в смету»</li>
                      <li>Добавьте другие комнаты при необходимости</li>
                      <li>Создайте документ — смету или КП</li>
                    </ol>
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
          totalSum={configs.length > 0 ? totalSum : price}
        />
      )}
    </div>
  );
}
