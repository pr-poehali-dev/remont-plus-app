import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionTitle, RadioGroup } from "./FrameHouseFormShared";
import type {
  FrameHouseConfig, HouseStyle, HouseLayout, FrameWallTech,
  FrameInsulation, FoundationType, RoofType, RoofingMaterial, FacadeType,
} from "./FrameHouseTypes";
import {
  HOUSE_STYLES, HOUSE_LAYOUTS, FRAME_WALL_TECHS, FRAME_INSULATIONS,
  FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS, FACADE_TYPES,
} from "./FrameHouseTypes";

interface Props {
  config: FrameHouseConfig;
  onChange: (patch: Partial<FrameHouseConfig>) => void;
}

export default function FrameHouseFormStructure({ config, onChange }: Props) {
  return (
    <>
      {/* Стиль дома */}
      <SectionTitle icon="Sparkles">Стиль дома</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(HOUSE_STYLES) as [HouseStyle, typeof HOUSE_STYLES[HouseStyle]][]).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => {
              if (key === "a_frame") {
                onChange({
                  style: key,
                  roofType: "a_frame",
                  floors: 1.5,
                  facade: "fiber_cement",
                  windowType: "pvc_triple",
                  windowCount: 10,
                  wallHeight: 3.0,
                });
              } else if (key === "barnhouse") {
                onChange({
                  style: key,
                  roofType: "flat_single",
                  facade: "osb_paint",
                  roofingMaterial: "seam_roof",
                  floors: 1,
                });
              } else if (key === "scandinavian") {
                onChange({
                  style: key,
                  roofType: "gable",
                  facade: "scandinavian_board",
                  roofingMaterial: "metal_tile",
                  floors: 1,
                });
              } else if (key === "classic") {
                onChange({
                  style: key,
                  roofType: "hip",
                  facade: "imitation_timber",
                  roofingMaterial: "soft_bitumen",
                });
              } else if (key === "eco_wood") {
                onChange({
                  style: key,
                  roofType: "gable",
                  facade: "imitation_timber",
                  roofingMaterial: "soft_bitumen",
                });
              } else if (key === "hi_tech") {
                onChange({
                  style: key,
                  roofType: "flat_single",
                  facade: "fiber_cement",
                  roofingMaterial: "seam_roof",
                  floors: 2,
                });
              } else if (key === "modern") {
                onChange({
                  style: key,
                  roofType: "flat_single",
                  facade: "dspc",
                  roofingMaterial: "seam_roof",
                });
              } else {
                onChange({ style: key });
              }
            }}
            className={`text-left rounded-xl border-2 p-2.5 transition-all ${
              config.style === key ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"
            }`}
          >
            <div className="text-lg mb-0.5">{s.emoji}</div>
            <div className={`text-sm font-semibold leading-tight ${config.style === key ? "text-green-800" : "text-gray-700"}`}>{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-snug">{s.desc}</div>
          </button>
        ))}
      </div>
      {config.style === "a_frame" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: крыша А-фрейм · 1,5 этажа · высота 3 м · 10 окон · фиброцемент
        </div>
      )}
      {config.style === "barnhouse" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: односкатная крыша · 1 этаж · крашеный ОСП фасад · фальцевая кровля
        </div>
      )}
      {config.style === "scandinavian" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: двускатная крыша · 1 этаж · скандинавская доска · металлочерепица
        </div>
      )}
      {config.style === "classic" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: вальмовая крыша · имитация бруса · мягкая черепица
        </div>
      )}
      {config.style === "eco_wood" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: двускатная крыша · имитация бруса · мягкая черепица
        </div>
      )}
      {config.style === "hi_tech" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: плоская крыша · 2 этажа · фиброцемент · фальцевая кровля
        </div>
      )}
      {config.style === "modern" && (
        <div className="text-xs text-green-700 bg-green-50 rounded-lg px-2.5 py-2 leading-snug">
          Автоматически выбраны: плоская крыша · ДСПК фасад · фальцевая кровля
        </div>
      )}

      {/* Планировка */}
      <SectionTitle icon="LayoutDashboard">Планировка</SectionTitle>
      <RadioGroup<HouseLayout>
        options={(Object.entries(HOUSE_LAYOUTS) as [HouseLayout, typeof HOUSE_LAYOUTS[HouseLayout]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: v.desc,
        }))}
        value={config.layout}
        onChange={(v) => onChange({ layout: v })}
        columns={2}
      />

      {/* Основные размеры */}
      <SectionTitle icon="Ruler">Размеры дома</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Этажей</Label>
          <div className="flex gap-2">
            {([
              { value: 1, label: "1" },
              { value: 1.5, label: "1,5" },
              { value: 2, label: "2" },
            ] as const).map(f => (
              <button
                key={f.value}
                type="button"
                onClick={() => onChange({ floors: f.value })}
                className={`flex-1 py-2 rounded-lg border-2 text-sm font-semibold transition-all ${
                  config.floors === f.value ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 hover:border-green-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          {config.floors === 1.5 && (
            <p className="text-xs text-green-700 mt-1.5 bg-green-50 rounded-lg px-2.5 py-1.5 leading-snug">
              Первый этаж полный + зона второго света с потолком 4+ м и панорамными окнами
            </p>
          )}
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Высота потолков, м</Label>
          <Input
            type="number" min={2.4} max={4.0} step={0.1} value={config.wallHeight}
            onChange={e => onChange({ wallHeight: parseFloat(e.target.value) || 2.7 })}
            className="h-9 text-sm"
          />
        </div>
        <div className="col-span-2">
          <Label className="text-xs text-gray-600 mb-1 block">Общая площадь, м²</Label>
          <Input
            type="number" min={30} max={500} value={config.totalArea}
            onChange={e => onChange({ totalArea: parseFloat(e.target.value) || 80 })}
            className="h-9 text-sm"
          />
          <p className="text-xs text-gray-400 mt-1">
            {config.floors === 1.5
              ? `~${Math.round(config.totalArea * 0.65)} м² первый этаж · ~${Math.round(config.totalArea * 0.35)} м² второй свет`
              : `~${Math.round(config.totalArea / config.floors)} м² на этаж`}
          </p>
        </div>
      </div>

      {/* Технология стен */}
      <SectionTitle icon="Layers">Технология каркаса</SectionTitle>
      <div className="space-y-1.5">
        {(Object.entries(FRAME_WALL_TECHS) as [FrameWallTech, typeof FRAME_WALL_TECHS[FrameWallTech]][]).map(([key, t]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ wallTech: key })}
            className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all flex items-center justify-between gap-2 ${
              config.wallTech === key ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"
            }`}
          >
            <div>
              <div className={`text-sm font-medium ${config.wallTech === key ? "text-green-800" : "text-gray-700"}`}>{t.label}</div>
              <div className="text-xs text-gray-500">{t.desc}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">{t.pricePerM2.toLocaleString("ru-RU")} ₽/м²</div>
          </button>
        ))}
      </div>

      {/* Утепление */}
      <SectionTitle icon="Wind">Утепление</SectionTitle>
      <RadioGroup<FrameInsulation>
        options={(Object.entries(FRAME_INSULATIONS) as [FrameInsulation, typeof FRAME_INSULATIONS[FrameInsulation]][]).map(([k, v]) => ({
          value: k,
          label: v.label,
          desc: `${v.thickness} мм · ${v.pricePerM2.toLocaleString("ru-RU")} ₽/м²`,
        }))}
        value={config.insulation}
        onChange={(v) => onChange({ insulation: v })}
      />

      {/* Фундамент */}
      <SectionTitle icon="Building2">Фундамент</SectionTitle>
      <RadioGroup<FoundationType>
        options={(Object.entries(FOUNDATION_TYPES) as [FoundationType, typeof FOUNDATION_TYPES[FoundationType]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: v.desc,
        }))}
        value={config.foundation}
        onChange={(v) => onChange({ foundation: v })}
      />

      {/* Тип крыши */}
      <SectionTitle icon="Home">Тип крыши</SectionTitle>
      <RadioGroup<RoofType>
        options={(Object.entries(ROOF_TYPES) as [RoofType, typeof ROOF_TYPES[RoofType]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: v.desc,
        }))}
        value={config.roofType}
        onChange={(v) => onChange({ roofType: v })}
        columns={2}
      />

      {/* Кровельный материал */}
      <SectionTitle icon="CloudRain">Кровельный материал</SectionTitle>
      <RadioGroup<RoofingMaterial>
        options={(Object.entries(ROOFING_MATERIALS) as [RoofingMaterial, typeof ROOFING_MATERIALS[RoofingMaterial]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: `${v.pricePerM2.toLocaleString("ru-RU")} ₽/м²`,
        }))}
        value={config.roofingMaterial}
        onChange={(v) => onChange({ roofingMaterial: v })}
        columns={2}
      />

      {/* Фасад */}
      <SectionTitle icon="PaintBucket">Фасадный материал</SectionTitle>
      <div className="space-y-1.5">
        {(Object.entries(FACADE_TYPES) as [FacadeType, typeof FACADE_TYPES[FacadeType]][]).map(([key, f]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ facade: key })}
            className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all flex items-center justify-between gap-2 ${
              config.facade === key ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"
            }`}
          >
            <div>
              <div className={`text-sm font-medium ${config.facade === key ? "text-green-800" : "text-gray-700"}`}>{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">{f.pricePerM2.toLocaleString("ru-RU")} ₽/м²</div>
          </button>
        ))}
      </div>
    </>
  );
}