import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import {
  APARTMENT_TYPES, RENOVATION_LEVELS, FLOOR_TYPES, CEILING_TYPES, BATHROOM_LEVELS,
} from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import { fmt } from "./turnkeyUtils";

interface Props {
  cfg: TurnkeyConfig;
  onUpdate: (patch: Partial<Omit<TurnkeyConfig, "id">>) => void;
}

const STEPS = [
  { id: 1, label: "Квартира",  icon: "Building2" },
  { id: 2, label: "Уровень",   icon: "Star" },
  { id: 3, label: "Черновые",  icon: "Hammer" },
  { id: 4, label: "Чистовые",  icon: "Sparkles" },
];

function Counter({
  label, value, onChange, min = 0, max = 20,
}: {
  label: string; value: number; onChange: (v: number) => void; min?: number; max?: number;
}) {
  return (
    <div className="flex items-center justify-between gap-2 py-2 border-b border-gray-100 last:border-0">
      <span className="text-sm text-gray-700 flex-1">{label}</span>
      <div className="flex items-center gap-2">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
          <Icon name="Minus" size={12} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-400 hover:text-emerald-600 transition-colors">
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
        checked ? "border-emerald-400 bg-emerald-50" : "border-gray-200 hover:border-emerald-200"
      }`}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={v => onChange(!!v)}
        className="mt-0.5 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
        onClick={e => e.stopPropagation()}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

export default function TurnkeyConfigForm({ cfg, onUpdate }: Props) {
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
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                  : s.id < step ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-400"
              }`}>
                {s.id < step ? <Icon name="Check" size={14} /> : s.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${
                s.id === step ? "text-emerald-700" : "text-gray-400"
              }`}>{s.label}</span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${s.id < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Шаг 1: Квартира */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Тип квартиры</Label>
            <div className="grid grid-cols-5 gap-1.5">
              {APARTMENT_TYPES.map(at => (
                <button
                  key={at.id}
                  type="button"
                  onClick={() => onUpdate({ apartmentType: at.id, totalAreaM2: at.defaultArea })}
                  className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                    cfg.apartmentType === at.id
                      ? "border-emerald-500 bg-emerald-50 shadow-sm"
                      : "border-gray-200 hover:border-emerald-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    cfg.apartmentType === at.id ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon name={at.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
                  </div>
                  <span className={`text-[11px] font-semibold leading-tight ${
                    cfg.apartmentType === at.id ? "text-emerald-700" : "text-gray-700"
                  }`}>{at.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Общая площадь, м²</Label>
              <Input
                type="number" min={15} max={500} step={1}
                value={cfg.totalAreaM2}
                onChange={e => onUpdate({ totalAreaM2: parseFloat(e.target.value) || 15 })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Площадь кухни, м²</Label>
              <Input
                type="number" min={5} max={50} step={0.5}
                value={cfg.kitchenAreaM2}
                onChange={e => onUpdate({ kitchenAreaM2: parseFloat(e.target.value) || 5 })}
                className="h-9"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
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
              <Label className="text-xs text-gray-500 mb-1 block">Санузлов</Label>
              <div className="flex items-center gap-2 h-9">
                <button type="button" onClick={() => onUpdate({ bathroomCount: Math.max(1, cfg.bathroomCount - 1) })}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-400 transition-colors">
                  <Icon name="Minus" size={12} />
                </button>
                <span className="flex-1 text-center text-sm font-bold">{cfg.bathroomCount}</span>
                <button type="button" onClick={() => onUpdate({ bathroomCount: Math.min(5, cfg.bathroomCount + 1) })}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-400 transition-colors">
                  <Icon name="Plus" size={12} />
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Балконов</Label>
              <div className="flex items-center gap-2 h-9">
                <button type="button" onClick={() => onUpdate({ balconyCount: Math.max(0, cfg.balconyCount - 1) })}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-400 transition-colors">
                  <Icon name="Minus" size={12} />
                </button>
                <span className="flex-1 text-center text-sm font-bold">{cfg.balconyCount}</span>
                <button type="button" onClick={() => onUpdate({ balconyCount: Math.min(3, cfg.balconyCount + 1) })}
                  className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-emerald-400 transition-colors">
                  <Icon name="Plus" size={12} />
                </button>
              </div>
            </div>
          </div>

          <button type="button" onClick={() => setStep(2)}
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
            Далее: уровень ремонта →
          </button>
        </div>
      )}

      {/* Шаг 2: Уровень ремонта */}
      {step === 2 && (
        <div className="space-y-3">
          {RENOVATION_LEVELS.map(lv => (
            <button
              key={lv.id}
              type="button"
              onClick={() => onUpdate({ renovationLevel: lv.id })}
              className={`w-full p-4 rounded-xl border text-left transition-all ${
                cfg.renovationLevel === lv.id
                  ? "border-emerald-500 bg-emerald-50 shadow-sm"
                  : "border-gray-200 hover:border-emerald-200"
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    cfg.renovationLevel === lv.id ? "border-emerald-500 bg-emerald-500" : "border-gray-300"
                  }`}>
                    {cfg.renovationLevel === lv.id && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                  <span className="text-sm font-bold text-gray-900">{lv.label}</span>
                </div>
                <span className={`text-sm font-bold ${cfg.renovationLevel === lv.id ? "text-emerald-700" : "text-gray-600"}`}>
                  от {fmt(lv.basePriceM2)} ₽/м²
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-2">{lv.description}</p>
              <div className="flex flex-wrap gap-1">
                {lv.includes.map(item => (
                  <span key={item} className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    cfg.renovationLevel === lv.id ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}>
                    {item}
                  </span>
                ))}
              </div>
            </button>
          ))}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setStep(1)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              ← Назад
            </button>
            <button type="button" onClick={() => setStep(3)}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
              Далее: черновые работы →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Черновые работы */}
      {step === 3 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Черновые работы</p>
          <ToggleRow
            label="Демонтаж"
            description="Снятие старой отделки, вывоз мусора — 1 600 ₽/м²"
            checked={cfg.demolitionIncluded}
            onChange={v => onUpdate({ demolitionIncluded: v })}
          />
          <ToggleRow
            label="Электромонтаж"
            description="Разводка кабелей, щиток, розетки, выключатели — 1 300 ₽/м²"
            checked={cfg.electricsIncluded}
            onChange={v => onUpdate({ electricsIncluded: v })}
          />
          <ToggleRow
            label="Сантехника (разводка)"
            description="Трубы ХВС/ГВС/канализация — 800 ₽/м² + 25 000 ₽ за санузел"
            checked={cfg.plumbingIncluded}
            onChange={v => onUpdate({ plumbingIncluded: v })}
          />
          <ToggleRow
            label="Штукатурка и стяжка"
            description="Выравнивание стен и пола по всей квартире"
            checked={cfg.plastersIncluded}
            onChange={v => onUpdate({ plastersIncluded: v })}
          />

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => setStep(2)}
              className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
              ← Назад
            </button>
            <button type="button" onClick={() => setStep(4)}
              className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
              Далее: чистовые →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Чистовые работы */}
      {step === 4 && (
        <div className="space-y-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Напольное покрытие</p>
          <ToggleRow
            label="Укладка полов"
            description="Финишное напольное покрытие по всей квартире"
            checked={cfg.floorsIncluded}
            onChange={v => onUpdate({ floorsIncluded: v })}
          />
          {cfg.floorsIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Тип покрытия</Label>
              <Select value={cfg.floorType} onValueChange={v => onUpdate({ floorType: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FLOOR_TYPES.map(ft => (
                    <SelectItem key={ft.id} value={ft.id}>
                      {ft.label} — {fmt(ft.priceM2)} ₽/м²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Потолки</p>
          <ToggleRow
            label="Отделка потолков"
            description="Финишная отделка потолков по всей квартире"
            checked={cfg.ceilingsIncluded}
            onChange={v => onUpdate({ ceilingsIncluded: v })}
          />
          {cfg.ceilingsIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Тип потолков</Label>
              <Select value={cfg.ceilingType} onValueChange={v => onUpdate({ ceilingType: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CEILING_TYPES.map(ct => (
                    <SelectItem key={ct.id} value={ct.id}>
                      {ct.label} — {fmt(ct.priceM2)} ₽/м²
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Санузлы и кухня</p>
          <ToggleRow
            label="Ремонт санузлов (под ключ)"
            description="Плитка, гидроизоляция, сантехника, аксессуары"
            checked={cfg.bathroomIncluded}
            onChange={v => onUpdate({ bathroomIncluded: v })}
          />
          {cfg.bathroomIncluded && (
            <div className="ml-4">
              <Label className="text-xs text-gray-500 mb-1 block">Уровень санузлов</Label>
              <Select value={cfg.bathroomLevel} onValueChange={v => onUpdate({ bathroomLevel: v })}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BATHROOM_LEVELS.map(bl => (
                    <SelectItem key={bl.id} value={bl.id}>
                      {bl.label} — {fmt(bl.pricePerUnit)} ₽/санузел
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          <ToggleRow
            label="Монтаж кухни"
            description="Сборка и установка кухонного гарнитура — 16 000 ₽"
            checked={cfg.kitchenIncluded}
            onChange={v => onUpdate({ kitchenIncluded: v })}
          />

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Двери и откосы</p>
          <ToggleRow
            label="Установка дверей"
            description="Межкомнатные двери с установкой — 12 000 ₽/шт"
            checked={cfg.doorsIncluded}
            onChange={v => onUpdate({ doorsIncluded: v })}
          />
          {cfg.doorsIncluded && (
            <div className="ml-4 rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-1">
                <Counter label="Количество дверей" value={cfg.doorsCount} onChange={v => onUpdate({ doorsCount: v })} max={15} />
              </div>
            </div>
          )}
          <ToggleRow
            label="Откосы окон"
            description="Откосы на все окна и балконные двери — 3 200 ₽/проём"
            checked={cfg.windowslopeIncluded}
            onChange={v => onUpdate({ windowslopeIncluded: v })}
          />

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Дополнительно</p>
          <ToggleRow
            label="Сборка мебели"
            description="Сборка и навеска всей мебели — 500 ₽/м² площади"
            checked={cfg.furnitureAssembly}
            onChange={v => onUpdate({ furnitureAssembly: v })}
          />
          <ToggleRow
            label="Финальная уборка"
            description="Генеральная уборка после ремонта — 180 ₽/м²"
            checked={cfg.cleaningIncluded}
            onChange={v => onUpdate({ cleaningIncluded: v })}
          />

          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">Управление объектом</p>
          <ToggleRow
            label="Прораб"
            description="Технический надзор, координация бригад, контроль качества"
            checked={cfg.foremanIncluded}
            onChange={v => onUpdate({ foremanIncluded: v })}
          />
          {cfg.foremanIncluded && (
            <div className="ml-4 flex items-center gap-3">
              <Label className="text-xs text-gray-500 whitespace-nowrap">% от работ</Label>
              <Input
                type="number" min={1} max={50} step={1}
                value={cfg.foremanPct}
                onChange={e => onUpdate({ foremanPct: Math.max(1, Math.min(50, parseFloat(e.target.value) || 10)) })}
                className="h-9 w-24"
              />
              <span className="text-xs text-gray-400">обычно 8–15%</span>
            </div>
          )}
          <ToggleRow
            label="Снабженец"
            description="Закупка материалов, логистика, складской учёт"
            checked={cfg.supplierIncluded}
            onChange={v => onUpdate({ supplierIncluded: v })}
          />
          {cfg.supplierIncluded && (
            <div className="ml-4 flex items-center gap-3">
              <Label className="text-xs text-gray-500 whitespace-nowrap">% от работ</Label>
              <Input
                type="number" min={1} max={30} step={1}
                value={cfg.supplierPct}
                onChange={e => onUpdate({ supplierPct: Math.max(1, Math.min(30, parseFloat(e.target.value) || 5)) })}
                className="h-9 w-24"
              />
              <span className="text-xs text-gray-400">обычно 3–7%</span>
            </div>
          )}

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Примечания</Label>
            <textarea
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-emerald-400 transition-colors"
              placeholder="Особые пожелания, специфика объекта..."
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