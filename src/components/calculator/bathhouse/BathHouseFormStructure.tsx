import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { SectionTitle, RadioGroup } from "./BathHouseFormShared";
import type { BathHouseConfig, WallMaterial, FoundationType, RoofType, RoofingMaterial, InsulationMaterial, BathStyle, BathLayout } from "./BathHouseTypes";
import {
  WALL_MATERIALS, FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS,
  INSULATION_MATERIALS, BATH_STYLES, BATH_LAYOUTS,
} from "./BathHouseTypes";

interface Props {
  config: BathHouseConfig;
  onChange: (patch: Partial<BathHouseConfig>) => void;
}

export default function BathHouseFormStructure({ config, onChange }: Props) {
  const wallCategories = ["Дерево", "Камень", "Каркас"] as const;

  return (
    <>
      {/* Стиль бани */}
      <SectionTitle icon="Sparkles">Стиль бани</SectionTitle>
      <div className="grid grid-cols-2 gap-2">
        {(Object.entries(BATH_STYLES) as [BathStyle, typeof BATH_STYLES[BathStyle]][]).map(([key, s]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ style: key })}
            className={`text-left rounded-xl border-2 p-2.5 transition-all ${
              config.style === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
            }`}
          >
            <div className="text-lg mb-0.5">{s.emoji}</div>
            <div className={`text-sm font-semibold leading-tight ${config.style === key ? "text-amber-800" : "text-gray-700"}`}>{s.label}</div>
            <div className="text-xs text-gray-500 mt-0.5 leading-snug">{s.desc}</div>
          </button>
        ))}
      </div>

      {/* Планировка */}
      <SectionTitle icon="LayoutDashboard">Планировка</SectionTitle>
      <RadioGroup<BathLayout>
        options={(Object.entries(BATH_LAYOUTS) as [BathLayout, typeof BATH_LAYOUTS[BathLayout]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: v.desc,
        }))}
        value={config.layout}
        onChange={(v) => onChange({ layout: v })}
        columns={2}
      />

      {/* Площадь */}
      <SectionTitle icon="Ruler">Площадь помещений, м²</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Общая площадь</Label>
          <Input type="number" min={8} max={200} value={config.totalArea}
            onChange={e => onChange({ totalArea: parseFloat(e.target.value) || 0 })}
            className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Высота стен, м</Label>
          <Input type="number" min={2.0} max={4.0} step={0.1} value={config.wallHeight}
            onChange={e => onChange({ wallHeight: parseFloat(e.target.value) || 2.3 })}
            className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Парная, м²</Label>
          <Input type="number" min={2} max={50} value={config.steamRoomArea}
            onChange={e => onChange({ steamRoomArea: parseFloat(e.target.value) || 0 })}
            className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Мойка, м²</Label>
          <Input type="number" min={2} max={50} value={config.washRoomArea}
            onChange={e => onChange({ washRoomArea: parseFloat(e.target.value) || 0 })}
            className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Комната отдыха, м²</Label>
          <Input type="number" min={0} max={80} value={config.restRoomArea}
            onChange={e => onChange({ restRoomArea: parseFloat(e.target.value) || 0 })}
            className="h-9 text-sm" />
        </div>
        <div>
          <Label className="text-xs text-gray-600 mb-1 block">Предбанник, м²</Label>
          <Input type="number" min={0} max={30} value={config.dressingRoomArea}
            onChange={e => onChange({ dressingRoomArea: parseFloat(e.target.value) || 0 })}
            className="h-9 text-sm" />
        </div>
      </div>

      {/* Материал стен */}
      <SectionTitle icon="Layers">Материал стен</SectionTitle>
      {wallCategories.map((cat) => {
        const items = (Object.entries(WALL_MATERIALS) as [WallMaterial, typeof WALL_MATERIALS[WallMaterial]][])
          .filter(([, v]) => v.category === cat);
        return (
          <div key={cat} className="mb-3">
            <p className="text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">{cat}</p>
            <div className="grid grid-cols-1 gap-1.5">
              {items.map(([key, mat]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => onChange({ wallMaterial: key })}
                  className={`text-left rounded-xl border-2 px-3 py-2 transition-all flex items-center justify-between gap-2 ${
                    config.wallMaterial === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
                  }`}
                >
                  <div>
                    <div className={`text-sm font-medium ${config.wallMaterial === key ? "text-amber-800" : "text-gray-700"}`}>{mat.label}</div>
                    <div className="text-xs text-gray-500">{mat.desc}</div>
                  </div>
                  <div className="text-xs text-gray-400 shrink-0">{mat.pricePerM2.toLocaleString("ru-RU")} ₽/м²</div>
                </button>
              ))}
            </div>
          </div>
        );
      })}

      {/* Фундамент */}
      <SectionTitle icon="Building2">Фундамент</SectionTitle>
      <RadioGroup<FoundationType>
        options={(Object.entries(FOUNDATION_TYPES) as [FoundationType, typeof FOUNDATION_TYPES[FoundationType]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: v.desc,
        }))}
        value={config.foundation}
        onChange={(v) => onChange({ foundation: v })}
      />

      {/* Крыша */}
      <SectionTitle icon="Home">Тип крыши</SectionTitle>
      <RadioGroup<RoofType>
        options={(Object.entries(ROOF_TYPES) as [RoofType, typeof ROOF_TYPES[RoofType]][]).map(([k, v]) => ({
          value: k, label: v.label, desc: v.desc,
        }))}
        value={config.roofType}
        onChange={(v) => onChange({ roofType: v })}
        columns={2}
      />

      <SectionTitle icon="CloudRain">Кровельный материал</SectionTitle>
      <RadioGroup<RoofingMaterial>
        options={(Object.entries(ROOFING_MATERIALS) as [RoofingMaterial, typeof ROOFING_MATERIALS[RoofingMaterial]][]).map(([k, v]) => ({
          value: k, label: `${v.label}`, desc: `${v.pricePerM2.toLocaleString("ru-RU")} ₽/м²`,
        }))}
        value={config.roofingMaterial}
        onChange={(v) => onChange({ roofingMaterial: v })}
        columns={2}
      />

      {/* Утепление */}
      <SectionTitle icon="Wind">Утепление</SectionTitle>
      <RadioGroup<InsulationMaterial>
        options={(Object.entries(INSULATION_MATERIALS) as [InsulationMaterial, typeof INSULATION_MATERIALS[InsulationMaterial]][]).map(([k, v]) => ({
          value: k, label: v.label,
        }))}
        value={config.insulation}
        onChange={(v) => onChange({ insulation: v })}
      />
      <div className="mt-2">
        <Label className="text-xs text-gray-600 mb-1 block">Толщина утеплителя, мм</Label>
        <div className="flex gap-2">
          {[50, 100, 150, 200].map(t => (
            <button
              key={t}
              type="button"
              onClick={() => onChange({ insulationThickness: t })}
              className={`px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                config.insulationThickness === t ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
              }`}
            >
              {t} мм
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
