import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";

const BUILDER_LEADS_URL = "https://functions.poehali.dev/69fd9787-d0eb-4342-b94b-9d14bb3f36e7";
const BUILDER_SUBS_URL = "https://functions.poehali.dev/9993e0fc-25ac-4a65-b8be-49aa089d1585";

interface Lead {
  id: number;
  city: string;
  work_types: string[];
  budget: number | null;
  customer_name: string | null;
  customer_phone: string | null;
  customer_comment: string | null;
  calc_type: string;
  status: string;
  created_at: string | null;
  assign_status: string;
  viewed_at: string | null;
}

interface Subscription {
  plan_code: string;
  plan_name: string;
  price: number;
  leads_per_month: number;
  is_unlimited: boolean;
  priority: number;
  leads_used: number;
  leads_left: number | null;
  expires_at: string | null;
}

interface BuilderCabinetProps {
  contractorId: number;
  companyName: string;
  onBack: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  new: "Новая",
  viewed: "Просмотрена",
  contacted: "Связались",
};

const STATUS_COLORS: Record<string, string> = {
  new: "bg-blue-100 text-blue-700",
  viewed: "bg-gray-100 text-gray-600",
  contacted: "bg-green-100 text-green-700",
};

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "2-digit", month: "short", year: "numeric",
  });
}

export default function BuilderCabinet({ contractorId, companyName, onBack }: BuilderCabinetProps) {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"leads" | "subscription">("leads");
  const [expandedLead, setExpandedLead] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`${BUILDER_LEADS_URL}?action=get_leads&contractor_id=${contractorId}`).then((r) => r.json()),
      fetch(`${BUILDER_SUBS_URL}?action=my&contractor_id=${contractorId}`).then((r) => r.json()),
    ])
      .then(([leadsData, subData]) => {
        setLeads(leadsData.leads || []);
        setSubscription(subData.subscription || null);
      })
      .finally(() => setLoading(false));
  }, [contractorId]);

  const handleViewLead = (lead: Lead) => {
    if (lead.assign_status === "new") {
      fetch(BUILDER_LEADS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "view_lead", lead_id: lead.id, contractor_id: contractorId }),
      });
      setLeads((prev) =>
        prev.map((l) => l.id === lead.id ? { ...l, assign_status: "viewed", viewed_at: new Date().toISOString() } : l)
      );
    }
    setExpandedLead(expandedLead === lead.id ? null : lead.id);
  };

  const newLeads = leads.filter((l) => l.assign_status === "new").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400 flex items-center gap-2">
          <Icon name="Loader2" size={20} className="animate-spin" />
          Загрузка...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Шапка */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={onBack}
            className="text-gray-400 hover:text-gray-600 mb-4 flex items-center gap-1 text-sm"
          >
            <Icon name="ArrowLeft" size={16} /> Назад к каталогу
          </button>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{companyName}</h1>
              <p className="text-gray-500 mt-0.5 text-sm">Личный кабинет строительной компании</p>
            </div>
            {subscription && (
              <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl px-4 py-2">
                <Icon name="Zap" size={16} className="text-orange-500" />
                <span className="text-sm font-semibold text-orange-700">{subscription.plan_name}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Табы */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4">
          <div className="flex gap-6">
            {[
              { id: "leads", label: "Заявки", icon: "FileText", count: newLeads },
              { id: "subscription", label: "Подписка", icon: "CreditCard", count: 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "leads" | "subscription")}
                className={`flex items-center gap-2 py-4 border-b-2 text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "border-orange-500 text-orange-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon name={tab.icon as "FileText"} size={16} />
                {tab.label}
                {tab.count > 0 && (
                  <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">

        {/* === Заявки === */}
        {activeTab === "leads" && (
          <div className="space-y-4">
            {leads.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Icon name="Inbox" size={40} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Заявок пока нет</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto">
                  Новые заявки от клиентов появятся здесь автоматически. Убедитесь, что подписка активна.
                </p>
              </div>
            ) : (
              leads.map((lead) => (
                <div
                  key={lead.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    lead.assign_status === "new"
                      ? "border-orange-200 shadow-sm shadow-orange-50"
                      : "border-gray-200"
                  }`}
                >
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() => handleViewLead(lead)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                          lead.assign_status === "new" ? "bg-orange-500" : "bg-gray-300"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-semibold text-gray-900">
                              {lead.city}
                            </span>
                            <Badge className={`text-xs ${STATUS_COLORS[lead.assign_status] || "bg-gray-100 text-gray-600"}`}>
                              {STATUS_LABELS[lead.assign_status] || lead.assign_status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {lead.work_types?.join(", ") || lead.calc_type}
                          </div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        {lead.budget ? (
                          <div className="font-bold text-gray-900">{fmt(lead.budget)} ₽</div>
                        ) : null}
                        <div className="text-xs text-gray-400 mt-0.5">{fmtDate(lead.created_at)}</div>
                      </div>
                      <Icon
                        name={expandedLead === lead.id ? "ChevronUp" : "ChevronDown"}
                        size={18}
                        className="text-gray-400 shrink-0 mt-0.5"
                      />
                    </div>
                  </div>

                  {/* Развёрнутая карточка */}
                  {expandedLead === lead.id && (
                    <div className="px-5 pb-5 border-t border-gray-100 pt-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Клиент</div>
                          <div className="font-semibold text-gray-900">{lead.customer_name || "—"}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-400 mb-1">Телефон</div>
                          <a
                            href={`tel:${lead.customer_phone}`}
                            className="font-bold text-orange-600 text-lg hover:text-orange-700"
                          >
                            {lead.customer_phone || "—"}
                          </a>
                        </div>
                        {lead.customer_comment && (
                          <div className="sm:col-span-2">
                            <div className="text-xs text-gray-400 mb-1">Комментарий</div>
                            <div className="text-gray-700 text-sm">{lead.customer_comment}</div>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 flex gap-2">
                        <a href={`tel:${lead.customer_phone}`}>
                          <Button size="sm" className="bg-orange-500 hover:bg-orange-600 text-white">
                            <Icon name="Phone" size={14} className="mr-1.5" />
                            Позвонить
                          </Button>
                        </a>
                        {lead.customer_phone && (
                          <a
                            href={`https://wa.me/${lead.customer_phone?.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="outline">
                              <Icon name="MessageCircle" size={14} className="mr-1.5" />
                              WhatsApp
                            </Button>
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* === Подписка === */}
        {activeTab === "subscription" && (
          <div className="space-y-6">
            {subscription ? (
              <>
                <div className="bg-white rounded-2xl border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-sm text-gray-500 mb-1">Текущий тариф</div>
                      <div className="text-2xl font-bold text-gray-900">{subscription.plan_name}</div>
                      <div className="text-gray-500 text-sm">{fmt(subscription.price)} ₽ / месяц</div>
                    </div>
                    <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center">
                      <Icon name="Zap" size={28} className="text-orange-500" />
                    </div>
                  </div>

                  {/* Использование */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Заявок использовано</span>
                      <span className="font-semibold text-gray-900">
                        {subscription.is_unlimited
                          ? `${subscription.leads_used} / ∞`
                          : `${subscription.leads_used} / ${subscription.leads_per_month}`}
                      </span>
                    </div>
                    {!subscription.is_unlimited && (
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, (subscription.leads_used / subscription.leads_per_month) * 100)}%`,
                          }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-gray-400 mb-0.5">Осталось заявок</div>
                      <div className="font-bold text-gray-900">
                        {subscription.is_unlimited ? "∞" : (subscription.leads_left ?? 0)}
                      </div>
                    </div>
                    <div>
                      <div className="text-gray-400 mb-0.5">Действует до</div>
                      <div className="font-bold text-gray-900">{fmtDate(subscription.expires_at)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex gap-3">
                  <Icon name="Info" size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    Для смены тарифа или продления подписки свяжитесь с менеджером:{" "}
                    <a href="mailto:info@avangard-remont.ru" className="font-semibold underline">
                      info@avangard-remont.ru
                    </a>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
                <Icon name="CreditCard" size={40} className="text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">Подписка не активна</h3>
                <p className="text-gray-400 text-sm max-w-sm mx-auto mb-6">
                  Подключите тариф, чтобы начать получать заявки от клиентов.
                </p>
                <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                  Выбрать тариф
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
