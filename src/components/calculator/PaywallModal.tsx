import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const YK_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";
const SUBS_URL = "https://functions.poehali.dev/52ea78ee-5f41-4904-b547-d60063d9da0a";

const SINGLE_PRICE = 149;

const PLANS = [
  {
    code: "start",
    name: "START",
    price: 990,
    label: "990 ₽/мес",
    features: ["Безлимитная печать смет и КП", "3 проекта", "10 визуализаций ИИ"],
  },
  {
    code: "pro",
    name: "PRO",
    price: 2490,
    label: "2 490 ₽/мес",
    features: ["Безлимитная печать смет и КП", "10 проектов", "30 визуализаций ИИ"],
    popular: true,
  },
  {
    code: "max",
    name: "MAX",
    price: 4990,
    label: "4 990 ₽/мес",
    features: ["Безлимитная печать смет и КП", "30 проектов", "Безлимит правок", "Материалы и сметы"],
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
  const isAdmin = storedUser?.role === "admin" || storedUser?.role === "yukassa_staff";

  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"single" | "plans">("single");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Касса временно отключена — всё бесплатно
  onSuccess();
  return null;

  const stopPoll = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
  };

  const handlePay = async (code: string, price: number, name: string) => {
    if (!userId) { navigate("/login"); return; }
    setError(null);
    setPaying(code);

    try {
      const res = await fetch(YK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: price,
          user_email: storedUser?.email || `user${userId}@remont.ru`,
          user_name: storedUser?.name || "",
          description: name,
          return_url: window.location.origin + "/calculator?payment=success",
          cart_items: [{ id: code, name, price, quantity: 1 }],
          metadata: { user_id: String(userId), plan_code: code },
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
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Скачать PDF</h2>
            <p className="text-sm text-gray-500 mt-1">Выберите разовую оплату или подписку</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4 shrink-0">
            <Icon name="X" size={20} />
          </button>
        </div>

        {/* Переключатель */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-gray-100 rounded-xl mb-4">
          <button
            onClick={() => setTab("single")}
            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "single" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Один документ
          </button>
          <button
            onClick={() => setTab("plans")}
            className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "plans" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
            }`}
          >
            Подписка
          </button>
        </div>

        {tab === "single" ? (
          <div>
            <div className="border border-orange-200 bg-orange-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-bold text-gray-900">Разовая печать</p>
                  <p className="text-xs text-gray-500 mt-0.5">Скачать этот документ в PDF</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-orange-600">{SINGLE_PRICE} ₽</p>
                  <p className="text-xs text-gray-400">единоразово</p>
                </div>
              </div>
              <ul className="text-xs text-gray-600 space-y-1.5 mb-4">
                {["PDF со всеми работами и материалами", "Подписи и реквизиты сторон", "Профессиональное оформление А4"].map(f => (
                  <li key={f} className="flex items-center gap-1.5">
                    <Icon name="Check" size={12} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={() => handlePay("single_print", SINGLE_PRICE, "Разовая печать сметы")}
                disabled={paying !== null}
              >
                {paying === "single_print" ? (
                  <><Icon name="Loader2" size={15} className="mr-2 animate-spin" />Ожидание оплаты...</>
                ) : (
                  <><Icon name="Download" size={15} className="mr-2" />Скачать за {SINGLE_PRICE} ₽</>
                )}
              </Button>
            </div>
            <p className="text-xs text-center text-gray-400">
              Работаете с клиентами регулярно?{" "}
              <button className="text-orange-500 underline" onClick={() => setTab("plans")}>
                Подписка выгоднее
              </button>
            </p>
          </div>
        ) : (
          <div className="space-y-3">
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
                    onClick={() => handlePay(plan.code, plan.price, `Тариф ${plan.name}`)}
                    disabled={paying !== null}
                  >
                    {paying === plan.code ? (
                      <><Icon name="Loader2" size={12} className="mr-1 animate-spin" />Ожидание...</>
                    ) : "Выбрать"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!userId && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
            <Icon name="AlertCircle" size={16} />
            Для оплаты необходимо войти в аккаунт
          </div>
        )}

        {error && (
          <p className="text-sm text-red-600 mt-3 flex items-center gap-1">
            <Icon name="AlertCircle" size={14} /> {error}
          </p>
        )}

        {paying && (
          <p className="text-xs text-center text-gray-400 mt-3">
            Окно оплаты открыто. После успешной оплаты доступ откроется автоматически.
          </p>
        )}

        <p className="text-xs text-center text-gray-400 mt-4">
          Нет аккаунта?{" "}
          <button className="text-orange-500 underline" onClick={() => navigate("/register")}>
            Зарегистрироваться
          </button>
        </p>
      </div>
    </div>
  );
}