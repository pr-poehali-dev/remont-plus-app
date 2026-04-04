import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import reachGoal from "@/lib/metrika";

interface Props {
  calcType: string;
  totalSum: number;
}

function fmt(n: number): string {
  return n.toLocaleString("ru-RU");
}

export default function CalcCreateProject({ calcType, totalSum }: Props) {
  const navigate = useNavigate();

  if (totalSum <= 0) return null;

  const handleClick = () => {
    reachGoal("calc_create_project", { calc_type: calcType, total_sum: totalSum });
    sessionStorage.setItem(
      "organizer_init",
      JSON.stringify({ calcType, totalSum, createdAt: new Date().toISOString() })
    );
    navigate("/organizer");
  };

  return (
    <button
      onClick={handleClick}
      className="w-full mt-3 flex items-center gap-3 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 p-4 transition-all group text-left"
    >
      <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center shrink-0 group-hover:bg-violet-200 transition-colors">
        <Icon name="ClipboardList" size={20} className="text-violet-600" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm">
          Создать проект из сметы
        </p>
        <p className="text-gray-400 text-xs mt-0.5">
          {calcType} · {fmt(totalSum)} ₽ → план, сроки, бюджет
        </p>
      </div>
      <Icon name="ChevronRight" size={16} className="text-gray-300 group-hover:text-violet-500 transition-colors shrink-0" />
    </button>
  );
}