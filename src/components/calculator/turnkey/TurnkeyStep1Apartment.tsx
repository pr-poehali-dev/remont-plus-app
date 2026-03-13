import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { APARTMENT_TYPES } from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";

interface Props {
  cfg: TurnkeyConfig;
  onUpdate: (patch: Partial<Omit<TurnkeyConfig, "id">>) => void;
  onNext: () => void;
}

export function TurnkeyStep1Apartment({ cfg, onUpdate, onNext }: Props) {
  return (
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

      <div className="grid grid-cols-4 gap-3">
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

      <button type="button" onClick={onNext}
        className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
        Далее: уровень ремонта →
      </button>
    </div>
  );
}
