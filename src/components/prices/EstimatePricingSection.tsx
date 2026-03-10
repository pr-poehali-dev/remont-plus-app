import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { openPaymentPage } from "@/components/extensions/yookassa/useYookassa";

const ESTIMATE_PAYMENT_URL = "https://functions.poehali.dev/610d6f7d-fc4b-4907-b4f2-2e678dc3217d";
const YOOKASSA_URL = "https://functions.poehali.dev/52571e7f-f411-45cb-9eba-0dd753ba3a91";

interface Plan {
  id: string;
  title: string;
  price: number;
  badge?: string;
  badgeColor?: string;
  description: string;
  features: string[];
  icon: string;
  color: string;
  borderColor: string;
}

const PLANS: Plan[] = [
  {
    id: "estimate_digital",
    title: "Смета в PDF",
    price: 199,
    description: "Профессиональная смета на ремонт в электронном виде",
    icon: "FileText",
    color: "text-blue-600",
    borderColor: "border-blue-200",
    features: [
      "Детальная смета по видам работ",
      "Расчёт материалов",
      "Итоговая сумма по разделам",
      "Файл PDF на email",
    ],
  },
  {
    id: "estimate_print",
    title: "Смета + распечатка",
    price: 399,
    badge: "Популярный выбор",
    badgeColor: "bg-orange-500",
    description: "Смета в PDF и распечатанный экземпляр с доставкой или самовывозом",
    icon: "Printer",
    color: "text-orange-600",
    borderColor: "border-orange-400",
    features: [
      "Всё из тарифа «Смета в PDF»",
      "Распечатка на фирменном бланке",
      "Прошивка и печать",
      "Самовывоз или курьер",
    ],
  },
  {
    id: "estimate_consult",
    title: "Смета + консультация",
    price: 990,
    badge: "Максимум пользы",
    badgeColor: "bg-purple-600",
    description: "Смета + живая консультация со специалистом по деталям и торгу с подрядчиком",
    icon: "UserCheck",
    color: "text-purple-600",
    borderColor: "border-purple-200",
    features: [
      "Всё из тарифа «Смета + распечатка»",
      "30-минутная консультация онлайн",
      "Разбор сметы по пунктам",
      "Советы по выбору подрядчика",
      "Как торговаться и не переплатить",
    ],
  },
];

interface PaymentModalProps {
  plan: Plan;
  onClose: () => void;
}

function PaymentModal({ plan, onClose }: PaymentModalProps) {
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
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Введите корректный email"); return false; }
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
          plan_type: plan.id,
          amount: plan.price,
          client_name: name.trim(),
          client_email: email.trim(),
          client_phone: phone.trim(),
          client_comment: comment.trim(),
        }),
      });
      const orderData = await orderRes.json();
      const parsedOrder = typeof orderData.body === "string" ? JSON.parse(orderData.body) : orderData;
      const oNum = parsedOrder.order_number;
      setOrderNumber(oNum);

      // 2. Создаём платёж ЮКасса
      const payRes = await fetch(YOOKASSA_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          user_email: email.trim(),
          user_name: name.trim(),
          user_phone: phone.trim(),
          description: `Заказ сметы «${plan.title}» · ${oNum}`,
          return_url: `${window.location.origin}/tariffs?order=${oNum}`,
          cart_items: [
            { id: plan.id, name: plan.title, price: plan.price, quantity: 1 },
          ],
          metadata: {
            estimate_order_number: oNum,
          },
        }),
      });
      const payData = await payRes.json();
      const parsedPay = typeof payData.body === "string" ? JSON.parse(payData.body) : payData;

      if (!payRes.ok || !parsedPay.payment_url) {
        throw new Error(parsedPay.error || "Ошибка создания платежа");
      }

      openPaymentPage(parsedPay.payment_url);
      setStep("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так. Попробуйте ещё раз.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={`rounded-t-2xl p-6 text-white ${plan.id === "estimate_print" ? "bg-gradient-to-r from-orange-500 to-orange-600" : plan.id === "estimate_consult" ? "bg-gradient-to-r from-purple-600 to-purple-700" : "bg-gradient-to-r from-blue-500 to-blue-600"}`}>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Заказ сметы</p>
              <h2 className="text-xl font-bold">{plan.title}</h2>
              <p className="text-3xl font-black mt-2">
                {plan.price} <span className="text-lg font-normal opacity-80">₽</span>
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
                Заказ <strong>{orderNumber}</strong> создан. Вы будете перенаправлены на страницу ЮКассы.
              </p>
              <p className="text-gray-400 text-xs">После оплаты вы получите письмо на {email}</p>
              <Button className="mt-5 w-full" variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ваше имя *</label>
                <Input
                  placeholder="Иван Иванов"
                  value={name}
                  onChange={(e) => { setName(e.target.value); setError(""); }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email для чека и результата *</label>
                <Input
                  type="email"
                  placeholder="ivan@example.ru"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
                <Input
                  type="tel"
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий к смете</label>
                <Textarea
                  placeholder="Тип помещения, площадь, пожелания..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="bg-gray-50 rounded-xl p-4">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>{plan.title}</span>
                  <span>{plan.price} ₽</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Итого</span>
                  <span className="text-orange-600">{plan.price} ₽</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12"
                onClick={handlePay}
                disabled={loading}
              >
                {loading ? (
                  <><Icon name="Loader2" size={18} className="animate-spin mr-2" />Создаём платёж...</>
                ) : (
                  <><Icon name="CreditCard" size={18} className="mr-2" />Оплатить {plan.price} ₽</>
                )}
              </Button>
              <p className="text-center text-xs text-gray-400">
                Безопасная оплата через ЮКассу · Чек на email после оплаты
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function EstimatePricingSection() {
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  return (
    <section className="mt-12 mb-8">
      <div className="text-center mb-8">
        <span className="inline-block bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
          Для частных клиентов
        </span>
        <h2 className="text-2xl font-bold mb-2">Составление и распечатка сметы</h2>
        <p className="text-gray-500 max-w-lg mx-auto text-sm">
          Получите профессиональную смету на ваш ремонт — без обязательств, быстро и с гарантией качества
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 ${plan.badge ? plan.borderColor : "border-gray-200"} p-6 flex flex-col hover:shadow-md transition-shadow`}
          >
            {plan.badge && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className={`${plan.badgeColor} text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap`}>
                  {plan.badge}
                </span>
              </div>
            )}

            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${plan.id === "estimate_print" ? "bg-orange-100" : plan.id === "estimate_consult" ? "bg-purple-100" : "bg-blue-100"}`}>
              <Icon name={plan.icon as "FileText"} size={20} className={plan.color} />
            </div>

            <h3 className="font-bold text-base mb-1">{plan.title}</h3>
            <p className="text-sm text-gray-400 mb-3">{plan.description}</p>

            <div className="text-3xl font-extrabold mb-1">{plan.price} ₽</div>
            <div className="text-xs text-gray-400 mb-4">разовый платёж</div>

            <ul className="space-y-2 text-sm flex-1 mb-5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-gray-700">
                  <Icon name="Check" size={14} className="text-green-500 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              onClick={() => setSelectedPlan(plan)}
              className={
                plan.id === "estimate_print"
                  ? "w-full bg-orange-500 hover:bg-orange-600 text-white"
                  : plan.id === "estimate_consult"
                  ? "w-full bg-purple-600 hover:bg-purple-700 text-white"
                  : "w-full"
              }
              variant={plan.id === "estimate_print" || plan.id === "estimate_consult" ? "default" : "outline"}
            >
              <Icon name="CreditCard" size={15} className="mr-2" />
              Заказать за {plan.price} ₽
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-center gap-6 text-xs text-gray-400">
        <span className="flex items-center gap-1.5">
          <Icon name="ShieldCheck" size={14} className="text-green-500" />
          Безопасная оплата ЮКасса
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="Clock" size={14} className="text-blue-500" />
          Срок — 1 рабочий день
        </span>
        <span className="flex items-center gap-1.5">
          <Icon name="ReceiptText" size={14} className="text-orange-500" />
          Чек на email
        </span>
      </div>

      {selectedPlan && (
        <PaymentModal plan={selectedPlan} onClose={() => setSelectedPlan(null)} />
      )}
    </section>
  );
}
