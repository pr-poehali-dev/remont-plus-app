import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

interface Props {
  totalSum: number;
  onAction: () => void;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcResultCTA({ totalSum, onAction }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (totalSum <= 0 || !visible) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-5 shadow-xl cursor-pointer group" onClick={() => { reachGoal("calc_lock_price_cta", { total_sum: totalSum }); onAction(); }}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
      <div className="absolute bottom-0 left-0 w-20 h-20 bg-white/5 rounded-full translate-y-8 -translate-x-8" />

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Icon name="Gift" size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight">
            Закрепите цену {fmt(totalSum)} ₽
          </p>
          <p className="text-emerald-100 text-sm mt-1">
            Оставьте номер — зафиксируем стоимость и пришлём смету с гарантией цены на 30 дней
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-emerald-200 text-xs">
              <Icon name="Clock" size={13} />
              <span>Перезвоним за 15 мин</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-200 text-xs">
              <Icon name="Shield" size={13} />
              <span>Цена зафиксирована</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 self-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Icon name="ArrowDown" size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}