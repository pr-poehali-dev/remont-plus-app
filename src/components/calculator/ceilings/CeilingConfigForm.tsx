import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import {
  CEILING_TYPES, CEILING_LEVELS, CEILING_BRANDS, CEILING_COLORS,
  LIGHTING_OPTIONS, PROFILE_OPTIONS,
} from "./CeilingTypes";
import type { CeilingConfig } from "./CeilingTypes";
import { fmt } from "./ceilingUtils";

interface Props {
  cfg: Omit<CeilingConfig, "id" | "totalPrice">;
  onUpdate: (patch: Partial<Omit<CeilingConfig, "id" | "totalPrice">>) => void;
}

const STEPS = [
  { id: 1, label: "Помещение", icon: "Ruler" },
  { id: 2, label: "Потолок", icon: "Layers" },
  { id: 3, label: "Освещение", icon: "Lightbulb" },
  { id: 4, label: "Опции", icon: "Settings" },
];

export default function CeilingConfigForm({ cfg, onUpdate }: Props) {
  const [step, setStep] = useState(1);
  const [length, setLength] = useState<number>(5);
  const [width, setWidth] = useState<number>(4);
  const [shape, setShape] = useState<"rect" | "custom">("rect");

  const selectedLighting = LIGHTING_OPTIONS.find(l => l.id === cfg.lightingId);

  const handleDimChange = (l: number, w: number) => {
    const area = Math.round(l * w * 10) / 10;
    const perim = Math.round((l + w) * 2 * 10) / 10;
    onUpdate({ area, perimeter: perim });
  };

  const setLen = (v: number) => {
    setLength(v);
    handleDimChange(v, width);
  };
  const setWid = (v: number) => {
    setWidth(v);
    handleDimChange(length, v);
  };

  const canNext = () => {
    if (step === 1) return cfg.area > 0 && cfg.perimeter > 0;
    if (step === 2) return !!cfg.ceilingType && !!cfg.brandId;
    return true;
  };

  return (
    <div className="space-y-5">
      {/* Степпер */}
      <div className="flex items-center gap-0">
        {STEPS.map((s, i) => (
          <div key={s.id} className="flex items-center flex-1 last:flex-none">
            <button
              onClick={() => s.id < step && setStep(s.id)}
              className={`flex flex-col items-center gap-1 min-w-[56px] ${s.id < step ? "cursor-pointer" : "cursor-default"}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s.id === step
                  ? "bg-violet-600 text-white shadow-md shadow-violet-200"
                  : s.id < step
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {s.id < step ? <Icon name="Check" size={14} /> : s.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${s.id === step ? "text-violet-700" : "text-gray-400"}`}>
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
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Icon name="Home" size={13} />
              Название помещения
            </p>
            <Input
              value={cfg.roomName}
              onChange={e => onUpdate({ roomName: e.target.value })}
              placeholder="Например: Гостиная, Спальня, Кухня..."
              className="h-10"
            />
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-4 flex items-center gap-2">
              <Icon name="Ruler" size={13} />
              Размеры помещения
            </p>

            <div className="flex gap-3 mb-4">
              <button
                onClick={() => setShape("rect")}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${shape === "rect" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-500"}`}
              >
                <Icon name="Square" size={14} className="inline mr-1" />
                Прямоугольная
              </button>
              <button
                onClick={() => setShape("custom")}
                className={`flex-1 py-2 rounded-lg border text-xs font-medium transition-all ${shape === "custom" ? "border-violet-500 bg-violet-50 text-violet-700" : "border-gray-200 text-gray-500"}`}
              >
                <Icon name="Pentagon" size={14} className="inline mr-1" fallback="Hexagon" />
                Произвольная
              </button>
            </div>

            {shape === "rect" ? (
              <>
                {/* Схема комнаты */}
                <div className="relative bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center mb-4" style={{ height: 140 }}>
                  <div
                    className="relative bg-violet-50 border-2 border-violet-400 rounded"
                    style={{
                      width: Math.min(Math.max(length / (length + width) * 180 + 40, 80), 180),
                      height: Math.min(Math.max(width / (length + width) * 120 + 30, 50), 120),
                    }}
                  >
                    <span className="absolute -top-5 left-1/2 -translate-x-1/2 text-[11px] font-semibold text-violet-700">{length} м</span>
                    <span className="absolute top-1/2 -right-8 -translate-y-1/2 text-[11px] font-semibold text-violet-700">{width} м</span>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-violet-700">{cfg.area} м²</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Icon name="ArrowLeftRight" size={12} />
                      Длина, м
                    </Label>
                    <Input
                      type="number" min={1} max={100} step={0.1}
                      value={length}
                      onChange={e => setLen(parseFloat(e.target.value) || 1)}
                      className="h-10"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs flex items-center gap-1">
                      <Icon name="ArrowUpDown" size={12} />
                      Ширина, м
                    </Label>
                    <Input
                      type="number" min={1} max={100} step={0.1}
                      value={width}
                      onChange={e => setWid(parseFloat(e.target.value) || 1)}
                      className="h-10"
                    />
                  </div>
                </div>

                <div className="mt-3 flex gap-3 bg-violet-50 rounded-lg px-3 py-2.5 text-sm">
                  <span className="text-gray-500">Площадь:</span>
                  <span className="font-semibold text-violet-700">{cfg.area} м²</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-gray-500">Периметр:</span>
                  <span className="font-semibold text-violet-700">{cfg.perimeter} пм</span>
                </div>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Площадь, м²</Label>
                  <Input
                    type="number" min={1} max={1000} step={0.5}
                    value={cfg.area}
                    onChange={e => onUpdate({ area: parseFloat(e.target.value) || 1 })}
                    className="h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Периметр, пм</Label>
                  <Input
                    type="number" min={1} max={500} step={0.5}
                    value={cfg.perimeter}
                    onChange={e => onUpdate({ perimeter: parseFloat(e.target.value) || 1 })}
                    className="h-10"
                  />
                </div>
                <p className="col-span-2 text-xs text-gray-400">
                  Введите точные значения из плана помещения
                </p>
              </div>
            )}
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Количество уровней</p>
            <div className="grid grid-cols-3 gap-2">
              {CEILING_LEVELS.map(l => (
                <button
                  key={l.value}
                  onClick={() => onUpdate({ level: l.value })}
                  className={`p-3 rounded-lg border text-xs font-medium text-center transition-all ${
                    cfg.level === l.value
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Шаг 2: Потолок */}
      {step === 2 && (
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Тип полотна</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CEILING_TYPES.map(ct => (
                <button
                  key={ct.value}
                  onClick={() => onUpdate({ ceilingType: ct.value })}
                  className={`flex flex-col items-start gap-1 p-3 rounded-lg border text-xs font-medium transition-all text-left ${
                    cfg.ceilingType === ct.value
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <Icon name={ct.icon as "Square"} size={16} />
                  <span className="font-semibold">{ct.label}</span>
                  <span className="text-[10px] text-gray-400 font-normal leading-tight">{ct.description}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Бренд плёнки</p>
            <div className="space-y-1.5">
              {CEILING_BRANDS.map(b => (
                <button
                  key={b.id}
                  onClick={() => onUpdate({ brandId: b.id })}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                    cfg.brandId === b.id
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-100 hover:border-gray-200 hover:bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-900">{b.name}</span>
                      <span className="ml-2 text-gray-400">{b.country}</span>
                      <p className="text-gray-500 mt-0.5">{b.description}</p>
                    </div>
                    <span className={`text-[10px] shrink-0 px-1.5 py-0.5 rounded font-medium ${
                      b.priceCoeff < 0.9 ? "bg-green-50 text-green-600" :
                      b.priceCoeff > 1.3 ? "bg-purple-50 text-purple-600" :
                      b.priceCoeff > 1.1 ? "bg-blue-50 text-blue-600" :
                      "bg-gray-50 text-gray-500"
                    }`}>
                      {b.priceCoeff < 0.9 ? "бюджет" : b.priceCoeff > 1.3 ? "премиум" : b.priceCoeff > 1.1 ? "комфорт" : "стандарт"}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Цвет</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CEILING_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => onUpdate({ colorId: c.id })}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                    cfg.colorId === c.id
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span>{c.label}</span>
                  {c.priceAdd > 0 && <span className="block text-[10px] text-gray-400 mt-0.5">+{fmt(c.priceAdd)} ₽/м²</span>}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Шаг 3: Освещение */}
      {step === 3 && (
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
              <Icon name="Lightbulb" size={13} />
              Тип освещения
            </p>
            <div className="space-y-1.5 mb-3">
              {LIGHTING_OPTIONS.map(l => (
                <button
                  key={l.id}
                  onClick={() => onUpdate({ lightingId: l.id })}
                  className={`w-full text-left p-3 rounded-lg border text-xs transition-all ${
                    cfg.lightingId === l.id
                      ? "border-violet-500 bg-violet-50"
                      : "border-gray-100 hover:border-gray-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-semibold text-gray-900">{l.name}</span>
                      <p className="text-gray-500 mt-0.5">{l.description}</p>
                    </div>
                    {l.pricePerUnit > 0 && (
                      <span className="text-gray-400 shrink-0">{fmt(l.pricePerUnit)} ₽/{l.unit}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            {selectedLighting && selectedLighting.id !== "none" && (
              <div className="space-y-1.5 pt-3 border-t border-gray-100">
                <Label className="text-xs">Количество, {selectedLighting.unit}</Label>
                <Input
                  type="number" min={1} max={200}
                  value={cfg.lightingCount}
                  onChange={e => onUpdate({ lightingCount: parseInt(e.target.value) || 1 })}
                  className="h-9 text-sm w-28"
                />
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Шаг 4: Опции */}
      {step === 4 && (
        <div className="space-y-4">
          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Система крепления</p>
            <div className="grid grid-cols-3 gap-2">
              {PROFILE_OPTIONS.map(p => (
                <button
                  key={p.id}
                  onClick={() => onUpdate({ profileId: p.id })}
                  className={`p-2.5 rounded-lg border text-xs font-medium text-center transition-all ${
                    cfg.profileId === p.id
                      ? "border-violet-500 bg-violet-50 text-violet-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  <span className="block font-semibold">{p.label}</span>
                  <span className="block text-[10px] text-gray-400 mt-0.5">{p.description}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Монтаж</p>
            <label className="flex items-center gap-3 cursor-pointer">
              <Checkbox
                checked={cfg.installationIncluded}
                onCheckedChange={v => onUpdate({ installationIncluded: !!v })}
                className="data-[state=checked]:bg-violet-600 data-[state=checked]:border-violet-600"
              />
              <div>
                <span className="text-sm font-medium text-gray-700">Включить монтаж в расчёт</span>
                <p className="text-xs text-gray-400 mt-0.5">+200 ₽/м² — натяжка полотна и установка профиля</p>
              </div>
            </label>
          </Card>

          <Card className="p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Примечание</p>
            <textarea
              value={cfg.note}
              onChange={e => onUpdate({ note: e.target.value })}
              placeholder="Особенности помещения, пожелания к монтажу..."
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300"
            />
          </Card>
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex gap-3 pt-1">
        {step > 1 && (
          <button
            onClick={() => setStep(s => s - 1)}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            <Icon name="ChevronLeft" size={15} />
            Назад
          </button>
        )}
        {step < 4 && (
          <button
            onClick={() => canNext() && setStep(s => s + 1)}
            disabled={!canNext()}
            className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Далее
            <Icon name="ChevronRight" size={15} />
          </button>
        )}
        {step === 4 && (
          <div className="flex-1 flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700 font-medium">
            <Icon name="CheckCircle" size={16} />
            Конфигурация готова — добавьте в смету или создайте документ
          </div>
        )}
      </div>
    </div>
  );
}