import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import { DEFAULT_BATHHOUSE_CONFIG, REGIONS, BATH_STYLES } from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import { calcBathHousePrice, fmt } from "@/components/calculator/bathhouse/bathHouseUtils";
import BathHouseConfigForm from "@/components/calculator/bathhouse/BathHouseConfigForm";
import { FloorplanSVG, ExteriorSVG } from "@/components/calculator/bathhouse/BathHouseSchemes";

const REGION_KEY = "bathhouse_region";
const MARKUP_KEY = "bathhouse_markup";

function loadRegion() { return localStorage.getItem(REGION_KEY) || "moscow"; }
function loadMarkup() { const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0"); return isNaN(v) ? 0 : v; }

function makeConfig(): BathHouseConfig {
  return {
    ...DEFAULT_BATHHOUSE_CONFIG,
    id: `bath-${Date.now()}`,
    region: loadRegion(),
  };
}

type ViewTab = "config" | "scheme" | "exterior";

export default function BathHouse() {
  useMeta({
    title: "Калькулятор строительства бани — АВАНГАРД",
    description: "Онлайн-калькулятор строительства бани с нуля: материалы стен, фундамент, крыша, печь, вентиляция, отделка. Смета и схемы помещений.",
    keywords: "калькулятор строительства бани, стоимость бани под ключ, баня из бруса цена, каркасная баня, кирпичная баня, баня из газобетона, смета баня",
    canonical: "/bathhouse",
  });

  const [config, setConfig] = useState<BathHouseConfig>(makeConfig);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [showMarkup, setShowMarkup] = useState(false);
  const [viewTab, setViewTab] = useState<ViewTab>("config");
  const [schemeTab, setSchemeTab] = useState<"plan" | "exterior">("plan");

  const handleChange = useCallback((patch: Partial<BathHouseConfig>) => {
    setConfig(prev => ({ ...prev, ...patch }));
  }, []);

  const handleRegionChange = (v: string) => {
    setRegionId(v);
    localStorage.setItem(REGION_KEY, v);
  };

  const handleMarkupChange = (v: string) => {
    const n = Math.max(0, Math.min(200, parseFloat(v) || 0));
    setMarkupPct(n);
    localStorage.setItem(MARKUP_KEY, String(n));
  };

  const bd = calcBathHousePrice(config, regionId, markupPct);
  const style = BATH_STYLES[config.style];

  const breakdownItems: { label: string; value: number; icon: string }[] = [
    { label: "Фундамент", value: bd.foundation, icon: "Building2" },
    { label: "Стены (коробка)", value: bd.walls, icon: "Layers" },
    { label: "Крыша (конструкция)", value: bd.roofStructure, icon: "Home" },
    { label: "Кровля", value: bd.roofing, icon: "CloudRain" },
    { label: "Утепление", value: bd.insulation, icon: "Wind" },
    { label: "Отделка стен — парная", value: bd.wallFinishSteam, icon: "Paintbrush" },
    { label: "Отделка стен — мойка", value: bd.wallFinishWash, icon: "Paintbrush" },
    { label: "Отделка стен — КО", value: bd.wallFinishRest, icon: "Paintbrush" },
    { label: "Полы", value: bd.floor, icon: "Grid3x3" },
    { label: "Печь", value: bd.stove, icon: "Flame" },
    { label: "Вентиляция", value: bd.ventilation, icon: "AirVent" },
    { label: "Полок", value: bd.shelves, icon: "AlignVerticalJustifyCenter" },
    { label: "Окна", value: bd.windows, icon: "AppWindow" },
    { label: "Дымоход", value: bd.chimney, icon: "ChevronsUp" },
    { label: "Бак для воды", value: bd.tank, icon: "Droplets" },
    { label: "Терраса", value: bd.terrace, icon: "Trees" },
    { label: "Электрика", value: bd.electrical, icon: "Zap" },
    { label: "Монтажные работы", value: bd.assembly, icon: "Wrench" },
  ].filter(i => i.value > 0);

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* Шапка */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
              <span className="text-2xl">🪵</span>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl md:text-3xl font-extrabold">Калькулятор строительства бани</h1>
                <Badge className="bg-white/20 text-white border-0 text-xs">Бета</Badge>
              </div>
              <p className="text-amber-100 text-sm md:text-base">
                Расчёт стоимости бани с нуля: стены, фундамент, крыша, печь, вентиляция, отделка и схемы помещений
              </p>
            </div>
          </div>

          {/* Итог прямо в шапке */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-2xl font-extrabold">{fmt(bd.total)} ₽</div>
              <div className="text-amber-200 text-xs mt-0.5">Итого под ключ</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold">{fmt(bd.total / config.totalArea)} ₽</div>
              <div className="text-amber-200 text-xs mt-0.5">За 1 м²</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-xl font-bold">{config.totalArea} м²</div>
              <div className="text-amber-200 text-xs mt-0.5">Общая площадь</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-lg font-bold">{style.emoji} {style.label}</div>
              <div className="text-amber-200 text-xs mt-0.5">Стиль бани</div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Регион + наценка */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={14} className="text-gray-500" />
            <select
              value={regionId}
              onChange={e => handleRegionChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {Object.entries(REGIONS).map(([k, r]) => (
                <option key={k} value={k}>{r.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={() => setShowMarkup(!showMarkup)}
            className="text-xs text-gray-500 hover:text-amber-700 transition-colors flex items-center gap-1"
          >
            <Icon name="Percent" size={12} />
            {markupPct > 0 ? `Наценка ${markupPct}%` : "Добавить наценку"}
          </button>
          {showMarkup && (
            <input
              type="number" min={0} max={200} value={markupPct}
              onChange={e => handleMarkupChange(e.target.value)}
              className="w-20 text-sm border border-gray-200 rounded-xl px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="%" autoFocus
            />
          )}
          <span className="text-xs text-gray-400 ml-auto">Коэфф. региона: ×{REGIONS[regionId]?.coeff}</span>
        </div>

        {/* Мобильные табы */}
        <div className="flex gap-2 mb-4 lg:hidden">
          <button onClick={() => setViewTab("config")} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${viewTab === "config" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600"}`}>
            ⚙️ Параметры
          </button>
          <button onClick={() => setViewTab("scheme")} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${viewTab === "scheme" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600"}`}>
            📐 Схемы
          </button>
          <button onClick={() => setViewTab("exterior")} className={`flex-1 py-2 rounded-xl text-sm font-medium border-2 transition-all ${viewTab === "exterior" ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600"}`}>
            💰 Смета
          </button>
        </div>

        <div className="lg:grid lg:grid-cols-[1fr_400px] gap-6">
          {/* Левая колонка: форма */}
          <div className={viewTab !== "config" ? "hidden lg:block" : ""}>
            <Card className="p-4 md:p-6">
              <BathHouseConfigForm config={config} onChange={handleChange} />
            </Card>
          </div>

          {/* Правая колонка: схемы + смета */}
          <div className={`space-y-4 ${viewTab === "config" ? "hidden lg:block" : ""}`}>
            {/* Схемы */}
            <Card className="overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setSchemeTab("plan")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${schemeTab === "plan" ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50" : "text-gray-500 hover:text-gray-700"}`}
                >
                  📐 Схема планировки
                </button>
                <button
                  onClick={() => setSchemeTab("exterior")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${schemeTab === "exterior" ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50" : "text-gray-500 hover:text-gray-700"}`}
                >
                  🏠 Внешний вид
                </button>
              </div>
              <div className="p-4">
                {schemeTab === "plan" ? (
                  <div>
                    <FloorplanSVG
                      layout={config.layout}
                      steamArea={config.steamRoomArea}
                      washArea={config.washRoomArea}
                      restArea={config.restRoomArea}
                      dressingArea={config.dressingRoomArea}
                    />
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Схема приблизительная, не является рабочим чертежом
                    </p>
                  </div>
                ) : (
                  <div>
                    <ExteriorSVG
                      roofType={config.roofType}
                      wallMaterial={config.wallMaterial}
                      terrace={config.terrace}
                      style={style.label}
                    />
                    <p className="text-xs text-gray-500 text-center mt-2">
                      Визуализация условная — для ориентира по форме
                    </p>
                  </div>
                )}
              </div>
            </Card>

            {/* Рекомендации */}
            <Card className="p-4 space-y-3">
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                <Icon name="Lightbulb" size={14} className="text-amber-500" />
                Рекомендации
              </h3>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="text-base">🔥</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{bd.stoveRecommendation}</p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="text-base">💨</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{bd.ventRecommendation}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <div className="flex items-start gap-2">
                  <span className="text-base">🪵</span>
                  <p className="text-xs text-gray-700 leading-relaxed">{bd.shelfRecommendation}</p>
                </div>
              </div>
            </Card>

            {/* Смета — детализация */}
            <Card className={`p-4 ${viewTab === "exterior" ? "" : ""}`}>
              <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2 mb-3">
                <Icon name="ListChecks" size={14} className="text-amber-500" />
                Детализация сметы
              </h3>
              <div className="space-y-1.5">
                {breakdownItems.map(item => (
                  <div key={item.label} className="flex items-center justify-between gap-2 py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-1.5">
                      <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={13} className="text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-600">{item.label}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-800 shrink-0">{fmt(item.value)} ₽</span>
                  </div>
                ))}
              </div>

              {/* Итог */}
              <div className="mt-4 pt-3 border-t-2 border-gray-200 space-y-1.5">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Материалы + работы</span>
                  <span>{fmt(bd.subtotal / bd.regionCoeff)} ₽</span>
                </div>
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Региональный коэффициент ×{bd.regionCoeff}</span>
                  <span>{REGIONS[regionId]?.label}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>С учётом региона</span>
                  <span>{fmt(bd.subtotal)} ₽</span>
                </div>
                {markupPct > 0 && (
                  <div className="flex justify-between text-sm text-orange-600">
                    <span>Наценка {markupPct}%</span>
                    <span>+ {fmt(bd.markupAmount)} ₽</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-extrabold text-amber-700 pt-2 border-t-2 border-amber-200">
                  <span>ИТОГО</span>
                  <span>{fmt(bd.total)} ₽</span>
                </div>
                <div className="text-center">
                  <span className="text-xs text-gray-400">{fmt(bd.total / config.totalArea)} ₽ за 1 м² • {config.totalArea} м² общей площади</span>
                </div>
              </div>

              <Button className="w-full mt-4 bg-gradient-to-r from-amber-600 to-orange-500 text-white rounded-xl font-semibold border-0 hover:opacity-90"
                onClick={() => window.print()}>
                <Icon name="Printer" size={15} className="mr-2" />
                Распечатать смету
              </Button>
              <p className="text-center text-xs text-gray-400 mt-2">
                Расчёт ориентировочный. Точную стоимость уточняйте у подрядчиков.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
