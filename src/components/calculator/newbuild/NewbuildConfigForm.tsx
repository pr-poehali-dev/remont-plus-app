import { useState, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import {
  ROOM_TYPES, RENOVATION_LEVELS, SCREED_TYPES, PLASTER_TYPES,
  CEILING_FINISH_TYPES, FLOORING_TYPES, DOOR_TYPES,
  HEATED_FLOOR_TYPES, BACKSPLASH_TYPES, COUNTERTOP_TYPES,
  CONDITIONER_TYPES, SOUNDPROOF_TYPES,
  BATHTUB_TYPES, SHOWER_TYPES, TOILET_TYPES, SINK_TYPES, PLUMBING_PIPES_TYPES,
  DEFAULT_NEWBUILD_CONFIG,
} from "./NewbuildTypes";
import type { NewbuildConfig } from "./NewbuildTypes";
import { fmt, calcNewbuildPrice } from "./newbuildUtils";
import type { NewbuildPriceBreakdown } from "./newbuildUtils";

interface Props {
  cfg: NewbuildConfig;
  onUpdate: (patch: Partial<Omit<NewbuildConfig, "id">>) => void;
  breakdown?: NewbuildPriceBreakdown;
  regionId?: string;
  markupPct?: number;
}

const STEPS = [
  { id: 1, label: "Помещение", icon: "Home" },
  { id: 2, label: "Уровень",   icon: "Star" },
  { id: 3, label: "Работы",    icon: "Hammer" },
  { id: 4, label: "Доп. опции", icon: "Flame" },
  { id: 5, label: "Финиш",     icon: "Sparkles" },
];

function Counter({
  label, value, onChange, min = 0, max = 50,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors">
          <Icon name="Minus" size={12} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-orange-400 hover:text-orange-600 transition-colors">
          <Icon name="Plus" size={12} />
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label, description, checked, onChange, priceDelta,
}: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void; priceDelta?: number;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        checked ? "border-orange-400 bg-orange-50" : "border-gray-200 hover:border-orange-200"
      }`}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={v => onChange(!!v)}
        className="mt-0.5 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600"
        onClick={e => e.stopPropagation()}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          {priceDelta !== undefined && priceDelta > 0 && (
            <span className={`text-xs font-semibold shrink-0 px-2 py-0.5 rounded-full ${
              checked ? "bg-orange-200 text-orange-800" : "bg-gray-100 text-gray-500"
            }`}>
              +{fmt(priceDelta)} ₽
            </span>
          )}
        </div>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function calcDelta(cfg: NewbuildConfig, field: string, regionId: string, markupPct: number): number {
  const on = calcNewbuildPrice({ ...cfg, [field]: true }, regionId, markupPct).total;
  const off = calcNewbuildPrice({ ...cfg, [field]: false }, regionId, markupPct).total;
  return Math.max(0, on - off);
}

export default function NewbuildConfigForm({ cfg, onUpdate, regionId = "moscow", markupPct = 0 }: Props) {
  const [step, setStep] = useState(1);

  const realPricesM2 = useMemo(() => {
    const result: Record<string, number> = {};
    const area = DEFAULT_NEWBUILD_CONFIG.area || 18;
    for (const lv of RENOVATION_LEVELS) {
      const testCfg = { ...DEFAULT_NEWBUILD_CONFIG, renovationLevel: lv.id };
      const bd = calcNewbuildPrice(testCfg, "other", 0);
      result[lv.id] = Math.round(bd.total / area);
    }
    return result;
  }, []);

  const deltas = {
    screed: calcDelta(cfg, "screedIncluded", regionId, markupPct),
    plaster: calcDelta(cfg, "plasterIncluded", regionId, markupPct),
    electrics: calcDelta(cfg, "electricsIncluded", regionId, markupPct),
    ceiling: calcDelta(cfg, "ceilingLevelIncluded", regionId, markupPct),
    paintWalls: calcDelta(cfg, "paintingWalls", regionId, markupPct),
    paintCeiling: calcDelta(cfg, "paintingCeiling", regionId, markupPct),
    delivery: calcDelta(cfg, "deliveryIncluded", regionId, markupPct),
    heatedFloor: calcDelta(cfg, "heatedFloorIncluded", regionId, markupPct),
    backsplash: calcDelta(cfg, "backsplashIncluded", regionId, markupPct),
    countertop: calcDelta(cfg, "countertopIncluded", regionId, markupPct),
    conditioner: calcDelta(cfg, "conditionerIncluded", regionId, markupPct),
    soundproof: calcDelta(cfg, "soundproofIncluded", regionId, markupPct),
    plumbing: calcDelta(cfg, "plumbingIncluded", regionId, markupPct),
    bathtub: calcDelta({ ...cfg, plumbingIncluded: true }, "bathtubIncluded", regionId, markupPct),
    shower: calcDelta({ ...cfg, plumbingIncluded: true }, "showerIncluded", regionId, markupPct),
    toilet: calcDelta({ ...cfg, plumbingIncluded: true }, "toiletIncluded", regionId, markupPct),
    sink: calcDelta({ ...cfg, plumbingIncluded: true }, "sinkIncluded", regionId, markupPct),
  };

  return (
    <div className="space-y-5">
      {/* Степпер */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              type="button"
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex flex-col items-center gap-1 min-w-[56px] ${s.id < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.id === step
                  ? "bg-orange-600 text-white shadow-md shadow-orange-200"
                  : s.id < step ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {s.id < step ? <Icon name="Check" size={14} /> : s.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${
                s.id === step ? "text-orange-700" : "text-gray-400"
              }`}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${s.id < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Шаг 1: Помещение */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Название помещения</Label>
            <Input
              placeholder="Например: Спальня"
              value={cfg.roomName}
              onChange={e => onUpdate({ roomName: e.target.value })}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Тип помещения</Label>
            <div className="grid grid-cols-2 gap-2">
              {ROOM_TYPES.map(rt => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => onUpdate({ roomType: rt.id })}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                    cfg.roomType === rt.id
                      ? "border-orange-500 bg-orange-50 shadow-sm"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    cfg.roomType === rt.id ? "bg-orange-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon name={rt.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{rt.label}</p>
                    {rt.priceCoeff > 1 && (
                      <p className="text-[10px] text-orange-600">+{Math.round((rt.priceCoeff - 1) * 100)}% к цене</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Площадь, м²</Label>
              <Input
                type="number" min={1} max={300} step={0.5}
                value={cfg.area}
                onChange={e => onUpdate({ area: parseFloat(e.target.value) || 1 })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Высота потолков, м</Label>
              <Input
                type="number" min={2.2} max={5} step={0.05}
                value={cfg.ceilingHeightM}
                onChange={e => onUpdate({ ceilingHeightM: parseFloat(e.target.value) || 2.7 })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Этаж</Label>
              <Input
                type="number" min={1} max={100} step={1}
                value={cfg.floorNumber || 1}
                onChange={e => onUpdate({ floorNumber: Math.max(1, parseInt(e.target.value) || 1) })}
                className="h-9"
              />
            </div>
          </div>

          <button type="button" onClick={() => setStep(2)}
            className="w-full h-10 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
            Далее: уровень ремонта →
          </button>
        </div>
      )}

      {/* Шаг 2: Уровень ремонта */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="space-y-2">
            {RENOVATION_LEVELS.map(lv => (
              <button
                key={lv.id}
                type="button"
                onClick={() => onUpdate({ renovationLevel: lv.id })}
                className={`w-full p-4 rounded-xl border text-left transition-all ${
                  cfg.renovationLevel === lv.id
                    ? "border-orange-500 bg-orange-50 shadow-sm"
                    : "border-gray-200 hover:border-orange-200"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      cfg.renovationLevel === lv.id
                        ? "border-orange-500 bg-orange-500"
                        : "border-gray-300"
                    }`}>
                      {cfg.renovationLevel === lv.id && <div className="w-2 h-2 rounded-full bg-white" />}
                    </div>
                    <span className="text-sm font-bold text-gray-900">{lv.label}</span>
                  </div>
                  <span className={`text-sm font-bold ${cfg.renovationLevel === lv.id ? "text-orange-700" : "text-gray-600"}`}>
                    от {fmt(realPricesM2[lv.id] || lv.basePriceM2)} ₽/м²
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-2">{lv.description}</p>
                <div className="flex flex-wrap gap-1">
                  {lv.includes.map(item => (
                    <span key={item} className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      cfg.renovationLevel === lv.id
                        ? "bg-orange-100 text-orange-700"
                        : "bg-gray-100 text-gray-500"
                    }`}>
                      {item}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              ← Назад
            </button>
            <button type="button" onClick={() => setStep(3)}
              className="flex-1 h-10 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
              Далее: работы →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Черновые работы */}
      {step === 3 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Стяжка пола</p>
          <ToggleRow
            label="Стяжка пола"
            description="Выравнивание основания под финишное покрытие"
            checked={cfg.screedIncluded}
            onChange={v => onUpdate({ screedIncluded: v })}
            priceDelta={deltas.screed}
          />
          {cfg.screedIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Тип стяжки</Label>
              <Select value={cfg.screedType} onValueChange={v => onUpdate({ screedType: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SCREED_TYPES.map(s => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.label} — {fmt(s.priceM2)} ₽/м²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Штукатурка стен</p>
          <ToggleRow
            label="Штукатурка стен"
            description="Выравнивание стен под финишную отделку"
            checked={cfg.plasterIncluded}
            onChange={v => onUpdate({ plasterIncluded: v })}
            priceDelta={deltas.plaster}
          />
          {cfg.plasterIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Тип штукатурки</Label>
              <Select value={cfg.plasterType} onValueChange={v => onUpdate({ plasterType: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLASTER_TYPES.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.label} — {fmt(p.priceM2)} ₽/м²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Электрика</p>
          <ToggleRow
            label="Электромонтаж"
            description="Разводка кабелей, подрозетники, монтаж"
            checked={cfg.electricsIncluded}
            onChange={v => onUpdate({ electricsIncluded: v })}
            priceDelta={deltas.electrics}
          />
          {cfg.electricsIncluded && (
            <div className="ml-4 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-1">
                <Counter label="Розетки (600 ₽/шт)" value={cfg.outletsCount} onChange={v => onUpdate({ outletsCount: v })} max={30} />
                <Counter label="Выключатели (450 ₽/шт)" value={cfg.switchesCount} onChange={v => onUpdate({ switchesCount: v })} max={20} />
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Напольное покрытие</p>
          <div>
            <Label className="text-xs text-gray-500 mb-1.5 block">Тип покрытия</Label>
            <div className="space-y-1.5">
              {FLOORING_TYPES.map(ft => (
                <button
                  key={ft.id}
                  type="button"
                  onClick={() => onUpdate({ flooringType: ft.id })}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                    cfg.flooringType === ft.id
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ft.label}</p>
                    <p className="text-xs text-gray-500">{ft.description}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.flooringType === ft.id ? "text-orange-700" : "text-gray-500"}`}>
                    {fmt(ft.priceM2)} ₽/м²
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setStep(2)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              ← Назад
            </button>
            <button type="button" onClick={() => setStep(4)}
              className="flex-1 h-10 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
              Далее: доп. опции →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Дополнительные опции */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Тёплый пол</p>
          <ToggleRow
            label="Тёплый пол"
            description="Комфортная температура пола в любое время года"
            checked={cfg.heatedFloorIncluded}
            onChange={v => onUpdate({ heatedFloorIncluded: v })}
            priceDelta={deltas.heatedFloor}
          />
          {cfg.heatedFloorIncluded && (
            <div className="ml-4 space-y-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Тип тёплого пола</Label>
                <div className="space-y-1.5">
                  {HEATED_FLOOR_TYPES.map(ht => (
                    <button
                      key={ht.id}
                      type="button"
                      onClick={() => onUpdate({ heatedFloorType: ht.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        cfg.heatedFloorType === ht.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ht.label}</p>
                        <p className="text-xs text-gray-500">{ht.description}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.heatedFloorType === ht.id ? "text-orange-700" : "text-gray-500"}`}>
                        {fmt(ht.priceM2)} ₽/м²
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Площадь обогрева, м² (0 = 70% от комнаты)</Label>
                <Input
                  type="number" min={0} max={cfg.area} step={0.5}
                  value={cfg.heatedFloorArea}
                  onChange={e => onUpdate({ heatedFloorArea: parseFloat(e.target.value) || 0 })}
                  className="h-9"
                />
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Кухонный фартук и столешница</p>
          <ToggleRow
            label="Кухонный фартук"
            description="Защитная отделка стены над рабочей зоной"
            checked={cfg.backsplashIncluded}
            onChange={v => onUpdate({ backsplashIncluded: v })}
            priceDelta={deltas.backsplash}
          />
          {cfg.backsplashIncluded && (
            <div className="ml-4 space-y-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Тип фартука</Label>
                <div className="space-y-1.5">
                  {BACKSPLASH_TYPES.map(bs => (
                    <button
                      key={bs.id}
                      type="button"
                      onClick={() => onUpdate({ backsplashType: bs.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        cfg.backsplashType === bs.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{bs.label}</p>
                        <p className="text-xs text-gray-500">{bs.description}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.backsplashType === bs.id ? "text-orange-700" : "text-gray-500"}`}>
                        {fmt(bs.priceM2)} ₽/м²
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Площадь фартука, м²</Label>
                <Input
                  type="number" min={0.5} max={20} step={0.5}
                  value={cfg.backsplashArea}
                  onChange={e => onUpdate({ backsplashArea: parseFloat(e.target.value) || 3 })}
                  className="h-9"
                />
              </div>
            </div>
          )}

          <ToggleRow
            label="Столешница"
            description="Рабочая поверхность для кухонного гарнитура"
            checked={cfg.countertopIncluded}
            onChange={v => onUpdate({ countertopIncluded: v })}
            priceDelta={deltas.countertop}
          />
          {cfg.countertopIncluded && (
            <div className="ml-4 space-y-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Материал столешницы</Label>
                <div className="space-y-1.5">
                  {COUNTERTOP_TYPES.map(ct => (
                    <button
                      key={ct.id}
                      type="button"
                      onClick={() => onUpdate({ countertopType: ct.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        cfg.countertopType === ct.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ct.label}</p>
                        <p className="text-xs text-gray-500">{ct.description}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.countertopType === ct.id ? "text-orange-700" : "text-gray-500"}`}>
                        {fmt(ct.pricePerMeter)} ₽/м.п.
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Длина столешницы, м.п.</Label>
                <Input
                  type="number" min={0.5} max={10} step={0.5}
                  value={cfg.countertopLength}
                  onChange={e => onUpdate({ countertopLength: parseFloat(e.target.value) || 3 })}
                  className="h-9"
                />
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Кондиционирование</p>
          <ToggleRow
            label="Кондиционер"
            description="Закладка трасс до отделки + монтаж оборудования"
            checked={cfg.conditionerIncluded}
            onChange={v => onUpdate({ conditionerIncluded: v })}
            priceDelta={deltas.conditioner}
          />
          {cfg.conditionerIncluded && (
            <div className="ml-4 space-y-3">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Тип кондиционера</Label>
                <div className="space-y-1.5">
                  {CONDITIONER_TYPES.map(ac => (
                    <button
                      key={ac.id}
                      type="button"
                      onClick={() => onUpdate({ conditionerType: ac.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        cfg.conditionerType === ac.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{ac.label}</p>
                        <p className="text-xs text-gray-500">{ac.description}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.conditionerType === ac.id ? "text-orange-700" : "text-gray-500"}`}>
                        {fmt(ac.pricePerUnit)} ₽
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-1">
                  <Counter label="Количество точек" value={cfg.conditionerCount} onChange={v => onUpdate({ conditionerCount: v })} min={1} max={10} />
                </div>
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Сантехника</p>
          <ToggleRow
            label="Сантехника и разводка труб"
            description="Разводка водоснабжения и канализации, установка приборов"
            checked={cfg.plumbingIncluded}
            onChange={v => onUpdate({ plumbingIncluded: v })}
            priceDelta={deltas.plumbing}
          />
          {cfg.plumbingIncluded && (
            <div className="ml-4 space-y-4">
              <div>
                <Label className="text-xs text-gray-500 mb-1.5 block">Тип труб</Label>
                <div className="space-y-1.5">
                  {PLUMBING_PIPES_TYPES.map(pt => (
                    <button
                      key={pt.id}
                      type="button"
                      onClick={() => onUpdate({ plumbingPipesType: pt.id })}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                        cfg.plumbingPipesType === pt.id
                          ? "border-orange-500 bg-orange-50"
                          : "border-gray-200 hover:border-orange-200"
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{pt.label}</p>
                        <p className="text-xs text-gray-500">{pt.description}</p>
                      </div>
                      <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.plumbingPipesType === pt.id ? "text-orange-700" : "text-gray-500"}`}>
                        {fmt(pt.pricePerPoint)} ₽/точка
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-1">
                  <Counter label="Точек водоснабжения" value={cfg.plumbingPointsCount} onChange={v => onUpdate({ plumbingPointsCount: v })} min={1} max={20} />
                </div>
              </div>

              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Сантехнические приборы</p>

              <ToggleRow
                label="Ванна"
                description="Ванна с каркасом, экраном и монтажом"
                checked={cfg.bathtubIncluded}
                onChange={v => onUpdate({ bathtubIncluded: v })}
                priceDelta={deltas.bathtub}
              />
              {cfg.bathtubIncluded && (
                <div className="ml-4">
                  <div className="space-y-1.5">
                    {BATHTUB_TYPES.map(bt => (
                      <button
                        key={bt.id}
                        type="button"
                        onClick={() => onUpdate({ bathtubType: bt.id })}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                          cfg.bathtubType === bt.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bt.label}</p>
                          <p className="text-xs text-gray-500">{bt.description}</p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.bathtubType === bt.id ? "text-orange-700" : "text-gray-500"}`}>
                          {fmt(bt.pricePerUnit)} ₽
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <ToggleRow
                label="Душевая кабина / зона"
                description="Душ с поддоном или walk-in перегородка"
                checked={cfg.showerIncluded}
                onChange={v => onUpdate({ showerIncluded: v })}
                priceDelta={deltas.shower}
              />
              {cfg.showerIncluded && (
                <div className="ml-4">
                  <div className="space-y-1.5">
                    {SHOWER_TYPES.map(sh => (
                      <button
                        key={sh.id}
                        type="button"
                        onClick={() => onUpdate({ showerType: sh.id })}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                          cfg.showerType === sh.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sh.label}</p>
                          <p className="text-xs text-gray-500">{sh.description}</p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.showerType === sh.id ? "text-orange-700" : "text-gray-500"}`}>
                          {fmt(sh.pricePerUnit)} ₽
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <ToggleRow
                label="Унитаз"
                description="Напольный или подвесной с инсталляцией"
                checked={cfg.toiletIncluded}
                onChange={v => onUpdate({ toiletIncluded: v })}
                priceDelta={deltas.toilet}
              />
              {cfg.toiletIncluded && (
                <div className="ml-4 space-y-3">
                  <div className="space-y-1.5">
                    {TOILET_TYPES.map(tl => (
                      <button
                        key={tl.id}
                        type="button"
                        onClick={() => onUpdate({ toiletType: tl.id })}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                          cfg.toiletType === tl.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{tl.label}</p>
                          <p className="text-xs text-gray-500">{tl.description}</p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.toiletType === tl.id ? "text-orange-700" : "text-gray-500"}`}>
                          {fmt(tl.pricePerUnit)} ₽
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-1">
                      <Counter label="Количество унитазов" value={cfg.toiletCount} onChange={v => onUpdate({ toiletCount: v })} min={1} max={5} />
                    </div>
                  </div>
                </div>
              )}

              <ToggleRow
                label="Раковина"
                description="Раковина с тумбой или на пьедестале"
                checked={cfg.sinkIncluded}
                onChange={v => onUpdate({ sinkIncluded: v })}
                priceDelta={deltas.sink}
              />
              {cfg.sinkIncluded && (
                <div className="ml-4 space-y-3">
                  <div className="space-y-1.5">
                    {SINK_TYPES.map(sk => (
                      <button
                        key={sk.id}
                        type="button"
                        onClick={() => onUpdate({ sinkType: sk.id })}
                        className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                          cfg.sinkType === sk.id
                            ? "border-orange-500 bg-orange-50"
                            : "border-gray-200 hover:border-orange-200"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900">{sk.label}</p>
                          <p className="text-xs text-gray-500">{sk.description}</p>
                        </div>
                        <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.sinkType === sk.id ? "text-orange-700" : "text-gray-500"}`}>
                          {fmt(sk.pricePerUnit)} ₽
                        </span>
                      </button>
                    ))}
                  </div>
                  <div className="rounded-xl border border-gray-200 overflow-hidden">
                    <div className="px-4 py-1">
                      <Counter label="Количество раковин" value={cfg.sinkCount} onChange={v => onUpdate({ sinkCount: v })} min={1} max={5} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Шумоизоляция</p>
          <ToggleRow
            label="Шумоизоляция"
            description="Защита от шума соседей — актуально для новостроек"
            checked={cfg.soundproofIncluded}
            onChange={v => onUpdate({ soundproofIncluded: v })}
            priceDelta={deltas.soundproof}
          />
          {cfg.soundproofIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1.5 block">Уровень шумоизоляции</Label>
              <div className="space-y-1.5">
                {SOUNDPROOF_TYPES.map(sp => (
                  <button
                    key={sp.id}
                    type="button"
                    onClick={() => onUpdate({ soundproofType: sp.id })}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                      cfg.soundproofType === sp.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-gray-200 hover:border-orange-200"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">{sp.label}</p>
                      <p className="text-xs text-gray-500">{sp.description}</p>
                    </div>
                    <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.soundproofType === sp.id ? "text-orange-700" : "text-gray-500"}`}>
                      {fmt(sp.priceM2)} ₽/м²
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setStep(3)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              ← Назад
            </button>
            <button type="button" onClick={() => setStep(5)}
              className="flex-1 h-10 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors">
              Далее: финиш →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 5: Двери и финишные работы */}
      {step === 5 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Потолок</p>
          <ToggleRow
            label="Отделка потолка"
            description="Выравнивание и финишная отделка потолка"
            checked={cfg.ceilingLevelIncluded}
            onChange={v => onUpdate({ ceilingLevelIncluded: v })}
            priceDelta={deltas.ceiling}
          />
          {cfg.ceilingLevelIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Тип потолка</Label>
              <Select value={cfg.ceilingType} onValueChange={v => onUpdate({ ceilingType: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEILING_FINISH_TYPES.map(ct => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.label} — {fmt(ct.priceM2)} ₽/м²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Малярные работы</p>
          <ToggleRow
            label="Покраска стен"
            description="Грунтовка + шпаклёвка + покраска"
            checked={cfg.paintingWalls}
            onChange={v => onUpdate({ paintingWalls: v })}
            priceDelta={deltas.paintWalls}
          />
          <ToggleRow
            label="Покраска потолка"
            description="Грунтовка + шпаклёвка + покраска"
            checked={cfg.paintingCeiling}
            onChange={v => onUpdate({ paintingCeiling: v })}
            priceDelta={deltas.paintCeiling}
          />
          {(cfg.paintingWalls || cfg.paintingCeiling) && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Количество слоёв краски</Label>
              <div className="flex gap-2">
                {[2, 3].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => onUpdate({ paintLayersCount: n })}
                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                      cfg.paintLayersCount === n
                        ? "border-orange-500 bg-orange-50 text-orange-700"
                        : "border-gray-200 text-gray-600 hover:border-orange-200"
                    }`}
                  >
                    {n} слоя
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Двери</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-1">
              <Counter label="Межкомнатных дверей" value={cfg.doorsCount} onChange={v => onUpdate({ doorsCount: v })} max={10} />
            </div>
          </div>
          {cfg.doorsCount > 0 && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Класс дверей</Label>
              <Select value={cfg.doorType} onValueChange={v => onUpdate({ doorType: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DOOR_TYPES.map(dt => (
                    <SelectItem key={dt.id} value={dt.id}>
                      {dt.label} — {fmt(dt.pricePerDoor)} ₽/шт
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Откосы и примечания</p>
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="px-4 py-1">
              <Counter
                label="Откосы окон (3 500 ₽/проём)"
                value={cfg.windowSlopesCount}
                onChange={v => onUpdate({ windowSlopesCount: v })}
                max={20}
              />
            </div>
          </div>

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Доставка</p>
          <ToggleRow
            label="Доставка материалов + подъём на этаж"
            description={`Доставка до подъезда и подъём на ${cfg.floorNumber || 1}-й этаж (расчёт по весу)`}
            checked={cfg.deliveryIncluded}
            onChange={v => onUpdate({ deliveryIncluded: v })}
            priceDelta={deltas.delivery}
          />

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Примечания</Label>
            <textarea
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-orange-400 transition-colors"
              placeholder="Особые требования, дополнительные работы..."
              value={cfg.note}
              onChange={e => onUpdate({ note: e.target.value })}
            />
          </div>

          <button type="button" onClick={() => setStep(4)}
            className="w-full h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            ← Назад
          </button>
        </div>
      )}
    </div>
  );
}