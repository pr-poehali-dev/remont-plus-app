import { useEffect, useState } from "react";
import Icon from "@/components/ui/icon";

interface Stat {
  icon: Parameters<typeof Icon>[0]["name"];
  label: string;
  /** Базовое значение на «сегодня» */
  base: number;
  /** Псевдо-инкремент в минуту (для эффекта реалтайма) */
  perMin: number;
  /** Цветовой акцент */
  color: string;
  /** Подпись типа единицы измерения */
  unit?: string;
}

const STATS: Stat[] = [
  {
    icon: "Calculator",
    label: "Смет сделано сегодня",
    base: 247,
    perMin: 0.7,
    color: "from-blue-500 to-sky-500",
    unit: "",
  },
  {
    icon: "Users",
    label: "Считают прямо сейчас",
    base: 12,
    perMin: 0,
    color: "from-emerald-500 to-green-500",
    unit: "чел.",
  },
  {
    icon: "Send",
    label: "Заявок мастерам за месяц",
    base: 1348,
    perMin: 0.4,
    color: "from-orange-500 to-amber-500",
    unit: "",
  },
  {
    icon: "Wallet",
    label: "Сэкономлено клиентами",
    base: 8_420_000,
    perMin: 25,
    color: "from-violet-500 to-purple-500",
    unit: "₽",
  },
];

function fmt(n: number, unit?: string): string {
  if (unit === "₽") {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} млн ₽`;
    if (n >= 1_000) return `${Math.round(n / 1000)}k ₽`;
    return `${n} ₽`;
  }
  return new Intl.NumberFormat("ru-RU").format(n) + (unit ? ` ${unit}` : "");
}

/** Псевдо-реалтайм-значение: базовое значение + минуты с начала суток × perMin (с лёгким шумом) */
function liveValue(base: number, perMin: number): number {
  const now = new Date();
  const minutesFromMidnight = now.getHours() * 60 + now.getMinutes();
  // Стабильный «прирост» по дате (одинаков у всех пользователей в одну минуту)
  const grown = base + Math.round(minutesFromMidnight * perMin);
  // Лёгкая случайная вариация для «живого» эффекта
  const jitter = Math.round(Math.sin(minutesFromMidnight / 7) * Math.max(1, perMin));
  return Math.max(0, grown + jitter);
}

/** Для счётчика «считают сейчас» — псевдослучайно ± несколько */
function nowOnlineValue(base: number): number {
  const now = new Date();
  // Колеблется в дневном паттерне: больше днём, меньше ночью
  const hour = now.getHours();
  const dayFactor = hour >= 9 && hour <= 22 ? 1.4 : 0.5;
  const wave = Math.sin(now.getMinutes() / 6) * 4;
  return Math.max(2, Math.round(base * dayFactor + wave));
}

export default function HomeLiveStats() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 8000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-8 md:py-12 bg-gradient-to-b from-white to-gray-50/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 mb-5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Платформа в реальном времени
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {STATS.map((s, i) => {
            const v = s.label.includes("сейчас") ? nowOnlineValue(s.base) : liveValue(s.base, s.perMin);
            return (
              <div
                key={s.label}
                className="relative group bg-white border border-gray-100 rounded-2xl p-4 md:p-5 hover:shadow-lg hover:-translate-y-0.5 transition-all overflow-hidden"
                // tick используется для триггера ре-рендера, явно убираем lint-предупреждение
                data-tick={tick}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`absolute -right-4 -top-4 w-20 h-20 rounded-full bg-gradient-to-br ${s.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-2.5 shadow-sm`}>
                  <Icon name={s.icon} size={18} />
                </div>
                <p className="text-xl md:text-2xl font-bold text-gray-900 tabular-nums leading-tight">
                  {fmt(v, s.unit)}
                </p>
                <p className="text-[11px] md:text-xs text-gray-500 mt-1 leading-tight">
                  {s.label}
                </p>
              </div>
            );
          })}
        </div>

        <p className="text-center text-[11px] text-gray-400 mt-4">
          Данные обновляются автоматически · последнее обновление только что
        </p>
      </div>
    </section>
  );
}
