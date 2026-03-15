import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { type PlanInfo, PAYMENT_URL, fmt } from "./pricingTypes";
import PaymentModal from "./PaymentModal";

function InvoiceForm({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
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

export default function B2BPaymentChoice({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
  const [mode, setMode] = useState<"choose" | "online" | "invoice">("choose");

  if (mode === "online") return <PaymentModal plan={plan} onClose={onClose} />;
  if (mode === "invoice") return <InvoiceForm plan={plan} onClose={onClose} />;

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
