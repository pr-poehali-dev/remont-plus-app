import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { type PlanInfo, PAYMENT_URL, fmt, TOCHKA_CHECKOUT_URLS, COMPANY_REQUISITES } from "./pricingTypes";

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
            <div className="py-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <Icon name="CheckCircle" size={22} className="text-green-500" />
                </div>
                <div>
                  <h3 className="font-bold text-base">Заявка #{orderNumber} принята</h3>
                  <p className="text-xs text-gray-400">Счёт отправим на {email}</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Реквизиты для оплаты</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Получатель</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{COMPANY_REQUISITES.shortName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">ИНН</span><span className="font-mono text-gray-900">{COMPANY_REQUISITES.inn}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">КПП</span><span className="font-mono text-gray-900">{COMPANY_REQUISITES.kpp}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Р/с</span><span className="font-mono text-gray-900 text-xs">{COMPANY_REQUISITES.account}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Банк</span><span className="font-medium text-gray-900 text-right max-w-[60%]">{COMPANY_REQUISITES.bankName}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">БИК</span><span className="font-mono text-gray-900">{COMPANY_REQUISITES.bik}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">К/с</span><span className="font-mono text-gray-900 text-xs">{COMPANY_REQUISITES.corrAccount}</span></div>
                </div>
                <div className="border-t border-gray-200 mt-3 pt-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Назначение платежа</span>
                  </div>
                  <p className="text-xs text-gray-700 mt-1 font-medium">Оплата по тарифу «{plan.name}» ({fmt(plan.price)} ₽/мес), заявка #{orderNumber}. Без НДС.</p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mb-2"
                onClick={() => {
                  const text = [
                    `Получатель: ${COMPANY_REQUISITES.name}`,
                    `ИНН: ${COMPANY_REQUISITES.inn}`,
                    `КПП: ${COMPANY_REQUISITES.kpp}`,
                    `Р/с: ${COMPANY_REQUISITES.account}`,
                    `Банк: ${COMPANY_REQUISITES.bankName}`,
                    `БИК: ${COMPANY_REQUISITES.bik}`,
                    `К/с: ${COMPANY_REQUISITES.corrAccount}`,
                    `Назначение: Оплата по тарифу «${plan.name}» (${fmt(plan.price)} руб./мес), заявка #${orderNumber}. Без НДС.`,
                  ].join("\n");
                  navigator.clipboard.writeText(text);
                }}
              >
                <Icon name="Copy" size={14} className="mr-1.5" />
                Скопировать реквизиты
              </Button>

              <Button className="w-full" variant="outline" onClick={onClose}>Закрыть</Button>
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
  const [mode, setMode] = useState<"choose" | "invoice">("choose");

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
            onClick={() => {
              const url = TOCHKA_CHECKOUT_URLS[plan.id];
              if (url) window.open(url, "_blank");
              onClose();
            }}
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