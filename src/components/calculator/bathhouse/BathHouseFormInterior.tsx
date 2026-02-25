import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { SectionTitle, RadioGroup } from "./BathHouseFormShared";
import type { BathHouseConfig, WallFinishInterior, StoveType, VentilationType, ShelfMaterial, FloorMaterial } from "./BathHouseTypes";
import {
  WALL_FINISHES, STOVE_TYPES, VENTILATION_TYPES, SHELF_MATERIALS, FLOOR_MATERIALS,
} from "./BathHouseTypes";

interface Props {
  config: BathHouseConfig;
  onChange: (patch: Partial<BathHouseConfig>) => void;
}

export default function BathHouseFormInterior({ config, onChange }: Props) {
  const STOVE_META: Record<StoveType, { emoji: string; category: string; categoryColor: string }> = {
    metal_sauna:       { emoji: "🔥", category: "Дровяная", categoryColor: "bg-orange-100 text-orange-700" },
    metal_hakka:       { emoji: "🔥", category: "Дровяная", categoryColor: "bg-orange-100 text-orange-700" },
    brick_classic:     { emoji: "🧱", category: "Кирпичная", categoryColor: "bg-red-100 text-red-700" },
    brick_heater:      { emoji: "🧱", category: "Кирпичная", categoryColor: "bg-red-100 text-red-700" },
    electric_sauna:    { emoji: "⚡", category: "Электро", categoryColor: "bg-blue-100 text-blue-700" },
    electric_infrared: { emoji: "💡", category: "ИК-кабина", categoryColor: "bg-violet-100 text-violet-700" },
    gas_sauna:         { emoji: "🔵", category: "Газовая", categoryColor: "bg-sky-100 text-sky-700" },
    steam_generator:   { emoji: "💨", category: "Пар/Хамам", categoryColor: "bg-teal-100 text-teal-700" },
  };

  const VENT_META: Record<VentilationType, { emoji: string; category: string; categoryColor: string; level: string; levelColor: string }> = {
    natural_simple: { emoji: "🌬️", category: "Естественная", categoryColor: "bg-green-100 text-green-700",  level: "Базовый",    levelColor: "bg-gray-100 text-gray-500" },
    natural_duct:   { emoji: "🌀", category: "Естественная", categoryColor: "bg-green-100 text-green-700",  level: "Стандарт",   levelColor: "bg-blue-100 text-blue-600" },
    forced_supply:  { emoji: "💨", category: "Принудительная", categoryColor: "bg-sky-100 text-sky-700",    level: "Комфорт",    levelColor: "bg-amber-100 text-amber-600" },
    forced_full:    { emoji: "🌪️", category: "Принудительная", categoryColor: "bg-sky-100 text-sky-700",    level: "Продвинутый", levelColor: "bg-orange-100 text-orange-600" },
    recuperator:    { emoji: "♻️", category: "Рекуперация",   categoryColor: "bg-emerald-100 text-emerald-700", level: "Премиум", levelColor: "bg-violet-100 text-violet-600" },
  };

  const stoveCategories = ["Дровяная", "Кирпичная", "Электро", "ИК-кабина", "Газовая", "Пар/Хамам"];
  const ventCategories = ["Естественная", "Принудительная", "Рекуперация"];

  return (
    <>
      {/* Отделка стен */}
      <SectionTitle icon="Paintbrush">Отделка стен — парная</SectionTitle>
      <div className="grid grid-cols-1 gap-1.5">
        {(Object.entries(WALL_FINISHES) as [WallFinishInterior, typeof WALL_FINISHES[WallFinishInterior]][])
          .filter(([, v]) => v.suitsSteam)
          .map(([key, mat]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ wallFinishSteam: key })}
              className={`text-left rounded-xl border-2 px-3 py-2 transition-all flex items-center justify-between ${
                config.wallFinishSteam === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
              }`}
            >
              <span className={`text-sm font-medium ${config.wallFinishSteam === key ? "text-amber-800" : "text-gray-700"}`}>{mat.label}</span>
              <span className="text-xs text-gray-400">{mat.pricePerM2.toLocaleString("ru-RU")} ₽/м²</span>
            </button>
          ))}
      </div>
      {config.wallFinishSteam && !WALL_FINISHES[config.wallFinishSteam].suitsSteam && (
        <p className="text-xs text-orange-600 mt-1 flex items-center gap-1"><Icon name="AlertTriangle" size={12} /> Этот материал не рекомендован для парной</p>
      )}

      <SectionTitle icon="Paintbrush">Отделка стен — мойка</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.entries(WALL_FINISHES) as [WallFinishInterior, typeof WALL_FINISHES[WallFinishInterior]][]).map(([key, mat]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ wallFinishWash: key })}
            className={`text-left rounded-xl border-2 px-2.5 py-2 transition-all ${
              config.wallFinishWash === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
            }`}
          >
            <div className={`text-xs font-medium ${config.wallFinishWash === key ? "text-amber-800" : "text-gray-700"}`}>{mat.label}</div>
            <div className="text-[11px] text-gray-400">{mat.pricePerM2.toLocaleString("ru-RU")} ₽/м²</div>
          </button>
        ))}
      </div>

      <SectionTitle icon="Paintbrush">Отделка стен — комната отдыха</SectionTitle>
      <div className="grid grid-cols-2 gap-1.5">
        {(Object.entries(WALL_FINISHES) as [WallFinishInterior, typeof WALL_FINISHES[WallFinishInterior]][]).map(([key, mat]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ wallFinishRest: key })}
            className={`text-left rounded-xl border-2 px-2.5 py-2 transition-all ${
              config.wallFinishRest === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
            }`}
          >
            <div className={`text-xs font-medium ${config.wallFinishRest === key ? "text-amber-800" : "text-gray-700"}`}>{mat.label}</div>
            <div className="text-[11px] text-gray-400">{mat.pricePerM2.toLocaleString("ru-RU")} ₽/м²</div>
          </button>
        ))}
      </div>

      {/* Полы */}
      <SectionTitle icon="Grid3x3">Полы</SectionTitle>
      <RadioGroup<FloorMaterial>
        options={(Object.entries(FLOOR_MATERIALS) as [FloorMaterial, typeof FLOOR_MATERIALS[FloorMaterial]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: `${v.pricePerM2.toLocaleString("ru-RU")} ₽/м²`,
        }))}
        value={config.floorMaterial}
        onChange={(v) => onChange({ floorMaterial: v })}
        columns={2}
      />
      <label className="flex items-center gap-2 mt-2 cursor-pointer">
        <input
          type="checkbox"
          checked={config.underfloorHeating}
          onChange={e => onChange({ underfloorHeating: e.target.checked })}
          className="rounded accent-amber-500"
        />
        <span className="text-sm text-gray-700">Тёплый пол (электрический)</span>
        <Badge variant="secondary" className="text-[10px]">+2 420 ₽/м²</Badge>
      </label>

      {/* Печь */}
      <SectionTitle icon="Flame">Печь</SectionTitle>
      {stoveCategories.map(cat => {
        const items = (Object.entries(STOVE_TYPES) as [StoveType, typeof STOVE_TYPES[StoveType]][])
          .filter(([k]) => STOVE_META[k].category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{cat}</p>
            <div className="space-y-1.5">
              {items.map(([key, stove]) => {
                const meta = STOVE_META[key];
                const isSelected = config.stoveType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ stoveType: key })}
                    className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all ${
                      isSelected ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">{meta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${isSelected ? "text-amber-800" : "text-gray-700"}`}>{stove.label}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.categoryColor}`}>{meta.category}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{stove.desc}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className={`text-sm font-bold ${isSelected ? "text-amber-700" : "text-gray-700"}`}>{stove.price.toLocaleString("ru-RU")} ₽</div>
                        <div className="text-[10px] text-gray-400">{stove.power}</div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Камни */}
      <div className="mt-2">
        <Label className="text-xs text-gray-600 mb-1 block">Масса камней для каменки, кг</Label>
        <div className="flex gap-2">
          {[20, 40, 60, 80, 120].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => onChange({ stoneMass: m })}
              className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                config.stoneMass === m ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
              }`}
            >
              {m} кг
            </button>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-1">Рекомендация: ~5 кг на 1 м³ объёма парной</p>
      </div>

      {/* Вентиляция */}
      <SectionTitle icon="AirVent">Вентиляция</SectionTitle>
      {ventCategories.map(cat => {
        const items = (Object.entries(VENTILATION_TYPES) as [VentilationType, typeof VENTILATION_TYPES[VentilationType]][])
          .filter(([k]) => VENT_META[k].category === cat);
        if (!items.length) return null;
        return (
          <div key={cat} className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{cat}</p>
            <div className="space-y-1.5">
              {items.map(([key, vent]) => {
                const meta = VENT_META[key];
                const isSelected = config.ventilation === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onChange({ ventilation: key })}
                    className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all ${
                      isSelected ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl leading-none mt-0.5">{meta.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-semibold ${isSelected ? "text-amber-800" : "text-gray-700"}`}>{vent.label}</span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${meta.levelColor}`}>{meta.level}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{vent.desc}</div>
                      </div>
                      <div className={`text-sm font-bold shrink-0 ${isSelected ? "text-amber-700" : "text-gray-700"}`}>
                        {vent.price.toLocaleString("ru-RU")} ₽
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Полок */}
      <SectionTitle icon="AlignVerticalJustifyCenter">Полок</SectionTitle>
      <div className="mb-2">
        <p className="text-xs text-gray-500 mb-1.5">Материал полога</p>
        <div className="grid grid-cols-1 gap-1.5">
          {(Object.entries(SHELF_MATERIALS) as [ShelfMaterial, typeof SHELF_MATERIALS[ShelfMaterial]][]).map(([key, mat]) => (
            <button
              key={key}
              type="button"
              onClick={() => onChange({ shelfMaterial: key })}
              className={`text-left rounded-xl border-2 px-3 py-2 transition-all flex items-center justify-between ${
                config.shelfMaterial === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
              }`}
            >
              <span className={`text-sm font-medium ${config.shelfMaterial === key ? "text-amber-800" : "text-gray-700"}`}>{mat.label}</span>
              <span className="text-xs text-gray-400">{mat.pricePerM2.toLocaleString("ru-RU")} ₽/м²</span>
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-xs text-gray-500 mb-1.5">Количество ярусов</p>
          <div className="flex gap-2">
            {([1, 2, 3] as const).map(t => (
              <button
                key={t}
                type="button"
                onClick={() => onChange({ shelfTiers: t })}
                className={`flex-1 py-2 rounded-xl border-2 text-sm font-semibold transition-all ${
                  config.shelfTiers === t ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label className="text-xs text-gray-500 mb-1.5 block">Ширина полога, м</Label>
          <div className="flex gap-2">
            {[0.4, 0.6, 0.8, 1.0].map(w => (
              <button
                key={w}
                type="button"
                onClick={() => onChange({ shelfWidth: w })}
                className={`flex-1 py-2 rounded-xl border-2 text-xs font-semibold transition-all ${
                  config.shelfWidth === w ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
                }`}
              >
                {w}м
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}