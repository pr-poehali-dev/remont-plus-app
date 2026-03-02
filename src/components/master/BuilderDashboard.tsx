import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { User } from "@/components/master/masterTypes";
import BuilderPaymentModal from "@/components/master/BuilderPaymentModal";

const BUILDER_LEADS_URL = "https://functions.poehali.dev/69fd9787-d0eb-4342-b94b-9d14bb3f36e7";
const BUILDER_SUBS_URL = "https://functions.poehali.dev/9993e0fc-25ac-4a65-b8be-49aa089d1585";

interface BuilderPlan {
  code: string;
  name: string;
  price: number;
  leads_per_month: number;
  is_unlimited: boolean;
  priority: number;
}

interface BuilderSubscription {
  plan_code: string;
  plan_name: string;
  price: number;
  leads_per_month: number;
  is_unlimited: boolean;
  leads_used: number;
  leads_left: number | null;
  expires_at: string | null;
}

interface Lead {
  id: number;
  city: string;
  work_types: string[];
  budget: number | null;
  customer_name: string;
  customer_phone: string | null;
  customer_comment: string;
  calc_type: string;
  created_at: string;
  status: string;
}

interface Stats {
  total: number;
  new: number;
  viewed: number;
  this_month: number;
}

interface Props {
  user: User;
  contractorId: number | null;
  onBack: () => void;
}

const PLAN_FEATURES: Record<string, string[]> = {
  start: ["5 заявок в месяц", "Email-уведомления", "Личный кабинет"],
  business: ["15 заявок в месяц", "Повышенный приоритет в очереди", "Email-уведомления", "Личный кабинет"],
  pro: ["30 заявок в месяц", "Высокий приоритет", "Email-уведомления", "Личный кабинет"],
  unlim: ["Безлимитные заявки", "Максимальный приоритет", "Email-уведомления", "Личный кабинет"],
};

export default function BuilderDashboard({ user, contractorId, onBack }: Props) {
  const [tab, setTab] = useState<"leads" | "subscription">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscription, setSubscription] = useState<BuilderSubscription | null>(null);
  const [plans, setPlans] = useState<BuilderPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedPhones, setRevealedPhones] = useState<Record<number, string>>({});
  const [payingPlan, setPayingPlan] = useState<BuilderPlan | null>(null);

  useEffect(() => {
    if (!contractorId) return;
    loadData();
  }, [contractorId]);

  const loadData = async () => {
    if (!contractorId) return;
    setLoading(true);
    try {
      const [leadsRes, statsRes, subRes, plansRes] = await Promise.all([
        fetch(`${BUILDER_LEADS_URL}?action=my_leads&contractor_id=${contractorId}`),
        fetch(`${BUILDER_LEADS_URL}?action=stats&contractor_id=${contractorId}`),
        fetch(`${BUILDER_SUBS_URL}?action=my&contractor_id=${contractorId}`),
        fetch(`${BUILDER_SUBS_URL}?action=plans`),
      ]);
      const [leadsData, statsData, subData, plansData] = await Promise.all([
        leadsRes.json(), statsRes.json(), subRes.json(), plansRes.json(),
      ]);
      setLeads(leadsData.leads || []);
      setStats(statsData);
      setSubscription(subData.subscription || null);
      setPlans(plansData.plans || []);
    } finally {
      setLoading(false);
    }
  };

  const revealPhone = async (leadId: number) => {
    if (!contractorId) return;
    const res = await fetch(BUILDER_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view_lead", lead_id: leadId, contractor_id: contractorId }),
    });
    const data = await res.json();
    if (data.phone) {
      setRevealedPhones(prev => ({ ...prev, [leadId]: data.phone }));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "viewed" } : l));
    }
  };

  const openPayment = (plan: BuilderPlan) => {
    setPayingPlan(plan);
  };

  const formatBudget = (b: number | null) => {
    if (!b) return "не указан";
    if (b >= 1_000_000) return `${(b / 1_000_000).toFixed(1)} млн ₽`;
    return `${b.toLocaleString("ru-RU")} ₽`;
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-5">
          <button onClick={onBack} className="text-gray-400 hover:text-gray-600 mb-3 flex items-center gap-1 text-sm">
            <Icon name="ArrowLeft" size={16} /> Назад к каталогу
          </button>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-xl font-bold text-gray-900">Кабинет строительной компании</h1>
              <p className="text-gray-500 text-sm mt-0.5">{user.name}</p>
            </div>
            {subscription && (
              <Badge className="bg-orange-100 text-orange-700 border-orange-200 text-sm px-3 py-1">
                <Icon name="Zap" size={13} className="mr-1.5" />
                {subscription.plan_name}
                {!subscription.is_unlimited && (
                  <span className="ml-1.5 text-orange-500">· {subscription.leads_left} заявок</span>
                )}
              </Badge>
            )}
          </div>

          <div className="flex gap-1 mt-4">
            {[
              { key: "leads", label: "Заявки", icon: "FileText" },
              { key: "subscription", label: "Тариф", icon: "CreditCard" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "leads" | "subscription")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === t.key ? "bg-orange-500 text-white" : "text-gray-500 hover:bg-gray-100"
                }`}
              >
                <Icon name={t.icon as "FileText"} size={15} />
                {t.label}
                {t.key === "leads" && stats && stats.new > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {stats.new}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* Вкладка заявок */}
        {tab === "leads" && (
          <>
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Всего заявок", value: stats.total, icon: "Inbox", color: "text-blue-600 bg-blue-50" },
                  { label: "Новые", value: stats.new, icon: "Bell", color: "text-red-600 bg-red-50" },
                  { label: "Просмотрено", value: stats.viewed, icon: "Eye", color: "text-green-600 bg-green-50" },
                  { label: "В этом месяце", value: stats.this_month, icon: "Calendar", color: "text-purple-600 bg-purple-50" },
                ].map(s => (
                  <div key={s.label} className="bg-white rounded-xl border border-gray-100 p-4 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                      <Icon name={s.icon as "Inbox"} size={20} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                      <p className="text-xs text-gray-500">{s.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!subscription && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-start gap-4">
                <Icon name="AlertCircle" size={22} className="text-amber-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-amber-900">Подключите тариф, чтобы получать заявки</p>
                  <p className="text-sm text-amber-700 mt-1">Заявки распределяются автоматически между активными подписчиками по тарифу и загруженности.</p>
                  <Button
                    size="sm"
                    className="mt-3 bg-amber-500 hover:bg-amber-600 text-white"
                    onClick={() => setTab("subscription")}
                  >
                    Выбрать тариф
                  </Button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Icon name="Loader2" size={28} className="animate-spin mr-2" /> Загрузка...
              </div>
            ) : leads.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Icon name="Inbox" size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Заявок пока нет</p>
                <p className="text-sm text-gray-400 mt-1">Заявки поступают автоматически по вашему городу</p>
              </div>
            ) : (
              <div className="space-y-3">
                {leads.map(lead => (
                  <div key={lead.id} className={`bg-white rounded-xl border p-5 transition-all ${
                    lead.status === "new" ? "border-orange-200 shadow-sm shadow-orange-50" : "border-gray-100"
                  }`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        {lead.status === "new" && (
                          <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-medium">Новая</span>
                        )}
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <Icon name="MapPin" size={13} /> {lead.city || "не указан"}
                        </span>
                        <span className="text-gray-300">·</span>
                        <span className="text-sm text-gray-500">{formatDate(lead.created_at)}</span>
                      </div>
                      <span className="font-bold text-gray-900 text-lg">{formatBudget(lead.budget)}</span>
                    </div>

                    {lead.work_types?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {lead.work_types.map(w => (
                          <span key={w} className="bg-gray-100 text-gray-600 text-xs px-2.5 py-1 rounded-full">{w}</span>
                        ))}
                      </div>
                    )}

                    {lead.customer_comment && (
                      <p className="text-sm text-gray-600 mt-3 bg-gray-50 rounded-lg px-3 py-2">{lead.customer_comment}</p>
                    )}

                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm text-gray-700">
                        <span className="font-medium">{lead.customer_name || "Клиент"}</span>
                        {revealedPhones[lead.id] ? (
                          <a href={`tel:${revealedPhones[lead.id]}`} className="ml-3 text-orange-600 font-bold hover:underline">
                            {revealedPhones[lead.id]}
                          </a>
                        ) : lead.customer_phone ? (
                          <span className="ml-3 text-orange-600 font-bold">{lead.customer_phone}</span>
                        ) : (
                          <span className="ml-3 text-gray-400 text-xs">телефон скрыт</span>
                        )}
                      </div>

                      {!revealedPhones[lead.id] && !lead.customer_phone && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-orange-300 text-orange-600 hover:bg-orange-50"
                          onClick={() => revealPhone(lead.id)}
                        >
                          <Icon name="Phone" size={14} className="mr-1.5" />
                          Раскрыть контакт
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Вкладка тарифов */}
        {tab === "subscription" && (
          <>
            {subscription && (
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-5 mb-6 text-white">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div>
                    <p className="text-orange-100 text-sm">Активный тариф</p>
                    <p className="text-2xl font-bold mt-0.5">{subscription.plan_name}</p>
                    <p className="text-orange-100 text-sm mt-1">
                      {subscription.is_unlimited
                        ? "Безлимитные заявки"
                        : `${subscription.leads_used} из ${subscription.leads_per_month} заявок использовано`}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-3xl font-bold">{subscription.price.toLocaleString("ru-RU")} ₽</p>
                    <p className="text-orange-100 text-sm">в месяц</p>
                    {subscription.expires_at && (
                      <p className="text-orange-200 text-xs mt-1">
                        до {new Date(subscription.expires_at).toLocaleDateString("ru-RU")}
                      </p>
                    )}
                  </div>
                </div>
                {!subscription.is_unlimited && (
                  <div className="mt-4">
                    <div className="bg-orange-400/40 rounded-full h-2">
                      <div
                        className="bg-white rounded-full h-2 transition-all"
                        style={{ width: `${Math.min(100, (subscription.leads_used / subscription.leads_per_month) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            <h2 className="text-lg font-bold text-gray-900 mb-4">Выберите тариф</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {plans.map((plan, idx) => {
                const isActive = subscription?.plan_code === plan.code;
                const features = PLAN_FEATURES[plan.code] || [];
                const popular = plan.code === "business";

                return (
                  <div
                    key={plan.code}
                    className={`bg-white rounded-xl border-2 p-5 relative transition-all ${
                      isActive ? "border-orange-400 shadow-md" : popular ? "border-blue-300" : "border-gray-100"
                    }`}
                  >
                    {popular && !isActive && (
                      <div className="absolute -top-3 left-5 bg-blue-500 text-white text-xs px-3 py-0.5 rounded-full font-semibold">
                        Популярный
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute -top-3 left-5 bg-orange-500 text-white text-xs px-3 py-0.5 rounded-full font-semibold">
                        Активен
                      </div>
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-gray-900">{plan.name}</h3>
                      <div className="text-right shrink-0">
                        <span className="text-2xl font-extrabold text-gray-900">
                          {plan.price.toLocaleString("ru-RU")}
                        </span>
                        <span className="text-gray-400 text-sm"> ₽/мес</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-500 mt-1">
                      {plan.is_unlimited ? "Безлимитные заявки" : `${plan.leads_per_month} заявок в месяц`}
                      {" · "}
                      {plan.price > 0
                        ? `~${Math.round((plan.is_unlimited ? 5000 : plan.price / plan.leads_per_month)).toLocaleString("ru-RU")} ₽/заявка`
                        : ""}
                    </p>

                    <ul className="mt-4 space-y-2">
                      {features.map(f => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                          <Icon name="Check" size={14} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5">
                      {isActive ? (
                        <div className="flex items-center gap-2 text-orange-600 font-medium text-sm">
                          <Icon name="CheckCircle" size={16} />
                          Текущий тариф
                        </div>
                      ) : (
                        <Button
                          className={`w-full font-semibold ${
                            popular ? "bg-blue-500 hover:bg-blue-600 text-white" : "bg-orange-500 hover:bg-orange-600 text-white"
                          }`}
                          onClick={() => openPayment(plan)}
                        >
                          <Icon name="CreditCard" size={15} className="mr-2" />
                          Оплатить и подключить
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 bg-gray-50 rounded-xl border border-gray-100 p-5">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Icon name="Info" size={16} className="text-blue-500" />
                Как работает система заявок
              </h3>
              <ul className="space-y-2.5 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={15} className="text-green-500 mt-0.5 shrink-0" />
                  Заявки поступают автоматически с калькулятора и форм сайта
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={15} className="text-green-500 mt-0.5 shrink-0" />
                  Распределение по городу, тарифу и загруженности компании
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={15} className="text-green-500 mt-0.5 shrink-0" />
                  Мгновенное уведомление на email при новой заявке
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={15} className="text-green-500 mt-0.5 shrink-0" />
                  Средний бюджет заявок — от 1.5 млн ₽, реальные клиенты
                </li>
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Модаль оплаты тарифа */}
      {payingPlan && contractorId && (
        <BuilderPaymentModal
          plan={payingPlan}
          contractorId={contractorId}
          contractorName={user.name}
          contractorEmail={user.email}
          onClose={() => setPayingPlan(null)}
          onSuccess={() => {
            setPayingPlan(null);
            setTab("leads");
          }}
        />
      )}
    </div>
  );
}