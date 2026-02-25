import { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { useMeta } from "@/hooks/useMeta";
import {
  DEFAULT_BATHHOUSE_CONFIG, REGIONS, BATH_STYLES,
  WALL_MATERIALS, FOUNDATION_TYPES, ROOF_TYPES, STOVE_TYPES, VENTILATION_TYPES,
} from "@/components/calculator/bathhouse/BathHouseTypes";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import { calcBathHousePrice, fmt } from "@/components/calculator/bathhouse/bathHouseUtils";
import BathHouseConfigForm from "@/components/calculator/bathhouse/BathHouseConfigForm";
import { FloorplanSVG, ExteriorSVG } from "@/components/calculator/bathhouse/BathHouseSchemes";

const REGION_KEY = "bathhouse_region";
const MARKUP_KEY = "bathhouse_markup";

function loadRegion() { return localStorage.getItem(REGION_KEY) || "moscow"; }
function loadMarkup() { const v = parseFloat(localStorage.getItem(MARKUP_KEY) || "0"); return isNaN(v) ? 0 : v; }

function makeConfig(): BathHouseConfig {
  return { ...DEFAULT_BATHHOUSE_CONFIG, id: `bath-${Date.now()}`, region: loadRegion() };
}

type ViewTab = "config" | "scheme" | "result";

const BREAKDOWN_LABELS: { key: string; label: string; icon: string }[] = [
  { key: "foundation", label: "Фундамент", icon: "Building2" },
  { key: "walls", label: "Стены (коробка)", icon: "Layers" },
  { key: "roofStructure", label: "Кровельная конструкция", icon: "Home" },
  { key: "roofing", label: "Кровельный материал", icon: "CloudRain" },
  { key: "insulation", label: "Утепление", icon: "Wind" },
  { key: "wallFinishSteam", label: "Отделка парной", icon: "Paintbrush" },
  { key: "wallFinishWash", label: "Отделка мойки", icon: "Paintbrush" },
  { key: "wallFinishRest", label: "Отделка комнаты отдыха", icon: "Paintbrush" },
  { key: "floor", label: "Полы", icon: "Grid3x3" },
  { key: "stove", label: "Печь", icon: "Flame" },
  { key: "ventilation", label: "Вентиляция", icon: "AirVent" },
  { key: "shelves", label: "Полок", icon: "AlignVerticalJustifyCenter" },
  { key: "windows", label: "Окна", icon: "AppWindow" },
  { key: "chimney", label: "Дымоход", icon: "ChevronsUp" },
  { key: "tank", label: "Бак для воды", icon: "Droplets" },
  { key: "terrace", label: "Терраса", icon: "Trees" },
  { key: "electrical", label: "Электрика", icon: "Zap" },
  { key: "assembly", label: "Монтаж и работа", icon: "Wrench" },
];

export default function BathHouse() {
  const navigate = useNavigate();

  useMeta({
    title: "Калькулятор строительства бани — АВАНГАРД",
    description: "Онлайн-калькулятор строительства бани с нуля: материалы стен, фундамент, крыша, печь, вентиляция, отделка. Смета и схемы помещений.",
    keywords: "калькулятор строительства бани, стоимость бани под ключ, баня из бруса цена, каркасная баня, кирпичная баня, баня из газобетона, смета баня",
    canonical: "/bathhouse",
  });

  const [config, setConfig] = useState<BathHouseConfig>(makeConfig);
  const [regionId, setRegionId] = useState<string>(loadRegion);
  const [markupPct, setMarkupPct] = useState<number>(loadMarkup);
  const [viewTab, setViewTab] = useState<ViewTab>("config");
  const [schemeTab, setSchemeTab] = useState<"plan" | "exterior">("plan");
  const [showExportPanel, setShowExportPanel] = useState(false);

  // Экспорт
  const [customer, setCustomer] = useState("");
  const [contractor, setContractor] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [docType, setDocType] = useState<"smeta" | "kp">("smeta");
  const [validDays, setValidDays] = useState("30");

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

  const bd = useMemo(() => calcBathHousePrice(config, regionId, markupPct), [config, regionId, markupPct]);
  const style = BATH_STYLES[config.style];

  const breakdownItems = BREAKDOWN_LABELS
    .map(({ key, label, icon }) => ({ label, icon, value: (bd as Record<string, number>)[key] ?? 0 }))
    .filter(i => i.value > 0);

  const handlePrint = () => {
    const now = new Date();
    navigate("/bathhouse/print", {
      state: {
        config,
        regionId,
        markupPct,
        bd,
        docNum: String(now.getTime()).slice(-6),
        date: now.toLocaleDateString("ru-RU"),
        docType,
        customer,
        contractor,
        address,
        phone,
        email,
        validDays,
      },
    });
  };

  const tabs = [
    { id: "config" as const, label: "Параметры", icon: "Settings2" },
    { id: "scheme" as const, label: "Схемы", icon: "LayoutDashboard" },
    { id: "result" as const, label: "Смета", icon: "ClipboardList" },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8]">

      {/* Шапка */}
      <div className="bg-gradient-to-r from-amber-700 via-orange-600 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-6 md:py-8">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div className="flex items-start gap-3">
              <button
                onClick={() => navigate(-1)}
                className="mt-1 text-white/70 hover:text-white transition-colors"
              >
                <Icon name="ArrowLeft" size={20} />
              </button>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🪵</span>
                  <h1 className="text-xl md:text-3xl font-extrabold">Калькулятор строительства бани</h1>
                  <Badge className="bg-white/20 text-white border-0 text-xs hidden sm:inline-flex">Бета</Badge>
                </div>
                <p className="text-amber-100 text-sm">
                  Стены, фундамент, крыша, печь, вентиляция, отделка — смета и схемы
                </p>
              </div>
            </div>
            <Button
              size="sm"
              className="bg-white/20 hover:bg-white/30 border border-white/30 text-white text-xs shrink-0"
              onClick={() => { setViewTab("result"); setShowExportPanel(true); }}
            >
              <Icon name="Printer" size={14} className="mr-1" />
              Печать
            </Button>
          </div>

          {/* KPI */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-xl md:text-2xl font-extrabold">{fmt(bd.total)} ₽</div>
              <div className="text-amber-200 text-xs mt-0.5">Итого под ключ</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{fmt(bd.total / Math.max(config.totalArea, 1))} ₽</div>
              <div className="text-amber-200 text-xs mt-0.5">За 1 м²</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-lg md:text-xl font-bold">{config.totalArea} м²</div>
              <div className="text-amber-200 text-xs mt-0.5">Общая площадь</div>
            </div>
            <div className="bg-white/15 rounded-2xl p-3 text-center">
              <div className="text-base md:text-lg font-bold">{style.emoji} {style.label}</div>
              <div className="text-amber-200 text-xs mt-0.5">Стиль бани</div>
            </div>
          </div>
        </div>
      </div>

      {/* Регион + наценка */}
      <div className="bg-amber-50 border-b border-amber-200">
        <div className="container mx-auto px-4 py-2.5 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Icon name="MapPin" size={13} className="text-amber-600" />
            <select
              value={regionId}
              onChange={e => handleRegionChange(e.target.value)}
              className="text-sm border border-amber-300 rounded-xl px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
            >
              {Object.entries(REGIONS).map(([k, r]) => (
                <option key={k} value={k}>{r.label}</option>
              ))}
            </select>
            <span className="text-xs text-amber-700 font-medium">×{REGIONS[regionId]?.coeff}</span>
          </div>
          <div className="flex items-center gap-2">
            <Icon name="Percent" size={13} className="text-amber-600" />
            <label className="text-xs text-amber-800">Наценка</label>
            <input
              type="number" min={0} max={200} value={markupPct}
              onChange={e => handleMarkupChange(e.target.value)}
              className="w-16 text-sm border border-amber-300 rounded-xl px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="%"
            />
            <span className="text-xs text-amber-700">%</span>
          </div>
          {markupPct > 0 && (
            <span className="text-xs text-orange-600 font-medium ml-auto">
              + {fmt(bd.markupAmount)} ₽ наценки
            </span>
          )}
        </div>
      </div>

      {/* Мобильные табы */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setViewTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  viewTab === t.id ? "border-amber-500 text-amber-700" : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon name={t.icon as Parameters<typeof Icon>[0]["name"]} size={14} />
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-5">

        {/* Параметры */}
        {viewTab === "config" && (
          <div className="lg:grid lg:grid-cols-[1fr_380px] gap-6">
            <Card className="p-4 md:p-6">
              <BathHouseConfigForm config={config} onChange={handleChange} />
            </Card>

            {/* Боковая панель — конфигурация */}
            <div className="hidden lg:block">
              <div className="sticky top-14 space-y-4">
                <Card className="p-4 bg-amber-50 border-amber-200">
                  <h3 className="font-bold text-amber-900 text-sm mb-3 flex items-center gap-2">
                    <Icon name="Settings2" size={14} />
                    Текущая конфигурация
                  </h3>
                  <div className="space-y-1.5 text-xs">
                    {[
                      ["🏠", "Стиль", BATH_STYLES[config.style]?.label],
                      ["📏", "Площадь", `${config.totalArea} м² / высота ${config.wallHeight} м`],
                      ["🪵", "Стены", WALL_MATERIALS[config.wallMaterial]?.label],
                      ["🏗", "Фундамент", FOUNDATION_TYPES[config.foundation]?.label],
                      ["🏠", "Крыша", ROOF_TYPES[config.roofType]?.label],
                      ["🔥", "Печь", STOVE_TYPES[config.stoveType]?.label],
                      ["💨", "Вентиляция", VENTILATION_TYPES[config.ventilation]?.label],
                      ["📐", "Парная", `${config.steamRoomArea} м²`],
                      ["🚿", "Мойка", `${config.washRoomArea} м²`],
                      ["🛋", "Комната отдыха", `${config.restRoomArea} м²`],
                    ].map(([emoji, label, val], i) => (
                      <div key={i} className="flex gap-1.5">
                        <span className="text-base leading-none">{emoji}</span>
                        <span className="text-gray-500">{label}:</span>
                        <span className="text-gray-800 font-medium">{val}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 pt-3 border-t border-amber-200">
                    <div className="text-xs text-amber-800 font-semibold mb-1">Итого</div>
                    <div className="text-2xl font-extrabold text-amber-700">{fmt(bd.total)} ₽</div>
                    <div className="text-xs text-gray-500">{fmt(bd.total / Math.max(config.totalArea, 1))} ₽/м²</div>
                  </div>

                  <Button
                    className="w-full mt-3 bg-amber-600 hover:bg-amber-700 text-white text-sm"
                    onClick={() => setViewTab("result")}
                  >
                    <Icon name="ClipboardList" size={14} className="mr-2" />
                    Открыть смету
                  </Button>
                </Card>

                {/* Рекомендации */}
                <Card className="p-4 space-y-2.5">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <Icon name="Lightbulb" size={14} className="text-amber-500" />
                    Рекомендации
                  </h3>
                  <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-orange-700 mb-1 flex items-center gap-1"><span>🔥</span> Печь</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{bd.stoveRecommendation}</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-blue-700 mb-1 flex items-center gap-1"><span>💨</span> Вентиляция</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{bd.ventRecommendation}</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <div className="text-xs font-bold text-amber-700 mb-1 flex items-center gap-1"><span>🛖</span> Полок</div>
                    <p className="text-xs text-gray-600 leading-relaxed">{bd.shelfRecommendation}</p>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        )}

        {/* Схемы */}
        {viewTab === "scheme" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="overflow-hidden">
              <div className="flex border-b border-gray-100">
                <button
                  onClick={() => setSchemeTab("plan")}
                  className={`flex-1 py-3 text-sm font-medium transition-colors ${schemeTab === "plan" ? "text-amber-700 border-b-2 border-amber-500 bg-amber-50/50" : "text-gray-500 hover:text-gray-700"}`}
                >
                  📐 Планировка
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
                  <>
                    <FloorplanSVG
                      layout={config.layout}
                      steamArea={config.steamRoomArea}
                      washArea={config.washRoomArea}
                      restArea={config.restRoomArea}
                      dressingArea={config.dressingRoomArea}
                    />
                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                      {[
                        { label: "Парная", value: `${config.steamRoomArea} м²`, obj: `${(config.steamRoomArea * config.wallHeight).toFixed(1)} м³` },
                        { label: "Мойка", value: `${config.washRoomArea} м²`, obj: "" },
                        { label: "Комната отдыха", value: `${config.restRoomArea} м²`, obj: "" },
                        { label: "Предбанник", value: config.dressingRoomArea > 0 ? `${config.dressingRoomArea} м²` : "—", obj: "" },
                      ].map((r, i) => (
                        <div key={i} className="bg-amber-50 rounded-lg p-2">
                          <div className="font-semibold text-gray-700">{r.label}</div>
                          <div className="text-gray-600">{r.value}{r.obj ? ` · ${r.obj}` : ""}</div>
                        </div>
                      ))}
                    </div>
                    <p className="text-[11px] text-gray-400 text-center mt-2">Схема приблизительная, не является рабочим чертежом</p>
                  </>
                ) : (
                  <>
                    <ExteriorSVG roofType={config.roofType} wallMaterial={config.wallMaterial} terrace={config.terrace} style={style.label} />
                    <p className="text-[11px] text-gray-400 text-center mt-2">Визуализация условная — для ориентира по форме</p>
                  </>
                )}
              </div>
            </Card>

            {/* Нормы и советы */}
            <Card className="p-4">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
                <Icon name="Info" size={15} className="text-amber-600" />
                Нормы и рекомендации по строительству
              </h3>
              <div className="space-y-2.5">
                {[
                  { icon: "🔥", title: "Размер парной", text: "Оптимум: 2,4×3 м (7,2 м²). Мин. для 2 чел.: 2,2×2,2 м. Высота потолка 2,1–2,3 м — выше тратится больше дров." },
                  { icon: "🛖", title: "Полок: расположение", text: "Верхний полок — у стены напротив печи. Нижний — ступенька 40–50 см. Ширина лежака ≥0,6 м, длина ≥1,8 м." },
                  { icon: "💨", title: "Вентиляция", text: "Приток — у печи на высоте 20 см от пола. Вытяжка — на противоположной стене под потолком. Обмен 3–5 объёмов парной/час." },
                  { icon: "🚪", title: "Дверь в парную", text: "Открывается наружу! Стекло закалённое 8 мм. Порог 15–25 см — держит тепло." },
                  { icon: "💧", title: "Гидроизоляция", text: "В мойке и парной обязательна. В парной — паро-гидробарьер под обшивку. Фольгированный пенофол + герметизация швов." },
                  { icon: "🏗", title: "Усадка", text: "Брус 150×150: усадка 1–2 года. Бревно: 3–5 лет. Клееный брус и каркас: без усадки — можно отделывать сразу." },
                  { icon: "⚡", title: "Электрика в парной", text: "Только специальные термостойкие провода РКГМ. Светильники — IP54 и выше, рассчитаны на 130°C." },
                  { icon: "🔥", title: "Дымоход", text: "Сэндвич-труба ∅115/200 мм. Высота над коньком ≥0,5 м. Расстояние от горючих конструкций ≥250 мм." },
                ].map((item, i) => (
                  <div key={i} className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base">{item.icon}</span>
                      <span className="text-xs font-bold text-amber-900">{item.title}</span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {/* Смета */}
        {viewTab === "result" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-5">
            {/* Детализация */}
            <div className="space-y-4">
              <Card className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Icon name="ClipboardList" size={16} className="text-amber-600" />
                    Детализация сметы
                  </h2>
                  <span className="text-xs text-gray-400">{REGIONS[regionId]?.label}</span>
                </div>

                <div className="space-y-0.5">
                  {breakdownItems.map((item, i) => (
                    <div
                      key={i}
                      className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                        item.key === "assembly" ? "bg-amber-50 font-semibold" : "hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon name={item.icon as Parameters<typeof Icon>[0]["name"]} size={13} className="text-gray-400 shrink-0" />
                        <span className="text-sm text-gray-700">{item.label}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-800 tabular-nums">{fmt(item.value)} ₽</span>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t-2 border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>Материалы + монтаж</span>
                    <span className="tabular-nums">{fmt(bd.subtotal / bd.regionCoeff)} ₽</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Региональный коэффициент ×{bd.regionCoeff} ({REGIONS[regionId]?.label})</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>С учётом региона</span>
                    <span className="tabular-nums">{fmt(bd.subtotal)} ₽</span>
                  </div>
                  {markupPct > 0 && (
                    <div className="flex justify-between text-sm text-orange-600">
                      <span>Наценка {markupPct}%</span>
                      <span className="tabular-nums">+ {fmt(bd.markupAmount)} ₽</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xl font-extrabold text-amber-700 pt-2 border-t-2 border-amber-200">
                    <span>ИТОГО</span>
                    <span className="tabular-nums">{fmt(bd.total)} ₽</span>
                  </div>
                  <div className="text-center text-xs text-gray-400">
                    {fmt(bd.total / Math.max(config.totalArea, 1))} ₽ за 1 м² · площадь {config.totalArea} м²
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 mt-3 leading-relaxed">
                  * Ориентировочный расчёт. Точная стоимость зависит от типа грунта, особенностей проекта, сезона и подрядчика. Для точной сметы обратитесь к партнёрам АВАНГАРД.
                </p>
              </Card>

              {/* CTA партнёры */}
              <Card className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200">
                <h3 className="font-bold text-amber-900 mb-2">Получить предложения от строителей</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Партнёры вашего региона пришлют конкретные предложения с готовой сметой. Сравните и выберите лучшее.
                </p>
                <Button
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                  onClick={() => navigate("/masters")}
                >
                  <Icon name="HardHat" size={15} className="mr-2" />
                  Найти строителей бани
                </Button>
              </Card>
            </div>

            {/* Правая панель: экспорт + рекомендации */}
            <div className="space-y-4">

              {/* Экспорт / Печать */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                    <Icon name="Printer" size={14} className="text-amber-600" />
                    Печать сметы
                  </h3>
                  <button
                    onClick={() => setShowExportPanel(!showExportPanel)}
                    className="text-xs text-gray-400 hover:text-gray-600"
                  >
                    {showExportPanel ? "Скрыть" : "Настроить"}
                  </button>
                </div>

                {/* Тип документа */}
                <div className="flex gap-2 mb-3">
                  {(["smeta", "kp"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setDocType(t)}
                      className={`flex-1 py-2 rounded-xl text-xs font-medium border-2 transition-all ${
                        docType === t ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 text-gray-600"
                      }`}
                    >
                      {t === "smeta" ? "📋 Смета" : "📄 Коммерческое предложение"}
                    </button>
                  ))}
                </div>

                {showExportPanel && (
                  <div className="space-y-2 mb-3">
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Заказчик</Label>
                      <Input value={customer} onChange={e => setCustomer(e.target.value)} placeholder="ФИО или компания" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Подрядчик / ваше название</Label>
                      <Input value={contractor} onChange={e => setContractor(e.target.value)} placeholder="Название компании / ИП" className="h-8 text-sm" />
                    </div>
                    <div>
                      <Label className="text-xs text-gray-500 mb-1 block">Адрес объекта</Label>
                      <Input value={address} onChange={e => setAddress(e.target.value)} placeholder="Адрес строительства" className="h-8 text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Телефон</Label>
                        <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+7..." className="h-8 text-sm" />
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">E-mail</Label>
                        <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="email" className="h-8 text-sm" />
                      </div>
                    </div>
                    {docType === "kp" && (
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Срок действия КП (дней)</Label>
                        <Input value={validDays} onChange={e => setValidDays(e.target.value)} type="number" min={1} max={365} className="h-8 text-sm" />
                      </div>
                    )}
                  </div>
                )}

                <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white" onClick={handlePrint}>
                  <Icon name="Printer" size={15} className="mr-2" />
                  Печать / Сохранить PDF
                </Button>
              </Card>

              {/* Рекомендации */}
              <Card className="p-4 space-y-2.5">
                <h3 className="font-bold text-sm text-gray-800 flex items-center gap-2">
                  <Icon name="Lightbulb" size={14} className="text-amber-500" />
                  Рекомендации
                </h3>
                <div className="bg-orange-50 border border-orange-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-orange-700 mb-1">🔥 Печь</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{bd.stoveRecommendation}</p>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-blue-700 mb-1">💨 Вентиляция</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{bd.ventRecommendation}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <div className="text-xs font-bold text-amber-700 mb-1">🛖 Полок</div>
                  <p className="text-xs text-gray-600 leading-relaxed">{bd.shelfRecommendation}</p>
                </div>
              </Card>

              {/* Что влияет на цену */}
              <Card className="p-4">
                <h3 className="font-bold text-sm text-gray-800 mb-3">Что больше всего влияет на цену</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  {[
                    ["🪵", "Материал стен — разница до 3× (каркас vs клееный брус)"],
                    ["🏗", "Фундамент — сваи дешевле монолита на ~120 000 ₽"],
                    ["🔥", "Кирпичная печь дороже металлической в 5–7 раз"],
                    ["🌡", "Тёплый пол добавляет 8–15% к смете"],
                    ["🪟", "Терраса и лишние окна: +10–25%"],
                    ["🗺", `Ваш регион — коэффициент ×${REGIONS[regionId]?.coeff}`],
                  ].map(([icon, text], i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-base leading-none shrink-0">{icon}</span>
                      <span>{text}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
