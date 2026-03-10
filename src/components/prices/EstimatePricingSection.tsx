import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { openPaymentPage } from "@/components/extensions/yookassa/useYookassa";

const ESTIMATE_PAYMENT_URL = "https://functions.poehali.dev/610d6f7d-fc4b-4907-b4f2-2e678dc3217d";
const YOOKASSA_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";

const PLAN = {
  id: "estimate_print",
  title: "Смета + доступ к сервисам",
  price: 399,
  description: "Профессиональная смета на ремонт файлом на почту и полный доступ к инструментам сайта",
};

const FEATURES = [
  { icon: "FileText", text: "Детальная смета по видам работ — файл PDF на email" },
  { icon: "Calculator", text: "Калькулятор ремонта по всем видам работ" },
  { icon: "Compass", text: "Дизайнер интерьера с расчётом материалов" },
  { icon: "Sparkles", text: "ИИ-эксперт по ремонту — задавайте любые вопросы" },
  { icon: "ClipboardList", text: "Органайзер ремонта: этапы, сроки, бюджет" },
  { icon: "Layers", text: "Шоурум готовых проектов для вдохновения" },
];

const SECTIONS = [
  { icon: "Calculator", label: "Калькулятор", path: "/calculator" },
  { icon: "Compass", label: "Дизайнер", path: "/designer" },
  { icon: "Sparkles", label: "ИИ-эксперт", path: "/expert" },
  { icon: "ClipboardList", label: "Органайзер", path: "/organizer" },
  { icon: "Layers", label: "Шоурум", path: "/showroom" },
];

function PaymentModal({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderNumber, setOrderNumber] = useState("");

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
      const orderRes = await fetch(ESTIMATE_PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          plan_type: PLAN.id,
          amount: PLAN.price,
          client_name: name.trim(),
          client_email: email.trim(),
          client_phone: phone.trim(),
          client_comment: comment.trim(),
        }),
      });
      const orderRaw = await orderRes.json();
      const orderData = typeof orderRaw.body === "string" ? JSON.parse(orderRaw.body) : orderRaw;
      const oNum = orderData.order_number;
      setOrderNumber(oNum);

      const payRes = await fetch(YOOKASSA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: PLAN.price,
          user_email: email.trim(),
          user_name: name.trim(),
          user_phone: phone.trim(),
          description: `Смета + доступ к сервисам АВАНГАРД · ${oNum}`,
          return_url: `${window.location.origin}/tariffs?order=${oNum}`,
          cart_items: [{ id: PLAN.id, name: PLAN.title, price: PLAN.price, quantity: 1 }],
          metadata: { estimate_order_number: oNum },
        }),
      });
      const payRaw = await payRes.json();
      const payData = typeof payRaw.body === "string" ? JSON.parse(payRaw.body) : payRaw;

      if (!payRes.ok || !payData.payment_url) {
        throw new Error(payData.error || "Ошибка создания платежа");
      }

      openPaymentPage(payData.payment_url);
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Разовый платёж</p>
              <h2 className="text-xl font-bold">{PLAN.title}</h2>
              <p className="text-3xl font-black mt-2">
                399 <span className="text-lg font-normal opacity-80">₽</span>
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <Icon name="X" size={22} />
            </button>
          </div>
        </div>

        <div className="p-6">
          {step === "success" ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-green-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Переходим к оплате!</h3>
              <p className="text-gray-500 text-sm mb-3">
                Заказ <strong>{orderNumber}</strong> создан. Открылась страница ЮКассы для оплаты.
              </p>
              <p className="text-gray-400 text-xs">После оплаты смета придёт на {email}</p>
              <Button className="mt-5 w-full" variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ваше имя *</label>
                <Input placeholder="Иван Иванов" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email — сюда пришлём смету *</label>
                <Input type="email" placeholder="ivan@example.ru" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
                <Input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий к смете</label>
                <Textarea placeholder="Тип помещения, площадь, пожелания..." value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{PLAN.title}</span>
                  <span>399 ₽</span>
                </div>
                <div className="border-t border-orange-200 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Итого</span>
                  <span className="text-orange-600">399 ₽</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12" onClick={handlePay} disabled={loading}>
                {loading
                  ? <><Icon name="Loader2" size={18} className="animate-spin mr-2" />Создаём платёж...</>
                  : <><Icon name="CreditCard" size={18} className="mr-2" />Оплатить 399 ₽</>
                }
              </Button>
              <p className="text-center text-xs text-gray-400">Безопасная оплата через ЮКассу · Чек на email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const PAID_KEY = "avangard_estimate_paid";

function markPaid() {
  localStorage.setItem(PAID_KEY, JSON.stringify({ ts: Date.now() }));
}

function CheckOrderModal({ onClose }: { onClose: () => void }) {
  const [orderNum, setOrderNum] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

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
        setError("Заказ не найден. Проверьте номер и попробуйте снова.");
      } else if (data.status !== "paid") {
        setError("Заказ найден, но оплата ещё не поступила. Если вы только что оплатили — подождите минуту и попробуйте снова.");
      } else {
        markPaid();
        setSuccess(true);
      }
    } catch {
      setError("Ошибка соединения. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <h3 className="font-bold text-base">У меня уже есть заказ</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon name="X" size={20} />
          </button>
        </div>
        <div className="p-6">
          {success ? (
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
                <Icon name="CheckCircle" size={28} className="text-green-500" />
              </div>
              <p className="font-bold text-base mb-1">Доступ открыт!</p>
              <p className="text-gray-500 text-sm mb-4">Теперь вы можете распечатать смету и пользоваться всеми разделами в течение 24 часов.</p>
              <Button className="w-full" onClick={onClose}>Отлично, закрыть</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Введите номер заказа из письма — он выглядит как <strong>EST-00001</strong></p>
              <div>
                <Input
                  placeholder="EST-00001"
                  value={orderNum}
                  onChange={(e) => { setOrderNum(e.target.value); setError(""); }}
                  className="uppercase font-mono"
                  onKeyDown={(e) => e.key === "Enter" && handleCheck()}
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-xs text-red-700 flex items-start gap-2">
                  <Icon name="AlertCircle" size={13} className="shrink-0 mt-0.5" />
                  {error}
                </div>
              )}
              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold"
                onClick={handleCheck}
                disabled={loading}
              >
                {loading
                  ? <><Icon name="Loader2" size={15} className="animate-spin mr-2" />Проверяем...</>
                  : <><Icon name="Search" size={15} className="mr-2" />Проверить заказ</>
                }
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EstimatePricingSection() {
  const [showModal, setShowModal] = useState(false);
  const [showCheckOrder, setShowCheckOrder] = useState(false);
  const navigate = useNavigate();

  return (
    <section className="mt-10 mb-8">
      <div className="bg-white rounded-2xl border-2 border-orange-200 overflow-hidden shadow-sm">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-8 py-6 text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <span className="inline-block bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full mb-2">
                Для частных клиентов
              </span>
              <h2 className="text-2xl font-bold">{PLAN.title}</h2>
              <p className="text-white/80 text-sm mt-1">{PLAN.description}</p>
            </div>
            <div className="shrink-0 text-center sm:text-right">
              <div className="text-4xl font-black">399 ₽</div>
              <div className="text-white/70 text-sm">разовый платёж</div>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8">
          <div className="grid sm:grid-cols-2 gap-3 mb-8">
            {FEATURES.map((f) => (
              <div key={f.text} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
                  <Icon name={f.icon as "FileText"} size={16} className="text-orange-600" />
                </div>
                <span className="text-sm text-gray-700 pt-1">{f.text}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-100 pt-6 mb-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Доступные разделы после оплаты</p>
            <div className="flex flex-wrap gap-2">
              {SECTIONS.map((s) => (
                <button
                  key={s.path}
                  onClick={() => navigate(s.path)}
                  className="flex items-center gap-1.5 bg-gray-100 hover:bg-orange-50 hover:text-orange-700 text-gray-600 text-xs font-medium px-3 py-1.5 rounded-full transition-colors"
                >
                  <Icon name={s.icon as "Calculator"} size={13} />
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button
              onClick={() => setShowModal(true)}
              className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 px-8 text-base"
            >
              <Icon name="CreditCard" size={18} className="mr-2" />
              Заказать смету за 399 ₽
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowCheckOrder(true)}
              className="w-full sm:w-auto h-12 px-5 text-sm text-gray-600 border-gray-300"
            >
              <Icon name="TicketCheck" size={16} className="mr-2" />
              У меня уже есть заказ
            </Button>
            <div className="flex items-center gap-4 text-xs text-gray-400 sm:ml-auto">
              <span className="flex items-center gap-1">
                <Icon name="ShieldCheck" size={13} className="text-green-500" />
                ЮКасса
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={13} className="text-blue-500" />
                1 рабочий день
              </span>
              <span className="flex items-center gap-1">
                <Icon name="Mail" size={13} className="text-orange-500" />
                Смета на email
              </span>
            </div>
          </div>
        </div>
      </div>

      {showModal && <PaymentModal onClose={() => setShowModal(false)} />}
      {showCheckOrder && <CheckOrderModal onClose={() => setShowCheckOrder(false)} />}
    </section>
  );
}