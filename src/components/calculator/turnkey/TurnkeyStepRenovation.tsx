import { RENOVATION_LEVELS } from "./TurnkeyTypes";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import { fmt } from "./turnkeyUtils";

interface Props {
  cfg: TurnkeyConfig;
  onUpdate: (patch: Partial<Omit<TurnkeyConfig, "id">>) => void;
  onBack: () => void;
  onNext: () => void;
}

export default function TurnkeyStepRenovation({ cfg, onUpdate, onBack, onNext }: Props) {
  return (
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
        <button type="button" onClick={onBack}
          className="flex-1 h-10 border border-gray-200 text-gray-600 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors">
          ← Назад
        </button>
        <button type="button" onClick={onNext}
          className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-colors">
          Далее: черновые работы →
        </button>
      </div>
    </div>
  );
}
