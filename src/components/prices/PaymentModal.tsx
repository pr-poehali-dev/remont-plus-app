import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Icon from "@/components/ui/icon";
import { type PlanInfo, fmt, YOOKASSA_API } from "./pricingTypes";
import reachGoal from "@/lib/metrika";

export default function PaymentModal({ plan, onClose }: { plan: PlanInfo; onClose: () => void }) {
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
      const description = `Тариф «${plan.name}»${comment.trim() ? ` — ${comment.trim()}` : ""}`;
      const res = await fetch(YOOKASSA_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: plan.price,
          user_name: name.trim(),
          user_email: email.trim(),
          user_phone: phone.trim(),
          description,
          return_url: window.location.href,
          cart_items: [{
            id: plan.id,
            name: `Тариф «${plan.name}»`,
            price: plan.price,
            quantity: 1,
          }],
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) { setError(data.error || "Ошибка создания платежа"); setLoading(false); return; }

      setOrderNumber(data.order_number);
      reachGoal("payment_started", { plan: plan.id, price: plan.price });

      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (data.payment_url) {
        if (isMobile) {
          window.open(data.payment_url, "_blank");
        } else {
          window.location.href = data.payment_url;
        }
      }
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