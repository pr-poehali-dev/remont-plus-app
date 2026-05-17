import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import useTariffAccess from "@/hooks/useTariffAccess";
import RecentActivityFeed from "@/components/account/RecentActivityFeed";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";

const TARIFF_API = "https://functions.poehali.dev/aae7e353-917d-4759-9f27-a78f28be0084";
const HOMESTAGING_REPORTS_URL = "https://functions.poehali.dev/9507a027-3e05-4ee7-a432-b90d2dea0603";

interface User {
  id: number;
  name: string;
  email: string;
  user_type: string;
  role: string;
}

interface Payment {
  date: string;
  plan_name: string;
  amount: number;
  status: string;
}

interface HomestagingReportItem {
  id: number;
  room_type: string;
  overall_score: number;
  short_summary: string;
  image_url: string | null;
  created_at: string;
}

const quickActions = [
  { label: "Калькулятор смет", icon: "Calculator", path: "/calculator", external: false },
  { label: "Дизайнер", icon: "Palette", path: "/designer", external: false },
  { label: "Хоумстейджинг", icon: "Home", path: "/homestaging", external: false },
  { label: "Тарифы", icon: "BadgePercent", path: "https://avangard-ai.ru/tariffs", external: true },
];

export default function Account() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = useState(true);
  const [hsReports, setHsReports] = useState<HomestagingReportItem[]>([]);
  const [hsLoading, setHsLoading] = useState(true);

  const { planName, daysRemaining, daysTotal, loading: tariffLoading } = useTariffAccess();

  useEffect(() => {
    try {
      const raw = localStorage.getItem("avangard_user");
      if (raw) setUser(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user?.id && !user?.email) {
      setPaymentsLoading(false);
      return;
    }

    fetch(TARIFF_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "get_payments",
        user_id: user.id,
        email: user.email,
      }),
    })
      .then((res) => res.json())
      .then((raw) => {
        const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
        if (Array.isArray(data?.payments)) {
          setPayments(data.payments);
        }
      })
      .catch(() => {})
      .finally(() => setPaymentsLoading(false));
  }, [user?.id, user?.email]);

  useEffect(() => {
    if (!user?.id) {
      setHsLoading(false);
      return;
    }
    fetch(`${HOMESTAGING_REPORTS_URL}?userId=${user.id}`, {
      headers: { "X-User-Id": String(user.id) },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data?.reports)) setHsReports(data.reports);
      })
      .catch(() => {})
      .finally(() => setHsLoading(false));
  }, [user?.id]);

  const daysPassed = daysTotal - daysRemaining;
  const progressValue = daysTotal > 0 ? (daysPassed / daysTotal) * 100 : 0;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("ru-RU");
    } catch {
      return dateStr;
    }
  };

  const formatAmount = (n: number) => n.toLocaleString("ru-RU");

  const statusLabel = (status: string) => {
    const map: Record<string, string> = {
      paid: "Оплачен",
      pending: "Ожидает",
      failed: "Ошибка",
      refunded: "Возврат",
    };
    return map[status] || status;
  };

  const statusColor = (status: string) => {
    const map: Record<string, string> = {
      paid: "text-green-600",
      pending: "text-amber-600",
      failed: "text-red-600",
      refunded: "text-gray-500",
    };
    return map[status] || "text-gray-600";
  };

  return (
    <div className="min-h-screen bg-[#fafaf8] dark:bg-slate-900 flex flex-col">
      <SiteHeader />

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        <h1 className="text-2xl font-bold">Личный кабинет</h1>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="CreditCard" size={20} />
              Текущий тариф
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tariffLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Icon name="Loader2" size={18} className="animate-spin" />
                <span className="text-sm">Загрузка тарифа...</span>
              </div>
            ) : planName ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xl font-semibold">{planName}</p>
                    <p className="text-sm text-muted-foreground">
                      Осталось {daysRemaining} {daysRemaining === 1 ? "день" : daysRemaining >= 2 && daysRemaining <= 4 ? "дня" : "дней"}
                    </p>
                  </div>
                  <Button
                    onClick={() => { window.location.href = "https://avangard-ai.ru/tariffs"; }}
                    className="gap-1.5"
                  >
                    <Icon name="RefreshCw" size={14} />
                    Продлить тариф
                  </Button>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Прошло {daysPassed} из {daysTotal} дней</span>
                    <span>{Math.round(progressValue)}%</span>
                  </div>
                  <Progress value={progressValue} className="h-2" />
                </div>
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Icon name="AlertCircle" size={24} className="text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">Тариф не подключён</p>
                <Button
                  onClick={() => { window.location.href = "https://avangard-ai.ru/tariffs"; }}
                  className="gap-1.5"
                >
                  <Icon name="Zap" size={14} />
                  Выбрать тариф
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-3">Быстрые действия</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickActions.map((action) => (
              <Card
                key={action.label}
                className="cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => {
                  if (action.external) {
                    window.location.href = action.path;
                  } else {
                    navigate(action.path);
                  }
                }}
              >
                <CardContent className="p-4 flex flex-col items-center gap-2 text-center">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                    <Icon name={action.icon} size={18} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{action.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <RecentActivityFeed homestagingReports={hsReports} />

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Icon name="Home" size={20} />
                Мои отчёты хоумстейджинга
                {hsReports.length > 0 && (
                  <span className="text-sm font-normal text-muted-foreground">({hsReports.length})</span>
                )}
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate("/homestaging")}
                className="gap-1.5"
              >
                <Icon name="Plus" size={14} />
                Новый анализ
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hsLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Icon name="Loader2" size={18} className="animate-spin" />
                <span className="text-sm">Загрузка отчётов...</span>
              </div>
            ) : hsReports.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {hsReports.slice(0, 6).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/homestaging`)}
                    className="group rounded-xl border border-gray-200 hover:border-rose-300 cursor-pointer overflow-hidden transition-all hover:shadow-md"
                  >
                    {r.image_url ? (
                      <div className="aspect-video bg-gray-100 overflow-hidden">
                        <img src={r.image_url} alt={r.room_type} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                    ) : (
                      <div className="aspect-video bg-gradient-to-br from-rose-100 to-fuchsia-100 flex items-center justify-center">
                        <Icon name="Home" size={36} className="text-rose-400" />
                      </div>
                    )}
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-semibold text-sm capitalize truncate">{r.room_type || "Помещение"}</h4>
                        <span className="inline-flex items-center gap-0.5 text-xs font-bold text-amber-600 flex-shrink-0">
                          <Icon name="Star" size={11} className="fill-amber-500 text-amber-500" />
                          {r.overall_score}/10
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(r.created_at)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center">
                  <Icon name="Sparkles" size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Пока нет отчётов</p>
                <Button size="sm" onClick={() => navigate("/homestaging")} className="gap-1.5">
                  <Icon name="Upload" size={14} />
                  Загрузить фото
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Icon name="Receipt" size={20} />
              История платежей
            </CardTitle>
          </CardHeader>
          <CardContent>
            {paymentsLoading ? (
              <div className="flex items-center justify-center py-6 gap-2 text-muted-foreground">
                <Icon name="Loader2" size={18} className="animate-spin" />
                <span className="text-sm">Загрузка платежей...</span>
              </div>
            ) : payments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left text-muted-foreground">
                      <th className="pb-2 pr-4 font-medium">Дата</th>
                      <th className="pb-2 pr-4 font-medium">Тариф</th>
                      <th className="pb-2 pr-4 font-medium text-right">Сумма</th>
                      <th className="pb-2 font-medium">Статус</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p, i) => (
                      <tr key={i} className="border-b last:border-0">
                        <td className="py-2.5 pr-4">{formatDate(p.date)}</td>
                        <td className="py-2.5 pr-4">{p.plan_name}</td>
                        <td className="py-2.5 pr-4 text-right">{formatAmount(p.amount)} &#8381;</td>
                        <td className={`py-2.5 font-medium ${statusColor(p.status)}`}>{statusLabel(p.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                Платежей пока нет
              </p>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </div>
  );
}