import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import { isFreePeriod } from "@/lib/promo";

const YOOKASSA_API = "https://functions.poehali.dev/e6b5ad8a-7f98-42a1-bc93-3c36cbaef75d";
const RETURN_URL = `${window.location.origin}/masters`;

interface BuilderPlan {
  code: string;
  name: string;
  price: number;
  leads_per_month: number;
  is_unlimited: boolean;
}

interface Props {
  plan: BuilderPlan;
  contractorId: number;
  contractorName: string;
  contractorEmail?: string;
  onClose: () => void;
  onSuccess: () => void;
}

const PLAN_FEATURES: Record<string, string[]> = {
  start: ["5 целевых заявок", "Email-уведомления", "Личный кабинет"],
  business: ["15 целевых заявок", "Повышенный приоритет", "Email-уведомления"],
  pro: ["30 целевых заявок", "Высокий приоритет", "Email-уведомления"],
  unlim: ["Безлимитные заявки", "Максимальный приоритет", "Email-уведомления"],
};

export default function BuilderPaymentModal({
  plan, contractorId, contractorName, contractorEmail, onClose, onSuccess,
}: Props) {
  const [email, setEmail] = useState(contractorEmail || "");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const validate = () => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email для чека");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handlePay = async () => {
    if (isFreePeriod()) { onSuccess(); return; }
    if (!validate()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(YOOKASSA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          user_email: email.trim(),
          user_name: contractorName,
          description: `Тариф ${plan.name} для ${contractorName}`,
          return_url: RETURN_URL,
          cart_items: [{
            id: plan.code,
            name: `Тариф ${plan.name}`,
            price: plan.price,
            quantity: 1,
          }],
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || "Ошибка создания платежа");
        return;
      }

      if (data.payment_url) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          window.open(data.payment_url, "_blank");
        } else {
          window.location.href = data.payment_url;
        }
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n: number) => n.toLocaleString("ru-RU");
  const features = PLAN_FEATURES[plan.code] || [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>

        {/* Шапка */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-t-2xl p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-orange-100 text-sm font-medium mb-1">Тариф для строительной компании</p>
              <h2 className="text-2xl font-extrabold">{plan.name}</h2>
              <p className="text-3xl font-black mt-2">
                {fmt(plan.price)}{" "}
                <span className="text-lg font-normal text-orange-200">₽/мес</span>
              </p>
            </div>
            <button onClick={onClose} className="text-orange-200 hover:text-white transition-colors p-1">
              <Icon name="X" size={22} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            {features.map((f) => (
              <span key={f} className="bg-white/20 text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                <Icon name="Check" size={11} />
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Форма */}
        <div className="p-6 space-y-4">
          <div>
            <Label htmlFor="pay-email" className="text-sm font-medium text-gray-700 mb-1.5 block">
              Email для чека <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pay-email"
              type="email"
              placeholder="company@example.ru"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              className={emailError ? "border-red-400" : ""}
            />
            {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
          </div>

          {/* Итог */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Тариф «{plan.name}»</span>
              <span>{fmt(plan.price)} ₽</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Период</span>
              <span>1 месяц</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-3">
              <span>Заявок</span>
              <span>{plan.is_unlimited ? "Безлимит" : plan.leads_per_month}</span>
            </div>
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold text-gray-900">
              <span>Итого</span>
              <span className="text-orange-600">{fmt(plan.price)} ₽</span>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700 flex items-center gap-2">
              <Icon name="AlertCircle" size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {isFreePeriod() ? (
            <div className="w-full bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-green-700 font-bold flex items-center justify-center gap-2">
                <Icon name="Gift" size={18} />
                Бесплатно до 15 июня
              </p>
              <p className="text-green-600 text-xs mt-1">Все сервисы доступны без оплаты</p>
            </div>
          ) : (
            <Button
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 text-base"
              onClick={handlePay}
              disabled={loading}
            >
              {loading ? (
                <><Icon name="Loader2" size={18} className="animate-spin mr-2" />Создаём платёж...</>
              ) : (
                <><Icon name="CreditCard" size={18} className="mr-2" />Оплатить {fmt(plan.price)} ₽</>
              )}
            </Button>
          )}
          <p className="text-center text-xs text-gray-400">Безопасная оплата · Чек на email после оплаты</p>
        </div>
      </div>
    </div>
  );
}