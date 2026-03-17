import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import CalcOrderForm from "./CalcOrderForm";
import { reachGoal } from "@/lib/metrika";

interface Props {
  totalSum: number;
  totalArea?: number;
  calcType: string;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcStickyBar({ totalSum, totalArea, calcType }: Props) {
  const [showForm, setShowForm] = useState(false);

  if (totalSum <= 0) return null;

  const handleOpen = () => {
    setShowForm(true);
    reachGoal("sticky_bar_click", { calcType });
  };

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden">
        <div className="bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3">
          <div className="flex items-center justify-between gap-3 max-w-lg mx-auto">
            <div className="min-w-0">
              <p className="text-lg font-bold text-gray-900 tabular-nums">{fmt(totalSum)} ₽</p>
              {totalArea && totalArea > 0 && (
                <p className="text-xs text-gray-400">{fmt(Math.round(totalSum / totalArea))} ₽/м²</p>
              )}
            </div>
            <Button
              onClick={handleOpen}
              className="bg-orange-600 hover:bg-orange-700 text-white shrink-0 gap-2 px-5 h-11 text-sm font-semibold rounded-xl shadow-lg shadow-orange-200"
            >
              <Icon name="Send" size={15} />
              Получить смету
            </Button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative w-full max-w-md mx-4 mb-4 sm:mb-0 animate-in slide-in-from-bottom duration-200">
            <button
              onClick={() => setShowForm(false)}
              className="absolute -top-10 right-0 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-500 hover:text-gray-900 transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
            <CalcOrderForm
              calcType={calcType}
              total={`от ${fmt(totalSum)} ₽`}
              onClose={() => setShowForm(false)}
            />
          </div>
        </div>
      )}
    </>
  );
}
