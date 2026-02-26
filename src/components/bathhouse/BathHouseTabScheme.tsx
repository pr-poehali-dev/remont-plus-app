import { useState } from "react";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import { FloorplanSVG, ExteriorSVG, BathTemplateCard, BATH_TEMPLATES } from "@/components/calculator/bathhouse/BathHouseSchemes";
import { BATH_STYLES } from "@/components/calculator/bathhouse/BathHouseTypes";

interface Props {
  config: BathHouseConfig;
}

const NORMS = [
  { icon: "🔥", title: "Размер парной", text: "Оптимум: 2,4×3 м (7,2 м²). Мин. для 2 чел.: 2,2×2,2 м. Высота потолка 2,1–2,3 м — выше тратится больше дров." },
  { icon: "🛖", title: "Полок: расположение", text: "Верхний полок — у стены напротив печи. Нижний — ступенька 40–50 см. Ширина лежака ≥0,6 м, длина ≥1,8 м." },
  { icon: "💨", title: "Вентиляция", text: "Приток — у печи на высоте 20 см от пола. Вытяжка — на противоположной стене под потолком. Обмен 3–5 объёмов парной/час." },
  { icon: "🚪", title: "Дверь в парную", text: "Открывается наружу! Стекло закалённое 8 мм. Порог 15–25 см — держит тепло." },
  { icon: "💧", title: "Гидроизоляция", text: "В мойке и парной обязательна. В парной — паро-гидробарьер под обшивку. Фольгированный пенофол + герметизация швов." },
  { icon: "🏗", title: "Усадка", text: "Брус 150×150: усадка 1–2 года. Бревно: 3–5 лет. Клееный брус и каркас: без усадки — можно отделывать сразу." },
  { icon: "⚡", title: "Электрика в парной", text: "Только специальные термостойкие провода РКГМ. Светильники — IP54 и выше, рассчитаны на 130°C." },
  { icon: "🔥", title: "Дымоход", text: "Сэндвич-труба ∅115/200 мм. Высота над коньком ≥0,5 м. Расстояние от горючих конструкций ≥250 мм." },
];

type MainTab = "plan" | "exterior" | "templates";

export default function BathHouseTabScheme({ config }: Props) {
  const [schemeTab, setSchemeTab] = useState<MainTab>("plan");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const style = BATH_STYLES[config.style];

  const activeTpl = BATH_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-5">
      {/* ── Схема / Шаблоны ─────────────────────── */}
      <Card className="overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          {[
            { key: "plan" as MainTab, icon: "📐", label: "Планировка" },
            { key: "exterior" as MainTab, icon: "🏠", label: "Внешний вид" },
            { key: "templates" as MainTab, icon: "🗂️", label: "Шаблоны бань" },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setSchemeTab(tab.key)}
              className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-1.5 ${
                schemeTab === tab.key
                  ? "text-amber-700 border-b-2 border-amber-500 bg-white"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        <div className="p-4">
          {/* ── Планировка ── */}
          {schemeTab === "plan" && (
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
                  { label: "Парная", value: `${config.steamRoomArea} м²`, sub: `${(config.steamRoomArea * config.wallHeight).toFixed(1)} м³`, color: "bg-orange-50 border-orange-100" },
                  { label: "Мойка", value: `${config.washRoomArea} м²`, sub: "", color: "bg-blue-50 border-blue-100" },
                  { label: "Комн. отдыха", value: `${config.restRoomArea} м²`, sub: "", color: "bg-green-50 border-green-100" },
                  { label: "Предбанник", value: config.dressingRoomArea > 0 ? `${config.dressingRoomArea} м²` : "—", sub: "", color: "bg-yellow-50 border-yellow-100" },
                ].map((r, i) => (
                  <div key={i} className={`rounded-lg p-2 border ${r.color}`}>
                    <div className="font-semibold text-gray-700 text-[11px]">{r.label}</div>
                    <div className="text-gray-600 font-mono text-[11px]">{r.value}{r.sub ? ` · ${r.sub}` : ""}</div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gray-400 text-center mt-2 font-mono">
                СХЕМА ПРЕДВАРИТЕЛЬНАЯ • НЕ ЯВЛЯЕТСЯ РАБОЧИМ ЧЕРТЕЖОМ
              </p>
            </>
          )}

          {/* ── Внешний вид ── */}
          {schemeTab === "exterior" && (
            <>
              <ExteriorSVG
                roofType={activeTpl ? activeTpl.roofType : config.roofType}
                wallMaterial={activeTpl ? activeTpl.wallMaterial : config.wallMaterial}
                terrace={activeTpl ? activeTpl.terrace : config.terrace}
                style={activeTpl ? activeTpl.name : style.label}
              />
              {activeTpl && (
                <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                  <div className="font-bold mb-1">{activeTpl.name} — {activeTpl.subtitle}</div>
                  <div className="text-gray-600">{activeTpl.description}</div>
                </div>
              )}
              <p className="text-[10px] text-gray-400 text-center mt-2">Визуализация условная — для ориентира по форме</p>
            </>
          )}

          {/* ── Галерея шаблонов ── */}
          {schemeTab === "templates" && (
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold text-gray-900">10 видов современных бань</h3>
                {selectedTemplate && (
                  <button
                    onClick={() => setSelectedTemplate(null)}
                    className="text-xs text-gray-400 hover:text-gray-600 underline"
                  >
                    Сбросить выбор
                  </button>
                )}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {BATH_TEMPLATES.map(tpl => (
                  <BathTemplateCard
                    key={tpl.id}
                    tpl={tpl}
                    selected={selectedTemplate === tpl.id}
                    onSelect={() => {
                      setSelectedTemplate(prev => prev === tpl.id ? null : tpl.id);
                      setSchemeTab("exterior");
                    }}
                  />
                ))}
              </div>

              {/* Detail panel */}
              {activeTpl && (
                <div className="mt-4 p-4 bg-amber-50 rounded-2xl border border-amber-200">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-base font-bold text-amber-900">{activeTpl.name}</div>
                      <div className="text-sm text-gray-600">{activeTpl.subtitle} · {activeTpl.area}</div>
                      <p className="text-sm text-gray-700 mt-1">{activeTpl.description}</p>
                    </div>
                    <div className="flex gap-1 flex-wrap justify-end min-w-[120px]">
                      {activeTpl.tags.map(tag => (
                        <span key={tag} className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 whitespace-nowrap">{tag}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={() => setSchemeTab("exterior")}
                    className="mt-3 text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 transition-colors"
                  >
                    Посмотреть внешний вид →
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* ── Нормы ─────────────────────────────── */}
      <Card className="p-4">
        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-sm">
          <Icon name="Info" size={15} className="text-amber-600" />
          Нормы и рекомендации по строительству
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {NORMS.map((item, i) => (
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
  );
}
