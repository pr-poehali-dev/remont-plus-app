import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import Icon from "@/components/ui/icon";
import { ROOM_TYPES, CABLING_TYPES } from "./ElectricsTypes";
import type { ElectricsConfig } from "./ElectricsTypes";

interface Props {
  cfg: ElectricsConfig;
  onUpdate: (patch: Partial<Omit<ElectricsConfig, "id">>) => void;
}

const STEPS = [
  { id: 1, label: "Помещение",    icon: "Home" },
  { id: 2, label: "Розетки",      icon: "Plug" },
  { id: 3, label: "Кабели",       icon: "Cable" },
  { id: 4, label: "Щиток",        icon: "LayoutDashboard" },
];

function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 50,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Icon name="Minus" size={12} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors"
        >
          <Icon name="Plus" size={12} />
        </button>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
        checked ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200"
      }`}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={v => onChange(!!v)}
        className="mt-0.5 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
        onClick={e => e.stopPropagation()}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default function ElectricsConfigForm({ cfg, onUpdate }: Props) {
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
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : s.id < step
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {s.id < step ? <Icon name="Check" size={14} /> : s.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${s.id === step ? "text-blue-700" : "text-gray-400"}`}>
                {s.label}
              </span>
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
                  key={rt.value}
                  type="button"
                  onClick={() => onUpdate({ roomType: rt.value })}
                  className={`flex items-center gap-2.5 p-3 rounded-lg border text-left transition-all ${
                    cfg.roomType === rt.value
                      ? "border-blue-500 bg-blue-50 shadow-sm"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    cfg.roomType === rt.value ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon name={rt.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">{rt.label}</p>
                    {rt.priceCoeff > 1 && (
                      <p className="text-[10px] text-blue-600">+{Math.round((rt.priceCoeff - 1) * 100)}% к цене</p>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Площадь помещения, м²</Label>
            <Input
              type="number" min={1} max={500} step={0.5}
              value={cfg.area}
              onChange={e => onUpdate({ area: parseFloat(e.target.value) || 1 })}
              className="h-9"
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Далее: розетки и выключатели →
          </button>
        </div>
      )}

      {/* Шаг 2: Розетки и выключатели */}
      {step === 2 && (
        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Icon name="Plug" size={13} />
                Розетки
              </p>
            </div>
            <div className="px-4 py-1">
              <Counter label="Розетки 220В одинарные" value={cfg.outletsCount} onChange={v => onUpdate({ outletsCount: v })} />
              <Counter label="Розетки 220В двойные" value={cfg.doubleOutletsCount} onChange={v => onUpdate({ doubleOutletsCount: v })} />
              <Counter label="Розетки с заземлением" value={cfg.groundedOutletsCount} onChange={v => onUpdate({ groundedOutletsCount: v })} />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Icon name="ToggleLeft" size={13} />
                Выключатели
              </p>
            </div>
            <div className="px-4 py-1">
              <Counter label="Выключатели одинарные" value={cfg.switchesCount} onChange={v => onUpdate({ switchesCount: v })} />
              <Counter label="Выключатели двойные" value={cfg.doubleSwitchesCount} onChange={v => onUpdate({ doubleSwitchesCount: v })} />
              <Counter label="Диммеры (регуляторы)" value={cfg.dimmersCount} onChange={v => onUpdate({ dimmersCount: v })} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Назад
            </button>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Далее: кабели →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Кабели и освещение */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Тип прокладки кабеля</Label>
            <div className="space-y-2">
              {CABLING_TYPES.map(ct => (
                <button
                  key={ct.id}
                  type="button"
                  onClick={() => onUpdate({ cablingType: ct.id })}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                    cfg.cablingType === ct.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-blue-200"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{ct.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{ct.description}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ml-3 ${cfg.cablingType === ct.id ? "text-blue-700" : "text-gray-500"}`}>
                    {ct.pricePerM} ₽/м
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Протяжка кабеля, м</Label>
            <Input
              type="number" min={0} max={500} step={1}
              value={cfg.cableRunM}
              onChange={e => onUpdate({ cableRunM: parseInt(e.target.value) || 0 })}
              className="h-9"
            />
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-2">
                <Icon name="Lightbulb" size={13} />
                Освещение
              </p>
            </div>
            <div className="px-4 py-1">
              <Counter label="Группы освещения (точки подключения)" value={cfg.lightGroupsCount} onChange={v => onUpdate({ lightGroupsCount: v })} max={20} />
              <Counter label="Точечные светильники (врезка)" value={cfg.spotLightsCount} onChange={v => onUpdate({ spotLightsCount: v })} max={50} />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Назад
            </button>
            <button
              type="button"
              onClick={() => setStep(4)}
              className="flex-1 h-10 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Далее: щиток →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Щиток и опции */}
      {step === 4 && (
        <div className="space-y-4">
          <ToggleRow
            label="Монтаж электрощитка"
            description="Установка и подключение распределительного щита"
            checked={cfg.panelIncluded}
            onChange={v => onUpdate({ panelIncluded: v })}
          />

          {cfg.panelIncluded && (
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Количество автоматических выключателей</Label>
              <Input
                type="number" min={1} max={64} step={1}
                value={cfg.breakersCount}
                onChange={e => onUpdate({ breakersCount: parseInt(e.target.value) || 1 })}
                className="h-9"
              />
              <p className="text-xs text-gray-400 mt-1">Щиток: 3 500 ₽ + 550 ₽ за каждый автомат</p>
            </div>
          )}

          <ToggleRow
            label="Контур заземления"
            description="Устройство контура заземления, провод PE"
            checked={cfg.groundingIncluded}
            onChange={v => onUpdate({ groundingIncluded: v })}
          />

          <ToggleRow
            label="Проверка и тестирование"
            description="Проверка всех цепей, замер сопротивления изоляции"
            checked={cfg.testingIncluded}
            onChange={v => onUpdate({ testingIncluded: v })}
          />

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Примечания</Label>
            <textarea
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-blue-400 transition-colors"
              placeholder="Особые требования, дополнительные работы..."
              value={cfg.note}
              onChange={e => onUpdate({ note: e.target.value })}
            />
          </div>

          <button
            type="button"
            onClick={() => setStep(3)}
            className="w-full h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Назад
          </button>
        </div>
      )}
    </div>
  );
}