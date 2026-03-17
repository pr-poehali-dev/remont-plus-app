import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { showroomItems } from "@/components/showroom/showroomData";
import { PROJECTS, calcWorkTotal, calcMaterialsTotal, calcInteriorTotal } from "@/types/readyProjects";

interface Props {
  totalSum?: number;
  room?: string;
  calcType?: string;
}

function fmtPrice(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₽`;
  return n.toLocaleString("ru-RU") + " ₽";
}

const ROOM_MAP: Record<string, string[]> = {
  bathroom: ["Ванная"],
  windows: ["Кухня", "Гостиная", "Спальня"],
  ceilings: ["Гостиная", "Спальня", "Кухня"],
  flooring: ["Гостиная", "Спальня"],
  electrics: ["Кухня", "Гостиная"],
  newbuild: ["Гостиная", "Кухня", "Ванная", "Спальня"],
  turnkey: ["Гостиная", "Кухня", "Спальня"],
  bathhouse: ["Ванная"],
  framehouse: ["Гостиная", "Спальня"],
};

export default function SimilarProjects({ totalSum, room, calcType }: Props) {
  const navigate = useNavigate();

  const readyCards = useMemo(() => {
    return PROJECTS.slice(0, 2).map(p => {
      const total = calcWorkTotal(p) + calcMaterialsTotal(p) + calcInteriorTotal(p);
      return {
        id: p.id,
        title: p.title,
        subtitle: `${p.area} м² · ${p.style}`,
        image: p.image,
        price: total,
        link: "/ready-projects",
        type: "ready" as const,
      };
    });
  }, []);

  const showroomCards = useMemo(() => {
    const rooms = room ? [room] : (calcType ? ROOM_MAP[calcType] ?? [] : []);
    let filtered = showroomItems;
    if (rooms.length > 0) {
      filtered = showroomItems.filter(item => rooms.includes(item.room));
    }
    if (filtered.length === 0) filtered = showroomItems;
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 1).map(item => ({
      id: `s-${item.id}`,
      title: item.title,
      subtitle: `${item.area} · ${item.style}`,
      image: item.image,
      price: 0,
      link: "/showroom",
      type: "showroom" as const,
    }));
  }, [room, calcType]);

  const cards = [...readyCards, ...showroomCards].slice(0, 3);

  if (cards.length === 0) return null;

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-2">
          <Icon name="Images" size={13} />
          Похожие проекты
        </p>
        <button
          onClick={() => navigate("/showroom")}
          className="text-xs text-orange-600 hover:text-orange-700 font-medium flex items-center gap-1 transition-colors"
        >
          Все проекты
          <Icon name="ArrowRight" size={12} />
        </button>
      </div>

      <div className="grid gap-2">
        {cards.map(card => (
          <button
            key={card.id}
            onClick={() => navigate(card.link)}
            className="flex items-center gap-3 p-2 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50/30 transition-all text-left group"
          >
            <div className="w-16 h-16 rounded-lg overflow-hidden shrink-0 bg-gray-100">
              <img
                src={card.image}
                alt={card.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{card.title}</p>
              <p className="text-xs text-gray-500 truncate">{card.subtitle}</p>
              {card.price > 0 && (
                <p className="text-xs font-bold text-orange-600 mt-0.5">{fmtPrice(card.price)}</p>
              )}
            </div>
            <Icon name="ChevronRight" size={14} className="text-gray-300 group-hover:text-orange-400 shrink-0 transition-colors" />
          </button>
        ))}
      </div>

      {totalSum && totalSum > 0 && (
        <p className="text-[11px] text-gray-400 text-center pt-1 border-t border-gray-100">
          Ваш расчёт: {totalSum.toLocaleString("ru-RU")} ₽ — сравните с реальными проектами
        </p>
      )}
    </div>
  );
}
