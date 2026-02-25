import { useState } from "react";
import { Card } from "@/components/ui/card";
import Icon from "@/components/ui/icon";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import { FloorplanSVG, ExteriorSVG } from "@/components/calculator/bathhouse/BathHouseSchemes";
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

export default function BathHouseTabScheme({ config }: Props) {
  const [schemeTab, setSchemeTab] = useState<"plan" | "exterior">("plan");
  const style = BATH_STYLES[config.style];

  return (
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
