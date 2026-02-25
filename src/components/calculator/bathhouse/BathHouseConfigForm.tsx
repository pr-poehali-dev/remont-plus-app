import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import type { BathHouseConfig, WallMaterial, FoundationType, RoofType, RoofingMaterial, InsulationMaterial, WallFinishInterior, StoveType, VentilationType, ShelfMaterial, FloorMaterial, BathStyle, BathLayout } from "./BathHouseTypes";
import {
  WALL_MATERIALS, FOUNDATION_TYPES, ROOF_TYPES, ROOFING_MATERIALS,
  INSULATION_MATERIALS, WALL_FINISHES, STOVE_TYPES, VENTILATION_TYPES,
  SHELF_MATERIALS, FLOOR_MATERIALS, BATH_STYLES, BATH_LAYOUTS,
} from "./BathHouseTypes";

interface Props {
  config: BathHouseConfig;
  onChange: (patch: Partial<BathHouseConfig>) => void;
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-6 first:mt-0">
      <Icon name={icon as Parameters<typeof Icon>[0]["name"]} size={16} className="text-amber-600" />
      <h3 className="font-bold text-sm text-gray-800 uppercase tracking-wide">{children}</h3>
    </div>
  );
}

function RadioGroup<T extends string>({
  options, value, onChange, columns = 1,
}: {
  options: { value: T; label: string; desc?: string; badge?: string; warn?: boolean }[];
  value: T;
  onChange: (v: T) => void;
  columns?: number;
}) {
  return (
    <div className={`grid gap-2 ${columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-1 sm:grid-cols-3" : "grid-cols-1"}`}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`text-left rounded-xl border-2 p-2.5 transition-all ${
            value === o.value
              ? "border-amber-500 bg-amber-50"
              : "border-gray-200 hover:border-amber-300 bg-white"
          } ${o.warn ? "border-orange-300" : ""}`}
        >
          <div className="flex items-start justify-between gap-1">
            <span className={`text-sm font-medium leading-tight ${value === o.value ? "text-amber-800" : "text-gray-700"}`}>{o.label}</span>
            {o.badge && <Badge variant="secondary" className="text-[10px] shrink-0">{o.badge}</Badge>}
          </div>
          {o.desc && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{o.desc}</p>}
        </button>
      ))}
    </div>
  );
}

export default function BathHouseConfigForm({ config, onChange }: Props) {
  const wallCategories = ["Дерево", "Камень", "Каркас"] as const;

  return (
    <div className="space-y-1">
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
        <Badge variant="secondary" className="text-[10px]">+2 200 ₽/м²</Badge>
      </label>

      {/* Печь */}
      <SectionTitle icon="Flame">Печь</SectionTitle>
      <div className="space-y-1.5">
        {(Object.entries(STOVE_TYPES) as [StoveType, typeof STOVE_TYPES[StoveType]][]).map(([key, stove]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ stoveType: key })}
            className={`w-full text-left rounded-xl border-2 px-3 py-2.5 transition-all ${
              config.stoveType === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className={`text-sm font-semibold ${config.stoveType === key ? "text-amber-800" : "text-gray-700"}`}>{stove.label}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stove.desc}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-gray-700">{stove.price.toLocaleString("ru-RU")} ₽</div>
                <div className="text-[10px] text-gray-400">{stove.power}</div>
              </div>
            </div>
          </button>
        ))}
      </div>

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
      <div className="space-y-1.5">
        {(Object.entries(VENTILATION_TYPES) as [VentilationType, typeof VENTILATION_TYPES[VentilationType]][]).map(([key, vent]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange({ ventilation: key })}
            className={`w-full text-left rounded-xl border-2 px-3 py-2 transition-all flex items-center justify-between gap-2 ${
              config.ventilation === key ? "border-amber-500 bg-amber-50" : "border-gray-200 hover:border-amber-300 bg-white"
            }`}
          >
            <div>
              <div className={`text-sm font-medium ${config.ventilation === key ? "text-amber-800" : "text-gray-700"}`}>{vent.label}</div>
              <div className="text-xs text-gray-500">{vent.desc}</div>
            </div>
            <div className="text-xs text-gray-400 shrink-0">{vent.price.toLocaleString("ru-RU")} ₽</div>
          </button>
        ))}
      </div>

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

      {/* Дополнительно */}
      <SectionTitle icon="PlusCircle">Дополнительно</SectionTitle>
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
          <input type="checkbox" checked={config.window_pvc} onChange={e => onChange({ window_pvc: e.target.checked })} className="accent-amber-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">ПВХ-окна</span>
            <span className="text-xs text-gray-400 block">(снять галочку — деревянные окна)</span>
          </div>
        </label>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-gray-600 w-32 shrink-0">Кол-во окон</Label>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} type="button" onClick={() => onChange({ windowCount: n })}
                className={`w-9 h-9 rounded-xl border-2 text-sm font-bold transition-all ${
                  config.windowCount === n ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
                }`}>{n}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
          <input type="checkbox" checked={config.chimney} onChange={e => onChange({ chimney: e.target.checked })} className="accent-amber-500" />
          <div>
            <span className="text-sm font-medium text-gray-700">Дымоход (сэндвич-труба)</span>
            <span className="text-xs text-gray-400 block">~28 000 ₽</span>
          </div>
        </label>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-gray-600 w-36 shrink-0">Бак для воды, л</Label>
          <div className="flex gap-1.5">
            {[0, 100, 150, 200, 300].map(v => (
              <button key={v} type="button" onClick={() => onChange({ tankVolume: v })}
                className={`px-2.5 h-9 rounded-xl border-2 text-xs font-bold transition-all ${
                  config.tankVolume === v ? "border-amber-500 bg-amber-50 text-amber-800" : "border-gray-200 hover:border-amber-300"
                }`}>{v === 0 ? "Нет" : `${v}л`}</button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl border-2 border-gray-200 hover:border-amber-300 transition-all">
          <input type="checkbox" checked={config.terrace} onChange={e => onChange({ terrace: e.target.checked })} className="accent-amber-500" />
          <div className="flex-1">
            <span className="text-sm font-medium text-gray-700">Терраса / веранда</span>
          </div>
          {config.terrace && (
            <Input type="number" min={4} max={50} value={config.terraceArea}
              onChange={e => onChange({ terraceArea: parseFloat(e.target.value) || 0 })}
              className="w-20 h-8 text-sm" placeholder="м²" />
          )}
        </label>
        <div className="space-y-1">
          <p className="text-xs text-gray-500 font-medium">Электрика</p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={!config.electricalBasic && !config.electricalFull} onChange={() => onChange({ electricalBasic: false, electricalFull: false })} className="accent-amber-500" />
            <span className="text-sm text-gray-700">Без электрики</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={config.electricalBasic && !config.electricalFull} onChange={() => onChange({ electricalBasic: true, electricalFull: false })} className="accent-amber-500" />
            <span className="text-sm text-gray-700">Базовая (освещение + розетки)</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="radio" checked={config.electricalFull} onChange={() => onChange({ electricalBasic: false, electricalFull: true })} className="accent-amber-500" />
            <span className="text-sm text-gray-700">Полная (щиток + разводка + автоматика)</span>
          </label>
        </div>
      </div>
    </div>
  );
}
