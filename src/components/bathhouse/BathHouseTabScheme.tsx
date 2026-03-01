import { useState } from "react";
import { Card } from "@/components/ui/card";
import type { BathHouseConfig } from "@/components/calculator/bathhouse/BathHouseTypes";
import { FloorplanSVG, BathTemplateCard, BATH_TEMPLATES } from "@/components/calculator/bathhouse/BathHouseSchemes";
import { BATH_STYLES } from "@/components/calculator/bathhouse/BathHouseTypes";
import BathHouseNormsCard from "./BathHouseNormsCard";

interface Props {
  config: BathHouseConfig;
}

const EXTERIOR_PHOTOS: Record<string, string> = {
  classic_log:      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/e92a3aac-4375-4446-aa2c-d420a6d9b9f0.jpg",
  modern_frame:     "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7deb69f8-3e9a-4c8c-b4d8-c07585e73d81.jpg",
  scandinavian:     "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/61d20cf1-11b4-4a98-ae86-eec9979e2a73.jpg",
  house_bath:       "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d4c7e1c9-bdd0-4b1c-8a49-c2d5640649ab.jpg",
  brick_classic:    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8f24496d-cb0b-4f47-b1e5-f5734805c767.jpg",
  eco_log:          "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/8542ec57-8970-4cd3-a0ca-46734dce274c.jpg",
  finnish_electric: "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/6f100c79-b30f-4fad-9bc6-401c5540f755.jpg",
  glued_mansard:    "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/36223447-0164-4877-85ff-ecbc9b978146.jpg",
  gazebo_bath:      "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/48f1452f-6a1b-4919-bab8-0b981056cf46.jpg",
  gas_block:        "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/a87655a3-0636-403b-9eec-7a55e04a4363.jpg",
};

const DEFAULT_EXTERIOR_PHOTOS = [
  "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/7deb69f8-3e9a-4c8c-b4d8-c07585e73d81.jpg",
  "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/61d20cf1-11b4-4a98-ae86-eec9979e2a73.jpg",
  "https://cdn.poehali.dev/projects/eb3c2b09-4839-4fa9-b212-eefee1635ef8/files/d4c7e1c9-bdd0-4b1c-8a49-c2d5640649ab.jpg",
];

type MainTab = "plan" | "exterior" | "templates";

export default function BathHouseTabScheme({ config }: Props) {
  const [schemeTab, setSchemeTab] = useState<MainTab>("plan");
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
   
  const style = BATH_STYLES[config.style];

  const activeTpl = BATH_TEMPLATES.find(t => t.id === selectedTemplate);

  return (
    <div className="space-y-5">
      <Card className="overflow-hidden">
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
          {/* Планировка */}
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

          {/* Внешний вид */}
          {schemeTab === "exterior" && (
            <>
              {activeTpl ? (
                <>
                  <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100">
                    <img
                      src={EXTERIOR_PHOTOS[activeTpl.id] ?? DEFAULT_EXTERIOR_PHOTOS[0]}
                      alt={activeTpl.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
                    <div className="font-bold mb-1">{activeTpl.name} — {activeTpl.subtitle}</div>
                    <div className="text-gray-600">{activeTpl.description}</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="rounded-2xl overflow-hidden aspect-video bg-slate-100">
                    <img src={DEFAULT_EXTERIOR_PHOTOS[0]} alt="Баня с панорамными окнами" className="w-full h-full object-cover" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {DEFAULT_EXTERIOR_PHOTOS.slice(1).map((url, i) => (
                      <div key={i} className="rounded-xl overflow-hidden aspect-video bg-slate-100">
                        <img src={url} alt="Баня" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Выберите шаблон во вкладке «Шаблоны» — покажем фото именно вашего стиля
                  </p>
                </>
              )}
            </>
          )}

          {/* Галерея шаблонов */}
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

      <BathHouseNormsCard />
    </div>
  );
}
