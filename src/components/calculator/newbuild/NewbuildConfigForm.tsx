import { useState } from "react";
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
} from "./NewbuildTypes";
import type { NewbuildConfig } from "./NewbuildTypes";
import { fmt } from "./newbuildUtils";

interface Props {
  cfg: NewbuildConfig;
  onUpdate: (patch: Partial<Omit<NewbuildConfig, "id">>) => void;
}

const STEPS = [
  { id: 1, label: "Помещение", icon: "Home" },
  { id: 2, label: "Уровень",   icon: "Star" },
  { id: 3, label: "Работы",    icon: "Hammer" },
  { id: 4, label: "Финиш",     icon: "Sparkles" },
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
  label, description, checked, onChange,
}: {
  label: string; description?: string; checked: boolean; onChange: (v: boolean) => void;
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
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default function NewbuildConfigForm({ cfg, onUpdate }: Props) {
  const [step, setStep] = useState(1);

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

          <div className="grid grid-cols-2 gap-3">
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
                    от {fmt(lv.basePriceM2)} ₽/м²
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
              Далее: финиш →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Двери и финишные работы */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Потолок</p>
          <ToggleRow
            label="Отделка потолка"
            description="Выравнивание и финишная отделка потолка"
            checked={cfg.ceilingLevelIncluded}
            onChange={v => onUpdate({ ceilingLevelIncluded: v })}
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
          />
          <ToggleRow
            label="Покраска потолка"
            description="Грунтовка + шпаклёвка + покраска"
            checked={cfg.paintingCeiling}
            onChange={v => onUpdate({ paintingCeiling: v })}
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

          <button type="button" onClick={() => setStep(3)}
            className="w-full h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
            ← Назад
          </button>
        </div>
      )}
    </div>
  );
}