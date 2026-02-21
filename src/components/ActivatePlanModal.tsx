import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Icon from "@/components/ui/icon";

const YK_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";

const PLANS = [
  {
    code: "start",
    name: "START",
    price: 990,
    label: "990 ₽/мес",
    color: "border-green-200 bg-green-50",
    badge: "bg-green-100 text-green-700",
    dot: "bg-green-400",
    features: ["3 проекта", "10 визуализаций ИИ", "5 правок"],
  },
  {
    code: "pro",
    name: "PRO",
    price: 2490,
    label: "2 490 ₽/мес",
    color: "border-blue-200 bg-blue-50",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
    features: ["10 проектов", "30 визуализаций ИИ", "20 правок"],
    popular: true,
  },
  {
    code: "max",
    name: "MAX",
    price: 4990,
    label: "4 990 ₽/мес",
    color: "border-purple-200 bg-purple-50",
    badge: "bg-purple-100 text-purple-700",
    dot: "bg-purple-500",
    features: ["30 проектов", "100 визуализаций ИИ", "Безлимит правок", "Материалы и сметы"],
  },
  {
    code: "studio",
    name: "STUDIO",
    price: 9900,
    label: "9 900 ₽/мес",
    color: "border-teal-200 bg-teal-50",
    badge: "bg-teal-100 text-teal-700",
    dot: "bg-teal-500",
    features: ["Безлимит проектов", "Безлимит ИИ", "Менеджер", "CRM для клиентов"],
  },
];

type Step = "select" | "paying" | "success" | "error";

interface Props {
  open: boolean;
  onClose: () => void;
  userId: number | null;
  currentPlanCode?: string;
  onActivated: () => void;
}

export default function ActivatePlanModal({ open, onClose, userId, currentPlanCode, onActivated }: Props) {
  const [step, setStep] = useState<Step>("select");
  const [selectedPlan, setSelectedPlan] = useState<(typeof PLANS)[0] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => {
    if (!open) {
      stopPolling();
      setStep("select");
      setSelectedPlan(null);
      setError(null);
    }
  }, [open]);

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const startPayment = async (plan: (typeof PLANS)[0]) => {
    if (!userId) return;
    setLoading(true);
    setError(null);
    setSelectedPlan(plan);

    const storedUser = JSON.parse(localStorage.getItem("avangard_user") || "null");
    const userEmail = storedUser?.email || `user${userId}@avangard-ai.ru`;

    try {
      const res = await fetch(YK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          user_email: userEmail,
          user_name: storedUser?.name || "",
          description: `Тариф ${plan.name}`,
          return_url: window.location.origin + "/dashboard?payment=success",
          cart_items: [{ id: plan.code, name: `Тариф ${plan.name}`, price: plan.price, quantity: 1 }],
          metadata: { user_id: String(userId), plan_code: plan.code },
        }),
      });
      const data = await res.json();

      if (!data.payment_url) {
        setError(data.error || "Не удалось создать платёж");
        setLoading(false);
        return;
      }

      setStep("paying");
      const win = window.open(data.payment_url, "_blank", "width=800,height=700");
      setPaymentWindow(win);

      const SUBS_URL = "https://functions.poehali.dev/52ea78ee-5f41-4904-b547-d60063d9da0a";
      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${SUBS_URL}?user_id=${userId}`);
          const d = await r.json();
          if (d.subscription?.plan_code === plan.code) {
            stopPolling();
            win?.close();
            setStep("success");
            onActivated();
          }
        } catch {
          // продолжаем поллинг при сетевых ошибках
        }
      }, 3000);

    } catch {
      setError("Ошибка подключения. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    stopPolling();
    paymentWindow?.close();
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

        {/* Выбор тарифа */}
        {step === "select" && (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Выбрать тариф</DialogTitle>
              <p className="text-sm text-gray-500">Нажмите «Оплатить» — откроется страница ЮKassa, после оплаты тариф активируется автоматически</p>
            </DialogHeader>

            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600">
                <Icon name="AlertCircle" size={15} />
                {error}
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-3 mt-1">
              {PLANS.map((plan) => {
                const isCurrent = plan.code === currentPlanCode;
                const isLoading = loading && selectedPlan?.code === plan.code;

                return (
                  <div
                    key={plan.code}
                    className={`relative rounded-2xl border-2 p-4 ${isCurrent ? "border-gray-300 bg-gray-50 opacity-60" : plan.color}`}
                  >
                    {plan.popular && !isCurrent && (
                      <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">
                        Популярный
                      </span>
                    )}
                    {isCurrent && (
                      <span className="absolute -top-2.5 left-4 text-xs font-semibold bg-gray-500 text-white px-2.5 py-0.5 rounded-full">
                        Активен
                      </span>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${plan.dot}`} />
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${plan.badge}`}>{plan.name}</span>
                      </div>
                      <span className="text-sm font-bold text-gray-800">{plan.label}</span>
                    </div>

                    <ul className="space-y-1.5 mb-4">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-1.5 text-xs text-gray-600">
                          <Icon name="Check" size={13} className="text-green-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>

                    <Button
                      size="sm"
                      className="w-full h-8 text-xs"
                      disabled={isCurrent || loading}
                      variant={isCurrent ? "outline" : "default"}
                      onClick={() => startPayment(plan)}
                    >
                      {isLoading ? (
                        <>
                          <Icon name="Loader2" size={13} className="mr-1.5 animate-spin" />
                          Создаём платёж...
                        </>
                      ) : isCurrent ? (
                        "Текущий тариф"
                      ) : (
                        <>
                          <Icon name="CreditCard" size={13} className="mr-1.5" />
                          Оплатить {plan.label}
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>

            <p className="text-xs text-gray-400 text-center mt-1">
              Оплата через ЮKassa — карта, СБП, ЮMoney. Безопасно и мгновенно.
            </p>
          </>
        )}

        {/* Ожидание оплаты */}
        {step === "paying" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="Clock" size={28} className="text-blue-500 animate-pulse" />
            </div>
            <h3 className="font-bold text-lg mb-2">Ожидаем оплату</h3>
            <p className="text-sm text-gray-500 mb-1">Окно оплаты ЮKassa открыто в новой вкладке</p>
            <p className="text-xs text-gray-400 mb-6">
              Тариф <b>{selectedPlan?.name}</b> активируется автоматически после успешной оплаты
            </p>
            <div className="flex items-center justify-center gap-1.5 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "0ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "150ms" }} />
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: "300ms" }} />
            </div>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" size="sm" onClick={() => { stopPolling(); paymentWindow?.close(); setStep("select"); }}>
                Выбрать другой тариф
              </Button>
              <Button size="sm" onClick={() => paymentWindow?.focus()}>
                <Icon name="ExternalLink" size={13} className="mr-1.5" />
                Открыть страницу оплаты
              </Button>
            </div>
          </div>
        )}

        {/* Успех */}
        {step === "success" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle2" size={32} className="text-green-500" />
            </div>
            <h3 className="font-bold text-lg mb-2">Тариф активирован!</h3>
            <p className="text-sm text-gray-500 mb-6">
              Тариф <b>{selectedPlan?.name}</b> подключён и уже доступен
            </p>
            <Button onClick={handleClose}>
              <Icon name="ArrowRight" size={14} className="mr-1.5" />
              Перейти в кабинет
            </Button>
          </div>
        )}

        {/* Ошибка */}
        {step === "error" && (
          <div className="py-8 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Icon name="XCircle" size={32} className="text-red-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Оплата не прошла</h3>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <Button variant="outline" onClick={() => setStep("select")}>
              Попробовать снова
            </Button>
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}