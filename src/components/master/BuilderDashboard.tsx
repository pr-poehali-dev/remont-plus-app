import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { User } from "@/components/master/masterTypes";
import BuilderPaymentModal from "@/components/master/BuilderPaymentModal";

const BUILDER_LEADS_URL = "https://functions.poehali.dev/69fd9787-d0eb-4342-b94b-9d14bb3f36e7";
const BUILDER_SUBS_URL = "https://functions.poehali.dev/9993e0fc-25ac-4a65-b8be-49aa089d1585";
const BUILDER_BALANCE_URL = "https://functions.poehali.dev/d36e0975-2b0e-4dec-915b-b8989dc8b7bd";

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
  lead_fee: number | null;
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
  total_spent?: number;
}

interface BalanceTransaction {
  id: number;
  created_at: string;
  type: string;
  amount: number;
  balance_after: number;
  description: string;
}

interface Props {
  user: User;
  contractorId: number | null;
  onBack: () => void;
}

const PLAN_FEATURES: Record<string, string[]> = {
  start: ["Заявки с бюджетом до 500 тыс ₽", "До 10 заявок в месяц", "Email-уведомления", "Личный кабинет"],
  business: ["Заявки с бюджетом до 3 млн ₽", "До 30 заявок в месяц", "Высокий приоритет", "Email-уведомления"],
  pro: ["Любой бюджет заявок", "Безлимит заявок", "Максимальный приоритет", "Email-уведомления"],
  premium: ["Любой бюджет заявок", "Безлимит заявок", "Максимальный приоритет", "Email-уведомления"],
};

export default function BuilderDashboard({ user, contractorId, onBack }: Props) {
  const [tab, setTab] = useState<"leads" | "subscription" | "balance">("leads");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [subscription, setSubscription] = useState<BuilderSubscription | null>(null);
  const [plans, setPlans] = useState<BuilderPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [revealedPhones, setRevealedPhones] = useState<Record<number, string>>({});
  const [payingPlan, setPayingPlan] = useState<BuilderPlan | null>(null);

  const [balance, setBalance] = useState<number>(0);
  const [showTopup, setShowTopup] = useState(false);
  const [topupAmount, setTopupAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [balanceError, setBalanceError] = useState("");

  const [transactions, setTransactions] = useState<BalanceTransaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    if (!contractorId) return;
    loadData();
  }, [contractorId]);

  useEffect(() => {
    if (tab === "balance" && contractorId) {
      loadTransactions();
    }
  }, [tab, contractorId]);

  const loadData = async () => {
    if (!contractorId) return;
    setLoading(true);
    try {
      const [leadsRes, statsRes, subRes, plansRes, balanceRes] = await Promise.all([
        fetch(`${BUILDER_LEADS_URL}?action=my_leads&contractor_id=${contractorId}`),
        fetch(`${BUILDER_LEADS_URL}?action=stats&contractor_id=${contractorId}`),
        fetch(`${BUILDER_SUBS_URL}?action=my&contractor_id=${contractorId}`),
        fetch(`${BUILDER_SUBS_URL}?action=plans`),
        fetch(`${BUILDER_BALANCE_URL}?action=get&contractor_id=${contractorId}`),
      ]);
      const [leadsData, statsData, subData, plansData, balanceData] = await Promise.all([
        leadsRes.json(), statsRes.json(), subRes.json(), plansRes.json(), balanceRes.json(),
      ]);
      setLeads(leadsData.leads || []);
      setStats(statsData);
      setSubscription(subData.subscription || null);
      setPlans(plansData.plans || []);
      setBalance(balanceData.balance || 0);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    if (!contractorId) return;
    setTransactionsLoading(true);
    try {
      const res = await fetch(`${BUILDER_BALANCE_URL}?action=history&contractor_id=${contractorId}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const revealPhone = async (leadId: number) => {
    if (!contractorId) return;
    const res = await fetch(BUILDER_LEADS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "view_lead", lead_id: leadId, contractor_id: contractorId }),
    });
    if (res.status === 402) {
      setBalanceError("Недостаточно средств. Пополните баланс.");
      return;
    }
    const data = await res.json();
    if (data.phone) {
      setRevealedPhones(prev => ({ ...prev, [leadId]: data.phone }));
      setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: "viewed" } : l));
      if (typeof data.balance === "number") {
        setBalance(data.balance);
      }
    }
  };

  const handleTopup = async () => {
    if (!contractorId) return;
    const amount = parseInt(topupAmount, 10);
    if (!amount || amount < 1000) {
      setBalanceError("Минимальная сумма пополнения: 1 000 ₽");
      return;
    }
    setTopupLoading(true);
    setBalanceError("");
    try {
      const res = await fetch(BUILDER_BALANCE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "topup", contractor_id: contractorId, amount }),
      });
      const data = await res.json();
      if (data.error) {
        setBalanceError(data.error);
        return;
      }
      if (typeof data.balance === "number") {
        setBalance(data.balance);
      } else {
        setBalance(prev => prev + amount);
      }
      setShowTopup(false);
      setTopupAmount("");
      setBalanceError("");
    } catch (e) {
      setBalanceError(e instanceof Error ? e.message : "Ошибка при пополнении");
    } finally {
      setTopupLoading(false);
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

  const formatDateTime = (d: string) => {
    return new Date(d).toLocaleDateString("ru-RU", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
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
              <h1 className="text-xl font-bold text-gray-900">Биржа заявок</h1>
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

          {/* Balance widget */}
          <div className="flex items-center gap-3 mt-3 p-3 bg-green-50 rounded-xl border border-green-100">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Icon name="Wallet" size={20} className="text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-xs text-green-600 font-medium">Баланс</p>
              <p className="text-xl font-bold text-green-800">{balance.toLocaleString("ru-RU")} ₽</p>
            </div>
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowTopup(true)}>
              <Icon name="Plus" size={14} className="mr-1" />
              Пополнить
            </Button>
          </div>

          <div className="flex gap-1 mt-4">
            {[
              { key: "leads", label: "Заявки", icon: "FileText" },
              { key: "subscription", label: "Тариф", icon: "CreditCard" },
              { key: "balance", label: "Баланс", icon: "Wallet" },
            ].map(t => (
              <button
                key={t.key}
                onClick={() => setTab(t.key as "leads" | "subscription" | "balance")}
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
                  { label: "Всего заявок", value: String(stats.total), icon: "Inbox", color: "text-blue-600 bg-blue-50" },
                  { label: "Новые", value: String(stats.new), icon: "Bell", color: "text-red-600 bg-red-50" },
                  { label: "Просмотрено", value: String(stats.viewed), icon: "Eye", color: "text-green-600 bg-green-50" },
                  { label: "Потрачено", value: stats.total_spent ? `${(stats.total_spent / 1000).toFixed(0)}K ₽` : "0 ₽", icon: "Wallet", color: "text-orange-600 bg-orange-50" },
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
                  <p className="font-semibold text-amber-900">Подключите тариф, чтобы получать заявки с калькулятора</p>
                  <p className="text-sm text-amber-700 mt-1">Заявки распределяются по бюджету и тарифу. Стоимость контакта — 5% от бюджета, минимум 5 000 ₽.</p>
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

            {balanceError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-4 flex items-center gap-3">
                <Icon name="AlertCircle" size={20} className="text-red-500 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-800">{balanceError}</p>
                </div>
                <Button size="sm" className="bg-red-500 hover:bg-red-600 text-white shrink-0" onClick={() => { setBalanceError(""); setShowTopup(true); }}>
                  Пополнить
                </Button>
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
                      <div className="flex flex-col items-end gap-1">
                        <span className="font-bold text-gray-900 text-lg">{formatBudget(lead.budget)}</span>
                        {lead.lead_fee && (
                          <span className="text-xs text-orange-600 font-medium">
                            Стоимость контакта: {lead.lead_fee.toLocaleString("ru-RU")} ₽
                          </span>
                        )}
                      </div>
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
                          {lead.lead_fee
                            ? `Показать телефон · ${lead.lead_fee.toLocaleString("ru-RU")} ₽`
                            : "Раскрыть контакт"}
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
                      {plan.is_unlimited ? "Безлимит заявок" : `До ${plan.leads_per_month} заявок в месяц`}
                    </p>
                    <p className="text-xs text-orange-600 mt-1">
                      5% от бюджета, мин. 5 000 ₽ за контакт
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
                  Распределение по бюджету, городу и тарифу
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={15} className="text-green-500 mt-0.5 shrink-0" />
                  Стоимость контакта — 5% от бюджета заявки, минимум 5 000 ₽
                </li>
                <li className="flex items-start gap-2">
                  <Icon name="CheckCircle" size={15} className="text-green-500 mt-0.5 shrink-0" />
                  Мгновенное уведомление на email при новой заявке
                </li>
              </ul>
            </div>
          </>
        )}

        {/* Вкладка баланса */}
        {tab === "balance" && (
          <>
            {/* Balance summary card */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-5 mb-6 text-white">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div>
                  <p className="text-green-100 text-sm">Текущий баланс</p>
                  <p className="text-3xl font-bold mt-0.5">{balance.toLocaleString("ru-RU")} ₽</p>
                </div>
                <Button
                  className="bg-white text-green-700 hover:bg-green-50 font-semibold"
                  onClick={() => setShowTopup(true)}
                >
                  <Icon name="Plus" size={16} className="mr-1.5" />
                  Пополнить баланс
                </Button>
              </div>
            </div>

            <h2 className="text-lg font-bold text-gray-900 mb-4">История операций</h2>

            {transactionsLoading ? (
              <div className="flex items-center justify-center py-16 text-gray-400">
                <Icon name="Loader2" size={28} className="animate-spin mr-2" /> Загрузка...
              </div>
            ) : transactions.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-100 p-12 text-center">
                <Icon name="Receipt" size={40} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">Операций пока нет</p>
                <p className="text-sm text-gray-400 mt-1">Пополните баланс, чтобы начать получать заявки</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {/* Table header */}
                <div className="hidden md:grid md:grid-cols-4 gap-4 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                  <span>Дата</span>
                  <span>Описание</span>
                  <span className="text-right">Сумма</span>
                  <span className="text-right">Баланс</span>
                </div>
                <div className="divide-y divide-gray-50">
                  {transactions.map(tx => {
                    const isTopup = tx.type === "topup" || tx.amount > 0;
                    return (
                      <div key={tx.id} className="px-5 py-4 md:grid md:grid-cols-4 md:gap-4 md:items-center flex flex-col gap-1">
                        <span className="text-sm text-gray-500">{formatDateTime(tx.created_at)}</span>
                        <span className="text-sm text-gray-800">{tx.description}</span>
                        <span className={`text-sm font-bold text-right ${isTopup ? "text-green-600" : "text-red-600"}`}>
                          {isTopup ? "+" : ""}{tx.amount.toLocaleString("ru-RU")} ₽
                        </span>
                        <span className="text-sm text-gray-600 text-right font-medium">
                          {tx.balance_after.toLocaleString("ru-RU")} ₽
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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

      {/* Модаль пополнения баланса */}
      {showTopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTopup(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-t-2xl p-6 text-white">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-green-100 text-sm font-medium mb-1">Баланс биржи заявок</p>
                  <h2 className="text-2xl font-extrabold">Пополнение баланса</h2>
                  <p className="text-green-100 text-sm mt-2">
                    Текущий баланс: <span className="text-white font-bold">{balance.toLocaleString("ru-RU")} ₽</span>
                  </p>
                </div>
                <button onClick={() => setShowTopup(false)} className="text-green-200 hover:text-white transition-colors p-1">
                  <Icon name="X" size={22} />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Быстрый выбор</p>
                <div className="grid grid-cols-2 gap-2">
                  {[10000, 25000, 50000, 100000].map(amount => (
                    <button
                      key={amount}
                      onClick={() => setTopupAmount(String(amount))}
                      className={`px-4 py-3 rounded-xl border-2 text-sm font-semibold transition-all ${
                        topupAmount === String(amount)
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200 text-gray-700 hover:border-green-300 hover:bg-green-50/50"
                      }`}
                    >
                      {amount.toLocaleString("ru-RU")} ₽
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-1.5">Или введите сумму</p>
                <div className="relative">
                  <Input
                    type="number"
                    placeholder="Сумма в рублях"
                    value={topupAmount}
                    onChange={(e) => { setTopupAmount(e.target.value); setBalanceError(""); }}
                    min="1000"
                    step="1000"
                    className="pr-8"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₽</span>
                </div>
              </div>

              {topupAmount && parseInt(topupAmount, 10) > 0 && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Пополнение</span>
                    <span>{parseInt(topupAmount, 10).toLocaleString("ru-RU")} ₽</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                    <span>Баланс после</span>
                    <span className="text-green-600">{(balance + parseInt(topupAmount, 10)).toLocaleString("ru-RU")} ₽</span>
                  </div>
                </div>
              )}

              {balanceError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <Icon name="AlertCircle" size={16} className="shrink-0" />
                  {balanceError}
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 text-base"
                onClick={handleTopup}
                disabled={topupLoading || !topupAmount || parseInt(topupAmount, 10) < 1000}
              >
                {topupLoading ? (
                  <><Icon name="Loader2" size={18} className="animate-spin mr-2" />Пополнение...</>
                ) : (
                  <><Icon name="Wallet" size={18} className="mr-2" />Пополнить{topupAmount && parseInt(topupAmount, 10) >= 1000 ? ` ${parseInt(topupAmount, 10).toLocaleString("ru-RU")} ₽` : ""}</>
                )}
              </Button>
              <p className="text-center text-xs text-gray-400">Минимальная сумма пополнения: 1 000 ₽</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
