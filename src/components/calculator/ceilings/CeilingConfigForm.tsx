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
  LIGHTING_OPTIONS, PROFILE_OPTIONS, CEILING_REGIONS,
} from "./CeilingTypes";
import type { CeilingConfig } from "./CeilingTypes";
import { fmt } from "./ceilingUtils";

interface Props {
  cfg: Omit<CeilingConfig, "id" | "totalPrice">;
  onUpdate: (patch: Partial<Omit<CeilingConfig, "id" | "totalPrice">>) => void;
}

export default function CeilingConfigForm({ cfg, onUpdate }: Props) {
  const selectedLighting = LIGHTING_OPTIONS.find(l => l.id === cfg.lightingId);

  return (
    <div className="space-y-4">

      {/* Регион */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-2">
          <Icon name="MapPin" size={13} />
          Регион
        </p>
        <Select value={cfg.regionId} onValueChange={v => onUpdate({ regionId: v })}>
          <SelectTrigger className="h-9 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CEILING_REGIONS.map(r => (
              <SelectItem key={r.id} value={r.id} className="text-sm">
                {r.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Card>

      {/* Тип полотна */}
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

      {/* Количество уровней */}
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

      {/* Площадь и периметр */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Размеры помещения</p>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Площадь, м²</Label>
            <Input
              type="number" min={1} max={1000} step={0.5}
              value={cfg.area}
              onChange={e => onUpdate({ area: parseFloat(e.target.value) || 1 })}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Периметр, пм</Label>
            <Input
              type="number" min={1} max={500} step={0.5}
              value={cfg.perimeter}
              onChange={e => onUpdate({ perimeter: parseFloat(e.target.value) || 1 })}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Приблизительный периметр квадратной комнаты {cfg.area} м²: {(Math.sqrt(cfg.area) * 4).toFixed(1)} пм
        </p>
      </Card>

      {/* Бренд плёнки */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Бренд плёнки</p>
        <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
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
                <span className="text-[10px] text-gray-400 shrink-0">
                  {b.priceCoeff < 0.9 ? "бюджет" : b.priceCoeff > 1.3 ? "премиум" : b.priceCoeff > 1.1 ? "комфорт" : "стандарт"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </Card>

      {/* Цвет */}
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

      {/* Освещение */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Освещение</p>
        <div className="space-y-1.5 mb-3">
          {LIGHTING_OPTIONS.map(l => (
            <button
              key={l.id}
              onClick={() => onUpdate({ lightingId: l.id })}
              className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all ${
                cfg.lightingId === l.id
                  ? "border-violet-500 bg-violet-50"
                  : "border-gray-100 hover:border-gray-200"
              }`}
            >
              <span className="font-semibold">{l.name}</span>
              <span className="ml-2 text-gray-500">{l.description}</span>
              {l.pricePerUnit > 0 && (
                <span className="ml-2 text-gray-400">{fmt(l.pricePerUnit)} ₽/{l.unit}</span>
              )}
            </button>
          ))}
        </div>
        {selectedLighting && selectedLighting.id !== "none" && (
          <div className="space-y-1.5">
            <Label className="text-xs">Количество, {selectedLighting.unit}</Label>
            <Input
              type="number" min={1} max={200}
              value={cfg.lightingCount}
              onChange={e => onUpdate({ lightingCount: parseInt(e.target.value) || 1 })}
              className="h-8 text-sm w-28"
            />
          </div>
        )}
      </Card>

      {/* Профиль */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Система крепления</p>
        <div className="grid grid-cols-3 gap-2">
          {PROFILE_OPTIONS.map(p => (
            <button
              key={p.id}
              onClick={() => onUpdate({ profileId: p.id })}
              className={`p-2.5 rounded-lg border text-xs font-medium text-left transition-all ${
                cfg.profileId === p.id
                  ? "border-violet-500 bg-violet-50 text-violet-700"
                  : "border-gray-200 text-gray-600 hover:border-gray-300"
              }`}
            >
              <span className="font-semibold block">{p.label}</span>
              <span className="text-[10px] text-gray-400 font-normal">{p.description}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Монтаж */}
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <Checkbox
            id="ceil-install"
            checked={cfg.installationIncluded}
            onCheckedChange={v => onUpdate({ installationIncluded: !!v })}
          />
          <div>
            <Label htmlFor="ceil-install" className="text-sm font-medium cursor-pointer">
              Включить монтаж
            </Label>
            <p className="text-xs text-gray-400 mt-0.5">+200 ₽/м² — демонтаж старого, разметка, натяжка</p>
          </div>
        </div>
      </Card>

      {/* Примечание */}
      <Card className="p-4">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Примечание</p>
        <textarea
          className="w-full text-sm border rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-violet-400"
          rows={2}
          placeholder="Форма комнаты, пожелания, доп. работы..."
          value={cfg.note}
          onChange={e => onUpdate({ note: e.target.value })}
        />
      </Card>

    </div>
  );
}
