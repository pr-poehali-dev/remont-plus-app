import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { openPaymentPage } from "@/components/extensions/yookassa/useYookassa";

// Компонент проверки существующего заказа
function CheckOrderPanel({ onUnlock }: { onUnlock: () => void }) {
  const [orderNum, setOrderNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCheck = async () => {
    const val = orderNum.trim().toUpperCase();
    if (!val) { setError("Введите номер заказа"); return; }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(ESTIMATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "check_status", order_number: val }),
      });
      const raw = await res.json();
      const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;
      if (res.status === 404 || data.error) {
        setError("Заказ не найден. Проверьте номер.");
      } else if (data.status !== "paid") {
        setError("Оплата по заказу ещё не поступила. Подождите немного и попробуйте снова.");
      } else {
        markPaid();
        onUnlock();
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border-t border-gray-100 pt-4 mt-2">
      <p className="text-xs text-gray-500 mb-2">
        Уже оплачивали? Введите номер заказа из письма (например, <span className="font-mono font-semibold">EST-00001</span>):
      </p>
      <div className="flex gap-2">
        <Input
          placeholder="EST-00001"
          value={orderNum}
          onChange={(e) => { setOrderNum(e.target.value); setError(""); }}
          className="h-8 text-xs font-mono uppercase flex-1"
          onKeyDown={(e) => e.key === "Enter" && handleCheck()}
        />
        <Button
          size="sm"
          variant="outline"
          onClick={handleCheck}
          disabled={loading}
          className="h-8 px-3 text-xs shrink-0"
        >
          {loading ? <Icon name="Loader2" size={13} className="animate-spin" /> : "Проверить"}
        </Button>
      </div>
      {error && <p className="text-xs text-red-500 mt-1.5">{error}</p>}
    </div>
  );
}

const ESTIMATE_PAYMENT_URL = "https://functions.poehali.dev/610d6f7d-fc4b-4907-b4f2-2e678dc3217d";
const YOOKASSA_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";

const PRICE = 399;
const PAID_KEY = "avangard_estimate_paid";
const PAID_TTL_MS = 24 * 60 * 60 * 1000; // 24 часа

function isPaidRecently(): boolean {
  try {
    const raw = localStorage.getItem(PAID_KEY);
    if (!raw) return false;
    const { ts } = JSON.parse(raw);
    return Date.now() - ts < PAID_TTL_MS;
  } catch {
    return false;
  }
}

function markPaid() {
  localStorage.setItem(PAID_KEY, JSON.stringify({ ts: Date.now() }));
}

interface Props {
  children: React.ReactNode;
  docTitle?: string;
  totalSum?: number;
}

export default function PrintPaywall({ children, docTitle = "Смета", totalSum = 0 }: Props) {
  let storedUser: { id?: number; role?: string; email?: string; name?: string } | null = null;
  try { storedUser = JSON.parse(localStorage.getItem("avangard_user") || "null"); } catch { storedUser = null; }

  const isAdmin = storedUser?.role === "admin" || storedUser?.role === "yukassa_staff";

  const [unlocked, setUnlocked] = useState(false);
  const [step, setStep] = useState<"form" | "waiting" | "done">("form");
  const [name, setName] = useState(storedUser?.name || "");
  const [email, setEmail] = useState(storedUser?.email || "");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fmt = (n: number) =>
    n.toLocaleString("ru-RU", { style: "currency", currency: "RUB", maximumFractionDigits: 0 });

  useEffect(() => {
    if (isAdmin || isPaidRecently()) {
      setUnlocked(true);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [isAdmin]);

  const validate = () => {
    if (!name.trim()) { setError("Введите ваше имя"); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Введите корректный email");
      return false;
    }
    return true;
  };

  const handlePay = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      // 1. Создаём заказ в БД
      const orderRes = await fetch(ESTIMATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          plan_type: "estimate_print",
          amount: PRICE,
          client_name: name.trim(),
          client_email: email.trim(),
          client_phone: phone.trim(),
          client_comment: comment.trim() || docTitle,
        }),
      });
      const orderRaw = await orderRes.json();
      const orderData = typeof orderRaw.body === "string" ? JSON.parse(orderRaw.body) : orderRaw;
      const oNum = orderData.order_number;
      setOrderNumber(oNum);

      // 2. Создаём платёж ЮКасса
      const payRes = await fetch(YOOKASSA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: PRICE,
          user_email: email.trim(),
          user_name: name.trim(),
          user_phone: phone.trim(),
          description: `Смета + доступ к сервисам АВАНГАРД · ${oNum}`,
          return_url: window.location.href,
          cart_items: [{ id: "estimate_print", name: "Смета + доступ к сервисам", price: PRICE, quantity: 1 }],
          metadata: { estimate_order_number: oNum },
        }),
      });
      const payRaw = await payRes.json();
      const payData = typeof payRaw.body === "string" ? JSON.parse(payRaw.body) : payRaw;

      if (!payRes.ok || !payData.payment_url) {
        throw new Error(payData.error || "Ошибка создания платежа");
      }

      openPaymentPage(payData.payment_url);
      setStep("waiting");

      // Поллинг статуса заказа
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(ESTIMATE_PAYMENT_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "check_status", order_number: oNum }),
          });
          const statusRaw = await statusRes.json();
          const statusData = typeof statusRaw.body === "string" ? JSON.parse(statusRaw.body) : statusRaw;
          if (statusData.status === "paid") {
            if (pollRef.current) clearInterval(pollRef.current);
            markPaid();
            setStep("done");
            setTimeout(() => {
              setUnlocked(true);
              window.print();
            }, 800);
          }
        } catch {
          // продолжаем поллить
        }
      }, 3000);

    } catch (e) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  if (unlocked) return <>{children}</>;

  return (
    <div className="relative bg-gray-50 min-h-screen">
      {/* Размытое превью */}
      <div className="relative overflow-hidden" style={{ maxHeight: "65vh" }}>
        <div className="pointer-events-none select-none" style={{ filter: "blur(5px)", opacity: 0.5 }}>
          {children}
        </div>
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "linear-gradient(to bottom, rgba(249,250,251,0) 20%, rgba(249,250,251,0.9) 65%, rgba(249,250,251,1) 100%)" }}
        />
      </div>

      {/* Блок оплаты */}
      <div className="relative z-10 flex flex-col items-center px-4 pb-16 -mt-6">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">

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

          <div className="px-6 py-5">
            {step === "done" ? (
              <div className="text-center py-4">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                  <Icon name="CheckCircle" size={30} className="text-green-500" />
                </div>
                <p className="font-bold text-lg mb-1">Оплата прошла!</p>
                <p className="text-gray-500 text-sm">Открываем документ для печати...</p>
              </div>
            ) : step === "waiting" ? (
              <div className="text-center py-4">
                <Icon name="Loader2" size={32} className="animate-spin text-orange-500 mx-auto mb-3" />
                <p className="font-bold text-base mb-1">Ожидаем подтверждение оплаты</p>
                <p className="text-gray-500 text-sm mb-3">
                  Заказ <strong>{orderNumber}</strong>. Как только оплата пройдёт — документ откроется автоматически.
                </p>
                <p className="text-xs text-gray-400">Смета также придёт на {email}</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-gray-800">Доступ к документу</p>
                  <span className="text-2xl font-black text-orange-600">{PRICE} ₽</span>
                </div>

                <ul className="text-xs text-gray-600 space-y-1.5 mb-5">
                  {[
                    "Смета PDF — файл на email",
                    "Распечатка и скачивание этого документа",
                    "Доступ к калькулятору, дизайнеру и ИИ-эксперту",
                    "Органайзер ремонта и шоурум проектов",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-1.5">
                      <Icon name="Check" size={12} className="text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Ваше имя *</label>
                    <Input
                      placeholder="Иван Иванов"
                      value={name}
                      onChange={(e) => { setName(e.target.value); setError(""); }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Email — сюда пришлём смету *</label>
                    <Input
                      type="email"
                      placeholder="ivan@example.ru"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(""); }}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Телефон</label>
                    <Input
                      type="tel"
                      placeholder="+7 (___) ___-__-__"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 mb-1 block">Комментарий</label>
                    <Textarea
                      placeholder="Пожелания, уточнения по смете..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="text-sm"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-xs text-red-700 flex items-center gap-2">
                      <Icon name="AlertCircle" size={13} className="shrink-0" />
                      {error}
                    </div>
                  )}

                  <Button
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-11"
                    onClick={handlePay}
                    disabled={loading}
                  >
                    {loading
                      ? <><Icon name="Loader2" size={16} className="animate-spin mr-2" />Создаём платёж...</>
                      : <><Icon name="CreditCard" size={16} className="mr-2" />Оплатить {PRICE} ₽ и распечатать</>
                    }
                  </Button>
                  <p className="text-center text-xs text-gray-400">
                    Безопасная оплата через ЮКассу · Чек на email
                  </p>

                  <CheckOrderPanel onUnlock={() => setUnlocked(true)} />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}