import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { TurnkeyConfig } from "./TurnkeyTypes";
import TurnkeyStepApartment from "./TurnkeyStepApartment";
import TurnkeyStepRenovation from "./TurnkeyStepRenovation";
import TurnkeyStepWorks from "./TurnkeyStepWorks";

interface Props {
  cfg: TurnkeyConfig;
  regionId?: string;
  onUpdate: (patch: Partial<Omit<TurnkeyConfig, "id">>) => void;
}

const STEPS = [
  { id: 1, label: "Квартира",  icon: "Building2" },
  { id: 2, label: "Уровень",   icon: "Star" },
  { id: 3, label: "Черновые",  icon: "Hammer" },
  { id: 4, label: "Чистовые",  icon: "Sparkles" },
];

export default function TurnkeyConfigForm({ cfg, regionId, onUpdate }: Props) {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-5">
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

      {step === 1 && (
        <TurnkeyStepApartment cfg={cfg} onUpdate={onUpdate} onNext={() => setStep(2)} />
      )}
      {step === 2 && (
        <TurnkeyStepRenovation cfg={cfg} regionId={regionId} onUpdate={onUpdate} onBack={() => setStep(1)} onNext={() => setStep(3)} />
      )}
      {step === 3 && (
        <TurnkeyStepWorks cfg={cfg} onUpdate={onUpdate} step={3} onBack={() => setStep(2)} onNext={() => setStep(4)} />
      )}
      {step === 4 && (
        <TurnkeyStepWorks cfg={cfg} onUpdate={onUpdate} step={4} onBack={() => setStep(3)} />
      )}
    </div>
  );
}
