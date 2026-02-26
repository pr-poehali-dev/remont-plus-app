import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionTitle, RadioGroup } from "./FrameHouseFormShared";
import type {
  FrameHouseConfig, FloorType, WindowType, HeatingType, InteriorFinish,
} from "./FrameHouseTypes";
import { FLOOR_TYPES, WINDOW_TYPES, HEATING_TYPES, INTERIOR_FINISHES } from "./FrameHouseTypes";

interface Props {
  config: FrameHouseConfig;
  onChange: (patch: Partial<FrameHouseConfig>) => void;
}

export default function FrameHouseFormInterior({ config, onChange }: Props) {
  return (
    <>
      {/* Полы */}
      <SectionTitle icon="Square">Напольное покрытие</SectionTitle>
      <RadioGroup<FloorType>
        options={(Object.entries(FLOOR_TYPES) as [FloorType, typeof FLOOR_TYPES[FloorType]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: `${v.pricePerM2.toLocaleString("ru-RU")} ₽/м²`,
        }))}
        value={config.floorType}
        onChange={(v) => onChange({ floorType: v })}
        columns={2}
      />

      <div className="mt-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={config.underfloorHeating}
            onChange={e => onChange({ underfloorHeating: e.target.checked })}
            className="w-4 h-4 accent-green-600"
          />
          <span className="text-sm text-gray-700">Тёплый пол (электрический / водяной)</span>
          <span className="text-xs text-gray-400 ml-auto">+2 800 ₽/м²</span>
        </label>
      </div>

      {/* Окна */}
      <SectionTitle icon="AppWindow">Окна</SectionTitle>
      <RadioGroup<WindowType>
        options={(Object.entries(WINDOW_TYPES) as [WindowType, typeof WINDOW_TYPES[WindowType]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: `${v.pricePerUnit.toLocaleString("ru-RU")} ₽/шт.`,
        }))}
        value={config.windowType}
        onChange={(v) => onChange({ windowType: v })}
      />
      <div className="mt-2">
        <Label className="text-xs text-gray-600 mb-1 block">Количество окон</Label>
        <div className="flex gap-2 flex-wrap">
          {[4, 6, 8, 10, 12, 14].map(n => (
            <button
              key={n}
              type="button"
              onClick={() => onChange({ windowCount: n })}
              className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                config.windowCount === n ? "border-green-500 bg-green-50 text-green-800" : "border-gray-200 hover:border-green-300"
              }`}
            >
              {n}
            </button>
          ))}
          <Input
            type="number" min={1} max={50} value={config.windowCount}
            onChange={e => onChange({ windowCount: parseInt(e.target.value) || 8 })}
            className="h-9 w-20 text-sm"
          />
        </div>
      </div>

      {/* Отопление */}
      <SectionTitle icon="Flame">Система отопления</SectionTitle>
      <div className="space-y-1.5">
        {(Object.entries(HEATING_TYPES) as [HeatingType, typeof HEATING_TYPES[HeatingType]][]).map(([key, h]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ heating: key })}
            className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all flex items-center justify-between gap-2 ${
              config.heating === key ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"
            }`}
          >
            <div>
              <div className={`text-sm font-medium ${config.heating === key ? "text-green-800" : "text-gray-700"}`}>{h.label}</div>
              <div className="text-xs text-gray-500">{h.desc}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">от {h.basePrice.toLocaleString("ru-RU")} ₽</div>
          </button>
        ))}
      </div>

      {/* Внутренняя отделка */}
      <SectionTitle icon="PaintRoller">Внутренняя отделка</SectionTitle>
      <div className="space-y-1.5">
        {(Object.entries(INTERIOR_FINISHES) as [InteriorFinish, typeof INTERIOR_FINISHES[InteriorFinish]][]).map(([key, f]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ interiorFinish: key })}
            className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all flex items-center justify-between gap-2 ${
              config.interiorFinish === key ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300 bg-white"
            }`}
          >
            <div>
              <div className={`text-sm font-medium ${config.interiorFinish === key ? "text-green-800" : "text-gray-700"}`}>{f.label}</div>
              <div className="text-xs text-gray-500">{f.desc}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">
              {f.pricePerM2 > 0 ? `${f.pricePerM2.toLocaleString("ru-RU")} ₽/м²` : "—"}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
