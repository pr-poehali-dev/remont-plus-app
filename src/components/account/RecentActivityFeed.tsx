import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  type: "calc" | "homestaging" | "designer" | "shared" | "payment";
  title: string;
  subtitle?: string;
  amount?: number;
  date: string;
  path: string;
  icon: string;
  color: string;
}

interface Props {
  homestagingReports?: Array<{
    id: number;
    room_type: string;
    overall_score: number;
    short_summary: string;
    created_at: string;
  }>;
}

const LOCAL_KEYS = [
  { key: "avangard_lemanapro_estimate", type: "calc" as const, title: "Смета ЛеманаПро", path: "/lemanapro", icon: "ShoppingCart", color: "from-green-400 to-emerald-500" },
  { key: "avangard_designer_project", type: "designer" as const, title: "Дизайн-проект", path: "/designer", icon: "Palette", color: "from-amber-400 to-orange-500" },
  { key: "avangard_calc_newbuild", type: "calc" as const, title: "Расчёт новостройки", path: "/newbuild", icon: "Building2", color: "from-orange-400 to-amber-500" },
  { key: "avangard_calc_turnkey", type: "calc" as const, title: "Ремонт под ключ", path: "/turnkey", icon: "KeyRound", color: "from-emerald-400 to-teal-500" },
  { key: "avangard_calc_windows", type: "calc" as const, title: "Расчёт окон", path: "/windows", icon: "AppWindow", color: "from-sky-400 to-blue-500" },
  { key: "avangard_calc_ceilings", type: "calc" as const, title: "Натяжные потолки", path: "/ceilings", icon: "Layers", color: "from-violet-400 to-purple-500" },
  { key: "avangard_calc_flooring", type: "calc" as const, title: "Напольные покрытия", path: "/flooring", icon: "SquareStack", color: "from-amber-400 to-yellow-500" },
  { key: "avangard_calc_bathroom", type: "calc" as const, title: "Ремонт санузла", path: "/bathroom", icon: "Droplets", color: "from-teal-400 to-cyan-500" },
  { key: "avangard_calc_electrics", type: "calc" as const, title: "Электромонтаж", path: "/electrics", icon: "Zap", color: "from-blue-400 to-sky-500" },
  { key: "avangard_calc_bathhouse", type: "calc" as const, title: "Строительство бани", path: "/bathhouse", icon: "Flame", color: "from-amber-700 to-orange-600" },
  { key: "avangard_calc_framehouse", type: "calc" as const, title: "Каркасный дом", path: "/framehouse", icon: "Home", color: "from-green-700 to-emerald-600" },
];

export default function RecentActivityFeed({ homestagingReports = [] }: Props) {
  const navigate = useNavigate();
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [filter, setFilter] = useState<"all" | "calc" | "homestaging" | "designer">("all");

  useEffect(() => {
    const collected: ActivityItem[] = [];

    // Сметы и проекты из localStorage
    LOCAL_KEYS.forEach((cfg) => {
      try {
        const raw = localStorage.getItem(cfg.key);
        if (!raw) return;
        const data = JSON.parse(raw);
        const total = typeof data?.total === "number" ? data.total
          : typeof data?.totalAmount === "number" ? data.totalAmount
          : Array.isArray(data?.items)
            ? data.items.reduce((s: number, i: { price?: number; quantity?: number }) => s + (i.price || 0) * (i.quantity || 1), 0)
            : undefined;
        const updatedAt = data?.updatedAt || data?.savedAt || data?.createdAt || new Date().toISOString();
        collected.push({
          id: cfg.key,
          type: cfg.type,
          title: cfg.title,
          subtitle: data?.region || data?.city || data?.style,
          amount: total,
          date: updatedAt,
          path: cfg.path,
          icon: cfg.icon,
          color: cfg.color,
        });
      } catch { /* ignore corrupted */ }
    });

    // Отчёты хоумстейджинга
    homestagingReports.forEach((r) => {
      collected.push({
        id: `hs_${r.id}`,
        type: "homestaging",
        title: `Хоумстейджинг · ${r.room_type || "Помещение"}`,
        subtitle: `Оценка ${r.overall_score}/10 · ${r.short_summary?.slice(0, 60)}${r.short_summary?.length > 60 ? "…" : ""}`,
        date: r.created_at,
        path: "/homestaging",
        icon: "Home",
        color: "from-rose-400 to-fuchsia-500",
      });
    });

    // Сортируем по дате
    collected.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setItems(collected);
  }, [homestagingReports]);

  const filtered = filter === "all" ? items : items.filter((i) => i.type === filter);

  const formatRub = (n: number) => new Intl.NumberFormat("ru-RU").format(Math.round(n));
  const formatDate = (d: string) => {
    try {
      const date = new Date(d);
      const diff = (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24);
      if (diff < 1) return "Сегодня";
      if (diff < 2) return "Вчера";
      if (diff < 7) return `${Math.floor(diff)} дн. назад`;
      return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric" });
    } catch { return d; }
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-8 text-center">
        <Icon name="Sparkles" size={36} className="mx-auto text-gray-300 mb-3" />
        <h3 className="font-bold text-gray-900 mb-1">Здесь будет история ваших проектов</h3>
        <p className="text-sm text-gray-500 mb-4">Создайте смету или дизайн-проект — он появится здесь, чтобы вы могли вернуться и продолжить.</p>
        <Button onClick={() => navigate("/")} className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
          <Icon name="Calculator" size={16} className="mr-2" />
          Начать расчёт
        </Button>
      </div>
    );
  }

  const filters: Array<{ id: typeof filter; label: string; icon: string }> = [
    { id: "all", label: "Все", icon: "Layers" },
    { id: "calc", label: "Сметы", icon: "Calculator" },
    { id: "designer", label: "Дизайн", icon: "Palette" },
    { id: "homestaging", label: "Хоумстейджинг", icon: "Home" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3 gap-2 flex-wrap">
        <h2 className="text-lg font-semibold">Мои проекты</h2>
        <div className="flex gap-1.5 flex-wrap">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                filter === f.id
                  ? "bg-amber-500 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              <Icon name={f.icon} size={12} />
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500">В этой категории пока пусто</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white flex-shrink-0`}>
                  <Icon name={item.icon} size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                  {item.subtitle && (
                    <p className="text-xs text-gray-500 truncate">{item.subtitle}</p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  {item.amount !== undefined && item.amount > 0 && (
                    <p className="text-sm font-bold text-gray-900">{formatRub(item.amount)} ₽</p>
                  )}
                  <p className="text-xs text-gray-400">{formatDate(item.date)}</p>
                </div>
                <Icon name="ChevronRight" size={16} className="text-gray-300 flex-shrink-0" />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
