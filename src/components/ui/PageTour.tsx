import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

export interface TourStep {
  title: string;
  text: string;
  icon: string;
}

interface PageTourProps {
  tourKey: string;
  steps: TourStep[];
  delay?: number;
}

const GLOBAL_OPT_OUT_KEY = "tours_disabled";

export function isTourDisabled(): boolean {
  return localStorage.getItem(GLOBAL_OPT_OUT_KEY) === "1";
}

export default function PageTour({ tourKey, steps, delay = 800 }: PageTourProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const optedOut = localStorage.getItem(GLOBAL_OPT_OUT_KEY) === "1";
    const seen = localStorage.getItem(tourKey) === "1";
    if (!optedOut && !seen) {
      const t = setTimeout(() => setVisible(true), delay);
      return () => clearTimeout(t);
    }
  }, [tourKey, delay]);

  const markDone = () => {
    localStorage.setItem(tourKey, "1");
    setVisible(false);
  };

  const disableAll = () => {
    localStorage.setItem(GLOBAL_OPT_OUT_KEY, "1");
    setVisible(false);
  };

  const handleNext = () => {
    if (step < steps.length - 1) setStep(step + 1);
    else markDone();
  };

  if (!visible) return null;

  const current = steps[step];

  return (
    <>
      <div
        className="fixed inset-0 bg-black/25 z-40 backdrop-blur-[1px]"
        onClick={markDone}
      />

      <div className="fixed z-50 bottom-6 right-6 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Прогресс */}
        <div className="flex">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 transition-colors duration-300 ${i <= step ? "bg-orange-500" : "bg-gray-100"}`}
            />
          ))}
        </div>

        <div className="p-5">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
              <Icon name={current.icon as "Info"} size={20} className="text-orange-500" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{current.title}</p>
              <p className="text-gray-500 text-xs mt-1 leading-relaxed">{current.text}</p>
            </div>
            <button
              onClick={markDone}
              className="text-gray-300 hover:text-gray-500 transition-colors shrink-0 mt-0.5"
              title="Закрыть"
            >
              <Icon name="X" size={15} />
            </button>
          </div>

          <div className="flex items-center justify-between gap-2">
            <button
              onClick={disableAll}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors whitespace-nowrap"
              title="Отключить все подсказки"
            >
              Не показывать
            </button>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-gray-400">{step + 1} / {steps.length}</span>
              <button
                onClick={handleNext}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-1"
              >
                {step < steps.length - 1 ? "Далее" : "Понятно"}
                <Icon name={step < steps.length - 1 ? "ChevronRight" : "Check"} size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
