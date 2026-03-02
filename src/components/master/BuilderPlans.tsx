import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";

const BUILDER_SUBS_URL = "https://functions.poehali.dev/9993e0fc-25ac-4a65-b8be-49aa089d1585";

interface Plan {
  code: string;
  name: string;
  price: number;
  leads_per_month: number;
  is_unlimited: boolean;
  priority: number;
  description: string;
}

const PLAN_FEATURES: Record<string, string[]> = {
  start: [
    "5 целевых заявок в месяц",
    "Контакты клиента сразу",
    "Email-уведомления",
    "Профиль в каталоге",
  ],
  business: [
    "15 целевых заявок в месяц",
    "Контакты клиента сразу",
    "Email-уведомления",
    "Повышенный приоритет в очереди",
    "Значок «Рекомендуем»",
  ],
  pro: [
    "30 целевых заявок в месяц",
    "Контакты клиента сразу",
    "Email-уведомления",
    "Высокий приоритет в очереди",
    "Значок «Топ-партнёр»",
    "Персональный менеджер",
  ],
  unlim: [
    "Безлимитные заявки",
    "Контакты клиента сразу",
    "Email-уведомления",
    "Максимальный приоритет",
    "Значок «Эксклюзивный партнёр»",
    "Персональный менеджер",
    "Отчёты и аналитика",
  ],
};

const PLAN_BADGES: Record<string, string | null> = {
  start: null,
  business: "Популярный",
  pro: "Выгодный",
  unlim: "Максимум",
};

interface BuilderPlansProps {
  onConnect: () => void;
}

export default function BuilderPlans({ onConnect }: BuilderPlansProps) {
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    fetch(`${BUILDER_SUBS_URL}?action=plans`)
      .then((r) => r.json())
      .then((d) => setPlans(d.plans || []))
      .catch(() =>
        setPlans([
          { code: "start", name: "Старт", price: 25000, leads_per_month: 5, is_unlimited: false, priority: 1, description: "" },
          { code: "business", name: "Бизнес", price: 59000, leads_per_month: 15, is_unlimited: false, priority: 2, description: "" },
          { code: "pro", name: "Про", price: 99000, leads_per_month: 30, is_unlimited: false, priority: 3, description: "" },
          { code: "unlim", name: "Безлимит", price: 200000, leads_per_month: 0, is_unlimited: true, priority: 4, description: "" },
        ])
      );
  }, []);

  const fmt = (n: number) => n.toLocaleString("ru-RU");

  return (
    <div className="bg-white border-t border-gray-100 py-16 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-sm font-medium px-4 py-2 rounded-full mb-4">
            <Icon name="Building2" size={16} />
            Для строительных компаний
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Получайте реальные заявки
          </h2>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Клиенты с бюджетом от 1,5 млн ₽ уже ищут подрядчика. Бюджет заявки —
            рассчитанная смета в калькуляторе, значит намерение серьёзное.
          </p>
        </div>

        {/* Ценность одной заявки */}
        <div className="grid grid-cols-3 gap-4 mb-12">
          {[
            { label: "Минимальный бюджет заявки", value: "1,5 млн ₽", icon: "TrendingUp" },
            { label: "Вероятность конверсии", value: "до 40%", icon: "Target" },
            { label: "Городов-миллионников", value: "15", icon: "MapPin" },
          ].map((s) => (
            <div key={s.label} className="bg-orange-50 rounded-2xl p-5 text-center">
              <Icon name={s.icon as "TrendingUp"} size={24} className="text-orange-500 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-900">{s.value}</div>
              <div className="text-sm text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Тарифы */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {plans.map((plan) => {
            const badge = PLAN_BADGES[plan.code];
            const features = PLAN_FEATURES[plan.code] || [];
            const isBest = plan.code === "business";
            const leadPrice = plan.is_unlimited
              ? null
              : Math.round(plan.price / plan.leads_per_month);

            return (
              <div
                key={plan.code}
                className={`relative rounded-2xl border-2 p-6 flex flex-col ${
                  isBest
                    ? "border-orange-400 shadow-lg shadow-orange-100"
                    : "border-gray-200"
                }`}
              >
                {badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                    {badge}
                  </div>
                )}
                <div className="mb-4">
                  <div className="text-sm text-gray-500 font-medium mb-1">{plan.name}</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {fmt(plan.price)} ₽
                  </div>
                  <div className="text-sm text-gray-400">в месяц</div>
                </div>

                <div className="bg-gray-50 rounded-xl p-3 mb-4 text-center">
                  <div className="text-lg font-bold text-orange-600">
                    {plan.is_unlimited ? "∞" : plan.leads_per_month} заявок
                  </div>
                  {leadPrice && (
                    <div className="text-xs text-gray-500">
                      ~{fmt(leadPrice)} ₽ за заявку
                    </div>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-gray-600">
                      <Icon name="Check" size={14} className="text-green-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={onConnect}
                  className={`w-full ${
                    isBest
                      ? "bg-orange-500 hover:bg-orange-600 text-white"
                      : "bg-gray-900 hover:bg-gray-800 text-white"
                  }`}
                >
                  Подключить
                </Button>
              </div>
            );
          })}
        </div>

        {/* Как работает */}
        <div className="bg-gray-50 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Как работает распределение заявок
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: "1", title: "Клиент рассчитывает смету", desc: "В калькуляторе указывает город, тип работ и объём" },
              { step: "2", title: "Оставляет заявку", desc: "Указывает имя и телефон для связи" },
              { step: "3", title: "Система распределяет", desc: "По тарифу, городу и загруженности компании" },
              { step: "4", title: "Вы получаете контакты", desc: "На email приходит имя, телефон и детали заявки" },
            ].map((s) => (
              <div key={s.step} className="text-center">
                <div className="w-10 h-10 bg-orange-500 text-white rounded-full flex items-center justify-center font-bold text-lg mx-auto mb-3">
                  {s.step}
                </div>
                <div className="font-semibold text-gray-900 mb-1 text-sm">{s.title}</div>
                <div className="text-xs text-gray-500">{s.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
