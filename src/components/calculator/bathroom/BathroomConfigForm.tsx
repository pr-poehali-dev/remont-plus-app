import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { BATHROOM_TYPES, FLOOR_TILES, WALL_TILES, WATERPROOFING_TYPES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import { fmt } from "./bathroomUtils";

interface Props {
  cfg: BathroomConfig;
  onUpdate: (patch: Partial<Omit<BathroomConfig, "id">>) => void;
}

const STEPS = [
  { id: 1, label: "Санузел",     icon: "Bath" },
  { id: 2, label: "Плитка",      icon: "Grid3x3" },
  { id: 3, label: "Сантехника",  icon: "Wrench" },
  { id: 4, label: "Доп. работы", icon: "Settings" },
];

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
        checked ? "border-teal-400 bg-teal-50" : "border-gray-200 hover:border-teal-200"
      }`}
      onClick={() => onChange(!checked)}
    >
      <Checkbox
        checked={checked}
        onCheckedChange={v => onChange(!!v)}
        className="mt-0.5 data-[state=checked]:bg-teal-600 data-[state=checked]:border-teal-600"
        onClick={e => e.stopPropagation()}
      />
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  onChange,
  min = 0,
  max = 20,
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
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          <Icon name="Minus" size={12} />
        </button>
        <span className="w-8 text-center text-sm font-bold text-gray-900">{value}</span>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-teal-400 hover:text-teal-600 transition-colors"
        >
          <Icon name="Plus" size={12} />
        </button>
      </div>
    </div>
  );
}

export default function BathroomConfigForm({ cfg, onUpdate }: Props) {
  const [step, setStep] = useState(1);

  const selectedFloorTile = FLOOR_TILES.find(t => t.id === cfg.floorTileId);
  const selectedWallTile = WALL_TILES.find(t => t.id === cfg.wallTileId);

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
                  ? "bg-teal-600 text-white shadow-md shadow-teal-200"
                  : s.id < step
                    ? "bg-emerald-500 text-white"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {s.id < step ? <Icon name="Check" size={14} /> : s.id}
              </div>
              <span className={`text-[10px] font-medium hidden sm:block ${s.id === step ? "text-teal-700" : "text-gray-400"}`}>
                {s.label}
              </span>
            </button>
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 ${s.id < step ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </div>
        ))}
      </div>

      {/* Шаг 1: Санузел */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Название помещения</Label>
            <Input
              placeholder="Например: Ванная комната"
              value={cfg.roomName}
              onChange={e => onUpdate({ roomName: e.target.value })}
              className="h-9"
            />
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-2 block">Тип санузла</Label>
            <div className="grid grid-cols-1 gap-2">
              {BATHROOM_TYPES.map(bt => (
                <button
                  key={bt.id}
                  type="button"
                  onClick={() => onUpdate({ bathroomType: bt.id })}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    cfg.bathroomType === bt.id
                      ? "border-teal-500 bg-teal-50 shadow-sm"
                      : "border-gray-200 hover:border-teal-200"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                    cfg.bathroomType === bt.id ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-500"
                  }`}>
                    <Icon name={bt.icon as Parameters<typeof Icon>[0]["name"]} size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">{bt.label}</p>
                    <p className="text-xs text-gray-500">{bt.description}</p>
                  </div>
                  {bt.priceCoeff !== 1 && (
                    <span className="text-xs text-teal-600 font-medium shrink-0">
                      {bt.priceCoeff < 1 ? `−${Math.round((1 - bt.priceCoeff) * 100)}%` : `+${Math.round((bt.priceCoeff - 1) * 100)}%`}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Площадь пола, м²</Label>
              <Input
                type="number" min={1} max={200} step={0.5}
                value={cfg.area}
                onChange={e => onUpdate({ area: parseFloat(e.target.value) || 1 })}
                className="h-9"
              />
            </div>
            <div>
              <Label className="text-xs text-gray-500 mb-1 block">Площадь стен, м²</Label>
              <Input
                type="number" min={1} max={500} step={0.5}
                value={cfg.wallArea}
                onChange={e => onUpdate({ wallArea: parseFloat(e.target.value) || 1 })}
                className="h-9"
              />
            </div>
          </div>

          <ToggleRow
            label="Демонтаж старой отделки"
            description="Снятие плитки, стяжки, сантехники"
            checked={cfg.demolitionIncluded}
            onChange={v => onUpdate({ demolitionIncluded: v })}
          />

          <button
            type="button"
            onClick={() => setStep(2)}
            className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Далее: выбор плитки →
          </button>
        </div>
      )}

      {/* Шаг 2: Плитка */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Icon name="Grid3x3" size={12} />
              Плитка пола
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {FLOOR_TILES.map(tile => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onUpdate({ floorTileId: tile.id })}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                    cfg.floorTileId === tile.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-200"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tile.label}</p>
                    <p className="text-xs text-gray-500">{tile.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-bold ${cfg.floorTileId === tile.id ? "text-teal-700" : "text-gray-600"}`}>
                      {fmt(tile.materialPriceM2)} ₽/м²
                    </p>
                    <p className="text-[10px] text-gray-400">+ {fmt(tile.installPriceM2)} укл.</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Icon name="LayoutGrid" size={12} />
              Плитка стен
            </p>
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {WALL_TILES.map(tile => (
                <button
                  key={tile.id}
                  type="button"
                  onClick={() => onUpdate({ wallTileId: tile.id })}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                    cfg.wallTileId === tile.id
                      ? "border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-200"
                  }`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tile.label}</p>
                    <p className="text-xs text-gray-500">{tile.description}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className={`text-sm font-bold ${cfg.wallTileId === tile.id ? "text-teal-700" : "text-gray-600"}`}>
                      {fmt(tile.materialPriceM2)} ₽/м²
                    </p>
                    <p className="text-[10px] text-gray-400">+ {fmt(tile.installPriceM2)} укл.</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Высота укладки плитки на стены, м</Label>
            <Input
              type="number" min={0.5} max={4} step={0.1}
              value={cfg.wallTileHeightM}
              onChange={e => onUpdate({ wallTileHeightM: parseFloat(e.target.value) || 0.5 })}
              className="h-9"
            />
          </div>

          {selectedFloorTile && selectedWallTile && (
            <div className="bg-teal-50 rounded-lg p-3 text-sm">
              <p className="font-semibold text-teal-800 mb-1">Итог выбора плитки</p>
              <p className="text-xs text-gray-600">Пол: {selectedFloorTile.label} — {fmt(selectedFloorTile.materialPriceM2 + selectedFloorTile.installPriceM2)} ₽/м² (с укладкой)</p>
              <p className="text-xs text-gray-600">Стены: {selectedWallTile.label} — {fmt(selectedWallTile.materialPriceM2 + selectedWallTile.installPriceM2)} ₽/м² (с укладкой)</p>
            </div>
          )}

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
              className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Далее: сантехника →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 3: Сантехника */}
      {step === 3 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide flex items-center gap-1.5">
            <Icon name="Wrench" size={12} />
            Установка сантехники
          </p>

          <ToggleRow
            label="Унитаз"
            description="Монтаж и подключение — 4 500 ₽"
            checked={cfg.toiletInstall}
            onChange={v => onUpdate({ toiletInstall: v })}
          />
          <ToggleRow
            label="Раковина / умывальник"
            description="Монтаж и подключение — 3 500 ₽"
            checked={cfg.sinkInstall}
            onChange={v => onUpdate({ sinkInstall: v })}
          />
          <ToggleRow
            label="Ванна"
            description="Установка акриловой ванны — 7 000 ₽"
            checked={cfg.bathInstall}
            onChange={v => onUpdate({ bathInstall: v })}
          />
          <ToggleRow
            label="Душевая кабина / поддон"
            description="Установка и герметизация — 8 500 ₽"
            checked={cfg.showerCabinInstall}
            onChange={v => onUpdate({ showerCabinInstall: v })}
          />
          <ToggleRow
            label="Инсталляция (подвесной унитаз)"
            description="Монтаж инсталляции в стену — 12 000 ₽"
            checked={cfg.installationSystemIncluded}
            onChange={v => onUpdate({ installationSystemIncluded: v })}
          />

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-50 px-4 py-2.5 border-b border-gray-200">
              <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Смесители</p>
            </div>
            <div className="px-4 py-1">
              <Counter
                label="Количество смесителей (2 500 ₽/шт)"
                value={cfg.mixersCount}
                onChange={v => onUpdate({ mixersCount: v })}
                max={10}
              />
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
              className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Далее: доп. работы →
            </button>
          </div>
        </div>
      )}

      {/* Шаг 4: Дополнительно */}
      {step === 4 && (
        <div className="space-y-4">
          <ToggleRow
            label="Цементная стяжка пола"
            description="Выравнивание пола под плитку — 1 600 ₽/м²"
            checked={cfg.screedIncluded}
            onChange={v => onUpdate({ screedIncluded: v })}
          />

          <div>
            <Label className="text-xs text-gray-500 mb-1.5 block">Гидроизоляция</Label>
            <Select value={cfg.waterproofingType} onValueChange={v => onUpdate({ waterproofingType: v })}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WATERPROOFING_TYPES.map(w => (
                  <SelectItem key={w.id} value={w.id}>
                    {w.label} {w.priceM2 > 0 ? `— ${fmt(w.priceM2)} ₽/м²` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {WATERPROOFING_TYPES.find(w => w.id === cfg.waterproofingType)?.description && (
              <p className="text-xs text-gray-400 mt-1">
                {WATERPROOFING_TYPES.find(w => w.id === cfg.waterproofingType)?.description}
              </p>
            )}
          </div>

          <ToggleRow
            label="Тёплый пол"
            description="Установка системы тёплого пола"
            checked={cfg.heatedFloorIncluded}
            onChange={v => onUpdate({ heatedFloorIncluded: v })}
          />

          {cfg.heatedFloorIncluded && (
            <div className="ml-4 space-y-2">
              {[
                { id: "electric", label: "Электрический (кабель/мат)", price: "2 200 ₽/м²" },
                { id: "water",    label: "Водяной",                     price: "3 500 ₽/м²" },
              ].map(opt => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => onUpdate({ heatedFloorType: opt.id })}
                  className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-left transition-all ${
                    cfg.heatedFloorType === opt.id
                      ? "border-teal-400 bg-teal-50"
                      : "border-gray-200 hover:border-teal-200"
                  }`}
                >
                  <span className="text-sm text-gray-800">{opt.label}</span>
                  <span className="text-sm font-bold text-teal-700">{opt.price}</span>
                </button>
              ))}
            </div>
          )}

          <ToggleRow
            label="Вентиляция"
            description="Монтаж вентканала и вентилятора — 3 200 ₽"
            checked={cfg.ventilationIncluded}
            onChange={v => onUpdate({ ventilationIncluded: v })}
          />

          <ToggleRow
            label="Тумба с раковиной (установка)"
            description="Монтаж мебельной тумбы — 4 000 ₽"
            checked={cfg.vanityInstall}
            onChange={v => onUpdate({ vanityInstall: v })}
          />

          <ToggleRow
            label="Зеркало / зеркальный шкаф"
            description="Навеска зеркала или шкафа — 2 500 ₽"
            checked={cfg.mirrorInstall}
            onChange={v => onUpdate({ mirrorInstall: v })}
          />

          <ToggleRow
            label="Аксессуары"
            description="Полотенцедержатели, крючки, держатель туалетной бумаги — 2 800 ₽"
            checked={cfg.accessoriesIncluded}
            onChange={v => onUpdate({ accessoriesIncluded: v })}
          />

          <div>
            <Label className="text-xs text-gray-500 mb-1 block">Примечания</Label>
            <textarea
              rows={3}
              className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2 resize-none focus:outline-none focus:border-teal-400 transition-colors"
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
