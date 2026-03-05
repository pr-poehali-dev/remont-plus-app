import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

const YK_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";
const SUBS_URL = "https://functions.poehali.dev/52ea78ee-5f41-4904-b547-d60063d9da0a";

const SINGLE_PRICE = 399;
const FREE_LIMIT = 1;
const FREE_KEY = "avangard_free_prints";

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
    features: ["Безлимитная печать смет и КП", "30 проектов", "Безлимит правок"],
  },
];

interface Props {
  children: React.ReactNode;
  docTitle?: string;
  totalSum?: number;
}

function checkSubscription(userId: number): Promise<boolean> {
  return fetch(`${SUBS_URL}?user_id=${userId}`)
    .then(r => r.json())
    .then(d => d.subscription?.status === "active")
    .catch(() => false);
}

export default function PrintPaywall({ children, docTitle = "Смета", totalSum = 0 }: Props) {
  const navigate = useNavigate();
  let storedUser: { id?: number; role?: string; email?: string } | null = null;
  try { storedUser = JSON.parse(localStorage.getItem("avangard_user") || "null"); } catch { storedUser = null; }
  const userId: number | null = storedUser?.id != null ? storedUser.id : null;

  const isAdmin = storedUser?.role === "admin" || storedUser?.role === "yukassa_staff";

  const [hasPaid, setHasPaid] = useState<boolean | null>(null);
  const [paying, setPaying] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"single" | "plans">("single");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const freeUsed = useRef(parseInt(localStorage.getItem(FREE_KEY) || "0", 10));

  const fmt = (n: number) =>
    n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

  useEffect(() => {
    if (isAdmin) {
      setHasPaid(true);
      return;
    }
    if (!userId) {
      if (freeUsed.current < FREE_LIMIT) {
        localStorage.setItem(FREE_KEY, String(freeUsed.current + 1));
        setHasPaid(true);
      } else {
        setHasPaid(false);
      }
      return;
    }
    checkSubscription(userId).then(active => {
      if (!active && freeUsed.current < FREE_LIMIT) {
        localStorage.setItem(FREE_KEY, String(freeUsed.current + 1));
        setHasPaid(true);
      } else {
        setHasPaid(active);
      }
    });
  }, [userId]);

  useEffect(() => () => {
    if (pollRef.current) clearInterval(pollRef.current);
  }, []);

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
          return_url: window.location.href,
          cart_items: [{ id: code, name, price, quantity: 1 }],
          metadata: { user_id: String(userId), plan_code: code },
        }),
      });
      const data = await res.json();
      if (!data.payment_url) { setError("Не удалось создать платёж"); setPaying(null); return; }
      const win = window.open(data.payment_url, "_blank", "width=800,height=700");
      pollRef.current = setInterval(async () => {
        const active = await checkSubscription(userId);
        if (active) {
          if (pollRef.current) clearInterval(pollRef.current);
          win?.close();
          setPaying(null);
          setHasPaid(true);
          setTimeout(() => window.print(), 400);
        }
      }, 3000);
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
      setPaying(null);
    }
  };

  const isLoading = hasPaid === null;
  const isLocked = hasPaid === false;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Icon name="Loader2" size={32} className="animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isLocked) {
    return <>{children}</>;
  }

  return (
    <div className="relative bg-gray-50 min-h-screen">
      {/* Размытое превью документа */}
      <div className="relative overflow-hidden" style={{ maxHeight: "70vh" }}>
        <div
          className="pointer-events-none select-none"
          style={{ filter: "blur(4px)", opacity: 0.55, transform: "scale(1.02)" }}
        >
          {children}
        </div>
        {/* Градиент-завеса */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(249,250,251,0) 20%, rgba(249,250,251,0.85) 60%, rgba(249,250,251,1) 100%)" }}
        />
      </div>

      {/* Блок оплаты */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-16 -mt-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* Шапка */}
          <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-5 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center shrink-0">
                <Icon name="FileText" size={20} />
              </div>
              <div>
                <p className="font-bold text-base leading-tight">Документ готов к печати</p>
                <p className="text-orange-100 text-xs mt-0.5">{docTitle}</p>
              </div>
            </div>
            {totalSum > 0 && (
              <p className="text-orange-100 text-sm mt-3">
                Итого по смете: <span className="text-white font-bold">{fmt(totalSum)}</span>
              </p>
            )}
          </div>

          {/* Переключатель */}
          <div className="grid grid-cols-2 gap-1 mx-6 mt-5 p-1 bg-gray-100 rounded-xl">
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

          <div className="px-6 pb-6 pt-4">
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
                    onClick={() => handlePay("single_print", SINGLE_PRICE, `Печать: ${docTitle}`)}
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
                  <button className="text-orange-500 underline font-medium" onClick={() => setTab("plans")}>
                    Подписка выгоднее
                  </button>
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {PLANS.map((plan) => (
                  <div
                    key={plan.code}
                    className={`border rounded-xl p-3.5 flex items-center justify-between gap-3 ${
                      plan.popular ? "border-orange-400 bg-orange-50" : "border-gray-200"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-bold text-gray-900 text-sm">{plan.name}</span>
                        {plan.popular && (
                          <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-medium">Популярный</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{plan.features[0]}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="font-bold text-gray-900 text-sm mb-1.5">{plan.label}</div>
                      <Button
                        size="sm"
                        className={`text-xs h-7 ${plan.popular ? "bg-orange-500 hover:bg-orange-600 text-white" : ""}`}
                        variant={plan.popular ? "default" : "outline"}
                        onClick={() => handlePay(plan.code, plan.price, `Тариф ${plan.name}`)}
                        disabled={paying !== null}
                      >
                        {paying === plan.code ? (
                          <><Icon name="Loader2" size={11} className="mr-1 animate-spin" />Ждём...</>
                        ) : "Выбрать"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!userId && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2 text-sm text-amber-800">
                <Icon name="AlertCircle" size={16} className="shrink-0" />
                <span>
                  Для оплаты{" "}
                  <button className="underline font-medium" onClick={() => navigate("/login")}>войдите в аккаунт</button>
                </span>
              </div>
            )}

            {error && (
              <p className="mt-3 text-sm text-red-600 flex items-center gap-1">
                <Icon name="AlertCircle" size={14} /> {error}
              </p>
            )}

            {paying && (
              <p className="mt-3 text-xs text-center text-gray-400">
                Окно оплаты открыто. После оплаты доступ откроется автоматически.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}