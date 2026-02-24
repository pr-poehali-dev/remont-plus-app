import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { WATERPROOFING_TYPES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import { fmt } from "./bathroomUtils";
import { ToggleRow, Counter } from "./BathroomFormShared";

const HEATED_FLOOR_OPTIONS = [
  { id: "electric", label: "Электрический (кабель/мат)", price: "2 200 ₽/м²" },
  { id: "water",    label: "Водяной",                     price: "3 500 ₽/м²" },
];

interface Props {
  cfg: BathroomConfig;
  onUpdate: (patch: Partial<Omit<BathroomConfig, "id">>) => void;
  step: 3 | 4;
  onNext: () => void;
  onBack: () => void;
}

export default function BathroomStepExtras({ cfg, onUpdate, step, onNext, onBack }: Props) {
  if (step === 3) {
    return (
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
            onClick={onBack}
            className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Назад
          </button>
          <button
            type="button"
            onClick={onNext}
            className="flex-1 h-10 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Далее: доп. работы →
          </button>
        </div>
      </div>
    );
  }

  // step === 4
  return (
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
          {HEATED_FLOOR_OPTIONS.map(opt => (
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
        onClick={onBack}
        className="w-full h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors"
      >
        ← Назад
      </button>
    </div>
  );
}
