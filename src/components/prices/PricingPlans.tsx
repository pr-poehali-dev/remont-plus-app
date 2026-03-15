import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { useNavigate } from "react-router-dom";

const PAYMENT_URL = "https://functions.poehali.dev/610d6f7d-fc4b-4907-b4f2-2e678dc3217d";

const Check = () => <Icon name="Check" size={15} className="text-green-500 mt-0.5 shrink-0" />;

interface PlanInfo {
  id: string;
  name: string;
  price: number;
  period?: string;
}

const B2C_PLANS: PlanInfo[] = [
  { id: "b2c_basic", name: "Базовый", price: 1490 },
  { id: "b2c_professional", name: "Профессиональный", price: 2990 },
  { id: "b2c_premium", name: "Премиум", price: 4990 },
];

const B2B_PLANS: PlanInfo[] = [
  { id: "b2b_start", name: "Старт", price: 5900, period: "мес" },
  { id: "b2b_business", name: "Бизнес", price: 12900, period: "мес" },
  { id: "b2b_pro", name: "Профи", price: 24900, period: "мес" },
];

function fmt(n: number) {
  return n.toLocaleString("ru-RU");
}

function PaymentModal({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
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
      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_order",
          plan_type: plan.id,
          client_name: name.trim(),
          client_email: email.trim(),
          client_phone: phone.trim(),
          client_comment: comment.trim(),
          return_url: window.location.href,
        }),
      });
      const raw = await res.json();
      const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;

      if (data.error) { setError(data.error); setLoading(false); return; }

      setOrderNumber(data.order_number);
      if (data.payment_url) window.open(data.payment_url, "_blank");
      setStep("success");
    } catch {
      setError("Не удалось создать платёж. Попробуйте позже.");
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
              <h2 className="text-xl font-bold">Тариф «{plan.name}»</h2>
              <p className="text-3xl font-black mt-2">
                {fmt(plan.price)} <span className="text-lg font-normal opacity-80">₽</span>
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
                Заказ <strong>{orderNumber}</strong> создан. Открылась страница оплаты.
              </p>
              <p className="text-gray-400 text-xs">После оплаты подтверждение придёт на {email}</p>
              <Button className="mt-5 w-full" variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Ваше имя *</label>
                <Input placeholder="Иван Иванов" value={name} onChange={(e) => { setName(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                <Input type="email" placeholder="ivan@example.ru" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
                <Input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий</label>
                <Textarea placeholder="Тип помещения, площадь, пожелания..." value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
              </div>

              <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Тариф «{plan.name}»</span>
                  <span>{fmt(plan.price)} ₽</span>
                </div>
                <div className="border-t border-orange-200 pt-3 flex justify-between font-bold text-gray-900">
                  <span>Итого</span>
                  <span className="text-orange-600">{fmt(plan.price)} ₽</span>
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
                  : <><Icon name="CreditCard" size={18} className="mr-2" />Оплатить {fmt(plan.price)} ₽</>
                }
              </Button>
              <p className="text-center text-xs text-gray-400">Безопасная оплата · Чек на email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function InvoiceModal({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
  const [companyName, setCompanyName] = useState("");
  const [inn, setInn] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "success">("form");
  const [orderNumber, setOrderNumber] = useState("");

  const validate = () => {
    if (!companyName.trim()) { setError("Введите название компании"); return false; }
    if (!inn.trim() || !/^\d{10,12}$/.test(inn.trim())) { setError("Введите корректный ИНН (10 или 12 цифр)"); return false; }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Введите корректный email"); return false; }
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(PAYMENT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_invoice",
          plan_type: plan.id,
          company_name: companyName.trim(),
          inn: inn.trim(),
          contact_name: contactName.trim(),
          client_email: email.trim(),
          client_phone: phone.trim(),
          client_comment: comment.trim(),
        }),
      });
      const raw = await res.json();
      const data = typeof raw.body === "string" ? JSON.parse(raw.body) : raw;

      if (data.error) { setError(data.error); setLoading(false); return; }

      setOrderNumber(data.order_number);
      setStep("success");
    } catch {
      setError("Не удалось отправить запрос. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/80 text-sm mb-1">Оплата по счёту</p>
              <h2 className="text-xl font-bold">Тариф «{plan.name}»</h2>
              <p className="text-3xl font-black mt-2">
                {fmt(plan.price)} <span className="text-lg font-normal opacity-80">₽/мес</span>
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
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                <Icon name="FileCheck" size={32} className="text-blue-500" />
              </div>
              <h3 className="font-bold text-lg mb-2">Заявка принята!</h3>
              <p className="text-gray-500 text-sm mb-3">
                Номер заявки: <strong>{orderNumber}</strong>
              </p>
              <p className="text-gray-400 text-xs mb-1">Мы подготовим счёт и отправим на {email}</p>
              <p className="text-gray-400 text-xs">Обычно это занимает 1 рабочий день</p>
              <Button className="mt-5 w-full" variant="outline" onClick={onClose}>Закрыть</Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Название компании *</label>
                <Input placeholder='ООО "Строй Групп"' value={companyName} onChange={(e) => { setCompanyName(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">ИНН *</label>
                <Input placeholder="1234567890" value={inn} onChange={(e) => { setInn(e.target.value.replace(/\D/g, "").slice(0, 12)); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Контактное лицо</label>
                <Input placeholder="Иван Иванов" value={contactName} onChange={(e) => setContactName(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email — сюда пришлём счёт *</label>
                <Input type="email" placeholder="buh@company.ru" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Телефон</label>
                <Input type="tel" placeholder="+7 (___) ___-__-__" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Комментарий</label>
                <Textarea placeholder="Дополнительные пожелания..." value={comment} onChange={(e) => setComment(e.target.value)} rows={2} />
              </div>

              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Тариф «{plan.name}»</span>
                  <span>{fmt(plan.price)} ₽/мес</span>
                </div>
                <div className="border-t border-blue-200 pt-3 flex justify-between font-bold text-gray-900">
                  <span>К оплате</span>
                  <span className="text-blue-600">{fmt(plan.price)} ₽/мес</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
                  <Icon name="AlertCircle" size={15} className="shrink-0" />
                  {error}
                </div>
              )}

              <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold h-12" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><Icon name="Loader2" size={18} className="animate-spin mr-2" />Отправляем...</>
                  : <><Icon name="FileText" size={18} className="mr-2" />Запросить счёт</>
                }
              </Button>
              <p className="text-center text-xs text-gray-400">Счёт будет отправлен на указанный email</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function B2BPaymentChoice({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
  const [mode, setMode] = useState<"choose" | "online" | "invoice">("choose");

  if (mode === "online") return <PaymentModal plan={plan} onClose={onClose} />;
  if (mode === "invoice") return <InvoiceModal plan={plan} onClose={onClose} />;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold">Тариф «{plan.name}»</h2>
              <p className="text-3xl font-black mt-2">
                {fmt(plan.price)} <span className="text-lg font-normal opacity-80">₽/мес</span>
              </p>
            </div>
            <button onClick={onClose} className="text-white/70 hover:text-white p-1">
              <Icon name="X" size={22} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-3">
          <p className="text-sm text-gray-500 mb-4">Выберите способ оплаты:</p>

          <button
            className="w-full border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left"
            onClick={() => setMode("online")}
          >
            <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center shrink-0">
              <Icon name="CreditCard" size={20} className="text-orange-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Оплатить онлайн</p>
              <p className="text-xs text-gray-400">Банковская карта или СБП</p>
            </div>
          </button>

          <button
            className="w-full border border-gray-200 rounded-xl p-4 flex items-center gap-4 hover:border-blue-300 hover:bg-blue-50/50 transition-colors text-left"
            onClick={() => setMode("invoice")}
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
              <Icon name="FileText" size={20} className="text-blue-500" />
            </div>
            <div>
              <p className="font-semibold text-sm text-gray-900">Оплата по счёту</p>
              <p className="text-xs text-gray-400">Для юрлиц и ИП — выставим счёт</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PricingPlans() {
  const navigate = useNavigate();
  const [payPlan, setPayPlan] = useState<PlanInfo | null>(null);
  const [b2bPlan, setB2bPlan] = useState<PlanInfo | null>(null);

  const scrollToForm = () => {
    const el = document.getElementById("tariff-lead-form");
    if (el) el.scrollIntoView({ behavior: "smooth" });
    else navigate("/tariffs#form");
  };

  return (
    <div className="mb-12 space-y-14">

      {payPlan && <PaymentModal plan={payPlan} onClose={() => setPayPlan(null)} />}
      {b2bPlan && <B2BPaymentChoice plan={b2bPlan} onClose={() => setB2bPlan(null)} />}

      {/* B2C */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏠</span>
          <h2 className="text-xl font-bold">Для частных клиентов (B2C)</h2>
        </div>
        <p className="text-gray-500 mb-6 ml-10">Расчёт сметы, документация и оптимизация бюджета на ремонт</p>

        <div className="grid sm:grid-cols-3 gap-4">

          {/* Базовый */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="font-bold text-base tracking-wide">БАЗОВЫЙ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">1 490 ₽</div>
            <div className="text-xs text-gray-400 mb-1">разовый платёж</div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Для предварительного расчёта бюджета</p>
            <p className="text-xs text-gray-400 mb-4">Подходит для оценки бюджета перед началом ремонта</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Расчёт сметы по выбранному виду работ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Учёт региональных коэффициентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Итоговая стоимость работ и материалов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Выгрузка сметы в PDF</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => setPayPlan(B2C_PLANS[0])}>
              <Icon name="CreditCard" size={16} className="mr-2" />Оплатить 1 490 ₽
            </Button>
          </div>

          {/* Профессиональный */}
          <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-6 flex flex-col shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Рекомендуем</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ПРОФЕССИОНАЛЬНЫЙ</span>
              <span className="text-yellow-500 text-base">⭐</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">2 990 ₽</div>
            <div className="text-xs text-gray-400 mb-1">разовый платёж</div>
            <p className="text-sm text-blue-600 mb-1 font-semibold">Для договора и официальных расчётов</p>
            <p className="text-xs text-gray-400 mb-4">Подходит для работы с подрядчиком и подписания договора</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Всё из тарифа «Базовый»</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Детализированная смета</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Коммерческое предложение (КП)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />КС‑2</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />КС‑3</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Акт выполненных работ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Проверка корректности расчётов</li>
            </ul>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setPayPlan(B2C_PLANS[1])}>
              <Icon name="CreditCard" size={16} className="mr-2" />Оплатить 2 990 ₽
            </Button>
          </div>

          {/* Премиум */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ПРЕМИУМ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">4 990 ₽</div>
            <div className="text-xs text-gray-400 mb-1">разовый платёж</div>
            <p className="text-sm text-purple-600 mb-1 font-semibold">Для сложных объектов и оптимизации</p>
            <p className="text-xs text-gray-400 mb-4">Подходит для комплексного ремонта и ИЖС</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Всё из тарифа «Профессиональный»</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Оптимизация сметы (поиск избыточных затрат)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Анализ возможных отклонений бюджета</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Подбор альтернативных решений</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетная поддержка</li>
            </ul>
            <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => setPayPlan(B2C_PLANS[2])}>
              <Icon name="CreditCard" size={16} className="mr-2" />Оплатить 4 990 ₽
            </Button>
          </div>
        </div>
      </div>

      {/* B2B */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">🏢</span>
          <h2 className="text-xl font-bold">Для строительных компаний (B2B)</h2>
        </div>
        <p className="text-gray-500 mb-6 ml-10">Автоматизация смет и документации для бригад, подрядчиков и застройщиков</p>

        <div className="grid sm:grid-cols-3 gap-4">

          {/* Старт */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-green-400 inline-block" />
              <span className="font-bold text-base tracking-wide">СТАРТ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">5 900 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-gray-500 mb-1 font-medium">Для небольших бригад и подрядчиков</p>
            <p className="text-xs text-gray-400 mb-4">Быстрый старт автоматизации смет</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 30 смет в месяц</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Формирование КП, КС‑2, КС‑3, актов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Учёт региональных коэффициентов</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Выгрузка в PDF</li>
            </ul>
            <Button variant="outline" className="w-full" onClick={() => setB2bPlan(B2B_PLANS[0])}>
              Подключить
            </Button>
          </div>

          {/* Бизнес */}
          <div className="relative bg-white rounded-2xl border-2 border-blue-500 p-6 flex flex-col shadow-lg">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">Рекомендуем</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="font-bold text-base tracking-wide">БИЗНЕС</span>
              <span className="text-yellow-500 text-base">⭐</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">12 900 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-blue-600 mb-1 font-semibold">Для строительных компаний</p>
            <p className="text-xs text-gray-400 mb-4">Оптимальный тариф для регулярной работы</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />До 150 смет в месяц</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Интеллектуальная оптимизация смет</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Проверка корректности документации</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетная поддержка</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Обновление коэффициентов</li>
            </ul>
            <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white" onClick={() => setB2bPlan(B2B_PLANS[1])}>
              Подключить
            </Button>
          </div>

          {/* Профи */}
          <div className="relative bg-white rounded-2xl border border-gray-200 p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" />
              <span className="font-bold text-base tracking-wide">ПРОФИ</span>
            </div>
            <div className="text-3xl font-extrabold mt-2 mb-0.5">24 900 ₽</div>
            <div className="text-xs text-gray-400 mb-1">/ месяц</div>
            <p className="text-sm text-purple-600 mb-1 font-semibold">Для застройщиков и крупных подрядчиков</p>
            <p className="text-xs text-gray-400 mb-4">Системное использование внутри компании</p>
            <ul className="space-y-2 text-sm flex-1 mb-5">
              <li className="flex items-start gap-2 text-gray-700"><Check />Безлимит по сметам</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />White‑label (брендирование документов)</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />API‑доступ</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Персональный менеджер</li>
              <li className="flex items-start gap-2 text-gray-700"><Check />Приоритетные обновления</li>
            </ul>
            <Button variant="outline" className="w-full border-purple-300 text-purple-700 hover:bg-purple-50" onClick={() => setB2bPlan(B2B_PLANS[2])}>
              Подключить
            </Button>
          </div>
        </div>
      </div>

    </div>
  );
}
