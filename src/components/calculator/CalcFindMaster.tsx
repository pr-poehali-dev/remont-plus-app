import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

interface Props {
  calcType: string;
  totalSum: number;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcFindMaster({ calcType, totalSum }: Props) {
  const navigate = useNavigate();

  if (totalSum <= 0) return null;

  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-violet-700 p-5 shadow-xl cursor-pointer group mt-4"
      onClick={() => navigate(`/masters?work=${encodeURIComponent(calcType)}&budget=${totalSum}`)}
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-10 -translate-x-10" />

      <div className="relative flex items-start gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Icon name="Users" size={24} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base leading-tight">
            Найти мастера на {fmt(totalSum)} ₽
          </p>
          <p className="text-blue-100 text-sm mt-1">
            Проверенные подрядчики готовы взяться за работу — сравните предложения и выберите лучшего
          </p>
          <div className="flex items-center gap-4 mt-3">
            <div className="flex items-center gap-1.5 text-blue-200 text-xs">
              <Icon name="Star" size={13} />
              <span>Рейтинг от 4.5</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs">
              <Icon name="ShieldCheck" size={13} />
              <span>Проверенные</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-200 text-xs">
              <Icon name="Banknote" size={13} />
              <span>Гарантия цены</span>
            </div>
          </div>
        </div>
        <div className="shrink-0 self-center">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
            <Icon name="ArrowRight" size={18} className="text-white" />
          </div>
        </div>
      </div>
    </div>
  );
}
