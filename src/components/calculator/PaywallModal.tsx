import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const YK_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";
const SUBS_URL = "https://functions.poehali.dev/52ea78ee-5f41-4904-b547-d60063d9da0a";

const PLANS = [
  {
    code: "start",
    name: "START",
    price: 990,
    label: "990 ₽/мес",
    features: ["Печать смет и КП", "3 проекта", "10 визуализаций ИИ"],
  },
  {
    code: "pro",
    name: "PRO",
    price: 2490,
    label: "2 490 ₽/мес",
    features: ["Печать смет и КП", "10 проектов", "30 визуализаций ИИ"],
    popular: true,
  },
  {
    code: "max",
    name: "MAX",
    price: 4990,
    label: "4 990 ₽/мес",
    features: ["Печать смет и КП", "30 проектов", "Безлимит правок", "Материалы и сметы"],
  },
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function PaywallModal({ onClose, onSuccess }: Props) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("avangard_user") || "null");
  const userId: number | null = storedUser?.id ?? null;

  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  useEffect(() => () => stopPoll(), []);

  const handlePay = async (plan: typeof PLANS[0]) => {
    if (!userId) { navigate("/login"); return; }
    setError(null);
    setPaying(plan.code);

    try {
      const res = await fetch(YK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          user_email: storedUser?.email || `user${userId}@remont.ru`,
          user_name: storedUser?.name || "",
          description: `Тариф ${plan.name}`,
          return_url: window.location.origin + "/calculator?payment=success",
          cart_items: [{ id: plan.code, name: `Тариф ${plan.name}`, price: plan.price, quantity: 1 }],
          metadata: { user_id: String(userId), plan_code: plan.code },
        }),
      });
      const data = await res.json();
      if (!data.payment_url) { setError("Не удалось создать платёж"); setPaying(null); return; }

      const win = window.open(data.payment_url, "_blank", "width=800,height=700");

      pollRef.current = setInterval(async () => {
        try {
          const r = await fetch(`${SUBS_URL}?user_id=${userId}`);
          const d = await r.json();
          if (d.subscription?.status === "active") {
            stopPoll();
            win?.close();
            setPaying(null);
            onSuccess();
          }
        } catch { /* continue */ }
      }, 3000);
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
      setPaying(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Доступно после оплаты тарифа</h2>
            <p className="text-sm text-gray-500 mt-1">Выберите план и получите доступ к печати и скачиванию документов</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <Icon name="X" size={20} />
          </button>
        </div>

        {!userId && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
            <Icon name="AlertCircle" size={16} />
            Для оплаты необходимо войти в аккаунт
          </div>
        )}

        <div className="space-y-3 mb-5">
          {PLANS.map((plan) => (
            <div
              key={plan.code}
              className={`border rounded-xl p-4 flex items-center justify-between gap-4 transition-all ${
                plan.popular ? "border-orange-400 bg-orange-50" : "border-gray-200"
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-gray-900">{plan.name}</span>
                  {plan.popular && (
                    <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">Популярный</span>
                  )}
                </div>
                <ul className="text-xs text-gray-500 space-y-0.5">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-1">
                      <Icon name="Check" size={11} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-gray-900 text-sm mb-2">{plan.label}</div>
                <Button
                  size="sm"
                  className={`text-xs ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handlePay(plan)}
                  disabled={paying !== null}
                >
                  {paying === plan.code ? (
                    <><Icon name="Loader2" size={12} className="mr-1 animate-spin" />Ожидание...</>
                  ) : (
                    "Выбрать"
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <p className="text-sm text-red-600 mb-3 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} /> {error}
          </p>
        )}

        {paying && (
          <p className="text-xs text-center text-gray-400 mb-3">
            Окно оплаты открыто. После успешной оплаты доступ откроется автоматически.
          </p>
        )}

        <p className="text-xs text-center text-gray-400">
          Нет аккаунта?{" "}
          <button className="text-orange-500 underline" onClick={() => navigate("/register")}>
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}
