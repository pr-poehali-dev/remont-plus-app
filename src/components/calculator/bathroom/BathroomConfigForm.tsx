import { useState } from "react";
import Icon from "@/components/ui/icon";
import type { BathroomConfig } from "./BathroomTypes";
import BathroomStepRoom from "./BathroomStepRoom";
import BathroomStepTiles from "./BathroomStepTiles";
import BathroomStepExtras from "./BathroomStepExtras";

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

export default function BathroomConfigForm({ cfg, onUpdate }: Props) {
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

      {step === 1 && (
        <BathroomStepRoom
          cfg={cfg}
          onUpdate={onUpdate}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && (
        <BathroomStepTiles
          cfg={cfg}
          onUpdate={onUpdate}
          onNext={() => setStep(3)}
          onBack={() => setStep(1)}
        />
      )}

      {(step === 3 || step === 4) && (
        <BathroomStepExtras
          cfg={cfg}
          onUpdate={onUpdate}
          step={step as 3 | 4}
          onNext={() => setStep(4)}
          onBack={() => setStep(step === 3 ? 2 : 3)}
        />
      )}
    </div>
  );
}
