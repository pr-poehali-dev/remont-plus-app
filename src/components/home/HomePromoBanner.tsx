import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

export default function HomePromoBanner() {
  const [visible, setVisible] = useState(true);
  const navigate = useNavigate();

  const deadline = new Date("2026-04-15T23:59:59");
  const now = new Date();
  if (now > deadline || !visible) return null;

  const diff = deadline.getTime() - now.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  return (
    <div className="relative bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-black">
      <div
        className="max-w-6xl mx-auto flex items-center justify-center gap-3 px-4 py-3 cursor-pointer"
        onClick={() => navigate("/calculator/newbuild")}
      >
        <Icon name="Gift" size={20} className="shrink-0" />
        <p className="text-sm sm:text-base font-semibold text-center">
          Все сервисы <span className="uppercase">бесплатно</span> до 15 апреля!
          <span className="hidden sm:inline"> Калькуляторы, сметы, дизайн-проект — без ограничений.</span>
          <span className="ml-2 opacity-75 font-medium">
            {days > 0 ? `Осталось ${days} дн.` : "Последний день!"}
          </span>
        </p>
        <Icon name="ArrowRight" size={16} className="shrink-0 hidden sm:block" />
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); setVisible(false); }}
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Закрыть"
      >
        <Icon name="X" size={16} />
      </button>
    </div>
  );
}
