import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { BATHROOM_TYPES } from "./BathroomTypes";
import type { BathroomConfig } from "./BathroomTypes";
import { ToggleRow } from "./BathroomFormShared";

interface Props {
  cfg: BathroomConfig;
  onUpdate: (patch: Partial<Omit<BathroomConfig, "id">>) => void;
  onNext: () => void;
}

export default function BathroomStepRoom({ cfg, onUpdate, onNext }: Props) {
  return (
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
        onClick={onNext}
        className="w-full h-10 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        Далее: выбор плитки →
      </button>
    </div>
  );
}
